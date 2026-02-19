'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

const links = [
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/dashboard/livestock', label: 'Livestock' },
  { href: '/dashboard/medicine', label: 'Medicine' },
  { href: '/dashboard/feed', label: 'Feed' },
  { href: '/dashboard/labor', label: 'Labor' },
  { href: '/dashboard/sales', label: 'Sales' },
  { href: '/dashboard/analysis', label: 'AI Analysis' },
];

export function Nav() {
  const pathname = usePathname();

  return (
    <>
      {links.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          className={cn(
            'transition-colors hover:text-foreground',
            pathname === link.href ? 'text-foreground' : 'text-muted-foreground'
          )}
        >
          {link.label}
        </Link>
      ))}
    </>
  );
}
