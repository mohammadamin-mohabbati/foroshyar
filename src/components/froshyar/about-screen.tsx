"use client";

/* درباره ما */

import { Copy, Mail } from "lucide-react";
import { ScreenHeader } from "./ui-bits";
import { toast } from "sonner";
import pkg from "../../../package.json";

const DEVELOPER = "محمدامین محبتی";
const EMAIL = "mohammadaminmohabbatii@gmail.com";
// نسخه از package.json خوانده می‌شود و با هر انتشار خودکار به‌روز می‌شود
const VERSION = pkg.version;

export function AboutScreen({ onBack }: { onBack: () => void }) {
  async function copyEmail() {
    try {
      await navigator.clipboard.writeText(EMAIL);
      toast.success("ایمیل کپی شد");
    } catch {
      toast.error("کپی انجام نشد");
    }
  }

  return (
    <div className="min-h-screen">
      <ScreenHeader title="درباره ما" onBack={onBack} />

      <div className="mx-auto w-full max-w-md space-y-4 px-4 pb-28 pt-5">
        {/* هدر برنامه */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-b from-deep to-brand p-6 text-center text-white">
          <div className="pointer-events-none absolute -top-10 -left-10 h-32 w-32 rounded-full bg-white/10 blur-2xl" />
          <img
            src="/icon.png"
            alt="آیکون فروش‌یار"
            className="mx-auto h-24 w-24 rounded-3xl object-cover shadow-2xl shadow-black/30"
          />
          <h1 className="mt-4 text-2xl font-extrabold">فروش‌یار</h1>
          <p className="mt-1 text-xs text-white/80">صدور فاکتور، ساده و سریع</p>
          <span
            dir="ltr"
            className="mt-3 inline-block rounded-full bg-white/15 px-3 py-1 text-[11px] font-bold tracking-wide"
          >
            v{VERSION}
          </span>
        </div>

        {/* توسعه‌دهنده */}
        <section className="rounded-2xl border bg-card p-4">
          <h2 className="mb-3 text-sm font-extrabold">توسعه‌دهنده</h2>
          <div className="flex items-center gap-3">
            <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-tint text-xl font-extrabold text-brand">
              م
            </span>
            <div className="flex-1">
              <p className="font-extrabold">{DEVELOPER}</p>
              <p className="text-xs text-muted-foreground">طراح و توسعه‌دهنده اپلیکیشن</p>
            </div>
          </div>

          <div className="mt-4 flex items-center gap-2 rounded-xl bg-muted/50 p-3">
            <Mail className="h-4 w-4 shrink-0 text-brand" />
            <span dir="ltr" className="min-w-0 flex-1 truncate text-left text-xs font-bold">
              {EMAIL}
            </span>
            <button
              onClick={copyEmail}
              aria-label="کپی ایمیل"
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border bg-card text-muted-foreground transition-colors hover:text-brand active:scale-95"
            >
              <Copy className="h-3.5 w-3.5" />
            </button>
            <a
              href={`mailto:${EMAIL}`}
              aria-label="ارسال ایمیل"
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground transition-transform active:scale-95"
            >
              <Mail className="h-3.5 w-3.5" />
            </a>
          </div>
        </section>

        <p className="pb-2 text-center text-[11px] text-muted-foreground">
          فروش‌یار — همراه فروشندگان ایرانی
        </p>
      </div>
    </div>
  );
}
