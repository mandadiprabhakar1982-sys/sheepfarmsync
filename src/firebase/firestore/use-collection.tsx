'use client';

import { useState, useEffect, useRef } from 'react';
import {
  Query,
  onSnapshot,
  DocumentData,
  FirestoreError,
  QuerySnapshot,
} from 'firebase/firestore';

/** Utility type to add an 'id' field to a given type T. */
export type WithId<T> = T & { id: string };

/**
 * Interface for the return value of the useCollection hook.
 * @template T Type of the document data.
 */
export interface UseCollectionResult<T> {
  data: WithId<T>[] | null; // Document data with ID, or null.
  isLoading: boolean;       // True if loading.
  error: FirestoreError | null; // Firestore error object, or null.
}

/**
 * React hook to subscribe to a Firestore collection or query in real-time.
 * Optimized to prevent internal SDK assertion errors (ID: ca9).
 */
export function useCollection<T = any>(
  memoizedTargetRefOrQuery: Query<DocumentData> | null | undefined,
): UseCollectionResult<T> {
  const [data, setData] = useState<WithId<T>[] | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<FirestoreError | null>(null);
  
  // Track the current subscription to avoid redundant onSnapshot calls
  const activeSubscriptionRef = useRef<Query<DocumentData> | null>(null);

  useEffect(() => {
    // If no query or the query is the same as the active one, do nothing
    if (!memoizedTargetRefOrQuery || activeSubscriptionRef.current === memoizedTargetRefOrQuery) {
      if (!memoizedTargetRefOrQuery) {
        setData(null);
        setIsLoading(false);
        setError(null);
      }
      return;
    }

    setIsLoading(true);
    setError(null);
    activeSubscriptionRef.current = memoizedTargetRefOrQuery;

    const unsubscribe = onSnapshot(
      memoizedTargetRefOrQuery,
      (snapshot: QuerySnapshot<DocumentData>) => {
        // Only update if this query is still the one we are interested in
        if (activeSubscriptionRef.current !== memoizedTargetRefOrQuery) return;

        const results: WithId<T>[] = [];
        snapshot.forEach((doc) => {
          results.push({ ...(doc.data() as T), id: doc.id });
        });
        setData(results);
        setError(null);
        setIsLoading(false);
      },
      (err: FirestoreError) => {
        if (activeSubscriptionRef.current !== memoizedTargetRefOrQuery) return;

        if (err.code === 'permission-denied' || err.code === 'unavailable') {
          console.warn(`Firestore [${err.code}]:`, err.message);
        } else {
          console.error("Firestore Error in useCollection:", err);
        }
        setError(err);
        setData([]);
        setIsLoading(false);
      }
    );

    return () => {
      activeSubscriptionRef.current = null;
      unsubscribe();
    };
  }, [memoizedTargetRefOrQuery]);

  return { data, isLoading, error };
}
