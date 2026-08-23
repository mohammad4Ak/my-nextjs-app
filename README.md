# فروشگاه آنلاین کفش 🥿

یک فروشگاه آنلاین کفش مدرن و مینیمال با Next.js, TailwindCSS, Prisma و PostgreSQL

## ویژگی‌ها

- ✨ طراحی مینیمال و مدرن
- 🛒 سبد خرید پیشرفته
- 🔐 احراز هویت با NextAuth
- 💳 پرداخت با زرین‌پال
- 🎯 پنل مدیریت کامل
- 📱 ریسپانسیو کامل
- 🌐 رابط فارسی (RTL)
- 🎨 طراحی چرم و کلاسیک

## نصب و راه‌اندازی

```bash
# نصب وابستگی‌ها
npm install

# راه‌اندازی دیتابیس
npx prisma migrate dev

# اجرای سرور توسعه
npm run dev
```

## تکنولوژی‌ها

- **Frontend:** Next.js 14+ (App Router), TypeScript, TailwindCSS
- **Backend:** Next.js API Routes
- **Database:** PostgreSQL + Prisma ORM
- **Authentication:** NextAuth.js
- **Payment:** ZarinPal
- **State Management:** Zustand

## ساختار پروژه

```
src/
├── app/            # Next.js App Router pages
├── components/     # React components
├── lib/           # Utilities & configuration
├── types/         # TypeScript types
└── hooks/         # Custom hooks
```

## اسکریپت‌های مفید

```bash
npm run dev        # Start development server
npm run build      # Build for production
npm run start      # Start production server
npm run lint       # Run ESLint
```

## License

MIT

---

## 🚀 دیپلوی روی Vercel + Neon (رایگان)

GitHub Pages فقط استاتیک سرو میکند و به API/دیتابیس دسترسی ندارد؛ برای آنلاین شدن کامل:

### ۱) دیتابیس ابری (Neon)
1. در [neon.tech](https://neon.tech) اکانت بساز و یک Project جدید ایجاد کن
2. Connection String را کپی کن (شبیه `postgresql://...?sslmode=require`)

### ۲) ساخت جداول و داده اولیه
در ریشه پروژه، `.env` لوکال را موقتاً به Connection String نئون تغییر بده و اجرا کن:
```bash
npm run db:deploy        # مایگریشنها
npm run db:seed          # ادمین + دستهها + محصولات نمونه
npm run db:seed:orders   # سفارشهای نمونه داشبورد (اختیاری)
```
حساب پیشفرض ادمین: `admin@shoeland.ir / admin123` (بعد از دیپلوی رمزش را عوض کن)

### ۳) دیپلوی روی Vercel
1. [vercel.com](https://vercel.com) → Add New → Project → ریپوی GitHub را انتخاب کن
2. Environment Variables را اضافه کن:
   - `DATABASE_URL` = کانکشن استرینگ Neon
   - `AUTH_SECRET` = یک رشته تصادفی قوی
   - `ZARINPAL_MERCHANT_ID` = مرچنت زرینپال
3. Deploy بزن

### ۴) آپلود تصاویر در پروداکشن
فایلسیستم Vercel موندگار نیست؛ آپلود خودکار به **Vercel Blob** سوئیچ میشود:
1. در داشبورد Vercel → تب Storage → Create Blob Store → متصل به همین پروژه
2. توکن `BLOB_READ_WRITE_TOKEN` خودکار تزریق میشود — بدون تغییر کد ✓

(بدون این توکن، آپلود فقط در حالت لوکال روی دیسک کار میکند)

### خلاصه متغیرهای محیطی پروداکشن
| کلید | توضیح |
|------|-------|
| `DATABASE_URL` | کانکشن استرینگ Neon |
| `AUTH_SECRET` | رشته تصادفی قوی |
| `ZARINPAL_MERCHANT_ID` | مرچنت ID زرینپال |
| `BLOB_READ_WRITE_TOKEN` | خودکار توسط Vercel Blob |