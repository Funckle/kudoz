import { useState, useEffect, useCallback, createContext, useContext } from 'react';
import { Session } from '@supabase/supabase-js';
import { supabase } from '../services/supabase';
import { getUserProfile, createUserProfile } from '../services/auth';
import type { User } from '../types/database';

interface AuthState {
  session: Session | null;
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  isNewUser: boolean;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthState>({
  session: null,
  user: null,
  loading: true,
  isAuthenticated: false,
  isNewUser: false,
  refreshUser: async () => {},
});

export function useAuthProvider(): AuthState {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isNewUser, setIsNewUser] = useState(false);

  const loadUser = useCallback(async (userId: string, email?: string) => {
    const { user: profile } = await getUserProfile(userId);
    if (profile) {
      setUser(profile);
      setIsNewUser(!profile.onboarded);
    } else if (email) {
      // First sign-in: create profile
      await createUserProfile(userId, { email });
      const { user: newProfile } = await getUserProfile(userId);
      setUser(newProfile ?? null);
      setIsNewUser(true);
    }
  }, []);

  const refreshUser = useCallback(async () => {
    if (session?.user?.id) {
      await loadUser(session.user.id);
    }
  }, [session, loadUser]);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session: s } }) => {
      setSession(s);
      if (s?.user) {
        loadUser(s.user.id, s.user.email).finally(() => setLoading(false));
      } else {
        setLoading(false);
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s);
      if (s?.user) {
        loadUser(s.user.id, s.user.email).finally(() => setLoading(false));
      } else {
        setUser(null);
        setIsNewUser(false);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, [loadUser]);

  return {
    session,
    user,
    loading,
    isAuthenticated: !!session,
    isNewUser,
    refreshUser,
  };
}

export { AuthContext };

export function useAuth() {
  return useContext(AuthContext);
}
