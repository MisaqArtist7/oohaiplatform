import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "پلت فرم اوهای | OoHai Platform",
  description: "پلت فرم اوهای، یک پلت فرم جامع برای مدیریت و توسعه کسب و کارهای آنلاین است. با استفاده از ابزارها و خدمات ما، می‌توانید به راحتی کسب و کار خود را رشد دهید و به موفقیت برسید.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="fa" dir="rtl"
      className="h-full antialiased"
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
