
'use client';
import Link from 'next/link';
import { useFarm } from '@/context/FarmContext';
import { cn } from '@/lib/utils';
import { DashboardSparkleIcon } from '@/components/logo';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  BarChart3, 
  Wallet, 
  BookOpen, 
  ArrowRightLeft, 
  Syringe, 
  Wheat, 
  Users, 
  Receipt
} from 'lucide-react';

const SheepSvg = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M19,10C19,10 19,9 18,8C17,7 16,7 16,7C16,7 15.5,5.5 14,4.5C12.5,3.5 10.5,3.5 9,4.5C7.5,5.5 7,7 7,7C7,7 6,7 5,8C4,9 4,10 4,10C4,10 2,10.5 2,13C2,15.5 4,16 4,16V19H6V16H18V19H20V16C20,16 22,15.5 22,13C22,10.5 20,10 19,10M9,11C8.45,11 8,10.55 8,10C8,9.45 8.45,9 9,9C9.55,9 10,9.45 10,10C10,10.55 9.55,11 9,11M15,11C14.45,11 14,10.55 14,10C14,9.45 14.45,9 15,9C15.55,9 16,9.45 16,10C16,10.55 15.55,11 15,11Z" />
  </svg>
);

export default function DashboardPage() {
  const { userRole, isLoadingProfile } = useFarm();
  const isAdmin = userRole === 'admin';

  const row1 = [
    { title: "OVERVIEW ANALYTICS", icon: BarChart3, href: '/dashboard/overview', color: 'text-blue-500', bg: 'bg-blue-50', border: 'border-blue-100' },
    { title: "MONTHLY LEDGER", icon: Wallet, href: '/dashboard/monthly-ledger', color: 'text-purple-500', bg: 'bg-purple-50', border: 'border-purple-100', adminOnly: true },
    { title: "LIABILITIES", icon: BookOpen, href: '/dashboard/balance-sheet', color: 'text-neutral-500', bg: 'bg-neutral-50', border: 'border-neutral-200', adminOnly: true },
    { title: "FLOCK", icon: SheepSvg, href: '/dashboard/livestock', color: 'text-[#5F9EA0]', bg: 'bg-[#F0F8F8]', border: 'border-[#5F9EA0]/20' },
    { title: "PURCHASES & SALES", icon: ArrowRightLeft, href: '/dashboard/sales', color: 'text-emerald-500', bg: 'bg-emerald-50', border: 'border-emerald-100' },
  ];

  const row2 = [
    { title: "HEALTH", icon: Syringe, href: '/dashboard/medicine', color: 'text-rose-500', bg: 'bg-rose-50', border: 'border-rose-100' },
    { title: "FEED", icon: Wheat, href: '/dashboard/feed', color: 'text-lime-600', bg: 'bg-lime-50', border: 'border-lime-100' },
    { title: "LABOR", icon: Users, href: '/dashboard/labor', color: 'text-orange-500', bg: 'bg-orange-50', border: 'border-orange-100' },
    { title: "EXPENSES", icon: Receipt, href: '/dashboard/expenses', color: 'text-sky-500', bg: 'bg-sky-50', border: 'border-sky-100' },
  ];

  if (isLoadingProfile) return null;

  const CommandCard = ({ item }: { item: any }) => {
    if (item.adminOnly && !isAdmin) return null;
    const Icon = item.icon;

    return (
      <Link href={item.href} className="group">
        <div className={cn(
          "relative aspect-[1.4] bg-white rounded-[1.5rem] border-2 shadow-sm transition-all duration-300 hover:shadow-xl hover:-translate-y-1 flex flex-col items-center justify-center p-6",
          item.border
        )}>
          {/* Main Visual */}
          <div className={cn("mb-4 transition-transform duration-500 group-hover:scale-110", item.color)}>
            <Icon className="h-14 w-14" />
          </div>
          
          <h3 className="text-[10px] font-black tracking-[0.05em] text-neutral-900 uppercase text-center">
            {item.title}
          </h3>

          {/* Decorative Corner Dots (as seen in reference) */}
          <div className="absolute bottom-3 left-4 text-[10px] font-black text-neutral-300 tracking-widest leading-none">
            ...
          </div>
          <div className="absolute bottom-3 right-4 text-[10px] font-black text-neutral-300 tracking-widest leading-none">
            ...
          </div>
        </div>
      </Link>
    );
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-160px)] p-4">
      <div className="w-full max-w-6xl glass-panel rounded-[2.5rem] p-10 lg:p-16 relative overflow-hidden border-white/40 shadow-2xl">
        {/* Header Block */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-8 mb-16">
          <div className="flex items-center gap-6">
            <DashboardSparkleIcon className="bg-neutral-900 h-16 w-16 rounded-[1.25rem] shadow-2xl shadow-emerald-500/20" />
            <div className="space-y-1">
              <h1 className="text-3xl font-black tracking-tight text-neutral-900 uppercase">
                SYSTEM COMMAND HUB
              </h1>
              <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-[0.3em]">
                SYNCHRONIZED OPERATIONAL ENVIRONMENT
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-6 bg-white/50 p-2 rounded-2xl border border-white/50 shadow-sm">
            <div className="px-4 py-2 text-2xl font-black text-neutral-900 tracking-tighter">100</div>
            <Select defaultValue="identity">
              <SelectTrigger className="w-[180px] h-12 rounded-xl bg-white border-neutral-100 shadow-sm font-black text-[10px] uppercase tracking-widest">
                <SelectValue placeholder="Identity (Select)" />
              </SelectTrigger>
              <SelectContent className="rounded-xl border-none shadow-2xl">
                <SelectItem value="identity" className="font-bold text-[10px] uppercase">Identity (Select)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Tactical Grid Architecture */}
        <div className="space-y-6">
          {/* Row 1: 5 Columns */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
            {row1.map((item, idx) => <CommandCard key={idx} item={item} />)}
          </div>

          {/* Row 2: 4 Columns (Centered) */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
            {row2.map((item, idx) => <CommandCard key={idx} item={item} />)}
          </div>
        </div>
      </div>
    </div>
  );
}
