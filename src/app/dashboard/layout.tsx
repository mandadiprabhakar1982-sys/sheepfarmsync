'use client';

import { 
  Monitor,
} from 'lucide-react';
import { UserNav } from '@/components/user-nav';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/app-sidebar';
import { useFarm } from '@/context/FarmContext';
import { Logo } from '@/components/logo';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isLoadingProfile } = useFarm();

  if (isLoadingProfile) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-white fixed inset-0 z-[9999]">
        <div className="flex flex-col items-center gap-6">
          <div className="w-12 h-12 border-4 border-neutral-100 rounded-full border-t-[#2e7d32] animate-spin" />
          <p className="text-[12px] font-black text-neutral-400 uppercase tracking-[0.4em]">SYNCING</p>
        </div>
      </div>
    );
  }

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-white overflow-hidden font-sans">
        <AppSidebar />

        <SidebarInset className="flex flex-col relative bg-transparent z-10">
          {/* Header Bar */}
          <header className="top-header flex items-center justify-between gap-4 px-8 sticky top-0 z-50">
            <div className="flex items-center gap-8">
              <Logo className="md:hidden" />
              <div className="hidden md:flex items-center gap-3 text-neutral-400">
                <span className="text-[11px] font-bold tracking-[0.1em] uppercase">FARM MANAGEMENT SYSTEM</span>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3 text-neutral-400 px-4">
                 <Monitor className="h-4 w-4" />
              </div>
              <UserNav />
            </div>
          </header>
          
          <main className="flex-1 overflow-y-auto no-scrollbar relative p-8">
            {children}
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}