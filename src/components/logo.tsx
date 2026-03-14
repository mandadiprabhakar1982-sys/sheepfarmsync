import { cn } from '@/lib/utils';
import { Sparkles } from 'lucide-react';

export const SyncProIcon = ({ className }: { className?: string }) => (
  <div className={cn("bg-[#14532d] p-2 rounded-xl shadow-lg", className)}>
    <Sparkles className="h-full w-full text-[#4caf50]" />
  </div>
);

export const HighFidelityRam = ({ className }: { className?: string }) => (
  <svg 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="1.5" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <path d="M12 8c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4z" />
    <path d="M12 2c-5.52 0-10 4.48-10 10s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z" />
    <path d="M12 6v2" />
    <path d="M12 16v2" />
    <path d="M6 12h2" />
    <path d="M16 12h2" />
    {/* Stylized Horns */}
    <path d="M8 6c-1-1-3-1-4 1s0 4 2 4" />
    <path d="M16 6c1-1 3-1 4 1s0 4-2 4" />
  </svg>
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

export const SheepIcon = () => (
  <svg viewBox="0 0 100 100" className="w-16 h-16 text-white">
    <path fill="currentColor" d="M85,45c0-11-9-20-20-20c-2,0-4,0.3-6,1c-4-6-11-10-19-10c-9,0-17,5-21,13c-1,0-2-0.1-3-0.1c-9,0-16,7-16,16 c0,3,1,6,2,8c-1,2-2,5-2,8c0,9,7,16,16,16c1,0,2,0,3-0.1c4,8,12,13,21,13c8,0,15-4,19-10c2,0.7,4,1,6,1c11,0,20-9,20-20 c0-3-0.7-6-2-8C84.3,51,85,48,85,45z M70,45c0,1.1-0.2,2.1-0.5,3.1c-0.3,1-0.8,1.9-1.4,2.7c-0.6,0.8-1.3,1.5-2.1,2 c-0.8,0.5-1.7,0.9-2.7,1.1c-1,0.2-2,0.3-3.1,0.3c-1.1,0-2.1-0.1-3.1-0.3c-1-0.3-1.9-0.6-2.7-1.1c-0.8-0.5-1.5-1.2-2.1-2 c-0.6-0.8-1.1-1.7-1.4-2.7c-0.3-1-0.5-2-0.5-3.1c0-1.1,0.2-2.1,0.5-3.1c0.3-1,0.8-1.9,1.4-2.7c0.6-0.8,1.3-1.5,2.1-2 c0.8-0.5,1.7-0.9,2.7-1.1c1-0.3,2-0.4,3.1-0.4c1.1,0,2.1,0.1,3.1,0.4c1,0.2,1.9,0.6,2.7,1.1c0.8,0.5,1.5,1.2,2.1,2 c0.6,0.8,1.1,1.7,1.4,2.7C69.8,42.9,70,43.9,70,45z"/>
    <path fill="#14532d" d="M65,45c0,5.5-4.5,10-10,10s-10-4.5-10-10s4.5-10,10-10S65,39.5,65,45z"/>
    <circle fill="white" cx="50" cy="42" r="2"/>
    <circle fill="white" cx="60" cy="42" r="2"/>
    <path fill="white" d="M55,50c-2,0-3-2-3-2s1,0,3,0s3,0,3,0S57,50,55,50z"/>
  </svg>
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