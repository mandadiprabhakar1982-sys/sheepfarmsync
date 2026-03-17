'use client';

import { useFarm } from '@/context/FarmContext';
import { useWindowDimensions } from '@/hooks/use-mobile';
import { 
  Plus,
  Activity,
  BarChart3,
  HeartPulse,
  IndianRupee,
  ChevronRight,
  Loader2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';

export default function OverviewPage() {
  const { width, isHydrated } = useWindowDimensions();
  const isMobile = isHydrated ? width < 768 : false;
  const router = useRouter();
  
  const { 
    totalSheep,
    totalFeedCost,
    totalMedicineCost,
    totalLaborCost,
    trackedSheep,
    avgWeight,
    isLoading 
  } = useFarm();

  if (isLoading || !isHydrated) {
    return (
      <div className="flex h-full w-full items-center justify-center min-h-[60vh]">
        <Loader2 className="h-10 w-10 animate-spin text-primary opacity-20" />
      </div>
    );
  }

  const growthData = [
    { name: 'Oct', weight: 55 },
    { name: 'Nov', weight: 62 },
    { name: 'Dec', weight: 68 },
    { name: 'Jan', weight: 74 },
    { name: 'Feb', weight: 80 },
  ];

  const MobileView = (
    <div className="min-h-full bg-[#020617] text-white px-4 pt-6 pb-[110px] animate-in fade-in duration-700">
      {/* Title */}
      <div className="mb-8">
        <h2 className="text-[34px] font-[800] tracking-tight leading-[1.1]">Dashboard</h2>
        <p className="text-white/50 text-sm mt-1 font-medium">Overview of your sheep farm</p>
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-2 gap-4 mb-8">
        {/* Total Sheep */}
        <div 
          className="rounded-[28px] p-5 bg-gradient-to-br from-[#11c5be] to-[#0d8f89] h-[220px] flex flex-col justify-between shadow-2xl transition-all active:scale-95" 
          onClick={() => router.push('/dashboard/livestock')}
        >
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Activity className="h-5 w-5" />
              <span className="font-bold text-[10px] uppercase tracking-widest opacity-80 leading-none">Total Sheep</span>
            </div>
            <div className="text-5xl font-black tracking-tighter leading-none">{totalSheep}</div>
          </div>
          <button className="w-full rounded-2xl bg-black/20 py-3 font-black text-[10px] uppercase tracking-widest border border-white/5">
            View Records
          </button>
        </div>

        {/* Health Alerts */}
        <div 
          className="rounded-[28px] p-5 bg-gradient-to-br from-pink-500 to-pink-700 h-[220px] flex flex-col justify-between shadow-2xl transition-all active:scale-95" 
          onClick={() => router.push('/dashboard/medicine')}
        >
          <div>
            <div className="flex items-center gap-2 mb-4">
              <HeartPulse className="h-5 w-5" />
              <span className="font-bold text-[10px] uppercase tracking-widest opacity-80 leading-none">Health Alerts</span>
            </div>
            <div className="text-5xl font-black tracking-tighter leading-none">{totalMedicineCost > 0 ? "8" : "Stable"}</div>
          </div>
          <button className="w-full rounded-2xl bg-black/20 py-3 font-black text-[10px] uppercase tracking-widest border border-white/5">
            View Alerts
          </button>
        </div>

        {/* Feed Cost */}
        <div 
          className="rounded-[28px] p-5 bg-gradient-to-br from-orange-500 to-yellow-500 h-[220px] flex flex-col justify-between shadow-2xl transition-all active:scale-95" 
          onClick={() => router.push('/dashboard/feed')}
        >
          <div>
            <div className="flex items-center gap-2 mb-4">
              <IndianRupee className="h-5 w-5" />
              <span className="font-bold text-[10px] uppercase tracking-widest opacity-80 leading-none">Feed Cost</span>
            </div>
            <div className="text-3xl font-black tracking-tighter leading-none mb-1">₹{totalFeedCost.toLocaleString()}</div>
          </div>
          <button className="w-full rounded-2xl bg-black/20 py-3 font-black text-[10px] uppercase tracking-widest border border-white/5">
            Reports
          </button>
        </div>

        {/* Avg Weight */}
        <div 
          className="rounded-[28px] p-5 bg-gradient-to-br from-blue-500 to-blue-700 h-[220px] flex flex-col justify-between shadow-2xl transition-all active:scale-95" 
          onClick={() => router.push('/dashboard/livestock')}
        >
          <div>
            <div className="flex items-center gap-2 mb-4">
              <BarChart3 className="h-5 w-5" />
              <span className="font-bold text-[10px] uppercase tracking-widest opacity-80 leading-none">Avg Weight</span>
            </div>
            <div className="text-3xl font-black tracking-tighter leading-none mb-1">{avgWeight.toFixed(1)} kg</div>
          </div>
          <button className="w-full rounded-2xl bg-black/20 py-3 font-black text-[10px] uppercase tracking-widest border border-white/5">
            Weight Chart
          </button>
        </div>
      </div>

      {/* RECENT RECORDS OR CHART */}
      <div className="relative z-10">
        <Card className="border-none bg-white/5 backdrop-blur-xl rounded-[32px] overflow-hidden shadow-2xl ring-1 ring-white/10">
          <CardHeader className="px-8 pt-8 pb-4 flex flex-row items-center justify-between border-none">
            <CardTitle className="text-lg font-black text-white tracking-tight">Growth Trends</CardTitle>
            <Button variant="link" className="text-white/40 font-black text-[10px] uppercase tracking-widest p-0 h-auto" onClick={() => router.push('/dashboard/livestock')}>
              View All <ChevronRight className="h-3 w-3 ml-1" />
            </Button>
          </CardHeader>
          <CardContent className="px-8 pb-8 space-y-8">
            <div className="h-[180px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={growthData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                  <XAxis 
                    dataKey="name" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 10, fontWeight: 'bold', fill: 'rgba(255,255,255,0.3)' }} 
                  />
                  <YAxis hide />
                  <Tooltip 
                    contentStyle={{ borderRadius: '16px', backgroundColor: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.5)' }}
                    itemStyle={{ color: '#14d5c7', fontWeight: 'bold' }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="weight" 
                    stroke="#14d5c7" 
                    strokeWidth={4} 
                    dot={{ r: 5, fill: '#14d5c7', strokeWidth: 3, stroke: '#020617' }}
                    activeDot={{ r: 8, stroke: '#fff', strokeWidth: 2 }} 
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const DesktopView = (
    <div className="space-y-6 animate-in fade-in duration-700 pb-12 max-w-5xl mx-auto">
      <div className="px-2 pt-2">
        <p className="text-[#2F4F4F] text-sm font-medium">Here is an overview of your sheep farm.</p>
      </div>

      <div className="grid grid-cols-4 gap-6">
        <div className="bg-white rounded-[28px] border border-[#D9D9D9] p-5 h-[220px] shadow-sm border-l-[5px] border-l-[#0FA5A0] flex flex-col justify-between overflow-hidden">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-[#0FA5A0] flex items-center justify-center text-white"><Activity className="h-5 w-5" /></div>
            <h3 className="text-sm font-bold text-[#2F4F4F]">Total Sheep</h3>
          </div>
          <div className="space-y-4">
            <p className="text-3xl font-black text-[#176E6C]">{totalSheep}</p>
            <Button onClick={() => router.push('/dashboard/livestock')} className="w-full bg-[#176E6C] text-white text-[9px] font-black uppercase tracking-widest rounded-xl">View Sheep Records</Button>
          </div>
        </div>

        <div className="bg-white rounded-[28px] border border-[#D9D9D9] p-5 h-[220px] shadow-sm border-l-[5px] border-l-[#43A047] flex flex-col justify-between overflow-hidden">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-[#43A047] flex items-center justify-center text-white"><HeartPulse className="h-5 w-5" /></div>
            <h3 className="text-sm font-bold text-[#2F4F4F]">Health Records</h3>
          </div>
          <div className="space-y-4">
            <p className="text-3xl font-black text-[#176E6C]">Stable</p>
            <Button onClick={() => router.push('/dashboard/medicine')} className="w-full bg-[#176E6C] text-white text-[9px] font-black uppercase tracking-widest rounded-xl">View Health Alerts</Button>
          </div>
        </div>

        <div className="bg-white rounded-[28px] border border-[#D9D9D9] p-5 h-[220px] shadow-sm border-l-[5px] border-l-[#0FA5A0] flex flex-col justify-between overflow-hidden">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-[#0FA5A0] flex items-center justify-center text-white"><IndianRupee className="h-5 w-5" /></div>
            <h3 className="text-sm font-bold text-[#2F4F4F]">Feed Cost</h3>
          </div>
          <div className="space-y-4">
            <p className="text-3xl font-black text-[#176E6C]">₹{totalFeedCost.toLocaleString()}</p>
            <Button onClick={() => router.push('/dashboard/feed')} className="w-full bg-[#176E6C] text-white text-[9px] font-black uppercase tracking-widest rounded-xl">View Full Report</Button>
          </div>
        </div>

        <div className="bg-white rounded-[28px] border border-[#D9D9D9] p-5 h-[220px] shadow-sm border-l-[5px] border-l-[#0FA5A0] flex flex-col justify-between overflow-hidden">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-[#0FA5A0] flex items-center justify-center text-white"><BarChart3 className="h-5 w-5" /></div>
            <h3 className="text-sm font-bold text-[#2F4F4F]">Avg Weight</h3>
          </div>
          <div className="space-y-4">
            <p className="text-3xl font-black text-[#176E6C]">{avgWeight.toFixed(1)} kg</p>
            <Button onClick={() => router.push('/dashboard/livestock')} className="w-full bg-[#176E6C] text-white text-[9px] font-black uppercase tracking-widest rounded-xl">Growth Trends</Button>
          </div>
        </div>
      </div>

      <Card className="rounded-xl border border-[#D9D9D9] shadow-sm bg-white overflow-hidden border-l-0">
        <CardHeader className="p-6 pb-2 flex flex-row items-center justify-between">
          <CardTitle className="text-base font-black text-[#2F4F4F]">Weight Growth</CardTitle>
          <Button variant="link" className="text-[#0FA5A0] font-black text-[10px] uppercase p-0 h-auto" onClick={() => router.push('/dashboard/livestock')}>
            View All <ChevronRight className="h-3 w-3 ml-1" />
          </Button>
        </CardHeader>
        <CardContent className="p-6 pt-4 grid grid-cols-2 gap-8">
          <div className="h-[200px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={growthData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 'bold', fill: '#94a3b8' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 'bold', fill: '#94a3b8' }} />
                <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }} />
                <Line type="monotone" dataKey="weight" stroke="#0FA5A0" strokeWidth={3} dot={{ r: 4, fill: '#0FA5A0', strokeWidth: 2, stroke: '#fff' }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-3">
            {(trackedSheep || []).slice(0, 5).map((sheep) => (
              <div key={sheep.id} className="flex items-center justify-between py-2 border-b border-slate-50 last:border-none">
                <div className="flex items-center gap-3">
                  <span className="text-sm font-black text-[#0FA5A0]">#{sheep.tagId}</span>
                  <span className="text-xs font-bold text-slate-600">{sheep.breed || 'Sheep'}</span>
                </div>
                <span className="text-[10px] font-bold text-slate-400">{sheep.registrationDate || '04/20/2024'}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  return isMobile ? MobileView : DesktopView;
}
