// app/layout.tsx
import type { Metadata } from "next";
import { Vazirmatn } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";

const vazirmatn = Vazirmatn({
  subsets: ["arabic", "latin"],
  variable: "--font-vazirmatn",
  display: "swap",
  weight: ["300", "400", "500", "600", "700", "800", "900"],
});

const iranyekan = localFont({
  src: [
    { path: "./fonts/Qs_Iranyekan light.ttf", weight: "300", style: "normal" },
    { path: "./fonts/Qs_Iranyekan.ttf", weight: "400", style: "normal" },
    { path: "./fonts/Qs_Iranyekan medium.ttf", weight: "500", style: "normal" },
    { path: "./fonts/Qs_Iranyekan bold.ttf", weight: "700", style: "normal" },
    { path: "./fonts/Qs_Iranyekan extrabold.ttf", weight: "800", style: "normal" },
    { path: "./fonts/Qs_Iranyekan black.ttf", weight: "900", style: "normal" },
  ],
  variable: "--font-iranyekan",
  display: "swap",
  fallback: ["Tahoma", "Arial", "sans-serif"],
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

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fa" dir="rtl" className={`${vazirmatn.variable} ${iranyekan.variable}`}>
      <body className={`${vazirmatn.className} antialiased bg-background text-foreground`}>
        {children}
      </body>
    </html>
  );
}