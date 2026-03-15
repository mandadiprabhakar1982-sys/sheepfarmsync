'use client';

import { usePathname } from 'next/navigation';
import { UserNav } from '@/components/user-nav';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/app-sidebar';
import { useFarm } from '@/context/FarmContext';
import { useLanguage } from '@/context/LanguageContext';
import { Logo } from '@/components/logo';
import { LayoutGrid, Globe, User } from 'lucide-react';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isLoadingProfile } = useFarm();
  const { t } = useLanguage();
  const pathname = usePathname();

  if (isLoadingProfile) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-[#E9ECEF] fixed inset-0 z-[9999]">
        <div className="flex flex-col items-center gap-6">
          <div className="w-12 h-12 border-4 border-white rounded-full border-t-[#16242F] animate-spin" />
          <p className="text-[12px] font-black text-[#16242F]/40 uppercase tracking-[0.4em]">SYNCING</p>
        </div>
      </div>
    );
  }

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-[#E9ECEF] overflow-hidden font-sans">
        <AppSidebar />

        <SidebarInset className="flex flex-col relative z-10 bg-transparent">
          <header className="top-header">
            <div className="flex items-center gap-6">
              <LayoutGrid className="h-5 w-5 text-[#1A1A1A]/40" />
              <h2 className="text-[13px] font-bold uppercase tracking-[0.2em] text-[#1A1A1A] whitespace-nowrap opacity-80">
                FARM MANAGEMENT SYSTEM
              </h2>
            </div>
            
            <div className="flex items-center gap-8">
              <div className="flex items-center gap-2 opacity-40 hover:opacity-100 transition-opacity cursor-pointer">
                <Globe className="h-4 w-4" />
                <span className="text-[10px] font-black uppercase tracking-widest">En</span>
              </div>
              <UserNav />
            </div>
          </header>
          
          <main className="flex-1 overflow-y-auto no-scrollbar">
            {children}
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}