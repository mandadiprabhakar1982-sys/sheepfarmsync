'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { 
  LayoutDashboard,
  Users, 
  BarChart3,
  LayoutGrid,
  Wallet
} from 'lucide-react';

/**
 * @fileOverview Final Precision Mobile Navigation Dock.
 * Implements the Safe iPhone Fix and follows the locked 80px height protocol.
 */
export function MobileNav() {
  const pathname = usePathname();

  const navItems = [
    { href: '/dashboard/overview', label: 'DASHBOARD', icon: LayoutDashboard },
    { href: '/dashboard/livestock', label: 'SHEEP', icon: Users },
    { href: '/dashboard/farm-ledger', label: 'REPORTS', icon: BarChart3 },
    { href: '/dashboard/monthly-ledger', label: 'FINANCE', icon: Wallet },
    { href: '/dashboard', label: 'MENU', icon: LayoutGrid },
  ];

  return (
    <div 
      className="fixed bottom-0 left-0 right-0 max-w-md mx-auto h-20 bg-[#081122]/95 backdrop-blur-xl border-t border-white/10 flex justify-around items-center z-50 rounded-t-3xl"
      style={{ 
        height: 'calc(80px + env(safe-area-inset-bottom))',
        paddingBottom: 'env(safe-area-inset-bottom)'
      }}
    >
      <div className="flex items-center justify-between w-full h-full px-4">
        {navItems.map((item, index) => {
          const Icon = item.icon;
          const isActive = item.href === '/dashboard' 
            ? pathname === '/dashboard' 
            : pathname.startsWith(item.href);
            
          return (
            <Link 
              key={index} 
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center gap-1.5 transition-all active:scale-90 flex-1 h-full relative",
                isActive ? "text-[#14d5c7]" : "text-white/30"
              )}
            >
              <div className={cn(
                "relative p-2 rounded-2xl transition-all",
                isActive ? "bg-[#14d5c7]/10" : ""
              )}>
                <Icon className={cn("h-6 w-6", isActive ? "stroke-[2.5px]" : "stroke-[2px]")} />
              </div>
              <span className={cn(
                "text-[8px] font-black tracking-[0.15em] uppercase leading-none",
                isActive ? "opacity-100" : "opacity-40"
              )}>
                {item.label}
              </span>
              {isActive && (
                <div className="absolute bottom-2 w-6 h-0.5 bg-[#14d5c7] rounded-full shadow-[0_0_10px_#14d5c7]" />
              )}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
