"use client";

/* کالاها و خدمات */

import { useMemo, useState } from "react";
import { Package, Pencil, Plus, Search, Trash2 } from "lucide-react";
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
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { faMoney, toFa } from "@/lib/persian";
import { useStore, type Product, type ProductType } from "@/lib/store";
import { EmptyState, FilterChip, MoneyInput, TypeBadge } from "./ui-bits";
import { toast } from "sonner";

const UNITS = ["عدد", "کیلوگرم", "متر", "متر مربع", "لیتر", "بسته", "ساعت", "نفر"];

export function ProductsScreen({ onNewInvoice }: { onNewInvoice: () => void }) {
  const products = useStore((s) => s.products);
  const currency = useStore((s) => s.profile.currency);
  const addProduct = useStore((s) => s.addProduct);
  const updateProduct = useStore((s) => s.updateProduct);
  const deleteProduct = useStore((s) => s.deleteProduct);

  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<"all" | ProductType>("all");
  const [editing, setEditing] = useState<Product | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [deleting, setDeleting] = useState<Product | null>(null);

  const [name, setName] = useState("");
  const [price, setPrice] = useState(0);
  const [unit, setUnit] = useState("عدد");
  const [type, setType] = useState<ProductType>("goods");

  const list = useMemo(() => {
    return products.filter((p) => {
      const okType = filter === "all" || p.type === filter;
      const okQuery = !query.trim() || p.name.includes(query.trim());
      return okType && okQuery;
    });
  }, [products, filter, query]);

  function openNew() {
    setEditing(null);
    setName("");
    setPrice(0);
    setUnit("عدد");
    setType("goods");
    setFormOpen(true);
  }

  function openEdit(p: Product) {
    setEditing(p);
    setName(p.name);
    setPrice(p.price);
    setUnit(p.unit || "عدد");
    setType(p.type);
    setFormOpen(true);
  }

  function save() {
    if (name.trim().length < 1) {
      toast.error("نام کالا یا خدمات را وارد کنید");
      return;
    }
    if (price <= 0) {
      toast.error("قیمت را وارد کنید");
      return;
    }
    const data = { name: name.trim(), price, unit, type };
    if (editing) {
      updateProduct(editing.id, data);
      toast.success("کالا ویرایش شد");
    } else {
      addProduct(data);
      toast.success("کالا اضافه شد");
    }
    setFormOpen(false);
  }

  return (
    <div className="pb-32">
      <header className="flex items-center justify-between px-4 pb-3 pt-5">
        <h1 className="text-lg font-extrabold">کالاها و خدمات</h1>
        <span className="rounded-full bg-tint px-2.5 py-1 text-[11px] font-bold text-brand">
          {toFa(products.length)} مورد
        </span>
      </header>

      <div className="space-y-3 px-4">
        <div className="relative">
          <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="جستجو در کالاها و خدمات..."
            className="h-11 rounded-2xl bg-card pr-9"
          />
        </div>

        <div className="flex gap-2 overflow-x-auto no-scrollbar">
          <FilterChip active={filter === "all"} onClick={() => setFilter("all")}>
            همه
          </FilterChip>
          <FilterChip active={filter === "goods"} onClick={() => setFilter("goods")}>
            کالا
          </FilterChip>
          <FilterChip active={filter === "service"} onClick={() => setFilter("service")}>
            خدمات
          </FilterChip>
        </div>
      </div>

      <div className="mt-4 space-y-2.5 px-4">
        {list.length === 0 ? (
          <EmptyState
            icon={Package}
            title={products.length === 0 ? "هنوز کالایی ثبت نشده" : "موردی یافت نشد"}
            subtitle={
              products.length === 0
                ? "برای صدور سریع فاکتور، کالاها و خدمات خود را اینجا ثبت کنید"
                : "عبارت دیگری را جستجو کنید یا فیلتر را تغییر دهید"
            }
            action={
              products.length === 0 ? (
                <Button onClick={openNew} className="rounded-xl">
                  <Plus className="h-4 w-4" />
                  افزودن اولین کالا
                </Button>
              ) : undefined
            }
          />
        ) : (
          list.map((p) => (
            <div
              key={p.id}
              className="flex items-center gap-3 rounded-2xl border bg-card p-3"
            >
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-tint">
                <Package className="h-5 w-5 text-brand" />
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="truncate text-sm font-bold">{p.name}</p>
                  <TypeBadge type={p.type} />
                </div>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {faMoney(p.price, currency)}
                  {p.unit && p.unit !== "عدد" ? ` / ${toFa(p.unit)}` : ""}
                </p>
              </div>
              <div className="flex shrink-0 gap-1">
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-8 w-8 text-muted-foreground"
                  aria-label={`ویرایش ${p.name}`}
                  onClick={() => openEdit(p)}
                >
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-8 w-8 text-destructive"
                  aria-label={`حذف ${p.name}`}
                  onClick={() => setDeleting(p)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* دکمه شناور افزودن */}
      {products.length > 0 && (
        <button
          onClick={openNew}
          className="fixed bottom-24 right-1/2 z-40 flex translate-x-[calc(min(28rem,100vw)/2-1.5rem)] items-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-bold text-primary-foreground shadow-xl shadow-primary/30 active:scale-95"
        >
          <Plus className="h-5 w-5" />
          افزودن کالا
        </button>
      )}

      {/* دیالوگ افزودن/ویرایش */}      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent aria-describedby={undefined} className="mx-auto max-w-md rounded-3xl">
          <DialogHeader>
            <DialogTitle>{editing ? "ویرایش کالا" : "افزودن کالا یا خدمات"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <Label htmlFor="p-name">نام کالا / خدمات</Label>
              <Input
                id="p-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="مثلاً: تلویزیون هوشمند"
                className="h-11 rounded-xl"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="p-price">قیمت (تومان/ریال طبق تنظیمات)</Label>
              <MoneyInput
                value={price}
                onChange={setPrice}
                placeholder="۰"
                className="h-11 rounded-xl bg-muted/40 text-base"
              />
            </div>

            <div className="space-y-1.5">
              <Label>نوع</Label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setType("goods")}
                  className={`h-10 rounded-xl border text-sm font-bold transition-colors ${
                    type === "goods"
                      ? "border-primary bg-tint text-brand"
                      : "bg-card text-muted-foreground"
                  }`}
                >
                  کالا
                </button>
                <button
                  type="button"
                  onClick={() => setType("service")}
                  className={`h-10 rounded-xl border text-sm font-bold transition-colors ${
                    type === "service"
                      ? "border-primary bg-tint text-brand"
                      : "bg-card text-muted-foreground"
                  }`}
                >
                  خدمات
                </button>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="p-unit">واحد</Label>
              <div className="flex flex-wrap gap-2">
                {UNITS.map((u) => (
                  <button
                    key={u}
                    type="button"
                    onClick={() => setUnit(u)}
                    className={`rounded-full border px-3 py-1.5 text-xs font-bold transition-colors ${
                      unit === u
                        ? "border-primary bg-tint text-brand"
                        : "bg-card text-muted-foreground"
                    }`}
                  >
                    {u}
                  </button>
                ))}
              </div>
            </div>

            <Button onClick={save} className="h-11 w-full rounded-xl font-bold">
              {editing ? "ذخیره تغییرات" : "افزودن"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* تأیید حذف */}
      <AlertDialog open={!!deleting} onOpenChange={(o) => !o && setDeleting(null)}>
        <AlertDialogContent aria-describedby={undefined} className="mx-auto max-w-sm rounded-3xl">
          <AlertDialogHeader>
            <AlertDialogTitle>حذف کالا</AlertDialogTitle>
            <AlertDialogDescription>
              «{deleting?.name}» حذف شود؟ فاکتورهای قبلی تغییری نمی‌کنند.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>انصراف</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-white hover:bg-destructive/90"
              onClick={() => {
                if (deleting) {
                  deleteProduct(deleting.id);
                  toast.success("کالا حذف شد");
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
