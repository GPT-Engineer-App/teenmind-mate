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

  useEffect(() => {
    // Check for existing user session
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setIsLoading(false);
  }, []);

  const login = async (username, password, isAdminLogin = false) => {
    try {
      let response;
      if (isAdminLogin) {
        response = await fetch('/api/auth/admin-login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username, password }),
        });
      } else {
        response = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username, password }),
        });
      }
      
      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
        return true;
      }
    } catch (error) {
      console.error('Login error:', error);
    }
    return false;
  };

  const register = async (username, email, password) => {
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, password }),
      });
      if (response.ok) {
        return true;
      }
    } catch (error) {
      console.error('Registration error:', error);
    }
    return false;
  };

  const logout = () => {
    setUser(null);
    // You might want to call an API endpoint to invalidate the session on the server
  };

  const changePassword = async (newPassword) => {
    try {
      const response = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ newPassword }),
      });
      if (response.ok) {
        const updatedUser = { ...user, isDefaultPassword: false };
        setUser(updatedUser);
        return true;
      }
    } catch (error) {
      console.error('Change password error:', error);
    }
    return false;
  };

  const updateProfile = async (profileData) => {
    try {
      const response = await fetch('/api/auth/update-profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profileData),
      });
      if (response.ok) {
        const updatedUser = await response.json();
        setUser(updatedUser);
        return true;
      }
    } catch (error) {
      console.error('Update profile error:', error);
    }
    return false;
  };

  const value = {
    user,
    login,
    logout,
    changePassword,
    register,
    updateProfile,
    isLoading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
