'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { 
  LayoutGrid, 
  Users, 
  IndianRupee, 
  Menu 
} from 'lucide-react';
import { useSidebar } from '@/components/ui/sidebar';

/**
 * @fileOverview Native-style bottom navigation for mobile devices.
 * Matches the design from the requested screenshot.
 */
export function MobileNav() {
  const pathname = usePathname();
  const { toggleSidebar } = useSidebar();

  const links = [
    { href: '/dashboard/overview', label: 'Dashboard', icon: LayoutGrid },
    { href: '/dashboard/livestock', label: 'Flock', icon: Users },
    { href: '/dashboard/monthly-ledger', label: 'Finance', icon: IndianRupee },
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-[100] bg-white/95 backdrop-blur-3xl border-t border-slate-100 shadow-[0_-8px_30px_rgba(0,0,0,0.04)] px-2">
      <div className="flex items-center justify-between h-16 max-w-lg mx-auto">
        {links.map((link) => {
          const isActive = pathname === link.href;
          return (
            <Link 
              key={link.href} 
              href={link.href}
              className={cn(
                "flex flex-col items-center justify-center flex-1 gap-1 transition-all active:scale-90 h-full",
                isActive ? "text-[#f59e0b]" : "text-slate-400"
              )}
            >
              <div className="p-1 rounded-xl">
                <link.icon className={cn("h-5 w-5", isActive ? "stroke-[2.5px]" : "stroke-[2px]")} />
              </div>
              <span className={cn(
                "text-[9px] font-black uppercase tracking-tight leading-none",
                isActive ? "opacity-100" : "opacity-60"
              )}>
                {link.label}
              </span>
            </Link>
          );
        })}
        
        {/* Menu Toggle */}
        <button 
          onClick={(e) => {
            e.preventDefault();
            toggleSidebar();
          }}
          className="flex flex-col items-center justify-center flex-1 gap-1 text-slate-400 active:scale-90 h-full"
        >
          <div className="p-1 rounded-xl">
            <Menu className="h-5 w-5 stroke-[2px]" />
          </div>
          <span className="text-[9px] font-black uppercase tracking-tight leading-none opacity-60">Menu</span>
        </button>
      </div>
      
      {/* Bottom spacer for iOS Home Indicator */}
      <div className="h-[env(safe-area-inset-bottom)]" />
    </div>
  );
}
