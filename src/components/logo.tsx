import { cn } from '@/lib/utils';
import { Sparkles, LayoutGrid, Database, Layers, Dna, FlaskConical, Users, Wallet, Leaf, Lock } from 'lucide-react';

/**
 * HIGH-FIDELITY ICONOGRAPHY SUITE
 * Re-engineered to match premium AgTech visual standards.
 */

export const SyncProIcon = ({ className }: { className?: string }) => (
  <div className={cn("bg-[#14532d] p-2 rounded-xl shadow-lg", className)}>
    <Sparkles className="h-full w-full text-[#4caf50]" />
  </div>
);

export const HighFidelityOverview = ({ className }: { className?: string }) => (
  <LayoutGrid className={className} strokeWidth={1.5} />
);

export const HighFidelityLedger = ({ className }: { className?: string }) => (
  <div className="relative">
    <Database className={className} strokeWidth={1.5} />
    <Lock className="absolute -bottom-1 -right-1 h-4 w-4 text-emerald-900 bg-white rounded-full p-0.5" />
  </div>
);

export const HighFidelityLiabilities = ({ className }: { className?: string }) => (
  <svg 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="1.5" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <path d="M12 2l9 4.5V17.5L12 22l-9-4.5V6.5L12 2z" />
    <path d="M12 22V12" />
    <path d="M21 6.5L12 12 3 6.5" />
    <path d="M12 12l9 4.5" />
    <path d="M12 12l-9 4.5" />
  </svg>
);

export const HighFidelityRam = ({ className }: { className?: string }) => (
  <svg 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="1.2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    {/* Stylized Horns */}
    <path d="M8 8c-2-2-5-1-6 2s1 6 4 6" />
    <path d="M16 8c2-2 5-1 6 2s-1 6-4 6" />
    {/* Head Structure */}
    <path d="M12 22c2.5 0 4-2 4-6V10c0-2.2-1.8-4-4-4s-4 1.8-4 4v6c0 4 1.5 6 4 6z" />
    {/* Features */}
    <circle cx="10" cy="11" r="0.5" fill="currentColor" />
    <circle cx="14" cy="11" r="0.5" fill="currentColor" />
    <path d="M11 18h2" />
  </svg>
);

export const HighFidelityHealth = ({ className }: { className?: string }) => (
  <Dna className={className} strokeWidth={1.5} />
);

export const HighFidelityFeed = ({ className }: { className?: string }) => (
  <div className="relative">
    <FlaskConical className={className} strokeWidth={1.5} />
    <Leaf className="absolute -top-1 -right-1 h-5 w-5 text-emerald-400" />
  </div>
);

export const HighFidelityLabor = ({ className }: { className?: string }) => (
  <Users className={className} strokeWidth={1.5} />
);

export const HighFidelityExpenses = ({ className }: { className?: string }) => (
  <Wallet className={className} strokeWidth={1.5} />
);

export function DashboardSparkleIcon({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center justify-center bg-[#14532d] rounded-2xl shadow-2xl", className)}>
      <Sparkles className="h-8 w-8 text-[#4caf50]" />
    </div>
  );
}

export function Logo({ className }: { className?: string }) {
  return (
    <div className={cn('flex items-center gap-3 select-none group', className)}>
      <SyncProIcon className="h-9 w-9" />
      <div className="flex items-center">
        <h1 className="text-lg font-black leading-none uppercase tracking-tight text-neutral-900">
          SYNC <span className="text-[#16a34a]">PRO</span>
        </h1>
      </div>
    </div>
  );
}
