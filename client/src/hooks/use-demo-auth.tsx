import { createContext, ReactNode, useContext, useState, useEffect } from "react";
import { User } from "@shared/schema";
import { useLocation } from "wouter";

type AuthContextType = {
  user: User | null;
  isLoading: boolean;
  setRole: (role: 'passenger' | 'driver' | 'admin') => void;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | null>(null);

// Demo users - no backend needed
const DEMO_USERS: Record<string, User> = {
  passenger: { id: 1, role: 'passenger', name: 'Ravi Passenger' },
  driver: { id: 2, role: 'driver', name: 'Kumar Driver' },
  admin: { id: 3, role: 'admin', name: 'Admin Officer' }
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [, setLocation] = useLocation();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load user from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('demo_user_role');
    if (saved && saved in DEMO_USERS) {
      setUser(DEMO_USERS[saved as keyof typeof DEMO_USERS]);
    }
    setIsLoading(false);
  }, []);

  const handleSetRole = (role: 'passenger' | 'driver' | 'admin') => {
    const demoUser = DEMO_USERS[role];
    localStorage.setItem('demo_user_role', role);
    setUser(demoUser);
    
    // Auto-navigate based on role
    if (role === 'driver') setLocation('/driver');
    else if (role === 'admin') setLocation('/admin');
    else setLocation('/dashboard');
  };

  const handleLogout = () => {
    localStorage.removeItem('demo_user_role');
    setUser(null);
    setLocation('/');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        setRole: handleSetRole,
        logout: handleLogout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
