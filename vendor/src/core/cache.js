/**
 * Cache Module - For caching preprocessed code and translations
 * Improves performance in large projects
 */

(function(Framework) {
    'use strict';

    var Cache = {
        /**
         * Cache storage
         */
        storage: {},

        /**
         * Cache expiration times (in milliseconds)
         */
        expiration: {
            code: 24 * 60 * 60 * 1000, // 24 hours for preprocessed code
            translation: 60 * 60 * 1000, // 1 hour for translations
            route: 60 * 60 * 1000 // 1 hour for routes
        },

        /**
         * Get cached value
         * @param {string} key - Cache key
         * @param {string} type - Cache type (code, translation, route)
         * @returns {*} Cached value or null
         */
        get: function(key, type) {
            var cacheKey = type + ':' + key;
            var cached = this.storage[cacheKey];
            
            if (!cached) {
                return null;
            }
            
            // Check expiration
            var now = Date.now();
            var expiration = this.expiration[type] || this.expiration.code;
            
            if (cached.timestamp + expiration < now) {
                // Expired
                delete this.storage[cacheKey];
                return null;
            }
            
            return cached.value;
        },

        /**
         * Set cached value
         * @param {string} key - Cache key
         * @param {*} value - Value to cache
         * @param {string} type - Cache type (code, translation, route)
         */
        set: function(key, value, type) {
            var cacheKey = type + ':' + key;
            this.storage[cacheKey] = {
                value: value,
                timestamp: Date.now()
            };
        },

        /**
         * Clear cache
         * @param {string} type - Cache type (optional, clears all if not specified)
         */
        clear: function(type) {
            if (type) {
                // Clear specific type
                var prefix = type + ':';
                for (var key in this.storage) {
                    if (key.indexOf(prefix) === 0) {
                        delete this.storage[key];
                    }
                }
            } else {
                // Clear all
                this.storage = {};
            }
        },

        /**
         * Get cache size (for monitoring)
         * @returns {number} Number of cached items
         */
        size: function() {
            return Object.keys(this.storage).length;
        }
    };

    // Register module
    Framework.cache = Cache;
    Framework.register('cache', Cache);

})(window.Framework || {});

