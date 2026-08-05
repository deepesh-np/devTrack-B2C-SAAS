import type { AuthResponse, ProfileResponse, User, Profile, CodingPlatformData } from '../types';
import type { GitHubData } from '../types/github';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

type LogCallback = (method: string, endpoint: string, status: number, data: any) => void;

let logListener: LogCallback | null = null;

export const setApiLogListener = (listener: LogCallback) => {
  logListener = listener;
};

const notifyLog = (method: string, endpoint: string, status: number, data: any) => {
  if (logListener) {
    logListener(method, endpoint, status, data);
  }
};

const getHeaders = (token?: string | null): Record<string, string> => {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  const authToken = token || localStorage.getItem('access_token');
  if (authToken) {
    headers['Authorization'] = `Bearer ${authToken}`;
  }
  return headers;
};

export const apiService = {
  getBackendUrl: () => BACKEND_URL,

  // Health Check
  checkHealth: async (): Promise<boolean> => {
    try {
      const res = await fetch(`${BACKEND_URL}/health`);
      return res.ok;
    } catch {
      return false;
    }
  },

  // Auth: Register
  register: async (payload: { name: string; email: string; username: string; password: string }): Promise<AuthResponse> => {
    const endpoint = '/api/auth/register';
    try {
      const res = await fetch(`${BACKEND_URL}${endpoint}`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      notifyLog('POST', endpoint, res.status, data);
      return data;
    } catch (err: any) {
      const errRes = { success: false, message: err.message || 'Network error during registration' };
      notifyLog('POST', endpoint, 500, errRes);
      return errRes;
    }
  },

  // Auth: Login
  login: async (payload: { identifier: string; password: string }): Promise<AuthResponse> => {
    const endpoint = '/api/auth/login';
    try {
      const res = await fetch(`${BACKEND_URL}${endpoint}`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      notifyLog('POST', endpoint, res.status, data);
      return data;
    } catch (err: any) {
      const errRes = { success: false, message: err.message || 'Network error during login' };
      notifyLog('POST', endpoint, 500, errRes);
      return errRes;
    }
  },

  // Auth: Get Current User
  getMe: async (token?: string): Promise<{ success: boolean; user?: User; message?: string }> => {
    const endpoint = '/api/auth/me';
    try {
      const res = await fetch(`${BACKEND_URL}${endpoint}`, {
        method: 'GET',
        headers: getHeaders(token),
      });
      const data = await res.json();
      notifyLog('GET', endpoint, res.status, data);
      return data;
    } catch (err: any) {
      const errRes = { success: false, message: err.message || 'Failed to fetch user session' };
      notifyLog('GET', endpoint, 500, errRes);
      return errRes;
    }
  },

  // Auth: Logout
  logout: async (): Promise<boolean> => {
    const endpoint = '/api/auth/logout';
    try {
      const res = await fetch(`${BACKEND_URL}${endpoint}`, {
        method: 'POST',
        headers: getHeaders(),
      });
      const data = await res.json();
      notifyLog('POST', endpoint, res.status, data);
      return data.success;
    } catch {
      return false;
    }
  },

  // Profile: Get Current Profile
  getProfile: async (token?: string): Promise<ProfileResponse> => {
    const endpoint = '/api/profile/me';
    try {
      const res = await fetch(`${BACKEND_URL}${endpoint}`, {
        method: 'GET',
        headers: getHeaders(token),
      });
      const data = await res.json();
      notifyLog('GET', endpoint, res.status, data);
      return data;
    } catch (err: any) {
      const errRes = { success: false, message: err.message || 'Failed to fetch profile' };
      notifyLog('GET', endpoint, 500, errRes);
      return errRes;
    }
  },

  // Profile: Create Profile
  createProfile: async (payload: Partial<Profile>, token?: string): Promise<ProfileResponse> => {
    const endpoint = '/api/profile/new';
    try {
      const res = await fetch(`${BACKEND_URL}${endpoint}`, {
        method: 'POST',
        headers: getHeaders(token),
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      notifyLog('POST', endpoint, res.status, data);
      return data;
    } catch (err: any) {
      const errRes = { success: false, message: err.message || 'Failed to create profile' };
      notifyLog('POST', endpoint, 500, errRes);
      return errRes;
    }
  },

  // Profile: Update Profile
  updateProfile: async (payload: Partial<Profile>, token?: string): Promise<ProfileResponse> => {
    const endpoint = '/api/profile/update';
    try {
      const res = await fetch(`${BACKEND_URL}${endpoint}`, {
        method: 'PUT',
        headers: getHeaders(token),
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      notifyLog('PUT', endpoint, res.status, data);
      return data;
    } catch (err: any) {
      const errRes = { success: false, message: err.message || 'Failed to update profile' };
      notifyLog('PUT', endpoint, 500, errRes);
      return errRes;
    }
  },

  // Profile: Public Profile by Username
  getPublicProfile: async (username: string): Promise<{ success: boolean; user?: any; message?: string }> => {
    const endpoint = `/api/profile/user/${username}`;
    try {
      const res = await fetch(`${BACKEND_URL}${endpoint}`, {
        method: 'GET',
        headers: getHeaders(),
      });
      const data = await res.json();
      notifyLog('GET', endpoint, res.status, data);
      return data;
    } catch (err: any) {
      const errRes = { success: false, message: err.message || 'Failed to fetch public profile' };
      notifyLog('GET', endpoint, 500, errRes);
      return errRes;
    }
  },

  // GitHub Integration
  getMyGitHubData: async (token?: string): Promise<{ success: boolean; data?: GitHubData; message?: string }> => {
    const endpoint = '/api/github/me';
    try {
      const res = await fetch(`${BACKEND_URL}${endpoint}`, {
        method: 'GET',
        headers: getHeaders(token),
      });
      const data = await res.json();
      notifyLog('GET', endpoint, res.status, data);
      return data;
    } catch (err: any) {
      const errRes = { success: false, message: err.message || 'Failed to fetch GitHub data' };
      notifyLog('GET', endpoint, 500, errRes);
      return errRes;
    }
  },

  getPublicGitHubData: async (username: string): Promise<{ success: boolean; data?: GitHubData; message?: string }> => {
    const endpoint = `/api/github/user/${username}`;
    try {
      const res = await fetch(`${BACKEND_URL}${endpoint}`, {
        method: 'GET',
        headers: getHeaders(),
      });
      const data = await res.json();
      notifyLog('GET', endpoint, res.status, data);
      return data;
    } catch (err: any) {
      const errRes = { success: false, message: err.message || 'Failed to fetch GitHub data' };
      notifyLog('GET', endpoint, 500, errRes);
      return errRes;
    }
  },


  getMyCodingPlatforms: async (token?: string): Promise<{ success: boolean; platforms?: CodingPlatformData[]; validationErrors?: Partial<Record<CodingPlatformData['platform'], string>>; message?: string }> => {
    const endpoint = '/api/platforms/me';
    try {
      const res = await fetch(`${BACKEND_URL}${endpoint}`, { method: 'GET', headers: getHeaders(token) });
      const data = await res.json();
      notifyLog('GET', endpoint, res.status, data);
      return data;
    } catch (err: any) {
      const errRes = { success: false, message: err.message || 'Failed to fetch coding platform data' };
      notifyLog('GET', endpoint, 500, errRes);
      return errRes;
    }
  },
  // OAuth Redirect URLs
  getGoogleAuthUrl: () => `${BACKEND_URL}/api/auth/google`,
  getGithubAuthUrl: () => `${BACKEND_URL}/api/auth/github`,
};
