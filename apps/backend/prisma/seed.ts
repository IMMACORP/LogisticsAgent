import { PrismaClient } from '@prisma/client';

import { seedConversations } from './seeds/conversations';
import { seedInventory } from './seeds/inventory';
import { seedShipments } from './seeds/shipments';

const prisma = new PrismaClient();

async function main(): Promise<void> {
  console.log('🌱 Seeding database...\n');

  const shipmentCount = await seedShipments(prisma);
  console.log(`✓ Shipments: ${shipmentCount} records`);

  const inventoryCount = await seedInventory(prisma);
  console.log(`✓ Inventory: ${inventoryCount} records`);

  const { conversations, messages } = await seedConversations(prisma);
  console.log(`✓ Conversations: ${conversations} sessions, ${messages} messages`);

  console.log('\n✅ Seed completed.');
}

main()
  .catch((error: unknown) => {
    console.error('❌ Seed failed:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
