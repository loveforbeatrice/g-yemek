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
  Backdrop
} from '@mui/material';
import { useNavigate } from 'react-router-dom';

function Header({ cartItems, resetCart }) {
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
    
    // Aktif sekmeyi belirle
    if (location === '/' || location === '/menu') {
      setActiveTab('menu');
    } else if (location === '/basket') {
      setActiveTab('basket');
    } else if (location === '/favorites') {
      setActiveTab('favorites');
    } else if (location === '/profile') {
      setActiveTab('profile');
    }
  }, [location]);

  // Sayfa yönlendirme fonksiyonları
  const goToMenu = () => {
    setActiveTab('menu');
    navigate('/restaurants');
  };
  const goToBasket = () => {
    setActiveTab('basket');
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
    setActiveTab('basket');
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
    // Çıkış işlemleri
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    resetCart && resetCart();
    console.log('Çıkış yapıldı');
    handleProfileClose();
    
    // Login sayfasına yönlendir
    navigate('/login');
  };

  return (
    <>
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
        }}
      />
      
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

          <IconButton color="inherit" onClick={handleCartClick} sx={{ position: 'relative' }}>
            <Box sx={{ 
              backgroundColor: (activeTab === 'basket' || cartOpen) ? '#ff8800' : 'white', 
              borderRadius: '50%', 
              width: 32, 
              height: 32, 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              boxShadow: (activeTab === 'basket' || cartOpen) ? '0 0 0 2px #ff8800, 0 0 0 4px rgba(255, 136, 0, 0.3)' : 'none',
              transition: 'all 0.3s ease'
            }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={(activeTab === 'basket' || cartOpen) ? 'white' : '#9d8df1'} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M8.25 20.25C8.66421 20.25 9 19.9142 9 19.5C9 19.0858 8.66421 18.75 8.25 18.75C7.83579 18.75 7.5 19.0858 7.5 19.5C7.5 19.9142 7.83579 20.25 8.25 20.25Z" fill={(activeTab === 'basket' || cartOpen) ? 'white' : '#9d8df1'} stroke={(activeTab === 'basket' || cartOpen) ? 'white' : '#9d8df1'} />
                <path d="M18.75 20.25C19.1642 20.25 19.5 19.9142 19.5 19.5C19.5 19.0858 19.1642 18.75 18.75 18.75C18.3358 18.75 18 19.0858 18 19.5C18 19.9142 18.3358 20.25 18.75 20.25Z" fill={(activeTab === 'basket' || cartOpen) ? 'white' : '#9d8df1'} stroke={(activeTab === 'basket' || cartOpen) ? 'white' : '#9d8df1'} />
                <path d="M3.75 4.5H5.25L7.5 15.75H19.5" />
                <path d="M7.5 12H19.1925C19.2792 12 19.3633 11.9653 19.4235 11.9033C19.4838 11.8412 19.5154 11.7564 19.5123 11.6697L19.2825 7.41975C19.2766 7.25013 19.1348 7.125 18.9647 7.125H6" />
              </svg>
            </Box>
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
                Sepetim
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
                      Toplam:
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
                    SEPETE GİT
                  </Button>
                </Box>
              </>
            ) : (
              <Box sx={{ p: 3, textAlign: 'center' }}>
                <Typography sx={{ color: '#666', fontSize: '1rem', fontFamily: '"Alata", sans-serif' }}>
                  Sepetiniz boş
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
                {user ? user.name : 'Misafir Kullanıcı'}
              </Typography>
              <Typography sx={{ color: 'text.secondary', fontSize: '1rem', fontFamily: '"Alata", sans-serif' }}>
                {user ? user.phone : 'Giriş yapınız'}
              </Typography>
            </Box>
            
            {/* Menü Öğeleri */}
            <MenuItem onClick={() => navigateAndClose('/profile')} sx={{ color: '#ff8800' }}>
              Account Details
            </MenuItem>
            
            <MenuItem onClick={() => navigateAndClose('/settings')} sx={{ color: '#ff8800' }}>
              Settings
            </MenuItem>
            
            <MenuItem onClick={() => navigateAndClose('/addresses')} sx={{ color: '#ff8800' }}>
              My Addresses
            </MenuItem>
            
            <MenuItem onClick={() => navigateAndClose('/orders')} sx={{ color: '#ff8800' }}>
              Order History
            </MenuItem>
            
            <MenuItem onClick={handleLogout} sx={{ color: '#ff8800' }}>
              Log Out
            </MenuItem>
          </Menu>
        </Box>
      </Toolbar>
    </AppBar>
    </>
  );
}

export default Header;
