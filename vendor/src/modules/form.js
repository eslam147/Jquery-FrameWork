/**
 * وحدة Form - معالجة النماذج
 */
(function(Framework) {
    'use strict';

    var Form = {
        /**
         * الحصول على بيانات النموذج ككائن
         * الاستخدام: var data = $('form').fw('form').serializeObject();
         */
        serializeObject: function() {
            var $this = this;
            var form = $this.is('form') ? $this : $this.closest('form');
            var data = {};
            form.find('input, select, textarea').each(function() {
                var $field = $(this);
                var name = $field.attr('name');
                if (name) {
                    // Skip file inputs - handled separately
                    if ($field.attr('type') === 'file') {
                        return;
                    }
                    if ($field.attr('type') === 'checkbox') {
                        data[name] = $field.is(':checked');
                    } else if ($field.attr('type') === 'radio') {
                        if ($field.is(':checked')) {
                            data[name] = $field.val();
                        }
                    } else {
                        data[name] = $field.val();
                    }
                }
            });
            return data;
        },

        /**
         * الحصول على الملفات من النموذج
         * الاستخدام: var files = $('form').fw('form').getFiles();
         * Returns: {fieldName: FileList, ...}
         */
        getFiles: function() {
            var $this = this;
            var form = $this.is('form') ? $this : $this.closest('form');
            var files = {};
            form.find('input[type="file"]').each(function() {
                var $field = $(this);
                var name = $field.attr('name');
                var fileInput = this; // DOM element
                if (name) {
                    // Check if files exist - use DOM element directly
                    if (fileInput.files && fileInput.files.length > 0) {
                        files[name] = fileInput.files;
                    }
                }
            });
            return files;
        },

        /**
         * الحصول على ملف واحد من النموذج
         * الاستخدام: var file = $('form').fw('form').getFile('avatar');
         */
        getFile: function(fieldName) {
            var files = this.getFiles();
            if (files[fieldName] && files[fieldName].length > 0) {
                return files[fieldName][0]; // Return first file
            }
            return null;
        },

        /**
         * تعبئة النموذج من كائن
         * الاستخدام: $('form').fw('form').fillForm({name: 'Ahmed', email: 'test@test.com'});
         */
        fillForm: function(data) {
            var $this = this;
            var form = $this.is('form') ? $this : $this.closest('form');
            $.each(data, function(key, value) {
                var field = form.find('[name="' + key + '"]');
                if (field.length) {
                    if (field.attr('type') === 'checkbox') {
                        field.prop('checked', value);
                    } else if (field.attr('type') === 'radio') {
                        form.find('[name="' + key + '"][value="' + value + '"]').prop('checked', true);
                    } else {
                        field.val(value);
                    }
                }
            });
            return $this;
        },

        /**
         * مسح النموذج
         * الاستخدام: $('form').fw('form').reset();
         */
        reset: function() {
            var $this = this;
            var form = $this.is('form') ? $this : $this.closest('form');
            form[0].reset();
            form.find('.error').removeClass('error');
            return $this;
        },

        /**
         * إرسال النموذج عبر AJAX
         * الاستخدام: $('form').fw('form').submitAjax('/api/save', callback);
         */
        submitAjax: function(url, callback, errorCallback) {
            var $this = this;
            var form = $this.is('form') ? $this : $this.closest('form');
            var data = Form.serializeObject.call(form);
            var method = form.attr('method') || 'POST';
            
            return Framework.ajax.request({
                url: url,
                method: method,
                data: data,
                success: callback || function(response) {
                    console.log('تم الإرسال بنجاح', response);
                },
                error: errorCallback || Framework.ajax.defaultErrorHandler
            });
        },

        /**
         * تعطيل/تفعيل النموذج
         */
        disable: function() {
            var $this = this;
            var form = $this.is('form') ? $this : $this.closest('form');
            form.find('input, select, textarea, button').prop('disabled', true);
            return $this;
        },

        enable: function() {
            var $this = this;
            var form = $this.is('form') ? $this : $this.closest('form');
            form.find('input, select, textarea, button').prop('disabled', false);
            return $this;
        }
    };

    // تسجيل الوحدة - نسجل الكائن مباشرة
    Framework.register('form', Form);

})(window.Framework || {});

