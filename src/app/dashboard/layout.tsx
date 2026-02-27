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
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/dashboard/livestock', label: 'Flock Tracking', icon: ClipboardList },
  { href: '/dashboard/purchase', label: 'Purchase Animals', icon: ShoppingBag },
  { href: '/dashboard/medicine', label: 'Medicine Cost', icon: HeartPulse },
  { href: '/dashboard/feed', label: 'Feed Cost', icon: Wheat },
  { href: '/dashboard/labor', label: 'Labour Cost', icon: Users },
  { href: '/dashboard/sales', label: 'Animal Sale', icon: BadgeIndianRupee },
  { href: '/dashboard/analysis', label: 'Reports', icon: BarChart },
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
        <div className="flex min-h-screen w-full bg-background selection:bg-primary/20">
          <AppSidebar />
          <SidebarInset className="flex flex-col">
            <header className="sticky top-0 z-50 flex h-20 items-center justify-between gap-4 border-b bg-white px-6 md:px-10">
              <div className="flex items-center gap-4">
                <Logo className="md:hidden scale-90 origin-left" />
                <h2 className="hidden md:block text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/40">
                   Farm Management System
                </h2>
              </div>
              
              <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" className="text-muted-foreground">
                  <Globe className="h-5 w-5" />
                </Button>
                <UserNav />
              </div>
            </header>
            
            <main className="flex-1 pb-16 overflow-y-auto">
              {children}
            </main>
            
            {/* Mobile Navigation */}
            <footer className="fixed bottom-0 left-0 right-0 z-40 border-t bg-white/95 backdrop-blur-xl xl:hidden safe-area-bottom pb-env(safe-area-inset-bottom)">
              <nav className="flex h-16 items-center justify-around px-2 no-select overflow-x-auto no-scrollbar">
                {navItems.slice(0, 5).map((link) => {
                  const Icon = link.icon;
                  const isActive = pathname === link.href;
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      className={cn(
                        'flex flex-col items-center justify-center gap-1 min-w-[64px] h-full transition-all duration-200',
                        isActive ? 'text-primary' : 'text-muted-foreground'
                      )}
                    >
                      <Icon className={cn("h-5 w-5", isActive ? "scale-110" : "opacity-70")} />
                      <span className="text-[9px] font-bold text-center leading-none">{link.label.split(' ')[0]}</span>
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
