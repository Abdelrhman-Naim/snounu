# نشر سنونو — React وFirebase

هذه الوثيقة تحل محل إعداد Next.js وPostgreSQL. التطبيق React/Vite ثابت على Vercel ويتصل مباشرة بـFirebase؛ لا SQL أو Cloud Functions أو مفاتيح Admin في الواجهة.

ابدأ بخطوات README وdocs/FIREBASE_SETUP_AR.md. إعداد الويب لا يفعّل الخدمات أو ينشر القواعد تلقائيًا. يجب إعداد Email/Password وAnonymous وFirestore وStorage ووثيقة مدير موثوقة، ونشر القواعد بعد دمجها مع أي تطبيق موجود بالمشروع.

على Vercel اختر فرع التنفيذ وFramework Vite وOutput dist. ملف vercel.json يحدد تنزيل الأصول الناقصة ثم npm run build.
يجب حفظ صور public/assets بعد أول تنزيل ضمن المصدر؛ روابط Figma مؤقتة. لا تستخدم الواجهة روابط Figma أثناء التشغيل.
مهمة GitHub للصور قراءة فقط ولا تملك صلاحية كتابة أو دفع تلقائي.

VITE_ متغيرات عامة ومدمجة في المتصفح. لا تضع فيها serviceAccountKey.json أو private_key. الخيارات في .env.example.
للإنتاج المفهرس: VITE_SITE_URL بالنطاق الحقيقي وVITE_INDEXING_ENABLED=true وSEO_SYNC_FIREBASE=true.
يتوقف بناء SEO إذا طُلبت الفهرسة دون بيانات عامة أو نطاق صحيح. أعد البناء بعد تعديل المنيو لتحديث HTML والخريطة؛ تبقى المعاينات noindex.

قبل الإطلاق اختبر المدير ورفع الصور وحفظ طبق وإخفاءه والتواصل ومراجعة تقييم.
لم يتم نشر قواعد أو تغيير إعدادات Firebase الحقيقي من هذه الجلسة.
حذف الرسائل يتم من الإدارة وفق سياسة المالك؛ لا توجد مهمة حذف تلقائية مفعلة.
