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
  SidebarGroupLabel,
  SidebarGroupContent,
} from '@/components/ui/sidebar';
import { cn } from '@/lib/utils';
import { useFarm } from '@/context/FarmContext';

export function AppSidebar() {
  const pathname = usePathname();
  const { userRole } = useFarm();
  const isAdmin = userRole === 'admin';

  const groups = React.useMemo(() => [
    {
      label: "MAIN COMMAND",
      links: [
        { href: '/dashboard', label: "Dashboard Hub", icon: Home },
        { href: '/dashboard/overview', label: "Analytics Overview", icon: LayoutDashboard },
        { href: '/dashboard/analysis', label: "AI Intelligence", icon: BarChart },
      ]
    },
    {
      label: "PRIVATE ASSETS",
      adminOnly: true,
      links: [
        { href: '/dashboard/monthly-ledger', label: "Farm Ledger", icon: Wallet },
        { href: '/dashboard/balance-sheet', label: "Liability Portfolio", icon: BookOpen },
      ]
    },
    {
      label: "STAFF & CLINICAL",
      links: [
        { href: '/dashboard/labor', label: "Labor", icon: Users },
        { href: '/dashboard/medicine', label: "Health", icon: Syringe },
        { href: '/dashboard/feed', label: "Feed", icon: Wheat },
      ]
    },
    {
      label: "ECOSYSTEM",
      links: [
        { href: '/dashboard/feed-calculator', label: "Calculator", icon: Calculator },
        { href: '/dashboard/marketplace', label: "Marketplace", icon: Globe },
        { href: '/dashboard/help', label: "Install App", icon: Smartphone },
      ]
    },
    {
      label: "REGISTRIES",
      links: [
        { href: '/dashboard/livestock', label: "Livestock Hub", icon: LayoutGrid },
        { href: '/dashboard/sales', label: "Trade Ledger", icon: ArrowRightLeft },
        { href: '/dashboard/mortality', label: "Loss Log", icon: Skull },
        { href: '/dashboard/expenses', label: "Expenses", icon: Receipt },
      ]
    }
  ], []); 

  return (
    <Sidebar collapsible="icon" className="border-none shadow-2xl bg-white/80 backdrop-blur-2xl">
      <SidebarHeader className="h-32 flex flex-col items-center justify-center px-10 mb-4 border-b border-slate-100">
        <div className="flex flex-col items-center gap-3 select-none group">
          <div className="bg-primary p-3 rounded-2xl shadow-2xl border border-white/10 group-hover:scale-110 transition-transform duration-500">
            <Sparkles className="h-6 w-6 text-accent" />
          </div>
          <div className="text-center group-data-[collapsible=icon]:hidden">
            <h1 className="text-xl font-black leading-none uppercase tracking-tighter text-slate-900">
              MPR <span className="text-primary">FARMS</span>
            </h1>
            <p className="text-[8px] font-black tracking-[0.4em] text-accent mt-1.5 uppercase opacity-80 leading-none">Enterprise</p>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent className="px-6 no-scrollbar bg-transparent">
        {groups.map((group, gIdx) => {
          if (group.adminOnly && !isAdmin) return null;

          return (
            <SidebarGroup key={gIdx} className="mb-8">
              <SidebarGroupLabel className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 mb-5 px-4 flex items-center gap-2 group-data-[collapsible=icon]:hidden">
                <div className="h-1.5 w-1.5 rounded-full bg-accent opacity-40" />
                {group.label}
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu className="gap-1.5">
                  {group.links.map((link) => {
                    const isActive = pathname === link.href;
                    return (
                      <SidebarMenuItem key={link.href}>
                        <SidebarMenuButton
                          asChild
                          isActive={isActive}
                          tooltip={link.label}
                          className={cn(
                            "h-12 px-5 rounded-2xl transition-all duration-500",
                            isActive 
                              ? "bg-primary text-white shadow-[0_10px_25px_rgba(6,78,59,0.3)] scale-[1.03] font-black" 
                              : "text-slate-600 hover:bg-emerald-50 hover:text-primary"
                          )}
                        >
                          <Link href={link.href} className="flex items-center justify-between w-full">
                            <div className="flex items-center">
                              <link.icon className={cn("h-5 w-5", isActive ? "text-accent" : "opacity-40")} />
                              <span className="ml-4 text-[13px] font-bold tracking-tight uppercase group-data-[collapsible=icon]:hidden">{link.label}</span>
                            </div>
                            {isActive && <ChevronRight className="h-3 w-3 text-accent group-data-[collapsible=icon]:hidden" />}
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

      <SidebarFooter className="p-10 border-t border-slate-100 bg-white/40 group-data-[collapsible=icon]:p-4">
        <div className="flex items-center gap-3">
          <ShieldCheck className="h-4 w-4 text-emerald-600 opacity-40" />
          <p className="text-[10px] font-black tracking-[0.4em] text-slate-900 uppercase opacity-30 leading-none group-data-[collapsible=icon]:hidden">MPR v5.0</p>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
