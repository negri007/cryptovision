import { useEffect } from 'react';
import { onAuthStateChanged } from '@/lib/firebase/auth';
import { useAuthStore } from '@/store/authStore';

export function useAuth() {
  const { user, plan, role, loading, setUser, clearUser } = useAuthStore();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(async (firebaseUser) => {
      if (firebaseUser) {
        const tokenResult = await firebaseUser.getIdTokenResult();
        setUser(firebaseUser, tokenResult.claims);
      } else {
        clearUser();
      }
    });

    return () => unsubscribe();
  }, [setUser, clearUser]);

  return { user, plan, role, loading, isAdmin: role === 'admin' };
}
