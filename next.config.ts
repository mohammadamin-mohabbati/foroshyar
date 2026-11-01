import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* خروجی استاتیک — برای WebView اندروید (Capacitor) و PWA آفلاین */
  output: "export",
  images: {
    unoptimized: true,
  },
  /* حذف دکمه N (Next.js DevTools) و هر نشانگر توسعه */
  devIndicators: false,
  typescript: {
    ignoreBuildErrors: true,
  },
  reactStrictMode: false,
};

export default nextConfig;
