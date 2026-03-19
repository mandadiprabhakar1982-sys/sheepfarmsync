'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutGrid, 
  ClipboardList, 
  BookOpen, 
  Heart, 
  Scale, 
  ShieldCheck, 
  Calculator, 
  Zap, 
  Landmark, 
  ReceiptIndianRupee,
} from 'lucide-react';
import { 
  Sidebar, 
  SidebarContent, 
  SidebarFooter, 
  SidebarHeader, 
  SidebarMenu, 
  SidebarMenuButton, 
  SidebarMenuItem, 
  SidebarGroup, 
  SidebarGroupContent,
  SidebarGroupLabel
} from '@/components/ui/sidebar';
import { cn } from '@/lib/utils';
import { useFarm } from '@/context/FarmContext';

export function AppSidebar() {
  const pathname = usePathname();
  const { userRole } = useFarm();
  const isAdmin = userRole === 'admin';

  const publicMenu = [
    { href: '/dashboard', label: "Dashboard", icon: LayoutGrid },
    { href: '/sheep', label: "Sheep Record", icon: ClipboardList },
    { href: '/ledger', label: "Farm Ledger", icon: BookOpen },
    { href: '/health', label: "Health Portal", icon: Heart },
    { href: '/weight', label: "Growth Audit", icon: Scale },
    { href: '/calculator', label: "Nutrition Calc", icon: Calculator },
  ];

  const adminMenu = [
    { href: '/dashboard/analysis', label: "Neural Audit", icon: Zap },
    { href: '/dashboard/balance-sheet', label: "Debit & Credit", icon: Landmark },
    { href: '/dashboard/monthly-ledger', label: "Personal Finance", icon: ReceiptIndianRupee },
  ];

  return (
    <Sidebar collapsible="icon" className="border-none shadow-2xl bg-[#005f4b] text-white w-[260px]">
      <SidebarHeader className="h-32 flex flex-col justify-center px-8 border-b border-white/5">
        <h1 className="text-2xl font-[800] tracking-tight leading-none text-white">Mpr Farms</h1>
        <p className="text-[10px] font-bold tracking-[0.2em] text-[#b0d4cc] uppercase mt-2">Enterprise Hub</p>
      </SidebarHeader>
      
      <SidebarContent className="px-4 py-8 no-scrollbar space-y-8">
        {/* PUBLIC OPERATIONS GROUP */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-[#b0d4cc]/40 text-[9px] font-black uppercase tracking-[0.3em] mb-4 px-5">Field Operations</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="gap-1.5">
              {publicMenu.map((item) => {
                const isActive = pathname === item.href;
                const Icon = item.icon;
                return (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton asChild isActive={isActive} tooltip={item.label} className={cn("h-11 px-5 rounded-[30px] transition-all duration-200", isActive ? "bg-white/10 text-white font-black shadow-lg" : "text-[#b0d4cc] hover:text-white hover:bg-white/5")}>
                      <Link href={item.href} className="flex items-center w-full">
                        <Icon className={cn("h-[18px] w-[18px] stroke-[2.5px]", isActive ? "text-[#14d5c7]" : "text-[#b0d4cc]")} />
                        <span className="ml-3 text-[13px] font-semibold tracking-wide group-data-[collapsible=icon]:hidden">{item.label}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* PRIVATE AUDIT GROUP (STEALTH) */}
        {isAdmin && (
          <SidebarGroup>
            <SidebarGroupLabel className="text-[#b0d4cc]/40 text-[9px] font-black uppercase tracking-[0.3em] mb-4 px-5">Enterprise Audit</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu className="gap-1.5">
                {adminMenu.map((item) => {
                  const isActive = pathname === item.href;
                  const Icon = item.icon;
                  return (
                    <SidebarMenuItem key={item.href}>
                      <SidebarMenuButton asChild isActive={isActive} tooltip={item.label} className={cn("h-11 px-5 rounded-[30px] transition-all duration-200", isActive ? "bg-[#14d5c7]/20 text-white font-black shadow-lg" : "text-[#b0d4cc] hover:text-white hover:bg-white/5")}>
                        <Link href={item.href} className="flex items-center w-full">
                          <Icon className={cn("h-[18px] w-[18px] stroke-[2.5px]", isActive ? "text-[#14d5c7]" : "text-[#b0d4cc]")} />
                          <span className="ml-3 text-[13px] font-semibold tracking-wide group-data-[collapsible=icon]:hidden">{item.label}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}

        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={pathname === '/help'} tooltip="Stealth Setup" className={cn("h-11 px-5 rounded-[30px] transition-all duration-200", pathname === '/help' ? "bg-white/10 text-white font-black" : "text-[#b0d4cc] hover:text-white hover:bg-white/5")}>
                  <Link href="/help" className="flex items-center w-full">
                    <ShieldCheck className="h-[18px] w-[18px] stroke-[2.5px]" />
                    <span className="ml-3 text-[13px] font-semibold tracking-wide group-data-[collapsible=icon]:hidden">Stealth & Setup</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-8 border-t border-white/5 bg-black/5">
        <div className="flex items-center gap-3 opacity-40 group-data-[collapsible=icon]:justify-center">
          <ShieldCheck className="h-4 w-4 text-[#b0d4cc]" />
          <p className="text-[9px] font-black tracking-widest uppercase text-[#b0d4cc] group-data-[collapsible=icon]:hidden">Secure v7.0</p>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
