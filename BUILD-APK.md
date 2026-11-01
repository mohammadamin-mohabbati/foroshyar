# راهنمای ساخت APK فروش‌یار برای انتشار در کافه‌بازار و مایکت

> **خبر خوب:** دیگر نیازی به ساخت دستی نیست! با هر push به شاخه `main`،
> گیت‌هاب به‌صورت خودکار APK و AAB **امضاشده** می‌سازد و در بخش
> **Releases** ریپو منتشر می‌کند.
> مسیر دانلود: صفحه ریپو ← بخش **Releases** ← فایل `Froshyar-x.x.x.apk`

## ساخت خودکار (روش پیشنهادی)

1. هر تغییری می‌دهید و به `main` push می‌کنید.
2. اکشن **«ساخت APK فروش‌یار»** اجرا می‌شود (تب Actions).
3. بعد از چند دقیقه، نسخه جدید در **Releases** با این فایل‌ها ثبت می‌شود:
   - `Froshyar-{نسخه}.apk` — نصب مستقیم روی گوشی
   - `Froshyar-{نسخه}.aab` — برای آپلود در کافه‌بازار / مایکت
4. `versionCode` از خود شماره نسخه ساخته می‌شود: `major×10000 + minor×100 + patch`
   (مثلاً `1.0.7` ← کد `10007`)، پس همیشه یکتا و صعودی است.
5. نسخه از `package.json` خوانده می‌شود؛ برای نسخه جدید فقط همان را تغییر دهید (مثلاً `1.1.0`).

## امضای برنامه (بدون کلید داخل مخزن)

این مخزن **عمومی** است و کلید امضا داخل آن قرار ندارد. اکشن، کلید را
قبل از بیلد از **Actions Secrets** می‌خواند و به‌صورت موقت کنار پروژه می‌گذارد.

سکرت‌های لازم (Settings ← Secrets and variables ← Actions):

| سکرت | مقدار |
|---|---|
| `KEYSTORE_BASE64` | خروجی `base64 -w0 froshyar-release.jks` |
| `KEYSTORE_PASSWORD` | رمز keystore |
| `KEY_ALIAS` | نام مستعار کلید (مثلاً `froshyar`) |
| `KEY_PASSWORD` | رمز کلید |

بیلد، فایل را در `android/keystore/froshyar-release.jks` بازگردانی می‌کند و
`android/key.properties` را خودکار می‌سازد؛ هر دو فقط داخل محیط اجرای اکشن
هستند و به هیچ کامیت اضافه نمی‌شوند (در `.gitignore` هم مسدودند).

⚠️ **مهم:** فایل اصلی keystore را جداگانه پشتیبان‌گیری کنید — برای هر
به‌روزرسانی منتشرشده در بازارها باید با همین کلید امضا شود.

اثر انگشت گواهی رسمی (برای راستی‌آزمایی):

```
SHA-256: FF:E5:5B:2F:74:2A:78:77:75:00:1C:44:D9:A9:DC:6D:11:B3:70:3F:58:5E:44:E6:F5:24:CA:76:3C:A0:C5:3F
```

## ساخت دستی (روی سیستم خودتان)

پیش‌نیازها: Node.js 20+، JDK 21، Android SDK

```bash
npm install
npm run apk     # خروجی: android/app/build/outputs/apk/release/app-release.apk
npm run aab     # خروجی: android/app/build/outputs/bundle/release/app-release.aab
```

## نکات فنی

- وب اپ با `output: "export"` به‌صورت **استاتیک کامل** بیلد می‌شود (پوشه `out/`)
- Capacitor همان پوشه را داخل WebView بارگذاری می‌کند (`androidScheme: https`)
- کل داده‌ها در localStorage گوشی ذخیره می‌شود؛ **هیچ اینترنت و سروری لازم نیست**
- `appId`: `ir.mohabbati.froshyar` — نام نمایشی: «فروش‌یار»
- آیکون‌ها و اسپلش از `assets/` با `npx capacitor-assets generate --android` ساخته می‌شوند
  (اسکریپت تولید: `npm run icons`)
