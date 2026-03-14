'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Home,
  LayoutGrid,
  HeartPulse,
  Wheat,
  Languages,
  Plus,
  Monitor,
} from 'lucide-react';
import { Logo } from '@/components/logo';
import { UserNav } from '@/components/user-nav';
import { cn } from '@/lib/utils';
import { SidebarProvider, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar';
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
  const pathname = usePathname();
  const { t, language, setLanguage } = useLanguage();
  const { isLoadingProfile } = useFarm();

  const mobileNavItems = [
    { href: '/dashboard', label: t('home'), icon: Home },
    { href: '/dashboard/livestock', label: "Hub", icon: LayoutGrid },
    { href: '/dashboard/purchase', label: 'Quick', icon: Plus, isCenter: true },
    { href: '/dashboard/medicine', label: t('health'), icon: HeartPulse },
    { href: '/dashboard/feed', label: t('feed'), icon: Wheat },
  ];

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
      <div className="flex min-h-screen w-full bg-white overflow-hidden selection:bg-emerald-500/30 font-sans">
        {/* Persistent Sidebar */}
        <div className="hidden md:flex relative z-20">
          <AppSidebar />
        </div>

        <SidebarInset className="flex flex-col relative bg-white z-10">
          {/* Header Bar */}
          <header className="sticky top-4 z-50 flex h-16 items-center justify-between gap-4 bg-white/80 backdrop-blur-2xl mx-6 md:mx-10 mt-4 rounded-2xl border border-neutral-100 shadow-xl px-6">
            <div className="flex items-center gap-4">
              <div className="md:hidden">
                <Logo showManager={false} className="scale-90 origin-left" />
              </div>
              <div className="hidden md:flex items-center gap-6">
                <SidebarTrigger className="h-10 w-10 hover:bg-neutral-50 rounded-xl transition-all text-neutral-400" />
                <Separator orientation="vertical" className="h-6 bg-neutral-100" />
                <div className="flex items-center gap-3 px-4 py-1.5 bg-neutral-50 rounded-lg border border-neutral-100">
                  <Monitor className="h-3.5 w-3.5 text-neutral-400" />
                  <h2 className="text-[10px] font-black text-neutral-400 tracking-[0.2em] uppercase">
                     FARM MANAGEMENT SYSTEM
                  </h2>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-2 md:gap-4">
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={toggleLanguage}
                className="rounded-xl hover:bg-neutral-50 text-neutral-400 transition-all"
              >
                <Languages className="h-5 w-5" />
              </Button>
              <UserNav />
            </div>
          </header>
          
          <main className="flex-1 pb-32 md:pb-10 overflow-y-auto no-scrollbar relative pt-6 bg-white">
            {children}
          </main>
          
          {/* Mobile Bottom Navigation */}
          <footer className="fixed bottom-0 left-0 right-0 z-50 md:hidden pb-[env(safe-area-inset-bottom)] px-4 mb-4">
            <nav className="flex h-16 items-center justify-around bg-white/90 backdrop-blur-3xl rounded-3xl shadow-2xl border border-neutral-100 px-2">
              {mobileNavItems.map((link) => {
                const Icon = link.icon;
                const isActive = pathname === link.href;
                
                if (link.isCenter) {
                  return (
                    <Link key={link.href} href="/dashboard/livestock" className="relative -top-6 bg-emerald-600 text-white p-4 rounded-full shadow-2xl transition-transform active:scale-90 border-4 border-white">
                      <Icon className="h-6 w-6" />
                    </Link>
                  );
                }

                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={cn(
                      'flex flex-col items-center justify-center gap-1 transition-all duration-300',
                      isActive ? 'text-emerald-600' : 'text-neutral-400'
                    )}
                  >
                    <Icon className={cn("h-5 w-5", isActive ? "scale-110" : "opacity-70")} />
                    <span className="text-[9px] font-bold uppercase tracking-widest leading-none">{link.label}</span>
                  </Link>
                );
              })}
            </nav>
          </footer>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}