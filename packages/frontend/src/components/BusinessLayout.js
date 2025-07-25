import React, { useState } from 'react';
import { Box, Typography, Button, Container, Paper, IconButton, Drawer, useMediaQuery, useTheme, AppBar, Toolbar, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import RestaurantMenuIcon from '@mui/icons-material/RestaurantMenu';
import HistoryIcon from '@mui/icons-material/History';
import BarChartIcon from '@mui/icons-material/BarChart';
import SettingsIcon from '@mui/icons-material/Settings';
import LogoutIcon from '@mui/icons-material/Logout';
import ShoppingBasketIcon from '@mui/icons-material/ShoppingBasket';
import MenuIcon from '@mui/icons-material/Menu';
import RestaurantStatusWidget from './RestaurantStatusWidget';
import { useLanguage } from '../contexts/LanguageContext';

function BusinessLayout({ children }) {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [mobileOpen, setMobileOpen] = useState(false);
  const { t } = useLanguage();
  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleLogout = () => {
    setLogoutDialogOpen(true);
  };

  const handleLogoutConfirm = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setLogoutDialogOpen(false);
    navigate('/login');
  };

  const handleLogoutCancel = () => {
    setLogoutDialogOpen(false);
  };

  const menuItems = [
    { label: t('businessLayout.orders'), icon: <ShoppingBasketIcon />, path: '/business-orders' },
    { label: t('businessLayout.orderHistory'), icon: <HistoryIcon />, path: '/business-order-history' },
    { label: t('businessLayout.menu'), icon: <RestaurantMenuIcon />, path: '/business-menu' },
    { label: t('businessLayout.performance'), icon: <BarChartIcon />, path: '/business-performance' },
    { label: t('businessLayout.settings'), icon: <SettingsIcon />, path: '/business-settings' },
  ];

  const sidebarContent = (
    <>
      {/* Logo - Only show in desktop mode */}
      {!isMobile && (
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
        </Box>
      )}
      {/* İşletme Adı */}
      <Box sx={{ px: 2, mb: 4, textAlign: 'center', mt: { xs: 4, md: 0 } }}>
        <Typography 
          variant="h6" 
          component="div" 
          sx={{ 
            fontWeight: 900,
            color: '#ff8800',
            letterSpacing: 1.5,
            textTransform: 'uppercase',
            mt: { xs: 2, md: 0 }
          }}
        >
          {user.name || t('businessLayout.businessName')}
        </Typography>
      </Box>
      {/* Menü Butonları */}
      <Box sx={{ 
        display: 'flex', 
        flexDirection: 'column', 
        px: 2, 
        flexGrow: 1,
        ...(isMobile && {
          mt: 4,
          px: 4
        })
      }}>
        {menuItems.map(item => (
          <Button
            key={item.label}
            variant={window.location.pathname === item.path ? 'contained' : 'text'}
            startIcon={item.icon}
            onClick={() => {
              navigate(item.path);
              if (isMobile) {
                setMobileOpen(false);
              }
            }}
            sx={{
              mb: isMobile ? 4 : 2, // More spacing for mobile
              justifyContent: 'flex-start',
              py: isMobile ? 2 : 1.5, // Taller buttons for mobile
              backgroundColor: window.location.pathname === item.path ? '#ff8800' : '#80cbc4',
              color: window.location.pathname === item.path ? '#fff' : '#333',
              borderLeft: window.location.pathname === item.path ? '4px solid #ff8800' : 'none',
              borderRadius: 0,
              ...(isMobile && {
                fontSize: '1.1rem', // Larger font for mobile
              }),
              '&:hover': {
                backgroundColor: window.location.pathname === item.path ? '#ff8800' : '#4db6ac',
              }
            }}
          >
            {item.label}
          </Button>
        ))}
      </Box>
        {/* Restaurant Status Widget - Exit butonunun üstünde */}
      <Box sx={{ 
        px: 2, 
        mb: 2,
        width: '100%', // Tam genişlik
        boxSizing: 'border-box',
        ...(isMobile && {
          px: 4, // Mobil görünümde diğer butonlarla aynı padding
          mb: 4 // Mobil görünümde butonlarla aynı alt boşluk (margin-bottom)
        })
      }}>
        <RestaurantStatusWidget />
      </Box>
      
      {/* Çıkış Butonu */}
      <Box sx={{ 
        p: 2, 
        mt: 'auto', 
        borderTop: '1px solid #e0e0e0',
        ...(isMobile && {
          p: 4,
          mt: 4
        })
      }}>
        <Button
          fullWidth
          variant="contained"
          color="warning"
          startIcon={isMobile ? null : <LogoutIcon />}
          endIcon={isMobile ? null : null}
          onClick={handleLogout}
          sx={{
            py: isMobile ? 2 : 1.5,
            justifyContent: isMobile ? 'center' : 'flex-start',
            backgroundColor: '#ff8800',
            ...(isMobile && {
              fontSize: '1.1rem',
              borderRadius: '8px'
            }),
            '&:hover': {
              backgroundColor: '#e67a00',
            }
          }}
        >          {isMobile ? (
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <LogoutIcon sx={{ mr: 1 }} />
              {t('businessLayout.exit')}
            </Box>
          ) : t('businessLayout.exit')}
        </Button>
      </Box>
    </>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      {/* Mobile Top Bar (only visible on mobile) */}
      {isMobile && (
        <AppBar 
          position="fixed" 
          sx={{ 
            backgroundColor: '#fef3e2', 
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            zIndex: 1300, // Even higher z-index to stay above drawer and backdrop
            borderBottom: '1px solid #e0e0e0'
          }}
        >
          <Toolbar sx={{ minHeight: 72 }}>
            <IconButton
              color="inherit"
              aria-label="toggle drawer"
              edge="start"
              onClick={handleDrawerToggle}
              sx={{ 
                color: mobileOpen ? '#e67a00' : '#ff8800', // Change color when menu is open
                '&:hover': {
                  backgroundColor: 'rgba(255, 136, 0, 0.1)',
                },
                zIndex: 1400, // Ensure the icon is clickable
              }}
            >
              <MenuIcon />
            </IconButton>
            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'center', 
              alignItems: 'center',
              flexGrow: 1
            }}>
              <img 
                src={require('../assets/yemek-logo.png')} 
                alt="Yemek Logo" 
                style={{ 
                  height: 40, 
                  width: 'auto',
                  objectFit: 'contain'
                }} 
              />
            </Box>
            <Box sx={{ width: 48 }} /> {/* Empty box for balance */}
          </Toolbar>
        </AppBar>
      )}

      {/* Sidebar for Desktop */}
      {!isMobile && (
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
          {sidebarContent}
        </Paper>
      )}

      {/* Drawer for Mobile */}
      {isMobile && (
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true, // Better open performance on mobile
          }}
          sx={{
            display: { xs: 'block', md: 'none' },
            position: 'relative',
            '& .MuiDrawer-paper': { 
              boxSizing: 'border-box', 
              width: '100%', // Full width
              top: '56px', // Start below AppBar
              backgroundColor: '#fff', // Arka planı beyaz yap
              height: 'calc(100% - 56px)', // Adjust height to account for AppBar
              position: 'fixed',
            },
            '& .MuiBackdrop-root': {
              backgroundColor: 'rgba(0,0,0,0.7)', // Darker backdrop
              top: '56px', // Start backdrop below AppBar
            }
          }}
          BackdropProps={{
            invisible: false,
            onClick: handleDrawerToggle, // Make sure backdrop click also closes drawer
          }}
          PaperProps={{
            elevation: 0, // Remove shadow
          }}
          disableScrollLock={false}
          hideBackdrop={false}
        >
          {sidebarContent}
        </Drawer>
      )}

      {/* Ana İçerik */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          ml: { xs: 0, md: '240px' },
          width: { xs: '100%', md: `calc(100% - 240px)` },
          backgroundColor: '#fef3e2',
          pt: isMobile ? 8 : 3, // Add padding top for mobile to account for the AppBar
        }}
      >
        <Container maxWidth="lg" sx={{ mt: isMobile ? 2 : 2 }}>
          {children}
        </Container>
      </Box>

      {/* Logout Confirmation Dialog */}
      <Dialog
        open={logoutDialogOpen}
        onClose={handleLogoutCancel}
        PaperProps={{
          sx: {
            borderRadius: '20px',
            border: '2px solid #ff8800',
            fontFamily: '"Alata", sans-serif',
          }
        }}
      >
        <DialogTitle sx={{ 
          textAlign: 'center', 
          color: '#9d8df1', 
          fontSize: '1.3rem',
          fontWeight: 'bold',
          fontFamily: '"Alata", sans-serif'
        }}>
          Çıkış Onayı
        </DialogTitle>
        <DialogContent>
          <Typography sx={{ 
            textAlign: 'center',
            color: '#666',
            fontSize: '1.1rem',
            fontFamily: '"Alata", sans-serif'
          }}>
            Çıkış yapmak istediğinize emin misiniz?
          </Typography>
        </DialogContent>
        <DialogActions sx={{ 
          justifyContent: 'center',
          gap: 2,
          pb: 3
        }}>
          <Button
            onClick={handleLogoutCancel}
            sx={{
              color: '#666',
              fontSize: '1.1rem',
              fontFamily: '"Alata", sans-serif',
              '&:hover': {
                backgroundColor: '#f5f5f5'
              }
            }}
          >
            İptal
          </Button>
          <Button
            onClick={handleLogoutConfirm}
            variant="contained"
            sx={{
              backgroundColor: '#ff8800',
              color: 'white',
              fontSize: '1.1rem',
              fontFamily: '"Alata", sans-serif',
              '&:hover': {
                backgroundColor: '#e67a00'
              }
            }}
          >
            Çıkış Yap
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default BusinessLayout;