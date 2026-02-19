import type { LivestockPurchase, MedicineExpense, FeedCost, LaborCost } from './types';

export const mockLivestockPurchases: LivestockPurchase[] = [
  { villageName: 'Green Valley', farmerName: 'John Doe', animalCount: 10, purchasePrice: 5000, amountPaid: 4500, dueAmount: 500, payingTimePeriod: '30 days' },
  { villageName: 'Sunny Creek', farmerName: 'Jane Smith', animalCount: 5, purchasePrice: 2800, amountPaid: 2800, dueAmount: 0, payingTimePeriod: 'On Delivery' },
];

export const mockMedicineExpenses: MedicineExpense[] = [
  { shopName: 'Farmacy', date: '2023-10-15', costOfMedicines: 300, totalAmountSpent: 320, outstandingDues: 20 },
  { shopName: 'The Vet Supply', date: '2023-11-02', costOfMedicines: 450, totalAmountSpent: 450, outstandingDues: 0 },
];

export const mockFeedCosts: FeedCost[] = [
  { feedType: 'TMR', cost: 1200, date: '2023-10-05', quantity: 500 },
  { feedType: 'Silage', cost: 800, date: '2023-10-05', quantity: 1000 },
  { feedType: 'Groundnut', cost: 600, date: '2023-11-01', quantity: 300 },
];

export const mockLaborCosts: LaborCost[] = [
  { date: '2023-10-31', dailyWages: 150, numberOfLaborers: 2, advancePayments: 100, foodCosts: 50, fuelCosts: 20, totalLaborCosts: 520 },
  { date: '2023-11-30', monthlyWages: 3000, numberOfLaborers: 1, advancePayments: 500, foodCosts: 200, fuelCosts: 80, totalLaborCosts: 3780 },
];
