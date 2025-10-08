'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { apiService } from '../api-service';

interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
  department: string;
  employeeNumber?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: {
    name: string;
    email: string;
    password: string;
    employeeNumber: string;
    role: string;
    department: string;
    manager?: string;
  }) => Promise<void>;
  logout: () => void;
  updateProfile: (data: { name?: string; department?: string }) => Promise<void>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>;
  forgotPassword: (email: string) => Promise<void>;
  resetPassword: (token: string, password: string) => Promise<void>;
  refreshToken: () => Promise<void>;
  getProfile: () => Promise<User>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize auth state from localStorage
  useEffect(() => {
    const initializeAuth = () => {
      try {
        console.log('🔐 AuthContext: Initializing authentication...');
        const storedToken = localStorage.getItem('token');
        const storedUser = localStorage.getItem('currentUser');
        
        console.log('🔐 AuthContext: Token exists:', !!storedToken);
        console.log('🔐 AuthContext: User exists:', !!storedUser);
        
        if (storedToken && storedUser) {
          setToken(storedToken);
          const userData = JSON.parse(storedUser);
          setUser(userData);
          console.log('🔐 AuthContext: User loaded:', userData.email);
        } else {
          console.warn('🔐 AuthContext: No stored auth data found');
        }
      } catch (error) {
        console.error('🔐 AuthContext: Error initializing auth state:', error);
        // Clear invalid data
        localStorage.removeItem('token');
        localStorage.removeItem('currentUser');
      } finally {
        setIsLoading(false);
        console.log('🔐 AuthContext: Initialization complete');
      }
    };

    initializeAuth();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const data = await apiService.login({ email, password });
      
      // Handle various token/user shapes
      const authToken = data?.token || data?.accessToken || data?.jwt || data?.data?.token;
      const userData = data?.user || data?.data?.user || data?.profile || data;

      if (!authToken) {
        throw new Error('Authentication succeeded but no token was returned.');
      }

      // Store in localStorage
      localStorage.setItem('token', authToken);
      if (userData) {
        localStorage.setItem('currentUser', JSON.stringify(userData));
      }

      // Update state
      setToken(authToken);
      setUser(userData);
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const register = async (userData: {
    name: string;
    email: string;
    password: string;
    employeeNumber: string;
    role: string;
    department: string;
    manager?: string;
  }) => {
    try {
      await apiService.signup({
        ...userData,
        role: userData.role as 'admin' | 'brand_admin' | 'user'
      });
      // Registration successful, user needs to login
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  };

  const logout = () => {
    // Clear localStorage
    localStorage.removeItem('token');
    localStorage.removeItem('currentUser');
    
    // Clear state
    setToken(null);
    setUser(null);
  };

  const updateProfile = async (data: { name?: string; department?: string }) => {
    try {
      const updatedUser = await apiService.updateProfile(data);
      
      // Update stored user data
      const currentUser = { ...user, ...updatedUser };
      localStorage.setItem('currentUser', JSON.stringify(currentUser));
      setUser(currentUser);
    } catch (error) {
      console.error('Update profile error:', error);
      throw error;
    }
  };

  const changePassword = async (currentPassword: string, newPassword: string) => {
    try {
      await apiService.changePassword({ currentPassword, newPassword });
    } catch (error) {
      console.error('Change password error:', error);
      throw error;
    }
  };

  const forgotPassword = async (email: string) => {
    try {
      await apiService.forgotPassword(email);
    } catch (error) {
      console.error('Forgot password error:', error);
      throw error;
    }
  };

  const resetPassword = async (token: string, password: string) => {
    try {
      await apiService.resetPassword({ token, password });
    } catch (error) {
      console.error('Reset password error:', error);
      throw error;
    }
  };

  const refreshToken = async () => {
    try {
      const data = await apiService.refreshToken();
      const newToken = data?.token || data?.accessToken || data?.jwt || data?.data?.token;
      
      if (newToken) {
        localStorage.setItem('token', newToken);
        setToken(newToken);
      }
    } catch (error) {
      console.error('Refresh token error:', error);
      // If refresh fails, logout user
      logout();
      throw error;
    }
  };

  const getProfile = async (): Promise<User> => {
    try {
      const userData = await apiService.getProfile();
      
      // Update stored user data
      localStorage.setItem('currentUser', JSON.stringify(userData));
      setUser(userData);
      
      return userData;
    } catch (error) {
      console.error('Get profile error:', error);
      throw error;
    }
  };

  const value: AuthContextType = {
    user,
    token,
    isAuthenticated: !!user && !!token,
    isLoading,
    login,
    register,
    logout,
    updateProfile,
    changePassword,
    forgotPassword,
    resetPassword,
    refreshToken,
    getProfile,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
