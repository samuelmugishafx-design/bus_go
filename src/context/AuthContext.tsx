import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole } from '../types';
import { storageService } from '../services/storageService';
import { DEMO_USERS } from '../data/demoData';

interface AuthContextType {
  currentUser: User | null;
  login: (phoneOrEmail: string) => boolean;
  register: (name: string, phone: string, email?: string) => User;
  logout: () => void;
  switchDemoRole: (role: UserRole, agencyId?: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(() => storageService.getCurrentUser());

  useEffect(() => {
    const unsubscribe = storageService.onDataChange(() => {
      setCurrentUser(storageService.getCurrentUser());
    });
    return unsubscribe;
  }, []);

  const login = (phoneOrEmail: string): boolean => {
    const clean = phoneOrEmail.trim().toLowerCase();
    const users = storageService.getUsers();
    const match = users.find(
      (u) =>
        u.email?.toLowerCase() === clean ||
        u.phone.replace(/\s+/g, '') === clean.replace(/\s+/g, '') ||
        u.phone.endsWith(clean)
    );

    if (match) {
      storageService.setCurrentUser(match);
      setCurrentUser(match);
      return true;
    }

    // Default to demo passenger if not found
    const demoUser = DEMO_USERS[0];
    storageService.setCurrentUser(demoUser);
    setCurrentUser(demoUser);
    return true;
  };

  const register = (name: string, phone: string, email?: string): User => {
    const newUser = storageService.registerUser({
      name,
      phone,
      email,
      role: 'passenger',
    });
    setCurrentUser(newUser);
    return newUser;
  };

  const logout = () => {
    // Revert to demo passenger
    const demo = DEMO_USERS[0];
    storageService.setCurrentUser(demo);
    setCurrentUser(demo);
  };

  const switchDemoRole = (role: UserRole, agencyId?: string) => {
    const users = storageService.getUsers();
    let found = users.find((u) => u.role === role && (!agencyId || u.agencyId === agencyId));
    if (!found) {
      found = DEMO_USERS.find((u) => u.role === role && (!agencyId || u.agencyId === agencyId));
    }
    if (found) {
      storageService.setCurrentUser(found);
      setCurrentUser(found);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        login,
        register,
        logout,
        switchDemoRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
