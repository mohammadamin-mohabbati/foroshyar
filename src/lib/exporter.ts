"use client";

/* تولید و اشتراک‌گذاری فاکتور: PNG / JPG / PDF
   - اندروید (Capacitor): ذخیره در کش + Share Plugin → منوی اشتراک‌گذاری سیستم
   - وب: Web Share API، و در نبود پشتیبانی، دانلود مستقیم

   نکات مهم:
   - هنگام اشتراک فایل، text ارسال نمی‌شود (بعضی اپ‌ها مثل واتساپ/تلگرام با وجود
     text، فایل را نادیده می‌گیرند و فقط متن می‌رسد)
   - بستن پنجره اشتراک توسط کاربر = cancelled، نه خطا
   - scale 3 برای کیفیت مناسب روی گوشی‌های پرتراکم */

import html2canvas from "html2canvas-pro";
import { jsPDF } from "jspdf";
import { Capacitor } from "@capacitor/core";
import { Filesystem, Directory } from "@capacitor/filesystem";
import { Share } from "@capacitor/share";
import type { ExportOrientation } from "@/lib/store";

export type ExportFormat = "png" | "jpg" | "pdf";

/* عرض برگه خروجی (معادل A4 با ۹۶dpi)
   کاغذ فاکتور هنگام خروجی با این عرض رندر می‌شود تا برگه‌های بزرگ‌تر
   و حرفه‌ای‌تر ساخته شود و محتوای بیشتری در هر صفحه جا بگیرد
   (فاکتور ۶ قلمی به‌جای ۲-۳ صفحه در یک صفحه A4 جا می‌شود) */
const EXPORT_WIDTH: Record<ExportOrientation, number> = {
  portrait: 794,
  landscape: 1123,
};

/* کپی ناخوانی از کاغذ در صحنه‌ای خارج از دید با عرض دلخواه —
   طرح و استایل عیناً همان است، فقط عریض‌تر؛ بدون هیچ تغییری در پیش‌نمایش

   نکته‌ی مهم فارسی: html2canvas وقتی letter-spacing غیرصفر ببیند، متن را
   حرف‌به‌حرف می‌کشد و اتصال حروف فارسی از بین می‌رود (مثل «ت‌س‌ت»).
   پس روی کل کالون letter-spacing به normal قفل می‌شود تا همیشه
   کلِ کلمه با یک فراخوان رسم شود و اتصال حروف حفظ شود. */
function stageExportClone(
  el: HTMLElement,
  width: number,
  orientation: ExportOrientation
): { node: HTMLElement; cleanup: () => void } {
  const stage = document.createElement("div");
  stage.setAttribute("aria-hidden", "true");
  stage.style.cssText =
    "position:absolute;left:-10000px;top:0;background:#ffffff;";
  stage.style.width = `${width}px`;
  const clone = el.cloneNode(true) as HTMLElement;
  clone.style.width = `${width}px`;
  clone.style.margin = "0";
  clone.style.letterSpacing = "normal";
  // قفل letter-spacing روی تک‌تک عناصر — اتصال حروف فارسی در خروجی
  const all = clone.querySelectorAll<HTMLElement>("*");
  for (let i = 0; i < all.length; i++) {
    all[i].style.letterSpacing = "normal";
  }
  // نشانه‌ی جهت برای استایل‌های وابسته به جهت
  clone.dataset.fyExport = orientation;
  stage.appendChild(clone);
  document.body.appendChild(stage);
  return {
    node: clone,
    cleanup: () => {
      stage.remove();
    },
  };
}

/* ------------------------------------------------------------------ */
/* CSS و فونت‌های صفحه به‌صورت درون‌خطی برای کلون html2canvas
   روی بعضی WebViewهای اندروید، بارگیری دوباره‌ی CSS/فونت داخل iframeِ
   کلون (که از مسیر سرویس‌ورکر می‌گذرد) شکست می‌خورد و خروجی کاملاً
   بی‌استایل می‌شود. با سریال‌سازی CSS و تبدیل فونت‌ها به data URL،
   کلون بدون هیچ درخواست شبکه‌ای دقیقاً همان ظاهر صفحه را می‌گیرد.  */

let exportCssCache: string | null = null;

async function fetchAsDataUrl(absUrl: string): Promise<string | null> {
  try {
    const res = await fetch(absUrl);
    if (!res.ok) return null;
    const blob = await res.blob();
    return await new Promise<string | null>((resolve) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result || "") || null);
      reader.onerror = () => resolve(null);
      reader.readAsDataURL(blob);
    });
  } catch (_) {
    return null;
  }
}

async function buildExportCss(): Promise<string> {
  if (exportCssCache !== null) return exportCssCache;

  // ۱) سریال‌سازی همه استایل‌شیت‌های same-origin
  let css = "";
  for (const sheet of Array.from(document.styleSheets)) {
    try {
      for (const rule of Array.from(sheet.cssRules)) css += rule.cssText + "\n";
    } catch (_) {
      /* استایل cross-origin قابل خواندن نیست — رد شود */
    }
  }

  // ۲) جایگزینی فایل‌های فونت با data URL
  const urlRe = /url\((['"]?)([^'")]+?\.(?:woff2|woff|ttf|otf)(?:\?[^'")]*?)?)\1\)/gi;
  const fontUrls = new Set<string>();
  let m: RegExpExecArray | null;
  while ((m = urlRe.exec(css)) !== null) {
    if (!m[2].startsWith("data:")) fontUrls.add(m[2]);
  }
  for (const u of fontUrls) {
    try {
      const abs = new URL(u, document.baseURI).href;
      const dataUrl = await fetchAsDataUrl(abs);
      if (dataUrl) css = css.split(u).join(dataUrl);
    } catch (_) {}
  }

  exportCssCache = css;
  return css;
}

async function renderCanvas(el: HTMLElement, scale = 3): Promise<HTMLCanvasElement> {
  if (document.fonts?.ready) {
    try {
      await document.fonts.ready;
    } catch (_) {}
  }

  const exportCss = await buildExportCss();

  return html2canvas(el, {
    scale,
    backgroundColor: "#ffffff",
    useCORS: true,
    logging: false,
    onclone: async (doc: Document) => {
      if (exportCss) {
        // حذف <link> ها تا هیچ درخواستی از داخل iframe زده نشود
        doc.querySelectorAll('link[rel="stylesheet"]').forEach((l) => l.remove());
        const style = doc.createElement("style");
        style.textContent = exportCss;
        doc.head.appendChild(style);
        // منتظر بارگیری فونت‌های data URL در کلون بمانیم
        try {
          await doc.fonts?.ready;
        } catch (_) {}
      }
    },
  });
}

function canvasToBlob(canvas: HTMLCanvasElement, mime: string, quality?: number): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (b) => (b ? resolve(b) : reject(new Error("خطا در ساخت فایل"))),
      mime,
      quality
    );
  });
}

function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = String(reader.result || "");
      const comma = result.indexOf(",");
      resolve(comma >= 0 ? result.slice(comma + 1) : result);
    };
    reader.onerror = () => reject(new Error("خطا در تبدیل فایل"));
    reader.readAsDataURL(blob);
  });
}

/* ساخت صفحات PDF از روی canvas — با حاشیه استاندارد و پشتیبانی چندصفحه‌ای */
function buildPdf(
  canvas: HTMLCanvasElement,
  name: string,
  orientation: ExportOrientation = "portrait"
): Blob {
  const pdf = new jsPDF({ orientation, unit: "mm", format: "a4" });
  pdf.setProperties({ title: name });

  const pageWmm = orientation === "landscape" ? 297 : 210;
  const pageHmm = orientation === "landscape" ? 210 : 297;
  const margin = 8;
  const pageW = pageWmm - margin * 2; // عرض مفید صفحه
  const pageH = pageHmm - margin * 2; // ارتفاع مفید صفحه
  const mmPerPx = pageW / canvas.width;
  const fullImgH = canvas.height * mmPerPx;
  const data = canvas.toDataURL("image/jpeg", 0.96);

  if (fullImgH <= pageH) {
    pdf.addImage(data, "JPEG", margin, margin, pageW, fullImgH);
    return pdf.output("blob");
  }

  // کمی‌بلندتر از یک صفحه؟ با کوچک‌سازی جزئی در همان یک صفحه جا بده
  const shrinkW = canvas.width * pageH / canvas.height;
  if (shrinkW >= pageW * 0.75) {
    pdf.addImage(data, "JPEG", (pageWmm - shrinkW) / 2, margin, shrinkW, pageH);
    return pdf.output("blob");
  }

  // فاکتور خیلی بلند → برش به چند صفحه‌ی A4
  const pageHpx = pageH / mmPerPx;
  let y = 0;
  let first = true;
  while (y < canvas.height - 1) {
    const sliceH = Math.min(pageHpx, canvas.height - y);
    const slice = document.createElement("canvas");
    slice.width = canvas.width;
    slice.height = Math.ceil(sliceH);
    const ctx = slice.getContext("2d");
    if (ctx) {
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, slice.width, slice.height);
      ctx.drawImage(canvas, 0, y, canvas.width, sliceH, 0, 0, canvas.width, sliceH);
    }
    if (!first) pdf.addPage();
    pdf.addImage(
      slice.toDataURL("image/jpeg", 0.96),
      "JPEG",
      margin,
      margin,
      pageW,
      sliceH * mmPerPx
    );
    first = false;
    y += sliceH;
  }
  return pdf.output("blob");
}

async function buildBlob(
  el: HTMLElement,
  name: string,
  format: ExportFormat,
  orientation: ExportOrientation = "portrait"
): Promise<{ blob: Blob; fileName: string }> {
  // کاغذ با عرض واقعی A4 (یا A4 افقی) رندر می‌شود — برگه بزرگ‌تر و صفحات کمتر
  const { node, cleanup } = stageExportClone(
    el,
    EXPORT_WIDTH[orientation] || 794,
    orientation
  );
  try {
    // دو فریم صبر تا چیدمان کلون کامل جا بیفتد
    await new Promise((r) =>
      requestAnimationFrame(() => requestAnimationFrame(() => r(null)))
    );
    // PNG با وضوح بالاتر (برای بزرگ‌نمایی در چت‌ها)؛ JPG و PDF با وضوح چاپی بهینه
    const canvas = await renderCanvas(node, format === "png" ? 4 : 3);

    if (format === "pdf") {
      return { blob: buildPdf(canvas, name, orientation), fileName: `${name}.pdf` };
    }

    const mime = format === "png" ? "image/png" : "image/jpeg";
    const blob = await canvasToBlob(canvas, mime, 0.96);
    return { blob, fileName: `${name}.${format}` };
  } finally {
    cleanup();
  }
}

async function buildFile(
  el: HTMLElement,
  name: string,
  format: ExportFormat,
  orientation: ExportOrientation = "portrait"
): Promise<File> {
  const { blob, fileName } = await buildBlob(el, name, format, orientation);
  return new File([blob], fileName, { type: blob.type || "application/octet-stream" });
}

/** اشتراک‌گذاری بومی اندروید از طریق پلاگین Share */
async function shareNative(
  el: HTMLElement,
  name: string,
  format: ExportFormat,
  orientation: ExportOrientation
): Promise<ExportResult> {
  const { blob, fileName } = await buildBlob(el, name, format, orientation);
  const base64 = await blobToBase64(blob);
  const saved = await Filesystem.writeFile({
    path: fileName,
    data: base64,
    directory: Directory.Cache,
  });
  try {
    // بدون text — ارسال هم‌زمان متن و فایل باعث می‌شود بعضی اپ‌ها فایل را جا بیندازند
    await Share.share({
      title: name,
      url: saved.uri,
      dialogTitle: "اشتراک‌گذاری فاکتور",
    });
  } catch (e) {
    // بستن پنجره‌ی اشتراک توسط کاربر خطا نیست
    const msg = e instanceof Error ? e.message : String(e ?? "");
    if (/cancel/i.test(msg)) return "cancelled";
    throw e;
  }
  return "shared";
}

export type ExportResult = "shared" | "downloaded" | "cancelled";

/** اشتراک‌گذاری مستقیم (باز شدن منوی اشتراک اندروید) — در نبود پشتیبانی، دانلود */
export async function shareInvoice(
  el: HTMLElement,
  name: string,
  format: ExportFormat,
  orientation: ExportOrientation = "portrait"
): Promise<ExportResult> {
  // اندروید/iOS بومی: منوی اشتراک‌گذاری سیستم با پلاگین Capacitor
  if (Capacitor.isNativePlatform()) {
    return shareNative(el, name, format, orientation);
  }

  const file = await buildFile(el, name, format, orientation);
  const nav = navigator as Navigator & {
    canShare?: (data: ShareData) => boolean;
  };

  if (nav.share && nav.canShare?.({ files: [file] })) {
    try {
      await nav.share({
        files: [file],
        title: name,
      });
      return "shared";
    } catch (e) {
      if (e instanceof DOMException && e.name === "AbortError") return "cancelled";
      // خطای share → دانلود
    }
  }
  downloadFile(file);
  return "downloaded";
}

/* دانلود بومی اندروید — فایل واقعاً در حافظه‌ی دستگاه ذخیره می‌شود.
   قبلاً از blob-URL استفاده می‌شد که در WebView اندروید هیچ کاری انجام
   نمی‌داد (پیام «ذخیره شد» ولی فایلی ذخیره نمی‌شد). الان فایل در
   پوشه‌ی عمومی Documents/ForoshYar ذخیره می‌شود؛ اگر نوشتن در آن مسدود
   بود، صفحه‌ی اشتراک‌گذاری باز می‌شود تا کاربر از همان‌جا ذخیره کند. */
async function saveNativeFile(
  blob: Blob,
  fileName: string
): Promise<"saved" | "fallback-share"> {
  const base64 = await blobToBase64(blob);
  try {
    await Filesystem.writeFile({
      path: `ForoshYar/${fileName}`,
      data: base64,
      directory: Directory.Documents,
      recursive: true,
    });
    return "saved";
  } catch (_) {
    // نوشتن در Documents ممکن نشد → کش + صفحه‌ی اشتراک (ذخیره از همان‌جا ممکن است)
    try {
      const cached = await Filesystem.writeFile({
        path: fileName,
        data: base64,
        directory: Directory.Cache,
      });
      await Share.share({
        title: fileName,
        url: cached.uri,
        dialogTitle: "ذخیره یا اشتراک‌گذاری فاکتور",
      });
      return "fallback-share";
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e ?? "");
      if (/cancel/i.test(msg)) return "fallback-share";
      throw e;
    }
  }
}

/** دانلود مستقیم روی دستگاه */
export async function downloadInvoice(
  el: HTMLElement,
  name: string,
  format: ExportFormat,
  orientation: ExportOrientation = "portrait"
): Promise<ExportResult> {
  if (Capacitor.isNativePlatform()) {
    const { blob, fileName } = await buildBlob(el, name, format, orientation);
    await saveNativeFile(blob, fileName);
    return "downloaded";
  }
  const file = await buildFile(el, name, format, orientation);
  downloadFile(file);
  return "downloaded";
}

function downloadFile(file: File) {
  const url = URL.createObjectURL(file);
  const a = document.createElement("a");
  a.href = url;
  a.download = file.name;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 4000);
}
