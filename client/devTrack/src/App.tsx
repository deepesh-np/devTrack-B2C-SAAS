import React, { useState, useEffect } from 'react';
import './index.css';

interface UserProfile {
  id: string;
  name: string;
  email: string;
  username?: string;
  avatar?: string;
  provider: string;
  createdAt?: string;
}

interface LogEntry {
  id: string;
  time: string;
  method: string;
  endpoint: string;
  status: number;
  data: any;
}

const BACKEND_URL = 'http://localhost:5000';

export function App() {
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');
  const [token, setToken] = useState<string>(() => localStorage.getItem('access_token') || '');
  const [user, setUser] = useState<UserProfile | null>(null);
  const [serverStatus, setServerStatus] = useState<boolean | null>(null);
  const [logs, setLogs] = useState<LogEntry[]>([]);

  // Form State
  const [loginForm, setLoginForm] = useState({ identifier: '', password: '' });
  const [registerForm, setRegisterForm] = useState({ name: '', email: '', username: '', password: '' });
  const [loading, setLoading] = useState(false);

  // 1. Check Server Health on Mount
  useEffect(() => {
    checkServerHealth();
    // 2. Extract Token from URL if redirected back from Google or GitHub OAuth
    const queryParams = new URLSearchParams(window.location.search);
    const urlToken = queryParams.get('token');
    if (urlToken) {
      setToken(urlToken);
      localStorage.setItem('access_token', urlToken);
      addLog('GET', '/api/auth/oauth/callback', 200, { message: 'OAuth Token captured from URL redirect!' });
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  // 3. Fetch User Profile whenever Token changes
  useEffect(() => {
    if (token) {
      fetchProfile(token);
    } else {
      setUser(null);
    }
  }, [token]);

  const checkServerHealth = async () => {
    try {
      const res = await fetch(`${BACKEND_URL}/health`);
      if (res.ok) {
        setServerStatus(true);
      } else {
        setServerStatus(false);
      }
    } catch {
      setServerStatus(false);
    }
  };

  const addLog = (method: string, endpoint: string, status: number, data: any) => {
    const newLog: LogEntry = {
      id: Math.random().toString(36).substring(2, 9),
      time: new Date().toLocaleTimeString(),
      method,
      endpoint,
      status,
      data,
    };
    setLogs((prev) => [newLog, ...prev]);
  };

  // Local Login
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(`${BACKEND_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(loginForm),
      });
      const data = await res.json();
      addLog('POST', '/api/auth/login', res.status, data);

      if (data.success && data.token) {
        setToken(data.token);
        localStorage.setItem('access_token', data.token);
        if (data.user) setUser(data.user);
      }
    } catch (err: any) {
      addLog('POST', '/api/auth/login', 500, { error: err.message });
    } finally {
      setLoading(false);
    }
  };

  // Local Register
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(`${BACKEND_URL}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(registerForm),
      });
      const data = await res.json();
      addLog('POST', '/api/auth/register', res.status, data);

      if (data.success && data.token) {
        setToken(data.token);
        localStorage.setItem('access_token', data.token);
        if (data.user) setUser(data.user);
      }
    } catch (err: any) {
      addLog('POST', '/api/auth/register', 500, { error: err.message });
    } finally {
      setLoading(false);
    }
  };

  // Fetch Protected Profile
  const fetchProfile = async (currentToken: string) => {
    try {
      const res = await fetch(`${BACKEND_URL}/api/auth/me`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${currentToken}`,
        },
      });
      const data = await res.json();
      addLog('GET', '/api/auth/me', res.status, data);

      if (data.success && data.user) {
        setUser(data.user);
      } else {
        // Token invalid or expired
        setUser(null);
      }
    } catch (err: any) {
      addLog('GET', '/api/auth/me', 500, { error: err.message });
    }
  };

  // Social Login Trigger
  const handleGoogleLogin = () => {
    window.location.href = `${BACKEND_URL}/api/auth/google`;
  };

  const handleGithubLogin = () => {
    window.location.href = `${BACKEND_URL}/api/auth/github`;
  };

  // Logout
  const handleLogout = async () => {
    try {
      const res = await fetch(`${BACKEND_URL}/api/auth/logout`, { method: 'POST' });
      const data = await res.json();
      addLog('POST', '/api/auth/logout', res.status, data);
    } catch {
      // Ignore
    }
    setToken('');
    setUser(null);
    localStorage.removeItem('access_token');
  };

  return (
    <div className="container">
      {/* Header */}
      <header className="header">
        <h1>DevTrack Auth Tester</h1>
        <p>Test Passport.js Authentication (Local, Google, GitHub, JWT)</p>
        <div className="status-bar">
          <span className={`badge ${serverStatus ? 'online' : 'offline'}`}>
            <span className="dot"></span>
            Backend: {serverStatus ? 'Connected (Port 5000)' : 'Disconnected (Start Server)'}
          </span>
          <span className={`badge ${user ? 'online' : 'offline'}`}>
            <span className="dot"></span>
            Auth Status: {user ? `Logged In (${user.provider})` : 'Not Authenticated'}
          </span>
        </div>
      </header>

      {/* Main Grid */}
      <div className="grid-layout">
        {/* Left Column: Form or Profile */}
        <div>
          {user ? (
            <div className="card">
              <div className="card-title">
                <span>Authenticated Profile</span>
                <span className="badge online">{user.provider}</span>
              </div>

              <div className="user-profile-box">
                <div className="user-avatar-meta">
                  {user.avatar ? (
                    <img src={user.avatar} alt="Avatar" />
                  ) : (
                    <div className="avatar-placeholder">{user.name?.charAt(0) || 'U'}</div>
                  )}
                  <div>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 600 }}>{user.name}</h3>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{user.email}</p>
                  </div>
                </div>

                <div className="profile-field">
                  <span className="key">User ID:</span>
                  <span className="val">{user.id}</span>
                </div>
                <div className="profile-field">
                  <span className="key">Username:</span>
                  <span className="val">{user.username || 'N/A'}</span>
                </div>
                <div className="profile-field">
                  <span className="key">Provider:</span>
                  <span className="val">{user.provider}</span>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button className="btn btn-secondary" onClick={() => fetchProfile(token)}>
                  Re-fetch /api/auth/me
                </button>
                <button className="btn btn-primary" style={{ background: 'var(--error)' }} onClick={handleLogout}>
                  Logout
                </button>
              </div>
            </div>
          ) : (
            <div className="card">
              <div className="tab-buttons">
                <button
                  className={`tab-btn ${activeTab === 'login' ? 'active' : ''}`}
                  onClick={() => setActiveTab('login')}
                >
                  Sign In
                </button>
                <button
                  className={`tab-btn ${activeTab === 'register' ? 'active' : ''}`}
                  onClick={() => setActiveTab('register')}
                >
                  Sign Up
                </button>
              </div>

              {activeTab === 'login' ? (
                <form onSubmit={handleLogin}>
                  <div className="form-group">
                    <label>Username or Email</label>
                    <input
                      type="text"
                      placeholder="e.g. janedoe or jane@example.com"
                      value={loginForm.identifier}
                      onChange={(e) => setLoginForm({ ...loginForm, identifier: e.target.value })}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Password</label>
                    <input
                      type="password"
                      placeholder="••••••••"
                      value={loginForm.password}
                      onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                      required
                    />
                  </div>
                  <button type="submit" className="btn btn-primary" disabled={loading}>
                    {loading ? 'Authenticating...' : 'Sign In with Passport Local'}
                  </button>
                </form>
              ) : (
                <form onSubmit={handleRegister}>
                  <div className="form-group">
                    <label>Full Name</label>
                    <input
                      type="text"
                      placeholder="Jane Doe"
                      value={registerForm.name}
                      onChange={(e) => setRegisterForm({ ...registerForm, name: e.target.value })}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Email Address</label>
                    <input
                      type="email"
                      placeholder="jane@example.com"
                      value={registerForm.email}
                      onChange={(e) => setRegisterForm({ ...registerForm, email: e.target.value })}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Username</label>
                    <input
                      type="text"
                      placeholder="janedoe"
                      value={registerForm.username}
                      onChange={(e) => setRegisterForm({ ...registerForm, username: e.target.value })}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Password</label>
                    <input
                      type="password"
                      placeholder="At least 6 characters"
                      value={registerForm.password}
                      onChange={(e) => setRegisterForm({ ...registerForm, password: e.target.value })}
                      required
                    />
                  </div>
                  <button type="submit" className="btn btn-primary" disabled={loading}>
                    {loading ? 'Registering...' : 'Sign Up Account'}
                  </button>
                </form>
              )}

              <div className="divider">
                <span>OR SOCIAL LOGIN</span>
              </div>

              <div className="social-group">
                <button className="btn btn-google" onClick={handleGoogleLogin}>
                  <svg width="18" height="18" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                  </svg>
                  Continue with Google
                </button>
                <button className="btn btn-github" onClick={handleGithubLogin}>
                  <svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24">
                    <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"/>
                  </svg>
                  Continue with GitHub
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Console Log */}
        <div className="card">
          <div className="card-title">
            <span>API Response Console</span>
            <button className="badge" onClick={() => setLogs([])} style={{ cursor: 'pointer' }}>
              Clear
            </button>
          </div>

          <div className="console-box">
            {logs.length === 0 ? (
              <p style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>
                No API requests made yet. Submit a form or click a social button above to see response logs.
              </p>
            ) : (
              logs.map((log) => (
                <div key={log.id} className="console-entry">
                  <div className="console-meta">
                    <span className={`console-method ${log.method.toLowerCase()}`}>{log.method}</span>
                    <span style={{ color: '#f8fafc' }}>{log.endpoint}</span>
                    <span className={`console-status ${log.status === 200 || log.status === 201 ? 's200' : 's400'}`}>
                      {log.status}
                    </span>
                    <span style={{ marginLeft: 'auto', color: 'var(--text-muted)', fontSize: '0.75rem' }}>
                      {log.time}
                    </span>
                  </div>
                  <div className="console-body">{JSON.stringify(log.data, null, 2)}</div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
