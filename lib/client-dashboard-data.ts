import {
  ClientBooking,
  ProposalItem,
  MediaOwnerApplication,
} from "@/features/bookings";

export const initialClientBookings: ClientBooking[] = [
  {
    id: "BK-8901",
    trackingCode: "BM-HEM-8901",
    structure: {
      id: "str-101",
      code: "TH-HEM-101",
      title: "بیلبورد اتوبان همت - تقاطع ستاری",
      address: "بزرگراه شهید همت، ۵۰۰ متر مانده به تقاطع بزرگراه ستاری، مسیر شرق به غرب",
      district: "منطقه ۵ تهران",
      dimensions: "۱۵ × ۵ متر (۷۵ متر مربع)",
      image: "https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=1200&q=80",
      type: "بیلبورد",
      category: "اتوبانی و بزرگراهی",
    },
    startDate: "۱۴۰۳/۰۲/۰۱",
    endDate: "۱۴۰۳/۰۳/۰۱",
    durationDays: 30,
    totalPrice: 280000000,
    status: {
      value: "awaiting_payment",
      label: "در انتظار پرداخت",
      color: "indigo",
    },
    brandName: "دیجی‌کالا",
    contactPerson: "مهندس رضا کمالی",
    contactPhone: "09121112233",
    createdAt: "۱۴۰۳/۰۱/۲۵ - ساعت ۱۱:۴۵",
    lockedUntil: "۴۸ ساعت آینده (مهلت تسویه حساب)",
    proforma: {
      id: "DOC-PF-8901",
      number: "PF-1403-1029",
      issueDate: "۱۴۰۳/۰۱/۲۵",
      expiresAt: "۱۴۰۳/۰۱/۲۷",
      amount: 280000000,
      downloadUrl: "/api/v1/client/bookings/documents/DOC-PF-8901/download",
    },
    timeline: [
      {
        id: "log-1",
        title: "ثبت اولیه درخواست رزرو در سامانه",
        description: "مشتری درخواست اکران یک‌ماهه را در سامانه ثبت و قفل موقت ۴۸ ساعته را فعال نمود.",
        timestamp: "۱۴۰۳/۰۱/۲۵ - ۱۱:۴۵",
        actor: "مشتری (رضا کمالی)",
        status: "completed",
        isDone: true,
      },
      {
        id: "log-2",
        title: "بررسی و تایید کانون تبلیغاتی آوای رسانه",
        description: "سازمان زیباسازی و کانون مالک رسانه عدم تداخل بازه اکران را استعلام و تایید کردند.",
        timestamp: "۱۴۰۳/۰۱/۲۵ - ۱۴:۲۰",
        actor: "واحد بررسی مدارک و حقوقی",
        status: "approved",
        isDone: true,
      },
      {
        id: "log-3",
        title: "صدور پیش‌فاکتور رسمی الکترونیک",
        description: "پیش‌فاکتور رسمی شماره PF-1403-1029 صادر شد و لینک دانلود امن فعال گردید.",
        timestamp: "۱۴۰۳/۰۱/۲۵ - ۱۵:۰۰",
        actor: "سیستم اتوماسیون مالی",
        status: "proforma_issued",
        isDone: true,
        isCurrent: true,
      },
      {
        id: "log-4",
        title: "پرداخت و ثبت فیش واریزی / چک صیادی",
        description: "در انتظار واریز وجه یا ثبت شماره چک صیادی از طریق درگاه یا بارگذاری فیش بانکی.",
        timestamp: "در انتظار اقدام مشتری",
        actor: "مشتری",
        status: "awaiting_payment",
        isDone: false,
      },
      {
        id: "log-5",
        title: "ارسال طرح و تاییدیه چاپ بنر",
        description: "دریافت فایل گرافیکی با ابعاد ۱۵ در ۵ متر و ارسال به چاپخانه صنعتی.",
        timestamp: "پس از تایید پرداخت",
        actor: "واحد فنی و چاپ",
        status: "pending_print",
        isDone: false,
      },
      {
        id: "log-6",
        title: "اکران نهایی روی سازه و صدور عکس تاییدیه اکران",
        description: "نصب بنر بر روی عرشه بیلبورد همت و شروع دوره رسمی اکران تبلیغ.",
        timestamp: "۱۴۰۳/۰۲/۰۱",
        actor: "تیم عملیات اکران شبانه",
        status: "active",
        isDone: false,
      },
    ],
    payments: [],
    documents: [
      {
        id: "DOC-PF-8901",
        title: "پیش‌فاکتور رسمی شماره ۱۰۲۹ (با مهر دیجیتال)",
        type: "proforma",
        typeLabel: "پیش‌فاکتور",
        date: "۱۴۰۳/۰۱/۲۵",
        fileSize: "۱.۴ مگابایت (PDF)",
        downloadUrl: "/api/v1/client/bookings/documents/DOC-PF-8901/download",
      },
      {
        id: "DOC-CT-8901",
        title: "پیش‌نویس قرارداد اجاره رسانه محیطی",
        type: "contract",
        typeLabel: "قرارداد",
        date: "۱۴۰۳/۰۱/۲۵",
        fileSize: "۲.۱ مگابایت (PDF)",
        downloadUrl: "/api/v1/client/bookings/documents/DOC-PF-8901/download",
        requiresSignature: true,
      },
    ],
  },
  {
    id: "BK-7840",
    trackingCode: "BM-SAD-7840",
    structure: {
      id: "str-102",
      code: "TH-SAD-204",
      title: "عرشه پل طبقاتی صدر - مسیر غرب به شرق",
      address: "بزرگراه طبقاتی شهید صدر، بعد از ورودی قیطریه، به سمت کامرانیه و پاسداران",
      district: "منطقه ۳ تهران",
      dimensions: "۲۸ × ۳.۵ متر (۹۸ متر مربع)",
      image: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1200&q=80",
      type: "عرشه پل",
      category: "اتوبانی و بزرگراهی",
    },
    startDate: "۱۴۰۳/۰۱/۱۵",
    endDate: "۱۴۰۳/۰۲/۱۵",
    durationDays: 30,
    totalPrice: 420000000,
    status: {
      value: "active",
      label: "تایید شده و فعال (در حال اکران)",
      color: "emerald",
    },
    brandName: "بانک سامان",
    contactPerson: "دکتر مجید صبوری",
    contactPhone: "09123334455",
    createdAt: "۱۴۰۳/۰۱/۰۸ - ساعت ۰۹:۳۰",
    proforma: {
      id: "DOC-PF-7840",
      number: "PF-1403-0982",
      issueDate: "۱۴۰۳/۰۱/۰۹",
      expiresAt: "۱۴۰۳/۰۱/۱۱",
      amount: 420000000,
      downloadUrl: "/api/v1/client/bookings/documents/DOC-PF-7840/download",
    },
    timeline: [
      {
        id: "log-1",
        title: "ثبت رزرو سازه پل صدر",
        description: "درخواست رزرو اولیه با تایید بودجه سازمانی ثبت شد.",
        timestamp: "۱۴۰۳/۰۱/۰۸ - ۰۹:۳۰",
        actor: "مشتری",
        status: "completed",
        isDone: true,
      },
      {
        id: "log-2",
        title: "تایید مدارک و عقد قرارداد رسمی",
        description: "قرارداد اکران حقوقی فی‌مابین امضا و مبادله گردید.",
        timestamp: "۱۴۰۳/۰۱/۱۰ - ۱۲:۰۰",
        actor: "واحد حقوقی",
        status: "completed",
        isDone: true,
      },
      {
        id: "log-3",
        title: "تسویه حساب کامل مالی",
        description: "حواله ساتنا به مبلغ ۴۲۰ میلیون تومان تایید شد.",
        timestamp: "۱۴۰۳/۰۱/۱۱ - ۱۶:۴۰",
        actor: "امور مالی",
        status: "completed",
        isDone: true,
      },
      {
        id: "log-4",
        title: "نصب و شروع رسمی اکران",
        description: "بنر در شب ۱۵ فروردین روی عرشه پل صدر با موفقیت نصب شد.",
        timestamp: "۱۴۰۳/۰۱/۱۵ - ۰۲:۰۰ بامداد",
        actor: "تیم فنی",
        status: "active",
        isDone: true,
        isCurrent: true,
      },
    ],
    payments: [
      {
        id: "PAY-901",
        method: "satna",
        methodLabel: "حواله ساتنا",
        amount: 420000000,
        bankName: "بانک سامان - شعبه مرکزی",
        trackingCode: "SAT-14030111-8877",
        submittedAt: "۱۴۰۳/۰۱/۱۱ - ۱۵:۳۰",
        status: "verified",
        statusLabel: "تایید شده توسط واحد مالی",
        receiptUrl: "/receipts/satna-sample.pdf",
      },
    ],
    documents: [
      {
        id: "DOC-PF-7840",
        title: "پیش‌فاکتور قطعی و فاکتور رسمی الکترونیک",
        type: "invoice",
        typeLabel: "فاکتور رسمی",
        date: "۱۴۰۳/۰۱/۱۱",
        fileSize: "۱.۸ مگابایت (PDF)",
        downloadUrl: "/api/v1/client/bookings/documents/DOC-PF-7840/download",
      },
      {
        id: "DOC-ORD-7840",
        title: "دستور و گزارش مصور اکران شبانه (عکس‌های هوایی)",
        type: "installation_order",
        typeLabel: "گزارش اکران",
        date: "۱۴۰۳/۰۱/۱۵",
        fileSize: "۴.۵ مگابایت (PDF)",
        downloadUrl: "/api/v1/client/bookings/documents/DOC-PF-7840/download",
      },
    ],
  },
  {
    id: "BK-6215",
    trackingCode: "BM-VAN-6215",
    structure: {
      id: "str-103",
      code: "TH-VAN-301",
      title: "لمپوست ولیعصر - محدوده میدان ونک",
      address: "خیابان ولیعصر، فاصله میان پل همت تا میدان ونک، هر دو لاین رفت و برگشت",
      district: "منطقه ۳ تهران",
      dimensions: "۱.۲ × ۳.۲ متر (سری ۸ تایی)",
      image: "https://images.unsplash.com/photo-1563245372-f21724e3856d?auto=format&fit=crop&w=1200&q=80",
      type: "لمپوست بنر",
      category: "مراکز تجاری و اداری",
    },
    startDate: "۱۴۰۳/۰۲/۱۵",
    endDate: "۱۴۰۳/۰۳/۱۵",
    durationDays: 30,
    totalPrice: 145000000,
    status: {
      value: "pending_review",
      label: "در انتظار تایید اولیه",
      color: "amber",
    },
    brandName: "چرم مشهد",
    contactPerson: "خانم مریم سعیدی",
    contactPhone: "09124445566",
    createdAt: "۱۴۰۳/۰۱/۲۷ - ساعت ۱۰:۱۵",
    timeline: [
      {
        id: "log-1",
        title: "ثبت درخواست رزرو پکیج لمپوست",
        description: "مشتری پکیج ۸ تایی لمپوست بنرهای محور ولیعصر-ونک را انتخاب کرده است.",
        timestamp: "۱۴۰۳/۰۱/۲۷ - ۱۰:۱۵",
        actor: "مشتری (مریم سعیدی)",
        status: "pending_review",
        isDone: true,
        isCurrent: true,
      },
      {
        id: "log-2",
        title: "بررسی تقویم خالی معابر شهرداری منطقه ۳",
        description: "کارشناس رزرو در حال استعلام وضعیت با زیباسازی شهرداری است.",
        timestamp: "در حال پردازش",
        actor: "کارشناس اکران",
        status: "processing",
        isDone: false,
      },
    ],
    payments: [],
    documents: [],
  },
  {
    id: "BK-5100",
    trackingCode: "BM-KAJ-5100",
    structure: {
      id: "str-106",
      code: "TH-KAJ-601",
      title: "تلویزیون شهری میدان کاج - سعادت‌آباد",
      address: "میدان کاج، ضلع شمال شرقی میدان، مشرف به ورودی بلوار شهرداری و سرو",
      district: "منطقه ۲ تهران",
      dimensions: "۱۰ × ۶ متر (۶۰ متر مربع نمایشگر 4K)",
      image: "https://images.unsplash.com/photo-1519501025264-65ba15a82390?auto=format&fit=crop&w=1200&q=80",
      type: "تلویزیون شهری",
      category: "میادین و تقاطع‌های کلیدی",
    },
    startDate: "۱۴۰۲/۱۲/۰۱",
    endDate: "۱۴۰۲/۱۲/۲۹",
    durationDays: 29,
    totalPrice: 310000000,
    status: {
      value: "completed",
      label: "تکمیل شده و خاتمه‌یافته",
      color: "slate",
    },
    brandName: "اسنپ فود",
    contactPerson: "مهندس رضا کمالی",
    contactPhone: "09121112233",
    createdAt: "۱۴۰۲/۱۱/۲۰",
    timeline: [
      {
        id: "log-1",
        title: "شروع اکران اسلات موشن ویدیویی",
        description: "تیزر ۳۰ ثانیه‌ای کمپین نوروزی اسنپ فود با ۴۵۰ بار پخش در روز اکران شد.",
        timestamp: "۱۴۰۲/۱۲/۰۱",
        actor: "دیجیتال مدیا",
        status: "completed",
        isDone: true,
      },
      {
        id: "log-2",
        title: "پایان دوره و صدور گزارش نهایی پخش",
        description: "اکران با ۱۳,۰۵۰ بار پخش بدون قطعی پایان یافت.",
        timestamp: "۱۴۰۲/۱۲/۲۹",
        actor: "سیستم مانیتورینگ هوشمند",
        status: "completed",
        isDone: true,
        isCurrent: true,
      },
    ],
    payments: [
      {
        id: "PAY-501",
        method: "satna",
        methodLabel: "حواله ساتنا",
        amount: 310000000,
        bankName: "بانک پاسارگاد",
        trackingCode: "PAS-987654321",
        submittedAt: "۱۴۰۲/۱۱/۲۵",
        status: "verified",
        statusLabel: "تایید شده",
      },
    ],
    documents: [],
  },
];

// دیتابیس در حافظه برای رزروهای کلاینت
export const clientBookingsStore: ClientBooking[] = [...initialClientBookings];

export function addPaymentToBooking(
  bookingId: string,
  paymentData: {
    method: "satna" | "sayad_check";
    amount: number;
    trackingCode?: string;
    bankName?: string;
    checkSerial?: string;
    checkSayadId?: string;
    dueDate?: string;
    notes?: string;
    receiptFileName?: string;
  }
): ClientBooking | null {
  const index = clientBookingsStore.findIndex(
    (b) => b.id.toLowerCase() === bookingId.toLowerCase() || b.trackingCode.toLowerCase() === bookingId.toLowerCase()
  );
  if (index === -1) return null;

  const current = clientBookingsStore[index];
  const newPayment = {
    id: `PAY-${Date.now().toString().slice(-4)}`,
    method: paymentData.method,
    methodLabel: paymentData.method === "satna" ? "فیش واریزی ساتنا/پایا" : "چک صیادی بنفش",
    amount: paymentData.amount,
    trackingCode: paymentData.trackingCode,
    bankName: paymentData.bankName,
    checkSerial: paymentData.checkSerial,
    checkSayadId: paymentData.checkSayadId,
    dueDate: paymentData.dueDate,
    submittedAt: new Date().toLocaleDateString("fa-IR") + " - ثبت آنلاین",
    status: "pending_verification" as const,
    statusLabel: "در انتظار بررسی واحد مالی (ظرف ۴ ساعت کاری)",
    receiptUrl: paymentData.receiptFileName || "/receipts/payment-doc.pdf",
    notes: paymentData.notes,
  };

  const updatedTimeline = [
    ...current.timeline,
    {
      id: `log-${Date.now()}`,
      title: `ثبت سند پرداخت (${newPayment.methodLabel})`,
      description: `مبلغ ${paymentData.amount.toLocaleString("fa-IR")} تومان ثبت و فیش به امور مالی ارجاع شد.`,
      timestamp: new Date().toLocaleDateString("fa-IR"),
      actor: "مشتری",
      status: "payment_submitted",
      isDone: true,
      isCurrent: true,
    },
  ];

  const updatedBooking: ClientBooking = {
    ...current,
    status: {
      value: "awaiting_payment",
      label: "فیش پرداخت ثبت شد (در حال تایید مالی)",
      color: "indigo",
    },
    payments: [newPayment, ...current.payments],
    timeline: updatedTimeline,
  };

  clientBookingsStore[index] = updatedBooking;
  return updatedBooking;
}

// لیست پیشنهادات و کمپین‌های هوشمند (Proposals)
export const initialProposals: ProposalItem[] = [
  {
    id: "PROP-101",
    trackingNumber: "PR-1403-4501",
    title: "کمپین ریتیل بهاره و تخفیف‌های پوشاک در شمال و مرکز تهران",
    budget: 450000000,
    city: "تهران",
    cityId: 1,
    scenario: "هدف ما لانچ کالکشن جدید بهاره با تمرکز بر نسل جوان و قشر مرفه شمال و مرکز پایتخت است. مدت اکران مورد نظر ۴۵ روز بوده و به دنبال ترکیب بیلبوردهای بزرگراهی و استرابوردهای مراکز خرید هستیم.",
    status: "ai_generated",
    statusLabel: "پیشنهاد آماده شد (طراحی هوش مصنوعی)",
    createdAt: "۱۴۰۳/۰۱/۲۰",
    strategy: {
      summary: "سبد رسانه‌ای پیشنهادی شامل ۲ عرشه پل پربازده، ۳ استرابورد محلی در اندرزگو و شهرک غرب، و ۱ بیلبورد بزرگراهی با تمرکز بر مسیرهای بازگشت به خانه طراحی شده است.",
      targetAudience: "مخاطبان ۱۸ الی ۴۵ سال، خانواده‌ها و قشر متوسط رو به بالا با قدرت خرید پوشاک برند",
      estimatedReach: "میانگین ۱,۲۵۰,۰۰۰ بازدید موثر در هفته با تکرار ۳.۴ برابری پیام",
      recommendedStructures: [
        {
          structureId: "str-102",
          title: "عرشه پل طبقاتی صدر - مسیر غرب به شرق",
          type: "عرشه پل",
          location: "بزرگراه صدر - منطقه ۳",
          monthlyPrice: 420000000,
          reason: "پوشش اصلی مسافران شمال شرق تهران و تردد خودروهای مدرن",
        },
        {
          structureId: "str-105",
          title: "استرابورد بلوار اندرزگو - نبش اشکستان‌پور",
          type: "استرابورد",
          location: "اندرزگو - منطقه ۱",
          monthlyPrice: 95000000,
          reason: "حضور مستقیم در کانون کافه‌گردی و خرید پوشاک جوانان",
        },
        {
          structureId: "str-109",
          title: "استرابورد شهرک غرب - بلوار دادمان",
          type: "استرابورد",
          location: "بلوار دادمان - منطقه ۲",
          monthlyPrice: 110000000,
          reason: "تردد آرام خانوارها با قدرت خرید بالا در مجاورت مال‌ها",
        },
      ],
      budgetDistribution: [
        { category: "عرشه پل‌های بزرگراهی", percentage: 55, amount: 247500000 },
        { category: "استرابوردهای تجاری شهری", percentage: 35, amount: 157500000 },
        { category: "هزینه چاپ UV و اکران شبانه", percentage: 10, amount: 45000000 },
      ],
    },
  },
  {
    id: "PROP-102",
    trackingNumber: "PR-1403-3290",
    title: "کمپین جذب کاربر برای اپلیکیشن حوزه مالی و سرمایه‌گذاری",
    budget: 800000000,
    city: "تهران",
    cityId: 1,
    scenario: "معرفی نئوبانک و ترغیب به نصب اپلیکیشن سرمایه‌گذاری خرد برای کارمندان و اصناف در شریان‌های شلوغ تهران به مدت ۲ ماه.",
    status: "approved",
    statusLabel: "تایید شده توسط مشاور ارشد OOHAI",
    createdAt: "۱۴۰۳/۰۱/۱۵",
    strategy: {
      summary: "ترکیب بیلبوردهای شاهراه مدرس و همت با نمایشگرهای دیجیتال میدان ولیعصر جهت حداکثر دید مدیران و کارمندان.",
      targetAudience: "شاغلین، سرمایه‌گذاران خرد و فعالان اقتصادی ۲۵ تا ۵۵ سال",
      estimatedReach: "بیش از ۲,۴۰۰,۰۰۰ ایمپرشن هفتگی",
      recommendedStructures: [
        {
          structureId: "str-104",
          title: "بیلبورد بزرگراه مدرس - پل میرداماد",
          type: "بیلبورد",
          location: "بزرگراه مدرس شمال",
          monthlyPrice: 360000000,
          reason: "شریان اختصاصی مدیران شرکت‌ها و سفارت‌خانه‌ها",
        },
        {
          structureId: "str-111",
          title: "تلویزیون شهری میدان ولیعصر",
          type: "تلویزیون شهری",
          location: "میدان ولیعصر - پلازا",
          monthlyPrice: 390000000,
          reason: "تراکم پیاده و مسافران پرشمار خطوط مترو",
        },
      ],
      budgetDistribution: [
        { category: "بیلبورد ۱۰۸ متری مدرس", percentage: 48, amount: 384000000 },
        { category: "نمایشگر دیجیتال ولیعصر", percentage: 42, amount: 336000000 },
        { category: "رزرو احتیاطی و تولید محتوا", percentage: 10, amount: 80000000 },
      ],
    },
  },
];

export const proposalsStore: ProposalItem[] = [...initialProposals];

export const mediaOwnerApplicationsStore: MediaOwnerApplication[] = [
  {
    id: "MO-9001",
    companyName: "کانون تبلیغاتی سپهر رسانه پایتخت",
    nationalId: "10103456789",
    contactPerson: "مهندس علیرضا ابراهیمی",
    phone: "09121234567",
    address: "تهران، میدان ونک، برج نگار، طبقه ۸، واحد ۳",
    structuresCount: 14,
    status: "pending",
    submittedAt: "۱۴۰۳/۰۱/۲۴",
    trackingCode: "MO-REQ-9001",
  },
];
