"use client";

import React, { useRef, useState, useId } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import {
  CreditCard,
  Upload,
  Trash2,
  Loader2,
  FileText,
  Image as ImageIcon,
  AlertCircle,
} from "lucide-react";
import { useSubmitPayment } from "../hooks/useBookings";
import {
  paymentSubmissionSchema,
  PaymentSubmissionFormValues,
} from "../schemas/booking.schema";
import { formatToman, tomanToRial } from "@/shared/lib/money";
import { toPersianDigits, toEnglishDigits } from "@/shared/lib/digits";
import { ApiError } from "@/shared/lib/errors";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Textarea } from "@/shared/components/ui/textarea";

interface PaymentSubmissionFormProps {
  bookingUuid: string;
  totalAmount?: string | number;
  onSuccess?: () => void;
}

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export default function PaymentSubmissionForm({
  bookingUuid,
  totalAmount,
  onSuccess,
}: PaymentSubmissionFormProps) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  const referenceInputId = useId();
  const amountInputId = useId();
  const noteInputId = useId();

  const submitPaymentMutation = useSubmitPayment(bookingUuid);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    setError,
    clearErrors,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<PaymentSubmissionFormValues>({
    resolver: zodResolver(paymentSubmissionSchema),
    defaultValues: {
      document: null,
      document_type: "payment_receipt",
      payment_reference: "",
      amount: "",
      note: "",
    },
  });

  const selectedDocumentType = watch("document_type");

  const validateAndSetFile = (file: File | undefined | null) => {
    if (!file) return;

    if (file.size > MAX_FILE_SIZE) {
      toast.error("حجم فایل انتخابی بیش از ۱۰ مگابایت است. لطفاً فایل کم‌حجم‌تری انتخاب کنید.");
      setError("document", {
        type: "manual",
        message: "حجم فایل نمی‌تواند بیش از ۱۰ مگابایت باشد",
      });
      return;
    }

    const isValidType =
      file.type === "application/pdf" || file.type.startsWith("image/");
    if (!isValidType) {
      toast.error("فرمت فایل نامعتبر است. تنها فایل‌های PDF یا تصویر (JPG، PNG، WebP) مجاز هستند.");
      setError("document", {
        type: "manual",
        message: "فقط فایل‌های PDF یا تصاویر مجاز هستند",
      });
      return;
    }

    clearErrors("document");
    setSelectedFile(file);
    setValue("document", file, { shouldValidate: true });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    validateAndSetFile(file);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files?.[0];
    validateAndSetFile(file);
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    setValue("document", null, { shouldValidate: true });
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const onSubmit = async (values: PaymentSubmissionFormValues) => {
    if (isPending) return;

    if (!selectedFile) {
      setError("document", {
        type: "manual",
        message: "انتخاب فایل مدرک پرداخت الزامی است",
      });
      return;
    }

    try {
      const formData = new FormData();
      formData.append("document", selectedFile);
      formData.append("document_type", values.document_type);
      formData.append(
        "payment_reference",
        toEnglishDigits(values.payment_reference).trim()
      );

      // ارسال مبلغ به ریال در صورت پر بودن
      if (values.amount && values.amount.toString().trim()) {
        const cleanedToman = Number(
          toEnglishDigits(values.amount.toString()).replace(/,/g, "")
        );
        if (cleanedToman > 0) {
          const rialAmount = tomanToRial(cleanedToman);
          formData.append("amount", String(rialAmount));
        }
      }

      // ارسال یادداشت اختیاری
      if (values.note && values.note.trim()) {
        formData.append("note", values.note.trim());
      }

      await submitPaymentMutation.mutateAsync(formData);

      toast.success("مدرک پرداخت ثبت شد و در انتظار بررسی است");
      reset();
      setSelectedFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
      onSuccess?.();
    } catch (err: unknown) {
      if (err instanceof ApiError) {
        if (err.isValidation && err.fieldErrors) {
          for (const [field, messages] of Object.entries(err.fieldErrors)) {
            const msg = Array.isArray(messages) ? messages.join("، ") : String(messages);
            setError(field as keyof PaymentSubmissionFormValues, {
              type: "server",
              message: msg,
            });
          }
          toast.error("لطفاً خطاهای مشخص‌شده در فرم پرداخت را اصلاح فرمایید.");
          return;
        }

        if (err.isRateLimited) {
          toast.error("محدودیت تعداد درخواست. لطفاً کمی بعد مجدداً تلاش فرمایید.");
          return;
        }

        toast.error(err.message || "خطا در ثبت مدرک پرداخت");
        return;
      }

      const msg = err instanceof Error ? err.message : "خطایی در ثبت مدرک پرداخت رخ داد.";
      toast.error(msg);
    }
  };

  const isPending = submitPaymentMutation.isPending || isSubmitting;

  return (
    <div className="rounded-2xl border border-primary/30 bg-card p-6 shadow-2xs space-y-5">
      {/* هدر فرم */}
      <div className="flex items-center gap-2.5 pb-3 border-b border-border">
        <div className="p-2 rounded-xl bg-primary/10 text-primary">
          <CreditCard className="h-5 w-5" />
        </div>
        <div>
          <h3 className="text-sm font-black text-foreground">
            ثبت مدرک پرداخت (فیش واریزی یا چک صیادی)
          </h3>
          <p className="text-[11px] text-muted-foreground mt-0.5">
            تصویر فیش واریز ساتنا یا تصویر چک صیادی را بارگذاری فرمایید.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 text-right">
        {/* ۱. انتخاب نوع مدرک پرداخت (فقط دو گزینه استاندارد) */}
        <div>
          <label className="block text-xs font-bold text-foreground mb-2">
            نوع مدرک پرداخت *
          </label>
          <div className="grid grid-cols-2 gap-3">
            <label
              className={`flex items-center gap-2.5 p-3 rounded-xl border text-xs font-bold cursor-pointer transition-all ${
                selectedDocumentType === "payment_receipt"
                  ? "border-primary bg-primary/10 text-primary shadow-xs"
                  : "border-border bg-muted/30 text-muted-foreground hover:bg-muted"
              }`}
            >
              <input
                type="radio"
                value="payment_receipt"
                {...register("document_type")}
                className="accent-primary"
              />
              <span>فیش واریز ساتنا</span>
            </label>

            <label
              className={`flex items-center gap-2.5 p-3 rounded-xl border text-xs font-bold cursor-pointer transition-all ${
                selectedDocumentType === "sayadi_check"
                  ? "border-primary bg-primary/10 text-primary shadow-xs"
                  : "border-border bg-muted/30 text-muted-foreground hover:bg-muted"
              }`}
            >
              <input
                type="radio"
                value="sayadi_check"
                {...register("document_type")}
                className="accent-primary"
              />
              <span>چک صیادی</span>
            </label>
          </div>
          {errors.document_type && (
            <p className="mt-1 text-[11px] text-destructive font-bold">
              {errors.document_type.message}
            </p>
          )}
        </div>

        {/* ۲. بارگذاری فایل مدرک پرداخت (حداکثر ۱۰ مگابایت، PDF یا تصویر) */}
        <div>
          <label className="block text-xs font-bold text-foreground mb-1.5">
            تصویر فیش یا فایل چک (PDF یا تصویر، حداکثر ۱۰ مگابایت) *
          </label>

          <input
            ref={fileInputRef}
            type="file"
            accept="application/pdf,image/*"
            onChange={handleFileChange}
            className="hidden"
          />

          {!selectedFile ? (
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragOver(true);
              }}
              onDragLeave={() => setIsDragOver(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`rounded-2xl border-2 border-dashed p-6 text-center cursor-pointer transition-all ${
                isDragOver
                  ? "border-primary bg-primary/10"
                  : "border-border bg-muted/20 hover:bg-muted/40 hover:border-primary/50"
              }`}
            >
              <Upload className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-xs font-bold text-foreground">
                کلیک کنید یا فایل را اینجا رها کنید
              </p>
              <p className="text-[11px] text-muted-foreground mt-1">
                فرمت‌های مجاز: PDF یا تصویر (حداکثر ۱۰ مگابایت)
              </p>
            </div>
          ) : (
            <div className="flex items-center justify-between p-3.5 rounded-xl border border-border bg-muted/40">
              <div className="flex items-center gap-3 min-w-0">
                <div className="p-2 rounded-lg bg-primary/10 text-primary shrink-0">
                  {selectedFile.type === "application/pdf" ? (
                    <FileText className="h-5 w-5" />
                  ) : (
                    <ImageIcon className="h-5 w-5" />
                  )}
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-foreground truncate" dir="ltr">
                    {selectedFile.name}
                  </p>
                  <p className="text-[11px] text-muted-foreground">
                    {toPersianDigits(
                      (selectedFile.size / (1024 * 1024)).toFixed(2)
                    )}{" "}
                    مگابایت
                  </p>
                </div>
              </div>

              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleRemoveFile}
                className="text-destructive hover:text-destructive hover:bg-destructive/10 h-8 w-8 p-0 shrink-0"
                title="حذف فایل"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          )}

          {errors.document?.message && (
            <p className="mt-1.5 text-[11px] text-destructive font-bold flex items-center gap-1">
              <AlertCircle className="h-3.5 w-3.5 shrink-0" />
              <span>{String(errors.document.message)}</span>
            </p>
          )}
        </div>

        {/* ۳. شناسه رهگیری پرداخت (حداقل ۶ کاراکتر) */}
        <div>
          <label
            htmlFor={referenceInputId}
            className="block text-xs font-bold text-foreground mb-1"
          >
            {selectedDocumentType === "payment_receipt"
              ? "کد رهگیری واریز *"
              : "شناسه ۱۶ رقمی صیادی *"}
          </label>
          <Input
            id={referenceInputId}
            type="text"
            dir="ltr"
            placeholder={
              selectedDocumentType === "payment_receipt"
                ? "مثال: 94827105"
                : "مثال: 1234567890123456"
            }
            {...register("payment_reference")}
            className="font-mono text-left text-xs"
          />
          <p className="text-[11px] text-muted-foreground mt-1">
            {selectedDocumentType === "payment_receipt"
              ? "کد رهگیری واریز"
              : "شناسه ۱۶ رقمی صیادی"}
          </p>
          {errors.payment_reference && (
            <p className="mt-1 text-[11px] text-destructive font-bold">
              {errors.payment_reference.message}
            </p>
          )}
        </div>

        {/* ۴. مبلغ پرداختی (اختیاری، به تومان) */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label
              htmlFor={amountInputId}
              className="text-xs font-bold text-foreground"
            >
              مبلغ پرداختی به تومان (اختیاری)
            </label>
            {totalAmount && (
              <span className="text-[11px] text-muted-foreground font-semibold">
                مبلغ کل رزرو: {formatToman(totalAmount)}
              </span>
            )}
          </div>
          <Input
            id={amountInputId}
            type="text"
            dir="ltr"
            placeholder="در صورت واریز بخشی از مبلغ یا خالی گذاشتن کل مبلغ..."
            {...register("amount")}
            className="font-mono text-left text-xs"
          />
          <p className="text-[11px] text-muted-foreground mt-1">
            مبلغ بر حسب تومان است و در زمان ارسال به طور خودکار به ریال تبدیل می‌شود.
          </p>
          {errors.amount && (
            <p className="mt-1 text-[11px] text-destructive font-bold">
              {errors.amount.message}
            </p>
          )}
        </div>

        {/* ۵. یادداشت و توضیحات (اختیاری) */}
        <div>
          <label
            htmlFor={noteInputId}
            className="block text-xs font-bold text-foreground mb-1"
          >
            یادداشت و توضیحات تکمیلی (اختیاری)
          </label>
          <Textarea
            id={noteInputId}
            rows={2}
            placeholder="توضیحات در مورد نام بانک، شعبه یا شرایط پرداخت..."
            {...register("note")}
            className="text-xs"
          />
          {errors.note && (
            <p className="mt-1 text-[11px] text-destructive font-bold">
              {errors.note.message}
            </p>
          )}
        </div>

        {/* دکمه ارسال */}
        <Button
          type="submit"
          disabled={isPending}
          className="w-full h-11 text-xs font-bold"
        >
          {isPending ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin ml-2" />
              <span>در حال ارسال مدرک پرداخت...</span>
            </>
          ) : (
            <span>ثبت نهایی مدرک پرداخت</span>
          )}
        </Button>
      </form>
    </div>
  );
}
