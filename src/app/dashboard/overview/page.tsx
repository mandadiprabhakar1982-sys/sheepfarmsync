'use client';

import { useFarm } from '@/context/FarmContext';
import { useWindowDimensions } from '@/hooks/use-mobile';
import { 
  Users, 
  Heart, 
  Activity,
  Wheat, 
  ArrowUpRight,
  TrendingUp,
  Skull,
  ChevronRight,
  Loader2,
  CalendarDays,
  Plus
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { PageHeader } from '@/components/page-header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';

/**
 * @fileOverview Refined Sheep Enterprise Dashboard
 * Inspired by the provided image for a high-density, tactical UI.
 */
export default function OverviewPage() {
  const { width } = useWindowDimensions();
  const isMobile = width < 768;
  const router = useRouter();
  
  const { 
    totalSheep,
    totalDead,
    totalExpenses, 
    totalFeedCost,
    totalLaborCost,
    totalMedicineCost,
    deadAnimals,
    purchases,
    laborCosts,
    isLoading 
  } = useFarm();

  if (isLoading) {
    return (
      <div className="flex h-full w-full items-center justify-center min-h-[60vh]">
        <Loader2 className="h-10 w-10 animate-spin text-primary opacity-20" />
      </div>
    );
  }

  const MetricCard = ({ title, value, subText, icon: Icon, href }: { title: string, value: string | number, subText: string, icon: any, href: string }) => (
    <Card className="premium-card flex flex-col justify-between h-full hover:border-[#0FA5A0]">
      <div className="flex items-center gap-3 mb-4">
        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
          <Icon className="h-5 w-5" />
        </div>
        <h3 className="text-sm font-black text-[#2F4F4F] tracking-tight">{title}</h3>
      </div>
      <div className="mb-4">
        <p className="text-4xl font-black text-[#176E6C] tracking-tighter">{value}</p>
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">{subText}</p>
      </div>
      <Button 
        variant="outline" 
        onClick={() => router.push(href)}
        className="w-full h-9 rounded-md text-[10px] font-black uppercase tracking-widest border-primary/20 hover:bg-primary/5"
      >
        View Details
      </Button>
    </Card>
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-700 pb-20">
      {/* HEADER & HERO SECTION */}
      <section className="relative h-[240px] md:h-[280px] rounded-[16px] overflow-hidden shadow-xl">
        <Image 
          src="https://picsum.photos/seed/sheepfarm/1600/600" 
          alt="Farm Banner" 
          fill 
          className="object-cover brightness-[0.6]"
          priority
          data-ai-hint="sheep farm"
        />
        <div className="absolute inset-0 p-8 md:p-12 flex flex-col justify-end">
          <h1 className="text-3xl md:text-5xl font-black text-white tracking-tighter leading-none mb-2">Dashboard</h1>
          <p className="text-white/80 text-sm md:text-base font-medium max-w-lg">Here is an overview of your sheep farm operations and critical metrics.</p>
        </div>
      </section>

      {/* PRIMARY METRICS GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard title="Total Sheep" value={totalSheep} subText="Live Flock Count" icon={Users} href="/dashboard/livestock" />
        <MetricCard title="Health Records" value={totalMedicineCost > 0 ? "8 Alert" : "Stable"} subText="Recent Medical Logs" icon={Activity} href="/dashboard/medicine" />
        <MetricCard title="Vaccination Due" value="22 Sheep" subText="Upcoming Schedule" icon={Heart} href="/dashboard/medicine" />
        <MetricCard title="Feed Cost" value={`₹${totalFeedCost.toLocaleString()}`} subText="Monthly Expenditure" icon={Wheat} href="/dashboard/feed" />
      </div>

      {/* DETAIL ROW: GROWTH & MORTALITY */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Weight Growth Chart Placeholder */}
        <div className="lg:col-span-5">
          <Card className="premium-card h-full">
            <CardHeader className="p-0 mb-6 flex flex-row items-center justify-between">
              <CardTitle className="text-lg font-black tracking-tight text-[#176E6C]">Weight Growth</CardTitle>
              <Badge className="bg-primary/10 text-primary border-none text-[10px] font-black">+12% Monthly</Badge>
            </CardHeader>
            <div className="h-[200px] w-full bg-slate-50 rounded-lg border border-dashed border-slate-200 flex items-center justify-center relative overflow-hidden">
              <TrendingUp className="h-16 w-16 text-primary opacity-10" />
              <div className="absolute bottom-4 right-4">
                <Button size="sm" variant="secondary" className="h-8 text-[10px] font-black uppercase tracking-widest gap-2">
                  View All <ChevronRight className="h-3 w-3" />
                </Button>
              </div>
            </div>
          </Card>
        </div>

        {/* Mortality Alerts Table */}
        <div className="lg:col-span-7">
          <Card className="premium-card h-full">
            <CardHeader className="p-0 mb-6 flex flex-row items-center justify-between">
              <CardTitle className="text-lg font-black tracking-tight text-[#176E6C]">Mortality Alerts</CardTitle>
              <Link href="/dashboard/mortality" className="text-[10px] font-black uppercase tracking-widest text-primary hover:underline">View All</Link>
            </CardHeader>
            <Table>
              <TableHeader className="bg-slate-50 border-none">
                <TableRow className="border-none">
                  <TableHead className="text-[10px] font-black text-slate-400">ID</TableHead>
                  <TableHead className="text-[10px] font-black text-slate-400">Sheep</TableHead>
                  <TableHead className="text-[10px] font-black text-slate-400">Reason</TableHead>
                  <TableHead className="text-[10px] font-black text-slate-400 text-right">Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {deadAnimals && deadAnimals.length > 0 ? deadAnimals.slice(0, 5).map((a) => (
                  <TableRow key={a.id} className="border-b border-slate-100 last:border-none">
                    <TableCell className="text-[11px] font-bold text-primary">#{a.id.slice(0, 4)}</TableCell>
                    <TableCell className="text-[11px] font-bold">{a.tagId || 'N/A'}</TableCell>
                    <TableCell className="text-[11px] font-medium text-slate-500">{a.causeOfDeath}</TableCell>
                    <TableCell className="text-[11px] font-bold text-slate-400 text-right">{a.dateOfDeath}</TableCell>
                  </TableRow>
                )) : (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-10 text-[11px] font-black opacity-20 uppercase tracking-widest">No mortality records</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </Card>
        </div>
      </div>

      {/* HISTORY ROW: PURCHASE & LABOR */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Purchase History */}
        <Card className="premium-card">
          <CardHeader className="p-0 mb-6 flex flex-row items-center justify-between">
            <CardTitle className="text-lg font-black tracking-tight text-[#176E6C]">Purchase History</CardTitle>
            <Link href="/dashboard/purchase" className="text-[10px] font-black uppercase tracking-widest text-primary hover:underline">View Report</Link>
          </CardHeader>
          <Table>
            <TableHeader className="bg-slate-50">
              <TableRow className="border-none">
                <TableHead className="text-[10px] font-black text-slate-400">Date</TableHead>
                <TableHead className="text-[10px] font-black text-slate-400">Item</TableHead>
                <TableHead className="text-[10px] font-black text-slate-400 text-right">Cost</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {purchases && purchases.length > 0 ? purchases.slice(0, 4).map((p) => (
                <TableRow key={p.id} className="border-b border-slate-50 last:border-none">
                  <TableCell className="text-[11px] font-medium text-slate-400">{p.purchaseDate}</TableCell>
                  <TableCell className="text-[11px] font-bold">{p.farmerName} ({p.animalCount} Head)</TableCell>
                  <TableCell className="text-[11px] font-black text-[#176E6C] text-right">₹{p.purchasePrice.toLocaleString()}</TableCell>
                </TableRow>
              )) : (
                <TableRow><TableCell colSpan={3} className="text-center py-8 opacity-20">Empty Ledger</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </Card>

        {/* Labor Costs */}
        <Card className="premium-card">
          <CardHeader className="p-0 mb-6 flex flex-row items-center justify-between">
            <CardTitle className="text-lg font-black tracking-tight text-[#176E6C]">Labor Costs</CardTitle>
            <Link href="/dashboard/labor" className="text-[10px] font-black uppercase tracking-widest text-primary hover:underline">View Report</Link>
          </CardHeader>
          <Table>
            <TableHeader className="bg-slate-50">
              <TableRow className="border-none">
                <TableHead className="text-[10px] font-black text-slate-400">Date</TableHead>
                <TableHead className="text-[10px] font-black text-slate-400">Staff</TableHead>
                <TableHead className="text-[10px] font-black text-slate-400 text-right">Wages</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {laborCosts && laborCosts.length > 0 ? laborCosts.slice(0, 4).map((l) => (
                <TableRow key={l.id} className="border-b border-slate-50 last:border-none">
                  <TableCell className="text-[11px] font-medium text-slate-400">{l.date}</TableCell>
                  <TableCell className="text-[11px] font-bold">{l.employeeName}</TableCell>
                  <TableCell className="text-[11px] font-black text-[#176E6C] text-right">₹{l.totalLaborCosts.toLocaleString()}</TableCell>
                </TableRow>
              )) : (
                <TableRow><TableCell colSpan={3} className="text-center py-8 opacity-20">Empty Ledger</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </Card>
      </div>
    </div>
  );
}