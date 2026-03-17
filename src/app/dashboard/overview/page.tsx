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
  ShoppingBag
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const ResponsiveContainer = dynamic(() => import('recharts').then(mod => mod.ResponsiveContainer), { ssr: false });
const LineChart = dynamic(() => import('recharts').then(mod => mod.LineChart), { ssr: false });
const Line = dynamic(() => import('recharts').then(mod => mod.Line), { ssr: false });
const XAxis = dynamic(() => import('recharts').then(mod => mod.XAxis), { ssr: false });
const YAxis = dynamic(() => import('recharts').then(mod => mod.YAxis), { ssr: false });
const CartesianGrid = dynamic(() => import('recharts').then(mod => mod.CartesianGrid), { ssr: false });
const Tooltip = dynamic(() => import('recharts').then(mod => mod.Tooltip), { ssr: false });

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
        <Loader2 className="h-10 w-10 animate-spin text-[#14d5c7] opacity-20" />
      </div>
    );
  }

  const healthyCount = (trackedSheep || []).filter(s => s.healthStatus === 'Healthy').length;
  const careCount = (trackedSheep || []).filter(s => s.healthStatus === 'Ill' || s.healthStatus === 'Recovering').length;
  const pregnantCount = (trackedSheep || []).filter(s => s.notes?.toLowerCase().includes('pregnant')).length;
  const alertCount = (healthTasks || []).filter(t => t.healthType === 'Treatment').length;

  const growthData = [
    { name: 'Oct', weight: 55 },
    { name: 'Nov', weight: 62 },
    { name: 'Dec', weight: 68 },
    { name: 'Jan', weight: 74 },
    { name: 'Feb', weight: 80 },
  ];

  const MobileView = (
    <div className="mobile-neural-screen pb-[110px]">
      <header className="mb-8 pt-4">
        <h1 className="text-[34px] font-[800] text-white tracking-tight leading-[1.1]">Dashboard</h1>
        <p className="text-sm font-medium text-white/40">Overview of Your Sheep Farm</p>
      </header>

      <div className="grid grid-cols-2 gap-4 mb-8">
        {/* TOTAL SHEEP */}
        <div 
          className="glossy-card bg-gradient-to-br from-[#11c5be] to-[#0d8f89] h-[220px] flex flex-col justify-between p-5 card-inner-shadow cursor-pointer" 
          onClick={() => router.push('/dashboard/livestock')}
        >
          <div className="glossy-overlay" />
          <div className="h-10 w-10 rounded-full bg-white/20 border border-white/30 flex items-center justify-center">
            <Activity className="h-5 w-5 text-white" />
          </div>
          <div>
            <p className="text-[10px] font-black text-white/60 uppercase tracking-widest mb-1">Total Sheep</p>
            <div className="flex items-end gap-2">
              <span className="text-5xl font-black tracking-tighter leading-none">{totalSheep}</span>
              <div className="mb-1 flex items-center gap-1 px-2 py-0.5 rounded-full bg-white/20 text-[10px] font-black">
                +12 <TrendingUp className="h-2.5 w-2.5" />
              </div>
            </div>
          </div>
          <button className="w-full rounded-2xl bg-white/10 py-3 font-black text-[9px] uppercase tracking-[0.2em] border border-white/10 flex items-center justify-center gap-2">
            View Records <ChevronRight className="h-3 w-3" />
          </button>
        </div>

        {/* HEALTH ALERTS */}
        <div 
          className="glossy-card bg-gradient-to-br from-[#db2777] to-[#9d174d] h-[220px] flex flex-col justify-between p-5 card-inner-shadow cursor-pointer" 
          onClick={() => router.push('/dashboard/medicine')}
        >
          <div className="glossy-overlay" />
          <div className="h-10 w-10 rounded-full bg-white/20 border border-white/30 flex items-center justify-center">
            <HeartPulse className="h-5 w-5 text-white" />
          </div>
          <div>
            <p className="text-[10px] font-black text-white/60 uppercase tracking-widest mb-1">Health Alerts</p>
            <div className="flex items-center gap-3">
              <span className="text-5xl font-black tracking-tighter leading-none">{alertCount}</span>
              <span className="px-2.5 py-1 rounded-full bg-white text-[#db2777] text-[10px] font-black uppercase tracking-widest">Alert</span>
            </div>
            <div className="flex gap-1 mt-3">
              <div className="h-1 flex-1 bg-yellow-400 rounded-full" />
              <div className="h-1 flex-1 bg-yellow-400 rounded-full" />
              <div className="h-1 flex-1 bg-yellow-400 rounded-full" />
              <div className="h-1 flex-1 bg-[#14d5c7] rounded-full" />
              <div className="h-1 flex-1 bg-white/20 rounded-full" />
            </div>
          </div>
          <button className="w-full rounded-2xl bg-white/10 py-3 font-black text-[9px] uppercase tracking-[0.2em] border border-white/10 flex items-center justify-center gap-2">
            View Alerts <ChevronRight className="h-3 w-3" />
          </button>
        </div>

        {/* FEED COST */}
        <div 
          className="glossy-card bg-gradient-to-br from-[#f59e0b] to-[#d97706] h-[220px] flex flex-col justify-between p-5 card-inner-shadow cursor-pointer" 
          onClick={() => router.push('/dashboard/feed')}
        >
          <div className="glossy-overlay" />
          <div className="h-10 w-10 rounded-full bg-white/20 border border-white/30 flex items-center justify-center">
            <IndianRupee className="h-5 w-5 text-white" />
          </div>
          <div className="relative">
            <p className="text-[10px] font-black text-white/60 uppercase tracking-widest mb-1">Feed Cost</p>
            <div className="text-3xl font-black tracking-tight leading-none">₹{totalFeedCost.toLocaleString()}</div>
            <div className="mt-2 inline-flex items-center px-2.5 py-1 rounded-full bg-[#115e59] text-[9px] font-black text-[#5eead4] uppercase tracking-widest">This Month</div>
          </div>
          <button className="w-full rounded-2xl bg-white/10 py-3 font-black text-[9px] uppercase tracking-[0.2em] border border-white/10 flex items-center justify-center gap-2">
            Reports <ChevronRight className="h-3 w-3" />
          </button>
        </div>

        {/* AVG WEIGHT */}
        <div 
          className="glossy-card bg-gradient-to-br from-[#3b82f6] to-[#1d4ed8] h-[220px] flex flex-col justify-between p-5 card-inner-shadow overflow-hidden cursor-pointer" 
          onClick={() => router.push('/dashboard/livestock')}
        >
          <div className="glossy-overlay" />
          <div className="h-10 w-10 rounded-full bg-white/20 border border-white/30 flex items-center justify-center">
            <BarChart3 className="h-5 w-5 text-white" />
          </div>
          <div>
            <p className="text-[10px] font-black text-white/60 uppercase tracking-widest mb-1">Avg. Weight</p>
            <div className="text-4xl font-black tracking-tight leading-none mb-2">{avgWeight.toFixed(1)} <span className="text-xl">kg</span></div>
            <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#5eead4]/20 text-[10px] font-black text-[#5eead4]">+5.2% <TrendingUp className="h-2.5 w-2.5" /></div>
          </div>
          <button className="w-full rounded-2xl bg-white/10 py-3 font-black text-[9px] uppercase tracking-[0.2em] border border-white/10 flex items-center justify-center gap-2">
            Weight Chart <ChevronRight className="h-3 w-3" />
          </button>
        </div>
      </div>

      {/* STATUS MATRIX ROW */}
      <div className="p-1 rounded-[2.5rem] bg-white/5 border border-white/10 shadow-2xl flex items-center h-[90px] mb-8 overflow-hidden">
        {[
          { icon: Heart, label: 'Healthy', val: healthyCount, color: '#14d5c7' },
          { icon: Syringe, label: 'Care', val: careCount, color: '#f59e0b' },
          { icon: Baby, label: 'Pregnant', val: pregnantCount, color: '#db2777' },
          { icon: ShoppingBag, label: 'Sold', val: totalSales ? 4 : 0, color: '#3b82f6' }
        ].map((stat, i) => (
          <div key={i} className="flex-1 flex flex-col items-center justify-center relative h-full">
            <div className="flex items-center gap-1.5 mb-1.5">
              <stat.icon className="h-3.5 w-3.5" style={{ color: stat.color }} />
              <span className="text-[9px] font-black text-white/40 uppercase tracking-tight">{stat.label}</span>
            </div>
            <span className="text-2xl font-black tracking-tighter leading-none text-white">{stat.val}</span>
            <div className="absolute bottom-0 w-10 h-0.5 rounded-full opacity-60" style={{ backgroundColor: stat.color }} />
            {i < 3 && <div className="absolute right-0 top-1/4 bottom-1/4 w-px bg-white/5" />}
          </div>
        ))}
      </div>
    </div>
  );

  const DesktopView = (
    <div className="space-y-6 animate-in fade-in duration-700 pb-12 max-w-5xl mx-auto">
      <div className="px-2 pt-2"><p className="text-[#2F4F4F] text-sm font-medium">Verified farm operational metrics.</p></div>
      <div className="grid grid-cols-4 gap-6">
        <div className="bg-white rounded-[28px] border border-[#D9D9D9] p-5 h-[220px] shadow-sm border-l-[5px] border-l-[#0FA5A0] flex flex-col justify-between overflow-hidden">
          <div className="flex items-center gap-3"><div className="h-10 w-10 rounded-full bg-[#0FA5A0] flex items-center justify-center text-white"><Activity className="h-5 w-5" /></div><h3 className="text-sm font-bold text-[#2F4F4F]">Total Sheep</h3></div>
          <div className="space-y-4"><p className="text-3xl font-black text-[#176E6C]">{totalSheep}</p><Button onClick={() => router.push('/dashboard/livestock')} className="w-full bg-[#176E6C] text-white text-[9px] font-black uppercase tracking-widest rounded-xl">View Records</Button></div>
        </div>
        <div className="bg-white rounded-[28px] border border-[#D9D9D9] p-5 h-[220px] shadow-sm border-l-[5px] border-l-[#db2777] flex flex-col justify-between overflow-hidden">
          <div className="flex items-center gap-3"><div className="h-10 w-10 rounded-full bg-[#db2777] flex items-center justify-center text-white"><HeartPulse className="h-5 w-5" /></div><h3 className="text-sm font-bold text-[#2F4F4F]">Health Alerts</h3></div>
          <div className="space-y-4"><p className="text-3xl font-black text-[#176E6C]">{alertCount}</p><Button onClick={() => router.push('/dashboard/medicine')} className="w-full bg-[#176E6C] text-white text-[9px] font-black uppercase tracking-widest rounded-xl">View Alerts</Button></div>
        </div>
        <div className="bg-white rounded-[28px] border border-[#D9D9D9] p-5 h-[220px] shadow-sm border-l-[5px] border-l-[#f59e0b] flex flex-col justify-between overflow-hidden">
          <div className="flex items-center gap-3"><div className="h-10 w-10 rounded-full bg-[#f59e0b] flex items-center justify-center text-white"><IndianRupee className="h-5 w-5" /></div><h3 className="text-sm font-bold text-[#2F4F4F]">Feed Cost</h3></div>
          <div className="space-y-4"><p className="text-3xl font-black text-[#176E6C]">₹{totalFeedCost.toLocaleString()}</p><Button onClick={() => router.push('/dashboard/feed')} className="w-full bg-[#176E6C] text-white text-[9px] font-black uppercase tracking-widest rounded-xl">View Reports</Button></div>
        </div>
        <div className="bg-white rounded-[28px] border border-[#D9D9D9] p-5 h-[220px] shadow-sm border-l-[5px] border-l-[#3b82f6] flex flex-col justify-between overflow-hidden">
          <div className="flex items-center gap-3"><div className="h-10 w-10 rounded-full bg-[#3b82f6] flex items-center justify-center text-white"><BarChart3 className="h-5 w-5" /></div><h3 className="text-sm font-bold text-[#2F4F4F]">Avg Weight</h3></div>
          <div className="space-y-4"><p className="text-3xl font-black text-[#176E6C]">{avgWeight.toFixed(1)} kg</p><Button onClick={() => router.push('/dashboard/livestock')} className="w-full bg-[#176E6C] text-white text-[9px] font-black uppercase tracking-widest rounded-xl">Growth Trends</Button></div>
        </div>
      </div>

      <Card className="rounded-xl border border-[#D9D9D9] shadow-sm bg-white overflow-hidden border-l-0">
        <CardHeader className="p-6 pb-2 flex flex-row items-center justify-between">
          <CardTitle className="text-base font-black text-[#2F4F4F]">Weight Growth Projection</CardTitle>
          <Button variant="link" className="text-[#0FA5A0] font-black text-[10px] uppercase p-0 h-auto" onClick={() => router.push('/dashboard/livestock')}>Full Analytics <ChevronRight className="h-3 w-3 ml-1" /></Button>
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
                <div className="flex items-center gap-3"><span className="text-sm font-black text-[#0FA5A0]">#{sheep.tagId}</span><span className="text-xs font-bold text-slate-600">{sheep.breed || 'Sheep'}</span></div>
                <span className="text-[10px] font-bold text-slate-400">{sheep.registrationDate}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  return isMobile ? MobileView : DesktopView;
}
