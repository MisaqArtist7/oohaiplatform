import { z } from "zod";

/**
 * اسکیمای صدور پیش‌فاکتور رسمی توسط ادمین
 */
export const adminProformaSchema = z.object({
  invoiceNumber: z
    .string()
    .min(3, "شماره پیش‌فاکتور باید حداقل ۳ کاراکتر باشد")
    .max(50, "شماره پیش‌فاکتور معتبر نیست"),
  amount: z
    .number()
    .min(100000, "مبلغ پیش‌فاکتور باید حداقل ۱۰۰٬۰۰۰ تومان باشد"),
  fileUrl: z
    .string()
    .url("آدرس فایل پیش‌فاکتور معتبر نیست")
    .or(z.literal(""))
    .optional(),
});

export type AdminProformaFormValues = z.infer<typeof adminProformaSchema>;

/**
 * اسکیمای تایید مالی نهایی و صدور مجوز اکران
 */
export const adminApprovePaymentSchema = z.object({
  approvalNote: z
    .string()
    .max(300, "یادداشت تایید نمی‌تواند بیش از ۳۰۰ کاراکتر باشد")
    .optional(),
});

export type AdminApprovePaymentFormValues = z.infer<
  typeof adminApprovePaymentSchema
>;

/**
 * اسکیمای رد رزرو با ذکر علت اجباری
 */
export const adminRejectBookingSchema = z.object({
  reason: z
    .string()
    .min(5, "ذکر علت رد درخواست رزرو الزامی است (حداقل ۵ کاراکتر)")
    .max(500, "علت رد نمی‌تواند بیش از ۵۰۰ کاراکتر باشد"),
});

export type AdminRejectBookingFormValues = z.infer<
  typeof adminRejectBookingSchema
>;

/**
 * اسکیمای انتقال دستی وضعیت پرونده (State Machine)
 */
export const adminTransitionSchema = z.object({
  status: z.string().min(1, "انتخاب وضعیت مقصد الزامی است"),
  statusLabel: z.string().optional(),
  note: z.string().max(500, "یادداشت نمی‌تواند بیش از ۵۰۰ کاراکتر باشد").optional(),
});

export type AdminTransitionFormValues = z.infer<typeof adminTransitionSchema>;

/**
 * اسکیمای رد احراز هویت شرکت مالک رسانه
 */
export const adminRejectMediaOwnerSchema = z.object({
  reason: z
    .string()
    .min(5, "ذکر علت رد تقاضای شرکت الزامی است (حداقل ۵ کاراکتر)")
    .max(500, "علت رد نمی‌تواند بیش از ۵۰۰ کاراکتر باشد"),
});

export type AdminRejectMediaOwnerFormValues = z.infer<
  typeof adminRejectMediaOwnerSchema
>;
