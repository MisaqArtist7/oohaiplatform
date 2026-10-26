"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  User,
  Phone,
  Building2,
  FileText,
  Clock,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  Copy,
  Check,
  Download,
  Loader2,
  Calendar,
} from "lucide-react";
import { toast } from "sonner";
import { Structure, BookingResponse } from "@/features/structures";
import { formatToman, toPersianDigits } from "@/lib/mock-data";
import {
  bookingRequestSchema,
  BookingRequestFormValues,
} from "../schemas/booking.schema";
import { useCreateBookingMutation } from "../hooks/useBookings";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Textarea } from "@/shared/components/ui/textarea";
import { Badge } from "@/shared/components/ui/badge";
import { Card } from "@/shared/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/shared/components/ui/dialog";

interface BookingSidebarProps {
  structure: Structure;
}

export default function BookingSidebar({ structure }: BookingSidebarProps) {
  const [selectedDurationPreset, setSelectedDurationPreset] = useState<number>(30);
  const [successResponse, setSuccessResponse] = useState<BookingResponse | null>(null);
  const [copiedTracking, setCopiedTracking] = useState(false);

  const createBookingMutation = useCreateBookingMutation();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<BookingRequestFormValues>({
    resolver: zodResolver(bookingRequestSchema),
    defaultValues: {
      structureId: structure.id,
      fullName: "",
      phone: "",
      brandName: "",
      startDate: "2026-04-01",
      endDate: "2026-05-01",
      durationDays: 30,
      notes: "",
    },
  });

  const startDate = watch("startDate");
  const endDate = watch("endDate");

  // محاسبه روزها بین دو تاریخ
  const calculateDays = (start: string, end: string) => {
    try {
      const s = new Date(start);
      const e = new Date(end);
      const diffTime = e.getTime() - s.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return Math.max(diffDays, structure.specs.minDurationDays || 15);
    } catch {
      return 30;
    }
  };

  const currentDurationDays = calculateDays(startDate, endDate);
  const dailyRate = structure.pricing.dailyRate;
  const rawTotal = currentDurationDays * dailyRate;

  // تخفیف ماهانه در صورتی که مدت بیش از ۳۰ روز باشد
  const discountPercent =
    currentDurationDays >= 30
      ? structure.pricing.discountMonthlyPercent || 5
      : 0;
  const discountAmount = Math.round((rawTotal * discountPercent) / 100);
  const estimatedTotal = rawTotal - discountAmount;

  // تغییر پریست مدت زمان
  const handleDurationPreset = (days: number) => {
    setSelectedDurationPreset(days);
    const start = startDate ? new Date(startDate) : new Date();
    const end = new Date(start.getTime() + days * 24 * 60 * 60 * 1000);
    const endStr = end.toISOString().split("T")[0];
    setValue("endDate", endStr);
    setValue("durationDays", days);
  };

  const onSubmit = async (values: BookingRequestFormValues) => {
    try {
      const payload = {
        ...values,
        structureId: structure.id,
        durationDays: currentDurationDays,
        estimatedPrice: estimatedTotal,
      };

      const response = await createBookingMutation.mutateAsync(payload);
      setSuccessResponse(response);
      toast.success("درخواست رزرو اولیه با موفقیت ثبت شد!");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "خطایی در ثبت درخواست رخ داد.";
      toast.error(msg);
    }
  };

  const handleCopyTrackingCode = () => {
    if (successResponse?.trackingCode) {
      navigator.clipboard.writeText(successResponse.trackingCode);
      setCopiedTracking(true);
      toast.info("کد پیگیری در کلیپ‌بورد کپی شد.");
      setTimeout(() => setCopiedTracking(false), 2000);
    }
  };

  return (
    <>
      <Card className="sticky top-20 shadow-md overflow-hidden transition-all border-border bg-card">
        {/* هدر تعرفه و وضعیت */}
        <div className="border-b border-border bg-linear-to-l from-slate-50 to-indigo-50/40 p-5 sm:p-6 text-right">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-baseline gap-1.5">
                <span className="text-2xl sm:text-3xl font-black text-foreground">
                  {toPersianDigits(dailyRate.toLocaleString("fa-IR"))}
                </span>
                <span className="text-xs font-semibold text-muted-foreground">تومان / روزانه</span>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                تعرفه ماهانه: {toPersianDigits(structure.pricing.basePriceMonthly.toLocaleString("fa-IR"))} تومان
              </p>
            </div>

            <Badge variant="success" className="gap-1 py-1 px-2.5">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              آماده پذیرش رزرو
            </Badge>
          </div>
        </div>

        {/* فرم ثبت رزرو با React Hook Form و Zod */}
        <form onSubmit={handleSubmit(onSubmit)} className="p-5 sm:p-6 space-y-5 text-right">
          {/* انتخاب بازه زمانی */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold text-foreground flex items-center gap-1.5">
                <Clock className="h-4 w-4 text-primary" />
                <span>مدت دوره اکران</span>
              </label>
              <span className="text-xs font-bold text-primary font-mono">
                {toPersianDigits(currentDurationDays)} روز
              </span>
            </div>

            {/* پریست‌های آماده روز */}
            <div className="grid grid-cols-4 gap-1.5 mb-3">
              {[15, 30, 45, 90].map((days) => (
                <button
                  type="button"
                  key={days}
                  onClick={() => handleDurationPreset(days)}
                  className={`rounded-xl border py-2 text-xs font-bold transition-all cursor-pointer ${
                    selectedDurationPreset === days
                      ? "border-primary bg-primary/10 text-primary shadow-xs"
                      : "border-border bg-muted/40 text-muted-foreground hover:bg-muted hover:text-foreground"
                  }`}
                >
                  {toPersianDigits(days)} روزه
                </button>
              ))}
            </div>

            {/* ورودی تاریخ شروع و پایان */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <span className="block text-[11px] font-medium text-muted-foreground mb-1">
                  تاریخ شروع:
                </span>
                <Input
                  type="date"
                  {...register("startDate")}
                  className="text-xs"
                />
              </div>
              <div>
                <span className="block text-[11px] font-medium text-muted-foreground mb-1">
                  تاریخ پایان:
                </span>
                <Input
                  type="date"
                  {...register("endDate")}
                  className="text-xs"
                />
              </div>
            </div>
            {errors.startDate && (
              <p className="mt-1 text-[11px] text-destructive font-bold">
                {errors.startDate.message}
              </p>
            )}
            {errors.endDate && (
              <p className="mt-1 text-[11px] text-destructive font-bold">
                {errors.endDate.message}
              </p>
            )}
          </div>

          {/* فیلدهای مشخصات متقاضی */}
          <div className="space-y-3 pt-2 border-t border-border">
            <div>
              <label className="block text-xs font-bold text-foreground mb-1">
                نام و نام خانوادگی مسئول هماهنگی *
              </label>
              <div className="relative">
                <Input
                  type="text"
                  placeholder="مثال: محمدرضا کمالی"
                  {...register("fullName")}
                  className="pr-9"
                />
                <User className="absolute right-3 top-2.5 h-4 w-4 text-muted-foreground pointer-events-none" />
              </div>
              {errors.fullName && (
                <p className="mt-1 text-[11px] text-destructive font-bold">
                  {errors.fullName.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold text-foreground mb-1">
                شماره موبایل فعال (جهت ارسال پیامک و قرارداد) *
              </label>
              <div className="relative">
                <Input
                  type="tel"
                  dir="ltr"
                  placeholder="09123456789"
                  {...register("phone")}
                  className="pr-9 text-left font-mono"
                />
                <Phone className="absolute right-3 top-2.5 h-4 w-4 text-muted-foreground pointer-events-none" />
              </div>
              {errors.phone && (
                <p className="mt-1 text-[11px] text-destructive font-bold">
                  {errors.phone.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold text-foreground mb-1">
                نام برند یا شرکت تجاری *
              </label>
              <div className="relative">
                <Input
                  type="text"
                  placeholder="مثال: آژانس هواپیمایی یا دیجی‌کالا"
                  {...register("brandName")}
                  className="pr-9"
                />
                <Building2 className="absolute right-3 top-2.5 h-4 w-4 text-muted-foreground pointer-events-none" />
              </div>
              {errors.brandName && (
                <p className="mt-1 text-[11px] text-destructive font-bold">
                  {errors.brandName.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold text-foreground mb-1">
                توضیحات و نیازمندی‌های خاص طرح (اختیاری)
              </label>
              <Textarea
                rows={2}
                placeholder="توضیحات مربوط به چاپ بنر، نورپردازی شب یا زمان‌بندی نصب..."
                {...register("notes")}
              />
            </div>
          </div>

          {/* فاکتور و برآورد مالی */}
          <div className="rounded-xl bg-muted/50 p-3.5 space-y-2 border border-border text-xs">
            <div className="flex justify-between items-center text-muted-foreground">
              <span>هزینه پایه ({toPersianDigits(currentDurationDays)} روز اکران):</span>
              <span className="font-mono font-bold text-foreground">
                {toPersianDigits(rawTotal.toLocaleString("fa-IR"))} تومان
              </span>
            </div>

            {discountPercent > 0 && (
              <div className="flex justify-between items-center text-emerald-600 font-bold">
                <span className="flex items-center gap-1">
                  <Sparkles className="h-3.5 w-3.5" />
                  تخفیف کمپین بلندمدت ({toPersianDigits(discountPercent)}٪):
                </span>
                <span className="font-mono">
                  - {toPersianDigits(discountAmount.toLocaleString("fa-IR"))} تومان
                </span>
              </div>
            )}

            <div className="border-t border-border pt-2 flex justify-between items-center">
              <span className="font-extrabold text-foreground text-sm">
                مبلغ برآورد کل:
              </span>
              <div className="text-left">
                <span className="text-base font-black text-primary font-mono block">
                  {toPersianDigits(estimatedTotal.toLocaleString("fa-IR"))}
                </span>
                <span className="text-[10px] text-muted-foreground font-semibold">تومان (بدون احتساب مالیات)</span>
              </div>
            </div>
          </div>

          {/* دکمه ارسال نهایی */}
          <Button
            type="submit"
            disabled={createBookingMutation.isPending}
            className="w-full h-11 text-sm font-black"
          >
            {createBookingMutation.isPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>در حال ثبت اولیه درخواست...</span>
              </>
            ) : (
              <span>ثبت درخواست رزرو و بررسی اولیه</span>
            )}
          </Button>

          {/* متن اطمینان‌بخشی و پشتیبانی */}
          <div className="flex items-center justify-center gap-1.5 text-center text-[11px] text-muted-foreground font-medium">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
            <span>قفل ۴۸ ساعته سازه پس از تایید اولیه کارشناسان اعمال می‌گردد</span>
          </div>
        </form>
      </Card>

      {/* مودال تایید ثبت درخواست و کد رهگیری */}
      <Dialog
        open={!!successResponse}
        onOpenChange={(open) => !open && setSuccessResponse(null)}
      >
        <DialogContent className="max-w-md text-right">
          <DialogHeader>
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-600 mx-auto mb-2">
              <CheckCircle2 className="h-6 w-6" />
            </div>
            <DialogTitle className="text-center text-lg font-black text-foreground">
              درخواست رزرو اولیه با موفقیت ثبت شد
            </DialogTitle>
            <DialogDescription className="text-center text-xs text-muted-foreground leading-relaxed pt-1">
              {successResponse?.message ||
                "اطلاعات درخواست شما در سامانه ثبت گردید و کارشناسان ما جهت هماهنگی نهایی با شما تماس خواهند گرفت."}
            </DialogDescription>
          </DialogHeader>

          {successResponse && (
            <div className="space-y-4 pt-2">
              <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 text-center">
                <span className="text-xs font-bold text-muted-foreground block mb-1">
                  کد رهگیری اختصاصی پرونده:
                </span>
                <div className="flex items-center justify-center gap-2">
                  <span className="font-mono text-xl font-black text-primary tracking-widest">
                    {successResponse.trackingCode}
                  </span>
                  <Button
                    type="button"
                    size="iconSm"
                    variant="ghost"
                    onClick={handleCopyTrackingCode}
                    title="کپی در کلیپ‌بورد"
                  >
                    {copiedTracking ? (
                      <Check className="h-4 w-4 text-emerald-600" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>

              <div className="rounded-xl bg-muted/60 p-3.5 text-xs text-muted-foreground space-y-1.5">
                <div className="flex justify-between">
                  <span>نام سازه:</span>
                  <span className="font-bold text-foreground">
                    {successResponse.bookingDetails?.structureTitle}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>نام متقاضی / برند:</span>
                  <span className="font-bold text-foreground">
                    {successResponse.bookingDetails?.brandName}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>مبلغ برآورد:</span>
                  <span className="font-bold text-primary font-mono">
                    {formatToman(successResponse.bookingDetails?.totalPrice || 0)}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-center gap-2 pt-2">
                <Button
                  onClick={() => setSuccessResponse(null)}
                  className="w-full"
                >
                  متوجه شدم، بازگشت
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
