'use client';

import { usePathname } from 'next/navigation';
import { UserNav } from '@/components/user-nav';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/app-sidebar';
import { useFarm } from '@/context/FarmContext';
import { PanelLeft, Globe, MoreVertical } from 'lucide-react';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isLoadingProfile } = useFarm();
  const pathname = usePathname();

  if (isLoadingProfile) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-[#0F1115] fixed inset-0 z-[9999]">
        <div className="flex flex-col items-center gap-6">
          <div className="w-12 h-12 border-4 border-white/5 rounded-full border-t-[#10B981] animate-spin" />
          <p className="text-[12px] font-black text-[#10B981]/40 uppercase tracking-[0.4em]">AUTHENTICATING</p>
        </div>
      </div>
    );
  }

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-[#0F1115] overflow-hidden font-sans">
        <AppSidebar />

        <SidebarInset className="flex flex-col relative z-10 bg-transparent">
          <header className="top-header border-none shadow-none">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2 text-white/40">
                <PanelLeft className="h-4 w-4 cursor-pointer hover:text-white transition-colors" />
                <MoreVertical className="h-4 w-4 opacity-20" />
              </div>
              <h2 className="text-[11px] font-black uppercase tracking-[0.3em] text-white/80 whitespace-nowrap">
                FARM MANAGEMENT SYSTEM
              </h2>
            </div>
            
            <div className="flex items-center gap-8">
              <div className="flex items-center gap-2 text-white/40 hover:text-white transition-colors cursor-pointer">
                <Globe className="h-4 w-4" />
                <span className="text-[10px] font-black uppercase tracking-widest">EN</span>
              </div>
              <UserNav />
            </div>
          </header>
          
          <main className="flex-1 overflow-y-auto no-scrollbar relative p-8">
            <div className="max-w-[1600px] mx-auto">
              {children}
            </div>
            {/* Decorative Hub Visual (Sparkle) */}
            <div className="fixed bottom-12 right-12 opacity-10 pointer-events-none">
              <svg width="60" height="60" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2L14.5 9.5L22 12L14.5 14.5L12 22L9.5 14.5L2 12L9.5 9.5L12 2Z" fill="white" />
              </svg>
            </div>
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}