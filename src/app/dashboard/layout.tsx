'use client';

import Link from 'next/link';
import { Globe, Menu, Loader2 } from 'lucide-react';
import { Logo } from '@/components/logo';
import { Nav } from '@/components/nav';
import { UserNav } from '@/components/user-nav';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Toaster } from '@/components/ui/toaster';
import { FarmProvider } from '@/context/FarmContext';
import { useUser } from '@/firebase';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isUserLoading } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push('/login');
    }
  }, [user, isUserLoading, router]);

  if (isUserLoading || !user) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <FarmProvider>
      <div className="flex min-h-screen w-full flex-col bg-background">
        <header className="sticky top-0 z-40 flex h-20 items-center gap-4 border-b bg-card px-4 md:px-6">
          <div className="flex-none">
            <Logo showManager={true} />
          </div>
          
          <div className="hidden flex-1 items-center justify-center md:flex">
              <Nav />
          </div>

          <div className="flex flex-1 items-center justify-end md:hidden">
            <Sheet>
              <SheetTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  className="shrink-0"
                >
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Toggle navigation menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="left">
                <nav className="grid gap-6 text-lg font-medium">
                  <Link
                    href="/dashboard"
                    className="flex items-center gap-2 text-lg font-semibold"
                  >
                    <Logo />
                  </Link>
                  <Nav />
                </nav>
              </SheetContent>
            </Sheet>
          </div>
          
          <div className="hidden items-center gap-2 justify-end md:flex">
            <Button variant="ghost" size="icon">
                <Globe className="h-5 w-5" />
                <span className="sr-only">Language</span>
            </Button>
            <UserNav />
          </div>
        </header>
        <main className="flex-1">
          {children}
        </main>
        <Toaster />
      </div>
    </FarmProvider>
  );
}
