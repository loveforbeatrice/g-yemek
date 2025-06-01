import React from 'react';
import { Container, Typography, Box, Grid, Card, CardContent, CardMedia, IconButton, Button, Divider, TextField, Paper, Radio, Alert, MenuItem, Select, FormControl, InputLabel, Snackbar, Dialog, Modal, Backdrop, Fade } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import FavoriteIcon from '@mui/icons-material/Favorite';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function Basket({ cartItems, addToCart, removeFromCart, resetCart }) {
  const navigate = useNavigate();
  const [orderNote, setOrderNote] = React.useState('');
  const [addresses, setAddresses] = React.useState([]);
  const [selectedAddressId, setSelectedAddressId] = React.useState('');
  const [addressError, setAddressError] = React.useState('');
  const [snackbar, setSnackbar] = React.useState({ open: false, message: '', severity: 'success' });
  const [successModal, setSuccessModal] = React.useState(false);

  React.useEffect(() => {
    const fetchAddresses = async () => {
      try {
        const user = JSON.parse(localStorage.getItem('user'));
        const userId = user?.id || user?._id || user?.userId || 'testuser';
        const response = await axios.get('http://localhost:3001/api/addresses', {
          params: { userId }
        });
        setAddresses(response.data);
        if (response.data.length > 0) {
          setSelectedAddressId(response.data[0].id);
        }
      } catch (error) {
        setAddresses([]);
      }
    };
    fetchAddresses();
  }, []);

  const calculateTotal = () => {
    return cartItems.reduce((total, item) => total + Number(item.price) * item.quantity, 0);
  };

  const handleOrderNoteChange = (event) => {
    setOrderNote(event.target.value);
  };

  const handleAddressSelect = (event) => {
    setSelectedAddressId(event.target.value);
    setAddressError('');
  };

  const handlePlaceOrder = async () => {
    if (!selectedAddressId) {
      setAddressError('Please select a delivery address.');
      return;
    }
    if (!cartItems || cartItems.length === 0) return;
    const user = JSON.parse(localStorage.getItem('user'));
    const userId = user?.id || user?._id || user?.userId || 'testuser';
    const addressObj = addresses.find(a => a.id === selectedAddressId);
    const addressText = addressObj ? (addressObj.name + (addressObj.address ? (': ' + addressObj.address) : '')) : '';
    // For each product: businessId, productId, quantity, note
    const orders = cartItems.map(item => ({
      businessId: item.businessId || item.business_id || item.businessID || 1, // fallback
      productId: item.id,
      quantity: item.quantity,
      note: orderNote
    }));
    try {
      await axios.post('http://localhost:3001/api/orders', {
        userId,
        orders,
        address: addressText
      });
      setSuccessModal(true);
      resetCart && resetCart();
      setAddressError('');
      
      // Otomatik olarak 3 saniye sonra ana sayfaya yönlendir
      setTimeout(() => {
        setSuccessModal(false);
        navigate('/menu');
      }, 3000);
    } catch (err) {
      setSnackbar({ open: true, message: 'Failed to place your order!', severity: 'error' });
    }
  };

  return (
    <Container maxWidth="md">
      <Typography variant="h4" component="h1" align="center" gutterBottom fontWeight="bold" sx={{ fontFamily: '"Alata", sans-serif', letterSpacing: '0.5px' }}>
        My Cart
      </Typography>

      {(!cartItems || cartItems.length === 0) ? (
        <Box sx={{ textAlign: 'center', mt: 4 }}>
          <Typography variant="h6" color="text.secondary" sx={{ fontFamily: '"Alata", sans-serif', fontSize: '1.2rem' }}>
            Your cart is empty
          </Typography>
          <Button
            variant="contained"
            sx={{ 
              mt: 2, 
              bgcolor: '#ff8800', 
              color: 'white',
              fontWeight: 'bold',
              borderRadius: '12px',
              py: 1.2,
              px: 3,
              fontSize: '1rem',
              '&:hover': { bgcolor: '#e67a00' } 
            }}
            component="a"
            href="/restaurants"
          >
            Start Shopping
          </Button>
        </Box>
      ) : (
        <>
          <Grid container spacing={3}>
            <Grid item xs={12} md={8}>
              {cartItems.map((item) => (
                <Card key={item.id} sx={{ display: 'flex', mb: 2, borderRadius: 3, border: '1px solid #ff8800', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
                  <CardMedia
                    component="img"
                    sx={{ width: 100, height: 100, objectFit: 'cover' }}
                    image={item.imageUrl || '/images/food-bg.jpg'}
                    alt={item.productName}
                  />
                  <CardContent sx={{ flex: '1 0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                    <Box>
                      <Typography component="div" variant="h6" sx={{ fontFamily: '"Alata", sans-serif', fontWeight: 'bold' }}>
                        {item.productName}
                      </Typography>
                      <Typography variant="subtitle1" color="text.secondary" component="div" sx={{ fontFamily: '"Alata", sans-serif' }}>
                        ₺ {Number(item.price).toFixed(2)}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <IconButton size="small" onClick={() => removeFromCart(item.id)}>
                        <RemoveIcon />
                      </IconButton>
                      <Typography sx={{ mx: 1 }}>{item.quantity}</Typography>
                      <IconButton size="small" onClick={() => addToCart(item)}>
                        <AddIcon />
                      </IconButton>
                    </Box>
                  </CardContent>
                </Card>
              ))}
            </Grid>
            <Grid item xs={12} md={4}>
              <Card sx={{ borderRadius: 3, border: '1px solid #ff8800', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom sx={{ fontFamily: '"Alata", sans-serif', fontWeight: 'bold', color: '#333' }}>
                    Order Summary
                  </Typography>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography sx={{ fontFamily: '"Alata", sans-serif' }}>Subtotal</Typography>
                    <Typography sx={{ fontFamily: '"Alata", sans-serif' }}>₺ {Number(calculateTotal()).toFixed(2)}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography sx={{ fontFamily: '"Alata", sans-serif' }}>Delivery Fee</Typography>
                    <Typography sx={{ fontFamily: '"Alata", sans-serif' }}>₺ 10.00</Typography>
                  </Box>
                  <Divider sx={{ my: 1 }} />
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="h6" sx={{ fontFamily: '"Alata", sans-serif', fontWeight: 'bold' }}>Total</Typography>
                    <Typography variant="h6" sx={{ fontFamily: '"Alata", sans-serif', fontWeight: 'bold', color: '#ff8800' }}>₺ {Number(calculateTotal() + 10).toFixed(2)}</Typography>
                  </Box>
                  <Button
                    variant="contained"
                    fullWidth
                    sx={{ 
                      mt: 2, 
                      bgcolor: '#ff8800', 
                      color: 'white',
                      fontWeight: 'bold',
                      borderRadius: '12px',
                      py: 1.2,
                      fontSize: '1rem',
                      letterSpacing: '1px',
                      boxShadow: '0 2px 4px rgba(255, 136, 0, 0.3)',
                      '&:hover': { 
                        bgcolor: '#e67a00',
                        boxShadow: '0 4px 8px rgba(255, 136, 0, 0.4)'
                      } 
                    }}
                    onClick={handlePlaceOrder}
                  >
                    PLACE ORDER
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
          {/* Order Notes Section */}
          <Paper elevation={2} sx={{ 
            p: 3, 
            mt: 3,
            borderRadius: '16px',
            border: '1px solid #ff8800'
          }}>
            <Typography variant="h6" sx={{ 
              mb: 2, 
              fontWeight: 'bold',
              color: '#333',
              fontFamily: '"Alata", sans-serif'
            }}>
              Order Notes
            </Typography>
            <TextField
              fullWidth
              multiline
              rows={4}
              variant="outlined"
              placeholder="Add special instructions for your order..."
              value={orderNote}
              onChange={handleOrderNoteChange}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: '12px',
                  fontFamily: '"Alata", sans-serif',
                }
              }}
            />
          </Paper>

          {/* Adres Seçici Dropdown */}
          <Box sx={{ mt: 3, mb: 2 }}>
            <FormControl fullWidth variant="outlined">
              <InputLabel id="address-select-label" sx={{ color: '#ff8800', fontWeight: 'bold', fontFamily: '"Alata", sans-serif' }}>Delivery Address</InputLabel>
              <Select
                labelId="address-select-label"
                id="address-select"
                value={selectedAddressId}
                onChange={handleAddressSelect}
                label="Delivery Address"
                sx={{ background: '#fff', borderRadius: 2, fontWeight: 'bold', fontFamily: '"Alata", sans-serif', border: '1.5px solid #ff8800' }}
                displayEmpty
              >
                {addresses.length === 0 ? (
                  <MenuItem value="" disabled>
                    You have no saved addresses. You can add one from the Addresses page.
                  </MenuItem>
                ) : (
                  addresses.map(addr => (
                    <MenuItem key={addr.id} value={addr.id}>
                      <Box>
                        <Typography sx={{ fontWeight: 'bold', color: '#222', fontFamily: '"Alata", sans-serif' }}>{addr.name}</Typography>
                        <Typography sx={{ color: '#666', fontSize: '0.95rem', fontFamily: '"Alata", sans-serif' }}>{addr.address}</Typography>
                      </Box>
                    </MenuItem>
                  ))
                )}
              </Select>
            </FormControl>
            {addressError && <Alert severity="warning" sx={{ mt: 1 }}>{addressError}</Alert>}
          </Box>
        </>
      )}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert severity={snackbar.severity} sx={{ width: '100%' }}>{snackbar.message}</Alert>
      </Snackbar>

      {/* Order Success Modal */}
      <Modal
        open={successModal}
        onClose={() => setSuccessModal(false)}
        closeAfterTransition
        BackdropComponent={Backdrop}
        BackdropProps={{
          timeout: 500,
          sx: { backgroundColor: 'rgba(255, 255, 255, 0.7)', backdropFilter: 'blur(5px)' }
        }}
      >
        <Fade in={successModal}>
          <Box sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '90%',
            maxWidth: 600,
            textAlign: 'center',
          }}>
            <Box sx={{ 
              position: 'relative',
              animation: 'fadeIn 0.8s',
              '@keyframes fadeIn': {
                '0%': { opacity: 0, transform: 'scale(0.9)' },
                '100%': { opacity: 1, transform: 'scale(1)' }
              },
            }}>
              <Typography 
                variant="h2" 
                sx={{ 
                  fontFamily: 'Alata, sans-serif',
                  color: '#ff8800',
                  fontWeight: 'bold',
                  textShadow: '2px 2px 4px rgba(0, 0, 0, 0.1)',
                  fontSize: { xs: '3rem', sm: '3.5rem', md: '4rem' },
                  mb: 1,
                  position: 'relative',
                  zIndex: 10
                }}
              >
                Order Successful!
              </Typography>
              
              {/* Heart animations */}
              <Box sx={{ position: 'absolute', top: -40, right: { xs: 0, sm: -40 }, zIndex: 5 }}>
                <FavoriteIcon sx={{ 
                  fontSize: 100, 
                  color: '#ff8800',
                  opacity: 0.9,
                  animation: 'float 3s ease-in-out infinite',
                  '@keyframes float': {
                    '0%': { transform: 'translateY(0px)' },
                    '50%': { transform: 'translateY(-15px)' },
                    '100%': { transform: 'translateY(0px)' }
                  }
                }} />
              </Box>
              <Box sx={{ position: 'absolute', bottom: -20, right: { xs: 30, sm: 70 }, zIndex: 5 }}>
                <FavoriteIcon sx={{ 
                  fontSize: 60, 
                  color: '#ff8800',
                  opacity: 0.8,
                  animation: 'float 3.5s ease-in-out infinite 0.5s',
                  '@keyframes float': {
                    '0%': { transform: 'translateY(0px)' },
                    '50%': { transform: 'translateY(-10px)' },
                    '100%': { transform: 'translateY(0px)' }
                  }
                }} />
              </Box>
              <Box sx={{ position: 'absolute', top: 10, left: { xs: 10, sm: -20 }, zIndex: 5 }}>
                <FavoriteIcon sx={{ 
                  fontSize: 70, 
                  color: '#ff8800',
                  opacity: 0.7,
                  animation: 'float 4s ease-in-out infinite 1s',
                  '@keyframes float': {
                    '0%': { transform: 'translateY(0px)' },
                    '50%': { transform: 'translateY(-12px)' },
                    '100%': { transform: 'translateY(0px)' }
                  }
                }} />
              </Box>
              
              <Typography 
                variant="h6" 
                sx={{ 
                  fontFamily: 'Alata, sans-serif', 
                  color: '#555',
                  my: 2,
                  position: 'relative',
                  zIndex: 10
                }}
              >
                Thank you for your order! We're preparing it now.
              </Typography>
              
              <Typography 
                variant="body1"
                sx={{
                  fontFamily: 'Alata, sans-serif',
                  color: '#777',
                  mt: 3,
                  fontSize: '1rem',
                  animation: 'pulse 1.5s infinite',
                  '@keyframes pulse': {
                    '0%': { opacity: 0.6 },
                    '50%': { opacity: 1 },
                    '100%': { opacity: 0.6 }
                  }
                }}
              >
                Redirecting to menu...
              </Typography>
            </Box>
          </Box>
        </Fade>
      </Modal>
    </Container>
  );
}

export default Basket;
