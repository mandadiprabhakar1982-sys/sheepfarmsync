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
      <path d="M18 10c0-1.1-.9-2-2-2h-1c-.5 0-1-.2-1.4-.6C13.2 6.6 12.6 6 12 6s-1.2.6-1.6 1.4c-.4.4-.9.6-1.4.6H8c-1.1 0-2 .9-2 2 0 .5.2 1 .6 1.4.8.8.8 2.1 0 2.9-.4.4-.6.9-.6 1.4 0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2 0-.5-.2-1-.6-1.4-.8-.8-.8-2.1 0-2.9.4-.4.6-.9.6-1.4Z" />
      <path d="M10 18v2" />
      <path d="M14 18v2" />
      <path d="M9 10h.01" />
      <path d="M15 10h.01" />
      <path d="M11 13c.5.5 1.5.5 2 0" />
    </svg>
  );

export function Logo({ className, light = false, showManager = true }: { className?: string; light?: boolean; showManager?: boolean }) {
  return (
    <div className={cn('flex items-center gap-3', className)}>
       <div className={cn(
         "rounded-xl p-2.5 shadow-lg",
         light ? "bg-white text-primary" : "bg-primary text-white"
       )}>
        <SheepIcon className="h-6 w-6" />
      </div>
      <div className="flex flex-col">
        <h1 className={cn(
          "text-xl font-black tracking-tight leading-none",
          light ? "text-white" : "text-primary"
        )}>
          SheepSync Pro
        </h1>
        {showManager && (
          <p className={cn(
            "text-[8px] font-black uppercase tracking-[0.2em] mt-1",
            light ? "text-white/50" : "text-muted-foreground"
          )}>
            FLOCK MANAGER
          </p>
        )}
      </div>
    </div>
  );
}
