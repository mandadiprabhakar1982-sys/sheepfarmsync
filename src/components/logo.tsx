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

// --- HIGH-FIDELITY DARK TACTICAL ICON SUITE ---

export const IconOverview = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <circle cx="50" cy="50" r="45" fill="#0F172A" />
    <circle cx="50" cy="50" r="40" stroke="#1E293B" strokeWidth="1" />
    <circle cx="50" cy="50" r="30" stroke="#1E293B" strokeWidth="1" strokeDasharray="4 4" />
    <circle cx="50" cy="50" r="15" stroke="#10B981" strokeWidth="2" />
    <path d="M50 20V30M50 70V80M20 50H30M70 50H80" stroke="#334155" strokeWidth="2" strokeLinecap="round" />
    <path d="M50 50L75 35" stroke="#10B981" strokeWidth="3" strokeLinecap="round" />
    <circle cx="75" cy="35" r="4" fill="#10B981" />
  </svg>
);

export const IconLedger = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <rect x="15" y="15" width="70" height="70" rx="12" fill="#0F172A" />
    <path d="M35 35H65M35 50H65M35 65H50" stroke="#10B981" strokeWidth="4" strokeLinecap="round" />
    <rect x="65" y="65" width="20" height="20" rx="4" fill="#1E293B" />
    <path d="M75 70V80M70 75H80" stroke="white" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

export const IconLiabilities = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <rect x="10" y="10" width="80" height="80" rx="15" fill="#0F172A" />
    <path d="M30 70L45 40L60 55L75 25" stroke="#10B981" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
    <circle cx="30" cy="70" r="4" fill="#1E293B" stroke="#10B981" />
    <circle cx="45" cy="40" r="4" fill="#1E293B" stroke="#10B981" />
    <circle cx="60" cy="55" r="4" fill="#1E293B" stroke="#10B981" />
    <circle cx="75" cy="25" r="4" fill="#10B981" />
  </svg>
);

export const IconFlock = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <circle cx="50" cy="50" r="45" fill="#0F172A" />
    <path d="M35 50C35 40 42 35 50 35C58 35 65 40 65 50V60H35V50Z" fill="#1E293B" />
    <circle cx="50" cy="45" r="8" fill="#334155" />
    <path d="M40 65H60M45 72H55" stroke="#10B981" strokeWidth="3" strokeLinecap="round" />
    <circle cx="50" cy="50" r="35" stroke="#10B981" strokeWidth="1" strokeDasharray="2 4" />
  </svg>
);

export const IconTrade = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <circle cx="50" cy="50" r="45" fill="#0F172A" />
    <path d="M25 40H75L65 30M75 60H25L35 70" stroke="#10B981" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
    <circle cx="50" cy="50" r="10" stroke="#1E293B" strokeWidth="2" />
  </svg>
);

export const IconHealth = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <rect x="15" y="15" width="70" height="70" rx="20" fill="#0F172A" />
    <path d="M50 30V70M35 50H65" stroke="#10B981" strokeWidth="6" strokeLinecap="round" />
    <path d="M25 25L35 35M65 65L75 75" stroke="#334155" strokeWidth="2" />
  </svg>
);

export const IconFeed = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <path d="M25 20H75L85 80H15L25 20Z" fill="#0F172A" stroke="#1E293B" strokeWidth="2" />
    <path d="M40 40H60M40 55H60M40 70H50" stroke="#10B981" strokeWidth="3" strokeLinecap="round" />
    <rect x="20" y="15" width="60" height="10" rx="2" fill="#1E293B" />
  </svg>
);

export const IconLabor = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <circle cx="35" cy="40" r="12" fill="#0F172A" stroke="#1E293B" strokeWidth="2" />
    <circle cx="65" cy="40" r="12" fill="#0F172A" stroke="#1E293B" strokeWidth="2" />
    <path d="M20 75C20 65 28 60 35 60C42 60 50 65 50 75" stroke="#10B981" strokeWidth="4" strokeLinecap="round" />
    <path d="M50 75C50 65 58 60 65 60C72 60 80 65 80 75" stroke="#10B981" strokeWidth="4" strokeLinecap="round" />
  </svg>
);

export const IconExpenses = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <rect x="15" y="15" width="70" height="70" rx="12" fill="#0F172A" />
    <circle cx="50" cy="50" r="20" stroke="#1E293B" strokeWidth="2" />
    <path d="M45 45V55H55M55 45V55" stroke="#10B981" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M15 40H85" stroke="#1E293B" strokeWidth="1" strokeDasharray="2 2" />
  </svg>
);

// --- COMPATIBILITY ALIASES ---
export const IconInventory = IconFlock;
export const IconMortality = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <circle cx="50" cy="50" r="45" fill="#0F172A" />
    <path d="M35 35L65 65M65 35L35 65" stroke="#F43F5E" strokeWidth="6" strokeLinecap="round" />
  </svg>
);
export const IconReceivables = IconTrade;
export const IconPayables = IconLiabilities;
export const IconDisbursed = ({ className }: { className?: string }) => (
  <span className={cn("text-2xl font-black text-white", className)}>₹</span>
);
export const IconFeedSack = IconFeed;
export const IconLaborUser = IconLabor;
export const IconMedicalPlus = IconHealth;
export const IconMiscBills = IconExpenses;

export const SheepIcon = IconFlock;
export const HighFidelityHealth = IconHealth;
