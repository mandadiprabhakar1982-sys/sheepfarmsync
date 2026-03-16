'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { 
  Home as HomeIcon,
  Users, 
  LayoutPanelLeft,
  MoreHorizontal
} from 'lucide-react';

/**
 * @fileOverview Native-style bottom navigation matching FarmAudit reference.
 */
export function MobileNav() {
  const pathname = usePathname();

  const links = [
    { href: '/dashboard', label: 'Dashboard', icon: HomeIcon },
    { href: '/dashboard/livestock', label: 'Sheep Records', icon: Users },
    { href: '/dashboard/farm-ledger', label: 'Reports', icon: LayoutPanelLeft },
    { href: '/dashboard/help', label: 'More', icon: MoreHorizontal },
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-[100] bg-white border-t border-[#D9D9D9] shadow-[0_-4px_12px_rgba(0,0,0,0.04)] px-2">
      <div className="flex items-center justify-between h-16 max-w-lg mx-auto">
        {links.map((link) => {
          const isActive = link.href === '/dashboard' 
            ? pathname === '/dashboard' 
            : pathname.startsWith(link.href);
            
          return (
            <Link 
              key={link.href} 
              href={link.href}
              className={cn(
                "flex flex-col items-center justify-center flex-1 gap-1 transition-all active:scale-90 h-full",
                isActive ? "text-[#0FA5A0]" : "text-slate-400"
              )}
            >
              <div className="p-1">
                <link.icon className={cn("h-5 w-5", isActive ? "stroke-[2.5px]" : "stroke-[2px]")} />
              </div>
              <span className={cn(
                "text-[9px] font-bold tracking-tight leading-none",
                isActive ? "text-[#0FA5A0]" : "text-slate-400"
              )}>
                {link.label}
              </span>
            </Link>
          );
        })}
      </div>
      
      {/* Bottom spacer for iOS Home Indicator */}
      <div className="h-[env(safe-area-inset-bottom)]" />
    </div>
  );
}
