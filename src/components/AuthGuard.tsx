'use client';

import { useUser, useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { doc, serverTimestamp, setDoc, updateDoc } from 'firebase/firestore';
import type { UserProfile } from '@/lib/types';

const publicPaths = ['/login'];

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const pathname = usePathname();
  const router = useRouter();

  // Stable profile reference for the real-time role listener
  const profileRef = useMemoFirebase(() => (firestore && user) ? doc(firestore, 'users', user.uid) : null, [firestore, user]);
  const { data: profile, isLoading: isProfileLoading } = useDoc<UserProfile>(profileRef);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Proactive profile initialization and role verification
  useEffect(() => {
    if (!mounted || isUserLoading || isProfileLoading || !firestore || !user) return;

    const syncProfile = async () => {
      const userRef = doc(firestore, 'users', user.uid);
      if (!profile) {
        // Automatically create the shepherd profile if missing
        try {
          await setDoc(userRef, {
            id: user.uid,
            email: user.email,
            displayName: user.displayName || 'Shepherd',
            role: 'collaborator',
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          });
        } catch (e) {
          console.error("Critical: Failed to initialize shepherd profile", e);
        }
      } else if (!profile.role) {
        // Repair missing role field immediately to unlock collaborative data
        try {
          await updateDoc(userRef, { 
            role: 'collaborator',
            updatedAt: serverTimestamp() 
          });
        } catch (e) {
          console.error("Critical: Failed to update shepherd role", e);
        }
      }
    };

    syncProfile();
  }, [mounted, isUserLoading, isProfileLoading, user, profile, firestore]);

  useEffect(() => {
    if (mounted && !isUserLoading && !user && !publicPaths.includes(pathname)) {
      router.push('/login');
    }
    if (mounted && user && publicPaths.includes(pathname)) {
      router.push('/dashboard');
    }
  }, [mounted, isUserLoading, user, pathname, router]);

  if (!mounted) return <div className="flex h-screen w-full items-center justify-center bg-background" />;

  const isAuthChecking = isUserLoading || (user && !profile && isProfileLoading) || (user && publicPaths.includes(pathname)) || (!user && !publicPaths.includes(pathname));
  
  if (isAuthChecking) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-6">
          <div className="relative">
            <div className="w-12 h-12 border-4 border-primary/20 rounded-full"></div>
            <div className="absolute top-0 w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          </div>
          <div className="flex flex-col items-center gap-2">
            <p className="text-[10px] font-black tracking-[0.3em] text-primary uppercase animate-pulse">Syncing Farm Data</p>
            <p className="text-[8px] font-bold text-muted-foreground/60 uppercase tracking-widest">Verifying Shepherd Identity...</p>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
