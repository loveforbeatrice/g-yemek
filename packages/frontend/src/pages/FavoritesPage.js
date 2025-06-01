import React, { useState, useEffect } from 'react';
import { Grid, Card, CardContent, Typography, Box, Button, IconButton, Snackbar, Alert } from '@mui/material';
import FavoriteIcon from '@mui/icons-material/Favorite';
import axios from 'axios';

const FavoritesPage = ({ cartItems, addToCart, removeFromCart }) => {
  const [favoriteItems, setFavoriteItems] = useState([]);
  const [businessMap, setBusinessMap] = useState({});
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  // Get business list and prepare mapping
  useEffect(() => {
    axios.get('http://localhost:3001/api/auth/businesses').then(res => {
      const map = {};
      res.data.businesses.forEach(b => {
        map[b.name] = b.id;
      });
      setBusinessMap(map);
    });
  }, []);

  // Fetch favorite items
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      axios.get('http://localhost:3001/api/favorites', {
        headers: { Authorization: `Bearer ${token}` }
      }).then(res => {
        setFavoriteItems(res.data);
      }).catch(error => {
        console.error('Error fetching favorites:', error);
        setSnackbar({
          open: true,
          message: 'Error loading favorites',
          severity: 'error'
        });
      });
    }
  }, []);
  
  // Remove from favorites
  const removeFavorite = async (item) => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      // The backend expects the menuItemId parameter, not just id
      await axios.delete(`http://localhost:3001/api/favorites/${item.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      // Update favorites list by removing the item
      setFavoriteItems(currentFavorites => 
        currentFavorites.filter(favItem => favItem.id !== item.id)
      );

      setSnackbar({
        open: true,
        message: `${item.productName} removed from your favorites!`,
        severity: 'success'
      });
    } catch (error) {
      console.error('Error removing favorite:', error);
      setSnackbar({
        open: true,
        message: 'Error removing from favorites',
        severity: 'error'
      });
    }
  };

  return (
    <Box sx={{ width: '100%', maxWidth: '1400px', mx: 'auto', px: 4, background: '#fef3e2', borderRadius: 3, minHeight: '100vh', mt: 4, pb: 6 }}>
      <Typography variant="h2" align="center" fontWeight="bold" sx={{ mb: 3, fontFamily: 'Alata, sans-serif' }}>
        MY FAVORITES
      </Typography>

      <Grid container columnSpacing={6} rowSpacing={3}>
        {favoriteItems.length === 0 ? (
          <Grid item xs={12}>
            <Typography align="center" color="text.secondary" sx={{ mt: 6, fontSize: '1.3rem' }}>
              You haven't added any favorites yet.
            </Typography>
          </Grid>
        ) : (
          favoriteItems.map(item => (
            <Grid item xs={12} sm={6} md={4} key={item.id}>
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
                      <IconButton onClick={() => removeFavorite(item)} sx={{ p: 0 }}>
                        <FavoriteIcon sx={{ color: '#ff8800', fontSize: 32 }} />
                      </IconButton>
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
                        <Button 
                          variant="text" 
                          sx={{ minWidth: 0, color: '#ff8800', fontSize: '2rem', fontWeight: 700, p: 0, lineHeight: 1 }} 
                          onClick={() => removeFromCart(item.id)}
                        >
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
};

export default FavoritesPage;
