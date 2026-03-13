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

export function Logo({ className, light = false, showManager = true }: { className?: string; light?: boolean; showManager?: boolean }) {
  return (
    <div className={cn('flex items-center gap-4 select-none group cursor-pointer', className)}>
       <div className={cn(
         "rounded-2xl p-2.5 shadow-2xl transition-all duration-500 group-hover:rotate-180",
         light ? "bg-white text-primary" : "bg-primary text-accent"
       )}>
        <SyncProIcon className="h-6 w-6" />
      </div>
      <div className="flex flex-col">
        <h1 className={cn(
          "text-xl font-display leading-none flex items-center gap-1.5",
          light ? "text-white" : "text-primary"
        )}>
          SYNC <span className={light ? "text-white/60" : "text-accent"}>PRO</span>
        </h1>
        {showManager && (
          <p className={cn(
            "text-[7px] font-black uppercase tracking-[0.4em] mt-1.5 opacity-40",
            light ? "text-white/50" : "text-primary"
          )}>
            Elite Management Suite
          </p>
        )}
      </div>
    </div>
  );
}
