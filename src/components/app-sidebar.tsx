
'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Home,
  LayoutDashboard,
  Package,
  Syringe,
  Wheat,
  Users,
  BadgeIndianRupee,
  Globe,
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
  ShoppingBag
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
      label: t('home'),
      links: [
        { href: '/dashboard', label: t('home'), icon: Home },
        { href: '/dashboard/overview', label: t('overview'), icon: LayoutDashboard },
        { href: '/dashboard/analysis', label: t('intelligence'), icon: BarChart },
      ]
    },
    {
      label: t('private_suite'),
      adminOnly: true,
      links: [
        { href: '/dashboard/monthly-ledger', label: t('ledger'), icon: Wallet },
        { href: '/dashboard/balance-sheet', label: t('liabilities'), icon: BookOpen },
      ]
    },
    {
      label: t('public_suite'),
      links: [
        { href: '/dashboard/livestock', label: "Livestock Hub", icon: ListChecks },
        { href: '/dashboard/sales', label: t('sales'), icon: BadgeIndianRupee },
        { href: '/dashboard/mortality', label: t('mortality'), icon: Skull },
        { href: '/dashboard/expenses', label: t('expenses'), icon: Receipt },
      ]
    },
    {
      label: t('ops_suite'),
      links: [
        { href: '/dashboard/labor', label: t('labor'), icon: Users },
        { href: '/dashboard/medicine', label: t('health'), icon: Syringe },
        { href: '/dashboard/feed', label: t('feed'), icon: Wheat },
      ]
    },
    {
      label: t('ecosystem'),
      links: [
        { href: '/dashboard/feed-calculator', label: t('calculator'), icon: Calculator },
        { href: '/dashboard/marketplace', label: t('marketplace'), icon: Globe },
        { href: '/dashboard/help', label: t('install'), icon: Smartphone },
      ]
    }
  ], [t, isAdmin]); 

  return (
    <Sidebar collapsible="icon" className="border-r border-sidebar-border">
      <SidebarHeader className="h-20 flex items-center justify-center border-b border-sidebar-border px-6 bg-sidebar">
        <Logo showManager={false} light={false} />
      </SidebarHeader>
      <SidebarContent className="px-3 py-6 bg-sidebar">
        {groups.map((group) => {
          if (group.adminOnly && !isAdmin) return null;

          return (
            <SidebarGroup key={group.label} className="mb-6">
              <SidebarGroupLabel className="text-[10px] font-black uppercase tracking-[0.2em] text-sidebar-foreground/40 mb-3 px-3 flex items-center gap-2">
                {group.adminOnly && <ShieldAlert className="h-2.5 w-2.5 text-emerald-600" />}
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
                            "transition-all duration-200 h-11 px-3 rounded-xl",
                            isActive 
                              ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20 hover:bg-primary/90" 
                              : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                          )}
                        >
                          <Link href={link.href} className="flex items-center w-full">
                            <link.icon className={cn("shrink-0 h-5 w-5", isActive ? "scale-105" : "opacity-70")} />
                            <span className="ml-3 font-bold text-[13px] tracking-tight">{link.label}</span>
                            {isActive && <ChevronRight className="ml-auto h-3 w-3 opacity-50" />}
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
      <SidebarFooter className="border-t border-sidebar-border p-6 bg-sidebar">
        <div className="flex flex-col items-center gap-1 opacity-40">
          <p className="text-[9px] font-black uppercase tracking-[0.3em] text-sidebar-foreground">Sync Pro</p>
          <p className="text-[7px] font-bold text-sidebar-foreground">Enterprise v2.6.0</p>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
