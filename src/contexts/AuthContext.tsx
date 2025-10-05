import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, AuthError } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  signOut: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Fetch the current session
    const fetchSession = async () => {
      try {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error('Session fetch error:', sessionError);
          setUser(null);
          navigate('/');
        } else {
          setUser(session?.user ?? null);
        }
      } catch (error) {
        console.error('Session fetch error:', error);
        setUser(null);
        navigate('/');
      } finally {
        setLoading(false);
      }
    };

    fetchSession();

    // Set up the auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_OUT' || event === 'USER_DELETED') {
        setUser(null);
        navigate('/');
      } else if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        setUser(session?.user ?? null);
      } else if (event === 'USER_UPDATED') {
        setUser(session?.user ?? null);
      }

      setLoading(false);
    });

    // Clean up subscription when component unmounts
    return () => {
      subscription.unsubscribe();
    };
  }, [navigate]);

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      setUser(null);
      navigate('/');
    } catch (error) {
      console.error('Sign out error:', error);
      // Force clear the session if sign out fails
      setUser(null);
      navigate('/');
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}