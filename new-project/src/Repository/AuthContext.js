import { createContext, useContext, useState } from 'react';
import api from '../api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem('token') || null);
  const [user, setUser] = useState(null); 

  const login = async (credentials) => {
    const res = await api.post('/login', credentials);
    setToken(res.data.access_token);
    localStorage.setItem('token', res.data.access_token);
    return res.data;
  };

  const register = async (userData) => {
    const res = await api.post('/register', userData);
    return res.data;
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
  };

  return (
    <AuthContext.Provider value={{ token, login, register, logout, user }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);