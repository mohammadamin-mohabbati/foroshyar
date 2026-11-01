"use client";

/* صفحه اسپلش فروش‌یار */

import { Check } from "lucide-react";

export function Splash() {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-[#0B5D50]">
      {/* پس‌زمینه تزئینی */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-24 -right-24 h-72 w-72 rounded-full bg-[#0F8A6B]/40 blur-3xl" />
        <div className="absolute -bottom-32 -left-20 h-80 w-80 rounded-full bg-[#0F8A6B]/30 blur-3xl" />
        <svg
          className="absolute bottom-0 left-0 right-0 w-full opacity-25"
          viewBox="0 0 390 200"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <path
            d="M0 120 C 90 60 160 180 250 120 C 320 76 360 110 390 90 L 390 200 L 0 200 Z"
            fill="#5EC9A3"
          />
          <path
            d="M0 150 C 100 100 170 200 260 150 C 330 114 365 140 390 126 L 390 200 L 0 200 Z"
            fill="#0F8A6B"
          />
        </svg>
      </div>

      {/* لوگوی فروش‌یار */}
      <div className="animate-float-slow relative">
        <div className="relative">
          <img
            src="/icon.png"
            alt="لوگوی فروش‌یار"
            className="h-28 w-28 rounded-3xl object-cover shadow-2xl shadow-black/30"
          />
          <span className="absolute -bottom-2 -left-2 flex h-9 w-9 items-center justify-center rounded-full bg-[#0F8A6B] ring-4 ring-white/20">
            <Check className="h-5 w-5 text-white" strokeWidth={3} />
          </span>
          <span className="animate-ping-badge absolute -bottom-2 -left-2 h-9 w-9 rounded-full bg-[#0F8A6B]" />
        </div>
      </div>

      <h1 className="mt-7 text-4xl font-extrabold tracking-tight text-white">فروش‌یار</h1>
      <p className="mt-2 text-sm text-emerald-100/80">صدور فاکتور، ساده و سریع</p>
    </div>
  );
}
