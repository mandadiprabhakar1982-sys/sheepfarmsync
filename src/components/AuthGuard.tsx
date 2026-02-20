'use client';

import { useUser, useFirestore, setDocumentNonBlocking } from '@/firebase';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import { doc } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';

const publicPaths = ['/login'];

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (isUserLoading) {
      return;
    }

    // If a user object exists, handle logic for new users and routing
    if (user) {
      // On first sign-in, create a user document in Firestore
      if (user.metadata.creationTime === user.metadata.lastSignInTime) {
        const userDocRef = doc(firestore, `users/${user.uid}`);
        setDocumentNonBlocking(userDocRef, { email: user.email, createdAt: new Date() }, {});
        toast({
            title: 'Welcome!',
            description: 'Your account has been created.',
        });
      }

      // If user is on a public page, redirect them to the dashboard
      if (publicPaths.includes(pathname)) {
        router.push('/dashboard');
        return;
      }
    } else {
      // If no user and not on a public page, redirect to login
      if (!publicPaths.includes(pathname)) {
        router.push('/login');
        return;
      }
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
