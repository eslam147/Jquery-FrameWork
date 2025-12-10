# 🚀 نشر المشروع أونلاين

هذا الدليل يشرح كيفية نشر jQuery Framework على الإنترنت.

## 📋 الطرق المتاحة

### 1. GitHub Pages (مجاني وسهل)

#### الخطوات:

1. **تأكد من أن المشروع على GitHub**
   ```bash
   git add .
   git commit -m "Prepare for deployment"
   git push origin main
   ```

2. **تفعيل GitHub Pages**:
   - اذهب إلى إعدادات الـ Repository على GitHub
   - Settings → Pages
   - Source: اختر Branch (main أو master)
   - Folder: اختر `/ (root)` أو `/docs` إذا كان لديك مجلد docs
   - Save

3. **الوصول للموقع**:
   - سيكون الرابط: `https://YOUR_USERNAME.github.io/YOUR_REPO_NAME/`
   - مثال: `https://username.github.io/jquery-framework/`

#### ملاحظات مهمة:
- GitHub Pages يدعم فقط Static files (HTML, CSS, JS)
- لا يدعم Node.js أو PHP
- المسارات يجب أن تكون نسبية

### 2. Netlify (مجاني - الأسهل)

#### الخطوات:

1. **سجل حساب على [Netlify](https://www.netlify.com/)**

2. **ربط GitHub**:
   - اضغط "New site from Git"
   - اختر GitHub
   - اختر الـ Repository الخاص بك

3. **إعدادات البناء**:
   - Build command: اتركه فارغاً (لأن المشروع static)
   - Publish directory: `/` (root directory)

4. **الوصول للموقع**:
   - Netlify سيعطيك رابط تلقائياً مثل: `https://random-name.netlify.app`
   - يمكنك تغيير الاسم من Settings → Site details → Change site name

#### مزايا Netlify:
- ✅ نشر تلقائي عند Push للـ GitHub
- ✅ HTTPS مجاني
- ✅ Custom domain مجاني
- ✅ CDN سريع

### 3. Vercel (مجاني - سريع جداً)

#### الخطوات:

1. **سجل حساب على [Vercel](https://vercel.com/)**

2. **ربط GitHub**:
   - اضغط "New Project"
   - اختر GitHub
   - اختر الـ Repository

3. **إعدادات البناء**:
   - Framework Preset: Other
   - Root Directory: `./`
   - Build Command: اتركه فارغاً
   - Output Directory: `./`

4. **الوصول للموقع**:
   - Vercel سيعطيك رابط مثل: `https://your-project.vercel.app`

### 4. GitHub Codespaces (للتطوير والاختبار)

#### الخطوات:

1. **افتح المشروع في Codespaces**:
   - اذهب للـ Repository على GitHub
   - اضغط على Code → Codespaces → Create codespace

2. **تشغيل المشروع**:
   - Codespaces سيفتح VS Code في المتصفح
   - يمكنك تشغيل المشروع محلياً للاختبار

## 🔧 إعدادات مهمة قبل النشر

### 1. تحديث المسارات في HTML

تأكد من أن جميع المسارات نسبية:

```html
<!-- ✅ صحيح -->
<script src="/vendor/src/js/boot.js"></script>
<link rel="stylesheet" href="/vendor/src/css/style.css">

<!-- ❌ خطأ (مسارات مطلقة محلية) -->
<script src="/test/vendor/src/js/boot.js"></script>
```

### 2. إنشاء ملف index.html رئيسي

تأكد من وجود `index.html` في root directory أو في مجلد `docs/`:

```html
<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>jQuery Framework</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
    <link rel="stylesheet" href="vendor/src/css/style.css">
</head>
<body>
    <!-- محتوى الصفحة -->
    
    <script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>
    <script src="vendor/src/js/boot.js"></script>
</body>
</html>
```

### 3. ملف .nojekyll (لـ GitHub Pages)

إذا كنت تستخدم GitHub Pages، أنشئ ملف `.nojekyll` في root directory:

```bash
touch .nojekyll
```

هذا يمنع Jekyll من معالجة الملفات.

## 📝 مثال على إعدادات Netlify

أنشئ ملف `netlify.toml` في root:

```toml
[build]
  publish = "."
  command = ""

[[redirects]]
  from = "/*"
  to = "/resources/views/index.html"
  status = 200
```

## 🎯 التوصية

**Netlify** هو الأسهل والأسرع:
- ✅ إعداد في دقائق
- ✅ نشر تلقائي
- ✅ HTTPS مجاني
- ✅ Custom domain مجاني
- ✅ CDN سريع

## 🔗 روابط مفيدة

- [GitHub Pages Documentation](https://docs.github.com/en/pages)
- [Netlify Documentation](https://docs.netlify.com/)
- [Vercel Documentation](https://vercel.com/docs)

