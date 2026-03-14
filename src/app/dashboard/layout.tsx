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
  Monitor
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
      <div className="flex h-screen w-full items-center justify-center bg-[#0a0a0a] fixed inset-0 z-[9999]">
        <div className="flex flex-col items-center gap-6">
          <div className="w-12 h-12 border-4 border-white/5 rounded-full border-t-emerald-500 animate-spin" />
          <p className="text-[12px] font-black text-white/40 uppercase tracking-[0.4em]">{t('syncing')}</p>
        </div>
      </div>
    );
  }

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-[#0a0a0a] overflow-hidden selection:bg-emerald-500/30">
        {/* WEB MODEL: Persistent Sidebar - Hidden on mobile */}
        <div className="hidden md:flex">
          <AppSidebar />
        </div>

        <SidebarInset className="flex flex-col relative bg-transparent">
          {/* ADAPTIVE HEADER */}
          <header className="sticky top-0 z-50 flex h-20 items-center justify-between gap-4 bg-white/5 backdrop-blur-2xl px-6 md:px-10 safe-area-top border-b border-white/5 shadow-2xl">
            <div className="flex items-center gap-4">
              <div className="md:hidden">
                <Logo showManager={false} light={true} className="scale-90 origin-left" />
              </div>
              <div className="hidden md:flex items-center gap-6">
                <SidebarTrigger className="h-10 w-10 hover:bg-white/10 rounded-2xl transition-all text-white/60 hover:text-white" />
                <Separator orientation="vertical" className="h-6 bg-white/10" />
                <div className="flex items-center gap-3 px-4 py-2 bg-white/5 rounded-xl border border-white/5">
                  <Monitor className="h-4 w-4 text-emerald-400" />
                  <h2 className="text-[11px] font-black text-white/40 tracking-[0.3em] uppercase">
                     FARM MANAGEMENT SYSTEM
                  </h2>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-2 md:gap-6">
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={toggleLanguage}
                className="rounded-2xl hover:bg-white/10 text-white/60 transition-all"
              >
                <Languages className="h-5 w-5" />
              </Button>
              <UserNav />
            </div>
          </header>
          
          <main className="flex-1 pb-32 md:pb-10 overflow-y-auto no-scrollbar relative">
            {children}
          </main>
          
          {/* MOBILE MODEL: Tactile Bottom Navigation - Hidden on desktop */}
          <footer className="fixed bottom-0 left-0 right-0 z-50 md:hidden pb-[env(safe-area-inset-bottom)] px-4 mb-4">
            <nav className="flex h-20 items-center justify-around bg-black/80 backdrop-blur-3xl rounded-[2.5rem] shadow-2xl border border-white/10 px-2 ring-1 ring-white/10">
              {mobileNavItems.map((link) => {
                const Icon = link.icon;
                const isActive = pathname === link.href;
                
                if (link.isCenter) {
                  return (
                    <Link key={link.href} href="/dashboard/livestock" className="relative -top-6 bg-emerald-600 text-white p-4 rounded-full shadow-[0_0_30px_rgba(16,185,129,0.4)] transition-transform active:scale-90 border-4 border-[#0a0a0a]">
                      <Icon className="h-7 w-7" />
                    </Link>
                  );
                }

                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={cn(
                      'flex flex-col items-center justify-center gap-1.5 min-w-[64px] h-full transition-all duration-300',
                      isActive ? 'text-emerald-400' : 'text-white/20'
                    )}
                  >
                    <div className={cn(
                      "p-2 rounded-2xl transition-all duration-300",
                      isActive ? "bg-emerald-500/10" : ""
                    )}>
                      <Icon className={cn("h-5 w-5", isActive ? "scale-110" : "opacity-70")} />
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-widest leading-none">{link.label}</span>
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
