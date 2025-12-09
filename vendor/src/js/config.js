/**
 * إعدادات الإطار
 */
Framework.config = {
    // إعدادات AJAX
    ajax: {
        timeout: 30000,
        defaultErrorHandler: true
    },
    
    // إعدادات التحقق
    validation: {
        showErrors: true,
        errorClass: 'error',
        successClass: 'success'
    },
    
    // إعدادات التخزين
    storage: {
        prefix: 'fw_',
        expiration: null // null = لا يوجد انتهاء صلاحية
    },
    
    // إعدادات الحركات
    animation: {
        duration: 300,
        easing: 'swing'
    },
    
    // اللغة
    lang: 'en' // Default language (English)
};

