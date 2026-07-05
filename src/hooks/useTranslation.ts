import { useStore } from "./useStore";

const translations = {
  en: {
    // Navigation
    appName: "CU Navigate",
    startNav: "Start Navigation",
    startNavBtn: "Start Navigating",
    exploreBtn: "Explore Campus",
    directory: "Campus Directory",
    about: "About Project",
    contact: "Contact Us",
    login: "Admin Login",
    logout: "Log Out",
    dashboard: "Admin Dashboard",
    back: "Back",
    getDirections: "Get Directions",
    clear: "Clear",

    // Landing Page
    heroTitle: "Never Get Lost at",
    heroTitleHighlight: "Cairo University",
    heroTitleEnd: "Again",
    heroSubtitle: "Find buildings, lecture halls, administrative offices, laboratories and university services instantly.",
    studentsActive: "15,000+ Students using CU Navigate",
    
    // Landing How It Works
    howItWorksTitle: "How It Works",
    howItWorksStep1Title: "Search Destination",
    howItWorksStep1Desc: "Search for any lecture hall, laboratory, administrative office, or service building.",
    howItWorksStep2Title: "Get Live Wayfinding",
    howItWorksStep2Desc: "Our smart system calculates the optimal walking route from your current gate or location.",
    howItWorksStep3Title: "Arrive Stress-Free",
    howItWorksStep3Desc: "Follow step-by-step indoor and outdoor instructions directly to your classroom.",

    // Features Section
    featuresTitle: "Premium PWA Features",
    feature1Title: "Offline Support",
    feature1Desc: "Works even in low signal lectures inside thick stone historical buildings.",
    feature2Title: "Bilingual & RTL",
    feature2Desc: "Seamless switching between Arabic and English layouts and routing.",
    feature3Title: "Apple-Style UI",
    feature3Desc: "Sleek, bottom-anchored sheets designed for rapid one-handed mobile use.",
    feature4Title: "Precise Geolocation",
    feature4Desc: "High accuracy coordinates for all main gates and faculty halls.",

    // Statistics
    statsTitle: "Campus by the Numbers",
    stats1Val: "100%",
    stats1Lbl: "Coverage of Cairo University Main Campus",
    stats2Val: "20+",
    stats2Lbl: "Faculties & Main Institutes",
    stats3Val: "1,500+",
    stats3Lbl: "Indexed Classrooms & Laboratories",
    stats4Val: "0s",
    stats4Lbl: "Login required for students",

    // Testimonials
    testimonialsTitle: "What Students Say",
    testimonial1Text: "I used to arrive 20 minutes early just to look for my exam halls. With CU Navigate, I walk directly to the hall.",
    testimonial1Author: "Sarah Ahmed, Engineering Student",
    testimonial2Text: "As a freshman in Commerce, finding the Student Affairs office felt like solving a maze. This app saved my day!",
    testimonial2Author: "Mohamed Ali, Commerce Student",

    // FAQ
    faqTitle: "Frequently Asked Questions",
    faq1Q: "Do I need to create an account or login?",
    faq1A: "No. CU Navigate is completely free and open for all students. No logins or registration required.",
    faq2Q: "Does it navigate to locations outside Cairo University?",
    faq2A: "No. The application is strictly campus-specific for Cairo University (Giza main campus) to maintain precision.",
    faq3Q: "Can I use it offline?",
    faq3A: "Yes, once loaded, the map tiles and campus database are cached in your browser so you can navigate offline.",

    // Search Page
    searchPlaceholder: "Search lecture halls, faculties, services...",
    currentLocLabel: "Current Location",
    detectGPS: "Detecting GPS location...",
    destLabel: "Where to?",
    searchResultEmpty: "No locations found matching your search.",
    allCategories: "All Places",
    catFaculty: "Faculties",
    catHalls: "Lecture Halls",
    catOffices: "Offices",
    catLabs: "Laboratories",
    catServices: "Services",
    catGates: "Campus Gates",

    // Route Setup Page
    planRoute: "Plan Your Route",
    planRouteDesc: "Choose your start and destination to begin.",
    fromLabel: "Starting Point",
    toLabel: "Destination",

    // Navigation Page
    navigatingTo: "Navigating to",
    remainingDist: "Distance Remaining",
    eta: "Est. Time (Walking)",
    min: "min",
    meters: "meters",
    arrivalMsg: "You have arrived at your destination!",
    step: "Step",
    finishNav: "End Route",

    // Directory Page
    directoryTitle: "Cairo University Directory",
    directorySubtitle: "Quickly browse campus locations by categories",
    searchDirectory: "Search directory...",

    // Destination Details
    referencesLabel: "Inside this building:",
    noReferences: "No indexed rooms or offices inside this building yet.",
    floorAbbr: "Floor",

    // Contact Page
    contactTitle: "Get in Touch",
    contactSubtitle: "Found a missing lecture hall or want to suggest a route update? Let us know.",
    contactFormName: "Full Name",
    contactFormEmail: "Student Email",
    contactFormMsg: "Message Details / Suggested Correction",
    contactFormSubmit: "Send Message",
    contactSuccess: "Thank you! Your feedback has been sent to the university admins.",

    // Admin Dashboard / Login
    adminLoginTitle: "Admin Portal",
    adminLoginSubtitle: "Login to edit campus layout, waypoints and places.",
    username: "Username",
    password: "Password",
    loginBtn: "Sign In",
    loginError: "Invalid admin credentials.",
    adminDashboardTitle: "CU Navigate Admin Dashboard",
    adminDashboardSubtitle: "Smart Campus Wayfinding Management",
    totalFaculties: "Total Faculties",
    totalPlaces: "Indexed Locations",
    totalNodes: "Path Waypoints",
    totalEdges: "Route Segments",
    recentChanges: "Recent Layout Edges",
    manageBuildings: "Manage Buildings",
    manageHalls: "Manage Lecture Halls",
    manageWaypoints: "Edit Routing Network",
    quickStats: "System Health Overview",
    dbStatus: "SQLite Database: Connected (Local Dev)",
  },
  ar: {
    // Navigation
    appName: "جامعة القاهرة Navigate",
    startNav: "ابدأ الملاحة",
    startNavBtn: "ابدأ الملاحة الآن",
    exploreBtn: "استكشف الحرم الجامعي",
    directory: "دليل الحرم الجامعي",
    about: "عن المشروع",
    contact: "اتصل بنا",
    login: "تسجيل دخول المشرف",
    logout: "تسجيل الخروج",
    dashboard: "لوحة تحكم المشرف",
    back: "رجوع",
    getDirections: "الحصول على الاتجاهات",
    clear: "مسح",

    // Landing Page
    heroTitle: "لا تضل طريقك في",
    heroTitleHighlight: "جامعة القاهرة",
    heroTitleEnd: "مرة أخرى",
    heroSubtitle: "ابحث عن المباني وقاعات المحاضرات والمكاتب الإدارية والمختبرات والخدمات الجامعية على الفور.",
    studentsActive: "أكثر من ١٥,٠٠٠ طالب يستخدمون التطبيق",

    // Landing How It Works
    howItWorksTitle: "كيف يعمل التطبيق؟",
    howItWorksStep1Title: "ابحث عن وجهتك",
    howItWorksStep1Desc: "ابحث عن أي قاعة محاضرات، مختبر علمي، مكتب إداري، أو مبنى خدمي.",
    howItWorksStep2Title: "احصل على المسار الملاحي",
    howItWorksStep2Desc: "يقوم نظامنا الذكي بحساب المسار الأمثل للسير من مكانك أو أقرب بوابة.",
    howItWorksStep3Title: "صل بسهولة وبدون توتر",
    howItWorksStep3Desc: "اتبع التعليمات التفصيلية للوصول مباشرة إلى قاعة دراستك.",

    // Features Section
    featuresTitle: "مميزات التطبيق المتميزة",
    feature1Title: "دعم العمل بدون إنترنت",
    feature1Desc: "يعمل التطبيق حتى داخل القاعات والمباني التاريخية ذات الجدران الحجرية السميكة.",
    feature2Title: "دعم اللغتين والكتابة من اليمين لليسار",
    feature2Desc: "تبديل سلس بين الواجهة العربية والإنجليزية مع تعديل الاتجاهات بالكامل.",
    feature3Title: "تصميم عصري بأسلوب آبل",
    feature3Desc: "قوائم وبطاقات مثبتة بالأسفل مصممة للاستخدام السريع بيد واحدة على الجوال.",
    feature4Title: "تحديد دقيق للموقع",
    feature4Desc: "إحداثيات عالية الدقة لجميع البوابات الرئيسية وقاعات الكليات.",

    // Statistics
    statsTitle: "الحرم الجامعي بالأرقام",
    stats1Val: "١٠٠٪",
    stats1Lbl: "تغطية كاملة للحرم الرئيسي لجامعة القاهرة",
    stats2Val: "+٢٠",
    stats2Lbl: "كلية ومعهد رئيسي مضاف",
    stats3Val: "+١,٥٠٠",
    stats3Lbl: "قاعة محاضرات ومختبر علمي مفهرس",
    stats4Val: "٠ ثانية",
    stats4Lbl: "لا يتطلب تسجيل دخول للطلاب",

    // Testimonials
    testimonialsTitle: "ماذا يقول الطلاب؟",
    testimonial1Text: "كنت أصل قبل الامتحانات بـ ٢٠ دقيقة فقط لأبحث عن مكان لجنتي. الآن مع التطبيق أتوجه مباشرة إلى قاعة الامتحانات.",
    testimonial1Author: "سارة أحمد، طالبة بكلية الهندسة",
    testimonial2Text: "كطالب مستجد في كلية التجارة، كان البحث عن شئون الطلاب يبدو كمتاهة. هذا التطبيق أنقذ يومي!",
    testimonial2Author: "محمد علي، طالب بكلية التجارة",

    // FAQ
    faqTitle: "الأسئلة الشائعة",
    faq1Q: "هل أحتاج إلى إنشاء حساب أو تسجيل دخول؟",
    faq1A: "لا. التطبيق مجاني تماماً ومفتوح لجميع الطلاب بدون الحاجة لأي حساب أو كلمة مرور.",
    faq2Q: "هل يوفر اتجاهات خارج جامعة القاهرة؟",
    faq2A: "لا. التطبيق مخصص حصرياً لداخل الحرم الجامعي لجامعة القاهرة (حرم الجيزة الرئيسي) للحفاظ على أعلى دقة.",
    faq3Q: "هل يمكنني استخدام التطبيق بدون إنترنت؟",
    faq3A: "نعم، بمجرد تحميل التطبيق لأول مرة، يتم حفظ الخرائط وقاعدة البيانات في متصفحك لتعمل في أي وقت بدون إنترنت.",

    // Search Page
    searchPlaceholder: "ابحث عن المدرجات، الكليات، الخدمات...",
    currentLocLabel: "الموقع الحالي",
    detectGPS: "جاري تحديد موقعك الجغرافي...",
    destLabel: "إلى أين تذهب؟",
    searchResultEmpty: "لم يتم العثور على مواقع تطابق بحثك.",
    allCategories: "كل الأماكن",
    catFaculty: "الكليات",
    catHalls: "المدرجات وقاعات المحاضرات",
    catOffices: "المكاتب الإدارية",
    catLabs: "المختبرات العلمية",
    catServices: "الخدمات الطلابية",
    catGates: "بوابات الجامعة",

    // Route Setup Page
    planRoute: "خطط مسارك",
    planRouteDesc: "اختر نقطة البداية والوجهة للبدء.",
    fromLabel: "نقطة البداية",
    toLabel: "الوجهة",

    // Navigation Page
    navigatingTo: "جاري الملاحة إلى",
    remainingDist: "المسافة المتبقية",
    eta: "الوقت المقدر (مشياً)",
    min: "دقيقة",
    meters: "متر",
    arrivalMsg: "لقد وصلت إلى وجهتك المطلوبة بنجاح!",
    step: "خطوة",
    finishNav: "إنهاء المسار",

    // Directory Page
    directoryTitle: "دليل جامعة القاهرة",
    directorySubtitle: "تصفح مواقع الحرم الجامعي بسرعة حسب التصنيف",
    searchDirectory: "البحث في الدليل...",

    // Destination Details
    referencesLabel: "داخل هذا المبنى:",
    noReferences: "لا توجد قاعات أو مكاتب مفهرسة داخل هذا المبنى بعد.",
    floorAbbr: "دور",

    // Contact Page
    contactTitle: "تواصل معنا",
    contactSubtitle: "هل وجدت مدرجاً مفقوداً أو ترغب في اقتراح تعديل على مسار؟ أخبرنا الآن.",
    contactFormName: "الاسم الكامل",
    contactFormEmail: "البريد الإلكتروني الجامعي",
    contactFormMsg: "تفاصيل الرسالة / التعديل المقترح",
    contactFormSubmit: "إرسال الرسالة",
    contactSuccess: "شكرًا لك! تم إرسال ملاحظاتك إلى مشرفي النظام بنجاح.",

    // Admin Dashboard / Login
    adminLoginTitle: "بوابة الإدارة",
    adminLoginSubtitle: "سجل الدخول لتعديل مخططات الكليات، المسارات، والأماكن.",
    username: "اسم المستخدم",
    password: "كلمة المرور",
    loginBtn: "تسجيل الدخول",
    loginError: "بيانات الدخول غير صحيحة.",
    adminDashboardTitle: "لوحة تحكم مشرف نظام جامعة القاهرة الملاحي",
    adminDashboardSubtitle: "إدارة إرشاد وخرائط الحرم الجامعي الذكي",
    totalFaculties: "إجمالي الكليات",
    totalPlaces: "المواقع المفهرسة",
    totalNodes: "نقاط الملاحة",
    totalEdges: "مقاطع الطرق",
    recentChanges: "المسارات المضافة حديثاً",
    manageBuildings: "إدارة مباني الكليات",
    manageHalls: "إدارة المدرجات",
    manageWaypoints: "تعديل شبكة الطرق",
    quickStats: "نظرة عامة على حالة النظام",
    dbStatus: "قاعدة بيانات SQLite: متصلة (بيئة تطوير محلي)",
  },
};

export function useTranslation() {
  const language = useStore((state) => state.language);
  
  const t = (key: keyof typeof translations.en) => {
    return translations[language][key] || translations.en[key] || "";
  };

  return { t, language };
}

export default useTranslation;
