import React, { useState, useEffect } from 'react';
import { 
  AppBar, 
  Toolbar, 
  Box, 
  IconButton, 
  Menu, 
  MenuItem, 
  Typography, 
  Divider,
  Paper,
  Button,
  Backdrop,
  Drawer,
  Badge,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';
import NotificationsIcon from '@mui/icons-material/Notifications';
import { useLanguage } from '../contexts/LanguageContext';
import axios from 'axios';
import RatingDialog from './RatingDialog';

function Header({ cartItems, resetCart }) {
  const { t } = useLanguage();
  // Backdrop state for blur effect
  const [backdropOpen, setBackdropOpen] = useState(false);
  const navigate = useNavigate();
  const [profileAnchorEl, setProfileAnchorEl] = useState(null);
  const [cartAnchorEl, setCartAnchorEl] = useState(null);
  const profileOpen = Boolean(profileAnchorEl);
  const cartOpen = Boolean(cartAnchorEl);
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('');
  const location = window.location.pathname;
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [notificationAnchorEl, setNotificationAnchorEl] = useState(null);
  const notificationOpen = Boolean(notificationAnchorEl);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  
  // Rating Dialog states
  const [ratingDialogOpen, setRatingDialogOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false);

  // Fetch notifications from the backend
  const fetchNotifications = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await axios.get('/api/notifications', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      setNotifications(response.data);
      setUnreadCount(response.data.filter(notif => !notif.read).length);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  // Format notification time
  const formatTimeAgo = (timestamp) => {
    const now = new Date();
    const notifDate = new Date(timestamp);
    const diffMs = now - notifDate;
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'şimdi';
    if (diffMins < 60) return `${diffMins} dk önce`;
    
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours} saat önce`;
    
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays < 7) return `${diffDays} gün önce`;
    
    return notifDate.toLocaleDateString('tr-TR');
  };

  // Mark notification as read
  const markAsRead = async (notificationId, notificationData) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      await axios.patch(`/api/notifications/${notificationId}/read`, {}, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      // Update the UI to show the notification as read
      setNotifications(notifications.map(n => 
        n.id === notificationId ? { ...n, read: true } : n
      ));
      setUnreadCount(prev => Math.max(0, prev - 1));
      
      // If it's a delivered order notification that needs rating
      if (notificationData && notificationData.requiresRating && !notificationData.isRated) {
        setSelectedOrder({
          orderId: notificationData.orderId,
          businessId: notificationData.businessId,
          businessName: notificationData.businessName,
          menuItemId: notificationData.menuItemId,
          menuItemName: notificationData.menuItemName
        });
        setRatingDialogOpen(true);
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };
  
  // Handle notification click
  const handleNotificationClick = (event) => {
    setNotificationAnchorEl(event.currentTarget);
    setBackdropOpen(true);
  };

  const handleNotificationClose = () => {
    setNotificationAnchorEl(null);
    setBackdropOpen(false);
  };

  const handleClickNotification = (notification) => {
    // Mark notification as read
    markAsRead(notification.id, notification.data);
    
    // Navigate based on notification type
    switch(notification.type) {
      case 'order_accepted':
        navigate('/orders');
        break;
      case 'order_rejected':
        navigate('/orders');
        break;
      case 'order_delivered':
        // The rating dialog will be opened in markAsRead if needed
        navigate('/orders');
        break;
      default:
        break;
    }
    
    handleNotificationClose();
  };

  // Handle rating dialog close
  const handleRatingDialogClose = () => {
    setRatingDialogOpen(false);
    setSelectedOrder(null);
  };
  
  // Sayfa yüklenirken localStorage'dan kullanıcı bilgilerini al ve aktif sekmeyi belirle
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error('User parsing error:', error);
      }
    }
    
    // Initialize notifications when component mounts
    fetchNotifications();
    
    // Set up polling for notifications every 30 seconds
    const notificationInterval = setInterval(() => {
      fetchNotifications();
    }, 30000);
    
    // Clean up the interval on unmount
    return () => clearInterval(notificationInterval);
  }, []); // Empty dependency array means this runs once on mount

  // Aktif sekmeyi belirle
  useEffect(() => {
    if (location === '/' || location === '/menu') {
      setActiveTab('menu');    } else if (location === '/basket') {
      setActiveTab('cart');
    } else if (location === '/favorites') {
      setActiveTab('favorites');
    } else if (location === '/profile') {
      setActiveTab('profile');
    }
  }, [location]);

  // Fetch notifications when the component mounts or user changes
  useEffect(() => {
    if (user) {
      fetchNotifications();
      
      // Set up polling for notifications (every 30 seconds)
      const interval = setInterval(fetchNotifications, 30000);
      
      // Clear interval on unmount
      return () => clearInterval(interval);
    }
  }, [user]);

  // Sayfa yönlendirme fonksiyonları
  const goToMenu = () => {
    setActiveTab('menu');
    navigate('/restaurants');
  };  const goToCart = () => {
    setActiveTab('cart');
    navigate('/basket');
  };
  const goToFavorites = () => {
    setActiveTab('favorites');
    navigate('/favorites');
  };
  
  // Profil menüsü fonksiyonları
  const handleProfileClick = (event) => {
    setActiveTab('profile');
    setProfileAnchorEl(event.currentTarget);
    setBackdropOpen(true);
    // Close cart menu if open
    if (cartOpen) {
      setCartAnchorEl(null);
    }
  };

  const handleProfileClose = () => {
    setProfileAnchorEl(null);
    setBackdropOpen(false);
  };
  
  // Sepet menüsü fonksiyonları
  const handleCartClick = (event) => {
    setActiveTab('cart');
    setCartAnchorEl(event.currentTarget);
    setBackdropOpen(true);
    // Close profile menu if open
    if (profileOpen) {
      setProfileAnchorEl(null);
    }
  };
  
  const handleCartClose = () => {
    setCartAnchorEl(null);
    setBackdropOpen(false);
  };
  
  const goToCartPage = () => {
    navigate('/basket');
    handleCartClose();
  };

  const navigateAndClose = (path) => {
    // Set the active tab based on the path
    if (path === '/profile') {
      setActiveTab('profile');
    } else if (path === '/addresses') {
      setActiveTab('addresses');
    } else if (path === '/orders') {
      setActiveTab('orders');
    } else if (path === '/settings') {
      setActiveTab('settings');
    }
    navigate(path);
    handleProfileClose();
  };

  const handleLogout = () => {
    setLogoutDialogOpen(true);
    handleProfileClose();
  };

  const handleLogoutConfirm = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    resetCart && resetCart();
    console.log('Çıkış yapıldı');
    setLogoutDialogOpen(false);
    navigate('/login');
  };

  const handleLogoutCancel = () => {
    setLogoutDialogOpen(false);
  };

  const cartCount = cartItems?.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <>
      {/* Mobilde üstte ortalanmış logo */}
      {isMobile && (
        <Box sx={{ width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', mt: 2, mb: 2, position: 'relative' }}>
          <img src="/images/logo.png" alt="Yemek Logo" style={{ height: 60 }} />
          {/* Mobilde sağ üstte bildirim ikonu */}
          <Box sx={{ position: 'absolute', right: 12, top: 0, zIndex: 1201 }}>              <IconButton color="inherit" onClick={handleNotificationClick}>
              <Badge badgeContent={unreadCount} color="error">
                <NotificationsIcon sx={{ color: notificationOpen ? '#ff8800' : '#9d8df1', fontSize: 28 }} />
              </Badge>
            </IconButton>
          </Box>
        </Box>
      )}
      {/* Backdrop for blur effect */}
      <Backdrop
        sx={{ 
          color: '#fff', 
          zIndex: 1, 
          backdropFilter: 'blur(3px)',
          backgroundColor: 'rgba(0, 0, 0, 0.3)' 
        }}
        open={backdropOpen}
        onClick={() => {
          handleCartClose();
          handleProfileClose();
          handleNotificationClose();
        }}
      />
      {/* Masaüstü için klasik AppBar */}
      {!isMobile && (
        <AppBar position="static" sx={{ 
          backgroundColor: '#9d8df1',
          borderRadius: '8px',
          width: 'auto',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          zIndex: 2
        }}>
          <Toolbar sx={{ display: 'flex', justifyContent: 'space-between' }}>
            {/* Logo */}
            <Box onClick={() => navigate('/')} sx={{ cursor: 'pointer' }}>
              <img 
                src="/images/logo.png" 
                alt="Yemek Logo" 
                style={{ height: '50px' }}
              />
            </Box>

            {/* Sağ taraftaki ikonlar */}
            <Box sx={{ display: 'flex', gap: 2 }}>
              {/* Bildirim İkonu */}              <IconButton 
                color="inherit" 
                onClick={handleNotificationClick}
                sx={{ position: 'relative' }}
              >
                <Badge badgeContent={unreadCount} color="error">
                  <Box sx={{ 
                    backgroundColor: notificationOpen ? '#ff8800' : 'white', 
                    borderRadius: '50%', 
                    width: 32, 
                    height: 32, 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    boxShadow: notificationOpen ? '0 0 0 2px #ff8800, 0 0 0 4px rgba(255, 136, 0, 0.3)' : 'none',
                    transition: 'all 0.3s ease'
                  }}>
                    <NotificationsIcon sx={{ 
                      color: notificationOpen ? 'white' : '#9d8df1',
                      fontSize: 20
                    }} />
                  </Box>
                </Badge>
              </IconButton>

              <IconButton color="inherit" onClick={goToMenu} sx={{ position: 'relative' }}>
                <Box sx={{ 
                  backgroundColor: activeTab === 'menu' ? '#ff8800' : 'white', 
                  borderRadius: '50%', 
                  width: 32, 
                  height: 32, 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  boxShadow: activeTab === 'menu' ? '0 0 0 2px #ff8800, 0 0 0 4px rgba(255, 136, 0, 0.3)' : 'none',
                  transition: 'all 0.3s ease'
                }}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={activeTab === 'menu' ? 'white' : '#9d8df1'} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17 9L9.99998 9.00002M17 13L9.99998 13.0001M17 17L9.99998 17.0001M7 9.00002L6.99998 9.00002M7 13.0001L6.99998 13.0001M7 17.0001L6.99998 17.0001M8.2 4H15.8C16.9201 4 17.4802 4 17.908 4.21799C18.2843 4.40973 18.5903 4.71569 18.782 5.09202C19 5.51984 19 6.0799 19 7.2V16.8C19 17.9201 19 18.4802 18.782 18.908C18.5903 19.2843 18.2843 19.5903 17.908 19.782C17.4802 20 16.9201 20 15.8 20H8.2C7.0799 20 6.51984 20 6.09202 19.782C5.71569 19.5903 5.40973 19.2843 5.21799 18.908C5 18.4802 5 17.9201 5 16.8V7.2C5 6.0799 5 5.51984 5.21799 5.09202C5.40973 4.71569 5.71569 4.40973 6.09202 4.21799C6.51984 4 7.0799 4 8.2 4Z" />
                  </svg>
                </Box>
              </IconButton>

              <IconButton 
                color="inherit" 
                onClick={location === '/basket' ? undefined : handleCartClick}
                disabled={location === '/basket'}
                sx={{ position: 'relative' }}
              >
                <Badge badgeContent={cartCount > 0 ? cartCount : null} color="error" overlap="circular" sx={{ '& .MuiBadge-badge': { fontWeight: 'bold', fontSize: '0.85rem', minWidth: 20, height: 20, right: -4, top: 2 } }}>
                  <Box sx={{ 
                    backgroundColor: (activeTab === 'cart' || cartOpen) ? '#ff8800' : 'white', 
                    borderRadius: '50%', 
                    width: 32, 
                    height: 32, 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    boxShadow: (activeTab === 'cart' || cartOpen) ? '0 0 0 2px #ff8800, 0 0 0 4px rgba(255, 136, 0, 0.3)' : 'none',
                    transition: 'all 0.3s ease'
                  }}>                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={(activeTab === 'cart' || cartOpen) ? 'white' : '#9d8df1'} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M8.25 20.25C8.66421 20.25 9 19.9142 9 19.5C9 19.0858 8.66421 18.75 8.25 18.75C7.83579 18.75 7.5 19.0858 7.5 19.5C7.5 19.9142 7.83579 20.25 8.25 20.25Z" fill={(activeTab === 'cart' || cartOpen) ? 'white' : '#9d8df1'} stroke={(activeTab === 'cart' || cartOpen) ? 'white' : '#9d8df1'} />
                      <path d="M18.75 20.25C19.1642 20.25 19.5 19.9142 19.5 19.5C19.5 19.0858 19.1642 18.75 18.75 18.75C18.3358 18.75 18 19.0858 18 19.5C18 19.9142 18.3358 20.25 18.75 20.25Z" fill={(activeTab === 'cart' || cartOpen) ? 'white' : '#9d8df1'} stroke={(activeTab === 'cart' || cartOpen) ? 'white' : '#9d8df1'} />
                      <path d="M3.75 4.5H5.25L7.5 15.75H19.5" />
                      <path d="M7.5 12H19.1925C19.2792 12 19.3633 11.9653 19.4235 11.9033C19.4838 11.8412 19.5154 11.7564 19.5123 11.6697L19.2825 7.41975C19.2766 7.25013 19.1348 7.125 18.9647 7.125H6" />
                    </svg>
                  </Box>
                </Badge>
              </IconButton>
              
              {/* Sepet Menüsü */}
              <Menu
                id="cart-menu"
                anchorEl={cartAnchorEl}
                open={cartOpen}
                onClose={handleCartClose}
                onClick={handleCartClose}
                anchorOrigin={{
                  vertical: 'bottom',
                  horizontal: 'right',
                }}
                transformOrigin={{
                  vertical: 'top',
                  horizontal: 'right',
                }}
                PaperProps={{
                  elevation: 0,
                  sx: {
                    overflow: 'visible',
                    filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.1))',
                    mt: 1.5,
                    borderRadius: '20px',
                    width: 300,
                    border: '2px solid #ff8800',
                    fontFamily: '"Alata", sans-serif',
                    zIndex: 3,
                    '&::before': {
                      content: '""',
                      display: 'block',
                      position: 'absolute',
                      top: -10,
                      right: 16,
                      width: 0,
                      height: 0,
                      borderLeft: '10px solid transparent',
                      borderRight: '10px solid transparent',
                      borderBottom: '10px solid #ff8800',
                      zIndex: 1,
                    },
                  },
                }}
              >
                {/* Sepet Başlığı */}
                <Box sx={{ px: 2, py: 2, borderBottom: '1px solid #f0f0f0', textAlign: 'center' }}>
                  <Typography sx={{ fontWeight: 'bold', color: '#9d8df1', fontSize: '1.3rem', fontFamily: '"Alata", sans-serif' }}>
                    {t('myCart')}
                  </Typography>
                </Box>
                
                {/* Cart Items */}
                {cartItems.length > 0 ? (
                  <>
                    {cartItems.map((item, index) => (
                      <Box key={index} sx={{ px: 2, py: 1.5, borderBottom: '1px solid #f0f0f0' }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Typography sx={{ fontWeight: 'bold', color: '#333', fontSize: '1rem', fontFamily: '"Alata", sans-serif', flex: '2' }}>
                            {item.productName}
                          </Typography>
                          <Typography sx={{ color: '#666', fontSize: '0.9rem', fontFamily: '"Alata", sans-serif', textAlign: 'center', flex: '1' }}>
                            x {item.quantity}
                          </Typography>
                          <Typography sx={{ color: '#ff8800', fontWeight: 'bold', fontSize: '1rem', fontFamily: '"Alata", sans-serif', textAlign: 'right', flex: '1' }}>
                            ₺ {(item.price * item.quantity).toFixed(2)}
                          </Typography>
                        </Box>
                      </Box>
                    ))}
                    
                    {/* Toplam */}
                    <Box sx={{ px: 2, py: 1.5, borderBottom: '1px solid #f0f0f0' }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography sx={{ fontWeight: 'bold', color: '#333', fontSize: '1.1rem', fontFamily: '"Alata", sans-serif', flex: '1' }}>
                          {t('total')}:
                        </Typography>
                        <Typography sx={{ color: '#ff8800', fontWeight: 'bold', fontSize: '1.1rem', fontFamily: '"Alata", sans-serif', textAlign: 'right', flex: '1' }}>
                          ₺ {cartItems.reduce((total, item) => total + (item.price * item.quantity), 0).toFixed(2)}
                        </Typography>
                      </Box>
                    </Box>
                    
                    {/* Sepete Git Butonu */}
                    <Box sx={{ p: 2, display: 'flex', justifyContent: 'center' }}>
                      <Button 
                        variant="contained" 
                        onClick={goToCartPage}
                        sx={{ 
                          backgroundColor: '#ff8800', 
                          color: 'white',
                          fontFamily: '"Alata", sans-serif',
                          fontWeight: 'bold',
                          fontSize: '1rem',
                          borderRadius: '25px',
                          px: 4,
                          '&:hover': {
                            backgroundColor: '#e67a00',
                          }
                        }}
                      >
                        {t('goToCart')}
                      </Button>
                    </Box>
                  </>
                ) : (
                  <Box sx={{ p: 3, textAlign: 'center' }}>
                    <Typography sx={{ color: '#666', fontSize: '1rem', fontFamily: '"Alata", sans-serif' }}>
                      {t('emptyCart')}
                    </Typography>
                  </Box>
                )}
              </Menu>

              <IconButton color="inherit" onClick={goToFavorites} sx={{ position: 'relative' }}>
                <Box sx={{ 
                  backgroundColor: activeTab === 'favorites' ? '#ff8800' : 'white', 
                  borderRadius: '50%', 
                  width: 32, 
                  height: 32, 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  boxShadow: activeTab === 'favorites' ? '0 0 0 2px #ff8800, 0 0 0 4px rgba(255, 136, 0, 0.3)' : 'none',
                  transition: 'all 0.3s ease'
                }}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill={activeTab === 'favorites' ? 'white' : '#9d8df1'} stroke={activeTab === 'favorites' ? 'white' : '#9d8df1'} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                  </svg>
                </Box>
              </IconButton>

              <IconButton 
                color="inherit" 
                onClick={handleProfileClick}
                aria-controls={profileOpen ? 'profile-menu' : undefined}
                aria-haspopup="true"
                aria-expanded={profileOpen ? 'true' : undefined}
                sx={{ position: 'relative' }}
              >
                <Box sx={{ 
                  backgroundColor: (profileOpen || activeTab === 'profile') ? '#ff8800' : 'white', 
                  borderRadius: '50%', 
                  width: 32, 
                  height: 32, 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  position: 'relative',
                  boxShadow: (profileOpen || activeTab === 'profile') ? '0 0 0 2px #ff8800, 0 0 0 4px rgba(255, 136, 0, 0.3)' : 'none',
                  transition: 'all 0.3s ease'
                }}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={(profileOpen || activeTab === 'profile') ? 'white' : '#9d8df1'} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 12C14.7614 12 17 9.76142 17 7C17 4.23858 14.7614 2 12 2C9.23858 2 7 4.23858 7 7C7 9.76142 9.23858 12 12 12Z" />
                    <path d="M12 14C7.58172 14 4 17.5817 4 22H20C20 17.5817 16.4183 14 12 14Z" />
                  </svg>
                </Box>
              </IconButton>
              
              {/* Profil Menüsü */}
              <Menu
                id="profile-menu"
                anchorEl={profileAnchorEl}
                open={profileOpen}
                onClose={handleProfileClose}
                onClick={handleProfileClose}
                anchorOrigin={{
                  vertical: 'bottom',
                  horizontal: 'right',
                }}
                transformOrigin={{
                  vertical: 'top',
                  horizontal: 'right',
                }}
                PaperProps={{
                  elevation: 0,
                  sx: {
                    overflow: 'visible',
                    filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.1))',
                    mt: 1.5,
                    borderRadius: '20px',
                    width: 300,
                    border: '2px solid #ff8800',
                    fontFamily: '"Alata", sans-serif',
                    zIndex: 3,
                    '& .MuiMenuItem-root': {
                      px: 2,
                      py: 1.5,
                      fontSize: '1.2rem',
                      color: '#ff8800',
                      fontFamily: '"Alata", sans-serif',
                      borderBottom: '1px solid #f0f0f0',
                      textAlign: 'center',
                      justifyContent: 'center',
                      '&:last-child': {
                        borderBottom: 'none',
                      },
                    },
                    '&::before': {
                      content: '""',
                      display: 'block',
                      position: 'absolute',
                      top: -10,
                      right: 16,
                      width: 0,
                      height: 0,
                      borderLeft: '10px solid transparent',
                      borderRight: '10px solid transparent',
                      borderBottom: '10px solid #ff8800',
                      zIndex: 1,
                    },
                  },
                }}
              >
                {/* Kullanıcı Bilgileri */}
                <Box sx={{ px: 2, py: 2, borderBottom: '1px solid #f0f0f0', textAlign: 'center' }}>
                  <Typography sx={{ fontWeight: 'bold', color: '#9d8df1', fontSize: '1.3rem', fontFamily: '"Alata", sans-serif' }}>
                    {user ? user.name : t('guestUser')}
                  </Typography>
                  <Typography sx={{ color: 'text.secondary', fontSize: '1rem', fontFamily: '"Alata", sans-serif' }}>
                    {user ? user.phone : t('pleaseLogin')}
                  </Typography>
                </Box>
                
                {/* Menü Öğeleri */}
                <MenuItem onClick={() => navigateAndClose('/profile')} sx={{ color: '#ff8800' }}>
                  {t('accountDetails')}
                </MenuItem>
                
                <MenuItem onClick={() => navigateAndClose('/settings')} sx={{ color: '#ff8800' }}>
                  {t('settings')}
                </MenuItem>
                
                <MenuItem onClick={() => navigateAndClose('/addresses')} sx={{ color: '#ff8800' }}>
                  {t('myAddresses')}
                </MenuItem>
                
                <MenuItem onClick={() => navigateAndClose('/orders')} sx={{ color: '#ff8800' }}>
                  {t('orderHistory')}
                </MenuItem>
                
                <MenuItem onClick={handleLogout} sx={{ color: '#ff8800' }}>
                  {t('logOut')}
                </MenuItem>
              </Menu>
            </Box>
          </Toolbar>
        </AppBar>
      )}      {/* Mobilde navbarı en alta sabitle */}
      {isMobile && (
        <Box sx={{
          position: 'fixed',
          left: 0,
          bottom: 0,
          width: '100%',
          display: 'flex',
          justifyContent: 'center',
          zIndex: 1300
        }}>          <Box sx={{
            bgcolor: '#9d8df1',
            borderRadius: '20px 20px 0 0',
            width: '100%',
            maxWidth: '100%',
            py: 1.5,
            display: 'flex',
            justifyContent: 'space-evenly',
            alignItems: 'center',
            boxShadow: '0 -2px 10px rgba(0,0,0,0.1)',
            paddingX: 1
          }}>
            {/* Menü ikonları burada */}
            <IconButton color="inherit" onClick={goToMenu}>
              <Box sx={{ color: activeTab === 'menu' ? '#ff8800' : '#fff' }}>                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
              </Box>
            </IconButton>
            
            <Box sx={{ 
              height: 28, 
              width: '1px', 
              backgroundColor: 'rgba(255,255,255,0.3)',
              mx: 0.5
            }}/>
            
            <IconButton color="inherit" onClick={goToCart}>
              <Badge badgeContent={cartCount > 0 ? cartCount : null} color="error" overlap="circular" sx={{ '& .MuiBadge-badge': { fontWeight: 'bold', fontSize: '0.85rem', minWidth: 20, height: 20, right: -4, top: 2 } }}>
                <Box sx={{ color: activeTab === 'cart' ? '#ff8800' : '#fff' }}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="21" r="1"></circle><circle cx="20" cy="21" r="1"></circle><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path></svg>
                </Box>
              </Badge>
            </IconButton>
            
            <Box sx={{ 
              height: 28, 
              width: '1px', 
              backgroundColor: 'rgba(255,255,255,0.3)',
              mx: 0.5
            }}/>
            
            <IconButton color="inherit" onClick={goToFavorites}>
              <Box sx={{ color: activeTab === 'favorites' ? '#ff8800' : '#fff' }}>
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>
              </Box>
            </IconButton>
            
            <Box sx={{ 
              height: 28, 
              width: '1px', 
              backgroundColor: 'rgba(255,255,255,0.3)',
              mx: 0.5
            }}/>
            
            <IconButton color="inherit" onClick={() => { setActiveTab('profile'); navigate('/account'); }}>
              <Box sx={{ color: activeTab === 'profile' ? '#ff8800' : '#fff' }}>
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 12C14.7614 12 17 9.76142 17 7C17 4.23858 14.7614 2 12 2C9.23858 2 7 4.23858 7 7C7 9.76142 9.23858 12 12 12Z" /><path d="M12 14C7.58172 14 4 17.5817 4 22H20C20 17.5817 16.4183 14 12 14Z" /></svg>
              </Box>
            </IconButton>
          </Box>
        </Box>
      )}
      {isMobile && (
        <Drawer
          anchor="right"
          open={drawerOpen}
          onClose={() => setDrawerOpen(false)}
        >
          <Box sx={{ width: 250, p: 2 }}>
            <Typography variant="h6" sx={{ mb: 2, textAlign: 'center', color: '#9d8df1', fontFamily: 'Alata, sans-serif' }}>
              {user ? user.name : t('guestUser')}
            </Typography>
            <Divider sx={{ mb: 1 }} />            <MenuItem onClick={() => { navigate('/profile'); setDrawerOpen(false); }}>{t('accountDetails')}</MenuItem>
            <MenuItem onClick={() => { navigate('/settings'); setDrawerOpen(false); }}>{t('settings')}</MenuItem>
            <MenuItem onClick={() => { navigate('/addresses'); setDrawerOpen(false); }}>{t('myAddresses')}</MenuItem>
            <MenuItem onClick={() => { navigate('/orders'); setDrawerOpen(false); }}>{t('orderHistory')}</MenuItem>
            <MenuItem onClick={() => { handleLogout(); setDrawerOpen(false); }} sx={{ background: '#ff8800', color: 'white', borderRadius: 2, fontWeight: 700, mt: 2, '&:hover': { background: '#e67a00', color: 'white' } }}>{t('logOut')}</MenuItem>
          </Box>
        </Drawer>
      )}
      {/* Bildirim Menüsü */}      <Menu
        id="notification-menu"
        anchorEl={notificationAnchorEl}
        open={notificationOpen}
        onClose={handleNotificationClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        PaperProps={{
          elevation: 0,
          sx: {
            overflow: 'hidden',
            filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.1))',
            mt: 1.5,
            borderRadius: '20px',
            width: 300,
            maxWidth: '95vw',
            border: '2px solid #ff8800',
            fontFamily: '"Alata", sans-serif',
            zIndex: 3,
            '& .MuiList-root': {
              padding: 0,
              maxHeight: '65vh',
              overflow: 'auto',
            },
            '&::before': {
              content: '""',
              display: 'block',
              position: 'absolute',
              top: -10,
              right: 16,
              width: 0,
              height: 0,
              borderLeft: '10px solid transparent',
              borderRight: '10px solid transparent',
              borderBottom: '10px solid #ff8800',
              zIndex: 1,
            },
          },
        }}
      >
        {/* Bildirim Başlığı */}
        <Box sx={{ px: 2, py: 2, borderBottom: '1px solid #f0f0f0', textAlign: 'center' }}>
          <Typography sx={{ fontWeight: 'bold', color: '#9d8df1', fontSize: '1.3rem', fontFamily: '"Alata", sans-serif' }}>
            {t('notificationsTitle')}
          </Typography>
        </Box>
        
        {/* Bildirim Listesi */}
        {notifications.length > 0 ? (
          notifications.map((notification) => (            <MenuItem 
              key={notification.id} 
              onClick={() => handleClickNotification(notification)}
              sx={{
                display: 'block',
                py: 1.5,
                px: 2,
                borderBottom: '1px solid #f0f0f0',
                backgroundColor: notification.read ? 'transparent' : 'rgba(157, 141, 241, 0.08)',
                width: '100%',
                maxWidth: '100%',
                boxSizing: 'border-box',
                '&:hover': {
                  bgcolor: 'rgba(255,136,0,0.05)'
                }
              }}
            >              <Typography sx={{ 
                color: '#333',
                fontSize: '0.95rem',
                fontFamily: '"Alata", sans-serif',
                mb: 0.5,
                fontWeight: notification.read ? 400 : 700,
                wordBreak: 'break-word',
                whiteSpace: 'normal',
                overflowWrap: 'break-word',
                maxWidth: '100%'
              }}>
                {notification.message}
              </Typography>
              <Typography sx={{ 
                color: '#888',
                fontSize: '0.8rem',
                fontFamily: '"Alata", sans-serif'
              }}>
                {formatTimeAgo(notification.createdAt)}
              </Typography>
            </MenuItem>
          ))
        ) : (
          <Box sx={{ p: 3, textAlign: 'center' }}>
            <Typography sx={{ color: '#666', fontSize: '1rem', fontFamily: '"Alata", sans-serif' }}>
              {t('noNotifications')}
            </Typography>
          </Box>
        )}
      </Menu>
      
      {/* Rating Dialog */}
      <RatingDialog
        open={ratingDialogOpen}
        handleClose={handleRatingDialogClose}
        orderData={selectedOrder}
      />
      
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
    </>
  );
}

export default Header;
