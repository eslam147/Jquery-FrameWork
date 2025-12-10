/**
 * View System - نظام العرض مثل Laravel
 * 
 * Usage:
 *   return view('form', {data: data, errors: errors});
 *   return view('form', compact('data', 'errors'));
 */

(function(Framework) {
    'use strict';

    /**
     * View helper function - مثل Laravel
     * 
     * Usage:
     *   Framework.view('form', '#form-result', {data: data})
     *   Framework.view('form', '#form-result', Framework.compact(viewData, 'data'))
     * 
     * @param {string} viewName - اسم الـ view (مثل 'form' أو 'auth/login')
     * @param {string} selector - jQuery selector للعنصر الذي سيتم عرض الـ view فيه (مثل '#form-result')
     * @param {object} data - البيانات المراد تمريرها للـ view
     * @returns {void}
     */
    Framework.view = function(viewName, selector, data) {
        data = data || {};
        // Remove d-none from selector immediately
        if (selector) {
            var $selectorElement = $(selector);
            if ($selectorElement.length > 0) {
                $selectorElement.removeClass('d-none');
            }
        }
        
        // تحويل اسم الـ view إلى مسار الملف
        // حساب المسار النسبي بناءً على موقع الصفحة الحالية
        var currentPath = window.location.pathname;
        var pathParts = currentPath.split('/');
        pathParts.pop(); // Remove current file name
        
        // استخدام resources/views/ دائماً
        var viewPath = 'resources/views/' + viewName.replace(/\./g, '/') + '.html';
        
        // إذا كان الـ view موجود في cache، نستخدمه مباشرة
        if (Framework._viewCache && Framework._viewCache[viewPath]) {
            var rendered = Framework._renderView(Framework._viewCache[viewPath], data);
            var $target = $(selector);
            if ($target.length > 0) {
                // Remove d-none first, then set content and show
                $target.removeClass('d-none');
                $target.html(rendered);
                $target.show();
                
                // Auto-open modal if view name contains 'modal'
                if (viewName.indexOf('modal') !== -1) {
                    // Extract modal name from view name (e.g., 'modal1' from 'modal1')
                    var modalName = viewName.replace(/[^a-z0-9_]/gi, '');
                    
                    // Try to find modal inside rendered content first (by ID pattern modal1 or modal1_id)
                    var $modal = $target.find('.modal, #' + modalName + ', #' + modalName + '_' + (data.id || ''));
                    
                    // If modal not found in target, try to find it in document
                    if ($modal.length === 0) {
                        // Try to find modal in document by ID
                        $modal = $('#' + modalName);
                        if ($modal.length === 0 && data.id) {
                            $modal = $('#' + modalName + '_' + data.id);
                        }
                    }
                    if ($modal.length === 0) {
                        $modal = $('.' + modalName);
                    }
                    
                    // Open modal if found - Support Bootstrap 5
                    if ($modal.length > 0) {
                        // Small delay to ensure DOM is ready
                        setTimeout(function() {
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
                                if (!$('body').find('.modal-backdrop').length) {
                                    $('body').append('<div class="modal-backdrop fade show"></div>');
                                }
                                if (!$modal.hasClass('modal-open')) {
                                    $modal.addClass('modal-open');
                                }
                            }
                        }, 50);
                    }
                }
            }
            return;
        }
        
        // تحميل الـ view من الملف (async)
        Framework._loadView(viewPath, function(viewContent) {
            // حفظ في cache
            if (!Framework._viewCache) {
                Framework._viewCache = {};
            }
            Framework._viewCache[viewPath] = viewContent;
            
            // Render الـ view مع البيانات
            var rendered = Framework._renderView(viewContent, data);
            
            // عرض الـ view في العنصر المحدد
            var $target = $(selector);
            if ($target.length > 0) {
                // Remove d-none first, then set content and show
                $target.removeClass('d-none');
                $target.html(rendered);
                $target.show();
                
                // Auto-open modal if view name contains 'modal'
                // Keep modal in the specified selector, don't move to body
                if (viewName.indexOf('modal') !== -1) {
                    // Extract modal name from view name (e.g., 'modal1' from 'modal1')
                    var modalName = viewName.replace(/[^a-z0-9_]/gi, '');
                    
                    // Try to find modal inside rendered content first (by ID pattern modal1 or modal1_id)
                    var $modal = $target.find('.modal, #' + modalName + ', #' + modalName + '_' + (data.id || ''));
                    
                    // If modal not found in target, try to find it in document
                    if ($modal.length === 0) {
                        // Try to find modal in document by ID
                        $modal = $('#' + modalName);
                        if ($modal.length === 0 && data.id) {
                            $modal = $('#' + modalName + '_' + data.id);
                        }
                    }
                    if ($modal.length === 0) {
                        $modal = $('.' + modalName);
                    }
                    
                    // Open modal if found - Support Bootstrap 5
                    if ($modal.length > 0) {
                        // Function to load Bootstrap if not loaded
                        function loadBootstrapIfNeeded(callback) {
                            if (typeof bootstrap !== 'undefined' && bootstrap.Modal) {
                                callback();
                                return;
                            }
                            
                            // Check if Bootstrap script is already loading
                            if (document.querySelector('script[src*="bootstrap"]')) {
                                // Wait for it to load
                                var checkBootstrap = setInterval(function() {
                                    if (typeof bootstrap !== 'undefined' && bootstrap.Modal) {
                                        clearInterval(checkBootstrap);
                                        callback();
                                    }
                                }, 50);
                                setTimeout(function() { clearInterval(checkBootstrap); }, 5000);
                                return;
                            }
                            
                            // Load Bootstrap dynamically
                            var bootstrapScript = document.createElement('script');
                            bootstrapScript.src = 'https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js';
                            bootstrapScript.onload = function() {
                                callback();
                            };
                            bootstrapScript.onerror = function() {
                                // Fallback to custom modal
                                callback();
                            };
                            document.body.appendChild(bootstrapScript);
                        }
                        
                        // Function to open modal
                        function openModalNow() {
                            loadBootstrapIfNeeded(function() {
                                // Try Bootstrap 5 first (using Modal class)
                                if (typeof bootstrap !== 'undefined' && bootstrap.Modal) {
                                    try {
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
                                    } catch (e) {
                                        console.error('Bootstrap Modal error:', e);
                                        // Fallback to custom
                                        $modal.show().css('display', 'block');
                                        if (!$('body').find('.modal-backdrop').length) {
                                            $('body').append('<div class="modal-backdrop fade show"></div>');
                                        }
                                        if (!$modal.hasClass('modal-open')) {
                                            $modal.addClass('modal-open');
                                        }
                                    }
                                }
                                // Fallback to Bootstrap 4/jQuery
                                else if (typeof $modal.modal === 'function') {
                                    $modal.modal('show');
                                }
                                // Fallback to custom
                                else {
                                    $modal.show().css('display', 'block');
                                    // Add backdrop
                                    if (!$('body').find('.modal-backdrop').length) {
                                        $('body').append('<div class="modal-backdrop fade show"></div>');
                                    }
                                    if (!$modal.hasClass('modal-open')) {
                                        $modal.addClass('modal-open');
                                    }
                                }
                            });
                        }
                        
                        // Small delay to ensure DOM is ready
                        setTimeout(openModalNow, 50);
                    }
                }
            }
        });
    };

    /**
     * Load view file using callback
     */
    Framework._loadView = function(viewPath, callback) {
        $.ajax({
            url: viewPath,
            dataType: 'text',
            success: function(content) {
                callback(content);
            },
            error: function(xhr, status, error) {
                console.error('View not found: ' + viewPath);
                callback('<div class="error">View not found: ' + viewPath + '</div>');
            }
        });
    };

    /**
     * Load view file using Promise
     */
    Framework._loadViewPromise = function(viewPath) {
        return new Promise(function(resolve, reject) {
            $.ajax({
                url: viewPath,
                dataType: 'text',
                success: function(content) {
                    resolve(content);
                },
                error: function() {
                    console.error('View not found: ' + viewPath);
                    resolve('<div class="error">View not found: ' + viewPath + '</div>');
                }
            });
        });
    };

    /**
     * Render view with data - استبدال المتغيرات في الـ view
     */
    Framework._renderView = function(template, data) {
        var html = template;
        // استبدال @if conditions أولاً (قبل المتغيرات)
        html = Framework._processIfStatements(html, data);
        
        // استبدال @foreach loops
        html = Framework._processForeachLoops(html, data);
        
        // استبدال المتغيرات المتداخلة {{ variable }} أو {{ variable.property }} (مع HTML escaping)
        html = html.replace(/\{\{\s*([\w.]+)\s*\}\}/g, function(match, varPath) {
            var value = Framework._getNestedValue(data, varPath);
            if (value === undefined || value === null) return '';
            // Escape HTML
            return $('<div>').text(String(value)).html();
        });
        
        // استبدال المتغيرات مع HTML (بدون escaping) {!! variable !!} أو {!! variable.property !!}
        html = html.replace(/\{!!\s*([\w.]+)\s*!!\}/g, function(match, varPath) {
            var value = Framework._getNestedValue(data, varPath);
            if (value === undefined || value === null) return '';
            // Convert objects to JSON string
            if (typeof value === 'object') {
                return JSON.stringify(value, null, 2);
            }
            return String(value);
        });
        return html;
    };

    /**
     * Process @if statements with @else support
     * Handles nested @if statements by processing innermost first
     */
    Framework._processIfStatements = function(html, data) {
        var maxIterations = 50;
        var iteration = 0;
        
        while (iteration < maxIterations) {
            // Find innermost @if (one without nested @if inside)
            var innermostMatch = null;
            var ifRegex = /@if\s*\(([^)]+)\)/g;
            var match;
            
            while ((match = ifRegex.exec(html)) !== null) {
                var startPos = match.index;
                var condition = match[1];
                var contentStart = match.index + match[0].length;
                
                // Find matching @endif
                var pos = contentStart;
                var depth = 1;
                var elsePos = -1;
                var endPos = -1;
                
                while (pos < html.length && depth > 0) {
                    if (html.substr(pos, 5) === '@else' && depth === 1 && elsePos === -1) {
                        elsePos = pos;
                        pos += 5;
                        continue;
                    }
                    if (html.substr(pos, 3) === '@if') {
                        depth++;
                        pos += 3;
                        continue;
                    }
                    if (html.substr(pos, 6) === '@endif') {
                        depth--;
                        if (depth === 0) {
                            endPos = pos + 6;
                            break;
                        }
                        pos += 6;
                        continue;
                    }
                    pos++;
                }
                
                if (endPos === -1) continue;
                
                // Check if this @if contains nested @if
                var ifContent = html.substring(contentStart, elsePos !== -1 ? elsePos : endPos - 6);
                var elseContent = elsePos !== -1 ? html.substring(elsePos + 5, endPos - 6) : null;
                
                var hasNested = /@if\s*\(/.test(ifContent) || (elseContent && /@if\s*\(/.test(elseContent));
                
                if (!hasNested) {
                    // This is innermost, process it
                    var conditionResult = Framework._evaluateCondition(condition, data);
                    var replacement = conditionResult ? ifContent : (elseContent || '');
                    html = html.substring(0, startPos) + replacement + html.substring(endPos);
                    break; // Process one at a time
                }
            }
            
            if (!match) break; // No more @if statements
            iteration++;
        }
        
        return html;
    };

    /**
     * Process @foreach loops
     */
    Framework._processForeachLoops = function(html, data) {
        // @foreach(array as item) ... @endforeach
        var foreachRegex = /@foreach\s*\(([^)]+)\)([\s\S]*?)@endforeach/g;
        
        html = html.replace(foreachRegex, function(match, loopExpr, content) {
            // Parse: items as item أو object as key, value
            var parts = loopExpr.split(/\s+as\s+/);
            if (parts.length !== 2) return '';
            
            var arrayName = parts[0].trim();
            var itemExpr = parts[1].trim();
            
            var array = Framework._getNestedValue(data, arrayName);
            
            // Handle objects (like formData object)
            if (array && !Array.isArray(array) && typeof array === 'object') {
                // Convert object to array of [key, value] pairs
                var objectArray = [];
                for (var key in array) {
                    if (array.hasOwnProperty(key)) {
                        objectArray.push([key, array[key]]);
                    }
                }
                array = objectArray;
            }
            
            if (!Array.isArray(array)) return '';
            
            var result = '';
            for (var i = 0; i < array.length; i++) {
                var itemData = $.extend({}, data);
                
                // Handle key, value syntax
                if (itemExpr.indexOf(',') !== -1) {
                    var keyValue = itemExpr.split(',').map(function(s) { return s.trim(); });
                    if (keyValue.length === 2 && Array.isArray(array[i]) && array[i].length === 2) {
                        itemData[keyValue[0]] = array[i][0]; // key
                        itemData[keyValue[1]] = array[i][1]; // value
                    } else {
                        itemData[itemExpr] = array[i];
                    }
                } else {
                    itemData[itemExpr] = array[i];
                }
                
                itemData[itemExpr + '_index'] = i;
                result += Framework._renderView(content, itemData);
            }
            
            return result;
        });
        
        return html;
    };

    /**
     * Evaluate condition - supports nested properties like data.title
     */
    Framework._evaluateCondition = function(condition, data) {
        condition = condition.trim();
        
        // Handle negation: !variable or !variable.property
        if (condition.startsWith('!')) {
            var varPath = condition.substring(1).trim();
            var value = Framework._getNestedValue(data, varPath);
            // Consider empty strings, null, undefined, false, 0, empty arrays/objects as falsy
            if (value === null || value === undefined || value === false || value === 0 || value === '') {
                return true; // !falsy = true
            }
            if (Array.isArray(value) && value.length === 0) return true;
            if (typeof value === 'object' && Object.keys(value).length === 0) return true;
            return false; // !truthy = false
        } else {
            // Support nested properties like data.title, data.message, etc.
            var value = Framework._getNestedValue(data, condition);
            // Consider empty strings, null, undefined, false, 0, empty arrays/objects as falsy
            if (value === null || value === undefined || value === false || value === 0 || value === '') {
                return false;
            }
            if (Array.isArray(value) && value.length === 0) return false;
            if (typeof value === 'object' && Object.keys(value).length === 0) return false;
            return true;
        }
    };

    /**
     * Get nested value from object (support dot notation)
     */
    Framework._getNestedValue = function(obj, path) {
        var parts = path.split('.');
        var value = obj;
        
        for (var i = 0; i < parts.length; i++) {
            if (value === null || value === undefined) {
                return undefined;
            }
            value = value[parts[i]];
        }
        
        return value;
    };

    /**
     * Compact function - مثل Laravel
     * 
     * Usage في JavaScript:
     *   compact({data: data, errors: errors}, 'data', 'errors')
     *   أو
     *   compact({data, errors}, 'data', 'errors') - ES6 shorthand
     * 
     * @param {object} source - Object يحتوي على المتغيرات
     * @param {...string} varNames - أسماء المتغيرات المطلوبة
     * @returns {object} Object containing only the requested variables
     */
    Framework.compact = function(source) {
        var varNames = Array.prototype.slice.call(arguments, 1);
        var result = {};
        
        if (!source || typeof source !== 'object') {
            return {};
        }
        
        for (var i = 0; i < varNames.length; i++) {
            var name = varNames[i];
            if (source.hasOwnProperty(name)) {
                result[name] = source[name];
            }
        }
        
        return result;
    };

    // Register view as a module
    Framework.register('view', {
        render: Framework.view,
        compact: Framework.compact
    });
    // Make compact available globally - مثل Laravel
    window.compact = Framework.compact;
    window.view = Framework.view;

})(window.Framework || {});

