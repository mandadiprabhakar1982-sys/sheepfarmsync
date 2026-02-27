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
    <Card className={cn("overflow-hidden border-none shadow-xl transition-all hover:shadow-2xl hover:-translate-y-1 bg-white group", className)}>
      <CardContent className="p-8 flex items-start gap-6">
        <div className="rounded-2xl bg-primary/5 p-5 text-primary shrink-0 transition-all group-hover:bg-primary group-hover:text-white shadow-inner">
          <Icon className="h-8 w-8" />
        </div>
        <div className="flex flex-col gap-1.5 min-w-0">
          <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">{title}</p>
          <div className="text-4xl font-black tracking-tighter leading-none text-foreground">{value}</div>
          {trend && (
            <div className={cn("text-xs font-black flex items-center gap-1 mt-1 uppercase tracking-tight", trend.isPositive ? "text-emerald-600" : "text-destructive")}>
              {trend.isPositive ? '↑' : '↓'} {trend.value}
            </div>
          )}
          {description && <p className="text-[11px] font-medium text-muted-foreground leading-tight mt-2 line-clamp-1 italic">{description}</p>}
        </div>
      </CardContent>
    </Card>
  );
}