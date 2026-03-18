'use client';

import { useMemo } from 'react';
import { Bell, Settings, LogOut } from 'lucide-react';
import { useAuth, useUser, useFirestore, useDoc } from '@/firebase';
import { signOut } from 'firebase/auth';
import { doc } from 'firebase/firestore';
import type { UserProfile } from '@/lib/types';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export function UserNav() {
  const auth = useAuth();
  const { user } = useUser();
  const firestore = useFirestore();
  
  const userDocRef = useMemo(() => {
    if (!user || !firestore) return null;
    return doc(firestore, 'users', user.uid);
  }, [user, firestore]);

  const { data: profile } = useDoc<UserProfile>(userDocRef);

  const handleLogout = () => {
    if (auth) signOut(auth);
  };

  return (
    <div className="header-right">
      <div className="notification-btn">
        <Bell className="h-5 w-5" />
        <span className="notification-dot"></span>
      </div>

      <a href="#" className="account-link">
        <Settings className="h-4 w-4" /> Account Settings
      </a>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <div className="profile-section group">
            <div className="user-meta">
              <span className="user-name">{user?.displayName || 'Prabhakar'}</span>
              <span className="user-role">{(profile?.role || 'ADMIN').toUpperCase()}</span>
            </div>
            <img 
              src={user?.photoURL || `https://i.pravatar.cc/150?u=${user?.uid || 'user'}`} 
              className="user-avatar" 
              alt="User" 
            />
          </div>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56" align="end">
          <DropdownMenuLabel>My Account</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleLogout} className="text-rose-600 focus:text-rose-600 cursor-pointer">
            <LogOut className="mr-2 h-4 w-4" />
            <span>Logout System</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}