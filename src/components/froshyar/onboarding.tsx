"use client";

/* ورود اولیه: نام و کسب‌وکار */

import { useState } from "react";
import { ArrowLeft, Building2, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useStore } from "@/lib/store";
import { toast } from "sonner";

export function Onboarding() {
  const updateProfile = useStore((s) => s.updateProfile);
  const [name, setName] = useState("");
  const [business, setBusiness] = useState("");

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (name.trim().length < 2) {
      toast.error("لطفاً نام خود را وارد کنید");
      return;
    }
    if (business.trim().length < 2) {
      toast.error("لطفاً نام کسب‌وکار را وارد کنید");
      return;
    }
    updateProfile({
      name: name.trim(),
      businessName: business.trim(),
      onboarded: true,
    });
    toast.success("خوش آمدید! فروش‌یار آماده است");
  }

  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden bg-background">
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-64" aria-hidden="true">
        <svg className="absolute bottom-0 w-full" viewBox="0 0 390 180" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M0 90 C 80 30 180 140 270 90 C 330 57 365 80 390 66 L 390 180 L 0 180 Z" fill="var(--tint)" />
          <path d="M0 120 C 90 70 190 170 280 120 C 340 88 370 108 390 96 L 390 180 L 0 180 Z" fill="var(--brand)" opacity="0.16" />
        </svg>
      </div>

      <div className="relative z-10 mx-auto flex w-full max-w-md flex-1 flex-col px-6 pb-24 pt-20">
        <div className="flex flex-col items-center text-center">
          <img
            src="/icon.png"
            alt="آیکون فروش‌یار"
            className="h-20 w-20 rounded-2xl object-cover shadow-lg shadow-black/10"
          />
          <h1 className="mt-4 text-3xl font-extrabold text-brand">فروش‌یار</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            برای شروع، نام و کسب‌وکار خود را وارد کنید
          </p>
        </div>

        <form onSubmit={submit} className="mt-8 space-y-4">
          <div className="space-y-1.5">
            <label htmlFor="ob-name" className="text-sm font-bold">
              نام شما
            </label>
            <div className="relative">
              <User className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="ob-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="مثلاً: رضایی"
                className="h-12 rounded-xl bg-card pr-9"
                autoComplete="name"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label htmlFor="ob-biz" className="text-sm font-bold">
              نام کسب‌وکار
            </label>
            <div className="relative">
              <Building2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="ob-biz"
                value={business}
                onChange={(e) => setBusiness(e.target.value)}
                placeholder="مثلاً: فروشگاه لوازم خانگی"
                className="h-12 rounded-xl bg-card pr-9"
                autoComplete="organization"
              />
            </div>
          </div>

          <Button type="submit" className="mt-2 h-12 w-full rounded-xl text-base font-bold shadow-md shadow-primary/25">
            شروع
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </form>
      </div>
    </div>
  );
}
