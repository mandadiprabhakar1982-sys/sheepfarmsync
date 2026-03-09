
'use client';
import {
  Auth,
  signInAnonymously,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
  updateProfile,
  sendPasswordResetEmail,
} from 'firebase/auth';
import { FirebaseError } from 'firebase/app';
import { toast } from '@/hooks/use-toast';

const handleAuthError = (error: any) => {
    console.error("Authentication Error:", error);
    let errorMessage = 'An unknown error occurred.';
    if (error instanceof FirebaseError) {
        switch (error.code) {
            case 'auth/popup-blocked':
                errorMessage = 'The sign-in popup was blocked by your browser. Please allow popups for this site.';
                break;
            case 'auth/popup-closed-by-user':
                errorMessage = 'The sign-in popup was closed before completion.';
                break;
            case 'auth/unauthorized-domain':
                errorMessage = 'Domain not authorized. Please update Firebase Console settings.';
                break;
            case 'auth/wrong-password':
                errorMessage = 'Incorrect password. Please try again.';
                break;
            case 'auth/user-not-found':
                errorMessage = 'No account discovered with this email identity.';
                break;
            case 'auth/email-already-in-use':
                errorMessage = 'This email is already registered in the system.';
                break;
            case 'auth/weak-password':
                errorMessage = 'Security threshold failed: Password must be at least 6 characters.';
                break;
            case 'auth/invalid-email':
                errorMessage = 'The provided email address format is invalid.';
                break;
            case 'auth/too-many-requests':
                errorMessage = 'Security lockout active: Too many failed attempts. Try again later.';
                break;
            default:
                errorMessage = error.message;
        }
    }
    toast({
        variant: 'destructive',
        title: 'Authentication Protocol Failed',
        description: errorMessage,
    });
};


/** Initiate anonymous sign-in (non-blocking). */
export function initiateAnonymousSignIn(authInstance: Auth): void {
  signInAnonymously(authInstance).catch(handleAuthError);
}

/** Initiate Google sign-in (non-blocking). */
export function initiateGoogleSignIn(authInstance: Auth): Promise<void> {
  const provider = new GoogleAuthProvider();
  return signInWithPopup(authInstance, provider)
    .then(() => {}) // Success is handled by onAuthStateChanged
    .catch(error => {
        handleAuthError(error);
        return Promise.reject(error);
    });
}

/** Initiate email/password sign-up (non-blocking). */
export function initiateEmailSignUp(authInstance: Auth, email: string, password: string): Promise<void> {
  return createUserWithEmailAndPassword(authInstance, email, password)
    .then(() => {}) // Success is handled by onAuthStateChanged, do nothing here.
    .catch(error => {
        handleAuthError(error);
        return Promise.reject(error); // Return a rejected promise
    });
}

/** Initiate email/password sign-in (non-blocking). */
export function initiateEmailSignIn(authInstance: Auth, email: string, password: string): Promise<void> {
  return signInWithEmailAndPassword(authInstance, email, password)
    .then(() => {}) // Success is handled by onAuthStateChanged
    .catch(error => {
        handleAuthError(error);
        return Promise.reject(error);
    });
}

/** Initiate profile update (non-blocking). */
export function initiateUpdateProfile(authInstance: Auth, displayName: string): Promise<void> {
  if (!authInstance.currentUser) return Promise.reject("No user logged in");
  return updateProfile(authInstance.currentUser, { displayName })
    .then(() => {
        toast({
            title: 'Identity Synchronized',
            description: 'Public profile parameters updated successfully.',
        });
    })
    .catch(error => {
        handleAuthError(error);
        return Promise.reject(error);
    });
}

/** Initiate password reset email (non-blocking). */
export function initiatePasswordReset(authInstance: Auth, email: string): Promise<void> {
  return sendPasswordResetEmail(authInstance, email)
    .then(() => {
        toast({
            title: 'Recovery Link Dispatched',
            description: 'Please audit your inbox (and spam folder) for password reset instructions.',
        });
    })
    .catch(error => {
        handleAuthError(error);
        return Promise.reject(error);
    });
}
