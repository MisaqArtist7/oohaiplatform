import { z } from "zod";

const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB
const ACCEPTED_IMAGE_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
];

/**
 * اعتبارسنجی فایل تصویر سازه
 */
export const structureImageFileSchema = z
  .custom<File>((val) => typeof window !== "undefined" && val instanceof File, {
    message: "فایل انتخاب‌شده نامعتبر است",
  })
  .refine((file) => file.size <= MAX_IMAGE_SIZE_BYTES, {
    message: "حجم هر تصویر حداکثر می‌تواند ۵ مگابایت باشد",
  })
  .refine((file) => ACCEPTED_IMAGE_TYPES.includes(file.type), {
    message: "فرمت تصویر باید یکی از موارد jpg, jpeg, png, webp باشد",
  });

/**
 * اسکیمای اعتبارسنجی فرم ثبت سازه جدید توسط مالک رسانه (POST /api/v1/structures)
 */
export const createStructureSchema = z.object({
  title: z
    .string()
    .min(3, "عنوان سازه باید حداقل ۳ کاراکتر باشد")
    .max(255, "عنوان سازه نمی‌تواند بیش از ۲۵۵ کاراکتر باشد"),
  city_id: z
    .number()
    .int("شناسه شهر نامعتبر است")
    .positive("انتخاب شهر الزامی است"),
  structure_type_id: z
    .number()
    .int("نوع سازه نامعتبر است")
    .positive("انتخاب نوع سازه الزامی است"),
  latitude: z
    .number()
    .min(-90, "عرض جغرافیایی باید بین ۹۰- تا ۹۰ باشد")
    .max(90, "عرض جغرافیایی باید بین ۹۰- تا ۹۰ باشد"),
  longitude: z
    .number()
    .min(-180, "طول جغرافیایی باید بین ۱۸۰- تا ۱۸۰ باشد")
    .max(180, "طول جغرافیایی باید بین ۱۸۰- تا ۱۸۰ باشد"),
  price: z
    .number()
    .min(0, "مبلغ نمی‌تواند منفی باشد")
    .optional()
    .nullable(),
  address: z.string().max(500, "نشانی نمی‌تواند بیش از ۵۰۰ کاراکتر باشد").optional(),
  description: z.string().max(2000, "توضیحات نمی‌تواند بیش از ۲۰۰۰ کاراکتر باشد").optional(),
  audience_type: z.string().max(255, "تیپ مخاطبان نمی‌تواند بیش از ۲۵۵ کاراکتر باشد").optional(),
  category_ids: z.array(z.number()).optional(),
  images: z
    .array(structureImageFileSchema)
    .max(10, "حداکثر ۱۰ تصویر قابل بارگذاری است")
    .optional(),
});

export type CreateStructureFormValues = z.infer<typeof createStructureSchema>;

/**
 * اسکیمای اعتبارسنجی فرم ویرایش سازه (PUT /api/v1/structures/{id})
 * فاقد تصویر (طبق مستندات بک‌اند)
 */
export const updateStructureSchema = z.object({
  title: z
    .string()
    .min(3, "عنوان سازه باید حداقل ۳ کاراکتر باشد")
    .max(255, "عنوان سازه نمی‌تواند بیش از ۲۵۵ کاراکتر باشد")
    .optional(),
  structure_type_id: z.number().optional(),
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
  price: z.number().min(0).optional().nullable(),
  address: z.string().max(500).optional(),
  description: z.string().max(2000).optional(),
  audience_type: z.string().max(255).optional(),
  category_ids: z.array(z.number()).optional(),
});

export type UpdateStructureFormValues = z.infer<typeof updateStructureSchema>;

/**
 * اسکیمای عمومی برای فرم
 */
export const structureFormSchema = createStructureSchema;
export type StructureFormValues = CreateStructureFormValues;
