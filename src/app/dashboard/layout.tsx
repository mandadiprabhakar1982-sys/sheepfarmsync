'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  ClipboardList, 
  ShoppingBag, 
  HeartPulse, 
  Wheat, 
  Globe,
  Languages,
  Plus,
  Home
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
    { href: '/dashboard/livestock', label: t('flock'), icon: ClipboardList },
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
          <div className="w-12 h-12 border-4 border-primary/10 rounded-full border-t-primary animate-spin" />
          <p className="text-[10px] font-display text-primary animate-pulse">{t('syncing')}</p>
        </div>
      </div>
    );
  }

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-[#F8F9FA] overflow-hidden">
        {/* Desktop Sidebar - Hidden on mobile */}
        <div className="hidden md:flex">
          <AppSidebar />
        </div>

        <SidebarInset className="flex flex-col relative bg-transparent">
          {/* Top Header - Contextual Actions */}
          <header className="sticky top-0 z-50 flex h-20 items-center justify-between gap-4 glass-effect px-6 md:px-10 safe-area-top">
            <div className="flex items-center gap-4">
              <div className="md:hidden">
                <Logo showManager={false} className="scale-90 origin-left" />
              </div>
              <div className="hidden md:flex items-center gap-4">
                <SidebarTrigger className="h-10 w-10 hover:bg-black/5 rounded-xl transition-colors" />
                <Separator orientation="vertical" className="h-6" />
                <h2 className="text-[10px] font-display text-primary/40 tracking-[0.3em]">
                   {t('system_name')}
                </h2>
              </div>
            </div>
            
            <div className="flex items-center gap-2 md:gap-4">
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={toggleLanguage}
                className="rounded-xl hover:bg-primary/5 transition-colors"
              >
                <Languages className="h-5 w-5 text-primary/60" />
              </Button>
              <UserNav />
            </div>
          </header>
          
          <main className="flex-1 pb-32 md:pb-10 pt-6 overflow-y-auto no-scrollbar">
            {children}
          </main>
          
          {/* Elite Mobile Navigation Bar */}
          <footer className="fixed bottom-0 left-0 right-0 z-50 md:hidden pb-[env(safe-area-inset-bottom)] px-4 mb-4">
            <nav className="flex h-20 items-center justify-around glass-effect rounded-[2rem] shadow-2xl border-white/40 ring-1 ring-black/5 px-2">
              {mobileNavItems.map((link) => {
                const Icon = link.icon;
                const isActive = pathname === link.href;
                
                if (link.isCenter) {
                  return (
                    <Link key={link.href} href={link.href} className="nav-center-node">
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
                      isActive ? 'text-primary' : 'text-primary/30'
                    )}
                  >
                    <div className={cn(
                      "p-2 rounded-xl transition-colors",
                      isActive ? "bg-primary/5" : ""
                    )}>
                      <Icon className={cn("h-5 w-5", isActive ? "scale-110" : "opacity-70")} />
                    </div>
                    <span className="text-[9px] font-black uppercase tracking-tighter leading-none">{link.label}</span>
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
