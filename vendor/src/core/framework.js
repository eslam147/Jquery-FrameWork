/**
 * jQuery Framework - الملف الأساسي
 * إطار عمل مبني على jQuery لتسهيل المهام الشائعة
 */

(function($, window) {
    'use strict';

    // التحقق من وجود jQuery
    if (typeof $ === 'undefined') {
        throw new Error('jQuery Framework يتطلب jQuery');
    }

    // الكائن الرئيسي للإطار
    var Framework = {
        version: '1.0.0',
        modules: {},
        config: {}
    };

    /**
     * تسجيل وحدة جديدة
     */
    Framework.register = function(name, module) {
        if (this.modules[name]) {
            console.warn('Module ' + name + ' is already registered');
        }
        this.modules[name] = module;
        return this;
    };

    /**
     * الحصول على وحدة
     */
    Framework.get = function(name) {
        return this.modules[name] || null;
    };

    /**
     * تهيئة الإعدادات
     */
    Framework.init = function(config) {
        this.config = $.extend(true, {}, this.config, config || {});
        return this;
    };
    
    /**
     * Boot - Initialize all Controllers automatically
     * Usage: Framework.boot()
     */
    Framework.boot = function() {
        var controllersFound = 0;
        
        // Find all Controllers in Framework object
        for (var key in Framework) {
            if (Framework.hasOwnProperty(key)) {
                // Check if it's a Controller (ends with Controller and has init method)
                // Controllers can be functions (with static init) or objects
                if (key.indexOf('Controller') !== -1 && key !== 'BaseController' && key !== 'Controller') {
                    var controller = Framework[key];
                    
                    // Check if it's a function with static init method
                    if (typeof controller === 'function' && typeof controller.init === 'function') {
                        controllersFound++;
                        try {
                            controller.init();
                        } catch (e) {
                            console.warn('Failed to initialize controller:', key, e);
                        }
                    }
                    // Check if it's an object with init method
                    else if (typeof controller === 'object' && controller !== null && typeof controller.init === 'function') {
                        controllersFound++;
                        try {
                            controller.init();
                        } catch (e) {
                            console.warn('Failed to initialize controller:', key, e);
                        }
                    }
                }
            }
        }
        
        return this;
    };

    /**
     * توسيع jQuery بطرق الإطار
     */
    Framework.extend = function() {
        // سيتم إضافة الطرق هنا من الوحدات
        return this;
    };

    // تصدير الكائن للاستخدام العام
    window.Framework = Framework;
    window.FW = Framework; // اختصار

    // تهيئة jQuery plugin
    $.fn.fw = function(moduleName) {
        var $this = this;
        var module = Framework.modules[moduleName];
        
        if (!module) {
            console.warn('Module "' + moduleName + '" not found');
            return this;
        }
        
        // إنشاء wrapper يحتوي على جميع طرق الوحدة
        var moduleWrapper = {};
        
        // نسخ جميع الطرق من الوحدة وربطها بـ $this
        for (var method in module) {
            if (typeof module[method] === 'function') {
                (function(methodName) {
                    moduleWrapper[methodName] = function() {
                        return module[methodName].apply($this, arguments);
                    };
                })(method);
            }
        }
        
        return moduleWrapper;
    };

})(jQuery, window);
