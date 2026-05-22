"use client";

import { useState } from "react";

import { ChatErrorBoundary } from "@/components/inquiry/chat-error-boundary";
import { ChatPanel } from "@/components/inquiry/chat-panel";
import { ServicesTable } from "@/components/inquiry/services-table";
import { SiteFooter } from "@/components/inquiry/site-footer";
import { SiteHeader } from "@/components/inquiry/site-header";
import { Button } from "@/components/ui/button";
import type { LogisticsService } from "@/lib/data/services";
import { cn } from "@/lib/utils";

interface InquiryTopPageProps {
  services: LogisticsService[];
}

export function InquiryTopPage({ services }: InquiryTopPageProps) {
  const [chatOpen, setChatOpen] = useState(false);
  const [chatResetKey, setChatResetKey] = useState(0);

  const openChat = () => setChatOpen(true);

  return (
    <div className="flex min-h-screen flex-col bg-white text-foreground">
      <SiteHeader onInquiryClick={openChat} inquiryActive={chatOpen} />

      <div
        className={cn(
          "grid min-h-0 flex-1",
          chatOpen
            ? "lg:grid-cols-[minmax(0,1fr)_min(100%,520px)]"
            : "grid-cols-1",
        )}
      >
        <main className="min-w-0">
          <section className="relative overflow-hidden bg-gradient-to-br from-[#1e3a5f] via-[#234b73] to-[#2563eb] text-white">
            <div className="mx-auto max-w-7xl px-4 py-20 md:px-6 md:py-28">
              <p className="mb-4 text-sm font-medium tracking-widest text-sky-200">
                SERVICE
              </p>
              <h1 className="max-w-3xl text-3xl font-bold leading-tight md:text-5xl">
                物流システムと
                <br />
                アウトソーシングのセイノー情報サービス
              </h1>
              <p className="mt-6 max-w-2xl text-base leading-8 text-slate-200 md:text-lg">
                最新のITでお客様の物流業務を変革。計画から運用まで、ロジスティクスをトータルで支援します。
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Button
                  type="button"
                  onClick={openChat}
                  className="rounded-full bg-white text-[#1e3a5f] hover:bg-slate-100"
                >
                  問い合わせ
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="rounded-full border-white/40 bg-white/10 text-white hover:bg-white/20"
                  asChild
                >
                  <a href="#service">サービスを見る</a>
                </Button>
              </div>
            </div>
          </section>

          <section id="service" className="mx-auto max-w-7xl px-4 py-16 md:px-6 md:py-24">
            <div className="mb-10 text-center">
              <p className="text-sm font-semibold tracking-[0.25em] text-[#2563eb]">
                SERVICE
              </p>
              <h2 className="mt-3 text-3xl font-bold text-[#1e3a5f] md:text-4xl">
                サービス
              </h2>
              <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
                最新のITでお客様の業務を変革。物流ITクラウドと物流業務クラウドを中心にご提供します。
              </p>
            </div>

            <ServicesTable services={services} />
          </section>

          <section
            id="case"
            className="border-t border-border bg-slate-50 py-16 md:py-20"
          >
            <div className="mx-auto max-w-7xl px-4 md:px-6">
              <p className="text-sm font-semibold tracking-[0.25em] text-[#2563eb]">
                CASE STUDY
              </p>
              <h2 className="mt-3 text-2xl font-bold text-[#1e3a5f] md:text-3xl">
                導入事例
              </h2>
              <p className="mt-4 max-w-2xl text-muted-foreground">
                日本を代表する企業から数多くのご依頼を頂いております。
              </p>
            </div>
          </section>

          <SiteFooter />
        </main>

        {chatOpen ? (
          <ChatErrorBoundary
            key={chatResetKey}
            onReset={() => setChatResetKey((k) => k + 1)}
          >
            <ChatPanel className="sticky top-[72px] h-[calc(100vh-72px)]" />
          </ChatErrorBoundary>
        ) : null}
      </div>
    </div>
  );
}
