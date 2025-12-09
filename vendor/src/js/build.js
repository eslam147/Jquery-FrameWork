/**
 * ملف تجميع بسيط - يجمع كل الملفات في ملف واحد
 * يمكن استخدامه لإنشاء ملف framework.min.js
 * 
 * للاستخدام: node build.js
 */

const fs = require('fs');
const path = require('path');

// ترتيب الملفات
const files = [
    'vendor/src/core/framework.js',
    'vendor/src/js/config.js',
    'vendor/src/modules/dom.js',
    'vendor/src/modules/ajax.js',
    'vendor/src/modules/form.js',
    'vendor/src/modules/validation.js',
    'vendor/src/modules/animation.js',
    'vendor/src/modules/storage.js',
    'vendor/src/modules/utils.js'
];

// قراءة ودمج الملفات
let content = '/**\n * jQuery Framework - ملف مجمع\n * تم التجميع تلقائياً\n */\n\n';
content += '(function() {\n\n';

files.forEach(file => {
    if (fs.existsSync(file)) {
        const fileContent = fs.readFileSync(file, 'utf8');
        content += `// ${file}\n`;
        content += fileContent;
        content += '\n\n';
    }
});

content += '})();\n';

// إنشاء مجلد dist إذا لم يكن موجوداً
if (!fs.existsSync('dist')) {
    fs.mkdirSync('dist');
}

// كتابة الملف المجمع
fs.writeFileSync('dist/framework.js', content, 'utf8');
console.log('✅ تم التجميع بنجاح! الملف: dist/framework.js');

