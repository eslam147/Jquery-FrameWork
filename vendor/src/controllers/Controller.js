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
                            // Use simpler approach: wrap the function directly
                            var originalFunc = func;
                            func = function() {
                                // Add $target automatically if event parameter exists
                                if (eventIndex >= 0 && arguments[eventIndex]) {
                                    var $target = $(arguments[eventIndex].currentTarget || arguments[eventIndex]);
                                }
                                
                                // Add view helper
                                var view = function(viewName, selector, data) {
                                    return Framework.view(viewName, selector, data);
                                };
                                
                                // Add compact helper
                                var compact = function() {
                                    var varNames = Array.prototype.slice.call(arguments);
                                    var result = {};
                                    for (var i = 0; i < varNames.length; i++) {
                                        var name = varNames[i];
                                        try { 
                                            result[name] = eval(name); 
                                        } catch(e) {} 
                                    }
                                    return result;
                                };
                                
                                // Call original function with proper context
                                return originalFunc.apply(self, arguments);
                                    };
                        }
                        
                        var handler = function(e) {
                            // Auto preventDefault for click and submit events
                            if (shouldPreventDefault && e && e.preventDefault) {
                                e.preventDefault();
                            }
                            
                            // If parameter is 'request' (lowercase) - no validation, just create object
                            if (hasRequestLowercase && !requestClass) {
                                var $form = $(e.currentTarget);
                                var formData = $form.fw('form').serializeObject();
                                var files = $form.fw('form').getFiles();
                                
                                // Create simple object with form data
                                var requestObj = {};
                                for (var key in formData) {
                                    if (formData.hasOwnProperty(key)) {
                                        requestObj[key] = formData[key];
                                    }
                                }
                                
                                // Add all() method
                                requestObj.all = function() {
                                    var data = {};
                                    for (var k in this) {
                                        if (this.hasOwnProperty(k) && 
                                            k !== '_files' &&
                                            typeof this[k] !== 'function') {
                                            data[k] = this[k];
                                        }
                                    }
                                    // Include files if they exist
                                    if (this._files && Object.keys(this._files).length > 0) {
                                        for (var fileKey in this._files) {
                                            if (this._files.hasOwnProperty(fileKey)) {
                                                data[fileKey] = this._files[fileKey];
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
                                
                                // Build args array
                                var args = new Array(params.length);
                                args[reqIndex] = requestObj;
                                for (var i = 0; i < params.length; i++) {
                                    if (i !== reqIndex) {
                                        args[i] = e;
                                        break;
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
                                
                                // Call handler with parameters in correct order
                                // Build arguments array: Request instance at its position, event at other position
                                var args = new Array(params.length);
                                
                                // Place Request instance at its original position (if parameter exists)
                                if (reqIndex >= 0) {
                                    args[reqIndex] = requestInstance;
                                } else {
                                    // If no request parameter, add it as first argument if no event parameter exists
                                    // Or add it after event if event exists
                                    var hasEventParam = false;
                                    for (var j = 0; j < params.length; j++) {
                                        if (params[j].toLowerCase() === 'e' || params[j].toLowerCase() === 'event') {
                                            hasEventParam = true;
                                            break;
                                        }
                                    }
                                    if (params.length === 0) {
                                        // No parameters, add request as first
                                        args = [requestInstance];
                                    } else if (hasEventParam) {
                                        // Has event parameter, add request after it
                                        args = [e, requestInstance];
                                    } else {
                                        // No event parameter, add request as first
                                        args = [requestInstance, e];
                                    }
                                }
                                
                                // Place event at the other position (first non-Request position)
                                if (reqIndex >= 0) {
                                    for (var i = 0; i < params.length; i++) {
                                        if (i !== reqIndex) {
                                            args[i] = e;
                                            break; // Only one event parameter
                                        }
                                    }
                                    // التأكد من أن args[reqIndex] يحتوي على requestInstance
                                    if (!args[reqIndex]) {
                                        args[reqIndex] = requestInstance;
                                    }
                                }
                                
                                // إنشاء wrapper function لإضافة alias 'request' تلقائياً
                                // وإضافة compact helper محسّن
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
                                            'var compact = function() { ' +
                                            'var varNames = Array.prototype.slice.call(arguments); ' +
                                            'var result = {}; ' +
                                            'for (var i = 0; i < varNames.length; i++) { ' +
                                            'var name = varNames[i]; ' +
                                            'try { result[name] = eval(name); } catch(e) {} ' +
                                            '} ' +
                                            'return result; ' +
                                            '}; ' +
                                            'var view = function(viewName, selector, data) { ' +
                                            'return Framework.view(viewName, selector, data); ' +
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
                            return func.call(self, e);
                        };
                        
                        // Handle click events
                        if (methodName === 'onClick' || methodName === 'handleClick') {
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
                                    return handler.call(this, e);
                                });
                            } else {
                                $elements.on('click', handler);
                            }
                        }
                        // Handle submit events
                        else if (methodName === 'onSubmit' || methodName === 'handleSubmit') {
                            $elements.on('submit', function(e) {
                                return handler.call(this, e);
                            });
                        }
                        // Handle change events
                        else if (methodName === 'onChange' || methodName === 'handleChange') {
                            $elements.on('change', handler);
                        }
                        // Handle focus events
                        else if (methodName === 'onFocus' || methodName === 'handleFocus') {
                            $elements.on('focus', handler);
                        }
                        // Handle blur events
                        else if (methodName === 'onBlur' || methodName === 'handleBlur') {
                            $elements.on('blur', handler);
                        }
                        // Handle hover events
                        else if (methodName === 'onHover' || methodName === 'handleHover') {
                            $elements.on('mouseenter mouseleave', handler);
                        }
                    })(method, needsPreventDefault, RequestClass, methodFunc, params, requestParamIndex, hasRequestParam, eventParamIndex);
                }
            }
        },

        /**
         * Get jQuery elements
         */
        $: function(selector) {
            if (selector) {
                return $(selector);
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
                console.warn('Error in compact:', e);
            }
            
            return result;
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

})(window.Framework || {});

