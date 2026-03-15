import { cn } from '@/lib/utils';

interface PageHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  description?: string;
}

export function PageHeader({ title, description, className, children }: PageHeaderProps) {
  return (
    <div className={cn('mb-10', className)}>
      <div className="flex flex-col gap-2">
        <h1 className="page-title">{title}</h1>
        {description && (
          <p className="subtitle">
            {description}
          </p>
        )}
      </div>
      {children && <div className="mt-6">{children}</div>}
    </div>
  );
}