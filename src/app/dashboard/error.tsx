'use client';

/**
 * @fileOverview Global Dashboard Error Boundary.
 * Stops recursive re-render loops during sync failures to protect system RAM.
 */
export default function GlobalError({ 
  error, 
  reset 
}: { 
  error: Error & { digest?: string }; 
  reset: () => void 
}) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-80px)] bg-[#f4f7f6] p-4 text-center">
      <div className="space-y-4 max-w-md">
        <h2 className="text-2xl font-black text-[#005f4b] tracking-tight uppercase leading-tight">
          SheepSync Pro encountered a sync error
        </h2>
        <p className="text-sm text-slate-500 font-medium leading-relaxed">
          A temporary handshake failure occurred with the master ledger. We've safely paused the interface to preserve system stability.
        </p>
        <button 
          className="mt-6 btn-primary-organic px-12 shadow-xl hover:brightness-110 active:scale-95 transition-all"
          onClick={() => reset()}
        >
          Try Again
        </button>
        <div className="pt-8 opacity-20">
          <p className="text-[8px] font-black uppercase tracking-[0.4em]">System Protected | 8GB RAM Safe Mode</p>
        </div>
      </div>
    </div>
  );
}
