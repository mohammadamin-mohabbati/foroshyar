import type { CapacitorConfig } from "@capacitor/cli";

/**
 * پیکربندی Capacitor برای ساخت APK/AAB فروش‌یار
 * مستندات: BUILD-APK.md
 */
const config: CapacitorConfig = {
  appId: "ir.mohabbati.froshyar",
  appName: "فروش‌یار",
  webDir: "out",
  // اپ کاملاً آفلاین است؛ نیازی به سرور نیست
  server: {
    androidScheme: "https",
  },
  android: {
    allowMixedContent: false,
    backgroundColor: "#F5F7F6",
  },
  plugins: {},
};

export default config;
