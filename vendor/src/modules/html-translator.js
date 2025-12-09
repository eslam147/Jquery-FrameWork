/**
 * HTML Translator Module - Process translation directives in HTML
 * Supports: {{ trans('key') }}, {{ __('key') }}, {{ @lang('key') }}
 */

(function(Framework) {
    'use strict';

    var HTMLTranslator = {
        /**
         * Process HTML content and replace translation directives
         * @param {string} html - HTML content
         * @returns {string} - Processed HTML with translations
         */
        process: function(html) {
            if (!html || typeof html !== 'string') {
                return html;
            }

            var self = this;
            var transFunc = Framework.trans || window.trans || Framework.__ || window.__ || Framework['@lang'] || window['@lang'];
            
            if (!transFunc) {
                return html; // No translation function available
            }

            // Pattern to match: {{ trans('key') }}, {{ __('key') }}, {{ @lang('key') }}, {{ trans('key', {param: 'value'}) }}
            // Supports single quotes, double quotes, and optional parameters
            // More robust pattern that handles nested quotes and objects
            var pattern = /\{\{\s*(trans|__|@lang|lang)\s*\(\s*['"]([^'"]+)['"]\s*(?:,\s*(\{[^}]*\}))?\s*\)\s*\}\}/g;
            
            var processedHtml = html.replace(pattern, function(match, funcName, key, paramsStr) {
                try {
                    var params = {};
                    if (paramsStr && paramsStr.trim()) {
                        // Parse parameters object (simple parsing for {key: 'value'} format)
                        try {
                            // Remove outer braces and parse
                            var cleanParams = paramsStr.trim();
                            if (cleanParams.startsWith('{') && cleanParams.endsWith('}')) {
                                cleanParams = cleanParams.slice(1, -1).trim();
                            }
                            
                            if (cleanParams) {
                                // Split by comma (but be careful with nested objects)
                                var pairs = cleanParams.split(',');
                                for (var i = 0; i < pairs.length; i++) {
                                    var pair = pairs[i].trim();
                                    if (pair) {
                                        var colonIndex = pair.indexOf(':');
                                        if (colonIndex > 0) {
                                            var paramKey = pair.substring(0, colonIndex).trim();
                                            var paramValue = pair.substring(colonIndex + 1).trim();
                                            
                                            // Remove quotes from key and value
                                            paramKey = paramKey.replace(/^['"]|['"]$/g, '');
                                            paramValue = paramValue.replace(/^['"]|['"]$/g, '');
                                            
                                            params[paramKey] = paramValue;
                                        }
                                    }
                                }
                            }
                        } catch (e) {
                            // If parsing fails, use empty params
                        }
                    }
                    
                    // Call translation function
                    var translated = transFunc(key, params);
                    
                    // Return translated value or original key if translation not found
                    return translated && translated !== key ? translated : key;
                } catch (e) {
                    // If translation fails, return the key
                    return key;
                }
            });
            
            return processedHtml;
        },

        /**
         * Process current page HTML
         */
        processPage: function() {
            var transFunc = Framework.trans || window.trans || Framework.__ || window.__ || Framework['@lang'] || window['@lang'];
            if (!transFunc) {
                return; // No translation function available
            }
            
            // Process all text nodes in the document
            var walker = document.createTreeWalker(
                document.body,
                NodeFilter.SHOW_TEXT,
                {
                    acceptNode: function(node) {
                        // Skip script and style tags
                        var parent = node.parentNode;
                        if (parent && (parent.tagName === 'SCRIPT' || parent.tagName === 'STYLE')) {
                            return NodeFilter.FILTER_REJECT;
                        }
                        return NodeFilter.FILTER_ACCEPT;
                    }
                },
                false
            );
            
            var textNodes = [];
            var node;
            while (node = walker.nextNode()) {
                textNodes.push(node);
            }
            
            // Process each text node
            for (var i = 0; i < textNodes.length; i++) {
                var textNode = textNodes[i];
                var originalText = textNode.textContent;
                
                // Check if text contains translation directives
                if (originalText.indexOf('{{') !== -1 && originalText.indexOf('}}') !== -1) {
                    var processedText = this.process(originalText);
                    if (processedText !== originalText) {
                        textNode.textContent = processedText;
                    }
                }
            }
            
            // Process title tag
            var titleElement = document.querySelector('title');
            if (titleElement) {
                var titleText = titleElement.textContent;
                if (titleText && titleText.indexOf('{{') !== -1 && titleText.indexOf('}}') !== -1) {
                    var processedTitle = this.process(titleText);
                    if (processedTitle !== titleText) {
                        titleElement.textContent = processedTitle;
                    }
                }
            }
            
            // Process attributes (title, placeholder, alt, aria-label, data-*, etc.)
            var allElements = document.querySelectorAll('*');
            for (var j = 0; j < allElements.length; j++) {
                var element = allElements[j];
                
                // Process all attributes
                if (element.attributes && element.attributes.length > 0) {
                    for (var k = 0; k < element.attributes.length; k++) {
                        var attr = element.attributes[k];
                        var attrValue = attr.value;
                        
                        // Check if attribute value contains translation directives
                        if (attrValue && typeof attrValue === 'string' && attrValue.indexOf('{{') !== -1 && attrValue.indexOf('}}') !== -1) {
                            var processedValue = this.process(attrValue);
                            if (processedValue !== attrValue) {
                                element.setAttribute(attr.name, processedValue);
                            }
                        }
                    }
                }
            }
        }
    };

    // Register module
    Framework.htmlTranslator = HTMLTranslator;
    Framework.register('htmlTranslator', HTMLTranslator);

    // Auto-process page immediately using MutationObserver to catch elements as they're added
    // This prevents any flash of untranslated content
    var observer = null;
    var processedElements = new WeakSet();
    
    function processElement(element) {
        if (!element || processedElements.has(element)) {
            return;
        }
        
        var transFunc = Framework.trans || window.trans || Framework.__ || window.__ || Framework['@lang'] || window['@lang'];
        if (!transFunc) {
            return; // Translation not ready yet
        }
        
        processedElements.add(element);
        
        // Process text nodes
        var walker = document.createTreeWalker(
            element,
            NodeFilter.SHOW_TEXT,
            {
                acceptNode: function(node) {
                    var parent = node.parentNode;
                    if (parent && (parent.tagName === 'SCRIPT' || parent.tagName === 'STYLE')) {
                        return NodeFilter.FILTER_REJECT;
                    }
                    return NodeFilter.FILTER_ACCEPT;
                }
            },
            false
        );
        
        var textNodes = [];
        var node;
        while (node = walker.nextNode()) {
            textNodes.push(node);
        }
        
        for (var i = 0; i < textNodes.length; i++) {
            var textNode = textNodes[i];
            var originalText = textNode.textContent;
            if (originalText && originalText.indexOf('{{') !== -1 && originalText.indexOf('}}') !== -1) {
                var processedText = HTMLTranslator.process(originalText);
                if (processedText !== originalText) {
                    textNode.textContent = processedText;
                }
            }
        }
        
        // Process attributes
        if (element.attributes && element.attributes.length > 0) {
            for (var j = 0; j < element.attributes.length; j++) {
                var attr = element.attributes[j];
                var attrValue = attr.value;
                if (attrValue && typeof attrValue === 'string' && attrValue.indexOf('{{') !== -1 && attrValue.indexOf('}}') !== -1) {
                    var processedValue = HTMLTranslator.process(attrValue);
                    if (processedValue !== attrValue) {
                        element.setAttribute(attr.name, processedValue);
                    }
                }
            }
        }
        
        // Process title if it's a title element
        if (element.tagName === 'TITLE') {
            var titleText = element.textContent;
            if (titleText && titleText.indexOf('{{') !== -1 && titleText.indexOf('}}') !== -1) {
                var processedTitle = HTMLTranslator.process(titleText);
                if (processedTitle !== titleText) {
                    element.textContent = processedTitle;
                }
            }
        }
    }
    
    function startObserving() {
        var transFunc = Framework.trans || window.trans || Framework.__ || window.__ || Framework['@lang'] || window['@lang'];
        if (!transFunc) {
            // Translation not ready - use requestAnimationFrame for immediate retry
            if (typeof requestAnimationFrame !== 'undefined') {
                requestAnimationFrame(startObserving);
            } else {
                // Fallback: check on next event loop tick
                if (document.readyState === 'loading') {
                    document.addEventListener('DOMContentLoaded', startObserving);
                } else {
                    // Use immediate function if available, otherwise sync check
                    if (typeof setImmediate !== 'undefined') {
                        setImmediate(startObserving);
                    } else {
                        // Last resort: sync check in a loop (but limit iterations)
                        var attempts = 0;
                        function checkSync() {
                            if (attempts++ < 100 && !transFunc) {
                                transFunc = Framework.trans || window.trans || Framework.__ || window.__ || Framework['@lang'] || window['@lang'];
                                if (!transFunc) {
                                    checkSync();
                                    return;
                                }
                            }
                            if (transFunc) startObserving();
                        }
                        checkSync();
                    }
                }
            }
            return;
        }
        
        // Remove hide style first
        var hideStyle = document.getElementById('html-translator-hide-style');
        if (hideStyle) hideStyle.remove();
        
        // Set HTML lang and dir attributes based on current locale
        var currentLocale = Framework.getLocale ? Framework.getLocale() : 'en';
        if (document.documentElement) {
            document.documentElement.setAttribute('lang', currentLocale);
            document.documentElement.setAttribute('dir', currentLocale === 'ar' ? 'rtl' : 'ltr');
        }
        
        // Process existing elements immediately
        if (document.body) {
            processElement(document.body);
            // Show body after processing
            document.body.style.visibility = 'visible';
            document.body.style.opacity = '1';
        }
        if (document.head) {
            var title = document.querySelector('title');
            if (title) processElement(title);
        }
        
        // Show all elements
        var allElements = document.querySelectorAll('*');
        for (var k = 0; k < allElements.length; k++) {
            var el = allElements[k];
            if (el.tagName !== 'SCRIPT' && el.tagName !== 'STYLE') {
                el.style.visibility = 'visible';
                el.style.opacity = '1';
            }
        }
        
        // Set up MutationObserver to catch new elements
        observer = new MutationObserver(function(mutations) {
            mutations.forEach(function(mutation) {
                if (mutation.type === 'childList') {
                    mutation.addedNodes.forEach(function(node) {
                        if (node.nodeType === 1) { // Element node
                            processElement(node);
                            // Also process children
                            var children = node.querySelectorAll ? node.querySelectorAll('*') : [];
                            for (var i = 0; i < children.length; i++) {
                                processElement(children[i]);
                            }
                        } else if (node.nodeType === 3) { // Text node
                            var parent = node.parentNode;
                            if (parent) processElement(parent);
                        }
                    });
                } else if (mutation.type === 'attributes') {
                    processElement(mutation.target);
                }
            });
        });
        
        // Observe the entire document
        observer.observe(document.documentElement, {
            childList: true,
            subtree: true,
            attributes: true,
            attributeFilter: ['title', 'placeholder', 'alt', 'aria-label']
        });
        
        // Process page once more immediately to catch anything missed
        HTMLTranslator.processPage();
    }
    
    // Start observing immediately
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', startObserving);
    } else {
        startObserving();
    }

})(window.Framework || {});

