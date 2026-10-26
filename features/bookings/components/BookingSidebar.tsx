"use client";

import React, { useId, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter, usePathname } from "next/navigation";
import { toast } from "sonner";
import {
  Building2,
  Clock,
  ShieldCheck,
  Loader2,
  CreditCard,
  Hash,
} from "lucide-react";
import type { Structure } from "@/features/structures/types";
import { formatToman } from "@/shared/lib/money";
import { toPersianDigits, toEnglishDigits } from "@/shared/lib/digits";
import { formatJalali } from "@/shared/lib/dates";
import { ApiError } from "@/shared/lib/errors";
import { useSession } from "@/features/auth";
import {
  createBookingSchema,
  CreateBookingFormValues,
} from "../schemas/booking.schema";
import { estimateTotalRial } from "../lib/estimate-price";
import { useCreateBookingMutation } from "../hooks/useBookings";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Textarea } from "@/shared/components/ui/textarea";
import { Badge } from "@/shared/components/ui/badge";
import { Card } from "@/shared/components/ui/card";

interface BookingSidebarProps {
  structure: Structure;
}

function getDefaultDates() {
  const now = new Date();
  const start = new Date(now.getTime() + 24 * 60 * 60 * 1000); // فردا
  const end = new Date(start.getTime() + 30 * 24 * 60 * 60 * 1000); // ۳۰ روز بعد

  const fmt = (d: Date) => {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
  };

  return {
    start: fmt(start),
    end: fmt(end),
  };
}

export default function BookingSidebar({ structure }: BookingSidebarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated } = useSession();
  const createBookingMutation = useCreateBookingMutation();

  const startDateId = useId();
  const endDateId = useId();
  const companyNameId = useId();
  const nationalId = useId();
  const noteId = useId();

  const monthlyPriceRial = Number(
    structure.price ?? structure.pricing?.basePriceMonthly ?? 0
  );

  const defaultDates = useMemo(() => getDefaultDates(), []);

  const defaultEstimatedRial = useMemo(
    () => estimateTotalRial(monthlyPriceRial, defaultDates.start, defaultDates.end),
    [monthlyPriceRial, defaultDates.start, defaultDates.end]
  );

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<CreateBookingFormValues>({
    resolver: zodResolver(createBookingSchema),
    defaultValues: {
      structure_id: Number(structure.id),
      start_date: defaultDates.start,
      end_date: defaultDates.end,
      company_name: "",
      national_id: "",
      note: "",
      total_amount: defaultEstimatedRial,
    },
  });

  const startDate = watch("start_date");
  const endDate = watch("end_date");

  // محاسبه مبلغ برآورد با تغییر تاریخ‌ها
  const estimatedTotalRial = useMemo(() => {
    const total = estimateTotalRial(monthlyPriceRial, startDate, endDate);
    setValue("total_amount", total);
    return total;
  }, [monthlyPriceRial, startDate, endDate, setValue]);

  const onSubmit = async (values: CreateBookingFormValues) => {
    if (!isAuthenticated) {
      toast.info("جهت ثبت درخواست رزرو، ابتدا وارد حساب کاربری خود شوید.");
      router.push(`/login?next=${encodeURIComponent(pathname || `/structures/${structure.id}`)}`);
      return;
    }

    try {
      const payload = {
        structure_id: Number(structure.id),
        start_date: values.start_date,
        end_date: values.end_date,
        company_name: values.company_name.trim(),
        national_id: toEnglishDigits(values.national_id).trim(),
        total_amount: estimatedTotalRial,
        note: values.note?.trim() || undefined,
      };

      await createBookingMutation.mutateAsync(payload);
      toast.success("درخواست رزرو با موفقیت ثبت شد و به پنل جزئیات منتقل شدید.");
    } catch (err: unknown) {
      if (err instanceof ApiError) {
        if (err.isValidation && err.fieldErrors) {
          for (const [field, messages] of Object.entries(err.fieldErrors)) {
            const msg = Array.isArray(messages) ? messages.join("، ") : String(messages);
            setError(field as keyof CreateBookingFormValues, {
              type: "server",
              message: msg,
            });
          }
          toast.error("لطفاً خطاهای مشخص‌شده در فرم را اصلاح فرمایید.");
          return;
        }

        if (err.isForbidden || err.isRateLimited) {
          toast.error(err.message || "خطای عدم دسترسی یا محدودیت تعداد درخواست");
          return;
        }

        toast.error(err.message || "خطایی در ثبت درخواست رزرو رخ داد.");
        return;
      }

      const msg = err instanceof Error ? err.message : "خطایی در ثبت درخواست رخ داد.";
      toast.error(msg);
    }
  };

  const handleActionClick = () => {
    if (!isAuthenticated) {
      router.push(`/login?next=${encodeURIComponent(pathname || `/structures/${structure.id}`)}`);
    }
  };

  return (
    <Card className="sticky top-20 shadow-md overflow-hidden transition-all border-border bg-card">
      {/* هدر تعرفه ماهانه */}
      <div className="border-b border-border bg-linear-to-l from-slate-50 to-indigo-50/40 dark:from-slate-900/60 dark:to-indigo-950/30 p-5 sm:p-6 text-right">
        <div className="flex items-start justify-between">
          <div>
            <span className="text-xs font-semibold text-muted-foreground block mb-1">
              تعرفه پایه ماهانه
            </span>
            <div className="text-2xl sm:text-3xl font-black text-foreground">
              {formatToman(monthlyPriceRial)}
            </div>
          </div>

          <Badge variant="success" className="gap-1 py-1 px-2.5">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
            آماده ثبت رزرو
          </Badge>
        </div>
      </div>

      {/* فرم ثبت رزرو */}
      <form onSubmit={handleSubmit(onSubmit)} className="p-5 sm:p-6 space-y-4 text-right">
        {/* انتخاب بازه زمانی */}
        <div className="space-y-3">
          <label className="text-xs font-bold text-foreground flex items-center gap-1.5">
            <Clock className="h-4 w-4 text-primary" />
            <span>بازه زمانی اکران</span>
          </label>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label
                htmlFor={startDateId}
                className="block text-[11px] font-medium text-muted-foreground mb-1"
              >
                تاریخ شروع (میلادی):
              </label>
              <Input
                id={startDateId}
                type="date"
                {...register("start_date")}
                className="text-xs font-mono"
              />
              {startDate && (
                <div className="text-[11px] text-muted-foreground mt-1 font-sans">
                  معادل شمسی: {toPersianDigits(formatJalali(startDate))}
                </div>
              )}
              {errors.start_date && (
                <p className="mt-1 text-[11px] text-destructive font-bold">
                  {errors.start_date.message}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor={endDateId}
                className="block text-[11px] font-medium text-muted-foreground mb-1"
              >
                تاریخ پایان (میلادی):
              </label>
              <Input
                id={endDateId}
                type="date"
                {...register("end_date")}
                className="text-xs font-mono"
              />
              {endDate && (
                <div className="text-[11px] text-muted-foreground mt-1 font-sans">
                  معادل شمسی: {toPersianDigits(formatJalali(endDate))}
                </div>
              )}
              {errors.end_date && (
                <p className="mt-1 text-[11px] text-destructive font-bold">
                  {errors.end_date.message}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* مشخصات شرکت و شناسه ملی */}
        <div className="space-y-3 pt-2 border-t border-border">
          <div>
            <label
              htmlFor={companyNameId}
              className="block text-xs font-bold text-foreground mb-1"
            >
              نام شرکت یا برند تجاری *
            </label>
            <div className="relative">
              <Input
                id={companyNameId}
                type="text"
                placeholder="مثال: شرکت تجارت نوین یا برند دیجی‌کالا"
                {...register("company_name")}
                className="pr-9"
              />
              <Building2 className="absolute right-3 top-2.5 h-4 w-4 text-muted-foreground pointer-events-none" />
            </div>
            {errors.company_name && (
              <p className="mt-1 text-[11px] text-destructive font-bold">
                {errors.company_name.message}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor={nationalId}
              className="block text-xs font-bold text-foreground mb-1"
            >
              کد ملی / شناسه ملی (۱۰ یا ۱۱ رقم) *
            </label>
            <div className="relative">
              <Input
                id={nationalId}
                type="text"
                dir="ltr"
                placeholder="10101234567"
                {...register("national_id")}
                className="pr-9 text-left font-mono"
              />
              <Hash className="absolute right-3 top-2.5 h-4 w-4 text-muted-foreground pointer-events-none" />
            </div>
            {errors.national_id && (
              <p className="mt-1 text-[11px] text-destructive font-bold">
                {errors.national_id.message}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor={noteId}
              className="block text-xs font-bold text-foreground mb-1"
            >
              توضیحات و نیازمندی‌ها (اختیاری)
            </label>
            <Textarea
              id={noteId}
              rows={2}
              placeholder="نکات خاص کمپین، نورپردازی یا زمان‌بندی نصب..."
              {...register("note")}
            />
            {errors.note && (
              <p className="mt-1 text-[11px] text-destructive font-bold">
                {errors.note.message}
              </p>
            )}
          </div>
        </div>

        {/* برآورد مبلغ */}
        <div className="rounded-xl bg-muted/50 p-3.5 space-y-2 border border-border text-xs">
          <div className="flex justify-between items-center">
            <span className="font-extrabold text-foreground text-sm flex items-center gap-1.5">
              <CreditCard className="h-4 w-4 text-primary" />
              <span>برآورد مبلغ:</span>
            </span>
            <div className="text-left">
              <span className="text-base font-black text-primary font-mono block">
                {formatToman(estimatedTotalRial)}
              </span>
              <span className="text-[10px] text-muted-foreground font-semibold">
                (برآورد موقت بر مبنای روزهای بازه)
              </span>
            </div>
          </div>
          {errors.total_amount && (
            <p className="mt-1 text-[11px] text-destructive font-bold">
              {errors.total_amount.message}
            </p>
          )}
        </div>

        {/* دکمه ثبت درخواست رزرو */}
        <Button
          type="submit"
          onClick={handleActionClick}
          disabled={createBookingMutation.isPending || isSubmitting}
          className="w-full h-11 text-sm font-black"
        >
          {createBookingMutation.isPending || isSubmitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin ml-2" />
              <span>در حال ارسال درخواست...</span>
            </>
          ) : (
            <span>ثبت درخواست رزرو</span>
          )}
        </Button>

        {/* راهنمای متن رزرو */}
        <div className="flex items-start gap-2 p-2.5 rounded-lg bg-blue-50/50 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900/50 text-[11px] text-muted-foreground font-medium leading-relaxed">
          <ShieldCheck className="h-4 w-4 text-primary shrink-0 mt-0.5" />
          <span>
            پس از بررسی و تأیید اولیه توسط مدیر، سازه برای ۴۸ ساعت جهت قرارداد قفل می‌شود.
          </span>
        </div>
      </form>
    </Card>
  );
}
