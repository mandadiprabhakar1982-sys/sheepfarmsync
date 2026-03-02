'use client';

import { firebaseConfig } from '@/firebase/config';
import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore, initializeFirestore } from 'firebase/firestore';

// Global singletons to prevent multiple instances during hot reloads/SSR
let firebaseApp: FirebaseApp | undefined;
let firebaseAuth: Auth | undefined;
let firestore: Firestore | undefined;

/**
 * Initializes Firebase and returns the singleton SDK instances.
 * Strictly enforces a single instance to prevent Firestore ID: ca9 assertion failures.
 * 
 * Note: Forced long-polling is enabled to prevent RPC 'Listen' stream transport errors 
 * common in environments with restricted WebSocket support or proxy interference.
 */
export function initializeFirebase() {
  if (typeof window !== 'undefined') {
    if (!firebaseApp) {
      const apps = getApps();
      firebaseApp = apps.length ? apps[0] : initializeApp(firebaseConfig);
    }

    if (!firebaseAuth) {
      firebaseAuth = getAuth(firebaseApp);
    }
    
    if (!firestore) {
      // Use initializeFirestore with settings optimized for environment stability
      firestore = initializeFirestore(firebaseApp, {
        experimentalForceLongPolling: true,
        useFetchStreams: false,
      });
    }
  }

  return {
    firebaseApp: firebaseApp || null,
    auth: firebaseAuth || null,
    firestore: firestore || null
  };
}

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
