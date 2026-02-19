import { cn } from '@/lib/utils';

export const SheepIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M18 8c0-2.2-1.8-4-4-4-1.42 0-2.65.75-3.37 1.89C9.55 4.69 8.38 4 7 4c-2.2 0-4 1.8-4 4 0 .99.36 1.89.95 2.63C3.36 11.63 3 12.73 3 14c0 2.2 1.8 4 4 4h1c0-1.66 1.34-3 3-3s3 1.34 3 3h1c2.2 0 4-1.8 4-4 0-1.27-.36-2.37-.95-3.37.59-.74.95-1.64.95-2.63Z" />
      <path d="M7 14v2" />
      <path d="M17 14v2" />
    </svg>
  );

export function Logo({ className, showManager = false }: { className?: string; showManager?: boolean; }) {
  return (
    <div className={cn('flex items-center gap-3', className)}>
       <div className="bg-primary rounded-lg p-2">
        <SheepIcon className="h-7 w-7 text-primary-foreground" />
      </div>
      <div>
        <h1 className="text-xl font-bold text-foreground">SheepSync Pro</h1>
        {showManager && <p className="text-sm text-muted-foreground">FLOCK MANAGER</p>}
      </div>
    </div>
  );
}
