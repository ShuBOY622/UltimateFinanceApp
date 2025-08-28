import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { authAPI } from '../services/api';

// Auth states
const AUTH_STATES = {
  IDLE: 'idle',
  LOADING: 'loading',
  AUTHENTICATED: 'authenticated',
  UNAUTHENTICATED: 'unauthenticated',
  ERROR: 'error',
};

// Auth actions
const AUTH_ACTIONS = {
  SET_LOADING: 'SET_LOADING',
  SET_USER: 'SET_USER',
  SET_ERROR: 'SET_ERROR',
  LOGOUT: 'LOGOUT',
  CLEAR_ERROR: 'CLEAR_ERROR',
};

// Initial state
const initialState = {
  user: null,
  status: AUTH_STATES.IDLE,
  error: null,
  isAuthenticated: false,
  isLoading: true,
};

// Auth reducer
const authReducer = (state, action) => {
  switch (action.type) {
    case AUTH_ACTIONS.SET_LOADING:
      return {
        ...state,
        status: AUTH_STATES.LOADING,
        isLoading: true,
        error: null,
      };
      
    case AUTH_ACTIONS.SET_USER:
      return {
        ...state,
        user: action.payload,
        status: AUTH_STATES.AUTHENTICATED,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      };
      
    case AUTH_ACTIONS.SET_ERROR:
      return {
        ...state,
        error: action.payload,
        status: AUTH_STATES.ERROR,
        isLoading: false,
      };
      
    case AUTH_ACTIONS.LOGOUT:
      return {
        ...state,
        user: null,
        status: AUTH_STATES.UNAUTHENTICATED,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      };
      
    case AUTH_ACTIONS.CLEAR_ERROR:
      return {
        ...state,
        error: null,
        status: state.isAuthenticated ? AUTH_STATES.AUTHENTICATED : AUTH_STATES.UNAUTHENTICATED,
      };
      
    default:
      return state;
  }
};

// Create context
const AuthContext = createContext();

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Auth provider component
export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Initialize auth state from localStorage
  useEffect(() => {
    const initializeAuth = () => {
      try {
        const token = localStorage.getItem('token');
        const userData = localStorage.getItem('user');
        
        if (token && userData) {
          const user = JSON.parse(userData);
          
          // Validate token format (basic JWT structure check)
          const tokenParts = token.split('.');
          if (tokenParts.length === 3) {
            // Check if token is expired
            const payload = JSON.parse(atob(tokenParts[1]));
            const currentTime = Math.floor(Date.now() / 1000);
            
            if (payload.exp > currentTime) {
              dispatch({ type: AUTH_ACTIONS.SET_USER, payload: user });
              return;
            } else {
              // Token expired, clear storage
              localStorage.removeItem('token');
              localStorage.removeItem('user');
            }
          }
        }
        
        dispatch({ 
          type: AUTH_ACTIONS.LOGOUT,
        });
      } catch (error) {
        console.error('Error initializing auth:', error);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        dispatch({ type: AUTH_ACTIONS.LOGOUT });
      }
    };

    initializeAuth();
  }, []);

  // Auth methods
  const login = async (credentials) => {
    dispatch({ type: AUTH_ACTIONS.SET_LOADING });
    
    try {
      const result = await authAPI.login(credentials);
      
      if (result.success) {
        dispatch({ type: AUTH_ACTIONS.SET_USER, payload: result.user });
        return { success: true };
      } else {
        dispatch({ type: AUTH_ACTIONS.SET_ERROR, payload: result.message });
        return { success: false, message: result.message };
      }
    } catch (error) {
      const message = 'Login failed. Please try again.';
      dispatch({ type: AUTH_ACTIONS.SET_ERROR, payload: message });
      return { success: false, message };
    }
  };

  const register = async (userData) => {
    dispatch({ type: AUTH_ACTIONS.SET_LOADING });
    
    try {
      const result = await authAPI.register(userData);
      
      if (result.success) {
        dispatch({ type: AUTH_ACTIONS.LOGOUT });
        return { success: true };
      } else {
        dispatch({ type: AUTH_ACTIONS.SET_ERROR, payload: result.message });
        return { success: false, message: result.message };
      }
    } catch (error) {
      const message = 'Registration failed. Please try again.';
      dispatch({ type: AUTH_ACTIONS.SET_ERROR, payload: message });
      return { success: false, message };
    }
  };

  const logout = () => {
    authAPI.logout();
    dispatch({ type: AUTH_ACTIONS.LOGOUT });
  };

  const clearError = () => {
    dispatch({ type: AUTH_ACTIONS.CLEAR_ERROR });
  };

  // Context value
  const value = {
    // State
    user: state.user,
    isAuthenticated: state.isAuthenticated,
    isLoading: state.isLoading,
    error: state.error,
    status: state.status,
    
    // Methods
    login,
    register,
    logout,
    clearError,
    
    // Computed values
    userName: state.user ? `${state.user.firstName} ${state.user.lastName}` : '',
    userInitials: state.user ? `${state.user.firstName[0]}${state.user.lastName[0]}` : '',
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;