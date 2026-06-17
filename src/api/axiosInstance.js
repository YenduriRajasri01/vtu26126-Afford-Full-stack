import axios from 'axios';
import { authService } from '../services/authService';
import { logger } from '../utils/logger';

const API_BASE_URL = 'http://4.224.186.213/evaluation-service';

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
});

// Request Interceptor: Attach bearer tokens and log actions
axiosInstance.interceptors.request.use(
  (config) => {
    logger.log('AxiosInstance', `Outgoing Request: [${config.method.toUpperCase()}] ${config.url}`, {
      params: config.params,
    });
    
    const token = authService.getToken();
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    logger.error('AxiosInstance', 'Request Serialization Error', error);
    return Promise.reject(error);
  }
);

// Fallback high-quality notifications for Demo Mode
const MOCK_FALLBACK_NOTIFICATIONS = [
  {
    ID: "placement-mock-001",
    Type: "Placement",
    Message: "Google Hiring Software Engineering Interns for Summer 2026",
    Timestamp: "2026-06-17 10:15:30"
  },
  {
    ID: "result-mock-002",
    Type: "Result",
    Message: "End Semester Exam results for Discrete Structures are now published",
    Timestamp: "2026-06-17 09:40:00"
  },
  {
    ID: "event-mock-003",
    Type: "Event",
    Message: "Inter-college Annual Technical Fest registration closes tomorrow",
    Timestamp: "2026-06-17 08:30:15"
  },
  {
    ID: "placement-mock-004",
    Type: "Placement",
    Message: "Amazon Web Services recruiting Associate Systems Engineers",
    Timestamp: "2026-06-16 15:45:00"
  },
  {
    ID: "result-mock-005",
    Type: "Result",
    Message: "Revaluation application forms open for Spring 2026 Semester Examination",
    Timestamp: "2026-06-16 11:20:00"
  },
  {
    ID: "event-mock-006",
    Type: "Event",
    Message: "AI Workshop: Generative Deep Learning on AWS Cloud - Room 402",
    Timestamp: "2026-06-15 14:00:00"
  },
  {
    ID: "placement-mock-007",
    Type: "Placement",
    Message: "Microsoft Core Engineering Hiring drive starting from Monday",
    Timestamp: "2026-06-15 09:00:00"
  },
  {
    ID: "result-mock-008",
    Type: "Result",
    Message: "Departmental ranking list published for CSE Senior Graduating Batch",
    Timestamp: "2026-06-14 17:30:00"
  },
  {
    ID: "event-mock-009",
    Type: "Event",
    Message: "Guest Lecture: Entrepreneurship in Web3 Ecosystem - Seminar Hall 1",
    Timestamp: "2026-06-14 10:00:00"
  },
  {
    ID: "placement-mock-010",
    Type: "Placement",
    Message: "Goldman Sachs Offcampus registration link is active",
    Timestamp: "2026-06-13 16:15:00"
  },
  {
    ID: "result-mock-011",
    Type: "Result",
    Message: "Academic clearance forms available online for graduating senior batches",
    Timestamp: "2026-06-13 13:45:00"
  },
  {
    ID: "event-mock-012",
    Type: "Event",
    Message: "Annual sports meet registrations and team allocations finalized",
    Timestamp: "2026-06-12 11:00:00"
  }
];

// Response Interceptor: Handle and log incoming responses
axiosInstance.interceptors.response.use(
  (response) => {
    logger.log('AxiosInstance', `Successful Response: [${response.status}] from ${response.config.url}`);
    return response;
  },
  (error) => {
    const errorDetails = {
      message: error.message,
      status: error.response?.status,
      url: error.config?.url
    };
    
    logger.error('AxiosInstance', `API Response Error: ${error.message}`, errorDetails);

    if (error.response && error.response.status === 401) {
      const user = authService.getUser();
      const isDemo = user && !user.isReal;

      if (isDemo) {
        logger.warn('AxiosInstance', 'Demo Mode: Server returned 401. Falling back to local mock data to prevent redirect.', errorDetails);
        
        // Mock a 200 response with high-quality mock data
        return Promise.resolve({
          status: 200,
          statusText: 'OK',
          headers: {},
          config: error.config,
          data: {
            notifications: MOCK_FALLBACK_NOTIFICATIONS
          }
        });
      }

      // Live Mode: perform actual redirect
      logger.warn('AxiosInstance', 'Evaluation Mode: Session token invalid or expired. Performing auto-logout.');
      authService.logout();
      if (window.location.pathname !== '/login') {
        window.location.href = '/login?expired=true';
      }
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
export { API_BASE_URL };
