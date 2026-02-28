'use client';

import { useUser, useFirestore } from '@/firebase';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import { doc, getDoc, setDoc, serverTimestamp, updateDoc } from 'firebase/firestore';

const publicPaths = ['/login'];

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (isUserLoading) return;

    if (!user) {
      if (!publicPaths.includes(pathname)) {
        router.push('/login');
      }
      return;
    }

    // Ensure user document exists with collaborator role for merged view
    const initUser = async () => {
      const userRef = doc(firestore, 'users', user.uid);
      try {
        const snap = await getDoc(userRef);
        if (!snap.exists()) {
          await setDoc(userRef, {
            email: user.email,
            displayName: user.displayName,
            role: 'collaborator',
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          });
        } else {
          // If the user exists but doesn't have the role, set it
          const data = snap.data();
          if (data && !data.role) {
            await updateDoc(userRef, { 
              role: 'collaborator',
              updatedAt: serverTimestamp() 
            });
          }
        }
      } catch (e) {
        console.error("Error initializing user:", e);
      }
    };

    initUser();

    if (publicPaths.includes(pathname)) {
      router.push('/dashboard');
    }
  }, [isUserLoading, user, pathname, router, firestore]);

  if (isUserLoading || (user && publicPaths.includes(pathname)) || (!user && !publicPaths.includes(pathname))) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-xs font-bold tracking-widest text-muted-foreground animate-pulse uppercase">Authenticating Shepherd...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}