import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { api } from '../lib/api';

const AuthContext = createContext(null);
const TOKEN_KEY = 'kopahub_token';
function getStoredToken() { return localStorage.getItem(TOKEN_KEY) || sessionStorage.getItem(TOKEN_KEY) || ''; }

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(getStoredToken);
  const [ready, setReady] = useState(false);

  const persistToken = (value, rememberMe) => {
    if (rememberMe) { localStorage.setItem(TOKEN_KEY, value); sessionStorage.removeItem(TOKEN_KEY); }
    else { sessionStorage.setItem(TOKEN_KEY, value); localStorage.removeItem(TOKEN_KEY); }
  };
  const login = async (payload, rememberMe = true) => {
    const { data } = await api.post('/auth/login', payload);
    persistToken(data.token, rememberMe); setToken(data.token); setUser(data.user); setReady(true); return data;
  };
  const register = async (payload, rememberMe = true) => {
    const { data } = await api.post('/auth/register', payload);
    persistToken(data.token, rememberMe); setToken(data.token); setUser(data.user); setReady(true); return data;
  };
  const logout = () => { localStorage.removeItem(TOKEN_KEY); sessionStorage.removeItem(TOKEN_KEY); setToken(''); setUser(null); setReady(true); };
  const fetchMe = async () => {
    if (!token) { setReady(true); return null; }
    try { const { data } = await api.get('/auth/me'); setUser(data.user); return data.user; }
    catch (error) { logout(); throw error; }
    finally { setReady(true); }
  };
  const forgotPassword = async (email) => (await api.post('/auth/forgot-password', { email })).data;
  const resetPassword = async (payload) => (await api.post('/auth/reset-password', payload)).data;

  useEffect(() => { if (token) fetchMe().catch(() => {}); else setReady(true); }, []);

  const value = useMemo(() => ({ token, user, ready, login, register, logout, forgotPassword, resetPassword, fetchMe }), [token, user, ready]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
}
