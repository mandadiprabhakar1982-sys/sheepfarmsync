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

// --- HIGH-FIDELITY TACTICAL ICON SUITE (V2) ---

export const IconOverview = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <circle cx="12" cy="12" r="9" opacity="0.1" fill="currentColor" />
    <circle cx="12" cy="12" r="9" />
    <circle cx="12" cy="12" r="5" strokeDasharray="2 2" />
    <path d="M12 3v2M12 19v2M3 12h2M19 12h2" opacity="0.5" />
    <path d="m12 12 4-4" strokeWidth="2" />
    <circle cx="16" cy="8" r="1.5" fill="currentColor" />
  </svg>
);

export const IconLedger = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <rect x="4" y="4" width="16" height="16" rx="2" />
    <path d="M8 8h8M8 12h8M8 16h5" opacity="0.6" />
    <path d="M16 16l3 3" />
    <circle cx="18" cy="18" r="2" strokeWidth="1.5" />
  </svg>
);

export const IconLiabilities = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M3 3v18h18" opacity="0.3" />
    <path d="m19 9-5 5-4-4-7 7" strokeWidth="1.5" />
    <circle cx="19" cy="9" r="2" fill="currentColor" />
    <circle cx="14" cy="14" r="1" />
    <circle cx="10" cy="10" r="1" />
  </svg>
);

export const IconFlock = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" opacity="0.1" fill="currentColor" />
    <path d="M9 12a3 3 0 1 0 6 0 3 3 0 0 0-6 0Z" />
    <path d="M5 20v-1a7 7 0 0 1 7-7h0a7 7 0 0 1 7 7v1" />
    <circle cx="12" cy="12" r="9" />
    <path d="M12 2v3M12 19v3M2 12h3M19 12h3" opacity="0.4" />
  </svg>
);

export const IconTrade = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <circle cx="12" cy="12" r="10" strokeDasharray="4 4" opacity="0.3" />
    <path d="m17 2 4 4-4 4" />
    <path d="M3 6h18" />
    <path d="m7 22-4-4 4-4" />
    <path d="M21 18H3" />
  </svg>
);

export const IconHealth = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M12 21s-8-5.5-8-11a5 5 0 0 1 10 0 5 5 0 0 1 10 0c0 5.5-8 11-8 11Z" />
    <path d="M12 7v6M10 10h4" strokeWidth="2" />
    <path d="M4 10h2M18 10h2" opacity="0.4" />
  </svg>
);

export const IconFeed = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M6 2h12l3 5v13a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7l3-5Z" />
    <path d="M3 7h18" opacity="0.5" />
    <path d="M9 12h6M9 16h6" strokeDasharray="2 2" />
    <circle cx="12" cy="14" r="3" opacity="0.2" fill="currentColor" />
  </svg>
);

export const IconLabor = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <rect x="3" y="14" width="6" height="7" rx="1" />
    <rect x="9" y="10" width="6" height="11" rx="1" />
    <rect x="15" y="6" width="6" height="15" rx="1" />
    <path d="M3 21h18" />
    <path d="m15 6 3-3 3 3" opacity="0.5" />
  </svg>
);

export const IconExpenses = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <circle cx="12" cy="12" r="10" />
    <path d="M12 7v10M9 10h6M9 14h6" />
    <path d="M8 12h8" opacity="0.2" strokeWidth="4" />
  </svg>
);

// --- COMPATIBILITY ALIASES ---
export const IconInventory = IconFlock;
export const IconMortality = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <circle cx="12" cy="12" r="10" />
    <path d="m15 9-6 6M9 9l6 6" />
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
