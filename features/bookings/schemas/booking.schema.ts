import { z } from "zod";

/**
 * الگوی شماره موبایل معتبر ایران (۰۹۱۲۳۴۵۶۷۸۹)
 */
const iranPhoneRegex = /^09[0-9]{9}$/;

/**
 * اسکیمای اعتبارسنجی ثبت درخواست رزرو سازه
 */
export const bookingRequestSchema = z.object({
  structureId: z.string().min(1, "انتخاب سازه تبلیغاتی الزامی است"),
  fullName: z
    .string()
    .min(3, "نام و نام خانوادگی باید حداقل ۳ کاراکتر باشد")
    .max(80, "نام و نام خانوادگی نمی‌تواند بیش از ۸۰ کاراکتر باشد"),
  phone: z
    .string()
    .regex(iranPhoneRegex, "شماره موبایل نامعتبر است (مثال: ۰۹۱۲۳۴۵۶۷۸۹)"),
  brandName: z
    .string()
    .min(2, "نام برند یا شرکت متقاضی الزامی است")
    .max(80, "نام برند نمی‌تواند بیش از ۸۰ کاراکتر باشد"),
  startDate: z.string().min(8, "تاریخ شروع اکران الزامی است"),
  endDate: z.string().min(8, "تاریخ پایان اکران الزامی است"),
  durationDays: z.number().int().min(1, "حداقل دوره اکران باید ۱ روز باشد"),
  estimatedPrice: z.number().optional(),
  notes: z.string().max(500, "یادداشت نمی‌تواند بیش از ۵۰۰ کاراکتر باشد").optional(),
});

export type BookingRequestFormValues = z.infer<typeof bookingRequestSchema>;

/**
 * اسکیمای ثبت و ارسال فیش واریز ساتنا یا چک صیادی
 */
export const paymentSubmissionSchema = z
  .object({
    bookingId: z.string().min(1, "شناسه پرونده رزرو الزامی است"),
    method: z.enum(["satna", "sayad_check"], {
      error: "روش پرداخت باید حواله ساتنا یا چک صیادی باشد",
    }),
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
  })
  .superRefine((data, ctx) => {
    if (data.method === "satna" && !data.trackingCode?.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["trackingCode"],
        message: "کد پیگیری بانکی برای پرداخت ساتنا الزامی است",
      });
    }

    if (data.method === "sayad_check") {
      if (!data.checkSayadId?.trim() || data.checkSayadId.trim().length !== 16) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["checkSayadId"],
          message: "شناسه ۱۶ رقمی صیادی چک الزامی و باید دقیقاً ۱۶ رقم باشد",
        });
      }
      if (!data.dueDate?.trim()) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["dueDate"],
          message: "تاریخ سررسید چک الزامی است",
        });
      }
    }
  });

export type PaymentSubmissionFormValues = z.infer<typeof paymentSubmissionSchema>;
