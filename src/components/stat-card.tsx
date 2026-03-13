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
    default: "bg-neutral-900 text-white",
    success: "bg-emerald-600 text-white",
    destructive: "bg-rose-600 text-white",
    warning: "bg-orange-500 text-white",
    info: "bg-blue-600 text-white",
  };

  const iconVariants = {
    default: "bg-white/10 text-white",
    success: "bg-white/20 text-white",
    destructive: "bg-white/20 text-white",
    warning: "bg-white/20 text-white",
    info: "bg-white/20 text-white",
  };

  return (
    <Card className={cn("overflow-hidden border-none shadow-xl transition-all hover:scale-[1.02] active:scale-[0.98]", variants[variant], className)}>
      <CardContent className="p-6 flex items-center gap-6">
        <div className={cn("rounded-2xl p-4 shrink-0 shadow-inner", iconVariants[variant])}>
          <Icon className="h-6 w-6" />
        </div>
        <div className="flex flex-col min-w-0">
          <p className="card-title-precise uppercase tracking-[0.1em] mb-1 opacity-80">{title}</p>
          <div className="stat-value-precise leading-none">{value}</div>
          {description && (
            <p className="info-text-precise opacity-60 leading-tight mt-2 italic font-bold">
              {description}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}