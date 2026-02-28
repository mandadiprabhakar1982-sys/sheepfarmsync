'use client';

import { useUser, useFirestore } from '@/firebase';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { doc, getDoc, setDoc, serverTimestamp, updateDoc } from 'firebase/firestore';

const publicPaths = ['/login'];

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);
  const [isInitializingUser, setIsInitializingUser] = useState(false);
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted || isUserLoading || !firestore || !user) return;

    if (publicPaths.includes(pathname)) {
      router.push('/dashboard');
      return;
    }

    const initUser = async () => {
      const userRef = doc(firestore, 'users', user.uid);
      try {
        const snap = await getDoc(userRef);
        if (!snap.exists()) {
          setIsInitializingUser(true);
          await setDoc(userRef, {
            id: user.uid,
            email: user.email,
            displayName: user.displayName || 'Shepherd',
            role: 'collaborator',
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          });
          setIsInitializingUser(false);
        } else {
          const data = snap.data();
          if (!data.role || data.role !== 'collaborator') {
            setIsInitializingUser(true);
            await updateDoc(userRef, { 
              role: 'collaborator',
              updatedAt: serverTimestamp() 
            });
            setIsInitializingUser(false);
          }
        }
      } catch (e) {
        console.error("Critical: Failed to verify shepherd identity:", e);
      }
    };

    initUser();
  }, [mounted, isUserLoading, user, pathname, router, firestore]);

  useEffect(() => {
    if (mounted && !isUserLoading && !user && !publicPaths.includes(pathname)) {
      router.push('/login');
    }
  }, [mounted, isUserLoading, user, pathname, router]);

  if (!mounted) {
    return <div className="flex h-screen w-full items-center justify-center bg-background" />;
  }

  const isAuthChecking = isUserLoading || isInitializingUser || (user && publicPaths.includes(pathname)) || (!user && !publicPaths.includes(pathname));
  
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
