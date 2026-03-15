import { cn } from '@/lib/utils';
import { 
  Sparkles, 
  Atom, 
  Lock, 
  Share2, 
  User, 
  Landmark, 
  TrendingUp, 
  TrendingDown, 
  Skull, 
  Wallet, 
  Syringe, 
  Wheat, 
  ShoppingBag, 
  Heart, 
  Shield, 
  Banknote,
  Receipt,
  ArrowRightLeft,
  LayoutGrid,
  BarChart3,
  BookOpen
} from 'lucide-react';

export const Logo = ({ className }: { className?: string }) => (
  <div className={cn('flex items-center gap-3 select-none group', className)}>
    <div className="bg-[#16242F] p-2 rounded-xl shadow-lg">
      <Sparkles className="h-5 w-5 text-[#F8CF40]" />
    </div>
    <h1 className="text-lg font-black leading-none uppercase tracking-tight text-[#16242F]">
      SYNC <span className="opacity-40">PRO</span>
    </h1>
  </div>
);

export const SyncProIcon = ({ className }: { className?: string }) => <Sparkles className={className} />;

export const HubSparkle = ({ className }: { className?: string }) => (
  <div className={cn("bg-[#1e293b] p-4 rounded-2xl shadow-2xl", className)}>
    <Sparkles className="h-6 w-6 text-white" />
  </div>
);

// High-Fidelity Tactical Icons for Modules
export const IconOverview = ({ className }: { className?: string }) => <BarChart3 className={className} strokeWidth={1.5} />;
export const IconLedger = ({ className }: { className?: string }) => (
  <div className="relative">
    <Wallet className={className} strokeWidth={1.5} />
    <Lock className="absolute -top-1 -right-1 h-3 w-3 text-white/50" />
  </div>
);
export const IconLiabilities = ({ className }: { className?: string }) => <BookOpen className={className} strokeWidth={1.5} />;
export const IconFlock = ({ className }: { className?: string }) => (
  <div className="relative">
    <Shield className={className} strokeWidth={1.5} />
    <Sparkles className="absolute inset-0 m-auto h-3 w-3 text-white/50" />
  </div>
);
export const IconTrade = ({ className }: { className?: string }) => <ArrowRightLeft className={className} strokeWidth={1.5} />;
export const IconHealth = ({ className }: { className?: string }) => (
  <div className="relative">
    <Heart className={className} strokeWidth={1.5} fill="currentColor" fillOpacity={0.2} />
    <Syringe className="absolute -bottom-1 -right-1 h-3 w-3" />
  </div>
);
export const IconFeed = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M6 3h12l2 4v12a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V7l2-4z" />
    <path d="M12 12v4" />
    <path d="M10 14h4" />
    <circle cx="12" cy="14" r="3" />
  </svg>
);
export const IconLabor = ({ className }: { className?: string }) => <User className={className} strokeWidth={1.5} />;
export const IconExpenses = ({ className }: { className?: string }) => <Receipt className={className} strokeWidth={1.5} />;

// Aliases for Overview and other pages to maintain backward compatibility
export const IconInventory = IconFlock;
export const IconMortality = ({ className }: { className?: string }) => <Skull className={className} strokeWidth={1.5} />;
export const IconReceivables = ({ className }: { className?: string }) => <TrendingUp className={className} strokeWidth={1.5} />;
export const IconPayables = ({ className }: { className?: string }) => <TrendingDown className={className} strokeWidth={1.5} />;
export const IconDisbursed = ({ className }: { className?: string }) => (
  <span className={cn("text-xl font-black", className)}>₹</span>
);
export const IconFeedSack = IconFeed;
export const IconLaborUser = IconLabor;
export const IconMedicalPlus = IconHealth;
export const IconMiscBills = IconExpenses;

export const SheepIcon = IconFlock;
export const HighFidelityHealth = IconHealth;
