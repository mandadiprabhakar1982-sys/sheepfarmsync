import { Card, CardContent } from '@/components/ui/card';
import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatCardProps {
  title: string;
  value: string;
  icon: LucideIcon;
  description?: string;
  variant?: 'default' | 'success' | 'destructive' | 'warning' | 'info' | 'gold' | 'coral' | 'neutral';
  className?: string;
  horizontal?: boolean;
}

export function StatCard({ title, value, icon: Icon, description, variant = 'default', className, horizontal = false }: StatCardProps) {
  const variants = {
    default: "bg-[#1a1a1a] text-white border-none",
    success: "bg-[#1a4d38] text-white border-none",
    destructive: "bg-[#962d2b] text-white border-none",
    warning: "bg-orange-500 text-white border-none",
    info: "bg-[#2d6a89] text-white border-none",
    gold: "bg-[#a68a56] text-white border-none",
    coral: "bg-[#b05642] text-white border-none",
    neutral: "bg-white text-neutral-900 border-neutral-200",
  };

  const iconBgVariants = {
    default: "bg-white/10",
    success: "bg-white/10",
    destructive: "bg-white/10",
    warning: "bg-white/20",
    info: "bg-white/10",
    gold: "bg-white/10",
    coral: "bg-white/10",
    neutral: "bg-[#e2ede4] text-[#1a4d38]",
  };

  return (
    <Card className={cn("overflow-hidden shadow-xl transition-all hover:scale-[1.01] active:scale-[0.99]", variants[variant], className)}>
      <CardContent className={cn("p-6 flex items-center gap-6", horizontal ? "justify-start" : "flex-row")}>
        <div className={cn("rounded-xl p-3 shrink-0 flex items-center justify-center", iconBgVariants[variant])}>
          <Icon className={cn("h-5 w-5", variant === 'neutral' ? "text-primary" : "text-white")} />
        </div>
        <div className="flex flex-col min-w-0">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] mb-1 opacity-80">{title}</p>
          <div className="text-2xl font-black tracking-tighter leading-none">{value}</div>
          {description && (
            <p className="text-[9px] font-bold opacity-60 mt-2 uppercase tracking-wide">
              {description}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
