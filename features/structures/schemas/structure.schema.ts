import { z } from "zod";

/**
 * اسکیمای اعتبارسنجی ثبت و ویرایش سازه تبلیغاتی
 */
export const structureFormSchema = z.object({
  code: z
    .string()
    .min(3, "کد شناسه سازه باید حداقل ۳ کاراکتر باشد")
    .max(30, "کد شناسه سازه نمی‌تواند بیش از ۳۰ کاراکتر باشد")
    .regex(/^[A-Za-z0-9-_]+$/, "کد سازه باید فقط شامل حروف انگلیسی، اعداد، خط تیره یا زیرخط باشد"),
  title: z
    .string()
    .min(5, "عنوان سازه باید حداقل ۵ کاراکتر باشد")
    .max(120, "عنوان سازه نمی‌تواند بیش از ۱۲۰ کاراکتر باشد"),
  typeId: z.string().min(1, "انتخاب نوع سازه الزامی است"),
  categoryId: z.string().min(1, "انتخاب دسته‌بندی سازه الزامی است"),
  location: z.object({
    province: z.string().min(2, "نام استان الزامی است"),
    district: z.string().min(2, "نام منطقه یا شهرداری الزامی است"),
    address: z.string().min(8, "نشانی دقیق سازه باید حداقل ۸ کاراکتر باشد"),
    lat: z.number().min(25).max(40, "مختصات جغرافیایی نامعتبر است"),
    lng: z.number().min(44).max(64, "مختصات جغرافیایی نامعتبر است"),
  }),
  dimensions: z.object({
    width: z.number().positive("عرض باید بزرگتر از صفر باشد"),
    height: z.number().positive("ارتفاع باید بزرگتر از صفر باشد"),
    area: z.number().positive("مساحت باید بزرگتر از صفر باشد"),
    label: z.string().optional(),
  }),
  pricing: z.object({
    dailyRate: z
      .number()
      .min(100000, "نرخ روزانه باید حداقل ۱۰۰٬۰۰۰ تومان باشد"),
    monthlyRate: z.number().optional(),
    discountPercent: z.number().min(0).max(100).optional(),
  }),
  specs: z.object({
    lighting: z.string().min(2, "وضعیت نورپردازی الزامی است"),
    facesCount: z.number().int().min(1, "حداقل یک وجه اکران الزامی است"),
    minDurationDays: z.number().int().min(1, "حداقل دوره اکران باید ۱ روز باشد"),
    dailyTraffic: z.number().optional(),
    targetAudience: z.string().optional(),
  }),
  images: z
    .array(z.string().min(1, "آدرس یا نام تصویر نامعتبر است"))
    .min(1, "حداقل یک تصویر برای سازه الزامی است")
    .max(10, "حداکثر ۱۰ تصویر قابل بارگذاری است"),
  isAvailable: z.boolean(),
});

export type StructureFormValues = z.infer<typeof structureFormSchema>;
