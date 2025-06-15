import React, { useState } from 'react';
import { IconButton, Typography } from '@mui/material';
import { RemoveIcon, AddIcon } from '../icons';
import { useTranslation } from 'react-i18next';

const Cart = () => {
  const { t } = useTranslation();
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const handleRemoveFromCart = (item) => {
    removeFromCart(item);
    setSnackbar({ 
      open: true, 
      message: t('removedFromCart'), 
      severity: 'success' 
    });
  };

  const handleUpdateQuantity = (item, newQuantity) => {
    if (newQuantity < 0) return; // Negatif miktara izin verme
    updateQuantity(item, newQuantity);
  };

  return (
    <div>
      {/* Miktar güncelleme butonlarını güncelle */}
      <IconButton 
        onClick={() => handleUpdateQuantity(item, item.quantity - 1)}
        disabled={item.quantity <= 0}
        sx={{ color: '#ff8800' }}
      >
        <RemoveIcon />
      </IconButton>
      <Typography sx={{ mx: 1 }}>{item.quantity}</Typography>
      <IconButton 
        onClick={() => handleUpdateQuantity(item, item.quantity + 1)}
        sx={{ color: '#ff8800' }}
      >
        <AddIcon />
      </IconButton>
    </div>
  );
};

export default Cart; 