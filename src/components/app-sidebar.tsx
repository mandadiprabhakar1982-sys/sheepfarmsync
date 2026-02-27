
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
import { Logo, SheepIcon } from '@/components/logo';

const mainLinks = [
  { href: '/dashboard', label: 'Home', icon: Home },
  { href: '/dashboard/overview', label: 'Overview', icon: LayoutDashboard },
  { href: '/dashboard/analysis', label: 'AI Reports', icon: BarChart },
];

const farmLinks = [
  { href: '/dashboard/livestock', label: 'Flock Log', icon: ListChecks },
  { href: '/dashboard/purchase', label: 'Purchases', icon: Package },
  { href: '/dashboard/sales', label: 'Sales', icon: BadgeIndianRupee },
  { href: '/dashboard/mortality', label: 'Mortality', icon: Skull },
];

const operationsLinks = [
  { href: '/dashboard/medicine', label: 'Health & Meds', icon: Syringe },
  { href: '/dashboard/feed', label: 'Feed Inventory', icon: Wheat },
  { href: '/dashboard/labor', label: 'Labor/Staff', icon: Users },
  { href: '/dashboard/expenses', label: 'Misc Expenses', icon: Receipt },
];

const toolsLinks = [
  { href: '/dashboard/feed-calculator', label: 'Calculator', icon: Calculator },
  { href: '/dashboard/marketplace', label: 'Marketplace', icon: Globe },
];

export function AppSidebar() {
  const pathname = usePathname();

  return (
    <Sidebar collapsible="icon" className="border-r">
      <SidebarHeader className="h-20 flex items-center justify-center border-b">
        <Logo className="px-2" showManager={false} />
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarMenu>
            {mainLinks.map((link) => (
              <SidebarMenuItem key={link.href}>
                <SidebarMenuButton
                  asChild
                  isActive={pathname === link.href}
                  tooltip={link.label}
                  className={pathname === link.href ? "bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground" : ""}
                >
                  <Link href={link.href}>
                    <link.icon />
                    <span>{link.label}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Farm Management</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {farmLinks.map((link) => (
                <SidebarMenuItem key={link.href}>
                  <SidebarMenuButton
                    asChild
                    isActive={pathname === link.href}
                    tooltip={link.label}
                    className={pathname === link.href ? "bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground" : ""}
                  >
                    <Link href={link.href}>
                      <link.icon />
                      <span>{link.label}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Operations</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {operationsLinks.map((link) => (
                <SidebarMenuItem key={link.href}>
                  <SidebarMenuButton
                    asChild
                    isActive={pathname === link.href}
                    tooltip={link.label}
                    className={pathname === link.href ? "bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground" : ""}
                  >
                    <Link href={link.href}>
                      <link.icon />
                      <span>{link.label}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Community & Tools</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {toolsLinks.map((link) => (
                <SidebarMenuItem key={link.href}>
                  <SidebarMenuButton
                    asChild
                    isActive={pathname === link.href}
                    tooltip={link.label}
                    className={pathname === link.href ? "bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground" : ""}
                  >
                    <Link href={link.href}>
                      <link.icon />
                      <span>{link.label}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="border-t p-4 text-[10px] text-muted-foreground text-center uppercase tracking-widest font-bold">
        SheepSync v2.0
      </SidebarFooter>
    </Sidebar>
  );
}
