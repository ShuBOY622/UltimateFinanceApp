import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { ThemeProvider as MuiThemeProvider, CssBaseline, Box, AppBar, Toolbar, Typography, IconButton, Drawer, List, ListItem, ListItemIcon, ListItemText, useMediaQuery, Avatar, Menu, MenuItem, Divider, Button, useTheme } from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import { Toaster } from 'react-hot-toast';

// Icons
import { 
  Menu as MenuIcon, 
  Dashboard as DashboardIcon, 
  TrendingUp as InvestmentsIcon,
  AccountBalance as BudgetIcon,
  Flag as GoalsIcon,
  Receipt as TransactionsIcon,
  Upload as StatementsIcon,
  Logout as LogoutIcon,
  Person as PersonIcon,
  Close as CloseIcon,
  Receipt as ReceiptIcon
} from '@mui/icons-material';

// Components
import LandingPage from './components/LandingPage';
import Dashboard from './components/Dashboard';
import Login from './components/Auth/Login';
import Register from './components/Auth/Register';
import Investments from './components/Investments/Investments';
import Budget from './components/Budget/Budget';
import Goals from './components/Goals/Goals';
import Transactions from './components/Transactions/Transactions';
import StatementUpload from './components/Statements/StatementUpload';
import Profile from './components/Profile/Profile';
import SubscriptionsPage from './components/Subscriptions/SubscriptionsPage';
import ThemeToggle from './components/ThemeToggle';

// Context
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ThemeProvider, useThemeContext } from './contexts/ThemeContext';

function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}

function AppContent() {
  const { theme } = useThemeContext();
  
  return (
    <MuiThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <Router>
          <Box 
            sx={{ 
              display: 'flex', 
              minHeight: '100vh',
              background: theme.palette.mode === 'dark' 
                ? 'linear-gradient(135deg, #0f0f23 0%, #1a1a3e 100%)'
                : 'none',
            }}
          >
            <AnimatePresence mode="wait">
              <Routes>
                <Route path="/" element={<LandingPage />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/*" element={<AuthenticatedApp />} />
              </Routes>
            </AnimatePresence>
          </Box>
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: theme.palette.mode === 'dark' 
                  ? 'rgba(255, 255, 255, 0.1)'
                  : 'rgba(255, 255, 255, 0.9)',
                backdropFilter: 'blur(20px)',
                border: theme.palette.mode === 'dark' 
                  ? '1px solid rgba(255, 255, 255, 0.2)'
                  : '1px solid rgba(0, 0, 0, 0.1)',
                color: theme.palette.mode === 'dark' ? '#fff' : '#000',
                borderRadius: '12px',
                boxShadow: theme.palette.mode === 'dark' 
                  ? '0 8px 32px rgba(0, 0, 0, 0.3)'
                  : '0 8px 32px rgba(0, 0, 0, 0.1)',
              },
            }}
          />
        </Router>
      </AuthProvider>
    </MuiThemeProvider>
  );
}

function AuthenticatedApp() {
  const { user, logout } = useAuth();
  const { theme } = useThemeContext();
  const muiTheme = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const isMobile = useMediaQuery(muiTheme.breakpoints.down('md'));
  const [drawerOpen, setDrawerOpen] = React.useState(!isMobile);
  const [userMenuAnchor, setUserMenuAnchor] = React.useState(null);

  React.useEffect(() => {
    setDrawerOpen(!isMobile);
  }, [isMobile]);

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const menuItems = [
    { text: 'Dashboard', icon: <DashboardIcon />, path: '/dashboard' },
    { text: 'Investments', icon: <InvestmentsIcon />, path: '/investments' },
    { text: 'Budget', icon: <BudgetIcon />, path: '/budget' },
    { text: 'Goals', icon: <GoalsIcon />, path: '/goals' },
    { text: 'Subscriptions', icon: <ReceiptIcon />, path: '/subscriptions' },
    { text: 'Transactions', icon: <TransactionsIcon />, path: '/transactions' },
  ];

  const drawerWidth = 280;

  const handleUserMenuOpen = (event) => {
    setUserMenuAnchor(event.currentTarget);
  };

  const handleUserMenuClose = () => {
    setUserMenuAnchor(null);
  };

  const handleLogout = () => {
    logout();
    handleUserMenuClose();
  };

  return (
    <Box sx={{ display: 'flex', width: '100%' }}>
      {/* App Bar */}
      <AppBar
        position="fixed"
        sx={{
          zIndex: muiTheme.zIndex.drawer + 1,
          background: theme.palette.mode === 'dark' 
            ? 'rgba(15, 15, 35, 0.8)'
            : 'rgba(255, 255, 255, 0.8)',
          backdropFilter: 'blur(20px)',
          border: 'none',
          borderBottom: theme.palette.mode === 'light' 
            ? '1px solid rgba(15, 23, 42, 0.08)'
            : 'none',
          boxShadow: theme.palette.mode === 'dark' 
            ? '0 8px 32px rgba(0, 0, 0, 0.3)'
            : '0 4px 12px rgba(15, 23, 42, 0.05)',
          height: '80px',
        }}
      >
        <Toolbar sx={{ height: '80px' }}>
          <IconButton
            color="inherit"
            onClick={() => setDrawerOpen(!drawerOpen)}
            sx={{ 
              mr: 2,
              color: theme.palette.mode === 'dark' 
                ? 'rgba(255, 255, 255, 0.9)'
                : 'rgba(15, 23, 42, 0.9)',
              '&:hover': {
                transform: 'scale(1.1)',
                transition: 'transform 0.2s ease-in-out',
                backgroundColor: theme.palette.mode === 'dark' 
                  ? 'rgba(255, 255, 255, 0.1)'
                  : 'rgba(0, 0, 0, 0.04)',
              }
            }}
          >
            {drawerOpen ? <CloseIcon /> : <MenuIcon />}
          </IconButton>
          <div>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <img 
                src={theme.palette.mode === 'dark' ? "/finora.png" : "/DarkFinora.png"} 
                alt="Finora Logo" 
                style={{ 
                  height: 120, 
                  width: 'auto',
                  display: 'block',
                  objectFit: 'contain',
                  maxHeight: 120
                }}
              />
            </Box>
          </div>
          <Box sx={{ flexGrow: 1 }} />
          <ThemeToggle />
          <Button
            onClick={handleUserMenuOpen}
            startIcon={
              <Avatar 
                sx={{ 
                  width: 32, 
                  height: 32,
                  background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)'
                }}
              >
                {user?.firstName?.[0]}{user?.lastName?.[0]}
              </Avatar>
            }
            sx={{ 
              color: theme.palette.mode === 'dark' ? 'white' : 'rgba(15, 23, 42, 0.9)',
              textTransform: 'none',
              ml: 1,
              '&:hover': {
                backgroundColor: theme.palette.mode === 'dark' 
                  ? 'rgba(255, 255, 255, 0.1)'
                  : 'rgba(0, 0, 0, 0.04)',
              }
            }}
          >
            {user?.firstName} {user?.lastName}
          </Button>
          <Menu
            anchorEl={userMenuAnchor}
            open={Boolean(userMenuAnchor)}
            onClose={handleUserMenuClose}
            PaperProps={{
              sx: {
                background: theme.palette.mode === 'dark' 
                  ? 'rgba(255, 255, 255, 0.1)'
                  : 'rgba(255, 255, 255, 0.9)',
                backdropFilter: 'blur(20px)',
                border: theme.palette.mode === 'dark' 
                  ? '1px solid rgba(255, 255, 255, 0.2)'
                  : '1px solid rgba(0, 0, 0, 0.1)',
                borderRadius: '12px',
                mt: 1,
              },
            }}
          >
            <MenuItem 
              onClick={() => {
                navigate('/profile');
                handleUserMenuClose();
              }}
              sx={{
                color: theme.palette.mode === 'dark' 
                  ? 'rgba(255, 255, 255, 0.9)'
                  : 'rgba(15, 23, 42, 0.9)',
                '&:hover': {
                  backgroundColor: theme.palette.mode === 'dark' 
                    ? 'rgba(99, 102, 241, 0.1)'
                    : 'rgba(124, 58, 237, 0.08)',
                }
              }}
            >
              <PersonIcon sx={{ mr: 1 }} /> Profile
            </MenuItem>
            <Divider sx={{ 
              borderColor: theme.palette.mode === 'dark' 
                ? 'rgba(255, 255, 255, 0.1)'
                : 'rgba(15, 23, 42, 0.1)'
            }} />
            <MenuItem 
              onClick={handleLogout}
              sx={{
                color: theme.palette.mode === 'dark' 
                  ? 'rgba(255, 255, 255, 0.9)'
                  : 'rgba(15, 23, 42, 0.9)',
                '&:hover': {
                  backgroundColor: theme.palette.mode === 'dark' 
                    ? 'rgba(239, 68, 68, 0.1)'
                    : 'rgba(239, 68, 68, 0.08)',
                }
              }}
            >
              <LogoutIcon sx={{ mr: 1 }} /> Logout
            </MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>

      {/* Sidebar */}
      <Drawer
        variant={isMobile ? 'temporary' : 'persistent'}
        anchor="left"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            boxSizing: 'border-box',
            background: theme.palette.mode === 'dark' 
              ? 'rgba(15, 15, 35, 0.95)'
              : 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(20px)',
            border: 'none',
            borderRight: theme.palette.mode === 'dark' 
              ? '1px solid rgba(255, 255, 255, 0.1)'
              : '1px solid rgba(15, 23, 42, 0.08)',
          },
        }}
      >
        <Toolbar sx={{ height: '80px' }} /> {/* Spacer for app bar */}
        <List sx={{ px: 2, py: 2 }}>
          {menuItems.map((item, index) => {
            const isActive = location.pathname === item.path;
            return (
              <motion.div
                key={item.text}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <ListItem
                  button
                  onClick={() => navigate(item.path)}
                  sx={{
                    borderRadius: '12px',
                    mb: 1,
                    background: isActive 
                      ? theme.palette.mode === 'dark' 
                        ? 'rgba(99, 102, 241, 0.1)'
                        : 'rgba(124, 58, 237, 0.12)'
                      : 'transparent',
                    border: isActive 
                      ? theme.palette.mode === 'dark' 
                        ? '1px solid rgba(99, 102, 241, 0.3)'
                        : '1px solid rgba(124, 58, 237, 0.2)'
                      : '1px solid transparent',
                    '&:hover': {
                      background: theme.palette.mode === 'dark' 
                        ? 'rgba(99, 102, 241, 0.1)'
                        : 'rgba(124, 58, 237, 0.08)',
                      transform: 'translateX(8px)',
                      border: theme.palette.mode === 'dark' 
                        ? '1px solid rgba(99, 102, 241, 0.3)'
                        : '1px solid rgba(124, 58, 237, 0.2)',
                    },
                    transition: 'all 0.2s ease-in-out',
                    cursor: 'pointer',
                  }}
                >
                  <ListItemIcon 
                    sx={{ 
                      color: isActive 
                        ? theme.palette.mode === 'dark' 
                          ? muiTheme.palette.primary.light 
                          : muiTheme.palette.primary.main
                        : theme.palette.mode === 'dark' 
                          ? 'rgba(255, 255, 255, 0.7)'
                          : 'rgba(15, 23, 42, 0.7)',
                      minWidth: 40
                    }}
                  >
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText
                    primary={item.text}
                    sx={{
                      '& .MuiTypography-root': {
                        fontWeight: isActive ? 700 : 600,
                        color: isActive 
                          ? theme.palette.mode === 'dark' 
                            ? '#fff' 
                            : 'rgba(15, 23, 42, 0.95)'
                          : theme.palette.mode === 'dark' 
                            ? 'rgba(255, 255, 255, 0.8)'
                            : 'rgba(15, 23, 42, 0.8)'
                      },
                    }}
                  />
                </ListItem>
              </motion.div>
            );
          })}
        </List>
      </Drawer>

      {/* Main Content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          transition: muiTheme.transitions.create('margin', {
            easing: muiTheme.transitions.easing.sharp,
            duration: muiTheme.transitions.duration.leavingScreen,
          }),
          marginLeft: drawerOpen && !isMobile ? 0 : `-${drawerWidth}px`,
        }}
      >
        <Toolbar /> {/* Spacer for app bar */}
        <Box sx={{ p: 3 }}>
          <AnimatePresence mode="wait">
            <Routes>
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route 
                path="/dashboard" 
                element={
                  <motion.div
                    key="dashboard"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Dashboard />
                  </motion.div>
                } 
              />
              <Route 
                path="/investments" 
                element={
                  <motion.div
                    key="investments"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Investments />
                  </motion.div>
                } 
              />
              <Route 
                path="/budget" 
                element={
                  <motion.div
                    key="budget"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Budget />
                  </motion.div>
                } 
              />
              <Route 
                path="/goals" 
                element={
                  <motion.div
                    key="goals"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Goals />
                  </motion.div>
                } 
              />
              <Route 
                path="/transactions" 
                element={
                  <motion.div
                    key="transactions"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Transactions />
                  </motion.div>
                } 
              />
              <Route 
                path="/statements" 
                element={
                  <motion.div
                    key="statements"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Box sx={{ maxWidth: '1200px', margin: '0 auto', p: 3 }}>
                      <Typography variant="h4" fontWeight="bold" gutterBottom sx={{ 
                        color: theme.palette.mode === 'dark' 
                          ? 'text.primary' 
                          : 'rgba(15, 23, 42, 0.95)'
                      }}>
                        Upload Bank Statements
                      </Typography>
                      <Typography variant="body1" sx={{ 
                        color: theme.palette.mode === 'dark' 
                          ? 'text.secondary' 
                          : 'rgba(15, 23, 42, 0.7)',
                        mb: 3 
                      }}>
                        Parse and import transactions from your bank statements automatically
                      </Typography>
                      <StatementUpload />
                    </Box>
                  </motion.div>
                } 
              />
              <Route 
                path="/profile" 
                element={
                  <motion.div
                    key="profile"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Profile />
                  </motion.div>
                } 
              />
              <Route 
                path="/subscriptions" 
                element={
                  <motion.div
                    key="subscriptions"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                  >
                    <SubscriptionsPage />
                  </motion.div>
                } 
              />
            </Routes>
          </AnimatePresence>
        </Box>
      </Box>
    </Box>
  );
}

export default App;