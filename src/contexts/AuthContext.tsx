import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react';
import { authApi } from '../lib/api';

interface User {
  id: string;
  email: string;
  role: 'ADMIN' | 'FARMER';
  first_name?: string;
  last_name?: string;
  phone?: string;
  avatar_url?: string | null;
  created_at?: string;
  updated_at?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUp: (email: string, password: string, userData?: Partial<User>) => Promise<{ error: Error | null }>;
  signOut: () => Promise<{ error: Error | null }>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const isAuthenticated = !!user;

  // Fetch current user from API
  const fetchCurrentUser = useCallback(async () => {
    try {
      const response = await authApi.getCurrentUser();
      if (response.error === 'UNAUTHORIZED') {
        setUser(null);
        return null;
      }
      if (response.data) {
        setUser(response.data);
      } else {
        setUser(null);
      }
      return response.data;
    } catch (error) {
      console.error('Failed to fetch user:', error);
      setUser(null);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Check authentication status on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        await fetchCurrentUser();
      } catch (error) {
        console.error('Auth check failed:', error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [fetchCurrentUser]);

  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true);
      // Ensure CSRF cookie is present before POSTing credentials
      await authApi.csrf();
      const response = await authApi.login({ email, password });
      
      if (response.error) {
        return { error: new Error(response.error) };
      }
      
      // Fetch the user profile after successful login
      await fetchCurrentUser();
      return { error: null };
    } catch (error) {
      console.error('Sign in error:', error);
      setUser(null);
      return { 
        error: error instanceof Error ? error : new Error('Failed to sign in') 
      };
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email: string, password: string, userData: Partial<User> = {}) => {
    try {
      setLoading(true);
      // Ensure CSRF cookie is present before POSTing registration
      await authApi.csrf();
      // Call the registration API
      const response = await authApi.register({
        email,
        password,
        password2: password,
        ...userData,
        role: 'FARMER', // Default role for new users
      });
      
      if (response.error) {
        return { error: new Error(response.error) };
      }
      
      // Automatically sign in after successful registration
      return await signIn(email, password);
    } catch (error) {
      console.error('Sign up error:', error);
      setUser(null);
      return { 
        error: error instanceof Error ? error : new Error('Failed to sign up') 
      };
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setLoading(true);
      // Ensure CSRF cookie is present before POSTing logout
      await authApi.csrf();
      await authApi.logout();
      setUser(null);
      return { error: null };
    } catch (error) {
      console.error('Sign out error:', error);
      // Even if logout fails, clear the user state
      setUser(null);
      return { 
        error: error instanceof Error ? error : new Error('Failed to sign out') 
      };
    } finally {
      setLoading(false);
    }
  };
  
  const refreshUser = async () => {
    await fetchCurrentUser();
  };

  return (
    <AuthContext.Provider 
      value={{
        user,
        loading,
        isAuthenticated,
        signIn,
        signUp,
        signOut,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
