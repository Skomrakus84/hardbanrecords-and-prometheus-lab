import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem('jwtToken'));
  const [refreshToken, setRefreshToken] = useState(() => localStorage.getItem('refreshToken'));
  const [user, setUser] = useState(null);

  useEffect(() => {
    if (token) {
      localStorage.setItem('jwtToken', token);
    } else {
      localStorage.removeItem('jwtToken');
    }
    if (refreshToken) {
      localStorage.setItem('refreshToken', refreshToken);
    } else {
      localStorage.removeItem('refreshToken');
    }
  }, [token, refreshToken]);

  const login = (jwt, refresh) => {
    setToken(jwt);
    setRefreshToken(refresh);
  };

  const logout = () => {
    setToken(null);
    setRefreshToken(null);
    setUser(null);
  };

  const authFetch = async (url, options = {}) => {
    const headers = options.headers || {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    const res = await fetch(url, { ...options, headers });
    if (res.status === 401 && refreshToken) {
      const refreshRes = await fetch('/api/auth/refresh', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken }),
      });
      const refreshData = await refreshRes.json();
      if (refreshRes.ok && refreshData.token) {
        setToken(refreshData.token);
        headers['Authorization'] = `Bearer ${refreshData.token}`;
        return fetch(url, { ...options, headers });
      } else {
        logout();
      }
    }
    return res;
  };

  return (
    <AuthContext.Provider value={{ token, refreshToken, user, login, logout, authFetch }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}