/**
 * Authentication Service
 * Manages user login sessions, stores mock/live JSON Web Tokens,
 * and maintains validation logic for credential security.
 */
import axios from 'axios';
import { logger } from '../utils/logger';

const TOKEN_KEY = 'nms_auth_token';
const USER_KEY = 'nms_user_profile';

const MOCK_USERS = [
  {
    email: 'admin@example.com',
    password: 'password123',
    name: 'Jane Doe',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150'
  },
  {
    email: 'student@example.com',
    password: 'password123',
    name: 'Alex Smith',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150'
  }
];

export const authService = {
  /**
   * Logs in a user using standard mock credentials.
   */
  login: async (email, password, rememberMe = false) => {
    logger.log('authService', 'Triggering mock login attempt...', { email, rememberMe });
    
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const normalizedEmail = email.toLowerCase().trim();
        const user = MOCK_USERS.find(
          u => u.email === normalizedEmail && u.password === password
        );

        if (user) {
          const dummyPayload = {
            sub: user.email,
            name: user.name,
            exp: Date.now() + 1000 * 60 * 60 * 24 // 24 hours
          };
          const token = btoa(JSON.stringify(dummyPayload));

          logger.log('authService', 'Credentials validated successfully. Generating mock token.', {
            name: user.name
          });

          const userProfile = {
            name: user.name,
            email: user.email,
            avatar: user.avatar,
            isReal: false // Mock session
          };

          if (rememberMe) {
            localStorage.setItem(TOKEN_KEY, token);
            localStorage.setItem(USER_KEY, JSON.stringify(userProfile));
          } else {
            sessionStorage.setItem(TOKEN_KEY, token);
            sessionStorage.setItem(USER_KEY, JSON.stringify(userProfile));
          }

          resolve({
            success: true,
            token,
            user: userProfile
          });
        } else {
          logger.warn('authService', 'Mock login failed: invalid credentials.', { email });
          reject(new Error('Invalid email or password. Please use admin@example.com / password123.'));
        }
      }, 600);
    });
  },

  /**
   * Logs in a user using real platform evaluation credentials.
   * Calls POST /auth.
   */
  loginWithEvaluation: async (credentials, rememberMe = false) => {
    logger.log('authService', 'Triggering live evaluation authentication...', {
      name: credentials.name,
      rollNo: credentials.rollNo,
      clientID: credentials.clientID
    });

    try {
      const response = await axios.post('http://4.224.186.213/evaluation-service/auth', credentials);
      logger.log('authService', 'API auth request successful', response.data);

      const token = response.data.token || response.data.access_token || response.data;
      if (!token) {
        throw new Error('Authentication succeeded, but the server returned an empty token.');
      }

      const userProfile = {
        name: credentials.name || 'Candidate',
        email: `${credentials.rollNo || 'candidate'}@evaluation.com`,
        avatar: null,
        isReal: true // Real live session
      };

      if (rememberMe) {
        localStorage.setItem(TOKEN_KEY, token);
        localStorage.setItem(USER_KEY, JSON.stringify(userProfile));
      } else {
        sessionStorage.setItem(TOKEN_KEY, token);
        sessionStorage.setItem(USER_KEY, JSON.stringify(userProfile));
      }

      return { success: true, token, user: userProfile };
    } catch (err) {
      logger.error('authService', 'Live evaluation auth failed', err);
      // Try to parse clean server error message
      const serverMsg = err.response?.data?.message || err.response?.data?.error;
      const errorMsg = serverMsg 
        ? `Server: ${serverMsg}` 
        : (err.message || 'Connection to authentication service failed.');
      throw new Error(errorMsg);
    }
  },

  logout: () => {
    logger.log('authService', 'Logging user out. Purging active session keys.');
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    sessionStorage.removeItem(TOKEN_KEY);
    sessionStorage.removeItem(USER_KEY);
  },

  getToken: () => {
    return localStorage.getItem(TOKEN_KEY) || sessionStorage.getItem(TOKEN_KEY);
  },

  isAuthenticated: () => {
    const token = authService.getToken();
    if (!token) return false;
    
    try {
      // Basic integrity check for jwt structures
      const payload = JSON.parse(atob(token.split('.')[1] || token));
      if (payload.exp && Date.now() > payload.exp) {
        logger.warn('authService', 'Session token has expired.');
        authService.logout();
        return false;
      }
      return true;
    } catch (e) {
      // If it's a simple string token from evaluation auth, verify existence
      return !!token;
    }
  },

  getUser: () => {
    const userStr = localStorage.getItem(USER_KEY) || sessionStorage.getItem(USER_KEY);
    if (userStr) {
      try {
        return JSON.parse(userStr);
      } catch (e) {
        return null;
      }
    }
    return null;
  }
};

export default authService;
