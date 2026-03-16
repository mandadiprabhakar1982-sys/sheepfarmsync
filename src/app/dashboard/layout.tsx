'use client';

import { UserNav } from '@/components/user-nav';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/app-sidebar';
import { MobileNav } from '@/components/mobile-nav';
import { useFarm } from '@/context/FarmContext';
import { useIsMobile } from '@/hooks/use-mobile';
import { PanelLeft, MoreVertical, Loader2 } from 'lucide-react';

/**
 * @fileOverview Structural Gatekeeper Layout.
 * Manages the transition between Desktop Sidebar and Mobile Bottom Navigation models.
 */
export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isLoadingProfile } = useFarm();
  const isMobile = useIsMobile();

  // AUTHENTICATION GATE: Prevent UI leaks during profile sync
  if (isLoadingProfile) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-white fixed inset-0 z-[9999]">
        <div className="flex flex-col items-center gap-6">
          <div className="w-12 h-12 border-4 border-slate-100 rounded-full border-t-primary animate-spin" />
          <p className="text-[12px] font-black text-slate-400 uppercase tracking-[0.4em]">Establishing Secure Link</p>
        </div>
      </div>
    );
  }

  return (
    <SidebarProvider>
      <div className="app-container dashboard-backdrop">
        
        {/* DESKTOP GATE: Only show full sidebar if NOT on mobile */}
        {isMobile === false && <AppSidebar />}

        <SidebarInset className="flex flex-col h-full bg-transparent overflow-hidden">
          {/* STICKY TOP HEADER - Universal across models */}
          <header className="top-header">
            <div className="flex items-center gap-4 md:gap-6">
              <div className="flex items-center gap-2 text-slate-400">
                <PanelLeft className="h-4 w-4 cursor-pointer hover:text-slate-900 transition-colors hidden md:block" />
                <MoreVertical className="h-4 w-4 opacity-20 hidden md:block" />
              </div>
              <h2 className="text-[9px] md:text-[11px] font-black uppercase tracking-[0.2em] md:tracking-[0.3em] text-slate-500 whitespace-nowrap">
                FARM MANAGEMENT SYSTEM
              </h2>
            </div>
            
            <div className="flex items-center gap-2 md:gap-8">
              <UserNav />
            </div>
          </header>
          
          {/* INDEPENDENT SCROLLABLE CONTENT */}
          <main className="scroll-content p-4 md:p-12">
            {children}
          </main>
        </SidebarInset>
        
        {/* MOBILE GATE: Show slide-over sidebar and bottom nav if on mobile */}
        {isMobile === true && (
          <>
            <AppSidebar /> 
            <MobileNav />
          </>
        )}
      </div>
    </SidebarProvider>
  );
}
