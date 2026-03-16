import { cn } from '@/lib/utils';
import { 
  Sparkles, 
  ChevronDown,
  ShieldCheck,
  Circle
} from 'lucide-react';

export const Logo = ({ className }: { className?: string }) => (
  <div className={cn('flex items-center gap-2 md:gap-4 select-none group', className)}>
    <div className="bg-primary p-2 md:p-3 rounded-xl md:rounded-2xl shadow-[0_10px_30px_rgba(6,78,59,0.2)] border border-white/20 transition-transform group-hover:scale-110">
      <Sparkles className="h-4 w-4 md:h-6 md:w-6 text-accent" />
    </div>
    <div className="flex flex-col">
      <h1 className="text-base md:text-xl font-black leading-none tracking-tighter text-slate-900">
        Mpr <span className="text-primary">Farms</span>
      </h1>
      <p className="text-[6px] md:text-[8px] font-black tracking-[0.3em] md:tracking-[0.4em] text-accent/80 uppercase mt-0.5 md:mt-1">SheepSync Pro</p>
    </div>
  </div>
);

export const SyncProIcon = ({ className }: { className?: string }) => (
  <div className={cn("relative", className)}>
    <Sparkles className="text-accent animate-pulse" />
  </div>
);

export const HubSparkle = ({ className }: { className?: string }) => (
  <div className={cn("bg-primary p-3 md:p-5 rounded-2xl md:rounded-[2rem] shadow-2xl border border-white/10 flex items-center justify-center relative overflow-hidden", className)}>
    <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-50" />
    <Sparkles className="h-5 w-5 md:h-8 md:w-8 text-accent relative z-10" />
  </div>
);

// --- PREMIUM TACTICAL ICON SUITE ---

export const IconOverview = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <circle cx="50" cy="50" r="42" stroke="currentColor" strokeWidth="1.5" strokeDasharray="6 6" className="opacity-20" />
    <path d="M50 15V35M50 65V85M15 50H35M65 50H85" stroke="currentColor" strokeWidth="5" strokeLinecap="round" />
    <circle cx="50" cy="50" r="18" stroke="currentColor" strokeWidth="6" />
    <circle cx="50" cy="50" r="5" fill="currentColor" className="text-accent" />
  </svg>
);

export const IconLedger = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <rect x="15" y="15" width="70" height="70" rx="12" stroke="currentColor" strokeWidth="5" />
    <path d="M30 35H70M30 50H70M30 65H55" stroke="currentColor" strokeWidth="6" strokeLinecap="round" />
    <rect x="65" y="65" width="10" height="10" rx="2" fill="currentColor" className="text-accent" />
  </svg>
);

export const IconLiabilities = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <path d="M15 80L40 45L65 65L85 20" stroke="currentColor" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" />
    <circle cx="85" cy="20" r="8" fill="currentColor" className="text-accent" />
    <path d="M15 85H85" stroke="currentColor" strokeWidth="2" strokeDasharray="4 4" className="opacity-30" />
  </svg>
);

export const IconFlock = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <path d="M25 55C25 35 35 25 50 25C65 25 75 35 75 55V75H25V55Z" stroke="currentColor" strokeWidth="5" />
    <circle cx="50" cy="40" r="10" stroke="currentColor" strokeWidth="5" />
    <path d="M35 85H65" stroke="currentColor" strokeWidth="6" strokeLinecap="round" />
    <circle cx="50" cy="15" r="4" fill="currentColor" className="text-accent" />
  </svg>
);

export const IconTrade = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <path d="M20 45H80L70 30M80 55H20L30 70" stroke="currentColor" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" />
    <circle cx="50" cy="50" r="6" fill="currentColor" className="text-accent" />
  </svg>
);

export const IconHealth = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <path d="M50 20V80M20 50H80" stroke="currentColor" strokeWidth="10" strokeLinecap="round" />
    <path d="M75 25L85 15M15 85L25 75" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
    <circle cx="50" cy="50" r="12" fill="currentColor" className="text-accent" />
  </svg>
);

export const IconFeed = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <path d="M25 20H75L85 85H15L25 20Z" stroke="currentColor" strokeWidth="5" />
    <path d="M40 45V65M35 55H45" stroke="currentColor" strokeWidth="5" strokeLinecap="round" />
    <path d="M60 40L70 60" stroke="currentColor" strokeWidth="5" strokeLinecap="round" className="text-accent" />
  </svg>
);

export const IconLabor = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <circle cx="35" cy="40" r="12" stroke="currentColor" strokeWidth="5" />
    <circle cx="65" cy="40" r="12" stroke="currentColor" strokeWidth="5" />
    <path d="M15 80C15 65 25 60 35 60C45 60 55 65 55 80" stroke="currentColor" strokeWidth="5" strokeLinecap="round" />
    <path d="M45 80C45 65 55 60 65 60C75 60 85 65 85 80" stroke="currentColor" strokeWidth="5" strokeLinecap="round" />
    <circle cx="50" cy="20" r="4" fill="currentColor" className="text-accent" />
  </svg>
);

export const IconExpenses = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <rect x="15" y="15" width="70" height="70" rx="15" stroke="currentColor" strokeWidth="5" />
    <circle cx="50" cy="50" r="18" stroke="currentColor" strokeWidth="2" strokeDasharray="4 4" />
    <path d="M42 50H58M50 42V58" stroke="currentColor" strokeWidth="6" strokeLinecap="round" className="text-accent" />
  </svg>
);

export const IconFarmCost = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <path d="M20 20H80V85L70 75L60 85L50 75L40 85L30 75L20 85V20Z" stroke="currentColor" strokeWidth="5" strokeLinejoin="round" />
    <circle cx="50" cy="45" r="15" stroke="currentColor" strokeWidth="5" />
    <path d="M50 38V52M43 45H57" stroke="currentColor" strokeWidth="4" strokeLinecap="round" className="text-accent" />
  </svg>
);

// --- COMPATIBILITY ALIASES ---
export const IconInventory = IconFlock;
export const IconMortality = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <path d="M30 30L70 70M70 30L30 70" stroke="hsl(var(--destructive))" strokeWidth="10" strokeLinecap="round" />
  </svg>
);
export const IconReceivables = IconTrade;
export const IconPayables = IconLiabilities;
export const IconDisbursed = ({ className }: { className?: string }) => (
  <span className={cn("text-xl md:text-3xl font-black text-slate-900", className)}>₹</span>
);
export const IconFeedSack = IconFeed;
export const IconLaborUser = IconLabor;
export const IconMedicalPlus = IconHealth;
export const IconMiscBills = IconExpenses;

export const SheepIcon = IconFlock;
export const HighFidelityHealth = IconHealth;
