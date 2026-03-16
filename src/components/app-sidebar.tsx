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
  Package
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
        { href: '/dashboard/analysis', label: "AI Farm Report", icon: BarChart },
      ]
    },
    {
      label: "Private Accounts",
      adminOnly: true,
      links: [
        { href: '/dashboard/monthly-ledger', label: "Personal Finance", icon: Wallet },
        { href: '/dashboard/balance-sheet', label: "Debt & Loans", icon: BookOpen },
      ]
    },
    {
      label: "Farm Cost Audit",
      links: [
        { href: '/dashboard/farm-ledger', label: "Farm Ledger", icon: IconFarmCost },
        { href: '/dashboard/purchase', label: "Sheep Buying", icon: Package },
        { href: '/dashboard/feed', label: "Fodder & Feed", icon: Wheat },
        { href: '/dashboard/medicine', label: "Medical & Health", icon: Syringe },
        { href: '/dashboard/labor', label: "Labour & Staff", icon: Users },
        { href: '/dashboard/expenses', label: "Other Expenses", icon: Receipt },
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
        { href: '/dashboard/livestock', label: "Sheep List", icon: LayoutGrid },
        { href: '/dashboard/sales', label: "Selling Ledger", icon: ArrowRightLeft },
        { href: '/dashboard/mortality', label: "Death Log", icon: Skull },
      ]
    }
  ], []); 

  return (
    <Sidebar collapsible="icon" className="border-none shadow-2xl bg-sidebar text-white w-[240px]">
      <SidebarHeader className="h-32 flex flex-col items-center justify-center px-10 mb-4 border-b border-white/10">
        <div className="flex flex-col items-center gap-3 select-none group">
          <div className="bg-white/20 p-3 rounded-xl shadow-xl border border-white/10 group-hover:scale-110 transition-transform duration-500">
            <Sparkles className="h-6 w-6 text-white" />
          </div>
          <div className="text-center group-data-[collapsible=icon]:hidden">
            <h1 className="text-xl font-black leading-none tracking-tighter text-white">
              Mpr <span className="text-white/60">Farms</span>
            </h1>
            <p className="text-[8px] font-black tracking-[0.4em] text-white/40 mt-1.5 uppercase leading-none">Enterprise</p>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent className="px-4 no-scrollbar bg-transparent">
        {groups.map((group, gIdx) => {
          if (group.adminOnly && !isAdmin) return null;

          return (
            <SidebarGroup key={gIdx} className="mb-6">
              <SidebarGroupLabel className="text-[9px] font-black uppercase tracking-[0.3em] text-white/40 mb-4 px-4 flex items-center gap-2 group-data-[collapsible=icon]:hidden">
                <div className="h-1.5 w-1.5 rounded-full bg-white/20" />
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
                            "h-11 px-4 rounded-lg transition-all duration-300",
                            isActive 
                              ? "bg-sidebar-accent text-white shadow-lg font-black" 
                              : "text-white/70 hover:bg-white/10 hover:text-white"
                          )}
                        >
                          <Link href={link.href} className="flex items-center justify-between w-full">
                            <div className="flex items-center">
                              <link.icon className={cn("h-4.5 w-4.5", isActive ? "text-white" : "opacity-40")} />
                              <span className="ml-3 text-[12px] font-bold tracking-tight group-data-[collapsible=icon]:hidden">{link.label}</span>
                            </div>
                            {isActive && <ChevronRight className="h-3 w-3 text-white group-data-[collapsible=icon]:hidden" />}
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

      <SidebarFooter className="p-8 border-t border-white/10 bg-black/10 group-data-[collapsible=icon]:p-4">
        <div className="flex items-center gap-3">
          <ShieldCheck className="h-4 w-4 text-white/40" />
          <p className="text-[9px] font-black tracking-[0.3em] text-white/20 uppercase leading-none group-data-[collapsible=icon]:hidden">Mpr v5.0</p>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
