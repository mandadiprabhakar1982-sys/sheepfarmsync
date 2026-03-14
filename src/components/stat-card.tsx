import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface StatCardProps {
  title: string;
  value: string;
  icon: any;
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
    neutral: "bg-white text-neutral-900 border-none shadow-md",
  };

  const iconBgVariants = {
    default: "bg-white/10",
    success: "bg-white/10",
    destructive: "bg-white/10",
    warning: "bg-white/20",
    info: "bg-white/10",
    gold: "bg-white/10",
    coral: "bg-white/10",
    neutral: "bg-[#f4f9f1] text-[#1a4d38]",
  };

  return (
    <Card className={cn("rounded-[24px] overflow-hidden transition-all hover:scale-[1.01] active:scale-[0.99] border-none shadow-[0_8px_20px_rgba(0,0,0,0.06)]", variants[variant], className)}>
      <CardContent className={cn("p-8 flex items-center gap-6", horizontal ? "justify-start" : "flex-row")}>
        <div className={cn("rounded-2xl p-4 shrink-0 flex items-center justify-center shadow-inner", iconBgVariants[variant])}>
          <Icon className={cn("h-7 w-7", variant === 'neutral' ? "text-[#1a4d38]" : "text-white")} />
        </div>
        <div className="flex flex-col min-w-0">
          <p className="text-[10px] font-black uppercase tracking-[0.25em] mb-2 opacity-70">{title}</p>
          <div className="text-3xl font-black tracking-tighter leading-none">{value}</div>
          {description && (
            <p className="text-[9px] font-bold opacity-60 mt-3 uppercase tracking-widest">
              {description}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
