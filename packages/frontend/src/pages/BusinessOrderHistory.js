import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Box, Typography, Card, CardContent, Grid, Divider, Snackbar, Alert, Button } from '@mui/material';
import BusinessLayout from '../components/BusinessLayout';
import ResponsivePageTitle from '../components/ResponsivePageTitle';

function BusinessOrderHistory() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await axios.get('http://localhost:3001/api/orders/business/history', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setOrders(res.data);
      setError(null);
    } catch (err) {
      setError('Sipariş geçmişi yüklenemedi.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchOrders(); }, []);

  const handleDone = async (orderId) => {
    try {
      await axios.patch(`http://localhost:3001/api/orders/${orderId}/done`, {}, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setSnackbar({ open: true, message: 'Sipariş teslim edildi olarak işaretlendi.', severity: 'success' });
      fetchOrders();
    } catch (err) {
      setSnackbar({ open: true, message: 'Sipariş teslim edilemedi.', severity: 'error' });
    }
  };

  return (
    <BusinessLayout>
      <ResponsivePageTitle>ORDER HISTORY</ResponsivePageTitle>
      {error && <Alert severity="error">{error}</Alert>}
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 6 }}><Typography>Yükleniyor...</Typography></Box>
      ) : (
        <Grid container direction="column" spacing={3}>
          {orders.length === 0 ? (
            <Typography align="center" color="text.secondary">Geçmiş sipariş yok.</Typography>
          ) : (
            orders.map(order => (
              <Grid item key={order.id}>
                <Card sx={{ border: '1px solid #80cbc4', borderRadius: 2, p: 2, backgroundColor: order.isCompleted ? '#e0e0e0' : '#fff', opacity: order.isCompleted ? 0.7 : 1 }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="h6" sx={{ fontWeight: 'bold' }}>{order.menuItem?.productName}</Typography>
                        <Typography variant="body2">{order.quantity}x</Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>{order.address}</Typography>
                        <Typography variant="caption" color="text.secondary">{order.note}</Typography>
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>{new Date(order.createdAt).toLocaleString('tr-TR')}</Typography>
                        <Typography variant="body2" sx={{ fontWeight: 'bold', mt: 1 }}>Total: ₺{(order.menuItem?.price * order.quantity).toFixed(2)}</Typography>
                        <Typography variant="caption" color="text.secondary">{order.id}</Typography>
                      </Box>
                      <Box sx={{ ml: 2, display: 'flex', flexDirection: 'column', gap: 1 }}>
                        <Button variant="contained" color="success" onClick={() => handleDone(order.id)} disabled={order.isCompleted}>Done</Button>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))
          )}
        </Grid>
      )}
      <Snackbar open={snackbar.open} autoHideDuration={3000} onClose={() => setSnackbar({ ...snackbar, open: false })}>
        <Alert onClose={() => setSnackbar({ ...snackbar, open: false })} severity={snackbar.severity}>{snackbar.message}</Alert>
      </Snackbar>
    </BusinessLayout>
  );
}

export default BusinessOrderHistory; 