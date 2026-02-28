
'use client';

import { useUser, useFirestore, setDocumentNonBlocking } from '@/firebase';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import { doc, getDoc } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';

const publicPaths = ['/login'];

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (isUserLoading || !user) {
      if (!isUserLoading && !publicPaths.includes(pathname)) {
        router.push('/login');
      }
      return;
    }

    // Proactive Permission Check: Ensure user document and role exist
    const verifyUserRole = async () => {
      const userDocRef = doc(firestore, `users/${user.uid}`);
      try {
        const userSnap = await getDoc(userDocRef);
        
        // If the document doesn't exist or is missing the role, initialize/update it
        if (!userSnap.exists() || !userSnap.data()?.role) {
          setDocumentNonBlocking(userDocRef, { 
            email: user.email, 
            role: 'collaborator',
            updatedAt: new Date()
          }, { merge: true });
          
          toast({
            title: 'Permissions Verified',
            description: 'Your collaborative shepherd access has been enabled.',
          });
        }
      } catch (error) {
        console.error("Error verifying user role:", error);
      }
    };

    verifyUserRole();

    // If user is on a public page, redirect them to the dashboard
    if (publicPaths.includes(pathname)) {
      router.push('/dashboard');
    }
  }, [isUserLoading, user, pathname, router, firestore, toast]);

  // Show a loader while auth state is loading or a redirect is pending
  if (isUserLoading || (user && publicPaths.includes(pathname)) || (!user && !publicPaths.includes(pathname))) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Render the page content if no loading or redirection is needed
  return <>{children}</>;
}
