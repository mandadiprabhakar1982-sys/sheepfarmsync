import { cn } from '@/lib/utils';

interface PageHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  description?: string;
}

export function PageHeader({ title, description, className, children }: PageHeaderProps) {
  return (
    <div className={cn('mb-6 md:mb-10', className)}>
      <div className="flex flex-col gap-1 md:gap-2">
        <h1 className="page-title">{title}</h1>
        {description && (
          <p className="subtitle">
            {description}
          </p>
        )}
      </div>
      {children && <div className="mt-4 md:mt-6">{children}</div>}
    </div>
  );
}