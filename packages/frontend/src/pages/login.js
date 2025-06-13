import React, { useState } from "react";
import "../styles/login.css";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Snackbar, Alert, Slide, IconButton, Box, Select, MenuItem, FormControl } from "@mui/material";
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import { useLanguage } from '../contexts/LanguageContext';

const Login = () => {
  const { language, changeLanguage, t } = useLanguage();
  const navigate = useNavigate();
  const [isFlipped, setIsFlipped] = useState(false);
  const [formType, setFormType] = useState('user'); // 'user' or 'business'
  const [leftCardFlipped, setLeftCardFlipped] = useState(false); // Sol kart için flip durumu
  const [isBusiness, setIsBusiness] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalOtp, setModalOtp] = useState(['', '', '', '', '', '']);

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
    isBusiness: false
  });
  const [otpSent, setOtpSent] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);
  
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
    
    // Telefon numarası formatlaması
    if (name === 'phone') {
      // Sadece rakamları al
      let phoneNumber = value.replace(/\D/g, '');
      
      // 5 ile başlaması zorunlu ve maksimum 10 hane
      if (phoneNumber.length > 0) {
        // İlk rakam 5 değilse, 5 ile başlat
        if (!phoneNumber.startsWith('5')) {
          phoneNumber = '5' + phoneNumber.slice(0, 9);
        }
        // Maksimum 10 haneli olacak şekilde kısalt
        phoneNumber = phoneNumber.slice(0, 10);
      }
      
      setFormData(prev => ({
        ...prev,
        [name]: phoneNumber
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
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
      showSnackbar(t('loginSuccess'), 'success');
      
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
      showSnackbar(t('loginFailed') + ': ' + (error.response?.data?.message || t('loginFailed')), 'error');
    }
  };

  const handleSendOtp = async () => {
    if (!formData.name || !formData.phone || !formData.password || !formData.confirmPassword) {
      showSnackbar(t('fillAllFields'), 'error');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      showSnackbar(t('passwordsNotMatch'), 'error');
      return;
    }

    // Telefon numarasını E.164 formatına dönüştür
    let formattedPhone = `+90${formData.phone}`;

    try {
      showSnackbar(t('verificationCodeSending'), 'info');
      await axios.post('http://localhost:3001/api/auth/send-otp', { phone: formattedPhone });
      setOtpSent(true);
      setIsModalOpen(true);
      setResendTimer(60); // 60 saniye timer
      
      // Timer countdown
      const timerInterval = setInterval(() => {
        setResendTimer(prev => {
          if (prev <= 1) {
            clearInterval(timerInterval);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      
      showSnackbar(t('verificationCodeSentMsg'), 'success');
    } catch (error) {
      console.error('Send OTP error:', error.response?.data || error.message);
      showSnackbar(error.response?.data?.message || t('error'), 'error');
    }
  };

  const handleResendOtp = async () => {
    if (resendTimer > 0) return;
    
    let formattedPhone = `+90${formData.phone}`;
    
    try {
      showSnackbar('Yeni kod gönderiliyor...', 'info');
      await axios.post('http://localhost:3001/api/auth/send-otp', { phone: formattedPhone });
      setResendTimer(60);
      
      const timerInterval = setInterval(() => {
        setResendTimer(prev => {
          if (prev <= 1) {
            clearInterval(timerInterval);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      
      showSnackbar(t('newVerificationCodeSent'), 'success');
    } catch (error) {
      showSnackbar(error.response?.data?.message || t('error'), 'error');
    }
  };

  const handleOtpChange = (index, value) => {
    // Sadece rakam kabul et
    if (!/^\d*$/.test(value)) return;
    
    const newOtp = [...modalOtp];
    newOtp[index] = value;
    setModalOtp(newOtp);
    
    // Otomatik bir sonraki kutuya geç
    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      if (nextInput) nextInput.focus();
    }
  };

  const handleOtpKeyDown = (index, e) => {
    // Backspace ile önceki kutuya geç
    if (e.key === 'Backspace' && !modalOtp[index] && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`);
      if (prevInput) prevInput.focus();
    }
  };

  const handleVerifyAndCreateAccount = async (e) => {
    e.preventDefault();
    const { name, phone, password, confirmPassword } = formData;

    if (!modalOtp.join('') || modalOtp.join('').length !== 6) {
      showSnackbar(t('enterVerificationCode'), 'error');
      return;
    }

    let formattedPhone = `+90${formData.phone}`;

    try {
      const response = await axios.post('http://localhost:3001/api/auth/signup', {
        name,
        phone: formattedPhone,
        password,
        confirmPassword,
        isBusiness: formType === 'business',
        otp: modalOtp.join('')
      });

      if (response.data.success) {
        showSnackbar(t('signupSuccess'), 'success');
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        axios.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`;
        setIsModalOpen(false);
        
        if (formType === 'business') {
          navigate('/business-orders');
        } else {
          navigate('/restaurants');
        }
      } else {
        showSnackbar(response.data.message || t('error'), 'error');
      }
    } catch (error) {
      console.error('Signup error:', error);
      showSnackbar(error.response?.data?.message || t('error'), 'error');
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
          <h1 className="signin-title">{t('signIn')}</h1>
          <p className="subtitle business-subtitle">{t('business')}</p>
          <input 
            type="text" 
            placeholder={t('phoneNumber')} 
            className="input-field" 
            name="phone"
            value={formData.phone}
            onChange={handleInputChange}
          />
          {renderPasswordInput(t('password'), "password")}
          <button type="submit" className="btn-blue">{t('signIn')}</button>
          <a href="#" className="forgot-link">{t('forgotPassword')}</a>
        </form>
      );
    } else if (formType === 'business' && isFlipped) {
      return (
        <form onSubmit={(e) => { e.preventDefault(); handleSendOtp(); }}>
          <h1 className="signin-title">{t('signUp')}</h1>
          <input 
            type="text" 
            placeholder={t('businessName')} 
            className="input-field" 
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            required
          />
          <input 
            type="text" 
            placeholder={t('phoneNumberPlaceholder')} 
            className="input-field" 
            name="phone"
            value={formData.phone}
            onChange={handleInputChange}
            required
          />
          {renderPasswordInput(t('password'), "password")}
          {renderPasswordInput(t('confirmPassword'), "confirmPassword")}
          <button type="submit" className="btn-blue">{t('createAccount')}</button>
        </form>
      );
    } else if (isFlipped) {
      return (
        <form onSubmit={(e) => { e.preventDefault(); handleSendOtp(); }}>
          <h1 className="signin-title">{t('signUp')}</h1>
          <input 
            type="text" 
            placeholder={t('fullName')} 
            className="input-field" 
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            required
          />
          <input 
            type="text" 
            placeholder={t('phoneNumberPlaceholder')} 
            className="input-field" 
            name="phone"
            value={formData.phone}
            onChange={handleInputChange}
            required
          />
          {renderPasswordInput(t('password'), "password")}
          {renderPasswordInput(t('confirmPassword'), "confirmPassword")}
          <button type="submit" className="btn-orange">{t('createAccount')}</button>
        </form>
      );
    } else {
      return (
        <form onSubmit={handleSignIn}>
          <h1 className="signin-title">{t('signIn')}</h1>
          <p className="subtitle user-subtitle">Gülbahçe Yemek</p>
          <input 
            type="text" 
            placeholder={t('phoneNumber')} 
            className="input-field" 
            name="phone"
            value={formData.phone}
            onChange={handleInputChange}
          />
          {renderPasswordInput(t('password'), "password")}
          <button type="submit" className="btn-orange">{t('signIn')}</button>
          <a href="#" className="forgot-link">{t('forgotPassword')}</a>
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
    setModalOtp(['', '', '', '', '', '']);
    setOtpSent(false);
    setResendTimer(0);
    setIsModalOpen(false);
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
      {/* Language Toggle Button */}
      <Box sx={{ 
        position: 'absolute', 
        top: 20, 
        right: 20, 
        zIndex: 1000
      }}>
        <FormControl size="small">
          <Select
            value={language}
            onChange={(e) => changeLanguage(e.target.value)}
            renderValue={(value) => (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                {value === 'tr' ? (
                  <>
                    <img src="https://flagcdn.com/w20/tr.png" alt="TR" style={{ width: 20, height: 13, borderRadius: 2 }} />
                    TR
                  </>
                ) : (
                  <>
                    <img src="https://flagcdn.com/w20/us.png" alt="EN" style={{ width: 20, height: 13, borderRadius: 2 }} />
                    EN
                  </>
                )}
              </Box>
            )}
            sx={{ 
              bgcolor: 'rgba(255, 255, 255, 0.9)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255, 136, 0, 0.3)',
              borderRadius: '20px',
              minWidth: 80,
              height: 36,
              fontSize: '0.9rem',
              fontWeight: 'bold',
              '& .MuiSelect-select': {
                py: 0.5,
                px: 1.5,
                display: 'flex',
                alignItems: 'center',
                gap: 0.5
              },
              '& .MuiOutlinedInput-notchedOutline': {
                border: 'none'
              },
              '&:hover': {
                bgcolor: 'rgba(255, 136, 0, 0.1)'
              }
            }}
          >
            <MenuItem value="tr" sx={{ fontSize: '0.9rem', fontWeight: 'bold' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <img src="https://flagcdn.com/w20/tr.png" alt="TR" style={{ width: 20, height: 13, borderRadius: 2 }} />
                TR
              </Box>
            </MenuItem>
            <MenuItem value="en" sx={{ fontSize: '0.9rem', fontWeight: 'bold' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <img src="https://flagcdn.com/w20/us.png" alt="EN" style={{ width: 20, height: 13, borderRadius: 2 }} />
                EN
              </Box>
            </MenuItem>
          </Select>
        </FormControl>
      </Box>
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
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>{t('phoneVerification')}</h2>
            <p>
              +90{formData.phone.substring(0,3)}***{formData.phone.substring(7)} {t('verificationCodeSent')}
            </p>
            <form onSubmit={handleVerifyAndCreateAccount}>
              <div className="otp-input-container">
                {modalOtp.map((digit, index) => (
                  <input
                    key={index}
                    id={`otp-${index}`}
                    type="text"
                    className="otp-input"
                    value={digit}
                    onChange={(e) => handleOtpChange(index, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(index, e)}
                    maxLength="1"
                    autoComplete="off"
                  />
                ))}
              </div>
              <button type="submit" className="btn-orange">{t('verifyAndCreate')}</button>
              
              {resendTimer > 0 ? (
                <p className="resend-timer">
                  {t('waitToResend', { time: resendTimer })}
                </p>
              ) : (
                <button 
                  type="button" 
                  className="btn-resend" 
                  onClick={handleResendOtp}
                >
                  {t('resendCode')}
                </button>
              )}
              
              <button type="button" className="btn-secondary" onClick={() => {
                setIsModalOpen(false);
                setModalOtp(['', '', '', '', '', '']);
                setOtpSent(false);
                setResendTimer(0);
              }}>{t('cancel')}</button>
            </form>
          </div>
        </div>
      )}
      <div className={`login-card-container ${formType === 'business' ? 'business-mode' : ''}`}>
        <div className={`left-card ${leftCardFlipped ? 'flipped' : ''}`}>
          <div className="left-card-front">
            <h2 className="left-heading">{t('welcome')}</h2>
            <h2 className="left-heading">{t('gülbahce')}</h2>
            <h2 className="left-heading">{t('foodPlatform')}</h2>
            <p className="account-warning">{isFlipped ? t('alreadyHaveAccount') : t('dontHaveAccount')}</p>
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
              {isFlipped ? t('signIn') : t('signUp')}
            </button>
            <p className="or-text">{t('or')}</p>
            <p className="business-text">{t('areYouBusiness')}</p>
            <button 
              type="button"
              className="btn-blue" 
              onClick={switchToBusiness}
            >
              {t('businessPortal')}
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