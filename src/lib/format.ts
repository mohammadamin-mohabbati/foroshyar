/* فرمت‌کننده شماره‌های بانکی: کارت، شبا، حساب — نمایش کامل بدون بریدگی */

import { toEnDigits } from "./persian";

/** فقط ارقام لاتین (حذف IR و هر کاراکتر دیگر) */
export function digitsOnly(value: string): string {
  return toEnDigits(value ?? "").replace(/\D/g, "");
}

/** گروه‌بندی ارقام از چپ با فاصله (پیش‌فرض گروه‌های ۴تایی) */
export function digitGroups(value: string, size = 4): string {
  const d = digitsOnly(value);
  const groups: string[] = [];
  for (let i = 0; i < d.length; i += size) {
    groups.push(d.slice(i, i + size));
  }
  return groups.join(" ");
}

/** شماره کارت: ۴رقمی گروه‌بندی‌شده — 5022 2916 1376 8470 */
export function formatCardNumber(value: string): string {
  const d = digitsOnly(value);
  if (!d) return "";
  return digitGroups(d, 4);
}

/** شماره شبا: IR ثابت + ارقام ۴تایی — IR24 0570 0777 0013 9771 2800 1 */
export function formatSheba(value: string): string {
  const d = digitsOnly(value);
  if (!d) return "";
  return `IR ${digitGroups(d, 4)}`;
}

/** شماره حساب: همان ارقام بدون تغییر (نمایش کامل) */
export function formatAccountNumber(value: string): string {
  return digitsOnly(value);
}
