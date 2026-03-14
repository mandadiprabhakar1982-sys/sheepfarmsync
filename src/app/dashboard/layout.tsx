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
      <div className="flex h-screen w-full items-center justify-center bg-[#f4f9f1] fixed inset-0 z-[9999]">
        <div className="flex flex-col items-center gap-6">
          <div className="w-12 h-12 border-4 border-white rounded-full border-t-[#65a30d] animate-spin" />
          <p className="text-[12px] font-black text-[#365314]/40 uppercase tracking-[0.4em]">SYNCING</p>
        </div>
      </div>
    );
  }

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-[#f4f9f1] overflow-hidden font-sans">
        <AppSidebar />

        <SidebarInset className="flex flex-col relative z-10 bg-transparent">
          {/* Universal Header with precise design specs */}
          <header className="top-header">
            <div className="flex-1 flex justify-start">
              <Logo />
            </div>
            
            <div className="flex-1 flex justify-center">
              <h2 className="text-[13px] font-black uppercase tracking-[0.2em] text-[#14532d] whitespace-nowrap">
                {pageTitle}
              </h2>
            </div>
            
            <div className="flex-1 flex justify-end">
              <UserNav />
            </div>
          </header>
          
          <main className="flex-1 overflow-y-auto no-scrollbar p-10">
            {pathname === '/dashboard' ? (
              children
            ) : (
              <div className="dashboard-panel">
                {children}
              </div>
            )}
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}