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
      <path d="M18 8c0-2.2-1.8-4-4-4-1.42 0-2.65.75-3.37 1.89C9.55 4.69 8.38 4 7 4c-2.2 0-4 1.8-4 4 0 .99.36 1.89.95 2.63C3.36 11.63 3 12.73 3 14c0 2.2 1.8 4 4 4h1c0-1.66 1.34-3 3-3s3 1.34 3 3h1c2.2 0 4-1.8 4-4 0-1.27-.36-2.37-.95-3.37.59-.74.95-1.64.95-2.63Z" />
      <path d="M7 14v2" />
      <path d="M17 14v2" />
    </svg>
  );

export function Logo({ className, light = false }: { className?: string; light?: boolean }) {
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
        <p className={cn(
          "text-[8px] font-black uppercase tracking-[0.2em] mt-1",
          light ? "text-white/50" : "text-muted-foreground"
        )}>
          FLOCK MANAGER
        </p>
      </div>
    </div>
  );
}
