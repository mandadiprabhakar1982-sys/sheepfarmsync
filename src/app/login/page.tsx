'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Logo, SyncProIcon } from '@/components/logo';
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
    <div className="flex min-h-screen items-center justify-center bg-background p-4 dashboard-hero">
      <Card className="w-full max-w-md border-none shadow-2xl overflow-hidden glass-card rounded-[2rem]">
        <div className="bg-primary p-12 text-center text-primary-foreground relative overflow-hidden">
           <div className="absolute top-0 right-0 p-4 opacity-10">
              <SyncProIcon className="h-32 w-32 rotate-12" />
           </div>
           <div className="inline-block bg-white/20 rounded-2xl p-4 mb-4">
              <SyncProIcon className="h-10 w-10 text-white" />
           </div>
           <h1 className="text-3xl font-black uppercase tracking-tight">SYNC PRO</h1>
           <p className="text-white/70 text-sm mt-2 font-medium">Precision Management Suite</p>
        </div>
        <CardContent className="pt-10">
            <div className="grid gap-4">
                <Button variant="outline" className="w-full h-12 rounded-xl font-bold" onClick={handleGoogleSignIn} disabled={isSubmitting}>
                    {isSubmitting ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                        <GoogleIcon className="mr-2 h-4 w-4" />
                    )}
                    Continue with Google
                </Button>

                <div className="relative my-4">
                    <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-white px-3 text-muted-foreground font-bold tracking-widest">
                        Or secure Login
                        </span>
                    </div>
                </div>
            </div>

            <Tabs defaultValue="login" className="mt-4">
                <TabsList className="grid w-full grid-cols-2 p-1 bg-muted/50 rounded-xl">
                    <TabsTrigger value="login" className="rounded-lg font-bold" disabled={isSubmitting}>Login</TabsTrigger>
                    <TabsTrigger value="signup" className="rounded-lg font-bold" disabled={isSubmitting}>Sign Up</TabsTrigger>
                </TabsList>
                <TabsContent value="login">
                    <form onSubmit={handleLogin}>
                        <div className="grid gap-4 py-4">
                            <div className="grid gap-2">
                                <Label htmlFor="login-email">Email Address</Label>
                                <Input id="login-email" type="email" placeholder="name@syncpro.com" className="h-11" required value={loginEmail} onChange={(e) => setLoginEmail(e.target.value)} disabled={isSubmitting} />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="login-password">Password</Label>
                                <Input id="login-password" type="password" className="h-11" required value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)} disabled={isSubmitting} />
                            </div>
                            <Button type="submit" className="w-full h-12 rounded-xl font-bold mt-2" disabled={isSubmitting}>
                                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Sign In
                            </Button>
                        </div>
                    </form>
                </TabsContent>
                <TabsContent value="signup">
                    <form onSubmit={handleSignUp}>
                        <div className="grid gap-4 py-4">
                            <div className="grid gap-2">
                                <Label htmlFor="signup-email">Email Address</Label>
                                <Input id="signup-email" type="email" placeholder="name@syncpro.com" className="h-11" required value={signupEmail} onChange={(e) => setSignupEmail(e.target.value)} disabled={isSubmitting} />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="signup-password">Choose Password</Label>
                                <Input id="signup-password" type="password" className="h-11" required value={signupPassword} onChange={(e) => setSignupPassword(e.target.value)} disabled={isSubmitting} />
                            </div>
                             <div className="grid gap-2">
                                <Label htmlFor="confirm-password">Confirm Password</Label>
                                <Input id="confirm-password" type="password" className="h-11" required value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} disabled={isSubmitting} />
                            </div>
                            <Button type="submit" className="w-full h-12 rounded-xl font-bold mt-2" disabled={isSubmitting}>
                                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Create Account
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
