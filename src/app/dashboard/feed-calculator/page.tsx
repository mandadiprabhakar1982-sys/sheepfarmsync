'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/page-header';
import { Calculator, Wheat, Leaf, Scale, ReceiptIndianRupee, TrendingDown, ArrowUpRight, Package, CalendarDays } from 'lucide-react';
import { SyncProIcon } from '@/components/logo';
import { cn } from '@/lib/utils';

export default function FeedCalculatorPage() {
  // Input states
  const [sheepCount, setSheepCount] = useState('80');
  const [weight, setWeight] = useState('15');
  const [tmrCost, setTmrCost] = useState('21');
  const [groundnutCost, setGroundnutCost] = useState('10');
  const [bagSize, setBagSize] = useState('50');

  const [results, setResults] = useState<{
    totalFeedPerSheep: number;
    totalTMR: number;
    totalGroundnut: number;
    dailyCost: number;
    finalWeight: number;
    totalTMR150: number;
    bagsNeeded: number;
  } | null>(null);

  const calculateFeed = () => {
    const sheep = parseFloat(sheepCount);
    const startWeight = parseFloat(weight);
    const tmrPrice = parseFloat(tmrCost);
    const gnutPrice = parseFloat(groundnutCost);
    const sizePerBag = parseFloat(bagSize);

    if (isNaN(sheep) || isNaN(startWeight) || isNaN(tmrPrice) || isNaN(gnutPrice) || isNaN(sizePerBag)) {
      return;
    }

    const dailyGain = 0.20; // 200 grams per day
    const days = 150;

    const finalWeight = startWeight + (dailyGain * days);

    // Today's feed (4% Body Weight)
    const totalFeedPerSheep = startWeight * 0.04;
    const tmrPerSheep = totalFeedPerSheep * 0.9; // 90% TMR
    const groundnutPerSheep = totalFeedPerSheep * 0.1; // 10% Groundnut

    const totalTMR = sheep * tmrPerSheep;
    const totalGroundnut = sheep * groundnutPerSheep;

    const dailyCost = (totalTMR * tmrPrice) + (totalGroundnut * gnutPrice);

    // 150 day feed projection (approx average weight)
    const avgWeight = (startWeight + finalWeight) / 2;
    const avgFeed = avgWeight * 0.04;
    const avgTMR = avgFeed * 0.9;

    const totalTMR150 = sheep * avgTMR * days;
    const bagsNeeded = totalTMR150 / sizePerBag;

    setResults({
      totalFeedPerSheep,
      totalTMR,
      totalGroundnut,
      dailyCost,
      finalWeight,
      totalTMR150,
      bagsNeeded,
    });
  };

  return (
    <div className="container mx-auto py-8 px-4 md:px-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
        <PageHeader
          title="Nutrition Engine"
          description="High-precision feed requirements and 150-day growth projections."
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

      <div className="grid grid-cols-1 gap-10 lg:grid-cols-12">
        <div className="lg:col-span-4 space-y-10">
          <Card className="border-none bg-white rounded-[2.5rem] shadow-2xl overflow-hidden">
            <CardHeader className="bg-neutral-50 p-8 border-b border-neutral-100">
              <CardTitle className="text-xl font-black tracking-tight flex items-center gap-3">
                <Scale className="h-5 w-5 text-primary" />
                Flock Metrics
              </CardTitle>
              <CardDescription className="text-[10px] font-bold uppercase tracking-widest opacity-60">Define your current feeding base</CardDescription>
            </CardHeader>
            <CardContent className="p-8 space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-widest opacity-40 ml-2">Total Sheep Count</Label>
                  <Input type="number" value={sheepCount} onChange={(e) => setSheepCount(e.target.value)} className="h-12 rounded-xl bg-neutral-50 border-none font-black text-base px-4" />
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-widest opacity-40 ml-2">Avg Start Weight (kg)</Label>
                  <Input type="number" value={weight} onChange={(e) => setWeight(e.target.value)} className="h-12 rounded-xl bg-neutral-50 border-none font-bold px-4" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-none bg-neutral-900 text-white rounded-[2.5rem] shadow-2xl overflow-hidden">
            <CardHeader className="p-8">
              <CardTitle className="text-xl font-black tracking-tight flex items-center gap-3">
                <Wheat className="h-5 w-5 text-emerald-400" />
                Unit Costs & Inventory
              </CardTitle>
              <CardDescription className="text-white/40 text-[10px] font-bold uppercase tracking-widest">Optimizing procurement distribution</CardDescription>
            </CardHeader>
            <CardContent className="p-8 space-y-8">
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-widest opacity-40 ml-2">TMR Cost /kg</Label>
                    <Input type="number" value={tmrCost} onChange={(e) => setTmrCost(e.target.value)} className="h-12 rounded-xl bg-white/10 border-none text-white font-bold" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-widest opacity-40 ml-2">G-Nut Cost /kg</Label>
                    <Input type="number" value={groundnutCost} onChange={(e) => setGroundnutCost(e.target.value)} className="h-12 rounded-xl bg-white/10 border-none text-white font-bold" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-widest opacity-40 ml-2">Bag Size (kg/bag)</Label>
                  <Input type="number" value={bagSize} onChange={(e) => setBagSize(e.target.value)} className="h-12 rounded-xl bg-white/10 border-none text-white font-black text-lg" />
                </div>
              </div>

              <Button onClick={calculateFeed} className="w-full h-16 rounded-[1.25rem] font-black text-sm uppercase tracking-[0.2em] shadow-2xl shadow-emerald-500/20 bg-emerald-600 hover:bg-emerald-500 text-white border-none">
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
                <CardHeader className="bg-primary p-8 text-white">
                  <div className="flex justify-between items-end">
                    <div>
                      <CardTitle className="text-2xl font-black tracking-tight leading-none mb-2">Requirement Intelligence</CardTitle>
                      <CardDescription className="text-white/60 text-[10px] font-black uppercase tracking-widest">Immediate daily nutritional payload</CardDescription>
                    </div>
                    <div className="text-right">
                      <p className="text-[8px] font-black uppercase tracking-widest opacity-40">Today's Cost</p>
                      <p className="text-3xl font-black tracking-tighter">₹{results.dailyCost.toLocaleString()}</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-10 grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <div className="p-6 rounded-[2rem] bg-neutral-50 border border-neutral-100 flex items-center gap-6">
                      <div className="p-4 rounded-2xl bg-blue-100 text-blue-600 shadow-sm">
                        <Wheat className="h-6 w-6" />
                      </div>
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 mb-1">Total TMR (Today)</p>
                        <p className="text-2xl font-black tracking-tight text-neutral-900">{results.totalTMR.toFixed(2)} kg</p>
                      </div>
                    </div>
                    <div className="p-6 rounded-[2rem] bg-neutral-50 border border-neutral-100 flex items-center gap-6">
                      <div className="p-4 rounded-2xl bg-emerald-100 text-emerald-600 shadow-sm">
                        <Leaf className="h-6 w-6" />
                      </div>
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 mb-1">Groundnut Mix (Today)</p>
                        <p className="text-2xl font-black tracking-tight text-neutral-900">{results.totalGroundnut.toFixed(2)} kg</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col justify-center p-8 bg-primary/5 rounded-[2rem] border border-primary/10 relative overflow-hidden">
                    <SyncProIcon className="absolute -right-4 -bottom-4 h-32 w-32 opacity-[0.03] rotate-12" />
                    <div className="relative z-10 space-y-4">
                      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-primary mb-2">Efficiency Insight</p>
                      <div className="space-y-1">
                        <p className="text-xs font-bold text-muted-foreground">Feed per animal (Today)</p>
                        <p className="text-3xl font-black tracking-tighter text-primary">{results.totalFeedPerSheep.toFixed(2)} kg</p>
                      </div>
                      <div className="pt-4 border-t border-primary/10 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-emerald-600">
                        <ArrowUpRight className="h-3 w-3" /> Balanced 4% BW Ratio
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <Card className="border-none shadow-xl rounded-[2rem] overflow-hidden bg-white group transition-all hover:-translate-y-1">
                  <CardHeader className="bg-neutral-900 p-6 text-white">
                    <CardTitle className="text-sm font-black tracking-widest uppercase flex items-center gap-2">
                      <CalendarDays className="h-4 w-4 text-emerald-400" />
                      150-Day Growth Project
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-8 flex items-center gap-6">
                    <div className="p-4 rounded-2xl bg-emerald-600 text-white shadow-lg">
                      <TrendingDown className="h-7 w-7 rotate-180" />
                    </div>
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 mb-1">Projected Final Weight</p>
                      <p className="text-3xl font-black tracking-tighter text-neutral-900">{results.finalWeight.toFixed(1)} kg</p>
                      <p className="text-[8px] font-bold text-emerald-600 uppercase mt-1">+200g daily gain</p>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-none shadow-xl rounded-[2rem] overflow-hidden bg-neutral-900 group transition-all hover:-translate-y-1">
                  <CardHeader className="bg-white/5 p-6 text-white">
                    <CardTitle className="text-sm font-black tracking-widest uppercase flex items-center gap-2">
                      <Package className="h-4 w-4 text-blue-400" />
                      Bulk Procurement Needs
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-8 flex items-center gap-6">
                    <div className="p-4 rounded-2xl bg-white/10 text-white shadow-inner">
                      <Wheat className="h-7 w-7 text-blue-400" />
                    </div>
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40 mb-1">Total TMR Required</p>
                      <p className="text-3xl font-black tracking-tighter text-white">{results.totalTMR150.toFixed(0)} kg</p>
                      <p className="text-[10px] font-black text-blue-400 uppercase mt-1">{results.bagsNeeded.toFixed(0)} Bags ({bagSize}kg)</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          ) : (
            <div className="flex h-[500px] flex-col items-center justify-center p-10 text-center border-4 border-dashed rounded-[3rem] border-neutral-100 bg-neutral-50/50 gap-6 opacity-40">
              <div className="p-8 rounded-full bg-neutral-100">
                <Calculator className="h-16 w-16 text-primary" />
              </div>
              <div>
                <h3 className="text-xl font-black uppercase tracking-widest text-neutral-900 mb-2">Awaiting Parameters</h3>
                <p className="text-sm font-bold text-muted-foreground max-w-sm">Enter your flock metrics and bag size to generate high-precision nutritional and growth intelligence.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
