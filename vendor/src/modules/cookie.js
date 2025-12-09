/**
 * Cookie Module - Cookie handling utilities
 */
(function(Framework) {
    'use strict';

    var Cookie = {
        /**
         * Set cookie
         * Usage: Framework.cookie.set('name', 'value', 7); // 7 days
         */
        set: function(name, value, days) {
            var expires = '';
            if (days) {
                var date = new Date();
                date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
                expires = '; expires=' + date.toUTCString();
            }
            document.cookie = name + '=' + encodeURIComponent(value) + expires + '; path=/';
            return true;
        },

        /**
         * Get cookie
         * Usage: var value = Framework.cookie.get('name');
         */
        get: function(name) {
            var nameEQ = name + '=';
            var ca = document.cookie.split(';');
            for (var i = 0; i < ca.length; i++) {
                var c = ca[i];
                while (c.charAt(0) === ' ') {
                    c = c.substring(1, c.length);
                }
                if (c.indexOf(nameEQ) === 0) {
                    return decodeURIComponent(c.substring(nameEQ.length, c.length));
                }
            }
            return null;
        },

        /**
         * Remove cookie
         * Usage: Framework.cookie.remove('name');
         */
        remove: function(name) {
            document.cookie = name + '=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
            return true;
        },

        /**
         * Check if cookie exists
         * Usage: if (Framework.cookie.has('name')) { ... }
         */
        has: function(name) {
            return this.get(name) !== null;
        },

        /**
         * Get all cookies
         * Usage: var all = Framework.cookie.all();
         */
        all: function() {
            var cookies = {};
            var ca = document.cookie.split(';');
            for (var i = 0; i < ca.length; i++) {
                var c = ca[i].trim();
                if (c) {
                    var parts = c.split('=');
                    cookies[parts[0]] = decodeURIComponent(parts[1] || '');
                }
            }
            return cookies;
        }
    };

    // Register module
    Framework.register('cookie', Cookie);
    Framework.cookie = Cookie;

})(window.Framework || {});

