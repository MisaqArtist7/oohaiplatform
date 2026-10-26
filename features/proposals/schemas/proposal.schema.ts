import { z } from "zod";
import { toEnglishDigits } from "@/shared/lib/digits";

/**
 * اسکیمای اعتبارسنجی فرم ثبت درخواست سناریوی پیشنهاد هوشمند کمپین تبلیغاتی
 * مطابق با قوانین سند بک‌اند
 */
export const createProposalSchema = z.object({
  budgetToman: z
    .string({
      message: "ورود بودجه الزامی است",
    })
    .min(1, "ورود بودجه به تومان الزامی است")
    .refine((val) => {
      const clean = toEnglishDigits(val).replace(/,/g, "").trim();
      const num = Number(clean);
      return !isNaN(num) && Number.isInteger(num) && num > 0;
    }, "بودجه باید عددی صحیح و بزرگتر از صفر باشد"),

  city_id: z
    .number({
      message: "انتخاب استان یا شهر الزامی است",
    })
    .int("شناسه شهر نامعتبر است")
    .positive("انتخاب استان یا شهر الزامی است"),

  scenario: z
    .string({
      message: "متن سناریوی کمپین الزامی است",
    })
    .refine((val) => {
      const len = (val || "").trim().length;
      return len >= 20 && len <= 5000;
    }, "سناریوی کمپین باید حداقل شامل ۲۰ و حداکثر ۵۰۰۰ کاراکتر باشد"),
});

export type CreateProposalFormValues = z.infer<typeof createProposalSchema>;
