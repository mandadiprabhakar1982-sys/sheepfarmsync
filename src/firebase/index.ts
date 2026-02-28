'use client';

import { firebaseConfig } from '@/firebase/config';
import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';

// Global singletons to prevent multiple instances during hot reloads/SSR
let firebaseApp: FirebaseApp | undefined;
let firebaseAuth: Auth | undefined;
let firestore: Firestore | undefined;

/**
 * Initializes Firebase and returns the singleton SDK instances.
 * This ensures only one instance of each service exists globally,
 * preventing 'ID: ca9' internal assertion errors.
 */
export function initializeFirebase() {
  if (typeof window !== 'undefined') {
    if (!getApps().length) {
      firebaseApp = initializeApp(firebaseConfig);
    } else {
      firebaseApp = getApp();
    }

    if (!firebaseAuth) {
      firebaseAuth = getAuth(firebaseApp);
    }
    
    if (!firestore) {
      firestore = getFirestore(firebaseApp);
    }
  }

  return {
    firebaseApp: firebaseApp || null,
    auth: firebaseAuth || null,
    firestore: firestore || null
  };
}

/**
 * Returns SDK instances for a given FirebaseApp.
 */
export function getSdks(app: FirebaseApp) {
  return {
    firebaseApp: app,
    auth: getAuth(app),
    firestore: getFirestore(app)
  };
}

export * from './provider';
export * from './client-provider';
export * from './firestore/use-collection';
export * from './firestore/use-doc';
export * from './non-blocking-updates';
export * from './non-blocking-login';
export * from './errors';
export * from './error-emitter';
