import React, { useState, useEffect } from 'react';
import { Grid, Card, CardContent, Typography, Box, Button, IconButton, TextField, Chip, Snackbar, Alert, Popover, MenuItem, Divider, Dialog, DialogTitle, DialogContent, List, ListItem, ListItemText, CircularProgress } from '@mui/material';
import FavoriteRounded from '@mui/icons-material/FavoriteRounded';
import FavoriteBorderRounded from '@mui/icons-material/FavoriteBorderRounded';
import StarRounded from '@mui/icons-material/StarRounded';
import RateReviewRounded from '@mui/icons-material/RateReviewRounded';
import CloseIcon from '@mui/icons-material/Close';
import TuneIcon from '@mui/icons-material/Tune';
import SwapVertIcon from '@mui/icons-material/SwapVert';
import axios from 'axios';
import { useLanguage } from '../contexts/LanguageContext';
import { useSearchParams, useNavigate } from 'react-router-dom'; // URL parametresi için gerekli hook

function Menu({ businessName: propBusinessName, cartItems, addToCart, removeFromCart }) {
  const { t } = useLanguage();
  const [searchParams] = useSearchParams(); // URL parametrelerini okuma
  const navigate = useNavigate();
  
  // URL parametresinden veya prop'tan restoran adını al
  const [businessName, setBusinessName] = useState(() => {
    const urlRestaurant = searchParams.get('restaurant');
    return urlRestaurant || propBusinessName;
  });
  
  const [menuItems, setMenuItems] = useState([]);
  const [search, setSearch] = useState('');
  const [favorites, setFavorites] = useState({});
  const [businessMap, setBusinessMap] = useState({});
  const [businessIsOpen, setBusinessIsOpen] = useState(true);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [filters, setFilters] = useState({
    category: 'all',
    sortBy: 'name_asc',
    minPrice: '',
    maxPrice: ''
  });
  
  // Yorum dialog'u için state ve fonksiyonlar
  const [commentDialog, setCommentDialog] = useState({
    open: false,
    menuItemId: null,
    loading: false,
    comments: []
  });

  // Yorumları açmak için fonksiyon
  const handleOpenComments = async (menuItemId) => {
    setCommentDialog({
      ...commentDialog,
      open: true,
      menuItemId,
      loading: true,
      comments: []
    });
    
    try {
      // Fetch ratings/comments for this menu item
      const response = await axios.get(`/api/ratings/menuItem/${menuItemId}`);
      if (response.data && response.data.success) {
        setCommentDialog({
          ...commentDialog,
          open: true,
          menuItemId,
          loading: false,
          comments: response.data.ratings || []
        });
      }
    } catch (error) {
      console.error('Error fetching item comments:', error);
      setCommentDialog({
        ...commentDialog,
        open: true,
        menuItemId,
        loading: false,
        comments: []
      });
    }
  };

  // Yorum dialog'unu kapatmak için fonksiyon
  const handleCloseComments = () => {
    setCommentDialog({
      ...commentDialog,
      open: false
    });
  };

  // Tarih formatı için fonksiyon
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('tr-TR', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const [tempFilters, setTempFilters] = useState({ ...filters });
  const [openFilter, setOpenFilter] = useState(false);
  const [openSort, setOpenSort] = useState(false);
  const [filterAnchorEl, setFilterAnchorEl] = useState(null);
  const [sortAnchorEl, setSortAnchorEl] = useState(null);
  const [favoriteCounts, setFavoriteCounts] = useState({});
  
  const handleFilterClick = (event) => {
    setFilterAnchorEl(event.currentTarget);
    setOpenFilter(true);
  };
  
  const handleSortClick = (event) => {
    setSortAnchorEl(event.currentTarget);
    setOpenSort(true);
  };
  
  const handleClose = () => {
    setOpenFilter(false);
    setOpenSort(false);
    setFilterAnchorEl(null);
    setSortAnchorEl(null);
  };
  
  const applyFilters = () => {
    setFilters({ ...tempFilters });
    handleClose();
  };
  
  const resetFilters = () => {
    const defaultFilters = {
      category: 'all',
      sortBy: 'name_asc',
      minPrice: '',
      maxPrice: ''
    };
    setTempFilters(defaultFilters);
    setFilters(defaultFilters);
    handleClose();
  };

  // URL parametresindeki değişiklikleri izle
  useEffect(() => {
    const restaurantParam = searchParams.get('restaurant');
    if (restaurantParam) {
      setBusinessName(restaurantParam);
    }
  }, [searchParams]);

  // İşletme listesini çek ve eşlemesini hazırla
  useEffect(() => {
    axios.get('http://localhost:3001/api/auth/businesses').then(res => {
      const map = {};
      res.data.businesses.forEach(b => {
        map[b.name] = b.id;
        
        // İşletmenin açık/kapalı durumunu kontrol et
        if (b.name === businessName) {
          setBusinessIsOpen(b.isOpen !== false);
        }
      });
      setBusinessMap(map);
    });
  }, [businessName]);

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
      });
  }, [businessName]);

  // Menü itemları değiştiğinde favori sayılarını çek
  useEffect(() => {
    if (menuItems.length === 0) return;
    const menuItemIds = menuItems.map(item => item.id).join(',');
    axios.get(`http://localhost:3001/api/favorites/counts?menuItemIds=${menuItemIds}`)
      .then(res => {
        setFavoriteCounts(res.data);
      })
      .catch(error => {
        console.error('Error fetching favorite counts:', error);
      });
  }, [menuItems]);

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
          [item.id]: typeof res.data[item.id] === 'number' ? res.data[item.id] : 0
        }));
      })
      .catch(error => {
        console.error('Error fetching favorite count:', error);
      });
  };

  // Filtreleme ve sıralama işlemleri
  const filtered = menuItems
    .filter(item => {
      const matchesSearch = item.productName.toLowerCase().includes(search.toLowerCase()) ||
        (item.category && item.category.toLowerCase().includes(search.toLowerCase()));
      const matchesCategory = filters.category === 'all' || item.category === filters.category;
      const matchesMinPrice = !filters.minPrice || item.price >= parseFloat(filters.minPrice);
      const matchesMaxPrice = !filters.maxPrice || item.price <= parseFloat(filters.maxPrice);
      return matchesSearch && matchesCategory && matchesMinPrice && matchesMaxPrice;
    })
    .sort((a, b) => {
      switch (filters.sortBy) {
        case 'name_asc':
          return a.productName.localeCompare(b.productName);
        case 'name_desc':
          return b.productName.localeCompare(a.productName);
        case 'price_asc':
          return a.price - b.price;
        case 'price_desc':
          return b.price - a.price;
        default:
          return 0;
      }
    });

  // Kategorilere göre grupla
  const categories = Array.from(new Set(menuItems.map(item => item.category || 'Diğer')));
  const grouped = categories
    .map(cat => ({
      category: cat,
      items: filtered.filter(item => (item.category || 'Diğer') === cat)
    }))
    .filter(group => group.items.length > 0); // Sadece öğesi olan kategorileri göster

  // Sepete ürün ekleme fonksiyonu
  const handleAddToCart = (item) => {
    // Sepette başka bir işletmenin ürünü var mı kontrol et
    if (cartItems.length > 0) {
      const firstItem = cartItems[0];
      if (firstItem.businessName !== businessName) {
        setSnackbar({
          open: true,
          message: 'Sepetinizde başka bir işletmenin ürünü bulunmaktadır. Önce sepetinizi boşaltın.',
          severity: 'error'
        });
        return;
      }
    }

    // Ürünü sepete ekle
    addToCart({ ...item, businessName });
    setSnackbar({ 
      open: true, 
      message: t('addedToCart'), 
      severity: 'success' 
    });
  };

  return (
    <Box sx={{ 
      width: '100%', 
      maxWidth: '1400px', 
      mx: 'auto', 
      px: 4, 
      background: '#fef3e2', 
      borderRadius: 3, 
      minHeight: '100vh', 
      mt: 4, 
      pb: 6
    }}>
      <Typography variant="h2" align="center" fontWeight="bold" sx={{ mb: 3, fontFamily: 'Alata, sans-serif' }}>
        {businessName ? businessName.toUpperCase() : t('menu').toUpperCase()}
      </Typography>
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', mb: 3, gap: 2 }}>
        <TextField
          variant="outlined"
          placeholder={t('search') + '...'}
          value={search}
          onChange={e => setSearch(e.target.value)}
          sx={{ 
            width: 400, 
            background: '#fff', 
            borderRadius: '30px',
            '& .MuiOutlinedInput-root': {
              borderRadius: '30px',
              pr: 2
            }
          }}
        />
        <Box sx={{ display: 'flex', gap: 1 }}>
          <IconButton 
            onClick={handleFilterClick}
            size="medium"
            sx={{
              background: openFilter ? 'rgba(0,0,0,0.05)' : 'transparent',
              '&:hover': { background: 'rgba(0,0,0,0.05)' },
              border: '1px solid rgba(0,0,0,0.23)',
              borderRadius: '8px',              p: 1
            }}
          >
            <TuneIcon />
          </IconButton>
          <IconButton 
            onClick={handleSortClick}
            size="medium"
            sx={{
              background: openSort ? 'rgba(0,0,0,0.05)' : 'transparent',
              '&:hover': { background: 'rgba(0,0,0,0.05)' },
              border: '1px solid rgba(0,0,0,0.23)',
              borderRadius: '8px',
              p: 1
            }}
          >
            <SwapVertIcon />
          </IconButton>
        </Box>
      </Box>
      
      {/* Filter Popover */}
      <Popover
        open={openFilter}
        anchorEl={filterAnchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'left',
        }}
      >
        <Box sx={{ p: 2, width: 280 }}>
          <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 2 }}>{t('filter')}</Typography>
          
          <Typography variant="subtitle2" sx={{ mt: 2, mb: 1 }}>{t('category')}</Typography>
          <TextField
            select
            fullWidth
            size="small"
            value={tempFilters.category}
            onChange={e => setTempFilters({...tempFilters, category: e.target.value})}
            sx={{ mb: 2 }}
          >
            <MenuItem value="all">{t('all')}</MenuItem>
            {categories.map(category => (
              <MenuItem key={category} value={category}>{category}</MenuItem>
            ))}
          </TextField>
          
          <Typography variant="subtitle2" sx={{ mb: 1 }}>{t('price')} {t('range')}</Typography>
          <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
            <TextField
              type="number"
              placeholder={t('min')}
              size="small"
              value={tempFilters.minPrice}
              onChange={e => setTempFilters({...tempFilters, minPrice: e.target.value})}
              sx={{ flex: 1 }}
              InputProps={{
                startAdornment: '₺',
              }}
            />
            <TextField
              type="number"
              placeholder={t('max')}
              size="small"
              value={tempFilters.maxPrice}
              onChange={e => setTempFilters({...tempFilters, maxPrice: e.target.value})}
              sx={{ flex: 1 }}
              InputProps={{
                startAdornment: '₺',
              }}
            />
          </Box>
          
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
            <Button onClick={resetFilters} color="inherit">{t('reset')}</Button>
            <Button onClick={applyFilters} variant="contained" color="primary">{t('apply')}</Button>
          </Box>
        </Box>
      </Popover>
      
      {/* Sort Popover */}
      <Popover
        open={openSort}
        anchorEl={sortAnchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'left',
        }}
      >
        <Box sx={{ p: 1, width: 200 }}>
          <MenuItem 
            selected={filters.sortBy === 'name_asc'}
            onClick={() => {
              setFilters({...filters, sortBy: 'name_asc'});
              handleClose();
            }}
          >
            {t('sortByNameAsc')}
          </MenuItem>
          <MenuItem 
            selected={filters.sortBy === 'name_desc'}
            onClick={() => {
              setFilters({...filters, sortBy: 'name_desc'});
              handleClose();
            }}
          >
            {t('sortByNameDesc')}
          </MenuItem>
          <Divider />
          <MenuItem 
            selected={filters.sortBy === 'price_asc'}
            onClick={() => {
              setFilters({...filters, sortBy: 'price_asc'});
              handleClose();
            }}
          >
            {t('sortByPriceAsc')}
          </MenuItem>
          <MenuItem 
            selected={filters.sortBy === 'price_desc'}
            onClick={() => {
              setFilters({...filters, sortBy: 'price_desc'});
              handleClose();
            }}
          >
            {t('sortByPriceDesc')}
          </MenuItem>
        </Box>
      </Popover>
      <Grid container columnSpacing={6} rowSpacing={3}>
        {filtered.length === 0 ? (
          <Grid item xs={12}>
            <Typography align="center" color="text.secondary" sx={{ mt: 6, fontSize: '1.3rem' }}>
              {businessName ? t('noMenuItems') : t('noResultsFound')}
            </Typography>
          </Grid>
        ) : (
          grouped.map(group => (
            <React.Fragment key={group.category}>
              <Grid item xs={12}>
                <Box sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  mb: 3, 
                  mt: 6
                }}>
                  <Typography 
                    variant="h5"
                    fontWeight="700"
                    sx={{ 
                      fontFamily: 'Alata, sans-serif', 
                      color: '#ff8800', 
                      fontSize: '1.4rem',
                      letterSpacing: '1px',
                      textTransform: 'uppercase',
                      mr: 3
                    }}>
                    {group.category}
                  </Typography>
                  <Box sx={{ 
                    flex: 1, 
                    height: '2px', 
                    background: '#ff8800',
                    borderRadius: '1px'
                  }} />
                </Box>
              </Grid>
              {group.items.map(item => (
                <Grid item xs={12} sm={6} md={4} key={item.id || `${item.productName}-${item.category}`}>                  <Card sx={{
                    border: '2px solid #ff8800',
                    borderRadius: '16px',
                    background: '#fff',
                    boxShadow: '0 2px 8px 0 rgba(0,0,0,0.07)',
                    position: 'relative',
                    height: '100%',
                    minHeight: 240,
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between'
                  }}>
                    <CardContent sx={{ 
                      p: { xs: 2, sm: 3 }, 
                      flex: 1, 
                      display: 'flex', 
                      flexDirection: 'column', 
                      height: '100%',
                      '&:last-child': { pb: { xs: 2, sm: 3 } }
                    }}>
                      <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', width: '100%', mb: 1 }}>
                        <Box sx={{ maxWidth: 'calc(100% - 180px)' }}>                          <Typography 
                            variant="h3" 
                            fontWeight="bold" 
                            sx={{ 
                              fontFamily: 'Alata, sans-serif', 
                              fontSize: '1.6rem', 
                              lineHeight: 1.1,
                              mb: 0.5,
                              wordBreak: 'break-word',
                              overflowWrap: 'break-word',
                              display: '-webkit-box',
                              WebkitLineClamp: 1,
                              WebkitBoxOrient: 'vertical',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'normal'
                            }}
                          >
                            {item.productName}
                          </Typography>
                        </Box>
                        
                        {/* İkonların ve sayıların hepsi yan yana */}
                        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 3 }}>                          {/* Yorum ikonu ve sayısı */}
                          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                            <IconButton 
                              disableRipple
                              onClick={(e) => { e.stopPropagation(); handleOpenComments(item.id); }}
                              sx={{ p: 0 }}
                            >
                              <RateReviewRounded sx={{ color: '#aaa', fontSize: '1.8rem' }} />
                            </IconButton>                            <Typography variant="caption" sx={{ 
                              color: '#aaa', 
                              fontWeight: 'bold', 
                              fontSize: '0.8rem',
                              mt: 0.1
                            }}>
                              {item.commentCount || 0}
                            </Typography>
                          </Box>                          {/* Yıldız ve puan */}
                          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                            <Box sx={{ height: '1.7rem', display: 'flex', alignItems: 'center' }}>
                              <StarRounded sx={{ color: '#FF8800', fontSize: '1.8rem' }} />
                            </Box>
                            <Typography variant="caption" sx={{ 
                              fontWeight: 'bold',
                              color: '#333',
                              fontSize: '0.8rem',
                              mt: 0.1
                            }}>
                              {(item.averageRating || 0).toFixed(1)}
                            </Typography>
                          </Box>
                          
                          {/* Kalp ikonu ve sayı */}
                          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                            <IconButton 
                              onClick={(e) => { e.stopPropagation(); handleFavorite(item); }} 
                              disableRipple
                              sx={{ 
                                p: 0, 
                                color: favorites[item.id] ? '#ff6d00' : '#aaa',
                                filter: !businessIsOpen ? 'grayscale(100%)' : 'none'
                              }}
                            >                              {favorites[item.id] ? 
                                <FavoriteRounded sx={{ fontSize: '1.8rem' }} /> : 
                                <FavoriteBorderRounded sx={{ fontSize: '1.8rem' }} />
                              }
                            </IconButton>                            <Typography sx={{ 
                              color: '#ff8800', 
                              fontWeight: 'bold', 
                              fontSize: '0.8rem',
                              filter: !businessIsOpen ? 'grayscale(100%)' : 'none',
                              mt: 0.1
                            }}>
                              {typeof favoriteCounts[item.id] === 'number' ? favoriteCounts[item.id] : 0}
                            </Typography>
                          </Box>
                        </Box>
                      </Box>
                      <Typography 
                        variant="body1" 
                        color="text.secondary" 
                        sx={{ 
                          mb: 2, 
                          fontSize: '1rem', 
                          fontWeight: 400,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                        }}
                      >
                        {item.explanation}
                      </Typography>                      <Box sx={{ display: 'flex', alignItems: 'center', width: '100%', mt: 'auto', gap: { xs: 2, sm: 3 } }}>
                        <Box sx={{ 
                          width: { xs: 100, sm: 120, md: 140 }, 
                          height: { xs: 70, sm: 80, md: 90 }, 
                          borderRadius: 3, 
                          overflow: 'hidden', 
                          flexShrink: 0, 
                          display: 'flex', 
                          alignItems: 'center', 
                          justifyContent: 'center', 
                          background: '#fff' 
                        }}>
                          <img
                            src={item.imageUrl ? `http://localhost:3001/uploads/${item.imageUrl}` : '/images/food-bg.jpg'}
                            alt={item.productName}
                            style={{ 
                              width: '100%', 
                              height: '100%', 
                              objectFit: 'cover', 
                              borderRadius: 12, 
                              background: '#fff', 
                              display: 'block',
                              filter: !businessIsOpen ? 'grayscale(100%)' : 'none'
                            }}
                            onError={(e) => {
                              e.target.src = '/images/food-bg.jpg';
                            }}
                          />
                        </Box><Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'flex-end', justifyContent: 'center', height: '100%' }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', mb: 1 }}>
                            <Typography 
                              variant="h6" 
                              sx={{ 
                                color: '#222', 
                                fontWeight: 700, 
                                fontSize: '1.5rem', 
                                lineHeight: 1,
                                mr: 0.5,
                                mt: '-2px'
                              }}
                            >
                              ₺
                            </Typography>
                            <Typography 
                              variant="h3" 
                              sx={{ 
                                color: '#222', 
                                fontWeight: 700, 
                                fontSize: '2rem', 
                                lineHeight: 1
                              }}
                            >
                              {Number(item.price).toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
                            </Typography>
                          </Box>                          <Box sx={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            border: '2px solid #9d8df1', 
                            borderRadius: '30px', 
                            px: 2, 
                            py: 0, 
                            minWidth: 100,
                            height: 40, 
                            justifyContent: 'center', 
                            background: '#fff',
                            filter: !businessIsOpen ? 'grayscale(100%)' : 'none'
                          }}>                            <Button 
                              variant="text" 
                              sx={{ 
                                minWidth: 32, 
                                width: 32,
                                height: 32,
                                color: (cartItems.find(i => i.id === item.id)?.quantity || 0) === 0 ? '#ccc' : '#ff8800', 
                                fontSize: '1.8rem', 
                                fontWeight: 700, 
                                p: 0, 
                                lineHeight: 1, 
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                              }}
                              onClick={() => {
                                const quantity = cartItems.find(i => i.id === item.id)?.quantity || 0;
                                if (quantity === 0) {
                                  setSnackbar({
                                    open: true,
                                    message: 'Ürün miktarı zaten 0. Sepetten daha fazla çıkarılamaz.',
                                    severity: 'warning'
                                  });
                                  return;
                                }
                                removeFromCart(item.id);
                              }}
                            >
                              -
                            </Button>
                            <Typography 
                              variant="h5" 
                              sx={{ 
                                mx: 1, 
                                color: '#ff8800', 
                                fontWeight: 700, 
                                fontSize: '1.5rem', 
                                width: 30, 
                                textAlign: 'center',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                              }}
                            >
                              {cartItems.find(i => i.id === item.id)?.quantity || 0}
                            </Typography>
                            <Button 
                              variant="text" 
                              sx={{ 
                                minWidth: 32, 
                                width: 32,
                                height: 32,
                                color: '#ff8800', 
                                fontSize: '1.8rem', 
                                fontWeight: 700, 
                                p: 0, 
                                lineHeight: 1,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                              }}
                              onClick={() => {
                                if (businessIsOpen) {
                                  handleAddToCart(item);
                                } else {
                                  setSnackbar({ 
                                    open: true, 
                                    message: t('restaurantClosedCannotOrder'), 
                                    severity: 'error' 
                                  });
                                }
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

      {/* Comments Dialog */}
      <Dialog 
        open={commentDialog.open} 
        onClose={handleCloseComments}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontFamily: '"Alata", sans-serif' }}>
          {t('Yorumlar')}
          <IconButton onClick={handleCloseComments} size="small">
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          {commentDialog.loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
              <CircularProgress sx={{ color: '#ff8800' }} />
            </Box>
          ) : commentDialog.comments.length > 0 ? (
            <List>
              {commentDialog.comments.map((comment, index) => (
                <React.Fragment key={comment.id || index}>
                  <ListItem alignItems="flex-start">
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>                          <Typography component="span" variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                            {comment.user?.name || t('Anonim')}
                          </Typography>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <StarRounded sx={{ color: '#ff8800', fontSize: '1.8 rem', mr: 0.5 }} />
                            <Typography variant="body2" sx={{ fontWeight: 'bold', color: '#ff8800' }}>
                              {comment.foodRating?.toFixed(1)}
                            </Typography>
                          </Box>
                        </Box>
                      }
                      secondary={
                        <>
                          <Typography component="span" variant="body2" color="text.primary" sx={{ mt: 0.5, display: 'block' }}>
                            {comment.comment || t('Yorum yapılmamış')}
                          </Typography>
                          <Typography component="div" variant="caption" color="text.secondary" sx={{ mt: 1 }}>
                            {formatDate(comment.createdAt)}
                          </Typography>
                        </>
                      }
                    />
                  </ListItem>
                  {index < commentDialog.comments.length - 1 && <Divider component="li" />}
                </React.Fragment>
              ))}
            </List>
          ) : (
            <Box sx={{ p: 3, textAlign: 'center' }}>
              <Typography variant="body1" sx={{ color: '#666' }}>
                {t('Bu ürün için henüz yorum yok')}
              </Typography>
            </Box>
          )}
        </DialogContent>
      </Dialog>
    </Box>
  );
}

export default Menu;