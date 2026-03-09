'use client';

import { useUser, useFirestore, useDoc } from '@/firebase';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState, useMemo } from 'react';
import { doc, serverTimestamp, setDoc, updateDoc } from 'firebase/firestore';
import type { UserProfile } from '@/lib/types';

const publicPaths = ['/login'];

/**
 * STRATEGIC ACCESS CONTROL:
 * Add your email to this list to maintain Admin access.
 * All other users will default to 'collaborator'.
 */
const ADMIN_EMAILS = [
  'mprabhakar99@gmail.com',
  'admin@syncpro.com',
  'user@example.com',
  'developer@syncpro.com',
];

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);
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
      
      // Determine role based on whitelist (case-insensitive)
      const userEmail = (user.email || '').toLowerCase();
      const assignedRole = ADMIN_EMAILS.some(email => email.toLowerCase() === userEmail) ? 'admin' : 'collaborator';

      if (!isProfileLoading && !profile) {
        try {
          // Provision new user identity
          await setDoc(userRef, {
            id: user.uid,
            email: user.email,
            displayName: user.displayName || 'Shepherd',
            role: assignedRole, 
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          }, { merge: true });
        } catch (e) {
          console.error("Identity provisioning error:", e);
        }
      } else if (!isProfileLoading && profile && profile.role !== assignedRole) {
        // Update role if whitelist status has changed
        try {
          await updateDoc(userRef, { 
            role: assignedRole,
            updatedAt: serverTimestamp() 
          });
        } catch (e) {
          console.error("Access protection sweep failed:", e);
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
    if (user && publicPaths.includes(pathname)) {
      router.push('/dashboard');
    }
  }, [mounted, isUserLoading, user, pathname, router]);

  if (!mounted) return null;

  const isAuthChecking = isUserLoading || (user && !profile && isProfileLoading);
  
  if (isAuthChecking) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-6">
          <div className="relative">
            <div className="w-12 h-12 border-4 border-primary/20 rounded-full"></div>
            <div className="absolute top-0 w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          </div>
          <p className="text-[10px] font-black tracking-[0.3em] text-primary uppercase animate-pulse">Verifying Identity</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
