import type { z } from 'zod';
import type { analyzeFarmCosts } from '@/ai/flows/analyze-farm-costs';

type AnalyzeFarmCostsInput = Parameters<typeof analyzeFarmCosts>[0];

export type LivestockPurchase = AnalyzeFarmCostsInput['livestockPurchases'][0] & { id: string };
export type MedicineExpense = AnalyzeFarmCostsInput['medicineExpenses'][0] & { id: string };
export type FeedCost = AnalyzeFarmCostsInput['feedCosts'][0] & { id: string };
export type LaborCost = AnalyzeFarmCostsInput['laborCosts'][0] & { id: string };
export type FarmExpense = AnalyzeFarmCostsInput['farmExpenses'][0] & { id: string };

export type AnimalSale = {
  id: string;
  saleDate: string;
  buyerName: string;
  buyerVillage: string;
  animalCount: number;
  animalWeightKg: number;
  salePrice: number;
  amountReceived: number;
  outstandingDuesFromBuyer: number;
};

export type TrackedSheep = {
  id: string;
  tagId: string;
  currentWeight: number;
  previousWeight?: number;
  age: number; // in months
  photoDataUrl?: string;
};

export type DeadAnimal = {
  id: string;
  dateOfDeath: string;
  sheepCount: number;
  tagId?: string;
  causeOfDeath: string;
  notes?: string;
};

export type HealthTask = {
  id: string;
  taskName: string;
  dewormerName?: 'Albendazole' | 'Fenbendazole' | 'Ivermectin';
  dosePerKg?: number;
  totalSheepTreated?: number;
  lastAdministered: string;
  nextDueDate: string;
  frequency: 'Once' | 'Daily' | 'Monthly' | 'Every 2 Months' | 'Every 6 Months' | 'Annually';
  notes?: string;
};

    
