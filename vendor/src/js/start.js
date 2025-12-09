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
        var detectedLocale = 'en'; // Default to English
        
        // 1. Try to get from cookie 'locale'
        if (window.Framework.cookie && typeof window.Framework.cookie.get === 'function') {
            var cookieLocale = window.Framework.cookie.get('locale');
            if (cookieLocale && (cookieLocale === 'ar' || cookieLocale === 'en')) {
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
        
        // Call boot to initialize all Controllers
        if (typeof window.Framework.boot === 'function') {
            window.Framework.boot();
        } else {
            setTimeout(start, 50);
        }
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

