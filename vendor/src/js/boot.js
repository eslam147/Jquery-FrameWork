/**
 * Boot.js - Single file to load all framework files
 * This file loads all framework files dynamically in the correct order
 * Usage: Just include this file instead of multiple script tags
 */

(function() {
    'use strict';
    
    // Get base path from current script
    var scripts = document.getElementsByTagName('script');
    var currentScript = scripts[scripts.length - 1];
    var scriptSrc = currentScript.src || currentScript.getAttribute('src');
    var basePath = '';
    
    if (scriptSrc) {
        // boot.js is in vendor/src/js/, so we need to go up to project root
        var scriptPath = scriptSrc.substring(0, scriptSrc.lastIndexOf('/'));
        // Remove /vendor/src/js to get to project root, then add /app/
        basePath = scriptPath.replace(/\/vendor\/src\/js$/, '') + '/app/';
    } else {
        // Fallback: try to get from document location
        var path = window.location.pathname;
        basePath = path.substring(0, path.lastIndexOf('/') + 1) + 'app/';
    }
    
    // Configuration - All files to load in order
    var files = [
        // jQuery (CDN)
        'https://code.jquery.com/jquery-3.6.0.min.js',
        // Core (in vendor/src/core, relative to app/)
        '../vendor/src/core/framework.js',
        '../vendor/src/core/cache.js',
        '../vendor/src/core/logger.js',
        '../vendor/src/core/performance.js',
        '../vendor/src/core/lazy-loader.js',
        '../vendor/src/core/cleanup.js',
        '../vendor/src/core/view.js',
        '../vendor/src/core/loader.js',
        '../vendor/src/core/requests.js',
        // Config (in vendor/src/js, relative to app/)
        '../vendor/src/js/config.js',
        // Modules (in vendor/src/modules, relative to app/)
        '../vendor/src/modules/dom.js',
        '../vendor/src/modules/form.js',
        '../vendor/src/modules/events.js',
        '../vendor/src/modules/validation.js',
        '../vendor/src/modules/response.js',
        '../vendor/src/modules/route.js',
        '../vendor/src/modules/ajax.js',
        '../vendor/src/modules/storage.js',
        '../vendor/src/modules/utils.js',
        '../vendor/src/modules/cookie.js',
        '../vendor/src/modules/translation.js',
        // Translations (lang files) - must load before html-translator
        '../lang/ar/validation.js',
        '../lang/en/validation.js',
        '../lang/ar/messages.js',
        '../lang/en/messages.js',
        '../vendor/src/modules/html-translator.js',
        // Requests (vendor/src/requests for FormRequest, app/Http/requests for UserRequest)
        '../vendor/src/requests/FormRequest.js',
        'Http/requests/UserRequest.js',
        // Controllers (vendor/src/controllers for Controller, app/Http/controllers for others)
        '../vendor/src/controllers/Controller.js',
        'Http/controllers/ButtonController.js',
        'Http/controllers/FormController.js',
        'Http/controllers/AjaxGetController.js',
        'Http/controllers/AjaxPostController.js',
        'Http/controllers/LanguageController.js',
        // Routes (must load after controllers)
        '../routes/web.js',
        // Start (in vendor/src/js, relative to app/)
        '../vendor/src/js/start.js'
    ];
    
    /**
     * Preprocess Laravel-like syntax
     * Converts: public function, protected function, private function
     * Converts: Ajax::method() to Ajax.method()
     * Auto-registers classes to Framework
     */
    function preprocessCode(code, filePath) {
        // Convert ::class to Framework.ClassName (Laravel-like class reference)
        // Match patterns like: ControllerName::class
        // Examples: AjaxGetController::class → Framework.AjaxGetController
        // But only if it's in an array context like [ControllerName::class, 'method']
        // First, handle array context: [ControllerName::class, 'method'] → [Framework.ControllerName, 'method']
        code = code.replace(/\[\s*(\w+)::class\s*,/g, '[Framework.$1,');
        // Then handle standalone: ControllerName::class → Framework.ControllerName
        code = code.replace(/(\w+)::class/g, 'Framework.$1');
        
        // Convert -> to . (Laravel-like object property access)
        // Match patterns like: response->data, response->response, etc.
        // Examples: response->data → response.data, response->response → response.response
        code = code.replace(/(\w+)->(\w+)/g, '$1.$2');
        
        // Convert :: to . (Laravel-like static method calls)
        // Match patterns like: Ajax::get, Framework.Ajax::get, Route::get, etc.
        // This regex matches: identifier(s)::methodName(
        // Examples: Ajax::get(, Framework.Ajax::post(, Route::get(
        code = code.replace(/(\w+(?:\.\w+)*)::(\w+)\s*\(/g, '$1.$2(');
        
        // Check if this is a translation file (lang folder)
        var isTranslationFile = filePath.indexOf('/lang/') !== -1 || filePath.indexOf('\\lang\\') !== -1;
        if (isTranslationFile) {
            // Extract locale and file name from path
            var langMatch = filePath.match(/[\/\\]lang[\/\\]([^\/\\]+)[\/\\]([^\/\\]+)\.js/);
            if (langMatch) {
                var locale = langMatch[1];
                var fileName = langMatch[2].replace('.js', '');
                
                // Check if code contains return { or just {
                var trimmedCode = code.trim();
                var hasReturn = /return\s*\{/.test(trimmedCode);
                var hasObject = /\{/.test(trimmedCode);
                
                if (hasReturn || hasObject) {
                    // Remove comments at the beginning
                    var objectCode = trimmedCode.replace(/^\/\*\*[\s\S]*?\*\/\s*/g, '');
                    objectCode = objectCode.replace(/^\/\/.*?\n/gm, '');
                    objectCode = objectCode.trim();
                    
                    // Remove return statement if exists
                    if (hasReturn) {
                        objectCode = objectCode.replace(/^\s*return\s*/m, '');
                        objectCode = objectCode.trim();
                    }
                    
                    // Find the object (first { to last })
                    var firstBrace = objectCode.indexOf('{');
                    var lastBrace = objectCode.lastIndexOf('}');
                    
                    if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
                        objectCode = objectCode.substring(firstBrace, lastBrace + 1);
                    }
                    
                    // Remove any trailing semicolon
                    objectCode = objectCode.replace(/;\s*$/, '');
                    objectCode = objectCode.trim();
                    
                    // Wrap in Framework.translations registration
                    var wrappedCode = '(function(Framework) {\n';
                    wrappedCode += '    \'use strict\';\n';
                    wrappedCode += '    if (!Framework.translations) Framework.translations = {};\n';
                    wrappedCode += '    if (!Framework.translations.' + locale + ') Framework.translations.' + locale + ' = {};\n';
                    wrappedCode += '    Framework.translations.' + locale + '.' + fileName + ' = ' + objectCode + ';\n';
                    wrappedCode += '})(window.Framework || {});\n';
                    return wrappedCode;
                }
            }
        }
        
        // Check if this is a class file that needs preprocessing
        var isClassFile = /class\s+\w+\s+extends/.test(code);
        var needsPreprocess = /(public|protected|private)\s+function/.test(code);
        
        if (!isClassFile || !needsPreprocess) {
            return code;
        }
        
        // Extract class name and check if it's a Controller BEFORE converting public function
        var classNameMatch = code.match(/class\s+(\w+)\s+extends/);
        if (!classNameMatch) {
            return code;
        }
        var className = classNameMatch[1];
        var isController = /extends\s+Controller/.test(code);
        
        // Convert public function method() to method()
        code = code.replace(/public\s+function\s+(\w+)\s*\(/g, '$1(');
        
        // Convert protected function method() to _method()
        code = code.replace(/protected\s+function\s+(\w+)\s*\(/g, '_$1(');
        
        // Convert private function method() to #method()
        code = code.replace(/private\s+function\s+(\w+)\s*\(/g, '#$1(');
        
        // Remove IIFE wrapper if exists (more robust pattern)
        // Match: (function(Framework) { ... 'use strict'; ... class ... ... })(window.Framework || {});
        var iifePattern = /^\s*\(function\s*\([^)]*\)\s*\{[\s\S]*?'use strict';\s*[\s\S]*?class[\s\S]*?\}\s*\)\s*\([^)]*\)\s*;\s*$/m;
        if (iifePattern.test(code)) {
            // Extract the class content
            var classMatch = code.match(/class\s+[\s\S]*?\}(?:\s*\)\s*\([^)]*\)\s*;)?\s*$/m);
            if (classMatch) {
                code = classMatch[0].replace(/\s*\)\s*\([^)]*\)\s*;\s*$/, '');
            }
        }
        
        // Remove any remaining IIFE wrapper patterns
        code = code.replace(/^\s*\(function\s*\([^)]*\)\s*\{[\s\S]*?'use strict';\s*/m, '');
        code = code.replace(/^\s*\(function\s*\([^)]*\)\s*\{[\s\S]*?"use strict";\s*/m, '');
        code = code.replace(/\}\s*\)\s*\([^)]*\)\s*;\s*$/m, '');
        
        // Trim whitespace
        code = code.trim();
        
        // For Controllers, we need to use Controller.extend() pattern
        if (isController) {
            // Find the opening brace of the class
            var classStartMatch = code.match(/class\s+\w+\s+extends\s+Controller\s*\{/);
            if (classStartMatch) {
                var classStartIndex = classStartMatch.index + classStartMatch[0].length;
                
                // Find matching closing brace
                var braceCount = 1;
                var classEndIndex = classStartIndex;
                for (var i = classStartIndex; i < code.length && braceCount > 0; i++) {
                    if (code[i] === '{') braceCount++;
                    if (code[i] === '}') braceCount--;
                    if (braceCount === 0) {
                        classEndIndex = i;
                        break;
                    }
                }
                
                // Extract class body
                var classBody = code.substring(classStartIndex, classEndIndex);
                
                // Wrap class with Controller.extend() using anonymous class
                code = '(function(Framework) {\n';
                code += '    var Controller = Framework.Controller || Framework.BaseController;\n';
                code += '    var ' + className + 'Class = class {\n';
                code += classBody;
                code += '    };\n';
                code += '    var ' + className + ' = Controller.extend(' + className + 'Class);\n';
                code += '    Framework.' + className + ' = ' + className + ';\n';
                code += '})(window.Framework || {});\n';
            } else {
                // Fallback: just register normally (shouldn't happen)
                if (!code.match(/Framework\.\w+\s*=\s*\w+;/)) {
                    code += '\n\n// Auto-register Controller class\n';
                    code += '(function(Framework) {\n';
                    code += '    if (typeof Framework === \'undefined\') Framework = window.Framework || {};\n';
                    code += '    var Controller = Framework.Controller || Framework.BaseController;\n';
                    code += '    Framework.' + className + ' = Controller.extend(' + className + ');\n';
                    code += '})(window.Framework || {});\n';
                }
            }
        } else {
            // For non-Controllers (like Requests), just register normally
            if (!code.match(/Framework\.\w+\s*=\s*\w+;/)) {
                // Add registration at the end
                code += '\n\n// Auto-register class\n';
                code += '(function(Framework) {\n';
                code += '    if (typeof Framework === \'undefined\') Framework = window.Framework || {};\n';
                code += '    Framework.' + className + ' = ' + className + ';\n';
                code += '})(window.Framework || {});\n';
            }
        }
        
        return code;
    }
    
    /**
     * Load script dynamically with preprocessing support
     */
    function loadScript(src, callback) {
        // Check if src is absolute URL (starts with http:// or https://)
        var isAbsoluteUrl = src.indexOf('http://') === 0 || src.indexOf('https://') === 0 || src.indexOf('//') === 0;
        // Check if src is relative path starting with ../ (for vendor files)
        var isRelativePath = src.indexOf('../') === 0;
        var fullPath;
        if (isAbsoluteUrl) {
            fullPath = src;
        } else if (isRelativePath) {
            // For relative paths like ../vendor/src/js/config.js
            // basePath is app/, so project root is one level up
            // Remove ../ from the path and build from project root
            var projectRoot = basePath.replace(/\/app\/$/, '');
            // Remove leading ../ from src
            var cleanPath = src.replace(/^\.\.\//, '');
            // Build full path from project root
            fullPath = projectRoot + '/' + cleanPath;
        } else {
            fullPath = basePath + src;
        }
        
        // Check if file needs preprocessing (app files, lang files, not vendor or CDN)
        var needsPreprocess = !isAbsoluteUrl && (
            src.indexOf('Http/') !== -1 || 
            src.indexOf('app/') !== -1 || 
            src.indexOf('lang/') !== -1 ||
            src.indexOf('routes/') !== -1
        );
        
        if (needsPreprocess) {
            // Check cache first (if available)
            var cachedCode = null;
            if (typeof Framework !== 'undefined' && Framework.cache) {
                cachedCode = Framework.cache.get(fullPath, 'code');
            }
            
            if (cachedCode) {
                // Use cached code
                var script = document.createElement('script');
                script.textContent = cachedCode;
                script.async = false;
                script.defer = false;
                document.head.appendChild(script);
                if (callback) callback();
                return;
            }
            
            // Load file content, preprocess, then execute
            fetch(fullPath)
                .then(function(response) {
                    if (!response.ok) {
                        throw new Error('Failed to load: ' + fullPath);
                    }
                    return response.text();
                })
                .then(function(code) {
                    // Preprocess code
                    var processedCode = preprocessCode(code, fullPath);
                    
                    // Cache processed code (if cache available)
                    if (typeof Framework !== 'undefined' && Framework.cache) {
                        Framework.cache.set(fullPath, processedCode, 'code');
                    }
                    
                    // Execute processed code
                    var script = document.createElement('script');
                    script.textContent = processedCode;
                    script.async = false;
                    script.defer = false;
                    
                    var loaded = false;
                    script.onload = script.onreadystatechange = function() {
                        if (!loaded && (!this.readyState || this.readyState === 'loaded' || this.readyState === 'complete')) {
                            loaded = true;
                            if (callback) callback();
                        }
                    };
                    
                    script.onerror = function(e) {
                        console.error('Error executing script:', fullPath, e);
                        if (callback) callback();
                    };
                    
                    // Append and execute
                    (document.body || document.getElementsByTagName('body')[0] || document.documentElement).appendChild(script);
                    
                    // Call callback immediately since script is already executed
                    if (callback) callback();
                })
                .catch(function(error) {
                    console.warn('Failed to load:', fullPath, error);
                    if (callback) callback(); // Continue even if file fails
                });
        } else {
            // Normal script loading for vendor files and CDN
            var script = document.createElement('script');
        script.src = fullPath;
        script.async = false; // Load synchronously
        script.defer = false;
        
        var loaded = false;
        script.onload = script.onreadystatechange = function() {
            if (!loaded && (!this.readyState || this.readyState === 'loaded' || this.readyState === 'complete')) {
                loaded = true;
                if (callback) callback();
            }
        };
        
        script.onerror = function() {
            console.warn('Failed to load:', fullPath);
            if (callback) callback(); // Continue even if file fails
        };
        
        // Append to body instead of head
        // Since boot.js is loaded at the end of body, body should always exist
        (document.body || document.getElementsByTagName('body')[0] || document.documentElement).appendChild(script);
        }
    }
    
    /**
     * Load all scripts in sequence
     */
    function loadAll(index) {
        if (index >= files.length) {
            // All files loaded
            return;
        }
        
        var filePath = basePath + files[index];
        
        loadScript(files[index], function() {
            loadAll(index + 1);
        });
    }
    
    // Start loading
    loadAll(0);
    
})();

