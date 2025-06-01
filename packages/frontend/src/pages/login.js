import React, { useState } from "react";
import "../styles/login.css";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Snackbar, Alert, Slide } from "@mui/material";
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';

const Login = () => {
  const navigate = useNavigate();
  const [isFlipped, setIsFlipped] = useState(false);
  const [formType, setFormType] = useState('user'); // 'user' or 'business'
  const [leftCardFlipped, setLeftCardFlipped] = useState(false); // Sol kart için flip durumu
  const [showPassword, setShowPassword] = useState({
    password: false,
    confirmPassword: false,
  });
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });
  
  // Snackbar state
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success', // 'success', 'error', 'warning', 'info'
  });
  
  // Snackbar'ı açma fonksiyonu
  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({
      open: true,
      message,
      severity,
    });
  };
  
  // Snackbar'ı kapatma fonksiyonu
  const handleSnackbarClose = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setSnackbar({
      ...snackbar,
      open: false,
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFlip = (type) => {
    // Önce form tipini ayarla
    if (type === 'business-signup') {
      setFormType('business');
    } else {
      setFormType(type);
    }
    
    // Flip animasyonu için timeout ekleyelim
    setTimeout(() => {
      setIsFlipped(true);
    }, 50);
  };

  const togglePasswordVisibility = (field) => {
    setShowPassword(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  const handleSignIn = async (e) => {
    e.preventDefault();
    try {
      // Backend'e login isteği gönder
      const response = await axios.post('http://localhost:3001/api/auth/login', {
        phone: formData.phone,
        password: formData.password
      });
      
      // Token'ı localStorage'a kaydet
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      
      // Başarı mesajı göster
      showSnackbar('Giriş başarılı! Restoranlar sayfasına yönlendiriliyorsunuz.', 'success');
      
      // Normal kullanıcı girişi işlemi
      if (formType === 'user') {
        console.log('User sign in successful:', response.data);
        // Başarılı giriş durumunda restoranlar sayfasına yönlendir
        setTimeout(() => {
          navigate('/restaurants');
        }, 500); // Kısa bir gecikme ekleyerek alert'in görünmesini sağla
      } else {
        // İşletme girişi işlemi
        console.log('Business sign in successful:', response.data);
        // İşletme paneline yönlendir
        setTimeout(() => {
          navigate('/business-orders');
        }, 500);
      }
    } catch (error) {
      console.error('Login error:', error.response?.data || error.message);
      showSnackbar('Giriş yapılamadı: ' + (error.response?.data?.message || 'Bir hata oluştu'), 'error');
    }
  };

  const handleSignUp = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      showSnackbar('Parolalar eşleşmiyor!', 'error');
      return;
    }

    try {
      console.log('Gönderilen kayıt bilgileri:', {
        name: formData.name,
        phone: formData.phone,
        password: formData.password,
        confirmPassword: formData.confirmPassword,
        isBusiness: formType === 'business'
      });
      
      // Backend'e signup isteği gönder
      const response = await axios.post('http://localhost:3001/api/auth/signup', {
        name: formData.name,
        phone: formData.phone,
        password: formData.password,
        confirmPassword: formData.confirmPassword,
        isBusiness: formType === 'business'
      });
      
      // Token'ı localStorage'a kaydet
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      
      // Başarı mesajı göster
      showSnackbar('Kayıt işlemi başarılı! Adresler sayfasına yönlendiriliyorsunuz.', 'success');
      
      if (formType === 'user') {
        console.log('User sign up successful:', response.data);
        // Başarılı kayıt sonrası ana sayfaya yönlendir
        setTimeout(() => {
          navigate('/addresses');
        }, 500); // Kısa bir gecikme ekleyerek alert'in görünmesini sağla
      } else {
        console.log('Business sign up successful:', response.data);
        // İşletme kaydı sonrası işletme paneline yönlendir
        setTimeout(() => {
          navigate('/addresses');
        }, 500);
      }
    } catch (error) {
      console.error('Signup error:', error);
      console.error('Error details:', error.response?.data);
      console.error('Error message:', error.message);
      
      // Daha detaylı hata mesajı göster
      let errorMessage = 'Kayıt oluşturulamadı: ';
      
      if (error.response?.data?.message) {
        errorMessage += error.response.data.message;
      } else if (error.message) {
        errorMessage += error.message;
      } else {
        errorMessage += 'Bilinmeyen bir hata oluştu';
      }
      
      showSnackbar(errorMessage, 'error');
    }
  };

  const renderPasswordInput = (placeholder, field) => (
    <div className="password-input-container">
      <input
        type={showPassword[field] ? "text" : "password"}
        placeholder={placeholder}
        className="input-field"
        name={field}
        value={formData[field]}
        onChange={handleInputChange}
      />
      <button
        type="button"
        className="password-toggle"
        onClick={() => togglePasswordVisibility(field)}
      >
        {showPassword[field] ? <VisibilityOffIcon fontSize="small" /> : <VisibilityIcon fontSize="small" />}
      </button>
    </div>
  );

  const renderForm = () => {
    if (formType === 'business' && !isFlipped) {
      return (
        <form onSubmit={handleSignIn}>
          <h1 className="signin-title">SIGN IN</h1>
          <p className="subtitle business-subtitle">Business</p>
          <input 
            type="text" 
            placeholder="Phone Number" 
            className="input-field" 
            name="phone"
            value={formData.phone}
            onChange={handleInputChange}
          />
          {renderPasswordInput("Password", "password")}
          <button type="submit" className="btn-blue">SIGN IN</button>
          <a href="#" className="forgot-link">Forgot password?</a>
        </form>
      );
    } else if (formType === 'business' && isFlipped) {
      return (
        <form onSubmit={handleSignUp}>
          <h1 className="signin-title">SIGN UP</h1>
          <input 
            type="text" 
            placeholder="Business Name" 
            className="input-field" 
            name="name"
            value={formData.name}
            onChange={handleInputChange}
          />
          <input 
            type="text" 
            placeholder="Phone Number" 
            className="input-field" 
            name="phone"
            value={formData.phone}
            onChange={handleInputChange}
          />
          {renderPasswordInput("Password", "password")}
          {renderPasswordInput("Confirm Password", "confirmPassword")}
          <button type="submit" className="btn-blue">CREATE ACCOUNT</button>
        </form>
      );
    } else if (isFlipped) {
      return (
        <form onSubmit={handleSignUp}>
          <h1 className="signin-title">SIGN UP</h1>
          <input 
            type="text" 
            placeholder="Full Name" 
            className="input-field" 
            name="name"
            value={formData.name}
            onChange={handleInputChange}
          />
          <input 
            type="text" 
            placeholder="Phone Number" 
            className="input-field" 
            name="phone"
            value={formData.phone}
            onChange={handleInputChange}
          />
          {renderPasswordInput("Password", "password")}
          {renderPasswordInput("Confirm Password", "confirmPassword")}
          <button type="submit" className="btn-orange">CREATE ACCOUNT</button>
        </form>
      );
    } else {
      return (
        <form onSubmit={handleSignIn}>
          <h1 className="signin-title">SIGN IN</h1>
          <p className="subtitle user-subtitle">Gülbahçe Yemek</p>
          <input 
            type="text" 
            placeholder="Phone number" 
            className="input-field" 
            name="phone"
            value={formData.phone}
            onChange={handleInputChange}
          />
          {renderPasswordInput("Password", "password")}
          <button type="submit" className="btn-orange">SIGN IN</button>
          <a href="#" className="forgot-link">Forgot password?</a>
        </form>
      );
    }
  };

  // Form içeriklerini temizle
  const resetForm = () => {
    setFormData({
      name: '',
      phone: '',
      password: '',
      confirmPassword: ''
    });
  };
  
  // Business moduna geçiş
  const switchToBusiness = () => {
    resetForm();
    setLeftCardFlipped(true);
    setFormType('business');
    setIsFlipped(false);
  };
  
  // User moduna geçiş
  const switchToUser = () => {
    resetForm();
    setLeftCardFlipped(false);
    setFormType('user');
    setIsFlipped(false);
  };

  return (
    <div className="login-page">
      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        TransitionComponent={Slide}
      >
        <Alert 
          onClose={handleSnackbarClose} 
          severity={snackbar.severity} 
          variant="filled"
          sx={{ 
            width: '100%',
            fontWeight: 'bold',
            boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
            borderRadius: '10px',
            '&.MuiAlert-filledSuccess': {
              backgroundColor: snackbar.severity === 'success' ? '#ff8800' : undefined,
            },
            '&.MuiAlert-filledError': {
              backgroundColor: snackbar.severity === 'error' ? '#e74c3c' : undefined,
            }
          }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
      <div className={`login-card-container ${formType === 'business' ? 'business-mode' : ''}`}>
        <div className={`left-card ${leftCardFlipped ? 'flipped' : ''}`}>
          <div className="left-card-front">
            <h2 className="left-heading">WELCOME TO</h2>
            <h2 className="left-heading">GÜLBAHÇE'S #1</h2>
            <h2 className="left-heading">FOOD ORDERING PLATFORM</h2>
            <p className="account-warning">{isFlipped ? 'Already Have An Account?' : 'If You Don\'t Have An Account'}</p>
            <button 
              type="button"
              className="btn-orange" 
              onClick={() => {
                if (isFlipped) {
                  resetForm();
                  setTimeout(() => setIsFlipped(false), 50);
                } else {
                  resetForm();
                  handleFlip('signup');
                }
              }}
            >
              {isFlipped ? 'SIGN IN' : 'SIGN UP'}
            </button>
            <p className="or-text">— or —</p>
            <p className="business-text">Are You A Business?</p>
            <button 
              type="button"
              className="btn-blue" 
              onClick={switchToBusiness}
            >
              BUSINESS PORTAL
            </button>
          </div>
          <div className="left-card-back">
            <h2 className="left-heading">WELCOME TO</h2>
            <h2 className="left-heading">BUSINESS PORTAL</h2>
            <h2 className="left-heading">GÜLBAHÇE YEMEK</h2>
            <p className="account-warning">{isFlipped ? 'Already Have An Account?' : 'If You Don\'t Have An Account'}</p>
            <button 
              type="button"
              className="btn-blue" 
              onClick={() => {
                resetForm();
                if (isFlipped) {
                  setTimeout(() => setIsFlipped(false), 50);
                } else {
                  setLeftCardFlipped(true);
                  setFormType('business');
                  setTimeout(() => setIsFlipped(true), 50);
                }
              }}
            >
              {isFlipped ? 'SIGN IN' : 'SIGN UP'}
            </button>
            <p className="or-text">— or —</p>
            <p className="business-text">Not A Business?</p>
            <button 
              type="button"
              className="btn-orange" 
              onClick={switchToUser}
            >
              USER PORTAL
            </button>
          </div>
        </div>
        <div className={`right-card-container ${isFlipped ? 'flipped' : ''}`}>
          <div className="right-card-front">
            {renderForm()}
          </div>
          <div className="right-card-back">
            {renderForm()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;