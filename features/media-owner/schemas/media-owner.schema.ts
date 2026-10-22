import { z } from "zod";

const iranPhoneRegex = /^09[0-9]{9}$/;
const nationalCompanyIdRegex = /^[0-9]{10,11}$/;

/**
 * اسکیمای اعتبارسنجی درخواست احراز هویت شرکت مالک رسانه
 */
export const mediaOwnerRequestSchema = z.object({
  companyName: z
    .string()
    .min(3, "نام کانون تبلیغاتی یا شرکت حقوقی باید حداقل ۳ کاراکتر باشد")
    .max(100, "نام شرکت نمی‌تواند بیش از ۱۰۰ کاراکتر باشد"),
  nationalId: z
    .string()
    .regex(nationalCompanyIdRegex, "شناسه ملی یا کد اقتصادی باید ۱۰ الی ۱۱ رقم عددی باشد"),
  contactPerson: z
    .string()
    .min(3, "نام و نام خانوادگی مدیرمسئول باید حداقل ۳ کاراکتر باشد"),
  phone: z
    .string()
    .regex(iranPhoneRegex, "شماره موبایل نامعتبر است (مثال: ۰۹۱۲۳۴۵۶۷۸۹)"),
  province: z.string().min(2, "انتخاب استان فعالیت الزامی است"),
  address: z.string().min(8, "نشانی دقیق دفتر شرکت باید حداقل ۸ کاراکتر باشد"),
  structuresCount: z
    .number()
    .int()
    .min(1, "تعداد سازه‌های تحت تملک باید حداقل ۱ عدد باشد"),
  licenseNumber: z.string().optional(),
  documentUrls: z
    .array(z.string().min(1, "نام یا آدرس فایل نامعتبر است"))
    .min(1, "حداقل بارگذاری یک مدرک ثبتی (پروانه کانون یا روزنامه رسمی) الزامی است"),
});

export type MediaOwnerRequestFormValues = z.infer<typeof mediaOwnerRequestSchema>;
