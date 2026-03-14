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
      <circle cx="12" cy="12" r="10" strokeWidth="1" className="opacity-10" />
      <path d="M12 2v4" />
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
    <div className={cn("h-16 w-16 rounded-[1.25rem] bg-neutral-900 flex items-center justify-center shadow-2xl", className)}>
      <Sparkles className="h-8 w-8 text-emerald-400" />
    </div>
  );
}

export function Logo({ className, light = false, showManager = true }: { className?: string; light?: boolean; showManager?: boolean }) {
  return (
    <div className={cn('flex items-center gap-3 select-none group cursor-pointer', className)}>
       <div className={cn(
         "rounded-xl p-2 transition-all duration-500 group-hover:rotate-180",
         light ? "bg-white text-[#1a4d38]" : "bg-[#1a4d38] text-[#A68A56] shadow-lg"
       )}>
        <SyncProIcon className="h-5 w-5" />
      </div>
      <div className="flex flex-col">
        <h1 className={cn(
          "text-lg font-black leading-none flex items-center gap-1 uppercase tracking-tight",
          light ? "text-white" : "text-neutral-900"
        )}>
          SYNC <span className={light ? "text-white/60" : "text-[#A68A56]"}>PRO</span>
        </h1>
        {showManager && (
          <p className={cn(
            "text-[7px] font-black uppercase tracking-[0.3em] mt-1 opacity-40",
            light ? "text-white/50" : "text-neutral-900"
          )}>
            Elite Management Suite
          </p>
        )}
      </div>
    </div>
  );
}
