import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import type { AuthUser } from '../lib/types';
import { getSupabase, isSupabaseConfigured } from '../lib/supabase';

type AuthResult = { error: string | null };

type AuthContextValue = {
  configured: boolean;
  user: AuthUser | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<AuthResult>;
  signUp: (email: string, password: string) => Promise<AuthResult>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(isSupabaseConfigured);

  useEffect(() => {
    const pending = getSupabase();
    if (!pending) {
      setLoading(false);
      return;
    }
    let unsub: (() => void) | undefined;
    let active = true;
    pending
      .then(async (supabase) => {
        const { data } = await supabase.auth.getSession();
        if (active) {
          const s = data.session;
          setUser(s ? { id: s.user.id, email: s.user.email ?? null } : null);
          setLoading(false);
        }
        const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
          setUser(session ? { id: session.user.id, email: session.user.email ?? null } : null);
        });
        unsub = () => sub.subscription.unsubscribe();
      })
      .catch((err) => {
        console.log('[v0] auth init failed:', err);
        if (active) setLoading(false);
      });
    return () => {
      active = false;
      unsub?.();
    };
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      configured: isSupabaseConfigured,
      user,
      loading,
      async signIn(email, password) {
        const pending = getSupabase();
        if (!pending) return { error: 'Cloud accounts are not configured.' };
        const supabase = await pending;
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        return { error: error?.message ?? null };
      },
      async signUp(email, password) {
        const pending = getSupabase();
        if (!pending) return { error: 'Cloud accounts are not configured.' };
        const supabase = await pending;
        const { error } = await supabase.auth.signUp({ email, password });
        return { error: error?.message ?? null };
      },
      async signOut() {
        const pending = getSupabase();
        if (!pending) return;
        const supabase = await pending;
        await supabase.auth.signOut();
        setUser(null);
      },
    }),
    [user, loading],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
