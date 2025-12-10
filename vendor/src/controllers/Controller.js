/**
 * Controller - Base class for all controllers
 * 
 * Usage:
 *   var MyController = Controller.extend({
 *       selector: '.my-element',
 *       init: function() {
 *           // Initialization code
 *       },
 *       handleClick: function(e) {
 *           // Click handler
 *       }
 *   });
 * 
 *   // Initialize
 *   MyController.init();
 */
(function(Framework) {
    'use strict';

    var Controller = {
        /**
         * jQuery selector for the element(s) this controller handles
         */
        selector: null,

        /**
         * Request classes used in this controller (from use statements)
         */
        _usedRequests: {},

        /**
         * Initialize the controller
         */
        init: function() {
            // Get selector - support both property and method
            var selector = this.selector;
            if (typeof this.selector === 'function') {
                selector = this.selector();
            }
            if (!selector) {
                return;
            }

            // Don't auto-detect Requests - only use if explicitly specified in parameters
            this._usedRequests = {};

            var $elements = $(selector);
            this._selector = selector; // Store for later use
            // Bind events
            this.bindEvents();

            // Call custom init if exists
            if (typeof this.onInit === 'function') {
                this.onInit();
            }
        },

        /**
         * Parse function parameters
         */
        getFunctionParams: function(func) {
            var funcStr = func.toString();
            // Try ES6 class method format: onClick(e) { ... }
            var paramsMatch = funcStr.match(/^\s*(\w+)\s*\(([^)]*)\)\s*\{/);
            if (!paramsMatch) {
                // Try function format: function(e) { ... }
                paramsMatch = funcStr.match(/function\s*\(([^)]*)\)/);
            }
            if (!paramsMatch) {
                // Try function with name: function onClick(e) { ... }
                paramsMatch = funcStr.match(/function\s+\w+\s*\(([^)]*)\)/);
            }
            if (!paramsMatch) {
                // Arrow function
                paramsMatch = funcStr.match(/\(([^)]*)\)\s*=>/);
            }
            if (!paramsMatch) {
                // Arrow function without parentheses
                paramsMatch = funcStr.match(/^([^=]+)\s*=>/);
            }
            if (paramsMatch) {
                var paramsStr = paramsMatch[2] || paramsMatch[1] || '';
                if (paramsStr) {
                    return paramsStr.split(',').map(function(p) {
                    return p.trim();
                }).filter(function(p) {
                    return p.length > 0;
                });
                }
            }
            return [];
        },

        /**
         * Auto-detect Request classes from controller name
         */
        _autoDetectRequests: function() {
            var requests = {};
            var controllerName = this.constructor.name || '';
            
            if (controllerName) {
                // Remove 'Controller' suffix
                var baseName = controllerName.replace(/Controller$/i, '');
                
                // Try common patterns
                var possibleNames = [
                    'UserRequest',
                    baseName + 'Request',
                    'FormRequest'
                ];
                
                for (var i = 0; i < possibleNames.length; i++) {
                    if (Framework[possibleNames[i]]) {
                        requests[possibleNames[i]] = Framework[possibleNames[i]];
                        // Also register as 'request' for lowercase parameter
                        requests['request'] = Framework[possibleNames[i]];
                        break; // Use first found
                    }
                }
            }
            
            return requests;
        },

        /**
         * Get Request class from parameter name
         * Only returns Request class if parameter name explicitly indicates a Request
         */
        getRequestClass: function(paramName) {
            // Remove any whitespace
            paramName = paramName.trim();
            
            // Only check if parameter name explicitly contains 'Request' (case-sensitive)
            // If parameter is 'request' (lowercase) → no validation, just pass it
            var isRequestParam = paramName.indexOf('Request') !== -1;
            
            if (isRequestParam) {
                // Parameter explicitly contains 'Request' - validation.js will handle it
                // Try to get from Framework directly
                if (Framework[paramName]) {
                    return Framework[paramName];
                }
                
                // Try with different variations
                var variations = [
                    paramName,
                    paramName + 'Request',
                    'Auth/' + paramName,
                    'Auth/' + paramName + 'Request'
                ];
                
                for (var i = 0; i < variations.length; i++) {
                    var parts = variations[i].split('/');
                    var className = parts[parts.length - 1];
                    if (Framework[className]) {
                        return Framework[className];
                    }
                }
            }
            
            // If parameter is exactly 'request' (lowercase) → no validation, return null
            // This means: onSubmit: function(e, request) → no validation, just pass request
            // But: onSubmit: function(e, UserRequest) → validation.js will validate
            
            return null;
        },

        /**
         * Bind all event handlers
         */
        bindEvents: function() {
            var self = this;
            // Get selector - support both property and method
            var selector = this._selector || this.selector;
            if (typeof selector === 'function') {
                selector = selector();
            }
            var $elements = $(selector);
            if ($elements.length === 0) {
                return;
            }

            // Collect all methods from instance and prototype
            var methods = {};
            // Get instance methods
            for (var method in this) {
                if (this.hasOwnProperty(method) && typeof this[method] === 'function') {
                    methods[method] = this[method];
                }
            }
            // Get prototype methods
            if (this.constructor && this.constructor.prototype) {
                for (var method in this.constructor.prototype) {
                    if (typeof this.constructor.prototype[method] === 'function') {
                        methods[method] = this.constructor.prototype[method];
                    }
                }
            }
            
            // For ES6 classes, also check the class itself (not just prototype)
            // ES6 class methods are non-enumerable, so we need to get all property descriptors
            if (this.constructor && this.constructor.prototype) {
                var proto = this.constructor.prototype;
                var descriptors = Object.getOwnPropertyDescriptors(proto);
                for (var method in descriptors) {
                    if (descriptors[method].value && typeof descriptors[method].value === 'function') {
                        if (!methods[method]) {
                            methods[method] = descriptors[method].value;
                        }
                    }
                }
            }
            
            // Also check instance own properties (for methods defined directly on instance)
            var instanceDescriptors = Object.getOwnPropertyDescriptors(this);
            for (var method in instanceDescriptors) {
                if (instanceDescriptors[method].value && typeof instanceDescriptors[method].value === 'function') {
                    if (!methods[method]) {
                        methods[method] = instanceDescriptors[method].value;
                    }
                }
            }

            // Auto-bind methods that start with 'on' or 'handle'
            for (var method in methods) {
                if (method !== 'init' && method !== 'bindEvents' && method !== 'onInit' && method !== '$' && method !== 'getFunctionParams' && method !== 'getRequestClass') {
                    // Create wrapper that automatically calls preventDefault for click and submit
                    var needsPreventDefault = method === 'onClick' || method === 'handleClick' || 
                                             method === 'onSubmit' || method === 'handleSubmit';
                    
                    // Get the method function
                    var methodFunc = methods[method];
                    
                    // Get function parameters
                    var params = self.getFunctionParams(methodFunc);
                    var RequestClass = null;
                    var requestParamIndex = -1;
                    var eventParamIndex = -1;
                    
                    // Check all parameters to find Request class and event (any order)
                    var hasRequestParam = false; // Check if parameter is 'request' (lowercase)
                    for (var i = 0; i < params.length; i++) {
                        var paramName = params[i];
                        var foundRequest = self.getRequestClass(paramName);
                        if (foundRequest) {
                            RequestClass = foundRequest;
                            requestParamIndex = i;
                        }
                        // Check if parameter is 'request' (lowercase) - no validation, just pass object
                        if (paramName.toLowerCase() === 'request') {
                            hasRequestParam = true;
                            requestParamIndex = i;
                        }
                        // Check if parameter is event (e or event)
                        if (paramName.toLowerCase() === 'e' || paramName.toLowerCase() === 'event') {
                            eventParamIndex = i;
                        }
                    }
                    
                    // Use IIFE to capture method name correctly
                    (function(methodName, shouldPreventDefault, requestClass, func, params, reqIndex, hasRequestLowercase, eventIndex) {
                        // إضافة view و compact helper functions للدوال التي لا تحتوي على Request
                        if (!requestClass && !hasRequestLowercase) {
                            // Use Function constructor to inject view and compact into function scope
                            var originalFunc = func;
                            var funcStr = originalFunc.toString();
                            var bodyMatch = funcStr.match(/\{([\s\S]*)\}$/);
                            
                            if (bodyMatch) {
                                var functionBody = bodyMatch[1];
                                var paramNames = params.map(function(p) { return p.trim(); });
                                
                                // Add $target automatically if event parameter exists
                                var targetVar = '';
                                if (eventIndex >= 0) {
                                    targetVar = 'var $target = $(arguments[' + eventIndex + '].currentTarget || arguments[' + eventIndex + ']); ';
                                }
                                
                                var newFunctionBody = targetVar +
                                    'var view = function(viewName, selector, data) { ' +
                                    'return Framework.view(viewName, selector, data); ' +
                                    '}; ' +
                                    'var compact = function() { ' +
                                    'var varNames = Array.prototype.slice.call(arguments); ' +
                                    'var result = {}; ' +
                                    'for (var i = 0; i < varNames.length; i++) { ' +
                                    'var name = varNames[i]; ' +
                                    'try { result[name] = eval(name); } catch(e) {} ' +
                                    '} ' +
                                    'return result; ' +
                                    '}; ' +
                                    functionBody;
                                try {
                                    var newFunc = new Function(paramNames.join(','), newFunctionBody);
                                    func = function() {
                                        return newFunc.apply(self, arguments);
                                    };
                                } catch (e) {
                                    // If fails, use original function
                                    func = originalFunc;
                                }
                            } else {
                                // Fallback: use original function
                                func = originalFunc;
                            }
                        }
                        
                        var handler = function(e) {
                            // Auto preventDefault for click and submit events
                            if (shouldPreventDefault && e && e.preventDefault) {
                                e.preventDefault();
                            }
                            
                            // Extract data attributes from element and match with method parameters
                            var $target = $(e.currentTarget);
                            var dataAttributes = self._extractDataAttributes($target);
                            
                            // Always create request object for AJAX requests (even if not in method signature)
                            // This allows request->all() to be sent automatically with AJAX
                            var requestObjForAjax = null;
                            
                            // If parameter is 'request' (lowercase) - no validation, just create object
                            if (hasRequestLowercase && !requestClass) {
                                var $target = $(e.currentTarget);
                                var $form = $target.closest('form');
                                var formData = {};
                                var files = {};
                                
                                // Get form data if element is inside a form
                                if ($form.length > 0) {
                                    formData = $form.fw('form').serializeObject();
                                    files = $form.fw('form').getFiles();
                                }
                                
                                // Create request object starting with data attributes (preserve nested structure)
                                // Deep merge function to preserve nested objects
                                var deepMerge = function(target, source) {
                                    for (var key in source) {
                                        if (source.hasOwnProperty(key)) {
                                            // If both are objects and not arrays, merge recursively
                                            if (typeof source[key] === 'object' && 
                                                source[key] !== null && 
                                                !Array.isArray(source[key]) &&
                                                typeof target[key] === 'object' && 
                                                target[key] !== null && 
                                                !Array.isArray(target[key])) {
                                                deepMerge(target[key], source[key]);
                                            } else {
                                                // Otherwise, source takes precedence
                                                target[key] = source[key];
                                            }
                                        }
                                    }
                                    return target;
                                };
                                
                                // Start with data attributes (which already have nested structure)
                                var requestObj = {};
                                for (var key in dataAttributes) {
                                    if (dataAttributes.hasOwnProperty(key)) {
                                        requestObj[key] = dataAttributes[key];
                                    }
                                }
                                
                                // Then, deep merge form data (form data merges into existing structure)
                                if (formData && Object.keys(formData).length > 0) {
                                    deepMerge(requestObj, formData);
                                }
                                
                                // Add all() method with deep copy to preserve nested structure
                                requestObj.all = function() {
                                    // Deep copy function to preserve nested objects
                                    var deepCopy = function(obj) {
                                        if (obj === null || typeof obj !== 'object') {
                                            return obj;
                                        }
                                        if (obj instanceof Date) {
                                            return new Date(obj.getTime());
                                        }
                                        if (Array.isArray(obj)) {
                                            return obj.map(deepCopy);
                                        }
                                        var copy = {};
                                        for (var key in obj) {
                                            if (obj.hasOwnProperty(key)) {
                                                copy[key] = deepCopy(obj[key]);
                                            }
                                        }
                                        return copy;
                                    };
                                    
                                    var data = {};
                                    for (var k in this) {
                                        if (this.hasOwnProperty(k) && 
                                            k !== '_files' &&
                                            typeof this[k] !== 'function') {
                                            // Use deep copy to preserve nested structure
                                            data[k] = deepCopy(this[k]);
                                        }
                                    }
                                    // Include files if they exist
                                    if (this._files && Object.keys(this._files).length > 0) {
                                        for (var fileKey in this._files) {
                                            if (this._files.hasOwnProperty(fileKey)) {
                                                data[fileKey] = deepCopy(this._files[fileKey]);
                                            }
                                        }
                                    }
                                    return data;
                                };
                                
                                // إضافة hasFiles() method دائماً (للتحقق فقط - ترجع true/false)
                                var hasFiles = files && Object.keys(files).length > 0;
                                requestObj.hasFiles = function(fieldName) {
                                    if (fieldName) {
                                        // التحقق من ملف معين
                                        return this._files && this._files[fieldName] && this._files[fieldName].length > 0;
                                    }
                                    // التحقق من وجود أي ملفات
                                    return this._files && Object.keys(this._files).length > 0;
                                };
                                
                                // إضافة methods الخاصة بالملفات فقط إذا كان هناك ملفات
                                if (hasFiles) {
                                    // Store files
                                    requestObj._files = files;
                                    
                                    // Helper function لإضافة Laravel-like methods للـ File object
                                    var addFileMethods = function(file) {
                                        if (!file || typeof file !== 'object') return file;
                                        
                                        // getClientOriginalName() - مثل Laravel
                                        file.getClientOriginalName = function() {
                                            return this.name || '';
                                        };
                                        
                                        // getRealPath() - في المتصفح لا يوجد real path، نرجع object URL
                                        file.getRealPath = function() {
                                            if (this.path) return this.path;
                                            // في المتصفح، يمكن إنشاء object URL
                                            if (window.URL && window.URL.createObjectURL) {
                                                return window.URL.createObjectURL(this);
                                            }
                                            return null;
                                        };
                                        
                                        // getSize() - مثل Laravel
                                        file.getSize = function() {
                                            return this.size || 0;
                                        };
                                        
                                        // getMimeType() - مثل Laravel
                                        file.getMimeType = function() {
                                            return this.type || '';
                                        };
                                        
                                        // getClientOriginalExtension() - إضافة extension
                                        file.getClientOriginalExtension = function() {
                                            var name = this.name || '';
                                            var parts = name.split('.');
                                            return parts.length > 1 ? parts[parts.length - 1] : '';
                                        };
                                        
                                        return file;
                                    };
                                    
                                    // Add file() method للحصول على ملف واحد مع Laravel-like methods
                                    requestObj.file = function(fieldName) {
                                        if (this._files && this._files[fieldName] && this._files[fieldName].length > 0) {
                                            return addFileMethods(this._files[fieldName][0]);
                                        }
                                        return null;
                                    };
                                    
                                    // Add files() method للحصول على جميع الملفات
                                    requestObj.files = function(fieldName) {
                                        if (fieldName) {
                                            return this._files && this._files[fieldName] ? this._files[fieldName] : null;
                                        }
                                        return this._files || {};
                                    };
                                    
                                    // Add getFilesInfo() method للحصول على معلومات الملفات جاهزة للعرض
                                    requestObj.getFilesInfo = function() {
                                        if (!this.hasFiles()) {
                                            return null;
                                        }
                                        
                                        var filesInfo = {};
                                        for (var fieldName in this._files) {
                                            if (this._files.hasOwnProperty(fieldName)) {
                                                var fileList = this._files[fieldName];
                                                filesInfo[fieldName] = [];
                                                for (var i = 0; i < fileList.length; i++) {
                                                    filesInfo[fieldName].push({
                                                        name: fileList[i].name,
                                                        size: fileList[i].size,
                                                        type: fileList[i].type,
                                                        lastModified: new Date(fileList[i].lastModified).toLocaleString('ar-EG')
                                                    });
                                                }
                                            }
                                        }
                                        return filesInfo;
                                    };
                                }
                                
                                // Extract data attributes and build arguments array
                                var dataAttributes = self._extractDataAttributes($(e.currentTarget));
                                var args = self._buildArgumentsArray(params, e, eventIndex, reqIndex, null, true, dataAttributes);
                                
                                // Place Request instance at its original position
                                if (reqIndex >= 0) {
                                args[reqIndex] = requestObj;
                                    }
                                
                                // Place event at eventIndex
                                if (eventIndex >= 0) {
                                    args[eventIndex] = e;
                                }
                                
                                // Inject view and compact helpers when request parameter exists
                                if (reqIndex >= 0) {
                                    var originalFunc = func;
                                    var funcStr = originalFunc.toString();
                                    var bodyMatch = funcStr.match(/\{([\s\S]*)\}$/);
                                    if (bodyMatch) {
                                        var functionBody = bodyMatch[1];
                                        var paramNames = params.map(function(p) { return p.trim(); });
                                        
                                        var targetVar = '';
                                        if (eventIndex >= 0) {
                                            targetVar = 'var $target = $(arguments[' + eventIndex + '].currentTarget || arguments[' + eventIndex + ']); ';
                                        }
                                        
                                        var newFunctionBody = 'var request = arguments[' + reqIndex + ']; ' +
                                            targetVar +
                                            'var view = function(viewName, selector, data) { ' +
                                            'return Framework.view(viewName, selector, data); ' +
                                            '}; ' +
                                            'var compact = function() { ' +
                                            'var varNames = Array.prototype.slice.call(arguments); ' +
                                            'var result = {}; ' +
                                            'for (var i = 0; i < varNames.length; i++) { ' +
                                            'var name = varNames[i]; ' +
                                            'try { result[name] = eval(name); } catch(e) {} ' +
                                            '} ' +
                                            'return result; ' +
                                            '}; ' +
                                            functionBody;
                                        
                                        try {
                                            var newFunc = new Function(paramNames.join(','), newFunctionBody);
                                            func = function() {
                                                return newFunc.apply(self, arguments);
                                            };
                                        } catch (e) {
                                            func = originalFunc;
                                        }
                                    }
                                }
                                
                                return func.apply(self, args);
                            }
                            
                            // If Request class is found in parameters, validate automatically using validation.js
                            if (requestClass) {
                                var requestInstance = null;
                                
                                // For submit events, validate the form using validation.js
                                if (methodName === 'onSubmit' || methodName === 'handleSubmit') {
                                    var $form = $(e.currentTarget);
                                    
                                    // Use validation.js to detect and validate
                                    var validationResult = Framework.validation.detectAndValidate($form, requestClass);
                                    
                                    if (!validationResult || !validationResult.result.isValid) {
                                        // Errors are displayed under inputs automatically by validation.js
                                        // Don't call the handler if validation failed
                                        return;
                                    }
                                    
                                    // validation.js already stored data in requestInstance
                                    requestInstance = validationResult.request;
                                } else {
                                    // For other events, just create instance
                                    requestInstance = new requestClass();
                                }
                                
                                // Extract data attributes and build arguments array
                                var dataAttributes = self._extractDataAttributes($(e.currentTarget));
                                var args = self._buildArgumentsArray(params, e, eventIndex, reqIndex, requestClass, false, dataAttributes);
                                
                                // Place Request instance at its original position
                                if (reqIndex >= 0) {
                                    args[reqIndex] = requestInstance;
                                }
                                
                                // Place event at eventIndex
                                if (eventIndex >= 0) {
                                    args[eventIndex] = e;
                                }
                                
                                // إنشاء wrapper function لإضافة alias 'request' تلقائياً
                                // وإضافة compact helper و view helper
                                if (reqIndex >= 0) {
                                    var originalFunc = func;
                                    var requestInstanceForClosure = requestInstance; // Capture in closure
                                    // استخراج body الدالة
                                    var funcStr = originalFunc.toString();
                                    var bodyMatch = funcStr.match(/\{([\s\S]*)\}$/);
                                    if (bodyMatch) {
                                        var functionBody = bodyMatch[1];
                                        // إنشاء function جديد يحتوي على var request في بدايته
                                        // وإضافة compact helper محسّن
                                        var paramNames = params.map(function(p) { return p.trim(); });
                                        // نستخدم requestInstance مباشرة من arguments
                                        // نستخدم arguments من newFunc مباشرة (ليس من IIFE)
                                        // Add $target automatically if event parameter exists
                                        var targetVar = '';
                                        if (eventIndex >= 0) {
                                            targetVar = 'var $target = $(arguments[' + eventIndex + '].currentTarget || arguments[' + eventIndex + ']); ';
                                        }
                                        
                                        var newFunctionBody = 'var request = arguments[' + reqIndex + ']; ' +
                                            targetVar +
                                            'var view = function(viewName, selector, data) { ' +
                                            'return Framework.view(viewName, selector, data); ' +
                                            '}; ' +
                                            'var compact = function() { ' +
                                            'var varNames = Array.prototype.slice.call(arguments); ' +
                                            'var result = {}; ' +
                                            'for (var i = 0; i < varNames.length; i++) { ' +
                                            'var name = varNames[i]; ' +
                                            'try { result[name] = eval(name); } catch(e) {} ' +
                                            '} ' +
                                            'return result; ' +
                                            '}; ' +
                                            functionBody;
                                        
                                        // إنشاء function جديد باستخدام Function constructor
                                        try {
                                            var newFunc = new Function(paramNames.join(','), newFunctionBody);
                                            func = function() {
                                                // التحقق من أن arguments[reqIndex] موجود
                                                if (!arguments[reqIndex]) {
                                                    // Request instance not found
                                                }
                                                return newFunc.apply(self, arguments);
                                            };
                                        } catch (e) {
                                            // إذا فشل، نستخدم الدالة الأصلية
                                        }
                                    }
                                }
                                
                                return func.apply(self, args);
                            }
                            
                            // Call the actual handler without Request
                            // Extract data attributes and build arguments array
                            var dataAttributes = self._extractDataAttributes($(e.currentTarget));
                            var args = self._buildArgumentsArray(params, e, eventIndex, -1, null, false, dataAttributes);
                            
                            // Place event at eventIndex
                            if (eventIndex >= 0) {
                                args[eventIndex] = e;
                            }
                            
                            return func.apply(self, args);
                        };
                        
                        // Handle click events
                        if (methodName === 'onClick' || methodName === 'handleClick') {
                            // Create wrapper that calls Route::execute if route exists
                            // We search for route at click time, not at bindEvents time, because routes are registered after controllers
                            // Use debounce for performance in large projects (if available)
                            var clickHandler = function(e) {
                                // Get data from form if exists, or from event
                                var requestData = null;
                                var $target = $(e.currentTarget);
                                
                                // Check if target is inside a form
                                var $form = $target.closest('form');
                                if ($form.length > 0) {
                                    // Get form data
                                    if (typeof Framework !== 'undefined' && Framework.form && typeof Framework.form.serializeObject === 'function') {
                                        requestData = Framework.form.serializeObject($form);
                                    } else if (typeof $form.serializeObject === 'function') {
                                        requestData = $form.serializeObject();
                                    } else {
                                        // Fallback: use jQuery serializeArray
                                        var formArray = $form.serializeArray();
                                        requestData = {};
                                        for (var i = 0; i < formArray.length; i++) {
                                            requestData[formArray[i].name] = formArray[i].value;
                                        }
                                    }
                                } else {
                                    // If not in form, try to get data from data attributes
                                    // Check for data-ajax-data attribute (JSON string)
                                    var dataAttr = $target.attr('data-ajax-data');
                                    if (dataAttr) {
                                        try {
                                            requestData = JSON.parse(dataAttr);
                                        } catch (e) {
                                            // If not valid JSON, use as string
                                            requestData = dataAttr;
                                        }
                                    }
                                    
                                    // Also check for individual data-* attributes
                                    // Collect all data-* attributes (except data-ajax-data)
                                    if (!requestData) {
                                        var dataAttributes = {};
                                        var hasDataAttributes = false;
                                        $.each($target[0].attributes, function(i, attr) {
                                            if (attr.name.indexOf('data-') === 0 && attr.name !== 'data-ajax-data') {
                                                var key = attr.name.replace('data-', '').replace(/-([a-z])/g, function(g) { return g[1].toUpperCase(); });
                                                dataAttributes[key] = attr.value;
                                                hasDataAttributes = true;
                                            }
                                        });
                                        if (hasDataAttributes && Object.keys(dataAttributes).length > 0) {
                                            requestData = dataAttributes;
                                        }
                                    }
                                }
                                
                                // Check if there's a route for this controller method (search at click time)
                                var routeInfo = self._findRouteForMethod(methodName);
                                
                                if (routeInfo) {
                                    // Always create request object for AJAX (from dataAttributes + formData)
                                    // This ensures request->all() is sent automatically with AJAX
                                    var requestObjForRoute = null;
                                    
                                    // Use existing requestObj if available (from method signature with 'request' parameter)
                                    if (hasRequestLowercase && !requestClass && requestObjForAjax) {
                                        requestObjForRoute = requestObjForAjax;
                                    } else {
                                        // Create request object from dataAttributes and formData
                                        // Extract data attributes from element (includes all parents with name attribute)
                                        var dataAttributes = self._extractDataAttributes($target);
                                        
                                        var formData = {};
                                        var files = {};
                                        
                                        // Get form data if element is inside a form
                                        if ($form.length > 0) {
                                            if (typeof Framework !== 'undefined' && Framework.form && typeof Framework.form.serializeObject === 'function') {
                                                formData = Framework.form.serializeObject($form);
                                                files = Framework.form.getFiles($form);
                                            } else if (typeof $form.serializeObject === 'function') {
                                                formData = $form.serializeObject();
                                            } else {
                                                var formArray = $form.serializeArray();
                                                for (var i = 0; i < formArray.length; i++) {
                                                    formData[formArray[i].name] = formArray[i].value;
                                                }
                                            }
                                        }
                                        
                                        // Create request object starting with data attributes (preserve nested structure)
                                        // Deep merge function to preserve nested objects
                                        var deepMerge = function(target, source) {
                                            for (var key in source) {
                                                if (source.hasOwnProperty(key)) {
                                                    // If both are objects and not arrays, merge recursively
                                                    if (typeof source[key] === 'object' && 
                                                        source[key] !== null && 
                                                        !Array.isArray(source[key]) &&
                                                        typeof target[key] === 'object' && 
                                                        target[key] !== null && 
                                                        !Array.isArray(target[key])) {
                                                        deepMerge(target[key], source[key]);
                                                    } else {
                                                        // Otherwise, source takes precedence
                                                        target[key] = source[key];
                                                    }
                                                }
                                            }
                                            return target;
                                        };
                                        
                                        // Start with data attributes (which already have nested structure)
                                        requestObjForRoute = {};
                                        for (var key in dataAttributes) {
                                            if (dataAttributes.hasOwnProperty(key)) {
                                                requestObjForRoute[key] = dataAttributes[key];
                                            }
                                        }
                                        
                                        // Then, deep merge form data (form data merges into existing structure)
                                        if (formData && Object.keys(formData).length > 0) {
                                            deepMerge(requestObjForRoute, formData);
                                        }
                                        
                                        // Add all() method with deep copy to preserve nested structure
                                        requestObjForRoute.all = function() {
                                            // Deep copy function to preserve nested objects
                                            var deepCopy = function(obj) {
                                                if (obj === null || typeof obj !== 'object') {
                                                    return obj;
                                                }
                                                if (obj instanceof Date) {
                                                    return new Date(obj.getTime());
                                                }
                                                if (Array.isArray(obj)) {
                                                    return obj.map(deepCopy);
                                                }
                                                var copy = {};
                                                for (var key in obj) {
                                                    if (obj.hasOwnProperty(key)) {
                                                        copy[key] = deepCopy(obj[key]);
                                                    }
                                                }
                                                return copy;
                                            };
                                            
                                            var allData = {};
                                            for (var k in this) {
                                                if (this.hasOwnProperty(k) && 
                                                    k !== '_files' &&
                                                    typeof this[k] !== 'function') {
                                                    // Use deep copy to preserve nested structure
                                                    allData[k] = deepCopy(this[k]);
                                                }
                                            }
                                            // Include files if they exist
                                            if (this._files && Object.keys(this._files).length > 0) {
                                                for (var fileKey in this._files) {
                                                    if (this._files.hasOwnProperty(fileKey)) {
                                                        allData[fileKey] = deepCopy(this._files[fileKey]);
                                                    }
                                                }
                                            }
                                            return allData;
                                        };
                                        
                                        // Add files if they exist
                                        if (files && Object.keys(files).length > 0) {
                                            requestObjForRoute._files = files;
                                        }
                                    }
                                    
                                    // Store request object in controller instance for Route.execute()
                                    self._currentRequest = requestObjForRoute;
                                    
                                    // Execute route - Route system will handle AJAX and call onClick with response
                                    // Route.execute() will call onClick with (mockEvent, ajaxPromise, data)
                                    // Pass self (controller instance) and requestData to Route.execute()
                                    var result = Framework.Route.execute(routeInfo.method, routeInfo.url, requestData, self);
                                    // Return the promise so it can be chained if needed
                                    return result;
                                } else {
                                    // No route found, check if we should auto-open modal
                                    // Extract modal name from controller selector (e.g., '#modal1' -> 'modal1')
                                    var controllerSelector = self._selector || self.selector;
                                    $(controllerSelector).removeClass('d-none');
                                    if (typeof controllerSelector === 'function') {
                                        controllerSelector = controllerSelector();
                                    }
                                    
                                    // Check if selector is a modal (starts with #modal or .modal)
                                    var modalMatch = null;
                                    if (controllerSelector) {
                                        // Match #modal1, .modal1, #modal_5, .modal_7, etc.
                                        modalMatch = controllerSelector.match(/^[#.](modal[\w]*)/);
                                    }
                                    
                                    // Also check for data-modal attribute on clicked element
                                    if (!modalMatch) {
                                        var dataModal = $target.attr('data-modal');
                                        if (dataModal) {
                                            modalMatch = [null, dataModal];
                                        }
                                    }
                        
                                    // If modal found, auto-open it automatically from onClick
                                    if (modalMatch && modalMatch[1]) {
                                        var modalName = modalMatch[1];
                                        
                                        // Call openModal with event - it will get dataId automatically from onClick event
                                        // Use window.openModal directly since it's guaranteed to exist
                                        if (typeof window.openModal === 'function') {
                                            window.openModal(modalName, e);
                                        }
                                    }
                                    
                                    // Call handler normally (without response parameter)
                                    return handler.call(this, e);
                                }
                            };
                            
                            // For forms, don't prevent default on submit buttons or file inputs
                            if ($elements.is('form')) {
                                $elements.on('click', function(e) {
                                    // If clicking a submit button, don't prevent default
                                    // Let the submit event handle it
                                    if (e.target.tagName === 'BUTTON' && e.target.type === 'submit') {
                                        return true; // Allow default behavior
                                    }
                                    // If clicking a file input, allow default behavior
                                    if (e.target.tagName === 'INPUT' && e.target.type === 'file') {
                                        return true; // Allow default behavior (file picker)
                                    }
                                    // For other clicks, use the handler
                                    return clickHandler.call(this, e);
                                });
                            } else {
                                $elements.on('click', clickHandler);
                            }
                        }
                        // Handle submit events (with route support)
                        else if (methodName === 'onSubmit' || methodName === 'handleSubmit') {
                            var submitHandler = function(e) {
                                // Get data from form
                                var requestData = null;
                                var $target = $(e.currentTarget);
                                
                                // Get form data
                                if (typeof Framework !== 'undefined' && Framework.form && typeof Framework.form.serializeObject === 'function') {
                                    requestData = Framework.form.serializeObject($target);
                                } else if (typeof $target.serializeObject === 'function') {
                                    requestData = $target.serializeObject();
                                } else {
                                    // Fallback: use jQuery serializeArray
                                    var formArray = $target.serializeArray();
                                    requestData = {};
                                    for (var i = 0; i < formArray.length; i++) {
                                        requestData[formArray[i].name] = formArray[i].value;
                                    }
                                }
                                
                                // Check if there's a route for this controller method
                                var routeInfo = self._findRouteForMethod(methodName);
                                if (routeInfo) {
                                    // Execute route
                                    Framework.Route.execute(routeInfo.method, routeInfo.url, requestData, self);
                                    e.preventDefault();
                                    return false;
                                }
                                
                                // No route found, call original handler
                                return handler.call(this, e);
                            };
                            $elements.on('submit', submitHandler);
                        }
                        // Handle change events (with route support)
                        else if (methodName === 'onChange' || methodName === 'handleChange') {
                            var changeHandler = function(e) {
                                // Get data from element
                                var requestData = null;
                                var $target = $(e.currentTarget);
                                
                                // Get element value or data attributes
                                var dataAttr = $target.attr('data-ajax-data');
                                if (dataAttr) {
                                    try {
                                        requestData = JSON.parse(dataAttr);
                                    } catch (e) {
                                        requestData = dataAttr;
                                    }
                                } else {
                                    requestData = {
                                        value: $target.val(),
                                        name: $target.attr('name'),
                                        id: $target.attr('id')
                                    };
                                }
                                
                                // Check if there's a route for this controller method
                                var routeInfo = self._findRouteForMethod(methodName);
                                if (routeInfo) {
                                    // Execute route
                                    Framework.Route.execute(routeInfo.method, routeInfo.url, requestData, self);
                                    e.preventDefault();
                                    return false;
                                }
                                
                                // No route found, call original handler
                                return handler.call(this, e);
                            };
                            $elements.on('change', changeHandler);
                        }
                        // Handle focus events (with route support)
                        else if (methodName === 'onFocus' || methodName === 'handleFocus') {
                            var focusHandler = function(e) {
                                // Get data from element
                                var requestData = null;
                                var $target = $(e.currentTarget);
                                
                                var dataAttr = $target.attr('data-ajax-data');
                                if (dataAttr) {
                                    try {
                                        requestData = JSON.parse(dataAttr);
                                    } catch (e) {
                                        requestData = dataAttr;
                                    }
                                } else {
                                    requestData = {
                                        name: $target.attr('name'),
                                        id: $target.attr('id')
                                    };
                                }
                                
                                // Check if there's a route for this controller method
                                var routeInfo = self._findRouteForMethod(methodName);
                                if (routeInfo) {
                                    // Execute route
                                    Framework.Route.execute(routeInfo.method, routeInfo.url, requestData, self);
                                    return false;
                                }
                                
                                // No route found, call original handler
                                return handler.call(this, e);
                            };
                            $elements.on('focus', focusHandler);
                        }
                        // Handle blur events (with route support)
                        else if (methodName === 'onBlur' || methodName === 'handleBlur') {
                            var blurHandler = function(e) {
                                // Get data from element
                                var requestData = null;
                                var $target = $(e.currentTarget);
                                
                                var dataAttr = $target.attr('data-ajax-data');
                                if (dataAttr) {
                                    try {
                                        requestData = JSON.parse(dataAttr);
                                    } catch (e) {
                                        requestData = dataAttr;
                                    }
                                } else {
                                    requestData = {
                                        value: $target.val(),
                                        name: $target.attr('name'),
                                        id: $target.attr('id')
                                    };
                                }
                                
                                // Check if there's a route for this controller method
                                var routeInfo = self._findRouteForMethod(methodName);
                                if (routeInfo) {
                                    // Execute route
                                    Framework.Route.execute(routeInfo.method, routeInfo.url, requestData, self);
                                    return false;
                                }
                                
                                // No route found, call original handler
                                return handler.call(this, e);
                            };
                            $elements.on('blur', blurHandler);
                        }
                        // Handle input events (with route support)
                        else if (methodName === 'onInput' || methodName === 'handleInput') {
                            var inputHandler = function(e) {
                                // Get data from element
                                var requestData = null;
                                var $target = $(e.currentTarget);
                                
                                var dataAttr = $target.attr('data-ajax-data');
                                if (dataAttr) {
                                    try {
                                        requestData = JSON.parse(dataAttr);
                                    } catch (e) {
                                        requestData = dataAttr;
                                    }
                                } else {
                                    requestData = {
                                        value: $target.val(),
                                        name: $target.attr('name'),
                                        id: $target.attr('id')
                                    };
                                }
                                
                                // Check if there's a route for this controller method
                                var routeInfo = self._findRouteForMethod(methodName);
                                if (routeInfo) {
                                    // Execute route
                                    Framework.Route.execute(routeInfo.method, routeInfo.url, requestData, self);
                                    return false;
                                }
                                
                                // No route found, call original handler
                                return handler.call(this, e);
                            };
                            $elements.on('input', inputHandler);
                        }
                        // Handle scroll events (with route support)
                        else if (methodName === 'onScroll' || methodName === 'handleScroll') {
                            var scrollHandler = function(e) {
                                // Get data from element
                                var requestData = null;
                                var $target = $(e.currentTarget);
                                
                                var dataAttr = $target.attr('data-ajax-data');
                                if (dataAttr) {
                                    try {
                                        requestData = JSON.parse(dataAttr);
                                    } catch (e) {
                                        requestData = dataAttr;
                                    }
                                } else {
                                    requestData = {
                                        scrollTop: $target.scrollTop(),
                                        scrollLeft: $target.scrollLeft(),
                                        id: $target.attr('id')
                                    };
                                }
                                
                                // Check if there's a route for this controller method
                                var routeInfo = self._findRouteForMethod(methodName);
                                if (routeInfo) {
                                    // Execute route
                                    Framework.Route.execute(routeInfo.method, routeInfo.url, requestData, self);
                                    return false;
                                }
                                
                                // No route found, call original handler
                                return handler.call(this, e);
                            };
                            $elements.on('scroll', scrollHandler);
                        }
                        // Handle keyup events (with route support)
                        else if (methodName === 'onKeyUp' || methodName === 'handleKeyUp') {
                            var keyupHandler = function(e) {
                                // Get data from element
                                var requestData = null;
                                var $target = $(e.currentTarget);
                                
                                var dataAttr = $target.attr('data-ajax-data');
                                if (dataAttr) {
                                    try {
                                        requestData = JSON.parse(dataAttr);
                                    } catch (e) {
                                        requestData = dataAttr;
                                    }
                                } else {
                                    requestData = {
                                        value: $target.val(),
                                        key: e.key,
                                        keyCode: e.keyCode,
                                        name: $target.attr('name'),
                                        id: $target.attr('id')
                                    };
                                }
                                
                                // Check if there's a route for this controller method
                                var routeInfo = self._findRouteForMethod(methodName);
                                if (routeInfo) {
                                    // Execute route
                                    Framework.Route.execute(routeInfo.method, routeInfo.url, requestData, self);
                                    return false;
                                }
                                
                                // No route found, call original handler
                                return handler.call(this, e);
                            };
                            $elements.on('keyup', keyupHandler);
                        }
                        // Handle keydown events (with route support)
                        else if (methodName === 'onKeyDown' || methodName === 'handleKeyDown') {
                            var keydownHandler = function(e) {
                                // Get data from element
                                var requestData = null;
                                var $target = $(e.currentTarget);
                                
                                var dataAttr = $target.attr('data-ajax-data');
                                if (dataAttr) {
                                    try {
                                        requestData = JSON.parse(dataAttr);
                                    } catch (e) {
                                        requestData = dataAttr;
                                    }
                                } else {
                                    requestData = {
                                        value: $target.val(),
                                        key: e.key,
                                        keyCode: e.keyCode,
                                        name: $target.attr('name'),
                                        id: $target.attr('id')
                                    };
                                }
                                
                                // Check if there's a route for this controller method
                                var routeInfo = self._findRouteForMethod(methodName);
                                if (routeInfo) {
                                    // Execute route
                                    Framework.Route.execute(routeInfo.method, routeInfo.url, requestData, self);
                                    return false;
                                }
                                
                                // No route found, call original handler
                                return handler.call(this, e);
                            };
                            $elements.on('keydown', keydownHandler);
                        }
                        // Handle mouseenter events (with route support)
                        else if (methodName === 'onMouseEnter' || methodName === 'handleMouseEnter') {
                            var mouseenterHandler = function(e) {
                                // Get data from element
                                var requestData = null;
                                var $target = $(e.currentTarget);
                                
                                var dataAttr = $target.attr('data-ajax-data');
                                if (dataAttr) {
                                    try {
                                        requestData = JSON.parse(dataAttr);
                                    } catch (e) {
                                        requestData = dataAttr;
                                    }
                                } else {
                                    requestData = {
                                        name: $target.attr('name'),
                                        id: $target.attr('id')
                                    };
                                }
                                
                                // Check if there's a route for this controller method
                                var routeInfo = self._findRouteForMethod(methodName);
                                if (routeInfo) {
                                    // Execute route
                                    Framework.Route.execute(routeInfo.method, routeInfo.url, requestData, self);
                                    return false;
                                }
                                
                                // No route found, call original handler
                                return handler.call(this, e);
                            };
                            $elements.on('mouseenter', mouseenterHandler);
                        }
                        // Handle mouseleave events (with route support)
                        else if (methodName === 'onMouseLeave' || methodName === 'handleMouseLeave') {
                            var mouseleaveHandler = function(e) {
                                // Get data from element
                                var requestData = null;
                                var $target = $(e.currentTarget);
                                
                                var dataAttr = $target.attr('data-ajax-data');
                                if (dataAttr) {
                                    try {
                                        requestData = JSON.parse(dataAttr);
                                    } catch (e) {
                                        requestData = dataAttr;
                                    }
                                } else {
                                    requestData = {
                                        name: $target.attr('name'),
                                        id: $target.attr('id')
                                    };
                                }
                                
                                // Check if there's a route for this controller method
                                var routeInfo = self._findRouteForMethod(methodName);
                                if (routeInfo) {
                                    // Execute route
                                    Framework.Route.execute(routeInfo.method, routeInfo.url, requestData, self);
                                    return false;
                                }
                                
                                // No route found, call original handler
                                return handler.call(this, e);
                            };
                            $elements.on('mouseleave', mouseleaveHandler);
                        }
                        // Handle hover events (DEPRECATED - use onMouseEnter/onMouseLeave instead)
                        // Note: onHover does NOT support routes - use onMouseEnter/onMouseLeave for route support
                        else if (methodName === 'onHover' || methodName === 'handleHover') {
                            // Simple handler without route support (deprecated)
                            $elements.on('mouseenter mouseleave', handler);
                        }
                    })(method, needsPreventDefault, RequestClass, methodFunc, params, requestParamIndex, hasRequestParam, eventParamIndex);
                }
            }
        },

        /**
         * Extract data attributes from element and all parents (with name attribute)
         * Supports: data-id, data-variation-id, data-variation_id, etc.
         * Uses 'name' attribute to identify parent elements
         * Structure: {id: 1, variation_id: 10, test: {id: 5, product_id: 50, grand: {id: 4}}}
         * @param {jQuery} $element - jQuery element
         * @returns {Object} Object with normalized attribute names as keys, plus nested parent data
         */
        _extractDataAttributes: function($element) {
            var result = {};
            var currentElement = $element[0];
            
            if (!currentElement) {
                return result;
            }
            
            /**
             * Extract data attributes from a single element
             * @param {HTMLElement} el - Element to extract from
             * @returns {Object} Object with data attributes (normalized keys)
             */
            var extractFromElement = function(el) {
                var data = {};
                
                if (!el || !el.attributes) {
                    return data;
                }
                
                for (var i = 0; i < el.attributes.length; i++) {
                    var attr = el.attributes[i];
                    var attrName = attr.name;
                    
                    // Check if it's a data-* attribute
                    if (attrName.indexOf('data-') === 0) {
                        // Remove 'data-' prefix
                        var key = attrName.substring(5);
                        
                        // Normalize: convert kebab-case to snake_case
                        key = key.replace(/-/g, '_');
                        
                        // Parse value
                        var value = attr.value;
                        if (value && (value.startsWith('{') || value.startsWith('['))) {
                            try { value = JSON.parse(value); } catch (e) {}
                        }
                        if (typeof value === 'string' && /^\d+(\.\d+)?$/.test(value)) {
                            value = parseFloat(value);
                        }
                        if (value === 'true') value = true;
                        if (value === 'false') value = false;
                        
                        data[key] = value;
                    }
                }
                
                return data;
            };
            
            // Extract from current element (the clicked element)
            var currentData = extractFromElement(currentElement);
            
            // Add current element's data to result (flat structure for direct parameter matching)
            for (var key in currentData) {
                if (currentData.hasOwnProperty(key)) {
                    result[key] = currentData[key];
                }
            }
            
            // Build chain of parent elements (from current to top)
            // Only include parents that have 'name' attribute
            var chain = [];
            var element = currentElement.parentElement;
            
            // Start from parent and go up
            while (element && element !== document.body && element !== document.documentElement) {
                var name = element.getAttribute && element.getAttribute('name');
                if (name) {
                    // Normalize name: convert kebab-case to snake_case
                    name = name.replace(/-/g, '_');
                    
                    var parentData = extractFromElement(element);
                    chain.push({
                        element: element,
                        name: name,
                        data: parentData
                    });
                }
                element = element.parentElement;
            }
            
            // If no parents with 'name' attribute, return current element's data only
            if (chain.length === 0) {
                return result;
            }
            
            // Build nested structure from bottom to top
            // Start from the deepest parent (closest to current element) and build up
            // Structure: test3 -> test2 -> test (each parent contains its child)
            var nested = null;
            
            for (var i = 0; i < chain.length; i++) {
                var item = chain[i];
                var itemName = item.name;
                var itemData = item.data;
                
                // Create a copy of parent data (don't modify original)
                // Parent data should contain ONLY parent's data attributes
                var parentData = {};
                for (var key in itemData) {
                    if (itemData.hasOwnProperty(key)) {
                        parentData[key] = itemData[key];
                    }
                }
                
                if (i === 0) {
                    // First parent (closest to current element) - start nested structure
                    nested = parentData;
                } else {
                    // Parent of parent - add previous nested structure as child
                    var previousItem = chain[i - 1];
                    var previousName = previousItem.name;
                    
                    // Add previous nested structure as child inside current parent
                    parentData[previousName] = nested;
                    
                    // Update nested to be the current parent (which now contains the previous one)
                    nested = parentData;
                }
            }
            
            // Add the top-level parent (the outermost one) to result
            if (chain.length > 0) {
                var topLevelItem = chain[chain.length - 1];
                var topLevelName = topLevelItem.name;
                result[topLevelName] = nested;
            }
            
            return result;
        },

        /**
         * Build arguments array for method call
         * Matches parameters with data attributes and event/request
         * @param {Array} params - Method parameter names
         * @param {Event} e - Event object
         * @param {number} eventIndex - Index of event parameter
         * @param {number} reqIndex - Index of Request parameter
         * @param {Function} requestClass - Request class (if any)
         * @param {boolean} hasRequestLowercase - Has lowercase 'request' parameter
         * @param {Object} dataAttributes - Extracted data attributes
         * @returns {Array} Arguments array
         */
        _buildArgumentsArray: function(params, e, eventIndex, reqIndex, requestClass, hasRequestLowercase, dataAttributes) {
            var args = new Array(params.length);
            
            // Fill in parameters from data attributes
            for (var i = 0; i < params.length; i++) {
                var paramName = params[i].trim();
                
                // Skip if this is event or request parameter (will be filled later)
                if (i === eventIndex || i === reqIndex) {
                    continue;
                }
                
                // Check if parameter has default value (e.g., "variation_id = null")
                var defaultMatch = paramName.match(/^(\w+)\s*=\s*(.+)$/);
                var actualParamName = defaultMatch ? defaultMatch[1].trim() : paramName;
                var defaultValue = defaultMatch ? defaultMatch[2].trim() : undefined;
                
                // Normalize parameter name (convert to lowercase for matching)
                var normalizedParamName = actualParamName.toLowerCase();
                
                // Try to find matching data attribute (case-insensitive, supports both _ and -)
                var matchedValue = undefined;
                
                // Direct match
                if (dataAttributes.hasOwnProperty(actualParamName)) {
                    matchedValue = dataAttributes[actualParamName];
                } else if (dataAttributes.hasOwnProperty(normalizedParamName)) {
                    matchedValue = dataAttributes[normalizedParamName];
                } else {
                    // Try case-insensitive match
                    for (var key in dataAttributes) {
                        if (dataAttributes.hasOwnProperty(key)) {
                            if (key.toLowerCase() === normalizedParamName) {
                                matchedValue = dataAttributes[key];
                                break;
                            }
                        }
                    }
                }
                
                // Use matched value or default value
                if (matchedValue !== undefined) {
                    args[i] = matchedValue;
                } else if (defaultValue !== undefined) {
                    // Parse default value
                    if (defaultValue === 'null') {
                        args[i] = null;
                    } else if (defaultValue === 'true') {
                        args[i] = true;
                    } else if (defaultValue === 'false') {
                        args[i] = false;
                    } else if (/^\d+$/.test(defaultValue)) {
                        args[i] = parseInt(defaultValue, 10);
                    } else if (/^\d+\.\d+$/.test(defaultValue)) {
                        args[i] = parseFloat(defaultValue);
                    } else if (defaultValue.startsWith('"') && defaultValue.endsWith('"')) {
                        args[i] = defaultValue.slice(1, -1);
                    } else if (defaultValue.startsWith("'") && defaultValue.endsWith("'")) {
                        args[i] = defaultValue.slice(1, -1);
                    } else {
                        args[i] = defaultValue;
                    }
                } else {
                    // No value found and no default - set to undefined
                    args[i] = undefined;
                }
            }
            
            return args;
        },

        /**
         * Find route for a specific method
         * @param {string} methodName - The method name (e.g., 'onClick', 'onSubmit')
         * @returns {Object|null} Route info or null if not found
         */
        _findRouteForMethod: function(methodName) {
            if (typeof Framework === 'undefined' || !Framework.Route) {
                return null;
            }
            
            // Try to find controller in Framework by name
            var controllerName = this.constructor ? this.constructor.name : null;
            
            // Remove 'Class' suffix if exists (AjaxGetControllerClass -> AjaxGetController)
            var controllerNameInFramework = controllerName;
            if (controllerName && controllerName.endsWith('Class')) {
                controllerNameInFramework = controllerName.replace(/Class$/, '');
            }
            
            var controllerInFramework = null;
            if (controllerNameInFramework && Framework[controllerNameInFramework]) {
                controllerInFramework = Framework[controllerNameInFramework];
            } else {
                // Try to find by searching Framework for controllers that match
                for (var key in Framework) {
                    if (Framework.hasOwnProperty(key) && 
                        key.indexOf('Controller') !== -1 &&
                        typeof Framework[key] === 'function') {
                        if (controllerName && key === controllerName.replace(/Class$/, '')) {
                            controllerInFramework = Framework[key];
                            break;
                        }
                    }
                }
            }
            
            // If we found the controller in Framework, search for route
            if (controllerInFramework) {
                return Framework.Route.findByController(controllerInFramework, methodName);
            } else {
                // Fallback: try with this.constructor
                return Framework.Route.findByController(this.constructor, methodName);
            }
        },

        /**
         * Get jQuery elements
         */
        $: function(selector) {
            if (selector) {
                return $(selector).removeClass('d-none');
            }
            return $(this.selector);
        },

        /**
         * Compact helper - مثل Laravel
         * Usage: compact('formData', 'hasFiles', 'files')
         * يجلب المتغيرات من scope الدالة تلقائياً
         */
        compact: function() {
            var varNames = Array.prototype.slice.call(arguments);
            var result = {};
            
            // استخدام eval للوصول إلى variables من caller scope
            // في strict mode، eval لا يمكنه الوصول إلى variables من scope آخر
            // لذا سنستخدم approach مختلف - نمرر variables كـ context
            try {
                for (var i = 0; i < varNames.length; i++) {
                    var varName = varNames[i];
                    try {
                        // استخدام eval للوصول إلى المتغير من caller scope
                        // نستخدم Function constructor لإنشاء function في non-strict mode
                        var getVar = new Function('return typeof ' + varName + ' !== "undefined" ? ' + varName + ' : undefined;');
                        var value = getVar();
                        if (value !== undefined) {
                            result[varName] = value;
                        }
                    } catch (err) {
                        // المتغير غير موجود في scope الحالي
                        // نحاول الوصول إليه من caller scope باستخدام eval مباشرة
                        try {
                            var value = eval(varName);
                            if (value !== undefined) {
                                result[varName] = value;
                            }
                        } catch (err2) {
                            // المتغير غير موجود
                        }
                    }
                }
            } catch (e) {
            }
            
            return result;
        },

        /**
         * Open modal by name - just write modal name
         * Usage: this.openModal('modal_5', e) - just write modal name
         * If element has data-id, it will be automatically added as _id to modal selector
         * @param {string} modal - Modal name (e.g., 'modal_5', 'modal_7')
         * @param {Event} e - Event object (optional, used to get data-id from clicked element)
         */
        openModal: function(modal, e) {
            if (!modal) return;
            
            // Get data-id from clicked element if event is provided
            // This gets the id from onClick event as user requested
            var dataId = (e && e.currentTarget) ? $(e.currentTarget).attr('data-id') || $(e.currentTarget).data('id') : null;
            
            // Build final modal selector - simple, just modal name with data-id if exists
            var finalModalSelector = dataId ? modal + '_' + dataId : modal;
            var $modal = $(finalModalSelector);
            // Open modal - Support Bootstrap 5
            if ($modal.length > 0) {
                // Try Bootstrap 5 first (using Modal class)
                if (typeof bootstrap !== 'undefined' && bootstrap.Modal) {
                    // Get existing instance or create new one
                    var existingInstance = bootstrap.Modal.getInstance($modal[0]);
                    if (existingInstance) {
                        // Dispose old instance first
                        existingInstance.dispose();
                    }
                    // Create new instance every time
                    var modalInstance = new bootstrap.Modal($modal[0], {
                        backdrop: true,
                        keyboard: true
                    });
                    modalInstance.show();
                }
                // Fallback to Bootstrap 4/jQuery
                else if (typeof $modal.modal === 'function') {
                    $modal.modal('show');
                }
                // Fallback to custom
                else {
                    $modal.show().css('display', 'block');
                    if (!$modal.hasClass('modal-open')) {
                        $modal.addClass('modal-open');
                    }
                }
            } else {
                console.warn('Modal not found: ' + finalModalSelector);
            }
        },

        /**
         * Extend controller (create new controller)
         * Supports both object-based and ES6 class-based controllers
         */
        extend: function(properties) {
            var self = this;
            
            // If properties is a class (ES6), return it directly
            if (typeof properties === 'function' && properties.prototype) {
                // ES6 class - copy base methods to prototype
                var BaseController = this;
                
                // Copy enumerable methods
                for (var method in BaseController) {
                    if (BaseController.hasOwnProperty(method) && typeof BaseController[method] === 'function') {
                        if (!properties.prototype[method]) {
                            properties.prototype[method] = BaseController[method];
                        }
                    }
                }
                
                // Copy non-enumerable methods (ES6 class methods are non-enumerable)
                var baseDescriptors = Object.getOwnPropertyDescriptors(BaseController);
                for (var method in baseDescriptors) {
                    if (baseDescriptors[method].value && typeof baseDescriptors[method].value === 'function') {
                        if (!properties.prototype[method]) {
                            Object.defineProperty(properties.prototype, method, baseDescriptors[method]);
                        }
                    }
                }
                
                // Add static init method
                if (!properties.init) {
                    properties.init = function() {
                        var instance = new properties();
                        instance.init();
                        return instance;
                    };
                }
                
                return properties;
            }
            
            // Object-based controller (old way)
            var Controller = function() {
                // Copy properties to instance
                for (var prop in properties) {
                    if (properties.hasOwnProperty(prop)) {
                        this[prop] = properties[prop];
                    }
                }
            };
            
            // Copy base methods
            for (var method in this) {
                if (typeof this[method] === 'function' && this.hasOwnProperty(method)) {
                    Controller.prototype[method] = this[method];
                }
            }
            
            // Override with new properties
            for (var prop in properties) {
                if (properties.hasOwnProperty(prop)) {
                    Controller.prototype[prop] = properties[prop];
                }
            }

            // Add static init method
            Controller.init = function() {
                var instance = new Controller();
                // Copy selector from properties to instance
                // Support both property and method for selector
                if (properties.selector) {
                    instance.selector = properties.selector;
                }
                // If selector is a method, call it
                if (typeof instance.selector === 'function') {
                    instance._selector = instance.selector();
                }
                instance.init();
                return instance;
            };

            return Controller;
        }
    };

    // Register Controller (also as BaseController for backward compatibility)
    Framework.Controller = Controller;
    Framework.BaseController = Controller; // Backward compatibility
    Framework.register('Controller', Controller);
    Framework.register('BaseController', Controller); // Backward compatibility
    
    // Make Controller available globally (Laravel-like)
    window.Controller = Controller;
    
    /**
     * Global openModal function - متاح في templates و HTML
     * Usage: openModal('modal_5', event) - just write modal name, method handles # or . automatically
     * If element has data-id, it will be automatically added as _id to modal selector
     * @param {string} modal - Modal name (e.g., 'modal_5', 'modal_7') - method tries # first, then .
     * @param {Event} e - Event object (optional, used to get data-id from clicked element)
     */
    window.openModal = function(modal, e) {
        if (!modal) return;
        // Get data-id from clicked element if event is provided
        // This gets the id from onClick event as user requested
        var dataId = (e && e.currentTarget) ? $(e.currentTarget).attr('data-id') || $(e.currentTarget).data('id') : null;
        
        // Build final modal selector - simple, just modal name with data-id if exists
        var finalModalSelector = dataId ? modal + '_' + dataId : modal;
        var $modal = $(finalModalSelector);
        // Open modal - Support Bootstrap 5
        if ($modal.length > 0) {
            // Try Bootstrap 5 first (using Modal class)
            if (typeof bootstrap !== 'undefined' && bootstrap.Modal) {
                // Get existing instance or create new one
                var existingInstance = bootstrap.Modal.getInstance($modal[0]);
                if (existingInstance) {
                    // Dispose old instance first
                    existingInstance.dispose();
                }
                // Create new instance every time
                var modalInstance = new bootstrap.Modal($modal[0], {
                    backdrop: true,
                    keyboard: true
                });
                modalInstance.show();
            }
            // Fallback to Bootstrap 4/jQuery
            else if (typeof $modal.modal === 'function') {
                $modal.modal('show');
            }
            // Fallback to custom
            else {
                $modal.show().css('display', 'block');
                if (!$modal.hasClass('modal-open')) {
                    $modal.addClass('modal-open');
                }
            }
        } else {
            console.warn('Modal not found: ' + finalModalSelector);
        }
    };
    
    // Also add to Framework for consistency
    Framework.openModal = window.openModal;

})(window.Framework || {});

