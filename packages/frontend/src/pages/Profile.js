import React, { useEffect, useState } from 'react';
import {
  Typography,
  Box,
  Button,
  TextField,
  Divider,
  Alert,
  IconButton,
  Stack,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Paper
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import CloseIcon from '@mui/icons-material/Close';
import CheckIcon from '@mui/icons-material/Check';
import DeleteIcon from '@mui/icons-material/Delete';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';

axios.defaults.baseURL = 'http://localhost:3001';

function Profile() {
  const { t } = useLanguage();
  const [user, setUser] = useState({ name: '', email: '', phone: '' });
  const [editField, setEditField] = useState(null); // 'name', 'email', 'phone' veya null
  const [editValue, setEditValue] = useState('');
  const [loading, setLoading] = useState(true);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [pwError, setPwError] = useState('');
  const [pwSuccess, setPwSuccess] = useState('');
  const [pwLoading, setPwLoading] = useState(false);
  const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [deleteDialog, setDeleteDialog] = useState(false);
  const [deleteError, setDeleteError] = useState('');
  const [deleteSuccess, setDeleteSuccess] = useState('');

  // Token'ı localStorage'dan al
  const token = localStorage.getItem('token');

  const navigate = useNavigate();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        setLoading(true);
        const res = await axios.get('/api/auth/me', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setUser(res.data.user);
      } catch (err) {
        setErrorMsg(t('userInfoNotLoaded'));
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
    // eslint-disable-next-line
  }, []);

  // Inline edit işlemleri
  const handleEditClick = (field) => {
    setEditField(field);
    setEditValue(user[field] || '');
    setSuccessMsg('');
    setErrorMsg('');
  };
  const handleEditChange = (e) => setEditValue(e.target.value);
  const handleEditCancel = () => {
    setEditField(null);
    setEditValue('');
  };
  const handleEditSave = async () => {
    setSuccessMsg('');
    setErrorMsg('');
    try {
      const res = await axios.put('/api/auth/updatedetails', { [editField]: editValue }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUser(res.data.user);
      setSuccessMsg(t('profileUpdated'));
      setEditField(null);
      setEditValue('');
    } catch (err) {
      setErrorMsg(err.response?.data?.message || t('updateFailed'));
    }
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
      await axios.put('/api/auth/updatepassword', pwForm, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPwSuccess(t('passwordUpdated'));
      setPwForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      setPwError(err.response?.data?.message || t('passwordChangeFailed'));
    } finally {
      setPwLoading(false);
    }
  };

  // Hesap silme işlemleri
  const handleDeleteAccount = async () => {
    setDeleteError('');
    setDeleteSuccess('');
    try {
      await axios.delete('/api/auth/delete', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setDeleteSuccess(t('accountDeleted'));
      setTimeout(() => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }, 2000);
    } catch (err) {
      setDeleteError(err.response?.data?.message || t('deleteAccountFailed'));
    }
  };

  if (loading) return <Box sx={{ p: 6, textAlign: 'center' }}>{t('loading')}</Box>;

  return (
    <Box sx={{ width: '100%', maxWidth: 500, mx: 'auto', px: { xs: 1, sm: 2 }, pt: { xs: 2, sm: 4 }, pb: { xs: 3, sm: 6 } }}>
      <Box sx={{ width: '100%', display: 'flex', alignItems: 'center', mb: { xs: 2, sm: 5 }, mt: { xs: 1, sm: 0 }, position: 'relative' }}>
        <IconButton onClick={() => navigate(-1)} sx={{ position: 'absolute', left: 0, top: '50%', transform: 'translateY(-50%)', display: { xs: 'flex', sm: 'none' } }}>
          <ArrowBackIosNewIcon sx={{ color: '#9d8df1' }} />
        </IconButton>
        <Typography
          variant="h2"
          sx={{
            fontFamily: 'Alata, sans-serif',
            fontWeight: 700,
            fontSize: { xs: '2rem', sm: '2.5rem' },
            color: '#222',
            textAlign: 'center',
            width: '100%',
            mb: 0
          }}
        >
          {t('accountDetails')}
        </Typography>
      </Box>

      {successMsg && <Alert severity="success" sx={{ mb: 2 }}>{successMsg}</Alert>}
      {errorMsg && <Alert severity="error" sx={{ mb: 2 }}>{errorMsg}</Alert>}

      {/* Kişisel Bilgiler Widget */}
      <Paper elevation={2} sx={{ bgcolor: '#fff', p: 3, mb: 4, border: '1px solid #ff8800' }}>
        <Stack spacing={3}>
          {/* Name */}
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Typography sx={{ minWidth: 90, fontWeight: 500 }}>{t('fullName')}:</Typography>
            {editField === 'name' ? (
              <>
                <TextField size="small" value={editValue} onChange={handleEditChange} autoFocus />
                <IconButton color="success" onClick={handleEditSave}><CheckIcon /></IconButton>
                <IconButton color="error" onClick={handleEditCancel}><CloseIcon /></IconButton>
              </>
            ) : (
              <>
                <Typography sx={{ flex: 1 }}>{user.name}</Typography>
                <IconButton onClick={() => handleEditClick('name')}><EditIcon /></IconButton>
              </>
            )}
          </Box>
          <Divider sx={{ my: 0.5, borderColor: '#e0e0e0' }} />
          {/* Phone */}
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Typography sx={{ minWidth: 90, fontWeight: 500 }}>{t('phone')}:</Typography>
            {editField === 'phone' ? (
              <>
                <TextField size="small" value={editValue} onChange={handleEditChange} autoFocus />
                <IconButton color="success" onClick={handleEditSave}><CheckIcon /></IconButton>
                <IconButton color="error" onClick={handleEditCancel}><CloseIcon /></IconButton>
              </>
            ) : (
              <>
                <Typography sx={{ flex: 1 }}>{user.phone}</Typography>
                <IconButton onClick={() => handleEditClick('phone')}><EditIcon /></IconButton>
              </>
            )}
          </Box>
        </Stack>
      </Paper>

      {/* Şifre Değiştir Widget */}
      <Paper elevation={2} sx={{ bgcolor: '#fff', p: 3, mb: 4, border: '1px solid #ff8800' }}>
        <Typography variant="h5" fontWeight="bold" sx={{ mb: 2, fontFamily: 'Alata, sans-serif' }}>
          {t('changePassword')}
        </Typography>
        {pwSuccess && <Alert severity="success" sx={{ mb: 2 }}>{pwSuccess}</Alert>}
        {pwError && <Alert severity="error" sx={{ mb: 2 }}>{pwError}</Alert>}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <TextField
            label={t('currentPassword')}
            name="currentPassword"
            type="password"
            value={pwForm.currentPassword}
            onChange={handlePwInput}
            fullWidth
          />
          <TextField
            label={t('newPassword')}
            name="newPassword"
            type="password"
            value={pwForm.newPassword}
            onChange={handlePwInput}
            fullWidth
          />
          <TextField
            label={t('confirmNewPassword')}
            name="confirmPassword"
            type="password"
            value={pwForm.confirmPassword}
            onChange={handlePwInput}
            fullWidth
          />
          <Button
            variant="contained"
            sx={{ bgcolor: '#ff8800', '&:hover': { bgcolor: '#ff6600' }, fontWeight: 'bold', fontSize: '1.1rem', borderRadius: 2 }}
            onClick={handleChangePassword}
            disabled={pwLoading}
          >
            {pwLoading ? t('changing') : t('changePassword')}
          </Button>
        </Box>
      </Paper>

      {/* Hesap silme alanı */}
      <Divider sx={{ my: 3 }} />
      <Box sx={{ textAlign: 'center' }}>
        <Button
          variant="outlined"
          color="error"
          startIcon={<DeleteIcon />}
          onClick={() => setDeleteDialog(true)}
        >
          {t('deleteAccount')}
        </Button>
        <Dialog open={deleteDialog} onClose={() => setDeleteDialog(false)}>          <DialogTitle>{t('deleteAccountTitle')}</DialogTitle>
          <DialogContent>
            <Typography>{t('deleteAccountWarning')}</Typography>
            {deleteError && <Alert severity="error" sx={{ mt: 2 }}>{deleteError}</Alert>}
            {deleteSuccess && <Alert severity="success" sx={{ mt: 2 }}>{deleteSuccess}</Alert>}
          </DialogContent>
          <DialogActions>            <Button onClick={() => setDeleteDialog(false)}>{t('cancel')}</Button>
            <Button color="error" onClick={handleDeleteAccount}>{t('confirmDelete')}</Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Box>
  );
}

export default Profile;
