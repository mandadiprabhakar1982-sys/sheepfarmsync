'use client';
import {
  Auth,
  signInAnonymously,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from 'firebase/auth';
import { FirebaseError } from 'firebase/app';
import { toast } from '@/hooks/use-toast';

const handleAuthError = (error: any) => {
    console.error("Authentication Error:", error);
    let errorMessage = 'An unknown error occurred.';
    if (error instanceof FirebaseError) {
        switch (error.code) {
            case 'auth/wrong-password':
                errorMessage = 'Incorrect password. Please try again.';
                break;
            case 'auth/user-not-found':
                errorMessage = 'No user found with this email.';
                break;
            case 'auth/email-already-in-use':
                errorMessage = 'This email is already in use.';
                break;
            case 'auth/weak-password':
                errorMessage = 'Password should be at least 6 characters.';
                break;
            case 'auth/invalid-email':
                errorMessage = 'The email address is not valid.';
                break;
            default:
                errorMessage = error.message;
        }
    }
    toast({
        variant: 'destructive',
        title: 'Authentication Failed',
        description: errorMessage,
    });
};


/** Initiate anonymous sign-in (non-blocking). */
export function initiateAnonymousSignIn(authInstance: Auth): void {
  signInAnonymously(authInstance).catch(handleAuthError);
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
