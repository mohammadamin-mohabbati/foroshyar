"use client";

/* مشتریان */

import { useMemo, useState } from "react";
import { Pencil, Plus, Search, Trash2, User, Users } from "lucide-react";
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
import { toFa } from "@/lib/persian";
import { useStore, type Customer } from "@/lib/store";
import { EmptyState } from "./ui-bits";
import { toast } from "sonner";

export function CustomersScreen() {
  const customers = useStore((s) => s.customers);
  const addCustomer = useStore((s) => s.addCustomer);
  const updateCustomer = useStore((s) => s.updateCustomer);
  const deleteCustomer = useStore((s) => s.deleteCustomer);

  const [query, setQuery] = useState("");
  const [editing, setEditing] = useState<Customer | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [deleting, setDeleting] = useState<Customer | null>(null);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");

  const list = useMemo(
    () =>
      customers.filter(
        (c) =>
          !query.trim() ||
          c.name.includes(query.trim()) ||
          c.phone.includes(query.trim())
      ),
    [customers, query]
  );

  function openNew() {
    setEditing(null);
    setName("");
    setPhone("");
    setFormOpen(true);
  }

  function openEdit(c: Customer) {
    setEditing(c);
    setName(c.name);
    setPhone(c.phone);
    setFormOpen(true);
  }

  function save() {
    if (name.trim().length < 2) {
      toast.error("نام مشتری را وارد کنید");
      return;
    }
    if (editing) {
      updateCustomer(editing.id, { name: name.trim(), phone: phone.trim() });
      toast.success("مشتری ویرایش شد");
    } else {
      addCustomer({ name: name.trim(), phone: phone.trim() });
      toast.success("مشتری اضافه شد");
    }
    setFormOpen(false);
  }

  return (
    <div className="pb-32">
      <header className="flex items-center justify-between px-4 pb-3 pt-5">
        <h1 className="text-lg font-extrabold">مشتریان</h1>
        <span className="rounded-full bg-tint px-2.5 py-1 text-[11px] font-bold text-brand">
          {toFa(customers.length)} نفر
        </span>
      </header>

      <div className="px-4">
        <div className="relative">
          <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="جستجو در مشتریان..."
            className="h-11 rounded-2xl bg-card pr-9"
          />
        </div>
      </div>

      <div className="mt-4 space-y-2.5 px-4">
        {list.length === 0 ? (
          <EmptyState
            icon={Users}
            title={customers.length === 0 ? "هنوز مشتری ثبت نشده" : "موردی یافت نشد"}
            subtitle={
              customers.length === 0
                ? "با ثبت مشتری‌ها، صدور فاکتور سریع‌تر می‌شود"
                : "عبارت دیگری را جستجو کنید"
            }
            action={
              customers.length === 0 ? (
                <Button onClick={openNew} className="rounded-xl">
                  <Plus className="h-4 w-4" />
                  افزودن اولین مشتری
                </Button>
              ) : undefined
            }
          />
        ) : (
          list.map((c) => (
            <div
              key={c.id}
              className="flex items-center gap-3 rounded-2xl border bg-card p-3"
            >
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-tint text-sm font-extrabold text-brand">
                {c.name.trim()[0] || <User className="h-5 w-5" />}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-bold">{c.name}</p>
                {c.phone && (
                  <p dir="ltr" className="mt-0.5 text-right text-xs text-muted-foreground">
                    {toFa(c.phone)}
                  </p>
                )}
              </div>
              <div className="flex shrink-0 gap-1">
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-8 w-8 text-muted-foreground"
                  aria-label={`ویرایش ${c.name}`}
                  onClick={() => openEdit(c)}
                >
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-8 w-8 text-destructive"
                  aria-label={`حذف ${c.name}`}
                  onClick={() => setDeleting(c)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))
        )}
      </div>

      {customers.length > 0 && (
        <button
          onClick={openNew}
          className="fixed bottom-24 right-1/2 z-40 flex translate-x-[calc(min(28rem,100vw)/2-1.5rem)] items-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-bold text-primary-foreground shadow-xl shadow-primary/30 active:scale-95"
        >
          <Plus className="h-5 w-5" />
          افزودن مشتری
        </button>
      )}

      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent aria-describedby={undefined} className="mx-auto max-w-md rounded-3xl">
          <DialogHeader>
            <DialogTitle>{editing ? "ویرایش مشتری" : "افزودن مشتری"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <Label htmlFor="c-name">نام مشتری</Label>
              <Input
                id="c-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="مثلاً: شرکت پارس"
                className="h-11 rounded-xl"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="c-phone">شماره تماس (اختیاری)</Label>
              <Input
                id="c-phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/[^\d]/g, ""))}
                placeholder="۰۹۱۲۳۴۵۶۷۸۹"
                inputMode="tel"
                dir="ltr"
                className="h-11 rounded-xl text-left"
              />
            </div>
            <Button onClick={save} className="h-11 w-full rounded-xl font-bold">
              {editing ? "ذخیره تغییرات" : "افزودن"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleting} onOpenChange={(o) => !o && setDeleting(null)}>
        <AlertDialogContent aria-describedby={undefined} className="mx-auto max-w-sm rounded-3xl">
          <AlertDialogHeader>
            <AlertDialogTitle>حذف مشتری</AlertDialogTitle>
            <AlertDialogDescription>
              «{deleting?.name}» حذف شود؟ فاکتورهای قبلی حفظ می‌شوند.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>انصراف</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-white hover:bg-destructive/90"
              onClick={() => {
                if (deleting) {
                  deleteCustomer(deleting.id);
                  toast.success("مشتری حذف شد");
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
