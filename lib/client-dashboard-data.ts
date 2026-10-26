import {
  ProposalItem,
  MediaOwnerApplication,
} from "@/features/bookings";

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
