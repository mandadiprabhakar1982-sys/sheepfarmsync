'use client';
    
import {
  setDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  CollectionReference,
  DocumentReference,
  SetOptions,
} from 'firebase/firestore';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

/** 
 * Helper to filter undefined values from an object before sending to Firestore.
 * Ensures compatibility with specialized objects like FieldValues.
 */
function filterUndefined(obj: any): any {
  if (Array.isArray(obj)) {
    return obj.map(filterUndefined);
  } else if (obj !== null && typeof obj === 'object') {
    const proto = Object.getPrototypeOf(obj);
    // Only recurse into plain objects to avoid mangling FieldValues or Dates
    if (proto === null || proto === Object.prototype) {
      return Object.keys(obj).reduce((acc: any, key) => {
        const val = filterUndefined(obj[key]);
        if (val !== undefined) {
          acc[key] = val;
        }
        return acc;
      }, {});
    }
  }
  return obj;
}

/**
 * Initiates a setDoc operation for a document reference.
 * Does NOT await the write operation internally.
 */
export function setDocumentNonBlocking(docRef: DocumentReference, data: any, options: SetOptions) {
  const filteredData = filterUndefined(data);
  setDoc(docRef, filteredData, options).catch(error => {
    console.error("Firestore Write Error (setDoc):", error);
    errorEmitter.emit(
      'permission-error',
      new FirestorePermissionError({
        path: docRef.path,
        operation: options && 'merge' in options ? 'update' : 'create',
        requestResourceData: filteredData,
      })
    );
  });
}

/**
 * Initiates an addDoc operation for a collection reference.
 */
export function addDocumentNonBlocking(colRef: CollectionReference, data: any) {
  const filteredData = filterUndefined(data);
  addDoc(colRef, filteredData)
    .catch(error => {
      console.error("Firestore Write Error (addDoc):", error);
      errorEmitter.emit(
        'permission-error',
        new FirestorePermissionError({
          path: colRef.path,
          operation: 'create',
          requestResourceData: filteredData,
        })
      );
    });
}

/**
 * Initiates an updateDoc operation for a document reference.
 */
export function updateDocumentNonBlocking(docRef: DocumentReference, data: any) {
  const filteredData = filterUndefined(data);
  updateDoc(docRef, filteredData)
    .catch(error => {
      console.error("Firestore Write Error (updateDoc):", error);
      errorEmitter.emit(
        'permission-error',
        new FirestorePermissionError({
          path: docRef.path,
          operation: 'update',
          requestResourceData: filteredData,
        })
      );
    });
}

/**
 * Initiates a deleteDoc operation for a document reference.
 */
export function deleteDocumentNonBlocking(docRef: DocumentReference) {
  deleteDoc(docRef)
    .catch(error => {
      console.error("Firestore Write Error (deleteDoc):", error);
      errorEmitter.emit(
        'permission-error',
        new FirestorePermissionError({
          path: docRef.path,
          operation: 'delete',
        })
      );
    });
}
