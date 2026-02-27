
import { Card, CardContent } from '@/components/ui/card';
import type { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string;
  icon: LucideIcon;
  description?: string;
}

export function StatCard({ title, value, icon: Icon, description }: StatCardProps) {
  return (
    <Card className="overflow-hidden border-none shadow-sm">
      <CardContent className="p-5 flex items-start gap-4">
        <div className="rounded-xl bg-primary/10 p-3 text-primary">
          <Icon className="h-6 w-6" />
        </div>
        <div className="flex flex-col gap-0.5">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{title}</p>
          <div className="text-2xl font-bold tracking-tight">{value}</div>
          {description && <p className="text-[10px] text-muted-foreground/80 leading-tight mt-0.5">{description}</p>}
        </div>
      </CardContent>
    </Card>
  );
}
