import { Structure, StructureCategory, StructureType } from "@/types/structure";

// تبدیل اعداد انگلیسی به فارسی
export function toPersianDigits(input: number | string | undefined | null): string {
  if (input === undefined || input === null) return "";
  const str = input.toString();
  const persianDigits = ["۰", "۱", "۲", "۳", "۴", "۵", "۶", "۷", "۸", "۹"];
  return str.replace(/[0-9]/g, (w) => persianDigits[+w]);
}

// قالب‌بندی قیمت به تومان
export function formatToman(amount: number): string {
  return `${toPersianDigits(amount.toLocaleString("fa-IR"))} تومان`;
}

// قالب‌بندی خلاصه قیمت برای پین‌های نقشه و برچسب‌های سریع
export function formatShortToman(amount: number): string {
  if (amount >= 1_000_000_000) {
    const b = (amount / 1_000_000_000).toFixed(1).replace(/\.0$/, "");
    return `${toPersianDigits(b)} میلیارد`;
  }
  if (amount >= 1_000_000) {
    const m = (amount / 1_000_000).toFixed(0);
    return `${toPersianDigits(m)} م`;
  }
  return formatToman(amount);
}

export const mockStructureTypes: StructureType[] = [
  {
    id: "billboard",
    name: "بیلبورد",
    slug: "billboard",
    description: "تابلوهای عریض بزرگراهی و تقاطع‌های پرتردد با حداکثر برد دید",
    count: 248,
    iconName: "Monitor",
  },
  {
    id: "bridge",
    name: "عرشه پل",
    slug: "bridge",
    description: "تابلوهای نصب‌شده روی پل‌های عابر پیاده و سواره‌رو در مرکز دید رانندگان",
    count: 112,
    iconName: "Maximize2",
  },
  {
    id: "straboard",
    name: "استرابورد",
    slug: "straboard",
    description: "سازه‌های عمودی مدرن بادگیر، ایده‌آل برای بلوارهای شهری و مراکز تجاری",
    count: 175,
    iconName: "Columns",
  },
  {
    id: "urban_tv",
    name: "تلویزیون شهری",
    slug: "urban_tv",
    description: "نمایشگرهای تمام‌رنگی دیجیتال با نرخ فریم بالا در میادین کلیدی",
    count: 64,
    iconName: "Tv",
  },
  {
    id: "lamppost",
    name: "لمپوست بنر",
    slug: "lamppost",
    description: "تبلیغات سریالی و متوالی نصب‌شده بر پایه‌های چراغ برق در حاشیه خیابان‌ها",
    count: 88,
    iconName: "Layers",
  },
];

export const mockStructureCategories: StructureCategory[] = [
  {
    id: "highway",
    name: "اتوبانی و بزرگراهی",
    slug: "highway",
    description: "محورهای شریانی پرسرعت با ترافیک متراکم روزانه",
    count: 290,
  },
  {
    id: "commercial",
    name: "مراکز تجاری و اداری",
    slug: "commercial",
    description: "معابر اطراف مال‌ها، بازارها و مراکز اصلی خرید",
    count: 185,
  },
  {
    id: "square",
    name: "میادین و تقاطع‌های کلیدی",
    slug: "square",
    description: "نقاط توقف خودروها پشت چراغ قرمز با ماندگاری دید بالا",
    count: 120,
  },
  {
    id: "cultural",
    name: "فرهنگی و دانشگاهی",
    slug: "cultural",
    description: "حوالی مراکز علمی، دانشگاهی، پارک‌ها و فرهنگسراها",
    count: 52,
  },
  {
    id: "suburban",
    name: "مبادی ورودی و خروجی شهر",
    slug: "suburban",
    description: "مسیرهای فرودگاهی و شاهراه‌های مواصلاتی بین‌شهری",
    count: 40,
  },
];

export const mockStructures: Structure[] = [
  {
    id: "str-101",
    code: "TH-HEM-101",
    title: "بیلبورد اتوبان همت - تقاطع ستاری",
    slug: "billboard-hemmat-sattari",
    type: mockStructureTypes[0], // بیلبورد
    category: mockStructureCategories[0], // بزرگراهی
    status: "available",
    statusLabel: "آماده اکران فوری",
    dimensions: {
      width: 15,
      height: 5,
      area: 75,
      label: "۱۵ × ۵ متر (۷۵ متر مربع)",
    },
    location: {
      city: "تهران",
      province: "تهران",
      district: "منطقه ۵ - بزرگراه همت غرب",
      address: "بزرگراه شهید همت، ۵۰۰ متر مانده به تقاطع بزرگراه ستاری، مسیر شرق به غرب",
      lat: 35.7512,
      lng: 51.3120,
      viewingAngle: "دید مستقیم روبرو از فاصله ۶۰۰ متری بدون مانع",
      trafficFlow: "فوق‌العاده سنگین (میانگین ۱۸۵,۰۰۰ خودرو روزانه)",
    },
    pricing: {
      basePriceMonthly: 280000000,
      dailyRate: 9330000,
      currency: "تومان",
      discountMonthlyPercent: 8,
      printablePrice: "۲۸۰,۰۰۰,۰۰۰ تومان / ماهانه",
    },
    specs: {
      lighting: "۸ عدد پرژکتور LED متقارن هوشمند با مصرف بهینه (دید درخشان شب)",
      orientation: "شرق به غرب (دید خودروهای خروجی از مرکز شهر)",
      visibilityScore: 98,
      minDurationDays: 15,
      mediaType: "بنر فلکسی گرید A با چاپ UV مقاوم در برابر آفتاب",
      isTwoSided: false,
      rushHourPeak: "صبح‌ها: ۷:۰۰ الی ۱۰:۳۰ | عصرها: ۱۶:۳۰ الی ۲۱:۳۰",
    },
    images: {
      day: "https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=1200&q=80",
      night: "https://images.unsplash.com/photo-1519501025264-65ba15a82390?auto=format&fit=crop&w=1200&q=80",
      gallery: [
        "https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1519501025264-65ba15a82390?auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1572945550744-57049dcbc1b3?auto=format&fit=crop&w=1200&q=80",
      ],
    },
    description:
      "این بیلبورد در یکی از پرترددترین مقاطع اتوبان همت غرب واقع شده است. با توجه به تجمع ترافیک خودروها در ساعات اوج نرسیده به تقاطع ستاری، مخاطبان زمان توقف دید بیش از ۴۵ ثانیه در مقابل این سازه خواهند داشت. موقعیت عالی جهت اجرای کمپین‌های آگاهی از برند (Brand Awareness) برای شرکت‌های فناوری، بانک‌ها و صنایع غذایی.",
    features: [
      "روشنایی هوشمند شبانه با تایمر اتوماتیک",
      "ارتفاع دید مناسب از سطح آسفالت (۶.۵ متر)",
      "فاقد هرگونه مانع درختی یا دکل مخابراتی",
      "امکان عقد قرارداد مستقیم با کانون رسمی",
      "بیمه مسئولیت مدنی کامل سازه",
    ],
    owner: {
      name: "کانون تبلیغاتی آوای رسانه تهران",
      verified: true,
      rating: 4.9,
      contactNumber: "02188442211",
    },
    createdAt: "2026-01-10",
  },
  {
    id: "str-102",
    code: "TH-SAD-204",
    title: "عرشه پل طبقاتی صدر - مسیر غرب به شرق",
    slug: "bridge-sadr-west-to-east",
    type: mockStructureTypes[1], // عرشه پل
    category: mockStructureCategories[0], // بزرگراهی
    status: "available",
    statusLabel: "آماده اکران فوری",
    dimensions: {
      width: 28,
      height: 3.5,
      area: 98,
      label: "۲۸ × ۳.۵ متر (۹۸ متر مربع)",
    },
    location: {
      city: "تهران",
      province: "تهران",
      district: "منطقه ۳ - بزرگراه طبقاتی صدر",
      address: "بزرگراه طبقاتی شهید صدر، بعد از ورودی قیطریه، به سمت کامرانیه و پاسداران",
      lat: 35.7890,
      lng: 51.4310,
      viewingAngle: "دید افقی فوق‌العاده عریض در خط مستقیم پل طبقاتی",
      trafficFlow: "ترافیک سنگین طبقه فوقانی شمال تهران (۱۶۰,۰۰۰ خودرو)",
    },
    pricing: {
      basePriceMonthly: 420000000,
      dailyRate: 14000000,
      currency: "تومان",
      discountMonthlyPercent: 10,
      printablePrice: "۴۲۰,۰۰۰,۰۰۰ تومان / ماهانه",
    },
    specs: {
      lighting: "نورپردازی یکنواخت SMD نسل جدید بدون افت نور در گوشه‌ها",
      orientation: "غرب به شرق (دید مسافران به سمت مناطق ۱ و ۳)",
      visibilityScore: 99,
      minDurationDays: 30,
      mediaType: "فلکسی کره‌ای ۵۵۰ گرمی با چاپ ضدآب مات",
      isTwoSided: false,
      rushHourPeak: "۱۶:۰۰ الی ۲۲:۰۰ (ترافیک بازگشت به شمال شرق تهران)",
    },
    images: {
      day: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1200&q=80",
      night: "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=1200&q=80",
      gallery: [
        "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1563245372-f21724e3856d?auto=format&fit=crop&w=1200&q=80",
      ],
    },
    description:
      "عرشه پل طبقاتی صدر لوکس‌ترین و پرمخاطب‌ترین موقعیت اکران تبلیغات در پهنه شمالی تهران محسوب می‌شود. عبور مخاطبان با طبقه درآمدی الف و ب (A & B) و تراکم بالای خودروهای مدرن، این رسانه را به انتخاب اول برندهای لوکس خودرویی، ساعت، فناوری و خدمات مالی تبدیل کرده است.",
    features: [
      "طول نمایشی استثنایی ۲۸ متر برای شعارهای تاثیرگذار",
      "ارتفاع ایده‌آل روی پل بدون انحراف زاویه دید راننده",
      "قابلیت دید در شب تا شعاع ۸۵۰ متری",
      "پوشش انحصاری بازار مخاطبان مرفه شمال پایتخت",
    ],
    owner: {
      name: "شرکت رسانه‌گستر نگاه نو",
      verified: true,
      rating: 5.0,
      contactNumber: "02122668899",
    },
    createdAt: "2026-01-15",
  },
  {
    id: "str-103",
    code: "TH-VAN-301",
    title: "لمپوست ولیعصر - محدوده میدان ونک",
    slug: "lamppost-valiasr-vanak",
    type: mockStructureTypes[4], // لمپوست
    category: mockStructureCategories[1], // تجاری
    status: "available",
    statusLabel: "آماده اکران فوری",
    dimensions: {
      width: 1.2,
      height: 3.2,
      area: 3.84,
      label: "۱.۲ × ۳.۲ متر (سری ۸ تایی)",
    },
    location: {
      city: "تهران",
      province: "تهران",
      district: "منطقه ۳ - خیابان ولیعصر",
      address: "خیابان ولیعصر، فاصله میان پل همت تا میدان ونک، هر دو لاین رفت و برگشت",
      lat: 35.7570,
      lng: 51.4110,
      viewingAngle: "دید دوطرفه از پیاده‌رو و سواره‌رو به شکل پکیج زنجیره‌ای",
      trafficFlow: "تردد پیاده و سواره بسیار بالا در قلب قطب تجاری اداری ونک",
    },
    pricing: {
      basePriceMonthly: 145000000,
      dailyRate: 4830000,
      currency: "تومان",
      discountMonthlyPercent: 5,
      printablePrice: "۱۴۵,۰۰۰,۰۰۰ تومان / ماهانه (پکیج)",
    },
    specs: {
      lighting: "نورپردازی هالوژنی متمرکز بالا و پایین هر پایه",
      orientation: "شمال به جنوب و جنوب به شمال (دو وجهی)",
      visibilityScore: 92,
      minDurationDays: 15,
      mediaType: "بنر دو رو مات با سیستم فنری کاهش فشار باد",
      isTwoSided: true,
      rushHourPeak: "تمام طول روز از ساعت ۸:۰۰ صبح الی ۲۲:۳۰",
    },
    images: {
      day: "https://images.unsplash.com/photo-1563245372-f21724e3856d?auto=format&fit=crop&w=1200&q=80",
      night: "https://images.unsplash.com/photo-1519501025264-65ba15a82390?auto=format&fit=crop&w=1200&q=80",
      gallery: [
        "https://images.unsplash.com/photo-1563245372-f21724e3856d?auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1519501025264-65ba15a82390?auto=format&fit=crop&w=1200&q=80",
      ],
    },
    description:
      "پکیج لمپوست بنرهای خیابان ولیعصر در مجاورت میدان ونک به صورت سریالی تکرار می‌شوند که ماندگاری پیام برند در ذهن مخاطب را به طرز چشمگیری بالا می‌برد. مناسب برای کمپین‌های ریتیل، جشنواره‌های تخفیف و لانچ محصولات جدید.",
    features: [
      "عرضه به صورت پکیج ۸ تایی متوالی برای تکرار پیام",
      "پوشش همزمان مخاطبان پیاده و راکبان خودرو و تاکسی",
      "پایه‌های مدرن شکیل با تاییدیه زیباسازی شهرداری",
    ],
    owner: {
      name: "سازمان تبلیغات شهروند",
      verified: true,
      rating: 4.7,
      contactNumber: "02188771122",
    },
    createdAt: "2026-02-01",
  },
  {
    id: "str-104",
    code: "TH-MOD-402",
    title: "بیلبورد بزرگراه مدرس - پل میرداماد",
    slug: "billboard-modarres-mirdamad",
    type: mockStructureTypes[0], // بیلبورد
    category: mockStructureCategories[0], // بزرگراهی
    status: "booked",
    statusLabel: "در حال اکران (رزرو برای دوره بعد)",
    dimensions: {
      width: 18,
      height: 6,
      area: 108,
      label: "۱۸ × ۶ متر (۱۰۸ متر مربع)",
    },
    location: {
      city: "تهران",
      province: "تهران",
      district: "منطقه ۳ - بزرگراه مدرس شمال",
      address: "بزرگراه مدرس به سمت شمال، قبل از تقاطع بلوار میرداماد، جنب ایستگاه مترو",
      lat: 35.7620,
      lng: 51.4220,
      viewingAngle: "دید در شیب ملایم با حداکثر تسلط بر خطوط ترافیکی",
      trafficFlow: "۲۱۰,۰۰۰ خودرو در روز (شریان اصلی تردد شمال-جنوب)",
    },
    pricing: {
      basePriceMonthly: 360000000,
      dailyRate: 12000000,
      currency: "تومان",
      discountMonthlyPercent: 12,
      printablePrice: "۳۶۰,۰۰۰,۰۰۰ تومان / ماهانه",
    },
    specs: {
      lighting: "پروژکتورهای متال هالید ۴۰۰ وات با پرتو هدایت‌شده ضد انعکاس",
      orientation: "جنوب به شمال",
      visibilityScore: 97,
      minDurationDays: 30,
      mediaType: "فلکسی ضد چروک با چاپ ۱۰ رنگ صنعتی",
      isTwoSided: false,
      rushHourPeak: "۱۵:۳۰ الی ۲۱:۰۰ (ترافیک عصرگاهی برگشت به سمت شمال)",
    },
    images: {
      day: "https://images.unsplash.com/photo-1572945550744-57049dcbc1b3?auto=format&fit=crop&w=1200&q=80",
      night: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1200&q=80",
      gallery: [
        "https://images.unsplash.com/photo-1572945550744-57049dcbc1b3?auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1200&q=80",
      ],
    },
    description:
      "بزرگراه مدرس به عنوان راهبردی‌ترین محور شمال-جنوب پایتخت، میزبان این سازه غول‌پیکر ۱۰۸ متری است. این سازه در موقعیتی استثنایی قبل از خروجی میرداماد قرار داشته و چشم‌انداز باز تا فاصله ۱ کیلومتری را در اختیار دارد.",
    features: [
      "ابعاد فوق بزرگ ۱۰۸ متری برای تسلط بصری کامل",
      "رویت توسط مدیران ارشد، سفارت‌خانه‌ها و شرکت‌های بین‌المللی",
      "دید عالی در هر دو وضعیت ترافیک روان و ایستگاه سنگین",
    ],
    owner: {
      name: "کانون تبلیغاتی فراسو",
      verified: true,
      rating: 4.8,
      contactNumber: "02122883344",
    },
    createdAt: "2026-01-20",
  },
  {
    id: "str-105",
    code: "TH-AND-505",
    title: "استرابورد بلوار اندرزگو - نبش اشکستان‌پور",
    slug: "straboard-andarzgoo-ashkestanpoor",
    type: mockStructureTypes[2], // استرابورد
    category: mockStructureCategories[1], // تجاری
    status: "available",
    statusLabel: "آماده اکران فوری",
    dimensions: {
      width: 3,
      height: 4,
      area: 12,
      label: "۳ × ۴ متر (۱۲ متر مربع)",
    },
    location: {
      city: "تهران",
      province: "تهران",
      district: "منطقه ۱ - فرمانیه و اندرزگو",
      address: "بلوار شهید اندرزگو، نرسیده به چهارراه کامرانیه، روبروی رستوران‌های برند",
      lat: 35.8010,
      lng: 51.4550,
      viewingAngle: "دید عمودی در زاویه ۹۰ درجه نسبت به محور خیابان",
      trafficFlow: "تردد سنگین خودروهای لوکس و پیاده‌روی شبانه جوانان",
    },
    pricing: {
      basePriceMonthly: 95000000,
      dailyRate: 3160000,
      currency: "تومان",
      discountMonthlyPercent: 0,
      printablePrice: "۹۵,۰۰۰,۰۰۰ تومان / ماهانه",
    },
    specs: {
      lighting: "سیستم نورپردازی LED پنهان در فریم فوقانی",
      orientation: "غرب به شرق",
      visibilityScore: 89,
      minDurationDays: 15,
      mediaType: "بنر کتان مات ضد چین‌خوردگی با مهاربند جانبی",
      isTwoSided: false,
      rushHourPeak: "۱۹:۰۰ الی ۰۱:۰۰ بامداد (اوج پویایی شبانه اندرزگو)",
    },
    images: {
      day: "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=1200&q=80",
      night: "https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=1200&q=80",
      gallery: [
        "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=1200&q=80",
      ],
    },
    description:
      "بلوار اندرزگو شناخته‌شده‌ترین پاتوق شبانه شمال تهران برای کافه‌گردی، رستوران‌ها و خرید لوکس است. این استرابورد در مجاورت تراکم بالای خودروها و سرعت پایین حرکت، بازدهی تبلیغاتی بسیار چشمگیری در قشر جوان با توان مالی بالا ایجاد می‌کند.",
    features: [
      "تمرکز ویژه بر مخاطبان سبک زندگی لوکس و جوان",
      "دید طولانی به دلیل سرعت پایین حرکت خودروها در عصر و شب",
      "سازگار با طراحی‌های گرافیکی مینیمال عمودی",
    ],
    owner: {
      name: "رسانه مدرن شمیران",
      verified: true,
      rating: 4.9,
      contactNumber: "02122334455",
    },
    createdAt: "2026-02-05",
  },
  {
    id: "str-106",
    code: "TH-KAJ-601",
    title: "تلویزیون شهری میدان کاج - سعادت‌آباد",
    slug: "urban-tv-kaj-square",
    type: mockStructureTypes[3], // تلویزیون شهری
    category: mockStructureCategories[2], // میادین
    status: "available",
    statusLabel: "آماده اکران فوری",
    dimensions: {
      width: 10,
      height: 6,
      area: 60,
      label: "۱۰ × ۶ متر (۶۰ متر مربع نمایشگر 4K)",
    },
    location: {
      city: "تهران",
      province: "تهران",
      district: "منطقه ۲ - سعادت آباد",
      address: "میدان کاج، ضلع شمال شرقی میدان، مشرف به ورودی بلوار شهرداری و سرو",
      lat: 35.7830,
      lng: 51.3730,
      viewingAngle: "دید ۳۶۰ درجه از تمام ورودی‌های میدان به صورت واید",
      trafficFlow: "توقف طولانی در چرخش میدان و توقف‌های چراغ راهنمایی",
    },
    pricing: {
      basePriceMonthly: 310000000,
      dailyRate: 10330000,
      currency: "تومان",
      discountMonthlyPercent: 15,
      printablePrice: "۳۱۰,۰۰۰,۰۰۰ تومان / ماهانه (پکیج تکرار ویدیویی)",
    },
    specs: {
      lighting: "ماژول‌های LED سری P4 با روشنایی ۸۰۰۰ نیت (دید شفاف زیر نور مستقیم خورشید)",
      orientation: "جنوب غربی به شمال شرقی",
      visibilityScore: 96,
      minDurationDays: 10,
      mediaType: "پخش ویدیو موشن ۳۰ ثانیه‌ای با رزولوشن UHD، حداقل ۴۵۰ بار پخش در روز",
      isTwoSided: false,
      rushHourPeak: "صبح‌ها ۸ تا ۱۰ | عصر و شب‌ها ۱۷:۳۰ الی ۲۳:۳۰",
    },
    images: {
      day: "https://images.unsplash.com/photo-1519501025264-65ba15a82390?auto=format&fit=crop&w=1200&q=80",
      night: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1200&q=80",
      gallery: [
        "https://images.unsplash.com/photo-1519501025264-65ba15a82390?auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1200&q=80",
      ],
    },
    description:
      "تلویزیون دیجیتال میدان کاج نگین تبلیغات دیجیتال غرب تهران است. قابلیت پخش محتوای متحرک، تیزرهای موشن گرافیک و تصاویر ۳ بعدی (Anamorphic 3D) جذابیت غیرقابل انکاری برای رهگذران و سرنشینان خودرو در زمان انتظار دور میدان فراهم می‌سازد.",
    features: [
      "قابلیت تغییر محتوا و تیزر به صورت هفتگی از طریق پنل آنلاین",
      "امکان اکران کلیپ‌های تبلیغاتی ۳ بعدی (3D Billboard Effect)",
      "تکرار تضمین‌شده ۴۵۰ بار در شبانه‌روز با گزارش لاگ دیجیتال",
      "روشنایی تطبیقی اتوماتیک متناسب با نور محیط",
    ],
    owner: {
      name: "دیجیتال مدیا پایتخت",
      verified: true,
      rating: 4.9,
      contactNumber: "02122119988",
    },
    createdAt: "2026-02-10",
  },
  {
    id: "str-107",
    code: "TH-CHA-701",
    title: "بیلبورد بزرگراه چمران - تقاطع جلال آل‌احمد",
    slug: "billboard-chamran-jalal",
    type: mockStructureTypes[0], // بیلبورد
    category: mockStructureCategories[0], // بزرگراهی
    status: "available",
    statusLabel: "آماده اکران فوری",
    dimensions: {
      width: 16,
      height: 5.5,
      area: 88,
      label: "۱۶ × ۵.۵ متر (۸۸ متر مربع)",
    },
    location: {
      city: "تهران",
      province: "تهران",
      district: "منطقه ۶ - بزرگراه چمران جنوب",
      address: "بزرگراه شهید چمران، تقاطع پل گیشا (جلال آل احمد)، به سمت میدان توحید",
      lat: 35.7330,
      lng: 51.3810,
      viewingAngle: "دید افقی فوق‌العاده با شیب رو به پایین نرسیده به پل نصر",
      trafficFlow: "بیش از ۱۹۰,۰۰۰ خودرو در روز میان دانشگاه‌های تهران، تربیت مدرس و مرکز",
    },
    pricing: {
      basePriceMonthly: 250000000,
      dailyRate: 8330000,
      currency: "تومان",
      discountMonthlyPercent: 7,
      printablePrice: "۲۵۰,۰۰۰,۰۰۰ تومان / ماهانه",
    },
    specs: {
      lighting: "پروژکتورهای هوشمند ال‌ای‌دی کم‌مصرف آفتابی و مهتابی ترکیبی",
      orientation: "شمال به جنوب",
      visibilityScore: 94,
      minDurationDays: 15,
      mediaType: "بنر کره ای ضد پارگی UV",
      isTwoSided: false,
      rushHourPeak: "۷:۳۰ الی ۱۰:۰۰ و ۱۶:۰۰ الی ۲۱:۰۰",
    },
    images: {
      day: "https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=1200&q=80",
      night: "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=1200&q=80",
      gallery: [
        "https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=1200&q=80",
      ],
    },
    description:
      "قرارگیری در مجاورت دانشگاه‌های تراز اول کشور و ورودی به پهنه مرکزی پایتخت، این بیلبورد را برای تبلیغات محصولات فناوری اطلاعات، استارتاپ‌ها، پلتفرم‌های اینترنتی و خدمات آموزشی به انتخابی بی‌نظیر تبدیل کرده است.",
    features: [
      "دید گسترده از فاصله ۵۰۰ متری",
      "همپوشانی با جمعیت نخبگان، دانشجویان و پزشکان",
      "نزدیکی به مراکز درمانی و دانشگاهی بزرگ",
    ],
    owner: {
      name: "کانون تبلیغاتی پرتو نور",
      verified: true,
      rating: 4.6,
      contactNumber: "02188001155",
    },
    createdAt: "2026-01-25",
  },
  {
    id: "str-108",
    code: "TH-RES-803",
    title: "عرشه پل بزرگراه رسالت - نرسیده به سیدخندان",
    slug: "bridge-resalat-seyed-khandan",
    type: mockStructureTypes[1], // عرشه پل
    category: mockStructureCategories[0], // بزرگراهی
    status: "available",
    statusLabel: "آماده اکران فوری",
    dimensions: {
      width: 24,
      height: 3.2,
      area: 76.8,
      label: "۲۴ × ۳.۲ متر (۷۶.۸ متر مربع)",
    },
    location: {
      city: "تهران",
      province: "تهران",
      district: "منطقه ۷ - بزرگراه رسالت (سلیمانی)",
      address: "بزرگراه شهید سلیمانی (رسالت)، ۷۰۰ متر نرسیده به پل سیدخندان، مسیر غرب به شرق",
      lat: 35.7420,
      lng: 51.4460,
      viewingAngle: "دید افقی گسترده بر روی پل عابر با زاویه کاملاً مسلط",
      trafficFlow: "شاهراه ارتباطی شرق و غرب تهران با ۱۷۰,۰۰۰ تردد روزانه",
    },
    pricing: {
      basePriceMonthly: 210000000,
      dailyRate: 7000000,
      currency: "تومان",
      discountMonthlyPercent: 6,
      printablePrice: "۲۱۰,۰۰۰,۰۰۰ تومان / ماهانه",
    },
    specs: {
      lighting: "نورپردازی استاندارد خطی بدون سایه‌اندازی",
      orientation: "غرب به شرق",
      visibilityScore: 91,
      minDurationDays: 15,
      mediaType: "چاپ فلکسی مقاوم در برابر باد و بارندگی",
      isTwoSided: false,
      rushHourPeak: "صبح‌ها به سمت غرب، عصرها به سمت شرق",
    },
    images: {
      day: "https://images.unsplash.com/photo-1572945550744-57049dcbc1b3?auto=format&fit=crop&w=1200&q=80",
      night: "https://images.unsplash.com/photo-1519501025264-65ba15a82390?auto=format&fit=crop&w=1200&q=80",
      gallery: [
        "https://images.unsplash.com/photo-1572945550744-57049dcbc1b3?auto=format&fit=crop&w=1200&q=80",
      ],
    },
    description:
      "بزرگراه رسالت شریان حیاتی دسترسی به مناطق شرق و شمال شرق تهران است. با استقرار این عرشه پل در نزدیکی قطب ارتباطی سیدخندان، تبلیغ شما در کانون توجه قشر وسیعی از کارمندان، اصناف و خانواده‌ها قرار می‌گیرد.",
    features: [
      "دید کامل از خطوط عادی و خطوط ویژه اتوبوس تندرو (BRT)",
      "تعرفه رقابتی نسبت به بازدهی و جمعیت تحت پوشش",
      "نصب و تعویض آسان پوستر با تیم اکران تخصصی",
    ],
    owner: {
      name: "شرکت تبلیغات آرمان شرق",
      verified: true,
      rating: 4.8,
      contactNumber: "02177665544",
    },
    createdAt: "2026-02-02",
  },
  {
    id: "str-109",
    code: "TH-DAD-901",
    title: "استرابورد شهرک غرب - بلوار دادمان",
    slug: "straboard-shahrak-gharb-dadman",
    type: mockStructureTypes[2], // استرابورد
    category: mockStructureCategories[1], // تجاری
    status: "reserved",
    statusLabel: "رزرو موقت (استعلام بازگشایی)",
    dimensions: {
      width: 3,
      height: 4,
      area: 12,
      label: "۳ × ۴ متر (۱۲ متر مربع)",
    },
    location: {
      city: "تهران",
      province: "تهران",
      district: "منطقه ۲ - شهرک غرب",
      address: "بلوار شهید دادمان، تقاطع فلامک شمالی، روبروی مراکز خرید مدرن",
      lat: 35.7720,
      lng: 51.3650,
      viewingAngle: "دید عمودی در زاویه مستقیم دید رانندگان و رهگذران پیاده",
      trafficFlow: "تردد آرام و باکفایت خانوارها با قدرت خرید بالا در منطقه ۲",
    },
    pricing: {
      basePriceMonthly: 110000000,
      dailyRate: 3660000,
      currency: "تومان",
      discountMonthlyPercent: 0,
      printablePrice: "۱۱۰,۰۰۰,۰۰۰ تومان / ماهانه",
    },
    specs: {
      lighting: "پروژکتورهای خطی ال‌ای‌دی با رفلکتور بازتابی ملایم",
      orientation: "شرق به غرب",
      visibilityScore: 90,
      minDurationDays: 15,
      mediaType: "بنر کتان مات با گرماژ ۵۰۰ گرم",
      isTwoSided: false,
      rushHourPeak: "۱۲:۰۰ الی ۱۵:۰۰ و ۱۸:۰۰ الی ۲۳:۰۰",
    },
    images: {
      day: "https://images.unsplash.com/photo-1563245372-f21724e3856d?auto=format&fit=crop&w=1200&q=80",
      night: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1200&q=80",
      gallery: [
        "https://images.unsplash.com/photo-1563245372-f21724e3856d?auto=format&fit=crop&w=1200&q=80",
      ],
    },
    description:
      "بلوار دادمان در قلب شهرک غرب کانون تجمع کافه‌ها، کلینیک‌های زیبایی و فروشگاه‌های معتبر است. استرابورد حاضر با ابعاد استاندارد شهرداری و ارتفاع مطلوب، دسترسی حداکثری به مخاطبان هدف مرفه را تضمین می‌نماید.",
    features: [
      "مجاورت مستقیم با مجتمع‌های تجاری و رستوران‌های معروف",
      "ایجاد تصویر برند معتبر در ذهن اهالی شهرک غرب و سعادت‌آباد",
      "سرعت پیمایش پایین خودروها و افزایش شانس ثبت پیام تبلیغ",
    ],
    owner: {
      name: "افق رسانه غرب",
      verified: true,
      rating: 4.8,
      contactNumber: "02188361234",
    },
    createdAt: "2026-01-28",
  },
  {
    id: "str-110",
    code: "TH-HAK-102",
    title: "بیلبورد بزرگراه حکیم - خروجی یادگار امام",
    slug: "billboard-hakim-yadegar",
    type: mockStructureTypes[0], // بیلبورد
    category: mockStructureCategories[0], // بزرگراهی
    status: "available",
    statusLabel: "آماده اکران فوری",
    dimensions: {
      width: 15,
      height: 5,
      area: 75,
      label: "۱۵ × ۵ متر (۷۵ متر مربع)",
    },
    location: {
      city: "تهران",
      province: "تهران",
      district: "منطقه ۲ و ۵ - بزرگراه شهید حکیم",
      address: "بزرگراه شهید حکیم، ۲۰۰ متر بعد از تقاطع یادگار امام، مسیر شرق به غرب",
      lat: 35.7410,
      lng: 51.3460,
      viewingAngle: "دید کاملاً بدون مانع با زاویه تمایل رو به خودروها",
      trafficFlow: "بسیار سنگین در عصرها (۱۷۵,۰۰۰ خودرو روزانه)",
    },
    pricing: {
      basePriceMonthly: 235000000,
      dailyRate: 7830000,
      currency: "تومان",
      discountMonthlyPercent: 5,
      printablePrice: "۲۳۵,۰۰۰,۰۰۰ تومان / ماهانه",
    },
    specs: {
      lighting: "پروژکتورهای هوشمند ال‌ای‌دی با سنسور تشخیص نور محیط",
      orientation: "شرق به غرب",
      visibilityScore: 95,
      minDurationDays: 15,
      mediaType: "چاپ فلکسی اکوسالونت ضدآب",
      isTwoSided: false,
      rushHourPeak: "۱۶:۳۰ الی ۲۱:۳۰",
    },
    images: {
      day: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1200&q=80",
      night: "https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=1200&q=80",
      gallery: [
        "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1200&q=80",
      ],
    },
    description:
      "بزرگراه حکیم به عنوان یکی از موازی‌ترین شریان‌های همت، حجم انبوهی از بار ترافیکی مسافران غرب پایتخت، کرج و شهرک‌های غربی را جابجا می‌کند. خروجی یادگار نقطه ثقل تلاقی مسافران شمال و غرب تهران است.",
    features: [
      "دید مطلوب در انحنای ملایم اتوبان",
      "روشنایی قدرتمند بدون سایه‌اندازی روی کلمات کلیدی طرح",
      "گواهی ایمنی تایید شده از مراجع ذیصلاح",
    ],
    owner: {
      name: "کانون تبلیغاتی آوای رسانه تهران",
      verified: true,
      rating: 4.9,
      contactNumber: "02188442211",
    },
    createdAt: "2026-02-08",
  },
  {
    id: "str-111",
    code: "TH-VAL-111",
    title: "تلویزیون شهری میدان ولیعصر",
    slug: "urban-tv-valiasr-square",
    type: mockStructureTypes[3], // تلویزیون شهری
    category: mockStructureCategories[2], // میادین
    status: "available",
    statusLabel: "آماده اکران فوری",
    dimensions: {
      width: 12,
      height: 7,
      area: 84,
      label: "۱۲ × ۷ متر (۸۴ متر مربع وضوح بالا)",
    },
    location: {
      city: "تهران",
      province: "تهران",
      district: "منطقه ۶ - میدان ولیعصر",
      address: "میدان حضرت ولیعصر (عج)، مشرف به پلازای میدان و تقاطع کریم‌خان زند",
      lat: 35.7115,
      lng: 51.4070,
      viewingAngle: "دید فوق‌العاده از سراسر میدان و خروجی‌های ایستگاه مترو",
      trafficFlow: "تردد پیاده فوق‌العاده متراکم به همراه ترافیک سواره خطوط اصلی مرکز تهران",
    },
    pricing: {
      basePriceMonthly: 390000000,
      dailyRate: 13000000,
      currency: "تومان",
      discountMonthlyPercent: 10,
      printablePrice: "۳۹۰,۰۰۰,۰۰۰ تومان / ماهانه (پکیج دیجیتال)",
    },
    specs: {
      lighting: "نمایشگر دیجیتال Outdoor سری P3.9 با زاویه دید ۱۶۰ درجه",
      orientation: "شمال به جنوب و تسلط بر محوطه پلازا",
      visibilityScore: 99,
      minDurationDays: 10,
      mediaType: "پخش اسلات ۲۰ ثانیه‌ای حداقل ۵۰۰ مرتبه در ۲۴ ساعت",
      isTwoSided: false,
      rushHourPeak: "سراسر روز از ۷:۰۰ صبح تا ۲۳:۳۰ شب به صورت پیوسته",
    },
    images: {
      day: "https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=1200&q=80",
      night: "https://images.unsplash.com/photo-1519501025264-65ba15a82390?auto=format&fit=crop&w=1200&q=80",
      gallery: [
        "https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=1200&q=80",
      ],
    },
    description:
      "میدان ولیعصر قلب تپنده حمل‌ونقل و خریدهای فرهنگی، تکنولوژی و پوشاک مرکز پایتخت است. این نمایشگر غول‌پیکر با مشرف بودن به ایوان انتظار و تلاقی خطوط ۳ و ۶ مترو، روزانه با صدها هزار چشم ارتباط زنده برقرار می‌نماید.",
    features: [
      "موقعیت نمادین و استراتژیک در مرکز جغرافیایی پایتخت",
      "پوشش مسافران پرشمار ایستگاه تقاطعی مترو میدان ولیعصر",
      "امکان پیاده‌سازی شمارشگر معکوس و پخش زنده رویدادها",
    ],
    owner: {
      name: "دیجیتال مدیا پایتخت",
      verified: true,
      rating: 4.9,
      contactNumber: "02122119988",
    },
    createdAt: "2026-02-12",
  },
  {
    id: "str-112",
    code: "TH-SAY-120",
    title: "بیلبورد اتوبان صیاد شیرازی - خروجی پاسداران",
    slug: "billboard-sayad-shirazi-pasdaran",
    type: mockStructureTypes[0], // بیلبورد
    category: mockStructureCategories[0], // بزرگراهی
    status: "available",
    statusLabel: "آماده اکران فوری",
    dimensions: {
      width: 14,
      height: 4.5,
      area: 63,
      label: "۱۴ × ۴.۵ متر (۶۳ متر مربع)",
    },
    location: {
      city: "تهران",
      province: "تهران",
      district: "منطقه ۴ - بزرگراه صیاد شیرازی",
      address: "بزرگراه شهید صیاد شیرازی به سمت شمال، نرسیده به پل پاسداران و هروی",
      lat: 35.7680,
      lng: 51.4670,
      viewingAngle: "دید مستقیم روبرو از فاصله ۵۵۰ متری با کادربندی تمیز",
      trafficFlow: "تردد متراکم ساکنان مناطق ۴ و شمیرانات (۱۴۰,۰۰۰ خودرو)",
    },
    pricing: {
      basePriceMonthly: 195000000,
      dailyRate: 6500000,
      currency: "تومان",
      discountMonthlyPercent: 5,
      printablePrice: "۱۹۵,۰۰۰,۰۰۰ تومان / ماهانه",
    },
    specs: {
      lighting: "پروژکتورهای SMD کم مصرف پرنور با پرتاب نور یکنواخت",
      orientation: "جنوب به شمال",
      visibilityScore: 93,
      minDurationDays: 15,
      mediaType: "بنر چاپی مات با روکش ضد خاک و باران اسیدی",
      isTwoSided: false,
      rushHourPeak: "۱۶:۰۰ الی ۲۱:۰۰",
    },
    images: {
      day: "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=1200&q=80",
      night: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1200&q=80",
      gallery: [
        "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=1200&q=80",
      ],
    },
    description:
      "بزرگراه صیاد شیرازی مسیر اصلی تردد روزانه مدیران و ساکنان محلات مرفه پاسداران، هروی و شمس‌آباد به مرکز شهر است. این سازه با قرارگیری قبل از رمپ ورودی پاسداران، بهترین فرصت ارتباطی با مشتریان این منطقه را فراهم می‌آورد.",
    features: [
      "دسترسی مستقیم به مخاطبان منطقه پاسداران و دروس",
      "ارتفاع استاندارد پایه تابلو متناسب با شیب جاده",
      "کارتریج تعویض سریع بنر بدون نیاز به مسدودسازی بزرگراه",
    ],
    owner: {
      name: "شرکت تبلیغات آرمان شرق",
      verified: true,
      rating: 4.8,
      contactNumber: "02177665544",
    },
    createdAt: "2026-02-14",
  },
];

// شبیه‌ساز ذخیره رزروها در حافظه
export const mockBookingsStore: Array<{
  id: string;
  trackingCode: string;
  structureId: string;
  startDate: string;
  endDate: string;
  fullName: string;
  phone: string;
  brandName: string;
  notes?: string;
  totalPrice: number;
  status: "pending_review" | "confirmed";
  createdAt: string;
}> = [];

// حافظه مشترک سازه‌ها برای عملیات افزودن، ویرایش و مالکان رسانه
export const structuresStore: Structure[] = [...mockStructures];

export function getMyStructuresList(): Structure[] {
  // سازه‌های متعلق به مالک رسانه جاری (کانون آوای رسانه تهران و سازه‌های ثبت‌شده توسط کاربر)
  const myItems = structuresStore.filter(
    (s) =>
      s.owner.name.includes("آوای رسانه") ||
      s.owner.name.includes("مالک") ||
      s.owner.name.includes("من")
  );
  if (myItems.length > 0) return myItems;
  return structuresStore.slice(0, 6);
}

export function addNewStructure(data: Partial<Structure> & {
  title: string;
  typeId?: string;
  categoryId?: string;
  basePrice?: number;
  width?: number;
  height?: number;
  lat?: number;
  lng?: number;
  address?: string;
  district?: string;
  targetAudience?: string[];
  galleryImages?: string[];
}): Structure {
  const newId = `str-${Math.floor(200 + Math.random() * 800)}`;
  const typeObj = mockStructureTypes.find((t) => t.id === data.typeId || t.slug === data.typeId) || mockStructureTypes[0];
  const catObj = mockStructureCategories.find((c) => c.id === data.categoryId || c.slug === data.categoryId) || mockStructureCategories[0];
  
  const w = data.width || 12;
  const h = data.height || 4;
  const area = w * h;
  const basePrice = Number(data.basePrice || data.pricing?.basePriceMonthly || 180000000);

  const gallery = data.galleryImages && data.galleryImages.length > 0
    ? data.galleryImages
    : (data.images?.gallery && data.images.gallery.length > 0)
    ? data.images.gallery
    : [
        "https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1200&q=80",
      ];

  const newStructure: Structure = {
    id: newId,
    code: data.code || `TH-${typeObj.slug.toUpperCase().slice(0, 3)}-${Math.floor(100 + Math.random() * 900)}`,
    title: data.title,
    slug: `structure-${newId}`,
    type: typeObj,
    category: catObj,
    status: data.status || "available",
    statusLabel: data.status === "pending_review" ? "در انتظار تایید" : (data.status === "booked" ? "رزرو شده" : "فعال و آماده اکران"),
    dimensions: {
      width: w,
      height: h,
      area,
      label: `${toPersianDigits(w)} × ${toPersianDigits(h)} متر (${toPersianDigits(area)} متر مربع)`,
    },
    location: {
      city: data.location?.city || "تهران",
      province: data.location?.province || "تهران",
      district: data.district || data.location?.district || "منطقه ۱ تهران",
      address: data.address || data.location?.address || "تهران، معبر اصلی",
      lat: data.lat || data.location?.lat || 35.7385,
      lng: data.lng || data.location?.lng || 51.4112,
      viewingAngle: data.location?.viewingAngle || "رو به ترافیک اصلی",
      trafficFlow: data.location?.trafficFlow || "بیش از ۸۰٬۰۰۰ خودرو در روز",
    },
    pricing: {
      basePriceMonthly: basePrice,
      dailyRate: Math.round(basePrice / 30),
      currency: "IRR",
      printablePrice: formatToman(basePrice),
    },
    specs: {
      lighting: "پروژکتورهای هوشمند LED با تایمر شبانه",
      orientation: "دید مستقیم رانندگان",
      visibilityScore: 90,
      minDurationDays: 15,
      mediaType: "بنر فلکس کره‌ای ۵۰۰ گرمی",
      isTwoSided: false,
      rushHourPeak: "۱۶:۳۰ الی ۲۱:۰۰",
      ...data.specs,
    },
    images: {
      day: gallery[0] || "https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=1200&q=80",
      night: gallery[1] || gallery[0] || "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1200&q=80",
      gallery,
    },
    description: data.description || `سازه تبلیغاتی در موقعیت پرتردد با زاویه دید عالی برای اکران کمپین‌های محیطی و برندینگ.`,
    features: data.features || [
      "نورپردازی استاندارد و پرقدرت شبانه",
      "دارای بیمه مسئولیت مدنی",
      "امکان عقد قرارداد مستقیم با کانون آوای رسانه",
    ],
    owner: {
      name: "کانون تبلیغاتی آوای رسانه تهران",
      verified: true,
      rating: 5.0,
      contactNumber: "02188442211",
      ...data.owner,
    },
    targetAudience: data.targetAudience || ["رانندگان و مسافران", "قشر تجاری و اداری"],
    createdAt: new Date().toLocaleDateString("fa-IR"),
  };

  structuresStore.unshift(newStructure);
  return newStructure;
}

export function updateExistingStructure(
  id: string,
  updates: Partial<Structure> & {
    basePrice?: number;
    width?: number;
    height?: number;
    lat?: number;
    lng?: number;
    address?: string;
    district?: string;
    typeId?: string;
    categoryId?: string;
    galleryImages?: string[];
  }
): Structure | null {
  const idx = structuresStore.findIndex((s) => s.id === id || s.code === id);
  if (idx === -1) return null;

  const current = structuresStore[idx];

  const typeObj = updates.typeId
    ? mockStructureTypes.find((t) => t.id === updates.typeId || t.slug === updates.typeId) || current.type
    : current.type;

  const catObj = updates.categoryId
    ? mockStructureCategories.find((c) => c.id === updates.categoryId || c.slug === updates.categoryId) || current.category
    : current.category;

  const w = updates.width || current.dimensions.width;
  const h = updates.height || current.dimensions.height;
  const area = w * h;

  const basePrice = updates.basePrice !== undefined
    ? Number(updates.basePrice)
    : updates.pricing?.basePriceMonthly !== undefined
    ? updates.pricing.basePriceMonthly
    : current.pricing.basePriceMonthly;

  const gallery = updates.galleryImages || updates.images?.gallery || current.images.gallery;

  const updated: Structure = {
    ...current,
    ...updates,
    title: updates.title || current.title,
    code: updates.code || current.code,
    type: typeObj,
    category: catObj,
    status: updates.status || current.status,
    statusLabel: updates.status === "pending_review" ? "در انتظار تایید" : (updates.status === "booked" ? "رزرو شده" : (updates.status === "available" ? "فعال و آماده اکران" : current.statusLabel)),
    dimensions: {
      width: w,
      height: h,
      area,
      label: `${toPersianDigits(w)} × ${toPersianDigits(h)} متر (${toPersianDigits(area)} متر مربع)`,
    },
    location: {
      ...current.location,
      address: updates.address || updates.location?.address || current.location.address,
      district: updates.district || updates.location?.district || current.location.district,
      lat: updates.lat || updates.location?.lat || current.location.lat,
      lng: updates.lng || updates.location?.lng || current.location.lng,
    },
    pricing: {
      ...current.pricing,
      basePriceMonthly: basePrice,
      dailyRate: Math.round(basePrice / 30),
      printablePrice: formatToman(basePrice),
    },
    specs: {
      ...current.specs,
      ...updates.specs,
    },
    images: {
      day: gallery[0] || current.images.day,
      night: gallery[1] || gallery[0] || current.images.night,
      gallery,
    },
    description: updates.description || current.description,
    targetAudience: updates.targetAudience || current.targetAudience,
  };

  structuresStore[idx] = updated;
  return updated;
}

