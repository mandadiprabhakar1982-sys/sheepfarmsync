import { Card, CardContent } from '@/components/ui/card';
import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatCardProps {
  title: string;
  value: string;
  icon: LucideIcon;
  description?: string;
  variant?: 'default' | 'success' | 'destructive' | 'warning' | 'info';
  className?: string;
}

export function StatCard({ title, value, icon: Icon, description, variant = 'default', className }: StatCardProps) {
  const variants = {
    default: "bg-neutral-50 text-neutral-600",
    success: "bg-emerald-50 text-emerald-600",
    destructive: "bg-red-50 text-red-600",
    warning: "bg-amber-50 text-amber-600",
    info: "bg-blue-50 text-blue-600",
  };

  return (
    <Card className={cn("overflow-hidden border-none shadow-sm transition-all hover:shadow-md bg-white", className)}>
      <CardContent className="p-6 flex items-center gap-6">
        <div className={cn("rounded-2xl p-4 shrink-0 shadow-sm transition-transform", variants[variant])}>
          <Icon className="h-6 w-6" />
        </div>
        <div className="flex flex-col min-w-0">
          <p className="text-sm font-bold text-muted-foreground uppercase tracking-[0.15em] mb-1">{title}</p>
          <div className="text-[22px] font-black tracking-tight text-foreground leading-none">{value}</div>
          {description && (
            <p className="text-xs font-medium text-muted-foreground/60 leading-tight mt-2 italic">
              {description}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
