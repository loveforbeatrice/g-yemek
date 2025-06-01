import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Box, Typography, Card, CardContent, Button, Grid, Divider, Snackbar, Alert, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import BusinessLayout from '../components/BusinessLayout';
import ResponsivePageTitle from '../components/ResponsivePageTitle';

function BusinessOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [rejectDialog, setRejectDialog] = useState({ open: false, orderId: null });

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await axios.get('http://localhost:3001/api/orders/business', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setOrders(res.data);
      setError(null);
    } catch (err) {
      setError('Siparişler yüklenemedi.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchOrders(); }, []);

  const handleConfirm = async (orderId) => {
    try {
      await axios.patch(`http://localhost:3001/api/orders/${orderId}/accept`, {}, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setSnackbar({ open: true, message: 'Sipariş onaylandı.', severity: 'success' });
      fetchOrders();
    } catch {
      setSnackbar({ open: true, message: 'Sipariş onaylanamadı.', severity: 'error' });
    }
  };

  const handleReject = async () => {
    try {
      await axios.patch(`http://localhost:3001/api/orders/${rejectDialog.orderId}/reject`, {}, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setSnackbar({ open: true, message: 'Sipariş reddedildi.', severity: 'success' });
      setRejectDialog({ open: false, orderId: null });
      fetchOrders();
    } catch {
      setSnackbar({ open: true, message: 'Sipariş reddedilemedi.', severity: 'error' });
    }
  };

  return (
    <BusinessLayout>
      <ResponsivePageTitle>ORDERS</ResponsivePageTitle>
      {error && <Alert severity="error">{error}</Alert>}
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 6 }}><Typography>Yükleniyor...</Typography></Box>
      ) : (
        <Grid container direction="column" spacing={3}>
          {orders.length === 0 ? (
            <Typography align="center" color="text.secondary">Aktif sipariş yok.</Typography>
          ) : (
            orders.map(order => (
              <Grid item key={order.id}>
                <Card sx={{ border: '1px solid #80cbc4', borderRadius: 2, p: 2 }}>
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
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, ml: 3 }}>
                        <Button variant="contained" sx={{ bgcolor: '#1ed760', color: '#fff', fontWeight: 'bold' }} onClick={() => handleConfirm(order.id)}>Confirm</Button>
                        <Button variant="contained" sx={{ bgcolor: '#ff4d4f', color: '#fff', fontWeight: 'bold' }} onClick={() => setRejectDialog({ open: true, orderId: order.id })}>Reject</Button>
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
      <Dialog open={rejectDialog.open} onClose={() => setRejectDialog({ open: false, orderId: null })}>
        <DialogTitle>Are you sure you want to reject?</DialogTitle>
        <DialogContent></DialogContent>
        <DialogActions>
          <Button onClick={handleReject} color="primary">Yes</Button>
          <Button onClick={() => setRejectDialog({ open: false, orderId: null })} color="secondary">No</Button>
        </DialogActions>
      </Dialog>
    </BusinessLayout>
  );
}

export default BusinessOrders; 