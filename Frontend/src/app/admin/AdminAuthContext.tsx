import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

const STORAGE_KEY = 'throttle_lk_admin_token';

type AdminAuthContextValue = {
  token: string | null;
  setToken: (token: string | null) => void;
  logout: () => void;
};

const AdminAuthContext = createContext<AdminAuthContextValue | undefined>(
  undefined,
);

export function AdminAuthProvider({ children }: { children: ReactNode }) {
  const [token, setTokenState] = useState<string | null>(() =>
    typeof window !== 'undefined' ? localStorage.getItem(STORAGE_KEY) : null,
  );

  const setToken = useCallback((value: string | null) => {
    setTokenState(value);
    if (typeof window === 'undefined') return;
    if (value) {
      localStorage.setItem(STORAGE_KEY, value);
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, []);

  const logout = useCallback(() => {
    setToken(null);
  }, [setToken]);

  const value = useMemo(
    () => ({ token, setToken, logout }),
    [token, setToken, logout],
  );

  return (
    <AdminAuthContext.Provider value={value}>
      {children}
    </AdminAuthContext.Provider>
  );
}

export function useAdminAuth() {
  const ctx = useContext(AdminAuthContext);
  if (!ctx) {
    throw new Error('useAdminAuth must be used within AdminAuthProvider');
  }
  return ctx;
}
