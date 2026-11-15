# SEO وGEO وخرائط Google — النسخة الحالية

التطبيق React/Vite بلا خادم مخصص. src/seo.ts وsrc/seo-core.mjs يجهزان العناوين والـcanonical وRestaurant/Menu/Breadcrumb للواجهة، وscripts/generate-seo.mjs يولد HTML ثابتًا وsitemap.xml وrobots.txt وllms.txt داخل dist.

أدخل النطاق الحقيقي في VITE_SITE_URL وفعل VITE_INDEXING_ENABLED وSEO_SYNC_FIREBASE فقط بعد تجهيز بيانات Firebase النهائية. المعاينات noindex. لتحديث HTML والخريطة بعد تغيير المنيو أعد بناء Vercel؛ الواجهة الحية تقرأ بيانات Firestore عند فتح الصفحة.

اسم المطعم والعنوان والهاتف وساعات العمل ورابط الخرائط والإحداثيات تُعدل من لوحة الإدارة. تُحذف الإحداثيات المفقودة من JSON-LD ولا تتحول إلى أصفار. لا تقييمات تجريبية أو AggregateRating مضلل. لا تُستخدم أرقام ترتيب أو تواريخ تعديل مختلقة.

sitemap خريطة صفحات للموقع، وليست تسجيلًا في Google Maps. يجب على المالك إنشاء أو إدارة Google Business Profile والتحقق من ملكية النشاط، ثم توحيد الاسم والعنوان والهاتف وموقعه الحقيقي. لا يلزم مفتاح Maps API لزر رابط Google Maps الخارجي.

بعد النشر: أضف الدومين إلى Google Search Console، أكمل التحقق عبر GOOGLE_SITE_VERIFICATION، وأرسل sitemap.xml وافحص Rich Results Test وSchema Markup Validator. llms.txt ملف مساعد ولا يضمن ظهورًا في إجابات الذكاء الاصطناعي أو ترتيبًا في Google.

مراجع رسمية:
https://developers.google.com/search/docs/appearance/structured-data/local-business
https://developers.google.com/search/docs/appearance/structured-data/breadcrumb
https://support.google.com/business/
https://vite.dev/guide/static-deploy.html
