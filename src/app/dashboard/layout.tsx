
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
      <div className="flex h-screen w-full items-center justify-center bg-white fixed inset-0 z-[9999]">
        <div className="flex flex-col items-center gap-6">
          <div className="w-12 h-12 border-4 border-slate-100 rounded-full border-t-primary animate-spin" />
          <p className="text-[12px] font-black text-slate-400 uppercase tracking-[0.4em]">AUTHENTICATING</p>
        </div>
      </div>
    );
  }

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-background overflow-hidden font-sans dashboard-backdrop">
        <AppSidebar />

        <SidebarInset className="flex flex-col relative z-10 bg-transparent">
          <header className="top-header">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2 text-slate-400">
                <PanelLeft className="h-4 w-4 cursor-pointer hover:text-slate-900 transition-colors" />
                <MoreVertical className="h-4 w-4 opacity-20" />
              </div>
              <h2 className="text-[11px] font-black uppercase tracking-[0.3em] text-slate-500 whitespace-nowrap">
                FARM MANAGEMENT SYSTEM
              </h2>
            </div>
            
            <div className="flex items-center gap-8">
              <div className="flex items-center gap-2 text-slate-400 hover:text-primary transition-colors cursor-pointer">
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
