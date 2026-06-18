import { createContext, useContext, useState, useEffect } from 'react';
import { authApi } from '../api/client';

const AuthContext = createContext(null);

function normalizeUser(user) {
  if (!user) return null;
  return { ...user, id: user.id || user._id };
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      authApi.me()
        .then((u) => setUser(normalizeUser(u)))
        .catch(() => localStorage.removeItem('token'))
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email, password) => {
    const data = await authApi.login(email, password);
    localStorage.setItem('token', data.token);
    const normalized = normalizeUser(data.user);
    setUser(normalized);
    return normalized;
  };

  const register = async (body) => {
    const data = await authApi.register(body);
    localStorage.setItem('token', data.token);
    const normalized = normalizeUser(data.user);
    setUser(normalized);
    return normalized;
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, setUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
