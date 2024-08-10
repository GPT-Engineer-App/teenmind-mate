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
  isDefaultPassword: true
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

  const login = async (username, password) => {
    try {
      const adminUser = db.get('adminUser');
      if (adminUser && adminUser.username === username) {
        const isPasswordValid = await bcrypt.compare(password, adminUser.password);
        if (isPasswordValid) {
          setUser(adminUser);
          return true;
        }
      } 

      const user = db.get(username); // Get user from Replit DB
      if (user) {
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (isPasswordValid) {
          setUser(user);
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
        setUser(db.get(userInfo.name));
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
        return res.status(400).json({ error: 'Username already exists' });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Create user in Replit DB
      db.set(username, { 
        username, 
        email, 
        password: hashedPassword, 
        role: 'user', 
        isVerified: false 
      });

      // ... (rest of the registration logic, like sending verification email)

      return true;
    } catch (error) {
      console.error('Registration error:', error);
    }
    return false;
  };

  // ... (other functions: logout, changePassword, updateProfile)

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, changePassword, register, updateProfile, replitLogin }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
