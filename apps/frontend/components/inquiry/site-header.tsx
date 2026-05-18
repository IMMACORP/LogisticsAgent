"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "#service", label: "サービス" },
  { href: "#case", label: "導入事例" },
  { href: "#seminar", label: "セミナー" },
  { href: "#column", label: "コラム" },
];

interface SiteHeaderProps {
  onInquiryClick: () => void;
  inquiryActive?: boolean;
}

export function SiteHeader({ onInquiryClick, inquiryActive }: SiteHeaderProps) {
  return (
    <header className="sticky top-0 z-50 border-b border-[#1e3a5f]/10 bg-white/95 shadow-sm backdrop-blur">
      <div className="mx-auto flex h-[72px] max-w-7xl items-center justify-between gap-6 px-4 md:px-6">
        <a href="#" className="flex min-w-0 items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded bg-[#1e3a5f] text-xs font-bold tracking-tight text-white">
            SIS
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-bold text-[#1e3a5f] md:text-base">
              セイノー情報サービス
            </p>
            <p className="truncate text-[10px] text-muted-foreground md:text-xs">
              物流システムとアウトソーシング
            </p>
          </div>
        </a>

        <nav className="hidden items-center gap-8 text-sm font-medium text-[#1e3a5f] lg:flex">
          {navItems.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="transition-colors hover:text-[#2563eb]"
            >
              {item.label}
            </a>
          ))}
        </nav>

        <Button
          type="button"
          onClick={onInquiryClick}
          className={cn(
            "shrink-0 rounded-full bg-[#1e3a5f] px-5 hover:bg-[#152a47]",
            inquiryActive && "ring-2 ring-[#2563eb] ring-offset-2",
          )}
        >
          問い合わせ
        </Button>
      </div>
    </header>
  );
}
