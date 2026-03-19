'use client';

import { useState, useMemo } from 'react';
import { Shell } from '@/components/shared/Shell';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/page-header';
import { Calculator, Wheat, Leaf, Scale, ReceiptIndianRupee, TrendingDown, ArrowUpRight, Package, CalendarDays, RefreshCcw, CheckCircle2 } from 'lucide-react';
import { SyncProIcon } from '@/components/logo';
import { useFarm } from '@/context/FarmContext';
import { cn } from '@/lib/utils';

function CalculatorContent() {
  const { totalSheep, trackedSheep } = useFarm();

  // Input states
  const [sheepCount, setSheepCount] = useState('80');
  const [weight, setWeight] = useState('15');
  const [tmrCost, setTmrCost] = useState('21');
  const [groundnutCost, setGroundnutCost] = useState('10');
  const [bagSize, setBagSize] = useState('50');
  const [isSynced, setIsSynced] = useState(false);

  const [results, setResults] = useState<{
    totalFeedPerSheep: number;
    totalTMR: number;
    totalGroundnut: number;
    dailyCost: number;
    finalWeight: number;
    totalTMR150: number;
    bagsNeeded: number;
  } | null>(null);

  const handleSyncFlockData = () => {
    setSheepCount(totalSheep.toString());
    if (trackedSheep && trackedSheep.length > 0) {
      const totalWeight = trackedSheep.reduce((acc, s) => acc + s.currentWeight, 0);
      const avgWeight = totalWeight / trackedSheep.length;
      setWeight(avgWeight.toFixed(1));
    }
    setIsSynced(true);
    setTimeout(() => setIsSynced(false), 3000);
  };

  const calculateFeed = () => {
    const sheep = parseFloat(sheepCount);
    const startWeight = parseFloat(weight);
    const tmrPrice = parseFloat(tmrCost);
    const gnutPrice = parseFloat(groundnutCost);
    const sizePerBag = parseFloat(bagSize);

    if (isNaN(sheep) || isNaN(startWeight) || isNaN(tmrPrice) || isNaN(gnutPrice) || isNaN(sizePerBag)) return;

    const dailyGain = 0.20; // 200 grams per day
    const days = 150;
    const finalWeight = startWeight + (dailyGain * days);
    const totalFeedPerSheep = startWeight * 0.04;
    const tmrPerSheep = totalFeedPerSheep * 0.9;
    const groundnutPerSheep = totalFeedPerSheep * 0.1;
    const totalTMR = sheep * tmrPerSheep;
    const totalGroundnut = sheep * groundnutPerSheep;
    const dailyCost = (totalTMR * tmrPrice) + (totalGroundnut * gnutPrice);
    const avgWeight = (startWeight + finalWeight) / 2;
    const avgFeed = avgWeight * 0.04;
    const avgTMR = avgFeed * 0.9;
    const totalTMR150 = sheep * avgTMR * days;
    const bagsNeeded = totalTMR150 / sizePerBag;

    setResults({ totalFeedPerSheep, totalTMR, totalGroundnut, dailyCost, finalWeight, totalTMR150, bagsNeeded });
  };

  return (
    <div className="h-full">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12 px-4 md:px-0">
        <PageHeader
          title="Nutrition Engine"
          description="High-precision feed requirements and growth projections."
          className="mb-0"
        />
        <div className="hidden lg:flex items-center gap-4 px-6 py-3 bg-neutral-900 rounded-2xl text-white shadow-xl">
          <SyncProIcon className="h-5 w-5 text-emerald-400" />
          <div>
            <p className="text-[8px] font-black uppercase tracking-widest opacity-40 leading-none">Precision Calc</p>
            <p className="text-xl font-black tracking-tight text-white">Active</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 px-4 md:px-0 pb-32">
        <div className="lg:col-span-4 space-y-10">
          <Card className="border-none bg-white rounded-[2.5rem] shadow-2xl overflow-hidden">
            <CardHeader className="bg-slate-50 p-8 border-b border-slate-100">
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <CardTitle className="text-xl font-black tracking-tight flex items-center gap-3">
                    <Scale className="h-5 w-5 text-[#0FA5A0]" />
                    Flock Metrics
                  </CardTitle>
                  <CardDescription className="text-[10px] font-bold uppercase tracking-widest opacity-60">Define your feeding base</CardDescription>
                </div>
                <Button variant="ghost" size="icon" onClick={handleSyncFlockData} className={cn("h-10 w-10 rounded-full transition-all", isSynced ? "text-emerald-600 bg-emerald-50" : "text-[#0FA5A0] hover:bg-[#0FA5A0]/10")}>
                  {isSynced ? <CheckCircle2 className="h-5 w-5 animate-in zoom-in" /> : <RefreshCcw className="h-5 w-5" />}
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-8 space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-2">Sheep Count</Label>
                  <Input type="number" value={sheepCount} onChange={(e) => setSheepCount(e.target.value)} className="h-14 rounded-2xl bg-slate-50 border-none font-bold text-lg" />
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-2">Avg Start Weight (kg)</Label>
                  <Input type="number" value={weight} onChange={(e) => setWeight(e.target.value)} className="h-14 rounded-2xl bg-slate-50 border-none font-bold text-lg" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-none bg-neutral-900 text-white rounded-[2.5rem] shadow-2xl overflow-hidden">
            <CardHeader className="p-8">
              <CardTitle className="text-xl font-black tracking-tight flex items-center gap-3 text-white">
                <Wheat className="h-5 w-5 text-[#14d5c7]" />
                Unit Costs
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8 space-y-8">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase text-white/40 ml-2">TMR /kg</Label>
                  <Input type="number" value={tmrCost} onChange={(e) => setTmrCost(e.target.value)} className="h-14 bg-white/5 border-none text-white font-bold" />
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase text-white/40 ml-2">G-Nut /kg</Label>
                  <Input type="number" value={groundnutCost} onChange={(e) => setGroundnutCost(e.target.value)} className="h-14 bg-white/5 border-none text-white font-bold" />
                </div>
              </div>
              <Button onClick={calculateFeed} className="w-full h-16 rounded-2xl font-black uppercase tracking-[0.2em] bg-[#0FA5A0] hover:bg-[#134E4A] text-white shadow-xl">
                <Calculator className="mr-3 h-6 w-6" />
                Run Projection
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-8">
          {results ? (
            <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <Card className="border-none shadow-2xl rounded-[2.5rem] overflow-hidden bg-white">
                <CardHeader className="bg-[#0FA5A0] p-8 text-white">
                  <div className="flex justify-between items-end">
                    <div>
                      <CardTitle className="text-2xl font-black tracking-tight uppercase mb-2">Daily Payload</CardTitle>
                      <CardDescription className="text-white/60 text-[10px] font-black uppercase tracking-widest">Immediate nutritional requirements</CardDescription>
                    </div>
                    <div className="text-right">
                      <p className="text-[8px] font-black uppercase tracking-widest opacity-40">Today's Cost</p>
                      <p className="text-3xl font-black tracking-tighter">₹{results.dailyCost.toLocaleString()}</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-10 grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <div className="p-6 rounded-[2rem] bg-slate-50 flex items-center gap-6">
                      <div className="p-4 rounded-2xl bg-[#D7F2F1] text-[#0FA5A0] shadow-sm"><Wheat className="h-6 w-6" /></div>
                      <div>
                        <p className="text-[10px] font-black uppercase text-slate-400 mb-1">Total TMR</p>
                        <p className="text-2xl font-black text-slate-800">{results.totalTMR.toFixed(2)} kg</p>
                      </div>
                    </div>
                    <div className="p-6 rounded-[2rem] bg-slate-50 flex items-center gap-6">
                      <div className="p-4 rounded-2xl bg-emerald-100 text-emerald-600 shadow-sm"><Leaf className="h-6 w-6" /></div>
                      <div>
                        <p className="text-[10px] font-black uppercase text-slate-400 mb-1">Groundnut Mix</p>
                        <p className="text-2xl font-black text-slate-800">{results.totalGroundnut.toFixed(2)} kg</p>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col justify-center p-8 bg-[#D7F2F1]/30 rounded-[2rem] border border-[#D7F2F1] relative overflow-hidden">
                    <div className="relative z-10 space-y-4">
                      <p className="text-[10px] font-black uppercase text-[#0FA5A0] mb-2">Efficiency Insight</p>
                      <p className="text-3xl font-black text-[#0FA5A0]">{results.totalFeedPerSheep.toFixed(2)} kg <span className="text-sm">/Head</span></p>
                      <div className="pt-4 border-t border-[#0FA5A0]/10 flex items-center gap-2 text-[10px] font-black uppercase text-emerald-600">
                        <ArrowUpRight className="h-3 w-3" /> Balanced 4% BW Ratio
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            <div className="flex h-[500px] flex-col items-center justify-center p-10 text-center border-4 border-dashed rounded-[3rem] border-slate-100 bg-white gap-6 opacity-40">
              <div className="p-8 rounded-full bg-slate-50">
                <Calculator className="h-16 w-16 text-[#0FA5A0]" />
              </div>
              <div>
                <h3 className="text-xl font-black uppercase tracking-widest text-slate-800 mb-2">Awaiting Parameters</h3>
                <p className="text-sm font-bold text-slate-400 max-w-sm">Enter your flock metrics to generate high-precision nutritional intelligence.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function CalculatorPage() {
  return (
    <Shell>
      <CalculatorContent />
    </Shell>
  );
}