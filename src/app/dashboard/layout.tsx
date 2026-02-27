
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, LayoutDashboard, BadgeIndianRupee, Calculator, ShoppingBag, Menu } from 'lucide-react';
import { Logo, SheepIcon } from '@/components/logo';
import { UserNav } from '@/components/user-nav';
import { Toaster } from '@/components/ui/toaster';
import { FarmProvider } from '@/context/FarmContext';
import { cn } from '@/lib/utils';
import { SidebarProvider, SidebarTrigger, SidebarInset } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/app-sidebar';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const mobileNavLinks = [
    { href: '/dashboard', label: 'Home', icon: Home },
    { href: '/dashboard/overview', label: 'Stats', icon: LayoutDashboard },
    { href: '/dashboard/livestock', label: 'Logs', icon: SheepIcon },
    { href: '/dashboard/marketplace', label: 'Market', icon: ShoppingBag },
    { href: '/dashboard/feed-calculator', label: 'Calc', icon: Calculator },
  ];

  return (
    <FarmProvider>
      <SidebarProvider>
        <div className="flex min-h-screen w-full bg-background selection:bg-primary/20">
          <AppSidebar />
          <SidebarInset className="flex flex-col">
            <header className="sticky top-0 z-40 flex h-20 items-center justify-between gap-4 border-b bg-white/95 backdrop-blur-md px-4 md:px-8 safe-area-top">
              <div className="flex items-center gap-4">
                <SidebarTrigger className="md:flex" />
                <div className="flex-none md:hidden">
                  <Logo showManager={true} />
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <UserNav />
              </div>
            </header>
            
            <main className="flex-1 pb-[calc(4rem+env(safe-area-inset-bottom))] md:pb-8 overflow-y-auto">
              {children}
            </main>
            
            {/* Bottom Navigation for Mobile - iOS Tab Bar Style */}
            <footer className="fixed bottom-0 left-0 right-0 z-40 border-t bg-white/80 backdrop-blur-xl md:hidden safe-area-bottom pb-env(safe-area-inset-bottom)">
              <nav className="flex h-16 items-center justify-around px-2 no-select">
                {mobileNavLinks.map((link) => {
                  const Icon = link.icon;
                  const isActive = pathname === link.href;
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      className={cn(
                        'flex flex-col items-center justify-center gap-1 w-full h-full transition-all duration-200 active:scale-90',
                        isActive ? 'text-primary' : 'text-muted-foreground'
                      )}
                    >
                      <div className={cn(
                        'p-1 rounded-lg transition-colors',
                        isActive ? 'bg-primary/10' : ''
                      )}>
                        <Icon className={cn("h-6 w-6 transition-transform", isActive ? "scale-110" : "")} />
                      </div>
                      <span className="text-[10px] font-bold tracking-tighter uppercase">{link.label}</span>
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
