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
      className="fixed bottom-0 left-0 right-0 max-w-md mx-auto h-20 bg-[#081122]/95 backdrop-blur-xl border-t border-white/10 flex justify-around items-center z-50 rounded-t-3xl shadow-2xl"
      style={{ 
        height: 'calc(80px + env(safe-area-inset-bottom))',
        paddingBottom: 'env(safe-area-inset-bottom)'
      }}
    >
      <div className="flex items-center justify-between w-full h-20 px-4">
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
                "flex flex-col items-center justify-center gap-1 transition-all active:scale-90 flex-1 h-full",
                isActive ? "text-[#14d5c7]" : "text-white/30"
              )}
            >
              <div className={cn(
                "relative p-1.5 rounded-xl transition-all",
                isActive ? "bg-[#14d5c7]/10" : ""
              )}>
                <Icon className={cn("h-5 w-5", isActive ? "stroke-[2.5px]" : "stroke-[2px]")} />
                {isActive && <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-0.5 bg-[#14d5c7] rounded-full shadow-[0_0_10px_#14d5c7]" />}
              </div>
              <span className={cn(
                "text-[7px] font-black tracking-widest uppercase leading-none",
                isActive ? "opacity-100" : "opacity-40"
              )}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
