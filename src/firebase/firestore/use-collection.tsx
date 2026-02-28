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
  // and ensure we don't process results from stale listeners.
  const queryRef = useRef<Query<DocumentData> | null>(null);

  useEffect(() => {
    // If the query reference hasn't actually changed, don't resubscribe.
    // This is critical when parents re-render frequently.
    if (!memoizedTargetRefOrQuery) {
      setData(null);
      setIsLoading(false);
      setError(null);
      queryRef.current = null;
      return;
    }

    if (queryRef.current === memoizedTargetRefOrQuery) {
      return;
    }

    setIsLoading(true);
    setError(null);
    queryRef.current = memoizedTargetRefOrQuery;

    // We use a local variable to capture the specific query for this effect run.
    const currentQuery = memoizedTargetRefOrQuery;

    const unsubscribe = onSnapshot(
      currentQuery,
      (snapshot: QuerySnapshot<DocumentData>) => {
        // Only update state if this is still the active query reference.
        if (queryRef.current !== currentQuery) return;

        const results: WithId<T>[] = [];
        snapshot.forEach((doc) => {
          results.push({ ...(doc.data() as T), id: doc.id });
        });
        
        setData(results);
        setError(null);
        setIsLoading(false);
      },
      (err: FirestoreError) => {
        if (queryRef.current !== currentQuery) return;

        // ID: ca9 often happens when listeners are created/destroyed too fast.
        // We catch it and report it gracefully without crashing.
        if (err.code as string === 'permission-denied' || err.code as string === 'unavailable') {
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
      // Cleanup the specific listener for this effect run.
      unsubscribe();
      // If we are cleaning up the current active query, clear the ref.
      if (queryRef.current === currentQuery) {
        queryRef.current = null;
      }
    };
  }, [memoizedTargetRefOrQuery]);

  return { data, isLoading, error };
}
