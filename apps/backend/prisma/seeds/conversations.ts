import type { PrismaClient } from '@prisma/client';

const minutesAgo = (minutes: number): Date =>
  new Date(Date.now() - minutes * 60 * 1000);

type ConversationSeed = {
  externalId: string;
  userId: string;
  status: string;
  currentAgent: string;
  summary: string;
  metadata: Record<string, unknown>;
  messages: Array<{
    role: string;
    agentType?: string;
    content: string;
    intent?: string;
    minutesAgo: number;
    metadata?: Record<string, unknown>;
  }>;
};

export const conversationSeeds: ConversationSeed[] = [
  {
    externalId: 'conv-shipment-delay-001',
    userId: 'emp-10482',
    status: 'active',
    currentAgent: 'logistics',
    summary: 'SHP-2026-001 の配送遅延確認と代替ルート提案',
    metadata: {
      channel: 'web',
      department: '調達部',
      language: 'ja',
    },
    messages: [
      {
        role: 'user',
        content:
          'SHP-2026-001 の配送状況を確認してください。顧客から到着遅延の問い合わせが入っています。',
        intent: 'shipment_status_inquiry',
        minutesAgo: 45,
      },
      {
        role: 'assistant',
        agentType: 'logistics',
        content: `## 配送状況（SHP-2026-001）

| 項目 | 内容 |
|------|------|
| 送り状番号 | SHP-2026-001 |
| ステータス | **DELAYED（遅延）** |
| 現在地 | 大阪ハブ（OSA-DC02） |
| 納入先 | トヨタ部品センター（大阪府吹田市） |
| 遅延理由 | 名神高速道路渋滞により120分遅延 |

### 推奨アクション
1. 第二京阪経由の代替ルートへ切替
2. 荷主（トヨタ部品センター）へETA更新通知
3. 優先配送（チャーター便）への切替を検討`,
        intent: 'shipment_status_response',
        minutesAgo: 44,
        metadata: { confidence: 0.94, trackingNumber: 'SHP-2026-001' },
      },
      {
        role: 'user',
        content: '代替ルートへの切替をお願いします。顧客への通知文面も作成してください。',
        intent: 'reroute_request',
        minutesAgo: 40,
      },
      {
        role: 'assistant',
        agentType: 'logistics',
        content: `代替ルート（第二京阪経由）への切替手配を開始しました。

**顧客通知文面（案）**
> 平素よりお世話になっております。送り状番号 SHP-2026-001 につきまして、名神高速道路の渋滞により到着が約120分遅延しております。現在、第二京阪経由の代替ルートで輸送中です。更新ETAは本日17:30頃を見込んでおります。`,
        intent: 'reroute_confirmed',
        minutesAgo: 39,
        metadata: { action: 'reroute_initiated' },
      },
    ],
  },
  {
    externalId: 'conv-inventory-check-002',
    userId: 'emp-22031',
    status: 'closed',
    currentAgent: 'logistics',
    summary: 'TKY-DC01 の ECU 在庫確認と大阪ハブへの横持ち依頼',
    metadata: {
      channel: 'web',
      department: '倉庫管理',
      language: 'ja',
    },
    messages: [
      {
        role: 'user',
        content:
          '東京流通センター（TKY-DC01）の SKU-AUTO-ECU-001 の在庫数と引当可能数を教えてください。',
        intent: 'inventory_inquiry',
        minutesAgo: 180,
      },
      {
        role: 'assistant',
        agentType: 'logistics',
        content: `## 在庫照会結果

**拠点**: 東京流通センター（TKY-DC01）
**品目**: SKU-AUTO-ECU-001（自動車用ECU）

| 項目 | 数量 |
|------|------|
| 在庫数 | 420 個 |
| 引当済 | 48 個 |
| **引当可能数** | **372 個** |

棚番: A-12-03（ロット管理対象）`,
        intent: 'inventory_response',
        minutesAgo: 179,
        metadata: { warehouseCode: 'TKY-DC01', itemCode: 'SKU-AUTO-ECU-001' },
      },
      {
        role: 'user',
        content:
          '大阪ハブ（OSA-DC02）の在庫が不足しているので、50個の横持ち出荷を手配できますか？',
        intent: 'inventory_transfer_request',
        minutesAgo: 175,
      },
      {
        role: 'assistant',
        agentType: 'logistics',
        content:
          'TKY-DC01 から OSA-DC02 への横持ち出荷（50個）を手配可能です。幹線便（夜間便）での出荷を予定しており、着荷は翌営業日午前中を見込んでいます。出荷指示番号 SI-2026-0518 を発行しました。',
        intent: 'transfer_scheduled',
        minutesAgo: 174,
        metadata: { shippingInstructionNo: 'SI-2026-0518', quantity: 50 },
      },
    ],
  },
  {
    externalId: 'conv-reception-routing-003',
    userId: 'emp-00891',
    status: 'active',
    currentAgent: 'reception',
    summary: '受付エージェントによる物流問い合わせの振り分け',
    metadata: {
      channel: 'web',
      department: '総務',
      language: 'ja',
    },
    messages: [
      {
        role: 'user',
        content:
          '名古屋拠点から出荷した荷物の到着予定と、倉庫の在庫残数をまとめて確認したいです。',
        intent: 'general_logistics_inquiry',
        minutesAgo: 15,
      },
      {
        role: 'assistant',
        agentType: 'reception',
        content:
          '物流に関するお問い合わせですね。配送状況の確認と在庫照会の2点について、ロジスティクス・エージェントへ引き継ぎます。送り状番号または品目コード（SKU）をお持ちでしたらお知らせください。',
        intent: 'handoff_to_logistics',
        minutesAgo: 14,
        metadata: { handoffAgent: 'logistics', confidence: 0.91 },
      },
      {
        role: 'user',
        content: '送り状番号 SHP-2026-002、品目 SKU-AUTO-HARNESS-005 です。',
        intent: 'provide_identifiers',
        minutesAgo: 12,
      },
      {
        role: 'system',
        content: '会話を logistics エージェントへルーティングしました。',
        minutesAgo: 11,
        metadata: { routedTo: 'logistics' },
      },
      {
        role: 'assistant',
        agentType: 'logistics',
        content: `## 照会結果

### 配送（SHP-2026-002）
- **ステータス**: IN_TRANSIT（輸送中）
- **現在地**: 東名高速 豊田IC付近
- **納入先**: デンソー豊田工場
- **ETA**: 約2時間後

### 在庫（NGO-DC03 / SKU-AUTO-HARNESS-005）
- **在庫数**: 680 セット
- **引当可能数**: 590 セット`,
        intent: 'combined_logistics_response',
        minutesAgo: 10,
        metadata: {
          trackingNumber: 'SHP-2026-002',
          warehouseCode: 'NGO-DC03',
          itemCode: 'SKU-AUTO-HARNESS-005',
        },
      },
    ],
  },
];

export async function seedConversations(prisma: PrismaClient): Promise<{
  conversations: number;
  messages: number;
}> {
  let conversationCount = 0;
  let messageCount = 0;

  for (const seed of conversationSeeds) {
    const existing = await prisma.conversation.findFirst({
      where: {
        metadata: {
          path: ['externalId'],
          equals: seed.externalId,
        },
      },
      include: { messages: true },
    });

    if (existing) {
      await prisma.message.deleteMany({
        where: { conversationId: existing.id },
      });
      await prisma.conversation.delete({ where: { id: existing.id } });
    }

    await prisma.conversation.create({
      data: {
        userId: seed.userId,
        status: seed.status,
        currentAgent: seed.currentAgent,
        summary: seed.summary,
        metadata: { ...seed.metadata, externalId: seed.externalId },
        messages: {
          create: seed.messages.map((message) => ({
            userId: message.role === 'user' ? seed.userId : null,
            role: message.role,
            agentType: message.agentType ?? null,
            content: message.content,
            intent: message.intent ?? null,
            metadata: message.metadata ?? null,
            createdAt: minutesAgo(message.minutesAgo),
            updatedAt: minutesAgo(message.minutesAgo),
          })),
        },
      },
    });

    conversationCount += 1;
    messageCount += seed.messages.length;
  }

  return { conversations: conversationCount, messages: messageCount };
}
