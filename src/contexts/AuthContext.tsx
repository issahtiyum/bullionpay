
import React, { createContext, useState, useContext, useEffect } from 'react';

type User = {
  contact: string; // phone number or email
  firstName?: string;
  lastName?: string;
  isAuthenticated: boolean;
};

type AuthContextType = {
  user: User | null;
  login: (contact: string, firstName?: string, lastName?: string) => void;
  logout: () => void;
  isAuthenticated: boolean;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  login: () => {},
  logout: () => {},
  isAuthenticated: false,
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  
  // Check for saved login in localStorage on initial load
  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  const login = (contact: string, firstName?: string, lastName?: string) => {
    const newUser = { 
      contact, 
      firstName, 
      lastName, 
      isAuthenticated: true 
    };
    setUser(newUser);
    localStorage.setItem('user', JSON.stringify(newUser));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      login, 
      logout, 
      isAuthenticated: !!user 
    }}>
      {children}
    </AuthContext.Provider>
  );
};
