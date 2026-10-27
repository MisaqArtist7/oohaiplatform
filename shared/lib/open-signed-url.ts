import { toast } from "sonner";
import { ApiError } from "@/shared/lib/errors";

export interface OpenSignedUrlOptions {
  errorMessage?: string;
  onSuccess?: () => void;
}

/**
 * مدیریت امن و استاندارد باز کردن لینک‌های امضاشده موقت (Signed URL)
 * 
 * اصول امنیتی و استانداردهای رعایت‌شده:
 * ۱. پیش‌باز کردن تب (`about:blank`) برای جلوگیری از مسدود شدن پاپ‌آپ توسط مرورگر
 * ۲. انتقال موقعیت پنجره به `download_url` با خنثی‌سازی `opener` جهت پیشگیری از حملات Tabnabbing
 * ۳. عدم ذخیره، کش یا لاگ کردن `download_url` در کنسول
 * ۴. بستن تب پیش‌باز در صورت بروز خطا و نمایش پیام خطای دقیق
 */
export async function openSignedUrl(
  fetchUrlFn: () => Promise<{ download_url?: string } | null | undefined>,
  options: OpenSignedUrlOptions = {}
): Promise<boolean> {
  let newTab: Window | null = null;
  try {
    newTab = window.open("about:blank", "_blank");
  } catch {
    newTab = null;
  }

  try {
    const res = await fetchUrlFn();

    if (res?.download_url) {
      if (newTab && !newTab.closed) {
        newTab.opener = null;
        newTab.location.href = res.download_url;
      } else {
        toast.info("لینک دانلود امن آماده شد", {
          action: {
            label: "باز کردن لینک",
            onClick: () => {
              window.open(res.download_url, "_blank", "noopener,noreferrer");
            },
          },
        });
      }
      options.onSuccess?.();
      return true;
    } else {
      newTab?.close();
      toast.error(options.errorMessage || "دسترسی به این مدرک ممکن نیست");
      return false;
    }
  } catch (err: unknown) {
    newTab?.close();
    if (err instanceof ApiError) {
      if (err.status === 403 || err.status === 404) {
        toast.error("دسترسی به این مدرک ممکن نیست");
        return false;
      }
      toast.error(err.message || options.errorMessage || "خطا در دریافت لینک دانلود");
      return false;
    }
    toast.error(options.errorMessage || "دسترسی به این مدرک ممکن نیست");
    return false;
  }
}
