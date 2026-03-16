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
import { LogOut, Settings, Bell, MessageSquare, ChevronDown } from 'lucide-react';
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
    <div className="flex items-center gap-4">
      {/* HEADER ACTIONS - Matching Reference Image */}
      <div className="hidden md:flex items-center gap-2 border-r pr-4 border-slate-100">
        <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full relative">
          <Bell className="h-4 w-4 text-slate-400" />
          <div className="absolute top-2.5 right-2.5 h-2 w-2 bg-rose-500 rounded-full border-2 border-white" />
        </Button>
        <Button variant="ghost" className="h-9 gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 px-3">
          <Settings className="h-4 w-4" />
          Account Settings
        </Button>
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="relative flex items-center gap-3 h-10 px-0 hover:bg-transparent group">
            <div className="flex flex-col items-end text-right">
              <span className="text-[11px] font-black tracking-tight text-[#2F4F4F] leading-none">
                {user?.displayName || 'Prabhakar'}
              </span>
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                {profile?.role || 'Admin'}
              </span>
            </div>
            <Avatar className="h-9 w-9 border-2 border-white shadow-md">
              <AvatarImage src={userAvatar?.imageUrl} alt="User avatar" />
              <AvatarFallback className="bg-primary text-white font-black">
                {(user?.displayName?.[0] || 'P').toUpperCase()}
              </AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56 rounded-xl shadow-2xl border-none p-2 mt-2" align="end">
          <DropdownMenuLabel className="p-4 bg-slate-50 rounded-lg mb-2">
            <p className="text-[10px] font-black uppercase text-[#2F4F4F] truncate">{user?.email}</p>
          </DropdownMenuLabel>
          <DropdownMenuSeparator className="bg-slate-100" />
          <DropdownMenuGroup>
            <DropdownMenuItem className="rounded-lg h-9 cursor-pointer focus:bg-slate-50">
              <Settings className="mr-3 h-4 w-4 text-slate-400" />
              <span className="text-[11px] font-bold text-slate-700">Preferences</span>
            </DropdownMenuItem>
          </DropdownMenuGroup>
          <DropdownMenuSeparator className="bg-slate-100" />
          <DropdownMenuItem onClick={handleLogout} className="rounded-lg h-9 cursor-pointer text-rose-600 focus:bg-rose-50">
              <LogOut className="mr-3 h-4 w-4" />
              <span className="text-[11px] font-black uppercase tracking-widest">Logout</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}