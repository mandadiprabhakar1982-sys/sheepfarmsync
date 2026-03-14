import { cn } from '@/lib/utils';
import { Sparkles } from 'lucide-react';

export const SyncProIcon = ({ className }: { className?: string }) => (
  <div className={cn("bg-[#1a4d38] p-2 rounded-xl shadow-lg", className)}>
    <Sparkles className="h-full w-full text-[#4ade80]" />
  </div>
);

export const SheepIcon = SyncProIcon;

export function DashboardSparkleIcon({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center justify-center bg-[#1a4d38] rounded-2xl shadow-2xl", className)}>
      <Sparkles className="h-8 w-8 text-[#4ade80]" />
    </div>
  );
}

export function Logo({ className }: { className?: string }) {
  return (
    <div className={cn('flex items-center gap-3 select-none group', className)}>
      <SyncProIcon className="h-9 w-9" />
      <div className="flex items-center">
        <h1 className="text-lg font-black leading-none uppercase tracking-tight text-neutral-900">
          SYNC <span className="text-[#A68A56]">PRO</span>
        </h1>
      </div>
    </div>
  );
}