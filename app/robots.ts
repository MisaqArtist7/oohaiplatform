// app/robots.ts
import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
// آدرس اصلی سایت از متغیر محیطی خوانده می‌شود یا پیش‌فرض قرار می‌گیرد
const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://billboardmarket.ir";

return {
    rules: [
    {
        userAgent: "*",
        // این مسیرها برای ایندکس شدن در گوگل آزاد هستند (صفحات عمومی و کاتالوگ سازه‌ها)
        allow: ["/", "/structures", "/ai-advisor"],
        
        // این مسیرها از خزنده‌ها پنهان می‌شوند (پنل‌های کاربری، لاگین و اندپوینت‌های API)
        disallow: [
        "/client/",      // پنل مشتریان و برندها
        "/media-owner/", // پنل مالکان رسانه و بارگذاری مدارک
        "/admin/",       // پنل ادمین کل و مالی
        "/register",        // صفحه احراز هویت و OTP
        "/request-otp",
        "/verify-otp", 
        "/api/",         // مسیرهای ارتباط با بک‌اند
        ],
    },
    ],
    // آدرس نقشه سایت برای معرفی به گوگل
    sitemap: `${baseUrl}/sitemap.xml`,
};
}