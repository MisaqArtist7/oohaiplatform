import { z } from "zod";

/**
 * اسکیمای اعتبارسنجی درخواست هوشمند کمپین تبلیغاتی (AI Campaign Proposal)
 */
export const proposalFormSchema = z.object({
  title: z
    .string()
    .max(100, "عنوان کمپین نمی‌تواند بیش از ۱۰۰ کاراکتر باشد")
    .optional(),
  budget: z
    .number()
    .min(5000000, "حداقل بودجه پیشنهادی کمپین ۵٬۰۰۰٬۰۰۰ تومان است"),
  city_id: z.number().int(),
  cityName: z.string(),
  scenario: z
    .string()
    .min(15, "سناریو و اهداف کمپین تبلیغاتی باید حداقل شامل ۱۵ کاراکتر باشد")
    .max(1000, "سناریو نمی‌تواند بیش از ۱۰۰۰ کاراکتر باشد"),
});

export type ProposalFormValues = z.infer<typeof proposalFormSchema>;
