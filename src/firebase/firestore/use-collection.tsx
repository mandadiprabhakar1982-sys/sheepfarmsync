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
 */
export function useCollection<T = any>(
  memoizedTargetRefOrQuery: Query<DocumentData> | null | undefined,
): UseCollectionResult<T> {
  // Start with loading true if we have a target, false if we're waiting for one
  const [data, setData] = useState<WithId<T>[] | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(!!memoizedTargetRefOrQuery);
  const [error, setError] = useState<FirestoreError | null>(null);
  
  const queryRef = useRef<Query<DocumentData> | null>(null);

  useEffect(() => {
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

    const currentQuery = memoizedTargetRefOrQuery;

    const unsubscribe = onSnapshot(
      currentQuery,
      (snapshot: QuerySnapshot<DocumentData>) => {
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

        if (err.code as string === 'permission-denied' || err.code as string === 'unavailable') {
          console.warn(`Firestore [${err.code}]:`, err.message);
        } else {
          console.error("Firestore Error in useCollection:", err);
        }
        
        setError(err);
        setData([]); // Fail to empty array
        setIsLoading(false);
      }
    );

    return () => {
      unsubscribe();
      if (queryRef.current === currentQuery) {
        queryRef.current = null;
      }
    };
  }, [memoizedTargetRefOrQuery]);

  return { data, isLoading, error };
}