import { cn } from '@/lib/utils';
import { Sparkles, LayoutGrid, Database, Layers, Dna, FlaskConical, Users, Wallet, Lock } from 'lucide-react';

/**
 * HIGH-FIDELITY ICONOGRAPHY SUITE
 * Re-engineered to match premium AgTech visual standards from reference GIF.
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
    <Lock className="absolute -bottom-1 -right-1 h-4 w-4 text-[#14532d] bg-white rounded-full p-0.5" />
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

export const SheepIcon = ({ className }: { className?: string }) => (
  <svg 
    viewBox="0 0 24 24" 
    fill="currentColor" 
    className={className}
  >
    <path d="M12,2C10.89,2 10,2.89 10,4C10,4.45 10.18,4.85 10.46,5.15C8.41,5.63 6.88,7.38 6.6,9.5C5.14,9.78 4,11.06 4,12.6C4,14.14 5.14,15.42 6.6,15.7C6.88,17.82 8.41,19.57 10.46,20.05C10.18,20.35 10,20.75 10,21.2C10,22.31 10.89,23.2 12,23.2C13.11,23.2 14,22.31 14,21.2C14,20.75 13.82,20.35 13.54,20.05C15.59,19.57 17.12,17.82 17.4,15.7C18.86,15.42 20,14.14 20,12.6C20,11.06 18.86,9.78 17.4,9.5C17.12,7.38 15.59,5.63 13.54,5.15C13.82,4.85 14,4.45 14,4C14,2.89 13.11,2 12,2M12,7C14.76,7 17,9.24 17,12C17,14.76 14.76,17 12,17C9.24,17 7,14.76 7,12C7,9.24 9.24,7 12,7Z" />
    <path d="M19,13H17.9C17.7,14.5 17,15.8 16,16.8L16.7,17.5C17.1,18.2 17,19.1 16.3,19.5C15.6,19.9 14.7,19.8 14.3,19.1L13.6,18.4C12.6,18.8 11.4,19 10.2,18.9L9.5,19.6C9.1,20.3 8.2,20.4 7.5,20C6.8,19.6 6.7,18.7 7.1,18L7.8,17.3C6.8,16.3 6.1,15 5.9,13.5H5C4.2,13.5 3.5,12.8 3.5,12C3.5,11.2 4.2,10.5 5,10.5H5.9C6.1,9 6.8,7.7 7.8,6.7L7.1,6C6.7,5.3 6.8,4.4 7.5,4C8.2,3.6 9.1,3.7 9.5,4.4L10.2,5.1C11.4,5 12.6,5.2 13.6,5.6L14.3,4.9C14.7,4.2 15.6,4.1 16.3,4.5C17,4.9 17.1,5.8 16.7,6.5L16,7.2C17,8.2 17.7,9.5 17.9,11H19C19.8,11 20.5,11.7 20.5,12.5C20.5,13.3 19.8,14 19,14V13Z" />
  </svg>
);

export const HighFidelityHealth = ({ className }: { className?: string }) => (
  <Dna className={className} strokeWidth={1.5} />
);

export const HighFidelityFeed = ({ className }: { className?: string }) => (
  <div className="relative">
    <FlaskConical className={className} strokeWidth={1.5} />
    <Leaf className="absolute -top-1 -right-1 h-5 w-5 text-[#4caf50]" />
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

const Leaf = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M17,8C15.3,8 13.7,8.7 12.5,9.8C11.3,8.7 9.7,8 8,8C4.7,8 2,10.7 2,14C2,17.3 4.7,20 8,20C9.7,20 11.3,19.3 12.5,18.2C13.7,19.3 15.3,20 17,20C20.3,20 23,17.3 23,14C23,10.7 20.3,8 17,8Z" />
  </svg>
);