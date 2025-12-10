# 🚀 إعداد Netlify للنشر

## الخطوات السريعة:

### 1. رفع المشروع على GitHub

```bash
git add .
git commit -m "Prepare for Netlify deployment"
git push origin main
```

### 2. النشر على Netlify

1. **اذهب إلى [Netlify](https://www.netlify.com/)**
2. **سجل حساب** (يمكنك استخدام GitHub)
3. **اضغط "Add new site" → "Import an existing project"**
4. **اختر GitHub** واسمح بالوصول
5. **اختر Repository الخاص بك**
6. **الإعدادات**:
   - **Build command**: اتركه فارغاً
   - **Publish directory**: `/` (root)
7. **اضغط "Deploy site"**

### 3. تغيير اسم الموقع

بعد النشر:
1. اذهب إلى **Site settings**
2. **Change site name**
3. اكتب: `jquery-framework`
4. سيكون الرابط: `https://jquery-framework.netlify.app`

### 4. Custom Domain (اختياري)

إذا كان لديك domain:
1. **Site settings** → **Domain management**
2. **Add custom domain**
3. اكتب domain الخاص بك
4. اتبع التعليمات لإعداد DNS

## ✅ الملفات الجاهزة:

- ✅ `netlify.toml` - إعدادات Netlify
- ✅ `.nojekyll` - لمنع Jekyll
- ✅ المسارات محدثة (نسبية)
- ✅ `index.html` في root للـ redirect

## 🔗 الروابط:

- **الصفحة الرئيسية**: `https://jquery-framework.netlify.app/`
- **صفحة الأمثلة**: `https://jquery-framework.netlify.app/example`

## 📝 ملاحظات:

- Netlify سينشر تلقائياً عند كل push للـ GitHub
- يمكنك رؤية الـ Deploy logs في Netlify dashboard
- إذا حدثت مشكلة، تحقق من Console في المتصفح

