import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Paper, Grid, Card, CardContent,
  CircularProgress, Alert, ToggleButton, ToggleButtonGroup,
  List, ListItem, ListItemText, ListItemAvatar, Avatar,
  Chip, Divider
} from '@mui/material';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  BarChart, Bar, ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import StarIcon from '@mui/icons-material/Star';
import LocalFireDepartmentIcon from '@mui/icons-material/LocalFireDepartment';
import FavoriteIcon from '@mui/icons-material/Favorite';
import BusinessLayout from '../components/BusinessLayout';
import { useLanguage } from '../contexts/LanguageContext';
import axios from 'axios';

const COLORS = ['#ff8800', '#80cbc4', '#9d8df1', '#ff6b6b', '#4ecdc4', '#45b7d1'];

function BusinessPerformance() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [salesData, setSalesData] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [favoritesData, setFavoritesData] = useState([]);
  const [timeRange, setTimeRange] = useState('daily');
  const [salesStats, setSalesStats] = useState({
    totalSales: 0,
    totalOrders: 0,
    averageOrderValue: 0
  });
  const [productSortBy, setProductSortBy] = useState('sales');
  const { t } = useLanguage();

  const user = JSON.parse(localStorage.getItem('user') || '{}');

  // API çağrıları
  const fetchSalesData = async (range) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`http://localhost:3001/api/analytics/sales-trends?timeRange=${range}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (error) {
      console.error('Sales data fetch error:', error);
      return [];
    }
  };

  const fetchTopProducts = async (range) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`http://localhost:3001/api/analytics/top-products?timeRange=${range}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (error) {
      console.error('Top products fetch error:', error);
      return [];
    }
  };

  const fetchFavoritesData = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:3001/api/analytics/favorites-analysis', {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (error) {
      console.error('Favorites data fetch error:', error);
      return [];
    }
  };

  const fetchStats = async (range) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`http://localhost:3001/api/analytics/stats?timeRange=${range}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (error) {
      console.error('Stats fetch error:', error);
      return { totalSales: 0, totalOrders: 0, averageOrderValue: 0 };
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Paralel API çağrıları
        const [salesData, topProducts, favoritesData, stats] = await Promise.all([
          fetchSalesData(timeRange),
          fetchTopProducts(timeRange),
          fetchFavoritesData(),
          fetchStats(timeRange)
        ]);
        
        // Satış verilerini formatla
        const formattedSalesData = salesData.map(item => ({
          date: formatDate(item.date, timeRange),
          orders: item.orders,
          revenue: item.revenue,
          sales: item.revenue
        }));
        
        setSalesData(formattedSalesData);
        setTopProducts(topProducts);
        setFavoritesData(favoritesData);
        setSalesStats(stats);
        
        setError(null);
      } catch (err) {
        setError(t('businessPerformance.loadError'));
        console.error('Data fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [timeRange]);

  // Tarih formatını düzenle
  const formatDate = (dateStr, range) => {
    if (range === 'daily') {
      return new Date(dateStr).toLocaleDateString('tr-TR', { day: '2-digit', month: '2-digit' });
    } else if (range === 'weekly') {
      return `W${dateStr.split('-')[1]}`;
    } else if (range === 'monthly') {
      return new Date(dateStr + '-01').toLocaleDateString('tr-TR', { month: 'short', year: 'numeric' });
    }
    return dateStr;
  };

  const handleTimeRangeChange = (event, newTimeRange) => {
    if (newTimeRange !== null) {
      setTimeRange(newTimeRange);
    }
  };

  if (loading) {
    return (
      <BusinessLayout>
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress />
        </Box>
      </BusinessLayout>
    );
  }

  if (error) {
    return (
      <BusinessLayout>
        <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>
      </BusinessLayout>
    );
  }
  return (
    <BusinessLayout>
      {/* Time Range Toggle */}
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'center' }}>
        <ToggleButtonGroup
          color="primary"
          value={timeRange}
          exclusive
          onChange={handleTimeRangeChange}
          sx={{
            '& .MuiToggleButton-root': {
              borderColor: '#ff8800',
              color: '#ff8800',
              '&.Mui-selected': {
                backgroundColor: '#ff8800',
                color: 'white',
                '&:hover': {
                  backgroundColor: '#e67a00',
                }
              }
            }
          }}
        >          <ToggleButton value="daily">{t('businessPerformance.daily')}</ToggleButton>
          <ToggleButton value="weekly">{t('businessPerformance.weekly')}</ToggleButton>
          <ToggleButton value="monthly">{t('businessPerformance.monthly')}</ToggleButton>
        </ToggleButtonGroup>
      </Box>

      {/* Sales Statistics Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={4}>
          <Card sx={{ backgroundColor: '#ff8800', color: 'white' }}>
            <CardContent>              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <TrendingUpIcon sx={{ mr: 1 }} />
                <Typography variant="h6">{t('businessPerformance.totalRevenue')}</Typography>
              </Box>
              <Typography variant="h4" fontWeight="bold">
                {salesStats.totalSales?.toLocaleString('tr-TR') || '0'} ₺
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card sx={{ backgroundColor: '#80cbc4', color: 'white' }}>
            <CardContent>              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <LocalFireDepartmentIcon sx={{ mr: 1 }} />
                <Typography variant="h6">{t('businessPerformance.totalOrders')}</Typography>
              </Box>
              <Typography variant="h4" fontWeight="bold">
                {salesStats.totalOrders || 0}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card sx={{ backgroundColor: '#9d8df1', color: 'white' }}>
            <CardContent>              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <StarIcon sx={{ mr: 1 }} />
                <Typography variant="h6">{t('businessPerformance.avgOrderValue')}</Typography>
              </Box>
              <Typography variant="h4" fontWeight="bold">
                {salesStats.averageOrderValue?.toFixed(0) || '0'} ₺
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Sales Chart */}
      <Paper elevation={3} sx={{ p: 3, mb: 4 }}>        <Typography variant="h5" gutterBottom sx={{ color: '#ff8800', fontWeight: 'bold' }}>
          {t('businessPerformance.salesTrends')}
        </Typography>
        {salesData.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={salesData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />              <Tooltip formatter={(value, name) => [
                name === 'revenue' ? `${value.toLocaleString('tr-TR')} ₺` : value,
                name === 'revenue' ? t('businessPerformance.revenue') : t('businessPerformance.orders')
              ]} />
              <Legend />
              <Line type="monotone" dataKey="revenue" stroke="#ff8800" strokeWidth={3} name={t('businessPerformance.revenueChart')} />
              <Line type="monotone" dataKey="orders" stroke="#80cbc4" strokeWidth={3} name={t('businessPerformance.ordersChart')} />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography color="text.secondary">{t('businessPerformance.noSalesData')}</Typography>
          </Box>
        )}
      </Paper>

      <Grid container spacing={3}>
        {/* Top Selling Products */}
        <Grid item xs={12} md={8}>
          <Paper elevation={3} sx={{ p: 3, height: '100%' }}>            <Typography variant="h5" gutterBottom sx={{ color: '#ff8800', fontWeight: 'bold' }}>
              {t('businessPerformance.topProducts')}
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
              <ToggleButtonGroup
                value={productSortBy}
                exclusive
                onChange={(_, v) => v && setProductSortBy(v)}
                size="small"
                sx={{
                  '& .MuiToggleButton-root': {
                    borderColor: '#ff8800',
                    color: '#ff8800',
                    '&.Mui-selected': {
                      backgroundColor: '#ff8800',
                      color: 'white',
                    }
                  }
                }}
              >                <ToggleButton value="sales">{t('businessPerformance.bestSelling')}</ToggleButton>
                <ToggleButton value="revenue">{t('businessPerformance.highestRevenue')}</ToggleButton>
              </ToggleButtonGroup>
            </Box>
            {topProducts.length > 0 ? (
              <List>
                {[...topProducts].sort((a, b) =>
                  productSortBy === 'sales'
                    ? b.sales - a.sales
                    : b.revenue - a.revenue
                ).map((product, index) => (
                  <React.Fragment key={product.id}>
                    <ListItem>
                      <ListItemAvatar>
                        <Avatar sx={{ 
                          backgroundColor: index < 3 ? '#ff8800' : '#80cbc4',
                          fontWeight: 'bold'
                        }}>
                          {index + 1}
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Typography variant="h6" component="span">
                              {product.name}
                            </Typography>
                            <Chip 
                              label={product.category} 
                              size="small" 
                              sx={{ backgroundColor: 'rgba(128, 203, 196, 0.2)' }}
                            />
                          </Box>
                        }
                        secondary={
                          <Box sx={{ mt: 1 }}>                            <Typography variant="body2" component="span">
                              {t('businessPerformance.sales')}: <strong>{product.sales}</strong> | 
                              {t('businessPerformance.revenue')}: <strong>{product.revenue?.toLocaleString('tr-TR')} ₺</strong>
                            </Typography>
                          </Box>
                        }
                      />
                    </ListItem>
                    {index < topProducts.length - 1 && <Divider />}
                  </React.Fragment>
                ))}
              </List>
            ) : (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <Typography color="text.secondary">{t('businessPerformance.noProductData')}</Typography>
              </Box>
            )}
          </Paper>
        </Grid>

        {/* Favorites Analysis */}
        <Grid item xs={12} md={4}>
          <Paper elevation={3} sx={{ p: 3, height: '100%' }}>            <Typography variant="h5" gutterBottom sx={{ color: '#ff8800', fontWeight: 'bold' }}>
              <FavoriteIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
              {t('businessPerformance.favoritesAnalysis')}
            </Typography>
            {favoritesData.length > 0 ? (
              <>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={favoritesData}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="favorites"
                      label={({ name, percentage }) => `${percentage}%`}
                    >
                      {favoritesData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
                <Box sx={{ mt: 2 }}>
                  {favoritesData.map((item, index) => (
                    <Box key={item.name} sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <Box
                        sx={{
                          width: 12,
                          height: 12,
                          backgroundColor: COLORS[index % COLORS.length],
                          borderRadius: '50%',
                          mr: 1
                        }}
                      />
                      <Typography variant="body2" sx={{ flex: 1 }}>
                        {item.name}
                      </Typography>
                      <Typography variant="body2" fontWeight="bold">
                        {item.favorites}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              </>
            ) : (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <Typography color="text.secondary">{t('businessPerformance.noFavoritesData')}</Typography>
              </Box>
            )}
          </Paper>
        </Grid>
      </Grid>
    </BusinessLayout>
  );
}

export default BusinessPerformance; 