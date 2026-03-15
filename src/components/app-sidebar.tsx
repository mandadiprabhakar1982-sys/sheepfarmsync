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
  Smartphone
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
      label: "HOME",
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
        { href: '/dashboard/monthly-ledger', label: "Monthly Balance Sheet", icon: Wallet },
        { href: '/dashboard/balance-sheet', label: "Liability Portfolio", icon: BookOpen },
      ]
    },
    {
      label: "OPERATIONS & STAFF",
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
      label: "CORE REGISTRIES",
      links: [
        { href: '/dashboard/livestock', label: "Livestock Hub", icon: LayoutGrid },
        { href: '/dashboard/sales', label: "Trade Ledger", icon: ArrowRightLeft },
        { href: '/dashboard/mortality', label: "Loss Log", icon: Skull },
        { href: '/dashboard/expenses', label: "Expenses", icon: Receipt },
      ]
    }
  ], []); 

  return (
    <Sidebar collapsible="none" className="sidebar border-none shadow-2xl">
      <SidebarHeader className="h-24 flex items-center px-10 mb-2">
        <div className="flex items-center gap-3 select-none group">
          <div className="bg-primary p-2.5 rounded-xl shadow-lg">
            <Sparkles className="h-5 w-5 text-white" />
          </div>
          <h1 className="text-xl font-black leading-none uppercase tracking-tight text-neutral-900">
            SYNC <span className="text-primary">PRO</span>
          </h1>
        </div>
      </SidebarHeader>

      <SidebarContent className="px-6 no-scrollbar bg-transparent">
        {groups.map((group, gIdx) => {
          if (group.adminOnly && !isAdmin) return null;

          return (
            <SidebarGroup key={gIdx} className="mb-6">
              <SidebarGroupLabel className="text-[10px] font-black uppercase tracking-[0.3em] text-neutral-900 mb-4 px-4">
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
                          className={cn(
                            "h-12 px-4 rounded-xl transition-all duration-300",
                            isActive 
                              ? "bg-white text-primary shadow-xl scale-[1.02] font-black" 
                              : "text-neutral-600 hover:bg-white/50 hover:text-neutral-900"
                          )}
                        >
                          <Link href={link.href} className="flex items-center justify-between w-full">
                            <div className="flex items-center">
                              <link.icon className={cn("h-5 w-5", isActive ? "text-primary" : "opacity-60")} />
                              <span className="ml-4 text-[14px] font-bold tracking-tight">{link.label}</span>
                            </div>
                            {isActive && <ChevronRight className="h-3 w-3 text-primary" />}
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

      <SidebarFooter className="p-10 opacity-20 bg-transparent">
        <p className="text-[12px] font-black tracking-[0.4em] text-neutral-900 uppercase">SYNC PRO v4.5</p>
      </SidebarFooter>
    </Sidebar>
  );
}