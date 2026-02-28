'use client';

import { useUser, useFirestore, useDoc } from '@/firebase';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState, useMemo } from 'react';
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
  const profileRef = useMemo(() => {
    if (!firestore || !user) return null;
    return doc(firestore, 'users', user.uid);
  }, [firestore, user]);

  const { data: profile, isLoading: isProfileLoading } = useDoc<UserProfile>(profileRef);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Proactive profile initialization and role verification
  useEffect(() => {
    if (!mounted || isUserLoading || !firestore || !user) return;

    const syncProfile = async () => {
      const userRef = doc(firestore, 'users', user.uid);
      
      // If profile is missing completely, initialize it
      if (!isProfileLoading && !profile) {
        try {
          await setDoc(userRef, {
            id: user.uid,
            email: user.email,
            displayName: user.displayName || 'Shepherd',
            role: 'collaborator',
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          }, { merge: true });
        } catch (e) {
          console.error("Failed to initialize shepherd profile", e);
        }
      } 
      // If profile exists but role is missing, repair it
      else if (!isProfileLoading && profile && !profile.role) {
        try {
          await updateDoc(userRef, { 
            role: 'collaborator',
            updatedAt: serverTimestamp() 
          });
        } catch (e) {
          console.error("Failed to update shepherd role", e);
        }
      }
    };

    syncProfile();
  }, [mounted, isUserLoading, isProfileLoading, user, profile, firestore]);

  useEffect(() => {
    if (!mounted || isUserLoading) return;

    const isPublic = publicPaths.includes(pathname);
    if (!user && !isPublic) {
      router.push('/login');
    }
    if (user && isPublic) {
      router.push('/dashboard');
    }
  }, [mounted, isUserLoading, user, pathname, router]);

  // Handle SSR and Hydration
  if (!mounted) {
    return null;
  }

  const isAuthChecking = isUserLoading || (user && !profile && isProfileLoading);
  
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