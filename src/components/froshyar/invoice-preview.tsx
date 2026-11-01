"use client";

/* پیش‌نمایش فاکتور + اشتراک‌گذاری و دانلود */

import { useEffect, useRef, useState } from "react";
import {
  Download,
  FileDown,
  FileImage,
  FileText,
  Image as ImageIcon,
  Loader2,
  Pencil,
  Printer,
  Share2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { Capacitor } from "@capacitor/core";
import {
  downloadInvoice,
  shareInvoice,
  type ExportFormat,
} from "@/lib/exporter";
import { useStore } from "@/lib/store";
import { cn } from "@/lib/utils";
import { ScreenHeader } from "./ui-bits";
import { InvoicePaper } from "./invoice-paper";
import { toast } from "sonner";

export function InvoicePreview({
  invoiceId,
  onBack,
  onEdit,
}: {
  invoiceId: string;
  onBack: () => void;
  onEdit: (id: string) => void;
}) {
  const paperRef = useRef<HTMLDivElement>(null);
  const fitWrapRef = useRef<HTMLDivElement>(null);
  const [shareOpen, setShareOpen] = useState(false);
  const [busy, setBusy] = useState<ExportFormat | null>(null);
  const invoice = useStore((s) => s.invoices.find((i) => i.id === invoiceId));
  const orientation = useStore((s) => s.profile.exportOrientation) || "portrait";
  const isNative = Capacitor.isNativePlatform();

  /* پیش‌نمایش عمودی = عیناً همان برگه خروجی (عرض واقعی A4 = 794px)
     با مقیاس‌شدن به عرض صفحه — چیزی که می‌بینید دقیقاً همان چیزی است
     که در خروجی PNG/JPG/PDF چاپ می‌شود */
  const [fitScale, setFitScale] = useState(1);
  const [paperH, setPaperH] = useState(0);

  useEffect(() => {
    if (orientation !== "portrait") return;
    const wrap = fitWrapRef.current;
    const paper = paperRef.current;
    if (!wrap) return;
    const measure = () => {
      const w = wrap.clientWidth;
      if (w > 0) setFitScale(w / 794);
      if (paper) setPaperH(paper.offsetHeight);
    };
    const ro = new ResizeObserver(measure);
    ro.observe(wrap);
    let ro2: ResizeObserver | null = null;
    if (paper) {
      ro2 = new ResizeObserver(measure);
      ro2.observe(paper);
    }
    measure();
    return () => {
      ro.disconnect();
      ro2?.disconnect();
    };
  }, [orientation, invoice]);

  if (!invoice) {
    return (
      <div className="min-h-screen">
        <ScreenHeader title="پیش‌نمایش فاکتور" onBack={onBack} />
        <p className="p-8 text-center text-sm text-muted-foreground">فاکتور یافت نشد</p>
      </div>
    );
  }

  // نام فایل انگلیسی تا در همه‌ی اپ‌ها (جیمیل، واتساپ و…) سالم بماند
  const fileBase = `ForoshYar-Invoice-${invoice.number || invoice.id.slice(0, 6)}`;

  async function runShare(format: ExportFormat) {
    if (!paperRef.current || busy) return;
    setBusy(format);
    setShareOpen(false);
    try {
      const result = await shareInvoice(paperRef.current, fileBase, format, orientation);
      if (result === "shared") {
        toast.success("پنجره اشتراک‌گذاری باز شد");
      } else if (result === "downloaded") {
        toast.info("اشتراک‌گذاری مستقیم در این دستگاه پشتیبانی نمی‌شود؛ فاکتور دانلود شد");
      }
    } catch {
      toast.error("خطا در ساخت فایل فاکتور");
    } finally {
      setBusy(null);
    }
  }

  async function runDownload(format: ExportFormat) {
    if (!paperRef.current || busy) return;
    setBusy(format);
    try {
      await downloadInvoice(paperRef.current, fileBase, format, orientation);
      toast.success(
        isNative
          ? "فاکتور در پوشه‌ی Documents/ForoshYar حافظه‌ی دستگاه ذخیره شد"
          : "فاکتور دانلود شد"
      );
    } catch {
      toast.error("خطا در ذخیره فاکتور");
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="min-h-screen bg-muted/60">
      <ScreenHeader
        title="پیش‌نمایش فاکتور"
        onBack={onBack}
        left={
          <Button
            size="sm"
            variant="secondary"
            className="h-8 rounded-full text-xs"
            onClick={() => onEdit(invoice.id)}
          >
            <Pencil className="h-3.5 w-3.5" />
            ویرایش
          </Button>
        }
      />

      <div
        className={cn(
          "mx-auto w-full px-4 pb-40 pt-4",
          orientation === "landscape" ? "max-w-6xl" : "max-w-2xl"
        )
      }>
        {orientation === "landscape" ? (
          <div className="space-y-2">
            <p className="flex items-center justify-center gap-1.5 rounded-full bg-tint px-3 py-1 text-center text-[10.5px] font-bold text-[var(--deep)]">
              حالت افقی — برگه A4 افقی؛ برای دیدن تمام عرض بکشید
            </p>
            <div className="overflow-x-auto pb-2">
              <div className="w-[1123px] max-w-none">
                <InvoicePaper ref={paperRef} invoice={invoice} orientation="landscape" />
              </div>
            </div>
          </div>
        ) : (
          <div ref={fitWrapRef} className="w-full">
            <div
              className="overflow-hidden"
              style={paperH > 0 && fitScale > 0 ? { height: paperH * fitScale } : undefined}
            >
              <div
                style={{
                  width: 794,
                  transform: `scale(${fitScale})`,
                  transformOrigin: "top right",
                }}
              >
                <InvoicePaper ref={paperRef} invoice={invoice} orientation="portrait" />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* نوار عملیات */}
      <div className="pb-safe fixed inset-x-0 bottom-0 z-40 border-t bg-card/95 backdrop-blur">
        <div className="mx-auto flex w-full max-w-md items-center gap-2 p-3">
          <Button
            className="h-12 flex-1 rounded-xl font-bold shadow-md shadow-primary/25"
            disabled={!!busy}
            onClick={() => setShareOpen(true)}
          >
            {busy ? <Loader2 className="h-5 w-5 animate-spin" /> : <Share2 className="h-5 w-5" />}
            اشتراک‌گذاری
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                className="h-12 w-14 rounded-xl p-0"
                disabled={!!busy}
                aria-label="دانلود فاکتور"
              >
                <Download className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="center" className="w-44">
              <DropdownMenuItem onClick={() => runDownload("png")}>
                <ImageIcon className="h-4 w-4" /> دانلود PNG
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => runDownload("jpg")}>
                <FileImage className="h-4 w-4" /> دانلود JPG
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => runDownload("pdf")}>
                <FileDown className="h-4 w-4" /> دانلود PDF
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {!isNative && (
            <Button
              variant="outline"
              className="h-12 w-14 rounded-xl p-0"
              aria-label="چاپ فاکتور"
              onClick={() => window.print()}
            >
              <Printer className="h-5 w-5" />
            </Button>
          )}
        </div>
      </div>

      {/* انتخاب فرمت اشتراک‌گذاری */}
      <Drawer open={shareOpen} onOpenChange={setShareOpen}>
        <DrawerContent className="mx-auto max-w-md rounded-t-3xl">
          <DrawerHeader className="pb-1">
            <DrawerTitle className="text-center text-sm">
              اشتراک‌گذاری فاکتور در چه قالبی؟
            </DrawerTitle>
          </DrawerHeader>
          <div className="grid grid-cols-3 gap-2 p-4 pt-2">
            <ShareOption
              icon={ImageIcon}
              title="PNG"
              subtitle="تصویر باکیفیت"
              onClick={() => runShare("png")}
              busy={busy === "png"}
              disabled={!!busy}
            />
            <ShareOption
              icon={FileImage}
              title="JPG"
              subtitle="حجم کمتر"
              onClick={() => runShare("jpg")}
              busy={busy === "jpg"}
              disabled={!!busy}
            />
            <ShareOption
              icon={FileText}
              title="PDF"
              subtitle="سند رسمی"
              onClick={() => runShare("pdf")}
              busy={busy === "pdf"}
              disabled={!!busy}
            />
          </div>
        </DrawerContent>
      </Drawer>
    </div>
  );
}

function ShareOption({
  icon: Icon,
  title,
  subtitle,
  onClick,
  busy,
  disabled,
}: {
  icon: typeof FileText;
  title: string;
  subtitle: string;
  onClick: () => void;
  busy: boolean;
  disabled: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="flex flex-col items-center gap-1.5 rounded-2xl border bg-card p-4 transition-colors hover:border-primary/50 hover:bg-tint/50 disabled:opacity-60 active:scale-95"
    >
      {busy ? (
        <Loader2 className="h-6 w-6 animate-spin text-brand" />
      ) : (
        <Icon className="h-6 w-6 text-brand" />
      )}
      <span className="text-sm font-extrabold">{title}</span>
      <span className="text-[10px] text-muted-foreground">{subtitle}</span>
    </button>
  );
}
