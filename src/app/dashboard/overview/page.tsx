'use client';

import { useFarm } from '@/context/FarmContext';
import { useWindowDimensions } from '@/hooks/use-mobile';
import { 
  Users, 
  Plus,
  Wheat, 
  TrendingUp,
  ChevronRight,
  Loader2,
  Activity,
  Heart,
  Syringe,
  LayoutGrid,
  Bell,
  User,
  Zap
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

  const StatCard = ({ title, value, subValue, icon: Icon, href, btnText, gradient, isHealth }: any) => (
    <div className={cn(
      "relative overflow-hidden rounded-[24px] p-5 flex flex-col justify-between shadow-2xl transition-all active:scale-95 group",
      gradient
    )}>
      {/* GLOW EFFECT */}
      <div className="absolute -top-10 -right-10 w-32 h-32 bg-white/10 blur-[40px] rounded-full" />
      
      <div>
        <div className="flex items-center gap-3 mb-4">
          <div className="h-10 w-10 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center">
            <Icon className="h-5 w-5 text-white" />
          </div>
          <p className="text-xs font-black text-white/90 tracking-tight">{title}</p>
        </div>
        
        <div className="mb-4">
          <h2 className="text-4xl font-black text-white tracking-tighter">{value}</h2>
          {isHealth ? (
            <div className="flex flex-col gap-2 mt-2">
              <div className="text-[10px] font-black text-white/70 uppercase tracking-widest flex items-center gap-2">
                <span className="text-yellow-400">8 Alert</span>
                <div className="flex-1 h-1.5 rounded-full overflow-hidden flex bg-white/10">
                  <div className="w-[40%] bg-red-500" />
                  <div className="w-[30%] bg-yellow-400" />
                  <div className="w-[30%] bg-emerald-400" />
                </div>
              </div>
            </div>
          ) : subValue ? (
            <p className="text-[10px] font-black text-white/70 uppercase tracking-widest mt-1">{subValue}</p>
          ) : null}
        </div>
      </div>

      <Button 
        onClick={() => router.push(href)}
        className="w-full h-10 rounded-xl bg-black/20 hover:bg-black/30 backdrop-blur-md border border-white/10 text-[9px] font-black uppercase tracking-[0.15em] text-white shadow-xl"
      >
        {btnText}
      </Button>
    </div>
  );

  const MobileView = (
    <div className="min-h-full -mx-4 -mt-4 px-4 pt-6 pb-32 bg-[#020617] relative overflow-hidden animate-in fade-in duration-1000">
      {/* NEURAL BACKGROUND DECORATIONS */}
      <div className="absolute top-0 left-0 w-full h-full opacity-20 pointer-events-none">
        <div className="absolute top-[10%] right-[10%] w-[150px] h-[150px] bg-cyan-500/20 blur-[80px] rounded-full" />
        <div className="absolute bottom-[20%] left-[5%] w-[200px] h-[200px] bg-purple-500/20 blur-[100px] rounded-full" />
        <svg className="absolute inset-0 w-full h-full opacity-10" viewBox="0 0 100 100" preserveAspectRatio="none">
          <path d="M0 20 L30 40 L60 20 L100 50" stroke="cyan" strokeWidth="0.2" fill="none" />
          <path d="M0 80 L40 60 L70 90 L100 70" stroke="purple" strokeWidth="0.2" fill="none" />
        </svg>
      </div>

      <header className="mb-10 relative z-10">
        <h1 className="text-3xl font-black text-white tracking-tight leading-none mb-2">Dashboard</h1>
        <p className="text-sm font-medium text-white/40">Here is an overview of your sheep farm.</p>
      </header>

      {/* STAT GRID 2X2 */}
      <div className="grid grid-cols-2 gap-4 mb-10 relative z-10">
        <StatCard 
          title="Total Sheep" 
          value={totalSheep} 
          icon={Users} 
          href="/dashboard/livestock" 
          btnText="View Sheep Records"
          gradient="bg-gradient-to-br from-[#00bcd4] to-[#009688]"
        />
        <StatCard 
          title="Health Records" 
          value={totalMedicineCost > 0 ? "8 Alert" : "Stable"} 
          icon={Plus} 
          href="/dashboard/medicine" 
          btnText="View Health Alerts"
          gradient="bg-gradient-to-br from-[#9c27b0] to-[#e91e63]"
          isHealth
        />
        <StatCard 
          title="22 Sheep" 
          value="22 Sheep" 
          icon={Activity} 
          href="/dashboard/labor" 
          btnText="View Schedule"
          gradient="bg-gradient-to-br from-[#ff9800] to-[#f44336]"
        />
        <StatCard 
          title="Feed Cost" 
          value={`₹${totalFeedCost.toLocaleString()}`} 
          icon={Wheat} 
          href="/dashboard/feed" 
          btnText="View Summary"
          gradient="bg-gradient-to-br from-[#e91e63] to-[#880e4f]"
        />
      </div>

      {/* GROWTH CHART SECTION */}
      <div className="relative z-10">
        <Card className="border-none bg-white/5 backdrop-blur-xl rounded-[32px] overflow-hidden shadow-2xl ring-1 ring-white/10">
          <CardHeader className="px-8 pt-8 pb-4 flex flex-row items-center justify-between border-none">
            <CardTitle className="text-lg font-black text-white tracking-tight">Weight Growth</CardTitle>
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
                    itemStyle={{ color: '#00bcd4', fontWeight: 'bold' }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="weight" 
                    stroke="#00bcd4" 
                    strokeWidth={4} 
                    dot={{ r: 5, fill: '#00bcd4', strokeWidth: 3, stroke: '#020617' }}
                    activeDot={{ r: 8, stroke: '#fff', strokeWidth: 2 }} 
                  />
                </LineChart>
              </ResponsiveContainer>
              <div className="flex items-center justify-center gap-2 mt-4">
                <div className="h-1.5 w-6 bg-cyan-400 rounded-full shadow-[0_0_10px_rgba(34,211,238,0.5)]" />
                <span className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em]">Avg Weight Growth</span>
              </div>
            </div>

            <div className="space-y-4 pt-4 border-t border-white/5">
              {(trackedSheep || []).slice(0, 5).map((sheep) => (
                <div key={sheep.id} className="flex items-center justify-between group">
                  <div className="flex items-center gap-4">
                    <div className="h-2 w-2 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.8)]" />
                    <div className="flex flex-col">
                      <span className="text-sm font-black text-white">#{sheep.tagId} {sheep.breed || 'Sheep'}</span>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold text-white/30">{sheep.registrationDate || '04/20/2024'}</span>
                </div>
              ))}
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
        <div className="bg-white rounded-xl border border-[#D9D9D9] p-6 shadow-sm border-l-[5px] border-l-[#0FA5A0]">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-10 w-10 rounded-full bg-[#0FA5A0] flex items-center justify-center text-white"><Users className="h-5 w-5" /></div>
            <h3 className="text-sm font-bold text-[#2F4F4F]">Total Sheep</h3>
          </div>
          <p className="text-3xl font-black text-[#176E6C] mb-4">{totalSheep}</p>
          <Button onClick={() => router.push('/dashboard/livestock')} className="w-full bg-[#176E6C] text-white text-[9px] font-black uppercase tracking-widest">View Sheep Records</Button>
        </div>

        <div className="bg-white rounded-xl border border-[#D9D9D9] p-6 shadow-sm border-l-[5px] border-l-[#43A047]">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-10 w-10 rounded-full bg-[#43A047] flex items-center justify-center text-white"><Plus className="h-5 w-5" /></div>
            <h3 className="text-sm font-bold text-[#2F4F4F]">Health Records</h3>
          </div>
          <p className="text-3xl font-black text-[#176E6C] mb-4">Stable</p>
          <Button onClick={() => router.push('/dashboard/medicine')} className="w-full bg-[#176E6C] text-white text-[9px] font-black uppercase tracking-widest">View Health Alerts</Button>
        </div>

        <div className="bg-white rounded-xl border border-[#D9D9D9] p-6 shadow-sm border-l-[5px] border-l-[#0FA5A0]">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-10 w-10 rounded-full bg-[#0FA5A0] flex items-center justify-center text-white"><Wheat className="h-5 w-5" /></div>
            <h3 className="text-sm font-bold text-[#2F4F4F]">Feed Cost</h3>
          </div>
          <p className="text-3xl font-black text-[#176E6C] mb-4">₹{totalFeedCost.toLocaleString()}</p>
          <Button onClick={() => router.push('/dashboard/feed')} className="w-full bg-[#176E6C] text-white text-[9px] font-black uppercase tracking-widest">View Full Report</Button>
        </div>

        <div className="bg-white rounded-xl border border-[#D9D9D9] p-6 shadow-sm border-l-[5px] border-l-[#0FA5A0]">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-10 w-10 rounded-full bg-[#0FA5A0] flex items-center justify-center text-white"><Activity className="h-5 w-5" /></div>
            <h3 className="text-sm font-bold text-[#2F4F4F]">Labour Cost</h3>
          </div>
          <p className="text-3xl font-black text-[#176E6C] mb-4">₹{totalLaborCost.toLocaleString()}</p>
          <Button onClick={() => router.push('/dashboard/labor')} className="w-full bg-[#176E6C] text-white text-[9px] font-black uppercase tracking-widest">View Full Report</Button>
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
