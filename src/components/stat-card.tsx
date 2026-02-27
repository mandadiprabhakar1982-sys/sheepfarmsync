import { Card, CardContent } from '@/components/ui/card';
import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatCardProps {
  title: string;
  value: string;
  icon: LucideIcon;
  description?: string;
  trend?: {
    value: string;
    isPositive: boolean;
  };
  className?: string;
}

export function StatCard({ title, value, icon: Icon, description, trend, className }: StatCardProps) {
  return (
    <Card className={cn("overflow-hidden border-none shadow-sm transition-all hover:shadow-md", className)}>
      <CardContent className="p-6 flex items-start gap-4">
        <div className="rounded-2xl bg-primary/10 p-4 text-primary shrink-0 transition-colors group-hover:bg-primary group-hover:text-white">
          <Icon className="h-7 w-7" />
        </div>
        <div className="flex flex-col gap-1 min-w-0">
          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{title}</p>
          <div className="text-3xl font-black tracking-tight leading-none">{value}</div>
          {trend && (
            <div className={cn("text-xs font-bold flex items-center gap-1", trend.isPositive ? "text-green-600" : "text-red-500")}>
              {trend.isPositive ? '+' : ''}{trend.value}
            </div>
          )}
          {description && <p className="text-[10px] text-muted-foreground leading-tight mt-1 line-clamp-1">{description}</p>}
        </div>
      </CardContent>
    </Card>
  );
}