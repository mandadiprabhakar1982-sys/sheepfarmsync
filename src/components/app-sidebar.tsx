'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Home,
  LayoutDashboard,
  BarChart,
  Wallet,
  BookOpen,
  LayoutGrid,
  ArrowRightLeft,
  Skull,
  Receipt,
  Users,
  ChevronRight,
  Sparkles,
  Syringe,
  Wheat,
  Calculator,
  Globe,
  Smartphone,
  ShieldCheck,
  Package,
  Bell,
  Settings as SettingsIcon,
  Search
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
  SidebarGroupLabel,
  SidebarGroupContent,
} from '@/components/ui/sidebar';
import { cn } from '@/lib/utils';
import { useFarm } from '@/context/FarmContext';
import { IconFarmCost } from '@/components/logo';

export function AppSidebar() {
  const pathname = usePathname();
  const { userRole } = useFarm();
  const isAdmin = userRole === 'admin';

  const groups = React.useMemo(() => [
    {
      label: "Main Control",
      links: [
        { href: '/dashboard', label: "Home", icon: Home },
        { href: '/dashboard/overview', label: "Dashboard", icon: LayoutDashboard },
        { href: '/dashboard/analysis', label: "AI Reports", icon: Sparkles },
      ]
    },
    {
      label: "Operational Audit",
      links: [
        { href: '/dashboard/livestock', label: "Sheep Records", icon: LayoutGrid },
        { href: '/dashboard/medicine', label: "Health Management", icon: Syringe },
        { href: '/dashboard/farm-ledger', label: "Farm Ledger", icon: IconFarmCost },
        { href: '/dashboard/purchase', label: "Sheep Buying", icon: Package },
        { href: '/dashboard/feed', label: "Fodder & Feed", icon: Wheat },
        { href: '/dashboard/labor', label: "Labour & Staff", icon: Users },
      ]
    },
    {
      label: "Village Ecosystem",
      links: [
        { href: '/dashboard/feed-calculator', label: "Calculator", icon: Calculator },
        { href: '/dashboard/marketplace', label: "Community Market", icon: Globe },
        { href: '/dashboard/help', label: "Install App", icon: Smartphone },
      ]
    },
    {
      label: "Records",
      links: [
        { href: '/dashboard/sales', label: "Selling Ledger", icon: ArrowRightLeft },
        { href: '/dashboard/mortality', label: "Death Log", icon: Skull },
        { href: '/dashboard/expenses', label: "Other Expenses", icon: Receipt },
      ]
    },
    {
      label: "Private Accounts",
      adminOnly: true,
      links: [
        { href: '/dashboard/monthly-ledger', label: "Personal Finance", icon: Wallet },
        { href: '/dashboard/balance-sheet', label: "Debt & Loans", icon: BookOpen },
      ]
    }
  ], []); 

  return (
    <Sidebar collapsible="icon" className="border-none shadow-2xl bg-[#0B8F8A] text-white w-[260px]">
      <SidebarHeader className="h-24 flex flex-row items-center gap-3 px-6 border-b border-white/10">
        <div className="bg-white/20 p-2.5 rounded-xl">
          <Sparkles className="h-5 w-5 text-white" />
        </div>
        <div className="group-data-[collapsible=icon]:hidden">
          <h1 className="text-lg font-black tracking-tight leading-none text-white">Mpr Farms</h1>
          <p className="text-[8px] font-bold tracking-[0.3em] text-white/40 uppercase mt-1">Enterprise Hub</p>
        </div>
      </SidebarHeader>

      <SidebarContent className="px-3 py-6 no-scrollbar">
        {groups.map((group, gIdx) => {
          if (group.adminOnly && !isAdmin) return null;

          return (
            <SidebarGroup key={gIdx} className="mb-4">
              <SidebarGroupLabel className="text-[9px] font-black uppercase tracking-[0.2em] text-white/40 mb-3 px-3 flex items-center gap-2 group-data-[collapsible=icon]:hidden">
                {group.label}
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu className="gap-1">
                  {group.links.map((link) => {
                    const isActive = pathname === link.href;
                    return (
                      <SidebarMenuItem key={link.href}>
                        <SidebarMenuButton
                          asChild
                          isActive={isActive}
                          tooltip={link.label}
                          className={cn(
                            "h-10 px-3 rounded-lg transition-all duration-200",
                            isActive 
                              ? "bg-[#146B68] text-white shadow-md font-black" 
                              : "text-white/70 hover:bg-white/5 hover:text-white"
                          )}
                        >
                          <Link href={link.href} className="flex items-center justify-between w-full">
                            <div className="flex items-center">
                              <link.icon className={cn("h-4 w-4", isActive ? "text-white" : "opacity-50")} />
                              <span className="ml-3 text-[12px] font-bold tracking-tight group-data-[collapsible=icon]:hidden">{link.label}</span>
                            </div>
                            {isActive && <div className="h-1.5 w-1.5 rounded-full bg-white group-data-[collapsible=icon]:hidden" />}
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    );
                  })}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          );
        })}
      </SidebarContent>

      <SidebarFooter className="p-6 border-t border-white/10 bg-black/5">
        <div className="flex items-center gap-3 opacity-40 group-data-[collapsible=icon]:justify-center">
          <ShieldCheck className="h-4 w-4" />
          <p className="text-[9px] font-black tracking-widest uppercase group-data-[collapsible=icon]:hidden">Secure v5.2</p>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}