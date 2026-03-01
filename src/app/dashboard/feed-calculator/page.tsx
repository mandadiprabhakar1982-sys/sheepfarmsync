'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/page-header';
import { Calculator, Wheat, Leaf, Scale, ReceiptIndianRupee, TrendingDown, ArrowUpRight } from 'lucide-react';
import { SyncProIcon } from '@/components/logo';
import { cn } from '@/lib/utils';

export default function FeedCalculatorPage() {
  // Input states
  const [sheepCount, setSheepCount] = useState('80');
  const [weight, setWeight] = useState('15');
  const [feedPercent, setFeedPercent] = useState('4');
  
  // Cost states
  const [tmrCost, setTmrCost] = useState('21');
  const [groundnutCost, setGroundnutCost] = useState('10');

  // Mix percentage states
  const [tmrMix, setTmrMix] = useState('70');
  const [groundnutMix, setGroundnutMix] = useState('30');

  const [results, setResults] = useState({
    totalFeed: '',
    dailyTmrUsage: '',
    dailyGroundnutUsage: '',
    totalDailyCost: 0,
    totalMonthlyCost: 0,
    feedPerSheep: 0,
  });

  const calculateFeed = () => {
    const numSheep = parseFloat(sheepCount);
    const avgWeight = parseFloat(weight);
    const percent = parseFloat(feedPercent);
    const tmrCostVal = parseFloat(tmrCost);
    const groundnutCostVal = parseFloat(groundnutCost);
    const tmrMixPercent = parseFloat(tmrMix);
    const groundnutMixPercent = parseFloat(groundnutMix);

    if (
      isNaN(numSheep) || isNaN(avgWeight) || isNaN(percent) ||
      isNaN(tmrCostVal) || isNaN(groundnutCostVal) ||
      isNaN(tmrMixPercent) || isNaN(groundnutMixPercent)
    ) {
      return;
    }

    if (tmrMixPercent + groundnutMixPercent !== 100) {
      setResults({
        totalFeed: 'Error: 100% Mix required',
        dailyTmrUsage: '',
        dailyGroundnutUsage: '',
        totalDailyCost: 0,
        totalMonthlyCost: 0,
        feedPerSheep: 0,
      });
      return;
    }

    const feedPerSheep = avgWeight * (percent / 100);
    const totalDailyFeed = feedPerSheep * numSheep;

    const dailyTmr = totalDailyFeed * (tmrMixPercent / 100);
    const dailyGroundnut = totalDailyFeed * (groundnutMixPercent / 100);

    const dailyTmrCost = dailyTmr * tmrCostVal;
    const dailyGroundnutCost = dailyGroundnut * groundnutCostVal;
    
    const totalDailyCost = dailyTmrCost + dailyGroundnutCost;
    const totalMonthlyCost = totalDailyCost * 30;

    setResults({
      totalFeed: `${totalDailyFeed.toFixed(2)} KG`,
      dailyTmrUsage: `${dailyTmr.toFixed(2)} kg`,
      dailyGroundnutUsage: `${dailyGroundnut.toFixed(2)} kg`,
      totalDailyCost: totalDailyCost,
      totalMonthlyCost: totalMonthlyCost,
      feedPerSheep: feedPerSheep,
    });
  };

  return (
    <div className="container mx-auto py-8 px-4 md:px-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
        <PageHeader
          title="Nutrition Engine"
          description="High-precision feed requirements and cost projections."
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
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-widest opacity-40 ml-2">Avg Weight (kg)</Label>
                    <Input type="number" value={weight} onChange={(e) => setWeight(e.target.value)} className="h-12 rounded-xl bg-neutral-50 border-none font-bold" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-widest opacity-40 ml-2">Feed % BW</Label>
                    <Input type="number" value={feedPercent} onChange={(e) => setFeedPercent(e.target.value)} className="h-12 rounded-xl bg-neutral-50 border-none font-bold" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-none bg-neutral-900 text-white rounded-[2.5rem] shadow-2xl overflow-hidden">
            <CardHeader className="p-8">
              <CardTitle className="text-xl font-black tracking-tight flex items-center gap-3">
                <Wheat className="h-5 w-5 text-emerald-400" />
                Mix & Unit Costs
              </CardTitle>
              <CardDescription className="text-white/40 text-[10px] font-bold uppercase tracking-widest">Optimizing nutritional distribution</CardDescription>
            </CardHeader>
            <CardContent className="p-8 space-y-8">
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-widest opacity-40 ml-2">TMR Mix (%)</Label>
                    <Input type="number" value={tmrMix} onChange={(e) => setTmrMix(e.target.value)} className="h-12 rounded-xl bg-white/10 border-none text-white font-bold" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-widest opacity-40 ml-2">Groundnut (%)</Label>
                    <Input type="number" value={groundnutMix} onChange={(e) => setGroundnutMix(e.target.value)} className="h-12 rounded-xl bg-white/10 border-none text-white font-bold" />
                  </div>
                </div>
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
              </div>

              <Button onClick={calculateFeed} className="w-full h-16 rounded-[1.25rem] font-black text-sm uppercase tracking-[0.2em] shadow-2xl shadow-emerald-500/20 bg-emerald-600 hover:bg-emerald-500 text-white border-none">
                <Calculator className="mr-3 h-6 w-6" />
                Run Projection
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-8">
          {results.totalFeed ? (
            <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <Card className="border-none shadow-2xl rounded-[2.5rem] overflow-hidden bg-white">
                <CardHeader className="bg-primary p-8 text-white">
                  <div className="flex justify-between items-end">
                    <div>
                      <CardTitle className="text-2xl font-black tracking-tight leading-none mb-2">Requirement Intelligence</CardTitle>
                      <CardDescription className="text-white/60 text-[10px] font-black uppercase tracking-widest">Estimated daily nutritional payload</CardDescription>
                    </div>
                    <div className="text-right">
                      <p className="text-[8px] font-black uppercase tracking-widest opacity-40">Daily Total</p>
                      <p className="text-3xl font-black tracking-tighter">{results.totalFeed}</p>
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
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 mb-1">TMR Requirement</p>
                        <p className="text-2xl font-black tracking-tight text-neutral-900">{results.dailyTmrUsage}</p>
                      </div>
                    </div>
                    <div className="p-6 rounded-[2rem] bg-neutral-50 border border-neutral-100 flex items-center gap-6">
                      <div className="p-4 rounded-2xl bg-emerald-100 text-emerald-600 shadow-sm">
                        <Leaf className="h-6 w-6" />
                      </div>
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 mb-1">Groundnut Mix</p>
                        <p className="text-2xl font-black tracking-tight text-neutral-900">{results.dailyGroundnutUsage}</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col justify-center p-8 bg-primary/5 rounded-[2rem] border border-primary/10 relative overflow-hidden">
                    <SyncProIcon className="absolute -right-4 -bottom-4 h-32 w-32 opacity-[0.03] rotate-12" />
                    <div className="relative z-10 space-y-4">
                      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-primary mb-2">Efficiency Insight</p>
                      <div className="space-y-1">
                        <p className="text-xs font-bold text-muted-foreground">Each animal consumes approx.</p>
                        <p className="text-3xl font-black tracking-tighter text-primary">{(results.feedPerSheep * 1000).toFixed(0)}g / day</p>
                      </div>
                      <div className="pt-4 border-t border-primary/10 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-emerald-600">
                        <ArrowUpRight className="h-3 w-3" /> Balanced Growth Profile
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <Card className="border-none shadow-xl rounded-[2rem] overflow-hidden bg-white group transition-all hover:-translate-y-1">
                  <CardContent className="p-8 flex items-center gap-6">
                    <div className="p-4 rounded-2xl bg-emerald-600 text-white shadow-lg">
                      <ReceiptIndianRupee className="h-7 w-7" />
                    </div>
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 mb-1">Total Daily Cost</p>
                      <p className="text-3xl font-black tracking-tighter text-neutral-900">₹{results.totalDailyCost.toLocaleString()}</p>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-none shadow-xl rounded-[2rem] overflow-hidden bg-neutral-900 group transition-all hover:-translate-y-1">
                  <CardContent className="p-8 flex items-center gap-6">
                    <div className="p-4 rounded-2xl bg-white/10 text-white shadow-inner">
                      <TrendingDown className="h-7 w-7 text-emerald-400" />
                    </div>
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40 mb-1">Projected Monthly</p>
                      <p className="text-3xl font-black tracking-tighter text-white">₹{results.totalMonthlyCost.toLocaleString()}</p>
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
                <p className="text-sm font-bold text-muted-foreground max-w-sm">Enter your flock metrics and mix costs to generate high-precision nutritional intelligence.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
