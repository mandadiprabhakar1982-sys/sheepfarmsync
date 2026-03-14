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
  ChevronRight,
  BookOpen,
  Wallet,
  ArrowRightLeft,
  LayoutGrid,
  Square
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
      icon: Square,
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
        { href: '/dashboard/medicine', label: "Health", icon: HeartPulse },
        { href: '/dashboard/feed', label: "Feed", icon: Wheat },
        { href: '/dashboard/labor', label: "Labor", icon: Users },
      ]
    }
  ], []); 

  return (
    <Sidebar collapsible="icon" className="border-none bg-transparent group-data-[side=left]:rounded-tr-[3rem]">
      <div className="absolute inset-0 bg-white/60 backdrop-blur-xl group-data-[side=left]:rounded-tr-[3rem] -z-10 shadow-2xl border-r border-white/20" />
      
      <SidebarHeader className="h-24 flex items-center justify-center px-6 mb-4 border-b border-black/5">
        <Logo showManager={false} light={false} className="scale-100" />
      </SidebarHeader>

      <SidebarContent className="px-4 py-4 scrollbar-thin">
        {groups.map((group, gIdx) => {
          if (group.adminOnly && !isAdmin) return null;
          const GroupIcon = group.icon;

          return (
            <SidebarGroup key={gIdx} className="mb-8">
              <SidebarGroupLabel className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-neutral-900/80 mb-4 px-3">
                {GroupIcon && <GroupIcon className="h-3 w-3 text-emerald-600/60" />}
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
                            "transition-all duration-300 h-12 px-4 rounded-2xl relative",
                            isActive 
                              ? "bg-white/80 shadow-md text-neutral-900 font-black ring-1 ring-black/5" 
                              : "text-neutral-500 hover:bg-black/5 hover:text-neutral-900"
                          )}
                        >
                          <Link href={link.href} className="flex items-center w-full">
                            <link.icon className={cn("shrink-0 h-5 w-5", isActive ? "text-neutral-900" : "opacity-60")} />
                            <span className="ml-4 text-[13px] tracking-tight">{link.label}</span>
                            {isActive && <ChevronRight className="ml-auto h-3.5 w-3.5 text-neutral-400" />}
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

      <SidebarFooter className="p-6 border-t border-black/5">
        <div className="flex items-center gap-4 group cursor-pointer px-2">
          <div className="h-10 w-10 rounded-full bg-neutral-900 flex items-center justify-center text-white shadow-xl ring-2 ring-white/50">
            <span className="text-xs font-black">N</span>
          </div>
          <div className="flex flex-col">
            <p className="text-[11px] font-black uppercase tracking-widest text-neutral-900 leading-none">SYNC PRO</p>
            <p className="text-[8px] font-bold text-neutral-400 uppercase tracking-widest mt-1">Enterprise v2.8</p>
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
