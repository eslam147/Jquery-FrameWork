/**
 * وحدة AJAX - طلبات AJAX المبسطة
 */
(function(Framework) {
    'use strict';

    var Ajax = {
        /**
         * طلب GET بسيط
         * الاستخدام: Framework.ajax.get('/api/data', callback);
         */
        get: function(url, callback, errorCallback) {
            return $.ajax({
                url: url,
                method: 'GET',
                timeout: Framework.config.ajax.timeout,
                success: callback || function() {},
                error: errorCallback || this.defaultErrorHandler
            });
        },

        /**
         * طلب POST بسيط
         * الاستخدام: Framework.ajax.post('/api/save', {name: 'test'}, callback);
         * أو: Framework.ajax.post('/api/save', {name: 'test'}).then(function(response) { ... });
         */
        post: function(url, data, callback, errorCallback) {
            var ajaxPromise = $.ajax({
                url: url,
                method: 'POST',
                data: data || {},
                timeout: Framework.config.ajax.timeout,
                dataType: 'json'
            });
            
            // If callbacks provided, use them (backward compatibility)
            if (callback || errorCallback) {
                ajaxPromise.done(callback || function() {});
                ajaxPromise.fail(errorCallback || this.defaultErrorHandler);
            }
            
            return ajaxPromise;
        },

        /**
         * طلب PUT
         */
        put: function(url, data, callback, errorCallback) {
            return $.ajax({
                url: url,
                method: 'PUT',
                data: data || {},
                timeout: Framework.config.ajax.timeout,
                success: callback || function() {},
                error: errorCallback || this.defaultErrorHandler
            });
        },

        /**
         * طلب DELETE
         */
        delete: function(url, callback, errorCallback) {
            return $.ajax({
                url: url,
                method: 'DELETE',
                timeout: Framework.config.ajax.timeout,
                success: callback || function() {},
                error: errorCallback || this.defaultErrorHandler
            });
        },

        /**
         * طلب مخصص
         */
        request: function(options) {
            var defaults = {
                timeout: Framework.config.ajax.timeout,
                error: this.defaultErrorHandler
            };
            return $.ajax($.extend(true, defaults, options));
        },

        /**
         * معالج الأخطاء الافتراضي
         */
        defaultErrorHandler: function(xhr, status, error) {
            if (Framework.config.ajax.defaultErrorHandler) {
                console.error('خطأ في الطلب:', error);
                alert('حدث خطأ: ' + error);
            }
        },

        /**
         * تحميل JSON
         */
        loadJSON: function(url, callback) {
            return $.getJSON(url, callback);
        }
    };

    // تسجيل الوحدة
    Framework.register('ajax', Ajax);

    // إضافة طرق مباشرة للـ Framework
    Framework.ajax = Ajax;

})(window.Framework || {});

