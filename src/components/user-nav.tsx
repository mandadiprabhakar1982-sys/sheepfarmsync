'use client';

import { useMemo } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { LogOut, Settings, ChevronDown } from 'lucide-react';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { useAuth, useUser, useFirestore, useDoc } from '@/firebase';
import { signOut } from 'firebase/auth';
import { doc } from 'firebase/firestore';
import type { UserProfile } from '@/lib/types';

export function UserNav() {
  const userAvatar = PlaceHolderImages.find((img) => img.id === 'user-avatar');
  const auth = useAuth();
  const { user } = useUser();
  const firestore = useFirestore();
  
  const userDocRef = useMemo(() => {
    if (!user || !firestore) return null;
    return doc(firestore, 'users', user.uid);
  }, [user, firestore]);

  const { data: profile } = useDoc<UserProfile>(userDocRef);

  const handleLogout = () => {
    signOut(auth!);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative flex items-center gap-4 h-12 px-0 hover:bg-transparent group">
          <div className="flex flex-col items-end text-right">
            <span className="text-[12px] font-black tracking-tight text-white leading-none">
              {user?.displayName || 'Prabhakar'}
            </span>
            <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest mt-1">
              {profile?.role || 'ADMIN'}
            </span>
          </div>
          <div className="relative">
            <Avatar className="h-10 w-10 border-2 border-white/10 shadow-xl">
              <AvatarImage src={userAvatar?.imageUrl} alt="User avatar" />
              <AvatarFallback className="bg-slate-700 text-white font-black">
                {(user?.displayName?.[0] || 'P').toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="absolute -bottom-0.5 -right-0.5 h-3 w-3 bg-[#4ADE80] border-2 border-[#1e293b] rounded-full" />
          </div>
          <ChevronDown className="h-3 w-3 text-white/20 group-hover:text-white transition-opacity" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56 rounded-2xl shadow-2xl border-none p-2 mt-2" align="end" forceMount>
        <DropdownMenuLabel className="p-4 bg-neutral-50 rounded-xl mb-2">
          <div className="flex flex-col space-y-1">
            <p className="text-xs font-black uppercase text-neutral-900 truncate">
              {user?.email}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator className="bg-neutral-100" />
        <DropdownMenuGroup className="space-y-1">
          <DropdownMenuItem className="rounded-lg h-10 cursor-pointer focus:bg-neutral-50">
            <Settings className="mr-3 h-4 w-4 text-neutral-400" />
            <span className="text-xs font-bold text-neutral-700">Settings</span>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator className="bg-neutral-100" />
        <DropdownMenuItem onClick={handleLogout} className="rounded-lg h-10 cursor-pointer text-rose-600 focus:bg-rose-50">
            <LogOut className="mr-3 h-4 w-4" />
            <span className="text-xs font-bold uppercase tracking-widest">Logout</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}