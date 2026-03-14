'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Home,
  LayoutDashboard,
  HeartPulse,
  Wheat,
  Users,
  Receipt,
  Skull,
  BarChart,
  ListChecks,
  ChevronRight,
  BookOpen,
  Wallet,
  ArrowRightLeft,
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
      label: "",
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
        { href: '/dashboard/livestock', label: "Livestock Hub", icon: ListChecks },
        { href: '/dashboard/sales', label: "Purchases & Sales", icon: ArrowRightLeft },
        { href: '/dashboard/mortality', label: "Loss Log", icon: Skull },
        { href: '/dashboard/expenses', label: "Expenses", icon: Receipt },
      ]
    },
    {
      label: "OPERATIONS & STAFF",
      links: [
        { href: '/dashboard/medicine', label: "Health", icon: HeartPulse },
        { href: '/dashboard/feed', label: "Feed", icon: Wheat },
        { href: '/dashboard/labor', label: "Labor", icon: Users },
      ]
    }
  ], []); 

  return (
    <Sidebar collapsible="icon" className="border-r border-neutral-200 bg-white shadow-sm">
      <SidebarHeader className="h-20 flex items-center justify-center px-6">
        <Logo showManager={false} light={false} className="scale-90" />
      </SidebarHeader>
      <SidebarContent className="px-3 py-6">
        {groups.map((group, gIdx) => {
          if (group.adminOnly && !isAdmin) return null;

          return (
            <SidebarGroup key={gIdx} className="mb-6">
              {group.label && (
                <SidebarGroupLabel className="text-[10px] font-black uppercase tracking-[0.15em] text-neutral-400 mb-3 px-3">
                  {group.label}
                </SidebarGroupLabel>
              )}
              <SidebarGroupContent>
                <SidebarMenu>
                  {group.links.map((link) => {
                    const isActive = pathname === link.href;
                    return (
                      <SidebarMenuItem key={link.href}>
                        <SidebarMenuButton
                          asChild
                          isActive={isActive}
                          tooltip={link.label}
                          className={cn(
                            "transition-all duration-200 h-11 px-3 rounded-xl",
                            isActive 
                              ? "bg-blue-50 text-blue-600 font-bold" 
                              : "text-neutral-500 hover:bg-neutral-50 hover:text-neutral-900"
                          )}
                        >
                          <Link href={link.href} className="flex items-center w-full">
                            <link.icon className={cn("shrink-0 h-4.5 w-4.5", isActive ? "text-blue-600" : "opacity-60")} />
                            <span className="ml-3 text-[13px] tracking-tight">{link.label}</span>
                            {isActive && <ChevronRight className="ml-auto h-3 w-3 text-blue-200" />}
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
      <SidebarFooter className="p-6 opacity-30 border-t border-neutral-100">
        <div className="flex flex-col items-center gap-1">
          <p className="text-[8px] font-black text-neutral-500 uppercase tracking-widest">Enterprise v2.8</p>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
