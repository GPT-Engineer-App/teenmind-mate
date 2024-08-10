import React from 'react';
import { createContext, useContext, useState, useEffect } from 'react';
import bcrypt from 'bcryptjs';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

const DEFAULT_ADMIN = {
  username: 'admin',
  password: 'admin123', // This will be hashed in the useEffect
  role: 'admin',
  isDefaultPassword: true
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initializeAdmin = async () => {
      const hashedPassword = await bcrypt.hash(DEFAULT_ADMIN.password, 10);
      localStorage.setItem('adminUser', JSON.stringify({...DEFAULT_ADMIN, password: hashedPassword}));
      setIsLoading(false);
    };
    initializeAdmin();
  }, []);

  const login = async (username, password) => {
    const storedUser = JSON.parse(localStorage.getItem('adminUser'));
    if (storedUser && storedUser.username === username) {
      const isMatch = await bcrypt.compare(password, storedUser.password);
      if (isMatch) {
        setUser({...storedUser, password: undefined});
        return true;
      }
    }
    return false;
  };

  const logout = () => {
    setUser(null);
  };

  const changePassword = async (newPassword) => {
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    const updatedUser = {...user, password: hashedPassword, isDefaultPassword: false};
    localStorage.setItem('adminUser', JSON.stringify(updatedUser));
    setUser({...updatedUser, password: undefined});
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, changePassword }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
