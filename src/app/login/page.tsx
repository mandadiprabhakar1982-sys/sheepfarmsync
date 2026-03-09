
'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, Mail, CheckCircle2, AlertCircle } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Logo, SyncProIcon } from '@/components/logo';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/firebase';
import { initiateEmailSignIn, initiateEmailSignUp, initiateGoogleSignIn, initiatePasswordReset } from '@/firebase/non-blocking-login';
import { useToast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

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
    
    const [isResetOpen, setIsResetOpen] = useState(false);
    const [resetEmail, setResetEmail] = useState('');
    const [isSubmittingReset, setIsSubmittingReset] = useState(false);

    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        initiateEmailSignIn(auth!, loginEmail, loginPassword)
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
        initiateEmailSignUp(auth!, signupEmail, signupPassword)
            .catch(() => {
                setIsSubmitting(false);
            });
    };

    const handleGoogleSignIn = () => {
        setIsSubmitting(true);
        initiateGoogleSignIn(auth!)
            .catch(() => {
                setIsSubmitting(false);
            });
    };

    const handlePasswordReset = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!resetEmail.trim()) {
            toast({ variant: 'destructive', title: 'Error', description: 'Please enter your email.' });
            return;
        }
        setIsSubmittingReset(true);
        try {
            await initiatePasswordReset(auth!, resetEmail);
            setIsResetOpen(false);
            setResetEmail('');
        } catch (e) {
            console.error(e);
        } finally {
            setIsSubmittingReset(false);
        }
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
                                <div className="flex items-center justify-between">
                                    <Label htmlFor="login-password">Password</Label>
                                    <Button 
                                        variant="link" 
                                        type="button" 
                                        className="h-auto p-0 text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:text-primary transition-colors"
                                        onClick={() => setIsResetOpen(true)}
                                    >
                                        Trouble signing in?
                                    </Button>
                                </div>
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

      <Dialog open={isResetOpen} onOpenChange={setIsResetOpen}>
        <DialogContent className="sm:max-w-md rounded-[2.5rem] p-0 overflow-hidden border-none shadow-2xl">
          <DialogHeader className="bg-neutral-900 p-8 text-left relative">
            <div className="absolute top-0 right-0 p-6 opacity-10">
              <Mail className="h-20 w-20 text-white rotate-12" />
            </div>
            <DialogTitle className="text-2xl font-black tracking-tight text-white flex items-center gap-3 relative z-10">
              <SyncProIcon className="h-6 w-6 text-emerald-400" />
              Account Recovery
            </DialogTitle>
            <DialogDescription className="text-white/40 text-xs font-bold uppercase tracking-widest relative z-10">
              Standard credential dispatch protocol
            </DialogDescription>
          </DialogHeader>
          <div className="p-8 space-y-6">
            <div className="space-y-2">
              <Label htmlFor="reset-email" className="text-[10px] font-black uppercase tracking-widest opacity-40 ml-2">Registered Email Identity</Label>
              <div className="relative">
                <Mail className="absolute left-5 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-300" />
                <Input
                  id="reset-email"
                  type="email"
                  placeholder="name@syncpro.com"
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  className="h-14 rounded-2xl bg-neutral-50 border-none shadow-sm font-black text-base px-14 focus-visible:ring-primary/20"
                />
              </div>
            </div>
            
            <div className="p-5 rounded-2xl bg-blue-50/50 border border-blue-100 flex gap-4">
              <AlertCircle className="h-5 w-5 text-blue-600 shrink-0" />
              <div className="space-y-1">
                <p className="text-[10px] font-bold text-blue-900 leading-relaxed uppercase tracking-wide">Email Verification Required</p>
                <p className="text-[10px] text-blue-800/70 leading-relaxed italic">
                  Recovery links expire in 1 hour. If you do not see the email within 2 minutes, please check your **Spam/Junk** folder.
                </p>
              </div>
            </div>
          </div>
          <DialogFooter className="p-8 bg-neutral-50 gap-4 flex-col sm:flex-row">
            <Button variant="ghost" onClick={() => setIsResetOpen(false)} className="h-12 px-6 font-bold text-muted-foreground rounded-xl">
              Cancel
            </Button>
            <Button onClick={handlePasswordReset} disabled={isSubmittingReset} className="h-14 px-10 rounded-xl font-black uppercase tracking-[0.2em] shadow-2xl shadow-primary/20 bg-neutral-900 hover:bg-neutral-800 text-white flex-1 transition-all active:scale-95">
              {isSubmittingReset ? (
                <>
                  <Loader2 className="mr-3 h-5 w-5 animate-spin text-emerald-400" />
                  Dispatching...
                </>
              ) : (
                <>
                  <CheckCircle2 className="mr-3 h-5 w-5 text-emerald-400" />
                  Send Recovery Link
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
