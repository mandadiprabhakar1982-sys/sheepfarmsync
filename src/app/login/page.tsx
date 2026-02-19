'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { doc } from 'firebase/firestore';
import { Loader2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Logo } from '@/components/logo';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth, useFirestore, useUser } from '@/firebase';
import { initiateEmailSignIn, initiateEmailSignUp } from '@/firebase/non-blocking-login';
import { setDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { useToast } from '@/hooks/use-toast';


export default function LoginPage() {
    const auth = useAuth();
    const firestore = useFirestore();
    const router = useRouter();
    const { toast } = useToast();
    const { user, isUserLoading } = useUser();

    const [loginEmail, setLoginEmail] = useState('');
    const [loginPassword, setLoginPassword] = useState('');
    const [signupEmail, setSignupEmail] = useState('');
    const [signupPassword, setSignupPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (!isUserLoading && user) {
            // This is a new user if creation time and last sign in time are the same.
            if (user.metadata.creationTime === user.metadata.lastSignInTime) {
                const userDocRef = doc(firestore, `users/${user.uid}`);
                setDocumentNonBlocking(userDocRef, { email: user.email, createdAt: new Date() }, {});
                toast({
                    title: 'Welcome!',
                    description: 'Your account has been created.',
                });
            }
            router.push('/dashboard');
        }
    }, [user, isUserLoading, firestore, router, toast]);

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        initiateEmailSignIn(auth, loginEmail, loginPassword)
            .catch(() => {
                // On failure, the error toast is shown by initiateEmailSignIn, just reset the form state.
                setIsSubmitting(false);
            });
    };

    const handleSignUp = (e: React.FormEvent) => {
        e.preventDefault();
        if (signupPassword !== confirmPassword) {
            toast({
                variant: 'destructive',
                title: 'Error',
                description: 'Passwords do not match.',
            });
            return;
        }
        setIsSubmitting(true);
        initiateEmailSignUp(auth, signupEmail, signupPassword)
            .catch(() => {
                 // On failure, the error toast is shown by initiateEmailSignUp, just reset the form state.
                setIsSubmitting(false);
            });
    };

    if (isUserLoading) {
        return (
            <div className="flex h-screen w-full items-center justify-center bg-background">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }
    
  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mb-4 flex justify-center">
            <Logo />
          </div>
          <CardTitle className="text-2xl font-headline">Welcome to SheepSync Pro</CardTitle>
          <CardDescription>The all-in-one solution for modern sheep farming.</CardDescription>
        </CardHeader>
        <CardContent>
            <Tabs defaultValue="login">
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="login" disabled={isSubmitting}>Login</TabsTrigger>
                    <TabsTrigger value="signup" disabled={isSubmitting}>Sign Up</TabsTrigger>
                </TabsList>
                <TabsContent value="login">
                    <form onSubmit={handleLogin}>
                        <div className="grid gap-4 py-4">
                            <div className="grid gap-2">
                                <Label htmlFor="login-email">Email</Label>
                                <Input id="login-email" type="email" placeholder="m@example.com" required value={loginEmail} onChange={(e) => setLoginEmail(e.target.value)} disabled={isSubmitting} />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="login-password">Password</Label>
                                <Input id="login-password" type="password" required value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)} disabled={isSubmitting} />
                            </div>
                            <Button type="submit" className="w-full" disabled={isSubmitting}>
                                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Login
                            </Button>
                        </div>
                    </form>
                </TabsContent>
                <TabsContent value="signup">
                    <form onSubmit={handleSignUp}>
                        <div className="grid gap-4 py-4">
                            <div className="grid gap-2">
                                <Label htmlFor="signup-email">Email</Label>
                                <Input id="signup-email" type="email" placeholder="m@example.com" required value={signupEmail} onChange={(e) => setSignupEmail(e.target.value)} disabled={isSubmitting} />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="signup-password">Password</Label>
                                <Input id="signup-password" type="password" required value={signupPassword} onChange={(e) => setSignupPassword(e.target.value)} disabled={isSubmitting} />
                            </div>
                             <div className="grid gap-2">
                                <Label htmlFor="confirm-password">Confirm Password</Label>
                                <Input id="confirm-password" type="password" required value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} disabled={isSubmitting} />
                            </div>
                            <Button type="submit" className="w-full" disabled={isSubmitting}>
                                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Sign Up
                            </Button>
                        </div>
                    </form>
                </TabsContent>
            </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
