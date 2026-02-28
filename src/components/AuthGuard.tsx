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

  // 1. Initial mount to prevent hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  // 2. Auth state handling and Profile Initialization
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

    // Proactively initialize or verify user role
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
            displayName: user.displayName,
            role: 'collaborator',
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          });
        } else {
          const data = snap.data();
          if (data && data.role !== 'collaborator') {
            await updateDoc(userRef, { 
              role: 'collaborator',
              updatedAt: serverTimestamp() 
            });
          }
        }
      } catch (e) {
        console.warn("User profile check error:", e);
      } finally {
        setIsInitializingUser(false);
      }
    };

    initUser();
  }, [mounted, isUserLoading, user, pathname, router, firestore]);

  // Essential static shell for hydration safety
  if (!mounted) {
    return <div className="flex h-screen w-full items-center justify-center bg-background" />;
  }

  // Gate the app until auth and profile are confirmed
  const isAuthChecking = isUserLoading || isInitializingUser || (user && publicPaths.includes(pathname)) || (!user && !publicPaths.includes(pathname));
  
  if (isAuthChecking) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          <p className="text-[10px] font-black tracking-[0.3em] text-muted-foreground animate-pulse uppercase">Authenticating shepherd...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
