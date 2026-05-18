export function SiteFooter() {
  return (
    <footer className="bg-[#1e3a5f] text-slate-200">
      <div className="mx-auto grid max-w-7xl gap-12 px-4 py-16 md:grid-cols-2 lg:grid-cols-4 md:px-6">
        <div>
          <p className="text-lg font-bold text-white">セイノー情報サービス</p>
          <p className="mt-2 text-sm text-slate-300">
            物流システムとアウトソーシングのトータルソリューション
          </p>
        </div>

        <div>
          <p className="mb-4 font-semibold text-white">サービス</p>
          <ul className="space-y-2 text-sm text-slate-300">
            <li>物流ITクラウド</li>
            <li>物流業務クラウド</li>
            <li>ロジスティクス・エージェント</li>
            <li>KPIダッシュボード</li>
          </ul>
        </div>

        <div>
          <p className="mb-4 font-semibold text-white">企業情報</p>
          <ul className="space-y-2 text-sm text-slate-300">
            <li>会社概要</li>
            <li>導入事例</li>
            <li>採用情報</li>
            <li>ニュース</li>
          </ul>
        </div>

        <div>
          <p className="mb-4 font-semibold text-white">お問い合わせ</p>
          <ul className="space-y-2 text-sm text-slate-300">
            <li>東京都</li>
            <li>info@siscloud.jp</li>
            <li>資料請求・ご相談</li>
          </ul>
        </div>
      </div>

      <div className="border-t border-white/10 py-6 text-center text-xs text-slate-400">
        © 2026 Seino Information Service. All Rights Reserved.
      </div>
    </footer>
  );
}
