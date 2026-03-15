'use client';

import { usePathname } from 'next/navigation';
import { UserNav } from '@/components/user-nav';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/app-sidebar';
import { useFarm } from '@/context/FarmContext';
import { useLanguage } from '@/context/LanguageContext';
import { Logo } from '@/components/logo';

const routeToKey: Record<string, string> = {
  '/dashboard': 'dashboard_hero',
  '/dashboard/overview': 'overview',
  '/dashboard/analysis': 'intelligence',
  '/dashboard/monthly-ledger': 'ledger',
  '/dashboard/balance-sheet': 'liabilities',
  '/dashboard/livestock': 'flock',
  '/dashboard/sales': 'sales',
  '/dashboard/mortality': 'mortality',
  '/dashboard/expenses': 'expenses',
  '/dashboard/medicine': 'health',
  '/dashboard/feed': 'feed',
  '/dashboard/labor': 'labor',
  '/dashboard/marketplace': 'marketplace',
  '/dashboard/feed-calculator': 'calculator',
  '/dashboard/help': 'install',
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isLoadingProfile } = useFarm();
  const { t } = useLanguage();
  const pathname = usePathname();
  
  const pageTitleKey = routeToKey[pathname] || 'home';
  const pageTitle = t(pageTitleKey);

  if (isLoadingProfile) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-[#F4F7F6] fixed inset-0 z-[9999]">
        <div className="flex flex-col items-center gap-6">
          <div className="w-12 h-12 border-4 border-white rounded-full border-t-[#2D5A27] animate-spin" />
          <p className="text-[12px] font-black text-[#2D5A27]/40 uppercase tracking-[0.4em]">SYNCING</p>
        </div>
      </div>
    );
  }

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-[#F4F7F6] overflow-hidden font-sans">
        <AppSidebar />

        <SidebarInset className="flex flex-col relative z-10 bg-transparent">
          {/* Standardized Header */}
          <header className="top-header">
            <div className="flex-1 flex justify-start items-center gap-8">
              <Logo />
              <div className="h-6 w-px bg-neutral-100 hidden md:block" />
              <p className="text-[11px] font-bold uppercase tracking-[0.3em] text-neutral-300 hidden lg:block">Universal Dashboard</p>
            </div>
            
            <div className="flex-1 flex justify-center">
              <h2 className="text-[13px] font-black uppercase tracking-[0.2em] text-[#2D5A27] whitespace-nowrap">
                {pathname === '/dashboard' ? 'MANAGEMENT HUB' : pageTitle}
              </h2>
            </div>
            
            <div className="flex-1 flex justify-end">
              <UserNav />
            </div>
          </header>
          
          <main className="flex-1 overflow-y-auto no-scrollbar">
            {pathname === '/dashboard' ? (
              children
            ) : (
              <div className="p-8">
                <div className="dashboard-panel animate-in fade-in zoom-in-95 duration-500">
                  {children}
                </div>
              </div>
            )}
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}