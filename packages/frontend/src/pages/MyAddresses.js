import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Typography, 
  Box, 
  Card, 
  CardContent, 
  IconButton, 
  Button, 
  Grid,
  CircularProgress,
  Snackbar,
  Alert
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import axios from 'axios';
import AddressFormDialog from '../components/AddressFormDialog';
import { useNavigate } from 'react-router-dom';

function MyAddresses() {
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {    const fetchAddresses = async () => {
      try {
        // Gerçek API'den adresleri çek
        const user = JSON.parse(localStorage.getItem('user'));
        const userId = user?.id || user?._id || user?.userId || 'testuser';
        const response = await axios.get('http://localhost:3001/api/addresses', {
          params: { userId }
        });
        setAddresses(response.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching addresses:', error);
        setError('Could not load addresses. Please try again later.');
        setLoading(false);
        
        // Geliştirme sırasında örnek veriler kullanılabilir
        if (process.env.NODE_ENV === 'development') {
          setAddresses([
            {
              id: 1,
              name: 'Evim',
              address: 'Can Deniz Mahallesi, Alp Eren Sokak, Yusuf Berk Sitesi, Buket Apt. Gülbahçe'
            },
            {
              id: 2,
              name: 'Kütüphane',
              address: ''
            },
            {
              id: 3,
              name: 'Bilgisayar Mühendisliği',
              address: ''
            }
          ]);
        }
      }
    };

    fetchAddresses();
  }, []);
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [currentAddress, setCurrentAddress] = useState(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  const handleSnackbarClose = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const showMessage = (message, severity = 'success') => {
    setSnackbar({
      open: true,
      message,
      severity
    });
  };

  const handleEditAddress = (id) => {
    const addressToEdit = addresses.find(addr => addr.id === id);
    if (addressToEdit) {
      setCurrentAddress(addressToEdit);
      setOpenEditDialog(true);
    }
  };

  const handleAddAddress = () => {
    setOpenAddDialog(true);
  };

  const handleSaveNewAddress = async (formData) => {
    try {
      const user = JSON.parse(localStorage.getItem('user'));
      const userId = user?.id || user?._id || user?.userId || 'testuser';
      const response = await axios.post('http://localhost:3001/api/addresses', {
        ...formData,
        userId
      });
      
      setAddresses(prev => [response.data, ...prev]);
      showMessage('Adres başarıyla eklendi.');
    } catch (error) {
      console.error('Error adding address:', error);
      showMessage('Adres eklenirken bir hata oluştu.', 'error');
    }
  };

  const handleUpdateAddress = async (formData) => {
    if (!currentAddress) return;
    
    try {
      const response = await axios.put(`http://localhost:3001/api/addresses/${currentAddress.id}`, formData);
      
      setAddresses(prev => 
        prev.map(addr => addr.id === currentAddress.id ? response.data : addr)
      );
      showMessage('Adres başarıyla güncellendi.');
    } catch (error) {
      console.error('Error updating address:', error);
      showMessage('Adres güncellenirken bir hata oluştu.', 'error');
    }
  };

  const handleDeleteAddress = async (id) => {
    if (window.confirm('Bu adresi silmek istediğinizden emin misiniz?')) {
      try {
        await axios.delete(`http://localhost:3001/api/addresses/${id}`);
        setAddresses(prev => prev.filter(addr => addr.id !== id));
        showMessage('Adres başarıyla silindi.');
      } catch (error) {
        console.error('Error deleting address:', error);
        showMessage('Adres silinirken bir hata oluştu.', 'error');
      }
    }
  };
  return (
    <Container maxWidth="md" sx={{ mt: { xs: 2, sm: 4 }, mb: { xs: 2, sm: 4 }, px: { xs: 1, sm: 3 } }}>
      <Box sx={{ width: '100%', display: 'flex', alignItems: 'center', mb: { xs: 2, sm: 4 }, mt: { xs: 1, sm: 0 }, position: 'relative', justifyContent: 'center' }}>
        <IconButton onClick={() => navigate(-1)} sx={{ position: 'absolute', left: 0, top: '50%', transform: 'translateY(-50%)', display: { xs: 'flex', sm: 'none' } }}>
          <ArrowBackIosNewIcon sx={{ color: '#9d8df1' }} />
        </IconButton>
        <Typography
          variant="h3"
          component="h1"
          sx={{
            fontFamily: 'Alata, sans-serif',
            fontWeight: 'bold',
            fontSize: { xs: '2rem', sm: '2.5rem' },
            color: '#222',
            textAlign: 'center',
            width: '100%',
            mb: 0
          }}
        >
          MY ADDRESSES
        </Typography>
      </Box>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <CircularProgress sx={{ color: '#FFA500' }} />
        </Box>
      ) : error ? (
        <Box sx={{ textAlign: 'center', mt: 4, color: 'error.main' }}>
          <Typography>{error}</Typography>
        </Box>
      ) : addresses.length === 0 ? (
        <Box sx={{ textAlign: 'center', mt: 4 }}>
          <Typography>Henüz adres eklenmemiş. Yeni bir adres ekleyin.</Typography>
        </Box>
      ) : (
        <Box sx={{ mb: 2 }}>
          {addresses.map((address) => (
            <Card 
              key={address.id} 
              sx={{ 
                mb: 2, 
                borderRadius: 2, 
                border: '2px solid #FFA500',
                boxShadow: 'none'
              }}
            >
              <CardContent>
                <Grid container alignItems="center">
                  <Grid item xs={10}>
                    <Typography variant="h6" component="div" sx={{ fontWeight: 'bold' }}>
                      {address.name}
                    </Typography>
                    {address.address && (
                      <Typography variant="body1" color="text.secondary">
                        {address.address}
                      </Typography>
                    )}
                  </Grid>
                  <Grid item xs={2} sx={{ textAlign: 'right' }}>
                    <IconButton 
                      onClick={() => handleEditAddress(address.id)}
                      sx={{ color: '#FFA500' }}
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton 
                      onClick={() => handleDeleteAddress(address.id)}
                      sx={{ color: '#FF6347' }}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          ))}
        </Box>
      )}

      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
        <IconButton 
          onClick={handleAddAddress}
          sx={{ 
            borderRadius: 2,
            backgroundColor: 'white',
            color: '#FFA500',
            width: '48px',
            height: '48px',
            boxShadow: '0 2px 6px rgba(255, 165, 0, 0.3)',
            border: '2px solid #FFA500',
            '&:hover': {
              backgroundColor: 'rgba(255, 165, 0, 0.1)',
              boxShadow: '0 4px 8px rgba(255, 165, 0, 0.4)'
            }
          }}
        >
          <AddIcon sx={{ fontSize: 28 }} />
        </IconButton>
      </Box>
      
      {/* Adres Ekleme Diyaloğu */}
      <AddressFormDialog 
        open={openAddDialog}
        handleClose={() => setOpenAddDialog(false)}
        handleSave={handleSaveNewAddress}
        title="Yeni Adres Ekle"
      />
      
      {/* Adres Düzenleme Diyaloğu */}
      <AddressFormDialog 
        open={openEditDialog}
        handleClose={() => setOpenEditDialog(false)}
        address={currentAddress}
        handleSave={handleUpdateAddress}
        title="Adresi Düzenle"
      />
      
      {/* Bildirim Snackbar */}
      <Snackbar 
        open={snackbar.open} 
        autoHideDuration={6000} 
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={handleSnackbarClose} 
          severity={snackbar.severity} 
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
}

export default MyAddresses;
