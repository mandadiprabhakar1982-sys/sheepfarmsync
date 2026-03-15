import { cn } from '@/lib/utils';
import { Sparkles, Atom, Lock, Share2, User, Landmark, TrendingUp, TrendingDown, Skull, Wallet, Syringe, Wheat, ShoppingBag, Heart, Shield, Banknote } from 'lucide-react';

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

// High-Fidelity Tactical Icons for Overview
export const IconInventory = ({ className }: { className?: string }) => (
  <div className="relative">
    <Shield className={className} strokeWidth={1.5} />
    <Sparkles className="absolute inset-0 m-auto h-3 w-3 text-white/50" />
  </div>
);

export const IconMortality = ({ className }: { className?: string }) => <Skull className={className} strokeWidth={1.5} />;
export const IconReceivables = ({ className }: { className?: string }) => <TrendingUp className={className} strokeWidth={1.5} />;
export const IconPayables = ({ className }: { className?: string }) => <TrendingDown className={className} strokeWidth={1.5} />;
export const IconDisbursed = ({ className }: { className?: string }) => (
  <span className={cn("text-xl font-black", className)}>₹</span>
);

export const IconFeedSack = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M6 3h12l2 4v12a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V7l2-4z" />
    <path d="M12 12v4" />
    <path d="M10 14h4" />
    <circle cx="12" cy="14" r="3" />
  </svg>
);

export const IconLaborUser = ({ className }: { className?: string }) => <User className={className} strokeWidth={1.5} />;
export const IconMedicalPlus = ({ className }: { className?: string }) => (
  <div className="relative">
    <Heart className={className} strokeWidth={1.5} fill="currentColor" fillOpacity={0.2} />
    <Syringe className="absolute -bottom-1 -right-1 h-3 w-3" />
  </div>
);
export const IconMiscBills = ({ className }: { className?: string }) => <Banknote className={className} strokeWidth={1.5} />;

export const SheepIcon = IconInventory;
export const HighFidelityHealth = IconMedicalPlus;