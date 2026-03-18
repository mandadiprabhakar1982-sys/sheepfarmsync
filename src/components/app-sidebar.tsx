'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutGrid,
  ClipboardList,
  BookOpen,
  ShoppingCart,
  ArrowUpCircle,
  Infinity,
  Calculator,
  Heart,
  Wallet,
  FileText,
  ShieldCheck
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
} from '@/components/ui/sidebar';
import { cn } from '@/lib/utils';
import { useFarm } from '@/context/FarmContext';

/**
 * @fileOverview High-Fidelity Enterprise Sidebar.
 * Implements the 10-node navigation suite from the user model.
 */
export function AppSidebar() {
  const pathname = usePathname();
  const { userRole } = useFarm();

  const menu = [
    { href: '/dashboard', label: "Dashboard", icon: LayoutGrid },
    { href: '/dashboard/livestock', label: "Sheep Record", icon: ClipboardList },
    { href: '/dashboard/farm-ledger', label: "Farm Ledger", icon: BookOpen },
    { href: '/dashboard/purchase', label: "Sheep Buying", icon: ShoppingCart },
    { href: '/dashboard/feed', label: "Fodder & Feed", icon: ArrowUpCircle },
    { href: '/dashboard/labor', label: "Labour & Staff", icon: Infinity },
    { href: '/dashboard/feed-calculator', label: "Calculator", icon: Calculator },
    { href: '/dashboard/medicine', label: "Health Alerts", icon: Heart },
    { href: '/dashboard/monthly-ledger', label: "Personal Finance", icon: Wallet },
    { href: '/dashboard/balance-sheet', label: "Debit & Credit", icon: FileText },
  ];

  return (
    <Sidebar collapsible="icon" className="border-none shadow-2xl bg-[#005f4b] text-white w-[260px]">
      <SidebarHeader className="h-32 flex flex-col justify-center px-8 border-b border-white/5">
        <h1 className="text-2xl font-[800] tracking-tight leading-none text-white">Mpr Farms</h1>
        <p className="text-[10px] font-bold tracking-[0.2em] text-[#b0d4cc] uppercase mt-2">Enterprise Hub</p>
      </SidebarHeader>

      <SidebarContent className="px-4 py-8 no-scrollbar">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu className="gap-1.5">
              {menu.map((item) => {
                // Precise path matching for active state
                const isActive = item.href === '/dashboard' 
                  ? pathname === '/dashboard' 
                  : pathname.startsWith(item.href);
                  
                const Icon = item.icon;
                return (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive}
                      tooltip={item.label}
                      className={cn(
                        "h-11 px-5 rounded-[30px] transition-all duration-200",
                        isActive 
                          ? "bg-white/10 text-white font-black" 
                          : "text-[#b0d4cc] hover:text-white hover:bg-white/5"
                      )}
                    >
                      <Link href={item.href} className="flex items-center w-full">
                        <Icon className={cn("h-[18px] w-[18px] stroke-[2.5px]", isActive ? "text-white" : "text-[#b0d4cc]")} />
                        <span className="ml-3 text-[13px] font-semibold tracking-wide group-data-[collapsible=icon]:hidden">{item.label}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-8 border-t border-white/5 bg-black/5">
        <div className="flex items-center gap-3 opacity-40 group-data-[collapsible=icon]:justify-center">
          <ShieldCheck className="h-4 w-4 text-[#b0d4cc]" />
          <p className="text-[9px] font-black tracking-widest uppercase text-[#b0d4cc] group-data-[collapsible=icon]:hidden">Secure v5.2</p>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
