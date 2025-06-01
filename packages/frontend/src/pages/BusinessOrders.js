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

  const handleConfirm = async (orderIds) => {
    try {
      if (!Array.isArray(orderIds)) orderIds = [orderIds];
      await Promise.all(orderIds.map(orderId =>
        axios.patch(`http://localhost:3001/api/orders/${orderId}/accept`, {}, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        })
      ));
      setSnackbar({ open: true, message: 'Siparişler onaylandı.', severity: 'success' });
      fetchOrders();
    } catch {
      setSnackbar({ open: true, message: 'Siparişler onaylanamadı.', severity: 'error' });
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

  function groupOrders(orders) {
    // userId ve dakika hassasiyetinde createdAt ile gruplama
    const groups = {};
    orders.forEach(order => {
      const userId = order.userId || order.user_id || order.user?.id || order.user?.userId || order.userName || 'unknown';
      const date = new Date(order.createdAt);
      // Yıl-ay-gün-saat-dakika ile anahtar oluştur
      const minuteKey = `${userId}_${date.getFullYear()}-${date.getMonth()+1}-${date.getDate()}_${date.getHours()}:${date.getMinutes()}`;
      if (!groups[minuteKey]) {
        groups[minuteKey] = {
          userId,
          userName: order.userName || order.user?.name || 'Müşteri',
          address: order.address,
          createdAt: order.createdAt,
          orders: [],
          notes: [],
          total: 0,
          ids: [],
        };
      }
      groups[minuteKey].orders.push(order);
      groups[minuteKey].notes.push(order.note);
      groups[minuteKey].total += (order.menuItem?.price || 0) * order.quantity;
      groups[minuteKey].ids.push(order.id);
    });
    return Object.values(groups);
  }

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
            groupOrders(orders).map((group, idx) => (
              <Grid item key={group.ids.join('-')}>
                <Card sx={{ border: '1px solid #80cbc4', borderRadius: 2, p: 2 }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="h6" sx={{ fontWeight: 'bold' }}>{group.userName}</Typography>
                        <Box sx={{ mb: 1 }}>
                          {group.orders.map((order, i) => (
                            <Box key={order.id} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <Typography variant="body2">
                                {order.menuItem?.productName} <b>{order.quantity}x</b>
                              </Typography>
                              <Typography variant="body2" sx={{ fontWeight: 'bold', minWidth: 70, textAlign: 'right' }}>
                                ₺{(order.menuItem?.price * order.quantity).toFixed(2)}
                              </Typography>
                            </Box>
                          ))}
                        </Box>
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>{group.address}</Typography>
                        {(group.notes && group.notes.filter(Boolean).length > 0) && (
                          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
                            Not: {group.notes.filter(Boolean).join(', ')}
                          </Typography>
                        )}
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>{new Date(group.createdAt).toLocaleString('tr-TR')}</Typography>
                        <Box sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', mt: 1 }}>
                          <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                            Total: ₺{typeof group.total === 'number' ? group.total.toFixed(2) : '0.00'}
                          </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', flexDirection: 'row', gap: 1, mt: 2, justifyContent: 'flex-end' }}>
                          <Button size="small" variant="contained" sx={{ bgcolor: '#1ed760', color: '#fff', fontWeight: 'bold', minWidth: 60, px: 2 }} onClick={() => handleConfirm(group.ids)}>CONFIRM</Button>
                          <Button size="small" variant="contained" sx={{ bgcolor: '#ff4d4f', color: '#fff', fontWeight: 'bold', minWidth: 60, px: 2 }} onClick={() => setRejectDialog({ open: true, orderId: group.ids[0] })}>REJECT</Button>
                        </Box>
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