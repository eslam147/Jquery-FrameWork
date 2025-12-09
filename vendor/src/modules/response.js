/**
 * Response.js - Response object handler for AJAX requests
 * vendor/src/modules/response.js
 * 
 * This module provides a Response class to create standardized response objects
 * for AJAX requests, similar to Laravel's Response class.
 */

(function() {
    'use strict';

    /**
     * Response class - Creates standardized response objects
     */
    class Response {
        /**
         * Create a success response object
         * @param {*} data - The response data
         * @param {number} status - HTTP status code (default: 200)
         * @returns {Object} Response object
         */
        static success(data, status) {
            status = status || 200;
            return {
                data: data,
                status: status,
                success: true,
                error: false
            };
        }

        /**
         * Create an error response object
         * @param {*} data - The error data
         * @param {number} status - HTTP status code (default: 500)
         * @returns {Object} Response object
         */
        static error(data, status) {
            status = status || 500;
            return {
                data: data || null,
                status: status,
                success: false,
                error: true
            };
        }

        /**
         * Create a response object from AJAX success
         * @param {*} responseData - The response data from AJAX
         * @param {number} status - HTTP status code (default: 200)
         * @returns {Object} Response object
         */
        static fromAjaxSuccess(responseData, status) {
            return this.success(responseData, status);
        }

        /**
         * Create a response object from AJAX error
         * @param {Object} xhr - The XMLHttpRequest object
         * @param {string} status - The error status
         * @param {string} error - The error message
         * @returns {Object} Response object
         */
        static fromAjaxError(xhr, status, error) {
            var errorData = {
                status: xhr ? xhr.status : null,
                data: xhr && xhr.responseJSON ? xhr.responseJSON : null
            };

            return this.error(
                errorData.data,
                errorData.status || 500
            );
        }

        /**
         * Inject response object into a function's scope
         * @param {Function} method - The method to inject response into
         * @param {Object} responseObject - The response object to inject
         * @param {Object} context - The context (this) to call the method with
         * @param {Array} args - Arguments to pass to the method
         * @returns {*} The result of calling the method
         */
        static injectIntoMethod(method, responseObject, context, args) {
            // Try to get the original method if it's wrapped
            var originalMethod = method._originalMethod || method;
            
            // Always use the simplest approach: extract body between first { and last }
            var methodStr = originalMethod.toString();
            var firstBrace = methodStr.indexOf('{');
            var lastBrace = methodStr.lastIndexOf('}');
            
            if (firstBrace === -1 || lastBrace === -1 || lastBrace <= firstBrace) {
                // If we can't extract body, try to get from prototype
                var constructor = context.constructor;
                if (constructor && constructor.prototype) {
                    var methodName = originalMethod.name || 'onClick';
                    if (constructor.prototype[methodName]) {
                        methodStr = constructor.prototype[methodName].toString();
                        firstBrace = methodStr.indexOf('{');
                        lastBrace = methodStr.lastIndexOf('}');
                    }
                }
            }
            
            if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
                var methodBody = methodStr.substring(firstBrace + 1, lastBrace).trim();
                
                // Remove trailing closing brace if present
                if (methodBody.endsWith('}')) {
                    methodBody = methodBody.slice(0, -1).trim();
                }
                
                // Inject response variable and helper functions at the beginning of method body
                var responseJson = JSON.stringify(responseObject);
                
                // Add view helper function
                var viewHelper = 'var view = function(viewName, selector, data) { return Framework.view(viewName, selector, data); }; ';
                
                // Add compact helper function
                var compactHelper = 'var compact = function() { var varNames = Array.prototype.slice.call(arguments); var result = {}; for (var i = 0; i < varNames.length; i++) { var name = varNames[i]; try { result[name] = eval(name); } catch(e) {} } return result; }; ';
                
                // Add $target helper if event exists
                var targetHelper = '';
                if (args && args[0] && args[0].currentTarget) {
                    targetHelper = 'var $target = $(arguments[0].currentTarget || arguments[0]); ';
                }
                
                var injectedBody = 'var response = ' + responseJson + '; ' + 
                                  viewHelper + 
                                  compactHelper + 
                                  targetHelper + 
                                  methodBody;
                
                // Create new function with response in scope
                var wrappedMethod = new Function('e', 'data', injectedBody);
                return wrappedMethod.apply(context, args);
            }
            
            // If extraction fails completely, just call the method (response won't be available)
            return originalMethod.apply(context, args);
        }
    }

    // Register Response class in Framework
    if (typeof Framework !== 'undefined') {
        Framework.Response = Response;
    }

    // Make Response globally available
    if (typeof window !== 'undefined') {
        window.Response = Response;
    }

    // Export for module systems (if needed)
    if (typeof module !== 'undefined' && module.exports) {
        module.exports = Response;
    }
})();

