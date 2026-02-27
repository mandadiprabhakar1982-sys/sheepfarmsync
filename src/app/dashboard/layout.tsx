'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  ClipboardList, 
  ShoppingBag, 
  HeartPulse, 
  Wheat, 
  Users, 
  BadgeIndianRupee, 
  BarChart, 
  Globe
} from 'lucide-react';
import { Logo } from '@/components/logo';
import { UserNav } from '@/components/user-nav';
import { Toaster } from '@/components/ui/toaster';
import { FarmProvider } from '@/context/FarmContext';
import { cn } from '@/lib/utils';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/app-sidebar';
import { Button } from '@/components/ui/button';

const navItems = [
  { href: '/dashboard', label: 'Home', icon: LayoutDashboard },
  { href: '/dashboard/livestock', label: 'Flock', icon: ClipboardList },
  { href: '/dashboard/purchase', label: 'Buy', icon: ShoppingBag },
  { href: '/dashboard/medicine', label: 'Health', icon: HeartPulse },
  { href: '/dashboard/feed', label: 'Feed', icon: Wheat },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <FarmProvider>
      <SidebarProvider>
        <div className="flex min-h-screen w-full bg-background selection:bg-primary/20 overflow-hidden">
          <AppSidebar />
          <SidebarInset className="flex flex-col relative">
            <header className="sticky top-0 z-50 flex h-20 items-center justify-between gap-4 border-b bg-white/80 backdrop-blur-md px-6 md:px-10 safe-area-top">
              <div className="flex items-center gap-4">
                <Logo className="md:hidden scale-90 origin-left" />
                <h2 className="hidden md:block text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/40">
                   Farm Management System
                </h2>
              </div>
              
              <div className="flex items-center gap-4">
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
      <Toaster />
    </FarmProvider>
  );
}