// app/sitemap.ts
import type { MetadataRoute } from "next";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://billboardmarket.ir";

// ۱. مسیرهای ثابت لایه عمومی
const staticRoutes: MetadataRoute.Sitemap = [
    {
    url: baseUrl,
    lastModified: new Date(),
    changeFrequency: "daily",
    priority: 1.0,
    },
    {
    url: `${baseUrl}/structures`,
    lastModified: new Date(),
    changeFrequency: "hourly",
    priority: 0.9,
    },
    {
    url: `${baseUrl}/ai-advisor`,
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: 0.8,
    },
];

// ۲. مسیرهای داینامیک تک‌صفحه سازه‌ها (آماده اتصال به API بک‌اند در آینده)
// بعداً می‌توانید از اندپوینت /structures لیست ID سازه‌ها را بگیرید
const mockStructureIds = [1, 2, 3];
const dynamicStructureRoutes: MetadataRoute.Sitemap = mockStructureIds.map((id) => ({
    url: `${baseUrl}/structures/${id}`,
    lastModified: new Date(),
    changeFrequency: "daily",
    priority: 0.7,
}));

return [...staticRoutes, ...dynamicStructureRoutes];
}