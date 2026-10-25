# مستندات کامل API سامانه پلتفرم تبلیغات محیطی (مخصوص تیم فرانت‌اند Next.js)

این سند شامل تمامی مشخصات اندپوینت‌ها، پارامترهای ورودی، ساختار پاسخ‌ها، اعتبارسنجی‌ها و نیازمندی‌های احراز هویت است تا بدون ابهام پیاده‌سازی شود.

---

## ۱. اطلاعات پایه و هدرهای عمومی

- **Base URL لوکال:** `http://localhost:8085`
- **Reverb WebSocket لوکال:** `ws://localhost:8080` (یا پورت کانفیگ‌شده در env)
- **پیشوند روت‌ها:** تمامی اندپوینت‌های کاربردی با `/api/v1/` شروع می‌شوند (مسیر احراز هویت وب‌سوکت Reverb در `/broadcasting/auth` قرار دارد).

### واحد پولی مبالغ (Currency):
> [!IMPORTANT]
> **تمامی مبالغ، قیمت‌ها و بودجه‌ها (نظیر `price`، `total_amount`، `budget`) در دیتابیس و خروجی‌های API بر حسب «ریال (IRR)» هستند.**
> برای نمایش در رابط کاربری (UI)، تیم فرانت‌اند مقدار ریال را بر ۱۰ تقسیم کرده و همراه با جداکننده ارقام (Separator سه‌رقمی) به صورت **«تومان»** نمایش می‌دهد:
> ```typescript
> export const formatToToman = (rialAmount: number | string): string => {
>   const toman = Math.floor(Number(rialAmount) / 10);
>   return new Intl.NumberFormat('fa-IR').format(toman) + ' تومان';
> };
> // مثال: 150000000 ریال -> "۱۵,۰۰۰,۰۰۰ تومان"
> ```

### فرمت تاریخ‌ها (Dates):
> [!NOTE]
> تمامی فیلدهای تاریخ ورودی و خروجی API در قالب **استاندارد میلادی ISO 8601** هستند:
> - تاریخ بدون ساعت: `YYYY-MM-DD` (مثال: `"2026-11-01"`)
> - تاریخ به همراه زمان: فرمت کامل ISO 8601 (مثال: `"2026-10-25T14:30:00+03:30"`)
> 
> تبدیل تاریخ‌ها به تقویم هجری شمسی (جلالی) در لایه Presentation بر عهده فرانت‌اند است. هنگام ارسال تاریخ به اندپوینت‌ها نیز باید تاریخ میلادی ارسال شود.

### CORS، مدیریت کوکی‌ها و توکن در Next.js (BFF vs SPA):
بک‌اند پلتفرم مسیرهای زیر را برای CORS باز گذاشته است:
- `api/*`
- `sanctum/csrf-cookie`
- `broadcasting/auth` (احراز هویت وب‌سوکت Reverb)

**دو روش پیشنهادی برای پیاده‌سازی در Next.js:**
1. **روش مستقیم با Bearer Token (کلاینت ساید):** فرانت‌اند توکن دریافتی از `/api/v1/otp/verify` را در استیت یا کوکی کلاینت ذخیره کرده و در هدر تمامی درخواست‌های API و همچنین در آبجکت auth کتابخانه Laravel Echo ارسال می‌کند:
   ```http
   Authorization: Bearer <ACCESS_TOKEN>
   ```
2. **روش BFF (Next.js Route Handlers + HttpOnly Cookie):** اگر امنیت حداکثری و کوکی `HttpOnly` مد نظر است، تمام درخواست‌ها به صورت سرورساید از Route Handlerهای Next.js به بک‌اند پروکسی می‌شوند. برای وب‌سوکت نیز می‌توان یک Route Handler به آدرس `/api/broadcasting/auth` در Next.js ساخت که کوکی HttpOnly را خوانده و با هدر `Authorization: Bearer ...` به `http://localhost:8085/broadcasting/auth` فوروارد کند.

### هدرهای الزامی برای کلیه درخواست‌ها:
```http
Accept: application/json
Content-Type: application/json
```
> **نکته مهم در آپلود فایل (multipart/form-data):** هنگامی که از فرم‌های حاوی فایل (عکس، PDF مدارک یا فیش واریز) استفاده می‌کنید، هدر `Content-Type: application/json` را بردارید تا مرورگر خودش مقدار `multipart/form-data; boundary=...` را قرار دهد. هدر `Accept: application/json` همیشه الزامی است تا ارورهای ولیدیشن با فرمت JSON برگشت داده شوند.

### هدر احراز هویت (Bearer Token):
برای کلیه اندپوینت‌هایی که نیاز به لاگین دارند:
```http
Authorization: Bearer <ACCESS_TOKEN>
```

---

## ۲. ساختار استاندارد پاسخ‌ها (Response Envelope)

### پاسخ موفق (۲۰۰ یا ۲۰۱):
```json
{
  "success": true,
  "message": "پیام عملیات (در صورت وجود)",
  "data": { ... },
  "next_step": "verify_otp" // اختیاری (در فلوهای مرحله‌ای مثل OTP)
}
```

### خطای اعتبارسنجی فرم‌ها (422 Unprocessable Content):
```json
{
  "message": "اطلاعات ارسالی نامعتبر است.",
  "errors": {
    "phone": [
      "شماره موبایل وارد شده معتبر نمی‌باشد."
    ],
    "start_date": [
      "تاریخ شروع رزرو نمی‌تواند در گذشته باشد."
    ]
  }
}
```

### خطای احراز هویت یا دسترسی:
- **کد 401 Unauthorized:** توکن ارسال نشده یا منقضی شده است.
- **کد 403 Forbidden:** کاربر دسترسی یا نقش لازم (Role/Permission) برای این عملیات را ندارد.
- **کد 429 Too Many Requests:** تعداد درخواست‌ها بیشتر از حد مجاز Rate Limiting بوده است (مثلاً برای OTP یا درخواست هوش مصنوعی).

---

## ۳. چرخه وضعیت رزروها (Booking State Machine) و اکشن‌های مجاز (`allowed_actions`)

وضعیت‌های رزرو سازه (`status`) یکی از مقادیر زیر است:

```
[pending_review] ──(تایید اولیه توسط ادمین)──> [locked_for_contract] (قفل ۴۸ ساعته)
       │                                              │
       │                                     (صدور پیش‌فاکتور رسمی)
       │                                              ▼
       │                                      [proforma_issued]
       │                                              │
       │                                     (ثبت فیش واریز/چک توسط کاربر)
       │                                              ▼
       │                                     [payment_submitted]
       │                                              │
       │                                     (تایید پرداخت توسط ادمین)
       │                                              ▼
       │                                          [occupied] (اکران شده)
       │                                              │
       │                                     (اتمام دوره اکران)
       │                                              ▼
       │                                         [completed]
       │
       └───(در هر مرحله قابل رد شدن توسط ادمین)───> [rejected]
       └───(در صورت اتمام مهلت ۴۸ ساعته)─────────> [expired]
```

مقادیر دقیق رشته وضعیت‌ها (Enums):
- `pending_review`: در انتظار بررسی اولیه
- `locked_for_contract`: قفل برای قرارداد (انقضای ۴۸ ساعته)
- `proforma_issued`: پیش‌فاکتور رسمی صادر شد
- `payment_submitted`: مدرک پرداخت (فیش یا چک صیادی) ثبت شد
- `occupied`: تایید نهایی و در حال اکران
- `rejected`: رد شده
- `expired`: منقضی شده
- `completed`: پایان دوره اکران

### تشخیص داینامیک اکشن‌های مجاز (`allowed_actions`):
> [!TIP]
> **نیازی به بازتولید و نگهداری ماشین وضعیت در فرانت‌اند نیست!**
> در تمام اندپوینت‌های رزرو (لیست و جزییات)، فیلدی به نام `allowed_actions: string[]` همراه با داده‌های رزرو برگشت داده می‌شود. بک‌اند با توجه به **نقش کاربر لاگین شده** و **وضعیت فعلی رزرو**، دقیقاً لیست اکشن‌هایی را که کاربر فعلی در این لحظه مجاز به انجام آن است مشخص می‌کند.
>
> فرانت‌اند فقط کافی است برای نمایش دکمه‌ها این آرایه را چک کند:
> ```typescript
> const canPay = booking.allowed_actions.includes('submit_payment');
> const canLock = booking.allowed_actions.includes('lock_for_contract');
> const canIssueProforma = booking.allowed_actions.includes('issue_proforma');
> const canApprovePayment = booking.allowed_actions.includes('approve_payment');
> const canReject = booking.allowed_actions.includes('reject');
> ```

#### جدول نگاشت `allowed_actions` به اندپوینت‌ها:
| مقدار در `allowed_actions` | چه کاربری مجاز است؟ | عنوان دکمه در UI | اندپوینت متناظر در API |
| :--- | :--- | :--- | :--- |
| `lock_for_contract` | ادمین / مالک سازه | تایید اولیه و قفل قرارداد | `POST /api/v1/admin/bookings/{id}/lock` |
| `issue_proforma` | ادمین / مالک سازه | صدور پیش‌فاکتور رسمی | `POST /api/v1/admin/bookings/{id}/proforma` |
| `submit_payment` | مشتری خریدار رزرو | ثبت فیش واریز یا چک | `POST /api/v1/client/bookings/{id}/payment` |
| `approve_payment` | ادمین / مدیر مالی | تایید پرداخت و شروع اکران | `POST /api/v1/admin/bookings/{id}/approve-payment` |
| `reject` | ادمین / مالک سازه | رد درخواست رزرو | `POST /api/v1/admin/bookings/{id}/reject` |
| `complete` | سوپرادمین | پایان دوره اکران | `POST /api/v1/admin/bookings/{id}/transition` (`target_status: occupied -> completed`) |

---

## ۴. لیست کامل اندپوینت‌ها به تفکیک ماژول

---

### بخش الف: ماژول احراز هویت (Auth & OTP)

#### ۱. درخواست ارسال کد تایید پیامکی (OTP Request)
- **مسیر:** `POST /api/v1/otp/request`
- **احراز هویت:** پابلیک (دارای Rate Limit بر اساس شماره و IP)
- **بدنه درخواست (JSON):**
  ```json
  {
    "phone": "09123456789"
  }
  ```
- **پاسخ موفق (200 OK):**
  ```json
  {
    "success": true,
    "message": "کد تایید ارسال شد.",
    "data": null,
    "next_step": "verify_otp"
  }
  ```

---

#### ۲. اعتبارسنجی کد پیامکی و ورود به سیستم (OTP Verify)
- **مسیر:** `POST /api/v1/otp/verify`
- **احراز هویت:** پابلیک
- **بدنه درخواست (JSON):**
  ```json
  {
    "phone": "09123456789",
    "otp": "123456"
  }
  ```
- **پاسخ موفق (200 OK):**
  ```json
  {
    "success": true,
    "message": "ورود موفق.",
    "data": {
      "token": "1|abcdef123456789...",
      "user": {
        "id": 1,
        "uuid": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
        "name": "نام کاربر",
        "phone": "09123456789",
        "is_active": true,
        "role": "client",
        "permissions": ["client.view-bookings"]
      }
    }
  }
  ```
  *(توکن دریافتی را در کوکی HttpOnly یا استیت فرانت ذخیره کرده و در هدر Authorization ارسال کنید)*.

---

#### ۳. ثبت‌نام اولیه کاربر جدید (Register)
- **مسیر:** `POST /api/v1/auth/register`
- **احراز هویت:** پابلیک
- **بدنه درخواست (JSON):**
  ```json
  {
    "name": "نام و نام خانوادگی",
    "phone": "09123456789"
  }
  ```
- **پاسخ موفق (201 Created):**
  ```json
  {
    "success": true,
    "message": "ثبت‌نام موفق. لطفا کد تایید را درخواست کنید.",
    "data": {
      "id": 1,
      "name": "نام و نام خانوادگی",
      "phone": "09123456789"
    },
    "next_step": "request_otp"
  }
  ```

---

#### ۴. خروج از حساب کاربری (Logout)
- **مسیر:** `POST /api/v1/auth/logout`
- **احراز هویت:** `auth:sanctum` (نیازمند توکن)
- **پاسخ موفق (200 OK):**
  ```json
  {
    "success": true,
    "message": "خروج با موفقیت انجام شد.",
    "data": null
  }
  ```

---

### بخش ب: ماژول سازه‌ها و بیلبوردها (Structures)

#### ۱. دریافت لیست انواع سازه‌ها (Types)
برای استفاده در دراپ‌داون‌های فیلتر و ثبت سازه (مثلاً بیلبورد، استرابورد، عرشه پل و...).
- **مسیر:** `GET /api/v1/structures/types`
- **احراز هویت:** پابلیک
- **پارامترهای اختیاری کوئری:** `?is_active=1`
- **پاسخ موفق (200 OK):**
  ```json
  {
    "data": [
      { "id": 1, "name": "بیلبورد", "is_active": true },
      { "id": 2, "name": "استرابورد", "is_active": true }
    ]
  }
  ```

---

#### ۲. دریافت لیست دسته‌بندی‌های سازه (Categories)
- **مسیر:** `GET /api/v1/structures/categories`
- **احراز هویت:** پابلیک
- **پاسخ موفق (200 OK):**
  ```json
  {
    "data": [
      { "id": 1, "name": "بزرگراهی" },
      { "id": 2, "name": "میدان و چهارراه" }
    ]
  }
  ```

---

#### ۳. لیست عمومی و جستجوی سازه‌ها (Catalog)
نمایش در نقشه و کاتالوگ برای مشتریان.
- **مسیر:** `GET /api/v1/structures`
- **احراز هویت:** پابلیک
- **پارامترهای کوئری:**
  - `page`: شماره صفحه (پیش‌فرض ۱)
  - `per_page`: تعداد در هر صفحه (پیش‌فرض ۱۵)
  - `structure_type_id`: شناسه نوع سازه (عدد)
  - `category_ids[]`: آرایه‌ای از شناسه‌های دسته‌بندی
- **پاسخ موفق (200 OK):** خروجی استاندارد Paginator لاراول شامل `data`, `current_page`, `last_page`, `total` و...

---

#### ۴. مشاهده جزییات یک سازه (Show Structure)
- **مسیر:** `GET /api/v1/structures/{structure}` *(پشتیبانی از UUID یا ID عددی)*
- **احراز هویت:** پابلیک برای سازه‌های آزاد؛ سازه‌های غیرآزاد فقط توسط مالک سازه یا سوپرادمین
- **پاسخ موفق (200 OK):** آبجکت کامل مشخصات سازه، مختصات جغرافیایی (`latitude`, `longitude`)، تصاویر، قیمت، ابعاد و وضعیت فعلی.

---

#### ۵. سازه‌های من (مخصوص مالک رسانه)
- **مسیر:** `GET /api/v1/my-structures`
- **احراز هویت:** `auth:sanctum` + پرمیشن `structure.view-own`
- **پارامترهای کوئری:** `page`, `per_page`
- **پاسخ:** لیست پاژینیت شده از سازه‌های ثبت‌شده توسط کاربر لاگین شده.

---

#### ۶. ثبت سازه جدید (Create Structure)
- **مسیر:** `POST /api/v1/structures`
- **احراز هویت:** `auth:sanctum` + پرمیشن `structure.create`
- **فرمت ارسال:** `multipart/form-data`
- **فیلدهای ورودی:**
  - `title` *(الزامی, رشته تا ۲۵۵ کاراکتر)*: عنوان سازه (مثلاً بیلبورد پل همت)
  - `city_id` *(الزامی, عدد)*: شناسه شهر معتبر
  - `structure_type_id` *(الزامی, عدد)*: شناسه نوع سازه
  - `latitude` *(الزامی, اعشاری بین ۹۰- تا ۹۰)*: عرض جغرافیایی روی نقشه
  - `longitude` *(الزامی, اعشاری بین ۱۸۰- تا ۱۸۰)*: طول جغرافیایی روی نقشه
  - `price` *(اختیاری, عددی)*: قیمت ماهیانه یا تعرفه
  - `address` *(اختیاری, رشته)*: آدرس دقیق محل سازه
  - `description` *(اختیاری, رشته تا ۲۰۰۰ کاراکتر)*: توضیحات تکمیلی
  - `audience_type` *(اختیاری, رشته)*: تیپ مخاطبان عبوری
  - `category_ids[]` *(اختیاری, آرایه اعداد)*: دسته‌بندی‌ها
  - `images[]` *(اختیاری, آرایه فایل‌ها, حداکثر ۱۰ تصویر, تا ۵ مگابایت, فرمت‌های jpg, jpeg, png, webp)*
- **پاسخ موفق (201 Created):**
  ```json
  {
    "message": "سازه با موفقیت ثبت شد.",
    "data": { "id": 12, ... }
  }
  ```

---

#### ۷. ویرایش مشخصات سازه (Update Structure)
- **مسیر:** `PUT /api/v1/structures/{structure}` *(پشتیبانی از UUID یا ID عددی)*
- **احراز هویت:** `auth:sanctum` + پرمیشن `structure.update`
- **فرمت ارسال:** `application/json` (تمامی فیلدها اختیاری `sometimes` هستند)
- **فیلدهای ورودی:**
  ```json
  {
    "title": "بیلبورد پل همت (به‌روزرسانی شده)",
    "structure_type_id": 1,
    "category_ids": [1, 2],
    "price": 180000000,
    "latitude": 35.7501,
    "longitude": 51.4102,
    "address": "بزرگراه همت غرب به شرق، بعد از گاندی",
    "description": "دید عالی از بزرگراه همت و دسترسی سریع",
    "audience_type": "خودروهای شخصی و عبوری اداری"
  }
  ```
> [!NOTE]
> **نحوه مدیریت تصاویر در ویرایش سازه:**
> اندپوینت `PUT` فوق صرفاً برای به‌روزرسانی متادیتا، قیمت، دسته‌بندی‌ها و موقعیت مکانی با فرمت `application/json` طراحی شده است. آپلود تصاویر سازه در مرحله ثبت اولیه (`POST /api/v1/structures`) با هدر `multipart/form-data` انجام می‌شود. در ساختار فعلی، امکان آپلود تصویر جدید در متد `PUT` وجود ندارد (اگر تیم محصول نیاز به افزودن/حذف عکس پس از ثبت اولیه داشته باشد، می‌توان اندپوینت مستقلی نظیر `POST /api/v1/structures/{id}/images` اضافه کرد).

---

### بخش ج: ماژول رزروها - سمت مشتری (Client Booking)

#### ۱. ثبت درخواست رزرو برای یک سازه
- **مسیر:** `POST /api/v1/client/bookings`
- **احراز هویت:** `auth:sanctum`
- **بدنه درخواست (JSON):**
  ```json
  {
    "structure_id": 5,
    "start_date": "2026-11-01",
    "end_date": "2026-11-30",
    "company_name": "نام شرکت یا برند",
    "national_id": "10101234567",
    "total_amount": 150000000,
    "note": "درخواست اکران کمپین بلک فرایدی"
  }
  ```
- **قوانین اعتبارسنجی:**
  - `start_date`: نمی‌تواند در گذشته باشد (`after_or_equal:today`).
  - `end_date`: باید بعد از تاریخ شروع باشد (`after:start_date`).
  - `national_id`: باید ۱۰ رقم (کد ملی) یا ۱۱ رقم (شناسه ملی) باشد.
  - `total_amount`: مبلغ کل به **ریال**.
- **پاسخ موفق (201 Created):** مشخصات رزرو ایجاد شده با وضعیت اولیه `pending_review`.

---

#### ۲. مشاهده لیست رزروهای من
- **مسیر:** `GET /api/v1/client/bookings`
- **احراز هویت:** `auth:sanctum`
- **پارامترهای کوئری:** `page`, `per_page`, `status`
- **نمونه کامل پاسخ (200 OK):**
  ```json
  {
    "data": [
      {
        "id": 1,
        "uuid": "9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d",
        "user_id": 10,
        "structure_id": 5,
        "structure": {
          "id": 5,
          "uuid": "e4eaaaf2-d142-11e1-b3e4-080027620cdd",
          "title": "بیلبورد تقاطع ولیعصر و همت",
          "price": "150000000.00",
          "location": {
            "latitude": 35.7501,
            "longitude": 51.4102
          },
          "address": "تهران، تقاطع بزرگراه همت و خیابان ولیعصر"
        },
        "start_date": "2026-11-01",
        "end_date": "2026-11-30",
        "status": {
          "value": "proforma_issued",
          "label": "پیش‌فاکتور صادر شد"
        },
        "locked_until": "2026-10-27T12:00:00+03:30",
        "is_lock_expired": false,
        "total_amount": "150000000.00",
        "payment_reference": null,
        "rejection_reason": null,
        "allowed_actions": [
          "submit_payment"
        ],
        "created_at": "2026-10-25T11:20:00+03:30",
        "updated_at": "2026-10-25T12:00:00+03:30"
      }
    ],
    "links": {
      "first": "http://localhost:8085/api/v1/client/bookings?page=1",
      "last": "http://localhost:8085/api/v1/client/bookings?page=1",
      "prev": null,
      "next": null
    },
    "meta": {
      "current_page": 1,
      "from": 1,
      "last_page": 1,
      "per_page": 15,
      "to": 1,
      "total": 1
    }
  }
  ```

---

#### ۳. مشاهده جزییات رزرو مشخص
- **مسیر:** `GET /api/v1/client/bookings/{booking}` *(پشتیبانی از UUID یا ID عددی)*
- **احراز هویت:** `auth:sanctum`
- **نمونه کامل پاسخ (200 OK):**
  ```json
  {
    "data": {
      "id": 1,
      "uuid": "9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d",
      "user_id": 10,
      "user": {
        "id": 10,
        "name": "شرکت تجارت نوین",
        "phone": "09121111111"
      },
      "structure_id": 5,
      "structure": {
        "id": 5,
        "uuid": "e4eaaaf2-d142-11e1-b3e4-080027620cdd",
        "title": "بیلبورد تقاطع ولیعصر و همت",
        "price": "150000000.00",
        "location": {
          "latitude": 35.7501,
          "longitude": 51.4102
        },
        "address": "تهران، تقاطع بزرگراه همت و خیابان ولیعصر"
      },
      "start_date": "2026-11-01",
      "end_date": "2026-11-30",
      "status": {
        "value": "proforma_issued",
        "label": "پیش‌فاکتور صادر شد"
      },
      "locked_until": "2026-10-27T12:00:00+03:30",
      "is_lock_expired": false,
      "total_amount": "150000000.00",
      "payment_reference": null,
      "rejection_reason": null,
      "allowed_actions": [
        "submit_payment"
      ],
      "logs": [
        {
          "id": 1,
          "booking_id": 1,
          "changed_by_user_id": 1,
          "user_role": "super_admin",
          "from_status": {
            "value": "pending_review",
            "label": "در انتظار بررسی"
          },
          "to_status": {
            "value": "locked_for_contract",
            "label": "قفل برای قرارداد"
          },
          "note": "تایید اولیه شد و سازه قفل گردید",
          "created_at": "2026-10-25T11:45:00+03:30"
        },
        {
          "id": 2,
          "booking_id": 1,
          "changed_by_user_id": 1,
          "user_role": "super_admin",
          "from_status": {
            "value": "locked_for_contract",
            "label": "قفل برای قرارداد"
          },
          "to_status": {
            "value": "proforma_issued",
            "label": "پیش‌فاکتور صادر شد"
          },
          "note": "پیش فاکتور بارگذاری شد",
          "created_at": "2026-10-25T12:00:00+03:30"
        }
      ],
      "documents": [
        {
          "id": 1,
          "booking_id": 1,
          "uuid": "88a08714-3686-4f40-8b65-e99d821ea994",
          "document_type": "proforma_invoice",
          "original_filename": "proforma-1042.pdf",
          "mime_type": "application/pdf",
          "file_size": 142050,
          "uploaded_by": 1,
          "created_at": "2026-10-25T12:00:00+03:30"
        }
      ],
      "created_at": "2026-10-25T11:20:00+03:30",
      "updated_at": "2026-10-25T12:00:00+03:30"
    }
  }
  ```

---

#### ۴. ثبت اطلاعات پرداخت (فیش واریز ساتنا یا چک صیادی)
مشتری پس از صدور پیش‌فاکتور رسمی، فیش یا تصویر چک صیادی را اینجا آپلود می‌کند.
- **مسیر:** `POST /api/v1/client/bookings/{booking}/payment`
- **احراز هویت:** `auth:sanctum`
- **فرمت ارسال:** `multipart/form-data`
- **فیلدها:**
  - `document` *(الزامی, فایل PDF یا تصویر, حداکثر ۱۰ مگابایت)*: فایل فیش یا چک
  - `payment_reference` *(الزامی, رشته حداقل ۶ کاراکتر)*: کد رهگیری واریز ساتنا یا شناسه ۱۶ رقمی صیادی
  - `document_type` *(اختیاری, پیش‌فرض payment_receipt)*: یکی از مقادیر `payment_receipt` یا `sayadi_check`
  - `amount` *(اختیاری, عددی)*: مبلغ پرداختی
  - `note` *(اختیاری, رشته)*: توضیحات و یادداشت
- **پاسخ موفق (200 OK):** رزرو به‌روزرسانی‌شده با وضعیت جدید `payment_submitted`.

---

#### ۵. دریافت لینک دانلود امن مدارک و پیش‌فاکتور (Signed URL)
- **مسیر:** `GET /api/v1/client/bookings/{booking}/documents/{documentId}/download`
- **احراز هویت:** `auth:sanctum`
- **پاسخ موفق (200 OK):**
  ```json
  {
    "download_url": "https://domain.com/storage/temporary/...?signature=...",
    "expires_in_minutes": 15
  }
  ```
  *(لینک دارای امضای موقت امنیتی است و پس از ۱۵ دقیقه منقضی می‌شود)*.

---

### بخش د: ماژول رزروها - سمت ادمین (Admin Booking Management)

*کلیه این روت‌ها نیازمند نقش ادمین / پرمیشن مربوطه هستند.*

| متد | مسیر (URI) | هدف و توضیحات | پارامترها / بدنه |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/v1/admin/bookings` | لیست تمام رزروهای کل سیستم با امکان فیلتر | `status`, `structure_id`, `client_id`, `page` |
| `GET` | `/api/v1/admin/bookings/{id}` | جزییات کامل رزرو به همراه مشخصات خریدار، سازه، اسناد و لاگ‌ها | - |
| `GET` | `/api/v1/admin/bookings/{id}/logs` | تاریخچه تغییر وضعیت‌ها و اکشن‌های انجام شده (Audit Trail) | - |
| `POST` | `/api/v1/admin/bookings/{id}/lock` | تایید اولیه و اعمال قفل ۴۸ ساعته جهت انعقاد قرارداد (`locked_for_contract`) | `{"note": "توضیحات"}` (اختیاری) |
| `POST` | `/api/v1/admin/bookings/{id}/proforma` | صدور و بارگذاری پیش‌فاکتور رسمی (`proforma_issued`) | `multipart/form-data`: `document` (الزامی, PDF/عکس تا ۱۰ مگابایت) و `note` |
| `POST` | `/api/v1/admin/bookings/{id}/approve-payment` | تایید نهایی سند پرداخت و انتقال به وضعیت اکران (`occupied`) | `{"note": "تایید واریز"}` (اختیاری) |
| `POST` | `/api/v1/admin/bookings/{id}/reject` | رد درخواست رزرو با ثبت دلیل اجباری (`rejected`) | `{"reason": "دلیل رد رزرو"}` (الزامی) |
| `POST` | `/api/v1/admin/bookings/{id}/transition` | گذار دستی وضعیت بر اساس ماشین وضعیت سیستم | `{"target_status": "occupied", "note": "..."}` |
| `GET` | `/api/v1/admin/bookings/{id}/documents/{docId}/download` | لینک دانلود امن مدارک و فیش‌ها برای ادمین | - |

---

### بخش ه: درخواست ارتقا به مالک رسانه (Media Owner Request)

#### ۱. ثبت درخواست ارتقا توسط کاربر معمولی (تبدیل شدن به صاحب بیلبورد)
- **مسیر:** `POST /api/v1/media-owner-requests`
- **احراز هویت:** `auth:sanctum`
- **فرمت:** `multipart/form-data`
- **فیلدها:**
  - `company_name` *(الزامی, رشته)*: نام شرکت یا کانون تبلیغاتی
  - `national_id` *(اختیاری, رشته)*: شناسه ملی یا کد ثبت
  - `documents[]` *(اختیاری, آرایه تا ۵ فایل, فرمت‌های jpg, png, pdf, تا ۵ مگابایت)*: مدارک روزنامه رسمی یا مجوزها
- **پاسخ موفق (201 Created):**
  ```json
  {
    "message": "درخواست شما با موفقیت ثبت شد و در انتظار بررسی است.",
    "data": { ... }
  }
  ```

---

#### ۲. مدیریت درخواست‌های ارتقا توسط ادمین
- **لیست درخواست‌های در انتظار بررسی:**  
  `GET /api/v1/admin/media-owner-requests` (نیازمند پرمیشن `admin.manage-media-owner-requests`)
- **تایید درخواست و اعطای نقش مالک رسانه:**  
  `POST /api/v1/admin/media-owner-requests/{requestId}/approve`
- **رد درخواست با ثبت دلیل:**  
  `POST /api/v1/admin/media-owner-requests/{requestId}/reject`  
  با بدنه: `{"reason": "مدارک ارسالی ناخوانا است."}`

---

### بخش و: پیشنهادات هوشمند سازه با هوش مصنوعی (AI Proposal)

#### ۱. ثبت سناریوی کمپین برای پیشنهاد بهترین سازه‌ها
- **مسیر:** `POST /api/v1/proposals`
- **احراز هویت:** `auth:sanctum` (دارای Rate Limiter اختصاصی)
- **بدنه درخواست (JSON):**
  ```json
  {
    "budget": 200000000,
    "city_id": 1,
    "scenario": "ما یک استارتاپ خدمات آنلاین هستیم و می‌خواهیم برای کمپین زمستانه در مسیرهای پرتردد اداری تهران تبلیغات داشته باشیم..."
  }
  ```
- **قوانین:** متن `scenario` حداقل ۲۰ و حداکثر ۵۰۰۰ کاراکتر.
- **پاسخ موفق (201 Created):**
  ```json
  {
    "message": "درخواست پیشنهاد با موفقیت ثبت شد و در حال پردازش است.",
    "proposal": {
      "id": 4,
      "status": "pending"
    }
  }
  ```

---

#### ۲. مشاهده نتیجه پیشنهاد و سازه‌های پیشنهادی
- **مسیر:** `GET /api/v1/proposals/{proposal}` *(پشتیبانی از UUID یا ID عددی)*
- **احراز هویت:** `auth:sanctum`
- **نمونه کامل پاسخ (200 OK):**
  ```json
  {
    "proposal": {
      "id": 4,
      "uuid": "8e31a153-066c-48be-88ca-1bb7cbfeef51",
      "user_id": 10,
      "budget": "200000000.00",
      "city_id": 1,
      "scenario": "ما یک استارتاپ خدمات آنلاین هستیم و می‌خواهیم برای کمپین زمستانه در مسیرهای پرتردد اداری تهران تبلیغات داشته باشیم...",
      "status": "completed",
      "created_at": "2026-10-25T13:00:00.000000Z",
      "updated_at": "2026-10-25T13:02:15.000000Z",
      "results": [
        {
          "id": 1,
          "proposal_id": 4,
          "structure_id": 5,
          "rank": 1,
          "reasoning": "بیلبورد تقاطع ولیعصر-همت به دلیل دید ترافیکی سنگین کارمندان و جامعه هدف اداری تهران و تناسب کامل با بودجه ۲۰۰ میلیون ریالی به عنوان اولویت اول پیشنهاد می‌شود.",
          "created_at": "2026-10-25T13:02:15.000000Z",
          "updated_at": "2026-10-25T13:02:15.000000Z"
        },
        {
          "id": 2,
          "proposal_id": 4,
          "structure_id": 8,
          "rank": 2,
          "reasoning": "استرابورد میدان ونک دسترسی به قطب شرکت‌های نوپا و فناوری را به عنوان دومین اولویت پوشش می‌دهد.",
          "created_at": "2026-10-25T13:02:15.000000Z",
          "updated_at": "2026-10-25T13:02:15.000000Z"
        }
      ]
    }
  }
  ```

---

#### ۳. لیست تاریخچه پیشنهادات کاربر
- **مسیر:** `GET /api/v1/proposals`
- **احراز هویت:** `auth:sanctum`
- **پارامترهای کوئری:** `page`, `per_page` (پیش‌فرض ۱۵)
- **نمونه کامل پاسخ (200 OK):**
  ```json
  {
    "current_page": 1,
    "data": [
      {
        "id": 4,
        "uuid": "8e31a153-066c-48be-88ca-1bb7cbfeef51",
        "user_id": 10,
        "budget": "200000000.00",
        "city_id": 1,
        "scenario": "ما یک استارتاپ خدمات آنلاین هستیم و می‌خواهیم برای کمپین زمستانه در مسیرهای پرتردد اداری تهران تبلیغات داشته باشیم...",
        "status": "completed",
        "created_at": "2026-10-25T13:00:00.000000Z",
        "updated_at": "2026-10-25T13:02:15.000000Z"
      }
    ],
    "first_page_url": "http://localhost:8085/api/v1/proposals?page=1",
    "from": 1,
    "last_page": 1,
    "last_page_url": "http://localhost:8085/api/v1/proposals?page=1",
    "links": [
      {
        "url": null,
        "label": "&laquo; قبلی",
        "active": false
      },
      {
        "url": "http://localhost:8085/api/v1/proposals?page=1",
        "label": "1",
        "active": true
      },
      {
        "url": null,
        "label": "بعدی &raquo;",
        "active": false
      }
    ],
    "next_page_url": null,
    "path": "http://localhost:8085/api/v1/proposals",
    "per_page": 15,
    "prev_page_url": null,
    "to": 1,
    "total": 1
  }
  ```

---

### بخش ز: مدیریت شهرها و موقعیت‌ها (Location)

#### ۱. دریافت لیست استان‌ها و شهرها
مناسب برای پر کردن آبشاری دراپ‌داون‌های استان و شهر در فرانت.
- **مسیر:** `GET /api/v1/cities`
- **احراز هویت:** پابلیک
- **پاسخ:**
  ```json
  {
    "data": [
      {
        "id": 1,
        "name": "تهران",
        "parent_id": null,
        "children": [
          { "id": 101, "name": "ری" },
          { "id": 102, "name": "شمیرانات" }
        ]
      }
    ]
  }
  ```

---

### بخش ح: مدیریت کاربران و نقش‌ها توسط ادمین (Users & Roles)

*نیازمند پرمیشن `admin.manage-user-roles`*

| متد | مسیر (URI) | کارکرد | بدنه / پارامتر |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/v1/admin/users` | جستجوی کاربران سیستم بر اساس شماره یا نام | `?search=0912&per_page=15` |
| `GET` | `/api/v1/admin/users/{userUuid}` | مشاهده جزییات کاربر و نقش‌های فعال | - |
| `GET` | `/api/v1/admin/users/{userUuid}/roles` | لیست نقش‌های اختصاص‌یافته به کاربر | - |
| `POST` | `/api/v1/admin/users/{userUuid}/roles` | اختصاص نقش به کاربر (`client`, `media_owner`, `super_admin`) | `{"role": "media_owner"}` |
| `DELETE` | `/api/v1/admin/users/{userUuid}/roles/{role}` | سلب یک نقش از کاربر | - |

---

## ۵. راهنمای اتصال Realtime به Laravel Reverb در Next.js

بک‌اند مجهز به سرور وب‌سوکت رسمی لاراول (**Laravel Reverb**) روی پورت **8080** است. تغییرات وضعیت رزروها بلافاصله پس از هر اقدام به کلاینت فرانت‌اند برودکست می‌شود.

### ۱. مشخصات کانال‌ها و رویدادها (Channels & Events):
- **نوع کانال:** کانال خصوصی (Private Channel)
- **نام کانال در لاراول اکو:** `bookings.{bookingUuid}`  
  *(در سطح پروتکل Pusher/Reverb نام کامل `private-bookings.{bookingUuid}` است که اکو با متد `echo.private(...)` آن را هندل می‌کند)*.
- **شرط دسترسی به کانال:** کاربر صاحب رزرو (Client)، مالک سازه (Media Owner)، سوپرادمین و مدیر مالی.
- **نام رویداد (Event Name):** `BookingStatusChanged`  
  *(در لاراول اکو با پیشوند دات شنود می‌شود: `.listen('.BookingStatusChanged', ...)`)*.
- **ساختار پی‌لود رویداد (Event Payload JSON):**
  ```json
  {
    "booking_uuid": "9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d",
    "from_status": "pending_review",
    "to_status": "locked_for_contract",
    "status_label": "قفل برای قرارداد",
    "note": "تایید اولیه انجام شد و سازه قفل گردید",
    "updated_at": "2026-10-25T14:30:00+03:30"
  }
  ```

---

### ۲. تنظیمات اندپوینت احراز هویت وب‌سوکت:
- **مسیر احراز هویت:** `POST http://localhost:8085/broadcasting/auth`
- **هدرهای ارسالی اکو:**
  ```http
  Authorization: Bearer <ACCESS_TOKEN>
  Accept: application/json
  ```
- **وضعیت CORS:** مسیر `broadcasting/auth` در فایل `config/cors.php` بک‌اند ثبت شده و مشکلی از بابت CORS در درخواست‌های مرورگر ندارد.

---

### ۳. نصب پکیج‌ها در Next.js:
```bash
npm install laravel-echo pusher-js
```

---

### ۴. پیاده‌سازی ماژول مدیریت کلاینت Reverb (`lib/echo.ts`):
این ماژول مشکل SSR را برطرف کرده، قابلیت Lazy Initialization دارد و به شما اجازه می‌دهد توکن احراز هویت را در زمان لاگین/لاگ‌اوت به صورت داینامیک تغییر دهید:

```typescript
// lib/echo.ts
import Echo from 'laravel-echo';
import Pusher from 'pusher-js';

declare global {
  interface Window {
    Pusher: typeof Pusher;
    Echo: Echo;
  }
}

let echoInstance: Echo | null = null;
let currentToken: string | null = null;

// تابعی برای دریافت توکن (از LocalStorage، Zustand، یا Cookie)
export const getStoredToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('access_token');
};

export const getEcho = (tokenOverride?: string): Echo | null => {
  // در محیط سرور (SSR) اجرا نشود
  if (typeof window === 'undefined') {
    return null;
  }

  const token = tokenOverride || getStoredToken();

  // اگر نمونه قبلاً ساخته شده و توکن تغییر نکرده، همان را برگردان
  if (echoInstance && currentToken === token) {
    return echoInstance;
  }

  // اگر قبلاً نمونه‌ای با توکن قدیمی بود، قطع ارتباط شود
  if (echoInstance) {
    echoInstance.disconnect();
    echoInstance = null;
  }

  currentToken = token;
  window.Pusher = Pusher;

  echoInstance = new Echo({
    broadcaster: 'reverb',
    key: process.env.NEXT_PUBLIC_REVERB_APP_KEY || 'platform-reverb-key',
    wsHost: process.env.NEXT_PUBLIC_REVERB_HOST || 'localhost',
    wsPort: Number(process.env.NEXT_PUBLIC_REVERB_PORT) || 8080,
    wssPort: Number(process.env.NEXT_PUBLIC_REVERB_PORT) || 8080,
    forceTLS: process.env.NEXT_PUBLIC_REVERB_FORCE_TLS === 'true',
    enabledTransports: ['ws', 'wss'],
    authEndpoint: `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8085'}/broadcasting/auth`,
    auth: {
      headers: {
        Authorization: token ? `Bearer ${token}` : '',
        Accept: 'application/json',
      },
    },
  });

  return echoInstance;
};

// بازنشانی و قطع ارتباط در زمان خروج از حساب کاربری
export const disconnectEcho = () => {
  if (echoInstance) {
    echoInstance.disconnect();
    echoInstance = null;
    currentToken = null;
  }
};
```

---

### ۵. نمونه هوک سفارشی React برای شنود تغییرات رزرو (`hooks/useBookingSocket.ts`):
```typescript
// hooks/useBookingSocket.ts
import { useEffect } from 'react';
import { getEcho } from '@/lib/echo';

export interface BookingStatusPayload {
  booking_uuid: string;
  from_status: string;
  to_status: string;
  status_label: string;
  note: string | null;
  updated_at: string;
}

export const useBookingSocket = (
  bookingUuid?: string,
  onStatusChanged?: (data: BookingStatusPayload) => void
) => {
  useEffect(() => {
    if (!bookingUuid) return;

    const echo = getEcho();
    if (!echo) return;

    const channelName = `bookings.${bookingUuid}`;

    // عضویت در کانال خصوصی رزرو
    const channel = echo.private(channelName);

    // شنود رویداد BookingStatusChanged
    channel.listen('.BookingStatusChanged', (event: BookingStatusPayload) => {
      console.log('Realtime Status Update Received:', event);
      if (onStatusChanged) {
        onStatusChanged(event);
      }
    });

    // Cleanup در زمان Unmount شدن کامپوننت
    return () => {
      echo.leave(channelName);
    };
  }, [bookingUuid, onStatusChanged]);
};
```

---

### ۶. نمونه استفاده در صفحه جزییات رزرو Next.js:
```tsx
'use client';

import { useState } from 'react';
import { useBookingSocket, BookingStatusPayload } from '@/hooks/useBookingSocket';

export default function BookingDetailPage({ bookingUuid }: { bookingUuid: string }) {
  const [statusLabel, setStatusLabel] = useState('در انتظار بررسی');

  useBookingSocket(bookingUuid, (event: BookingStatusPayload) => {
    // به‌روزرسانی آنی استیت صفحه و نمایش نوتیفیکیشن
    setStatusLabel(event.status_label);
    alert(`وضعیت رزرو به "${event.status_label}" تغییر یافت!`);
  });

  return (
    <div>
      <h1>وضعیت فعلی رزرو: {statusLabel}</h1>
    </div>
  );
}
```

---
*تهیه شده برای تیم فنی و توسعه‌دهندگان فرانت‌اند Next.js*
