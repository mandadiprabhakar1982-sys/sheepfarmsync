import { cn } from '@/lib/utils';
import { 
  Sparkles, 
  Settings,
  LogOut,
  ChevronDown,
  Lock,
  Globe,
  Circle
} from 'lucide-react';

export const Logo = ({ className }: { className?: string }) => (
  <div className={cn('flex items-center gap-3 select-none group', className)}>
    <div className="bg-[#10B981] p-2.5 rounded-xl shadow-[0_0_20px_rgba(16,185,129,0.4)]">
      <Sparkles className="h-5 w-5 text-white" />
    </div>
    <h1 className="text-xl font-black leading-none uppercase tracking-tight text-white">
      SYNC <span className="text-[#10B981]">PRO</span>
    </h1>
  </div>
);

export const SyncProIcon = ({ className }: { className?: string }) => <Sparkles className={className} />;

export const HubSparkle = ({ className }: { className?: string }) => (
  <div className={cn("bg-[#16191E] p-5 rounded-[20px] shadow-2xl border border-white/5", className)}>
    <Sparkles className="h-7 w-7 text-[#10B981]" />
  </div>
);

// --- HIGH-FIDELITY TACTICAL ICON SUITE ---

export const IconOverview = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <circle cx="12" cy="12" r="9" opacity="0.2" />
    <circle cx="12" cy="12" r="5" />
    <path d="M12 3v2M12 19v2M3 12h2M19 12h2" />
    <path d="m16 8-1.5 1.5M9.5 14.5 8 16" />
    <circle cx="12" cy="12" r="1" fill="currentColor" />
  </svg>
);

export const IconLedger = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M4 22V4c0-1.1.9-2 2-2h12a2 2 0 0 1 2 2v18" />
    <path d="M8 18h8M8 14h8M8 10h4" />
    <path d="M18 22H6a2 2 0 0 1-2-2" />
    <rect x="14" y="2" width="4" height="6" rx="1" opacity="0.3" />
  </svg>
);

export const IconLiabilities = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
    <circle cx="12" cy="12" r="3" />
    <path d="M12 9a3 3 0 0 1 3 3" opacity="0.5" />
  </svg>
);

export const IconFlock = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M9 7a3 3 0 1 0 6 0 3 3 0 0 0-6 0z" />
    <path d="M5 21v-2a4 4 0 0 1 4-4h6a4 4 0 0 1 4 4v2" />
    <path d="M12 11v2M9 12h6" opacity="0.4" />
    <circle cx="12" cy="7" r="1" fill="currentColor" />
  </svg>
);

export const IconTrade = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="m16 3 4 4-4 4" />
    <path d="M4 7h16" />
    <path d="m8 21-4-4 4-4" />
    <path d="M20 17H4" />
    <circle cx="12" cy="12" r="2" opacity="0.3" />
  </svg>
);

export const IconHealth = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
    <path d="M12 7v6M10 10h4" opacity="0.6" />
  </svg>
);

export const IconFeed = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M6 3h12l2 4v12a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V7l2-4z" />
    <path d="M12 12v4M10 14h4" />
    <circle cx="12" cy="14" r="3" opacity="0.2" />
  </svg>
);

export const IconLabor = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M22 21v-2a4 4 0 0 0-3-3.87" opacity="0.4" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" opacity="0.4" />
  </svg>
);

export const IconExpenses = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <rect x="2" y="4" width="20" height="16" rx="2" />
    <path d="M7 15h0M2 9.5h20" />
    <circle cx="12" cy="12" r="2" opacity="0.4" />
  </svg>
);

// --- COMPATIBILITY ALIASES ---
export const IconInventory = IconFlock;
export const IconMortality = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M9 12h6M12 9v6" className="rotate-45 origin-center" />
    <circle cx="12" cy="12" r="9" />
    <path d="M8 12a4 4 0 0 1 8 0" opacity="0.3" />
  </svg>
);
export const IconReceivables = IconTrade;
export const IconPayables = IconLiabilities;
export const IconDisbursed = ({ className }: { className?: string }) => (
  <span className={cn("text-2xl font-black", className)}>₹</span>
);
export const IconFeedSack = IconFeed;
export const IconLaborUser = IconLabor;
export const IconMedicalPlus = IconHealth;
export const IconMiscBills = IconExpenses;

export const SheepIcon = IconFlock;
export const HighFidelityHealth = IconHealth;
