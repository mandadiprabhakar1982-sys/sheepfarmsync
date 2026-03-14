import { cn } from '@/lib/utils';
import { Sparkles } from 'lucide-react';

export const SyncProIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M12 2V4" />
      <path d="M12 18v4" />
      <path d="M4.93 4.93l2.83 2.83" />
      <path d="M16.24 16.24l2.83 2.83" />
      <path d="M2 12h4" />
      <path d="M18 12h4" />
      <path d="M4.93 19.07l2.83-2.83" />
      <path d="M16.24 7.76l2.83-2.83" />
      <circle cx="12" cy="12" r="3" fill="currentColor" stroke="none" />
    </svg>
  );

export const SheepIcon = SyncProIcon;

export function DashboardSparkleIcon({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center justify-center shadow-2xl", className)}>
      <Sparkles className="h-6 w-6 text-[#4ade80]" />
    </div>
  );
}

export function Logo({ className, light = false, showManager = true }: { className?: string; light?: boolean; showManager?: boolean }) {
  return (
    <div className={cn('flex items-center gap-3 select-none group cursor-pointer', className)}>
       <div className={cn(
         "rounded-lg p-1.5 transition-all duration-500 group-hover:rotate-180 bg-neutral-900 text-[#4ade80]"
       )}>
        <SyncProIcon className="h-4 w-4" />
      </div>
      <div className="flex items-center gap-1.5">
        <h1 className="text-base font-black leading-none uppercase tracking-tight text-neutral-900">
          SYNC <span className="text-[#A68A56]">PRO</span>
        </h1>
      </div>
    </div>
  );
}