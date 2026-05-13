export default function LogisticsAgentTopPage() {
  const services = [
    {
      title: "WMS Integration",
      description:
        "倉庫管理システムとの連携により、在庫・入出荷状況をリアルタイムに可視化します。",
    },
    {
      title: "Transportation Optimization",
      description:
        "配送ルートや積載効率をAIで最適化し、物流コストを削減します。",
    },
    {
      title: "Logistics AI Agent",
      description:
        "問い合わせ対応、進捗確認、異常検知をAIエージェントが支援します。",
    },
    {
      title: "KPI Dashboard",
      description:
        "配送遅延率・在庫回転率などのKPIをリアルタイム分析します。",
    },
  ];
  const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

  return (
    <div className="min-h-screen bg-white text-slate-800">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-sky-600 text-lg font-bold text-white shadow-md">
              LA
            </div>
            <div>
              <div className="text-lg font-bold tracking-wide">
                Logistics Agent
              </div>
              <div className="text-xs text-slate-500">
                AI Powered Logistics Platform
              </div>
            </div>
          </div>

          <nav className="hidden items-center gap-10 text-sm font-medium text-slate-700 md:flex">
            <a className="transition hover:text-sky-600" href="#service">
              Service
            </a>
            <a className="transition hover:text-sky-600" href="#about">
              About
            </a>
            <a className="transition hover:text-sky-600" href="#case">
              Case Study
            </a>
            <a className="transition hover:text-sky-600" href="#contact">
              Contact
            </a>
          </nav>

          <button className="rounded-2xl bg-sky-600 px-5 py-2.5 text-sm font-semibold text-white shadow transition hover:bg-sky-700">
            お問い合わせ
          </button>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-sky-900 text-white">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute left-0 top-0 h-72 w-72 rounded-full bg-sky-500 blur-3xl" />
          <div className="absolute bottom-0 right-0 h-96 w-96 rounded-full bg-cyan-400 blur-3xl" />
        </div>

        <div className="relative mx-auto max-w-7xl px-6 py-28">
          <div className="max-w-3xl">
            <div className="mb-6 inline-flex items-center rounded-full border border-white/20 bg-white/10 px-4 py-1 text-sm backdrop-blur">
              Enterprise Logistics AI Platform
            </div>

            <h1 className="text-5xl font-bold leading-tight md:text-6xl">
              Logistics Operation を
              <br />
              AI Agent で進化させる
            </h1>

            <p className="mt-8 max-w-2xl text-lg leading-8 text-slate-200">
              配送計画、倉庫運用、問い合わせ対応をAIエージェントが統合支援。
              物流現場の意思決定を高速化します。
            </p>

            <div className="mt-10 flex flex-wrap gap-4">
              <button className="rounded-2xl bg-sky-500 px-7 py-4 font-semibold text-white transition hover:bg-sky-400">
                サービスを見る
              </button>

              <button className="rounded-2xl border border-white/30 bg-white/10 px-7 py-4 font-semibold backdrop-blur transition hover:bg-white/20">
                導入事例
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Main Split Layout */}
      <div className="grid min-h-[1200px] grid-cols-1 lg:grid-cols-[1fr_520px]">
        {/* Left Side */}
        <div>
          {/* Services */}
          <section id="service" className="mx-auto max-w-7xl px-6 py-24">
            <div className="mb-14 text-center">
              <div className="mb-4 text-sm font-semibold uppercase tracking-[0.3em] text-sky-600">
                Service
              </div>

              <h2 className="text-4xl font-bold text-slate-900">
                Logistics AI Services
              </h2>

              <p className="mx-auto mt-6 max-w-3xl text-lg leading-8 text-slate-600">
                AI・データ分析・システム連携を組み合わせ、物流業務全体を最適化します。
              </p>
            </div>

            <div className="grid gap-8 md:grid-cols-2">
              {services.map((service, index) => (
                <div
                  key={index}
                  className="group rounded-3xl border border-slate-200 bg-white p-8 shadow-sm transition hover:-translate-y-1 hover:shadow-xl"
                >
                  <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-sky-100 text-xl font-bold text-sky-700">
                    0{index + 1}
                  </div>

                  <h3 className="text-2xl font-bold text-slate-900">
                    {service.title}
                  </h3>

                  <p className="mt-5 leading-8 text-slate-600">
                    {service.description}
                  </p>

                  <div className="mt-8 text-sm font-semibold text-sky-600">
                    Learn More →
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* About */}
          <section
            id="about"
            className="bg-slate-50 py-24"
          >
            <div className="mx-auto grid max-w-7xl gap-16 px-6 lg:grid-cols-2 lg:items-center">
              <div>
                <div className="mb-4 text-sm font-semibold uppercase tracking-[0.3em] text-sky-600">
                  About
                </div>

                <h2 className="text-4xl font-bold leading-tight text-slate-900">
                  AIと物流業務を
                  <br />
                  シームレスに統合
                </h2>

                <p className="mt-8 leading-8 text-slate-600">
                  Logistics Agent は、WMS・TMS・ERPなど既存システムと接続し、
                  現場オペレーションを支援するエンタープライズ向けAI基盤です。
                </p>
              </div>

              <div className="rounded-[32px] border border-slate-200 bg-white p-8 shadow-xl">
                <div className="space-y-6">
                  <div className="rounded-2xl bg-slate-100 p-5">
                    <div className="text-sm text-slate-500">Integrated Agent</div>
                    <div className="mt-2 text-lg font-bold">
                      問い合わせ分析・Agent Routing
                    </div>
                  </div>

                  <div className="rounded-2xl bg-slate-100 p-5">
                    <div className="text-sm text-slate-500">Warehouse Agent</div>
                    <div className="mt-2 text-lg font-bold">
                      在庫確認・入出荷分析
                    </div>
                  </div>

                  <div className="rounded-2xl bg-slate-100 p-5">
                    <div className="text-sm text-slate-500">Transport Agent</div>
                    <div className="mt-2 text-lg font-bold">
                      配送遅延・ルート最適化
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>

        {/* Right Chat Panel */}
        <aside className="sticky top-20 h-[calc(100vh-80px)] border-l border-slate-200 bg-slate-50">
          <div className="flex h-full flex-col">
            {/* Chat Header */}
            <div className="border-b border-slate-200 bg-white px-6 py-5">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-lg font-bold text-slate-900">
                    Logistics Agent
                  </div>
                  <div className="mt-1 text-sm text-emerald-600">
                    ● Online
                  </div>
                </div>

                <button className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium transition hover:bg-slate-100">
                  New Chat
                </button>
              </div>
            </div>

            {/* TODO- Chat Result Area */}
            <div className="flex-1 overflow-y-auto px-6 py-6">
              <div className="space-y-6">
                {/* TODO- Assistant Message */}
                <div className="rounded-3xl bg-white p-6 shadow-sm">
                  <div className="mb-4 text-sm font-semibold text-sky-600">
                    Logistics Agent
                  </div>

                  <div className="prose prose-slate max-w-none text-sm leading-7">
                    <h3># Shipment Delay Analysis</h3>

                    <p>
                      以下の内容を確認しました：
                    </p>

                    <ul>
                      <li>配送番号: SHP-2026-001</li>
                      <li>現在地: Osaka Hub</li>
                      <li>遅延時間: 120分</li>
                    </ul>

                    <h4 className="bold">## 推奨アクション</h4>

                    <ol>
                      <li>代替ルートを利用</li>
                      <li>顧客へ通知</li>
                      <li>優先配送へ切替</li>
                    </ol>

                    <pre className="overflow-x-auto rounded-2xl bg-slate-900 p-4 text-slate-100">
{`{
  "priority": "high",
  "reroute": true,
  "estimated_delay": 120
}`}
                    </pre>
                  </div>
                </div>

                {/* User Message */}
                <div className="flex justify-end">
                  <div className="max-w-[85%] rounded-3xl bg-sky-600 px-5 py-4 text-sm leading-7 text-white shadow-lg">
                    SHP-2026-001 の配送状況を確認してください。
                  </div>
                </div>
              </div>
            </div>

            {/* Chat Input */}
            <div className="border-t border-slate-200 bg-white p-5">
              <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4 shadow-sm">
                <textarea
                  placeholder="物流に関するお問い合わせを入力してください..."
                  className="min-h-[110px] w-full resize-none border-none bg-transparent text-sm outline-none"
                />

                <div className="mt-4 flex items-center justify-between">
                  <div className="text-xs text-slate-400">
                    AI Agent connected to WMS / TMS
                  </div>

                  <button className="rounded-2xl bg-sky-600 px-6 py-3 text-sm font-semibold text-white shadow transition hover:bg-sky-700">
                    送信
                  </button>
                </div>
              </div>
            </div>
          </div>
        </aside>
      </div>

      {/* Footer */}
      <footer className="bg-slate-950 text-slate-300">
        <div className="mx-auto grid max-w-7xl gap-16 px-6 py-20 md:grid-cols-4">
          <div>
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-sky-600 text-lg font-bold text-white">
                LA
              </div>

              <div>
                <div className="font-bold text-white">Logistics Agent</div>
                <div className="text-sm text-slate-400">
                  AI Logistics Platform
                </div>
              </div>
            </div>

            <p className="mt-6 text-sm leading-7 text-slate-400">
              Enterprise AI solution for warehouse, transportation and logistics operation support.
            </p>
          </div>

          <div>
            <div className="mb-5 font-semibold text-white">Service</div>
            <ul className="space-y-3 text-sm text-slate-400">
              <li>WMS Integration</li>
              <li>TMS Optimization</li>
              <li>AI Agent</li>
              <li>KPI Dashboard</li>
            </ul>
          </div>

          <div>
            <div className="mb-5 font-semibold text-white">Company</div>
            <ul className="space-y-3 text-sm text-slate-400">
              <li>About Us</li>
              <li>Case Study</li>
              <li>Careers</li>
              <li>News</li>
            </ul>
          </div>

          <div>
            <div className="mb-5 font-semibold text-white">Contact</div>
            <ul className="space-y-3 text-sm text-slate-400">
              <li>Tokyo, Japan</li>
              <li>contact@logistics-agent.ai</li>
              <li>+81-3-0000-0000</li>
            </ul>
          </div>
        </div>

        <div className="border-t border-slate-800 py-6 text-center text-sm text-slate-500">
          © 2026 Logistics Agent. All Rights Reserved.
        </div>
      </footer>
    </div>
  );
}
