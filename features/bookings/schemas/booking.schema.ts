import { z } from "zod";
import { toEnglishDigits } from "@/shared/lib/digits";

function getTodayIsoDate(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/**
 * اسکیمای ولیدیشن فرم ثبت درخواست رزرو سازه دقیقاً مطابق سند بک‌اند
 */
export const createBookingSchema = z
  .object({
    structure_id: z
      .number()
      .int()
      .positive("شناسه سازه نامعتبر است"),
    start_date: z
      .string()
      .min(1, "تاریخ شروع الزامی است")
      .regex(/^\d{4}-\d{2}-\d{2}$/, "فرمت تاریخ شروع باید YYYY-MM-DD باشد")
      .refine(
        (val) => val >= getTodayIsoDate(),
        "تاریخ شروع نمی‌تواند در گذشته باشد"
      ),
    end_date: z
      .string()
      .min(1, "تاریخ پایان الزامی است")
      .regex(/^\d{4}-\d{2}-\d{2}$/, "فرمت تاریخ پایان باید YYYY-MM-DD باشد"),
    company_name: z
      .string()
      .trim()
      .min(1, "نام شرکت یا برند الزامی است")
      .max(120, "نام شرکت نمی‌تواند بیش از ۱۲۰ کاراکتر باشد"),
    national_id: z
      .string()
      .min(1, "کد ملی یا شناسه ملی الزامی است")
      .refine(
        (val) => {
          const cleaned = toEnglishDigits(val).trim();
          return /^\d{10}$|^\d{11}$/.test(cleaned);
        },
        "کد ملی (۱۰ رقم) یا شناسه ملی (۱۱ رقم) باید فقط شامل ارقام باشد"
      ),
    note: z.string().max(1000, "توضیحات نمی‌تواند بیش از ۱۰۰۰ کاراکتر باشد").optional(),
    total_amount: z
      .number()
      .int()
      .positive("مبلغ برآورد باید بزرگتر از صفر باشد"),
  })
  .refine((data) => data.end_date > data.start_date, {
    message: "تاریخ پایان باید بعد از تاریخ شروع باشد",
    path: ["end_date"],
  });

export type CreateBookingFormValues = z.infer<typeof createBookingSchema>;

/**
 * اسکیمای ثبت اطلاعات پرداخت (فیش واریز ساتنا یا چک صیادی) مطابق سند بک‌اند
 * اعتبارسنجی فایل به صورت کاملاً SSR-safe پیاده‌سازی شده است.
 */
export const paymentSubmissionSchema = z.object({
  document: z
    .custom<File | null | undefined>()
    .refine(
      (file) => {
        if (typeof window === "undefined") return true;
        return typeof File !== "undefined" && file instanceof File;
      },
      "بارگذاری فایل تصویر فیش واریز یا چک صیادی الزامی است"
    )
    .refine(
      (file) => {
        if (typeof window === "undefined" || !file || !(file instanceof File)) return true;
        return file.size <= 10 * 1024 * 1024;
      },
      "حجم فایل نمی‌تواند بیش از ۱۰ مگابایت باشد"
    )
    .refine(
      (file) => {
        if (typeof window === "undefined" || !file || !(file instanceof File)) return true;
        return file.type === "application/pdf" || file.type.startsWith("image/");
      },
      "فرمت فایل باید PDF یا تصویر (JPG, PNG, WebP) باشد"
    ),

  document_type: z.enum(["payment_receipt", "sayadi_check"], {
    message: "نوع مدرک پرداخت نامعتبر است",
  }),

  payment_reference: z
    .string()
    .min(1, "کد رهگیری یا شناسه صیادی الزامی است")
    .refine(
      (val) => toEnglishDigits(val).trim().length >= 6,
      "شناسه رهگیری پرداخت باید حداقل ۶ کاراکتر باشد"
    ),

  amount: z
    .string()
    .optional()
    .refine((val) => {
      if (!val || !val.trim()) return true;
      const cleaned = toEnglishDigits(val).trim().replace(/,/g, "");
      const n = Number(cleaned);
      return !isNaN(n) && n > 0;
    }, "مبلغ پرداختی باید بزرگتر از صفر باشد"),

  note: z.string().max(1000, "یادداشت نمی‌تواند بیش از ۱۰۰۰ کاراکتر باشد").optional(),
});

export type PaymentSubmissionFormValues = z.infer<typeof paymentSubmissionSchema>;

