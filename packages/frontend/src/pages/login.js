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

  const handleSendOtp = async () => {
    if (!formData.name || !formData.phone || !formData.password || !formData.confirmPassword) {
      showSnackbar('Lütfen tüm alanları doldurun.', 'error');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      showSnackbar('Şifreler eşleşmiyor.', 'error');
      return;
    }

    // Telefon numarasını E.164 formatına dönüştür
    let formattedPhone = `+90${formData.phone}`;

    try {
      showSnackbar('Doğrulama kodu gönderiliyor...', 'info');
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
      
      showSnackbar('Doğrulama kodu telefonunuza gönderildi.', 'success');
    } catch (error) {
      console.error('Send OTP error:', error.response?.data || error.message);
      showSnackbar(error.response?.data?.message || 'Kod gönderilemedi.', 'error');
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
      
      showSnackbar('Yeni doğrulama kodu gönderildi.', 'success');
    } catch (error) {
      showSnackbar(error.response?.data?.message || 'Kod gönderilemedi.', 'error');
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
      showSnackbar('Lütfen 6 haneli doğrulama kodunu tam olarak girin.', 'error');
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
        showSnackbar('Kayıt başarılı!', 'success');
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
        showSnackbar(response.data.message || 'Kayıt başarısız.', 'error');
      }
    } catch (error) {
      console.error('Signup error:', error);
      showSnackbar(error.response?.data?.message || 'Bir hata oluştu.', 'error');
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
            placeholder="Telefon Numarası" 
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
        <form onSubmit={(e) => { e.preventDefault(); handleSendOtp(); }}>
          <h1 className="signin-title">SIGN UP</h1>
          <input 
            type="text" 
            placeholder="Business Name" 
            className="input-field" 
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            required
          />
          <input 
            type="text" 
            placeholder="Telefon Numarası (5XX XXX XX XX)" 
            className="input-field" 
            name="phone"
            value={formData.phone}
            onChange={handleInputChange}
            required
          />
          {renderPasswordInput("Password", "password")}
          {renderPasswordInput("Confirm Password", "confirmPassword")}
          <button type="submit" className="btn-blue">CREATE ACCOUNT</button>
        </form>
      );
    } else if (isFlipped) {
      return (
        <form onSubmit={(e) => { e.preventDefault(); handleSendOtp(); }}>
          <h1 className="signin-title">SIGN UP</h1>
          <input 
            type="text" 
            placeholder="Full Name" 
            className="input-field" 
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            required
          />
          <input 
            type="text" 
            placeholder="Telefon Numarası (5XX XXX XX XX)" 
            className="input-field" 
            name="phone"
            value={formData.phone}
            onChange={handleInputChange}
            required
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
            placeholder="Telefon Numarası" 
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
            <h2>Telefon Doğrulama</h2>
            <p>
              +90{formData.phone.substring(0,3)}***{formData.phone.substring(7)} numarasına gönderilen 6 haneli kodu girin
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
              <button type="submit" className="btn-orange">Doğrula ve Hesabı Oluştur</button>
              
              {resendTimer > 0 ? (
                <p className="resend-timer">
                  Yeni kod gönderebilmek için {resendTimer} saniye bekleyin
                </p>
              ) : (
                <button 
                  type="button" 
                  className="btn-resend" 
                  onClick={handleResendOtp}
                >
                  Kodu Tekrar Gönder
                </button>
              )}
              
              <button type="button" className="btn-secondary" onClick={() => {
                setIsModalOpen(false);
                setModalOtp(['', '', '', '', '', '']);
                setOtpSent(false);
                setResendTimer(0);
              }}>İptal</button>
            </form>
          </div>
        </div>
      )}
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