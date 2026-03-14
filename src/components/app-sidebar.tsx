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
    <Sidebar collapsible="icon" className="border-r border-white/40 bg-white/20 backdrop-blur-3xl">
      <SidebarHeader className="h-20 flex items-center justify-center border-b border-white/40 px-6">
        <Logo showManager={false} light={false} className="scale-90" />
      </SidebarHeader>
      <SidebarContent className="px-3 py-6">
        {groups.map((group) => {
          if (group.adminOnly && !isAdmin) return null;

          return (
            <SidebarGroup key={group.label} className="mb-4">
              <SidebarGroupLabel className="text-[10px] font-black uppercase tracking-[0.2em] text-neutral-500/60 mb-2 px-3">
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
                            "transition-all duration-300 h-10 px-3 rounded-xl",
                            isActive 
                              ? "bg-white text-neutral-900 shadow-md border border-white/60" 
                              : "text-neutral-500 hover:bg-white/40 hover:text-neutral-900"
                          )}
                        >
                          <Link href={link.href} className="flex items-center w-full">
                            <link.icon className={cn("shrink-0 h-4 w-4", isActive ? "text-emerald-600" : "opacity-70")} />
                            <span className="ml-3 font-bold text-[12px] tracking-tight">{link.label}</span>
                            {isActive && <ChevronRight className="ml-auto h-3 w-3 text-neutral-300" />}
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
      <SidebarFooter className="border-t border-white/40 p-6 opacity-40">
        <div className="flex flex-col items-center gap-1">
          <p className="text-[9px] font-black uppercase tracking-[0.4em] text-neutral-900">Sync Pro</p>
          <p className="text-[7px] font-bold text-neutral-500 uppercase tracking-widest">Enterprise v2.8</p>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
