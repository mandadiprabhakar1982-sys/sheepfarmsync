'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

/**
 * @fileOverview Specialized Error Boundary for Firestore Stability.
 * Prevents re-render loops during index construction or data failures.
 * Critical for system performance in memory-constrained environments.
 */
class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI.
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log the error for agentive monitoring
    console.error("Firestore Index Error Boundary caught:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      const isIndexError = this.state.error?.message.includes("COLLECTION_GROUP_DESC") || 
                           this.state.error?.message.includes("index");

      return (
        <div className="hub-node-organic p-12 bg-white border-2 border-dashed border-[#edf2f7] text-center animate-in fade-in duration-500 rounded-[2rem] shadow-xl">
          <div className="flex justify-center mb-6 text-rose-500">
            <div className="p-4 bg-rose-50 rounded-full">
              <AlertTriangle size={48} />
            </div>
          </div>
          <h3 className="text-xl font-extrabold text-[#1a252f] uppercase tracking-tight">
            {isIndexError ? "Database Index Building" : "Synchronization Paused"}
          </h3>
          <p className="text-sm text-[#7f8c8d] mt-3 max-w-md mx-auto font-medium leading-relaxed">
            {isIndexError 
              ? "Google is currently constructing the high-performance search index for your ledger. This typically takes 3-5 minutes. System integrity is protected."
              : "A temporary handshake failure occurred with the master ledger. We've safely paused the interface to preserve system memory."}
          </p>
          <div className="mt-8 flex flex-col items-center gap-4">
            <button 
              onClick={() => window.location.reload()}
              className="bg-[#0FA5A0] hover:bg-[#134E4A] text-white rounded-2xl px-10 h-14 text-sm font-black tracking-[0.18em] uppercase shadow-xl transition-all active:scale-95 flex items-center gap-3"
            >
              <RefreshCw size={18} className="animate-spin-slow" />
              <span>Check Status Again</span>
            </button>
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-300">
              System Protected | 8GB RAM Safe Mode
            </p>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
