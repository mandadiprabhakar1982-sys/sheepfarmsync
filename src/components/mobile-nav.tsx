
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { 
  Home as HomeIcon,
  Users, 
  LayoutPanelLeft,
  Menu
} from 'lucide-react';
import { useSidebar } from '@/components/ui/sidebar';

/**
 * @fileOverview Native-style bottom navigation matching FarmAudit reference.
 * Replaces "More" with "Menu" to trigger the main navigation drawer on mobile.
 */
export function MobileNav() {
  const pathname = usePathname();
  const { setOpenMobile } = useSidebar();

  const navItems = [
    { href: '/dashboard', label: 'Dashboard', icon: HomeIcon, type: 'link' as const },
    { href: '/dashboard/livestock', label: 'Sheep Records', icon: Users, type: 'link' as const },
    { href: '/dashboard/farm-ledger', label: 'Reports', icon: LayoutPanelLeft, type: 'link' as const },
    { label: 'Menu', icon: Menu, type: 'button' as const, onClick: () => setOpenMobile(true) },
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-[100] bg-white border-t border-[#D9D9D9] shadow-[0_-4px_12px_rgba(0,0,0,0.04)] px-2">
      <div className="flex items-center justify-between h-16 max-w-lg mx-auto">
        {navItems.map((item, index) => {
          const Icon = item.icon;
          
          if (item.type === 'link') {
            const isActive = item.href === '/dashboard' 
              ? pathname === '/dashboard' 
              : pathname.startsWith(item.href!);
              
            return (
              <Link 
                key={index} 
                href={item.href!}
                className={cn(
                  "flex flex-col items-center justify-center flex-1 gap-1 transition-all active:scale-90 h-full",
                  isActive ? "text-[#0FA5A0]" : "text-slate-400"
                )}
              >
                <div className="p-1">
                  <Icon className={cn("h-5 w-5", isActive ? "stroke-[2.5px]" : "stroke-[2px]")} />
                </div>
                <span className={cn(
                  "text-[9px] font-bold tracking-tight leading-none",
                  isActive ? "text-[#0FA5A0]" : "text-slate-400"
                )}>
                  {item.label}
                </span>
              </Link>
            );
          }

          // Render tactical button for Menu trigger
          return (
            <button 
              key={index} 
              onClick={item.onClick}
              className="flex flex-col items-center justify-center flex-1 gap-1 transition-all active:scale-90 h-full text-slate-400"
            >
              <div className="p-1">
                <Icon className="h-5 w-5 stroke-[2px]" />
              </div>
              <span className="text-[9px] font-bold tracking-tight leading-none">
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
      
      {/* Bottom spacer for iOS Home Indicator */}
      <div className="h-[env(safe-area-inset-bottom)]" />
    </div>
  );
}
