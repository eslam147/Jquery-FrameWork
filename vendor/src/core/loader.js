/**
 * Loader Module - Auto-load Requests and modules
 * Usage: Framework.use('Auth/LoginRequest');
 */
(function(Framework) {
    'use strict';

    var Loader = {
        /**
         * Load Request class
         * Usage: Framework.use('Auth/LoginRequest');
         * Usage: Framework.use('requests/Auth/LoginRequest');
         */
        use: function(path) {
            // Normalize path
            path = path.replace(/\.js$/, ''); // Remove .js if present
            
            // Determine if it's a controller or request
            var isController = path.indexOf('Controller') !== -1 || path.indexOf('controllers/') === 0 || path.indexOf('app/Http/controllers/') === 0 || path.indexOf('Http/controllers/') === 0;
            var isRequest = path.indexOf('Request') !== -1 || path.indexOf('requests/') === 0 || path.indexOf('app/Http/requests/') === 0 || path.indexOf('Http/requests/') === 0;
            
            // Auto-detect path type
            if (!isController && !isRequest) {
                // Try to detect by checking if path contains known patterns
                if (path.indexOf('Controller') !== -1) {
                    isController = true;
                } else {
                    // Default to requests for backward compatibility
                    isRequest = true;
                }
            }
            
            // Build full path
            if (isController) {
                if (path.indexOf('Http/controllers/') !== 0 && path.indexOf('app/Http/controllers/') !== 0 && path.indexOf('controllers/') !== 0) {
                    path = 'app/Http/controllers/' + path;
                } else if (path.indexOf('controllers/') === 0) {
                    path = 'app/Http/' + path;
                }
            } else if (isRequest) {
                if (path.indexOf('Http/requests/') !== 0 && path.indexOf('app/Http/requests/') !== 0 && path.indexOf('requests/') !== 0) {
                    path = 'app/Http/requests/' + path;
                } else if (path.indexOf('requests/') === 0) {
                    path = 'app/Http/' + path;
                }
            }
            
            // Convert path to file path
            var filePath = path + '.js';
            
            // Check if already loaded
            if (this.loaded[filePath]) {
                return this.loaded[filePath];
            }
            
            // Try to load synchronously (for browser)
            // In browser, we need to load via script tag
            if (typeof require !== 'undefined' && require.sync) {
                // Node.js environment
                try {
                    var Class = require('./' + filePath);
                    this.loaded[filePath] = Class;
                    return Class;
                } catch (e) {
                    console.error('Failed to load:', filePath, e);
                    return null;
                }
            } else {
                // Browser environment - mark as should be loaded
                // Note: In browser, files should be loaded via script tags
                // This function just returns the expected class name
                var className = this.getClassNameFromPath(path);
                
                if (Framework[className]) {
                    this.loaded[filePath] = Framework[className];
                    return Framework[className];
                } else {
                    console.warn('Class not found:', className, '- Make sure the file is loaded via script tag');
                    return null;
                }
            }
        },

        /**
         * Get class name from path
         */
        getClassNameFromPath: function(path) {
            var parts = path.split('/');
            return parts[parts.length - 1];
        },

        /**
         * Loaded modules cache
         */
        loaded: {},

        /**
         * Require helper - similar to Laravel's use
         * Usage: var LoginRequest = Framework.require('Auth/LoginRequest');
         */
        require: function(path) {
            return this.use(path);
        }
    };

    // Add use method to Framework
    Framework.use = function(path) {
        return Loader.use(path);
    };

    Framework.require = function(path) {
        return Loader.require(path);
    };

    // Register loader
    Framework.loader = Loader;

})(window.Framework || {});

