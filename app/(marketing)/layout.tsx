// app/(public)/layout.tsx
import Header from "@/components/common/Header/page";
import Footer from "@/components/common/Footer/page";

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