/**
 * Cleanup Module - Memory management and cleanup for large projects
 * Prevents memory leaks by cleaning up event listeners and references
 */

(function(Framework) {
    'use strict';

    var Cleanup = {
        /**
         * Registered cleanup functions
         */
        cleanupFunctions: [],

        /**
         * Register a cleanup function
         * @param {Function} cleanupFn - Cleanup function to call
         */
        register: function(cleanupFn) {
            if (typeof cleanupFn === 'function') {
                this.cleanupFunctions.push(cleanupFn);
            }
        },

        /**
         * Execute all cleanup functions
         */
        cleanup: function() {
            for (var i = 0; i < this.cleanupFunctions.length; i++) {
                try {
                    this.cleanupFunctions[i]();
                } catch (e) {
                    if (typeof Framework !== 'undefined' && Framework.logger) {
                        Framework.logger.error('Cleanup error', e);
                    }
                }
            }
            this.cleanupFunctions = [];
        },

        /**
         * Cleanup event listeners from element
         * @param {jQuery|HTMLElement} element - Element to cleanup
         */
        cleanupElement: function(element) {
            var $el = $(element);
            if ($el.length) {
                // Remove all event listeners
                $el.off();
                // Remove data
                $el.removeData();
            }
        },

        /**
         * Cleanup controller instance
         * @param {object} controllerInstance - Controller instance to cleanup
         */
        cleanupController: function(controllerInstance) {
            if (!controllerInstance) return;
            
            // Remove event listeners
            if (controllerInstance._eventHandlers) {
                for (var i = 0; i < controllerInstance._eventHandlers.length; i++) {
                    var handler = controllerInstance._eventHandlers[i];
                    if (handler && handler.element && handler.event && handler.fn) {
                        $(handler.element).off(handler.event, handler.fn);
                    }
                }
                controllerInstance._eventHandlers = [];
            }
            
            // Clear references
            controllerInstance._currentRequest = null;
        }
    };

    // Register cleanup on page unload
    if (typeof window !== 'undefined') {
        window.addEventListener('beforeunload', function() {
            Cleanup.cleanup();
        });
    }

    // Register module
    Framework.cleanup = Cleanup;
    Framework.register('cleanup', Cleanup);

})(window.Framework || {});

