'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Home,
  LayoutDashboard,
  BarChart,
  BookOpen,
  Wallet,
  ArrowRightLeft,
  LayoutGrid,
  Skull,
  Users,
  Receipt,
  Syringe,
  Wheat,
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
      <SidebarHeader className="h-20 flex items-center px-8 border-b border-white/10 mb-6">
        <Logo />
      </SidebarHeader>

      <SidebarContent className="px-4 no-scrollbar">
        {groups.map((group, gIdx) => {
          if (group.adminOnly && !isAdmin) return null;

          return (
            <SidebarGroup key={gIdx} className="mb-10">
              <SidebarGroupLabel className="text-[10px] font-black uppercase tracking-[0.25em] text-[#1A1A1A]/40 mb-4 px-4">
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
                            "h-11 px-4 rounded-xl transition-all duration-200",
                            isActive 
                              ? "bg-[#16242F] text-white shadow-xl" 
                              : "text-[#1A1A1A]/60 hover:bg-white/40 hover:text-[#16242F]"
                          )}
                        >
                          <Link href={link.href} className="flex items-center">
                            <link.icon className={cn("h-4 w-4", isActive ? "text-white" : "opacity-40")} />
                            <span className="ml-3 text-[12px] font-bold">{link.label}</span>
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

      <SidebarFooter className="p-8">
        <div className="flex flex-col gap-1 opacity-20">
          <p className="text-[9px] font-black uppercase tracking-widest text-[#1A1A1A]">SYNC PRO</p>
          <p className="text-[8px] font-bold text-[#1A1A1A] uppercase tracking-tighter">Prefageur v2.5.0</p>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}