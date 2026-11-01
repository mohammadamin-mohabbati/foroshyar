"use client";

/* فاکتورهای من */

import { useMemo, useState } from "react";
import {
  CheckCircle2,
  Clock3,
  FileText,
  MoreVertical,
  Pencil,
  Plus,
  Search,
  Trash2,
} from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { faMoney, faNum } from "@/lib/persian";
import {
  invoiceTotals,
  useStore,
  type Invoice,
  type InvoiceStatus,
} from "@/lib/store";
import { EmptyState, FilterChip, StatusBadge } from "./ui-bits";
import { toast } from "sonner";

type Filter = "all" | InvoiceStatus;

export function InvoicesScreen({
  onNewInvoice,
  onOpenInvoice,
  onEditInvoice,
}: {
  onNewInvoice: () => void;
  onOpenInvoice: (id: string) => void;
  onEditInvoice: (id: string) => void;
}) {
  const invoices = useStore((s) => s.invoices);
  const currency = useStore((s) => s.profile.currency);
  const saveInvoice = useStore((s) => s.saveInvoice);
  const deleteInvoice = useStore((s) => s.deleteInvoice);

  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<Filter>("all");
  const [deleting, setDeleting] = useState<Invoice | null>(null);

  const list = useMemo(() => {
    const q = query.trim();
    return [...invoices]
      .filter((i) => {
        const okFilter = filter === "all" || i.status === filter;
        const okQuery =
          !q ||
          i.number.includes(q) ||
          (i.customerName || "").includes(q) ||
          (i.customerPhone || "").includes(q);
        return okFilter && okQuery;
      })
      .sort((a, b) => b.createdAt - a.createdAt);
  }, [invoices, filter, query]);

  function toggleStatus(inv: Invoice) {
    saveInvoice({ ...inv, status: inv.status === "paid" ? "pending" : "paid" });
    toast.success(
      inv.status === "paid" ? "به «در انتظار پرداخت» تغییر کرد" : "پرداخت شد"
    );
  }

  return (
    <div className="pb-32">
      <header className="flex items-center justify-between px-4 pb-3 pt-5">
        <h1 className="text-lg font-extrabold">فاکتورهای من</h1>
        <span className="rounded-full bg-tint px-2.5 py-1 text-[11px] font-bold text-brand">
          {faNum(invoices.length)} فاکتور
        </span>
      </header>

      <div className="space-y-3 px-4">
        <div className="relative">
          <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="جستجو در فاکتورها..."
            className="h-11 rounded-2xl bg-card pr-9"
          />
        </div>

        <div className="flex gap-2 overflow-x-auto no-scrollbar">
          <FilterChip active={filter === "all"} onClick={() => setFilter("all")}>
            همه
          </FilterChip>
          <FilterChip active={filter === "paid"} onClick={() => setFilter("paid")}>
            پرداخت شده
          </FilterChip>
          <FilterChip active={filter === "pending"} onClick={() => setFilter("pending")}>
            در انتظار پرداخت
          </FilterChip>
        </div>
      </div>

      <div className="mt-4 space-y-2.5 px-4">
        {list.length === 0 ? (
          <EmptyState
            icon={FileText}
            title={invoices.length === 0 ? "هنوز فاکتوری ثبت نشده" : "موردی یافت نشد"}
            subtitle={
              invoices.length === 0
                ? "اولین فاکتور خود را صادر کنید"
                : "عبارت دیگری را جستجو کنید یا فیلتر را تغییر دهید"
            }
            action={
              invoices.length === 0 ? (
                <button
                  onClick={onNewInvoice}
                  className="rounded-full bg-primary px-5 py-2.5 text-xs font-bold text-primary-foreground active:scale-95"
                >
                  صدور فاکتور
                </button>
              ) : undefined
            }
          />
        ) : (
          list.map((inv) => {
            const total = invoiceTotals(inv).total;
            const date = new Intl.DateTimeFormat("fa-IR", {
              year: "numeric",
              month: "2-digit",
              day: "2-digit",
            }).format(new Date(inv.createdAt));

            return (
              <div
                key={inv.id}
                className="flex items-center gap-3 rounded-2xl border bg-card p-3 transition-colors hover:border-primary/40"
              >
                <button
                  onClick={() => onOpenInvoice(inv.id)}
                  className="flex min-w-0 flex-1 items-center gap-3 text-right"
                >
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-tint">
                    <FileText className="h-5 w-5 text-brand" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-bold">
                      فاکتور #{inv.number ? faNum(inv.number) : "—"}
                    </span>
                    <span className="mt-0.5 block truncate text-[11px] text-muted-foreground">
                      {inv.customerName || "مشتری عمومی"}
                      <span className="mx-1">•</span>
                      <span dir="ltr">{date}</span>
                    </span>
                  </span>
                  <span className="flex shrink-0 flex-col items-end gap-1">
                    <span className="text-sm font-extrabold tabular-nums text-brand">
                      {faMoney(total, currency)}
                    </span>
                    <StatusBadge status={inv.status} />
                  </span>
                </button>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button
                      aria-label="گزینه‌های فاکتور"
                      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-muted-foreground hover:bg-accent"
                    >
                      <MoreVertical className="h-4 w-4" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-44">
                    <DropdownMenuItem onClick={() => onEditInvoice(inv.id)}>
                      <Pencil className="h-4 w-4" /> ویرایش
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => toggleStatus(inv)}>
                      {inv.status === "paid" ? (
                        <>
                          <Clock3 className="h-4 w-4" /> در انتظار پرداخت
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="h-4 w-4" /> پرداخت شد
                        </>
                      )}
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="text-destructive focus:text-destructive"
                      onClick={() => setDeleting(inv)}
                    >
                      <Trash2 className="h-4 w-4" /> حذف
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            );
          })
        )}
      </div>

      {/* دکمه شناور صدور */}
      <button
        onClick={onNewInvoice}
        className="fixed bottom-24 right-1/2 z-40 flex translate-x-[calc(min(28rem,100vw)/2-1.5rem)] items-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-bold text-primary-foreground shadow-xl shadow-primary/30 active:scale-95"
      >
        <Plus className="h-5 w-5" />
        صدور فاکتور
      </button>

      <AlertDialog open={!!deleting} onOpenChange={(o) => !o && setDeleting(null)}>
        <AlertDialogContent aria-describedby={undefined} className="mx-auto max-w-sm rounded-3xl">
          <AlertDialogHeader>
            <AlertDialogTitle>حذف فاکتور</AlertDialogTitle>
            <AlertDialogDescription>
              فاکتور شماره {deleting?.number ? faNum(deleting.number) : ""} حذف شود؟ این
              عملیات قابل بازگشت نیست.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>انصراف</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-white hover:bg-destructive/90"
              onClick={() => {
                if (deleting) {
                  deleteInvoice(deleting.id);
                  toast.success("فاکتور حذف شد");
                }
                setDeleting(null);
              }}
            >
              حذف
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
