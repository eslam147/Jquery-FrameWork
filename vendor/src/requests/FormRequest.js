/**
 * FormRequest - Base Request Class
 * Base class for all form requests
 */

(function(Framework) {
    'use strict';

    /**
     * FormRequest - Base class
     * This is just an alias to Framework.validation.FormRequest
     * for consistency with Laravel-like structure
     */
    if (!Framework.FormRequest) {
        Framework.FormRequest = Framework.validation.FormRequest;
    }
    
    // Make FormRequest available globally (Laravel-like)
    if (!window.FormRequest) {
        window.FormRequest = Framework.FormRequest;
    }

})(window.Framework || {});

