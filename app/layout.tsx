// app/layout.tsx
import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";

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

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="fa" dir="rtl" className={iranyekan.variable}>
      <body className={`${iranyekan.className} antialiased bg-background text-foreground`}>
        {children}
      </body>
    </html>
  );
}