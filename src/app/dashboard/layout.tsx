import Link from 'next/link';
import { Menu } from 'lucide-react';
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

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen w-full flex-col">
      <header className="sticky top-0 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6">
        <nav className="hidden flex-none items-center gap-6 text-sm font-medium md:flex">
          <Link
            href="/dashboard"
            className="flex items-center gap-2 text-lg font-semibold md:text-base"
          >
            <Logo />
            <span className="sr-only">SheepFarmSync</span>
          </Link>
          <Nav />
        </nav>

        <Sheet>
          <SheetTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              className="shrink-0 md:hidden"
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
                <span className="sr-only">SheepFarmSync</span>
              </Link>
              <Nav />
            </nav>
          </SheetContent>
        </Sheet>
        
        <div className="flex w-full justify-end">
          <UserNav />
        </div>
      </header>
      <main className="flex-1 p-4 sm:p-6 lg:p-8">
        {children}
      </main>
      <Toaster />
    </div>
  );
}
