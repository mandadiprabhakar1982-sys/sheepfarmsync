'use client';

import { usePathname } from 'next/navigation';
import { 
  Languages,
  Monitor,
} from 'lucide-react';
import { Logo } from '@/components/logo';
import { UserNav } from '@/components/user-nav';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/app-sidebar';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useLanguage } from '@/context/LanguageContext';
import { useFarm } from '@/context/FarmContext';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { t, language, setLanguage } = useLanguage();
  const { isLoadingProfile } = useFarm();

  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'te' : 'en');
  };

  if (isLoadingProfile) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-white fixed inset-0 z-[9999]">
        <div className="flex flex-col items-center gap-6">
          <div className="w-12 h-12 border-4 border-neutral-100 rounded-full border-t-emerald-500 animate-spin" />
          <p className="text-[12px] font-black text-neutral-400 uppercase tracking-[0.4em]">{t('syncing')}</p>
        </div>
      </div>
    );
  }

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-transparent overflow-hidden selection:bg-emerald-500/30 font-sans">
        <div className="dashboard-bg" />
        
        {/* Persistent Sidebar */}
        <div className="hidden md:flex relative z-20">
          <AppSidebar />
        </div>

        <SidebarInset className="flex flex-col relative bg-transparent z-10 p-4 md:p-6 lg:p-8">
          {/* Header Bar */}
          <header className="flex h-14 items-center justify-between gap-4 glass-panel mb-6 rounded-xl px-6">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3">
                <Monitor className="h-3.5 w-3.5 text-neutral-400" />
                <h2 className="text-[10px] font-bold text-neutral-500 tracking-[0.15em] uppercase">
                   FARM MANAGEMENT SYSTEM
                </h2>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={toggleLanguage}
                className="rounded-lg h-8 w-8 hover:bg-neutral-100 text-neutral-400 transition-all"
              >
                <Languages className="h-4 w-4" />
              </Button>
              <UserNav />
            </div>
          </header>
          
          <main className="flex-1 overflow-y-auto no-scrollbar relative rounded-2xl">
            {children}
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}