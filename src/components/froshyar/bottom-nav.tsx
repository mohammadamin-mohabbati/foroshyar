"use client";

/* نویگیشن پایین + منوی بیشتر */

import { useState } from "react";
import {
  FileText,
  Home,
  Info,
  MoreHorizontal,
  Package,
  Settings,
  User,
  Users,
} from "lucide-react";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerTrigger } from "@/components/ui/drawer";
import { cn } from "@/lib/utils";
import { useStore, type Screen } from "@/lib/store";

export type TabId = "home" | "invoices" | "customers" | "products";

const TABS: { id: TabId; label: string; icon: typeof Home }[] = [
  { id: "home", label: "خانه", icon: Home },
  { id: "invoices", label: "فاکتورها", icon: FileText },
  { id: "customers", label: "مشتریان", icon: Users },
  { id: "products", label: "کالاها", icon: Package },
];

export function BottomNav({
  active,
  onTab,
  onSettings,
  onAbout,
}: {
  active: TabId;
  onTab: (t: TabId) => void;
  onSettings: () => void;
  onAbout: () => void;
}) {
  const [moreOpen, setMoreOpen] = useState(false);
  const profile = useStore((s) => s.profile);

  return (
    <nav
      aria-label="نویگیشن اصلی"
      className="pb-safe fixed inset-x-0 bottom-0 z-40 border-t bg-card/95 backdrop-blur"
    >
      <div className="mx-auto flex h-16 w-full max-w-md items-stretch justify-around px-2">
        {TABS.map((tab) => {
          const isActive = active === tab.id;
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => onTab(tab.id)}
              aria-current={isActive ? "page" : undefined}
              className={cn(
                "relative flex flex-1 flex-col items-center justify-center gap-1 rounded-xl transition-colors active:scale-95",
                isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"
              )}
            >
              {isActive && <span className="absolute top-1 h-1 w-8 rounded-full bg-primary" />}
              <Icon className={cn("h-5 w-5", isActive && "stroke-[2.4]")} />
              <span className={cn("text-[10px]", isActive ? "font-bold" : "font-medium")}>
                {tab.label}
              </span>
            </button>
          );
        })}

        <Drawer open={moreOpen} onOpenChange={setMoreOpen}>
          <DrawerTrigger asChild>
            <button
              className={cn(
                "flex flex-1 flex-col items-center justify-center gap-1 rounded-xl transition-colors active:scale-95",
                moreOpen ? "text-primary" : "text-muted-foreground hover:text-foreground"
              )}
              aria-label="بیشتر"
            >
              <MoreHorizontal className="h-5 w-5" />
              <span className="text-[10px] font-medium">بیشتر</span>
            </button>
          </DrawerTrigger>
          <DrawerContent className="mx-auto max-w-md">
            <DrawerHeader className="pb-2">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-full bg-tint">
                  {profile.avatar ? (
                    <img src={profile.avatar} alt="پروفایل" className="h-full w-full object-cover" />
                  ) : (
                    <User className="h-5 w-5 text-brand" />
                  )}
                </div>
                <div className="text-right">
                  <DrawerTitle className="text-sm">{profile.name || "کاربر فروش‌یار"}</DrawerTitle>
                  <p className="text-xs text-muted-foreground">{profile.businessName}</p>
                </div>
              </div>
            </DrawerHeader>
            <div className="space-y-1 p-4 pt-0">
              <MoreItem
                icon={Settings}
                label="تنظیمات"
                onClick={() => {
                  setMoreOpen(false);
                  onSettings();
                }}
              />
              <MoreItem
                icon={Info}
                label="درباره ما"
                onClick={() => {
                  setMoreOpen(false);
                  onAbout();
                }}
              />
            </div>
          </DrawerContent>
        </Drawer>
      </div>
    </nav>
  );
}

function MoreItem({
  icon: Icon,
  label,
  onClick,
}: {
  icon: typeof Settings;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="flex w-full items-center gap-3 rounded-2xl border bg-card p-3.5 text-sm font-bold transition-colors hover:bg-accent active:scale-[0.98]"
    >
      <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-tint">
        <Icon className="h-5 w-5 text-brand" />
      </span>
      {label}
    </button>
  );
}
