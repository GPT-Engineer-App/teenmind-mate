import React from 'react';
import { createContext, useContext, useState, useEffect } from 'react';
import bcrypt from 'bcryptjs';
import { getUserInfo } from '@replit/repl-auth';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

const DEFAULT_ADMIN = {
  username: 'admin',
  password: 'admin123', // This will be hashed in the useEffect
  role: 'admin',
  isDefaultPassword: true,
  email: 'admin@example.com' // Added email for admin
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initializeAdmin = async () => {
      // Check if admin user exists in Replit DB
      if (!db.get('adminUser')) {
        const hashedPassword = await bcrypt.hash(DEFAULT_ADMIN.password, 10);
        db.set('adminUser', { ...DEFAULT_ADMIN, password: hashedPassword });
      }
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
      let loginUser;
      if (isAdminLogin) {
        loginUser = db.get('adminUser');
      } else {
        loginUser = db.get(username);
      }

      if (loginUser && loginUser.username === username) {
        const isPasswordValid = await bcrypt.compare(password, loginUser.password);
        if (isPasswordValid) {
          setUser(loginUser);
          localStorage.setItem('user', JSON.stringify(loginUser)); // Store user in localStorage
          return true;
        }
      }
    } catch (error) {
      console.error('Login error:', error);
    }
    return false;
  };

  const replitLogin = async (req) => {
    try {
      const userInfo = await getUserInfo(req);
      if (userInfo) {
        // Check if user exists in Replit DB, if not, create one
        if (!db.get(userInfo.name)) {
          const hashedPassword = await bcrypt.hash(userInfo.id, 10); // Hash Replit user ID as password
          db.set(userInfo.name, { 
            username: userInfo.name, 
            password: hashedPassword, 
            role: 'user', 
            isVerified: true, // Replit users are considered verified
            email: userInfo.email 
          });
        }
        const replitUser = db.get(userInfo.name);
        setUser(replitUser);
        localStorage.setItem('user', JSON.stringify(replitUser)); // Store user in localStorage
        return true;
      }
    } catch (error) {
      console.error('Replit login error:', error);
    }
    return false;
  };

  const register = async (username, email, password) => {
    try {
      // Check if user already exists
      if (db.get(username)) {
        return false; // Or throw an error
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Create user in Replit DB
      db.set(username, { 
        username, 
        email, 
        password: hashedPassword, 
        role: 'user', 
        isVerified: false,
        isDefaultPassword: false
      });

      // ... (rest of the registration logic, like sending verification email)

      return true;
    } catch (error) {
      console.error('Registration error:', error);
    }
    return false;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user'); // Remove user from localStorage
  };

  const changePassword = async (newPassword) => {
    try {
      if (!user) {
        throw new Error('User not logged in');
      }

      const hashedNewPassword = await bcrypt.hash(newPassword, 10);

      db.set(user.username, { ...user, password: hashedNewPassword, isDefaultPassword: false });
      setUser({ ...user, password: hashedNewPassword, isDefaultPassword: false });
      localStorage.setItem('user', JSON.stringify({ ...user, password: hashedNewPassword, isDefaultPassword: false })); // Update user in localStorage
    } catch (error) {
      console.error('Change password error:', error);
      throw error;
    }
  };

  const updateProfile = async (profileData) => {
    try {
      if (!user) {
        throw new Error('User not logged in');
      }

      db.set(user.username, { ...user, ...profileData });
      setUser({ ...user, ...profileData });
      localStorage.setItem('user', JSON.stringify({ ...user, ...profileData })); // Update user in localStorage
    } catch (error) {
      console.error('Update profile error:', error);
      throw error;
    }
  };

  const value = {
    user,
    login,
    logout,
    changePassword,
    register,
    updateProfile,
    isLoading,
    replitLogin
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
