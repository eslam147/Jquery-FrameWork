/**
 * Requests Manager - تنظيم الـ Requests
 * 
 * هذا الملف ينظم الـ Requests ويجعلها متاحة تلقائياً
 * لا حاجة لكتابة use statements - النظام يعمل تلقائياً
 */

(function(Framework) {
    'use strict';

    /**
     * Requests registry
     */
    Framework._requestsRegistry = {};

    /**
     * Get Request class by alias or name
     * @param {string} name - الاسم أو الـ alias
     * @returns {Function|null} Request class أو null
     */
    Framework.getRequest = function(name) {
        // Try registry first
        if (Framework._requestsRegistry[name]) {
            return Framework._requestsRegistry[name];
        }
        
        // Try Framework directly
        if (Framework[name]) {
            return Framework[name];
        }
        
        // Try with Request suffix
        if (Framework[name + 'Request']) {
            return Framework[name + 'Request'];
        }
        
        return null;
    };

    /**
     * Register all Request classes automatically
     * يتم استدعاء هذه الدالة تلقائياً عند تحميل الـ Requests
     */
    Framework.registerRequests = function() {
        // Auto-register all Request classes from Framework
        for (var key in Framework) {
            if (Framework.hasOwnProperty(key) && 
                typeof Framework[key] === 'function' && 
                key.indexOf('Request') !== -1 && 
                key !== 'FormRequest' && 
                key !== 'getRequest' && 
                key !== 'registerRequests') {
                Framework._requestsRegistry[key] = Framework[key];
            }
        }
        
        // Register common Request as 'request' for parameter matching
        if (Framework.UserRequest) {
            Framework._requestsRegistry['request'] = Framework.UserRequest;
        } else if (Framework.FormRequest) {
            Framework._requestsRegistry['request'] = Framework.FormRequest;
        }
    };
    
    // Auto-register on load
    if (typeof document !== 'undefined') {
        // Browser environment - wait for DOM ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', Framework.registerRequests);
        } else {
            Framework.registerRequests();
        }
    }

})(window.Framework || {});
