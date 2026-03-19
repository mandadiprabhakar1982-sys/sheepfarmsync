
'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { AlertTriangle, RefreshCcw, ShieldAlert } from 'lucide-react';

/**
 * @fileOverview Dashboard Error Boundary.
 * Critical for preventing re-render loops and memory spikes during data failures.
 */
export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to the console for agentive debugging
    console.error('Dashboard Runtime Error:', error);
  }, [error]);

  const isIndexError = error.message?.includes('index');

  return (
    <div className="flex h-[calc(100vh-80px)] w-full items-center justify-center p-6 bg-slate-50">
      <Card className="max-w-md w-full border-none shadow-2xl rounded-[2.5rem] overflow-hidden bg-white">
        <CardHeader className="bg-rose-600 text-white p-10 text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <ShieldAlert className="h-32 w-32 rotate-12" />
          </div>
          <div className="inline-block bg-white/20 rounded-2xl p-4 mb-4 relative z-10">
            <AlertTriangle className="h-8 w-8 text-white" />
          </div>
          <CardTitle className="text-2xl font-black uppercase tracking-tight relative z-10">Circuit Breaker Active</CardTitle>
          <CardDescription className="text-rose-100/60 text-[10px] font-bold uppercase tracking-widest relative z-10">
            Runtime Synchronization Guard
          </CardDescription>
        </CardHeader>
        <CardContent className="p-10 space-y-6 text-center">
          <div className="space-y-2">
            <p className="text-sm font-bold text-slate-800">
              {isIndexError ? 'Database Index Construction Required' : 'A temporary synchronization failure occurred.'}
            </p>
            <p className="text-xs text-slate-500 leading-relaxed font-medium">
              To prevent memory exhaustion and preserve system stability, the interface has been safely paused. 
              {isIndexError && ' The required master ledger index is currently being deployed.'}
            </p>
          </div>

          <div className="pt-4">
            <Button 
              onClick={() => reset()}
              className="w-full h-14 rounded-2xl bg-slate-900 hover:bg-black text-white font-black uppercase tracking-widest shadow-xl flex items-center justify-center gap-3"
            >
              <RefreshCcw className="h-4 w-4" />
              Re-Establish Link
            </Button>
          </div>
          
          <p className="text-[8px] font-black uppercase tracking-widest text-slate-300">
            System Integrity Protected | 8GB RAM Safe Mode
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
