/**
 * وحدة Validation - التحقق من البيانات
 */
(function(Framework) {
    'use strict';

    var Validation = {
        /**
         * Validators الافتراضية
         */
        validators: {
            required: function(value) {
                if (value === null || value === undefined) return false;
                if (typeof value === 'string') {
                    return value.trim() !== '';
                }
                return true;
            },
            email: function(value) {
                if (!value) return true; // optional if not required
                var emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                return emailRegex.test(value);
            },
            min: function(value, min) {
                if (!value) return true;
                // For strings, check length
                if (typeof value === 'string') {
                    return value.length >= parseInt(min);
                }
                // For numbers, check value
                var num = parseFloat(value);
                return !isNaN(num) && num >= parseFloat(min);
            },
            max: function(value, max) {
                if (!value) return true;
                // For strings, check length
                if (typeof value === 'string') {
                    return value.length <= parseInt(max);
                }
                // For numbers, check value
                var num = parseFloat(value);
                return !isNaN(num) && num <= parseFloat(max);
            },
            minLength: function(value, length) {
                if (!value) return true;
                return String(value).length >= parseInt(length);
            },
            maxLength: function(value, length) {
                if (!value) return true;
                return String(value).length <= parseInt(length);
            },
            numeric: function(value) {
                if (!value) return true;
                return !isNaN(value) && !isNaN(parseFloat(value));
            },
            phone: function(value) {
                if (!value) return true;
                var phoneRegex = /^[0-9]{10,15}$/;
                return phoneRegex.test(value.replace(/[\s\-\(\)]/g, ''));
            },
            confirmed: function(value, field, allData) {
                if (!value) return true;
                if (!allData) return false;
                // إذا كان الحقل ينتهي بـ _confirmation، نبحث عن الحقل الأصلي
                var originalField = field.replace('_confirmation', '');
                return value === allData[originalField];
            },
            regex: function(value, pattern) {
                if (!value) return true;
                try {
                    var regex = new RegExp(pattern);
                    return regex.test(value);
                } catch (e) {
                    return false;
                }
            },
            // File validators (like Laravel)
            file: function(file, ruleValue) {
                if (!file) return true; // optional if not required
                return file instanceof File || (file && file.name);
            },
            files: function(file, ruleValue) {
                if (!file) return true;
                return file instanceof File || (file && file.name);
            },
            image: function(file, ruleValue) {
                if (!file) return true;
                if (!(file instanceof File)) return false;
                return file.type && file.type.indexOf('image/') === 0;
            },
            images: function(file, ruleValue) {
                if (!file) return true;
                if (!(file instanceof File)) return false;
                return file.type && file.type.indexOf('image/') === 0;
            },
            video: function(file, ruleValue) {
                if (!file) return true;
                if (!(file instanceof File)) return false;
                return file.type && file.type.indexOf('video/') === 0;
            },
            videos: function(file, ruleValue) {
                if (!file) return true;
                if (!(file instanceof File)) return false;
                return file.type && file.type.indexOf('video/') === 0;
            },
            mimes: function(file, allowedTypes) {
                if (!file) return true;
                if (!(file instanceof File)) return false;
                if (!allowedTypes) return true;
                
                var types = allowedTypes.split(',');
                var fileExtension = (file.name || '').split('.').pop().toLowerCase();
                var fileMimeType = file.type || '';
                
                for (var i = 0; i < types.length; i++) {
                    var type = types[i].trim().toLowerCase();
                    if (fileExtension === type || fileMimeType.indexOf(type) !== -1) {
                        return true;
                    }
                }
                return false;
            },
            // Note: max and min for files are handled separately in _validateField
            // This is the file size validator
            fileMax: function(file, maxSize) {
                if (!file) return true;
                if (!(file instanceof File)) return false;
                // maxSize in kilobytes (like Laravel)
                var maxBytes = parseFloat(maxSize) * 1024;
                return file.size <= maxBytes;
            },
            fileMin: function(file, minSize) {
                if (!file) return true;
                if (!(file instanceof File)) return false;
                // minSize in kilobytes (like Laravel)
                var minBytes = parseFloat(minSize) * 1024;
                return file.size >= minBytes;
            },
            dimensions: function(file, rules) {
                if (!file) return true;
                if (!(file instanceof File)) return false;
                if (!file.type || file.type.indexOf('image/') !== 0) return true; // Skip if not image
                
                // Note: dimensions validation requires async image loading
                // For now, we'll return true and handle it separately if needed
                // In a real implementation, you'd want to make validation async
                return true; // Placeholder - dimensions validation is complex in browser
            }
        },

        /**
         * الحصول على جميع Validators
         */
        getValidators: function() {
            return $.extend({}, this.validators, this.customRules || {});
        },

        /**
         * التحقق من النموذج (الطريقة القديمة)
         * الاستخدام: if ($('form').fw('validation').validate()) { ... }
         */
        validate: function(rules) {
            var $this = this;
            var form = $this.is('form') ? $this : $this.closest('form');
            var isValid = true;
            var errors = [];

            // إزالة الأخطاء السابقة
            form.find('.' + Framework.config.validation.errorClass).removeClass(Framework.config.validation.errorClass);

            // القواعد الافتراضية
            var defaultRules = this.validators;

            // دمج القواعد
            rules = rules || {};
            var allRules = $.extend(true, {}, defaultRules, rules);

            // التحقق من كل حقل
            form.find('[data-validate]').each(function() {
                var $field = $(this);
                var fieldRules = $field.data('validate').split('|');
                var value = $field.val();
                var fieldName = $field.attr('name') || $field.attr('id');

                $.each(fieldRules, function(index, rule) {
                    var ruleParts = rule.split(':');
                    var ruleName = ruleParts[0];
                    var ruleValue = ruleParts[1];

                    if (allRules[ruleName]) {
                        var result = allRules[ruleName](value, ruleValue);
                        if (result !== true) {
                            isValid = false;
                            $field.addClass(Framework.config.validation.errorClass);
                            errors.push('خطأ في ' + (fieldName || 'الحقل') + ': ' + ruleName);
                        }
                    }
                });
            });

            if (!isValid && Framework.config.validation.showErrors) {
                console.warn('أخطاء التحقق:', errors);
            }

            return isValid;
        },

        /**
         * FormRequest Base Class - موجود في validation.js
         * Can be used as ES6 class or function constructor
         */
        FormRequest: function() {
            this.rules = this.rules || {};
            this.messages = this.messages || {};
            this.customAttributes = this.customAttributes || {};
        },

        /**
         * التحقق من البيانات
         */
        _validateRequest: function(request, formData) {
            formData = formData || {};
            var errors = {};
            var isValid = true;

            // دمج القواعد
            var allRules = this._prepareRules(request);

            // التحقق من كل حقل
            for (var field in allRules) {
                var fieldRules = allRules[field];
                var fieldValue = formData[field] !== undefined ? formData[field] : '';
                
                // Skip validation if field is not in data and not required
                var hasRequired = false;
                for (var i = 0; i < fieldRules.length; i++) {
                    if (fieldRules[i] === 'required' || fieldRules[i].indexOf('required') === 0) {
                        hasRequired = true;
                        break;
                    }
                }
                
                if (formData[field] === undefined && !hasRequired) {
                    continue;
                }
                
                var fieldErrors = this._validateField(request, field, fieldValue, fieldRules, formData);

                if (fieldErrors.length > 0) {
                    errors[field] = fieldErrors;
                    isValid = false;
                }
            }

            // التحقق من القواعد المخصصة
            var customErrors = this._validateCustomRules(request, formData);
            if (Object.keys(customErrors).length > 0) {
                $.extend(errors, customErrors);
                isValid = false;
            }

            return {
                isValid: isValid,
                errors: errors,
                first: function() {
                    for (var field in errors) {
                        if (errors[field].length > 0) {
                            return errors[field][0];
                        }
                    }
                    return null;
                },
                get: function(field) {
                    return errors[field] || [];
                },
                has: function(field) {
                    return errors[field] && errors[field].length > 0;
                }
            };
        },

        /**
         * إعداد القواعد
         */
        _prepareRules: function(request) {
            var preparedRules = {};
            // Support both object and function (Laravel-like)
            var rules = (typeof request.rules === 'function') ? request.rules() : (request.rules || {});

            for (var field in rules) {
                var rule = rules[field];

                if (typeof rule === 'string') {
                    preparedRules[field] = rule.split('|');
                } else if (Array.isArray(rule)) {
                    preparedRules[field] = rule;
                } else if (typeof rule === 'function') {
                    var result = rule();
                    if (typeof result === 'string') {
                        preparedRules[field] = result.split('|');
                    } else if (Array.isArray(result)) {
                        preparedRules[field] = result;
                    } else {
                        preparedRules[field] = [];
                    }
                } else {
                    preparedRules[field] = [];
                }
            }

            return preparedRules;
        },

        /**
         * التحقق من حقل واحد
         */
        _validateField: function(request, field, value, rules, allData) {
            var errors = [];
            // Support both object and function (Laravel-like)
            var customAttributes = (typeof request.customAttributes === 'function') ? request.customAttributes() : (request.customAttributes || {});
            var fieldName = (customAttributes && customAttributes[field]) || field;
            allData = allData || {};

            var validators = this.getValidators();

            for (var i = 0; i < rules.length; i++) {
                var rule = rules[i];
                var ruleName = rule;
                var ruleValue = null;

                if (rule.indexOf(':') !== -1) {
                    var parts = rule.split(':');
                    ruleName = parts[0];
                    ruleValue = parts.slice(1).join(':');
                }

                var validator = validators[ruleName];
                if (validator) {
                    var result;
                    
                    // Check if this field has file validators (to determine if it's a file field)
                    var hasFileValidator = false;
                    for (var j = 0; j < rules.length; j++) {
                        var rulePart = rules[j];
                        if (typeof rulePart === 'string') {
                            var ruleNamePart = rulePart.split(':')[0];
                            if (this._isFileValidator(ruleNamePart)) {
                                hasFileValidator = true;
                                break;
                            }
                        }
                    }
                    
                    // Check if file exists (request._files[field] is a FileList)
                    var hasFile = false;
                    var fileValue = null;
                    if (request._files && request._files[field]) {
                        // FileList has length property
                        var fileList = request._files[field];
                        if (fileList && fileList.length && fileList.length > 0) {
                            hasFile = true;
                            fileValue = fileList[0]; // Get first file from FileList
                        }
                    }
                    
                    // For file fields, handle validation differently
                    if (hasFileValidator) {
                        // For required rule on file fields, check if file exists
                        if (ruleName === 'required') {
                            result = hasFile;
                        }
                        // For max/min on file fields, use file size validator
                        else if (ruleName === 'max' || ruleName === 'min') {
                            // Use file size validator for file fields
                            var fileSizeValidator = ruleName === 'max' ? validators.fileMax : validators.fileMin;
                            if (fileSizeValidator && hasFile) {
                                result = fileSizeValidator(fileValue, ruleValue, field);
                            } else if (!hasFile) {
                                // If no file, skip size validation (required will catch it)
                                result = true;
                            } else {
                                result = true; // Skip if validator not found
                            }
                        }
                        // For other file validators, use file value
                        else if (this._isFileValidator(ruleName)) {
                            result = validator(fileValue, ruleValue, field);
                        } else {
                            // For non-file validators on file fields, use form value
                            result = validator(value, ruleValue, field);
                        }
                    } else if (ruleName === 'confirmed') {
                        result = validator(value, field, allData);
                    } else {
                        result = validator(value, ruleValue, field);
                    }
                    
                    if (result !== true) {
                        var message = this._getMessage(request, field, ruleName, ruleValue);
                        errors.push(message);
                    }
                }
            }

            return errors;
        },
        
        /**
         * Check if validator is for files
         */
        _isFileValidator: function(ruleName) {
            // max and min are only file validators when used with file fields
            // For now, we exclude them from file validators list
            var fileValidators = ['file', 'files', 'image', 'images', 'video', 'videos', 'mimes', 'dimensions'];
            return fileValidators.indexOf(ruleName) !== -1;
        },

        /**
         * الحصول على رسالة الخطأ
         */
        _getMessage: function(request, field, rule, ruleValue) {
            // Get field name from customAttributes or use translation system automatically
            var fieldName = field;
            // Support both object and function (Laravel-like)
            var customAttributes = (typeof request.customAttributes === 'function') ? request.customAttributes() : (request.customAttributes || {});
            
            // Check if customAttributes has actual content (not empty and not just comments)
            var hasCustomAttributes = false;
            if (customAttributes && typeof customAttributes === 'object') {
                for (var attrKey in customAttributes) {
                    if (customAttributes.hasOwnProperty(attrKey)) {
                        var attrValue = customAttributes[attrKey];
                        // Check if it's not a comment (starts with //) and not empty
                        if (typeof attrValue === 'string' && attrValue.trim() !== '' && !attrValue.trim().startsWith('//')) {
                            hasCustomAttributes = true;
                            break;
                        }
                        if (typeof attrValue === 'function') {
                            hasCustomAttributes = true;
                            break;
                        }
                    }
                }
            }
            
            // Use custom attribute if exists and is not empty/comment
            if (hasCustomAttributes && customAttributes[field]) {
                var customAttr = customAttributes[field];
                // Skip if it's a comment or empty
                if (typeof customAttr === 'string' && (customAttr.trim() === '' || customAttr.trim().startsWith('//'))) {
                    // Skip to translation system (only if messages() is not empty)
                } else {
                // If attribute is a function, call it (for dynamic translations)
                if (typeof customAttr === 'function') {
                    fieldName = customAttr();
                    } else if (typeof customAttr === 'string' && customAttr.trim() !== '') {
                    // Direct value (already translated string)
                    fieldName = customAttr;
                }
                }
            }
            
            // Only try translation system for attribute name if customAttributes is not empty/commented
            // If customAttributes is empty/commented, use field name directly (English)
            if (hasCustomAttributes && fieldName === field) {
                // Custom attributes exist but this field doesn't have one, try translation
                var transFunc = Framework.trans || window.trans || Framework.__ || window.__ || Framework['@lang'] || window['@lang'];
                if (transFunc) {
                    var attributeKey = 'validation.attributes.' + field;
                    var attributeTranslation = transFunc(attributeKey);
                    if (attributeTranslation && attributeTranslation !== attributeKey) {
                        fieldName = attributeTranslation;
                    }
                }
            }
            // If customAttributes is empty/commented, fieldName stays as field (English name)
            
            var key = field + '.' + rule;
            // Support both object and function (Laravel-like)
            var messages = (typeof request.messages === 'function') ? request.messages() : (request.messages || {});

            // Check if messages object has actual content (not empty and not just comments)
            var hasCustomMessages = false;
            if (messages && typeof messages === 'object') {
                for (var msgKey in messages) {
                    if (messages.hasOwnProperty(msgKey)) {
                        var msgValue = messages[msgKey];
                        // Check if it's not a comment (starts with //) and not empty
                        if (typeof msgValue === 'string' && msgValue.trim() !== '' && !msgValue.trim().startsWith('//')) {
                            hasCustomMessages = true;
                            break;
                        }
                        if (typeof msgValue === 'function') {
                            hasCustomMessages = true;
                            break;
                        }
                    }
                }
            }

            // Check custom messages first (only if they exist and are not empty/comments)
            if (hasCustomMessages && messages[key]) {
                var customMessage = messages[key];
                // Skip if it's a comment or empty
                if (typeof customMessage === 'string' && (customMessage.trim() === '' || customMessage.trim().startsWith('//'))) {
                    // Skip to translation system
                } else {
                // If message is a function, call it (for dynamic translations)
                if (typeof customMessage === 'function') {
                    customMessage = customMessage();
                }
                // If message is a string, replace placeholders
                    if (typeof customMessage === 'string' && customMessage.trim() !== '') {
                    // Replace :attribute placeholder
                    customMessage = customMessage.replace(/:attribute/g, fieldName);
                    // Replace other placeholders if they exist
                    if (ruleValue !== undefined && ruleValue !== null) {
                        if (rule === 'min' || rule === 'max') {
                            customMessage = customMessage.replace(/:min/g, ruleValue).replace(/:max/g, ruleValue);
                        } else if (rule === 'mimes') {
                            customMessage = customMessage.replace(/:values/g, ruleValue);
                        }
                    }
                    return customMessage;
                    }
                }
            }

            // If messages() is empty/commented, use translation system but with English field name
            // If messages() has content, use custom messages (already handled above)
            var transFunc = Framework.trans || window.trans || Framework.__ || window.__ || Framework['@lang'] || window['@lang'];
            if (transFunc) {
                var translationKey = 'validation.' + rule;
                
                // Get the translated message template (without attribute replacement)
                // We'll replace :attribute manually with English field name if customAttributes is empty
                var replace = {};
                
                // Add rule value if exists (e.g., min:3, max:50)
                if (ruleValue !== undefined && ruleValue !== null) {
                    if (rule === 'min' || rule === 'max') {
                        replace.min = ruleValue;
                        replace.max = ruleValue;
                    } else if (rule === 'mimes') {
                        replace.values = ruleValue;
                    }
                }
                
                // Get translation without attribute (to avoid auto-translation of attribute)
                // We need to get the raw translation and replace :attribute manually
                // If messages() and customAttributes() are empty, use English as default
                var Translation = Framework.translation || (Framework.Translation && Framework.Translation.module);
                if (Translation && typeof Translation.load === 'function' && typeof Translation.getNestedValue === 'function') {
                    // Use English locale as default when messages() and customAttributes() are empty
                    var localeToUse = 'en';
                    var translation = Translation.load(localeToUse, 'validation');
                    var messageTemplate = translation ? Translation.getNestedValue(translation, rule) : null;
                    
                    // Fallback to current locale if English not found
                    if (!messageTemplate) {
                        var currentLocale = typeof Translation.getLocale === 'function' ? Translation.getLocale() : Translation.locale;
                        translation = Translation.load(currentLocale, 'validation');
                        messageTemplate = translation ? Translation.getNestedValue(translation, rule) : null;
                    }
                    
                    if (messageTemplate) {
                        // Replace :attribute with fieldName (English if customAttributes is empty)
                        var finalMessage = messageTemplate.replace(/:attribute/g, fieldName);
                        
                        // Replace other placeholders
                        for (var key in replace) {
                            if (replace.hasOwnProperty(key)) {
                                var regex = new RegExp(':' + key, 'g');
                                finalMessage = finalMessage.replace(regex, replace[key]);
                            }
                        }
                        
                        return finalMessage;
                    }
                }
                
                // Fallback: use trans() function (but it will auto-translate attribute)
                // Only use this if Translation module is not available
                replace.attribute = fieldName;
                var translated = transFunc(translationKey, replace);
                // Always return translated message if found
                if (translated && translated !== translationKey) {
                    return translated;
            }
                // If translation returned the same as key, it means translation not found
                // Return the key itself (as requested: validation.required)
                if (translated === translationKey) {
                    return translationKey;
                }
                // If translation function returned something else, use it
                if (translated) {
                    return translated;
                }
            }

            // If translation system is not available, return the key
            return 'validation.' + rule;
        },

        /**
         * التحقق من القواعد المخصصة
         */
        _validateCustomRules: function(request, data) {
            var errors = {};

            if (typeof request.authorize === 'function' && !request.authorize()) {
                errors['_authorize'] = ['غير مصرح لك بهذا الإجراء'];
            }

            return errors;
        },

        /**
         * التحقق باستخدام Request class
         * الاستخدام: var result = $('form').fw('validation').validateRequest(new UserRequest());
         * أو: validation.detectAndValidate($form, UserRequest)
         */
        validateRequest: function(request) {
            var $this = this;
            var form = $this.is('form') ? $this : $this.closest('form');
            var formData = Framework.modules.form.serializeObject.call(form);
            
            var result = this._validateRequest(request, formData);
            
            // عرض الأخطاء في النموذج
            if (!result.isValid) {
                form.find('.' + Framework.config.validation.errorClass).removeClass(Framework.config.validation.errorClass);
                form.find('.error-message').remove();
                
                for (var field in result.errors) {
                    var fieldElement = form.find('[name="' + field + '"]');
                    if (fieldElement.length > 0) {
                        fieldElement.addClass(Framework.config.validation.errorClass);
                        var errorMsg = result.errors[field][0];
                        var existingError = fieldElement.next('.error-message');
                        if (existingError.length > 0) {
                            existingError.remove();
                        }
                        var errorElement = $('<span class="error-message" style="color: #dc3545; font-size: 12px; display: block; margin-top: 5px; margin-bottom: 10px;">' + errorMsg + '</span>');
                        fieldElement.after(errorElement);
                    }
                }
            } else {
                form.find('.error-message').remove();
                form.find('.' + Framework.config.validation.errorClass).removeClass(Framework.config.validation.errorClass);
            }
            
            return result;
        },

        /**
         * اكتشاف Request class تلقائياً من اسم الـ parameter
         * إذا كان الـ parameter يحتوي على "Request" → يطبق الفاليديشن
         * إذا كان "request" (lowercase) فقط → لا فاليديشن
         */
        detectAndValidate: function($form, RequestClass) {
            if (!RequestClass) {
                return null;
            }
            
            // إنشاء instance من Request class
            var requestInstance = new RequestClass();
            
            // إزالة جميع الأخطاء السابقة قبل التحقق الجديد
            $form.find('.' + Framework.config.validation.errorClass).removeClass(Framework.config.validation.errorClass);
            $form.find('.error-message').remove();
            
            // الحصول على form data (بدون ملفات)
            var formData = Framework.modules.form.serializeObject.call($form);
            
            // الحصول على الملفات - استخدام نفس الطريقة المستخدمة في BaseController
            var files = $form.fw('form').getFiles();
            
            // تخزين الملفات في request instance قبل الفاليديشن (للتحقق منها)
            requestInstance._files = files || {};
            
            // تطبيق الفاليديشن
            var result = this._validateRequest(requestInstance, formData);
            
            // عرض الأخطاء
            if (!result.isValid) {
                // إزالة جميع الأخطاء السابقة قبل عرض الأخطاء الجديدة
                $form.find('.' + Framework.config.validation.errorClass).removeClass(Framework.config.validation.errorClass);
                $form.find('.error-message').remove();
                
                for (var field in result.errors) {
                    var fieldElement = $form.find('[name="' + field + '"]');
                    if (fieldElement.length > 0) {
                        fieldElement.addClass(Framework.config.validation.errorClass);
                        var errorMsg = result.errors[field][0];
                        var existingError = fieldElement.next('.error-message');
                        if (existingError.length > 0) {
                            existingError.remove();
                        }
                        var errorElement = $('<span class="error-message" style="color: #dc3545; font-size: 12px; display: block; margin-top: 5px; margin-bottom: 10px;">' + errorMsg + '</span>');
                        fieldElement.after(errorElement);
                    }
                }
            } else {
                // إزالة جميع الأخطاء عند نجاح التحقق
                $form.find('.' + Framework.config.validation.errorClass).removeClass(Framework.config.validation.errorClass);
                $form.find('.error-message').remove();
                
                // تخزين البيانات في request instance
                for (var field in formData) {
                    if (formData.hasOwnProperty(field)) {
                        requestInstance[field] = formData[field];
                    }
                }
                
                // إضافة all() method
                requestInstance.all = function() {
                    var data = {};
                    for (var key in this) {
                        if (this.hasOwnProperty(key) && 
                            key !== 'rules' && 
                            key !== 'messages' && 
                            key !== 'customAttributes' && 
                            key !== '_files' &&
                            typeof this[key] !== 'function') {
                            data[key] = this[key];
                        }
                    }
                    // Include files if they exist
                    if (this._files && Object.keys(this._files).length > 0) {
                        for (var fileKey in this._files) {
                            if (this._files.hasOwnProperty(fileKey)) {
                                data[fileKey] = this._files[fileKey];
                            }
                        }
                    }
                    return data;
                };
                
                // إضافة hasFiles() method دائماً (للتحقق فقط - ترجع true/false)
                var hasFiles = files && Object.keys(files).length > 0;
                requestInstance.hasFiles = function(fieldName) {
                    if (fieldName) {
                        // التحقق من ملف معين
                        return this._files && this._files[fieldName] && this._files[fieldName].length > 0;
                    }
                    // التحقق من وجود أي ملفات
                    return this._files && Object.keys(this._files).length > 0;
                };
                
                // إضافة methods الخاصة بالملفات فقط إذا كان هناك ملفات
                if (hasFiles) {
                    // تخزين الملفات في request instance
                    requestInstance._files = files;
                    
                    // Helper function لإضافة Laravel-like methods للـ File object
                    var addFileMethods = function(file) {
                        if (!file || typeof file !== 'object') return file;
                        
                        // getClientOriginalName() - مثل Laravel
                        file.getClientOriginalName = function() {
                            return this.name || '';
                        };
                        
                        // getRealPath() - في المتصفح لا يوجد real path، نرجع object URL
                        file.getRealPath = function() {
                            if (this.path) return this.path;
                            // في المتصفح، يمكن إنشاء object URL
                            if (window.URL && window.URL.createObjectURL) {
                                return window.URL.createObjectURL(this);
                            }
                            return null;
                        };
                        
                        // getSize() - مثل Laravel
                        file.getSize = function() {
                            return this.size || 0;
                        };
                        
                        // getMimeType() - مثل Laravel
                        file.getMimeType = function() {
                            return this.type || '';
                        };
                        
                        // getClientOriginalExtension() - إضافة extension
                        file.getClientOriginalExtension = function() {
                            var name = this.name || '';
                            var parts = name.split('.');
                            return parts.length > 1 ? parts[parts.length - 1] : '';
                        };
                        
                        return file;
                    };
                    
                    // إضافة file() method للحصول على ملف واحد مع Laravel-like methods
                    requestInstance.file = function(fieldName) {
                        if (this._files && this._files[fieldName] && this._files[fieldName].length > 0) {
                            return addFileMethods(this._files[fieldName][0]);
                        }
                        return null;
                    };
                    
                    // إضافة files() method للحصول على جميع الملفات
                    requestInstance.files = function(fieldName) {
                        if (fieldName) {
                            // Return files for specific field
                            return this._files && this._files[fieldName] ? this._files[fieldName] : null;
                        }
                        // Return all files
                        return this._files || {};
                    };
                    
                    // إضافة getFilesInfo() method للحصول على معلومات الملفات جاهزة للعرض
                    requestInstance.getFilesInfo = function() {
                        if (!this.hasFiles()) {
                            return null;
                        }
                        
                        var filesInfo = {};
                        for (var fieldName in this._files) {
                            if (this._files.hasOwnProperty(fieldName)) {
                                var fileList = this._files[fieldName];
                                filesInfo[fieldName] = [];
                                for (var i = 0; i < fileList.length; i++) {
                                    filesInfo[fieldName].push({
                                        name: fileList[i].name,
                                        size: fileList[i].size,
                                        type: fileList[i].type,
                                        lastModified: new Date(fileList[i].lastModified).toLocaleString('ar-EG')
                                    });
                                }
                            }
                        }
                        return filesInfo;
                    };
                }
            }
            
            return {
                result: result,
                request: requestInstance
            };
        },

        /**
         * التحقق من حقل واحد
         */
        validateField: function(field, rules) {
            var $field = $(field);
            var value = $field.val();
            var isValid = true;

            if (rules.required && (!value || value.trim() === '')) {
                isValid = false;
            }
            if (rules.email && value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
                isValid = false;
            }
            if (rules.minLength && value && value.length < rules.minLength) {
                isValid = false;
            }
            if (rules.maxLength && value && value.length > rules.maxLength) {
                isValid = false;
            }

            if (isValid) {
                $field.removeClass(Framework.config.validation.errorClass)
                      .addClass(Framework.config.validation.successClass);
            } else {
                $field.removeClass(Framework.config.validation.successClass)
                      .addClass(Framework.config.validation.errorClass);
            }

            return isValid;
        },

        /**
         * إضافة قاعدة مخصصة
         */
        addRule: function(name, validator) {
            this.customRules = this.customRules || {};
            this.customRules[name] = validator;
            return this;
        },

        /**
         * إضافة validator جديد
         */
        addValidator: function(name, validator) {
            this.validators[name] = validator;
            return this;
        }
    };

    // تسجيل الوحدة - نسجل الكائن مباشرة
    Framework.register('validation', Validation);

    // إضافة طرق مباشرة
    Framework.validation = Validation;
    
    // Export FormRequest to Framework directly for easier access
    Framework.FormRequest = Validation.FormRequest;
    
    // Make FormRequest available globally (Laravel-like)
    window.FormRequest = Validation.FormRequest;

})(window.Framework || {});

