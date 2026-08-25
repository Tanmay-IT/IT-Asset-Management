import { useCallback, useEffect, useState } from 'react';
import { AuthContext } from '../hooks/useAuth';
import { api } from '../lib/api';

function getStoredToken() {
  try {
    return localStorage.getItem('auth-token');
  } catch {
    return null;
  }
}

export function AuthProvider({ children }) {
  const [token, setToken] = useState(getStoredToken);
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadUser = useCallback(() => {
    if (!getStoredToken()) {
      setUser(null);
      setIsLoading(false);
      return;
    }
    api
      .get('/api/auth/me')
      .then(({ data }) => setUser(data))
      .catch(() => {
        setUser(null);
        setToken(null);
      })
      .finally(() => setIsLoading(false));
  }, []);

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  // A 401 from any request (expired/invalid token) clears the session here too.
  useEffect(() => {
    function handleUnauthorized() {
      setToken(null);
      setUser(null);
    }
    window.addEventListener('auth:unauthorized', handleUnauthorized);
    return () => window.removeEventListener('auth:unauthorized', handleUnauthorized);
  }, []);

  async function login(email, password) {
    const { data } = await api.post('/api/auth/login', { email, password });
    try {
      localStorage.setItem('auth-token', data.token);
    } catch {
      // ignore storage failures
    }
    setToken(data.token);
    setUser(data.user);
  }

  function logout() {
    try {
      localStorage.removeItem('auth-token');
    } catch {
      // ignore
    }
    setToken(null);
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, isLoading, isAuthenticated: Boolean(token && user), login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
