import React, { useState, useEffect } from 'react';
import { Grid, Card, CardContent, Typography, Box, Button, IconButton, TextField, Chip, Snackbar, Alert, Popover, MenuItem, Divider, InputAdornment, Badge, Paper } from '@mui/material';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FilterListIcon from '@mui/icons-material/FilterList';
import SortIcon from '@mui/icons-material/Sort';
import SearchIcon from '@mui/icons-material/Search';
import TuneIcon from '@mui/icons-material/Tune';
import CloseIcon from '@mui/icons-material/Close';
import axios from 'axios';

function Menu({ businessName, cartItems, addToCart, removeFromCart }) {
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
  
  const [tempFilters, setTempFilters] = useState({ ...filters });
  const [openFilter, setOpenFilter] = useState(false);
  const [openSort, setOpenSort] = useState(false);
  const [filterAnchorEl, setFilterAnchorEl] = useState(null);
  const [sortAnchorEl, setSortAnchorEl] = useState(null);
  const [activeFiltersCount, setActiveFiltersCount] = useState(0);
  
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
    // Count active filters
    let count = 0;
    if (tempFilters.category !== 'all') count++;
    if (tempFilters.minPrice) count++;
    if (tempFilters.maxPrice) count++;
    setActiveFiltersCount(count);
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
    setActiveFiltersCount(0);
    handleClose();
  };

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
        {businessName ? businessName.toUpperCase() : 'TÜM ÜRÜNLER'}
      </Typography>
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', mb: 4, gap: 2, position: 'relative' }}>
        <Paper
          elevation={3}
          sx={{
            display: 'flex',
            alignItems: 'center',
            width: { xs: '100%', sm: 500 },
            borderRadius: '30px',
            px: 2,
            py: 0.5,
            background: '#fff',
            border: '2px solid #ff8800',
            boxShadow: '0 4px 12px rgba(255, 136, 0, 0.1)'
          }}
        >
          <InputAdornment position="start" sx={{ mr: 1 }}>
            <SearchIcon sx={{ color: '#ff8800' }} />
          </InputAdornment>
          <TextField
            variant="standard"
            placeholder="Ürün veya kategori ara..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            sx={{ 
              flex: 1,
              '& .MuiInput-root': {
                fontSize: '1.1rem',
                '&:before, &:after': {
                  display: 'none'
                }
              },
              '& .MuiInputBase-input': {
                py: 1.2
              }
            }}
            InputProps={{
              endAdornment: search ? (
                <InputAdornment position="end">
                  <IconButton
                    edge="end"
                    onClick={() => setSearch('')}
                    size="small"
                  >
                    <CloseIcon fontSize="small" />
                  </IconButton>
                </InputAdornment>
              ) : null
            }}
          />
        </Paper>
        
        <Box sx={{ display: 'flex', gap: 1.5 }}>
          <Badge 
            badgeContent={activeFiltersCount} 
            color="error"
            overlap="circular"
            sx={{
              '& .MuiBadge-badge': {
                fontSize: '0.7rem',
                height: 18,
                minWidth: 18,
                padding: '0 4px'
              }
            }}
          >
            <IconButton 
              onClick={handleFilterClick}
              size="large"
              sx={{
                background: openFilter ? '#ff8800' : '#fff',
                color: openFilter ? '#fff' : '#ff8800',
                border: '2px solid #ff8800',
                boxShadow: '0 4px 8px rgba(255, 136, 0, 0.15)',
                '&:hover': { 
                  background: '#ff9a33',
                  color: '#fff' 
                },
                transition: 'all 0.2s ease',
                p: 1.2
              }}
            >
              <TuneIcon />
            </IconButton>
          </Badge>
          
          <IconButton 
            onClick={handleSortClick}
            size="large"
            sx={{
              background: openSort ? '#ff8800' : '#fff',
              color: openSort ? '#fff' : '#ff8800',
              border: '2px solid #ff8800',
              boxShadow: '0 4px 8px rgba(255, 136, 0, 0.15)',
              '&:hover': { 
                background: '#ff9a33',
                color: '#fff' 
              },
              transition: 'all 0.2s ease',
              p: 1.2
            }}
          >
            <SortIcon />
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
        PaperProps={{
          elevation: 5,
          sx: {
            borderRadius: 3,
            overflow: 'hidden',
            border: '2px solid #ff8800',
          }
        }}
      >
        <Box sx={{ 
          width: 320,
          background: 'linear-gradient(to bottom, #fff8f0, #fff)',
        }}>
          <Box sx={{ 
            p: 2, 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between',
            borderBottom: '1px solid rgba(255, 136, 0, 0.2)',
            background: '#fff8f0'
          }}>
            <Typography 
              variant="h6" 
              fontWeight="bold" 
              sx={{ 
                color: '#ff8800',
                fontFamily: 'Alata, sans-serif',
                fontSize: '1.3rem'
              }}
            >
              Filtrele
            </Typography>
            <IconButton 
              size="small" 
              onClick={handleClose}
              sx={{ color: '#ff8800' }}
            >
              <CloseIcon fontSize="small" />
            </IconButton>
          </Box>
          
          <Box sx={{ p: 2.5 }}>
            <Typography 
              variant="subtitle2" 
              sx={{ 
                mb: 1.5, 
                fontWeight: 600,
                color: '#333',
                display: 'flex',
                alignItems: 'center',
                gap: 1
              }}
            >
              <FilterListIcon fontSize="small" sx={{ color: '#ff8800' }} />
              Kategori
            </Typography>
            <TextField
              select
              fullWidth
              size="small"
              value={tempFilters.category}
              onChange={e => setTempFilters({...tempFilters, category: e.target.value})}
              sx={{ 
                mb: 3,
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  '&.Mui-focused fieldset': {
                    borderColor: '#ff8800',
                  },
                },
              }}
            >
              <MenuItem value="all">Tüm Kategoriler</MenuItem>
              {categories.map(category => (
                <MenuItem key={category} value={category}>{category}</MenuItem>
              ))}
            </TextField>
            
            <Typography 
              variant="subtitle2" 
              sx={{ 
                mb: 1.5, 
                fontWeight: 600,
                color: '#333',
                display: 'flex',
                alignItems: 'center',
                gap: 1
              }}
            >
              <SortIcon fontSize="small" sx={{ color: '#ff8800' }} />
              Fiyat Aralığı
            </Typography>
            <Box sx={{ display: 'flex', gap: 1.5, mb: 3 }}>
              <TextField
                type="number"
                placeholder="Min"
                size="small"
                value={tempFilters.minPrice}
                onChange={e => setTempFilters({...tempFilters, minPrice: e.target.value})}
                sx={{ 
                  flex: 1,
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    '&.Mui-focused fieldset': {
                      borderColor: '#ff8800',
                    },
                  },
                }}
                InputProps={{
                  startAdornment: <InputAdornment position="start" sx={{ color: '#ff8800', fontWeight: 'bold' }}>₺</InputAdornment>,
                }}
              />
              <TextField
                type="number"
                placeholder="Max"
                size="small"
                value={tempFilters.maxPrice}
                onChange={e => setTempFilters({...tempFilters, maxPrice: e.target.value})}
                sx={{ 
                  flex: 1,
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    '&.Mui-focused fieldset': {
                      borderColor: '#ff8800',
                    },
                  },
                }}
                InputProps={{
                  startAdornment: <InputAdornment position="start" sx={{ color: '#ff8800', fontWeight: 'bold' }}>₺</InputAdornment>,
                }}
              />
            </Box>
            
            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              mt: 3,
              pt: 2,
              borderTop: '1px solid rgba(255, 136, 0, 0.2)'
            }}>
              <Button 
                onClick={resetFilters} 
                variant="outlined"
                sx={{
                  borderColor: '#ff8800',
                  color: '#ff8800',
                  '&:hover': {
                    borderColor: '#ff8800',
                    backgroundColor: 'rgba(255, 136, 0, 0.08)'
                  },
                  borderRadius: 2,
                  textTransform: 'none',
                  fontWeight: 600
                }}
              >
                Sıfırla
              </Button>
              <Button 
                onClick={applyFilters} 
                variant="contained" 
                sx={{
                  backgroundColor: '#ff8800',
                  '&:hover': {
                    backgroundColor: '#ff9a33'
                  },
                  borderRadius: 2,
                  textTransform: 'none',
                  fontWeight: 600,
                  boxShadow: '0 4px 8px rgba(255, 136, 0, 0.25)'
                }}
              >
                Uygula
              </Button>
            </Box>
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
        PaperProps={{
          elevation: 5,
          sx: {
            borderRadius: 3,
            overflow: 'hidden',
            border: '2px solid #ff8800',
          }
        }}
      >
        <Box sx={{ 
          width: 280,
          background: 'linear-gradient(to bottom, #fff8f0, #fff)',
        }}>
          <Box sx={{ 
            p: 2, 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between',
            borderBottom: '1px solid rgba(255, 136, 0, 0.2)',
            background: '#fff8f0'
          }}>
            <Typography 
              variant="h6" 
              fontWeight="bold" 
              sx={{ 
                color: '#ff8800',
                fontFamily: 'Alata, sans-serif',
                fontSize: '1.3rem'
              }}
            >
              Sıralama
            </Typography>
            <IconButton 
              size="small" 
              onClick={handleClose}
              sx={{ color: '#ff8800' }}
            >
              <CloseIcon fontSize="small" />
            </IconButton>
          </Box>
          
          <Box sx={{ p: 0 }}>
            <Typography 
              variant="subtitle2" 
              sx={{ 
                px: 2.5,
                pt: 2,
                pb: 1,
                fontWeight: 600,
                color: '#666'
              }}
            >
              İsme Göre
            </Typography>
            
            <MenuItem 
              selected={filters.sortBy === 'name_asc'}
              onClick={() => {
                setFilters({...filters, sortBy: 'name_asc'});
                handleClose();
              }}
              sx={{
                py: 1.5,
                px: 2.5,
                '&.Mui-selected': {
                  backgroundColor: 'rgba(255, 136, 0, 0.08)',
                },
                '&.Mui-selected:hover': {
                  backgroundColor: 'rgba(255, 136, 0, 0.12)',
                },
                '&:hover': {
                  backgroundColor: 'rgba(0, 0, 0, 0.04)',
                }
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Box 
                  sx={{ 
                    width: 24, 
                    height: 24, 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    borderRadius: '50%',
                    backgroundColor: filters.sortBy === 'name_asc' ? '#ff8800' : 'transparent',
                    border: filters.sortBy === 'name_asc' ? 'none' : '2px solid #ddd'
                  }}
                >
                  {filters.sortBy === 'name_asc' && (
                    <Typography sx={{ color: '#fff', fontWeight: 'bold', fontSize: '0.8rem' }}>✓</Typography>
                  )}
                </Box>
                <Typography sx={{ fontWeight: filters.sortBy === 'name_asc' ? 600 : 400 }}>
                  A'dan Z'ye
                </Typography>
              </Box>
            </MenuItem>
            
            <MenuItem 
              selected={filters.sortBy === 'name_desc'}
              onClick={() => {
                setFilters({...filters, sortBy: 'name_desc'});
                handleClose();
              }}
              sx={{
                py: 1.5,
                px: 2.5,
                '&.Mui-selected': {
                  backgroundColor: 'rgba(255, 136, 0, 0.08)',
                },
                '&.Mui-selected:hover': {
                  backgroundColor: 'rgba(255, 136, 0, 0.12)',
                },
                '&:hover': {
                  backgroundColor: 'rgba(0, 0, 0, 0.04)',
                }
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Box 
                  sx={{ 
                    width: 24, 
                    height: 24, 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    borderRadius: '50%',
                    backgroundColor: filters.sortBy === 'name_desc' ? '#ff8800' : 'transparent',
                    border: filters.sortBy === 'name_desc' ? 'none' : '2px solid #ddd'
                  }}
                >
                  {filters.sortBy === 'name_desc' && (
                    <Typography sx={{ color: '#fff', fontWeight: 'bold', fontSize: '0.8rem' }}>✓</Typography>
                  )}
                </Box>
                <Typography sx={{ fontWeight: filters.sortBy === 'name_desc' ? 600 : 400 }}>
                  Z'den A'ya
                </Typography>
              </Box>
            </MenuItem>
            
            <Divider sx={{ my: 1.5, mx: 2 }} />
            
            <Typography 
              variant="subtitle2" 
              sx={{ 
                px: 2.5,
                pt: 1,
                pb: 1,
                fontWeight: 600,
                color: '#666'
              }}
            >
              Fiyata Göre
            </Typography>
            
            <MenuItem 
              selected={filters.sortBy === 'price_asc'}
              onClick={() => {
                setFilters({...filters, sortBy: 'price_asc'});
                handleClose();
              }}
              sx={{
                py: 1.5,
                px: 2.5,
                '&.Mui-selected': {
                  backgroundColor: 'rgba(255, 136, 0, 0.08)',
                },
                '&.Mui-selected:hover': {
                  backgroundColor: 'rgba(255, 136, 0, 0.12)',
                },
                '&:hover': {
                  backgroundColor: 'rgba(0, 0, 0, 0.04)',
                }
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Box 
                  sx={{ 
                    width: 24, 
                    height: 24, 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    borderRadius: '50%',
                    backgroundColor: filters.sortBy === 'price_asc' ? '#ff8800' : 'transparent',
                    border: filters.sortBy === 'price_asc' ? 'none' : '2px solid #ddd'
                  }}
                >
                  {filters.sortBy === 'price_asc' && (
                    <Typography sx={{ color: '#fff', fontWeight: 'bold', fontSize: '0.8rem' }}>✓</Typography>
                  )}
                </Box>
                <Typography sx={{ fontWeight: filters.sortBy === 'price_asc' ? 600 : 400 }}>
                  Düşükten Yükseğe
                </Typography>
              </Box>
            </MenuItem>
            
            <MenuItem 
              selected={filters.sortBy === 'price_desc'}
              onClick={() => {
                setFilters({...filters, sortBy: 'price_desc'});
                handleClose();
              }}
              sx={{
                py: 1.5,
                px: 2.5,
                mb: 1,
                '&.Mui-selected': {
                  backgroundColor: 'rgba(255, 136, 0, 0.08)',
                },
                '&.Mui-selected:hover': {
                  backgroundColor: 'rgba(255, 136, 0, 0.12)',
                },
                '&:hover': {
                  backgroundColor: 'rgba(0, 0, 0, 0.04)',
                }
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Box 
                  sx={{ 
                    width: 24, 
                    height: 24, 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    borderRadius: '50%',
                    backgroundColor: filters.sortBy === 'price_desc' ? '#ff8800' : 'transparent',
                    border: filters.sortBy === 'price_desc' ? 'none' : '2px solid #ddd'
                  }}
                >
                  {filters.sortBy === 'price_desc' && (
                    <Typography sx={{ color: '#fff', fontWeight: 'bold', fontSize: '0.8rem' }}>✓</Typography>
                  )}
                </Box>
                <Typography sx={{ fontWeight: filters.sortBy === 'price_desc' ? 600 : 400 }}>
                  Yüksekten Düşüğe
                </Typography>
              </Box>
            </MenuItem>
          </Box>
        </Box>
      </Popover>
      <Grid container columnSpacing={6} rowSpacing={3}>
        {filtered.length === 0 ? (
          <Grid item xs={12}>
            <Typography align="center" color="text.secondary" sx={{ mt: 6, fontSize: '1.3rem' }}>
              {businessName ? 'Bu işletmeye ait menü bulunamadı.' : 'Ürün bulunamadı.'}
            </Typography>
          </Grid>
        ) : (
          grouped.map(group => (
            <React.Fragment key={group.category}>
              <Grid item xs={12}>
                <Typography 
                  variant="h2"
                  fontWeight="regular"
                  sx={{ mb: 2, mt: 3, fontFamily: 'Alata, sans-serif', color: '#222', ml: '2ch', letterSpacing: '0.5px' }}>
                  {'  '}{group.category.toUpperCase()}
                </Typography>
              </Grid>
              {group.items.map(item => (
                <Grid item xs={12} sm={6} md={4} key={item.id || `${item.productName}-${item.category}`}>
                  <Card sx={{
                    border: '2px solid #ff8800',
                    borderRadius: '16px',
                    background: '#fff',
                    boxShadow: '0 2px 8px 0 rgba(0,0,0,0.07)',
                    position: 'relative',
                    minHeight: 240,
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'flex-start'
                  }}>
                    <CardContent sx={{ p: 3, flex: 1, display: 'flex', flexDirection: 'column', height: '100%' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', mb: 1 }}>
                        <Typography variant="h3" fontWeight="bold" sx={{ fontFamily: 'Alata, sans-serif', fontSize: '2.3rem', lineHeight: 1.1 }}>
                          {item.productName}
                        </Typography>
                        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: 36 }}>
                          <IconButton 
                            onClick={(e) => { e.stopPropagation(); handleFavorite(item); }} 
                            sx={{ 
                              p: 0.5, 
                              color: favorites[item.id] ? '#ff6d00' : '#aaa',
                              filter: !businessIsOpen ? 'grayscale(100%)' : 'none'
                            }}
                          >
                            {favorites[item.id] ? <FavoriteIcon /> : <FavoriteBorderIcon />}
                          </IconButton>
                          <Typography sx={{ 
                            color: '#ff8800', 
                            fontWeight: 600, 
                            fontSize: '1.1rem', 
                            mt: -0.5,
                            filter: !businessIsOpen ? 'grayscale(100%)' : 'none'
                          }}>
                            12
                          </Typography>
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
                        </Box>
                        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'flex-end', justifyContent: 'center', height: '100%' }}>
                          <Typography variant="h3" sx={{ color: '#222', fontWeight: 700, fontSize: '2rem', mb: 1 }}>
                            ₺ {Number(item.price).toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
                          </Typography>
                          <Box sx={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            border: '2px solid #9d8df1', 
                            borderRadius: '30px', 
                            px: 2, 
                            py: 0.5, 
                            minWidth: 100, 
                            justifyContent: 'center', 
                            background: '#fff',
                            filter: !businessIsOpen ? 'grayscale(100%)' : 'none'
                          }}>
                            <Button 
                              variant="text" 
                              sx={{ 
                                minWidth: 0, 
                                color: '#ff8800', 
                                fontSize: '2rem', 
                                fontWeight: 700, 
                                p: 0, 
                                lineHeight: 1 
                              }} 
                              onClick={() => removeFromCart(item.id)}
                            >
                              –
                            </Button>
                            <Typography 
                              variant="h5" 
                              sx={{ 
                                mx: 1.5, 
                                color: '#ff8800', 
                                fontWeight: 700, 
                                fontSize: '2rem', 
                                minWidth: 24, 
                                textAlign: 'center' 
                              }}
                            >
                              {cartItems.find(i => i.id === item.id)?.quantity || 0}
                            </Typography>
                            <Button 
                              variant="text" 
                              sx={{ 
                                minWidth: 0, 
                                color: '#ff8800', 
                                fontSize: '2rem', 
                                fontWeight: 700, 
                                p: 0, 
                                lineHeight: 1 
                              }} 
                              onClick={() => {
                                if (businessIsOpen) {
                                  addToCart({ ...item, businessId: businessMap[item.businessName] });
                                  setSnackbar({ 
                                    open: true, 
                                    message: `${item.productName} has been added to your cart!`, 
                                    severity: 'success' 
                                  });
                                } else {
                                  setSnackbar({ 
                                    open: true, 
                                    message: `İşletme şu anda kapalı olduğu için sipariş veremezsiniz.`, 
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
    </Box>
  );
}

export default Menu; 