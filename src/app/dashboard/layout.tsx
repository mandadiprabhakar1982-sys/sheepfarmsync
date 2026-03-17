
'use client';

import { UserNav } from '@/components/user-nav';
import { SidebarProvider, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/app-sidebar';
import { MobileNav } from '@/components/mobile-nav';
import { useFarm } from '@/context/FarmContext';
import { useWindowDimensions } from '@/hooks/use-mobile';
import { Bell, User, Menu } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isLoadingProfile } = useFarm();
  const { width, isHydrated } = useWindowDimensions();
  const isMobile = isHydrated ? width < 768 : false;

  if (isLoadingProfile || !isHydrated) {
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
      <div className={cn(
        "app-container dashboard-backdrop",
        isMobile ? "bg-[#020617]" : "bg-[#F5F7F8]"
      )}>
        {!isMobile && <AppSidebar />}

        <SidebarInset className="flex flex-col h-full bg-transparent overflow-hidden">
          {/* MOBILE HEADER - HIGH FIDELITY SYNC */}
          {isMobile ? (
            <header className="h-16 bg-[#020617] px-6 flex items-center justify-between shrink-0 z-50 border-b border-white/5">
              <div className="flex items-center gap-3">
                <SidebarTrigger className="h-10 w-10 text-white/60 hover:text-white bg-white/5 rounded-xl border border-white/10" />
                <div className="h-8 w-8 bg-white/10 rounded-lg flex items-center justify-center ml-1">
                  <div className="h-4 w-4 rounded-full border-2 border-white/40 flex items-center justify-center">
                    <div className="h-1.5 w-1.5 bg-white rounded-full" />
                  </div>
                </div>
                <h1 className="text-lg font-black text-white tracking-tight">FarmAudit</h1>
              </div>
              <div className="flex items-center gap-4 text-white">
                <div className="relative">
                  <Bell className="h-5 w-5 text-white/60" />
                  <span className="absolute -top-1 -right-1 h-4 w-4 bg-[#E53935] rounded-full text-[8px] font-black flex items-center justify-center border-2 border-[#020617]">8</span>
                </div>
                <div className="h-8 w-8 rounded-full bg-white/10 flex items-center justify-center ring-1 ring-white/20">
                  <User className="h-5 w-5 text-white/60" />
                </div>
              </div>
            </header>
          ) : (
            <header className="top-header">
              <div className="flex items-center gap-4 md:gap-6">
                <h2 className="text-[11px] font-black uppercase tracking-[0.3em] text-slate-500 whitespace-nowrap">
                  Executive Command Center
                </h2>
              </div>
              <div className="flex items-center gap-2 md:gap-8">
                <UserNav />
              </div>
            </header>
          )}
          
          <main className={cn(
            "scroll-content",
            isMobile ? "p-0" : "p-12"
          )}>
            <div className={cn("max-w-7xl mx-auto h-full", isMobile ? "" : "")}>
              {children}
            </div>
          </main>
        </SidebarInset>
        
        {isMobile && (
          <>
            <AppSidebar /> 
            <MobileNav />
          </>
        )}
      </div>
    </SidebarProvider>
  );
}
