import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { User, Profile, ApiLog } from '../types';
import { apiService, setApiLogListener } from '../services/api';

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  token: string;
  serverStatus: boolean | null;
  logs: ApiLog[];
  loadingSession: boolean;
  activeView: 'landing' | 'dashboard' | 'profile' | 'auth' | 'console';
  setActiveView: (view: 'landing' | 'dashboard' | 'profile' | 'auth' | 'console') => void;
  login: (identifier: string, password: string) => Promise<{ success: boolean; message?: string }>;
  register: (name: string, email: string, username: string, password: string) => Promise<{ success: boolean; message?: string }>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  clearLogs: () => void;
  addLog: (method: string, endpoint: string, status: number, data: any) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string>(() => localStorage.getItem('access_token') || '');
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [serverStatus, setServerStatus] = useState<boolean | null>(null);
  const [logs, setLogs] = useState<ApiLog[]>([]);
  const [loadingSession, setLoadingSession] = useState<boolean>(true);
  const [activeView, setActiveView] = useState<'landing' | 'dashboard' | 'profile' | 'auth' | 'console'>('landing');

  const addLog = (method: string, endpoint: string, status: number, data: any) => {
    const newLog: ApiLog = {
      id: Math.random().toString(36).substring(2, 9),
      time: new Date().toLocaleTimeString(),
      method,
      endpoint,
      status,
      data,
    };
    setLogs((prev) => [newLog, ...prev]);
  };

  useEffect(() => {
    setApiLogListener(addLog);

    // Check server health
    apiService.checkHealth().then((isHealthy) => setServerStatus(isHealthy));

    // Handle OAuth redirect token capture
    const params = new URLSearchParams(window.location.search);
    const urlToken = params.get('token');
    if (urlToken) {
      setToken(urlToken);
      localStorage.setItem('access_token', urlToken);
      addLog('GET', '/api/auth/oauth/callback', 200, { message: 'OAuth redirect token captured!' });
      setActiveView('dashboard');
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  // Fetch User and Profile whenever token changes
  useEffect(() => {
    const loadSessionData = async () => {
      if (!token) {
        setUser(null);
        setProfile(null);
        setLoadingSession(false);
        return;
      }

      setLoadingSession(true);
      const userRes = await apiService.getMe(token);
      if (userRes.success && userRes.user) {
        setUser(userRes.user);
        const profileRes = await apiService.getProfile(token);
        if (profileRes.success && profileRes.profile) {
          setProfile(profileRes.profile);
        } else {
          setProfile(null);
        }
      } else {
        // Token invalid or expired
        setUser(null);
        setProfile(null);
        setToken('');
        localStorage.removeItem('access_token');
      }
      setLoadingSession(false);
    };

    loadSessionData();
  }, [token]);

  const login = async (identifier: string, password: string) => {
    const res = await apiService.login({ identifier, password });
    if (res.success && res.token) {
      setToken(res.token);
      localStorage.setItem('access_token', res.token);
      if (res.user) setUser(res.user);
      setActiveView('dashboard');
      return { success: true };
    }
    return { success: false, message: res.message || 'Login failed' };
  };

  const register = async (name: string, email: string, username: string, password: string) => {
    const res = await apiService.register({ name, email, username, password });
    if (res.success && res.token) {
      setToken(res.token);
      localStorage.setItem('access_token', res.token);
      if (res.user) setUser(res.user);
      setActiveView('dashboard');
      return { success: true };
    }
    return { success: false, message: res.message || 'Registration failed' };
  };

  const logout = async () => {
    await apiService.logout();
    setToken('');
    setUser(null);
    setProfile(null);
    localStorage.removeItem('access_token');
    setActiveView('landing');
  };

  const refreshProfile = async () => {
    if (!token) return;
    const profileRes = await apiService.getProfile(token);
    if (profileRes.success && profileRes.profile) {
      setProfile(profileRes.profile);
    }
  };

  const clearLogs = () => setLogs([]);

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        token,
        serverStatus,
        logs,
        loadingSession,
        activeView,
        setActiveView,
        login,
        register,
        logout,
        refreshProfile,
        clearLogs,
        addLog,
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
