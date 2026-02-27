
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Globe, Home, LayoutDashboard, BadgeIndianRupee, Calculator, ShoppingBag } from 'lucide-react';
import { Logo, SheepIcon } from '@/components/logo';
import { Nav } from '@/components/nav';
import { UserNav } from '@/components/user-nav';
import { Button } from '@/components/ui/button';
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
    { href: '/dashboard/overview', label: 'Overview', icon: LayoutDashboard },
    { href: '/dashboard/livestock', label: 'Sheep', icon: SheepIcon },
    { href: '/dashboard/marketplace', label: 'Market', icon: ShoppingBag },
    { href: '/dashboard/feed-calculator', label: 'Calculator', icon: Calculator },
  ];

  return (
    <FarmProvider>
      <div className="flex min-h-screen w-full flex-col bg-background">
        <header className="sticky top-0 z-40 flex h-20 items-center justify-between gap-4 border-b bg-card px-4 md:px-6">
          <div className="flex-none">
            <Logo showManager={true} />
          </div>
          
          <div className="hidden flex-1 items-center justify-center gap-1 md:flex overflow-x-auto">
              <Nav />
          </div>
          
          {/* Mobile Header right side */}
          <div className="flex items-center gap-2 md:hidden">
            <UserNav />
          </div>

          {/* Desktop Header right side */}
          <div className="hidden items-center gap-2 justify-end md:flex">
            <UserNav />
          </div>
        </header>
        <main className="flex-1 pb-20 md:pb-0 overflow-y-auto">
          {children}
        </main>
        
        {/* Bottom Navigation for Mobile */}
        <footer className="fixed bottom-0 left-0 right-0 z-40 border-t bg-card md:hidden">
          <nav className="grid h-16 grid-cols-5 items-center justify-items-center text-xs">
            {mobileNavLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    'flex h-full w-full flex-col items-center justify-center gap-1 p-1',
                    isActive ? 'text-primary bg-accent' : 'text-muted-foreground'
                  )}
                >
                  <Icon className="h-5 w-5" />
                  <span className="text-[10px] font-medium">{link.label}</span>
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
