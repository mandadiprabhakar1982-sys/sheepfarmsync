import { cn } from '@/lib/utils';

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
      {/* Precision Frame */}
      <rect x="2" y="2" width="20" height="20" rx="4" strokeWidth="1" strokeDasharray="2 2" className="opacity-20" />
      
      {/* Sync Pro Abstract Icon - Interlocking Precision */}
      <path d="M12 6V2" />
      <path d="M12 22v-4" />
      <path d="M6 12H2" />
      <path d="M22 12h-4" />
      
      {/* Interlocking S-Sync Geometry */}
      <path d="M16 8a6 6 0 0 0-8 0" />
      <path d="M8 16a6 6 0 0 0 8 0" />
      
      {/* Central Intelligence Node */}
      <circle cx="12" cy="12" r="1.5" fill="currentColor" stroke="none" />
      
      {/* Outer Connection Orbit */}
      <path d="M19 12a7 7 0 0 1-7 7 7 7 0 0 1-7-7 7 7 0 0 1 7-7 7 7 0 0 1 7 7Z" className="opacity-30" />
    </svg>
  );

export const SheepIcon = SyncProIcon;

export function Logo({ className, light = false, showManager = true }: { className?: string; light?: boolean; showManager?: boolean }) {
  return (
    <div className={cn('flex items-center gap-3 select-none', className)}>
       <div className={cn(
         "rounded-xl p-2.5 shadow-xl transition-all hover:scale-105 active:scale-95 group",
         light ? "bg-white text-primary" : "bg-neutral-900 text-emerald-400"
       )}>
        <SyncProIcon className="h-6 w-6 transition-transform group-hover:rotate-90 duration-500" />
      </div>
      <div className="flex flex-col">
        <h1 className={cn(
          "text-xl font-black tracking-tighter leading-none flex items-center gap-1",
          light ? "text-white" : "text-neutral-900"
        )}>
          SYNC <span className={light ? "text-white/80" : "text-emerald-600"}>PRO</span>
        </h1>
        {showManager && (
          <p className={cn(
            "text-[8px] font-black uppercase tracking-[0.25em] mt-1 opacity-60",
            light ? "text-white/50" : "text-muted-foreground"
          )}>
            PRECISION MANAGEMENT
          </p>
        )}
      </div>
    </div>
  );
}
