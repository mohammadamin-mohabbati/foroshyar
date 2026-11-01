"use client";

/* صدور و ویرایش فاکتور */

import { useEffect, useMemo, useState } from "react";
import {
  Package,
  Plus,
  Search,
  Trash2,
  UserRound,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  invoiceTotals,
  nextInvoiceNumber,
  useStore,
  type DiscountType,
  type EditorDraft,
  type Invoice,
  type InvoiceItem,
  type InvoiceStatus,
} from "@/lib/store";
import { faDate, faMoney, faNum, toFa } from "@/lib/persian";
import { MoneyInput, QtyInput, ScreenHeader, TypeBadge } from "./ui-bits";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export function InvoiceEditor({
  editId,
  onBack,
  onSaved,
}: {
  editId: string | null;
  onBack: () => void;
  onSaved: (id: string, goPreview: boolean) => void;
}) {
  const invoices = useStore((s) => s.invoices);
  const products = useStore((s) => s.products);
  const customers = useStore((s) => s.customers);
  const profile = useStore((s) => s.profile);
  const saveInvoice = useStore((s) => s.saveInvoice);
  const setEditorDraft = useStore((s) => s.setEditorDraft);

  const existing = useMemo(
    () => (editId ? invoices.find((i) => i.id === editId) ?? null : null),
    [editId, invoices]
  );

  /* پیش‌نویس نیمه‌کاره (ذخیره‌ی خودکار) — فقط برای صدور جدید، یک‌بار در شروع خوانده می‌شود
     تا وقتی کاربر وسط کار برگشت (مشتری آمد، اپ بسته شد)، داده‌ها پرپره نشود */
  const [restored] = useState<EditorDraft | null>(() =>
    existing ? null : useStore.getState().editorDraft
  );

  const [number, setNumber] = useState(() => {
    if (existing) return existing.number;
    if (restored?.number) {
      const dup = useStore
        .getState()
        .invoices.some((i) => i.number === restored.number);
      if (!dup) return restored.number;
    }
    return String(nextInvoiceNumber(useStore.getState()));
  });
  const [customerName, setCustomerName] = useState(
    existing?.customerName ?? restored?.customerName ?? ""
  );
  const [customerPhone, setCustomerPhone] = useState(
    existing?.customerPhone ?? restored?.customerPhone ?? ""
  );
  const [note, setNote] = useState(existing?.note ?? restored?.note ?? "");
  const [items, setItems] = useState<InvoiceItem[]>(
    existing?.items ?? restored?.items ?? []
  );
  const [discountType, setDiscountType] = useState<DiscountType>(
    existing?.discountType ?? restored?.discountType ?? "percent"
  );
  const [discountValue, setDiscountValue] = useState(
    existing?.discountValue ?? restored?.discountValue ?? 0
  );
  const [taxEnabled, setTaxEnabled] = useState(
    existing?.taxEnabled ?? restored?.taxEnabled ?? profile.taxEnabled
  );
  const [taxRate, setTaxRate] = useState(
    existing?.taxRate ?? restored?.taxRate ?? profile.taxRate
  );
  const [status, setStatus] = useState<InvoiceStatus>(
    existing?.status ?? restored?.status ?? "pending"
  );

  /* اعلام بازیابی — یک‌بار */
  useEffect(() => {
    if (!restored) return;
    const hasContent =
      restored.items.length > 0 ||
      restored.customerName.trim() ||
      restored.customerPhone.trim() ||
      restored.note.trim();
    if (hasContent) toast.info("پیش‌نویس نیمه‌کاره شما بازیابی شد");
  }, []);

  const [search, setSearch] = useState("");
  const [manualOpen, setManualOpen] = useState(false);
  const [mName, setMName] = useState("");
  const [mPrice, setMPrice] = useState(0);
  const [mQty, setMQty] = useState(1);

  const totals = useMemo(
    () =>
      invoiceTotals({
        items,
        discountType,
        discountValue,
        taxEnabled,
        taxRate,
      }),
    [items, discountType, discountValue, taxEnabled, taxRate]
  );

  const matched = useMemo(() => {
    const q = search.trim();
    if (!q) return [];
    return products.filter((p) => p.name.includes(q)).slice(0, 5);
  }, [products, search]);

  function addProduct(pid: string) {
    const p = products.find((x) => x.id === pid);
    if (!p) return;
    setItems((prev) => {
      const idx = prev.findIndex((it) => it.name === p.name && it.price === p.price);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = { ...copy[idx], qty: copy[idx].qty + 1 };
        return copy;
      }
      return [
        ...prev,
        {
          id: crypto.randomUUID(),
          name: p.name,
          price: p.price,
          qty: 1,
          unit: p.unit || "عدد",
        },
      ];
    });
    setSearch("");
  }

  function addManual() {
    if (!mName.trim()) {
      toast.error("نام را وارد کنید");
      return;
    }
    if (mPrice <= 0) {
      toast.error("قیمت واحد را وارد کنید");
      return;
    }
    setItems((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        name: mName.trim(),
        price: mPrice,
        qty: Math.max(1, mQty),
        unit: "عدد",
      },
    ]);
    setMName("");
    setMPrice(0);
    setMQty(1);
    setManualOpen(false);
  }

  function setQty(id: string, qty: number) {
    // بدون سقف تعداد — برای فروش کالاهای ریز (مثلاً ۵۰٬۰۰۰ عدد)
    setItems((prev) =>
      prev.map((it) => (it.id === id ? { ...it, qty: Math.max(1, qty) } : it))
    );
  }

  function setPrice(id: string, price: number) {
    setItems((prev) => prev.map((it) => (it.id === id ? { ...it, price } : it)));
  }

  function removeItem(id: string) {
    setItems((prev) => prev.filter((it) => it.id !== id));
  }

  /* ذخیره‌ی خودکار پیش‌نویس — ۴۰۰ms بعد از آخرین تغییر؛
     فرم خالی پاک می‌شود تا پیش‌نویس بی‌مصرف باقی نماند */
  useEffect(() => {
    if (existing) return; // ویرایش فاکتور موجود — دست به پیش‌نویس صدور جدید نمی‌زند
    const t = setTimeout(() => {
      const empty =
        items.length === 0 &&
        !customerName.trim() &&
        !customerPhone.trim() &&
        !note.trim();
      setEditorDraft(
        empty
          ? null
          : {
              number,
              customerName,
              customerPhone,
              note,
              items,
              discountType,
              discountValue,
              taxEnabled,
              taxRate,
              status,
              savedAt: Date.now(),
            }
      );
    }, 400);
    return () => clearTimeout(t);
  }, [
    existing,
    number,
    customerName,
    customerPhone,
    note,
    items,
    discountType,
    discountValue,
    taxEnabled,
    taxRate,
    status,
    setEditorDraft,
  ]);

  function save(asStatus: InvoiceStatus, goPreview: boolean) {
    if (items.length === 0) {
      toast.error("حداقل یک کالا یا خدمات اضافه کنید");
      return;
    }
    if (!number.trim()) {
      toast.error("شماره فاکتور را وارد کنید");
      return;
    }
    const dup = invoices.some(
      (i) => i.id !== (existing?.id ?? "") && i.number === number.trim()
    );
    if (dup) {
      toast.error("این شماره فاکتور قبلاً استفاده شده است");
      return;
    }
    const inv: Invoice = {
      id: existing?.id ?? crypto.randomUUID(),
      number: number.trim(),
      customerName: customerName.trim(),
      customerPhone: customerPhone.trim(),
      items,
      discountType,
      discountValue,
      taxEnabled,
      taxRate,
      status: asStatus,
      note: note.trim(),
      createdAt: existing?.createdAt ?? Date.now(),
    };
    saveInvoice(inv);
    setEditorDraft(null); // پیش‌نویس نیمه‌کاره دیگر لازم نیست
    toast.success(goPreview ? "فاکتور صادر شد" : "پیش‌نویس ذخیره شد");
    onSaved(inv.id, goPreview);
  }

  return (
    <div className="min-h-screen bg-background">
      <ScreenHeader title={existing ? "ویرایش فاکتور" : "صدور فاکتور"} onBack={onBack} />

      <div className="space-y-4 px-4 pb-44 pt-4">
        {/* اطلاعات مشتری */}
        <section className="rounded-2xl border bg-card p-4">
          <h2 className="mb-3 text-sm font-extrabold">اطلاعات مشتری</h2>

          {customers.length > 0 && (
            <div className="mb-3 flex gap-2 overflow-x-auto no-scrollbar">
              {customers.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => {
                    setCustomerName(c.name);
                    setCustomerPhone(c.phone);
                  }}
                  className={cn(
                    "shrink-0 rounded-full border px-3 py-1.5 text-xs font-bold transition-colors",
                    customerName === c.name
                      ? "border-primary bg-tint text-brand"
                      : "bg-card text-muted-foreground hover:bg-accent"
                  )}
                >
                  {c.name}
                </button>
              ))}
            </div>
          )}

          <div className="space-y-3">
            <div className="relative">
              <UserRound className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="نام مشتری (اختیاری)"
                className="h-11 rounded-xl bg-muted/40 pr-9"
              />
            </div>
            <Input
              value={customerPhone}
              onChange={(e) =>
                setCustomerPhone(e.target.value.replace(/[^\d]/g, "").slice(0, 11))
              }
              placeholder="شماره تماس مشتری (اختیاری)"
              inputMode="tel"
              dir="ltr"
              maxLength={11}
              aria-label="شماره تماس مشتری — حداکثر ۱۱ رقم"
              className="h-11 rounded-xl bg-muted/40 text-left"
            />
            <p className="text-[10.5px] text-muted-foreground">
              حداکثر ۱۱ رقم — اگر پر کنید روی فاکتور چاپ می‌شود
            </p>
            <Textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="توضیحات فاکتور (اختیاری)"
              rows={2}
              className="resize-none rounded-xl bg-muted/40"
            />
          </div>
        </section>

        {/* افزودن کالا */}
        <section className="rounded-2xl border bg-card p-4">
          <h2 className="mb-3 text-sm font-extrabold">افزودن کالا یا خدمات</h2>

          <div className="relative">
            <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="جستجو در کالاها..."
              className="h-11 rounded-xl bg-muted/40 pr-9"
            />
          </div>

          {matched.length > 0 && (
            <div className="mt-2 space-y-1.5 rounded-xl border bg-background p-2">
              {matched.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => addProduct(p.id)}
                  className="flex w-full items-center gap-2 rounded-lg p-2 text-right transition-colors hover:bg-accent"
                >
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-tint">
                    <Package className="h-4 w-4 text-brand" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-xs font-bold">{p.name}</span>
                    <span className="text-[10px] text-muted-foreground">
                      {faMoney(p.price, profile.currency)}
                    </span>
                  </span>
                  <TypeBadge type={p.type} />
                  <Plus className="h-4 w-4 text-brand" />
                </button>
              ))}
            </div>
          )}

          <button
            type="button"
            onClick={() => setManualOpen(true)}
            className="mt-2 flex w-full items-center justify-center gap-1.5 rounded-xl border border-dashed py-2.5 text-xs font-bold text-brand transition-colors hover:bg-tint"
          >
            <Plus className="h-4 w-4" />
            افزودن دستی کالا یا خدمات
          </button>

          {/* اقلام */}
          {items.length > 0 && (
            <div className="mt-3 overflow-hidden rounded-xl border">
              <div className="flex items-center gap-2 bg-tint px-3 py-2 text-[10px] font-bold text-deep">
                <span className="w-6 text-center">ردیف</span>
                <span className="flex-1">نام کالا / خدمات</span>
                <span className="w-24 text-center">تعداد و قیمت واحد</span>
                <span className="w-16 text-center">جمع</span>
                <span className="w-6" />
              </div>
              <div className="divide-y">
                {items.map((it, idx) => (
                  <div key={it.id} className="flex items-center gap-2 bg-card px-3 py-2.5">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-muted text-[10px] font-bold text-muted-foreground">
                      {toFa(idx + 1)}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-xs font-bold">{it.name}</p>
                      <p className="text-[10px] text-muted-foreground">{toFa(it.unit)}</p>
                    </div>
                    <div className="flex w-24 shrink-0 flex-col items-center gap-1">
                      <QtyInput
                        value={it.qty}
                        onChange={(n) => setQty(it.id, n)}
                        ariaLabel={`تعداد ${it.name}`}
                        className="h-6 w-11 rounded-md text-xs"
                      />
                      <MoneyInput
                        value={it.price}
                        onChange={(n) => setPrice(it.id, n)}
                        className="h-6 w-[88px] rounded-md border-0 bg-muted/60 px-1 text-[10px]"
                      />
                    </div>
                    <span className="w-16 shrink-0 text-center text-[11px] font-extrabold tabular-nums text-brand">
                      {faNum(it.price * it.qty)}
                    </span>
                    <button
                      type="button"
                      aria-label={`حذف ${it.name}`}
                      onClick={() => removeItem(it.id)}
                      className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-destructive/70 hover:bg-destructive/10"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>

        {/* تخفیف، مالیات و جمع */}
        <section className="space-y-3 rounded-2xl border bg-card p-4">
          <h2 className="text-sm font-extrabold">تخفیف و مالیات</h2>

          <div className="flex items-center justify-between gap-2">
            <span className="text-xs text-muted-foreground">نوع تخفیف</span>
            <div className="flex overflow-hidden rounded-lg border">
              <button
                type="button"
                onClick={() => setDiscountType("percent")}
                className={cn(
                  "px-4 py-1.5 text-xs font-bold",
                  discountType === "percent" ? "bg-primary text-primary-foreground" : "bg-card"
                )}
              >
                درصد
              </button>
              <button
                type="button"
                onClick={() => setDiscountType("amount")}
                className={cn(
                  "px-4 py-1.5 text-xs font-bold",
                  discountType === "amount" ? "bg-primary text-primary-foreground" : "bg-card"
                )}
              >
                مبلغ ({profile.currency === "toman" ? "تومان" : "ریال"})
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between gap-2">
            <span className="text-xs text-muted-foreground">
              {discountType === "percent" ? "مقدار تخفیف (٪)" : "مبلغ تخفیف"}
            </span>
            <MoneyInput
              value={discountValue}
              onChange={setDiscountValue}
              placeholder="۰"
              className="h-9 w-28 rounded-lg bg-muted/40 text-left"
            />
          </div>

          <div className="flex items-center justify-between gap-2 border-t pt-3">
            <span className="text-xs text-muted-foreground">مالیات بر ارزش افزوده</span>
            <div className="flex items-center gap-2">
              <MoneyInput
                value={taxRate}
                onChange={(n) => setTaxRate(Math.min(100, n))}
                disabled={!taxEnabled}
                className="h-9 w-16 rounded-lg bg-muted/40 text-left"
              />
              <span className={cn("text-xs font-bold", !taxEnabled && "opacity-40")}>٪</span>
              <Switch checked={taxEnabled} onCheckedChange={setTaxEnabled} aria-label="فعال‌سازی مالیات" />
            </div>
          </div>

          <div className="space-y-1.5 border-t pt-3 text-xs">
            <div className="flex justify-between">
              <span className="text-muted-foreground">جمع کل</span>
              <span className="font-bold tabular-nums">
                {faMoney(totals.subtotal, profile.currency)}
              </span>
            </div>
            {totals.discount > 0 && (
              <div className="flex justify-between text-destructive">
                <span>تخفیف</span>
                <span className="font-bold tabular-nums">
                  ‎-{faMoney(totals.discount, profile.currency)}
                </span>
              </div>
            )}
            {taxEnabled && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">مالیات ({faNum(taxRate)}٪)</span>
                <span className="font-bold tabular-nums">
                  {faMoney(totals.tax, profile.currency)}
                </span>
              </div>
            )}
            <div className="flex items-center justify-between rounded-xl bg-tint p-3">
              <span className="text-sm font-extrabold text-deep">مبلغ نهایی</span>
              <span className="text-base font-extrabold tabular-nums text-brand">
                {faMoney(totals.total, profile.currency)}
              </span>
            </div>
          </div>
        </section>

        {/* وضعیت و شماره */}
        <section className="space-y-3 rounded-2xl border bg-card p-4">
          <h2 className="text-sm font-extrabold">وضعیت فاکتور</h2>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setStatus("pending")}
              className={cn(
                "h-10 rounded-xl border text-xs font-bold transition-colors",
                status === "pending"
                  ? "border-[#F59E0B] bg-[#FEF3C7] text-[#B45309] dark:bg-[rgba(217,119,6,0.16)] dark:text-[#FCD34D]"
                  : "text-muted-foreground"
              )}
            >
              در انتظار پرداخت
            </button>
            <button
              type="button"
              onClick={() => setStatus("paid")}
              className={cn(
                "h-10 rounded-xl border text-xs font-bold transition-colors",
                status === "paid"
                  ? "border-primary bg-tint text-brand"
                  : "text-muted-foreground"
              )}
            >
              پرداخت شده
            </button>
          </div>

          <div className="flex items-end gap-3 border-t pt-3">
            <div className="flex-1 space-y-1.5">
              <Label htmlFor="inv-num" className="text-xs text-muted-foreground">
                شماره فاکتور
              </Label>
              <Input
                id="inv-num"
                value={toFa(number)}
                onChange={(e) => {
                  const en = e.target.value
                    .replace(/[۰-۹]/g, (d) => String("۰۱۲۳۴۵۶۷۸۹".indexOf(d)))
                    .replace(/[^\d]/g, "");
                  setNumber(en);
                }}
                inputMode="numeric"
                dir="ltr"
                className="h-10 rounded-xl bg-muted/40 text-left font-bold"
              />
            </div>
            <div className="flex-1 space-y-1.5">
              <span className="block text-xs text-muted-foreground">تاریخ صدور</span>
              <div className="flex h-10 items-center rounded-xl bg-muted/40 px-3 text-sm font-bold tabular-nums">
                {faDate(Date.now())}
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* نوار پایانی */}
      <div className="pb-safe fixed inset-x-0 bottom-0 z-40 border-t bg-card/95 backdrop-blur">
        <div className="mx-auto flex w-full max-w-md gap-2 p-3">
          <Button
            variant="outline"
            className="h-12 flex-1 rounded-xl font-bold"
            onClick={() => save("pending", false)}
          >
            ذخیره پیش‌نویس
          </Button>
          <Button
            className="h-12 flex-1 rounded-xl font-bold shadow-md shadow-primary/25"
            onClick={() => save(status, true)}
          >
            صدور فاکتور
          </Button>
        </div>
      </div>

      {/* دیالوگ افزودن دستی */}
      <Dialog open={manualOpen} onOpenChange={setManualOpen}>
        <DialogContent aria-describedby={undefined} className="mx-auto max-w-md rounded-3xl">
          <DialogHeader>
            <DialogTitle>افزودن دستی کالا</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <Label htmlFor="m-name">نام کالا / خدمات</Label>
              <Input
                id="m-name"
                value={mName}
                onChange={(e) => setMName(e.target.value)}
                placeholder="مثلاً: هزینه نصب و راه‌اندازی"
                className="h-11 rounded-xl"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="m-price">قیمت واحد</Label>
              <MoneyInput
                value={mPrice}
                onChange={setMPrice}
                placeholder="۰"
                className="h-11 rounded-xl bg-muted/40"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="m-qty">تعداد</Label>
              <QtyInput
                value={mQty}
                onChange={setMQty}
                ariaLabel="تعداد"
                className="h-11 w-full rounded-xl text-base"
              />
            </div>
            <Button onClick={addManual} className="h-11 w-full rounded-xl font-bold">
              افزودن به فاکتور
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
