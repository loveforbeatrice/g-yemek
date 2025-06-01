import React from 'react';
import { Box, Typography, Button, Container, Paper } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import RestaurantMenuIcon from '@mui/icons-material/RestaurantMenu';
import HistoryIcon from '@mui/icons-material/History';
import BarChartIcon from '@mui/icons-material/BarChart';
import SettingsIcon from '@mui/icons-material/Settings';
import LogoutIcon from '@mui/icons-material/Logout';
import ShoppingBasketIcon from '@mui/icons-material/ShoppingBasket';
import RestaurantStatusWidget from './RestaurantStatusWidget';

function BusinessLayout({ children }) {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const menuItems = [
    { label: 'Orders', icon: <ShoppingBasketIcon />, path: '/business-orders' },
    { label: 'Order History', icon: <HistoryIcon />, path: '/business-order-history' },
    { label: 'Menu', icon: <RestaurantMenuIcon />, path: '/business-menu' },
    { label: 'Performance', icon: <BarChartIcon />, path: '/business-performance' },
    { label: 'Settings', icon: <SettingsIcon />, path: '/business-settings' },
  ];

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      {/* Sol Panel */}
      <Paper
        elevation={3}
        sx={{
          width: 240,
          display: 'flex',
          flexDirection: 'column',
          borderRight: '1px solid #e0e0e0',
          position: 'fixed',
          height: '100vh',
          backgroundColor: '#fef3e2',
          zIndex: 1000,
          borderTopRightRadius: 0,
          borderBottomRightRadius: 0
        }}
      >
        {/* Logo */}
        <Box 
          sx={{ 
            p: 2, 
            display: 'flex', 
            justifyContent: 'center', 
            borderBottom: '1px solid #e0e0e0',
            mb: 2
          }}
        >
          <img 
            src={require('../assets/yemek-logo.png')} 
            alt="Yemek Logo" 
            style={{ 
              height: 60, 
              width: 'auto',
              objectFit: 'contain'
            }} 
          />
        </Box>        {/* İşletme Adı */}
        <Box sx={{ px: 2, mb: 4, textAlign: 'center' }}>
          <Typography 
            variant="h6" 
            component="div" 
            sx={{ 
              fontWeight: 'bold',
              color: '#ff8800'
            }}
          >
            {user.name || 'İşletme Adı'}
          </Typography>
        </Box>
        {/* Menü Butonları */}
        <Box sx={{ display: 'flex', flexDirection: 'column', px: 2, flexGrow: 1 }}>
          {menuItems.map(item => (
            <Button
              key={item.label}
              variant={window.location.pathname === item.path ? 'contained' : 'text'}
              startIcon={item.icon}
              onClick={() => navigate(item.path)}
              sx={{
                mb: 2,
                justifyContent: 'flex-start',
                py: 1.5,
                backgroundColor: window.location.pathname === item.path ? '#ff8800' : '#80cbc4',
                color: window.location.pathname === item.path ? '#fff' : '#333',
                borderLeft: window.location.pathname === item.path ? '4px solid #ff8800' : 'none',
                borderRadius: 0,
                '&:hover': {
                  backgroundColor: window.location.pathname === item.path ? '#ff8800' : '#4db6ac',
                }
              }}
            >
              {item.label}
            </Button>
          ))}        </Box>
        
        {/* Restaurant Status Widget - Exit butonunun üstünde */}
        <Box sx={{ px: 2, mb: 2 }}>
          <RestaurantStatusWidget />
        </Box>
        
        {/* Çıkış Butonu */}
        <Box sx={{ p: 2, mt: 'auto', borderTop: '1px solid #e0e0e0' }}>
          <Button
            fullWidth
            variant="contained"
            color="warning"
            startIcon={<LogoutIcon />}
            onClick={handleLogout}
            sx={{
              py: 1.5,
              justifyContent: 'flex-start',
              backgroundColor: '#ff8800',
              '&:hover': {
                backgroundColor: '#e67a00',
              }
            }}
          >
            Exit
          </Button>
        </Box>
      </Paper>
      {/* Ana İçerik */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          ml: '240px',
          width: { sm: `calc(100% - 240px)` },
          backgroundColor: '#fef3e2',
        }}
      >
        <Container maxWidth="lg" sx={{ mt: 2 }}>
          {children}
        </Container>
      </Box>
    </Box>
  );
}

export default BusinessLayout; 