import type { Prisma, PrismaClient } from '@prisma/client';

export const inventorySeeds: Prisma.InventoryCreateInput[] = [
  {
    warehouseCode: 'TKY-DC01',
    itemCode: 'SKU-AUTO-ECU-001',
    itemName: '自動車用ECU（エンジン制御ユニット）',
    quantity: 420,
    reservedQuantity: 48,
    unit: '個',
    metadata: {
      warehouseName: '東京流通センター',
      location: 'A-12-03',
      lotManaged: true,
      abcRank: 'A',
    },
  },
  {
    warehouseCode: 'TKY-DC01',
    itemCode: 'SKU-MOTOR-HOME-002',
    itemName: '家電用インバータモーター（洗濯機向け）',
    quantity: 1850,
    reservedQuantity: 120,
    unit: '個',
    metadata: {
      warehouseName: '東京流通センター',
      location: 'B-04-11',
      abcRank: 'B',
    },
  },
  {
    warehouseCode: 'TKY-DC01',
    itemCode: 'SKU-BOX-003',
    itemName: '段ボール資材（60サイズ・強化型）',
    quantity: 12400,
    reservedQuantity: 800,
    unit: '枚',
    metadata: {
      warehouseName: '東京流通センター',
      location: 'C-01-01',
      abcRank: 'C',
    },
  },
  {
    warehouseCode: 'OSA-DC02',
    itemCode: 'SKU-AUTO-ECU-001',
    itemName: '自動車用ECU（エンジン制御ユニット）',
    quantity: 96,
    reservedQuantity: 24,
    unit: '個',
    metadata: {
      warehouseName: '大阪ハブ',
      location: 'A-03-07',
      replenishmentFrom: 'TKY-DC01',
    },
  },
  {
    warehouseCode: 'OSA-DC02',
    itemCode: 'SKU-MED-DEVICE-004',
    itemName: '医療機器部品（滅菌済ディスポーザブル）',
    quantity: 3200,
    reservedQuantity: 450,
    unit: '箱',
    metadata: {
      warehouseName: '大阪ハブ',
      location: 'D-02-05',
      temperatureZone: '常温',
      expiryManaged: true,
    },
  },
  {
    warehouseCode: 'NGO-DC03',
    itemCode: 'SKU-AUTO-HARNESS-005',
    itemName: '自動車用ワイヤーハーネス（EV向け）',
    quantity: 680,
    reservedQuantity: 90,
    unit: 'セット',
    metadata: {
      warehouseName: '名古屋拠点',
      location: 'A-08-02',
      jitSupplier: true,
    },
  },
  {
    warehouseCode: 'NGO-DC03',
    itemCode: 'SKU-CHEM-006',
    itemName: '工業用潤滑油（20Lドラム）',
    quantity: 42,
    reservedQuantity: 6,
    unit: '本',
    metadata: {
      warehouseName: '名古屋拠点',
      location: 'E-01-03',
      hazmat: true,
      fireZone: '危険物第4類',
    },
  },
  {
    warehouseCode: 'FUK-WH04',
    itemCode: 'SKU-SEMI-007',
    itemName: '半導体パッケージ（BGA）',
    quantity: 15800,
    reservedQuantity: 2100,
    unit: '個',
    metadata: {
      warehouseName: '福岡倉庫',
      location: 'A-01-01',
      esdManaged: true,
      cleanRoom: true,
    },
  },
  {
    warehouseCode: 'FUK-WH04',
    itemCode: 'SKU-FOOD-008',
    itemName: '冷凍食品（業務用冷凍ピザ）',
    quantity: 540,
    reservedQuantity: 60,
    unit: 'ケース',
    metadata: {
      warehouseName: '福岡倉庫',
      location: 'F-03-02',
      temperatureZone: '冷凍（-18℃）',
      fifoRequired: true,
    },
  },
  {
    warehouseCode: 'SPK-DC05',
    itemCode: 'SKU-FISH-009',
    itemName: '水産加工品（冷蔵・刺身用）',
    quantity: 88,
    reservedQuantity: 12,
    unit: 'ケース',
    metadata: {
      warehouseName: '札幌流通センター',
      location: 'F-01-04',
      temperatureZone: '冷蔵（0-4℃）',
      shelfLifeDays: 3,
    },
  },
  {
    warehouseCode: 'SPK-DC05',
    itemCode: 'SKU-BOX-003',
    itemName: '段ボール資材（60サイズ・強化型）',
    quantity: 3200,
    reservedQuantity: 200,
    unit: '枚',
    metadata: {
      warehouseName: '札幌流通センター',
      location: 'C-02-01',
    },
  },
];

export async function seedInventory(prisma: PrismaClient): Promise<number> {
  let count = 0;

  for (const data of inventorySeeds) {
    await prisma.inventory.upsert({
      where: {
        warehouseCode_itemCode: {
          warehouseCode: data.warehouseCode,
          itemCode: data.itemCode,
        },
      },
      create: data,
      update: {
        itemName: data.itemName,
        quantity: data.quantity,
        reservedQuantity: data.reservedQuantity,
        unit: data.unit,
        metadata: data.metadata,
      },
    });
    count += 1;
  }

  return count;
}
