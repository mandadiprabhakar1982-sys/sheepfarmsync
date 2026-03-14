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
  Wheat,
  Globe,
  Settings
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
    <Sidebar collapsible="none" className="sidebar !bg-[#f7fbf3] border-r border-[#dbe7d1]">
      <SidebarHeader className="h-20 flex items-center px-6 border-b border-[#dbe7d1]/50 mb-4">
        <Logo className="scale-100" />
      </SidebarHeader>

      <SidebarContent className="px-4 py-4 no-scrollbar">
        {groups.map((group, gIdx) => {
          if (group.adminOnly && !isAdmin) return null;

          return (
            <SidebarGroup key={gIdx} className="mb-8">
              <SidebarGroupLabel className="text-[10px] font-black uppercase tracking-[0.25em] text-[#365314]/40 mb-4 px-2">
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
                            "transition-all duration-300 h-12 px-4 group/btn",
                            isActive 
                              ? "sidebar-active-menu shadow-sm" 
                              : "text-[#365314]/60 hover:bg-white/80 hover:text-[#16a34a]"
                          )}
                        >
                          <Link href={link.href} className="flex items-center w-full">
                            <link.icon className={cn("shrink-0 h-4.5 w-4.5 transition-colors", isActive ? "text-[#166534]" : "opacity-60 group-hover/btn:text-[#16a34a]")} />
                            <span className="ml-4 text-[13px] font-bold tracking-tight">{link.label}</span>
                            <ChevronRight className={cn("ml-auto h-3.5 w-3.5 opacity-20 transition-all", isActive && "opacity-100 translate-x-1")} />
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
        <div className="flex items-center gap-4">
          <div className="h-11 w-11 rounded-2xl bg-[#365314] flex items-center justify-center text-white text-[14px] font-black shadow-xl">
            N
          </div>
          <div className="flex flex-col min-w-0">
            <p className="text-[12px] font-black uppercase tracking-widest text-[#365314] leading-none truncate">SYNC PRO</p>
            <p className="text-[9px] font-bold text-[#65a30d] mt-1.5 uppercase tracking-tighter opacity-60">Example 1990</p>
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}