import { cn } from '@/lib/utils';

interface PageHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  description?: string;
}

export function PageHeader({ title, description, className, children }: PageHeaderProps) {
  return (
    <div className={cn('mb-10', className)}>
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
            <h1 className="text-2xl font-black tracking-tight text-foreground">{title}</h1>
            {description && <p className="mt-2 text-sm font-medium text-muted-foreground/70 uppercase tracking-widest">{description}</p>}
        </div>
        {children}
      </div>
    </div>
  );
}
