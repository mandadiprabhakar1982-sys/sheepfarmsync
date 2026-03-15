
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import type { FirebaseStorage } from 'firebase/storage';

/**
 * Standardized utility to handle image uploads to Firebase Storage.
 * It takes a data URL (base64), converts it to a blob, and returns the public download URL.
 */
export async function uploadToStorage(storage: FirebaseStorage, dataUrl: string | undefined, folder: string): Promise<string | undefined> {
  if (!dataUrl) return undefined;
  if (!dataUrl.startsWith('data:')) return dataUrl; // Already a URL or not an image string
  
  try {
    const filename = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}.jpg`;
    const storageRef = ref(storage, `${folder}/${filename}`);
    
    const response = await fetch(dataUrl);
    const blob = await response.blob();
    const snapshot = await uploadBytes(storageRef, blob, { contentType: 'image/jpeg' });
    
    const downloadUrl = await getDownloadURL(snapshot.ref);
    console.log(`[STORAGE] Visual asset persisted to ${folder}:`, downloadUrl);
    return downloadUrl;
  } catch (error) {
    console.error(`[STORAGE] Upload failed for ${folder}:`, error);
    return dataUrl; // Fallback to dataUrl if upload fails, though not ideal
  }
}
