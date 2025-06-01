import React, { useState, useEffect, useMemo } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { Box } from '@mui/material';
import Header from './components/Header';
import Menu from './pages/Menu';
import MyAddresses from './pages/MyAddresses';
import Basket from './pages/Basket';
import FavoritesPage from './pages/FavoritesPage';
import Profile from './pages/Profile';
import Settings from './pages/Settings';
import Login from './pages/login';
import Restaurants from './pages/Restaurants';
import Orders from './pages/Orders';
import BusinessOrders from './pages/BusinessOrders';
import BusinessOrderHistory from './pages/BusinessOrderHistory';
import BusinessMenu from './pages/BusinessMenu';
import BusinessSettings from './pages/BusinessSettings';
import BusinessPerformance from './pages/BusinessPerformance';
import AccountMenu from './pages/AccountMenu';

// Tema oluşturma fonksiyonu
const createAppTheme = (isLoggedIn) => {
  return createTheme({
    palette: {
      primary: {
        main: '#ff8800', // Turuncu renk
      },
      secondary: {
        main: '#9d8df1', // Mor renk
      },
      background: {
        default: isLoggedIn ? '#fef3e2' : '#ffffff', // Giriş yapıldıysa açık sarı, değilse beyaz
      }
    },
    typography: {
      fontFamily: '"Alata", sans-serif',
    }
  });
};

// Layout bileşeni - Header'ı login sayfasında göstermemek için
const Layout = ({ children, isAuthenticated, cartItems, resetCart }) => {
  const location = useLocation();
  const isLoginPage = location.pathname === '/login';
  
  // Arka plan stili
  const backgroundStyle = {
    backgroundColor: isAuthenticated ? '#fef3e2' : '#ffffff',
    backgroundImage: 'none', // Arka plan resmini tamamen kaldır
    minHeight: '100vh',
  };
  
  return (
    <Box sx={backgroundStyle}>
      {!isLoginPage && (
        <Box sx={{ 
          backgroundColor: '#fef3e2', 
          padding: '5px 5px 0 5px',
          position: 'relative',
          zIndex: 10
        }}>
          <Header cartItems={cartItems} resetCart={resetCart} />
        </Box>
      )}
      <Box sx={{ pt: isLoginPage ? 0 : 2 }}>
        {children}
      </Box>
    </Box>
  );
};

function App() {
  // Auth durumunu kontrol et (login olup olmama durumu)
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [selectedBusiness, setSelectedBusiness] = useState(null);
  // Sepeti localStorage'dan başlat
  const [cartItems, setCartItems] = useState(() => {
    const stored = localStorage.getItem('cartItems');
    return stored ? JSON.parse(stored) : [];
  });
  // Kullanıcı bilgisini localStorage'dan başlat
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem('user');
    return stored ? JSON.parse(stored) : null;
  });

  // Sepeti sıfırlama fonksiyonu
  const resetCart = () => setCartItems([]);

  // Sepet değişince localStorage'a yaz
  useEffect(() => {
    localStorage.setItem('cartItems', JSON.stringify(cartItems));
  }, [cartItems]);

  // Kullanıcı değişimini izle ve sepeti sıfırla
  useEffect(() => {
    const handleStorageChange = () => {
      const currentUser = localStorage.getItem('user');
      if (currentUser) {
        const parsed = JSON.parse(currentUser);
        if (!user || user.phone !== parsed.phone) {
          setUser(parsed);
          resetCart();
        }
      } else {
        if (user) {
          setUser(null);
          resetCart();
        }
      }
      const currentToken = localStorage.getItem('token');
      setIsAuthenticated(!!currentToken);
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [user]);

  // Giriş/çıkışta user bilgisini güncelle
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    setUser(storedUser ? JSON.parse(storedUser) : null);
    const token = localStorage.getItem('token');
    setIsAuthenticated(!!token);
  }, []);
  
  // Kullanıcı giriş durumuna göre temayı oluştur
  const theme = useMemo(() => createAppTheme(isAuthenticated), [isAuthenticated]);
  
  // Sepete ürün ekleme fonksiyonu
  const addToCart = (item) => {
    setCartItems(prevItems => {
      const existingItem = prevItems.find(i => i.id === item.id);
      if (existingItem) {
        return prevItems.map(i => 
          i.id === item.id 
            ? { ...i, quantity: i.quantity + 1 }
            : i
        );
      }
      return [...prevItems, { ...item, quantity: 1 }];
    });
  };

  // Sepetten ürün çıkarma fonksiyonu
  const removeFromCart = (itemId) => {
    setCartItems(prevItems => {
      const existingItem = prevItems.find(i => i.id === itemId);
      if (existingItem.quantity === 1) {
        return prevItems.filter(i => i.id !== itemId);
      }
      return prevItems.map(i => 
        i.id === itemId 
          ? { ...i, quantity: i.quantity - 1 }
          : i
      );
    });
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Routes>
          {/* Varsayılan olarak login sayfasına yönlendir */}
          <Route path="/" element={<Login />} />
          <Route path="/login" element={<Login />} />
          <Route path="/menu" element={
            <Layout isAuthenticated={isAuthenticated} cartItems={cartItems} resetCart={resetCart}>
              <Menu 
                businessName={selectedBusiness} 
                cartItems={cartItems}
                addToCart={addToCart}
                removeFromCart={removeFromCart}
              />
            </Layout>
          } />
          <Route path="/addresses" element={
            <Layout isAuthenticated={isAuthenticated} cartItems={cartItems} resetCart={resetCart}>
              <MyAddresses />
            </Layout>
          } />
          <Route path="/basket" element={
            <Layout isAuthenticated={isAuthenticated} cartItems={cartItems} resetCart={resetCart}>
              <Basket cartItems={cartItems} addToCart={addToCart} removeFromCart={removeFromCart} resetCart={resetCart} />
            </Layout>
          } />
          <Route path="/favorites" element={
            <Layout isAuthenticated={isAuthenticated} cartItems={cartItems} resetCart={resetCart}>
              <FavoritesPage 
                cartItems={cartItems}
                addToCart={addToCart}
                removeFromCart={removeFromCart}
              />
            </Layout>
          } />
          <Route path="/profile" element={
            <Layout isAuthenticated={isAuthenticated} cartItems={cartItems} resetCart={resetCart}>
              <Profile />
            </Layout>
          } />
          <Route path="/settings" element={
            <Layout isAuthenticated={isAuthenticated} cartItems={cartItems} resetCart={resetCart}>
              <Settings />
            </Layout>
          } />
          <Route path="/orders" element={
            <Layout isAuthenticated={isAuthenticated} cartItems={cartItems} resetCart={resetCart}>
              <Orders addToCart={addToCart} />
            </Layout>
          } />
          <Route path="/restaurants" element={
            <Layout isAuthenticated={isAuthenticated} cartItems={cartItems} resetCart={resetCart}>
              <Restaurants onSelectBusiness={setSelectedBusiness} />
            </Layout>
          } />
          <Route path="/business-orders" element={<BusinessOrders />} />
          <Route path="/business-order-history" element={<BusinessOrderHistory />} />
          <Route path="/business-menu" element={<BusinessMenu />} />
          <Route path="/business-settings" element={<BusinessSettings />} />
          <Route path="/business-performance" element={<BusinessPerformance />} />
          <Route path="/account" element={
            <Layout isAuthenticated={isAuthenticated} cartItems={cartItems} resetCart={resetCart}>
              <AccountMenu />
            </Layout>
          } />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;