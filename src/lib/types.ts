import type { z } from 'zod';
import type { analyzeFarmCosts } from '@/ai/flows/analyze-farm-costs';

type AnalyzeFarmCostsInput = Parameters<typeof analyzeFarmCosts>[0];

export type LivestockPurchase = AnalyzeFarmCostsInput['livestockPurchases'][0] & { 
  id: string;
  ownerId?: string;
  ownerEmail?: string;
};

export type MedicineExpense = AnalyzeFarmCostsInput['medicineExpenses'][0] & { 
  id: string;
  ownerId?: string;
};

export type FeedCost = AnalyzeFarmCostsInput['feedCosts'][0] & { 
  id: string;
  ownerId?: string;
};

export type LaborCost = AnalyzeFarmCostsInput['laborCosts'][0] & { 
  id: string;
  ownerId?: string;
};

export type FarmExpense = AnalyzeFarmCostsInput['farmExpenses'][0] & { 
  id: string;
  ownerId?: string;
};

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
  isPublic?: boolean;
  ownerId?: string;
  ownerEmail?: string;
};

export type PublicSale = {
  id: string;
  sellerId: string;
  sellerEmail: string;
  sellerName?: string;
  saleDate: string;
  village: string;
  animalCount: number;
  totalWeight: number;
  askingPrice: number;
  notes?: string;
};

export type TrackedSheep = {
  id: string;
  tagId: string;
  currentWeight: number;
  previousWeight?: number;
  age: number; // in months
  photoDataUrl?: string;
  createdBy?: string;
  createdAt?: any;
  updatedAt?: any;
  ownerId?: string;
  ownerEmail?: string;
};

export type HealthTask = {
  id: string;
  taskName: 'Deworming' | 'Vaccination' | 'Vitamin & Liver Support' | 'Other';
  dewormerName?: 'Albendazole' | 'Fenbendazole' | 'Ivermectin';
  dosePerKg?: number;
  vaccineType?: 'ET + TT' | 'PPR' | 'Sheep Pox' | 'HS' | 'FMD' | 'Bluetongue';
  boosterRequired?: boolean;
  batchNumber?: string;
  supplementType?: 'B-Complex' | 'Liver Tonic' | 'Calcium' | 'Multivitamin' | 'Mineral Mixture';
  dosage?: string;
  cost?: number;
  totalSheepTreated?: number;
  lastAdministered: string;
  nextDueDate: string;
  frequency: 'Once' | 'Daily' | 'Monthly' | 'Every 2 Months' | 'Every 6 Months' | 'Annually';
  notes?: string;
  ownerId?: string;
};

export type DeadAnimal = {
  id: string;
  dateOfDeath: string;
  sheepCount: number;
  tagId?: string;
  causeOfDeath: string;
  notes?: string;
  ownerId?: string;
};

export type UserProfile = {
  id: string;
  email: string;
  displayName: string | null;
  createdAt: any;
  updatedAt?: any;
};