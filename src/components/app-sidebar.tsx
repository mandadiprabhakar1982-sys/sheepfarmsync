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
  Receipt
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
      ]
    },
    {
      label: "OPERATIONS & STAFF",
      links: [
        { href: '/dashboard/labor', label: "Labor", icon: Users },
      ]
    }
  ], []); 

  return (
    <Sidebar collapsible="icon" className="border-r border-neutral-100 bg-white shadow-sm">
      <SidebarHeader className="h-20 flex items-center px-6">
        <Logo showManager={false} className="scale-100" />
      </SidebarHeader>

      <SidebarContent className="px-3 py-4">
        {groups.map((group, gIdx) => {
          if (group.adminOnly && !isAdmin) return null;

          return (
            <SidebarGroup key={gIdx} className="mb-6">
              <SidebarGroupLabel className="text-[9px] font-black uppercase tracking-[0.15em] text-neutral-400 mb-2 px-3">
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
                            "transition-all duration-200 h-10 px-3 rounded-lg",
                            isActive 
                              ? "bg-[#eef2ff] text-blue-600 font-bold shadow-sm" 
                              : "text-neutral-500 hover:bg-neutral-50 hover:text-neutral-900"
                          )}
                        >
                          <Link href={link.href} className="flex items-center w-full">
                            <link.icon className={cn("shrink-0 h-4 w-4", isActive ? "text-blue-600" : "opacity-60")} />
                            <span className="ml-3 text-[12px] tracking-tight">{link.label}</span>
                            {isActive && <ChevronRight className="ml-auto h-3.5 w-3.5 text-blue-400" />}
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

      <SidebarFooter className="p-4 border-t border-neutral-50">
        <div className="flex items-center gap-3 px-2">
          <div className="h-8 w-8 rounded-full bg-neutral-900 flex items-center justify-center text-white text-[10px] font-black">
            N
          </div>
          <div className="flex flex-col">
            <p className="text-[10px] font-black uppercase tracking-widest text-neutral-900 leading-none">SYNC PRO</p>
            <p className="text-[8px] font-medium text-neutral-400 mt-1">Energies 1090</p>
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}