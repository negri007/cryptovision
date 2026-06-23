import { z } from 'zod';

export const transactionSchema = z.object({
  symbol: z.string().min(1, 'Símbolo é obrigatório'),
  assetType: z.enum(['crypto', 'stock']),
  type: z.enum(['buy', 'sell', 'transfer_in', 'transfer_out', 'staking_reward', 'airdrop']),
  quantity: z.number().positive('Quantidade deve ser maior que zero'),
  price: z.number().min(0, 'Preço não pode ser negativo'),
  fee: z.number().min(0).optional(),
  notes: z.string().optional(),
  executedAt: z.number(),
});

export const alertSchema = z.object({
  symbol: z.string().min(1),
  assetType: z.enum(['crypto', 'stock']),
  conditionType: z.enum(['price_above', 'price_below', 'change_percent']),
  conditionValue: z.number(),
});

export const profileSchema = z.object({
  name: z.string().min(2),
  riskProfile: z.enum(['conservative', 'moderate', 'aggressive']).optional(),
});
