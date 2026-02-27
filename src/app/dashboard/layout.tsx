'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, LayoutDashboard, BadgeIndianRupee, Calculator, ShoppingBag } from 'lucide-react';
import { Logo, SheepIcon } from '@/components/logo';
import { Nav } from '@/components/nav';
import { UserNav } from '@/components/user-nav';
import { Toaster } from '@/components/ui/toaster';
import { FarmProvider } from '@/context/FarmContext';
import { cn } from '@/lib/utils';

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
      <div className="flex min-h-screen w-full flex-col bg-background">
        <header className="sticky top-0 z-40 flex h-20 items-center justify-between gap-4 border-b bg-white/95 backdrop-blur-md px-4 md:px-8">
          <div className="flex-none">
            <Logo showManager={true} />
          </div>
          
          <div className="hidden flex-1 items-center justify-center gap-1 md:flex overflow-x-auto mx-4">
              <Nav />
          </div>
          
          <div className="flex items-center gap-2">
            <UserNav />
          </div>
        </header>
        <main className="flex-1 pb-24 md:pb-8 overflow-y-auto">
          {children}
        </main>
        
        {/* Bottom Navigation for Mobile - Native Look */}
        <footer className="fixed bottom-0 left-0 right-0 z-40 border-t bg-white/95 backdrop-blur-md md:hidden safe-area-bottom pb-env(safe-area-inset-bottom)">
          <nav className="flex h-16 items-center justify-around px-4">
            {mobileNavLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    'flex flex-col items-center justify-center gap-1 px-3 transition-colors',
                    isActive ? 'text-primary' : 'text-muted-foreground'
                  )}
                >
                  <div className={cn(
                    'p-1.5 rounded-lg transition-colors',
                    isActive ? 'bg-primary/10' : ''
                  )}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <span className="text-[10px] font-bold tracking-tight uppercase">{link.label}</span>
                </Link>
              );
            })}
          </nav>
        </footer>

        <Toaster />
      </div>
    </FarmProvider>
  );
}