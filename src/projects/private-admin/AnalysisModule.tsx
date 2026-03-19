'use client';

import { useState } from 'react';
import { analyzeFarmCosts, type AnalyzeFarmCostsOutput } from '@/ai/flows/analyze-farm-costs';
import { Loader2, Sparkles, AlertTriangle, ShieldCheck, Zap, BarChart3, Target } from 'lucide-react';
import { useFarm } from '@/context/FarmContext';
import { PageHeader } from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export function AnalysisModule() {
  const [analysis, setAnalysis] = useState<AnalyzeFarmCostsOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { 
    farmExpenses,
    isLoading: isFarmDataLoading,
    userRole
  } = useFarm();

  const isAdmin = userRole === 'admin';

  if (!isAdmin) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-8 bg-white rounded-[2rem] border-2 border-dashed border-slate-100">
        <ShieldCheck className="h-16 w-16 text-rose-500 mb-6 opacity-20" />
        <h2 className="text-2xl font-black uppercase tracking-tight text-slate-800">Stealth Mode Active</h2>
        <p className="text-slate-400 font-bold text-sm mt-2 max-w-sm">Neural Audit modules are restricted to administrative accounts only. Data integrity is protected.</p>
      </div>
    );
  }

  const handleAnalysis = async () => {
    setIsLoading(true);
    setError(null);
    setAnalysis(null);
    try {
      const input = {
        farmExpenses: (farmExpenses || []).map(e => ({
          date: e.date,
          category: e.category,
          subcategory: e.subcategory,
          description: e.description,
          totalAmount: e.totalAmount,
        })),
      };
      
      const result = await analyzeFarmCosts(input);
      setAnalysis(result);
    } catch (e) {
      console.error(e);
      setError('An error occurred during analysis. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="animate-in fade-in duration-700">
      <PageHeader
        title="Intelligence Engine"
        description="Private deep analysis of your farm's operational efficiency."
      />
      
      <div className="flex flex-col items-center">
        <Card className="w-full border-none bg-neutral-900 text-white rounded-[2.5rem] shadow-2xl overflow-hidden relative">
          <div className="absolute top-0 right-0 p-12 opacity-10">
            <ShieldCheck className="h-48 w-48 rotate-12" />
          </div>
          <CardHeader className="p-12 pb-6 relative z-10">
            <div className="flex items-center gap-4 mb-4">
              <div className="h-12 w-12 rounded-2xl bg-emerald-500/20 flex items-center justify-center text-emerald-400">
                <Zap className="h-6 w-6" />
              </div>
              <div>
                <CardTitle className="text-3xl font-black tracking-tight uppercase leading-none mb-2">Neural Audit Pro</CardTitle>
                <CardDescription className="text-white/40 text-xs font-bold uppercase tracking-widest">Secure private computational intelligence</CardDescription>
              </div>
            </div>
            <p className="text-white/60 text-sm font-medium leading-relaxed max-w-2xl">
              Our AI engine synchronizes with your private operational ledger to identify fiscal anomalies and provide actionable growth vectors. 
              Your data remains strictly encrypted and non-persistent during the audit cycle.
            </p>
          </CardHeader>
          <CardContent className="p-12 pt-0 relative z-10">
            <Button
              onClick={handleAnalysis}
              disabled={isLoading || isFarmDataLoading}
              className="h-16 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black uppercase tracking-[0.2em] shadow-xl px-10 transition-all active:scale-95 border-none"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-3 h-5 w-5 animate-spin" />
                  Generating Intelligence...
                </>
              ) : (
                <>
                  <BarChart3 className="mr-3 h-5 w-5" />
                  Execute Efficiency Report
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {error && (
          <Alert variant="destructive" className="mt-8 w-full rounded-[2rem] border-rose-500/20 bg-rose-50">
            <AlertTriangle className="h-5 w-5" />
            <AlertTitle className="font-black uppercase tracking-widest">Computation Error</AlertTitle>
            <AlertDescription className="font-bold">{error}</AlertDescription>
          </Alert>
        )}

        {analysis && (
          <div className="mt-12 w-full space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <Card className="border-none shadow-xl rounded-[2.5rem] bg-white overflow-hidden group hover:-translate-y-1 transition-all duration-500">
                <CardHeader className="bg-neutral-50 p-8 border-b border-neutral-100">
                  <CardTitle className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 flex items-center gap-2">
                    <Target className="h-3.5 w-3.5 text-primary" /> Executive Summary
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-8">
                  <p className="text-sm font-medium text-neutral-700 leading-relaxed">{analysis.summary}</p>
                </CardContent>
              </Card>

              <Card className="border-none shadow-xl rounded-[2.5rem] bg-emerald-900 text-white overflow-hidden group hover:-translate-y-1 transition-all duration-500">
                <CardHeader className="bg-white/5 p-8 border-b border-white/5">
                  <CardTitle className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-400 flex items-center gap-2">
                    <Zap className="h-3.5 w-3.5" /> Core Insights
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-8">
                  <p className="text-sm font-bold text-white/80 leading-relaxed italic">"{analysis.communityBenchmarking}"</p>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
              <div className="lg:col-span-5">
                <Card className="border-none shadow-xl rounded-[2.5rem] bg-white overflow-hidden h-full">
                  <CardHeader className="bg-rose-50 p-8 border-b border-rose-100">
                    <CardTitle className="text-sm font-black uppercase tracking-widest text-rose-900">Critical Cost Centers</CardTitle>
                  </CardHeader>
                  <CardContent className="p-8">
                    <div className="space-y-4">
                      {analysis.highExpenditureAreas.map((area, index) => (
                        <div key={index} className="flex items-center gap-4 p-4 rounded-2xl bg-rose-50/50 border border-rose-100">
                          <div className="h-8 w-8 rounded-full bg-rose-100 flex items-center justify-center text-rose-600 font-black text-xs">{index + 1}</div>
                          <span className="text-sm font-bold text-neutral-700">{area}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="lg:col-span-7">
                <Card className="border-none shadow-2xl rounded-[2.5rem] bg-neutral-900 text-white overflow-hidden h-full border-t-4 border-emerald-500">
                  <CardHeader className="p-8 pb-4">
                    <CardTitle className="text-xl font-black tracking-tight flex items-center gap-3">
                      <Sparkles className="h-5 w-5 text-emerald-400" /> Strategic Protocol
                    </CardTitle>
                    <CardDescription className="text-white/40 text-[10px] font-bold uppercase tracking-widest">Actionable operational intelligence</CardDescription>
                  </CardHeader>
                  <CardContent className="p-8">
                    <div className="grid gap-4">
                      {analysis.actionableInsights.map((insight, index) => (
                        <div key={index} className="flex gap-6 p-6 rounded-[2rem] bg-white/5 border border-white/10 hover:bg-white/10 transition-colors">
                          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-500 text-neutral-900 font-black shrink-0 shadow-lg shadow-emerald-500/20">{index + 1}</div>
                          <p className="text-sm font-bold text-white/90 self-center leading-relaxed">{insight}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
