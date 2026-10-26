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
 * اسکیمای ثبت و ارسال فیش واریز ساتنا یا چک صیادی (نگهداری برای تسک ۷)
 */
export const paymentSubmissionSchema = z.object({
  bookingId: z.string().min(1, "شناسه پرونده رزرو الزامی است"),
  method: z.enum(["satna", "sayad_check"]),
  amount: z
    .number()
    .min(100000, "مبلغ پرداختی باید حداقل ۱۰۰٬۰۰۰ تومان باشد"),
  bankName: z.string().optional(),
  trackingCode: z.string().optional(),
  checkSerial: z.string().optional(),
  checkSayadId: z.string().optional(),
  dueDate: z.string().optional(),
  receiptUrl: z.string().optional(),
  notes: z.string().max(500).optional(),
});

export type PaymentSubmissionFormValues = z.infer<typeof paymentSubmissionSchema>;
