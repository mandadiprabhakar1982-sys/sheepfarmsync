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
        console.warn("User profile initialization error:", e);
      } finally {
        setIsInitializingUser(false);
      }
    };

    initUser();
  }, [mounted, isUserLoading, user, pathname, router, firestore]);

  // Essential for hydration safety
  if (!mounted) {
    return <div className="flex h-screen w-full items-center justify-center bg-background" />;
  }

  const isAuthChecking = isUserLoading || isInitializingUser || (user && publicPaths.includes(pathname)) || (!user && !publicPaths.includes(pathname));
  
  if (isAuthChecking) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="text-xs font-bold tracking-widest text-muted-foreground animate-pulse uppercase">Authenticating Shepherd...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
