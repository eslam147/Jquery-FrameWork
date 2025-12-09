/**
 * Lazy Loader Module - For lazy loading controllers and modules
 * Improves initial load time in large projects
 */

(function(Framework) {
    'use strict';

    var LazyLoader = {
        /**
         * Loaded modules cache
         */
        loaded: {},

        /**
         * Loading promises cache
         */
        loading: {},

        /**
         * Load a controller lazily
         * @param {string} controllerPath - Path to controller file
         * @returns {Promise} Promise that resolves when controller is loaded
         */
        loadController: function(controllerPath) {
            // Check if already loaded
            if (this.loaded[controllerPath]) {
                return Promise.resolve(this.loaded[controllerPath]);
            }

            // Check if currently loading
            if (this.loading[controllerPath]) {
                return this.loading[controllerPath];
            }

            // Start loading
            var loadPromise = this._loadScript(controllerPath).then(function() {
                LazyLoader.loaded[controllerPath] = true;
                delete LazyLoader.loading[controllerPath];
                return true;
            }).catch(function(error) {
                delete LazyLoader.loading[controllerPath];
                throw error;
            });

            this.loading[controllerPath] = loadPromise;
            return loadPromise;
        },

        /**
         * Load multiple controllers in parallel
         * @param {Array<string>} controllerPaths - Array of controller paths
         * @returns {Promise} Promise that resolves when all controllers are loaded
         */
        loadControllers: function(controllerPaths) {
            var promises = controllerPaths.map(function(path) {
                return LazyLoader.loadController(path);
            });
            return Promise.all(promises);
        },

        /**
         * Load script dynamically
         * @param {string} src - Script source path
         * @returns {Promise} Promise that resolves when script is loaded
         */
        _loadScript: function(src) {
            return new Promise(function(resolve, reject) {
                // Check if script already exists
                var existingScript = document.querySelector('script[src="' + src + '"]');
                if (existingScript) {
                    resolve();
                    return;
                }

                var script = document.createElement('script');
                script.src = src;
                script.async = true;
                
                script.onload = function() {
                    resolve();
                };
                
                script.onerror = function() {
                    reject(new Error('Failed to load script: ' + src));
                };
                
                document.head.appendChild(script);
            });
        },

        /**
         * Preload controllers (for critical controllers)
         * @param {Array<string>} controllerPaths - Array of controller paths to preload
         */
        preload: function(controllerPaths) {
            // Use requestIdleCallback if available, otherwise setTimeout
            var schedule = window.requestIdleCallback || function(callback) {
                setTimeout(callback, 1);
            };

            schedule(function() {
                LazyLoader.loadControllers(controllerPaths);
            });
        }
    };

    // Register module
    Framework.lazyLoader = LazyLoader;
    Framework.register('lazyLoader', LazyLoader);

})(window.Framework || {});

