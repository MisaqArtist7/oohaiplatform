export interface MediaOwnerRequestItem {
  id: string | number;
  company_name?: string;
  company?: string;
  national_id?: string;
  national_code?: string;
  status?: string | { value: string; label: string } | unknown;
  documents?: (string | { id?: string | number; url?: string; name?: string; path?: string })[];
  description?: string | null;
  rejection_reason?: string | null;
  reason?: string | null;
  user?: { id?: string | number; name?: string; phone?: string } | null;
  created_at?: string | null;
}

export const formatDate = (iso?: string | null) => {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleDateString("fa-IR", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return iso;
  }
};

export interface StatusBadgeInfo {
  key: "approved" | "pending" | "rejected";
  label: string;
  className: string;
}

export const getStatusBadge = (status?: unknown) => {
  let val = "";
  let label = "";

  if (typeof status === "object" && status !== null) {
    const s = status as Record<string, unknown>;
    val = String(s.value ?? s.name ?? s.title ?? s.slug ?? s.status ?? "").trim();
    label = String(s.label ?? s.title ?? s.persian ?? "").trim();
  } else if (status !== undefined && status !== null) {
    val = String(status).trim();
  }

  const normalized = val.toLowerCase();

  if (
    normalized === "approved" ||
    normalized === "confirmed" ||
    normalized === "accepted" ||
    normalized === "verified" ||
    normalized === "تایید شده" ||
    normalized === "تاییدشده" ||
    normalized === "تأیید شده" ||
    normalized === "تأییدشده" ||
    normalized === "تایید" ||
    normalized === "تأیید" ||
    normalized === "1"
  ) {
    return {
      key: "approved" as const,
      label: label || "تایید شده",
      className: "bg-emerald-50 text-emerald-700 border-emerald-200",
    };
  }

  if (
    normalized === "rejected" ||
    normalized === "declined" ||
    normalized === "disapproved" ||
    normalized === "رد شده" ||
    normalized === "ردشده" ||
    normalized === "رد" ||
    normalized === "2"
  ) {
    return {
      key: "rejected" as const,
      label: label || "رد شده",
      className: "bg-red-50 text-red-700 border-red-200",
    };
  }

  return {
    key: "pending" as const,
    label: label || "در انتظار بررسی",
    className: "bg-amber-50 text-amber-700 border-amber-200",
  };
};

export function extractRequestsList(json: unknown): MediaOwnerRequestItem[] {
  if (!json || typeof json !== "object") return [];
  const obj = json as Record<string, unknown>;

  if (Array.isArray(obj.data)) {
    return obj.data as MediaOwnerRequestItem[];
  }
  if (obj.data && typeof obj.data === "object") {
    const nestedData = (obj.data as Record<string, unknown>).data;
    if (Array.isArray(nestedData)) {
      return nestedData as MediaOwnerRequestItem[];
    }
  }
  if (Array.isArray(obj.requests)) {
    return obj.requests as MediaOwnerRequestItem[];
  }
  if (Array.isArray(json)) {
    return json as MediaOwnerRequestItem[];
  }
  return [];
}

export const DEFAULT_SAMPLE_REQUESTS: MediaOwnerRequestItem[] = [
  {
    id: 1,
    company_name: "کانون تبلیغاتی فراز نما",
    national_id: "10103482910",
    status: "approved",
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(),
    documents: [
      { id: 101, name: "پروانه_کسب_تبلیغات.pdf", url: "#" },
      { id: 102, name: "روزنامه_رسمی.pdf", url: "#" },
      { id: 103, name: "سند_سازه‌های_شهری.pdf", url: "#" },
    ],
    description: "مالک ۱۵ سازه بیلبوردی فعال در بزرگراه‌های مدرس و همت تهران.",
  },
  {
    id: 2,
    company_name: "آژانس تبلیغات محیطی سپهر رسانه",
    national_id: "14009281734",
    status: "pending",
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(),
    documents: [
      { id: 104, name: "مجوز_وزارت_فرهنگ_و_ارشاد.pdf", url: "#" },
      { id: 105, name: "اساسنامه_شرکت.pdf", url: "#" },
    ],
    description: "درخواست اتصال و عرضه سازه‌های استرابورد و لمپ‌پست در کرج و قزوین.",
  },
  {
    id: 3,
    company_name: "موسسه تبلیغات نوین سیمای شهر",
    national_id: "10380194825",
    status: "approved",
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString(),
    documents: [
      { id: 106, name: "آگهی_تاسیس_و_ثبت.pdf", url: "#" },
      { id: 107, name: "گواهی_صلاحیت_حرفه‌ای.pdf", url: "#" },
    ],
    description: "دارای ۳۰ پرتال دیجیتال ال‌ای‌دی در شیراز و اصفهان.",
  },
  {
    id: 4,
    company_name: "تبلیغات مهرگان پارس",
    national_id: "10860293841",
    status: "rejected",
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7).toISOString(),
    rejection_reason: "مدارک ارسالی منقضی شده‌اند و تصویر روزنامه رسمی بارگذاری نشده است.",
    documents: [
      { id: 108, name: "تصویر_مجوز_منقضی.pdf", url: "#" },
    ],
    description: "درخواست همکاری جهت تابلوهای تبلیغاتی شمال کشور.",
  },
];
