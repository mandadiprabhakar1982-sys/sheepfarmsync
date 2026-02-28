'use client';

import { firebaseConfig } from '@/firebase/config';
import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore'

// Cache SDK instances to prevent internal assertion errors from re-initialization
let cachedApp: FirebaseApp | null = null;
let cachedAuth: Auth | null = null;
let cachedFirestore: Firestore | null = null;

/**
 * Initializes Firebase and returns the singleton SDK instances.
 */
export function initializeFirebase() {
  if (cachedApp && cachedAuth && cachedFirestore) {
    return { firebaseApp: cachedApp, auth: cachedAuth, firestore: cachedFirestore };
  }

  if (!getApps().length) {
    try {
      // Attempt to initialize via Firebase App Hosting environment variables
      cachedApp = initializeApp();
    } catch (e) {
      cachedApp = initializeApp(firebaseConfig);
    }
  } else {
    cachedApp = getApp();
  }

  cachedAuth = getAuth(cachedApp);
  cachedFirestore = getFirestore(cachedApp);

  return {
    firebaseApp: cachedApp,
    auth: cachedAuth,
    firestore: cachedFirestore
  };
}

/**
 * Returns SDK instances for a given FirebaseApp.
 * Note: Prefers the singleton instances from initializeFirebase()
 */
export function getSdks(firebaseApp: FirebaseApp) {
  return {
    firebaseApp,
    auth: getAuth(firebaseApp),
    firestore: getFirestore(firebaseApp)
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
