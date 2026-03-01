import { cn } from '@/lib/utils';

export const SheepIcon = (props: React.SVGProps<SVGSVGElement>) => (
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
      <rect x="2" y="2" width="20" height="20" rx="4" strokeWidth="1" strokeDasharray="3 3" className="opacity-20" />
      {/* Pro Sheep Silhouette */}
      <path d="M17 10c0-1.1-.9-2-2-2h-1c-.5 0-1-.2-1.4-.6C12.2 6.6 11.6 6 11 6s-1.2.6-1.6 1.4c-.4.4-.9.6-1.4.6H7c-1.1 0-2 .9-2 2 0 .5.2 1 .6 1.4.8.8.8 2.1 0 2.9-.4.4-.6.9-.6 1.4 0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2 0-.5-.2-1-.6-1.4-.8-.8-.8-2.1 0-2.9.4-.4.6-.9.6-1.4Z" />
      <path d="M9 18v2" />
      <path d="M13 18v2" />
      {/* Financial/Sync Accent */}
      <path d="M18 6l3 3-3 3" />
      <path d="M21 9H15" />
      <circle cx="10" cy="11" r="0.5" fill="currentColor" />
      <circle cx="14" cy="11" r="0.5" fill="currentColor" />
    </svg>
  );

export function Logo({ className, light = false, showManager = true }: { className?: string; light?: boolean; showManager?: boolean }) {
  return (
    <div className={cn('flex items-center gap-3', className)}>
       <div className={cn(
         "rounded-xl p-2.5 shadow-lg transition-transform hover:scale-105 active:scale-95",
         light ? "bg-white text-primary" : "bg-primary text-white"
       )}>
        <SheepIcon className="h-6 w-6" />
      </div>
      <div className="flex flex-col">
        <h1 className={cn(
          "text-xl font-black tracking-tighter leading-none",
          light ? "text-white" : "text-primary"
        )}>
          SheepSync Pro
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
