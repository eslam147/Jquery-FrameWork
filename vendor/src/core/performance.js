/**
 * Performance Module - Performance optimizations (debounce, throttle, etc.)
 * For large projects
 */

(function(Framework) {
    'use strict';

    var Performance = {
        /**
         * Debounce function - delays execution until after wait time
         * @param {Function} func - Function to debounce
         * @param {number} wait - Wait time in milliseconds
         * @param {boolean} immediate - Execute immediately on first call
         * @returns {Function} Debounced function
         */
        debounce: function(func, wait, immediate) {
            var timeout;
            return function() {
                var context = this;
                var args = arguments;
                var later = function() {
                    timeout = null;
                    if (!immediate) func.apply(context, args);
                };
                var callNow = immediate && !timeout;
                clearTimeout(timeout);
                timeout = setTimeout(later, wait);
                if (callNow) func.apply(context, args);
            };
        },

        /**
         * Throttle function - limits execution to once per wait time
         * @param {Function} func - Function to throttle
         * @param {number} wait - Wait time in milliseconds
         * @returns {Function} Throttled function
         */
        throttle: function(func, wait) {
            var timeout;
            var previous = 0;
            return function() {
                var context = this;
                var args = arguments;
                var now = Date.now();
                var remaining = wait - (now - previous);
                
                if (remaining <= 0 || remaining > wait) {
                    if (timeout) {
                        clearTimeout(timeout);
                        timeout = null;
                    }
                    previous = now;
                    func.apply(context, args);
                } else if (!timeout) {
                    timeout = setTimeout(function() {
                        previous = Date.now();
                        timeout = null;
                        func.apply(context, args);
                    }, remaining);
                }
            };
        },

        /**
         * Request Animation Frame wrapper
         * @param {Function} callback - Callback function
         * @returns {number} Request ID
         */
        requestAnimationFrame: function(callback) {
            if (window.requestAnimationFrame) {
                return window.requestAnimationFrame(callback);
            } else {
                return setTimeout(callback, 16); // ~60fps
            }
        },

        /**
         * Cancel Animation Frame wrapper
         * @param {number} id - Request ID
         */
        cancelAnimationFrame: function(id) {
            if (window.cancelAnimationFrame) {
                window.cancelAnimationFrame(id);
            } else {
                clearTimeout(id);
            }
        },

        /**
         * Batch DOM operations
         * @param {Function} callback - Callback function with DOM operations
         */
        batchDOM: function(callback) {
            // Use requestAnimationFrame for batching
            this.requestAnimationFrame(function() {
                callback();
            });
        }
    };

    // Register module
    Framework.performance = Performance;
    Framework.register('performance', Performance);

})(window.Framework || {});

