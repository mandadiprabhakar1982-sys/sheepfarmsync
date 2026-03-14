'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Home,
  LayoutDashboard,
  BarChart,
  ChevronRight,
  BookOpen,
  Wallet,
  ArrowRightLeft,
  LayoutGrid,
  Skull,
  Users,
  Receipt,
  Syringe,
  Wheat
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
        { href: '/dashboard/analysis', label: "Ai Intelligence", icon: BarChart },
      ]
    },
    {
      label: "PRIVATE ASSETS",
      adminOnly: true,
      links: [
        { href: '/dashboard/monthly-ledger', label: "Monthly Ledger", icon: Wallet },
        { href: '/dashboard/balance-sheet', label: "Liabilities", icon: BookOpen },
      ]
    },
    {
      label: "OPERATIONS",
      links: [
        { href: '/dashboard/livestock', label: "Livestock Hub", icon: LayoutGrid },
        { href: '/dashboard/sales', label: "Trade Ledger", icon: ArrowRightLeft },
        { href: '/dashboard/mortality', label: "Loss Log", icon: Skull },
        { href: '/dashboard/expenses', label: "Expenses", icon: Receipt },
      ]
    },
    {
      label: "MANAGEMENT",
      links: [
        { href: '/dashboard/medicine', label: "Health", icon: Syringe },
        { href: '/dashboard/feed', label: "Feed", icon: Wheat },
        { href: '/dashboard/labor', label: "Labor", icon: Users },
      ]
    }
  ], []); 

  return (
    <Sidebar collapsible="none" className="sidebar">
      <SidebarHeader className="h-20 flex items-center px-6">
        <Logo className="scale-100" />
      </SidebarHeader>

      <SidebarContent className="px-4 py-4 no-scrollbar">
        {groups.map((group, gIdx) => {
          if (group.adminOnly && !isAdmin) return null;

          return (
            <SidebarGroup key={gIdx} className="mb-6">
              <SidebarGroupLabel className="text-[10px] font-black uppercase tracking-[0.2em] text-[#365314]/40 mb-3 px-2">
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
                            "transition-all duration-300 h-11 px-3",
                            isActive 
                              ? "active-menu font-black shadow-sm" 
                              : "text-[#365314]/60 hover:bg-white/80 hover:text-[#16a34a]"
                          )}
                        >
                          <Link href={link.href} className="flex items-center w-full">
                            <link.icon className={cn("shrink-0 h-4 w-4", isActive ? "text-[#166534]" : "opacity-60")} />
                            <span className="ml-3 text-[13px] font-bold tracking-tight">{link.label}</span>
                            <ChevronRight className={cn("ml-auto h-3.5 w-3.5 opacity-20", isActive && "opacity-40")} />
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

      <SidebarFooter className="p-6 border-t border-[#dbe7d1]">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-[#365314] flex items-center justify-center text-white text-[12px] font-black shadow-lg">
            S
          </div>
          <div className="flex flex-col">
            <p className="text-[11px] font-black uppercase tracking-widest text-[#365314] leading-none">SYNC PRO</p>
            <p className="text-[9px] font-bold text-[#65a30d] mt-1 uppercase tracking-tighter">Energies v5.0</p>
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
