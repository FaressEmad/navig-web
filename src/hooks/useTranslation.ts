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
    startNavBtn: "يلا ابدأ طريقك",
    exploreBtn: "لف في الحرم وجرب",
    directory: "دليل الكليات والمدرجات",
    about: "عن المشروع وفكرته",
    contact: "قولنا رأيك أو اقتراحك",
    login: "دخول لوحة التحكم",
    logout: "خروج",
    dashboard: "لوحة الإدارة",
    back: "ارجع خطوة",
    getDirections: "وصلني هنا",
    clear: "مسح التحديد",

    // Landing Page
    heroTitle: "ماتتهش في",
    heroTitleHighlight: "جامعة القاهرة",
    heroTitleEnd: "تاني أبداً!",
    heroSubtitle: "هتلاقي كل مبنى، مدرج، مكتب شؤون طلاب، معمل، أو أي خدمة جامعية في ثواني وبدون تعب.",
    studentsActive: "أكتر من ١٥,٠٠٠ طالب وطالبة بيتحركوا بيه في الجامعة",

    // Landing How It Works
    howItWorksTitle: "التطبيق بيشتغل إزاي؟",
    howItWorksStep1Title: "اكتب اسم المكان اللي محتاجه",
    howItWorksStep1Desc: "سواء كان مدرج، معمل، مكتب شؤون طلاب، أو أي مبنى خدمي.",
    howItWorksStep2Title: "احنا هنحسبلك أسهل طريق",
    howItWorksStep2Desc: "نظامنا الذكي هيجيبلك أقصر وأسرع طريق مشي من مكانك أو البوابة اللي دخلت منها.",
    howItWorksStep3Title: "توصل بالسلامة ومن غير حيرة",
    howItWorksStep3Desc: "امشي مع اتجاهات السهم خطوة بخطوة لحد باب قاعتك أو مدرجك.",

    // Features Section
    featuresTitle: "حاجات هتعجبك في التطبيق",
    feature1Title: "شغال من غير نت عادي",
    feature1Desc: "عشان شبكتك متقعش جوة المدرجات والمباني الأثرية اللي حيطانها سميكة.",
    feature2Title: "عربي وإنجليزي زي ما تحب",
    feature2Desc: "تقدر تقلب واجهة التطبيق والاتجاهات بين العربي والإنجليزي بكل سلاسة.",
    feature3Title: "واجهة سهلة وتصميم راقي",
    feature3Desc: "كل الزراير والبطاقات قريبة من إيدك تحت عشان تستخدم الموبايل بيد واحدة وأنت ماشي.",
    feature4Title: "تحديد دقيق لموقعك الجغرافي",
    feature4Desc: "أدق إحداثيات لكل بوابة من بوابات الجامعة ومدرجات الكليات.",

    // Statistics
    statsTitle: "الجامعة في أرقام وسطور",
    stats1Val: "١٠٠٪",
    stats1Lbl: "تغطية كاملة وشاملة لكل شبر في الحرم الجامعي الرئيسي",
    stats2Val: "+٢٠",
    stats2Lbl: "كلية ومعهد رئيسي متضافين بكل تفاصيلهم",
    stats3Val: "+١,٥٠٠",
    stats3Lbl: "مدرج، معمل، ومكتب مفهرسين وجاهزين للبحث",
    stats4Val: "صفر ثانية",
    stats4Lbl: "ولا تسجيل ولا بيانات، افتح واستخدم على طول!",

    // Testimonials
    testimonialsTitle: "رأي الدفعة في التطبيق",
    testimonial1Text: "كنت بضطر أنزل قبل امتحاناتي بثلث ساعة عشان ألف وأدور على قاعة اللجنة، دلوقتي مع التطبيق بروح للجنة على طول في دقيقة.",
    testimonial1Author: "سارة أحمد، هندسة القاهرة",
    testimonial2Text: "كطالبة لسة جديدة في تجارة، كان البحث عن مكتب شؤون الطلاب عامل زي المتاهة المظلمة.. التطبيق ده أنقذ يومي فعلاً!",
    testimonial2Author: "سماح محمود، تجارة القاهرة",

    // FAQ
    faqTitle: "أسئلة ممكن تدور في بالك",
    faq1Q: "هل لازم أعمل حساب أو أسجل دخول؟",
    faq1A: "لا خالص، التطبيق مفتوح ومجاني تماماً لكل زمايلنا الطلاب، ولا محتاج حساب ولا كتابة بيانات.",
    faq2Q: "هل التطبيق بيشتغل برة جامعة القاهرة؟",
    faq2A: "لا، التطبيق معمول ومخصص بس لجوة الحرم الجامعي لجامعة القاهرة بالجيزة عشان نضمن أعلى دقة في التفاصيل.",
    faq3Q: "ينفع أستخدمه وأنا معيش نت؟",
    faq3A: "آه طبعاً، بمجرد ما تفتح التطبيق أول مرة والصفحة تحمل، الخريطة وقاعدة البيانات بيتحفظوا عندك وهيشتغل معاك أوفلاين عادي جداً.",

    // Search Page
    searchPlaceholder: "عايز تروح فين؟ اكتب اسم مدرج، كلية، أو مبنى...",
    currentLocLabel: "مكانك دلوقتي",
    detectGPS: "بنحدد مكانك بالـ GPS ثواني...",
    destLabel: "رايح فين؟",
    searchResultEmpty: "ملقناش أماكن بالاسم ده، اتأكد كدة من الحروف.",
    allCategories: "كل الأماكن",
    catFaculty: "الكليات والمباني",
    catHalls: "المدرجات والقاعات",
    catOffices: "شؤون الطلاب والإدارة",
    catLabs: "المعامل والمختبرات",
    catServices: "المكتبات والخدمات",
    catGates: "بوابات الجامعة",

    // Route Setup Page
    planRoute: "ارسم طريقك",
    planRouteDesc: "حدد هتبدأ منين ورايح على فين.",
    fromLabel: "هتبدأ من",
    toLabel: "الوجهة",

    // Navigation Page
    navigatingTo: "طريقك إلى",
    remainingDist: "المسافة الفاضلة",
    eta: "الوقت المقدر (مشي)",
    min: "دقيقة",
    meters: "متر",
    arrivalMsg: "حمد الله على السلامة، وصلت لوجهتك!",
    step: "خطوة",
    finishNav: "إنهاء الرحلة",

    // Directory Page
    directoryTitle: "دليل جامعة القاهرة",
    directorySubtitle: "تصفح كل مدرجات ومباني الكليات متقسمة حسب نوعها",
    searchDirectory: "ابحث في الدليل...",

    // Destination Details
    referencesLabel: "جوة المبنى ده هتلاقي:",
    noReferences: "لسة مفيش قاعات أو مدرجات متفهرسة جوة المبنى ده.",
    floorAbbr: "الدور",

    // Contact Page
    contactTitle: "قولنا رأيك أو اقتراحك",
    contactSubtitle: "لو لقيت مدرج ناقص، أو حابب تعدل على طريق مسدود، عرفنا فوراً.",
    contactFormName: "اسمك بالكامل",
    contactFormEmail: "إيميلك الجامعي",
    contactFormMsg: "تفاصيل اقتراحك أو التعديل المكتوب",
    contactFormSubmit: "إرسال الاقتراح",
    contactSuccess: "شكراً ليك جداً! اقتراحك وصل لمشرفين النظام وهنراجعها علطول.",

    // Admin Dashboard / Login
    adminLoginTitle: "دخول المشرف",
    adminLoginSubtitle: "سجل دخول لوحة التحكم عشان تعدل في خريطة الكليات والطرق والمسارات.",
    username: "اسم المستخدم",
    password: "كلمة المرور",
    loginBtn: "تسجيل الدخول",
    loginError: "اسم المستخدم أو كلمة المرور مش صح.",
    adminDashboardTitle: "لوحة تحكم خرائط وملاحة جامعة القاهرة",
    adminDashboardSubtitle: "إدارة شبكة الطرق والمدرجات جوة الحرم الجامعي الذكي",
    totalFaculties: "إجمالي الكليات",
    totalPlaces: "المواقع والأماكن",
    totalNodes: "نقاط شبكة الطرق",
    totalEdges: "مسارات المشي",
    recentChanges: "أحدث المسارات المتضافة",
    manageBuildings: "مباني الكليات",
    manageHalls: "المدرجات والقاعات",
    manageWaypoints: "شبكة المسارات والطرق",
    quickStats: "نظرة سريعة على حالة النظام",
    dbStatus: "قاعدة البيانات SQLite: متصلة وشغالة بنجاح",
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
