import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
  Container,
  Typography,
  Card,
  CardContent,
  Box,
  Grid,
  Divider,
  CircularProgress,
  Alert,
  Button,
  Snackbar,
  IconButton
} from '@mui/material';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';

function Orders({ addToCart, cartItems }) {
  const [orders, setOrders] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const navigate = useNavigate();
  const { t } = useLanguage();

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await axios.get('http://localhost:3001/api/orders', {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        });
        setOrders(response.data);
        setLoading(false);
      } catch (err) {        setError(t('orders.loadError'));
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  const handleAddGroupToCart = (orderGroup) => {
    // Sepette başka bir işletmenin ürünü var mı kontrol et
    if (cartItems.length > 0) {
      const firstItem = cartItems[0];
      const firstBusinessName = firstItem.businessName;
      const newBusinessName = orderGroup[0]?.business?.name;

      if (firstBusinessName && newBusinessName && firstBusinessName !== newBusinessName) {
        setSnackbar({
          open: true,
          message: 'Sepetinizde başka bir işletmenin ürünü bulunmaktadır. Önce sepetinizi boşaltın.',
          severity: 'error'
        });
        return;
      }
    }

    orderGroup.forEach(order => {
      for (let i = 0; i < order.quantity; i++) {
        addToCart({ 
          ...order.menuItem, 
          businessId: order.business?.id,
          businessName: order.business?.name 
        });
      }
    });
    setSnackbar({ open: true, message: t('orders.addedToCart'), severity: 'success' });
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress sx={{ color: '#ff8800' }} />
      </Box>
    );
  }

  if (error) {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ mt: { xs: 2, sm: 4 }, mb: { xs: 2, sm: 4 }, px: { xs: 1, sm: 3 } }}>
      <Box sx={{ width: '100%', display: 'flex', alignItems: 'center', mb: { xs: 2, sm: 4 }, mt: { xs: 1, sm: 0 }, position: 'relative', justifyContent: 'center' }}>
        <IconButton onClick={() => navigate(-1)} sx={{ position: 'absolute', left: 0, top: '50%', transform: 'translateY(-50%)', display: { xs: 'flex', sm: 'none' } }}>
          <ArrowBackIosNewIcon sx={{ color: '#9d8df1' }} />
        </IconButton>
        <Typography
          variant="h3"
          component="h1"
          sx={{
            fontFamily: 'Alata, sans-serif',
            fontWeight: 'bold',
            fontSize: { xs: '2rem', sm: '2.5rem' },
            color: '#222',
            textAlign: 'center',
            width: '100%',
            mb: 0
          }}        >
          {t('orders.title')}
        </Typography>
      </Box>
      {Object.keys(orders).length === 0 ? (
        <Card sx={{ borderRadius: 2, border: '1px solid #ff8800', boxShadow: 'none', p: 3, textAlign: 'center' }}>          <Typography variant="h6" color="text.secondary">
            {t('orders.noOrders')}
          </Typography>
        </Card>
      ) : (        Object.entries(orders).map(([groupKey, orderGroup]) => {
          // Şirketlere göre grupla
          const businessGroups = {};
          orderGroup.forEach(order => {
            const businessName = order.business?.name || t('orders.unknownBusiness');
            if (!businessGroups[businessName]) businessGroups[businessName] = [];
            businessGroups[businessName].push(order);
          });
          // Kart toplamı (tüm şirketlerin toplamı)
          const cardTotal = orderGroup.reduce((sum, o) => sum + (Number(o.menuItem?.price) * o.quantity), 0);
          return (
            <Card key={groupKey} sx={{ mb: 4, borderRadius: 2, border: '1px solid #ff8800', boxShadow: 'none' }}>
              <CardContent>
                <Typography variant="h6" sx={{ color: '#ff8800', fontWeight: 'bold', mb: 0.5, fontSize: '1rem' }}>{groupKey}</Typography>
                {Object.entries(businessGroups).map(([businessName, businessOrders]) => {
                  const address = businessOrders[0]?.address;
                  return (
                    <Box key={businessName} sx={{ mb: 2 }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 'bold', color: '#333', mb: 0.5, fontSize: '0.95rem' }}>{businessName}</Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5, fontSize: '0.85rem' }}>{address}</Typography>
                      <Divider sx={{ mb: 1 }} />
                      {businessOrders.map(order => (
                        <Box key={order.id} sx={{ display: 'flex', alignItems: 'center', mb: 1.2 }}>
                          <Box sx={{ flex: 1 }}>
                            <Typography variant="body2" sx={{ fontWeight: 'bold', fontSize: '0.95rem' }}>{order.menuItem?.productName}</Typography>
                            <Typography variant="caption" color="text.secondary">{order.quantity} {t('orders.pieces')}</Typography>
                            {order.note && (
                              <Typography variant="caption" color="text.secondary" sx={{ fontStyle: 'italic', display: 'block' }}>{t('orders.note')}: {order.note}</Typography>
                            )}
                          </Box>
                          <Typography variant="body2" sx={{ color: '#ff8800', fontWeight: 'bold', minWidth: 60, textAlign: 'right', fontSize: '0.95rem' }}>
                            ₺ {order.menuItem?.price ? (Number(order.menuItem.price) * order.quantity).toFixed(2) : '-'}
                          </Typography>
                        </Box>
                      ))}
                    </Box>
                  );
                })}
                <Divider sx={{ my: 1 }} />
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 0.5 }}>                  <Typography variant="subtitle2" sx={{ color: '#ff8800', fontWeight: 'bold', fontSize: '1rem' }}>{t('orders.total')}: ₺ {cardTotal.toFixed(2)}</Typography>
                  <Button
                    variant="outlined"
                    sx={{ borderColor: '#ff8800', color: '#ff8800', fontWeight: 'bold', fontSize: '0.9rem', py: 0.5, px: 1.5, minWidth: 0 }}
                    onClick={() => handleAddGroupToCart(orderGroup)}
                  >
                    {t('orders.addAllToCart')}
                  </Button>
                </Box>
              </CardContent>
            </Card>
          );
        })
      )}
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
    </Container>
  );
}

export default Orders; 