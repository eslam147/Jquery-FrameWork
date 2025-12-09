/**
 * وحدة DOM - عمليات DOM الشائعة
 */
(function(Framework) {
    'use strict';

    var DOM = {
        /**
         * إضافة/إزالة class بسهولة
         * الاستخدام: $('.element').fw('dom').toggleClass('active');
         */
        toggleClass: function(className) {
            return this.each(function() {
                $(this).toggleClass(className);
            });
        },

        /**
         * إظهار/إخفاء عنصر بسهولة
         * الاستخدام: $('.element').fw('dom').toggle();
         */
        toggle: function(speed) {
            return this.each(function() {
                $(this).fadeToggle(speed || Framework.config.animation.duration);
            });
        },

        /**
         * إظهار عنصر
         */
        show: function(speed) {
            return this.each(function() {
                $(this).fadeIn(speed || Framework.config.animation.duration);
            });
        },

        /**
         * إخفاء عنصر
         */
        hide: function(speed) {
            return this.each(function() {
                $(this).fadeOut(speed || Framework.config.animation.duration);
            });
        },

        /**
         * إضافة محتوى HTML
         */
        append: function(html) {
            return this.each(function() {
                $(this).append(html);
            });
        },

        /**
         * إضافة محتوى في البداية
         */
        prepend: function(html) {
            return this.each(function() {
                $(this).prepend(html);
            });
        },

        /**
         * استبدال المحتوى
         */
        replace: function(html) {
            return this.each(function() {
                $(this).html(html);
            });
        },

        /**
         * إزالة العنصر
         */
        remove: function() {
            return this.each(function() {
                $(this).remove();
            });
        },

        /**
         * نسخ نص للـ clipboard
         */
        copyText: function() {
            var text = this.text() || this.val();
            if (navigator.clipboard) {
                navigator.clipboard.writeText(text).then(function() {
                    console.log('تم النسخ بنجاح');
                });
            }
            return this;
        },

        /**
         * الحصول على البيانات من data attributes
         */
        getData: function(key) {
            return this.data(key);
        },

        /**
         * تعيين البيانات في data attributes
         */
        setData: function(key, value) {
            return this.data(key, value);
        }
    };

    // تسجيل الوحدة - نسجل الكائن مباشرة
    Framework.register('dom', DOM);

})(window.Framework || {});

