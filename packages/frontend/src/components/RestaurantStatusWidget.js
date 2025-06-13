import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  CircularProgress 
} from '@mui/material';
import axios from 'axios';
import { useLanguage } from '../contexts/LanguageContext';

const RestaurantStatusWidget = () => {
  const [businessData, setBusinessData] = useState({
    isOpen: false,
    openingTime: '09:00',
    closingTime: '22:00'
  });
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const { t } = useLanguage();

  // Fetch business data
  useEffect(() => {
    const fetchBusinessData = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('http://localhost:3001/api/business/settings', {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        const { business } = response.data;
        setBusinessData({
          isOpen: business.isOpen || false,
          openingTime: business.openingTime || '09:00',
          closingTime: business.closingTime || '22:00'
        });
      } catch (err) {
        console.error('Business data fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchBusinessData();
  }, []);  // Handle status toggle
  const handleStatusToggle = async () => {
    setUpdating(true);
    try {
      const token = localStorage.getItem('token');
      const newStatus = !businessData.isOpen;
      
      await axios.put('http://localhost:3001/api/business/settings', 
        {
          isOpen: newStatus
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      
      setBusinessData(prev => ({ ...prev, isOpen: newStatus }));
    } catch (err) {
      console.error('Status update error:', err);
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <Box 
        sx={{ 
          p: 1, 
          borderRadius: 1,
          backgroundColor: '#ff8800',
          color: 'white',
          textAlign: 'center'
        }}
      >
        <CircularProgress size={16} sx={{ color: 'white' }} />
      </Box>
    );
  }  return (    <Box 
      onClick={handleStatusToggle}
      sx={{ 
        p: 1.5, 
        borderRadius: 1,
        height: 110, // Sabit yükseklik belirliyoruz
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        background: businessData.isOpen 
          ? 'linear-gradient(135deg, #64B5F6 0%, #1976D2 100%)' // Mavi tonları - gözü yormayan
          : 'linear-gradient(135deg, #191970 0%, #2F2F4F 50%, #000080 100%)', // Mevcut gece teması
        color: 'white', // Her iki durum için beyaz yazı
        textAlign: 'center',
        cursor: updating ? 'not-allowed' : 'pointer',
        transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
        position: 'relative',
        overflow: 'hidden',
        transform: updating ? 'scale(0.98)' : 'scale(1)',
        '&:hover': {
          opacity: updating ? 1 : 0.9,
          transform: updating ? 'scale(0.98)' : 'scale(1.05)',
          boxShadow: updating ? 'none' : businessData.isOpen 
            ? '0 4px 12px rgba(25, 118, 210, 0.5)' // Mavi tona uygun gölge
            : '0 4px 12px rgba(75, 0, 130, 0.4)'
        },
        '&:active': {
          transform: 'scale(0.95)',
          transition: 'transform 0.1s ease'
        }
      }}
    >
      {/* OPEN - Yeni gündüz teması (daha okunaklı) */}
      {businessData.isOpen && (
        <>
          {/* Güneş ikonu - Efektlerle */}
          <Box sx={{
            position: 'absolute',
            top: '10px',
            right: '15px',
            width: '24px',
            height: '24px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, #FFE082 0%, #FFC107 100%)',
            boxShadow: '0 0 8px rgba(255, 193, 7, 0.6)',
            animation: 'sun-pulse 4s ease-in-out infinite',
            zIndex: 1
          }} />
          
          {/* Basit, iç içe bulut grubu - sol üst - Animasyonlu */}
          <Box sx={{
            position: 'absolute',
            top: '12px',
            left: '15px',
            width: '35px',
            height: '18px',
            backgroundColor: 'rgba(255,255,255,0.9)',
            borderRadius: '18px',
            opacity: 0.9,
            animation: 'cloud-float 8s ease-in-out infinite',
            zIndex: 1
          }}>
            <Box sx={{
              position: 'absolute',
              top: '-5px',
              left: '5px',
              width: '15px',
              height: '15px',
              backgroundColor: 'rgba(255,255,255,0.9)',
              borderRadius: '50%',
            }} />
            <Box sx={{
              position: 'absolute',
              top: '-3px',
              left: '15px',
              width: '12px',
              height: '12px',
              backgroundColor: 'rgba(255,255,255,0.9)',
              borderRadius: '50%',
            }} />
          </Box>
          
          {/* Uçan Kuş - efektli */}
          <Box sx={{
            position: 'absolute',
            top: '14px',
            left: '55px',
            fontSize: '10px',
            color: 'rgba(255,255,255,0.85)',
            animation: 'bird-drift 15s ease-in-out infinite',
            zIndex: 2
          }}>
            🕊️
          </Box>
        </>
      )}

      {/* CLOSED - Gece Teması (değişmiyor) */}
      {!businessData.isOpen && (
        <>
          {/* Ay - Yeniden konumlandırıldı */}
          <Box sx={{
            position: 'absolute',
            top: '15px',
            right: '15px',
            fontSize: '24px',
            opacity: 0.9,
            animation: 'moon-glow 4s ease-in-out infinite'
          }}>
            🌙
          </Box>
          
          {/* Yıldızlar - Yeniden konumlandırıldı */}
          <Box sx={{
            position: 'absolute',
            top: '15px',
            left: '15px',
            fontSize: '14px',
            opacity: 0.8,
            animation: 'stars-twinkle 2s ease-in-out infinite'
          }}>
            ⭐
          </Box>
          
          <Box sx={{
            position: 'absolute',
            top: '22px',
            left: '40px',
            fontSize: '12px',
            opacity: 0.7,
            animation: 'stars-twinkle 3s ease-in-out infinite 0.5s'
          }}>
            ✨
          </Box>
          
          <Box sx={{
            position: 'absolute',
            top: '12px',
            left: '60px',
            fontSize: '14px',
            opacity: 0.9,
            animation: 'stars-twinkle 2.5s ease-in-out infinite 1s'
          }}>
            ⭐
          </Box>
        </>
      )}      
      
      <Typography 
        variant="body2" 
        fontWeight="bold"
        sx={{ 
          mt: 3.5, // Her iki durum için aynı üst marj
          mb: 0.5,
          fontSize: '1.5rem', // Her iki durum için aynı font boyutu
          letterSpacing: '1px', // Her iki durum için aynı harf aralığı
          transition: 'all 0.3s ease',
          transform: updating ? 'translateY(-2px)' : 'translateY(0)',
          opacity: updating ? 0.7 : 1,
          color: 'white',
          textShadow: businessData.isOpen 
            ? '1px 1px 3px rgba(0,0,0,0.3)' // İnce gölge 
            : '1px 1px 3px rgba(0,0,0,0.3)' // Aynı gölge her iki durum için
        }}
      >
        {businessData.isOpen ? t('restaurantStatus.open') : t('restaurantStatus.closed')}
      </Typography>
      
      <Typography 
        variant="caption"
        sx={{ 
          fontSize: '0.7rem', // Daha küçük font boyutu
          fontWeight: '400', // Daha ince font ağırlığı
          opacity: updating ? 0.4 : 0.7, // Daha düşük opaklık - gri tonu etkisi için
          transition: 'all 0.3s ease',
          transform: updating ? 'translateY(2px)' : 'translateY(0)',
          color: 'rgba(255,255,255,0.75)', // Daha gri tonda
          textShadow: 'none', // Gölge kaldırıldı daha temiz bir görünüm için
          letterSpacing: '0.2px' // Hafif letter spacing
        }}
      >
        {businessData.isOpen ? t('restaurantStatus.clickToClose') : t('restaurantStatus.clickToOpen')}
      </Typography>

      {/* Animated background overlay for state change */}
      <Box sx={{
        position: 'absolute',
        top: 0,
        left: updating ? 0 : '-100%',
        right: 0,
        bottom: 0,
        background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)',
        transition: 'left 0.6s ease-in-out',
        pointerEvents: 'none'
      }} />

      {updating && (
        <Box sx={{ 
          position: 'absolute', 
          top: 0, 
          left: 0, 
          right: 0, 
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.4)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: 1,
          animation: 'fadeIn 0.2s ease-in'
        }}>
          <CircularProgress 
            size={16} 
            sx={{ 
              color: 'white',
              animation: 'pulse 1.5s ease-in-out infinite'
            }} 
          />
        </Box>
      )}      {/* CSS Keyframes for animations */}
      <style>
        {`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        @keyframes sun-pulse {
          0%, 100% { 
            transform: scale(1);
            box-shadow: 0 0 8px rgba(255, 193, 7, 0.6); 
          }
          50% { 
            transform: scale(1.1);
            box-shadow: 0 0 15px rgba(255, 193, 7, 0.8); 
          }
        }
        @keyframes cloud-float {
          0%, 100% { transform: translate(0, 0); }
          50% { transform: translate(2px, -2px); }
        }
        @keyframes bird-drift {
          0%, 100% { transform: translate(0, 0) rotate(5deg); }
          25% { transform: translate(3px, 2px) rotate(-5deg); }
          50% { transform: translate(6px, -2px) rotate(5deg); }
          75% { transform: translate(3px, 1px) rotate(-5deg); }
        }
        @keyframes moon-glow {
          0%, 100% { 
            filter: brightness(1) drop-shadow(0 0 4px rgba(255, 255, 255, 0.6)); 
          }
          50% { 
            filter: brightness(1.3) drop-shadow(0 0 8px rgba(255, 255, 255, 0.9)); 
          }
        }
        @keyframes stars-twinkle {
          0%, 100% { 
            opacity: 0.4; 
            transform: scale(1); 
          }
          50% { 
            opacity: 1; 
            transform: scale(1.2); 
          }
        }
        `}
      </style>
    </Box>
  );
};

export default RestaurantStatusWidget;
