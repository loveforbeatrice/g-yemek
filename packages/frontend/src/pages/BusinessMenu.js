import React, { useState, useEffect } from 'react';
import { 
  Typography, Box, Button, Grid, Card, CardContent, 
  CardMedia, CardActions, IconButton, Chip, CircularProgress,
  Divider, Alert, Snackbar, Paper, Dialog, DialogTitle, DialogContent, DialogActions,
  Tooltip
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import CategoryIcon from '@mui/icons-material/Category';
import MenuItemFormDialog from '../components/MenuItemFormDialog';
import CategoryDialog from '../components/CategoryDialog';
import BusinessLayout from '../components/BusinessLayout';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function BusinessMenu() {
  const [menuItems, setMenuItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [openCategoryDialog, setOpenCategoryDialog] = useState(false);
  const [currentMenuItem, setCurrentMenuItem] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [deleteDialog, setDeleteDialog] = useState({ open: false, id: null });
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    if (!user.isBusiness) {
      navigate('/menu');
    }
  }, [user, navigate]);

  const fetchMenuItems = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      if (!token) throw new Error('Oturum açmanız gerekiyor');
      const response = await axios.get('http://localhost:3001/api/menu/business', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMenuItems(response.data);
      // Kategorileri al
      const uniqueCategories = [...new Set(response.data.map(item => item.category))];
      
      // İçecek kategorilerini tespit etme fonksiyonu - Türkçe karakter ve büyük/küçük harf desteği
      const isDrinkCategory = (category) => {
        // Kategoriyi küçük harfe çevir (Türkçe karakterleri de destekler - I/ı ve İ/i dönüşümlerini doğru yapar)
        const lowerCaseCat = category.toLocaleLowerCase('tr-TR');
        
        // Olası tüm içecek kategori isimlerini kontrol et
        const drinkKeywords = ['içecek', 'icecek', 'içecekler', 'icecekler', 'drink', 'drinks', 'beverage', 'beverages', 'meşrubat', 'mesrubat'];
        
        // Eğer kategori bu anahtar kelimelerden birini içeriyorsa içecek kategorisidir
        return drinkKeywords.some(keyword => lowerCaseCat.includes(keyword));
      };
      
      // İçecek ve diğer kategorileri ayır
      const drinkCategories = uniqueCategories.filter(isDrinkCategory);
      const otherCategories = uniqueCategories.filter(cat => !isDrinkCategory(cat));
      
      // Diğer kategorileri alfabetik sırala (Türkçe karakter desteği ile)
      otherCategories.sort((a, b) => a.localeCompare(b, 'tr-TR', { sensitivity: 'base' }));
      
      // İçecek kategorilerini listenin sonuna ekle
      const sortedCategories = [...otherCategories, ...drinkCategories];
      
      console.log('Orijinal kategoriler:', uniqueCategories);
      console.log('Alfabetik sıralanmış kategoriler:', otherCategories);
      console.log('İçecek kategorileri (sonda):', drinkCategories);
      console.log('Sonuç kategori sıralaması:', sortedCategories);
      
      // Her kategori için içecek kontrolü sonucunu göster (debug için)
      uniqueCategories.forEach(cat => {
        console.log(`Kategori "${cat}" için içecek kontrolü:`, isDrinkCategory(cat));
      });
      
      setCategories(sortedCategories);
      setError(null);
    } catch (err) {
      setError('Menü öğeleri yüklenirken bir hata oluştu. Lütfen daha sonra tekrar deneyin.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchMenuItems(); }, []);

  const handleOpenDialog = (menuItem = null) => {
    setCurrentMenuItem(menuItem);
    setOpenDialog(true);
  };
  const handleCloseDialog = () => {
    setOpenDialog(false);
    setCurrentMenuItem(null);
  };
  const handleSaveMenuItem = async (formData) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('Oturum açmanız gerekiyor');
      
      const config = { 
        headers: { 
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}` 
        } 
      };
      
      let response;
      if (currentMenuItem) {
        // Güncelleme işlemi
        response = await axios.put(
          `http://localhost:3001/api/menu/${currentMenuItem.id}`,
          formData,
          config
        );
        setSnackbar({ open: true, message: 'Menü öğesi başarıyla güncellendi', severity: 'success' });
      } else {
        // Yeni ekleme işlemi
        response = await axios.post(
          'http://localhost:3001/api/menu',
          formData,
          config
        );
        setSnackbar({ open: true, message: 'Menü öğesi başarıyla eklendi', severity: 'success' });
      }
      
      handleCloseDialog();
      fetchMenuItems();
    } catch (err) {
      console.error('Menü öğesi kaydedilirken hata:', err);
      setSnackbar({ 
        open: true, 
        message: err.response?.data?.message || 'Menü öğesi kaydedilirken bir hata oluştu', 
        severity: 'error' 
      });
    }
  };
  const handleDeleteMenuItem = (id) => {
    setDeleteDialog({ open: true, id });
  };
  const handleConfirmDelete = async () => {
    const id = deleteDialog.id;
    setDeleteDialog({ open: false, id: null });
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('Oturum açmanız gerekiyor');
      console.log('Deleting menu item with id:', id);
      await axios.delete(`http://localhost:3001/api/menu/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchMenuItems();
      setSnackbar({ open: true, message: 'Menü öğesi başarıyla silindi', severity: 'success' });
    } catch (err) {
      setSnackbar({ open: true, message: 'Menü öğesi silinirken bir hata oluştu', severity: 'error' });
    }
  };
  const handleCancelDelete = () => {
    setDeleteDialog({ open: false, id: null });
  };
  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };
  const menuItemsByCategory = categories.map(category => ({
    category,
    items: menuItems.filter(item => item.category === category)
  }));

  return (
    <BusinessLayout>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Button
          variant="outlined"
          sx={{ 
            borderColor: '#80cbc4', 
            color: '#333', 
            borderRadius: '4px', 
            '&:hover': { borderColor: '#4db6ac', backgroundColor: 'rgba(77, 182, 172, 0.1)' } 
          }}
          startIcon={<CategoryIcon />}
          onClick={() => setOpenCategoryDialog(true)}
        >
          Manage Categories
        </Button>
        <Button
          variant="contained"
          sx={{ backgroundColor: '#80cbc4', color: '#333', borderRadius: '4px', '&:hover': { backgroundColor: '#4db6ac' } }}
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
        >
          Add new products
        </Button>
      </Box>
      {error && (<Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>)}
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}><CircularProgress /></Box>
      ) : menuItems.length === 0 ? (
        <Paper elevation={3} sx={{ p: 4, textAlign: 'center', borderRadius: '4px', mb: 3, backgroundColor: '#fff' }}>
          <Typography variant="h6" color="text.secondary">Henüz menünüzde ürün bulunmuyor.</Typography>
        </Paper>
      ) : (
        menuItemsByCategory.map(({ category, items }) => (
          <Box key={category} sx={{ mb: 5 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Typography variant="h5" component="h2" fontWeight="bold" sx={{ color: '#ff8800' }}>{category}</Typography>
              <Divider sx={{ flex: 1, ml: 2 }} />
            </Box>
            <Grid container spacing={3}>
              {items.map((item) => (
                <Grid item xs={12} sm={6} md={4} key={item.id}>
                  <Card sx={{ minHeight: 150, height: '100%', display: 'flex', flexDirection: 'column', border: '2px solid #1de9b6', borderRadius: '8px' }}>
                    <CardMedia
                      component="img"
                      height="180"
                      image={item.imageUrl ? `http://localhost:3001/uploads/${item.imageUrl}?t=${new Date().getTime()}` : '/placeholder-food.jpg'}
                      alt={item.productName}
                      sx={{ 
                        objectFit: 'cover',
                        backgroundColor: '#f5f5f5',
                        minHeight: 180
                      }}
                      onError={(e) => {
                        console.error('Image failed to load:', item.imageUrl);
                        console.log('Trying direct URL:', `http://localhost:3001/uploads/${item.imageUrl}`);
                        // Resim yüklenemediğinde placeholder göster
                        e.target.src = '/placeholder-food.jpg';
                      }}
                    />
                    <CardContent sx={{ flexGrow: 1, pb: 0.5, pt: 1, px: 1.5 }}>
                      <Typography gutterBottom variant="h6" component="div" fontWeight="bold">{item.productName}</Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>{item.explanation || 'Açıklama yok'}</Typography>
                      <Typography variant="h6" fontWeight="bold" sx={{ color: '#333', fontSize: '1.1rem' }}>{parseFloat(item.price).toFixed(0)} ₺</Typography>
                      <Chip label={item.category} size="small" sx={{ mt: 0.5, backgroundColor: 'rgba(128, 203, 196, 0.2)' }} />
                    </CardContent>
                    <CardActions sx={{ justifyContent: 'flex-end', pb: 0.5, pt: 0, px: 1.5 }}>
                      <IconButton aria-label="düzenle" onClick={() => handleOpenDialog(item)} sx={{ color: '#80cbc4' }}><EditIcon /></IconButton>
                      <IconButton aria-label="sil" onClick={() => handleDeleteMenuItem(item.id)} sx={{ color: '#ff8800' }}><DeleteIcon /></IconButton>
                    </CardActions>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Box>
        ))
      )}
      <MenuItemFormDialog open={openDialog} handleClose={handleCloseDialog} handleSave={handleSaveMenuItem} menuItem={currentMenuItem} />
      
      <CategoryDialog
        open={openCategoryDialog}
        handleClose={() => {
          setOpenCategoryDialog(false);
          // Refresh menu items to get updated categories
          fetchMenuItems();
        }}
      />
      
      <Dialog
        open={deleteDialog.open}
        onClose={handleCancelDelete}
      >
        <DialogTitle>Menü öğesini silmek istediğinize emin misiniz?</DialogTitle>
        <DialogContent></DialogContent>
        <DialogActions>
          <Button onClick={handleConfirmDelete} color="error">Sil</Button>
          <Button onClick={handleCancelDelete} color="primary">Vazgeç</Button>
        </DialogActions>
      </Dialog>
      <Snackbar open={snackbar.open} autoHideDuration={6000} onClose={handleCloseSnackbar} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>{snackbar.message}</Alert>
      </Snackbar>
      <style>
        {`
        body {
          background-image: none !important;
          background-color: #fef3e2 !important;
        }
        `}
      </style>
    </BusinessLayout>
  );
}

export default BusinessMenu;