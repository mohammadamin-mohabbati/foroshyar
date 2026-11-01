import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "فروش‌یار | صدور فاکتور ساده و سریع",
  description:
    "برنامه حرفه‌ای صدور فاکتور برای کسب‌وکارها؛ کاملاً آفلاین، بدون نیاز به اینترنت، با فونت فارسی، ۶ تم رنگی و اشتراک‌گذاری فاکتور به صورت PNG، JPG و PDF",
  applicationName: "فروش‌یار",
  manifest: "/manifest.json",
  icons: {
    icon: "/icon.png",
    shortcut: "/icon.png",
    apple: "/apple-touch-icon.png",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "فروش‌یار",
  },
  keywords: ["فاکتور", "فروش‌یار", "صورتحساب", "حسابداری", "فروشگاه", "آفلاین"],
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  themeColor: "#0B5D50",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fa" dir="rtl" suppressHydrationWarning>
      <body className="antialiased bg-background text-foreground">
        {/* سگ بوت: اگر جاوااسکریپت تا ۶ ثانیه بالا نیامد (مثلاً کش معیوب
            سرویس‌ورکر نسخه‌های قبلی)، یک‌بار سرویس‌ورکر و کش‌ها پاک و
            صفحه رفرش می‌شود؛ محافظ sessionStorage جلوی حلقه بی‌پایان را می‌گیرد */}
        <script
          dangerouslySetInnerHTML={{
            __html:
              '(function(){try{setTimeout(function(){if(window.__FY_BOOTED)return;try{if(sessionStorage.getItem("__fy_recovered")==="1")return;sessionStorage.setItem("__fy_recovered","1");}catch(e){return;}try{if(navigator.serviceWorker){navigator.serviceWorker.getRegistrations().then(function(r){r.forEach(function(x){x.unregister();});}).catch(function(){});}}catch(e){}try{if(window.caches&&caches.keys){caches.keys().then(function(k){k.forEach(function(x){caches.delete(x);});}).catch(function(){});}}catch(e){}location.reload();},6000);}catch(e){}});',
          }}
        />
        {children}
      </body>
    </html>
  );
}
