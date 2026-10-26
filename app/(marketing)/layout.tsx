// app/(public)/layout.tsx
import Header from "@/shared/components/layout/Header";
import Footer from "@/shared/components/layout/Footer";

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen flex flex-col bg-background text-foreground">
            <Header />
            <main className="flex-1">{children}</main>
            <Footer />
        </div>
    );
}                           