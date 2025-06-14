import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Box, Typography, Card, CardContent, Grid, Divider, Snackbar, Alert } from '@mui/material';
import BusinessLayout from '../components/BusinessLayout';
import ResponsivePageTitle from '../components/ResponsivePageTitle';
import { useLanguage } from '../contexts/LanguageContext';

function BusinessOrderHistory() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const { t } = useLanguage();

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await axios.get('http://localhost:3001/api/orders/business/history', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setOrders(res.data);
      setError(null);
    } catch (err) {
      setError(t('businessOrderHistory.loadError'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchOrders(); }, []);

  function groupOrders(orders) {
    const groups = {};
    orders.forEach(order => {
      const userId = order.userId || order.user_id || order.user?.id || order.user?.userId || order.userName || 'unknown';
      const date = new Date(order.createdAt);
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
          isCompleted: order.isCompleted,
          isDelivered: order.isDelivered
        };
      }
      groups[minuteKey].orders.push(order);
      groups[minuteKey].notes.push(order.note);
      groups[minuteKey].total += (order.menuItem?.price || 0) * order.quantity;
      groups[minuteKey].ids.push(order.id);
      if (!order.isCompleted) groups[minuteKey].isCompleted = false;
      if (!order.isDelivered) groups[minuteKey].isDelivered = false;
    });
    return Object.values(groups);
  }

  return (
    <BusinessLayout>
      <ResponsivePageTitle>{t('businessOrderHistory.title')}</ResponsivePageTitle>
      {error && <Alert severity="error">{error}</Alert>}
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 6 }}><Typography>{t('loading')}</Typography></Box>
      ) : (
        <Grid container direction="column" spacing={3}>
          {orders.length === 0 ? (
            <Typography align="center" color="text.secondary">{t('businessOrderHistory.noHistory')}</Typography>
          ) : (
            groupOrders(orders).map((group, idx) => (
              <Grid item key={group.ids.join('-')}>
                <Card sx={{ 
                  border: '1px solid #80cbc4', 
                  borderRadius: 2, 
                  p: 2, 
                  backgroundColor: group.isCompleted && group.isDelivered ? '#e0e0e0' : '#fff',
                  opacity: group.isCompleted && group.isDelivered ? 0.7 : 1 
                }}>
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
                            {t('businessOrderHistory.note')}: {group.notes.filter(Boolean).join(', ')}
                          </Typography>
                        )}
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
                          {new Date(group.createdAt).toLocaleString('tr-TR')}
                        </Typography>
                        <Box sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', mt: 1 }}>
                          <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                            {t('businessOrderHistory.total')}: ₺{typeof group.total === 'number' ? group.total.toFixed(2) : '0.00'}
                          </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', mt: 1 }}>
                          <Typography variant="caption" color="text.secondary">
                            {group.isCompleted && group.isDelivered ? t('businessOrderHistory.delivered') : t('businessOrderHistory.pending')}
                          </Typography>
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
    </BusinessLayout>
  );
}

export default BusinessOrderHistory; 