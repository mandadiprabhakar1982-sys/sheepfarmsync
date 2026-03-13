import { cn } from '@/lib/utils';

interface PageHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  description?: string;
}

export function PageHeader({ title, description, className, children }: PageHeaderProps) {
  return (
    <div className={cn('mb-12 relative', className)}>
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="h-8 w-1 bg-accent rounded-full hidden md:block" />
              <h1 className="text-3xl font-display text-primary tracking-tight">{title}</h1>
            </div>
            {description && (
              <p className="text-[10px] font-black text-primary/40 uppercase tracking-[0.3em] pl-1">
                {description}
              </p>
            )}
        </div>
        <div className="flex items-center gap-3">
          {children}
        </div>
      </div>
    </div>
  );
}
