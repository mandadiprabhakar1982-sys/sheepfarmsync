'use client';

import { useUser, useFirestore } from '@/firebase';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState, useRef } from 'react';
import { doc, getDoc, setDoc, serverTimestamp, updateDoc } from 'firebase/firestore';

const publicPaths = ['/login'];

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);
  const initializationRef = useRef(false);
  const [isInitializingUser, setIsInitializingUser] = useState(false);
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted || isUserLoading) return;

    if (!user) {
      if (!publicPaths.includes(pathname)) {
        router.push('/login');
      }
      return;
    }

    if (publicPaths.includes(pathname)) {
      router.push('/dashboard');
    }

    const initUser = async () => {
      if (!firestore || !user || initializationRef.current) return;
      
      initializationRef.current = true;
      setIsInitializingUser(true);
      
      const userRef = doc(firestore, 'users', user.uid);
      try {
        const snap = await getDoc(userRef);
        if (!snap.exists()) {
          await setDoc(userRef, {
            id: user.uid,
            email: user.email,
            displayName: user.displayName || 'Farmer',
            role: 'collaborator',
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          });
        } else {
          const data = snap.data();
          if (!data.role || data.role !== 'collaborator') {
            await updateDoc(userRef, { 
              role: 'collaborator',
              updatedAt: serverTimestamp() 
            });
          }
        }
      } catch (e) {
        console.error("Critical: Failed to initialize shepherd role:", e);
      } finally {
        // We delay finishing initialization slightly to ensure Firestore replication
        setTimeout(() => setIsInitializingUser(false), 500);
      }
    };

    initUser();
  }, [mounted, isUserLoading, user, pathname, router, firestore]);

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
            <p className="text-[8px] font-bold text-muted-foreground/60 uppercase tracking-widest">Establishing Secure Connection...</p>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
