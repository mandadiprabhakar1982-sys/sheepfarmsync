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
  Syringe
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
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

/**
 * @fileOverview High-Fidelity Dashboard inspired by FarmAudit reference.
 * Optimized for 2x2 mobile grid and tactile growth insights.
 */
export default function OverviewPage() {
  const { width } = useWindowDimensions();
  const isMobile = width < 768;
  const router = useRouter();
  
  const { 
    totalSheep,
    totalFeedCost,
    totalMedicineCost,
    totalLaborCost,
    trackedSheep,
    isLoading 
  } = useFarm();

  if (isLoading) {
    return (
      <div className="flex h-full w-full items-center justify-center min-h-[60vh]">
        <Loader2 className="h-10 w-10 animate-spin text-primary opacity-20" />
      </div>
    );
  }

  // Mock data for the weight growth chart
  const growthData = [
    { name: 'Oct', weight: 55 },
    { name: 'Nov', weight: 62 },
    { name: 'Dec', weight: 68 },
    { name: 'Jan', weight: 74 },
    { name: 'Feb', weight: 80 },
  ];

  const SummaryCard = ({ title, value, subText, icon: Icon, href, variant = 'default' }: { title: string, value: string | number, subText: string, icon: any, href: string, variant?: 'default' | 'health' }) => (
    <Card className="premium-card flex flex-col justify-between h-full bg-white border-none shadow-depth rounded-[16px] overflow-hidden">
      <CardHeader className="p-4 pb-2 space-y-0">
        <div className="flex items-center gap-3">
          <div className={cn(
            "h-10 w-10 rounded-full flex items-center justify-center text-white",
            variant === 'health' ? "bg-[#43A047]" : "bg-[#0FA5A0]"
          )}>
            <Icon className="h-5 w-5" />
          </div>
          <h3 className="text-sm font-bold text-[#2F4F4F] tracking-tight">{title}</h3>
        </div>
      </CardHeader>
      <CardContent className="p-4 pt-0 flex flex-col flex-1 justify-between">
        <div className="mb-4">
          <p className="text-3xl font-black text-[#176E6C] tracking-tighter">{value}</p>
          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">{subText}</p>
        </div>
        <Button 
          variant="secondary" 
          onClick={() => router.push(href)}
          className={cn(
            "w-full h-9 rounded-md text-[9px] font-black uppercase tracking-widest border-none transition-all active:scale-95",
            variant === 'health' ? "bg-[#176E6C] text-white hover:bg-[#0B8F8A]" : "bg-[#176E6C] text-white hover:bg-[#0B8F8A]"
          )}
        >
          {title.includes('Records') ? 'View Health Alerts' : `View ${title}`}
        </Button>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-700 pb-24 md:pb-12 max-w-5xl mx-auto">
      {/* INTRO TEXT */}
      <div className="px-2 pt-2">
        <p className="text-[#2F4F4F] text-sm font-medium">Here is an overview of your sheep farm.</p>
      </div>

      {/* 2X2 GRID FOR MOBILE, 4-COL FOR DESKTOP */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        <SummaryCard 
          title="Total Sheep" 
          value={totalSheep} 
          subText="View Sheep Records" 
          icon={Users} 
          href="/dashboard/livestock" 
        />
        <SummaryCard 
          title="Health Records" 
          value={totalMedicineCost > 0 ? "8 Alert" : "Stable"} 
          subText="View Health Alerts" 
          icon={Plus} 
          variant="health"
          href="/dashboard/medicine" 
        />
        <SummaryCard 
          title="Feed Cost" 
          value={`₹${totalFeedCost.toLocaleString()}`} 
          subText="View Summary" 
          icon={Wheat} 
          href="/dashboard/feed" 
        />
        <SummaryCard 
          title="Labour Cost" 
          value={`₹${totalLaborCost.toLocaleString()}`} 
          subText="View Summary" 
          icon={Activity} 
          href="/dashboard/labor" 
        />
      </div>

      {/* WEIGHT GROWTH SECTION */}
      <Card className="premium-card rounded-[16px] border-none shadow-depth bg-white overflow-hidden">
        <CardHeader className="p-6 pb-2 flex flex-row items-center justify-between">
          <CardTitle className="text-base font-black text-[#2F4F4F]">Weight Growth</CardTitle>
          <Button variant="link" className="text-primary font-black text-[10px] uppercase p-0 h-auto" onClick={() => router.push('/dashboard/livestock')}>
            View All <ChevronRight className="h-3 w-3 ml-1" />
          </Button>
        </CardHeader>
        <CardContent className="p-6 pt-4 grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* CHART */}
          <div className="h-[200px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={growthData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 10, fontWeight: 'bold', fill: '#94a3b8' }} 
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 10, fontWeight: 'bold', fill: '#94a3b8' }}
                />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                />
                <Line 
                  type="monotone" 
                  dataKey="weight" 
                  stroke="#0FA5A0" 
                  strokeWidth={3} 
                  dot={{ r: 4, fill: '#0FA5A0', strokeWidth: 2, stroke: '#fff' }}
                  activeDot={{ r: 6 }} 
                />
              </LineChart>
            </ResponsiveContainer>
            <div className="flex items-center justify-center gap-2 mt-2">
              <div className="h-1 w-4 bg-[#0FA5A0] rounded-full" />
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Avg. Weight Growth</span>
            </div>
          </div>

          {/* RECENT SHEEP LIST */}
          <div className="space-y-3">
            {(trackedSheep || []).slice(0, 5).map((sheep) => (
              <div key={sheep.id} className="flex items-center justify-between py-2 border-b border-slate-50 last:border-none">
                <div className="flex items-center gap-3">
                  <span className="text-sm font-black text-primary">#{sheep.tagId}</span>
                  <span className="text-xs font-bold text-slate-600">{sheep.breed || 'Sheep'}</span>
                </div>
                <span className="text-[10px] font-bold text-slate-400">{sheep.registrationDate || '04/20/2024'}</span>
              </div>
            ))}
            <div className="pt-2">
              <Button 
                variant="outline" 
                className="w-full h-10 border-primary/20 text-primary font-black text-[10px] uppercase tracking-widest rounded-xl hover:bg-primary/5"
                onClick={() => router.push('/dashboard/livestock')}
              >
                View All <ChevronRight className="h-3 w-3 ml-1" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
