"use client";

/* اجزای مشترک رابط کاربری فروش‌یار */

import { useRef, useState } from "react";
import { Camera, ChevronRight, ImageIcon, Trash2, type LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { fileToDataUrl } from "@/lib/image";
import { toFa } from "@/lib/persian";
import type { InvoiceStatus } from "@/lib/store";

/* ---------- هدر صفحه با دکمه بازگشت ---------- */
export function ScreenHeader({
  title,
  onBack,
  left,
}: {
  title: string;
  onBack?: () => void;
  left?: React.ReactNode;
}) {
  return (
    <div className="sticky top-0 z-30 flex items-center gap-3 border-b bg-card/95 px-4 py-3 backdrop-blur">
      {onBack && (
        <button
          onClick={onBack}
          aria-label="بازگشت"
          className="flex h-9 w-9 items-center justify-center rounded-full border bg-background text-foreground transition-colors hover:bg-accent active:scale-95"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      )}
      <h1 className="flex-1 truncate text-base font-bold">{title}</h1>
      {left}
    </div>
  );
}

/* ---------- وضعیت خالی ---------- */
export function EmptyState({
  icon: Icon,
  title,
  subtitle,
  action,
}: {
  icon: LucideIcon;
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 px-6 py-14 text-center">
      <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-tint">
        <Icon className="h-9 w-9 text-brand" />
      </div>
      <p className="font-bold">{title}</p>
      {subtitle && <p className="max-w-xs text-sm leading-6 text-muted-foreground">{subtitle}</p>}
      {action}
    </div>
  );
}

/* ---------- نشان وضعیت پرداخت ---------- */
export function StatusBadge({ status }: { status: InvoiceStatus }) {
  const paid = status === "paid";
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold",
        paid
          ? "bg-[#E6F4EF] text-[#0F8A6B] dark:bg-[rgba(20,163,133,0.16)] dark:text-[#7DD3B9]"
          : "bg-[#FEF3C7] text-[#B45309] dark:bg-[rgba(217,119,6,0.16)] dark:text-[#FCD34D]"
      )}
    >
      <span className={cn("h-1.5 w-1.5 rounded-full", paid ? "bg-current" : "bg-current")} />
      {paid ? "پرداخت شده" : "در انتظار پرداخت"}
    </span>
  );
}

/* ---------- انتخاب عکس با فشرده‌سازی ---------- */
export function ImagePickRow({
  label,
  hint,
  value,
  onChange,
  max = 640,
}: {
  label: string;
  hint?: string;
  value: string;
  onChange: (dataUrl: string) => void;
  max?: number;
}) {
  const inputRef = useRef<HTMLInputElement>(null);

  async function pick(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    try {
      const dataUrl = await fileToDataUrl(file, max);
      onChange(dataUrl);
    } catch {
      // بی‌صدا رد شود
    }
  }

  return (
    <div className="flex items-center gap-3">
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={pick}
        aria-label={label}
      />
      <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-xl border bg-muted">
        {value ? (
          <img src={value} alt={label} className="h-full w-full object-contain" />
        ) : (
          <ImageIcon className="h-5 w-5 text-muted-foreground" />
        )}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-bold">{label}</p>
        {hint && <p className="truncate text-xs text-muted-foreground">{hint}</p>}
      </div>
      <div className="flex shrink-0 gap-1.5">
        <Button type="button" size="sm" variant="secondary" onClick={() => inputRef.current?.click()}>
          {value ? "تغییر" : "انتخاب"}
        </Button>
        {value && (
          <Button
            type="button"
            size="icon"
            variant="ghost"
            className="h-8 w-8 text-destructive"
            aria-label={`حذف ${label}`}
            onClick={() => onChange("")}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
}

/* ---------- انتخاب عکس پروفایل گرد ---------- */
export function AvatarPicker({
  value,
  onChange,
  fallback,
}: {
  value: string;
  onChange: (d: string) => void;
  fallback: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  async function pick(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    try {
      onChange(await fileToDataUrl(file, 400));
    } catch {}
  }
  return (
    <div className="flex flex-col items-center gap-2">
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={pick}
        aria-label="عکس پروفایل"
      />
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        aria-label="انتخاب عکس پروفایل"
        className="group relative h-20 w-20 overflow-hidden rounded-full border-2 border-primary/30 bg-tint shadow-sm transition-transform active:scale-95"
      >
        {value ? (
          <img src={value} alt="عکس پروفایل" className="h-full w-full object-cover" />
        ) : (
          <span className="flex h-full w-full items-center justify-center text-xl font-extrabold text-brand">
            {fallback}
          </span>
        )}
        <span className="absolute bottom-0 left-0 right-0 flex h-7 items-center justify-center bg-black/45 text-white">
          <Camera className="h-3.5 w-3.5" />
        </span>
      </button>
      <span className="text-xs text-muted-foreground">عکس پروفایل</span>
    </div>
  );
}

/* ---------- ورودی مبلغ با نمایش فارسی ---------- */
export function MoneyInput({
  value,
  onChange,
  placeholder,
  className,
  disabled,
}: {
  value: number;
  onChange: (n: number) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}) {
  const display = value === 0 ? "" : toFa(value.toLocaleString("en-US")).replace(/,/g, "٬");
  return (
    <input
      type="text"
      inputMode="numeric"
      dir="ltr"
      disabled={disabled}
      value={display}
      placeholder={placeholder}
      onChange={(e) => {
        const raw = e.target.value;
        const digits = raw.replace(/[^\d۰-۹٠-٩]/g, "");
        // پارس بدون وابستگی به جداکننده
        const en = digits.replace(/[۰-۹]/g, (d) => String("۰۱۲۳۴۵۶۷۸۹".indexOf(d)));
        onChange(en === "" ? 0 : parseInt(en, 10));
      }}
      className={cn(
        "h-10 w-full rounded-xl border border-input bg-transparent px-3 text-sm text-left tabular-nums outline-none transition-colors placeholder:text-muted-foreground focus-visible:border-ring disabled:opacity-50",
        className
      )}
    />
  );
}

/* ---------- ورودی تعداد با کیبرد عددی ---------- */
/* به‌جای دکمه‌های + و − ، عدد مستقیم تایپ می‌شود؛
   ارقام فارسی/عربی/انگلیسی پذیرفته می‌شوند و خالی گذاشتن = برگشت به ۱
   بدون سقف تعداد — برای فروش کالاهای ریز (مثلاً ۵۰٬۰۰۰ عدد) */
export function QtyInput({
  value,
  onChange,
  className,
  ariaLabel,
}: {
  value: number;
  onChange: (n: number) => void;
  className?: string;
  ariaLabel?: string;
}) {
  const [draft, setDraft] = useState<string | null>(null);
  const shown = toFa(draft !== null ? draft : String(value));
  return (
    <input
      type="text"
      inputMode="numeric"
      dir="ltr"
      aria-label={ariaLabel}
      value={shown}
      onChange={(e) => {
        let digits = e.target.value.replace(/[^\d۰-۹٠-٩]/g, "");
        digits = digits.replace(/[۰-۹]/g, (d) => String("۰۱۲۳۴۵۶۷۸۹".indexOf(d)));
        digits = digits.replace(/[٠-٩]/g, (d) => String("٠١٢٣٤٥٦٧٨٩".indexOf(d)));
        // بدون سقف ۹۹۹۹ — فقط یک محافظ منطقی مقابل عدد نجومی/بی‌نهایت
        if (digits.length > 8) digits = digits.slice(0, 8);
        const n = parseInt(digits === "" ? "0" : digits, 10);
        setDraft(digits);
        if (!isNaN(n) && n >= 1) onChange(n);
      }}
      onBlur={() => {
        if (draft !== null) {
          const n = parseInt(draft || "0", 10);
          onChange(isNaN(n) || n < 1 ? 1 : n);
        }
        setDraft(null);
      }}
      className={cn(
        "border-input bg-muted/60 text-center font-bold tabular-nums outline-none transition-colors focus-visible:border-ring",
        className
      )}
    />
  );
}

/* ---------- چیپ فیلتر ---------- */
export function FilterChip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "shrink-0 rounded-full px-4 py-1.5 text-xs font-bold transition-all active:scale-95",
        active
          ? "bg-primary text-primary-foreground shadow-sm"
          : "border bg-card text-muted-foreground hover:bg-accent"
      )}
    >
      {children}
    </button>
  );
}

/* ---------- برچسب نوع کالا ---------- */
export function TypeBadge({ type }: { type: "goods" | "service" }) {
  return (
    <span
      className={cn(
        "inline-flex rounded-full px-2 py-0.5 text-[10px] font-bold",
        type === "goods"
          ? "bg-[#FEF3C7] text-[#92400E] dark:bg-[rgba(217,119,6,0.16)] dark:text-[#FCD34D]"
          : "bg-tint text-brand"
      )}
    >
      {type === "goods" ? "کالا" : "خدمات"}
    </span>
  );
}
