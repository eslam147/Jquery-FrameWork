/**
 * وحدة Utils - أدوات مساعدة
 */
(function(Framework) {
    'use strict';

    var Utils = {
        /**
         * تنسيق التاريخ
         * الاستخدام: Framework.utils.formatDate(new Date(), 'YYYY-MM-DD');
         */
        formatDate: function(date, format) {
            if (!(date instanceof Date)) {
                date = new Date(date);
            }
            
            var day = date.getDate();
            var month = date.getMonth() + 1;
            var year = date.getFullYear();
            var hours = date.getHours();
            var minutes = date.getMinutes();
            var seconds = date.getSeconds();
            
            format = format || 'YYYY-MM-DD';
            
            format = format.replace('YYYY', year);
            format = format.replace('MM', month < 10 ? '0' + month : month);
            format = format.replace('DD', day < 10 ? '0' + day : day);
            format = format.replace('HH', hours < 10 ? '0' + hours : hours);
            format = format.replace('mm', minutes < 10 ? '0' + minutes : minutes);
            format = format.replace('ss', seconds < 10 ? '0' + seconds : seconds);
            
            return format;
        },

        /**
         * تنسيق الأرقام
         * الاستخدام: Framework.utils.formatNumber(1234567.89, 2);
         */
        formatNumber: function(number, decimals) {
            decimals = decimals || 0;
            return parseFloat(number).toFixed(decimals).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
        },

        /**
         * توليد ID فريد
         */
        generateId: function(prefix) {
            prefix = prefix || 'id';
            return prefix + '_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
        },

        /**
         * نسخ كائن (deep copy)
         */
        clone: function(obj) {
            return JSON.parse(JSON.stringify(obj));
        },

        /**
         * دمج كائنات
         */
        merge: function() {
            var result = {};
            for (var i = 0; i < arguments.length; i++) {
                $.extend(true, result, arguments[i]);
            }
            return result;
        },

        /**
         * التحقق من نوع البيانات
         */
        isObject: function(obj) {
            return obj !== null && typeof obj === 'object' && !Array.isArray(obj);
        },

        isArray: function(arr) {
            return Array.isArray(arr);
        },

        isString: function(str) {
            return typeof str === 'string';
        },

        isNumber: function(num) {
            return typeof num === 'number' && !isNaN(num);
        },

        /**
         * إزالة HTML tags
         */
        stripHtml: function(html) {
            var tmp = document.createElement('DIV');
            tmp.innerHTML = html;
            return tmp.textContent || tmp.innerText || '';
        },

        /**
         * تحويل نص إلى slug
         */
        slugify: function(text) {
            return text.toString().toLowerCase()
                .replace(/\s+/g, '-')
                .replace(/[^\u0600-\u06FF\u0000-\u007F\w\-]+/g, '')
                .replace(/\-\-+/g, '-')
                .replace(/^-+/, '')
                .replace(/-+$/, '');
        },

        /**
         * تقصير النص
         */
        truncate: function(text, length, suffix) {
            length = length || 100;
            suffix = suffix || '...';
            if (text.length <= length) {
                return text;
            }
            return text.substring(0, length) + suffix;
        },

        /**
         * تأخير تنفيذ دالة (debounce)
         */
        debounce: function(func, wait) {
            var timeout;
            return function() {
                var context = this;
                var args = arguments;
                clearTimeout(timeout);
                timeout = setTimeout(function() {
                    func.apply(context, args);
                }, wait);
            };
        },

        /**
         * تنفيذ دالة مرة واحدة فقط (throttle)
         */
        throttle: function(func, limit) {
            var inThrottle;
            return function() {
                var args = arguments;
                var context = this;
                if (!inThrottle) {
                    func.apply(context, args);
                    inThrottle = true;
                    setTimeout(function() {
                        inThrottle = false;
                    }, limit);
                }
            };
        }
    };

    // تسجيل الوحدة
    Framework.register('utils', Utils);
    Framework.utils = Utils;

})(window.Framework || {});

