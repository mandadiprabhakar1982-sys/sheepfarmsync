'use client';

import { UserNav } from '@/components/user-nav';
import { SidebarProvider } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/app-sidebar';
import { MobileNav } from '@/components/mobile-nav';
import { useFarm } from '@/context/FarmContext';
import { useWindowDimensions } from '@/hooks/use-mobile';
import { Bell, User, Menu, Loader2 } from 'lucide-react';
import { Logo } from '@/components/logo';

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
        {/* FIXED HEADER */}
        <header 
          className="shrink-0 bg-[#020617]/80 backdrop-blur-md px-5 flex items-center justify-between z-40 border-b border-white/5"
          style={{ 
            paddingTop: 'calc(12px + env(safe-area-inset-top))', 
            height: 'calc(72px + env(safe-area-inset-top))' 
          }}
        >
          <div className="flex items-center gap-4">
            <button className="h-11 w-11 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-white/60">
              <Menu className="h-5 w-5" />
            </button>
            <Logo />
          </div>
          <div className="flex items-center gap-3 text-white">
            <div className="relative h-11 w-11 rounded-full bg-white/5 border border-white/10 flex items-center justify-center">
              <Bell className="h-5 w-5 text-white/60" />
              <span className="absolute -top-1 -right-1 h-4 w-4 bg-[#E53935] rounded-full text-[8px] font-black flex items-center justify-center border-2 border-[#020617]">8</span>
            </div>
            <div className="h-11 w-11 rounded-full bg-white/5 border border-white/10 flex items-center justify-center overflow-hidden">
              <User className="h-5 w-5 text-white/60" />
            </div>
          </div>
        </header>

        {/* MAIN CONTENT AREA */}
        <main className="flex-1 min-h-0 relative bg-[#020617] flex flex-col overflow-hidden">
          {children}
        </main>

        {/* FIXED BOTTOM NAV */}
        <MobileNav />
      </div>
    );
  }

  return (
    <SidebarProvider className="bg-[#F5F7F8]">
      <AppSidebar />
      <div className="flex flex-col flex-1 h-screen overflow-hidden">
        <header className="top-header shrink-0">
          <div className="flex items-center gap-4 md:gap-6">
            <h2 className="text-[11px] font-black uppercase tracking-[0.3em] text-slate-500 whitespace-nowrap">
              Executive Command Center
            </h2>
          </div>
          <div className="flex items-center gap-2 md:gap-8">
            <UserNav />
          </div>
        </header>
        
        <main className="flex-1 overflow-y-auto p-8 md:p-12 no-scrollbar">
          <div className="max-w-7xl mx-auto h-full">
            {children}
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}
