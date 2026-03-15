import { cn } from '@/lib/utils';
import { Sparkles, Atom, Lock, Share2, User, Landmark, TrendingUp, Skull, Wallet, Syringe, Wheat, ShoppingBag, Heart, Smartphone } from 'lucide-react';

/**
 * HIGH-FIDELITY TACTICAL ICONOGRAPHY
 * Matches the System Command Hub visual assets exactly.
 */

export const Logo = ({ className }: { className?: string }) => (
  <div className={cn('flex items-center gap-3 select-none group', className)}>
    <div className="bg-[#16242F] p-2.5 rounded-2xl shadow-xl">
      <Sparkles className="h-6 w-6 text-[#F8CF40]" />
    </div>
    <h1 className="text-xl font-black leading-none uppercase tracking-tight text-[#16242F]">
      SYNC <span className="opacity-40">PRO</span>
    </h1>
  </div>
);

export const SyncProIcon = ({ className }: { className?: string }) => <Sparkles className={className} />;

export const HubSparkle = ({ className }: { className?: string }) => (
  <div className={cn("bg-[#16242F] p-5 rounded-[2rem] shadow-2xl", className)}>
    <Sparkles className="h-8 w-8 text-white" />
  </div>
);

export const IconOverview = ({ className }: { className?: string }) => <Atom className={className} strokeWidth={1.2} />;
export const IconLedger = ({ className }: { className?: string }) => <Lock className={className} strokeWidth={1.2} />;
export const IconLiabilities = ({ className }: { className?: string }) => <Share2 className={className} strokeWidth={1.2} />;
export const IconFlock = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M12 2L12 22M12 2L19 6M12 2L5 6M19 6L19 18M5 6L5 18M19 18L12 22M5 18L12 22" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);
export const IconTrade = ({ className }: { className?: string }) => (
  <div className="relative">
    <Wallet className={className} strokeWidth={1.2} />
    <TrendingUp className="absolute -top-1 -right-1 h-3 w-3 text-emerald-600" />
  </div>
);
export const IconHealth = ({ className }: { className?: string }) => (
  <div className="relative">
    <Heart className={className} strokeWidth={1.2} />
    <Syringe className="absolute -bottom-1 -right-1 h-3 w-3" />
  </div>
);
export const IconFeed = ({ className }: { className?: string }) => <ShoppingBag className={className} strokeWidth={1.2} />;
export const IconLabor = ({ className }: { className?: string }) => <User className={className} strokeWidth={1.2} />;
export const IconExpenses = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <rect x="2" y="4" width="20" height="16" rx="2" />
    <path d="M7 15h0M12 15h0M17 15h0M7 11h0M12 11h0M17 11h0M7 7h0M12 7h0M17 7h0" />
  </svg>
);

export const SheepIcon = IconFlock; // Backward compatibility
