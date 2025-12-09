/**
 * Route Module - Laravel-like Routing System
 * vendor/src/modules/route.js
 * 
 * Usage:
 *   Route::get('/api/data', [ControllerName::class, 'methodName'], '#element');
 *   Route::post('/api/save', [ControllerName::class, 'methodName'], '#element');
 */

class Route {
    // Store all routes
    static routes = {
        GET: {},
        POST: {},
        PUT: {},
        DELETE: {},
        PATCH: {}
    };

    /**
     * Register a GET route
     * @param {string} url - The URL pattern
     * @param {Array} handler - [ControllerClass, 'methodName']
     * @param {string|jQuery|HTMLElement} elementReturn - Element to update with response
     */
    static get(url, handler, elementReturn) {
        this._register('GET', url, handler, elementReturn);
    }

    /**
     * Register a POST route
     * @param {string} url - The URL pattern
     * @param {Array} handler - [ControllerClass, 'methodName']
     * @param {string|jQuery|HTMLElement} elementReturn - Element to update with response
     */
    static post(url, handler, elementReturn) {
        this._register('POST', url, handler, elementReturn);
    }

    /**
     * Register a PUT route
     * @param {string} url - The URL pattern
     * @param {Array} handler - [ControllerClass, 'methodName']
     * @param {string|jQuery|HTMLElement} elementReturn - Element to update with response
     */
    static put(url, handler, elementReturn) {
        this._register('PUT', url, handler, elementReturn);
    }

    /**
     * Register a DELETE route
     * @param {string} url - The URL pattern
     * @param {Array} handler - [ControllerClass, 'methodName']
     * @param {string|jQuery|HTMLElement} elementReturn - Element to update with response
     */
    static delete(url, handler, elementReturn) {
        this._register('DELETE', url, handler, elementReturn);
    }

    /**
     * Register a PATCH route
     * @param {string} url - The URL pattern
     * @param {Array} handler - [ControllerClass, 'methodName']
     * @param {string|jQuery|HTMLElement} elementReturn - Element to update with response
     */
    static patch(url, handler, elementReturn) {
        this._register('PATCH', url, handler, elementReturn);
    }

    /**
     * Internal method to register routes
     * @private
     */
    static _register(method, url, handler, elementReturn) {
        if (!Array.isArray(handler) || handler.length !== 2) {
            return;
        }

        var ControllerClass = handler[0];
        var methodName = handler[1];

        if (!ControllerClass || typeof methodName !== 'string') {
            return;
        }

        this.routes[method][url] = {
            controller: ControllerClass,
            method: methodName,
            elementReturn: elementReturn,
            url: url // Store the actual URL for AJAX request
        };
    }

    /**
     * Execute a route - Makes AJAX request and calls controller method
     * @param {string} method - HTTP method
     * @param {string} url - URL to execute (route key)
     * @param {object} data - Request data
     * @param {object} controllerInstance - (optional) Controller instance to use
     * @returns {Promise} AJAX promise
     */
    static execute(method, url, data, controllerInstance) {
        var route = this.routes[method] && this.routes[method][url];
        
        if (!route) {
            return Promise.reject(new Error('Route not found: ' + method + ' ' + url));
        }
        
        // If controllerInstance has request object, merge request->all() into data
        if (controllerInstance && controllerInstance._currentRequest) {
            var requestObj = controllerInstance._currentRequest;
            var requestData = {};
            
            // Get all data from request using all() method if available
            if (typeof requestObj.all === 'function') {
                requestData = requestObj.all();
            } else {
                // Fallback: copy all properties from request object
                for (var key in requestObj) {
                    if (requestObj.hasOwnProperty(key) && 
                        key !== '_files' &&
                        typeof requestObj[key] !== 'function') {
                        requestData[key] = requestObj[key];
                    }
                }
            }
            
            // Merge request data into data (request data takes precedence)
            if (!data) {
                data = {};
            }
            for (var key in requestData) {
                if (requestData.hasOwnProperty(key)) {
                    data[key] = requestData[key];
                }
            }
        }

        var ControllerClass = route.controller;
        var methodName = route.method;
        var elementReturn = route.elementReturn;
        var routeUrl = route.url || url; // Use stored URL or fallback to route key

        // Get controller instance
        // ControllerClass is Framework.AjaxGetController (function from Controller.extend())
        // We need to find the actual instance that was created by Framework.boot()
        // The instance is stored in Framework._instances or we need to get it from the current context
        var controllerInstance = null;
        
        // Try to get instance from Framework._instances if it exists
        if (typeof Framework !== 'undefined' && Framework._instances) {
            var controllerName = ControllerClass.name || (ControllerClass.constructor ? ControllerClass.constructor.name : null);
            if (controllerName && Framework._instances[controllerName]) {
                controllerInstance = Framework._instances[controllerName];
            }
        }
        
        // If not found, try to get from Framework by name (without Class suffix)
        if (!controllerInstance && typeof Framework !== 'undefined') {
            var controllerName = ControllerClass.name || (ControllerClass.constructor ? ControllerClass.constructor.name : null);
            if (controllerName) {
                // Remove 'Class' suffix if exists
                var controllerNameInFramework = controllerName.endsWith('Class') ? controllerName.replace(/Class$/, '') : controllerName;
                if (Framework[controllerNameInFramework]) {
                    // Framework[controllerNameInFramework] is a function, not an instance
                    // We need to find the actual instance
                    // Try to get from a global registry or create a new instance
                    controllerInstance = Framework[controllerNameInFramework];
                }
            }
        }
        
        // If still not found, use ControllerClass directly (it's a function, not an instance)
        if (!controllerInstance) {
            controllerInstance = ControllerClass;
        }

        if (!controllerInstance) {
            var controllerName = (typeof ControllerClass === 'object' && ControllerClass.constructor) ? ControllerClass.constructor.name : (ControllerClass.name || 'Unknown');
            return Promise.reject(new Error('Controller not found: ' + controllerName));
        }

        // Check if method exists and get it
        // controllerInstance is the actual instance (self) passed from clickHandler
        // We need to get the ORIGINAL method from the class prototype, not the wrapped one
        var controllerMethod = null; // Controller method (onClick, etc.)
        
        // Try to get original method from class prototype first (before Controller.js wrapping)
        if (ControllerClass && ControllerClass.prototype && typeof ControllerClass.prototype[methodName] === 'function') {
            // Get from class prototype (original method)
            controllerMethod = ControllerClass.prototype[methodName];
        } else if (controllerInstance && controllerInstance.constructor && controllerInstance.constructor.prototype && typeof controllerInstance.constructor.prototype[methodName] === 'function') {
            // Get from instance constructor prototype
            controllerMethod = controllerInstance.constructor.prototype[methodName];
        } else if (controllerInstance && typeof controllerInstance[methodName] === 'function') {
            // Fallback: get from instance (might be wrapped)
            controllerMethod = controllerInstance[methodName];
        } else if (typeof controllerInstance === 'function' && controllerInstance.prototype && typeof controllerInstance.prototype[methodName] === 'function') {
            // Method exists on prototype (for function constructors)
            controllerMethod = controllerInstance.prototype[methodName];
        } else if (typeof controllerInstance === 'function' && typeof controllerInstance[methodName] === 'function') {
            // Method exists on function itself
            controllerMethod = controllerInstance[methodName];
        }
        
        if (!controllerMethod) {
            var controllerName = (typeof ControllerClass === 'object' && ControllerClass.constructor) ? ControllerClass.constructor.name : (ControllerClass.name || 'Unknown');
            return Promise.reject(new Error('Method not found: ' + methodName + ' in ' + controllerName));
        }
        
        // Store reference to original method for Response.injectIntoMethod
        controllerMethod._originalMethod = controllerMethod;

        // Make AJAX request using the route URL
        var ajaxPromise = null;
        var httpMethod = method; // HTTP method (GET, POST, etc.)
        if (typeof Framework !== 'undefined' && Framework.Ajax) {
            try {
                if (httpMethod === 'GET') {
                    ajaxPromise = Framework.Ajax.get(routeUrl, null, data);
                } else if (httpMethod === 'POST') {
                    ajaxPromise = Framework.Ajax.post(routeUrl, null, data);
                } else if (httpMethod === 'PUT') {
                    ajaxPromise = Framework.Ajax.put(routeUrl, null, data);
                } else if (httpMethod === 'DELETE') {
                    ajaxPromise = Framework.Ajax.delete(routeUrl, null, data);
                } else if (httpMethod === 'PATCH') {
                    ajaxPromise = Framework.Ajax.patch(routeUrl, null, data);
                } else {
                    return Promise.reject(new Error('Unsupported HTTP method: ' + httpMethod));
                }
            } catch (error) {
                return Promise.reject(new Error('Ajax request failed: ' + error.message));
            }
        } else {
            return Promise.reject(new Error('Ajax module not available'));
        }

        // Verify that ajaxPromise is a valid promise
        if (!ajaxPromise || typeof ajaxPromise.then !== 'function') {
            return Promise.reject(new Error('Ajax request failed: Invalid promise returned'));
        }

        // Show loading state if elementReturn is provided
        if (elementReturn) {
            if (typeof Framework !== 'undefined' && Framework.view) {
                Framework.view('ajax-loading', elementReturn);
            }
        }

        // Call controller method with the AJAX promise
        var mockEvent = {
            preventDefault: function() {},
            currentTarget: null,
            target: null
        };

        // The controller method should handle the promise
        // We wait for the promise to resolve, then pass responseData as data parameter
        // Also provide response object in scope for response->data syntax
        // Use a flag to ensure onClick is called only once (either success or error, not both)
        var methodCalled = false;
        
        try {
            // Wait for promise to resolve, then call onClick with responseData as data parameter
            ajaxPromise.then(function(responseData) {
                // Only call if not already called
                if (methodCalled) return;
                methodCalled = true;
                
                // Create response object using Response class
                var responseObject = Framework.Response.fromAjaxSuccess(responseData, 200);
                
                // Call onClick with data only (responseData), and provide response object in scope
                // Use Response.injectIntoMethod to inject response into method scope
                Framework.Response.injectIntoMethod(
                    controllerMethod,
                    responseObject,
                    controllerInstance,
                    [mockEvent, responseData]
                );
            }).fail(function(xhr, status, error) {
                // Only call if not already called
                if (methodCalled) return;
                methodCalled = true;
                
                // Create error response object using Response class
                var responseObject = Framework.Response.fromAjaxError(xhr, status, error);
                
                // Get error data
                var errorData = responseObject.data;
                
                // Call onClick with error data
                Framework.Response.injectIntoMethod(
                    controllerMethod,
                    responseObject,
                    controllerInstance,
                    [mockEvent, errorData]
                );
            });
            
            // Return the promise so it can be chained
            return ajaxPromise;
        } catch (error) {
            return Promise.reject(error);
        }
    }

    /**
     * Get all registered routes
     * @returns {object} All routes
     */
    static all() {
        return this.routes;
    }

    /**
     * Find route by controller and method
     * @param {Function} ControllerClass - Controller class
     * @param {string} methodName - Method name
     * @returns {object|null} Route info or null
     */
    static findByController(ControllerClass, methodName) {
        // ControllerClass can be either Framework.AjaxGetController (object) or a class
        // We need to compare by reference or by name
        for (var method in this.routes) {
            for (var url in this.routes[method]) {
                var route = this.routes[method][url];
                var routeController = route.controller;
                
                // Compare by reference (same object)
                if (routeController === ControllerClass && route.method === methodName) {
                    return {
                        method: method,
                        url: url,
                        route: route
                    };
                }
                
                // Also compare by name if both are objects/classes with names
                var controllerName = null;
                var routeControllerName = null;
                
                if (typeof ControllerClass === 'object' && ControllerClass !== null) {
                    controllerName = ControllerClass.constructor ? ControllerClass.constructor.name : null;
                } else if (typeof ControllerClass === 'function') {
                    controllerName = ControllerClass.name;
                }
                
                if (typeof routeController === 'object' && routeController !== null) {
                    routeControllerName = routeController.constructor ? routeController.constructor.name : null;
                } else if (typeof routeController === 'function') {
                    routeControllerName = routeController.name;
                }
                
                if (controllerName && routeControllerName && controllerName === routeControllerName && route.method === methodName) {
                    return {
                        method: method,
                        url: url,
                        route: route
                    };
                }
            }
        }
        return null;
    }
}

// Register Route in Framework
if (typeof Framework !== 'undefined') {
    Framework.register('route', Route);
    Framework.Route = Route;
    // Make Route available globally
    window.Route = Route;
}

