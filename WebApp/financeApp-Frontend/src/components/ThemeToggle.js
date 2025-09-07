import React from 'react';
import { IconButton, Tooltip } from '@mui/material';
import { styled } from '@mui/material/styles';
import { DarkMode, LightMode } from '@mui/icons-material';
import { useThemeContext } from '../contexts/ThemeContext';

const StyledIconButton = styled(IconButton)(({ theme }) => ({
  borderRadius: '50%',
  width: 40,
  height: 40,
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  '&:hover': {
    backgroundColor: theme.palette.mode === 'dark' 
      ? 'rgba(255, 255, 255, 0.1)' 
      : 'rgba(0, 0, 0, 0.04)',
    transform: 'scale(1.1)',
  },
  '& .MuiSvgIcon-root': {
    fontSize: '1.25rem',
    color: theme.palette.mode === 'dark' 
      ? 'rgba(255, 255, 255, 0.9)' 
      : 'rgba(15, 23, 42, 0.9)',
  },
}));

const ThemeToggle = () => {
  const { currentTheme, toggleTheme } = useThemeContext();

  return (
    <Tooltip title={`Switch to ${currentTheme === 'dark' ? 'light' : 'dark'} mode`} arrow>
      <StyledIconButton 
        onClick={toggleTheme}
        aria-label={`Switch to ${currentTheme === 'dark' ? 'light' : 'dark'} mode`}
      >
        {currentTheme === 'dark' ? <LightMode /> : <DarkMode />}
      </StyledIconButton>
    </Tooltip>
  );
};

export default ThemeToggle;