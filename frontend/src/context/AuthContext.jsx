import { createContext, useContext, useState, useEffect } from 'react';
import { login as apiLogin, register as apiRegister } from '../api/authApi';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Re-hydrate user from localStorage on mount
  useEffect(() => {
    const token = localStorage.getItem('lh_token');
    const stored = localStorage.getItem('lh_user');
    if (token && stored) {
      try {
        setUser(JSON.parse(stored));
      } catch {
        localStorage.removeItem('lh_user');
      }
    }
    setLoading(false);
  }, []);

  const login = async (credentials) => {
    const { data } = await apiLogin(credentials);
    localStorage.setItem('lh_token', data.token);
    localStorage.setItem('lh_user', JSON.stringify(data.user));
    setUser(data.user);
    return data.user;
  };

  const register = async (userData) => {
    const { data } = await apiRegister(userData);
    localStorage.setItem('lh_token', data.token);
    localStorage.setItem('lh_user', JSON.stringify(data.user));
    setUser(data.user);
    return data.user;
  };

  const logout = () => {
    localStorage.removeItem('lh_token');
    localStorage.removeItem('lh_user');
    setUser(null);
  };

  const updateUser = (updates) => {
    const updated = { ...user, ...updates };
    localStorage.setItem('lh_user', JSON.stringify(updated));
    setUser(updated);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
