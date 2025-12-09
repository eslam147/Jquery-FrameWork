/**
 * Translation Module - Laravel-like translation system
 * Usage: trans('validation.required', {attribute: 'name'})
 * Usage: __('validation.required', {attribute: 'name'})
 */

(function(Framework) {
    'use strict';

    var Translation = {
        /**
         * Current locale
         */
        locale: 'en', // Default locale (English)

        /**
         * Fallback locale
         */
        fallbackLocale: 'en',

        /**
         * Translations cache
         */
        translations: {},

        /**
         * Load translation file
         */
        load: function(locale, file) {
            var cacheKey = locale + '.' + file;
            
            // Check cache first
            if (this.translations[cacheKey]) {
                return this.translations[cacheKey];
            }

            // In browser, translations should be loaded via script tags or AJAX
            // For now, we'll use a simple object structure
            // In production, you might want to load translations via AJAX
            
            // Check if translation exists in Framework.translations
            if (Framework.translations && Framework.translations[locale] && Framework.translations[locale][file]) {
                this.translations[cacheKey] = Framework.translations[locale][file];
                return this.translations[cacheKey];
            }

            return null;
        },

        /**
         * Get translation
         * @param {string} key - Translation key (e.g., 'validation.required')
         * @param {object} replace - Replacement values (e.g., {attribute: 'name', min: 3})
         * @param {function} callback - Optional callback for async loading
         * @returns {string} Translated string (or key if not found and sync)
         */
        get: function(key, replace, callback) {
            replace = replace || {};
            var self = this;
            
            // Split key by dot (e.g., 'validation.required' -> ['validation', 'required'])
            var parts = key.split('.');
            if (parts.length < 2) {
                var result = key;
                if (callback) callback(result);
                return result;
            }

            var file = parts[0];
            var messageKey = parts.slice(1).join('.');

            // Try current locale (synchronous)
            var translation = this.load(this.locale, file);
            var message = translation ? this.getNestedValue(translation, messageKey) : null;

            // Translations are loaded synchronously via boot.js, so no async loading needed

            // Fallback to fallback locale if not found (synchronous)
            if (!message && this.locale !== this.fallbackLocale) {
                translation = this.load(this.fallbackLocale, file);
                message = translation ? this.getNestedValue(translation, messageKey) : null;
            }

            // Return key if translation not found
            if (!message) {
                if (callback) callback(key);
                return key;
            }
            
            // Debug: log if translation found
            // console.log('Translation found:', key, '->', message);

            // Replace placeholders
            message = this.replacePlaceholders(message, replace);

            if (callback) callback(message);
            return message;
        },

        /**
         * Get nested value from object (support dot notation)
         */
        getNestedValue: function(obj, path) {
            if (!obj || typeof obj !== 'object') {
                return null;
            }

            var parts = path.split('.');
            var value = obj;

            for (var i = 0; i < parts.length; i++) {
                if (value === null || value === undefined) {
                    return null;
                }
                value = value[parts[i]];
            }

            return value;
        },

        /**
         * Replace placeholders in message
         * Supports :attribute, :min, :max, :values, etc.
         */
        replacePlaceholders: function(message, replace) {
            var result = message;

            // Replace :attribute with custom attribute name or field name
            if (replace.attribute) {
                // Try to get attribute translation
                var attributeKey = this.locale + '.validation.attributes.' + replace.attribute;
                var attributeTranslation = this.getNestedValue(
                    this.load(this.locale, 'validation'),
                    'attributes.' + replace.attribute
                );
                
                if (!attributeTranslation && this.locale !== this.fallbackLocale) {
                    attributeTranslation = this.getNestedValue(
                        this.load(this.fallbackLocale, 'validation'),
                        'attributes.' + replace.attribute
                    );
                }
                
                var attributeName = attributeTranslation || replace.attribute;
                result = result.replace(/:attribute/g, attributeName);
            }

            // Replace other placeholders (:min, :max, :values, etc.)
            for (var key in replace) {
                if (key !== 'attribute' && replace.hasOwnProperty(key)) {
                    var regex = new RegExp(':' + key, 'g');
                    result = result.replace(regex, replace[key]);
                }
            }

            return result;
        },

        /**
         * Set locale
         */
        setLocale: function(locale) {
            this.locale = locale;
        },

        /**
         * Get locale
         */
        getLocale: function() {
            return this.locale;
        }
    };

    /**
     * Translation helper function (Laravel-like)
     * Usage: trans('validation.required', {attribute: 'name'})
     */
    Framework.trans = function(key, replace) {
        return Translation.get(key, replace);
    };

    /**
     * Translation helper function (Laravel-like shorthand)
     * Usage: __('validation.required', {attribute: 'name'})
     */
    Framework.__ = function(key, replace) {
        return Translation.get(key, replace);
    };

    /**
     * Set locale
     */
    Framework.setLocale = function(locale) {
        Translation.setLocale(locale);
    };

    /**
     * Get locale
     */
    Framework.getLocale = function() {
        return Translation.getLocale();
    };

    // Register translation module
    Framework.translation = Translation;
    Framework.register('translation', Translation);

    // Make trans and __ available globally (Laravel-like)
    window.trans = Framework.trans;
    window.__ = Framework.__;
    
    // Also make lang() and @lang available as aliases (Laravel-like)
    window.lang = Framework.trans;
    Framework.lang = Framework.trans;
    window['@lang'] = Framework.trans;
    Framework['@lang'] = Framework.trans;

})(window.Framework || {});

