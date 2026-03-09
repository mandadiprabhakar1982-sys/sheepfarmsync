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
  Loader2
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

  const navItems = [
    { href: '/dashboard', label: t('home'), icon: LayoutDashboard },
    { href: '/dashboard/livestock', label: t('flock'), icon: ClipboardList },
    { href: '/dashboard/purchase', label: t('buy'), icon: ShoppingBag },
    { href: '/dashboard/medicine', label: t('health'), icon: HeartPulse },
    { href: '/dashboard/feed', label: t('feed'), icon: Wheat },
  ];

  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'te' : 'en');
  };

  // Prevent UI jumping by waiting for the profile/role to be fully established
  if (isLoadingProfile) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background fixed inset-0 z-[9999]">
        <div className="flex flex-col items-center gap-6">
          <div className="relative">
            <div className="w-12 h-12 border-4 border-primary/20 rounded-full"></div>
            <div className="absolute top-0 w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          </div>
          <div className="flex flex-col items-center gap-2">
            <p className="text-[10px] font-black tracking-[0.3em] text-primary uppercase animate-pulse">{t('syncing')}</p>
            <p className="text-[8px] font-bold text-muted-foreground/40 uppercase tracking-widest">Applying Stealth Protocol...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-background selection:bg-primary/20 overflow-hidden">
        <AppSidebar />
        <SidebarInset className="flex flex-col relative">
          <header className="sticky top-0 z-50 flex h-20 items-center justify-between gap-4 border-b bg-white/80 backdrop-blur-md px-4 md:px-10 safe-area-top">
            <div className="flex items-center gap-3">
              <SidebarTrigger className="h-10 w-10" />
              <Separator orientation="vertical" className="h-6 hidden md:block" />
              <Logo className="md:hidden scale-90 origin-left" />
              <h2 className="hidden md:block text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/40 ml-2">
                 {t('system_name')}
              </h2>
            </div>
            
            <div className="flex items-center gap-2 md:gap-4">
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={toggleLanguage}
                className="text-muted-foreground hover:bg-primary/5 hover:text-primary transition-colors"
                title="Change Language"
              >
                <Languages className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon" className="text-muted-foreground hidden sm:flex">
                <Globe className="h-5 w-5" />
              </Button>
              <UserNav />
            </div>
          </header>
          
          <main className="flex-1 pb-24 overflow-y-auto no-scrollbar scroll-smooth">
            {children}
          </main>
          
          {/* Mobile Navigation - Native Feel */}
          <footer className="fixed bottom-0 left-0 right-0 z-40 border-t bg-white/95 backdrop-blur-xl xl:hidden pb-[env(safe-area-inset-bottom)] no-select">
            <nav className="flex h-16 items-center justify-around px-2">
              {navItems.map((link) => {
                const Icon = link.icon;
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={cn(
                      'flex flex-col items-center justify-center gap-1 min-w-[64px] h-full transition-all duration-200 active:scale-90',
                      isActive ? 'text-primary' : 'text-muted-foreground'
                    )}
                  >
                    <div className={cn(
                      "p-1 rounded-lg transition-colors",
                      isActive ? "bg-primary/5" : ""
                    )}>
                      <Icon className={cn("h-5 w-5", isActive ? "scale-110" : "opacity-70")} />
                    </div>
                    <span className="text-[10px] font-bold text-center leading-none">{link.label}</span>
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
