export interface LogisticsService {
  id: string;
  name: string;
  category: string;
  description: string;
  highlight?: boolean;
}

/** Service list aligned with https://www.siscloud.jp/ */
export const logisticsServices: LogisticsService[] = [
  {
    id: "logistics-it-cloud",
    name: "物流ITクラウド",
    category: "クラウド",
    description:
      "計画・運営管理から運用まで幅広いビジネス領域をロジスティクスITサービスから最適な組合せをご提供します。",
    highlight: true,
  },
  {
    id: "logistics-ops-cloud",
    name: "物流業務クラウド",
    category: "アウトソーシング",
    description:
      "培ったノウハウと最新技術の活用で業務を再構築し、お客様の本業への集中を促進します。",
    highlight: true,
  },
  {
    id: "wms-tms",
    name: "WMS / TMS 連携",
    category: "システム連携",
    description:
      "倉庫・配送システムと連携し、在庫・輸配送状況をリアルタイムに可視化します。",
  },
  {
    id: "logistics-agent",
    name: "ロジスティクス・エージェント",
    category: "AI",
    description:
      "問い合わせ対応、進捗確認、異常検知をAIエージェントが支援します。",
    highlight: true,
  },
  {
    id: "kpi-dashboard",
    name: "KPIダッシュボード",
    category: "分析",
    description:
      "配送遅延率・在庫回転率などのKPIをリアルタイムで分析します。",
  },
  {
    id: "route-optimization",
    name: "配送最適化",
    category: "最適化",
    description:
      "配送ルートや積載効率をAIで最適化し、物流コストを削減します。",
  },
];
