export default function RegisterPage() {
    return (
        // Main container
        <div className="min-h-screen flex items-center justify-center bg-muted p-4" >
        {/* Registration card */}
        <div className="w-full max-w-md bg-background rounded-2xl shadow-sm border border-border p-8">
            {/* Form header */}
            <div className="mb-8 text-center">
            <h2 className="text-2xl font-bold text-foreground mb-2">
                :ثبت‌نام
            </h2>

            <p className="text-sm text-muted-foreground">
                برای ادامه، اطلاعات خود را وارد کنید
            </p>
            </div>

            {/* Registration form */}
            <form className="space-y-5">
            {/* Full name field */}
            <div className="flex flex-col gap-1.5">
                <label
                htmlFor="fullName"
                className="text-sm font-medium text-foreground"
                >
                نام و نام خانوادگی
                </label>

                <input
                type="text"
                id="fullName"
                name="name"
                placeholder="مثال: علی احمدی"
                className="w-full px-4 py-3 rounded-xl border border-border bg-muted focus:bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-foreground placeholder:text-muted-foreground"
                />
            </div>

            {/* Phone number field */}
            <div className="flex flex-col gap-1.5">
                <label
                htmlFor="phoneNumber"
                className="text-sm font-medium text-foreground"
                >
                شماره تماس
                </label>

                <input
                type="tel"
                id="phoneNumber"
                name="phone"
                placeholder="09123456789"
                dir="ltr"
                className="w-full px-4 py-3 rounded-xl border border-border bg-muted focus:bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-foreground text-left placeholder:text-muted-foreground placeholder:text-right"
                />
            </div>

            {/* Submit button */}
            <button
                type="submit"
                className="w-full mt-2 bg-primary hover:bg-primary/90 text-primary-foreground font-medium py-3.5 px-4 rounded-xl transition-colors duration-200 shadow-md active:scale-[0.98]"
            >
                تأیید و ثبت‌نام
            </button>
            </form>
        </div>
        </div>
    );
}