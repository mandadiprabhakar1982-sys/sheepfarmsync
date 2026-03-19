
export type UserProfile = {
  id: string;
  _path?: string;
  email: string;
  displayName: string | null;
  role: 'collaborator' | 'admin' | 'viewer';
  createdAt: any;
  updatedAt?: any;
};

export type FarmCategory = 'Health' | 'Feed' | 'Utility' | 'Labour' | 'Purchase' | 'Sale' | 'Miscellaneous';

export type FarmExpense = {
  id: string;
  _path?: string;
  date: string;
  category: FarmCategory;
  subcategory: string;
  description: string;
  quantity: number;
  unitCost: number;
  totalAmount: number;
  paymentMode: 'Cash' | 'Online' | 'Credit';
  remarks?: string;
  createdBy?: string;
  creatorEmail?: string;
  creatorName?: string;
  updatedAt?: any;
};

export type LivestockPurchase = {
  id: string;
  _path?: string;
  purchaseDate: string;
  villageName: string;
  farmerName: string;
  animalCount: number;
  purchasePrice: number;
  amountPaid: number;
  dueAmount: number;
  payingTimePeriod?: string;
  transportCost?: number;
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
};

export type TrackedSheep = {
  id: string;
  _path?: string;
  tagId: string;
  currentWeight: number;
  previousWeight?: number;
  age: number;
  gender?: 'male' | 'female';
  breed?: string;
  imageUrl?: string;
  registrationDate?: string;
  color?: string;
  source?: string;
  createdAt?: any;
};

export type DeadAnimal = {
  id: string;
  _path?: string;
  dateOfDeath: string;
  sheepCount: number;
  tagId?: string;
  causeOfDeath: string;
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
}

export interface CreditCard {
  id: string;
  _path?: string;
  bankName: string;
  dueDate: string;
  totalLimit: number;
  outstandingAmount: number;
  minimumPayment: number;
}

export interface PrivateDebt {
  id: string;
  _path?: string;
  date?: string;
  personName: string;
  amount: number;
}

export interface MonthlyIncome {
  id: string;
  _path?: string;
  date: string;
  source: string;
  amount: number;
}

export interface MonthlyExpense {
  id: string;
  _path?: string;
  date: string;
  source: string;
  amount: number;
  category: 'loan' | 'card' | 'private' | 'household';
}

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
