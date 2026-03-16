'use client';

import { useUser, useFirestore, useDoc } from '@/firebase';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState, useMemo } from 'react';
import { doc, serverTimestamp, setDoc, updateDoc } from 'firebase/firestore';
import type { UserProfile } from '@/lib/types';

const publicPaths = ['/login'];

/**
 * EXCLUSIVE ACCESS CONTROL:
 * Only mprabhakar99@gmail.com is granted the authority to assume the 'admin' role.
 */
const ADMIN_EMAILS = [
  'mprabhakar99@gmail.com',
];

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);
  const [isProvisioning, setIsProvisioning] = useState(false);
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const pathname = usePathname();
  const router = useRouter();

  const profileRef = useMemo(() => {
    if (!firestore || !user) return null;
    return doc(firestore, 'users', user.uid);
  }, [firestore, user]);

  const { data: profile, isLoading: isProfileLoading } = useDoc<UserProfile>(profileRef);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted || isUserLoading || !firestore || !user) return;

    const syncProfile = async () => {
      const userRef = doc(firestore, 'users', user.uid);
      const userEmail = (user.email || '').toLowerCase();
      const isWhitelisted = ADMIN_EMAILS.some(email => email.toLowerCase() === userEmail);
      
      if (!isProfileLoading && !profile && !isProvisioning) {
        setIsProvisioning(true);
        try {
          await setDoc(userRef, {
            id: user.uid,
            email: user.email,
            displayName: user.displayName || 'Shepherd',
            role: isWhitelisted ? 'admin' : 'collaborator', 
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          }, { merge: true });
        } catch (e) {
          console.error("Identity provisioning error:", e);
        } finally {
          setIsProvisioning(false);
        }
      } else if (!isProfileLoading && profile) {
        // SECURITY PROTOCOL:
        // Automatically elevate whitelisted users if they are not yet admin
        if (isWhitelisted && profile.role !== 'admin') {
          try {
            await updateDoc(userRef, { 
              role: 'admin',
              updatedAt: serverTimestamp() 
            });
          } catch (e) {
            console.error("Administrative elevation failed:", e);
          }
        }
        // Force non-whitelisted users to NOT be admin
        if (!isWhitelisted && profile.role === 'admin') {
          try {
            await updateDoc(userRef, { 
              role: 'collaborator',
              updatedAt: serverTimestamp() 
            });
          } catch (e) {
            console.error("Access protection sweep failed:", e);
          }
        }
      }
    };

    syncProfile();
  }, [mounted, isUserLoading, isProfileLoading, user, profile, firestore, isProvisioning]);

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

  if (!mounted) return null;

  // Resilient loading check
  const isAuthChecking = isUserLoading || (user && isProfileLoading && !profile && !isProvisioning);
  
  if (isAuthChecking && !publicPaths.includes(pathname)) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background fixed inset-0 z-[9999]">
        <div className="flex flex-col items-center gap-6">
          <div className="relative">
            <div className="w-12 h-12 border-4 border-primary/20 rounded-full"></div>
            <div className="absolute top-0 w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          </div>
          <div className="flex flex-col items-center gap-2">
            <p className="text-[10px] font-black tracking-[0.3em] text-primary uppercase animate-pulse">Establishing Secure Identity</p>
            <p className="text-[8px] font-bold text-muted-foreground/40 uppercase tracking-widest">Applying Stealth Protocol...</p>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
