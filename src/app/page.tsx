"use client";

/* فروش‌یار — اپلیکیشن صدور فاکتور آفلاین */

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Toaster } from "sonner";
import { Capacitor } from "@capacitor/core";
import { useStore } from "@/lib/store";
import { useAndroidBack } from "@/hooks/use-android-back";
import { Splash } from "@/components/froshyar/splash";
import { Onboarding } from "@/components/froshyar/onboarding";
import { HomeScreen } from "@/components/froshyar/home";
import { BottomNav, type TabId } from "@/components/froshyar/bottom-nav";
import { InvoicesScreen } from "@/components/froshyar/invoices-screen";
import { ProductsScreen } from "@/components/froshyar/products-screen";
import { CustomersScreen } from "@/components/froshyar/customers-screen";
import { InvoiceEditor } from "@/components/froshyar/invoice-editor";
import { InvoicePreview } from "@/components/froshyar/invoice-preview";
import { SettingsScreen } from "@/components/froshyar/settings-screen";
import { AboutScreen } from "@/components/froshyar/about-screen";
import { THEMES } from "@/lib/store";

type Screen =
  | TabId
  | "settings"
  | "about"
  | "editor"
  | "preview";

const NAV_SCREENS: Screen[] = ["home", "invoices", "products", "customers"];

/* ارتفاع هدر خالی بالای تمام صفحات */
const TOP_HEADER_H = "h-12";

const THEME_DEEP: Record<string, string> = Object.fromEntries(
  THEMES.map((t) => [t.id, t.deep])
);

export default function Page() {
  // تشخیص نصب روی کلاینت بدون setState داخل اثر
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );
  const [splash, setSplash] = useState(true);
  const [screen, setScreen] = useState<Screen>("home");
  const [activeInvoiceId, setActiveInvoiceId] = useState<string | null>(null);
  const [editInvoiceId, setEditInvoiceId] = useState<string | null>(null);

  /* تاریخچه نویگیشن برای دکمه برگشت اندروید */
  const historyRef = useRef<Screen[]>([]);

  const hydrated = useStore((s) => s.hydrated);
  const profile = useStore((s) => s.profile);

  useEffect(() => {
    const t = setTimeout(() => setSplash(false), 2200);
    // پرچم بوت سالم برای watchdog داخل index.html
    try {
      (window as unknown as { __FY_BOOTED?: boolean }).__FY_BOOTED = true;
      sessionStorage.removeItem("__fy_recovered");
    } catch (_) {}
    return () => clearTimeout(t);
  }, []);

  // اطمینان نهایی: اسپلش هرگز نباید برنامه را قفل کند
  useEffect(() => {
    const t = setTimeout(() => useStore.getState().setHydrated(), 3000);
    return () => clearTimeout(t);
  }, []);

  // اعمال تم و حالت تیره/روشن
  useEffect(() => {
    if (!hydrated) return;
    const el = document.documentElement;
    el.dataset.theme = profile.theme;
    el.classList.toggle("dark", profile.dark);
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) {
      meta.setAttribute("content", profile.dark ? "#0A1310" : THEME_DEEP[profile.theme] || "#0B5D50");
    }
  }, [hydrated, profile.theme, profile.dark]);

  // سرویس‌ورکر فقط در وب (PWA) ثبت می‌شود. در APK اندروید فایل‌ها از
  // حافظه دستگاه خوانده می‌شوند و سرویس‌ورکرِ نسخه‌های قبلی می‌توانست
  // HTML قدیمی را از کش سرو کند و برنامه را روی اسپلش گیر بیندازد —
  // پس در نسخه اندرویدی حذف و کش‌ها پاک می‌شوند.
  useEffect(() => {
    if (Capacitor.isNativePlatform()) {
      const sw = navigator.serviceWorker;
      if (sw?.getRegistrations) {
        sw.getRegistrations()
          .then((rs) => rs.forEach((r) => r.unregister()))
          .catch(() => {});
      }
      if ("caches" in window) {
        caches
          .keys()
          .then((ks) => ks.forEach((k) => caches.delete(k)))
          .catch(() => {});
      }
      return;
    }
    if (process.env.NODE_ENV === "production" && "serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {});
    }
  }, []);

  /** جابه‌جایی به جلو — صفحه فعلی در تاریخچه ثبت می‌شود */
  const go = (next: Screen) => {
    setScreen((cur) => {
      if (cur !== next) historyRef.current.push(cur);
      return next;
    });
  };

  /** بازگشت صریح (دکمه بازگشت رابط) — یک پله از تاریخچه */
  const back = (fallback: Screen) => {
    const prev = historyRef.current.pop();
    setScreen(prev ?? fallback);
  };

  /** جابه‌جایی با بازنویسی تاریخچه (بعد از ذخیره فاکتور) */
  const goFresh = (next: Screen, trail: Screen[]) => {
    historyRef.current = [...trail];
    setScreen(next);
  };

  /** دکمه برگشت سخت‌افزاری اندروید */
  const navigateBack = () => {
    const prev = historyRef.current.pop();
    if (prev) {
      setScreen(prev);
      return true;
    }
    return false;
  };
  useAndroidBack(navigateBack);

  const showSplash = !mounted || !hydrated || splash;

  if (showSplash) {
    return (
      <>
        <Splash />
        <Toaster position="top-center" dir="rtl" />
      </>
    );
  }

  if (!profile.onboarded) {
    return (
      <div className="mx-auto min-h-screen w-full max-w-md bg-background shadow-2xl shadow-black/5 md:border-x">
        <Onboarding />
        <Toaster position="top-center" dir="rtl" />
      </div>
    );
  }

  const openInvoice = (id: string) => {
    setActiveInvoiceId(id);
    go("preview");
  };
  const newInvoice = () => {
    setEditInvoiceId(null);
    go("editor");
  };
  const editInvoice = (id: string) => {
    setEditInvoiceId(id);
    go("editor");
  };

  function renderScreen() {
    switch (screen) {
      case "home":
        return (
          <HomeScreen
            onTab={(t) => go(t)}
            onNewInvoice={newInvoice}
            onOpenInvoice={openInvoice}
          />
        );
      case "invoices":
        return (
          <InvoicesScreen
            onNewInvoice={newInvoice}
            onOpenInvoice={openInvoice}
            onEditInvoice={editInvoice}
          />
        );
      case "products":
        return <ProductsScreen onNewInvoice={newInvoice} />;
      case "customers":
        return <CustomersScreen />;
      case "settings":
        return <SettingsScreen onBack={() => back("home")} />;
      case "about":
        return <AboutScreen onBack={() => back("home")} />;
      case "editor":
        return (
          <InvoiceEditor
            editId={editInvoiceId}
            onBack={() => back(editInvoiceId ? "invoices" : "home")}
            onSaved={(id, goPreview) => {
              if (goPreview) {
                setActiveInvoiceId(id);
                goFresh("preview", ["invoices"]);
              } else {
                goFresh("invoices", ["home"]);
              }
            }}
          />
        );
      case "preview":
        return activeInvoiceId ? (
          <InvoicePreview
            invoiceId={activeInvoiceId}
            onBack={() => back("invoices")}
            onEdit={(id) => editInvoice(id)}
          />
        ) : null;
      default:
        return null;
    }
  }

  return (
    <div className="min-h-screen bg-muted/40 md:py-0">
      <div className="relative mx-auto min-h-screen w-full max-w-md bg-background shadow-2xl shadow-black/5 md:border-x">
        {/* هدر خالی بالای همه صفحات — بدون محتوا */}
        <div aria-hidden="true" className={`${TOP_HEADER_H} w-full`} />

        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={screen}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.16, ease: "easeOut" }}
            className="min-h-screen"
          >
            {renderScreen()}
          </motion.div>
        </AnimatePresence>

        {NAV_SCREENS.includes(screen) && (
          <BottomNav
            active={screen as TabId}
            onTab={(t) => go(t)}
            onSettings={() => go("settings")}
            onAbout={() => go("about")}
          />
        )}
      </div>
      <Toaster
        position="top-center"
        dir="rtl"
        theme={profile.dark ? "dark" : "light"}
        toastOptions={{
          style: {
            fontFamily: "Vazirmatn, sans-serif",
            borderRadius: "14px",
          },
        }}
      />
    </div>
  );
}
