# سنونو — React + Firebase

منيو عربي مع لوحة إدارة فعلية باستخدام React وTypeScript وTailwind وVite. يستخدم Firebase Authentication وFirestore وStorage فقط؛ لا Next.js أو PostgreSQL أو خادم مخصص. هذه النسخة تحل محل الخطة السابقة.

## التشغيل

نفّذ npm ci ثم npm run assets:download ثم npm run dev.
افتح /menu?preview=1 لمعاينة تجريبية دون كتابة، و/admin للإدارة الفعلية.
الوضع العادي يقرأ Firebase الحقيقي، ولا يستبدل فشل الاتصال ببيانات تجريبية صامتة.

الأصول الأصلية تنزل داخل public/assets. احفظها بعد أول تنزيل مع المستودع أو النسخة المصدرية للاستغناء عن روابط Figma المؤقتة. الواجهة تستخدم ملفات محلية. مهمة GitHub لا تملك صلاحية الكتابة أو push.

## إعداد Firebase مرة واحدة

1. فعّل Firestore وStorage وAuthentication (Email/Password وAnonymous) في taskora-bf729.
2. أنشئ مستخدم المدير في Authentication، ووثيقة snounu_admins/USER_UID بحقل enabled: true من Firestore Console.
3. ادمج firestore.rules وstorage.rules مع قواعد مشروعك القائم ثم انشرها؛ لا تستبدل قواعد Taskora دون مراجعة.
4. أضف نطاق Vercel النهائي إلى Authorized domains. App Check اختياري موصى به بعد ضبط المفتاح.
5. ادخل /admin واستورد البيانات التجريبية مرة أو أدخل بياناتك. الاستيراد يرفض قاعدة تحتوي بيانات.

راجع docs/FIREBASE_SETUP_AR.md.
مثال require('path/to/serviceAccountKey.json') ليس بيانات اعتماد. لا يحتاج التطبيق Admin SDK في المتصفح؛ لا تضع أي private_key في VITE_ أو GitHub.

## Vercel وSEO

استورد المستودع واختر فرع التنفيذ. Framework: Vite. Output: dist.
vercel.json يحدد تنزيل أي أصول ناقصة ثم npm run build ويضبط روابط React.
.env.example يوضح الخيارات؛ إعداد Firebase العام المرسل مدمج افتراضيًا.

للإنتاج المفهرس حدد نطاق HTTPS حقيقيًا في VITE_SITE_URL وفعّل VITE_INDEXING_ENABLED=true وSEO_SYNC_FIREBASE=true بعد تهيئة المحتوى.
يقرأ البناء المحتوى العام لتوليد HTML للأطباق وsitemap وrobots وRestaurant/Menu/Breadcrumb.
تحديث HTML الثابت وخرائط SEO بعد تعديل المنيو يحتاج إعادة بناء. بيانات الواجهة الحية تُقرأ عند فتح الصفحة.
تسجيل Google Business Profile والتحقق من المكان خطوة مستقلة؛ لا إحداثيات وهمية أو ضمان ترتيب.

## الاختبارات

npm test
npm run typecheck
npm run build
npm run test:browser

لاختبار القواعد، شغّل Firebase emulators ثم npm run test:rules وفق docs/FIREBASE_SETUP_AR.md.
النتائج وحدود التحقق في docs/VALIDATION.md.

## حدود المنيو

الطلب عبر مكوك https://makuk.torood.net/ وسنبل https://sonbol.ps/ فقط.
لا سلة أو دفع أو حسابات زبائن. المفضلة محلية والتقييمات تمر بالمراجعة.
سجل تقييم واحد لكل طبق وFirebase UID مع انتظار قبل التعديل. رسالة كل خمس دقائق لكل UID.
هوية مجهولة جديدة قد تتجاوز الحد؛ لا ندعي إثبات شراء أو تحديد هوية أو IP دون خادم.

الخطة الحالية: docs/superpowers/plans/2026-11-15-react-firebase.md. الوثائق الأقدم محفوظة كمرجع تاريخي، ويعلو عليها هذا القرار التقني.
