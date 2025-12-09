/**
 * وحدة AJAX - طلبات AJAX المبسطة
 * Laravel-like syntax: Ajax::get(url, elementReturn)
 * 
 * Usage:
 *   var response = Ajax::get('/api/data', '#result');
 *   var response = Ajax::post('/api/save', '#result', {name: 'test'});
 *   var response = Ajax::put('/api/update', '#result', {id: 1, name: 'test'});
 *   var response = Ajax::delete('/api/delete', '#result');
 */

class Ajax {
    /**
     * طلب GET
     * الاستخدام: 
     *   Ajax::get('/api/data', '#result');
     *   Ajax::get('/api/data', [ControllerName::class, 'methodName'], '#result');
     *   Ajax::get('/api/data', '#result', {param: 'value'});
     * 
     * @param {string} url - رابط الطلب
     * @param {string|jQuery|HTMLElement|Array} elementReturnOrRoute - العنصر أو Route handler [Controller, 'method']
     * @param {object|string|jQuery|HTMLElement} dataOrElement - البيانات أو العنصر
     * @param {object} options - (اختياري) خيارات إضافية
     * @returns {Promise} Promise للاستجابة
     */
    static get(url, elementReturnOrRoute, dataOrElement, options) {
        return this._request('GET', url, elementReturnOrRoute, dataOrElement, options);
    }

    /**
     * طلب POST
     * الاستخدام: 
     *   Ajax::post('/api/save', '#result', {name: 'test'});
     *   Ajax::post('/api/save', [ControllerName::class, 'methodName'], '#result', {name: 'test'});
     * 
     * @param {string} url - رابط الطلب
     * @param {string|jQuery|HTMLElement|Array} elementReturnOrRoute - العنصر أو Route handler [Controller, 'method']
     * @param {object|string|jQuery|HTMLElement} dataOrElement - البيانات أو العنصر
     * @param {object} options - (اختياري) خيارات إضافية
     * @returns {Promise} Promise للاستجابة
     */
    static post(url, elementReturnOrRoute, dataOrElement, options) {
        return this._request('POST', url, elementReturnOrRoute, dataOrElement, options);
    }

    /**
     * طلب PUT
     * الاستخدام: Ajax::put('/api/update', '#result', {id: 1, name: 'test'});
     * 
     * @param {string} url - رابط الطلب
     * @param {string|jQuery|HTMLElement} elementReturn - (اختياري) العنصر الذي سيتم تحديثه بالنتيجة
     * @param {object} data - (اختياري) البيانات المرسلة
     * @param {object} options - (اختياري) خيارات إضافية
     * @returns {Promise} Promise للاستجابة
     */
    static put(url, elementReturn, data, options) {
        return this._request('PUT', url, elementReturn, data, options);
    }

    /**
     * طلب DELETE
     * الاستخدام: Ajax::delete('/api/delete', '#result');
     * 
     * @param {string} url - رابط الطلب
     * @param {string|jQuery|HTMLElement} elementReturn - (اختياري) العنصر الذي سيتم تحديثه بالنتيجة
     * @param {object} data - (اختياري) البيانات المرسلة
     * @param {object} options - (اختياري) خيارات إضافية
     * @returns {Promise} Promise للاستجابة
     */
    static delete(url, elementReturn, data, options) {
        return this._request('DELETE', url, elementReturn, data, options);
    }

    /**
     * طلب PATCH
     * الاستخدام: Ajax::patch('/api/update', '#result', {name: 'test'});
     * 
     * @param {string} url - رابط الطلب
     * @param {string|jQuery|HTMLElement} elementReturn - (اختياري) العنصر الذي سيتم تحديثه بالنتيجة
     * @param {object} data - (اختياري) البيانات المرسلة
     * @param {object} options - (اختياري) خيارات إضافية
     * @returns {Promise} Promise للاستجابة
     */
    static patch(url, elementReturn, data, options) {
        return this._request('PATCH', url, elementReturn, data, options);
    }

    /**
     * طلب مخصص
     * الاستخدام: Ajax.request({url: '/api/data', method: 'POST', data: {...}});
     * 
     * @param {object} options - خيارات الطلب
     * @returns {Promise} Promise للاستجابة
     */
    static request(options) {
        var defaults = {
            timeout: Framework.config.ajax.timeout,
            error: this.defaultErrorHandler
        };
        return $.ajax($.extend(true, defaults, options));
    }

    /**
     * معالج الأخطاء الافتراضي
     */
    static defaultErrorHandler(xhr, status, error) {
        var shouldShowError = true;
        if (typeof Framework !== 'undefined' && Framework.config && Framework.config.ajax) {
            shouldShowError = Framework.config.ajax.defaultErrorHandler !== false;
        }
        
        if (shouldShowError) {
            console.error('AJAX Error:', error);
            var errorMessage = 'An error occurred: ' + error;
            if (xhr.responseJSON && xhr.responseJSON.message) {
                errorMessage = xhr.responseJSON.message;
            }
            alert(errorMessage);
        }
    }

    /**
     * طريقة داخلية لتنفيذ الطلبات
     * 
     * @private
     */
    static _request(method, url, elementReturn, data, options) {
        // Check if elementReturn is a route handler [ControllerClass, 'methodName']
        if (Array.isArray(elementReturn) && elementReturn.length === 2) {
            // This is a route handler - use Route system
            if (typeof Framework !== 'undefined' && Framework.Route) {
                // Register the route first
                Framework.Route._register(method, url, elementReturn, data);
                // Execute the route
                return Framework.Route.execute(method, url, data);
            } else {
                console.error('Route module is not loaded. Make sure route.js is loaded before ajax.js');
                return Promise.reject(new Error('Route module not available'));
            }
        }

        // Normalize parameters - elementReturn might be omitted
        var actualElementReturn = null;
        var actualData = null;
        var actualOptions = {};

        // Helper function to check if a value is a valid selector/element
        function isElementSelector(value) {
            if (value === null || value === undefined) return false;
            if (value instanceof jQuery || value instanceof HTMLElement) return true;
            if (typeof value === 'string' && (value.startsWith('#') || value.startsWith('.') || value.startsWith('[') || value.startsWith('body') || value.startsWith('html'))) {
                return true;
            }
            return false;
        }

        // Determine if elementReturn is actually an element selector or data
        if (isElementSelector(elementReturn)) {
            // elementReturn is a valid selector/element
            actualElementReturn = elementReturn;
            // Next parameter is data
            if (data !== undefined && data !== null) {
                if (typeof data === 'object' && !Array.isArray(data)) {
                    // Check if it's options (has properties like timeout, headers, etc.)
                    if (data.timeout !== undefined || data.headers !== undefined || data.beforeSend !== undefined || data.complete !== undefined) {
                        actualOptions = data;
                    } else {
                        actualData = data;
                        // Next parameter might be options
                        if (options !== undefined && options !== null && typeof options === 'object') {
                            actualOptions = options;
                        }
                    }
                } else {
                    actualData = data;
                }
            }
        } else if (elementReturn !== undefined && elementReturn !== null) {
            // elementReturn is actually data (no elementReturn provided)
            actualData = elementReturn;
            if (data !== undefined && data !== null && typeof data === 'object') {
                actualOptions = data;
            }
        } else {
            // elementReturn is undefined/null, check if data is provided
            if (data !== undefined && data !== null) {
                actualData = data;
                if (options !== undefined && options !== null && typeof options === 'object') {
                    actualOptions = options;
                }
            }
        }

        // Prepare AJAX options
        var timeout = 30000; // Default timeout
        if (typeof Framework !== 'undefined' && Framework.config && Framework.config.ajax) {
            timeout = Framework.config.ajax.timeout || timeout;
        }
        
        var ajaxOptions = $.extend(true, {
            url: url,
            method: method,
            timeout: timeout,
            dataType: 'json',
            error: this.defaultErrorHandler
        }, actualOptions);

        // Add data based on method
        if (actualData) {
            if (method === 'GET') {
                // For GET, data goes in URL as query string
                ajaxOptions.data = actualData;
            } else {
                // For POST, PUT, DELETE, PATCH, data goes in body
                ajaxOptions.data = actualData;
            }
        }

        // Execute AJAX request
        var promise = $.ajax(ajaxOptions);

        // If elementReturn is provided, update it automatically
        if (actualElementReturn) {
            promise.done(function(response) {
                var $element = null;
                
                // Get jQuery object from elementReturn
                if (typeof actualElementReturn === 'string') {
                    $element = $(actualElementReturn);
                } else if (actualElementReturn instanceof jQuery) {
                    $element = actualElementReturn;
                } else if (actualElementReturn instanceof HTMLElement) {
                    $element = $(actualElementReturn);
                }

                if ($element && $element.length) {
                    // If response is an object with specific properties, handle them
                    if (typeof response === 'object' && response !== null) {
                        if (response.html !== undefined) {
                            $element.html(response.html);
                        } else if (response.text !== undefined) {
                            $element.text(response.text);
                        } else if (response.message !== undefined) {
                            $element.html(response.message);
                        } else {
                            // Default: stringify JSON response
                            $element.html(JSON.stringify(response, null, 2));
                        }
                    } else {
                        // Default: set as HTML
                        $element.html(response);
                    }
                    
                    // Show element if hidden
                    $element.show();
                }
            }).fail(function(xhr, status, error) {
                // On error, show error message in elementReturn if provided
                if (actualElementReturn) {
                    var $element = null;
                    if (typeof actualElementReturn === 'string') {
                        $element = $(actualElementReturn);
                    } else if (actualElementReturn instanceof jQuery) {
                        $element = actualElementReturn;
                    } else if (actualElementReturn instanceof HTMLElement) {
                        $element = $(actualElementReturn);
                    }

                    if ($element && $element.length) {
                        var errorMessage = 'Error: ' + error;
                        if (xhr.responseJSON && xhr.responseJSON.message) {
                            errorMessage = xhr.responseJSON.message;
                        } else if (xhr.responseText) {
                            errorMessage = xhr.responseText;
                        }
                        $element.html('<div class="alert alert-danger">' + errorMessage + '</div>').show();
                    }
                }
            });
        }

        return promise;
    }
}

// تسجيل الوحدة في Framework
if (typeof Framework !== 'undefined') {
    Framework.register('ajax', Ajax);
    Framework.Ajax = Ajax;
    // Backward compatibility
    Framework.ajax = Ajax;
    // Make Ajax available globally
    window.Ajax = Ajax;
}
