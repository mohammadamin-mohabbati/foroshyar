/* کتابخانه فارسی‌سازی: اعداد، مبلغ، تاریخ شمسی و عدد به حروف */

const FA_DIGITS = "۰۱۲۳۴۵۶۷۸۹";
const AR_DIGITS = "٠١٢٣٤٥٦٧٨٩";

/** تبدیل ارقام لاتین به فارسی */
export function toFa(value: string | number): string {
  return String(value).replace(/[0-9]/g, (d) => FA_DIGITS[Number(d)]);
}

/** تبدیل ارقام فارسی/عربی به لاتین (برای پارس کردن ورودی) */
export function toEnDigits(value: string): string {
  return value
    .replace(/[۰-۹]/g, (d) => String(FA_DIGITS.indexOf(d)))
    .replace(/[٠-٩]/g, (d) => String(AR_DIGITS.indexOf(d)));
}

/** عدد با جداکننده هزارگان و ارقام فارسی */
export function faNum(n: number): string {
  if (!isFinite(n)) return toFa(0);
  return n.toLocaleString("fa-IR", { maximumFractionDigits: 2 });
}

/** مبلغ با واحد پول */
export function faMoney(n: number, currency: "toman" | "rial"): string {
  const label = currency === "toman" ? "تومان" : "ریال";
  return `${faNum(Math.round(n))} ${label}`;
}

/** پارس ورودی عددی کاربر (فارسی/لاتین، با جداکننده) */
export function parseNumInput(s: string): number {
  const cleaned = toEnDigits(s)
    .replace(/[,٬\s]/g, "")
    .replace(/[^\d.\-]/g, "");
  const n = Number(cleaned);
  return isNaN(n) ? 0 : n;
}

/* ---------------- تاریخ شمسی ---------------- */

export function faDate(d: Date | string | number): string {
  const date = d instanceof Date ? d : new Date(d);
  return new Intl.DateTimeFormat("fa-IR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

export function faDateLong(d: Date | string | number): string {
  const date = d instanceof Date ? d : new Date(d);
  return new Intl.DateTimeFormat("fa-IR", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(date);
}

export function faTime(d: Date | string | number): string {
  const date = d instanceof Date ? d : new Date(d);
  return new Intl.DateTimeFormat("fa-IR", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

export function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

/* ---------------- عدد به حروف فارسی ---------------- */

const ONES = ["", "یک", "دو", "سه", "چهار", "پنج", "شش", "هفت", "هشت", "نه"];
const TEENS = [
  "ده",
  "یازده",
  "دوازده",
  "سیزده",
  "چهارده",
  "پانزده",
  "شانزده",
  "هفده",
  "هجده",
  "نوزده",
];
const TENS = ["", "", "بیست", "سی", "چهل", "پنجاه", "شصت", "هفتاد", "هشتاد", "نود"];
const HUNDREDS = [
  "",
  "صد",
  "دویست",
  "سیصد",
  "چهارصد",
  "پانصد",
  "ششصد",
  "هفتصد",
  "هشتصد",
  "نهصد",
];
const SCALES = ["", "هزار", "میلیون", "میلیارد", "هزار میلیارد"];

function threeDigitToWords(n: number): string {
  const parts: string[] = [];
  const h = Math.floor(n / 100);
  const r = n % 100;
  if (h > 0) parts.push(HUNDREDS[h]);
  if (r >= 10 && r < 20) {
    parts.push(TEENS[r - 10]);
  } else {
    const t = Math.floor(r / 10);
    const u = r % 10;
    if (t > 0) parts.push(TENS[t]);
    if (u > 0) parts.push(ONES[u]);
  }
  return parts.join(" و ");
}

/** تبدیل عدد به حروف فارسی (تا هزار میلیارد) */
export function numToPersianWords(num: number): string {
  const n = Math.floor(Math.abs(num));
  if (n === 0) return "صفر";
  if (!isFinite(n)) return "";

  const chunks: string[] = [];
  let rest = n;
  let scaleIdx = 0;

  while (rest > 0 && scaleIdx < SCALES.length) {
    const group = rest % 1000;
    if (group > 0) {
      const words = threeDigitToWords(group);
      const scale = SCALES[scaleIdx];
      chunks.unshift(scale ? `${words} ${scale}` : words);
    }
    rest = Math.floor(rest / 1000);
    scaleIdx++;
  }

  return chunks.join(" و ");
}

/** مبلغ به حروف همراه با واحد پول */
export function moneyToPersianWords(amount: number, currency: "toman" | "rial"): string {
  const label = currency === "toman" ? "تومان" : "ریال";
  return `${numToPersianWords(Math.round(amount))} ${label}`;
}
