import React, { useEffect, useState } from 'react';
import { Container, Grid, Card, CardContent, Typography, CardMedia, Box, CircularProgress, TextField, InputAdornment, Snackbar, Alert } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import StarIcon from '@mui/icons-material/Star';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function Restaurants({ onSelectBusiness }) {
  const [businesses, setBusinesses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'info'
  });
  const navigate = useNavigate();

  useEffect(() => {
    const fetchBusinesses = async () => {
      try {
        const response = await axios.get('http://localhost:3001/api/auth/businesses');
        // Resim URL'lerini doğru şekilde oluştur
        const withMockData = response.data.businesses.map((b, i) => ({
          ...b,
          imageUrl: b.imageUrl 
            ? `http://localhost:3001/uploads/${b.imageUrl}` 
            : '/images/food-bg.jpg', // Varsayılan resim
          rating: b.rating || (Math.round((Math.random() * 2 + 3) * 10) / 10), // 3.0-5.0 arası
          isOpen: b.isOpen !== undefined ? b.isOpen : true // Make sure isOpen is defined, default to true
        }));
        setBusinesses(withMockData);
      } catch (err) {
        setError('Restoranlar yüklenemedi.');
      } finally {
        setLoading(false);
      }
    };
    fetchBusinesses();
  }, []);

  const filteredBusinesses = businesses.filter(business => {
    const q = search.toLowerCase();
    return (
      business.name.toLowerCase().includes(q) ||
      (business.phone && business.phone.toLowerCase().includes(q))
    );
  });

  if (loading) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}><CircularProgress /></Box>;
  }
  if (error) {
    return <Typography color="error" align="center" sx={{ mt: 8 }}>{error}</Typography>;
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, minHeight: '100vh', pb: 6, borderRadius: 3, background: 'transparent' }}>
      <Typography variant="h4" component="h1" align="center" gutterBottom fontWeight="bold" sx={{ color: '#222', fontFamily: 'Alata, sans-serif' }}>
        Restoranlar
      </Typography>
      <Box sx={{ display: 'flex', justifyContent: 'center', mb: 4 }}>
        <TextField
          variant="outlined"
          placeholder="Search for a restaurant"
          value={search}
          onChange={e => setSearch(e.target.value)}
          sx={{
            width: 500,
            background: '#fff',
            borderRadius: '30px',
            '& .MuiOutlinedInput-root': {
              borderRadius: '30px',
              border: '2px solid #ff8800',
              paddingLeft: 1,
              background: '#fff',
              '& fieldset': {
                borderColor: '#ff8800',
              },
              '&:hover fieldset': {
                borderColor: '#ff8800',
              },
              '&.Mui-focused fieldset': {
                borderColor: '#ff8800',
              },
            },
            '& input': {
              color: '#888',
              fontSize: '1.1rem',
              padding: '12px 0',
            },
            '& .MuiInputAdornment-root': {
              color: '#ff8800',
            },
          }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />
      </Box>
      <Grid container spacing={4}>
        {filteredBusinesses.map((business) => (
          <Grid item xs={12} sm={6} md={4} key={business.id}>
            <Card
              sx={{
                border: '3px solid #ff8800',
                background: '#fff',
                borderRadius: '18px',
                boxShadow: '0 4px 12px 0 rgba(0,0,0,0.08)',
                transition: 'all 0.3s ease',
                '&:hover': { boxShadow: '0 8px 24px 0 rgba(0,0,0,0.13)' },
                p: 0,
                minHeight: 170,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'flex-start',
                alignItems: 'flex-start',
                cursor: 'pointer',
                filter: business.isOpen === false ? 'grayscale(100%)' : 'none',
                position: 'relative',
              }}
              onClick={() => {
                onSelectBusiness(business.name);
                navigate('/menu');
              }}
            >
              {/* No closed overlay */}
              <Box sx={{ width: '100%', display: 'flex', justifyContent: 'center', pt: 2 }}>
                <Box sx={{
                  width: '92%',
                  height: 125,
                  borderRadius: '16px',
                  overflow: 'hidden',
                  border: '3px solid #9d8df1',
                  boxSizing: 'border-box',
                  mb: 1.5,
                  background: '#fff',
                  minHeight: 125,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  <img
                    src={business.imageUrl}
                    alt={business.name}
                    style={{ 
                      width: '100%', 
                      height: '100%', 
                      objectFit: 'cover', 
                      background: '#fff', 
                      display: 'block',
                      filter: business.isOpen === false ? 'grayscale(80%)' : 'none',
                      transition: 'filter 0.3s ease'
                    }}
                  />
                </Box>
              </Box>
              <CardContent sx={{ pt: 0, px: 3, pb: 2, width: '100%' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="h6" fontWeight="bold" sx={{ color: '#222' }}>
                    {business.name}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <StarIcon sx={{ color: '#ff8800', fontSize: 22 }} />
                    <Typography variant="body2" sx={{ color: '#ff8800', fontWeight: 600, fontSize: '1.1rem' }}>
                      {business.rating ? business.rating : '4.5'}/5
                    </Typography>
                  </Box>
                </Box>
                <Typography variant="body2" color="text.secondary" sx={{ fontSize: '1.05rem', fontWeight: 500 }}>
                  Telefon: {business.phone}
                </Typography>
                {business.openingTime && business.closingTime && (
                  <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
                    <Typography 
                      variant="body2" 
                      color="#4caf50"
                      sx={{ 
                        fontWeight: 500,
                        fontSize: '0.9rem'
                      }}
                    >
                      {business.openingTime.substring(0,5)} - {business.closingTime.substring(0,5)}
                    </Typography>
                  </Box>
                )}
                {business.email && (
                  <Typography variant="body2" color="text.secondary">
                    E-posta: {business.email}
                  </Typography>
                )}
              </CardContent>
            </Card>
          </Grid>
        ))}
        {filteredBusinesses.length === 0 && (
          <Grid item xs={12}>
            <Typography align="center" color="text.secondary" sx={{ mt: 6 }}>
              Sonuç bulunamadı.
            </Typography>
          </Grid>
        )}
      </Grid>
      {/* Add CSS animations using style element */}
      <style>
        {`
          @keyframes pulse {
            0% { opacity: 1; transform: scale(1); }
            50% { opacity: 0.8; transform: scale(1.2); }
            100% { opacity: 1; transform: scale(1); }
          }
        `}
      </style>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          severity={snackbar.severity} 
          sx={{ 
            width: '100%',
            border: '1px solid',
            borderColor: snackbar.severity === 'warning' ? '#ff8800' : '#1976d2',
            bgcolor: '#fff',
            '& .MuiAlert-icon': { 
              color: snackbar.severity === 'warning' ? '#ff8800' : '#1976d2' 
            }
          }}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
}

export default Restaurants; 