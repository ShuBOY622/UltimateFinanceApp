import React from 'react';
import { Box, Container, Typography, Breadcrumbs, Link } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import { Home } from '@mui/icons-material';
import SubscriptionTracker from './SubscriptionTracker';

const SubscriptionsPage = () => {
  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 3 }}>
        <Link component={RouterLink} to="/" color="inherit" sx={{ display: 'flex', alignItems: 'center' }}>
          <Home sx={{ mr: 0.5, fontSize: 16 }} />
          Dashboard
        </Link>
        <Typography color="text.primary">Subscriptions</Typography>
      </Breadcrumbs>
      
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1" fontWeight="700">
          Subscription Tracker
        </Typography>
      </Box>
      
      <Box sx={{ height: '700px' }}>
        <SubscriptionTracker />
      </Box>
    </Container>
  );
};

export default SubscriptionsPage;