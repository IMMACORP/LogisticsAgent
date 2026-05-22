import type { KnowledgeCategory } from '@inquiry-agent/shared-types';

export interface KnowledgeChunkSeed {
  chunkId: string;
  chunkIndex: number;
  content: string;
}

export interface KnowledgeDocumentSeed {
  documentId: string;
  documentCode: string;
  title: string;
  summary: string;
  category: KnowledgeCategory;
  language: string;
  sourceUrl: string;
  updatedAt: string;
  chunks: KnowledgeChunkSeed[];
}

export const knowledgeCorpusSeeds: KnowledgeDocumentSeed[] = [
  {
    documentId: '550e8400-e29b-41d4-a716-446655440001',
    documentCode: 'KB-IT-001',
    title: 'VPN接続トラブルシューティング（東京オフィス）',
    summary: 'VPN接続失敗時の確認手順と問い合わせ先',
    category: 'it_support',
    language: 'ja',
    sourceUrl: 'https://kb.example.internal/it/vpn-tokyo',
    updatedAt: '2026-04-01T00:00:00.000Z',
    chunks: [
      {
        chunkId: '550e8400-e29b-41d4-a716-446655440101',
        chunkIndex: 0,
        content:
          'VPN接続ができない場合は、まずオフィス拠点（東京／大阪／名古屋）の設定プロファイルが正しいか確認してください。GlobalProtect の再ログインを試し、それでも接続できない場合は証明書の有効期限を確認します。',
      },
      {
        chunkId: '550e8400-e29b-41d4-a716-446655440102',
        chunkIndex: 1,
        content:
          '社内ヘルプデスクへの連絡時は、端末名（資産番号）と発生時刻、エラーコードを添えてください。緊急時は #it-support チャンネルへエスカレーションしてください。',
      },
    ],
  },
  {
    documentId: '550e8400-e29b-41d4-a716-446655440002',
    documentCode: 'KB-LOG-010',
    title: '配送遅延時の顧客連絡テンプレート',
    summary: '遅延理由の記載例と代替案内の文面',
    category: 'logistics',
    language: 'ja',
    sourceUrl: 'https://kb.example.internal/logistics/delay-template',
    updatedAt: '2026-05-10T00:00:00.000Z',
    chunks: [
      {
        chunkId: '550e8400-e29b-41d4-a716-446655440201',
        chunkIndex: 0,
        content:
          '配送遅延の連絡では、送り状番号・現在地（ハブ名）・更新ETA・遅延理由（渋滞／天候／積載調整など）を明記してください。代替ルート（第二京阪経由等）を提示できる場合は併記します。',
      },
      {
        chunkId: '550e8400-e29b-41d4-a716-446655440202',
        chunkIndex: 1,
        content:
          '顧客向け文面例：「平素よりお世話になっております。送り状番号○○につきまして、○○の影響により到着が遅れております。現在、○○ハブにて積替えを行っており、到着予定は○月○日○時頃です。」',
      },
    ],
  },
  {
    documentId: '550e8400-e29b-41d4-a716-446655440003',
    documentCode: 'KB-HR-003',
    title: '有給休暇申請フロー（Workday）',
    summary: '申請期限と承認者の指定ルール',
    category: 'hr',
    language: 'ja',
    sourceUrl: 'https://kb.example.internal/hr/leave-workday',
    updatedAt: '2026-03-15T00:00:00.000Z',
    chunks: [
      {
        chunkId: '550e8400-e29b-41d4-a716-446655440301',
        chunkIndex: 0,
        content:
          '有給休暇は原則として取得希望日の5営業日前までに Workday で申請してください。上長承認後に人事部が最終確認します。繁忙期（期末）の取得制限については別紙ポリシーを参照してください。',
      },
    ],
  },
];
