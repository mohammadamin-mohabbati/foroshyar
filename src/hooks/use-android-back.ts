"use client";

/* مدیریت دکمه برگشت سخت‌افزاری اندروید:
   ۱) اگر پنجره یا منویی باز است → بستن آن
   ۲) یک بار برگشت → یک مرحله به عقب (اگر تاریخچه وجود داشته باشد)
   ۳) دو بار برگشت پشت‌سرهم → خروج کامل از برنامه */

import { useEffect, useRef } from "react";
import { Capacitor } from "@capacitor/core";
import { toast } from "sonner";

export function useAndroidBack(navigateBack: () => boolean) {
  const backRef = useRef(navigateBack);
  backRef.current = navigateBack;

  useEffect(() => {
    // فقط روی دستگاه واقعی (اندروید/iOS)
    if (!Capacitor.isNativePlatform()) return;

    let lastBackAt = 0;
    let disposed = false;
    let handle: { remove: () => Promise<void> } | undefined;

    import("@capacitor/app").then(({ App }) =>
      App.addListener("backButton", () => {
        // ۱) بستن بالاترین لایه باز (دیالوگ، منو، دراور)
        const openLayer = document.querySelector(
          '[role="dialog"][data-state="open"],[role="alertdialog"][data-state="open"],[role="menu"][data-state="open"]'
        );
        if (openLayer) {
          document.dispatchEvent(
            new KeyboardEvent("keydown", { key: "Escape", bubbles: true })
          );
          return;
        }

        // ۲) یک مرحله به عقب
        if (backRef.current()) return;

        // ۳) دو بار پشت‌سرهم → خروج
        const now = Date.now();
        if (now - lastBackAt < 2200) {
          void App.exitApp();
          return;
        }
        lastBackAt = now;
        toast.info("برای خروج، دوباره دکمه برگشت را بزنید");
      })
    ).then((h) => {
      if (disposed) void h.remove();
      else handle = h;
    });

    return () => {
      disposed = true;
      if (handle) void handle.remove();
    };
  }, []);
}
