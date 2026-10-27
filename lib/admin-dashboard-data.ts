import { AdminMediaOwnerRequest } from "@/features/admin";
import { mediaOwnerApplicationsStore } from "./client-dashboard-data";

/**
 * داده‌های موقت مربوط به ماژول درخواست‌های مالکان رسانه (نگهداری شده برای تسک ۱۰)
 * بخش رزروها، نقش‌ها، کاربران و لاگ‌های حسابرسی ادمین طبق تسک ۸ حذف و به API واقعی متصل شدند.
 */

// لیست اولیه درخواست‌های همکاری مالکان رسانه (تسک ۱۰)
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
