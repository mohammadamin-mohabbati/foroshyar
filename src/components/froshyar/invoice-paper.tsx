"use client";

/* سند فاکتور — طرح حرفه‌ای سربرگ‌دار، قابل چاپ و خروجی گرفتن */

import { forwardRef } from "react";
import { Stamp } from "lucide-react";
import {
  faDate,
  faMoney,
  faNum,
  moneyToPersianWords,
  toFa,
} from "@/lib/persian";
import {
  formatAccountNumber,
  formatCardNumber,
  formatSheba,
} from "@/lib/format";
import { invoiceTotals, useStore, type ExportOrientation, type Invoice } from "@/lib/store";
import { cn } from "@/lib/utils";

export const InvoicePaper = forwardRef<
  HTMLDivElement,
  { invoice: Invoice; orientation?: ExportOrientation }
>(function InvoicePaper({ invoice, orientation = "portrait" }, ref) {
  const profile = useStore((s) => s.profile);
  const totals = invoiceTotals(invoice);
  const currencyLabel = profile.currency === "toman" ? "تومان" : "ریال";
  const paid = invoice.status === "paid";
  const sealImage = profile.stamp || profile.signature;
  const isLandscape = orientation === "landscape";

  // متن‌های پانویس — هر دو از تنظیمات قابل تغییرند؛ خالی = نمایش داده نمی‌شود
  const thanks = (profile.footerThanks || "").trim();
  const extraNote = (profile.footerNote || "").trim();

    // نمایش کامل شماره‌ها — شبا با IR ثابت، بدون بریدگی
    const payRows: { label: string; value: string; ltr: boolean }[] = (
      [
        { label: "شماره کارت", value: formatCardNumber(profile.cardNumber), ltr: true },
        { label: "شماره شبا", value: formatSheba(profile.sheba), ltr: true },
        { label: "شماره حساب", value: formatAccountNumber(profile.accountNumber), ltr: true },
        { label: "نام بانک", value: profile.bankName, ltr: false },
        { label: "صاحب حساب", value: profile.accountHolder, ltr: false },
      ] as { label: string; value: string; ltr: boolean }[]
    ).filter((r) => r.value && r.value.trim());

    return (
      <div
        ref={ref}
        id="invoice-paper"
        className="overflow-hidden rounded-2xl border border-[#E3EAE7] bg-white text-[#1E293B] shadow-xl shadow-black/10"
        style={{ fontSize: "13px" }}
      >
        {/* سربرگ مرکزی — لوگو و نام کسب‌وکار */}
        <div className="px-6 pb-3.5 pt-6 text-center">
          {profile.logo && (
            <img
              src={profile.logo}
              alt="لوگو"
              className="mx-auto h-16 w-16 rounded-xl object-contain"
            />
          )}
          <p className="mt-2 text-lg font-black leading-snug text-[var(--deep)]">
            {profile.businessName || "نام کسب‌وکار"}
          </p>
          {(profile.businessAddress || profile.businessPhone) && (
            <p className="mt-1 text-[10px] leading-5 text-[#64748B]">
              {[
                profile.businessAddress,
                profile.businessPhone && `تلفن: ${toFa(profile.businessPhone)}`,
              ]
                .filter(Boolean)
                .join(" — ")}
            </p>
          )}
        </div>

        {/* نوار عنوان با فلش‌های تزئینی */}
        <div className="flex items-center justify-between gap-2 bg-gradient-to-l from-[var(--deep)] to-[var(--brand)] px-4 py-2.5 text-white">
          <p className="text-[13px] font-extrabold">فاکتور فروش کالا / خدمات</p>
          <Chevrons />
          <span className="shrink-0 rounded-full bg-white/15 px-2.5 py-0.5 text-[10px] font-bold">
            صفحه ۱ از ۱
          </span>
        </div>

        {/* اطلاعات فاکتور */}
        <div className="grid grid-cols-2 gap-x-5 gap-y-2.5 px-5 py-4">
          <div className="space-y-2.5">
            <InfoRow
              label="طرف حساب"
              value={invoice.customerName || "مشتری عمومی"}
              strong
            />
            <InfoRow
              label="شماره تماس"
              value={invoice.customerPhone ? toFa(invoice.customerPhone) : "—"}
            />
            <InfoRow label="واحد پول" value={currencyLabel} />
          </div>
          <div className="space-y-2.5">
            <InfoRow
              label="شماره فاکتور"
              value={invoice.number ? toFa(invoice.number) : "—"}
              strong
            />
            <InfoRow label="تاریخ فاکتور" value={faDate(invoice.createdAt)} strong />
            <InfoRow
              label="وضعیت"
              value={paid ? "تسویه شده" : "در انتظار تسویه"}
              badge={paid}
            />
          </div>
        </div>

        {/* جدول اقلام */}
        <div className="px-4">
          <table className="w-full border-collapse overflow-hidden rounded-xl border border-[#E3EAE7] text-[11px]">
            <thead>
              <tr className="bg-[var(--brand)] text-white">
                <th className="w-8 px-1 py-2.5 font-bold">ردیف</th>
                <th className="px-2 py-2.5 text-right font-bold">شرح کالا / خدمات</th>
                <th className="w-16 px-1 py-2.5 font-bold">مقدار</th>
                <th className="w-24 px-1 py-2.5 font-bold">
                  مبلغ واحد
                  <span className="block text-[8.5px] font-medium opacity-85">
                    ({currencyLabel})
                  </span>
                </th>
                <th className="w-24 px-1 py-2.5 font-bold">
                  مبلغ کل
                  <span className="block text-[8.5px] font-medium opacity-85">
                    ({currencyLabel})
                  </span>
                </th>
              </tr>
            </thead>
            <tbody>
              {invoice.items.map((it, idx) => (
                <tr
                  key={it.id}
                  className={cn(idx % 2 === 1 ? "bg-[#F6FAF8]" : "bg-white")}
                >
                  <td className="px-1 py-2.5 text-center tabular-nums text-[#64748B]">
                    {toFa(idx + 1)}
                  </td>
                  <td className="px-2 py-2.5 text-right [overflow-wrap:anywhere]">
                    <span className="font-bold">{it.name}</span>
                  </td>
                  <td className="px-1 py-2.5 text-center tabular-nums">
                    {faNum(it.qty)}
                    {it.unit ? ` ${it.unit}` : ""}
                  </td>
                  <td className="px-1 py-2.5 text-center tabular-nums">
                    {faNum(it.price)}
                  </td>
                  <td className="px-1 py-2.5 text-center font-bold tabular-nums">
                    {faNum(it.price * it.qty)}
                  </td>
                </tr>
              ))}
              {invoice.items.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-2 py-4 text-center text-[#94A3B8]">
                    ردیفی ثبت نشده است
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* پرداخت، توضیحات و جمع‌ها — در حالت افقی کنار هم دو ستونه */}
        <div
          className={cn(
            "grid px-5 pt-3",
            isLandscape ? "grid-cols-2 items-start gap-4" : "grid-cols-1 gap-3",
            !isLandscape && "mb-4"
          )}
        >
          {(payRows.length > 0 || invoice.note) && (
            <div className="space-y-3">
              {payRows.length > 0 && (
                <div className="rounded-2xl border border-[#E3EAE7] p-3.5">
                  <p className="mb-2 border-b border-dashed border-[#DCE5E2] pb-1.5 text-[10px] font-extrabold text-[var(--deep)]">
                    اطلاعات پرداخت
                  </p>
                  <div className="space-y-1.5 text-[10px]">
                    {payRows.map((row) => (
                      <div key={row.label} className="flex items-start justify-between gap-3">
                        <span className="shrink-0 pt-px text-[#64748B]">{row.label}:</span>
                        <span
                          dir={row.ltr ? "ltr" : "rtl"}
                          className="min-w-0 whitespace-nowrap text-left font-bold leading-5"
                        >
                          {row.ltr ? toFa(row.value) : row.value}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {invoice.note && (
                <div className="rounded-2xl border border-[#E3EAE7] p-3.5">
                  <p className="mb-2 border-b border-dashed border-[#DCE5E2] pb-1.5 text-[10px] font-extrabold text-[var(--deep)]">
                    توضیحات
                  </p>
                  <p className="text-[10px] leading-6">{invoice.note}</p>
                </div>
              )}
            </div>
          )}

          {/* جمع‌ها */}
          <div
            className={cn(
              "space-y-1.5 rounded-2xl border border-[#E3EAE7] p-3.5 text-[11px]",
              isLandscape && !(payRows.length > 0 || invoice.note) && "col-span-2"
            )}
          >
          <TotalRow
            label="جمع کل اقلام"
            value={faMoney(totals.subtotal, profile.currency)}
          />
          {totals.discount > 0 && (
            <TotalRow
              label="تخفیف"
              value={faMoney(totals.discount, profile.currency)}
              red
            />
          )}
          {invoice.taxEnabled && (
            <TotalRow
              label={`مالیات بر ارزش افزوده (${faNum(invoice.taxRate)}٪)`}
              value={faMoney(totals.tax, profile.currency)}
            />
          )}
          <div className="mt-2 flex items-center justify-between rounded-xl bg-gradient-to-l from-[var(--deep)] to-[var(--brand)] px-4 py-3 text-white shadow-sm">
            <span className="text-[12px] font-extrabold">مبلغ قابل پرداخت</span>
            <span className="text-[13px] font-black tabular-nums">
              {faMoney(totals.total, profile.currency)}
            </span>
          </div>
          <div className="rounded-xl bg-[#F6FAF8] px-3.5 py-2.5 text-[10.5px] leading-6">
            <span className="text-[#64748B]">مبلغ به حروف: </span>
            <span className="font-bold text-[var(--deep)]">
              {moneyToPersianWords(totals.total, profile.currency)} تمام
            </span>
          </div>
          </div>
        </div>

        {/* مهر و امضا — کادر واحد؛ در حالت افقی به سمت چپ می‌رود */}
        <div className={cn(
          "flex flex-col px-5 pb-4 pt-1",
          isLandscape ? "items-end" : "items-center"
        )}>
          <div className="relative flex h-24 w-48 items-center justify-center rounded-xl border-2 border-dashed border-[#C9D6D1] bg-[#FAFCFB]">
            <span className="absolute -top-[9px] right-1/2 translate-x-1/2 rounded-full border border-[#E3EAE7] bg-white px-2.5 py-px text-[9px] font-bold text-[#94A3B8]">
              مهر و امضا
            </span>
            {sealImage ? (
              <img
                src={sealImage}
                alt="مهر و امضا"
                className="max-h-[88px] max-w-[176px] rounded-lg object-contain p-2"
              />
            ) : (
              <Stamp className="h-8 w-8 text-[#D5DFDB]" />
            )}
          </div>
        </div>

        {/* پانویس — متن تشکر قابل تغییر از تنظیمات + متن دلخواه اضافه؛ هر دو خالی = بدون پانویس */}
        {(thanks || extraNote) && (
          <div className="border-t border-dashed border-[#DCE5E2] px-5 py-3 text-center text-[10px] text-[#64748B]">
            {thanks && (
              <>
                {thanks}
                {profile.businessName.trim() && (
                  <>
                    {" — "}
                    <span className="font-bold text-[var(--deep)]">{profile.businessName}</span>
                  </>
                )}
              </>
            )}
            {extraNote && (
              <span className="text-[#475569]">
                {(thanks || profile.businessName.trim()) && " — "}
                {extraNote}
              </span>
            )}
          </div>
        )}
        <div className="h-2 bg-gradient-to-l from-[var(--deep)] to-[var(--brand)]" />
      </div>
    );
  }
);

/* فلش‌های تزئینی نوار عنوان (سبک فاکتورهای رسمی) */
function Chevrons() {
  return (
    <svg
      viewBox="0 0 64 14"
      className="h-3.5 w-16 shrink-0 opacity-90"
      fill="none"
      aria-hidden="true"
    >
      <path d="M14 0 L6 7 L14 14 Z" fill="white" />
      <path d="M28 0 L20 7 L28 14 Z" fill="white" opacity="0.75" />
      <path d="M42 0 L34 7 L42 14 Z" fill="white" opacity="0.5" />
      <path d="M56 0 L48 7 L56 14 Z" fill="white" opacity="0.3" />
    </svg>
  );
}

function InfoRow({
  label,
  value,
  strong,
  badge,
}: {
  label: string;
  value: string;
  strong?: boolean;
  badge?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-2">
      <span className="shrink-0 text-[10px] text-[#64748B]">{label}:</span>
      {badge !== undefined ? (
        <span
          className={cn(
            "rounded-full px-2 py-0.5 text-[9.5px] font-bold",
            badge
              ? "bg-[var(--tint)] text-[var(--deep)]"
              : "bg-amber-50 text-amber-700"
          )}
        >
          {value}
        </span>
      ) : (
        <span
          className={cn(
            "min-w-0 truncate text-[11px]",
            strong ? "font-extrabold text-[#0F172A]" : "font-medium"
          )}
        >
          {value}
        </span>
      )}
    </div>
  );
}

function TotalRow({
  label,
  value,
  red,
}: {
  label: string;
  value: string;
  red?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-2">
      <span className="text-[#64748B]">{label}:</span>
      <span
        className={cn(
          "font-bold tabular-nums",
          red ? "text-[#DC2626]" : "text-[#0F172A]"
        )}
      >
        {red ? `‎-${value}` : value}
      </span>
    </div>
  );
}
