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
      <div className="flex h-screen w-full items-center justify-center bg-[#020617] fixed inset-0 z-[9999]">
        <div className="flex flex-col items-center gap-6">
          <div className="w-12 h-12 border-4 border-white/5 rounded-full border-t-emerald-500 animate-spin" />
          <p className="text-[12px] font-black text-emerald-500/40 uppercase tracking-[0.4em]">AUTHENTICATING</p>
        </div>
      </div>
    );
  }

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-[#020617] overflow-hidden font-sans">
        <AppSidebar />

        <SidebarInset className="flex flex-col relative z-10 bg-transparent">
          <header className="top-header">
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
          
          <main className="flex-1 overflow-y-auto no-scrollbar relative p-8 md:p-12">
            {children}
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}