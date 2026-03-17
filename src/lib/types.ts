import type { z } from 'zod';
import type { analyzeFarmCosts } from '@/ai/flows/analyze-farm-costs';

type AnalyzeFarmCostsInput = Parameters<typeof analyzeFarmCosts>[0];

export type LivestockPurchase = AnalyzeFarmCostsInput['livestockPurchases'][0] & { 
  id: string; 
  _path?: string;
  createdBy?: string;
  creatorEmail?: string;
  creatorName?: string;
  imageUrl?: string;
};

export type MedicineExpense = AnalyzeFarmCostsInput['medicineExpenses'][0] & { 
  id: string; 
  _path?: string;
  createdBy?: string;
  creatorEmail?: string;
  creatorName?: string;
};

export type FeedCost = AnalyzeFarmCostsInput['feedCosts'][0] & { 
  id: string; 
  _path?: string;
  createdBy?: string;
  creatorEmail?: string;
  creatorName?: string;
};

export type LaborCost = AnalyzeFarmCostsInput['laborCosts'][0] & { 
  id: string; 
  _path?: string;
  createdBy?: string;
  creatorEmail?: string;
  creatorName?: string;
};

export type FarmExpense = AnalyzeFarmCostsInput['farmExpenses'][0] & { 
  id: string; 
  _path?: string;
  createdBy?: string;
  creatorEmail?: string;
  creatorName?: string;
  imageUrl?: string;
};

export type AnimalSale = {
  id: string;
  _path?: string;
  saleDate: string;
  buyerName: string;
  buyerVillage: string;
  animalCount: number;
  animalWeightKg: number;
  salePrice: number;
  amountReceived: number;
  outstandingDuesFromBuyer: number;
  isPublic?: boolean;
  createdBy?: string;
  creatorEmail?: string;
  creatorName?: string;
  imageUrl?: string;
};

export type PublicSale = {
  id: string;
  _path?: string;
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
  _path?: string;
  tagId: string;
  currentWeight: number;
  previousWeight?: number;
  age: number; // in months
  gender?: 'male' | 'female';
  breed?: string;
  imageUrl?: string;
  registrationDate?: string;
  color?: string;
  source?: string;
  healthStatus?: string;
  vaccination?: string;
  notes?: string;
  createdBy?: string;
  creatorEmail?: string;
  creatorName?: string;
  createdAt?: any;
  updatedAt?: any;
};

export type HealthTask = {
  id: string;
  _path?: string;
  date: string;
  sheepId: string;
  animalGroup: 'Lamb' | 'Adult' | 'Pregnant' | 'Ram';
  healthType: 'Vaccination' | 'Deworming' | 'Supplement' | 'Treatment';
  symptom: 'Fever' | 'Worms' | 'Cough' | 'Injury' | 'None' | 'Other';
  medicineName: string;
  dose: number;
  unit: 'ml' | 'mg' | 'tablet';
  route: 'Oral' | 'Injection';
  nextDueDate: string;
  administeredBy: string;
  notes?: string;
  cost: number;
  createdBy?: string;
  creatorEmail?: string;
  creatorName?: string;
};

export type DeadAnimal = {
  id: string;
  _path?: string;
  dateOfDeath: string;
  sheepCount: number;
  tagId?: string;
  causeOfDeath: string;
  notes?: string;
  createdBy?: string;
  creatorEmail?: string;
  creatorName?: string;
};

export type UserProfile = {
  id: string;
  _path?: string;
  email: string;
  displayName: string | null;
  role: 'collaborator' | 'admin' | 'viewer';
  createdAt: any;
  updatedAt?: any;
};

export interface BankLoan {
  id: string;
  _path?: string;
  bankName: string;
  totalLoan: number;
  totalTenure: number;
  balanceLoan: number;
  monthlyEmi: number;
  pendingTenure: number;
  interest: number;
  paymentDate?: string;
  startDate?: string;
  updatedAt?: any;
}

export interface CreditCard {
  id: string;
  _path?: string;
  bankName: string;
  dueDate: string;
  totalLimit: number;
  outstandingAmount: number;
  minimumPayment: number;
  updatedAt?: any;
}

export interface PrivateDebt {
  id: string;
  _path?: string;
  date?: string;
  personName: string;
  amount: number;
  interestRate?: number;
  monthlyInterest?: number;
  yearlyInterest?: number;
  updatedAt?: any;
}

export interface MonthlyIncome {
  id: string;
  _path?: string;
  date: string;
  source: string;
  amount: number;
  updatedAt?: any;
}

export interface MonthlyExpense {
  id: string;
  _path?: string;
  date: string;
  source: string;
  amount: number;
  category: 'loan' | 'card' | 'private' | 'household';
  updatedAt?: any;
}
