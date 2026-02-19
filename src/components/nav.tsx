'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  BrainCircuit,
  LayoutDashboard,
  Syringe,
  Tractor,
  TrendingUp,
  Users,
  Wheat,
} from 'lucide-react';

import { cn } from '@/lib/utils';
import {
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from '@/components/ui/sidebar';

const links = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/dashboard/livestock', label: 'Livestock', icon: Tractor },
  { href: '/dashboard/medicine', label: 'Medicine', icon: Syringe },
  { href: '/dashboard/feed', label: 'Feed', icon: Wheat },
  { href: '/dashboard/labor', label: 'Labor', icon: Users },
  { href: '/dashboard/sales', label: 'Sales', icon: TrendingUp },
  { href: '/dashboard/analysis', label: 'AI Analysis', icon: BrainCircuit },
];

export function Nav() {
  const pathname = usePathname();

  return (
    <SidebarMenu>
      {links.map((link) => (
        <SidebarMenuItem key={link.href}>
          <SidebarMenuButton
            asChild
            isActive={pathname === link.href}
            className={cn(
              'justify-start',
              pathname === link.href && 'bg-accent text-accent-foreground'
            )}
          >
            <Link href={link.href}>
              <link.icon className="mr-2 h-4 w-4" />
              <span>{link.label}</span>
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>
      ))}
    </SidebarMenu>
  );
}
