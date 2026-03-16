'use client';

import { UserNav } from '@/components/user-nav';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/app-sidebar';
import { MobileNav } from '@/components/mobile-nav';
import { useFarm } from '@/context/FarmContext';
import { useWindowDimensions } from '@/hooks/use-mobile';
import { Bell, User } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Logo } from '@/components/logo';
import { cn } from '@/lib/utils';

/**
 * @fileOverview Gatekeeper Layout.
 * Refined for high-fidelity FarmAudit mobile header and bottom navigation.
 */
export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isLoadingProfile } = useFarm();
  const { width, isHydrated } = useWindowDimensions();
  const isMobile = isHydrated ? width < 768 : false;

  // AUTHENTICATION & HYDRATION GATE
  if (isLoadingProfile || !isHydrated) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-white fixed inset-0 z-[9999]">
        <div className="flex flex-col items-center gap-6">
          <div className="w-12 h-12 border-4 border-slate-100 rounded-full border-t-primary animate-spin" />
          <p className="text-[12px] font-black text-slate-400 uppercase tracking-[0.4em]">Establishing Secure Link</p>
        </div>
      </div>
    );
  }

  return (
    <SidebarProvider>
      <div className="app-container dashboard-backdrop bg-[#F5F7F8]">
        
        {/* DESKTOP VIEW: Sidebar is visible if width > 768 */}
        {!isMobile && <AppSidebar />}

        <SidebarInset className="flex flex-col h-full bg-transparent overflow-hidden">
          {/* MOBILE HEADER - Matching Reference Image */}
          {isMobile ? (
            <header className="h-16 bg-[#0B8F8A] px-6 flex items-center justify-between shrink-0 z-50">
              <div className="flex items-center gap-3">
                <Logo className="text-white scale-90 origin-left" />
              </div>
              <div className="flex items-center gap-4 text-white">
                <div className="relative">
                  <Bell className="h-5 w-5" />
                  <span className="absolute -top-1 -right-1 h-4 w-4 bg-[#E53935] rounded-full text-[8px] font-black flex items-center justify-center border-2 border-[#0B8F8A]">8</span>
                </div>
                <div className="h-8 w-8 rounded-full bg-white/20 flex items-center justify-center">
                  <User className="h-5 w-5" />
                </div>
              </div>
            </header>
          ) : (
            <header className="top-header">
              <div className="flex items-center gap-4 md:gap-6">
                <h2 className="text-[11px] font-black uppercase tracking-[0.3em] text-slate-500 whitespace-nowrap">
                  Executive Command Center
                </h2>
              </div>
              <div className="flex items-center gap-2 md:gap-8">
                <UserNav />
              </div>
            </header>
          )}
          
          {/* INDEPENDENT SCROLL AREA */}
          <main className={cn(
            "scroll-content",
            isMobile ? "p-4 pb-24" : "p-12"
          )}>
            <div className="max-w-7xl mx-auto h-full">
              {children}
            </div>
          </main>
        </SidebarInset>
        
        {/* MOBILE VIEW: Tab bar and Menu trigger */}
        {isMobile && (
          <>
            <AppSidebar /> 
            <MobileNav />
          </>
        )}
      </div>
    </SidebarProvider>
  );
}
