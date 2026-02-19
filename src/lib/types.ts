import type { z } from 'zod';
import type { analyzeFarmCosts } from '@/ai/flows/analyze-farm-costs';

type AnalyzeFarmCostsInput = Parameters<typeof analyzeFarmCosts>[0];

export type LivestockPurchase = AnalyzeFarmCostsInput['livestockPurchases'][0];
export type MedicineExpense = AnalyzeFarmCostsInput['medicineExpenses'][0];
export type FeedCost = AnalyzeFarmCostsInput['feedCosts'][0];
export type LaborCost = AnalyzeFarmCostsInput['laborCosts'][0];

export type SalesTransaction = {
  id: string;
  date: string;
  buyerName: string;
  village: string;
  animalWeight: number;
  salePrice: number;
  outstandingDues: number;
  totalAmountReceived: number;
};
