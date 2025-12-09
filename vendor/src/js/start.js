/**
 * Start.js - Initialize all Controllers automatically
 * Usage: Include all scripts manually, then call Framework.boot()
 * Or use this file which will call boot() automatically when DOM is ready
 */

(function() {
    'use strict';
    
    /**
     * Initialize all Controllers when DOM is ready
     */
    function start() {
        // Wait for Framework to be available
        if (typeof window.Framework === 'undefined') {
            setTimeout(start, 50);
            return;
        }
        
        // Detect locale from: 1) cookie 'locale', 2) HTML lang attribute, 3) config, 4) default 'en'
        var detectedLocale = window.Framework.cookie.get('locale') ?? 'en'; // Default to English
        // 1. Try to get from cookie 'locale'
        if (window.Framework.cookie && typeof window.Framework.cookie.get === 'function') {
            var cookieLocale = window.Framework.cookie.get('locale');
            if (cookieLocale) {
                detectedLocale = cookieLocale;
            }
        }
        // 2. If no cookie, try HTML lang attribute
        if (detectedLocale === 'en') {
            var htmlLang = document.documentElement.getAttribute('lang');
            if (htmlLang) {
                // Check if it's Arabic (ar, ar-EG, ar-SA, etc.)
                if (htmlLang.toLowerCase().indexOf('ar') === 0) {
                    detectedLocale = 'ar';
                } else if (htmlLang.toLowerCase() === 'en' || htmlLang.toLowerCase().indexOf('en') === 0) {
                    detectedLocale = 'en';
                }
            }
        }
        // 3. Don't use config as fallback - keep default 'en' if no cookie and no HTML lang
        // Config is just for manual override, not automatic detection
        
        // Set the detected locale
        if (typeof window.Framework.setLocale === 'function') {
            window.Framework.setLocale(detectedLocale);
        }
        
        // Update HTML lang and dir attributes based on detected locale
        if (document.documentElement) {
            document.documentElement.setAttribute('lang', detectedLocale);
            if (detectedLocale === 'ar') {
                document.documentElement.setAttribute('dir', 'rtl');
            } else {
                document.documentElement.setAttribute('dir', 'ltr');
            }
        }
        
        // Call boot to initialize all Controllers
        if (typeof window.Framework.boot === 'function') {
            window.Framework.boot();
        } else {
            setTimeout(start, 50);
        }
        
        // After everything is loaded, ensure translations are processed with correct locale
        // This is important when locale is detected from cookie
        setTimeout(function() {
            if (window.Framework && window.Framework.htmlTranslator && window.Framework.htmlTranslator.processPage) {
                // Clear cache and re-process page with detected locale
                if (window.Framework.htmlTranslator._clearCache) {
                    window.Framework.htmlTranslator._clearCache();
                }
                window.Framework.htmlTranslator.processPage();
            }
        }, 300);
    }
    
    // Wait a bit for all scripts to load, then start
    setTimeout(function() {
        // Auto-initialize when DOM is ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', start);
        } else {
            // DOM already ready
            start();
        }
    }, 200);
    
})();

