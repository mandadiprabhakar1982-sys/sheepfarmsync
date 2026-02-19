import type { z } from 'zod';
import type { analyzeFarmCosts } from '@/ai/flows/analyze-farm-costs';

type AnalyzeFarmCostsInput = Parameters<typeof analyzeFarmCosts>[0];

export type LivestockPurchase = AnalyzeFarmCostsInput['livestockPurchases'][0] & { id: string };
export type MedicineExpense = AnalyzeFarmCostsInput['medicineExpenses'][0] & { id: string };
export type FeedCost = AnalyzeFarmCostsInput['feedCosts'][0] & { id: string };
export type LaborCost = AnalyzeFarmCostsInput['laborCosts'][0] & { id: string };

export type SalesTransaction = {
  id: string;
  date: string;
  buyerName: string;
  village: string;
  animalCount: number;
  animalWeight: number;
  salePrice: number;
  outstandingDues: number;
  totalAmountReceived: number;
};

export type TrackedSheep = {
  id: string;
  tagId: string;
  weight: number;
  age: number; // in months
  photoDataUrl?: string;
};
