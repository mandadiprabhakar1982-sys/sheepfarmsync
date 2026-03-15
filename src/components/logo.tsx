import { cn } from '@/lib/utils';
import { 
  Sparkles, 
  Settings,
  LogOut,
  ChevronDown,
  Lock,
  Globe
} from 'lucide-react';

export const Logo = ({ className }: { className?: string }) => (
  <div className={cn('flex items-center gap-3 select-none group', className)}>
    <div className="bg-[#1e293b] p-2.5 rounded-xl shadow-lg">
      <Sparkles className="h-5 w-5 text-[#F8CF40]" />
    </div>
    <h1 className="text-xl font-black leading-none uppercase tracking-tight text-[#1e293b]">
      SYNC <span className="opacity-40 text-neutral-500">PRO</span>
    </h1>
  </div>
);

export const SyncProIcon = ({ className }: { className?: string }) => <Sparkles className={className} />;

export const HubSparkle = ({ className }: { className?: string }) => (
  <div className={cn("bg-[#1e293b] p-5 rounded-[20px] shadow-2xl", className)}>
    <Sparkles className="h-7 w-7 text-white" />
  </div>
);

// High-Fidelity Tactical Icons from Image
export const IconOverview = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <circle cx="12" cy="12" r="3" />
    <path d="M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18z" />
    <path d="M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8z" />
    <path d="M12 2v2M12 20v2M2 12h2M20 12h2" />
  </svg>
);

export const IconLedger = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
);

export const IconLiabilities = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <circle cx="12" cy="12" r="3" />
    <circle cx="19" cy="5" r="2" />
    <circle cx="5" cy="19" r="2" />
    <circle cx="19" cy="19" r="2" />
    <circle cx="5" cy="5" r="2" />
    <line x1="12" y1="9" x2="17.5" y2="6" />
    <line x1="12" y1="15" x2="6.5" y2="18" />
    <line x1="9" y1="12" x2="6.5" y2="6" />
    <line x1="15" y1="12" x2="17.5" y2="18" />
  </svg>
);

export const IconFlock = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M7 10c0-1.657 1.343-3 3-3s3 1.343 3 3c0 1.657-1.343 3-3 3s-3-1.343-3-3z" />
    <path d="M4 21v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    <path d="M21 21v-2a4 4 0 0 0-3-3.85" />
    <path d="M7 3h1" />
  </svg>
);

export const IconTrade = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <rect x="2" y="6" width="20" height="12" rx="2" />
    <circle cx="12" cy="12" r="2" />
    <path d="M6 12h.01M18 12h.01" />
    <path d="M10 4h4M10 20h4" />
  </svg>
);

export const IconHealth = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M20.42 4.58a5 5 0 0 0-7.07 0l-.35.35-.35-.35a5 5 0 0 0-7.07 7.07l.35.35L12 19l6.01-6.01.35-.35a5 5 0 0 0 0-7.06z" />
    <path d="M9 12h6M12 9v6" />
  </svg>
);

export const IconFeed = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M6 3h12l2 4v12a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V7l2-4z" />
    <path d="M12 12v4" />
    <path d="M10 14h4" />
    <circle cx="12" cy="14" r="3" />
  </svg>
);

export const IconLabor = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);

export const IconExpenses = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M4 19h16" />
    <rect x="6" y="5" width="12" height="14" rx="2" />
    <path d="M9 9h6M9 13h6" />
  </svg>
);

// Functional Aliases
export const IconInventory = IconFlock;
export const IconMortality = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <circle cx="9" cy="12" r="1" />
    <circle cx="15" cy="12" r="1" />
    <path d="M8 20v2h8v-2" />
    <path d="M12 2v2" />
    <path d="M12 4a8 8 0 0 0-8 8v4a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-4a8 8 0 0 0-8-8z" />
  </svg>
);
export const IconReceivables = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="m22 7-8.5 8.5-5-5L2 17" />
    <path d="M16 7h6v6" />
  </svg>
);
export const IconPayables = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="m22 17-8.5-8.5-5 5L2 7" />
    <path d="M16 17h6v-6" />
  </svg>
);
export const IconDisbursed = ({ className }: { className?: string }) => (
  <span className={cn("text-2xl font-black", className)}>₹</span>
);
export const IconFeedSack = IconFeed;
export const IconLaborUser = IconLabor;
export const IconMedicalPlus = IconHealth;
export const IconMiscBills = IconExpenses;

export const SheepIcon = IconFlock;
export const HighFidelityHealth = IconHealth;