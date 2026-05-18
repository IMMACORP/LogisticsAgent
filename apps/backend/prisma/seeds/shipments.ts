import type { Prisma, PrismaClient } from '@prisma/client';

const hoursFromNow = (hours: number): Date =>
  new Date(Date.now() + hours * 60 * 60 * 1000);

const daysFromNow = (days: number): Date =>
  new Date(Date.now() + days * 24 * 60 * 60 * 1000);

export const shipmentSeeds: Prisma.ShipmentCreateInput[] = [
  {
    trackingNumber: 'SHP-2026-001',
    shipmentStatus: 'DELAYED',
    origin: '東京流通センター（TKY-DC01）',
    destination: '大阪府吹田市（納入先：トヨタ部品センター）',
    currentLocation: '大阪ハブ（OSA-DC02）',
    eta: hoursFromNow(4),
    delayReason:
      '名神高速道路の渋滞により、幹線便（夜間便）の到着が120分遅延。代替ルート（第二京阪経由）への切替を検討中。',
    customerName: 'トヨタ部品センター',
    metadata: {
      serviceType: '路線便',
      vehicleType: '10tウィング車',
      weightKg: 2840,
      pallets: 6,
      priority: 'high',
    },
  },
  {
    trackingNumber: 'SHP-2026-002',
    shipmentStatus: 'IN_TRANSIT',
    origin: '名古屋拠点（NGO-DC03）',
    destination: '愛知県豊田市（納入先：デンソー豊田工場）',
    currentLocation: '東名高速 豊田IC付近',
    eta: hoursFromNow(2),
    customerName: 'デンソー株式会社',
    metadata: {
      serviceType: 'チャーター便',
      vehicleType: '4t箱車',
      weightKg: 920,
      temperatureZone: '常温',
    },
  },
  {
    trackingNumber: 'SHP-2026-003',
    shipmentStatus: 'IN_TRANSIT',
    origin: '福岡倉庫（FUK-WH04）',
    destination: '熊本県菊陽町（納入先：ソニーセミコンダクタ）',
    currentLocation: '九州自動車道 熊本IC',
    eta: hoursFromNow(6),
    customerName: 'ソニーセミコンダクタソリューションズ',
    metadata: {
      serviceType: '路線便',
      vehicleType: '10tウィング車',
      weightKg: 1560,
      hazmat: false,
    },
  },
  {
    trackingNumber: 'SHP-2026-004',
    shipmentStatus: 'PENDING',
    origin: '埼玉県川口市（集荷拠点）',
    destination: '神奈川県横浜市（納入先：日立物流横浜DC）',
    currentLocation: '出荷待ち（ピッキング完了）',
    eta: daysFromNow(1),
    customerName: '日立物流株式会社',
    metadata: {
      serviceType: '宅配便連携',
      pickingStatus: '完了',
      shippingInstructionNo: 'SI-2026-0412',
    },
  },
  {
    trackingNumber: 'SHP-2026-005',
    shipmentStatus: 'DELIVERED',
    origin: '千葉県市川市（TKY-DC01 出荷）',
    destination: '東京都江東区（納入先：ヤマト運輸 東京ベース）',
    currentLocation: '着荷済み',
    eta: daysFromNow(-1),
    customerName: 'ヤマト運輸株式会社',
    metadata: {
      serviceType: '路線便',
      proofOfDelivery: '電子サイン受領',
      deliveredAt: daysFromNow(-1).toISOString(),
    },
  },
  {
    trackingNumber: 'SHP-2026-006',
    shipmentStatus: 'DELAYED',
    origin: '北海道札幌市（SPK-DC05）',
    destination: '宮城県仙台市（納入先：東北電子部品）',
    currentLocation: '青森県八戸市 中継ターミナル',
    eta: daysFromNow(2),
    delayReason:
      '津軽海峡フェリー欠航のため、本州側への横持ち輸送に切替。ETAを48時間延長。',
    customerName: '東北電子部品株式会社',
    metadata: {
      serviceType: 'フェリー連携便',
      vehicleType: '10tウィング車',
      transshipment: true,
    },
  },
  {
    trackingNumber: 'SHP-2026-007',
    shipmentStatus: 'IN_TRANSIT',
    origin: '静岡県袋井市（袋井物流センター）',
    destination: '愛知県名古屋市（納入先：トヨタ自動車 名古屋工場）',
    currentLocation: '新東名高速 浜松SA',
    eta: hoursFromNow(8),
    customerName: 'トヨタ自動車株式会社',
    metadata: {
      serviceType: 'JIT便',
      vehicleType: '4t箱車',
      jitWindow: '14:00-15:00',
    },
  },
  {
    trackingNumber: 'SHP-2026-008',
    shipmentStatus: 'CANCELLED',
    origin: '大阪府堺市（OSA-DC02 出荷）',
    destination: '兵庫県神戸市（納入先：神戸製鋼）',
    currentLocation: '出荷キャンセル',
    delayReason: '荷主都合による出荷中止（受注キャンセル）',
    customerName: '株式会社神戸製鋼所',
    metadata: {
      cancelReasonCode: 'SHIPPER_REQUEST',
      cancelledAt: daysFromNow(-3).toISOString(),
    },
  },
];

export async function seedShipments(prisma: PrismaClient): Promise<number> {
  let count = 0;

  for (const data of shipmentSeeds) {
    await prisma.shipment.upsert({
      where: { trackingNumber: data.trackingNumber },
      create: data,
      update: {
        shipmentStatus: data.shipmentStatus,
        origin: data.origin,
        destination: data.destination,
        currentLocation: data.currentLocation,
        eta: data.eta,
        delayReason: data.delayReason,
        customerName: data.customerName,
        metadata: data.metadata,
      },
    });
    count += 1;
  }

  return count;
}
