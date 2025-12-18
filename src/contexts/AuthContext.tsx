import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { authService } from '@/services/auth';

interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  plan: string;
  stats: {
    gamesOwned: number;
    friends: number;
    achievements: number;
    hoursPlayed: number;
  };
  gamesCreated: number;
  aiCredits: number;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: () => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const token = urlParams.get('token');
      
      if (token) {
        authService.setToken(token);
        window.history.replaceState({}, document.title, window.location.pathname);
      }

      if (authService.isAuthenticated()) {
        try {
          const response = await authService.getProfile();
          setUser(response.user);
        } catch (error) {
          console.error('Auth error:', error);
          authService.logout();
        }
      }
      
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = () => {
    authService.login();
  };

  const logout = () => {
    authService.logout();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};