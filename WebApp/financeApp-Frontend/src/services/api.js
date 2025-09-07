import axios from 'axios';
import { toast } from 'react-hot-toast';

// Create axios instance with enhanced configuration
const api = axios.create({
  baseURL: process.env.NODE_ENV === 'production' ? '/api' : 'http://localhost:8080/api',
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Enhanced request interceptor
api.interceptors.request.use(
  (config) => {
    // Add auth token if available
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Add request timestamp for debugging
    config.metadata = { startTime: new Date() };
    
    return config;
  },
  (error) => {
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Enhanced response interceptor with retry logic
api.interceptors.response.use(
  (response) => {
    // Calculate request duration for performance monitoring
    const endTime = new Date();
    const duration = endTime - response.config.metadata.startTime;
    console.debug(`API Request completed in ${duration}ms:`, response.config.url);
    
    return response;
  },
  async (error) => {
    const { response, config } = error;
    
    // Don't retry if it's a cancelled request
    if (axios.isCancel(error)) {
      return Promise.reject(error);
    }
    
    // Enhanced error handling based on status codes
    if (response) {
      switch (response.status) {
        case 401:
          // Unauthorized - clear auth data and redirect to login
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          delete api.defaults.headers.common['Authorization'];
          
          // Only show toast if not on auth pages
          const currentPath = window.location.pathname;
          if (!currentPath.includes('/login') && !currentPath.includes('/register')) {
            toast.error('Your session has expired. Please log in again.');
            // Small delay before redirect to ensure toast is visible
            setTimeout(() => {
              window.location.href = '/login';
            }, 1000);
          }
          break;
          
        case 403:
          toast.error('Access denied. You don\'t have permission to perform this action.');
          break;
          
        case 404:
          // Don't show toast for 404s as they might be expected
          console.warn('Resource not found:', config.url);
          break;
          
        case 422:
          // Validation errors
          const validationMessage = response.data?.message || 'Validation error occurred';
          toast.error(validationMessage);
          break;
          
        case 429:
          toast.error('Too many requests. Please try again later.');
          break;
          
        case 500:
          toast.error('Server error occurred. Our team has been notified.');
          break;
          
        case 502:
        case 503:
        case 504:
          toast.error('Service temporarily unavailable. Please try again in a moment.');
          break;
          
        default:
          // Generic error message for other status codes
          const errorMessage = response.data?.message || response.data?.error || 'An unexpected error occurred';
          toast.error(errorMessage);
      }
    } else if (error.code === 'ECONNABORTED') {
      // Timeout error
      toast.error('Request timed out. Please check your connection and try again.');
    } else if (error.message === 'Network Error') {
      // Network error
      toast.error('Network error. Please check your internet connection.');
    } else {
      // Other errors
      toast.error('An unexpected error occurred. Please try again.');
    }
    
    return Promise.reject(error);
  }
);

// API methods with enhanced error handling
export const authAPI = {
  login: async (credentials) => {
    try {
      const response = await api.post('/auth/signin', credentials);
      const { accessToken, id, firstName, lastName, email } = response.data;
      
      // Store auth data
      localStorage.setItem('token', accessToken);
      localStorage.setItem('user', JSON.stringify({ id, firstName, lastName, email }));
      
      // Set default header for future requests
      api.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
      
      toast.success(`Welcome back, ${firstName}!`);
      return { success: true, user: { id, firstName, lastName, email } };
    } catch (error) {
      const message = error.response?.data?.message || 'Login failed';
      return { success: false, message };
    }
  },
  
  register: async (userData) => {
    try {
      await api.post('/auth/signup', userData);
      toast.success('Account created successfully! Please log in.');
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Registration failed';
      return { success: false, message };
    }
  },
  
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    delete api.defaults.headers.common['Authorization'];
    toast.success('Logged out successfully');
  }
};

export const transactionAPI = {
  getAll: () => api.get('/transactions'),
  create: (transaction) => api.post('/transactions', transaction),
  update: (id, transaction) => api.put(`/transactions/${id}`, transaction),
  delete: (id) => api.delete(`/transactions/${id}`),
  getSummary: () => api.get('/transactions/summary'),
  getAnalysis: (params) => api.get('/transactions/analysis', { params }),
  exportPDF: (params) => api.get('/transactions/export/pdf', { 
    params, 
    responseType: 'blob' 
  }),
  // Monthly transaction methods
  getMonthly: (monthOffset = 0) => api.get(`/transactions/monthly?monthOffset=${monthOffset}`),
  getByMonth: (year, month) => api.get(`/transactions/monthly/${year}/${month}`),
  getMonthlySummary: (monthOffset = 0) => api.get(`/transactions/monthly/summary?monthOffset=${monthOffset}`),
  getByDateRange: (startDate, endDate) => api.get('/transactions/date-range', {
    params: { startDate, endDate }
  }),
};

export const investmentAPI = {
  getAll: () => api.get('/investments'),
  create: (investment) => api.post('/investments', investment),
  update: (id, investment) => api.put(`/investments/${id}`, investment),
  delete: (id) => api.delete(`/investments/${id}`),
  getPortfolioSummary: () => api.get('/investments/portfolio/summary'),
  getPortfolioDistribution: () => api.get('/investments/portfolio/distribution'),
  getPortfolioPerformance: () => api.get('/investments/portfolio/performance'),
  getTypes: () => api.get('/investments/types'),
  getSuggestions: () => api.get('/investments/suggestions'),
  updatePrices: () => api.post('/investments/update-prices'),
  getDashboard: () => api.get('/investments/dashboard'),
  uploadStatement: (file, platform) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('platform', platform);
    
    return api.post('/investments/upload-statement', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      timeout: 30000, // 30 seconds for file upload
    });
  },
};

export const budgetAPI = {
  create: (budgetData) => api.post('/budget/create', budgetData),
  get: () => api.get('/budget/get'),
  updatePercentages: (percentages) => api.put('/budget/update-percentages', percentages),
  getAnalysis: () => api.get('/budget/analysis'),
  getBreakdown: () => api.get('/budget/breakdown'),
  delete: () => api.delete('/budget/delete'),
};

export const goalAPI = {
  getAll: () => api.get('/goals'),
  getActive: () => api.get('/goals/active'),
  create: (goal) => api.post('/goals', goal),
  update: (id, goal) => api.put(`/goals/${id}`, goal),
  delete: (id) => api.delete(`/goals/${id}`),
};

export const subscriptionAPI = {
  getAll: () => api.get('/subscriptions'),
  create: (subscription) => api.post('/subscriptions', subscription),
  update: (id, subscription) => api.put(`/subscriptions/${id}`, subscription),
  delete: (id) => api.delete(`/subscriptions/${id}`),
  getUpcoming: (date) => api.get(`/subscriptions/upcoming?date=${date}`),
  getTotalUpcoming: (date) => api.get(`/subscriptions/upcoming/total?date=${date}`),
  markAsPaid: (id) => api.post(`/subscriptions/${id}/mark-paid`),
};

export const advisorAPI = {
  getAdvice: () => api.get('/advisor/advice'),
  getRecommendations: () => api.get('/advisor/recommendations'),
};

export const udhaariAPI = {
  getAll: () => api.get('/udhaari'),
  create: (udhaari) => api.post('/udhaari', udhaari),
  update: (id, udhaari) => api.put(`/udhaari/${id}`, udhaari),
  delete: (id) => api.delete(`/udhaari/${id}`),
  getSummary: () => api.get('/udhaari/summary'),
};

export const statementAPI = {
  upload: (file, statementType) => {
    console.log('🔍 statementAPI.upload called with:', {
      fileName: file?.name,
      fileSize: file?.size,
      statementType: statementType
    });
    
    const formData = new FormData();
    formData.append('file', file);
    if (statementType) {
      formData.append('statementType', statementType);
      console.log('✅ Added statementType to FormData:', statementType);
    } else {
      console.warn('⚠️ No statementType provided, backend will use default (PHONEPE)');
    }
    
    // Log all FormData entries for debugging
    console.log('📋 FormData contents:');
    for (let [key, value] of formData.entries()) {
      console.log(`  ${key}:`, typeof value === 'object' ? `[File: ${value.name}]` : value);
    }
    
    return api.post('/statements/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
  import: (transactions, skipDuplicates = true) => api.post('/statements/import', {
    transactions,
    skipDuplicates,
  }),
  getSupportedFormats: () => api.get('/statements/formats'),
};

export default api;