// app/(public)/layout.tsx
import Header from "@/components/common/Header/page";
import Footer from "@/components/common/Footer/page";

export default function MarketingLayout({ children }: LayoutProps<"/">) {
    return (
        <div className="min-h-screen flex flex-col bg-background text-foreground">
            <Header />
            <main className="flex-1">{children}</main>
            <Footer />
        </div>
    );
}                           