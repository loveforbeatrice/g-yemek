import React, { useState } from 'react';
import { 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions, 
  Button, 
  Typography, 
  Rating, 
  Box,
  Snackbar,
  Alert,
  TextField,
  Paper,
  Divider
} from '@mui/material';
import axios from 'axios';
import { useLanguage } from '../contexts/LanguageContext';
import StarIcon from '@mui/icons-material/Star';
import StarBorderIcon from '@mui/icons-material/StarBorder';

const RatingDialog = ({ open, handleClose, orderData }) => {
  const { t } = useLanguage();
  const [restaurantRating, setRestaurantRating] = useState(0);
  const [foodRating, setFoodRating] = useState(0);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  const handleSnackbarClose = () => {
    setSnackbar({...snackbar, open: false});
  };

  const handleSubmit = async () => {
    if (restaurantRating === 0 || foodRating === 0) {
      setSnackbar({
        open: true,
        message: t('Please provide ratings for both restaurant and food'),
        severity: 'error'
      });
      return;
    }

    if (!orderData?.orderId) {
      setSnackbar({
        open: true,
        message: t('Order information is missing'),
        severity: 'error'
      });
      return;
    }

    setLoading(true);    try {
      await axios.post('/api/ratings', {
        orderId: orderData.orderId,
        menuItemId: orderData.menuItemId, // Add menuItemId to the submission
        restaurantRating,
        foodRating,
        comment: comment.trim() || null
      }, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      setSnackbar({
        open: true,
        message: t('Thank you for your rating!'),
        severity: 'success'
      });
      
      setTimeout(() => {
        handleClose();
      }, 1000);
  } catch (error) {
    console.error('Error submitting rating:', error);
    console.error('Error response:', error.response?.data);
    setSnackbar({
      open: true,
      message: t('Failed to submit rating. Please try again.'),
      severity: 'error'
    });
  } finally {
    setLoading(false);
  }
  };

  // Reset values when dialog opens/closes
  React.useEffect(() => {
    if (open) {
      setRestaurantRating(0);
      setFoodRating(0);
      setComment('');
    }
  }, [open]);
  return (
    <>
      <Dialog 
        open={open} 
        onClose={handleClose} 
        maxWidth="sm" 
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: '20px',
            overflow: 'hidden'
          }
        }}
      >
        <DialogTitle 
          sx={{ 
            bgcolor: '#9d8df1', 
            color: 'white', 
            textAlign: 'center',
            py: 2,
            fontFamily: '"Alata", sans-serif',
            fontSize: '1.5rem',
            fontWeight: 'bold'
          }}
        >
          {t('Rate Your Order')}
        </DialogTitle>
        <DialogContent sx={{ p: 0 }}>
          <Box sx={{ p: 3 }}>
            {/* Restoran Derecelendirmesi */}
            <Paper 
              elevation={2} 
              sx={{ 
                p: 3, 
                mb: 3, 
                borderRadius: '15px',
                border: '1px solid #f0f0f0'
              }}
            >
              <Typography 
                variant="h6" 
                component="div" 
                sx={{ 
                  mb: 2, 
                  color: '#333',
                  fontFamily: '"Alata", sans-serif',
                  fontSize: '1.2rem',
                  fontWeight: 'bold'
                }}
              >
                {t('Restaurant')}: <span style={{ color: '#ff8800' }}>{orderData?.businessName || ''}</span>
              </Typography>
              
              <Divider sx={{ mb: 2 }} />
              
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <Typography 
                  component="legend" 
                  sx={{ 
                    mb: 1, 
                    fontWeight: 'bold',
                    color: '#666'
                  }}
                >
                  {t('Restaurant Rating')}:
                </Typography>
                <Rating
                  name="restaurant-rating"
                  value={restaurantRating}
                  onChange={(event, newValue) => {
                    setRestaurantRating(newValue);
                  }}
                  size="large"
                  precision={1} // Tam sayı değerler için
                  icon={<StarIcon fontSize="inherit" sx={{ color: '#ff8800' }} />}
                  emptyIcon={<StarBorderIcon fontSize="inherit" />}
                  sx={{ fontSize: '2.5rem' }}
                />
              </Box>
            </Paper>

            {/* Yemek Derecelendirmesi */}
            <Paper 
              elevation={2} 
              sx={{ 
                p: 3, 
                mb: 3, 
                borderRadius: '15px',
                border: '1px solid #f0f0f0'
              }}
            >
              <Typography 
                variant="h6" 
                component="div" 
                sx={{ 
                  mb: 2, 
                  color: '#333',
                  fontFamily: '"Alata", sans-serif',
                  fontSize: '1.2rem',
                  fontWeight: 'bold'
                }}
              >
                {t('Food')}: <span style={{ color: '#ff8800' }}>{orderData?.menuItemName || ''}</span>
              </Typography>
              
              <Divider sx={{ mb: 2 }} />
              
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <Typography 
                  component="legend" 
                  sx={{ 
                    mb: 1, 
                    fontWeight: 'bold',
                    color: '#666'
                  }}
                >
                  {t('Food Rating')}:
                </Typography>
                <Rating
                  name="food-rating"
                  value={foodRating}
                  onChange={(event, newValue) => {
                    setFoodRating(newValue);
                  }}
                  size="large"
                  precision={1} // Tam sayı değerler için
                  icon={<StarIcon fontSize="inherit" sx={{ color: '#ff8800' }} />}
                  emptyIcon={<StarBorderIcon fontSize="inherit" />}
                  sx={{ fontSize: '2.5rem' }}
                />
              </Box>
            </Paper>
            
            {/* Yorum Alanı */}
            <TextField
              fullWidth
              label={t('Comments (Optional)')}
              multiline
              rows={3}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              variant="outlined"
              margin="normal"
              inputProps={{ maxLength: 500 }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: '12px',
                  '&:hover fieldset': {
                    borderColor: '#9d8df1',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: '#ff8800',
                  },
                },
                '& .MuiInputLabel-root.Mui-focused': {
                  color: '#ff8800',
                }
              }}
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ justifyContent: 'center', p: 3, bgcolor: '#f9f9f9' }}>
          <Button 
            onClick={handleClose} 
            color="primary" 
            disabled={loading}
            sx={{ 
              borderRadius: '25px', 
              px: 3,
              color: '#9d8df1',
              border: '1px solid #9d8df1',
              '&:hover': {
                backgroundColor: '#f0f0f0',
              }
            }}
          >
            {t('Cancel')}
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={loading}
            sx={{ 
              borderRadius: '25px', 
              px: 3,
              backgroundColor: '#ff8800',
              color: 'white',
              '&:hover': {
                backgroundColor: '#e67a00',
              }
            }}
          >
            {t('Submit Rating')}
          </Button>
        </DialogActions>
      </Dialog>

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
    </>
  );
};

export default RatingDialog;
