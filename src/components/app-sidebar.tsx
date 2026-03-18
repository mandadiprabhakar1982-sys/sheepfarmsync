'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  ClipboardList,
  BookOpen,
  ShoppingCart,
  LayoutGrid,
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

export function AppSidebar() {
  const pathname = usePathname();
  const { userRole } = useFarm();
  const isAdmin = userRole === 'admin';

  const menu = [
    { href: '/dashboard/overview', label: "Dashboard", icon: LayoutGrid },
    { href: '/dashboard/livestock', label: "Sheep Record", icon: ClipboardList },
    { href: '/dashboard/farm-ledger', label: "Farm Ledger", icon: BookOpen },
    { href: '/dashboard/purchase', label: "Sheep Buying", icon: ShoppingCart },
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
            <SidebarMenu className="gap-2">
              {menu.map((item) => {
                const isActive = pathname === item.href;
                const Icon = item.icon;
                return (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive}
                      tooltip={item.label}
                      className={cn(
                        "h-12 px-5 rounded-[30px] transition-all duration-200",
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
