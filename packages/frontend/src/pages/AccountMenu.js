import React from 'react';
import { Box, Button, Typography, IconButton, Divider } from '@mui/material';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import { useNavigate, useLocation } from 'react-router-dom';

const menuItems = [
  { label: 'Account Details', path: '/profile' },
  { label: 'Settings', path: '/settings' },
  { label: 'My Addresses', path: '/addresses' },
  { label: 'Order History', path: '/orders' },
];

export default function AccountMenu() {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <Box sx={{ minHeight: '100vh', p: 0 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', p: 2, pb: 1 }}>
        <IconButton onClick={() => navigate(-1)} sx={{ mr: 1 }}>
          <ArrowBackIosNewIcon sx={{ color: '#9d8df1' }} />
        </IconButton>
        <Typography variant="h6" sx={{ color: '#9d8df1', fontWeight: 700, fontFamily: 'Alata, sans-serif' }}>
          Account Menu
        </Typography>
      </Box>
      <Divider />
      {/* Menu Items */}
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, p: 3 }}>
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Button
              key={item.path}
              variant="outlined"
              fullWidth
              sx={{
                borderRadius: 3,
                borderColor: '#9d8df1',
                color: '#9d8df1',
                fontWeight: 600,
                fontSize: '1.1rem',
                fontFamily: 'Alata, sans-serif',
                py: 1.5,
                '&:hover': {
                  backgroundColor: '#edeafd',
                  borderColor: '#9d8df1',
                  color: '#9d8df1',
                },
              }}
              onClick={() => {
                if (item.path === '/profile') localStorage.setItem('activeTab', 'profile');
                else if (item.path === '/settings') localStorage.setItem('activeTab', 'settings');
                else if (item.path === '/addresses') localStorage.setItem('activeTab', 'addresses');
                else if (item.path === '/orders') localStorage.setItem('activeTab', 'orders');
                navigate(item.path);
              }}
            >
              {item.label}
            </Button>
          );
        })}
        <Divider sx={{ my: 1 }} />
        <Button
          variant="contained"
          fullWidth
          sx={{
            borderRadius: 3,
            fontWeight: 600,
            fontSize: '1.1rem',
            fontFamily: 'Alata, sans-serif',
            py: 1.5,
            background: 'linear-gradient(90deg, #ff8800 0%, #ff5e62 100%)',
            color: 'white',
            boxShadow: '0 2px 8px rgba(255,136,0,0.08)',
            '&:hover': {
              background: '#e67a00',
              color: 'white'
            }
          }}
          onClick={() => {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            localStorage.setItem('activeTab', 'profile');
            navigate('/login');
          }}
        >
          Log Out
        </Button>
      </Box>
    </Box>
  );
} 