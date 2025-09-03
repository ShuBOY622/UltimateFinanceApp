import React, { createContext, useContext, useState, useEffect } from 'react';
import { createTheme } from '@mui/material/styles';
import { alpha } from '@mui/material/styles';

// Dark theme (existing)
const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#6366f1',
      light: '#818cf8',
      dark: '#4f46e5',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#8b5cf6',
      light: '#a78bfa',
      dark: '#7c3aed',
      contrastText: '#ffffff',
    },
    success: {
      main: '#10b981',
      light: '#34d399',
      dark: '#059669',
      contrastText: '#ffffff',
    },
    error: {
      main: '#ef4444',
      light: '#f87171',
      dark: '#dc2626',
      contrastText: '#ffffff',
    },
    warning: {
      main: '#f59e0b',
      light: '#fbbf24',
      dark: '#d97706',
      contrastText: '#ffffff',
    },
    info: {
      main: '#06b6d4',
      light: '#22d3ee',
      dark: '#0891b2',
      contrastText: '#ffffff',
    },
    background: {
      default: '#0f0f23',
      paper: 'rgba(255, 255, 255, 0.05)',
      surface: 'rgba(255, 255, 255, 0.08)',
      elevated: 'rgba(255, 255, 255, 0.12)',
    },
    grey: {
      50: '#f8fafc',
      100: '#f1f5f9',
      200: '#e2e8f0',
      300: '#cbd5e1',
      400: '#94a3b8',
      500: '#64748b',
      600: '#475569',
      700: '#334155',
      800: '#1e293b',
      900: '#0f172a',
    },
    text: {
      primary: 'rgba(255, 255, 255, 0.95)',
      secondary: 'rgba(255, 255, 255, 0.7)',
      disabled: 'rgba(255, 255, 255, 0.4)',
    },
    divider: 'rgba(255, 255, 255, 0.1)',
    overlay: {
      light: 'rgba(255, 255, 255, 0.1)',
      medium: 'rgba(255, 255, 255, 0.2)',
      dark: 'rgba(0, 0, 0, 0.6)',
    },
  },
  typography: {
    fontFamily: '"Inter", "SF Pro Display", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    h1: {
      fontSize: '2.5rem',
      fontWeight: 700,
      lineHeight: 1.2,
      letterSpacing: '-0.025em',
    },
    h2: {
      fontSize: '2rem',
      fontWeight: 600,
      lineHeight: 1.3,
      letterSpacing: '-0.025em',
    },
    h3: {
      fontSize: '1.5rem',
      fontWeight: 600,
      lineHeight: 1.4,
      letterSpacing: '-0.025em',
    },
    h4: {
      fontSize: '1.25rem',
      fontWeight: 600,
      lineHeight: 1.4,
    },
    h5: {
      fontSize: '1.125rem',
      fontWeight: 600,
      lineHeight: 1.4,
    },
    h6: {
      fontSize: '1rem',
      fontWeight: 600,
      lineHeight: 1.4,
    },
    body1: {
      fontSize: '1rem',
      lineHeight: 1.6,
    },
    body2: {
      fontSize: '0.875rem',
      lineHeight: 1.6,
    },
    subtitle1: {
      fontSize: '1rem',
      fontWeight: 500,
      lineHeight: 1.5,
    },
    subtitle2: {
      fontSize: '0.875rem',
      fontWeight: 500,
      lineHeight: 1.5,
    },
    caption: {
      fontSize: '0.75rem',
      lineHeight: 1.4,
      color: 'rgba(255, 255, 255, 0.6)',
    },
    button: {
      fontWeight: 500,
      textTransform: 'none',
      letterSpacing: '0.025em',
    },
  },
  shape: {
    borderRadius: 16,
  },
  shadows: [
    'none',
    '0px 1px 2px 0px rgba(0, 0, 0, 0.2)',
    '0px 1px 3px 0px rgba(0, 0, 0, 0.3), 0px 1px 2px 0px rgba(0, 0, 0, 0.2)',
    '0px 4px 6px -2px rgba(0, 0, 0, 0.3), 0px 2px 4px -1px rgba(0, 0, 0, 0.2)',
    '0px 10px 15px -3px rgba(0, 0, 0, 0.4), 0px 4px 6px -2px rgba(0, 0, 0, 0.3)',
    '0px 20px 25px -5px rgba(0, 0, 0, 0.5), 0px 10px 10px -5px rgba(0, 0, 0, 0.3)',
    '0px 25px 50px -12px rgba(0, 0, 0, 0.6)',
    '0px 25px 50px -12px rgba(0, 0, 0, 0.6)',
    '0px 25px 50px -12px rgba(0, 0, 0, 0.6)',
    '0px 25px 50px -12px rgba(0, 0, 0, 0.6)',
    '0px 25px 50px -12px rgba(0, 0, 0, 0.6)',
    '0px 25px 50px -12px rgba(0, 0, 0, 0.6)',
    '0px 25px 50px -12px rgba(0, 0, 0, 0.6)',
    '0px 25px 50px -12px rgba(0, 0, 0, 0.6)',
    '0px 25px 50px -12px rgba(0, 0, 0, 0.6)',
    '0px 25px 50px -12px rgba(0, 0, 0, 0.6)',
    '0px 25px 50px -12px rgba(0, 0, 0, 0.6)',
    '0px 25px 50px -12px rgba(0, 0, 0, 0.6)',
    '0px 25px 50px -12px rgba(0, 0, 0, 0.6)',
    '0px 25px 50px -12px rgba(0, 0, 0, 0.6)',
    '0px 25px 50px -12px rgba(0, 0, 0, 0.6)',
    '0px 25px 50px -12px rgba(0, 0, 0, 0.6)',
    '0px 25px 50px -12px rgba(0, 0, 0, 0.6)',
    '0px 25px 50px -12px rgba(0, 0, 0, 0.6)',
    '0px 25px 50px -12px rgba(0, 0, 0, 0.6)',
  ],
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        '*': {
          boxSizing: 'border-box',
        },
        html: {
          WebkitFontSmoothing: 'antialiased',
          MozOsxFontSmoothing: 'grayscale',
        },
        body: {
          backgroundColor: '#0f0f23',
          backgroundImage: [
            'radial-gradient(at 20% 30%, hsla(240, 50%, 30%, 0.3) 0px, transparent 50%)',
            'radial-gradient(at 80% 70%, hsla(260, 50%, 40%, 0.3) 0px, transparent 50%)',
            'radial-gradient(at 40% 40%, hsla(280, 50%, 35%, 0.2) 0px, transparent 50%)'
          ].join(', '),
          fontFamily: '"Inter", "SF Pro Display", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
          minHeight: '100vh',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          border: '1px solid rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(20px)',
          background: 'rgba(255, 255, 255, 0.05)',
          boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.3), 0px 1px 3px rgba(0, 0, 0, 0.2)',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          '&:hover': {
            transform: 'translateY(-2px)',
            background: 'rgba(255, 255, 255, 0.08)',
            border: '1px solid rgba(255, 255, 255, 0.15)',
            boxShadow: '0px 8px 25px rgba(0, 0, 0, 0.4), 0px 2px 6px rgba(0, 0, 0, 0.25)',
          },
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          textTransform: 'none',
          fontWeight: 600,
          fontSize: '0.875rem',
          padding: '12px 24px',
          boxShadow: 'none',
          transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
          '&:hover': {
            boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.15)',
            transform: 'translateY(-2px)',
          },
        },
        contained: {
          background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
          color: '#ffffff',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          '&:hover': {
            background: 'linear-gradient(135deg, #5b5fff 0%, #7c3aed 100%)',
            boxShadow: '0px 6px 20px rgba(99, 102, 241, 0.4)',
          },
          '&:disabled': {
            background: 'rgba(255, 255, 255, 0.1)',
            color: 'rgba(255, 255, 255, 0.4)',
          },
        },
        outlined: {
          border: '1px solid rgba(255, 255, 255, 0.2)',
          color: 'rgba(255, 255, 255, 0.9)',
          '&:hover': {
            border: '1px solid rgba(99, 102, 241, 0.5)',
            background: 'rgba(99, 102, 241, 0.1)',
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          border: '1px solid rgba(255, 255, 255, 0.1)',
          background: 'rgba(255, 255, 255, 0.05)',
          backdropFilter: 'blur(20px)',
          color: 'rgba(255, 255, 255, 0.95)',
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          background: 'rgba(15, 15, 35, 0.8)',
          backdropFilter: 'blur(20px)',
          border: 'none',
          color: 'rgba(255, 255, 255, 0.95)',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          background: 'rgba(15, 15, 35, 0.95)',
          backdropFilter: 'blur(20px)',
          border: 'none',
          borderRight: '1px solid rgba(255, 255, 255, 0.1)',
          color: 'rgba(255, 255, 255, 0.95)',
        },
      },
    },
    MuiListItemButton: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          margin: '4px 12px',
          transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
          color: 'rgba(255, 255, 255, 0.8)',
          '&:hover': {
            backgroundColor: 'rgba(99, 102, 241, 0.1)',
            transform: 'translateX(4px)',
            color: 'rgba(255, 255, 255, 0.95)',
          },
          '&.Mui-selected': {
            background: 'rgba(99, 102, 241, 0.15)',
            color: 'rgba(255, 255, 255, 0.95)',
            '&:hover': {
              background: 'rgba(99, 102, 241, 0.2)',
            },
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          fontWeight: 500,
          border: '1px solid rgba(255, 255, 255, 0.2)',
          background: 'rgba(255, 255, 255, 0.1)',
          color: 'rgba(255, 255, 255, 0.9)',
          '&.MuiChip-colorSuccess': {
            background: 'rgba(16, 185, 129, 0.2)',
            color: '#34d399',
            border: '1px solid rgba(16, 185, 129, 0.3)',
          },
          '&.MuiChip-colorError': {
            background: 'rgba(239, 68, 68, 0.2)',
            color: '#f87171',
            border: '1px solid rgba(239, 68, 68, 0.3)',
          },
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: '12px',
            background: 'rgba(255, 255, 255, 0.05)',
            backdropFilter: 'blur(10px)',
            '& fieldset': {
              borderColor: 'rgba(255, 255, 255, 0.2)',
            },
            '&:hover fieldset': {
              borderColor: 'rgba(99, 102, 241, 0.5)',
            },
            '&.Mui-focused fieldset': {
              borderColor: '#6366f1',
              borderWidth: '2px',
            },
          },
          '& .MuiInputLabel-root': {
            color: 'rgba(255, 255, 255, 0.7)',
          },
          '& .MuiInputBase-input': {
            color: 'rgba(255, 255, 255, 0.95)',
          },
          '& .MuiFormHelperText-root': {
            color: 'rgba(255, 255, 255, 0.6)',
          },
        },
      },
    },
  },
});

// Light theme (new)
const lightTheme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#7c3aed', // Purple shade for primary
      light: '#8b5cf6',
      dark: '#6d28d9',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#6366f1', // Indigo for secondary
      light: '#818cf8',
      dark: '#4f46e5',
      contrastText: '#ffffff',
    },
    success: {
      main: '#10b981',
      light: '#34d399',
      dark: '#059669',
      contrastText: '#ffffff',
    },
    error: {
      main: '#ef4444',
      light: '#f87171',
      dark: '#dc2626',
      contrastText: '#ffffff',
    },
    warning: {
      main: '#f59e0b',
      light: '#fbbf24',
      dark: '#d97706',
      contrastText: '#ffffff',
    },
    info: {
      main: '#06b6d4',
      light: '#22d3ee',
      dark: '#0891b2',
      contrastText: '#ffffff',
    },
    background: {
      default: '#ffffff', // Clean white background
      paper: '#ffffff',
      surface: '#f8fafc',
      elevated: '#ffffff',
    },
    grey: {
      50: '#f8fafc',
      100: '#f1f5f9',
      200: '#e2e8f0',
      300: '#cbd5e1',
      400: '#94a3b8',
      500: '#64748b',
      600: '#475569',
      700: '#334155',
      800: '#1e293b',
      900: '#0f172a',
    },
    text: {
      primary: 'rgba(15, 23, 42, 0.95)', // Dark text for readability
      secondary: 'rgba(15, 23, 42, 0.7)',
      disabled: 'rgba(15, 23, 42, 0.4)',
    },
    divider: 'rgba(15, 23, 42, 0.1)',
    overlay: {
      light: 'rgba(15, 23, 42, 0.05)',
      medium: 'rgba(15, 23, 42, 0.1)',
      dark: 'rgba(0, 0, 0, 0.2)',
    },
  },
  typography: {
    fontFamily: '"Inter", "SF Pro Display", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    h1: {
      fontSize: '2.5rem',
      fontWeight: 700,
      lineHeight: 1.2,
      letterSpacing: '-0.025em',
    },
    h2: {
      fontSize: '2rem',
      fontWeight: 600,
      lineHeight: 1.3,
      letterSpacing: '-0.025em',
    },
    h3: {
      fontSize: '1.5rem',
      fontWeight: 600,
      lineHeight: 1.4,
      letterSpacing: '-0.025em',
    },
    h4: {
      fontSize: '1.25rem',
      fontWeight: 600,
      lineHeight: 1.4,
    },
    h5: {
      fontSize: '1.125rem',
      fontWeight: 600,
      lineHeight: 1.4,
    },
    h6: {
      fontSize: '1rem',
      fontWeight: 600,
      lineHeight: 1.4,
    },
    body1: {
      fontSize: '1rem',
      lineHeight: 1.6,
    },
    body2: {
      fontSize: '0.875rem',
      lineHeight: 1.6,
    },
    subtitle1: {
      fontSize: '1rem',
      fontWeight: 500,
      lineHeight: 1.5,
    },
    subtitle2: {
      fontSize: '0.875rem',
      fontWeight: 500,
      lineHeight: 1.5,
    },
    caption: {
      fontSize: '0.75rem',
      lineHeight: 1.4,
      color: 'rgba(15, 23, 42, 0.6)',
    },
    button: {
      fontWeight: 500,
      textTransform: 'none',
      letterSpacing: '0.025em',
    },
  },
  shape: {
    borderRadius: 16,
  },
  shadows: [
    'none',
    '0px 1px 2px 0px rgba(15, 23, 42, 0.05)',
    '0px 1px 3px 0px rgba(15, 23, 42, 0.1), 0px 1px 2px 0px rgba(15, 23, 42, 0.06)',
    '0px 4px 6px -2px rgba(15, 23, 42, 0.1), 0px 2px 4px -1px rgba(15, 23, 42, 0.06)',
    '0px 10px 15px -3px rgba(15, 23, 42, 0.1), 0px 4px 6px -2px rgba(15, 23, 42, 0.05)',
    '0px 20px 25px -5px rgba(15, 23, 42, 0.1), 0px 10px 10px -5px rgba(15, 23, 42, 0.04)',
    '0px 25px 50px -12px rgba(15, 23, 42, 0.25)',
    '0px 25px 50px -12px rgba(15, 23, 42, 0.25)',
    '0px 25px 50px -12px rgba(15, 23, 42, 0.25)',
    '0px 25px 50px -12px rgba(15, 23, 42, 0.25)',
    '0px 25px 50px -12px rgba(15, 23, 42, 0.25)',
    '0px 25px 50px -12px rgba(15, 23, 42, 0.25)',
    '0px 25px 50px -12px rgba(15, 23, 42, 0.25)',
    '0px 25px 50px -12px rgba(15, 23, 42, 0.25)',
    '0px 25px 50px -12px rgba(15, 23, 42, 0.25)',
    '0px 25px 50px -12px rgba(15, 23, 42, 0.25)',
    '0px 25px 50px -12px rgba(15, 23, 42, 0.25)',
    '0px 25px 50px -12px rgba(15, 23, 42, 0.25)',
    '0px 25px 50px -12px rgba(15, 23, 42, 0.25)',
    '0px 25px 50px -12px rgba(15, 23, 42, 0.25)',
    '0px 25px 50px -12px rgba(15, 23, 42, 0.25)',
    '0px 25px 50px -12px rgba(15, 23, 42, 0.25)',
    '0px 25px 50px -12px rgba(15, 23, 42, 0.25)',
    '0px 25px 50px -12px rgba(15, 23, 42, 0.25)',
    '0px 25px 50px -12px rgba(15, 23, 42, 0.25)',
  ],
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        '*': {
          boxSizing: 'border-box',
        },
        html: {
          WebkitFontSmoothing: 'antialiased',
          MozOsxFontSmoothing: 'grayscale',
        },
        body: {
          backgroundColor: '#ffffff',
          backgroundImage: 'none',
          fontFamily: '"Inter", "SF Pro Display", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
          minHeight: '100vh',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          border: '1px solid rgba(15, 23, 42, 0.08)',
          background: '#ffffff',
          boxShadow: '0px 4px 20px rgba(15, 23, 42, 0.08), 0px 1px 3px rgba(15, 23, 42, 0.06)',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: '0px 8px 25px rgba(15, 23, 42, 0.12), 0px 2px 6px rgba(15, 23, 42, 0.08)',
          },
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          textTransform: 'none',
          fontWeight: 600,
          fontSize: '0.875rem',
          padding: '12px 24px',
          boxShadow: 'none',
          transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
          '&:hover': {
            boxShadow: '0px 4px 12px rgba(124, 58, 237, 0.15)',
            transform: 'translateY(-2px)',
          },
        },
        contained: {
          background: 'linear-gradient(135deg, #7c3aed 0%, #6366f1 100%)',
          color: '#ffffff',
          border: '1px solid rgba(15, 23, 42, 0.05)',
          '&:hover': {
            background: 'linear-gradient(135deg, #6d28d9 0%, #4f46e5 100%)',
            boxShadow: '0px 6px 20px rgba(124, 58, 237, 0.3)',
          },
          '&:disabled': {
            background: 'rgba(15, 23, 42, 0.05)',
            color: 'rgba(15, 23, 42, 0.4)',
          },
        },
        outlined: {
          border: '1px solid rgba(15, 23, 42, 0.2)',
          color: 'rgba(15, 23, 42, 0.9)',
          '&:hover': {
            border: '1px solid rgba(124, 58, 237, 0.5)',
            background: 'rgba(124, 58, 237, 0.05)',
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          border: '1px solid rgba(15, 23, 42, 0.08)',
          background: '#ffffff',
          color: 'rgba(15, 23, 42, 0.95)',
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          background: 'rgba(255, 255, 255, 0.8)',
          backdropFilter: 'blur(20px)',
          border: 'none',
          borderBottom: '1px solid rgba(15, 23, 42, 0.08)',
          color: 'rgba(15, 23, 42, 0.95)',
          boxShadow: '0 4px 12px rgba(15, 23, 42, 0.05)',
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(20px)',
          border: 'none',
          borderRight: '1px solid rgba(15, 23, 42, 0.08)',
          color: 'rgba(15, 23, 42, 0.95)',
        },
      },
    },
    MuiListItemButton: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          margin: '4px 12px',
          transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
          color: 'rgba(15, 23, 42, 0.7)',
          '&:hover': {
            backgroundColor: 'rgba(124, 58, 237, 0.08)',
            transform: 'translateX(4px)',
            color: 'rgba(15, 23, 42, 0.95)',
          },
          '&.Mui-selected': {
            background: 'rgba(124, 58, 237, 0.12)',
            color: 'rgba(15, 23, 42, 0.95)',
            '&:hover': {
              background: 'rgba(124, 58, 237, 0.15)',
            },
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          fontWeight: 500,
          border: '1px solid rgba(15, 23, 42, 0.1)',
          background: 'rgba(15, 23, 42, 0.03)',
          color: 'rgba(15, 23, 42, 0.9)',
          '&.MuiChip-colorSuccess': {
            background: 'rgba(16, 185, 129, 0.1)',
            color: '#059669',
            border: '1px solid rgba(16, 185, 129, 0.2)',
          },
          '&.MuiChip-colorError': {
            background: 'rgba(239, 68, 68, 0.1)',
            color: '#dc2626',
            border: '1px solid rgba(239, 68, 68, 0.2)',
          },
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: '12px',
            background: 'rgba(15, 23, 42, 0.02)',
            '& fieldset': {
              borderColor: 'rgba(15, 23, 42, 0.15)',
            },
            '&:hover fieldset': {
              borderColor: 'rgba(124, 58, 237, 0.5)',
            },
            '&.Mui-focused fieldset': {
              borderColor: '#7c3aed',
              borderWidth: '2px',
            },
          },
          '& .MuiInputLabel-root': {
            color: 'rgba(15, 23, 42, 0.7)',
          },
          '& .MuiInputBase-input': {
            color: 'rgba(15, 23, 42, 0.95)',
          },
          '& .MuiFormHelperText-root': {
            color: 'rgba(15, 23, 42, 0.6)',
          },
        },
      },
    },
  },
});

const ThemeContext = createContext();

export const useThemeContext = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useThemeContext must be used within a ThemeProvider');
  }
  return context;
};

export const ThemeProvider = ({ children }) => {
  const [currentTheme, setCurrentTheme] = useState('dark');

  // Load theme preference from localStorage on initial render
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      setCurrentTheme(savedTheme);
    }
  }, []);

  // Save theme preference to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('theme', currentTheme);
  }, [currentTheme]);

  const toggleTheme = () => {
    setCurrentTheme(prevTheme => prevTheme === 'dark' ? 'light' : 'dark');
  };

  const theme = currentTheme === 'dark' ? darkTheme : lightTheme;

  return (
    <ThemeContext.Provider value={{ theme, currentTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};