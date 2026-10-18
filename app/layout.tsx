// app/layout.tsx
import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";

// تعریف فونت لوکال (اگر از نسخه Variable استفاده می‌کنی یک فایل کافیست)
const vazirmatn = localFont({
  src: "../public/fonts/Vazirmatn-VariableFont_wght.woff2",
  variable: "--font-vazirmatn",
  display: "swap",
  weight: "100 900",
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://billboardmarket.ir"),
  title: {
    default: "بیلبورد مارکت | پلتفرم هوشمند رزرواسیون تبلیغات محیطی",
    template: "%s | بیلبورد مارکت",
  },
  description:
    "سامانه هوشمند اتوماسیون فروش، تحلیل داده‌محور و رزرو آنلاین بیلبورد، استرابورد، پل عابر پیاده و تابلوهای تبلیغاتی در سراسر کشور.",
  keywords: [
    "اجاره بیلبورد",
    "تابلوهای تبلیغاتی",
    "تبلیغات محیطی",
    "رزرو آنلاین بیلبورد",
    "استرابورد",
    "تلویزیون شهری",
  ],
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="fa" dir="rtl" className={vazirmatn?.variable}>
      <body className={`${vazirmatn.className} antialiased bg-background text-foreground`}>
        {children}
      </body>
    </html>
  );
}