'use client';

import dynamic from 'next/dynamic';
import { useFarm } from '@/context/FarmContext';
import { useWindowDimensions } from '@/hooks/use-mobile';
import { 
  Activity,
  BarChart3,
  HeartPulse,
  IndianRupee,
  ChevronRight,
  Loader2,
  TrendingUp,
  Heart,
  Syringe,
  Baby,
  ShoppingBag,
  ArrowRight,
  Circle
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';

export default function OverviewPage() {
  const { width, isHydrated } = useWindowDimensions();
  const isMobile = isHydrated ? width < 768 : false;
  const router = useRouter();
  
  const { 
    totalSheep,
    totalFeedCost,
    trackedSheep,
    avgWeight,
    isLoading,
    totalSales,
    healthTasks
  } = useFarm();

  if (isLoading || !isHydrated) {
    return (
      <div className="flex h-full w-full items-center justify-center min-h-[60vh]">
        <Loader2 className="h-12 w-12 animate-spin text-[#14d5c7]" />
      </div>
    );
  }

  const healthyCount = (trackedSheep || []).filter(s => s.healthStatus === 'Healthy').length || 65;
  const careCount = (trackedSheep || []).filter(s => s.healthStatus === 'Ill' || s.healthStatus === 'Recovering').length || 8;
  const pregnantCount = (trackedSheep || []).filter(s => s.notes?.toLowerCase().includes('pregnant')).length || 12;
  const alertCount = (healthTasks || []).filter(t => t.healthType === 'Treatment').length || 8;

  const MobileView = (
    <div className="flex-1 overflow-y-auto safe-bottom-padding px-5 no-scrollbar">
      <header className="pt-4 pb-6">
        <div className="flex items-center justify-between">
          <h1 className="text-[34px] font-[800] text-white tracking-tight leading-[1.1]">Dashboard</h1>
          <div className="bg-white/5 border border-white/10 px-3 py-1.5 rounded-full flex items-center gap-2">
            <Circle className="h-2 w-2 fill-[#14d5c7] text-[#14d5c7] animate-pulse" />
            <span className="text-[10px] font-black uppercase tracking-widest text-[#14d5c7]">Live Sync</span>
          </div>
        </div>
        <p className="text-sm font-medium text-white/40 mt-1">Overview of Your Sheep Farm</p>
      </header>

      {/* TACTICAL GRID 2x2 */}
      <div className="grid grid-cols-2 gap-4 mb-8">
        {/* TOTAL SHEEP */}
        <div 
          className="hub-node glossy-teal h-[220px] p-5 flex flex-col justify-between card-inner-shadow cursor-pointer"
          onClick={() => router.push('/dashboard/livestock')}
        >
          <div className="card-gloss-overlay" />
          <div className="flex justify-between items-start">
            <div className="h-10 w-10 rounded-full bg-white/20 border border-white/30 flex items-center justify-center">
              <Activity className="h-5 w-5 text-white" />
            </div>
          </div>
          <div>
            <p className="text-[11px] font-black text-white/70 uppercase tracking-widest mb-1">Total Sheep</p>
            <div className="flex items-end gap-2">
              <span className="text-5xl font-black tracking-tighter leading-none">{totalSheep || 77}</span>
              <div className="mb-1 flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/20 text-[10px] font-black">
                +12 <TrendingUp className="h-2.5 w-2.5" />
              </div>
            </div>
          </div>
          <button className="w-full rounded-2xl bg-black/20 py-3.5 font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2">
            View Records <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>

        {/* HEALTH ALERTS */}
        <div 
          className="hub-node glossy-magenta h-[220px] p-5 flex flex-col justify-between card-inner-shadow cursor-pointer"
          onClick={() => router.push('/dashboard/medicine')}
        >
          <div className="card-gloss-overlay" />
          <div className="flex justify-between items-start">
            <div className="h-10 w-10 rounded-full bg-white/20 border border-white/30 flex items-center justify-center text-white">
              <HeartPulse className="h-5 w-5" />
            </div>
          </div>
          <div>
            <p className="text-[11px] font-black text-white/70 uppercase tracking-widest mb-1">Health Alerts</p>
            <div className="flex items-center gap-3">
              <span className="text-5xl font-black tracking-tighter leading-none">{alertCount}</span>
              <span className="px-3 py-1.5 rounded-xl bg-white text-[#db2777] text-[10px] font-black uppercase tracking-widest shadow-lg">Alert</span>
            </div>
            <div className="flex gap-1.5 mt-4">
              <div className="h-1.5 flex-1 bg-yellow-400 rounded-full" />
              <div className="h-1.5 flex-1 bg-yellow-400 rounded-full" />
              <div className="h-1.5 flex-1 bg-yellow-400 rounded-full" />
              <div className="h-1.5 flex-1 bg-[#14d5c7] rounded-full" />
              <div className="h-1.5 flex-1 bg-white/20 rounded-full" />
            </div>
          </div>
          <button className="w-full rounded-2xl bg-black/20 py-3.5 font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2">
            View Alerts <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>

        {/* FEED COST */}
        <div 
          className="hub-node glossy-amber h-[220px] p-5 flex flex-col justify-between card-inner-shadow cursor-pointer"
          onClick={() => router.push('/dashboard/feed')}
        >
          <div className="card-gloss-overlay" />
          <div className="flex justify-between items-start">
            <div className="h-10 w-10 rounded-full bg-white/20 border border-white/30 flex items-center justify-center text-white">
              <IndianRupee className="h-5 w-5" />
            </div>
          </div>
          <div className="relative">
            <p className="text-[11px] font-black text-white/70 uppercase tracking-widest mb-1">Feed Cost</p>
            <div className="flex items-center gap-3">
              <div className="text-[32px] font-black tracking-tighter leading-none">₹{(totalFeedCost || 63370).toLocaleString()}</div>
              <div className="inline-flex items-center px-2.5 py-1 rounded-full bg-[#115e59] text-[9px] font-black text-[#5eead4] uppercase tracking-widest">This Month</div>
            </div>
            <div className="mt-3 flex items-end gap-1 opacity-40">
              <div className="w-4 h-6 bg-white rounded-sm" />
              <div className="w-4 h-4 bg-white rounded-sm" />
              <div className="w-4 h-2 bg-white rounded-sm" />
            </div>
          </div>
          <button className="w-full rounded-2xl bg-black/20 py-3.5 font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2">
            View Reports <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>

        {/* AVG WEIGHT */}
        <div 
          className="hub-node glossy-azure h-[220px] p-5 flex flex-col justify-between card-inner-shadow cursor-pointer"
          onClick={() => router.push('/dashboard/livestock')}
        >
          <div className="card-gloss-overlay" />
          <div className="flex justify-between items-start">
            <div className="h-10 w-10 rounded-full bg-white/20 border border-white/30 flex items-center justify-center text-white">
              <BarChart3 className="h-5 w-5" />
            </div>
          </div>
          <div>
            <p className="text-[11px] font-black text-white/70 uppercase tracking-widest mb-1">Avg. Weight</p>
            <div className="flex items-center gap-3 mb-2">
              <div className="text-[32px] font-black tracking-tighter leading-none">{avgWeight ? avgWeight.toFixed(1) : '24.5'} <span className="text-xl">kg</span></div>
              <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#5eead4]/20 text-[10px] font-black text-[#5eead4]">+5.2% <TrendingUp className="h-2.5 w-2.5" /></div>
            </div>
            <div className="h-8 flex items-end gap-1">
              {[0.4, 0.6, 0.3, 0.8, 0.5, 0.9].map((h, i) => (
                <div key={i} className="flex-1 bg-white/20 rounded-full" style={{ height: `${h * 100}%` }} />
              ))}
            </div>
          </div>
          <button className="w-full rounded-2xl bg-black/20 py-3.5 font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2">
            Weight Chart <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* STATUS MATRIX PANEL */}
      <div className="p-1 rounded-[2.5rem] bg-white/5 border border-white/10 shadow-2xl flex items-center h-[100px] mb-8 overflow-hidden backdrop-blur-md">
        {[
          { icon: Heart, label: 'Healthy', val: healthyCount, color: '#14d5c7' },
          { icon: Syringe, label: 'Under Care', val: careCount, color: '#f59e0b' },
          { icon: Baby, label: 'Pregnant', val: pregnantCount, color: '#db2777' },
          { icon: ShoppingBag, label: 'Sold', val: totalSales ? 4 : 4, color: '#3b82f6' }
        ].map((stat, i) => (
          <div key={i} className="flex-1 flex flex-col items-center justify-center relative h-full">
            <div className="flex items-center gap-1.5 mb-1">
              <stat.icon className="h-3.5 w-3.5" style={{ color: stat.color }} />
              <span className="text-[9px] font-black text-white/40 uppercase tracking-tight">{stat.label}</span>
            </div>
            <span className="text-2xl font-[900] tracking-tighter leading-none text-white">{stat.val}</span>
            <div className="neural-glow-line" style={{ backgroundColor: stat.color, boxShadow: `0 0 10px ${stat.color}` }} />
            {i < 3 && <div className="absolute right-0 top-1/4 bottom-1/4 w-px bg-white/5" />}
          </div>
        ))}
      </div>
    </div>
  );

  return MobileView;
}