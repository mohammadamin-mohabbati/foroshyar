"use client";

/* تنظیمات — پروفایل، عکس‌ها، تم، واحد پول، مالیات، شماره‌گذاری */

import { useState } from "react";
import {
  Check,
  CloudOff,
  CreditCard,
  Moon,
  Palette,
  Receipt,
  Sun,
  Trash2,
  UserRound,
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
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { faNum } from "@/lib/persian";
import { digitsOnly } from "@/lib/format";
import {
  nextInvoiceNumber,
  THEMES,
  useStore,
  type ThemeId,
} from "@/lib/store";
import { AvatarPicker, ImagePickRow, MoneyInput, ScreenHeader } from "./ui-bits";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export function SettingsScreen({ onBack }: { onBack: () => void }) {
  const profile = useStore((s) => s.profile);
  const invoices = useStore((s) => s.invoices);
  const updateProfile = useStore((s) => s.updateProfile);
  const resetAll = useStore((s) => s.resetAll);
  const [resetOpen, setResetOpen] = useState(false);

  const nextNum = nextInvoiceNumber({ invoices, profile });

  // شماره تماس — دقیقاً ۱۱ رقم؛ بیشتر از ۱۱ رقم تایپ نمی‌شود و کمتر خطا می‌گیرد
  const phoneDigits = digitsOnly(profile.businessPhone).slice(0, 11);
  const phoneError = phoneDigits.length > 0 && phoneDigits.length !== 11;

  return (
    <div className="min-h-screen">
      <ScreenHeader title="تنظیمات" onBack={onBack} />

      <div className="mx-auto w-full max-w-md space-y-4 px-4 pb-28 pt-4">
        {/* پروفایل */}
        <section className="rounded-2xl border bg-card p-4">
          <h2 className="mb-4 flex items-center gap-2 text-sm font-extrabold">
            <UserRound className="h-4 w-4 text-brand" />
            پروفایل
          </h2>
          <div className="mb-4">
            <AvatarPicker
              value={profile.avatar}
              onChange={(d) => updateProfile({ avatar: d })}
              fallback={profile.name.trim()[0] || "ف"}
            />
          </div>
          <div className="space-y-3">
            <Field label="نام شما">
              <Input
                value={profile.name}
                onChange={(e) => updateProfile({ name: e.target.value })}
                className="h-11 rounded-xl bg-muted/40"
              />
            </Field>
            <Field label="نام کسب‌وکار">
              <Input
                value={profile.businessName}
                onChange={(e) => updateProfile({ businessName: e.target.value })}
                className="h-11 rounded-xl bg-muted/40"
              />
            </Field>
            <Field label="شماره تماس کسب‌وکار (روی فاکتور چاپ می‌شود)">
              <Input
                value={profile.businessPhone}
                onChange={(e) =>
                  updateProfile({ businessPhone: digitsOnly(e.target.value).slice(0, 11) })
                }
                inputMode="numeric"
                dir="ltr"
                maxLength={11}
                aria-invalid={phoneError}
                className={cn(
                  "h-11 rounded-xl bg-muted/40 text-left",
                  phoneError && "border-destructive focus-visible:ring-destructive"
                )}
                placeholder="02112345678"
              />
              {phoneError ? (
                <p className="text-[10.5px] font-bold text-destructive">
                  شماره باید دقیقاً ۱۱ رقم باشد — {faNum(phoneDigits.length)} رقم وارد شده
                </p>
              ) : (
                <p className="text-[10.5px] text-muted-foreground">
                  دقیقاً ۱۱ رقم (موبایل یا ثابت با کد شهر) — بیشتر از ۱۱ رقم پذیرفته نمی‌شود
                </p>
              )}
            </Field>
            <Field label="آدرس کسب‌وکار (اختیاری)">
              <Input
                value={profile.businessAddress}
                onChange={(e) => updateProfile({ businessAddress: e.target.value })}
                className="h-11 rounded-xl bg-muted/40"
                placeholder="تهران، خیابان..."
              />
            </Field>
          </div>
        </section>

        {/* تصاویر فاکتور */}
        <section className="rounded-2xl border bg-card p-4">
          <h2 className="mb-4 flex items-center gap-2 text-sm font-extrabold">
            <Palette className="h-4 w-4 text-brand" />
            تصاویر فاکتور
          </h2>
          <div className="space-y-4">
            <ImagePickRow
              label="لوگو"
              hint="کنار نام کسب‌وکار، بالای فاکتور"
              value={profile.logo}
              onChange={(d) => updateProfile({ logo: d })}
              max={480}
            />
            <ImagePickRow
              label="مهر و امضا"
              hint="پایین فاکتور، داخل کادر مهر و امضا"
              value={profile.stamp || profile.signature}
              onChange={(d) => updateProfile({ stamp: d, signature: "" })}
              max={560}
            />
          </div>
        </section>

        {/* اطلاعات پرداخت فاکتور */}
        <section className="rounded-2xl border bg-card p-4">
          <h2 className="mb-1 flex items-center gap-2 text-sm font-extrabold">
            <CreditCard className="h-4 w-4 text-brand" />
            اطلاعات پرداخت فاکتور
          </h2>
          <p className="mb-4 text-[11px] text-muted-foreground">
            اگر پر کنید، در کادر پرداخت فاکتور چاپ می‌شود (اختیاری)
          </p>
          <div className="space-y-3">
            <Field label="شماره کارت">
              <Input
                value={profile.cardNumber}
                onChange={(e) =>
                  updateProfile({ cardNumber: digitsOnly(e.target.value).slice(0, 16) })
                }
                inputMode="numeric"
                dir="ltr"
                className="h-11 rounded-xl bg-muted/40 text-left"
                placeholder="5022291613768470"
              />
            </Field>
            <Field label="کد ملی (اختیاری)">
              <Input
                value={profile.nationalId || ""}
                onChange={(e) =>
                  updateProfile({ nationalId: digitsOnly(e.target.value).slice(0, 10) })
                }
                inputMode="numeric"
                dir="ltr"
                maxLength={10}
                aria-label="کد ملی — حداکثر ۱۰ رقم"
                className="h-11 rounded-xl bg-muted/40 text-left"
                placeholder="0012345678"
              />
              <p className="text-[10.5px] text-muted-foreground">
                برای ثبت چک صیادی — حداکثر ۱۰ رقم
              </p>
            </Field>
            <Field label="شماره شبا (IR خودکار اضافه می‌شود)">
              <div
                dir="ltr"
                className="flex h-11 items-stretch overflow-hidden rounded-xl border border-input bg-muted/40 transition-colors focus-within:border-ring"
              >
                <span className="flex select-none items-center border-r border-input bg-muted px-3 text-sm font-extrabold tracking-wide text-muted-foreground">
                  IR
                </span>
                <input
                  value={digitsOnly(profile.sheba)}
                  onChange={(e) =>
                    updateProfile({ sheba: digitsOnly(e.target.value).slice(0, 24) })
                  }
                  inputMode="numeric"
                  dir="ltr"
                  aria-label="شماره شبا بدون پیشوند IR"
                  placeholder="240570077700013977128001"
                  className="h-full w-full bg-transparent px-3 text-left text-sm tabular-nums outline-none placeholder:text-muted-foreground"
                />
              </div>
            </Field>
            <Field label="شماره حساب">
              <Input
                value={profile.accountNumber}
                onChange={(e) =>
                  updateProfile({ accountNumber: digitsOnly(e.target.value).slice(0, 20) })
                }
                inputMode="numeric"
                dir="ltr"
                className="h-11 rounded-xl bg-muted/40 text-left"
                placeholder="1234567890"
              />
            </Field>
            <Field label="نام بانک">
              <Input
                value={profile.bankName}
                onChange={(e) => updateProfile({ bankName: e.target.value })}
                className="h-11 rounded-xl bg-muted/40"
                placeholder="پارسیان"
              />
            </Field>
            <Field label="صاحب حساب">
              <Input
                value={profile.accountHolder}
                onChange={(e) => updateProfile({ accountHolder: e.target.value })}
                className="h-11 rounded-xl bg-muted/40"
                placeholder="نام صاحب حساب"
              />
            </Field>
          </div>
        </section>

        {/* فاکتور و پرداخت */}
        <section className="rounded-2xl border bg-card p-4">
          <h2 className="mb-4 flex items-center gap-2 text-sm font-extrabold">
            <Receipt className="h-4 w-4 text-brand" />
            فاکتور و پرداخت
          </h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-xs text-muted-foreground">واحد پول</Label>
              <div className="flex overflow-hidden rounded-lg border">
                {(["toman", "rial"] as const).map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => updateProfile({ currency: c })}
                    className={cn(
                      "px-5 py-2 text-xs font-bold transition-colors",
                      profile.currency === c
                        ? "bg-primary text-primary-foreground"
                        : "bg-card text-muted-foreground"
                    )}
                  >
                    {c === "toman" ? "تومان" : "ریال"}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between gap-2">
              <div>
                <Label className="text-xs font-bold">مالیات بر ارزش افزوده</Label>
                <p className="text-[11px] text-muted-foreground">
                  به‌صورت پیش‌فرض روی فاکتورهای جدید اعمال می‌شود
                </p>
              </div>
              <div className="flex items-center gap-2">
                <MoneyInput
                  value={profile.taxRate}
                  onChange={(n) => updateProfile({ taxRate: Math.min(100, n) })}
                  disabled={!profile.taxEnabled}
                  className="h-9 w-16 rounded-lg bg-muted/40 text-left"
                />
                <span className={cn("text-xs font-bold", !profile.taxEnabled && "opacity-40")}>
                  ٪
                </span>
                <Switch
                  checked={profile.taxEnabled}
                  onCheckedChange={(v) => updateProfile({ taxEnabled: v })}
                  aria-label="فعال‌سازی مالیات"
                />
              </div>
            </div>

            <div className="flex items-center justify-between gap-2">
              <div>
                <Label className="text-xs font-bold">شماره شروع فاکتور</Label>
                <p className="text-[11px] text-muted-foreground">
                  شماره بعدی: {faNum(nextNum)}
                </p>
              </div>
              <MoneyInput
                value={profile.invoiceStart}
                onChange={(n) => updateProfile({ invoiceStart: Math.max(1, n) })}
                className="h-9 w-24 rounded-lg bg-muted/40 text-left"
              />
            </div>

            <Field label="متن تشکر پای فاکتور">
              <Input
                value={profile.footerThanks || ""}
                onChange={(e) => updateProfile({ footerThanks: e.target.value })}
                className="h-11 rounded-xl bg-muted/40"
                placeholder="با تشکر از اعتماد شما"
              />
              <p className="text-[10.5px] leading-5 text-muted-foreground">
                متن پایین فاکتور — پیش‌فرض: «با تشکر از اعتماد شما»؛ اگر خالی بماند نمایش داده نمی‌شود
              </p>
            </Field>

            <Field label="متن دلخواه اضافه پای فاکتور (اختیاری)">
              <Input
                value={profile.footerNote || ""}
                onChange={(e) => updateProfile({ footerNote: e.target.value })}
                className="h-11 rounded-xl bg-muted/40"
                placeholder="مثلاً: منتظر دیدار بعدی شما هستیم"
              />
              <p className="text-[10.5px] leading-5 text-muted-foreground">
                کنار متن تشکر نمایش داده می‌شود؛ اگر خالی بماند چیزی اضافه نمی‌شود
              </p>
            </Field>

            <div className="flex items-center justify-between gap-2">
              <div>
                <Label className="text-xs font-bold">جهت برگه خروجی</Label>
                <p className="text-[11px] text-muted-foreground">
                  در خروجی PNG ،JPG و PDF اعمال می‌شود
                </p>
              </div>
              <div className="flex overflow-hidden rounded-lg border">
                {(["portrait", "landscape"] as const).map((o) => (
                  <button
                    key={o}
                    type="button"
                    onClick={() => updateProfile({ exportOrientation: o })}
                    className={cn(
                      "px-5 py-2 text-xs font-bold transition-colors",
                      (profile.exportOrientation || "portrait") === o
                        ? "bg-primary text-primary-foreground"
                        : "bg-card text-muted-foreground"
                    )}
                  >
                    {o === "portrait" ? "عمودی" : "افقی"}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ظاهر */}
        <section className="rounded-2xl border bg-card p-4">
          <h2 className="mb-4 flex items-center gap-2 text-sm font-extrabold">
            <Palette className="h-4 w-4 text-brand" />
            ظاهر برنامه
          </h2>

          <p className="mb-2 text-xs text-muted-foreground">تم رنگی</p>
          <div className="mb-5 grid grid-cols-3 gap-2.5">
            {THEMES.map((t) => {
              const active = profile.theme === t.id;
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => updateProfile({ theme: t.id })}
                  className={cn(
                    "relative flex flex-col items-center gap-2 rounded-2xl border p-3 transition-all active:scale-95",
                    active ? "border-primary bg-tint" : "border-border bg-background"
                  )}
                  aria-pressed={active}
                >
                  <span
                    className="flex h-9 w-9 items-center justify-center rounded-full shadow-inner"
                    style={{ background: `linear-gradient(135deg, ${t.color}, ${t.deep})` }}
                  >
                    {active && <Check className="h-4 w-4 text-white" strokeWidth={3} />}
                  </span>
                  <span
                    className={cn(
                      "text-[11px] font-bold",
                      active ? "text-brand" : "text-muted-foreground"
                    )}
                  >
                    {t.label}
                  </span>
                </button>
              );
            })}
          </div>

          <p className="mb-2 text-xs text-muted-foreground">حالت نمایش</p>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => updateProfile({ dark: false })}
              className={cn(
                "flex h-11 items-center justify-center gap-2 rounded-xl border text-xs font-bold transition-colors",
                !profile.dark ? "border-primary bg-tint text-brand" : "text-muted-foreground"
              )}
            >
              <Sun className="h-4 w-4" /> روشن
            </button>
            <button
              type="button"
              onClick={() => updateProfile({ dark: true })}
              className={cn(
                "flex h-11 items-center justify-center gap-2 rounded-xl border text-xs font-bold transition-colors",
                profile.dark ? "border-primary bg-tint text-brand" : "text-muted-foreground"
              )}
            >
              <Moon className="h-4 w-4" /> تیره
            </button>
          </div>
        </section>

        {/* داده‌ها */}
        <section className="rounded-2xl border bg-card p-4">
          <h2 className="mb-3 flex items-center gap-2 text-sm font-extrabold">
            <Trash2 className="h-4 w-4 text-destructive" />
            داده‌ها
          </h2>
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-bold">پاک کردن همه داده‌ها</p>
              <p className="mt-0.5 text-[11px] leading-5 text-muted-foreground">
                همه فاکتورها، کالاها، مشتریان و تنظیمات حذف می‌شوند
              </p>
            </div>
            <AlertDialog open={resetOpen} onOpenChange={setResetOpen}>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" size="sm" className="shrink-0 rounded-lg">
                  پاک‌سازی
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent aria-describedby={undefined} className="mx-auto max-w-sm rounded-3xl">
                <AlertDialogHeader>
                  <AlertDialogTitle>پاک کردن همه داده‌ها؟</AlertDialogTitle>
                  <AlertDialogDescription>
                    این عملیات قابل بازگشت نیست و همه اطلاعات برنامه حذف می‌شود.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>انصراف</AlertDialogCancel>
                  <AlertDialogAction
                    className="bg-destructive text-white hover:bg-destructive/90"
                    onClick={() => {
                      resetAll();
                      toast.success("همه داده‌ها پاک شد");
                    }}
                  >
                    بله، پاک کن
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </section>

        <p className="flex items-center justify-center gap-1.5 pb-2 text-[11px] text-muted-foreground">
          <CloudOff className="h-3.5 w-3.5" />
          تغییرات به‌صورت خودکار روی دستگاه شما ذخیره می‌شوند
        </p>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs text-muted-foreground">{label}</Label>
      {children}
    </div>
  );
}
