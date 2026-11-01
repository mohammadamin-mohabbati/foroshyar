"use client";

/* صفحه خانه — داشبورد */

import {
  FileText,
  Package,
  Plus,
  TrendingDown,
  TrendingUp,
  Users,
} from "lucide-react";
import { faMoney, faNum, isSameDay } from "@/lib/persian";
import {
  invoiceTotals,
  useStore,
  type Screen,
  type TabId,
} from "@/lib/store";
import { StatusBadge } from "./ui-bits";
import type { Invoice } from "@/lib/store";
import { cn } from "@/lib/utils";

export function HomeScreen({
  onTab,
  onNewInvoice,
  onOpenInvoice,
}: {
  onTab: (t: TabId | Screen) => void;
  onNewInvoice: () => void;
  onOpenInvoice: (id: string) => void;
}) {
  const profile = useStore((s) => s.profile);
  const invoices = useStore((s) => s.invoices);

  const now = new Date();
  const yesterday = new Date(now.getTime() - 86400000);

  const todayInvoices = invoices.filter((i) => isSameDay(new Date(i.createdAt), now));
  const yesterdayInvoices = invoices.filter((i) => isSameDay(new Date(i.createdAt), yesterday));

  const sumOf = (list: Invoice[]) =>
    list.reduce((acc, inv) => acc + invoiceTotals(inv).total, 0);

  const todaySum = sumOf(todayInvoices);
  const yesterdaySum = sumOf(yesterdayInvoices);
  const diffPercent =
    yesterdaySum > 0 ? Math.round(((todaySum - yesterdaySum) / yesterdaySum) * 100) : null;

  const recents = [...invoices]
    .sort((a, b) => b.createdAt - a.createdAt)
    .slice(0, 3);

  const initial = profile.name.trim() ? profile.name.trim()[0] : "ف";

  return (
    <div className="pb-28">
      {/* هدر گرادیانی */}
      <header className="rounded-b-[2rem] bg-gradient-to-b from-deep to-brand px-5 pb-14 pt-6 text-white">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-full border-2 border-white/40 bg-white/15">
            {profile.avatar ? (
              <img src={profile.avatar} alt="پروفایل" className="h-full w-full object-cover" />
            ) : (
              <span className="text-lg font-extrabold">{initial}</span>
            )}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-base font-bold">سلام، {profile.name}</p>
            <p className="truncate text-xs text-white/75">{profile.businessName}</p>
          </div>
        </div>
      </header>

      {/* کارت آمار امروز */}
      <section aria-label="آمار امروز" className="-mt-10 px-4">
        <div className="flex items-center justify-between gap-2 rounded-2xl border bg-card p-4 shadow-lg shadow-black/5">
          <div className="flex items-center gap-3">
            <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-tint">
              <FileText className="h-6 w-6 text-brand" />
            </span>
            <div>
              <p className="text-xs text-muted-foreground">فاکتور امروز</p>
              <p className="text-lg font-extrabold text-brand">
                {faMoney(todaySum, profile.currency)}
              </p>
              <p className="text-[11px] text-muted-foreground">
                {faNum(todayInvoices.length)} فاکتور
              </p>
            </div>
          </div>
          {diffPercent !== null ? (
            <span
              className={cn(
                "flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-bold",
                diffPercent >= 0
                  ? "bg-[#E6F4EF] text-[#0F8A6B] dark:bg-[rgba(20,163,133,0.16)] dark:text-[#7DD3B9]"
                  : "bg-[#FEE2E2] text-[#B91C1C] dark:bg-[rgba(239,68,68,0.16)] dark:text-[#FCA5A5]"
              )}
            >
              {diffPercent >= 0 ? (
                <TrendingUp className="h-3.5 w-3.5" />
              ) : (
                <TrendingDown className="h-3.5 w-3.5" />
              )}
              نسبت به دیروز {faNum(Math.abs(diffPercent))}٪
            </span>
          ) : (
            <span className="rounded-full bg-tint px-2.5 py-1 text-[11px] font-bold text-brand">
              {faNum(yesterdayInvoices.length)} فاکتور دیروز
            </span>
          )}
        </div>
      </section>

      {/* میان‌برها */}
      <section aria-label="میان‌برها" className="mt-4 grid grid-cols-2 gap-3 px-4">
        <button
          onClick={onNewInvoice}
          className="flex h-24 flex-col items-center justify-center gap-2 rounded-2xl bg-primary text-primary-foreground shadow-md shadow-primary/25 transition-transform active:scale-[0.97]"
        >
          <Plus className="h-7 w-7 stroke-[2.5]" />
          <span className="text-sm font-bold">صدور فاکتور</span>
        </button>
        <QuickAction icon={FileText} label="فاکتورهای من" onClick={() => onTab("invoices")} />
        <QuickAction icon={Users} label="مشتریان" onClick={() => onTab("customers")} />
        <QuickAction icon={Package} label="کالاها و خدمات" onClick={() => onTab("products")} />
      </section>

      {/* آخرین فاکتورها */}
      <section aria-label="آخرین فاکتورها" className="mt-6 px-4">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-extrabold">آخرین فاکتورها</h2>
          {invoices.length > 0 && (
            <button
              onClick={() => onTab("invoices")}
              className="text-xs font-bold text-brand hover:underline"
            >
              مشاهده همه
            </button>
          )}
        </div>

        {recents.length === 0 ? (
          <div className="rounded-2xl border border-dashed bg-card p-6 text-center">
            <FileText className="mx-auto h-8 w-8 text-muted-foreground/60" />
            <p className="mt-2 text-sm font-bold">هنوز فاکتوری ثبت نشده</p>
            <p className="mt-1 text-xs text-muted-foreground">
              اولین فاکتور خود را صادر کنید
            </p>
            <button
              onClick={onNewInvoice}
              className="mt-3 rounded-full bg-primary px-4 py-2 text-xs font-bold text-primary-foreground active:scale-95"
            >
              صدور فاکتور
            </button>
          </div>
        ) : (
          <div className="space-y-2.5">
            {recents.map((inv) => (
              <RecentCard key={inv.id} inv={inv} onOpen={() => onOpenInvoice(inv.id)} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function QuickAction({
  icon: Icon,
  label,
  onClick,
}: {
  icon: typeof FileText;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="flex h-24 flex-col items-center justify-center gap-2 rounded-2xl border bg-card transition-transform hover:border-primary/40 active:scale-[0.97]"
    >
      <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-tint">
        <Icon className="h-5 w-5 text-brand" />
      </span>
      <span className="text-sm font-bold">{label}</span>
    </button>
  );
}

function RecentCard({ inv, onOpen }: { inv: Invoice; onOpen: () => void }) {
  const currency = useStore((s) => s.profile.currency);
  const total = invoiceTotals(inv).total;
  const date = new Intl.DateTimeFormat("fa-IR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date(inv.createdAt));

  return (
    <button
      onClick={onOpen}
      className="flex w-full items-center gap-3 rounded-2xl border bg-card p-3 text-right transition-colors hover:border-primary/40 active:scale-[0.99]"
    >
      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-tint">
        <FileText className="h-5 w-5 text-brand" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm font-bold">
          فاکتور #{inv.number ? faNum(inv.number) : "—"}
        </span>
        <span className="mt-0.5 flex items-center gap-2 text-[11px] text-muted-foreground">
          <span className="truncate">{inv.customerName || "مشتری عمومی"}</span>
          <span dir="ltr">{date}</span>
        </span>
      </span>
      <span className="flex shrink-0 flex-col items-end gap-1">
        <span className="text-sm font-extrabold text-brand">{faMoney(total, currency)}</span>
        <StatusBadge status={inv.status} />
      </span>
    </button>
  );
}
