'use client';

import { useState, useMemo, useEffect } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { LogOut, User, Settings, ChevronDown, Loader2, ShieldCheck, Mail, Fingerprint, Save, Globe, Database, UserCheck } from 'lucide-react';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { useAuth, useUser, useFirestore, useDoc } from '@/firebase';
import { signOut } from 'firebase/auth';
import { initiateUpdateProfile } from '@/firebase/non-blocking-login';
import { doc, serverTimestamp } from 'firebase/firestore';
import { updateDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { Badge } from '@/components/ui/badge';
import type { UserProfile } from '@/lib/types';
import { useLanguage } from '@/context/LanguageContext';
import { firebaseConfig } from '@/firebase/config';

export function UserNav() {
  const userAvatar = PlaceHolderImages.find((img) => img.id === 'user-avatar');
  const auth = useAuth();
  const { user } = useUser();
  const firestore = useFirestore();
  const { t } = useLanguage();
  
  const userDocRef = useMemo(() => {
    if (!user || !firestore) return null;
    return doc(firestore, 'users', user.uid);
  }, [user, firestore]);

  const { data: profile } = useDoc<UserProfile>(userDocRef);
  
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [displayName, setDisplayName] = useState('');
  const [role, setRole] = useState<string>('collaborator');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Sync local state when profile loads or dialog opens
  useEffect(() => {
    if (profile && isProfileOpen) {
      setDisplayName(profile.displayName || user?.displayName || '');
      setRole(profile.role);
    }
  }, [profile, user, isProfileOpen]);

  const handleLogout = () => {
    signOut(auth!);
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth || !user || !firestore) return;
    
    setIsSubmitting(true);
    try {
      await initiateUpdateProfile(auth, displayName);
      
      const userRef = doc(firestore, `users/${user.uid}`);
      // Use updateDocumentNonBlocking to preserve other fields
      updateDocumentNonBlocking(userRef, {
        displayName,
        role,
        updatedAt: serverTimestamp(),
      });
      
      setIsProfileOpen(false);
    } catch (error) {
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="relative flex items-center gap-3 h-12 px-3 rounded-2xl hover:bg-neutral-50 transition-all active:scale-95 group">
            <div className="relative">
              <Avatar className="h-9 w-9 border-2 border-white shadow-md">
                <AvatarImage src={userAvatar?.imageUrl} alt="User avatar" data-ai-hint={userAvatar?.imageHint} />
                <AvatarFallback className="bg-primary/5 text-primary font-black">
                  {(user?.displayName?.[0] || user?.email?.[0] || 'U').toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="absolute -bottom-0.5 -right-0.5 h-3 w-3 bg-emerald-500 border-2 border-white rounded-full" />
            </div>
            <div className="hidden md:flex flex-col items-start text-left">
              <span className="text-[11px] font-black tracking-tight text-neutral-900 leading-none truncate max-w-[100px]">
                {user?.displayName || 'Shepherd'}
              </span>
              <span className="text-[8px] font-bold text-muted-foreground uppercase tracking-widest mt-1 opacity-60">
                {profile?.role || 'User'}
              </span>
            </div>
            <ChevronDown className="h-3 w-3 hidden md:inline opacity-20 group-hover:opacity-100 transition-opacity" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-64 rounded-2xl shadow-2xl border-none p-2" align="end" forceMount>
          <DropdownMenuLabel className="p-4 bg-neutral-50 rounded-xl mb-2">
            <div className="flex flex-col space-y-1">
              <div className="flex items-center justify-between">
                <p className="text-xs font-black uppercase tracking-tight leading-none text-neutral-900">
                  {user?.displayName || 'Identity Profile'}
                </p>
                <Badge variant="secondary" className="h-4 px-1.5 text-[7px] font-black uppercase tracking-widest bg-primary/10 text-primary border-none">
                  {profile?.role || 'Sync User'}
                </Badge>
              </div>
              <p className="text-[10px] leading-none text-muted-foreground truncate opacity-60 font-bold mt-2">
                {user?.email}
              </p>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator className="bg-neutral-100" />
          <DropdownMenuGroup className="space-y-1">
            <DropdownMenuItem onClick={() => setIsProfileOpen(true)} className="rounded-lg h-10 cursor-pointer focus:bg-neutral-50">
              <Settings className="mr-3 h-4 w-4 text-neutral-400" />
              <span className="text-xs font-bold text-neutral-700">{t('settings')}</span>
            </DropdownMenuItem>
          </DropdownMenuGroup>
          <DropdownMenuSeparator className="bg-neutral-100" />
          <DropdownMenuItem onClick={handleLogout} className="rounded-lg h-10 cursor-pointer text-rose-600 focus:bg-rose-50 focus:text-rose-600">
              <LogOut className="mr-3 h-4 w-4" />
              <span className="text-xs font-bold uppercase tracking-widest">{t('logout')}</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={isProfileOpen} onOpenChange={setIsProfileOpen}>
        <DialogContent className="sm:max-w-xl rounded-[2.5rem] p-0 overflow-hidden border-none shadow-2xl">
          <form onSubmit={handleUpdateProfile}>
            <DialogHeader className="bg-neutral-900 p-8 text-left relative overflow-hidden">
              <div className="absolute top-0 right-0 p-6 opacity-10">
                <Fingerprint className="h-24 w-24 text-white rotate-12" />
              </div>
              <DialogTitle className="text-2xl font-black tracking-tight text-white flex items-center gap-3 relative z-10">
                <Settings className="h-6 w-6 text-emerald-400" />
                {t('identity')}
              </DialogTitle>
              <DialogDescription className="text-white/40 text-xs font-bold uppercase tracking-widest relative z-10">
                Synchronize your shepherd profile parameters
              </DialogDescription>
            </DialogHeader>
            
            <div className="p-8 space-y-8 bg-white max-h-[60vh] overflow-y-auto no-scrollbar">
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <Label htmlFor="name" className="text-[10px] font-black uppercase tracking-widest opacity-40 ml-2">Public Identity Name</Label>
                    <div className="relative">
                      <User className="absolute left-5 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-300" />
                      <Input
                        id="name"
                        value={displayName}
                        onChange={(e) => setDisplayName(e.target.value)}
                        placeholder="e.g. Shepherd Ram"
                        className="h-14 rounded-2xl bg-neutral-50 border-none shadow-sm font-black text-base px-14 focus-visible:ring-primary/20"
                        disabled={isSubmitting}
                      />
                    </div>
                  </div>

                  <div className="space-y-3">
                    <Label htmlFor="role" className="text-[10px] font-black uppercase tracking-widest opacity-40 ml-2">Audit Access Level</Label>
                    <Select value={role} onValueChange={setRole} disabled={isSubmitting}>
                      <SelectTrigger className="h-14 rounded-2xl bg-neutral-50 border-none shadow-sm font-black text-base px-6">
                        <SelectValue placeholder="Select role" />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl border-none shadow-2xl">
                        <SelectItem value="admin" className="rounded-lg font-bold">
                          <div className="flex items-center gap-2">
                            <ShieldCheck className="h-4 w-4 text-emerald-600" />
                            Admin Access
                          </div>
                        </SelectItem>
                        <SelectItem value="collaborator" className="rounded-lg font-bold">
                          <div className="flex items-center gap-2">
                            <UserCheck className="h-4 w-4 text-blue-600" />
                            Collaborator
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-5 rounded-2xl bg-neutral-50 border border-neutral-100 flex items-center gap-4">
                    <div className="h-10 w-10 rounded-xl bg-white flex items-center justify-center shadow-sm">
                      <Mail className="h-5 w-5 text-neutral-400" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[8px] font-black uppercase tracking-[0.2em] text-muted-foreground opacity-60">Verified Email</p>
                      <p className="text-[11px] font-bold text-neutral-900 truncate">{user?.email}</p>
                    </div>
                  </div>

                  <div className="p-5 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center gap-4">
                    <div className="h-10 w-10 rounded-xl bg-white flex items-center justify-center shadow-sm">
                      <ShieldCheck className="h-5 w-5 text-emerald-600" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[8px] font-black uppercase tracking-[0.2em] text-emerald-900 opacity-60">{t('security')}</p>
                      <p className="text-[11px] font-black text-emerald-900 uppercase tracking-widest">
                        {profile?.role || 'Guest'} Status
                      </p>
                    </div>
                  </div>
                </div>

                <div className="pt-6 border-t border-neutral-100">
                  <div className="flex items-center gap-3 mb-4">
                    <Database className="h-4 w-4 text-primary" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-neutral-900">{t('database_project')}</span>
                  </div>
                  <div className="p-5 rounded-2xl bg-neutral-900 text-white flex items-center justify-between shadow-xl">
                    <div className="flex flex-col gap-1">
                      <span className="text-[8px] font-black uppercase tracking-[0.2em] text-white/40 leading-none">Verified Core Link</span>
                      <span className="text-[11px] font-mono font-bold text-emerald-400 uppercase tracking-tight">
                        {firebaseConfig.projectId}
                      </span>
                    </div>
                    <Badge className="bg-white/10 text-white border-none text-[8px] font-black">ACTIVE</Badge>
                  </div>
                  <p className="text-[9px] text-muted-foreground mt-3 font-medium italic">
                    All data is synchronized with the primary database via high-precision stealth protocols.
                  </p>
                </div>
              </div>
            </div>

            <DialogFooter className="p-8 bg-neutral-50 border-t border-neutral-100 flex-col sm:flex-row gap-4">
              <Button type="button" variant="ghost" onClick={() => setIsProfileOpen(false)} className="h-12 px-6 font-bold text-muted-foreground rounded-xl">
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting || !displayName.trim()} className="h-14 px-10 rounded-xl font-black uppercase tracking-[0.2em] shadow-2xl shadow-primary/20 bg-neutral-900 hover:bg-neutral-800 flex-1 sm:flex-none">
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-3 h-5 w-5 animate-spin text-emerald-400" />
                    Syncing Identity...
                  </>
                ) : (
                  <>
                    <Save className="mr-3 h-5 w-5 text-emerald-400" />
                    Save Changes
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
