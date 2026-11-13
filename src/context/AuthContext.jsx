import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { api } from '../lib/api';

const AuthContext = createContext(null);

function getStoredToken() {
  return localStorage.getItem('kopahub_token') || sessionStorage.getItem('kopahub_token') || '';
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(getStoredToken);

  const persistToken = (nextToken, rememberMe) => {
    if (rememberMe) {
      localStorage.setItem('kopahub_token', nextToken);
      sessionStorage.removeItem('kopahub_token');
      return;
    }

    sessionStorage.setItem('kopahub_token', nextToken);
    localStorage.removeItem('kopahub_token');
  };

  useEffect(() => {
    const activeToken = getStoredToken();
    if (activeToken) {
      setToken(activeToken);
    }
  }, []);

  useEffect(() => {
    if (token) {
      persistToken(token, true);
    } else {
      localStorage.removeItem('kopahub_token');
      sessionStorage.removeItem('kopahub_token');
    }
  }, [token]);

  const login = async (payload, rememberMe = true) => {
    const response = await api.post('/auth/login', payload);
    const { token: jwtToken, user: nextUser } = response.data;
    setToken(jwtToken);
    setUser(nextUser);
    persistToken(jwtToken, rememberMe);
    return response.data;
  };

  const register = async (payload, rememberMe = true) => {
    const response = await api.post('/auth/register', payload);
    const { token: jwtToken, user: nextUser } = response.data;
    setToken(jwtToken);
    setUser(nextUser);
    persistToken(jwtToken, rememberMe);
    return response.data;
  };

  const logout = () => {
    setToken('');
    setUser(null);
    localStorage.removeItem('kopahub_token');
    sessionStorage.removeItem('kopahub_token');
  };

  const forgotPassword = async (email) => {
    const response = await api.post('/auth/forgot-password', { email });
    return response.data;
  };

  const resetPassword = async ({ token: resetToken, password, confirmPassword }) => {
    const response = await api.post('/auth/reset-password', { token: resetToken, password, confirmPassword });
    return response.data;
  };

  const fetchMe = async () => {
    if (!token) return null;

    const response = await api.get('/auth/me');
    setUser(response.data.user);
    return response.data.user;
  };

  useEffect(() => {
    if (token) {
      fetchMe().catch(() => logout());
    }
  }, [token]);

  const value = useMemo(
    () => ({ token, user, login, register, logout, forgotPassword, resetPassword, fetchMe }),
    [token, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
}
