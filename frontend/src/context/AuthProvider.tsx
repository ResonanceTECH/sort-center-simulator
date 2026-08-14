import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { AuthContext, type AuthContextValue } from '@/context/authContext';
import * as authService from '@/services/authService';
import type { LoginData, RegisterData, User } from '@/types/auth';

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function initAuth() {
      try {
        const currentUser = await authService.getCurrentUser();
        if (!cancelled) {
          setUser(currentUser);
        }
      } catch {
        if (!cancelled) {
          authService.logout();
          setUser(null);
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    void initAuth();

    return () => {
      cancelled = true;
    };
  }, []);

  const login = useCallback(async (data: LoginData) => {
    const response = await authService.login(data);
    setUser(response.user);
  }, []);

  const register = useCallback(async (data: RegisterData) => {
    const response = await authService.register(data);
    setUser(response.user);
  }, []);

  const logout = useCallback(() => {
    authService.logout();
    setUser(null);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isAuthenticated: Boolean(user),
      isLoading,
      login,
      register,
      logout,
    }),
    [user, isLoading, login, register, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
