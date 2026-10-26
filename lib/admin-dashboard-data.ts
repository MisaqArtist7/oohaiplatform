import {
  AdminBooking,
  AdminBookingStatus,
  AdminMediaOwnerRequest,
  AdminRole,
  AdminUser,
  BookingAuditLog,
} from "@/features/admin";
import { BookingTimelineItem } from "@/features/bookings";
import { initialClientBookings, mediaOwnerApplicationsStore } from "./client-dashboard-data";

// نقش‌های موجود در سامانه OOHAI (تنها ۳ نقش مجاز مطابق سند)
export const initialAdminRoles: AdminRole[] = [
  {
    id: "role-super-admin",
    name: "مدیر ارشد پلتفرم (Super Admin)",
    slug: "super_admin",
    description: "دسترسی نامحدود به تمامی بخش‌ها، تنظیمات سامانه و کنترل اختیارات",
    color: "indigo",
    permissionsCount: 42,
  },
  {
    id: "role-media-owner",
    name: "مالک رسانه (Media Owner)",
    slug: "media_owner",
    description: "صاحبان بیلبورد و کانون‌ها، تعریف سازه و پایش بازه‌های اکران",
    color: "amber",
    permissionsCount: 12,
  },
  {
    id: "role-client",
    name: "مشتری تبلیغات (Client / Advertiser)",
    slug: "client",
    description: "ثبت رزرو، درخواست پیش‌فاکتور، پیشنهاد کمپین با هوش مصنوعی و پرداخت",
    color: "slate",
    permissionsCount: 8,
  },
];

// لیست اولیه رزروهای سیستمی جهت مانیتورینگ ادمین
export const initialAdminBookings: AdminBooking[] = [
  ...initialClientBookings.map((b) => ({
    ...b,
    rejectionReason: undefined,
  })),
  {
    id: "BK-9120",
    trackingCode: "BM-MOD-9120",
    structure: {
      id: "str-102",
      code: "TH-MOD-102",
      title: "عرشه پل بزرگراه شهید مدرس - تقاطع میرداماد",
      address: "بزرگراه شهید مدرس، ۵۰ متر قبل از تقاطع میرداماد، مسیر شمال به جنوب",
      district: "منطقه ۳ تهران",
      dimensions: "۲۰ × ۳ متر (۶۰ متر مربع)",
      image: "https://images.unsplash.com/photo-1519501025264-65ba15a82390?auto=format&fit=crop&w=1200&q=80",
      type: "عرشه پل",
      category: "اتوبانی و بزرگراهی",
    },
    startDate: "۱۴۰۳/۰۲/۱۰",
    endDate: "۱۴۰۳/۰۳/۱۰",
    durationDays: 30,
    totalPrice: 320000000,
    status: {
      value: "pending_review",
      label: "در انتظار بررسی اولیه",
      color: "amber",
    },
    brandName: "اسنپ فود",
    contactPerson: "مهندس سارا نظری",
    contactPhone: "09123334455",
    createdAt: "۱۴۰۳/۰۱/۲۸ - ساعت ۰۹:۱۵",
    timeline: [
      {
        id: "log-9120-1",
        title: "ثبت درخواست اولیه رزرو سازه",
        description: "مشتری درخواست اکران ۳۰ روزه عرشه پل مدرس را ثبت نمود.",
        timestamp: "۱۴۰۳/۰۱/۲۸ - ۰۹:۱۵",
        actor: "سارا نظری (مشتری)",
        status: "pending_review",
        isDone: true,
        isCurrent: true,
      },
    ],
    payments: [],
    documents: [],
  },
  {
    id: "BK-8430",
    trackingCode: "BM-AND-8430",
    structure: {
      id: "str-105",
      code: "TH-AND-105",
      title: "استرابورد بلوار اندرزگو - نبش اشکستان‌پور",
      address: "بلوار شهید اندرزگو، نبش کوچه اشکستان‌پور، مسیر شرق به غرب",
      district: "منطقه ۱ تهران",
      dimensions: "۳ × ۴ متر (۱۲ متر مربع)",
      image: "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=1200&q=80",
      type: "استرابورد",
      category: "معابر شهری",
    },
    startDate: "۱۴۰۳/۰۲/۰۵",
    endDate: "۱۴۰۳/۰۲/۲۰",
    durationDays: 15,
    totalPrice: 95000000,
    status: {
      value: "locked_for_contract",
      label: "قفل موقت ۴۸ ساعته",
      color: "blue",
    },
    brandName: "بانک سامان",
    contactPerson: "پیمان صادقی",
    contactPhone: "09128889900",
    createdAt: "۱۴۰۳/۰۱/۲۷ - ساعت ۱۶:۳۰",
    lockedUntil: "۴۸ ساعت آینده",
    timeline: [
      {
        id: "log-8430-1",
        title: "ثبت اولیه رزرو در سامانه",
        description: "درخواست اکران ۱۵ روزه استرابورد اندرزگو ثبت گردید.",
        timestamp: "۱۴۰۳/۰۱/۲۷ - ۱۶:۳۰",
        actor: "پیمان صادقی",
        status: "completed",
        isDone: true,
      },
      {
        id: "log-8430-2",
        title: "تایید اولیه کارشناس و قفل ۴۸ ساعته سازه",
        description: "استعلام زیباسازی تایید و قفل موقت سازه فعال شد.",
        timestamp: "۱۴۰۳/۰۱/۲۷ - ۱۷:۱۰",
        actor: "مدیر عملیات (احمد راد)",
        status: "locked_for_contract",
        isDone: true,
        isCurrent: true,
      },
    ],
    payments: [],
    documents: [],
  },
];

// حافظه مشترک رزروهای سیستمی
export const adminBookingsStore: AdminBooking[] = [...initialAdminBookings];

// حافظه لاگ‌های تغییرات (Audit Logs)
export const adminAuditLogsStore: BookingAuditLog[] = [
  {
    id: "audit-101",
    bookingId: "BK-8901",
    actor: "رضا کمالی (مشتری)",
    action: "ثبت درخواست رزرو",
    newStatus: "pending_review",
    timestamp: "۱۴۰۳/۰۱/۲۵ - ۱۱:۴۵",
    note: "رزرو ۳۰ روزه بیلبورد همت تقاطع ستاری",
    ipAddress: "185.120.45.10",
  },
  {
    id: "audit-102",
    bookingId: "BK-8901",
    actor: "احمد راد (مدیر عملیات)",
    action: "استعلام عدم تداخل و قفل موقت ۴۸ ساعته",
    previousStatus: "pending_review",
    newStatus: "locked_for_contract",
    timestamp: "۱۴۰۳/۰۱/۲۵ - ۱۴:۲۰",
    note: "هماهنگی با زیباسازی انجام شد.",
    ipAddress: "192.168.1.15",
  },
  {
    id: "audit-103",
    bookingId: "BK-8901",
    actor: "مریم صبوری (سیستم اتوماسیون مالی)",
    action: "صدور و الصاق پیش‌فاکتور رسمی",
    previousStatus: "locked_for_contract",
    newStatus: "proforma_issued",
    timestamp: "۱۴۰۳/۰۱/۲۵ - ۱۵:۰۰",
    note: "شماره پیش‌فاکتور: PF-1403-1029",
    ipAddress: "192.168.1.20",
  },
];

// لیست اولیه درخواست‌های همکاری مالکان رسانه
export const initialAdminMediaOwnerRequests: AdminMediaOwnerRequest[] = [
  {
    id: "req-101",
    trackingCode: "MO-REQ-9841",
    companyName: "کانون تبلیغاتی آفاق پایتخت",
    nationalId: "10103456789",
    contactPerson: "مهندس کامران رستمی",
    phone: "09121112233",
    address: "تهران، خیابان ولیعصر، نرسیده به توانیر، پلاک ۱۱۸",
    structuresCount: 14,
    province: "تهران",
    status: "pending",
    statusLabel: "در انتظار بررسی مدارک",
    submittedAt: "۱۴۰۳/۰۱/۲۶",
    documents: [
      {
        id: "doc-mo-1",
        title: "روزنامه رسمی آخرین تغییرات و صاحبان امضا.pdf",
        fileUrl: "/api/v1/client/bookings/documents/DOC-PF-8901/download",
        fileSize: "۱.۸ مگابایت",
      },
      {
        id: "doc-mo-2",
        title: "پروانه فعالیت کانون تبلیغاتی از وزارت ارشاد.pdf",
        fileUrl: "/api/v1/client/bookings/documents/DOC-PF-8901/download",
        fileSize: "۲.۴ مگابایت",
      },
      {
        id: "doc-mo-3",
        title: "لیست سازه‌ها و قرارداد مزایده شهرداری.pdf",
        fileUrl: "/api/v1/client/bookings/documents/DOC-PF-8901/download",
        fileSize: "۴.۲ مگابایت",
      },
    ],
  },
  {
    id: "req-102",
    trackingCode: "MO-REQ-8720",
    companyName: "شرکت رسانه‌سازان اطلس کیش",
    nationalId: "14002345678",
    contactPerson: "خانم دکتر الهام فروتن",
    phone: "09124445566",
    address: "تهران، شهرک غرب، بلوار فرحزادی، برج افق، طبقه ۵",
    structuresCount: 28,
    province: "تهران و البرز",
    status: "pending",
    statusLabel: "در انتظار بررسی مدارک",
    submittedAt: "۱۴۰۳/۰۱/۲۷",
    documents: [
      {
        id: "doc-mo-4",
        title: "اساسنامه شرکت و مجوز زیباسازی.pdf",
        fileUrl: "/api/v1/client/bookings/documents/DOC-PF-8901/download",
        fileSize: "۳.۱ مگابایت",
      },
    ],
  },
  {
    id: "req-103",
    trackingCode: "MO-REQ-6510",
    companyName: "کانون آگهی و تبلیغات آوای رسانه تهران",
    nationalId: "10109988776",
    contactPerson: "مهندس کوروش صادقی",
    phone: "02188442211",
    address: "تهران، میدان ونک، خیابان ملاصدرا",
    structuresCount: 45,
    province: "تهران",
    status: "approved",
    statusLabel: "تایید شده و فعال",
    submittedAt: "۱۴۰۳/۰۱/۱۰",
    reviewedAt: "۱۴۰۳/۰۱/۱۲",
    reviewedBy: "مدیر ارشد پلتفرم",
    documents: [],
  },
];

export const adminMediaOwnerRequestsStore: AdminMediaOwnerRequest[] = [
  ...initialAdminMediaOwnerRequests,
];

// کاربران سامانه OOHAI
export const initialAdminUsers: AdminUser[] = [
  {
    id: "usr-1",
    name: "مهران شریفی",
    phone: "09121002030",
    email: "sharifi@oohaiplatform.ir",
    nationalCode: "0012345678",
    department: "مدیریت ارشد",
    roles: [initialAdminRoles[0]], // Super Admin
    status: "active",
    statusLabel: "فعال",
    createdAt: "۱۴۰۲/۰۹/۰۱",
    lastLogin: "امروز - ۱۰:۳۰",
  },
  {
    id: "usr-2",
    name: "کوروش صادقی (آوای رسانه)",
    phone: "09129998877",
    email: "sadeghi@avayeresaneh.com",
    nationalCode: "0034567890",
    department: "مالکان رسانه همکار",
    roles: [initialAdminRoles[1]], // Media Owner
    status: "active",
    statusLabel: "فعال",
    createdAt: "۱۴۰۳/۰۱/۱۰",
    lastLogin: "امروز - ۱۲:۰۰",
  },
  {
    id: "usr-3",
    name: "رضا کمالی (دیجی‌کالا)",
    phone: "09121112233",
    email: "kamali@digikala.com",
    nationalCode: "0098765432",
    department: "مشتریان تجاری",
    roles: [initialAdminRoles[2]], // Client
    status: "active",
    statusLabel: "فعال",
    createdAt: "۱۴۰۳/۰۱/۱۵",
    lastLogin: "امروز - ۱۱:۴۵",
  },
  {
    id: "usr-4",
    name: "سارا نظری (اسنپ فود)",
    phone: "09123334455",
    email: "nazari@snappfood.ir",
    nationalCode: "0045678901",
    department: "مشتریان تجاری",
    roles: [initialAdminRoles[2]], // Client
    status: "active",
    statusLabel: "فعال",
    createdAt: "۱۴۰۳/۰۱/۲۰",
    lastLogin: "امروز - ۰۹:۱۵",
  },
];

export const adminUsersStore: AdminUser[] = [...initialAdminUsers];

/* ───────────────────────── متدهای کمکی پردازش رزروها ───────────────────────── */

export function lockAdminBooking(bookingId: string): AdminBooking | null {
  const item = adminBookingsStore.find((b) => b.id === bookingId);
  if (!item) return null;

  item.status = {
    value: "locked_for_contract",
    label: "قفل موقت ۴۸ ساعته فعال شد",
    color: "blue",
  };
  item.lockedUntil = "۴۸ ساعت آینده (مهلت تکمیل مدارک و تسویه)";
  item.lockedAt = new Date().toLocaleDateString("fa-IR");

  const logId = `log-${Date.now()}`;
  const nowStr = new Date().toLocaleDateString("fa-IR");
  item.timeline.unshift({
    id: logId,
    title: "تایید اولیه و قفل ۴۸ ساعته سازه",
    description: "کارشناس ادمین عدم تداخل اکران را تایید نمود و سازه به مدت ۴۸ ساعت برای مشتری قفل شد.",
    timestamp: `${nowStr} - هم‌اکنون`,
    actor: "مدیر عملیات سامانه",
    status: "locked_for_contract",
    isDone: true,
    isCurrent: true,
  });

  adminAuditLogsStore.unshift({
    id: `audit-${Date.now()}`,
    bookingId,
    actor: "مدیر عملیات (Admin)",
    action: "اعمال قفل موقت ۴۸ ساعته",
    previousStatus: "pending_review",
    newStatus: "locked_for_contract",
    timestamp: `${nowStr} - هم‌اکنون`,
    note: "قفل سازه روی تقویم سراسری فعال گردید.",
  });

  return item;
}

export function issueAdminProforma(
  bookingId: string,
  proformaNumber: string,
  amount: number,
  fileUrl?: string
): AdminBooking | null {
  const item = adminBookingsStore.find((b) => b.id === bookingId);
  if (!item) return null;

  const nowStr = new Date().toLocaleDateString("fa-IR");
  const proformaDocId = `DOC-PF-${bookingId}`;

  item.proforma = {
    id: proformaDocId,
    number: proformaNumber || `PF-1403-${Math.floor(1000 + Math.random() * 9000)}`,
    issueDate: nowStr,
    expiresAt: "۲ روز کاری آینده",
    amount: amount || item.totalPrice,
    downloadUrl: fileUrl || `/api/v1/client/bookings/documents/${proformaDocId}/download`,
  };

  item.status = {
    value: "proforma_issued",
    label: "پیش‌فاکتور صادر گردید (در انتظار پرداخت)",
    color: "indigo",
  };

  item.documents = item.documents || [];
  item.documents.unshift({
    id: proformaDocId,
    title: `پیش‌فاکتور رسمی شماره ${item.proforma.number}`,
    type: "proforma",
    typeLabel: "پیش‌فاکتور رسمی",
    date: nowStr,
    fileSize: "۱.۶ مگابایت (PDF)",
    downloadUrl: item.proforma.downloadUrl,
  });

  item.timeline.unshift({
    id: `log-${Date.now()}`,
    title: "صدور و الصاق پیش‌فاکتور رسمی الکترونیک",
    description: `پیش‌فاکتور شماره ${item.proforma.number} به مبلغ ${item.proforma.amount.toLocaleString("fa-IR")} تومان صادر و لینک دانلود امن فعال شد.`,
    timestamp: `${nowStr} - هم‌اکنون`,
    actor: "امور مالی پلتفرم OOHAI",
    status: "proforma_issued",
    isDone: true,
    isCurrent: true,
  });

  adminAuditLogsStore.unshift({
    id: `audit-${Date.now()}`,
    bookingId,
    actor: "مدیر ارشد (Super Admin)",
    action: "صدور پیش‌فاکتور رسمی",
    previousStatus: "locked_for_contract",
    newStatus: "proforma_issued",
    timestamp: `${nowStr} - هم‌اکنون`,
    note: `شماره پیش‌فاکتور: ${item.proforma.number}`,
  });

  return item;
}

export function approveAdminPayment(
  bookingId: string,
  managerNote?: string
): AdminBooking | null {
  const item = adminBookingsStore.find((b) => b.id === bookingId);
  if (!item) return null;

  const nowStr = new Date().toLocaleDateString("fa-IR");
  item.status = {
    value: "approved",
    label: "پرداخت تایید شد (تایید نهایی مالی)",
    color: "emerald",
  };
  item.approvedAt = nowStr;
  item.financialManagerNote = managerNote || "سند مالی و تطابق با حساب بانکی تایید گردید.";

  if (item.payments && item.payments.length > 0) {
    item.payments[0].status = "verified";
    item.payments[0].statusLabel = "تایید شده توسط امور مالی";
  }

  item.timeline.unshift({
    id: `log-${Date.now()}`,
    title: "تایید نهایی پرداخت و مجوز چاپ و اکران",
    description: `پرداخت وجه قرارداد توسط مدیر مالی تایید شد. ${managerNote ? `یادداشت: ${managerNote}` : ""}`,
    timestamp: `${nowStr} - هم‌اکنون`,
    actor: "مدیریت مالی پلتفرم",
    status: "approved",
    isDone: true,
    isCurrent: true,
  });

  adminAuditLogsStore.unshift({
    id: `audit-${Date.now()}`,
    bookingId,
    actor: "مدیر ارشد (Super Admin)",
    action: "تایید نهایی سند پرداخت",
    previousStatus: "payment_submitted",
    newStatus: "approved",
    timestamp: `${nowStr} - هم‌اکنون`,
    note: managerNote || "تایید تراکنش بانکی / چک صیادی",
  });

  return item;
}

export function rejectAdminBooking(
  bookingId: string,
  reason: string
): AdminBooking | null {
  const item = adminBookingsStore.find((b) => b.id === bookingId);
  if (!item) return null;

  const nowStr = new Date().toLocaleDateString("fa-IR");
  item.status = {
    value: "cancelled",
    label: "درخواست رزرو رد شد",
    color: "rose",
  };
  item.rejectionReason = reason;

  item.timeline.unshift({
    id: `log-${Date.now()}`,
    title: "رد درخواست رزرو سازه",
    description: `درخواست با ذکر دلیل زیر از سوی ادمین رد شد: «${reason}»`,
    timestamp: `${nowStr} - هم‌اکنون`,
    actor: "مدیریت پلتفرم OOHAI",
    status: "rejected",
    isDone: true,
    isCurrent: true,
  });

  adminAuditLogsStore.unshift({
    id: `audit-${Date.now()}`,
    bookingId,
    actor: "مدیر پلتفرم (Admin)",
    action: "رد درخواست رزرو",
    newStatus: "rejected",
    timestamp: `${nowStr} - هم‌اکنون`,
    note: `علت رد: ${reason}`,
  });

  return item;
}

export function transitionAdminBookingStatus(
  bookingId: string,
  newStatusValue: string,
  statusLabel?: string,
  note?: string
): AdminBooking | null {
  const item = adminBookingsStore.find((b) => b.id === bookingId);
  if (!item) return null;

  const prev = item.status.value;
  const nowStr = new Date().toLocaleDateString("fa-IR");

  item.status = {
    value: newStatusValue as AdminBookingStatus,
    label: statusLabel || `وضعیت: ${newStatusValue}`,
    color: newStatusValue === "active" ? "emerald" : "indigo",
  };

  item.timeline.unshift({
    id: `log-${Date.now()}`,
    title: `تغییر وضعیت به: ${item.status.label}`,
    description: note || `تغییر دستی وضعیت از ${prev} به ${newStatusValue}`,
    timestamp: `${nowStr} - هم‌اکنون`,
    actor: "مدیریت ارشد سیستم",
    status: newStatusValue as BookingTimelineItem["status"],
    isDone: true,
    isCurrent: true,
  });

  adminAuditLogsStore.unshift({
    id: `audit-${Date.now()}`,
    bookingId,
    actor: "مدیر ارشد سیستم",
    action: `تغییر وضعیت به ${newStatusValue}`,
    previousStatus: prev,
    newStatus: newStatusValue,
    timestamp: `${nowStr} - هم‌اکنون`,
    note,
  });

  return item;
}

export function approveMediaOwnerApplication(requestId: string): AdminMediaOwnerRequest | null {
  const item = adminMediaOwnerRequestsStore.find((r) => r.id === requestId);
  if (!item) return null;

  item.status = "approved";
  item.statusLabel = "تایید شده و فعال";
  item.reviewedAt = new Date().toLocaleDateString("fa-IR");
  item.reviewedBy = "مدیریت پلتفرم OOHAI";

  // بروزرسانی وضعیت در استور کلاینت
  const clientApp = mediaOwnerApplicationsStore.find(
    (r) => r.id === requestId || r.trackingCode === item.trackingCode || (item.phone && r.phone === item.phone)
  );
  if (clientApp) {
    clientApp.status = "approved";
  }

  // ارتقای نقش کاربر در سامانه به media-owner
  const user = adminUsersStore.find(
    (u) =>
      (item.phone && u.phone === item.phone) ||
      (item.nationalId && u.nationalCode === item.nationalId) ||
      (item.contactPerson && u.name === item.contactPerson)
  );
  if (user) {
    assignRoleToUser(user.id, "media-owner");
  }

  return item;
}

export function rejectMediaOwnerApplication(requestId: string, reason: string): AdminMediaOwnerRequest | null {
  const item = adminMediaOwnerRequestsStore.find((r) => r.id === requestId);
  if (!item) return null;

  item.status = "rejected";
  item.statusLabel = "رد شده";
  item.reviewedAt = new Date().toLocaleDateString("fa-IR");
  item.reviewedBy = "مدیریت پلتفرم OOHAI";
  item.rejectionReason = reason;

  return item;
}

export function assignRoleToUser(userId: string, roleSlug: string): AdminUser | null {
  const user = adminUsersStore.find((u) => u.id === userId);
  const role = initialAdminRoles.find((r) => r.slug === roleSlug);
  if (!user || !role) return null;

  if (!user.roles.some((r) => r.slug === roleSlug)) {
    user.roles.push(role);
  }
  return user;
}

export function removeRoleFromUser(userId: string, roleSlug: string): AdminUser | null {
  const user = adminUsersStore.find((u) => u.id === userId);
  if (!user) return null;

  user.roles = user.roles.filter((r) => r.slug !== roleSlug);
  return user;
}
