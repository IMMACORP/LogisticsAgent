import { tool } from '@openai/agents';
import { checkStockAvailabilityInputSchema, reserveInventoryInputSchema, searchInventoryInputSchema, } from '../../schemas/inventory/inventory.schemas';
import { checkStockAvailability } from './check-stock-availability.tool';
import { reserveInventory } from './reserve-inventory.tool';
import { searchInventory } from './search-inventory.tool';
export const searchInventoryAgentTool = tool({
    name: 'searchInventory',
    description: '倉庫コード・品目コード・品目名で在庫を検索します。在庫数・引当済数・引当可能数を返します。',
    parameters: searchInventoryInputSchema,
    execute: async (input) => searchInventory(input),
});
export const checkStockAvailabilityAgentTool = tool({
    name: 'checkStockAvailability',
    description: '指定倉庫・品目の引当可能数が要求数量を満たすか照会します（出荷前の在庫確認に使用）。',
    parameters: checkStockAvailabilityInputSchema,
    execute: async (input) => checkStockAvailability(input),
});
export const reserveInventoryAgentTool = tool({
    name: 'reserveInventory',
    description: '指定倉庫・品目の在庫を引当します。トランザクション内で在庫ロック（プレースホルダ）を取得し、引当可能数を検証してから reserved_quantity を更新します。',
    parameters: reserveInventoryInputSchema,
    execute: async (input) => reserveInventory(input),
});
export const inventoryAgentTools = [
    searchInventoryAgentTool,
    checkStockAvailabilityAgentTool,
    reserveInventoryAgentTool,
];
export { checkStockAvailability } from './check-stock-availability.tool';
export { reserveInventory } from './reserve-inventory.tool';
export { searchInventory } from './search-inventory.tool';
