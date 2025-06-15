import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { 
  Box, 
  Typography, 
  Card, 
  CardContent, 
  Button, 
  Grid, 
  Divider, 
  Snackbar, 
  Alert, 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions,
  Tabs,
  Tab,
  Badge,
  IconButton,
  Switch,
  FormControlLabel,
  Tooltip,
  Paper
} from '@mui/material';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';
import VolumeMuteIcon from '@mui/icons-material/VolumeMute';
import InfoIcon from '@mui/icons-material/Info';
import RefreshIcon from '@mui/icons-material/Refresh';
import BusinessLayout from '../components/BusinessLayout';
import ResponsivePageTitle from '../components/ResponsivePageTitle';
import { useLanguage } from '../contexts/LanguageContext';

function BusinessOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [rejectDialog, setRejectDialog] = useState({ open: false, orderId: null });
  const [activeTab, setActiveTab] = useState(0);
  const [orderCounts, setOrderCounts] = useState({ idleOrders: 0, awaitingDelivery: 0 });
  const [previousCount, setPreviousCount] = useState(0);
  const [soundEnabled, setSoundEnabled] = useState(() => {
    const savedPreference = localStorage.getItem('orderSoundEnabled');
    return savedPreference !== null ? savedPreference === 'true' : true;
  });
  const [knownOrderIds, setKnownOrderIds] = useState(new Set());
  const [debugInfo, setDebugInfo] = useState({});
  const audioRef = useRef(null);
  const { t } = useLanguage();
  
  // API isteklerinde kullanılacak token ve headers
  const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return { headers: { Authorization: `Bearer ${token}` } };
  };

  // Debug - kullanıcı bilgilerini göster
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user'));
    const token = localStorage.getItem('token');
    setDebugInfo({
      userId: user?.id,
      userName: user?.name,
      isBusiness: user?.isBusiness,
      tokenExists: Boolean(token),
      tokenSnippet: token ? token.substring(0, 15) + '...' : 'No token'
    });
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const endpoint = activeTab === 0 ? '/api/orders/business/idle' : '/api/orders/business/awaiting-delivery';
      const res = await axios.get(`http://localhost:3001${endpoint}`, getAuthHeaders());
      console.log('Siparişler alındı:', res.data);
      setOrders(res.data);
      setError(null);
    } catch (err) {
      console.error('Siparişler yüklenirken hata:', err);
      setError(`Hata: ${err.response?.status} - ${err.response?.data?.message || err.message}`);
    } finally {
      setLoading(false);
    }
  };  // Son bildirim zamanını takip etmek için referans
  const lastNotificationTime = useRef(0);
  
  // Sipariş sayısını ve yeni siparişleri kontrol eden fonksiyon
  const fetchOrderCounts = async (skipSoundNotification = false) => {
    try {
      // Sipariş sayılarını al
      const res = await axios.get('http://localhost:3001/api/orders/business/counts', getAuthHeaders());
      
      // Bekleyen sipariş sayısını kaydet
      const newIdleOrders = res.data.idleOrders;
      
      // Sipariş sayısı değiştiyse tüm siparişleri al 
      if (newIdleOrders > 0) {
        try {
          // İşlenmemiş siparişleri al
          const ordersResponse = await axios.get('http://localhost:3001/api/orders/business/idle', getAuthHeaders());
          const currentOrders = ordersResponse.data;
          
          // Yeni siparişleri bul
          const currentOrderIds = new Set(currentOrders.map(order => order.id));
          const newOrders = currentOrders.filter(order => !knownOrderIds.has(order.id));
          
          // Yeni siparişler varsa ve ses çalma atlanmaması gerekiyorsa ses çal
          const currentTime = Date.now();
          const timeSinceLastNotification = currentTime - lastNotificationTime.current;
          
          if (newOrders.length > 0 && !skipSoundNotification) {
            // En az 3 saniye geçtiyse bildirim ver (üst üste bildirimleri önle)
            if (timeSinceLastNotification > 3000) {
              console.log(`${newOrders.length} yeni sipariş algılandı`);
              
              // Bildirim göster
              const message = `Yeni sipariş geldi! Bekleyen siparişler: ${newIdleOrders}`;
              
              // Ses çal ve bildirim göster
              notifyNewOrder(message);
              
              // Son bildirim zamanını güncelle
              lastNotificationTime.current = currentTime;
            } else {
              console.log('Kısa süre önce bildirim verildi, tekrar bildirim atlanıyor');
            }
            
            // Siparişleri UI'da güncelle
            setOrders(currentOrders);
          }
          
          // Bilinen sipariş kimliklerini güncelle
          setKnownOrderIds(currentOrderIds);
        } catch (error) {
          console.error('Siparişleri kontrol ederken hata:', error);
        }
      }
      
      // Sipariş sayısını güncelle
      setPreviousCount(newIdleOrders);
      setOrderCounts(res.data);
    } catch (err) {
      console.error('Sipariş sayıları alınırken hata:', err);
      // Hata bilgilerini göster
      setDebugInfo(prevState => ({
        ...prevState,
        lastError: {
          status: err.response?.status,
          message: err.response?.data?.message || err.message
        }
      }));
    }
  };
  // Manuel sipariş yenileme
  const handleRefresh = () => {
    fetchOrders();
    fetchOrderCounts(true); // Ses bildirimi olmadan
    setSnackbar({ open: true, message: 'Siparişler yenileniyor...', severity: 'info' });
  };

  // Sayfa yüklendiğinde siparişleri çek
  useEffect(() => { 
    fetchOrders();
    fetchOrderCounts(true); // İlk yüklemede ses bildirimi olmadan
  }, [activeTab]);  // Periyodik olarak sipariş sayısını kontrol et
  useEffect(() => {
    // İlk açılışta hemen kontrol et (ses olmadan)
    fetchOrderCounts(true);
    
    // İlk yükleme sonrası, bilinen sipariş IDs'i doldurmak için bir kez siparişleri yükle
    const initializeKnownOrderIds = async () => {
      try {
        const res = await axios.get('http://localhost:3001/api/orders/business/idle', getAuthHeaders());
        // Mevcut siparişleri kaydet
        const ids = new Set(res.data.map(order => order.id));
        setKnownOrderIds(ids);
        console.log('Sipariş takibi başlatıldı, mevcut siparişler kaydedildi.');
      } catch (err) {
        console.error('Başlangıç siparişleri yüklenemedi:', err);
      }
    };
    
    initializeKnownOrderIds();
    
    // Düzenli olarak kontrol için iki farklı zamanlayıcı kullanacağız:
    // 1. Normal polling (3 saniyelik - hızlı yanıt için)
    // 2. Detaylı polling (15 saniyelik - normal güncellemeler için)
    
    // Normal polling - yeni sipariş kontrolü (ses bildirimli)
    const normalIntervalId = setInterval(() => {
      fetchOrderCounts(false); // Ses bildirimi açık
    }, 3000); // Her 3 saniyede bir kontrol et
    
    // Detaylı polling - tam sipariş içeriği
    const detailedIntervalId = setInterval(() => {
      fetchOrders(); // Siparişlerin tam içeriğini güncelle
    }, 15000); // Her 15 saniyede bir tam güncelleme
    
    // Kullanıcı sayfayı aktif olarak görüntülediğinde kontrol sıklığını artır
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        // Sayfa görünür olduğunda hemen güncelle
        fetchOrderCounts(false); // Ses bildirimi açık
        fetchOrders();
      }
    };
    
    // Sayfa görünürlük değişimlerini dinle
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      // Zamanlayıcıları ve dinleyicileri temizle
      clearInterval(normalIntervalId);
      clearInterval(detailedIntervalId);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);
    // Ses ayarını localStorage'a kaydet
  useEffect(() => {
    localStorage.setItem('orderSoundEnabled', soundEnabled ? 'true' : 'false');
  }, [soundEnabled]);
  
  // Diğer sekmelerden gelen ses ayarı değişikliklerini izle
  useEffect(() => {
    const handleStorageChange = (event) => {
      if (event.key === 'orderSoundEnabled') {
        setSoundEnabled(event.newValue === 'true');
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);// Sayfa yüklendiğinde ses özelliğini hazırla
  useEffect(() => {
    // Ses API'sini başlatma
    if (!audioRef.current) return;
    
    // Ses dosyasını yükle
    audioRef.current.load();
    
    // Kullanıcı etkileşimi oluşursa ses API'sini kilidi aç
    const unlockAudioOnUserInteraction = () => {
      if (!audioRef.current) return;
      
      // Ses API'sini hazırla
      audioRef.current.play()
        .then(() => {
          // Başarılı - sesi hemen durdur
          audioRef.current.pause();
          audioRef.current.currentTime = 0;
        })
        .catch(() => {
          // Başarısız - önemli değil, kullanıcı etkileşimi gerekiyor
        });
    };
    
    // Sayfadaki temel etkileşimlerde ses API'sini hazırlamaya çalış
    document.addEventListener('click', unlockAudioOnUserInteraction);
    document.addEventListener('touchstart', unlockAudioOnUserInteraction);
    document.addEventListener('keydown', unlockAudioOnUserInteraction);
    
    // Ses dosyası yüklendiğinde
    audioRef.current.addEventListener('canplaythrough', () => {
      // Ses dosyası hazır, artık çalınabilir
    });
    
    return () => {
      // Temizlik
      document.removeEventListener('click', unlockAudioOnUserInteraction);
      document.removeEventListener('touchstart', unlockAudioOnUserInteraction);
      document.removeEventListener('keydown', unlockAudioOnUserInteraction);
    };
  }, []);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };
  const handleConfirm = async (orderIds) => {
    try {
      if (!Array.isArray(orderIds)) orderIds = [orderIds];
      await Promise.all(orderIds.map(orderId =>
        axios.patch(`http://localhost:3001/api/orders/${orderId}/accept`, {}, getAuthHeaders())
      ));
      setSnackbar({ open: true, message: t('businessOrders.ordersConfirmed'), severity: 'success' });
      
      // Sipariş onaylama işleminden sonra siparişleri yenile
      fetchOrders();
      
      // Ses bildirimi olmadan sipariş sayılarını güncelle
      // true parametresi ses bildirimini geçmek için
      fetchOrderCounts(true);
    } catch (err) {
      console.error('Siparişler onaylanırken hata:', err);
      setSnackbar({ open: true, message: t('businessOrders.ordersNotConfirmed'), severity: 'error' });
    }
  };
  const handleReject = async () => {
    try {
      await axios.patch(`http://localhost:3001/api/orders/${rejectDialog.orderId}/reject`, {}, getAuthHeaders());
      setSnackbar({ open: true, message: t('businessOrders.orderRejected'), severity: 'success' });
      setRejectDialog({ open: false, orderId: null });
      fetchOrders();
      fetchOrderCounts(true); // Ses bildirimi olmadan
    } catch (err) {
      console.error('Sipariş reddedilirken hata:', err);
      setSnackbar({ open: true, message: t('businessOrders.orderNotRejected'), severity: 'error' });
    }
  };

  const handleMarkAsDelivered = async (orderIds) => {
    try {
      if (!Array.isArray(orderIds)) orderIds = [orderIds];
      await Promise.all(orderIds.map(orderId =>
        axios.patch(`http://localhost:3001/api/orders/${orderId}/done`, {}, getAuthHeaders())
      ));
      setSnackbar({ open: true, message: t('businessOrders.ordersDelivered'), severity: 'success' });
      fetchOrders();
      fetchOrderCounts(true); // Ses bildirimi olmadan
    } catch (err) {
      console.error('Siparişler teslim edildi olarak işaretlenirken hata:', err);
      setSnackbar({ open: true, message: t('businessOrders.ordersNotDelivered'), severity: 'error' });
    }
  };

  const handleSoundToggle = () => {
    setSoundEnabled(!soundEnabled);
  };  // Test ses çalma - butondan çağrıldığında ses çal (basitleştirilmiş)
  const testSound = () => {
    // Zaten bir ses çalınıyorsa çalma
    if (audioRef.current && !audioRef.current.paused) {
      console.log('Zaten bir ses çalınıyor');
      return;
    }
    
    if (!audioRef.current) return;
    
    // Ses durumunu kontrol et
    if (audioRef.current.readyState < 2) {
      audioRef.current.load();
    }
    
    // Hazırlıkları yap
    audioRef.current.muted = false;
    audioRef.current.volume = 1.0;
    audioRef.current.currentTime = 0;
    
    // Sesi çal
    audioRef.current.play()
      .then(() => {
        console.log('Test sesi başarıyla çalındı');
      })
      .catch((error) => {
        console.log('Ses çalma hatası:', error);
        // Herhangi bir hata oluşursa bildirim göster
        setSnackbar({
          open: true,
          message: 'Tarayıcınız ses çalmaya izin vermiyor. Gizlilik ayarlarınızı kontrol edin.',
          severity: 'warning'
        });
      });
  };// Bildirim sesi çalma fonksiyonu - basitleştirilmiş hali
  const playNotificationSound = () => {
    // Ses çalma işlemi devam ediyorsa çıkış yap (çakışmaları önle)
    if (audioRef.current && !audioRef.current.paused) {
      console.log('Zaten bir ses çalınıyor, tekrar çalma atlandı');
      return;
    }
    
    // Ses kapalıysa çıkış yap
    if (!soundEnabled) {
      return;
    }
    
    if (!audioRef.current) {
      return;
    }
    
    // Ses ayarlarını yap
    audioRef.current.muted = false;
    audioRef.current.volume = 1.0;
    audioRef.current.currentTime = 0;
    
    // Sesi çal
    const playPromise = audioRef.current.play();
    
    if (playPromise !== undefined) {
      playPromise
        .then(() => {
          console.log('Bildirim sesi çalındı');
        })
        .catch(error => {
          console.log('Ses çalınamadı:', error);
        });
    }
  };
    // Bildirim gösterme fonksiyonu
  const showNotification = (message, severity = 'info') => {
    // Snackbar bildirimini göster
    setSnackbar({
      open: true,
      message: message,
      severity: severity,
      autoHideDuration: 5000
    });
  };
    // Hem ses çalma hem de bildirim gösterme işlemini birleştiren fonksiyon
  const notifyNewOrder = (message) => {
    // Ses çal
    playNotificationSound();
    
    // Bildirim göster (başarılı bildirim olduğu için success severity)
    showNotification(message, 'success');
  };

  function groupOrders(orders) {
    const groups = {};
    orders.forEach(order => {
      const userId = order.userId || order.user_id || order.user?.id || order.user?.userId || order.userName || 'unknown';
      const date = new Date(order.createdAt);
      const minuteKey = `${userId}_${date.getFullYear()}-${date.getMonth()+1}-${date.getDate()}_${date.getHours()}:${date.getMinutes()}`;
      if (!groups[minuteKey]) {
        groups[minuteKey] = {
          userId,
          userName: order.userName || order.user?.name || t('businessOrders.customer'),
          address: order.address,
          createdAt: order.createdAt,
          orders: [],
          notes: [],
          total: 0,
          ids: [],
        };
      }
      groups[minuteKey].orders.push(order);
      groups[minuteKey].notes.push(order.note);
      groups[minuteKey].total += (order.menuItem?.price || 0) * order.quantity;
      groups[minuteKey].ids.push(order.id);
    });
    return Object.values(groups);
  }
  
  return (
    <BusinessLayout>      {/* Ses dosyası - basitleştirilmiş */}
      <audio 
        ref={audioRef} 
        src="/sounds/order-notification.mp3" 
        preload="auto"
      />        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <ResponsivePageTitle 
          sx={{ 
            fontSize: { xs: '1.25rem', sm: '1.5rem', md: '1.75rem' } 
          }}
        >
          {t('businessOrders.title')}
        </ResponsivePageTitle>
        
        {/* Butonlar gizlendi ama işlevsellik korundu - gizli elemanlar ile */}
        <Box sx={{ display: 'none' }}>
          <IconButton onClick={handleRefresh}>
            <RefreshIcon />
          </IconButton>
          <IconButton onClick={handleSoundToggle}>
            <VolumeUpIcon />
          </IconButton>
          <Button onClick={testSound}>Test</Button>
        </Box>
        
        {/* 5 dakikada bir otomatik yenileme için timer ekle */}
        <Box sx={{ display: 'none' }}>
          {useEffect(() => {
            const timer = setInterval(() => {
              handleRefresh();
            }, 300000); // 5 dakikada bir
            return () => clearInterval(timer);
          }, [])}
        </Box>
      </Box>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}        <Box sx={{ mb: 3, maxWidth: '100%', overflowX: 'hidden' }}>          <Tabs 
            value={activeTab} 
            onChange={handleTabChange} 
            aria-label="order status tabs"
            variant="standard"
            sx={{
              '& .MuiTabs-flexContainer': {
                borderBottom: '1px solid rgba(0, 0, 0, 0.12)',
              },
              '& .MuiTab-root': {
                textTransform: 'none',
                fontSize: { xs: '0.75rem', sm: '0.875rem', md: '1rem' },
                fontWeight: 500,
                color: 'text.primary',
                opacity: 0.7,
                '&.Mui-selected': {
                  fontWeight: 700,
                  color: '#ff8800',
                  opacity: 1
                },
                minWidth: 0,
                py: 1.5,
                px: { xs: 1, sm: 2, md: 3 },
                height: 'auto',
                minHeight: { xs: '60px', sm: '56px' }
              }
            }}
            TabIndicatorProps={{
              style: {
                backgroundColor: '#ff8800',
                height: 3
              }
            }}
          >
            <Tab 
              label={
                <Box 
                  sx={{ 
                    display: 'flex', 
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 1
                  }}
                >
                  <Box sx={{ 
                    maxWidth: '100%', 
                    textAlign: 'center',
                    whiteSpace: 'nowrap',
                    lineHeight: 1.3
                  }}>
                    {t('businessOrders.idleOrders')}
                  </Box>
                  {orderCounts.idleOrders > 0 && (
                    <Box 
                      component="span" 
                      sx={{ 
                        display: 'inline-flex',
                        bgcolor: '#ff8800',
                        color: 'white',
                        borderRadius: '12px',
                        minWidth: '22px',
                        height: '22px',
                        fontSize: '0.75rem',
                        fontWeight: 'bold',
                        alignItems: 'center',
                        justifyContent: 'center',
                        lineHeight: 1,
                        px: 1
                      }}
                    >
                      {orderCounts.idleOrders}
                    </Box>
                  )}
                </Box>
              } 
            />
            <Tab 
              label={
                <Box 
                  sx={{ 
                    display: 'flex', 
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 1
                  }}
                >
                  <Box sx={{ 
                    maxWidth: '100%', 
                    textAlign: 'center',
                    whiteSpace: 'nowrap',
                    lineHeight: 1.3
                  }}>
                    {t('businessOrders.awaitingDelivery')}
                  </Box>
                  {orderCounts.awaitingDelivery > 0 && (
                    <Box 
                      component="span" 
                      sx={{ 
                        display: 'inline-flex',
                        bgcolor: '#ff8800',
                        color: 'white',
                        borderRadius: '12px',
                        minWidth: '22px',
                        height: '22px',
                        fontSize: '0.75rem',
                        fontWeight: 'bold',
                        alignItems: 'center',
                        justifyContent: 'center',
                        lineHeight: 1,
                        px: 1
                      }}
                    >
                      {orderCounts.awaitingDelivery}
                    </Box>
                  )}
                </Box>
              } 
            />
          </Tabs>
        </Box>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 6 }}><Typography>{t('loading')}</Typography></Box>
      ) : (
        <Grid container direction="column" spacing={3}>
          {orders.length === 0 ? (
            <Typography align="center" color="text.secondary">
              {activeTab === 0 ? t('businessOrders.noIdleOrders') : t('businessOrders.noAwaitingDelivery')}
            </Typography>
          ) : (
            groupOrders(orders).map((group, idx) => (
              <Grid item key={group.ids.join('-')}>
                <Card sx={{ border: '1px solid #80cbc4', borderRadius: 2, p: 2 }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="h6" sx={{ fontWeight: 'bold' }}>{group.userName}</Typography>
                        <Box sx={{ mb: 1 }}>
                          {group.orders.map((order, i) => (
                            <Box key={order.id} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <Typography variant="body2">
                                {order.menuItem?.productName} <b>{order.quantity}x</b>
                              </Typography>
                              <Typography variant="body2" sx={{ fontWeight: 'bold', minWidth: 70, textAlign: 'right' }}>
                                ₺{(order.menuItem?.price * order.quantity).toFixed(2)}
                              </Typography>
                            </Box>
                          ))}
                        </Box>
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>{group.address}</Typography>
                        {(group.notes && group.notes.filter(Boolean).length > 0) && (
                          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
                            {t('businessOrders.note')}: {group.notes.filter(Boolean).join(', ')}
                          </Typography>
                        )}
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
                          {new Date(group.createdAt).toLocaleString('tr-TR')}
                        </Typography>
                        <Box sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', mt: 1 }}>
                          <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                            {t('businessOrders.total')}: ₺{typeof group.total === 'number' ? group.total.toFixed(2) : '0.00'}
                          </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', flexDirection: 'row', gap: 1, mt: 2, justifyContent: 'flex-end' }}>
                          {activeTab === 0 ? (
                            <>
                              <Button 
                                size="small" 
                                variant="contained" 
                                sx={{ bgcolor: '#1ed760', color: '#fff', fontWeight: 'bold', minWidth: 60, px: 2 }} 
                                onClick={() => handleConfirm(group.ids)}
                              >
                                {t('businessOrders.confirm')}
                              </Button>
                              <Button 
                                size="small" 
                                variant="contained" 
                                sx={{ bgcolor: '#ff4d4f', color: '#fff', fontWeight: 'bold', minWidth: 60, px: 2 }} 
                                onClick={() => setRejectDialog({ open: true, orderId: group.ids[0] })}
                              >
                                {t('businessOrders.reject')}
                              </Button>
                            </>
                          ) : (
                            <Button 
                              size="small" 
                              variant="contained" 
                              sx={{ bgcolor: '#1ed760', color: '#fff', fontWeight: 'bold', minWidth: 60, px: 2 }} 
                              onClick={() => handleMarkAsDelivered(group.ids)}
                            >
                              {t('businessOrders.markAsDelivered')}
                            </Button>
                          )}
                        </Box>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))
          )}
        </Grid>
      )}
      
      <Snackbar 
        open={snackbar.open} 
        autoHideDuration={3000} 
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert 
          onClose={() => setSnackbar({ ...snackbar, open: false })} 
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
      
      <Dialog 
        open={rejectDialog.open} 
        onClose={() => setRejectDialog({ open: false, orderId: null })}
        PaperProps={{
          sx: {
            borderRadius: 2,
            minWidth: { xs: '90%', sm: 400 }
          }
        }}
      >
        <DialogTitle sx={{ 
          bgcolor: '#fff3f3', 
          color: '#ff4d4f',
          borderBottom: '1px solid #ffcdd2',
          fontWeight: 'bold'
        }}>
          {t('businessOrders.rejectConfirm')}
        </DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          <Typography>
            {t('businessOrders.rejectWarning')}
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2, borderTop: '1px solid #eee' }}>
          <Button 
            onClick={() => setRejectDialog({ open: false, orderId: null })}
            sx={{ 
              color: '#666',
              '&:hover': { bgcolor: '#f5f5f5' }
            }}
          >
            {t('businessOrders.no')}
          </Button>
          <Button 
            onClick={handleReject}
            variant="contained"
            sx={{ 
              bgcolor: '#ff4d4f',
              color: '#fff',
              '&:hover': { bgcolor: '#ff7875' }
            }}
          >
            {t('businessOrders.yes')}
          </Button>
        </DialogActions>
      </Dialog>
    </BusinessLayout>
  );
}

export default BusinessOrders;