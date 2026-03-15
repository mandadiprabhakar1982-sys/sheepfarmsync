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
    <div className="bg-[#3B82F6] p-2.5 rounded-xl shadow-[0_8px_20px_rgba(59,130,246,0.2)]">
      <Sparkles className="h-5 w-5 text-white" />
    </div>
    <h1 className="text-xl font-black leading-none uppercase tracking-tight text-slate-900">
      SYNC <span className="text-[#3B82F6]">PRO</span>
    </h1>
  </div>
);

export const SyncProIcon = ({ className }: { className?: string }) => <Sparkles className={className} />;

export const HubSparkle = ({ className }: { className?: string }) => (
  <div className={cn("bg-white p-5 rounded-[20px] shadow-xl border border-slate-100", className)}>
    <Sparkles className="h-7 w-7 text-[#3B82F6]" />
  </div>
);

// --- CLEAN MODERN LINE-ART ICON SUITE (LIGHT OPTIMIZED) ---

export const IconOverview = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <circle cx="50" cy="50" r="40" stroke="currentColor" strokeWidth="2" strokeDasharray="4 4" />
    <circle cx="50" cy="50" r="20" stroke="currentColor" strokeWidth="4" />
    <path d="M50 10V30M50 70V90M10 50H30M70 50H90" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
    <circle cx="50" cy="50" r="4" fill="currentColor" />
  </svg>
);

export const IconLedger = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <rect x="20" y="20" width="60" height="60" rx="8" stroke="currentColor" strokeWidth="4" />
    <path d="M35 40H65M35 55H65M35 70H50" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
  </svg>
);

export const IconLiabilities = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <path d="M20 75L40 45L60 60L80 25" stroke="currentColor" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
    <circle cx="20" cy="75" r="5" fill="currentColor" />
    <circle cx="40" cy="45" r="5" fill="currentColor" />
    <circle cx="60" cy="60" r="5" fill="currentColor" />
    <circle cx="80" cy="25" r="5" fill="currentColor" />
  </svg>
);

export const IconFlock = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <path d="M30 50C30 35 40 30 50 30C60 30 70 35 70 50V65H30V50Z" stroke="currentColor" strokeWidth="4" />
    <circle cx="50" cy="40" r="8" stroke="currentColor" strokeWidth="4" />
    <path d="M40 75H60" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
  </svg>
);

export const IconTrade = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <path d="M25 40H75L65 30M75 60H25L35 70" stroke="currentColor" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export const IconHealth = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <path d="M50 25V75M30 50H70" stroke="currentColor" strokeWidth="8" strokeLinecap="round" />
    <path d="M20 20L30 30M70 70L80 80" stroke="currentColor" strokeWidth="4" />
  </svg>
);

export const IconFeed = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <path d="M30 20H70L80 80H20L30 20Z" stroke="currentColor" strokeWidth="4" />
    <path d="M45 40V60M40 50H50" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
  </svg>
);

export const IconLabor = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <circle cx="35" cy="40" r="10" stroke="currentColor" strokeWidth="4" />
    <circle cx="65" cy="40" r="10" stroke="currentColor" strokeWidth="4" />
    <path d="M20 75C20 65 30 60 35 60C40 60 50 65 50 75" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
    <path d="M50 75C50 65 60 60 65 60C70 60 80 65 80 75" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
  </svg>
);

export const IconExpenses = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <rect x="20" y="20" width="60" height="60" rx="8" stroke="currentColor" strokeWidth="4" />
    <circle cx="50" cy="50" r="15" stroke="currentColor" strokeWidth="2" />
    <path d="M45 45V55H55" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
  </svg>
);

// --- COMPATIBILITY ALIASES ---
export const IconInventory = IconFlock;
export const IconMortality = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <path d="M30 30L70 70M70 30L30 70" stroke="#F43F5E" strokeWidth="8" strokeLinecap="round" />
  </svg>
);
export const IconReceivables = IconTrade;
export const IconPayables = IconLiabilities;
export const IconDisbursed = ({ className }: { className?: string }) => (
  <span className={cn("text-2xl font-black text-slate-900", className)}>₹</span>
);
export const IconFeedSack = IconFeed;
export const IconLaborUser = IconLabor;
export const IconMedicalPlus = IconHealth;
export const IconMiscBills = IconExpenses;

export const SheepIcon = IconFlock;
export const HighFidelityHealth = IconHealth;