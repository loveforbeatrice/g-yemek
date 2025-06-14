import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { 
  Box, 
  Typography, 
  Card, 
  CardContent, 
  Button, 
  Grid, 
  Divider, 
  Snackbar, 
  Alert, 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions,
  Tabs,
  Tab,
  Badge
} from '@mui/material';
import BusinessLayout from '../components/BusinessLayout';
import ResponsivePageTitle from '../components/ResponsivePageTitle';
import { useLanguage } from '../contexts/LanguageContext';

function BusinessOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [rejectDialog, setRejectDialog] = useState({ open: false, orderId: null });
  const [activeTab, setActiveTab] = useState(0);
  const [orderCounts, setOrderCounts] = useState({ idleOrders: 0, awaitingDelivery: 0 });
  const { t } = useLanguage();

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const endpoint = activeTab === 0 ? '/api/orders/business/idle' : '/api/orders/business/awaiting-delivery';
      const res = await axios.get(`http://localhost:3001${endpoint}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setOrders(res.data);
      setError(null);
    } catch (err) {
      setError(t('businessOrders.loadError'));
    } finally {
      setLoading(false);
    }
  };

  const fetchOrderCounts = async () => {
    try {
      const res = await axios.get('http://localhost:3001/api/orders/business/counts', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setOrderCounts(res.data);
    } catch (err) {
      console.error('Error fetching order counts:', err);
    }
  };

  useEffect(() => { 
    fetchOrders();
    fetchOrderCounts();
  }, [activeTab]);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleConfirm = async (orderIds) => {
    try {
      if (!Array.isArray(orderIds)) orderIds = [orderIds];
      await Promise.all(orderIds.map(orderId =>
        axios.patch(`http://localhost:3001/api/orders/${orderId}/accept`, {}, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        })
      ));
      setSnackbar({ open: true, message: t('businessOrders.ordersConfirmed'), severity: 'success' });
      fetchOrders();
      fetchOrderCounts();
    } catch {
      setSnackbar({ open: true, message: t('businessOrders.ordersNotConfirmed'), severity: 'error' });
    }
  };

  const handleReject = async () => {
    try {
      await axios.patch(`http://localhost:3001/api/orders/${rejectDialog.orderId}/reject`, {}, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setSnackbar({ open: true, message: t('businessOrders.orderRejected'), severity: 'success' });
      setRejectDialog({ open: false, orderId: null });
      fetchOrders();
      fetchOrderCounts();
    } catch {
      setSnackbar({ open: true, message: t('businessOrders.orderNotRejected'), severity: 'error' });
    }
  };

  const handleMarkAsDelivered = async (orderIds) => {
    try {
      if (!Array.isArray(orderIds)) orderIds = [orderIds];
      await Promise.all(orderIds.map(orderId =>
        axios.patch(`http://localhost:3001/api/orders/${orderId}/done`, {}, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        })
      ));
      setSnackbar({ open: true, message: t('businessOrders.ordersDelivered'), severity: 'success' });
      fetchOrders();
      fetchOrderCounts();
    } catch {
      setSnackbar({ open: true, message: t('businessOrders.ordersNotDelivered'), severity: 'error' });
    }
  };

  function groupOrders(orders) {
    const groups = {};
    orders.forEach(order => {
      const userId = order.userId || order.user_id || order.user?.id || order.user?.userId || order.userName || 'unknown';
      const date = new Date(order.createdAt);
      const minuteKey = `${userId}_${date.getFullYear()}-${date.getMonth()+1}-${date.getDate()}_${date.getHours()}:${date.getMinutes()}`;
      if (!groups[minuteKey]) {
        groups[minuteKey] = {
          userId,
          userName: order.userName || order.user?.name || t('businessOrders.customer'),
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
      <ResponsivePageTitle>{t('businessOrders.title')}</ResponsivePageTitle>
      {error && <Alert severity="error">{error}</Alert>}
      
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={activeTab} onChange={handleTabChange} aria-label="order status tabs">
          <Tab 
            label={
              <Badge badgeContent={orderCounts.idleOrders} color="primary">
                {t('businessOrders.idleOrders')}
              </Badge>
            } 
          />
          <Tab 
            label={
              <Badge badgeContent={orderCounts.awaitingDelivery} color="primary">
                {t('businessOrders.awaitingDelivery')}
              </Badge>
            } 
          />
        </Tabs>
      </Box>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 6 }}><Typography>{t('loading')}</Typography></Box>
      ) : (
        <Grid container direction="column" spacing={3}>
          {orders.length === 0 ? (
            <Typography align="center" color="text.secondary">
              {activeTab === 0 ? t('businessOrders.noIdleOrders') : t('businessOrders.noAwaitingDelivery')}
            </Typography>
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
                            {t('businessOrders.note')}: {group.notes.filter(Boolean).join(', ')}
                          </Typography>
                        )}
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
                          {new Date(group.createdAt).toLocaleString('tr-TR')}
                        </Typography>
                        <Box sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', mt: 1 }}>
                          <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                            {t('businessOrders.total')}: ₺{typeof group.total === 'number' ? group.total.toFixed(2) : '0.00'}
                          </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', flexDirection: 'row', gap: 1, mt: 2, justifyContent: 'flex-end' }}>
                          {activeTab === 0 ? (
                            <>
                              <Button 
                                size="small" 
                                variant="contained" 
                                sx={{ bgcolor: '#1ed760', color: '#fff', fontWeight: 'bold', minWidth: 60, px: 2 }} 
                                onClick={() => handleConfirm(group.ids)}
                              >
                                {t('businessOrders.confirm')}
                              </Button>
                              <Button 
                                size="small" 
                                variant="contained" 
                                sx={{ bgcolor: '#ff4d4f', color: '#fff', fontWeight: 'bold', minWidth: 60, px: 2 }} 
                                onClick={() => setRejectDialog({ open: true, orderId: group.ids[0] })}
                              >
                                {t('businessOrders.reject')}
                              </Button>
                            </>
                          ) : (
                            <Button 
                              size="small" 
                              variant="contained" 
                              sx={{ bgcolor: '#1ed760', color: '#fff', fontWeight: 'bold', minWidth: 60, px: 2 }} 
                              onClick={() => handleMarkAsDelivered(group.ids)}
                            >
                              {t('businessOrders.markAsDelivered')}
                            </Button>
                          )}
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
      <Dialog 
        open={rejectDialog.open} 
        onClose={() => setRejectDialog({ open: false, orderId: null })}
        PaperProps={{
          sx: {
            borderRadius: 2,
            minWidth: { xs: '90%', sm: 400 }
          }
        }}
      >
        <DialogTitle sx={{ 
          bgcolor: '#fff3f3', 
          color: '#ff4d4f',
          borderBottom: '1px solid #ffcdd2',
          fontWeight: 'bold'
        }}>
          {t('businessOrders.rejectConfirm')}
        </DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          <Typography>
            {t('businessOrders.rejectWarning')}
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2, borderTop: '1px solid #eee' }}>
          <Button 
            onClick={() => setRejectDialog({ open: false, orderId: null })}
            sx={{ 
              color: '#666',
              '&:hover': { bgcolor: '#f5f5f5' }
            }}
          >
            {t('businessOrders.no')}
          </Button>
          <Button 
            onClick={handleReject}
            variant="contained"
            sx={{ 
              bgcolor: '#ff4d4f',
              color: '#fff',
              '&:hover': { bgcolor: '#ff7875' }
            }}
          >
            {t('businessOrders.yes')}
          </Button>
        </DialogActions>
      </Dialog>
    </BusinessLayout>
  );
}

export default BusinessOrders; 