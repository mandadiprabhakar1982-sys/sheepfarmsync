import { cn } from '@/lib/utils';

export const SheepIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
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

export function Logo({ className, showManager = false, light = false }: { className?: string; showManager?: boolean; light?: boolean }) {
  return (
    <div className={cn('flex items-center gap-4', className)}>
       <div className={cn(
         "rounded-2xl p-3 shadow-xl transition-transform duration-300",
         light ? "bg-primary text-primary-foreground shadow-primary/20 rotate-[-5deg]" : "bg-primary rounded-2xl p-3 shadow-xl shadow-primary/20 rotate-[-5deg] group-hover:rotate-0"
       )}>
        <SheepIcon className="h-7 w-7" />
      </div>
      <div>
        <h1 className={cn(
          "text-2xl font-black tracking-tighter leading-none uppercase",
          light ? "text-sidebar-foreground" : "text-foreground"
        )}>
          SheepSync
        </h1>
        <p className={cn(
          "text-[9px] font-black uppercase tracking-[0.3em] mt-1",
          light ? "text-sidebar-foreground/40" : "text-primary/60"
        )}>
          Professional
        </p>
      </div>
    </div>
  );
}
