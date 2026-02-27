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

const groups = [
  {
    label: "Main",
    links: [
      { href: '/dashboard', label: 'Home', icon: Home },
      { href: '/dashboard/overview', label: 'Stats Overview', icon: LayoutDashboard },
      { href: '/dashboard/analysis', label: 'AI Intelligence', icon: BarChart },
    ]
  },
  {
    label: "Inventory",
    links: [
      { href: '/dashboard/livestock', label: 'Flock Records', icon: ListChecks },
      { href: '/dashboard/purchase', label: 'Purchases', icon: Package },
      { href: '/dashboard/sales', label: 'Revenue/Sales', icon: BadgeIndianRupee },
      { href: '/dashboard/mortality', label: 'Loss Log', icon: Skull },
    ]
  },
  {
    label: "Operations",
    links: [
      { href: '/dashboard/medicine', label: 'Health & Medical', icon: Syringe },
      { href: '/dashboard/feed', label: 'Feed & Nutrition', icon: Wheat },
      { href: '/dashboard/labor', label: 'Staff/Labor', icon: Users },
      { href: '/dashboard/expenses', label: 'Misc Expenses', icon: Receipt },
    ]
  },
  {
    label: "Ecosystem",
    links: [
      { href: '/dashboard/feed-calculator', label: 'Calculators', icon: Calculator },
      { href: '/dashboard/marketplace', label: 'Marketplace', icon: Globe },
      { href: '/dashboard/help', label: 'App Install', icon: Smartphone },
    ]
  }
];

export function AppSidebar() {
  const pathname = usePathname();

  return (
    <Sidebar collapsible="icon" className="border-r border-sidebar-border">
      <SidebarHeader className="h-20 flex items-center justify-center border-b border-sidebar-border px-6 bg-sidebar">
        <Logo showManager={false} light={false} />
      </SidebarHeader>
      <SidebarContent className="px-3 py-6 bg-sidebar">
        {groups.map((group) => (
          <SidebarGroup key={group.label} className="mb-6">
            <SidebarGroupLabel className="text-[10px] font-black uppercase tracking-[0.2em] text-sidebar-foreground/40 mb-3 px-3">
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
        ))}
      </SidebarContent>
      <SidebarFooter className="border-t border-sidebar-border p-6 bg-sidebar">
        <div className="flex flex-col items-center gap-1 opacity-40">
          <p className="text-[9px] font-black uppercase tracking-[0.3em] text-sidebar-foreground">SheepSync Pro</p>
          <p className="text-[7px] font-bold text-sidebar-foreground">Enterprise v2.4.0</p>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}