"use client";

/* استور مرکزی فروش‌یار — کاملاً آفلاین با localStorage */

import { create } from "zustand";
import {
  persist,
  createJSONStorage,
  type StateStorage,
} from "zustand/middleware";
import { toEnDigits } from "./persian";

export type ThemeId = "green" | "purple" | "pink" | "orange" | "turquoise" | "gold";
export type Currency = "toman" | "rial";
export type ProductType = "goods" | "service";
export type InvoiceStatus = "paid" | "pending";
export type DiscountType = "percent" | "amount";
export type ExportOrientation = "portrait" | "landscape";

export interface Profile {
  name: string;
  businessName: string;
  businessPhone: string;
  businessAddress: string;
  avatar: string; // dataURL
  logo: string; // dataURL — بالای فاکتور
  stamp: string; // dataURL — مهر پایین فاکتور
  signature: string; // dataURL — امضا پایین فاکتور
  cardNumber: string; // شماره کارت — کادر پرداخت فاکتور
  accountNumber: string; // شماره حساب
  sheba: string; // شماره شبا
  bankName: string; // نام بانک
  accountHolder: string; // صاحب حساب
  nationalId: string; // کد ملی — برای ثبت چک صیادی (۱۰ رقم)
  currency: Currency;
  taxEnabled: boolean;
  taxRate: number;
  invoiceStart: number;
  footerThanks: string; // متن تشکر پای فاکتور — قابل تغییر؛ خالی = خط تشکر نمایش داده نشود
  footerNote: string; // متن دلخواه کنار متن تشکر پایین فاکتور — خالی = نمایش داده نشود
  exportOrientation: ExportOrientation; // جهت برگه خروجی PNG/JPG/PDF
  theme: ThemeId;
  dark: boolean;
  onboarded: boolean;
}

export interface Product {
  id: string;
  name: string;
  price: number;
  type: ProductType;
  unit: string;
  createdAt: number;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  createdAt: number;
}

export interface InvoiceItem {
  id: string;
  name: string;
  price: number;
  qty: number;
  unit: string;
}

export interface Invoice {
  id: string;
  number: string;
  customerName: string;
  customerPhone: string;
  items: InvoiceItem[];
  discountType: DiscountType;
  discountValue: number;
  taxEnabled: boolean;
  taxRate: number;
  status: InvoiceStatus;
  note: string;
  createdAt: number;
}

export interface Totals {
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
}

/* پیش‌نویس خودکار فرم صدور فاکتور — تا وقتی کاربر وسط کار برگشت
   (مشتری آمد، اپ بسته شد، صفحه عوض شد) داده‌ها از دست نرود */
export interface EditorDraft {
  number: string;
  customerName: string;
  customerPhone: string;
  note: string;
  items: InvoiceItem[];
  discountType: DiscountType;
  discountValue: number;
  taxEnabled: boolean;
  taxRate: number;
  status: InvoiceStatus;
  savedAt: number;
}

export const defaultProfile: Profile = {
  name: "",
  businessName: "",
  businessPhone: "",
  businessAddress: "",
  avatar: "",
  logo: "",
  stamp: "",
  signature: "",
  cardNumber: "",
  accountNumber: "",
  sheba: "",
  bankName: "",
  accountHolder: "",
  nationalId: "",
  currency: "toman",
  taxEnabled: false,
  taxRate: 10,
  invoiceStart: 1,
  footerThanks: "با تشکر از اعتماد شما",
  footerNote: "",
  exportOrientation: "portrait",
  theme: "green",
  dark: false,
  onboarded: false,
};

export const THEMES: { id: ThemeId; label: string; color: string; deep: string }[] = [
  { id: "green", label: "سبز", color: "#0F8A6B", deep: "#0B5D50" },
  { id: "purple", label: "بنفش", color: "#7C3AED", deep: "#5B21B6" },
  { id: "pink", label: "سرخابی", color: "#DB2777", deep: "#9D174D" },
  { id: "orange", label: "نارنجی", color: "#EA580C", deep: "#9A3412" },
  { id: "turquoise", label: "فیروزه‌ای", color: "#0D9488", deep: "#115E59" },
  { id: "gold", label: "طلایی", color: "#B45309", deep: "#92400E" },
];

interface FroshState {
  hydrated: boolean;
  profile: Profile;
  products: Product[];
  customers: Customer[];
  invoices: Invoice[];
  editorDraft: EditorDraft | null;
  setHydrated: () => void;
  updateProfile: (patch: Partial<Profile>) => void;
  addProduct: (p: Omit<Product, "id" | "createdAt">) => void;
  updateProduct: (id: string, patch: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  addCustomer: (c: Omit<Customer, "id" | "createdAt">) => void;
  updateCustomer: (id: string, patch: Partial<Customer>) => void;
  deleteCustomer: (id: string) => void;
  saveInvoice: (inv: Invoice) => void;
  deleteInvoice: (id: string) => void;
  setEditorDraft: (d: EditorDraft | null) => void;
  resetAll: () => void;
}

/* حافظه محلی ایمن — اگر دسترسی مسدود بود، برنامه قفل نمی‌شود */
const safeLocalStorage: StateStorage = {
  getItem: (name) => {
    try {
      return window.localStorage.getItem(name);
    } catch {
      return null;
    }
  },
  setItem: (name, value) => {
    try {
      window.localStorage.setItem(name, value);
    } catch {
      /* دسترسی به حافظه محلی ممکن نیست — نادیده گرفته می‌شود */
    }
  },
  removeItem: (name) => {
    try {
      window.localStorage.removeItem(name);
    } catch {
      /* نادیده گرفته می‌شود */
    }
  },
};

export const useStore = create<FroshState>()(
  persist(
    (set) => ({
      hydrated: false,
      profile: defaultProfile,
      products: [],
      customers: [],
      invoices: [],
      editorDraft: null,

      setHydrated: () => set({ hydrated: true }),

      setEditorDraft: (d) => set({ editorDraft: d }),

      updateProfile: (patch) => set((s) => ({ profile: { ...s.profile, ...patch } })),

      addProduct: (p) =>
        set((s) => ({
          products: [
            { ...p, id: crypto.randomUUID(), createdAt: Date.now() },
            ...s.products,
          ],
        })),
      updateProduct: (id, patch) =>
        set((s) => ({
          products: s.products.map((p) => (p.id === id ? { ...p, ...patch } : p)),
        })),
      deleteProduct: (id) =>
        set((s) => ({ products: s.products.filter((p) => p.id !== id) })),

      addCustomer: (c) =>
        set((s) => ({
          customers: [
            { ...c, id: crypto.randomUUID(), createdAt: Date.now() },
            ...s.customers,
          ],
        })),
      updateCustomer: (id, patch) =>
        set((s) => ({
          customers: s.customers.map((c) => (c.id === id ? { ...c, ...patch } : c)),
        })),
      deleteCustomer: (id) =>
        set((s) => ({ customers: s.customers.filter((c) => c.id !== id) })),

      saveInvoice: (inv) =>
        set((s) => {
          const exists = s.invoices.some((i) => i.id === inv.id);
          return {
            invoices: exists
              ? s.invoices.map((i) => (i.id === inv.id ? inv : i))
              : [inv, ...s.invoices],
          };
        }),
      deleteInvoice: (id) =>
        set((s) => ({ invoices: s.invoices.filter((i) => i.id !== id) })),

      resetAll: () =>
        set({ profile: defaultProfile, products: [], customers: [], invoices: [], editorDraft: null }),
    }),
    {
      name: "froshyar-v1",
      version: 5,
      storage: createJSONStorage(() => safeLocalStorage),
      // مهاجرت داده‌های قدیمی — فیلدهای جدید با مقدار پیش‌فرض پر می‌شوند
      migrate: (persisted, version) => {
        const p = (persisted ?? {}) as Partial<FroshState>;
        const profile = { ...defaultProfile, ...(p.profile ?? {}) };
        // نسخه ۲ — شماره‌گذاری فاکتور از ۱:
        // ۱) شماره شروع قدیمی (۱۰۰۱ پیش‌فرض یا ۱۰) به ۱ تغییر می‌کند
        // ۲) فاکتورهای موجود به‌ترتیب تاریخ از ۱ شماره‌گذاری می‌شوند
        if (version < 2) {
          if (profile.invoiceStart === 1001 || profile.invoiceStart === 10) {
            profile.invoiceStart = 1;
          }
          const invoices = Array.isArray(p.invoices) ? [...p.invoices] : [];
          invoices.sort((a, b) => (a?.createdAt ?? 0) - (b?.createdAt ?? 0));
          invoices.forEach((inv, idx) => {
            if (inv) inv.number = String(idx + 1);
          });
          p.invoices = invoices;
        }
        // نسخه ۳ — متن دلخواه پانویس و جهت خروجی
        if (version < 3) {
          if (typeof profile.footerNote !== "string") profile.footerNote = "";
          if (profile.exportOrientation !== "portrait" && profile.exportOrientation !== "landscape") {
            profile.exportOrientation = "portrait";
          }
        }
        // نسخه ۴ — متن تشکر قابل تغییر پای فاکتور
        if (version < 4) {
          if (typeof profile.footerThanks !== "string" || !profile.footerThanks.trim()) {
            profile.footerThanks = "با تشکر از اعتماد شما";
          }
        }
        // نسخه ۵ — کد ملی (چک صیادی) + پاک‌سازی پیش‌نویس ناسازگار
        if (version < 5) {
          if (typeof profile.nationalId !== "string") profile.nationalId = "";
          delete (p as Partial<FroshState>).editorDraft;
        }
        return { ...p, profile } as FroshState;
      },
      onRehydrateStorage: () => (state, error) => {
        // حتی در صورت خطا در بازیابی، برنامه باید وارد شود
        if (state) state.setHydrated();
        else if (!error) useStore.getState().setHydrated();
      },
    }
  )
);

/* اگر بازیابی به هر دلیلی کامل نشد، بعد از ۱.۵ ثانیه وارد برنامه شو */
if (typeof window !== "undefined") {
  setTimeout(() => {
    if (!useStore.getState().hydrated) useStore.getState().setHydrated();
  }, 1500);
}

/** شماره فاکتور بعدی (خودکار با احتساب شماره شروع) */
export function nextInvoiceNumber(s: {
  invoices: Invoice[];
  profile: Profile;
}): number {
  const nums = s.invoices
    .map((i) => parseInt(toEnDigits(String(i.number)) || "0", 10))
    .filter((n) => !isNaN(n) && n > 0);
  const maxN = nums.length ? Math.max(...nums) : s.profile.invoiceStart - 1;
  return Math.max(s.profile.invoiceStart, maxN + 1);
}

/** محاسبه جمع‌های فاکتور */
export function invoiceTotals(inv: {
  items: InvoiceItem[];
  discountType: DiscountType;
  discountValue: number;
  taxEnabled: boolean;
  taxRate: number;
}): Totals {
  const subtotal = inv.items.reduce((sum, it) => sum + it.price * it.qty, 0);
  let discount =
    inv.discountType === "percent"
      ? Math.round((subtotal * (inv.discountValue || 0)) / 100)
      : Math.min(inv.discountValue || 0, subtotal);
  if (!isFinite(discount) || discount < 0) discount = 0;
  const taxable = subtotal - discount;
  const tax = inv.taxEnabled ? Math.round((taxable * (inv.taxRate || 0)) / 100) : 0;
  const total = taxable + tax;
  return { subtotal, discount, tax, total };
}
