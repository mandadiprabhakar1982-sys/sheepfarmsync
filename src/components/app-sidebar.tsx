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
  Calculator
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
import { Logo } from '@/components/logo';
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
        { href: '/dashboard', label: "Home", icon: Home },
        { href: '/dashboard/overview', label: "Overview", icon: LayoutDashboard },
        { href: '/dashboard/analysis', label: "AI Intelligence", icon: BarChart },
      ]
    },
    {
      label: "PRIVATE PROJECT ASSETS",
      adminOnly: true,
      links: [
        { href: '/dashboard/monthly-ledger', label: "Monthly Ledger", icon: Wallet },
        { href: '/dashboard/balance-sheet', label: "Liabilities", icon: BookOpen },
      ]
    },
    {
      label: "PUBLIC PROJECT ASSETS",
      links: [
        { href: '/dashboard/livestock', label: "Livestock Hub", icon: LayoutGrid },
        { href: '/dashboard/sales', label: "Purchases & Sales", icon: ArrowRightLeft },
        { href: '/dashboard/mortality', label: "Loss Log", icon: Skull },
        { href: '/dashboard/expenses', label: "Expenses", icon: Receipt },
        { href: '/dashboard/labor', label: "Labor", icon: Users },
      ]
    }
  ], []); 

  return (
    <Sidebar collapsible="none" className="sidebar">
      <SidebarHeader className="h-24 flex items-center px-10 mb-6">
        <Logo />
      </SidebarHeader>

      <SidebarContent className="px-6 no-scrollbar">
        {groups.map((group, gIdx) => {
          if (group.adminOnly && !isAdmin) return null;

          return (
            <SidebarGroup key={gIdx} className="mb-8">
              <SidebarGroupLabel className="text-[9px] font-black uppercase tracking-[0.3em] text-white/30 mb-4 px-4">
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
                          className={cn(
                            "h-12 px-4 rounded-xl transition-all duration-300",
                            isActive 
                              ? "bg-white/5 text-white border border-white/10 shadow-2xl" 
                              : "text-white/40 hover:bg-white/[0.03] hover:text-white"
                          )}
                        >
                          <Link href={link.href} className="flex items-center justify-between w-full">
                            <div className="flex items-center">
                              <link.icon className={cn("h-4 w-4", isActive ? "text-emerald-400" : "opacity-40")} />
                              <span className="ml-3 text-[12px] font-bold tracking-tight">{link.label}</span>
                            </div>
                            {isActive && <ChevronRight className="h-3 w-3 text-emerald-400" />}
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

      <SidebarFooter className="p-10 border-t border-white/5">
        <div className="flex flex-col gap-1 opacity-20">
          <p className="text-[14px] font-black tracking-tighter text-white">N</p>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}