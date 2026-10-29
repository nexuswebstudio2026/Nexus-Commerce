import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';
import { INITIAL_USERS } from '../mockData';
import { ensureUserIsSuperadmin, enforceSuperadminRole } from '../userUtils';

interface AuthContextType {
  currentUser: User | null;
  loading: boolean;
  loginWithEmail: (email: string, pass: string) => Promise<User>;
  logout: () => Promise<void>;
  setCurrentUser: React.Dispatch<React.SetStateAction<User | null>>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('nexus_prime_session');
    if (saved) {
      try {
        return ensureUserIsSuperadmin(JSON.parse(saved));
      } catch (e) {
        return ensureUserIsSuperadmin(INITIAL_USERS[0]);
      }
    }
    return ensureUserIsSuperadmin(INITIAL_USERS[0]);
  });
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('nexus_prime_session', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('nexus_prime_session');
    }
  }, [currentUser]);

  const loginWithEmail = async (email: string, _pass: string): Promise<User> => {
    setLoading(true);
    // Find or simulate user login
    const found = INITIAL_USERS.find(u => u.email.toLowerCase() === email.toLowerCase());
    const loggedUser = found ? ensureUserIsSuperadmin(found) : ensureUserIsSuperadmin({
      id: `usr-${Date.now()}`,
      name: email.split('@')[0],
      email,
      role: 'superadmin',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      businessIds: ['biz-imperio-lux', 'biz-aura'],
      activeBusinessId: 'biz-imperio-lux',
    });
    setCurrentUser(loggedUser);
    setLoading(false);
    return loggedUser;
  };

  const logout = async () => {
    setCurrentUser(null);
    localStorage.removeItem('nexus_prime_session');
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        loading,
        loginWithEmail,
        logout,
        setCurrentUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe ser utilizado dentro de un <AuthProvider>');
  }
  return context;
}
