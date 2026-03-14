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
        { href: '/dashboard/medicine', label: "Health", icon: Syringe },
        { href: '/dashboard/feed', label: "Feed", icon: Wheat },
        { href: '/dashboard/labor', label: "Labor", icon: Users },
      ]
    }
  ], []); 

  return (
    <Sidebar collapsible="none" className="border-r border-[#4caf50]/20 bg-[#dcfce7]/40 backdrop-blur-xl">
      <SidebarHeader className="h-20 flex items-center px-6">
        <Logo className="scale-100" />
      </SidebarHeader>

      <SidebarContent className="px-4 py-4 no-scrollbar">
        {groups.map((group, gIdx) => {
          if (group.adminOnly && !isAdmin) return null;

          return (
            <SidebarGroup key={gIdx} className="mb-6">
              <SidebarGroupLabel className="text-[10px] font-black uppercase tracking-[0.1em] text-[#14532d]/60 mb-3 px-2">
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
                            "transition-all duration-300 h-11 px-3 rounded-xl",
                            isActive 
                              ? "bg-white text-[#16a34a] font-black shadow-sm" 
                              : "text-neutral-500 hover:bg-white/50 hover:text-[#16a34a]"
                          )}
                        >
                          <Link href={link.href} className="flex items-center w-full">
                            <link.icon className={cn("shrink-0 h-4 w-4", isActive ? "text-[#16a34a]" : "opacity-60")} />
                            <span className="ml-3 text-[13px] font-bold tracking-tight">{link.label}</span>
                            {isActive && <ChevronRight className="ml-auto h-3.5 w-3.5 text-neutral-300" />}
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

      <SidebarFooter className="p-6 border-t border-[#4caf50]/20">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-[#14532d] flex items-center justify-center text-white text-[12px] font-black shadow-lg">
            N
          </div>
          <div className="flex flex-col">
            <p className="text-[11px] font-black uppercase tracking-widest text-[#14532d] leading-none">SYNC PRO</p>
            <p className="text-[9px] font-bold text-[#4caf50] mt-1 uppercase tracking-tighter">Energies v4.2</p>
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}