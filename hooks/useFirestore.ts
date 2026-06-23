import { getDoc, subscribeToDoc, subscribeToCollection } from '@/lib/firebase/firestore';
import { QueryConstraint } from 'firebase/firestore';
import { useEffect, useState } from 'react';

export function useDocument<T>(path: string) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!path) {
      setLoading(false);
      return;
    }
    const unsubscribe = subscribeToDoc<T>(path, (docData) => {
      setData(docData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [path]);

  return { data, loading, error };
}

export function useCollection<T>(path: string, ...queryConstraints: QueryConstraint[]) {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!path) {
      setLoading(false);
      return;
    }
    
    const unsubscribe = subscribeToCollection<T>(path, (collectionData) => {
      setData(collectionData);
      setLoading(false);
    }, ...queryConstraints);

    return () => unsubscribe();
  }, [path]);

  return { data, loading, error };
}
