'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Logo } from '@/components/logo';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/firebase';
import { initiateEmailSignIn, initiateEmailSignUp, initiateGoogleSignIn } from '@/firebase/non-blocking-login';
import { useToast } from '@/hooks/use-toast';

const GoogleIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg role="img" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" {...props}>
        <title>Google</title>
        <path d="M12.48 10.92v3.28h7.84c-.24 1.84-.85 3.18-1.73 4.1-1.05 1.05-2.86 2.25-5.02 2.25-4.33 0-7.87-3.56-7.87-7.95s3.54-7.95 7.87-7.95c2.43 0 3.86.95 4.73 1.8l2.75-2.75C19.05 2.86 16.25 1.5 12.48 1.5c-6.18 0-11.18 4.92-11.18 11s5 11 11.18 11c6.45 0 10.8-4.44 10.8-10.92 0-.7-.08-1.3-.2-1.92h-10.6z" />
    </svg>
);


export default function LoginPage() {
    const auth = useAuth();
    const { toast } = useToast();

    const [loginEmail, setLoginEmail] = useState('');
    const [loginPassword, setLoginPassword] = useState('');
    const [signupEmail, setSignupEmail] = useState('');
    const [signupPassword, setSignupPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const [isSubmitting, setIsSubmitting] = useState(false);

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

    const handleGoogleSignIn = () => {
        setIsSubmitting(true);
        initiateGoogleSignIn(auth)
            .catch(() => {
                setIsSubmitting(false);
            });
    };

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
            <div className="grid gap-4">
                <Button variant="outline" className="w-full" onClick={handleGoogleSignIn} disabled={isSubmitting}>
                    {isSubmitting ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                        <GoogleIcon className="mr-2 h-4 w-4" />
                    )}
                    Sign in with Google
                </Button>

                <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-background px-2 text-muted-foreground">
                        Or continue with email
                        </span>
                    </div>
                </div>
            </div>

            <Tabs defaultValue="login" className="mt-4">
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
