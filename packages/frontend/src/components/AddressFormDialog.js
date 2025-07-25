import React, { useState, useEffect } from 'react';
import { 
  Dialog, 
  DialogActions, 
  DialogContent, 
  DialogTitle, 
  TextField, 
  Button 
} from '@mui/material';
import { useLanguage } from '../contexts/LanguageContext';

function AddressFormDialog({ open, handleClose, address, handleSave, title }) {
  const [formData, setFormData] = useState({
    name: '',
    address: ''
  });
  const { t } = useLanguage();

  // address prop'u değiştiğinde form verilerini güncelle
  useEffect(() => {
    if (address) {
      setFormData({
        name: address.name || '',
        address: address.address || ''
      });
    } else {
      setFormData({
        name: '',
        address: ''
      });
    }
  }, [address]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = () => {
    handleSave(formData);
    setFormData({ name: '', address: '' });
    handleClose();
  };

  return (
    <Dialog 
      open={open} 
      onClose={handleClose}
      PaperProps={{
        style: {
          borderRadius: 8,
          padding: 8
        }
      }}
    >
      <DialogTitle sx={{ color: '#FFA500', fontWeight: 'bold' }}>{title}</DialogTitle>
      <DialogContent>
        <TextField
          autoFocus
          margin="dense"
          name="name"          label={t('addressForm.nameLabel')}
          type="text"
          fullWidth
          variant="outlined"
          value={formData.name}
          onChange={handleChange}
          required
          sx={{ mb: 2 }}
        />
        <TextField
          margin="dense"
          name="address"
          label={t('addressForm.detailLabel')}
          type="text"
          fullWidth
          multiline
          rows={4}
          variant="outlined"
          value={formData.address}
          onChange={handleChange}
        />
      </DialogContent>
      <DialogActions>        <Button onClick={handleClose} sx={{ color: 'gray' }}>
          {t('addressForm.cancel')}
        </Button>
        <Button 
          onClick={handleSubmit} 
          sx={{ 
            bgcolor: '#FFA500', 
            color: 'white',
            '&:hover': {
              bgcolor: '#FF8C00',
            }
          }}
        >
          {t('addressForm.save')}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default AddressFormDialog;
