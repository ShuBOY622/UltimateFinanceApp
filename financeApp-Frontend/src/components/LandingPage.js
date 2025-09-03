import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  Container,
  AppBar,
  Toolbar,
  IconButton,
  Avatar,
  Menu,
  MenuItem,
  Divider,
  Fab,
  Tooltip,
  useTheme,
  useMediaQuery
} from '@mui/material';
import {
  TrendingUp,
  AccountBalance,
  Assessment,
  FileUpload,
  AutoGraph,
  Speed,
  Security,
  Menu as MenuIcon,
  Close as CloseIcon,
  EmojiEvents,
  ArrowDownward,
  Login as LoginIcon,
  PersonAdd as PersonAddIcon,
  ShowChart,
  CloudUpload,
  Timeline,
  Savings,
  Insights
} from '@mui/icons-material';
import { motion, useAnimation, useInView } from 'framer-motion';
import { alpha } from '@mui/material/styles';
import { useThemeContext } from '../contexts/ThemeContext';

const LandingPage = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const { currentTheme } = useThemeContext();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [anchorEl, setAnchorEl] = useState(null);
  const controls = useAnimation();
  const ref = React.useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  useEffect(() => {
    if (isInView) {
      controls.start("visible");
    }
  }, [isInView, controls]);

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  // Features data
  const features = [
    {
      icon: <FileUpload sx={{ fontSize: 40 }} />,
      title: "Smart PDF Statement Parsing",
      description: "Tired of manually entering transactions? Just upload your bank or UPI statements and let our AI extract all transactions automatically.",
      color: currentTheme === 'dark' ? "#6366f1" : "#4f46e5"
    },
    {
      icon: <AutoGraph sx={{ fontSize: 40 }} />,
      title: "Live Investment Tracking",
      description: "Monitor your portfolio in real-time with live market data integration. Get instant updates on your stock and mutual fund performance.",
      color: currentTheme === 'dark' ? "#8b5cf6" : "#7c3aed"
    },
    {
      icon: <Speed sx={{ fontSize: 40 }} />,
      title: "AI-Powered Financial Insights",
      description: "Get personalized recommendations to optimize your spending, save more, and invest wisely based on your financial patterns.",
      color: currentTheme === 'dark' ? "#f59e0b" : "#d97706"
    },
    {
      icon: <Security sx={{ fontSize: 40 }} />,
      title: "Bank-Level Security",
      description: "Your financial data is protected with end-to-end encryption and never shared with third parties. Privacy is our priority.",
      color: currentTheme === 'dark' ? "#10b981" : "#059669"
    }
  ];

    // Features data
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5
      }
    }
  };

  const floatingAnimation = {
    y: [0, -10, 0],
    transition: {
      duration: 3,
      repeat: Infinity,
      ease: "easeInOut"
    }
  };

  return (
    <Box 
      sx={{ 
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #0f0f23 0%, #1a1a3e 100%)',
        backgroundImage: [
          'radial-gradient(at 20% 30%, hsla(240, 50%, 30%, 0.3) 0px, transparent 50%)',
          'radial-gradient(at 80% 70%, hsla(260, 50%, 40%, 0.3) 0px, transparent 50%)',
          'radial-gradient(at 40% 40%, hsla(280, 50%, 35%, 0.3) 0px, transparent 50%)'
        ].join(', '),
        color: 'white',
        pb: 8,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center'
      }}
    >
      {/* Navigation */}
      <AppBar 
        position="sticky" 
        sx={{ 
          background: currentTheme === 'dark' 
            ? 'rgba(15, 15, 35, 0.8)'
            : 'rgba(255, 255, 255, 0.8)',
          backdropFilter: 'blur(20px)',
          border: 'none',
          boxShadow: currentTheme === 'dark' 
            ? '0 8px 32px rgba(0, 0, 0, 0.3)'
            : '0 4px 12px rgba(0, 0, 0, 0.05)',
        }}
      >
        <Container maxWidth="xl">
          <Toolbar sx={{ height: '80px' }}>
            <Box sx={{ flexGrow: 1, display: 'flex', alignItems: 'center' }}>
              <img 
                src={currentTheme === 'dark' ? "/finora.png" : "/DarkFinora.png"} 
                alt="Finora Logo" 
                style={{ 
                  height: 50, 
                  width: 'auto',
                  display: 'block',
                  objectFit: 'contain'
                }}
              />
            </Box>
            
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button 
                variant="outlined" 
                startIcon={<LoginIcon />}
                onClick={() => navigate('/login')}
                sx={{
                  borderRadius: '12px',
                  borderColor: currentTheme === 'dark' 
                    ? 'rgba(255, 255, 255, 0.2)'
                    : 'rgba(15, 23, 42, 0.2)',
                  color: currentTheme === 'dark' 
                    ? 'rgba(255, 255, 255, 0.9)'
                    : 'rgba(15, 23, 42, 0.9)',
                  '&:hover': {
                    borderColor: 'rgba(99, 102, 241, 0.5)',
                    background: currentTheme === 'dark' 
                      ? 'rgba(99, 102, 241, 0.1)'
                      : 'rgba(99, 102, 241, 0.05)',
                  }
                }}
              >
                Login
              </Button>
              <Button 
                variant="contained" 
                startIcon={<PersonAddIcon />}
                onClick={() => navigate('/register')}
                sx={{
                  borderRadius: '12px',
                  background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #5b5fff 0%, #7c3aed 100%)',
                    boxShadow: '0px 6px 20px rgba(99, 102, 241, 0.4)',
                  }
                }}
              >
                Sign Up
              </Button>
            </Box>
          </Toolbar>
        </Container>
      </AppBar>

      {/* Hero Section */}
      <Container maxWidth="xl" sx={{ pt: 8, pb: 6, display: 'flex', justifyContent: 'center', width: '100%' }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <Grid container spacing={6} alignItems="center">
            <Grid item xs={12} md={6}>
              <motion.div animate={floatingAnimation}>
                <Typography 
                  variant="h1" 
                  sx={{ 
                    fontWeight: 800, 
                    fontSize: { xs: '2.5rem', md: '3.5rem' },
                    lineHeight: 1.2,
                    mb: 3,
                    background: currentTheme === 'dark' 
                      ? 'linear-gradient(135deg, #fff 0%, #cbd5e1 100%)'
                      : 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
                    backgroundClip: 'text',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent'
                  }}
                >
                  Take Control of Your <span style={{ color: '#6366f1' }}>Financial Future</span>
                </Typography>
              </motion.div>
              
              <Typography 
                variant="h5" 
                sx={{ 
                  fontWeight: 400, 
                  color: currentTheme === 'dark' 
                    ? 'rgba(255, 255, 255, 0.8)'
                    : 'rgba(15, 23, 42, 0.8)',
                  mb: 4,
                  maxWidth: 500
                }}
              >
                The smart way to track expenses, manage investments, and achieve your financial goals with AI-powered insights.
              </Typography>
              
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                <Button 
                  variant="contained" 
                  size="large"
                  onClick={() => navigate('/register')}
                  sx={{
                    borderRadius: '12px',
                    py: 1.5,
                    px: 4,
                    fontSize: '1.1rem',
                    fontWeight: 600,
                    background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                    boxShadow: '0 4px 20px rgba(99, 102, 241, 0.4)',
                    '&:hover': {
                      background: 'linear-gradient(135deg, #5b5fff 0%, #7c3aed 100%)',
                      boxShadow: '0 6px 25px rgba(99, 102, 241, 0.5)',
                      transform: 'translateY(-2px)'
                    },
                    transition: 'all 0.3s ease'
                  }}
                >
                  Get Started Free
                </Button>
                
                <Button 
                  variant="outlined" 
                  size="large"
                  onClick={() => navigate('/login')}
                  sx={{
                    borderRadius: '12px',
                    py: 1.5,
                    px: 4,
                    fontSize: '1.1rem',
                    fontWeight: 600,
                    borderColor: 'rgba(255, 255, 255, 0.3)',
                    color: 'white',
                    '&:hover': {
                      borderColor: 'rgba(255, 255, 255, 0.5)',
                      background: 'rgba(255, 255, 255, 0.1)'
                    }
                  }}
                >
                  Sign In
                </Button>
              </Box>
              
              <Box sx={{ mt: 4, display: 'flex', alignItems: 'center', gap: 2 }}>
                <Box sx={{ display: 'flex' }}>
                  {[...Array(5)].map((_, i) => (
                    <Avatar 
                      key={i}
                      sx={{ 
                        width: 32, 
                        height: 32, 
                        fontSize: '0.75rem',
                        background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                        border: currentTheme === 'dark' 
                          ? '2px solid #0f0f23'
                          : '2px solid #ffffff',
                        ml: i > 0 ? -1.5 : 0
                      }}
                    >
                      U{i+1}
                    </Avatar>
                  ))}
                </Box>
                <Typography variant="body2" sx={{ 
                  color: currentTheme === 'dark' 
                    ? 'rgba(255, 255, 255, 0.7)'
                    : 'rgba(15, 23, 42, 0.7)'
                }}>
                  Join <span style={{ 
                    color: currentTheme === 'dark' ? 'white' : 'rgba(15, 23, 42, 0.9)', 
                    fontWeight: 600
                  }}>10,000+</span> users who transformed their finances
                </Typography>
              </Box>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Box 
                sx={{ 
                  position: 'relative',
                  height: '100%',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center'
                }}
              >
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.8, delay: 0.2 }}
                >
                  <Box
                    component="img"
                    src="/finora-dashboard-preview.svg"
                    alt="Finora Dashboard Preview"
                    sx={{
                      width: '100%',
                      maxWidth: 600,
                      borderRadius: 4,
                      boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.6)',
                      border: '1px solid rgba(255, 255, 255, 0.1)'
                    }}
                  />
                </motion.div>
                
                {/* Floating elements around dashboard */}
                <motion.div
                  animate={{ 
                    y: [0, -15, 0],
                    rotate: [0, 5, 0]
                  }}
                  transition={{ 
                    duration: 4,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                  style={{
                    position: 'absolute',
                    top: '10%',
                    left: '10%',
                    background: 'rgba(99, 102, 241, 0.2)',
                    backdropFilter: 'blur(10px)',
                    borderRadius: '50%',
                    width: 60,
                    height: 60,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: '1px solid rgba(99, 102, 241, 0.3)'
                  }}
                >
                  <TrendingUp sx={{ color: '#6366f1', fontSize: 30 }} />
                </motion.div>
                
                <motion.div
                  animate={{ 
                    y: [0, 15, 0],
                    rotate: [0, -5, 0]
                  }}
                  transition={{ 
                    duration: 5,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: 1
                  }}
                  style={{
                    position: 'absolute',
                    bottom: '15%',
                    right: '10%',
                    background: 'rgba(139, 92, 246, 0.2)',
                    backdropFilter: 'blur(10px)',
                    borderRadius: '50%',
                    width: 70,
                    height: 70,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: '1px solid rgba(139, 92, 246, 0.3)'
                  }}
                >
                  <AutoGraph sx={{ color: '#8b5cf6', fontSize: 35 }} />
                </motion.div>
              </Box>
            </Grid>
          </Grid>
        </motion.div>
        
        {/* Scroll indicator */}
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}>
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            <ArrowDownward sx={{ fontSize: 40, color: 'rgba(255, 255, 255, 0.5)' }} />
          </motion.div>
        </Box>
      </Container>

      {/* Features Section */}
      <Container maxWidth="xl" sx={{ py: 10, display: 'flex', justifyContent: 'center', width: '100%' }}>
        <motion.div
          ref={ref}
          variants={containerVariants}
          initial="hidden"
          animate={controls}
        >
          <Box sx={{ textAlign: 'center', mb: 8 }}>
            <motion.div
              variants={itemVariants}
            >
              <Typography 
                variant="h2" 
                sx={{ 
                  fontWeight: 800, 
                  mb: 2,
                  background: 'linear-gradient(135deg, #fff 0%, #cbd5e1 100%)',
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent'
                }}
              >
                Powerful Features
              </Typography>
              <Typography 
                variant="h5" 
                sx={{ 
                  fontWeight: 400, 
                  color: 'rgba(255, 255, 255, 0.7)',
                  maxWidth: 700,
                  mx: 'auto'
                }}
              >
                Everything you need to take control of your finances and build wealth
              </Typography>
            </motion.div>
          </Box>
          
          <Grid container spacing={4}>
            {features.map((feature, index) => (
              <Grid item xs={12} sm={6} md={4} key={index}>
                <motion.div
                  variants={itemVariants}
                  whileHover={{ y: -10 }}
                  transition={{ duration: 0.3 }}
                >
                  <Card 
                  sx={{ 
                    height: '100%',
                    background: currentTheme === 'dark' 
                      ? 'linear-gradient(135deg, rgba(30, 41, 59, 0.7) 0%, rgba(15, 23, 42, 0.8) 100%)'
                      : 'rgba(255, 255, 255, 0.7)',
                    backdropFilter: 'blur(20px)',
                    border: currentTheme === 'dark' 
                      ? '1px solid rgba(255, 255, 255, 0.1)'
                      : '1px solid rgba(15, 23, 42, 0.08)',
                    borderRadius: 3,
                    boxShadow: currentTheme === 'dark' 
                      ? '0 8px 32px rgba(0, 0, 0, 0.3)'
                      : '0 4px 20px rgba(0, 0, 0, 0.08)',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    '&:hover': {
                      transform: 'translateY(-8px)',
                      background: currentTheme === 'dark' 
                        ? 'linear-gradient(135deg, rgba(30, 41, 59, 0.8) 0%, rgba(15, 23, 42, 0.9) 100%)'
                        : 'rgba(255, 255, 255, 0.8)',
                      boxShadow: currentTheme === 'dark' 
                        ? '0 12px 40px rgba(0, 0, 0, 0.4)'
                        : '0 8px 30px rgba(0, 0, 0, 0.12)',
                    }
                  }}
                >
                                      <CardContent>
                    <Box sx={{ color: feature.color, mb: 2 }}>
                      {feature.icon}
                    </Box>
                    <Typography 
                      variant="h6" 
                      fontWeight="bold" 
                      gutterBottom
                      sx={{ 
                        color: currentTheme === 'dark' 
                          ? 'rgba(255, 255, 255, 0.95)'
                          : 'rgba(15, 23, 42, 0.95)'
                      }}
                    >
                      {feature.title}
                    </Typography>
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        color: currentTheme === 'dark' 
                          ? 'rgba(255, 255, 255, 0.7)'
                          : 'rgba(15, 23, 42, 0.7)'
                      }}
                    >
                      {feature.description}
                    </Typography>
                  </CardContent>
                  </Card>
                </motion.div>
              </Grid>
            ))}
          </Grid>
        </motion.div>
      </Container>

      {/* How It Works Section */}
      <Container maxWidth="xl" sx={{ py: 10, display: 'flex', justifyContent: 'center', width: '100%' }}>
        <Grid container spacing={6} alignItems="center">
          <Grid item xs={12} md={6}>
            <Box sx={{ position: 'relative' }}>
              <motion.div
                initial={{ opacity: 0, x: -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
              >
                <Box
                  component="img"
                  src="/finora-workflow.svg"
                  alt="How Finora Works"
                  sx={{
                    width: '100%',
                    maxWidth: 500,
                    borderRadius: 4,
                    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.6)',
                    border: '1px solid rgba(255, 255, 255, 0.1)'
                  }}
                />
              </motion.div>
              
              {/* Decorative elements */}
              <Box
                sx={{
                  position: 'absolute',
                  top: '-20px',
                  right: '-20px',
                  width: 100,
                  height: 100,
                  borderRadius: '50%',
                  background: 'radial-gradient(circle, rgba(99, 102, 241, 0.3) 0%, transparent 70%)',
                  zIndex: -1
                }}
              />
              <Box
                sx={{
                  position: 'absolute',
                  bottom: '-30px',
                  left: '-30px',
                  width: 150,
                  height: 150,
                  borderRadius: '50%',
                  background: 'radial-gradient(circle, rgba(139, 92, 246, 0.3) 0%, transparent 70%)',
                  zIndex: -1
                }}
              />
            </Box>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <Typography 
                variant="h2" 
                sx={{ 
                  fontWeight: 800, 
                  mb: 4,
                  background: currentTheme === 'dark' 
                    ? 'linear-gradient(135deg, #fff 0%, #cbd5e1 100%)'
                    : 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent'
                }}
              >
                How It <span style={{ color: '#6366f1' }}>Works</span>
              </Typography>
              
              <Box sx={{ mb: 4 }}>
                <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 4 }}>
                  <Box 
                    sx={{ 
                      minWidth: 40, 
                      height: 40, 
                      borderRadius: '50%', 
                      background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      mr: 3
                    }}
                  >
                    <Typography variant="h6" sx={{ fontWeight: 700 }}>1</Typography>
                  </Box>
                  <Box>
                    <Typography variant="h5" sx={{ fontWeight: 700, mb: 1, color: currentTheme === 'dark' ? 'white' : 'rgba(15, 23, 42, 0.95)' }}>
                      Upload Your Statements
                    </Typography>
                    <Typography variant="body1" sx={{ color: currentTheme === 'dark' ? 'rgba(255, 255, 255, 0.7)' : 'rgba(15, 23, 42, 0.7)' }}>
                      Simply upload your bank statements, UPI transactions, or investment reports in PDF, CSV, or Excel format.
                    </Typography>
                  </Box>
                </Box>
                
                <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 4 }}>
                  <Box 
                    sx={{ 
                      minWidth: 40, 
                      height: 40, 
                      borderRadius: '50%', 
                      background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      mr: 3
                    }}
                  >
                    <Typography variant="h6" sx={{ fontWeight: 700 }}>2</Typography>
                  </Box>
                  <Box>
                    <Typography variant="h5" sx={{ fontWeight: 700, mb: 1, color: currentTheme === 'dark' ? 'white' : 'rgba(15, 23, 42, 0.95)' }}>
                      AI Processes Your Data
                    </Typography>
                    <Typography variant="body1" sx={{ color: currentTheme === 'dark' ? 'rgba(255, 255, 255, 0.7)' : 'rgba(15, 23, 42, 0.7)' }}>
                      Our advanced AI extracts and categorizes all your transactions automatically, saving you hours of manual work.
                    </Typography>
                  </Box>
                </Box>
                
                <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
                  <Box 
                    sx={{ 
                      minWidth: 40, 
                      height: 40, 
                      borderRadius: '50%', 
                      background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      mr: 3
                    }}
                  >
                    <Typography variant="h6" sx={{ fontWeight: 700 }}>3</Typography>
                  </Box>
                  <Box>
                    <Typography variant="h5" sx={{ fontWeight: 700, mb: 1, color: currentTheme === 'dark' ? 'white' : 'rgba(15, 23, 42, 0.95)' }}>
                      Gain Financial Clarity
                    </Typography>
                    <Typography variant="body1" sx={{ color: currentTheme === 'dark' ? 'rgba(255, 255, 255, 0.7)' : 'rgba(15, 23, 42, 0.7)' }}>
                      Access powerful insights, track your net worth, and make smarter financial decisions with real-time data.
                    </Typography>
                  </Box>
                </Box>
              </Box>
              
              <Button 
                variant="contained" 
                size="large"
                onClick={() => navigate('/register')}
                sx={{
                  borderRadius: '12px',
                  py: 1.5,
                  px: 4,
                  fontSize: '1.1rem',
                  fontWeight: 600,
                  background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                  boxShadow: '0 4px 20px rgba(99, 102, 241, 0.4)',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #5b5fff 0%, #7c3aed 100%)',
                    boxShadow: '0 6px 25px rgba(99, 102, 241, 0.5)',
                    transform: 'translateY(-2px)'
                  },
                  transition: 'all 0.3s ease'
                }}
              >
                Start Your Financial Journey
              </Button>
            </motion.div>
          </Grid>
        </Grid>
      </Container>


      {/* Testimonials */}
      <Box 
        sx={{ 
          py: 10, 
          background: 'rgba(255, 255, 255, 0.03)',
          borderTop: '1px solid rgba(255, 255, 255, 0.1)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
          width: '100%',
          display: 'flex',
          justifyContent: 'center'
        }}
      >
        <Container maxWidth="xl">
          <Box sx={{ textAlign: 'center', mb: 8 }}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <Typography 
                variant="h2" 
                sx={{ 
                  fontWeight: 800, 
                  mb: 2,
                  background: currentTheme === 'dark' 
                    ? 'linear-gradient(135deg, #fff 0%, #cbd5e1 100%)'
                    : 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent'
                }}
              >
                What Our Users Say
              </Typography>
              <Typography 
                variant="h5" 
                sx={{ 
                  fontWeight: 400, 
                  color: currentTheme === 'dark' 
                    ? 'rgba(255, 255, 255, 0.7)'
                    : 'rgba(15, 23, 42, 0.7)',
                  maxWidth: 700,
                  mx: 'auto'
                }}
              >
                Join thousands of satisfied users who transformed their financial lives
              </Typography>
            </motion.div>
          </Box>
          
          <Grid container spacing={4}>
            {[1, 2, 3].map((item) => (
              <Grid item xs={12} md={4} key={item}>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: item * 0.1 }}
                >
                  <Card
                    sx={{
                      background: currentTheme === 'dark' 
                        ? 'rgba(255, 255, 255, 0.05)'
                        : 'rgba(255, 255, 255, 0.7)',
                      backdropFilter: 'blur(20px)',
                      border: currentTheme === 'dark' 
                        ? '1px solid rgba(255, 255, 255, 0.1)'
                        : '1px solid rgba(15, 23, 42, 0.1)',
                      borderRadius: 3,
                      p: 3
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                      <Avatar sx={{ width: 56, height: 56, mr: 2, background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)' }}>
                        U{item}
                      </Avatar>
                      <Box>
                        <Typography variant="h6" sx={{ fontWeight: 700, color: currentTheme === 'dark' ? 'white' : 'rgba(15, 23, 42, 0.95)' }}>
                          User {item}
                        </Typography>
                        <Typography variant="body2" sx={{ color: currentTheme === 'dark' ? 'rgba(255, 255, 255, 0.7)' : 'rgba(15, 23, 42, 0.7)' }}>
                          Finora User
                        </Typography>
                      </Box>
                    </Box>
                    <Typography variant="body1" sx={{ color: currentTheme === 'dark' ? 'rgba(255, 255, 255, 0.9)' : 'rgba(15, 23, 42, 0.9)', fontStyle: 'italic', mb: 2 }}>
                      "Finora completely transformed how I manage my finances. The automatic statement parsing saves me hours every month, and the investment tracking keeps me on top of my portfolio."
                    </Typography>
                    <Box sx={{ display: 'flex', color: '#fbbf24' }}>
                      {[...Array(5)].map((_, i) => (
                        <EmojiEvents key={i} sx={{ fontSize: 20 }} />
                      ))}
                    </Box>
                  </Card>
                </motion.div>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* CTA Section */}
      <Container maxWidth="xl" sx={{ py: 12, textAlign: 'center', display: 'flex', justifyContent: 'center', width: '100%' }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <Typography 
            variant="h2" 
            sx={{ 
              fontWeight: 800, 
              mb: 3,
              background: currentTheme === 'dark' 
                ? 'linear-gradient(135deg, #fff 0%, #cbd5e1 100%)'
                : 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}
          >
            Ready to Take Control?
          </Typography>
          <Typography 
            variant="h5" 
            sx={{ 
              fontWeight: 400, 
              color: currentTheme === 'dark' 
                ? 'rgba(255, 255, 255, 0.8)'
                : 'rgba(15, 23, 42, 0.8)',
              mb: 5,
              maxWidth: 700,
              mx: 'auto'
            }}
          >
            Join thousands of users who are already transforming their financial lives with Finora
          </Typography>
          
          <Box sx={{ display: 'flex', justifyContent: 'center', gap: 3, flexWrap: 'wrap' }}>
            <Button 
              variant="contained" 
              size="large"
              onClick={() => navigate('/register')}
              sx={{
                borderRadius: '12px',
                py: 1.5,
                px: 4,
                fontSize: '1.1rem',
                fontWeight: 600,
                background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                boxShadow: '0 4px 20px rgba(99, 102, 241, 0.4)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #5b5fff 0%, #7c3aed 100%)',
                  boxShadow: '0 6px 25px rgba(99, 102, 241, 0.5)',
                  transform: 'translateY(-2px)'
                },
                transition: 'all 0.3s ease'
              }}
            >
              Get Started Free
            </Button>
            
            <Button 
              variant="outlined" 
              size="large"
              onClick={() => navigate('/login')}
              sx={{
                borderRadius: '12px',
                py: 1.5,
                px: 4,
                fontSize: '1.1rem',
                fontWeight: 600,
                borderColor: currentTheme === 'dark' 
                  ? 'rgba(255, 255, 255, 0.3)'
                  : 'rgba(15, 23, 42, 0.3)',
                color: currentTheme === 'dark' ? 'white' : 'rgba(15, 23, 42, 0.9)',
                '&:hover': {
                  borderColor: currentTheme === 'dark' 
                    ? 'rgba(255, 255, 255, 0.5)'
                    : 'rgba(15, 23, 42, 0.5)',
                  background: currentTheme === 'dark' 
                    ? 'rgba(255, 255, 255, 0.1)'
                    : 'rgba(15, 23, 42, 0.05)'
                }
              }}
            >
              Sign In
            </Button>
          </Box>
        </motion.div>
      </Container>

      {/* Footer */}
      <Box 
        sx={{ 
          py: 4, 
          borderTop: currentTheme === 'dark' 
            ? '1px solid rgba(255, 255, 255, 0.1)'
            : '1px solid rgba(15, 23, 42, 0.1)',
          textAlign: 'center',
          width: '100%',
          display: 'flex',
          justifyContent: 'center'
        }}
      >
        <Container maxWidth="xl">
            <Typography variant="body2" sx={{ color: currentTheme === 'dark' ? 'rgba(255, 255, 255, 0.6)' : 'rgba(15, 23, 42, 0.6)' }}>
              © {new Date().getFullYear()} Finora. All rights reserved.
            </Typography>
          </Container>
        </Box>
      </Box>

  );
};

export default LandingPage;