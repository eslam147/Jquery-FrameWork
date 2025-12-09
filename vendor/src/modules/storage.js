/**
 * وحدة Storage - التخزين المحلي
 */
(function(Framework) {
    'use strict';

    var Storage = {
        /**
         * حفظ بيانات في localStorage
         * الاستخدام: Framework.storage.set('key', {name: 'Ahmed'});
         */
        set: function(key, value, expiration) {
            var prefix = Framework.config.storage.prefix;
            var data = {
                value: value,
                timestamp: new Date().getTime(),
                expiration: expiration || Framework.config.storage.expiration
            };
            
            try {
                localStorage.setItem(prefix + key, JSON.stringify(data));
                return true;
            } catch (e) {
                console.error('خطأ في حفظ البيانات:', e);
                return false;
            }
        },

        /**
         * الحصول على بيانات من localStorage
         * الاستخدام: var data = Framework.storage.get('key');
         */
        get: function(key, defaultValue) {
            var prefix = Framework.config.storage.prefix;
            
            try {
                var item = localStorage.getItem(prefix + key);
                if (!item) {
                    return defaultValue || null;
                }
                
                var data = JSON.parse(item);
                
                // التحقق من انتهاء الصلاحية
                if (data.expiration) {
                    var now = new Date().getTime();
                    if (now - data.timestamp > data.expiration) {
                        this.remove(key);
                        return defaultValue || null;
                    }
                }
                
                return data.value;
            } catch (e) {
                console.error('خطأ في قراءة البيانات:', e);
                return defaultValue || null;
            }
        },

        /**
         * حذف بيانات من localStorage
         */
        remove: function(key) {
            var prefix = Framework.config.storage.prefix;
            try {
                localStorage.removeItem(prefix + key);
                return true;
            } catch (e) {
                console.error('خطأ في حذف البيانات:', e);
                return false;
            }
        },

        /**
         * مسح كل البيانات المحفوظة بالإطار
         */
        clear: function() {
            var prefix = Framework.config.storage.prefix;
            try {
                for (var i = localStorage.length - 1; i >= 0; i--) {
                    var key = localStorage.key(i);
                    if (key && key.indexOf(prefix) === 0) {
                        localStorage.removeItem(key);
                    }
                }
                return true;
            } catch (e) {
                console.error('خطأ في مسح البيانات:', e);
                return false;
            }
        },

        /**
         * التحقق من وجود مفتاح
         */
        has: function(key) {
            var prefix = Framework.config.storage.prefix;
            return localStorage.getItem(prefix + key) !== null;
        },

        /**
         * الحصول على جميع المفاتيح
         */
        keys: function() {
            var prefix = Framework.config.storage.prefix;
            var keys = [];
            for (var i = 0; i < localStorage.length; i++) {
                var key = localStorage.key(i);
                if (key && key.indexOf(prefix) === 0) {
                    keys.push(key.replace(prefix, ''));
                }
            }
            return keys;
        }
    };

    // تسجيل الوحدة
    Framework.register('storage', Storage);
    Framework.storage = Storage;

})(window.Framework || {});

