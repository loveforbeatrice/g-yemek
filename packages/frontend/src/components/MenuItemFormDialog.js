import React, { useState, useEffect, useRef } from 'react';
import { 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions, 
  Button, 
  TextField, 
  Box, 
  MenuItem, 
  Avatar,
  IconButton,
  Typography,
  CircularProgress,
  Alert,
  Snackbar
} from '@mui/material';
import AddPhotoAlternateIcon from '@mui/icons-material/AddPhotoAlternate';
import DeleteIcon from '@mui/icons-material/Delete';
import axios from 'axios';

function MenuItemFormDialog({ open, handleClose, handleSave, menuItem }) {
  const fileInputRef = useRef(null);
  const [form, setForm] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    image: null,
    imagePreview: ''
  });
  const [categories, setCategories] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(false);
  const [error, setError] = useState({ open: false, message: '' });
  const [newCategory, setNewCategory] = useState('');
  const [showNewCategoryInput, setShowNewCategoryInput] = useState(false);

  // Fetch categories from the API
  useEffect(() => {
    const fetchCategories = async () => {
      if (!open) return;
      
      try {
        setLoadingCategories(true);
        const token = localStorage.getItem('token');
        if (!token) throw new Error('Oturum açmanız gerekiyor');
        
        const response = await axios.get('http://localhost:3001/api/categories', {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        setCategories(response.data);
      } catch (err) {
        console.error('Error fetching categories:', err);
        // Provide default categories in case of error
        setCategories([
          { id: 'default-1', name: 'Pide' },
          { id: 'default-2', name: 'Kebap' },
          { id: 'default-3', name: 'Tatlı' },
          { id: 'default-4', name: 'İçecek' },
          { id: 'default-5', name: 'Salata' },
          { id: 'default-6', name: 'Diğer' }
        ]);
      } finally {
        setLoadingCategories(false);
      }
    };
    
    fetchCategories();
  }, [open]);

  useEffect(() => {
    if (menuItem) {
      setForm({
        name: menuItem.productName || '',
        description: menuItem.explanation || '',
        price: menuItem.price || '',
        category: menuItem.category || '',
        image: menuItem.image || null,
        imagePreview: menuItem.imagePreview || ''
      });
    } else {
      setForm({ name: '', description: '', price: '', category: '', image: null, imagePreview: '' });
    }
  }, [menuItem, open]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageChange = (e) => {
    const image = e.target.files[0];
    setForm(prev => ({
      ...prev,
      image,
      imagePreview: URL.createObjectURL(image)
    }));
  };

  const handleRemoveImage = () => {
    setForm(prev => ({
      ...prev,
      image: null,
      imagePreview: ''
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Resim zorunluluğu kontrolü
    if (!form.image && (!menuItem || !menuItem.imageUrl)) {
      setError({
        open: true,
        message: 'Ürün fotoğrafı eklemek zorunludur. Lütfen bir fotoğraf seçin.'
      });
      return;
    }
    
    const formData = new FormData();
    
    // Form verilerini ekle
    formData.append('productName', form.name);
    formData.append('price', form.price);
    formData.append('category', form.category);
    formData.append('explanation', form.description);
    
    // Eğer yeni bir resim yüklendiyse ekle
    if (form.image) {
      formData.append('image', form.image);
    }
    
    handleSave(formData);
  };

  const handleCloseError = () => {
    setError({ ...error, open: false });
  };

  const handleNewCategoryChange = (e) => {
    setNewCategory(e.target.value);
  };

  const handleAddNewCategory = async () => {
    if (!newCategory.trim()) {
      setError({
        open: true,
        message: 'Lütfen bir kategori adı giriniz.'
      });
      return;
    }
    
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('Oturum açmanız gerekiyor');
      
      // Save the new category to the backend
      const response = await axios.post(
        'http://localhost:3001/api/categories',
        { name: newCategory.trim() },
        {
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        }
      );
      
      // Add the new category to the list from the response
      setCategories(prev => [...prev, response.data]);
      setForm(prev => ({
        ...prev,
        category: response.data.name
      }));
      setNewCategory('');
      setShowNewCategoryInput(false);
      
    } catch (err) {
      console.error('Error adding category:', err);
      setError({
        open: true,
        message: 'Kategori eklenirken bir hata oluştu: ' + (err.response?.data?.message || err.message)
      });
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="xs" fullWidth>
      <DialogTitle>{menuItem ? 'Menü Öğesini Düzenle' : 'Yeni Menü Öğesi Ekle'}</DialogTitle>
      <form onSubmit={handleSubmit}>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 2 }}>
            <input
              accept="image/*"
              style={{ display: 'none' }}
              id="menu-item-image"
              type="file"
              onChange={handleImageChange}
              ref={fileInputRef}
            />
            <label htmlFor="menu-item-image">
              <IconButton component="span" color="primary" sx={{ p: 0, mb: 1 }}>
                {form.imagePreview ? (
                  <Box sx={{ position: 'relative' }}>
                    <Avatar 
                      src={form.imagePreview} 
                      sx={{ width: 120, height: 120, borderRadius: 2 }}
                      variant="rounded"
                    />
                    <IconButton
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveImage();
                      }}
                      sx={{
                        position: 'absolute',
                        top: 0,
                        right: 0,
                        backgroundColor: 'rgba(0,0,0,0.5)',
                        color: 'white',
                        '&:hover': {
                          backgroundColor: 'rgba(0,0,0,0.7)',
                        },
                      }}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Box>
                ) : (
                  <Box
                    sx={{
                      width: 120,
                      height: 120,
                      border: '2px dashed',
                      borderColor: 'divider',
                      borderRadius: 2,
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'center',
                      alignItems: 'center',
                      cursor: 'pointer',
                      '&:hover': {
                        borderColor: 'primary.main',
                        backgroundColor: 'action.hover',
                      },
                    }}
                  >
                    <AddPhotoAlternateIcon fontSize="large" color="action" />
                    <Typography variant="caption" color="textSecondary">
                      Resim Ekle (Zorunlu)
                    </Typography>
                  </Box>
                )}
              </IconButton>
            </label>
          </Box>
          <TextField
            label="Ürün Adı"
            name="name"
            value={form.name}
            onChange={handleChange}
            fullWidth
            required
            margin="normal"
          />
          <TextField
            label="Açıklama"
            name="description"
            value={form.description}
            onChange={handleChange}
            fullWidth
            margin="normal"
          />
          <TextField
            label="Fiyat (₺)"
            name="price"
            type="number"
            value={form.price}
            onChange={handleChange}
            fullWidth
            required
            margin="normal"
            inputProps={{ min: 0 }}
          />
          <Box sx={{ mt: 2, mb: 1 }}>
            <TextField
              select
              label="Kategori"
              name="category"
              value={form.category}
              onChange={handleChange}
              fullWidth
              margin="normal"
              required
              disabled={loadingCategories || showNewCategoryInput}
              SelectProps={{
                
                renderValue: (selected) => selected || ''
              }}
            >
              {loadingCategories ? (
                <MenuItem disabled>Yükleniyor...</MenuItem>
              ) : (
                [
                  ...categories.map((cat) => (
                    <MenuItem key={cat.id || cat._id} value={cat.name}>
                      {cat.name}
                    </MenuItem>
                  )),
                  <MenuItem key="add-new" value="add-new" sx={{ color: 'primary.main', fontWeight: 'bold' }}
                    onClick={() => setShowNewCategoryInput(true)}
                  >
                    + Yeni Kategori Ekle
                  </MenuItem>
                ]
              )}
            </TextField>
            
            {showNewCategoryInput && (
              <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
                <TextField
                  fullWidth
                  size="small"
                  value={newCategory}
                  onChange={handleNewCategoryChange}
                  placeholder="Yeni kategori adı"
                  autoFocus
                />
                <Button 
                  variant="contained" 
                  onClick={handleAddNewCategory}
                  disabled={!newCategory.trim()}
                >
                  Ekle
                </Button>
                <Button 
                  variant="outlined" 
                  onClick={() => {
                    setShowNewCategoryInput(false);
                    setNewCategory('');
                  }}
                >
                  İptal
                </Button>
              </Box>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>İptal</Button>
          <Button type="submit" variant="contained">Kaydet</Button>
        </DialogActions>
      </form>
      <Snackbar open={error.open} autoHideDuration={6000} onClose={handleCloseError} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        <Alert onClose={handleCloseError} severity="error" sx={{ width: '100%' }}>{error.message}</Alert>
      </Snackbar>
    </Dialog>
  );
}

export default MenuItemFormDialog;