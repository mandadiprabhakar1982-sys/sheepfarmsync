'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  Home,
  Package,
  Syringe,
  Wheat,
  Users,
  BarChart,
  BadgeIndianRupee,
} from 'lucide-react';
import { SheepIcon } from '@/components/logo';

const links = [
  { href: '/dashboard', label: 'Home', icon: Home },
  { href: '/dashboard/livestock', label: 'Flock Tracking', icon: SheepIcon },
  { href: '/dashboard/livestock', label: 'Purchase Animals', icon: Package },
  { href: '/dashboard/medicine', label: 'Medicine Cost', icon: Syringe },
  { href: '/dashboard/feed', label: 'Feed Cost', icon: Wheat },
  { href: '/dashboard/labor', label: 'Labour Cost', icon: Users },
  { href: '/dashboard/sales', label: 'Animal Sale', icon: BadgeIndianRupee },
  { href: '/dashboard/analysis', label: 'Reports', icon: BarChart },
];

export function Nav() {
  const pathname = usePathname();

  return (
    <nav className="flex items-center gap-1">
      {links.map((link) => {
        const Icon = link.icon;
        const isActive = pathname === link.href;

        return (
          <Link
            key={link.label}
            href={link.href}
            className={cn(
              'flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors',
              'hover:text-foreground',
              isActive
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground'
            )}
          >
            <Icon className="h-4 w-4" />
            <span className="whitespace-nowrap">{link.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
