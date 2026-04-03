import { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem('user');
    const token  = localStorage.getItem('token');
    if (stored && token) {
      setUser(JSON.parse(stored));
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    const res = await api.post('/login', { email, password });
    const data = res.data;

    if (data?.requires_verification) {
      return data;
    }

    const { token, user: userData } = data;
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
    return { user: userData };
  };

  const verifyLoginCode = async (challengeToken, code) => {
    const res = await api.post('/login/verify', {
      challenge_token: challengeToken,
      code,
    });

    const { token, user: userData } = res.data;
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);

    return userData;
  };

  const logout = async () => {
    try {
      await api.post('/logout');
    } catch (_) { /* ignore */ }
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, verifyLoginCode, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
