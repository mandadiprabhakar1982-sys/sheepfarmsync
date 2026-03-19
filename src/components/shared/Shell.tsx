'use client';

import { useFarm } from '@/context/FarmContext';
import { useWindowDimensions } from '@/hooks/use-mobile';
import { AppSidebar } from '@/components/app-sidebar';
import { MobileNav } from '@/components/mobile-nav';
import { SidebarProvider } from '@/components/ui/sidebar';
import { UserNav } from '@/components/user-nav';
import { Bell, User, Menu, Loader2 } from 'lucide-react';
import React from 'react';

export function Shell({ children }: { children: React.ReactNode }) {
  const { isLoadingProfile } = useFarm();
  const { width, isHydrated } = useWindowDimensions();
  const isMobile = isHydrated ? width < 768 : false;

  if (isLoadingProfile || !isHydrated) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-[#020617] fixed inset-0 z-[9999]">
        <div className="flex flex-col items-center gap-6">
          <Loader2 className="w-12 h-12 text-[#14d5c7] animate-spin" />
          <p className="text-[12px] font-black text-[#14d5c7] uppercase tracking-[0.4em]">Establishing Secure Link</p>
        </div>
      </div>
    );
  }

  if (isMobile) {
    return (
      <div className="h-screen flex flex-col bg-[#020617] overflow-hidden">
        <header className="shrink-0 bg-[#020617]/80 backdrop-blur-md px-5 flex items-center justify-between z-40 border-b border-white/5 h-[64px] pt-[env(safe-area-inset-top)]">
          <div className="flex items-center gap-3">
            <button className="h-9 w-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white/60">
              <Menu className="h-4 w-4" />
            </button>
            <div className="logo-box text-lg">Farm<span>Audit</span></div>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative h-9 w-9 rounded-full bg-white/5 border border-white/10 flex items-center justify-center">
              <Bell className="h-4 w-4 text-white/60" />
            </div>
            <div className="h-9 w-9 rounded-full bg-white/5 border border-white/10 flex items-center justify-center overflow-hidden">
              <User className="h-4 w-4 text-white/60" />
            </div>
          </div>
        </header>
        <main className="flex-1 min-h-0 relative bg-[#020617] flex flex-col overflow-hidden pb-20">
          {children}
        </main>
        <MobileNav />
      </div>
    );
  }

  return (
    <SidebarProvider className="bg-[#F5F7F8]">
      <AppSidebar />
      <div className="flex flex-col flex-1 h-screen overflow-hidden">
        <header className="header h-[72px]">
          <div className="flex items-center gap-6">
            <div className="logo-box">Farm<span>Audit</span></div>
            <div className="w-px h-6 bg-slate-200"></div>
            <div className="command-tag">Enterprise Command Center</div>
          </div>
          <UserNav />
        </header>
        <main className="flex-1 overflow-y-auto p-6 bg-[#F8FAFC] no-scrollbar">
          <div className="max-w-[1600px] mx-auto h-full">
            {children}
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}
