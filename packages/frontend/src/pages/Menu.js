import React, { useState, useEffect } from 'react';
import { Grid, Card, CardContent, Typography, Box, Button, IconButton, TextField, Chip, Snackbar, Alert } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import FavoriteIcon from '@mui/icons-material/Favorite';
import axios from 'axios';

function Menu({ businessName, cartItems, addToCart, removeFromCart }) {
  const [menuItems, setMenuItems] = useState([]);
  const [search, setSearch] = useState('');
  const [favorites, setFavorites] = useState({});
  const [favoriteCounts, setFavoriteCounts] = useState({});
  const [businessMap, setBusinessMap] = useState({});
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  // İşletme listesini çek ve eşlemesini hazırla
  useEffect(() => {
    axios.get('http://localhost:3001/api/auth/businesses').then(res => {
      const map = {};
      res.data.businesses.forEach(b => {
        map[b.name] = b.id;
      });
      setBusinessMap(map);
    });
  }, []);

  useEffect(() => {
    let url = 'http://localhost:3001/api/menu';
    if (businessName) {
      url += `?businessName=${encodeURIComponent(businessName)}`;
    }
    axios.get(url)
      .then(res => {
        setMenuItems(res.data);
        const token = localStorage.getItem('token');
        if (token) {
          axios.get('http://localhost:3001/api/favorites', {
            headers: { Authorization: `Bearer ${token}` }
          }).then(res => {
            const favMap = {};
            res.data.forEach(item => { favMap[item.id] = true; });
            setFavorites(favMap);
          });
        } else {
          setFavorites({});
        }

        // Favori sayılarını getir
        const menuItemIds = res.data.map(item => item.id).join(',');
        axios.get(`http://localhost:3001/api/favorites/counts?menuItemIds=${menuItemIds}`)
          .then(res => {
            setFavoriteCounts(res.data);
          })
          .catch(error => {
            console.error('Error fetching favorite counts:', error);
          });
      });
  }, [businessName]);

  const handleFavorite = async (item) => {
    const token = localStorage.getItem('token');
    if (!token) return;
    if (favorites[item.id]) {
      // Favoriden çıkar
      await axios.delete(`http://localhost:3001/api/favorites/${item.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setFavorites(f => ({ ...f, [item.id]: false }));
    } else {
      // Favoriye ekle
      await axios.post('http://localhost:3001/api/favorites', { menuItemId: item.id }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setFavorites(f => ({ ...f, [item.id]: true }));
    }
    // Her iki durumda da count'u backend'den tekrar çek
    axios.get(`http://localhost:3001/api/favorites/counts?menuItemIds=${item.id}`)
      .then(res => {
        setFavoriteCounts(prev => ({
          ...prev,
          [item.id]: res.data[item.id] || 0
        }));
      })
      .catch(error => {
        console.error('Error fetching favorite count:', error);
      });
  };

  const filtered = menuItems.filter(item =>
    item.productName.toLowerCase().includes(search.toLowerCase()) ||
    (item.category && item.category.toLowerCase().includes(search.toLowerCase()))
  );

  // Kategorilere göre grupla
  const categories = Array.from(new Set(filtered.map(item => item.category || 'Diğer')));
  const grouped = categories.map(cat => ({
    category: cat,
    items: filtered.filter(item => (item.category || 'Diğer') === cat)
  }));

  return (
    <Box sx={{ width: '100%', maxWidth: '1400px', mx: 'auto', px: 4, background: '#fef3e2', borderRadius: 3, minHeight: '100vh', mt: 4, pb: 6 }}>
      <Typography variant="h2" align="center" fontWeight="bold" sx={{ mb: 3, fontFamily: 'Alata, sans-serif' }}>
        {businessName ? businessName.toUpperCase() : 'TÜM ÜRÜNLER'}
      </Typography>
      <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
        <TextField
          variant="outlined"
          placeholder="Search for an item"
          value={search}
          onChange={e => setSearch(e.target.value)}
          sx={{ width: 500, background: '#fff', borderRadius: '30px' }}
        />
      </Box>
      <Grid container columnSpacing={6} rowSpacing={3}>
        {filtered.length === 0 ? (
          <Grid item xs={12}>
            <Typography align="center" color="text.secondary" sx={{ mt: 6, fontSize: '1.3rem' }}>
              {businessName ? 'Bu işletmeye ait menü bulunamadı.' : 'Ürün bulunamadı.'}
            </Typography>
          </Grid>
        ) : (
          grouped.map(group => (
            <React.Fragment key={group.category}>
              <Grid item xs={12}>
                <Typography 
                  variant="h2"
                  fontWeight="regular"
                  sx={{ mb: 2, mt: 3, fontFamily: 'Alata, sans-serif', color: '#222', ml: '2ch', letterSpacing: '0.5px' }}>
                  {'  '}{group.category.toUpperCase()}
                </Typography>
              </Grid>
              {group.items.map(item => (
                <Grid item xs={12} sm={6} md={4} key={item.id || `${item.productName}-${item.category}`}>
                  <Card sx={{
                    border: '2px solid #ff8800',
                    borderRadius: '16px',
                    background: '#fff',
                    boxShadow: '0 2px 8px 0 rgba(0,0,0,0.07)',
                    position: 'relative',
                    minHeight: 240,
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'flex-start',
                  }}>
                    <CardContent sx={{ p: 3, flex: 1, display: 'flex', flexDirection: 'column', height: '100%' }}>
                      <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', width: '100%', mb: 1 }}>
                        <Typography variant="h3" fontWeight="bold" sx={{ fontFamily: 'Alata, sans-serif', fontSize: '2.3rem', lineHeight: 1.1 }}>
                          {item.productName}
                        </Typography>
                        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: 36 }}>
                          <IconButton onClick={() => handleFavorite(item)} sx={{ p: 0 }}>
                            {favorites[item.id]
                              ? <FavoriteIcon sx={{ color: '#ff8800', fontSize: 32 }} />
                              : <FavoriteBorderIcon sx={{ color: '#ff8800', fontSize: 32 }} />}
                          </IconButton>
                          <Typography sx={{ color: '#ff8800', fontWeight: 600, fontSize: '1.1rem', mt: -0.5 }}>
                            {typeof favoriteCounts[item.id] === 'number' ? favoriteCounts[item.id] : 0}
                          </Typography>
                        </Box>
                      </Box>
                      <Typography variant="body1" color="text.secondary" sx={{ mb: 2, fontSize: '1.15rem', fontWeight: 400 }}>
                        {item.explanation}
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', width: '100%', mt: 2, gap: 3 }}>
                        <Box sx={{ width: 140, height: 90, borderRadius: 3, overflow: 'hidden', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#fff' }}>
                          <img
                            src={item.imageUrl ? `http://localhost:3001/uploads/${item.imageUrl}` : '/images/food-bg.jpg'}
                            alt={item.productName}
                            style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 12, background: '#fff', display: 'block' }}
                            onError={(e) => {
                              e.target.src = '/images/food-bg.jpg';
                            }}
                          />
                        </Box>
                        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'flex-end', justifyContent: 'center', height: '100%' }}>
                          <Typography variant="h3" sx={{ color: '#222', fontWeight: 700, fontSize: '2rem', mb: 1 }}>
                            ₺ {Number(item.price).toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
                          </Typography>
                          <Box sx={{ display: 'flex', alignItems: 'center', border: '2px solid #9d8df1', borderRadius: '30px', px: 2, py: 0.5, minWidth: 100, justifyContent: 'center', background: '#fff' }}>
                            <Button variant="text" sx={{ minWidth: 0, color: '#ff8800', fontSize: '2rem', fontWeight: 700, p: 0, lineHeight: 1 }} onClick={() => removeFromCart(item.id)}>
                              –
                            </Button>
                            <Typography variant="h5" sx={{ mx: 1.5, color: '#ff8800', fontWeight: 700, fontSize: '2rem', minWidth: 24, textAlign: 'center' }}>
                              {cartItems.find(i => i.id === item.id)?.quantity || 0}
                            </Typography>
                            <Button 
                              variant="text" 
                              sx={{ minWidth: 0, color: '#ff8800', fontSize: '2rem', fontWeight: 700, p: 0, lineHeight: 1 }} 
                              onClick={() => {
                                addToCart({ ...item, businessId: businessMap[item.businessName] });
                                setSnackbar({ 
                                  open: true, 
                                  message: `${item.productName} has been added to your cart!`, 
                                  severity: 'success' 
                                });
                              }}
                            >
                              +
                            </Button>
                          </Box>
                        </Box>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </React.Fragment>
          ))
        )}
      </Grid>
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          severity={snackbar.severity} 
          sx={{ 
            width: '100%',
            border: '1px solid #ff8800',
            bgcolor: '#fff8f0',
            color: '#ff6d00',
            fontFamily: '"Alata", sans-serif',
            fontWeight: 'bold',
            fontSize: '1rem',
            '& .MuiAlert-icon': { color: '#4CAF50' }
          }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}

export default Menu; 