import React from 'react';
import { Container, Typography, Box, Card, CardContent, CardMedia, IconButton, Button, Divider, TextField, Paper, Alert, MenuItem, Select, FormControl, Snackbar, Modal, Backdrop, Fade } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import FavoriteIcon from '@mui/icons-material/Favorite';
import ShoppingBasketIcon from '@mui/icons-material/ShoppingBasket';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import NoteAltIcon from '@mui/icons-material/NoteAlt';
import HomeIcon from '@mui/icons-material/Home';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { keyframes } from '@mui/system';
import { useLanguage } from '../contexts/LanguageContext';

function Basket({ cartItems, addToCart, removeFromCart, resetCart }) {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [orderNote, setOrderNote] = React.useState('');
  const [addresses, setAddresses] = React.useState([]);
  const [selectedAddressId, setSelectedAddressId] = React.useState('');
  const [addressError, setAddressError] = React.useState('');
  const [snackbar, setSnackbar] = React.useState({ open: false, message: '', severity: 'success' });
  const [successModal, setSuccessModal] = React.useState(false);
  const [privacyOpen, setPrivacyOpen] = React.useState(false);

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
      
      // Automatically redirect to menu page after 3 seconds
      setTimeout(() => {
        setSuccessModal(false);
        navigate('/menu');
      }, 3000);
    } catch (err) {
      setSnackbar({ open: true, message: 'Failed to place your order!', severity: 'error' });
    }
  };

  return (
    <Container maxWidth="md" sx={{ py: 4, pb: { xs: 10, sm: 4 } }}>
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        gap: 1, 
        mb: 3
      }}>
        <ShoppingBasketIcon sx={{ fontSize: 36, color: '#ff8800' }} />
        <Typography 
          variant="h4" 
          component="h1" 
          align="center" 
          fontWeight="bold" 
          sx={{ 
            fontFamily: '"Alata", sans-serif', 
            letterSpacing: '0.5px',
            color: '#333',
            position: 'relative'
          }}
        >
          {t('cartTitle')}
        </Typography>
      </Box>

      {(!cartItems || cartItems.length === 0) ? (
        <Paper elevation={3} sx={{ 
          textAlign: 'center', 
          mt: 4, 
          py: 6,
          px: 3,
          borderRadius: '16px',
          backgroundColor: '#fff',
          border: '1px dashed #ff8800'
        }}>
          <ShoppingBasketIcon sx={{ fontSize: 80, color: '#ddd', mb: 2 }} />
          <Typography variant="h5" color="text.secondary" sx={{ 
            fontFamily: '"Alata", sans-serif', 
            fontSize: '1.4rem',
            fontWeight: 'bold',
            mb: 1
          }}>
            {t('emptyCartMessage')}
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ 
            fontFamily: '"Alata", sans-serif', 
            mb: 4
          }}>
            {t('emptyCartSubtext')}
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
              px: 4,
              fontSize: '1rem',
              boxShadow: '0 4px 12px rgba(255,136,0,0.3)',
              '&:hover': { 
                bgcolor: '#e67a00',
                transform: 'translateY(-2px)',
                boxShadow: '0 6px 16px rgba(255,136,0,0.4)',
              },
              transition: 'all 0.3s ease'
            }}
            component="a"
            href="/restaurants"
            startIcon={<ShoppingBasketIcon />}
          >
            {t('backToMenu')}
          </Button>
        </Paper>
      ) : (
        <>
          {/* Two-column main layout - Left: Cart items, Right: Order Summary */}
          <Box sx={{
            display: 'flex',
            flexDirection: { xs: 'column', lg: 'row' },
            gap: 3
          }}>
            {/* Left Column: Cart Items */}            <Box sx={{ 
              flex: 1, 
              width: { xs: '100%', lg: 'calc(100% - 350px)' }
            }}>
              {/* All Cart Items in a Single Card */}
              <Card 
                sx={{ 
                  borderRadius: '16px', 
                  overflow: 'hidden',
                  border: '1px solid #ff8800', 
                  boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                  transition: 'all 0.3s ease',
                  mb: 2,
                  '&:hover': {
                    transform: 'translateY(-3px)',
                    boxShadow: '0 8px 20px rgba(0,0,0,0.12)',
                  }
                }}
              >
                <CardContent sx={{ p: 0 }}>
                  {/* Card Header */}
                  <Box sx={{
                    bgcolor: '#fff8f0',
                    borderBottom: '1px solid #ffddbb',
                    p: 2,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: 1
                  }}>
                    <Typography 
                      component="div" 
                      variant="h6" 
                      sx={{ 
                        fontFamily: '"Alata", sans-serif', 
                        fontWeight: 'bold',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1
                      }}
                    >
                      <ShoppingBasketIcon fontSize="small" sx={{ color: '#ff8800' }} />
                      Your Order Items
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography 
                        variant="subtitle2" 
                        sx={{ 
                          bgcolor: '#ff8800',
                          color: 'white',
                          py: 0.5,
                          px: 1.5,
                          borderRadius: '50px',
                          fontFamily: '"Alata", sans-serif',
                          fontWeight: 'bold'  
                        }}
                      >
                        {cartItems.length} items
                      </Typography>
                      <Button
                        variant="outlined"
                        sx={{
                          borderRadius: 5,
                          borderColor: '#ff8800',
                          color: '#ff8800',
                          fontWeight: 'bold',
                          px: 2,
                          py: 0.5,
                          fontSize: '0.95rem',
                          ml: 1,
                          minWidth: 0,
                          height: 32,
                          '&:hover': {
                            backgroundColor: '#fff3e0',
                            borderColor: '#ff8800',
                            color: '#e67a00',
                          }
                        }}
                        onClick={resetCart}
                      >
                        Sepeti Boşalt
                      </Button>
                    </Box>
                  </Box>
                  
                  {/* Cart Items List */}
                  {cartItems.map((item, index) => (
                    <Box 
                      key={item.id}
                      sx={{ 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'center', 
                        p: 2.5,
                        borderBottom: index < cartItems.length - 1 ? '1px dashed #ffddbb' : 'none',
                        '&:hover': {
                          bgcolor: '#fafafa'
                        }
                      }}
                    >
                      <Box sx={{ flex: 1 }}>
                        <Typography 
                          component="div" 
                          variant="h6" 
                          sx={{ 
                            fontFamily: '"Alata", sans-serif', 
                            fontWeight: 'bold',
                            fontSize: '1rem',
                            mb: 0.5
                          }}
                        >
                          {item.productName}
                        </Typography>
                        <Typography 
                          variant="subtitle1" 
                          color="#ff8800" 
                          component="div" 
                          sx={{ 
                            fontFamily: '"Alata", sans-serif',
                            fontWeight: 'bold'  
                          }}
                        >
                          ₺ {Number(item.price).toFixed(2)}
                        </Typography>
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          sx={{ 
                            display: 'block',
                            mt: 0.5,
                            fontFamily: '"Alata", sans-serif'
                          }}
                        >
                          Subtotal: ₺ {(Number(item.price) * item.quantity).toFixed(2)}
                        </Typography>
                      </Box>
                      <Box sx={{ 
                        display: 'flex', 
                        flexDirection: 'column',
                        alignItems: 'flex-end',
                        gap: 1,
                        minWidth: 140
                      }}>
                        <Box sx={{ 
                          display: 'flex', 
                          alignItems: 'center',
                          bgcolor: '#f8f8f8',
                          borderRadius: '50px',
                          border: '1px solid #ddd',
                          width: 'max-content',
                          boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
                        }}>
                          <IconButton 
                            size="small" 
                            onClick={() => removeFromCart(item.id)}
                            sx={{ 
                              color: '#ff8800',
                              width: 32,
                              height: 32,
                              '&:hover': {
                                bgcolor: 'rgba(255,136,0,0.1)'
                              }
                            }}
                          >
                            <RemoveIcon fontSize="small" />
                          </IconButton>
                          <Typography sx={{ 
                            minWidth: '36px', 
                            textAlign: 'center',
                            fontWeight: 'bold',
                            fontFamily: '"Alata", sans-serif'
                          }}>{item.quantity}</Typography>
                          <IconButton 
                            size="small" 
                            onClick={() => addToCart(item)}
                            sx={{ 
                              color: '#ff8800',
                              width: 32,
                              height: 32,
                              '&:hover': {
                                bgcolor: 'rgba(255,136,0,0.1)'
                              }
                            }}
                          >
                            <AddIcon fontSize="small" />
                          </IconButton>
                        </Box>
                        <Button
                          size="small"
                          startIcon={<DeleteIcon fontSize="small" />}
                          onClick={() => {
                            // Remove item completely from cart
                            const count = item.quantity;
                            for (let i = 0; i < count; i++) {
                              removeFromCart(item.id);
                            }
                          }}
                          sx={{ 
                            color: '#666',
                            fontSize: '0.75rem',
                            '&:hover': {
                              color: '#ff0000',
                              bgcolor: 'rgba(255,0,0,0.05)'
                            },
                            width: 'max-content'
                          }}
                        >
                          Remove
                        </Button>
                      </Box>
                    </Box>
                  ))}
                </CardContent>
              </Card>

              {/* Order Notes Section */}
              <Paper elevation={3} sx={{ 
                p: 3, 
                mt: 3,
                borderRadius: '16px',
                border: '1px solid rgba(255,136,0,0.3)',
                background: 'linear-gradient(to bottom right, #fff, #fffaf5)'
              }}>
                <Box sx={{ 
                  display: 'flex', 
                  alignItems: 'center',
                  mb: 2,
                  pb: 1,
                  borderBottom: '1px dashed rgba(255,136,0,0.3)'
                }}>
                  <NoteAltIcon sx={{ color: '#ff8800', mr: 1, fontSize: 26 }} />
                  <Typography variant="h6" sx={{ 
                    fontWeight: 'bold',
                    color: '#333',
                    fontFamily: '"Alata", sans-serif'
                  }}>
                    Special Instructions
                  </Typography>
                </Box>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2, fontFamily: '"Alata", sans-serif' }}>
                  Let us know if you have specific preparation preferences or allergies.
                </Typography>
                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  variant="outlined"
                  placeholder="E.g., Extra spicy, no onions, allergen concerns, etc..."
                  value={orderNote}
                  onChange={handleOrderNoteChange}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: '12px',
                      fontFamily: '"Alata", sans-serif',
                      border: '1px solid #ff880050',
                      '&.Mui-focused fieldset': {
                        borderColor: '#ff8800',
                      },
                      '&:hover fieldset': {
                        borderColor: '#ff8800',
                      }
                    },
                    '& .MuiInputBase-input': {
                      fontFamily: '"Alata", sans-serif',
                    },
                    '&:hover': {
                      '& .MuiOutlinedInput-root': {
                        boxShadow: '0 0 0 2px rgba(255,136,0,0.1)',
                      }
                    }
                  }}
                />
              </Paper>

              {/* Address Select Dropdown */}
              <Paper elevation={3} sx={{ 
                p: 3, 
                mt: 3,
                borderRadius: '16px',
                border: '1px solid rgba(255,136,0,0.3)',
                background: 'linear-gradient(to bottom right, #fff, #fffaf5)'
              }}>
                <Box sx={{ 
                  display: 'flex', 
                  alignItems: 'center',
                  mb: 2,
                  pb: 1,
                  borderBottom: '1px dashed rgba(255,136,0,0.3)'
                }}>
                  <HomeIcon sx={{ color: '#ff8800', mr: 1, fontSize: 26 }} />
                  <Typography variant="h6" sx={{ 
                    fontWeight: 'bold',
                    color: '#333',
                    fontFamily: '"Alata", sans-serif'
                  }}>
                    Delivery Address
                  </Typography>
                </Box>

                <Typography variant="body2" color="text.secondary" sx={{ mb: 2, fontFamily: '"Alata", sans-serif' }}>
                  Select where you want your order to be delivered.
                </Typography>

                <FormControl fullWidth variant="outlined">
                  <Select
                    labelId="address-select-label"
                    id="address-select"
                    value={selectedAddressId}
                    onChange={handleAddressSelect}
                    displayEmpty
                    sx={{ 
                      background: '#fff', 
                      borderRadius: '12px', 
                      fontFamily: '"Alata", sans-serif',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                      '& .MuiOutlinedInput-notchedOutline': {
                        borderColor: 'rgba(255,136,0,0.3)',
                        borderWidth: '1px'
                      },
                      '&:hover .MuiOutlinedInput-notchedOutline': {
                        borderColor: '#ff8800'
                      },
                      '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                        borderColor: '#ff8800',
                        borderWidth: '2px'
                      }
                    }}
                  >
                    {addresses.length === 0 ? (
                      <MenuItem value="" disabled>
                        <Box sx={{ p: 1 }}>
                          <Typography sx={{ fontWeight: 'bold', color: '#666', fontFamily: '"Alata", sans-serif' }}>
                            No addresses found
                          </Typography>
                          <Typography sx={{ color: '#888', fontSize: '0.85rem', fontFamily: '"Alata", sans-serif' }}>
                            You can add one from the Addresses page.
                          </Typography>
                        </Box>
                      </MenuItem>
                    ) : (
                      addresses.map(addr => (
                        <MenuItem key={addr.id} value={addr.id} sx={{
                          borderRadius: '8px',
                          my: 0.5,
                          '&:hover': {
                            bgcolor: 'rgba(255,136,0,0.05)'
                          },
                          '&.Mui-selected': {
                            bgcolor: 'rgba(255,136,0,0.1)',
                            '&:hover': {
                              bgcolor: 'rgba(255,136,0,0.15)'
                            }
                          }
                        }}>
                          <Box sx={{ py: 0.5 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                              <HomeIcon sx={{ color: '#ff8800', fontSize: 18, mr: 1 }} />
                              <Typography sx={{ fontWeight: 'bold', color: '#222', fontFamily: '"Alata", sans-serif' }}>
                                {addr.name}
                              </Typography>
                            </Box>
                            <Typography sx={{ color: '#666', fontSize: '0.9rem', fontFamily: '"Alata", sans-serif', pl: 3.5 }}>
                              {addr.address}
                            </Typography>
                          </Box>
                        </MenuItem>
                      ))
                    )}
                  </Select>
                </FormControl>
                {addressError && <Alert severity="warning" sx={{ mt: 2, borderRadius: '8px' }}>{addressError}</Alert>}
                
                <Button 
                  variant="outlined"
                  size="small"
                  sx={{
                    mt: 2,
                    borderColor: 'rgba(255,136,0,0.5)',
                    color: '#ff8800',
                    fontFamily: '"Alata", sans-serif',
                    fontSize: '0.8rem',
                    fontWeight: 'bold',
                    borderRadius: '8px',
                    '&:hover': {
                      borderColor: '#ff8800',
                      bgcolor: 'rgba(255,136,0,0.05)'
                    }
                  }}
                  component="a"
                  href="/addresses"
                >
                  Manage Addresses
                </Button>
              </Paper>
            </Box>

            {/* Right Column: Order Summary (Fixed on the right) */}
            <Box sx={{ 
              width: { xs: '100%', lg: '350px' },
              position: { xs: 'static', lg: 'sticky' },
              top: '20px',
              alignSelf: 'flex-start',
              height: 'fit-content'
            }}>
              <Card sx={{ 
                borderRadius: '16px', 
                border: '1px solid #ff8800', 
                boxShadow: '0 8px 24px rgba(255,136,0,0.15)',
              }}>
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ 
                    display: 'flex', 
                    alignItems: 'center',
                    mb: 2,
                    pb: 1,
                    borderBottom: '2px dashed rgba(255,136,0,0.3)'
                  }}>
                    <CheckCircleOutlineIcon sx={{ color: '#ff8800', mr: 1 }} />
                    <Typography variant="h6" sx={{ 
                      fontFamily: '"Alata", sans-serif', 
                      fontWeight: 'bold', 
                      color: '#333' 
                    }}>
                      Order Summary
                    </Typography>
                  </Box>
                  
                  <Paper elevation={0} sx={{ 
                    bgcolor: '#f9f9f9', 
                    p: 2, 
                    borderRadius: '12px',
                    mb: 2
                  }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1.5 }}>
                      <Typography sx={{ 
                        fontFamily: '"Alata", sans-serif',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1,
                        color: '#555'
                      }}>
                        <ShoppingBasketIcon fontSize="small" sx={{ color: '#777' }} />
                        Subtotal
                      </Typography>
                      <Typography sx={{ 
                        fontFamily: '"Alata", sans-serif',
                        fontWeight: 'bold'
                      }}>
                        ₺ {Number(calculateTotal()).toFixed(2)}
                      </Typography>
                    </Box>                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography sx={{ 
                        fontFamily: '"Alata", sans-serif',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1,
                        color: '#555'
                      }}>
                        <LocalShippingIcon fontSize="small" sx={{ color: '#777' }} />
                        Delivery Fee
                      </Typography>
                      <Typography sx={{ 
                        fontFamily: '"Alata", sans-serif',
                        fontWeight: 'bold'
                      }}>
                        ₺ 10.00
                      </Typography>
                    </Box>

                    {selectedAddressId && (
                      <Box sx={{ 
                        display: 'flex', 
                        alignItems: 'flex-start', 
                        mt: 2, 
                        pt: 2,
                        borderTop: '1px dashed #ddd'
                      }}>
                        <HomeIcon fontSize="small" sx={{ color: '#777', mt: 0.3, mr: 1 }} />
                        <Box>
                          <Typography sx={{ 
                            fontFamily: '"Alata", sans-serif',
                            fontWeight: 'bold',
                            fontSize: '0.9rem',
                            color: '#555'
                          }}>
                            {addresses.find(addr => addr.id === selectedAddressId)?.name || 'Selected Address'}
                          </Typography>
                          <Typography sx={{ 
                            fontFamily: '"Alata", sans-serif',
                            fontSize: '0.8rem',
                            color: '#777',
                            mt: 0.5
                          }}>
                            {addresses.find(addr => addr.id === selectedAddressId)?.address || 'No address details'}
                          </Typography>
                        </Box>
                      </Box>
                    )}
                  </Paper>
                  
                  <Divider sx={{ my: 2, borderStyle: 'dashed', borderColor: 'rgba(255,136,0,0.3)' }} />
                  
                  <Box sx={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    mb: 3,
                    bgcolor: 'rgba(255,136,0,0.1)',
                    p: 1.5,
                    borderRadius: '12px'
                  }}>
                    <Typography variant="h6" sx={{ 
                      fontFamily: '"Alata", sans-serif', 
                      fontWeight: 'bold',
                      color: '#333'
                    }}>
                      Total
                    </Typography>
                    <Typography variant="h6" sx={{ 
                      fontFamily: '"Alata", sans-serif', 
                      fontWeight: 'bold', 
                      color: '#ff8800' 
                    }}>
                      ₺ {Number(calculateTotal() + 10).toFixed(2)}
                    </Typography>
                  </Box>
                  
                  <Button
                    variant="contained"
                    fullWidth
                    sx={{ 
                      bgcolor: '#ff8800', 
                      color: 'white',
                      fontWeight: 'bold',
                      borderRadius: '50px',
                      py: 1.5,
                      fontSize: '1rem',
                      letterSpacing: '1px',
                      boxShadow: '0 6px 12px rgba(255, 136, 0, 0.3)',
                      '&:hover': { 
                        bgcolor: '#e67a00',
                        boxShadow: '0 8px 16px rgba(255, 136, 0, 0.4)',
                        transform: 'translateY(-2px)'
                      },
                      '&:active': {
                        transform: 'translateY(0)',
                        boxShadow: '0 4px 8px rgba(255, 136, 0, 0.3)'
                      },
                      transition: 'all 0.3s ease'
                    }}
                    onClick={handlePlaceOrder}
                  >
                    PLACE ORDER
                  </Button>
                  
                  <Typography variant="caption" sx={{ 
                    display: 'block',
                    textAlign: 'center',
                    mt: 2,
                    color: '#888',
                    fontFamily: '"Alata", sans-serif'
                  }}>
                    By placing your order, you agree to our Terms of Service &{' '}
                    <Button
                      variant="text"
                      sx={{ color: '#ff8800', textDecoration: 'underline', fontSize: 'inherit', p: 0, minWidth: 0 }}
                      onClick={() => setPrivacyOpen(true)}
                    >
                      Privacy Policy
                    </Button>
                  </Typography>
                </CardContent>
              </Card>
            </Box>
          </Box>
        </>
      )}
      
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        sx={{
          position: 'fixed',
          top: { xs: 64, sm: 80 },
          right: { xs: 8, sm: 24 },
          left: 'auto',
          width: 'auto',
          maxWidth: 340,
          zIndex: 1400,
          p: 0,
          m: 0,
          '& .MuiAlert-root': {
            borderRadius: '12px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
            fontFamily: '"Alata", sans-serif',
            border: '1px solid',
            borderColor: snackbar.severity === 'success' ? 'rgba(46, 204, 113, 0.3)' : 'rgba(231, 76, 60, 0.3)',
            width: '100%'
          }
        }}
      >
        <Alert 
          severity={snackbar.severity} 
          sx={{ 
            width: '100%',
            fontWeight: 'bold',
            '& .MuiAlert-icon': {
              fontSize: '1.5rem'
            }
          }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>

      {/* Order Success Modal */}
      <Modal
        open={successModal}
        onClose={() => setSuccessModal(false)}
        closeAfterTransition
        BackdropComponent={Backdrop}
        BackdropProps={{
          timeout: 500,
          sx: { backgroundColor: 'rgba(255,255,255,0.7)', backdropFilter: 'blur(8px)' }
        }}
      >
        <Fade in={successModal}>
          <Box sx={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            p: 0,
            m: 0,
            background: 'none',
            boxShadow: 'none',
            border: 'none',
          }}>
            {/* Dağıtık Kalpler */}
            <Box sx={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 2 }}>
              <span style={{ position: 'absolute', top: '8%', left: '70%', fontSize: 64, color: '#ff8800', opacity: 0.95 }}>❤</span>
              <span style={{ position: 'absolute', top: '18%', left: '80%', fontSize: 40, color: '#ff8800', opacity: 0.85 }}>❤</span>
              <span style={{ position: 'absolute', top: '30%', left: '75%', fontSize: 28, color: '#ff8800', opacity: 0.8 }}>❤</span>
              <span style={{ position: 'absolute', top: '12%', left: '60%', fontSize: 32, color: '#ff8800', opacity: 0.7 }}>❤</span>
              <span style={{ position: 'absolute', top: '22%', left: '65%', fontSize: 22, color: '#ff8800', opacity: 0.7 }}>❤</span>
              <span style={{ position: 'absolute', top: '35%', left: '60%', fontSize: 18, color: '#ff8800', opacity: 0.6 }}>❤</span>
              <span style={{ position: 'absolute', top: '15%', left: '50%', fontSize: 40, color: '#ff8800', opacity: 0.7 }}>❤</span>
              <span style={{ position: 'absolute', top: '28%', left: '55%', fontSize: 24, color: '#ff8800', opacity: 0.6 }}>❤</span>
              <span style={{ position: 'absolute', top: '10%', left: '80%', fontSize: 20, color: '#ff8800', opacity: 0.5 }}>❤</span>
              <span style={{ position: 'absolute', top: '38%', left: '80%', fontSize: 16, color: '#ff8800', opacity: 0.5 }}>❤</span>
            </Box>
            {/* Order Successful Yazısı */}
            <Box sx={{
              width: '100%',
              textAlign: 'center',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexDirection: 'column',
            }}>
              <span style={{
                fontFamily: 'Pacifico, "Dancing Script", cursive',
                fontSize: 'clamp(2.5rem, 8vw, 4.5rem)',
                color: '#ff8800',
                fontWeight: 700,
                letterSpacing: '2px',
                textShadow: '2px 2px 8px rgba(255,136,0,0.08)',
                marginTop: 0,
                marginBottom: 0,
                display: 'inline-block',
              }}>
                Order Successful
              </span>
            </Box>
          </Box>
        </Fade>
      </Modal>

      {/* Privacy Policy Modal */}
      <Modal
        open={privacyOpen}
        onClose={() => setPrivacyOpen(false)}
        closeAfterTransition
        BackdropComponent={Backdrop}
        BackdropProps={{
          timeout: 500,
          sx: { backgroundColor: 'rgba(255, 255, 255, 0.7)', backdropFilter: 'blur(5px)' }
        }}
      >
        <Fade in={privacyOpen}>
          <Box sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            bgcolor: 'white',
            borderRadius: 3,
            p: 4,
            maxWidth: 400,
            boxShadow: 24,
            textAlign: 'center'
          }}>
            <Typography variant="h6" sx={{ mb: 2, color: '#ff8800', fontWeight: 'bold' }}>Privacy Policy</Typography>
            <Typography variant="body2" sx={{ mb: 2 }}>
              Biz sizin verilerinizi asla satmayız, çünkü kimse almak istemez!<br />
              Siparişlerinizi uzaylılara iletmiyoruz, sadece mutfağa.<br />
              <b>Şaka bir yana:</b> Tüm bilgileriniz güvenle saklanır ve asla 3. şahıslarla paylaşılmaz.
            </Typography>
            <Button variant="contained" sx={{ mt: 2 }} onClick={() => setPrivacyOpen(false)}>Kapat</Button>
          </Box>
        </Fade>
      </Modal>
    </Container>
  );
}

export default Basket;
