import {
  doc,
  getDoc as firestoreGetDoc,
  setDoc as firestoreSetDoc,
  updateDoc as firestoreUpdateDoc,
  deleteDoc as firestoreDeleteDoc,
  onSnapshot,
  collection,
  query,
  QueryConstraint,
  writeBatch,
  serverTimestamp as firestoreServerTimestamp,
  DocumentData,
} from 'firebase/firestore';
import { db } from './client';

export const getDoc = async <T = DocumentData>(path: string): Promise<T | null> => {
  const docRef = doc(db, path);
  const docSnap = await firestoreGetDoc(docRef);
  return docSnap.exists() ? (docSnap.data() as T) : null;
};

export const setDoc = async <T extends { [x: string]: any }>(path: string, data: T, merge = true) => {
  const docRef = doc(db, path);
  return firestoreSetDoc(docRef, data, { merge });
};

export const updateDoc = async <T extends { [x: string]: any }>(path: string, data: T) => {
  const docRef = doc(db, path);
  return firestoreUpdateDoc(docRef, data);
};

export const deleteDoc = async (path: string) => {
  const docRef = doc(db, path);
  return firestoreDeleteDoc(docRef);
};

export const subscribeToDoc = <T = DocumentData>(path: string, callback: (data: T | null) => void) => {
  const docRef = doc(db, path);
  return onSnapshot(docRef, (docSnap) => {
    callback(docSnap.exists() ? (docSnap.data() as T) : null);
  });
};

export const subscribeToCollection = <T = DocumentData>(
  collectionPath: string,
  callback: (data: T[]) => void,
  ...queryConstraints: QueryConstraint[]
) => {
  const collRef = collection(db, collectionPath);
  const q = query(collRef, ...queryConstraints);
  return onSnapshot(q, (querySnapshot) => {
    const data: T[] = [];
    querySnapshot.forEach((d) => {
      data.push({ id: d.id, ...d.data() } as T);
    });
    callback(data);
  });
};

export const batchWrite = () => {
  return writeBatch(db);
};

export const serverTimestamp = () => firestoreServerTimestamp();
