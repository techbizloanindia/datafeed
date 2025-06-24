"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';

// Define user type
export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  cluster?: string;
  branch?: string;
}

// Define context type
interface UserContextType {
  user: User | null;
  isLoading: boolean;
  login: (userData: User) => void;
  logout: () => void;
}

// Create context
const UserContext = createContext<UserContextType | undefined>(undefined);

// Provider component
export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // Check for user data in session storage on mount
  useEffect(() => {
    const storedUser = sessionStorage.getItem('currentUser');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error('Error parsing user data:', error);
        sessionStorage.removeItem('currentUser');
      }
    }
    setIsLoading(false);
  }, []);

  // Login function
  const login = (userData: User) => {
    setUser(userData);
    sessionStorage.setItem('currentUser', JSON.stringify(userData));
  };

  // Logout function
  const logout = () => {
    setUser(null);
    sessionStorage.removeItem('currentUser');
    
    // Also clear Google auth cookies via API
    fetch('/api/auth/logout', {
      method: 'POST',
      credentials: 'include',
    }).catch(error => {
      console.error('Error logging out:', error);
    });
    
    router.push('/login');
  };

  return (
    <UserContext.Provider value={{ user, isLoading, login, logout }}>
      {children}
    </UserContext.Provider>
  );
}

// Custom hook to use the context
export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
} 