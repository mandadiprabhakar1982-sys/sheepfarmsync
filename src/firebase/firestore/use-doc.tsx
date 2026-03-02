'use client';
    
import { useState, useEffect, useRef } from 'react';
import {
  DocumentReference,
  onSnapshot,
  DocumentData,
  FirestoreError,
  DocumentSnapshot,
} from 'firebase/firestore';

/** Utility type to add an 'id' and '_path' field to a given type T. */
type WithId<T> = T & { id: string; _path: string };

/**
 * Interface for the return value of the useDoc hook.
 * @template T Type of the document data.
 */
export interface UseDocResult<T> {
  data: WithId<T> | null; // Document data with ID and Path, or null.
  isLoading: boolean;       // True if loading.
  error: FirestoreError | null; // Firestore error object, or null.
}

/**
 * React hook to subscribe to a single Firestore document in real-time.
 * Handles nullable references and prevents infinite loops with path-based identity checks.
 */
export function useDoc<T = any>(
  memoizedDocRef: DocumentReference<DocumentData> | null | undefined,
): UseDocResult<T> {
  const [data, setData] = useState<WithId<T> | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(!!memoizedDocRef);
  const [error, setError] = useState<FirestoreError | null>(null);
  
  // Use a ref to track the current document path to prevent infinite subscription loops
  // if the caller fails to memoize the memoizedDocRef.
  const activePathRef = useRef<string | null>(null);

  useEffect(() => {
    if (!memoizedDocRef) {
      setData(null);
      setIsLoading(false);
      setError(null);
      activePathRef.current = null;
      return;
    }

    // If the path hasn't changed, don't restart the subscription
    if (activePathRef.current === memoizedDocRef.path) {
      return;
    }

    setIsLoading(true);
    setError(null);
    activePathRef.current = memoizedDocRef.path;

    const currentPath = memoizedDocRef.path;

    const unsubscribe = onSnapshot(
      memoizedDocRef,
      (snapshot: DocumentSnapshot<DocumentData>) => {
        // Guard: ensure we only process if this path is still the active one
        if (activePathRef.current !== currentPath) return;

        if (snapshot.exists()) {
          setData({ 
            ...(snapshot.data() as T), 
            id: snapshot.id,
            _path: snapshot.ref.path 
          });
        } else {
          setData(null);
        }
        setError(null);
        setIsLoading(false);
      },
      (err: FirestoreError) => {
        if (activePathRef.current !== currentPath) return;
        console.error("useDoc error:", err);
        setError(err);
        setData(null);
        setIsLoading(false);
      }
    );

    return () => {
      unsubscribe();
      // Only clear if we are still the active ref for this path
      if (activePathRef.current === currentPath) {
        activePathRef.current = null;
      }
    };
  }, [memoizedDocRef]);

  return { data, isLoading, error };
}
