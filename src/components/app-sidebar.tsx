'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Home,
  LayoutDashboard,
  Syringe,
  Wheat,
  Users,
  Receipt,
  Skull,
  BarChart,
  Calculator,
  ListChecks,
  Smartphone,
  ChevronRight,
  BookOpen,
  Wallet,
  ShieldAlert,
  ArrowRightLeft,
  Globe
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
import { useLanguage } from '@/context/LanguageContext';

export function AppSidebar() {
  const pathname = usePathname();
  const { userRole } = useFarm();
  const { t } = useLanguage();
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
        { href: '/dashboard/livestock', label: "Livestock Hub", icon: ListChecks },
        { href: '/dashboard/sales', label: "Purchases & Sales", icon: ArrowRightLeft },
        { href: '/dashboard/mortality', label: "Loss Log", icon: Skull },
        { href: '/dashboard/expenses', label: "Expenses", icon: Receipt },
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
        { href: '/dashboard/help', label: "Install", icon: Smartphone },
      ]
    }
  ], []); 

  return (
    <Sidebar collapsible="icon" className="border-r border-white/5 bg-[#0a0a0a] text-white">
      <SidebarHeader className="h-20 flex items-center justify-center border-b border-white/5 px-6">
        <Logo showManager={false} light={true} className="scale-90" />
      </SidebarHeader>
      <SidebarContent className="px-3 py-6 bg-transparent">
        {groups.map((group) => {
          if (group.adminOnly && !isAdmin) return null;

          return (
            <SidebarGroup key={group.label} className="mb-6">
              <SidebarGroupLabel className="text-[10px] font-black uppercase tracking-[0.25em] text-white/30 mb-3 px-3 flex items-center gap-2">
                {group.label}
              </SidebarGroupLabel>
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
                            "transition-all duration-300 h-11 px-3 rounded-2xl",
                            isActive 
                              ? "bg-white/10 text-white shadow-xl border border-white/10" 
                              : "text-white/50 hover:bg-white/5 hover:text-white"
                          )}
                        >
                          <Link href={link.href} className="flex items-center w-full">
                            <link.icon className={cn("shrink-0 h-5 w-5", isActive ? "text-emerald-400" : "opacity-70")} />
                            <span className="ml-3 font-bold text-[13px] tracking-tight">{link.label}</span>
                            {isActive && <div className="ml-auto w-1 h-1 bg-emerald-400 rounded-full" />}
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
      <SidebarFooter className="border-t border-white/5 p-6 opacity-30">
        <div className="flex flex-col items-center gap-1">
          <p className="text-[9px] font-black uppercase tracking-[0.4em]">Sync Pro</p>
          <p className="text-[7px] font-bold">Enterprise v2.8.0</p>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
