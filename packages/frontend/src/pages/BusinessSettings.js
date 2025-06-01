import React, { useState, useEffect } from 'react';
import {
  Typography,
  Box,
  TextField,
  Button,
  Grid,
  Card,
  CardContent,
  Snackbar,
  Alert,
  Switch,
  FormControlLabel,
  CircularProgress,
  CardMedia,
  IconButton
} from '@mui/material';
import ResponsivePageTitle from '../components/ResponsivePageTitle';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider, TimePicker } from '@mui/x-date-pickers';
import axios from 'axios';
import BusinessLayout from '../components/BusinessLayout';
import ImageCropDialog from '../components/ImageCropDialog';
import PhotoCamera from '@mui/icons-material/PhotoCamera';
import { format, parse } from 'date-fns';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import DeleteIcon from '@mui/icons-material/Delete';
import Paper from '@mui/material/Paper';

function BusinessSettings() {  const [businessData, setBusinessData] = useState({
    name: '',
    openingTime: '09:00',
    closingTime: '22:00',
    imageUrl: ''
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });
  const [openingTimeDate, setOpeningTimeDate] = useState(null);
  const [closingTimeDate, setClosingTimeDate] = useState(null);
  
  // Image crop dialog states
  const [cropDialogOpen, setCropDialogOpen] = useState(false);
  const [selectedImageUrl, setSelectedImageUrl] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);

  // Şifre değiştirme işlemleri
  const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [pwLoading, setPwLoading] = useState(false);
  const [pwError, setPwError] = useState('');
  const [pwSuccess, setPwSuccess] = useState('');
  const [deleteDialog, setDeleteDialog] = useState(false);
  const [deleteError, setDeleteError] = useState('');
  const [deleteSuccess, setDeleteSuccess] = useState('');

  // Fetch business settings
  useEffect(() => {
    const fetchBusinessSettings = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('http://localhost:3001/api/business/settings', {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        const { business } = response.data;        setBusinessData({
          name: business.name || '',
          openingTime: business.openingTime || '09:00',
          closingTime: business.closingTime || '22:00',
          imageUrl: business.imageUrl || ''
        });
        
        // Convert time strings to Date objects for TimePicker
        if (business.openingTime) {
          setOpeningTimeDate(parse(business.openingTime, 'HH:mm', new Date()));
        }
        
        if (business.closingTime) {
          setClosingTimeDate(parse(business.closingTime, 'HH:mm', new Date()));
        }
        
        setError(null);
      } catch (err) {
        console.error('Error fetching business settings:', err);
        setError('İşletme ayarları yüklenemedi. Lütfen daha sonra tekrar deneyin.');
      } finally {
        setLoading(false);
      }
    };

    fetchBusinessSettings();
  }, []);
  // Handle text field changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setBusinessData(prev => ({ ...prev, [name]: value }));
  };

  // Handle opening time changes
  const handleOpeningTimeChange = (newValue) => {
    setOpeningTimeDate(newValue);
    if (newValue) {
      const timeString = format(newValue, 'HH:mm');
      setBusinessData(prev => ({ ...prev, openingTime: timeString }));
    }
  };

  // Handle closing time changes
  const handleClosingTimeChange = (newValue) => {
    setClosingTimeDate(newValue);
    if (newValue) {
      const timeString = format(newValue, 'HH:mm');
      setBusinessData(prev => ({ ...prev, closingTime: timeString }));
    }
  };
  // Save business settings
  const handleSaveSettings = async () => {
    try {
      setSaving(true);
      const token = localStorage.getItem('token');
      
      await axios.put('http://localhost:3001/api/business/settings', 
        {
          name: businessData.name,
          openingTime: businessData.openingTime,
          closingTime: businessData.closingTime
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      
      setSnackbar({
        open: true,
        message: 'İşletme ayarları başarıyla güncellendi',
        severity: 'success'
      });
    } catch (err) {
      console.error('Error saving business settings:', err);
      setSnackbar({
        open: true,
        message: 'İşletme ayarları güncellenirken bir hata oluştu',
        severity: 'error'
      });
    } finally {
      setSaving(false);
    }
  };
  // Handle image upload
  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg'];
    if (!allowedTypes.includes(file.type)) {
      setSnackbar({
        open: true,
        message: 'Geçersiz dosya formatı. Lütfen sadece JPG veya PNG yükleyin',
        severity: 'error'
      });
      return;
    }

    // Create preview URL for cropping
    const imageUrl = URL.createObjectURL(file);
    setSelectedImageUrl(imageUrl);
    setSelectedFile(file);
    setCropDialogOpen(true);
  };

  // Handle cropped image upload
  const handleCroppedImageUpload = async (croppedFile) => {
    try {
      setUploading(true);
      const formData = new FormData();
      formData.append('image', croppedFile);
      
      const token = localStorage.getItem('token');
      
      const response = await axios.post(
        'http://localhost:3001/api/business/upload-image',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            Authorization: `Bearer ${token}`
          }
        }
      );
      
      // Update the image URL in the state
      setBusinessData(prev => ({
        ...prev,
        imageUrl: response.data.imageUrl
      }));
      
      setSnackbar({
        open: true,
        message: 'İşletme resmi başarıyla güncellendi',
        severity: 'success'
      });
    } catch (err) {
      console.error('Error uploading image:', err);
      setSnackbar({
        open: true,
        message: 'Resim yüklenirken bir hata oluştu',
        severity: 'error'
      });
    } finally {
      setUploading(false);
      // Clean up
      if (selectedImageUrl) {
        URL.revokeObjectURL(selectedImageUrl);
      }
      setSelectedImageUrl(null);
      setSelectedFile(null);
    }
  };

  // Handle crop dialog close
  const handleCropDialogClose = () => {
    setCropDialogOpen(false);
    if (selectedImageUrl) {
      URL.revokeObjectURL(selectedImageUrl);
    }
    setSelectedImageUrl(null);
    setSelectedFile(null);
  };

  // Handle snackbar close
  const handleSnackbarClose = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  // Şifre değiştirme işlemleri
  const handlePwInput = (e) => {
    setPwForm({ ...pwForm, [e.target.name]: e.target.value });
  };
  const handleChangePassword = async () => {
    setPwError('');
    setPwSuccess('');
    setPwLoading(true);
    try {
      const token = localStorage.getItem('token');
      await axios.put('/api/auth/updatepassword', pwForm, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPwSuccess('Şifre başarıyla değiştirildi.');
      setPwForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      setPwError(err.response?.data?.message || 'Şifre değiştirilemedi.');
    } finally {
      setPwLoading(false);
    }
  };

  // Hesap silme işlemleri
  const handleDeleteAccount = async () => {
    setDeleteError('');
    setDeleteSuccess('');
    try {
      const token = localStorage.getItem('token');
      await axios.delete('/api/auth/delete', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setDeleteSuccess('Hesabınız silindi. Oturum kapatılıyor...');
      setTimeout(() => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }, 2000);
    } catch (err) {
      setDeleteError(err.response?.data?.message || 'Hesap silinemedi.');
    }
  };

  return (
    <BusinessLayout>
      <Box sx={{ maxWidth: 800, mx: 'auto', px: 2 }}>
        <ResponsivePageTitle sx={{ color: '#333' }}>
          İŞLETME AYARLARI
        </ResponsivePageTitle>
        
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <Grid container spacing={3}>
            {/* Restaurant Image */}
            <Grid item xs={12}>
              <Card sx={{ mb: 3, borderRadius: 2, overflow: 'hidden', border: '2px solid #80cbc4' }}>
                <CardContent>
                  <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold', color: '#333' }}>
                    İşletme Fotoğrafı
                  </Typography>
                  
                  <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, alignItems: 'center', gap: 2 }}>
                    <Box 
                      sx={{ 
                        width: { xs: '100%', sm: 200 }, 
                        height: 200, 
                        backgroundColor: '#eee', 
                        borderRadius: 1,
                        overflow: 'hidden',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        border: '1px solid #ddd'
                      }}
                    >
                      {businessData.imageUrl ? (
                        <CardMedia
                          component="img"
                          image={`http://localhost:3001/uploads/${businessData.imageUrl}`}
                          alt="Restaurant"
                          sx={{ 
                            height: '100%', 
                            width: '100%', 
                            objectFit: 'cover' 
                          }}
                        />
                      ) : (
                        <Typography color="text.secondary">
                          Resim Yok
                        </Typography>
                      )}
                    </Box>
                    
                    <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', gap: 1 }}>
                      <Typography variant="body1">
                        Restoranınız için bir görsel yükleyin. Müşterileriniz bu görseli restoranlar sayfasında görecektir.
                      </Typography>
                      
                      <Box sx={{ display: 'flex', alignItems: 'center', mt: 2, justifyContent: { xs: 'center', sm: 'flex-start' } }}>
                        <input
                          accept="image/*"
                          style={{ display: 'none' }}
                          id="image-upload-button"
                          type="file"
                          onChange={handleImageUpload}
                        />
                        <label htmlFor="image-upload-button">
                          <Button
                            variant="contained"
                            component="span"
                            startIcon={<PhotoCamera />}
                            disabled={uploading}
                            sx={{ backgroundColor: '#ff8800', '&:hover': { backgroundColor: '#ff7700' } }}
                          >
                            {uploading ? 'Yükleniyor...' : 'Fotoğraf Yükle'}
                          </Button>
                        </label>
                      </Box>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            
            {/* Business Info */}
            <Grid item xs={12}>
              <Card sx={{ mb: 3, borderRadius: 2, border: '2px solid #80cbc4' }}>
                <CardContent>
                  <Typography variant="h6" sx={{ mb: 3, fontWeight: 'bold', color: '#333' }}>
                    İşletme Bilgileri
                  </Typography>
                    <TextField
                    fullWidth
                    label="İşletme Adı"
                    name="name"
                    value={businessData.name}
                    onChange={handleInputChange}
                    sx={{ mb: 3 }}
                  />
                </CardContent>
              </Card>
            </Grid>
            
            {/* Business Hours */}
            <Grid item xs={12}>
              <Card sx={{ borderRadius: 2, border: '2px solid #80cbc4' }}>
                <CardContent>
                  <Typography variant="h6" sx={{ mb: 3, fontWeight: 'bold', color: '#333' }}>
                    Çalışma Saatleri
                  </Typography>
                    <LocalizationProvider dateAdapter={AdapterDateFns}>
                    <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 2, mb: 3 }}>
                      <TimePicker
                        label="Açılış Saati"
                        value={openingTimeDate}
                        onChange={handleOpeningTimeChange}
                        ampm={false}
                        renderInput={(params) => <TextField {...params} fullWidth />}
                      />
                      
                      <TimePicker
                        label="Kapanış Saati"
                        value={closingTimeDate}
                        onChange={handleClosingTimeChange}
                        ampm={false}
                        renderInput={(params) => <TextField {...params} fullWidth />}
                      />
                    </Box>
                  </LocalizationProvider>
                </CardContent>
              </Card>
            </Grid>
            
            {/* Save Button */}
            <Grid item xs={12} sx={{ mt: 2, display: 'flex', justifyContent: 'center' }}>
              <Button
                variant="contained"
                color="primary"
                size="large"
                disabled={saving}
                onClick={handleSaveSettings}
                sx={{ 
                  minWidth: 200, 
                  backgroundColor: '#ff8800', 
                  '&:hover': { backgroundColor: '#ff7700' } 
                }}
              >
                {saving ? <CircularProgress size={24} /> : 'KAYDET'}
              </Button>
            </Grid>
          </Grid>
        )}
          <Snackbar
          open={snackbar.open}
          autoHideDuration={6000}
          onClose={handleSnackbarClose}
        >
          <Alert onClose={handleSnackbarClose} severity={snackbar.severity}>
            {snackbar.message}
          </Alert>
        </Snackbar>

        {/* Image Crop Dialog */}
        <ImageCropDialog
          open={cropDialogOpen}
          onClose={handleCropDialogClose}
          onCropComplete={handleCroppedImageUpload}
          imageUrl={selectedImageUrl}
          aspectRatio={16 / 9} // Restaurant kartları için ideal oran
        />

        <Box sx={{ mt: 6, display: 'flex', justifyContent: 'center' }}>
          <Paper elevation={2} sx={{ p: 4, maxWidth: 360, width: '100%', bgcolor: '#fff8f0', borderRadius: 3 }}>
            <Typography variant="h6" fontWeight="bold" sx={{ mb: 2, fontFamily: 'Alata, sans-serif', textAlign: 'center', color: '#222' }}>
              Change Password
            </Typography>
            {pwSuccess && <Alert severity="success" sx={{ mb: 2 }}>{pwSuccess}</Alert>}
            {pwError && <Alert severity="error" sx={{ mb: 2 }}>{pwError}</Alert>}
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mb: 2 }}>
              <TextField
                label="Current Password"
                name="currentPassword"
                type="password"
                value={pwForm.currentPassword}
                onChange={handlePwInput}
                fullWidth
                size="small"
              />
              <TextField
                label="New Password"
                name="newPassword"
                type="password"
                value={pwForm.newPassword}
                onChange={handlePwInput}
                fullWidth
                size="small"
              />
              <TextField
                label="Confirm New Password"
                name="confirmPassword"
                type="password"
                value={pwForm.confirmPassword}
                onChange={handlePwInput}
                fullWidth
                size="small"
              />
              <Button
                variant="contained"
                sx={{ bgcolor: '#ff8800', '&:hover': { bgcolor: '#ff6600' }, fontWeight: 'bold', fontSize: '1.1rem', borderRadius: 2, mt: 1 }}
                onClick={handleChangePassword}
                disabled={pwLoading}
                fullWidth
              >
                {pwLoading ? 'Changing...' : 'Change Password'}
              </Button>
            </Box>
          </Paper>
        </Box>
        <Box sx={{ textAlign: 'center', mt: 4 }}>
          <Button
            variant="outlined"
            color="error"
            startIcon={<DeleteIcon />}
            onClick={() => setDeleteDialog(true)}
          >
            Delete Account
          </Button>
          <Dialog open={deleteDialog} onClose={() => setDeleteDialog(false)}>
            <DialogTitle>Hesabı Sil</DialogTitle>
            <DialogContent>
              <Typography>Hesabınızı silmek istediğinize emin misiniz? Bu işlem geri alınamaz.</Typography>
              {deleteError && <Alert severity="error" sx={{ mt: 2 }}>{deleteError}</Alert>}
              {deleteSuccess && <Alert severity="success" sx={{ mt: 2 }}>{deleteSuccess}</Alert>}
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setDeleteDialog(false)}>İptal</Button>
              <Button color="error" onClick={handleDeleteAccount}>Evet, Sil</Button>
            </DialogActions>
          </Dialog>
        </Box>
      </Box>
    </BusinessLayout>
  );
}

export default BusinessSettings;
