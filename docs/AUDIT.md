# گزارش ممیزی وضعیت واقعی کد (Codebase Audit Report)

**تاریخ تهیه گزارش:** ۴ آبان ۱۴۰۵ (2026-10-25)  
**هدف:** مستندسازی دقیق وضعیت فعلی کدبیس، جداسازی بخش‌های موک و شبیه‌سازی‌شده از اتصال واقعی به بک‌اند، استخراج ناسازگاری‌ها با سند `docs/backend-api.md` و ثبت تمامی مقادیر هاردکد، بدون تغییر در هیچ فایل کدی.  
**قانون اعتبارسنجی:** کلیه موارد بر اساس بررسی عینی خط به خط کدهای سورس‌کد تنظیم شده و از هرگونه حدس و گمان پرهیز شده است (هر مورد غیرقابل‌تایید با عنوان «نامشخص» قید شده است).

---

## ۱. فهرست Mockها و مخازن داده درون‌حافظه‌ای (Mock & In-Memory Stores)

در این بخش تمامی فایل‌ها، توابع، آرایه‌ها و متغیرهایی که داده ثابت، شبیه‌سازی‌شده یا مخزن درون‌حافظه‌ای (In-Memory State) دارند به همراه صادرکننده‌ها و مصرف‌کنندگان (Importers) دقیق لیست شده‌اند:

### ۱.۱. فایل `lib/mock-data.ts`
* **محتوا و ساختارهای تعریف‌شده:**
  * `mockStructureTypes`: آرایه ثابت انواع سازه شامل ۵ نوع (بیلبورد بزرگراهی، استرابورد، عرشه پل عابر پیاده، تلویزیون شهری دیجیتال، لایت‌باکس).
  * `mockStructureCategories`: آرایه ثابت ۶ دسته‌بندی سازه‌ها (بزرگراهی، شریانی، تقاطع، تجاری، فرهنگی، مناسبتی).
  * `mockStructures`: آرایه ۱۲ سازه تبلیغاتی با جزئیات کامل مهندسی، جغرافیایی، قیمت، ابعاد و تصاویر Unsplash.
  * `structuresStore`: مخزن تغییرپذیر درون‌حافظه‌ای (`let structuresStore = [...mockStructures]`).
  * `mockBookingsStore`: آرایه درون‌حافظه‌ای نمونه رزروها.
  * توابع صادرشده:
    * `toPersianDigits(input)`: تبدیل اعداد انگلیسی به فارسی.
    * `formatToman(amount)`: قالب‌بندی قیمت (بدون تبدیل ریال/تومان، صرفاً اعمال ویرگول ۳ رقمی و پسوند "تومان").
    * `formatShortToman(amount)`: تبدیل مبالغ بالا به «میلیارد» یا «م» برای پین‌های نقشه.
    * `getMyStructuresList()`: فیلتر کردن سازه‌ها بر اساس کاربر جاری از مخزن محلی.
    * `addNewStructure(data)`: افزودن شیء سازه جدید به آرایه درون‌حافظه‌ای `structuresStore`.
    * `updateExistingStructure(id, data)`: ویرایش سازه در آرایه `structuresStore`.
* **چه کسانی آن را Import می‌کنند؟**
  1. `lib/api-client.ts` (توابع و انواع سازه جهت Fallback)
  2. `lib/media-owner-api.ts` (`getMyStructuresList`, `addNewStructure`, `updateExistingStructure`)
  3. `features/structures/api/structures.api.ts` (توابع موک سازه‌ها)
  4. `features/media-owner/api/media-owner.api.ts` (`getMyStructuresList`, `addNewStructure`, `updateExistingStructure`)
  5. `features/bookings/components/BookingSidebar.tsx` (`formatToman`, `toPersianDigits`)
  6. `features/media-owner/components/StructureFormView.tsx` (`formatToman`, `toPersianDigits`)
  7. `components/structures/StructuresExplorer.tsx` (`mockStructureTypes`, `mockStructureCategories`, `mockStructures`)
  8. `components/structures/InteractiveMap.tsx` (`formatToman`, `formatShortToman`, `toPersianDigits`)
  9. `components/structures/StructureCard.tsx` (`formatToman`, `toPersianDigits`)
  10. `components/structures/StructureFilters.tsx` (`mockStructureTypes`, `mockStructureCategories`)
  11. `components/structures/MiniMapLocation.tsx` (`toPersianDigits`)
  12. `components/structures/StructureSpecs.tsx` (`toPersianDigits`)
  13. `components/client/bookings/BookingsListView.tsx` (`formatToman`, `toPersianDigits`)
  14. `components/client/bookings/BookingDetailView.tsx` (`formatToman`, `toPersianDigits`)
  15. `components/client/proposals/ProposalsView.tsx` (`formatToman`, `toPersianDigits`)
  16. `components/client/media-owner/MediaOwnerRequestView.tsx` (`toPersianDigits`)
  17. `components/media-owner/structures/MyStructuresListView.tsx` (`formatToman`, `toPersianDigits`, `getMyStructuresList`)
  18. `app/(marketing)/structures/page.tsx` (`mockStructureTypes`, `mockStructureCategories`, `mockStructures`)
  19. `app/(marketing)/structures/[structureId]/page.tsx` (`mockStructures`)
  20. `app/(dashboard)/dashboard/bookings/page.tsx` (`formatToman`, `toPersianDigits`)
  21. `app/(dashboard)/dashboard/proposals/page.tsx` (`formatToman`, `toPersianDigits`)
  22. `app/media-owner/structures/[structureId]/edit/page.tsx` (`mockStructures`)
  23. `app/api/v1/structures/route.ts` (`structuresStore`, `addNewStructure`)
  24. `app/api/v1/structures/[structureId]/route.ts` (`structuresStore`, `updateExistingStructure`)
  25. `app/api/v1/structures/types/route.ts` (`mockStructureTypes`)
  26. `app/api/v1/structures/categories/route.ts` (`mockStructureCategories`)
  27. `app/api/v1/my-structures/route.ts` (`getMyStructuresList`)
  28. `app/api/v1/client/bookings/route.ts` (`mockStructures`)

---

### ۱.۲. فایل `lib/client-dashboard-data.ts`
* **محتوا و ساختارهای تعریف‌شده:**
  * `initialClientBookings`: آرایه ثابت شامل ۳ نمونه رزرو کامل با لاگ‌های تغییر وضعیت و اسناد پیش‌فاکتور ضمیمه.
  * `clientBookingsStore`: استور درون‌حافظه‌ای تغییرپذیر (`let clientBookingsStore = [...initialClientBookings]`).
  * `initialProposals`: آرایه ثابت شامل ۲ بسته پیشنهادی کمپین تبلیغاتی با بودجه‌های ۵۰ و ۱۲۰ میلیون تومانی.
  * `proposalsStore`: استور درون‌حافظه‌ای تغییرپذیر (`let proposalsStore = [...initialProposals]`).
  * `mediaOwnerApplicationsStore`: استور درون‌حافظه‌ای ثبت درخواست‌های همکاری مالکان رسانه (`mediaOwnerApplicationsStore = []`).
  * تابع `addPaymentToBooking(bookingId, paymentData)`: درج مستقیم فیش یا چک در رزرو مربوطه در حافظه محلی سرور.
* **چه کسانی آن را Import می‌کنند؟**
  1. `lib/client-api.ts` (`clientBookingsStore`, `proposalsStore`, `addPaymentToBooking`)
  2. `lib/admin-dashboard-data.ts` (`initialClientBookings`, `mediaOwnerApplicationsStore`)
  3. `features/bookings/api/bookings.api.ts` (`clientBookingsStore`, `addPaymentToBooking`)
  4. `features/proposals/api/proposals.api.ts` (`proposalsStore`)
  5. `app/api/auth/session/route.ts` (`mediaOwnerApplicationsStore`)
  6. `app/api/v1/client/bookings/route.ts` (`clientBookingsStore`)
  7. `app/api/v1/client/bookings/[bookingId]/route.ts` (`clientBookingsStore`)
  8. `app/api/v1/client/bookings/[bookingId]/payment/route.ts` (`addPaymentToBooking`)
  9. `app/api/v1/media-owner-requests/route.ts` (`mediaOwnerApplicationsStore`)
  10. `app/api/v1/proposals/route.ts` (`proposalsStore`)
  11. `app/api/v1/proposals/[id]/route.ts` (`proposalsStore`)
  12. `app/(dashboard)/dashboard/bookings/[bookingId]/page.tsx` (`clientBookingsStore`)
  13. `app/client/bookings/[bookingId]/page.tsx` (`clientBookingsStore`)

---

### ۱.۳. فایل `lib/admin-dashboard-data.ts`
* **محتوا و ساختارهای تعریف‌شده:**
  * `initialAdminRoles`: آرایه ۵ نقش سامانه شامل نقش‌های ساختگی `finance_manager` و `operations_manager`.
  * `initialAdminBookings`: آرایه نمونه رزروها برای پنل ادمین با متادیتا و تایم‌لاین.
  * `adminBookingsStore`: استور تغییرپذیر رزروهای ادمین.
  * `adminAuditLogsStore`: استور تغییرپذیر لاگ‌های ممیزی سیستم.
  * `initialAdminMediaOwnerRequests`: ۲ نمونه درخواست مالک رسانه با اطلاعات روزنامه رسمی و مجوزها.
  * `adminMediaOwnerRequestsStore`: استور تغییرپذیر درخواست‌های مالکان.
  * `initialAdminUsers`: آرایه ۵ کاربر ثابت با نقش‌های مختلف.
  * `adminUsersStore`: استور تغییرپذیر کاربران ادمین.
  * توابع تغییر وضعیت ادمین در حافظه محلی:
    * `lockAdminBooking`, `issueAdminProforma`, `approveAdminPayment`, `rejectAdminBooking`, `transitionAdminBookingStatus`
    * `approveMediaOwnerApplication`, `rejectMediaOwnerApplication`
    * `assignRoleToUser`, `removeRoleFromUser`
* **چه کسانی آن را Import می‌کنند؟**
  1. `lib/admin-api.ts` (تمام استورها و توابع تغییر وضعیت جهت Fallback)
  2. `features/admin/api/admin.api.ts` (Re-export مستقیم از `lib/admin-api.ts`)
  3. `app/api/auth/session/route.ts` (`adminMediaOwnerRequestsStore`)
  4. `app/api/v1/admin/bookings/route.ts` (`adminBookingsStore`)
  5. `app/api/v1/admin/bookings/[bookingId]/route.ts` (`adminBookingsStore`)
  6. `app/api/v1/admin/bookings/[bookingId]/lock/route.ts` (`lockAdminBooking`)
  7. `app/api/v1/admin/bookings/[bookingId]/proforma/route.ts` (`issueAdminProforma`)
  8. `app/api/v1/admin/bookings/[bookingId]/approve-payment/route.ts` (`approveAdminPayment`)
  9. `app/api/v1/admin/bookings/[bookingId]/reject/route.ts` (`rejectAdminBooking`)
  10. `app/api/v1/admin/bookings/[bookingId]/transition/route.ts` (`transitionAdminBookingStatus`)
  11. `app/api/v1/admin/bookings/[bookingId]/logs/route.ts` (`adminAuditLogsStore`)
  12. `app/api/v1/admin/media-owner-requests/route.ts` (`adminMediaOwnerRequestsStore`)
  13. `app/api/v1/admin/media-owner-requests/[requestId]/approve/route.ts` (`approveMediaOwnerApplication`)
  14. `app/api/v1/admin/media-owner-requests/[requestId]/reject/route.ts` (`rejectMediaOwnerApplication`)
  15. `app/api/v1/admin/users/route.ts` (`adminUsersStore`)
  16. `app/api/v1/admin/users/[userId]/route.ts` (`adminUsersStore`)
  17. `app/api/v1/admin/users/[userId]/roles/route.ts` (`adminUsersStore`, `assignRoleToUser`, `removeRoleFromUser`)
  18. `app/(dashboard)/dashboard/page.tsx` (`adminBookingsStore`)
  19. `app/admin/bookings/[bookingId]/page.tsx` (`adminBookingsStore`)

---

### ۱.۴. سایر داده‌های Mock و مقادیر Hardcode در بخش‌های دیگر
1. **`app/(dashboard)/dashboard/superadmin/types.ts`:**
   * متغیر `DEFAULT_SAMPLE_REQUESTS`: شامل ۴ درخواست همکاری موک با مدارک، کدهای ملی، و توضیحات نمونه.
   * مصرف‌کنندگان:
     * `app/(dashboard)/dashboard/superadmin/page.tsx` (خط ۹۰: در صورت خالی بودن دیتای سرور به عنوان Fallback استفاده می‌شود).
     * `app/(dashboard)/dashboard/superadmin/RequestsTable.tsx` (خط ۴۸: در صورت عدم وجود درخواست به عنوان پیش‌فرض رندر می‌شود).
2. **`app/api/v1/locations/route.ts`:**
   * متغیر `defaultLocations`: لیست ۳۱ استان و شهر ایران به صورت هاردکد در حافظه. در صورت بروز هرگونه خطای شبکه یا در دسترس نبودن سرور، مستقیماً به عنوان پاسخ برگشت داده می‌شود.
3. **`app/(marketing)/page.tsx`:**
   * متغیر `featuredStructures`: آرایه ۳ سازه نمونه با قیمت‌های هاردکد (`۱۸۵,۰۰۰,۰۰۰`، `۲۴۰,۰۰۰,۰۰۰`، `۳۱۰,۰۰۰,۰۰۰`).
   * متغیر `structureTypes`: آرایه ۵ نوع سازه با تعداد هاردکد ("۴۲۰ سازه"، "۱۸۵ سازه" و...).
4. **`components/client/media-owner/MediaOwnerRequestView.tsx`:**
   * نام سند موک: مقداردهی اولیه و پیش‌فرض با `["sample-license.pdf"]` در خطوط ۷۰ و ۹۶.
5. **روت‌های شبیه‌سازی دانلود پیش‌فاکتور:**
   * `app/api/v1/client/bookings/documents/[documentId]/download/route.ts` و `app/api/v1/admin/bookings/documents/[documentId]/download/route.ts`: به جای اتصال به سرور فایل یا S3، یک متن ساختگی متنی (ASCII Art) با شناسه جعلی تولید کرده و دانلود می‌کنند.

---

## ۲. جدول وضعیت Route Handlerها (`app/api/**`)

کل فایل‌های Route Handler در ساختار `app/api/**` دقیقا **۳۱ فایل** هستند. جدول زیر ماهیت واقعی هر روت را به طور کامل مشخص می‌کند:

| ردیف | مسیر Route در فرانت‌اند | متدهای HTTP | اتصال به بک‌اند واقعی؟ | Endpoint فراخوانی‌شده در بک‌اند | Fallback به Mock دارد؟ | جزئیات و استور Fallback |
| :--- | :--- | :--- | :---: | :--- | :---: | :--- |
| ۱ | `/api/auth/logout` | `POST` | **بله** | `${API}/auth/logout` | **خیر** | در صورت قطعی کوکی‌ها به هر حال پاک می‌شوند |
| ۲ | `/api/auth/session` | `GET` | **خیر** | *هیچ‌کدام* | **بله** | خواندن از کوکی و تطبیق با `adminMediaOwnerRequestsStore` و `mediaOwnerApplicationsStore` |
| ۳ | `/api/v1/otp/verify` | `POST` | **بله** | `${API}/otp/verify` | **خیر** | مستقیماً پاسخ خطای سرور را فوروارد می‌کند |
| ۴ | `/api/v1/locations` | `GET` | **بله** | `${API}/locations` | **بله** | در صورت خطا: آرایه `defaultLocations` (۳۱ استان) |
| ۵ | `/api/v1/structures` | `GET`, `POST` | **خیر** | *هیچ‌کدام* | **بله** | خواندن و نوشتن مستقیم روی `structuresStore` |
| ۶ | `/api/v1/structures/[structureId]` | `GET`, `PUT` | **خیر** | *هیچ‌کدام* | **بله** | خواندن و تغییر مستقیم در `structuresStore` |
| ۷ | `/api/v1/structures/types` | `GET` | **خیر** | *هیچ‌کدام* | **بله** | بازگرداندن آرایه `mockStructureTypes` |
| ۸ | `/api/v1/structures/categories` | `GET` | **خیر** | *هیچ‌کدام* | **بله** | بازگرداندن آرایه `mockStructureCategories` |
| ۹ | `/api/v1/my-structures` | `GET` | **خیر** | *هیچ‌کدام* | **بله** | فراخوانی تابع `getMyStructuresList()` از موک |
| ۱۰ | `/api/v1/proposals` | `GET`, `POST` | **بله** | `${API}/proposals` | **بله** | در صورت خطای upstream از `proposalsStore` و ژنراتور تصادفی سازه استفاده می‌کند |
| ۱۱ | `/api/v1/proposals/[id]` | `GET` | **خیر** | *هیچ‌کدام* | **بله** | جستجو و بازگرداندن از `proposalsStore` |
| ۱۲ | `/api/v1/media-owner-requests` | `POST` | **بله** | `${API}/media-owner-requests` | **بله** | در صورت خطا به `mediaOwnerApplicationsStore` اضافه می‌کند |
| ۱۳ | `/api/v1/client/bookings` | `GET`, `POST` | **بله** | `${API}/client/bookings` | **بله** | در صورت خطا یا نبود پاسخ به `clientBookingsStore` سوییچ می‌کند |
| ۱۴ | `/api/v1/client/bookings/[bookingId]` | `GET` | **خیر** | *هیچ‌کدام* | **بله** | جستجو و بازگرداندن مستقیم از `clientBookingsStore` |
| ۱۵ | `/api/v1/client/bookings/[bookingId]/payment` | `POST` | **خیر** | *هیچ‌کدام* | **بله** | تغییر وضعیت رزرو در `clientBookingsStore` با `addPaymentToBooking` |
| ۱۶ | `/api/v1/client/bookings/documents/[documentId]/download` | `GET` | **خیر** | *هیچ‌کدام* | **بله** | تولید رشته متنی شبیه‌سازی‌شده و توکن ساختگی در حافظه |
| ۱۷ | `/api/v1/admin/bookings` | `GET` | **خیر** | *هیچ‌کدام* | **بله** | فیلتر و بازگرداندن از `adminBookingsStore` |
| ۱۸ | `/api/v1/admin/bookings/[bookingId]` | `GET` | **خیر** | *هیچ‌کدام* | **بله** | جستجو در `adminBookingsStore` |
| ۱۹ | `/api/v1/admin/bookings/[bookingId]/lock` | `POST` | **خیر** | *هیچ‌کدام* | **بله** | اجرای تابع محلی `lockAdminBooking` |
| ۲۰ | `/api/v1/admin/bookings/[bookingId]/proforma` | `POST` | **خیر** | *هیچ‌کدام* | **بله** | اجرای تابع محلی `issueAdminProforma` |
| ۲۱ | `/api/v1/admin/bookings/[bookingId]/approve-payment` | `POST` | **خیر** | *هیچ‌کدام* | **بله** | اجرای تابع محلی `approveAdminPayment` |
| ۲۲ | `/api/v1/admin/bookings/[bookingId]/reject` | `POST` | **خیر** | *هیچ‌کدام* | **بله** | اجرای تابع محلی `rejectAdminBooking` |
| ۲۳ | `/api/v1/admin/bookings/[bookingId]/transition` | `POST` | **خیر** | *هیچ‌کدام* | **بله** | اجرای تابع محلی `transitionAdminBookingStatus` |
| ۲۴ | `/api/v1/admin/bookings/[bookingId]/logs` | `GET` | **خیر** | *هیچ‌کدام* | **بله** | بازگرداندن آرایه `adminAuditLogsStore` |
| ۲۵ | `/api/v1/admin/bookings/documents/[documentId]/download` | `GET` | **خیر** | *هیچ‌کدام* | **بله** | تولید توکن ساختگی بدون اتصال به S3 یا بک‌اند |
| ۲۶ | `/api/v1/admin/media-owner-requests` | `GET` | **بله** | `${API}/admin/media-owner-requests` | **بله** | در صورت خطا به `adminMediaOwnerRequestsStore` سوییچ می‌کند |
| ۲۷ | `/api/v1/admin/media-owner-requests/[requestId]/approve` | `POST` | **بله** | `${API}/admin/media-owner-requests/${id}/approve` | **بله** | در صورت خطا اجرای `approveMediaOwnerApplication` محلی |
| ۲۸ | `/api/v1/admin/media-owner-requests/[requestId]/reject` | `POST` | **بله** | `${API}/admin/media-owner-requests/${id}/reject` | **بله** | در صورت خطا اجرای `rejectMediaOwnerApplication` محلی |
| ۲۹ | `/api/v1/admin/users` | `GET` | **خیر** | *هیچ‌کدام* | **بله** | بازگرداندن آرایه `adminUsersStore` |
| ۳۰ | `/api/v1/admin/users/[userId]` | `GET` | **خیر** | *هیچ‌کدام* | **بله** | جستجو در `adminUsersStore` |
| ۳۱ | `/api/v1/admin/users/[userId]/roles` | `GET`, `POST`, `DELETE` | **خیر** | *هیچ‌کدام* | **بله** | متدهای `assignRoleToUser` و `removeRoleFromUser` در حافظه |

> **خلاصه وضعیت ارتباطی Route Handlerها:**  
> از میان ۳۱ مسیر موجود، فقط **۷ اندپوینت** (احراز هویت logout/verify، رزروهای کلاینت، لوکیشن‌ها، پروپوزال، فرم همکاری مالکان و تایید/رد ادمین) تلاش برای اتصال به بک‌اند واقعی لاراول دارند. **۲۴ اندپوینت دیگر کاملاً مستقل و مبتنی بر داده‌های Mock درون‌حافظه‌ای Node.js اجرا می‌شوند.**

---

## ۳. تحلیل معماری توکن و سشن (Token & Session Architecture)

بررسی دقیق جریان صدور و اعتبارسنجی احراز هویت در فرانت‌اند نشان‌دهنده موارد زیر است:

### ۳.۱. محل و ویژگی‌های دقیق ذخیره‌سازی توکن
1. **توکن احراز هویت Sanctum (`token`):**
   * **محل ذخیره:** کوکی HTTP در پاسخ به درخواست موفق `POST /api/v1/otp/verify` (فایل `app/api/v1/otp/verify/route.ts`).
   * **ویژگی‌های امنیتی کوکی:**
     * `httpOnly: true` (غیرقابل دسترس توسط جاوااسکریپت سمت کلاینت و کدهای XSS).
     * `secure: process.env.NODE_ENV === "production"` (در محیط توسعه روی پورت لوکال بدون HTTPS کار می‌کند؛ در پروداکشن الزاما از طریق SSL/HTTPS ارسال می‌شود).
     * `sameSite: "lax"` (محافظت در برابر حملات CSRF هم‌زمان با حفظ ناوبری‌های متعارف).
     * `path: "/"` (معتبر در سراسر دامنه‌های برنامه).
     * `maxAge: 60 * 60 * 24 * 7` (معادل ۷ روز یا ۶۰۴٬۸۰۰ ثانیه).
2. **اطلاعات پروفایل کاربر (`user`):**
   * هم‌زمان با توکن، یک کوکی مجزا با نام `user` شامل JSON سریالایز شده از مشخصات کاربر (`id`, `uuid`, `name`, `phone`, `roles`, `permissions`) با **عیناً همان تنظیمات کوکی بالا** ست می‌شود تا Server Componentها بدون نیاز به واکشی مکرر شبکه به اطلاعات کاربر دسترسی داشته باشند.
3. **وضعیت `sessionStorage` و `localStorage`:**
   * **`localStorage`:** در هیچ کجای کدبیس برنامه‌نویسی‌شده استفاده نشده است (فقط یک‌بار در متن مستندات `BACKEND_API.MD` به عنوان مثال ذکر شده است).
   * **`sessionStorage`:** صرفاً در کامپوننت `features/auth/AuthCard.tsx` برای مواردی به کار رفته است که کاربر صفحه `/verify-otp` را مستقیماً باز می‌کند تا شماره موبایل واردشده قبلی (`auth_phone`) حفظ شود و نیازی به ورود مجدد شماره نباشد.

### ۳.۲. عملکرد روت `/api/auth/session`
* روت `app/api/auth/session/route.ts`:
  1. **به هیچ اندپوینت بک‌اندی متصل نمی‌شود.**
  2. داده‌های کاربر را مستقیماً از خواندن کوکی `user` دریافت و پارس می‌کند: `store.get("user")?.value`.
  3. وضعیت احراز هویت را صرفاً بر اساس وجود مقدار در کوکی `token` می‌سنجد: `authenticated: Boolean(token)`.
  4. **بررسی Mock محلی برای تغییر نقش:** کد این روت استورهای موک `adminMediaOwnerRequestsStore` و `mediaOwnerApplicationsStore` را بررسی می‌کند. اگر درخواست ارتقای کاربر در استور موک تایید شده باشد، نقش `"media-owner"` را به لیست نقش‌های کاربر اضافه کرده و کوکی `user` را با مقدار جدید بازنویسی می‌کند.

---

## ۴. بررسی پول، مبالغ و تبدیل ریال/تومان (Money & Currency Audit)

### ۴.۱. الزام تعریف‌شده در سند (`docs/backend-api.md`)
* در سند صراحتاً آمده است:
  > تمامی مبالغ، قیمت‌ها و بودجه‌ها در دیتابیس و خروجی‌های API بر حسب **ریال (IRR)** هستند. برای نمایش در رابط کاربری، تیم فرانت‌اند مقدار ریال را **بر ۱۰ تقسیم کرده** و به صورت تومان نمایش می‌دهد. هنگام ارسال به اندپوینت‌ها نیز باید **مبلغ ریالی** ارسال شود.

### ۴.۲. وضعیت واقعی در سورس‌کد
1. **عدم وجود ماژول پول:** فایل `shared/lib/money.ts` **اصلاً در پروژه وجود ندارد**.
2. **عدم انجام تبدیل در نمایش:**
   * تابع `formatToman` در `lib/mock-data.ts` (خط ۱۲) و `shared/lib/utils.ts` (خط ۱۹):
     ```typescript
     export function formatToman(amount: number): string {
       return `${toPersianDigits(amount.toLocaleString("fa-IR"))} تومان`;
     }
     ```
     **هیچ تقسیمی بر ۱۰ انجام نمی‌شود.** هر عددی که دریافت می‌شود صرفاً با ویرگول سه‌رقمی جدا شده و کلمه «تومان» در انتهای آن قرار می‌گیرد.
3. **عدم انجام تبدیل در ارسال ورودی فرم‌ها:**
   * **رزرو سازه و بودجه پیشنهادی (`features/bookings/components/BookingSidebar.tsx` و `app/(dashboard)/dashboard/proposals/page.tsx`):** مبلغ ورودی بدون ضرب در ۱۰ مستقیماً در فیلدهای `budget` یا `total_amount` ارسال می‌شود.
   * **ثبت پرداخت مشتری (`components/client/bookings/BookingDetailView.tsx` خط ۱۵۸):** فیلد `amount` مستقیماً از فرم دریافت شده و بدون تبدیل به ریال ارسال می‌گردد.
   * **ثبت و ویرایش سازه مالک رسانه (`features/media-owner/components/StructureFormView.tsx` و `features/structures/schemas/structure.schema.ts`):** مبالغ `dailyRate` و `basePriceMonthly` مستقیماً بر مبنای تومان فرم دریافت شده و در داده‌ها ذخیره می‌شوند.
4. **پیامد عملی:** اگر بک‌اند واقعی بر مبنای ریال کار کند، مبالغ نمایش‌داده‌شده ۱۰ برابر کوچک‌تر از واقعیت و مبالغ ثبت‌شده توسط فرانت ۱۰ برابر کمتر از مقدار واقعی محاسبه خواهند شد.

---

## ۵. تکرارها و لایه‌های موازی در کد (Duplications & Dual Layers)

در کدبیس دو لایه مجزا و موازی برای صفحات داشبورد و همچنین توابع کلاینت API وجود دارد که ناشی از عدم ادغام ماژول‌های قدیمی و بازنویسی جدید بر اساس Feature-Driven Architecture است:

### ۵.۱. صفحات و کامپوننت‌های تکراری
1. **صفحه لیست رزروهای مشتری:**
   * **نسخه اول:** `app/(dashboard)/dashboard/bookings/page.tsx` (۷۳۱ خط) — دارای استایلینگ، منوبار، سایدبار، جدول و فیلترهای مستقل درون خود فایل.
   * **نسخه دوم:** `app/client/bookings/page.tsx` (۱۸ خط) که کامپوننت `components/client/bookings/BookingsListView.tsx` (۵۷۷ خط) را داخل `ClientLayoutWrapper` فراخوانی می‌کند.
2. **صفحه پیشنهادات کمپین تبلیغاتی (Proposals):**
   * **نسخه اول:** `app/(dashboard)/dashboard/proposals/page.tsx` (۸۵۹ خط) — یک صفحه کاملاً یکپارچه با ماشین انتخاب بودجه، رندرهای تفکیکی و طراحی اختصاصی.
   * **نسخه دوم:** `app/client/proposals/page.tsx` (۱۸ خط) که کامپوننت `components/client/proposals/ProposalsView.tsx` (۶۴۴ خط) را داخل لایه کلاینت رندر می‌کند.
3. **صفحه درخواست همکاری مالک رسانه (Media Owner Request):**
   * **نسخه اول:** `app/(dashboard)/mediaOwnerRequest/page.tsx` (۶۰۲ خط) + فایل واسط `app/(dashboard)/dashboard/mediaOwnerRequest/page.tsx`.
   * **نسخه دوم:** `app/client/media-owner-request/page.tsx` (۱۸ خط) که از `components/client/media-owner/MediaOwnerRequestView.tsx` (۴۷۹ خط) استفاده می‌کند.
4. **صفحه مشاهده جزئیات رزرو:**
   * `app/(dashboard)/dashboard/bookings/[bookingId]/page.tsx` (۲۲ خط) در برابر `app/client/bookings/[bookingId]/page.tsx` (۲۵ خط). هر دو نهایتاً `BookingDetailView` را لود می‌کنند اما در دو مسیر جداگانه قرار دارند.
5. **پنل مدیریت رزروهای ادمین:**
   * مدیریت و اکشن‌های رزرو ادمین هم در `app/(dashboard)/dashboard/page.tsx` و هم در ویوی اختصاصی `app/admin/bookings/[bookingId]/page.tsx` (با کامپوننت `AdminBookingActionCenterView.tsx`) به صورت موازی پیاده‌سازی شده است.

### ۵.۲. لایه‌های API دوگانه
1. **سازه و کاتالوگ:**
   * لایه قدیمی: `lib/api-client.ts` (`fetchStructures`, `fetchStructureById`, `fetchStructureTypes`, `fetchStructureCategories`).
   * لایه فیچر: `features/structures/api/structures.api.ts` (همان توابع را با کدهای مجزا دوباره پیاده کرده است).
2. **رزروها و پیشنهادات:**
   * لایه قدیمی: `lib/client-api.ts` (`fetchClientBookings`, `fetchClientBookingById`, `submitPaymentApi`, `fetchProposals`, `submitProposal`).
   * لایه فیچر: تفکیک‌شده به `features/bookings/api/bookings.api.ts` و `features/proposals/api/proposals.api.ts`.
3. **مالک رسانه:**
   * لایه قدیمی: `lib/media-owner-api.ts` (`fetchMyStructures`, `createStructure`, `updateStructure`).
   * لایه فیچر: `features/media-owner/api/media-owner.api.ts` (عیناً دوباره پیاده شده است).
4. **پنل ادمین:**
   * فایل `features/admin/api/admin.api.ts` صرفاً Re-export فایل `lib/admin-api.ts` است.

---

## ۶. ناهمخوانی‌ها با سند مرجع (`docs/backend-api.md`)

بررسی تطبیقی دقیق تمامی مدل‌ها، اینام‌ها و اندپوینت‌ها نشان‌دهنده مغایرت‌های جدی زیر است:

### ۶.۱. نقش‌های کاربری (User Roles)
* **سند مرجع:** در سراسر سند `docs/backend-api.md` (به‌ویژه خط ۷۸۷) دقیقاً **۳ نقش** تعریف شده است:
  1. `client` (مشتری خریدار)
  2. `media_owner` (مالک رسانه)
  3. `super_admin` (مدیر ارشد سامانه)
* **در کد فرانت‌اند:**
  * در فایل `lib/admin-dashboard-data.ts` (خطوط ۲۲ الی ۳۷) دو نقش دیگر تعریف شده است:
    * `finance_manager` (مدیر مالی و اعتبارات)
    * `operations_manager` (مدیر عملیات و اکران)
  * هیچ‌کدام از این دو نقش در بک‌اند وجود خارجی ندارند.
  * نام‌گذاری نقش مالک رسانه در سند بک‌اند با کاراکتر زیرخط (`media_owner`) است، اما در بخش‌هایی از کدهای سشن فرانت‌اند با خط تیره (`media-owner`) بررسی شده است.

### ۶.۲. روش‌های پرداخت (Payment Methods)
* **سند مرجع (بخش ۴ - خط ۵۵۳):**
  * مشتری پس از صدور پیش‌فاکتور صرفاً مدارک تسویه آفلاین آپلود می‌کند: فیش واریز ساتنا/پایا یا تصویر چک صیادی بنفش (`multipart/form-data` با فیلدهای `document`, `payment_reference`, `document_type`).
  * هیچ اندپوینتی برای **درگاه پرداخت آنلاین شاپرک** یا ریدایرکت بانکی تعریف نشده است.
* **در کد فرانت‌اند:**
  * در اسناد و متون رابط کاربری مکرراً به «درگاه آنلاین» و پرداخت برخط با شاپرک اشاره شده است، در حالی که بک‌اند فقط پذیرنده فیش بانکی و چک است.

### ۶.۳. مشخصات و فیلدهای مهندسی سازه (Structure Fields)
* **سند مرجع:**
  * ورودی `POST /api/v1/structures` صرفاً شامل فیلدهای زیر است:
    * `title`, `city_id`, `structure_type_id`, `latitude`, `longitude`, `price`, `address`, `description`, `audience_type`, `category_ids[]`, `images[]`.
* **در کد فرانت‌اند (`types/structure.ts` و `features/structures/schemas/structure.schema.ts`):**
  * فیلدهای متعددی اضافه شده‌اند که در دیتابیس بک‌اند تعریف نشده‌اند:
    * `specs.visibilityScore` (امتیاز دید ترافیکی بین ۰ تا ۱۰۰)
    * `specs.lighting` (وضعیت نورپردازی پروژکتورها)
    * `specs.orientation` (جهت دید افقی یا عمودی)
    * `specs.dailyTrafficEstimate` یا `dailyTraffic` (برآورد تردد روزانه خودروها)
    * `dimensions.width`, `dimensions.height`, `dimensions.area` (ابعاد فیزیکی بر حسب متر)
    * `images.day` و `images.night` (تفکیک تصاویر روز و شب)
    * `pricing.dailyRate` (تعرفه روزانه)

### ۶.۴. ماشین وضعیت رزرو و `allowed_actions`
* **سند مرجع:**
  * وضعیت رزروها به صورت یک شیء `{ value: string, label: string }` با فیلد کلیدی `allowed_actions: string[]` بازگردانده می‌شود تا دکمه‌های مجاز در هر مرحله توسط بک‌اند تعیین شوند (`lock_for_contract`, `issue_proforma`, `submit_payment`, `approve_payment`, `reject`, `complete`).
* **در کد فرانت‌اند:**
  * ماشین وضعیت و اکشن‌ها در فرانت به صورت هاردکد بازنویسی شده است (`action`, `waiting`, `active`, `closed`).
  * اندپوینت ساختگی `POST /api/v1/admin/bookings/[bookingId]/transition` در فرانت تعریف شده تا وضعیت‌ها به صورت دستی عوض شوند.

### ۶.۵. اندپوینت‌های بدون مرجع در سند
1. **`GET /api/v1/locations`:** در سند بک‌اند هیچ اندپوینتی برای دریافت لیست استان‌ها و شهرها درج نشده است (فقط فیلد عددی `city_id` ذکر شده است).
2. **`GET /api/v1/client/bookings/documents/{docId}/download`:** در سند بک‌اند خروجی این اندپوینت یک آدرس موقت امضاشده به همراه مدت اعتبار (`download_url`, `expires_in_minutes: 15`) به صورت JSON است، اما در Route Handlerهای فرانت‌اند یک فایل متنی شبیه‌سازی‌شده به صورت استریم هاردکد تولید می‌شود.

---

## ۷. عددهای هاردکد در رابط کاربری (Hardcoded UI Numbers & Literals)

در این بخش تمام آمارها، ارقام ثابت و داده‌های نمایشی که بدون دریافت از API در کامپوننت‌های فرانت‌اند هاردکد شده‌اند فهرست شده‌اند:

### ۷.۱. صفحه اصلی و لندینگ (`app/(marketing)/page.tsx`)
1. **نوار آمار زنده سازه‌ها (Live Stats - خطوط ۱۵۷ الی ۱۷۴):**
   * `+۱,۵۲۰` سازه تبلیغاتی ثبت‌شده
   * `۸۴۰` بیلبورد آماده رزرو فوری (آنی)
   * `۲۴ شهر` پوشش سراسری روی نقشه GIS
   * `۴۸ ساعت` قفل اختصاصی سازه جهت قرارداد
2. **آمار کارت‌های انواع سازه (خطوط ۲۱ الی ۲۷):**
   * "۴۲۰ سازه" برای بیلبوردهای بزرگراهی
   * "۱۸۵ سازه" برای پل‌های عابر پیاده
   * "۳۱۰ سازه" برای استرابوردهای شهری
   * "۶۵ سازه" برای تلویزیون شهری دیجیتال
   * "۵۴۰ سازه" برای لایت‌باکس‌های مترو و معابر
3. **سازه‌های منتخب هاردکد (`featuredStructures` - خطوط ۳۹ الی ۷۰):**
   * قیمت `۱۸۵,۰۰۰,۰۰۰` برای بیلبورد اتوبان همت
   * قیمت `۲۴۰,۰۰۰,۰۰۰` برای تلویزیون میدان ولیعصر
   * قیمت `۳۱۰,۰۰۰,۰۰۰` برای عرشه پل اندرزگو
   * ابعاد `۱۵ × ۵ متر`، `۱۲ × ۶ متر` و `۲۰ × ۲.۵ متر`
4. **دراپ‌داون جستجوی سریع (خطوط ۹۸ الی ۱۲۷):**
   * شهرهای هاردکد: تهران، اصفهان، مشهد، شیراز، تبریز.
   * مناطق هدف هاردکد: شاهراه‌ها و اتوبان‌ها، مناطق دانشگاهی، مناطق لوکس، مراکز خرید.

### ۷.۲. داشبورد سوپر ادمین (`app/(dashboard)/dashboard/superadmin/page.tsx`)
1. **کارت‌های آمار سامانه (خطوط ۲۲۱ الی ۲۴۱):**
   * `۵۴۰` کاربران ثبت‌نام‌شده
   * `۱۲۸` سازه‌های فعال سراسر کشور
2. **درخواست‌های همکاری پیش‌فرض (`DEFAULT_SAMPLE_REQUESTS` در `types.ts`):**
   * ۴ شرکت نمونه با کدهای ملی هاردکد: `10103829104`, `14009281734`, `10380194825`, `10860293841`.

### ۷.۳. لیست ۳۱ شهر و استان (`app/api/v1/locations/route.ts`)
* آرایه `defaultLocations` شامل ۳۱ شهر (تهران، مشهد، اصفهان، شیراز، تبریز، کرج، اهواز، قم، رشت، کرمانشاه، ارومیه، زاهدان، کرمان، همدان، یزد، اردبیل، بندرعباس، اراک، زنجان، سنندج، قزوین، خرم‌آباد، ساری، بجنورد، بوشهر، بیرجند، ایلام، شهرکرد، سمنان، یاسوج، کیش) با شناسه‌های ۱ تا ۳۱ به صورت کامل هاردکد است.

### ۷.۴. پیشنهاد هوشمند و مقادیر سریع بودجه (`app/(dashboard)/dashboard/proposals/page.tsx` و `ProposalsView.tsx`)
* دکمه‌های بودجه سریع به صورت اعداد هاردکد قرار دارند:
  * ۵۰ میلیون تومان (`50_000_000`)
  * ۱۰۰ میلیون تومان (`100_000_000`)
  * ۲۵۰ میلیون تومان (`250_000_000`)
  * ۵۰۰ میلیون تومان (`500_000_000`)

### ۷.۵. نقشه تعاملی (`components/structures/InteractiveMap.tsx`)
* مختصات محدوده شهر تهران (Bounding Box) به صورت اعداد ثابت تعریف شده است:
  * `minLat: 35.700`, `maxLat: 35.815`, `minLng: 51.300`, `maxLng: 51.485` (خط ۷۹).

---

## ۸. جدول جمع‌بندی وضعیت تطابق با قوانین پروژه

| شاخص | وضعیت در کدبیس | انطباق با سند | اقدام لازم برای فاز بعدی |
| :--- | :---: | :---: | :--- |
| **تغییر فایل‌های کد** | صفر تغییر در این فاز | تایید شد | هیچ کدی تغییر نیافت |
| **اتصال به بک‌اند واقعی** | ۷ روت از ۳۱ روت | ۲۲.۵٪ | حذف ۲۴ استور موک و ریدایرکت مستقیم به Sanctum |
| **تبدیل ریال / تومان** | عدم وجود `shared/lib/money.ts` | مغایرت کامل | پیاده‌سازی فرمول ضرب و تقسیم بر ۱۰ برای تمام مقادیر مالی |
| **نقش‌های کاربری** | ۵ نقش در فرانت | مغایرت (۳ نقش در سند) | حذف نقش‌های Finance و Operations و منطبق‌سازی با سند |
| **درگاه آنلاین** | وجود متن و اشاره در UI | مغایرت (سند فقط فیش دارد) | محدودسازی پرداخت صرفاً به فیش واریز ساتنا و چک صیادی |
| **فیلدهای سازه** | امتیاز دید، ابعاد، تفکیک روز/شب | مغایرت | استانداردسازی فیلدها با `POST /api/v1/structures` |
| **کدهای تکراری** | صفحات موازی `dashboard` و `client` | تکرار ۱۰۰٪ | ادغام روت‌ها در `app/client` و حذف فایل‌های زائد |
