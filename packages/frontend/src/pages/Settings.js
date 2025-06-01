import React, { useState, useEffect } from 'react';
import {
  Typography,
  Box,
  Switch,
  FormControl,
  FormControlLabel,
  Select,
  MenuItem,
  Checkbox,
  InputLabel,
  Stack,
  CircularProgress,
  Alert
} from '@mui/material';
import LanguageIcon from '@mui/icons-material/Language';
import FlagIcon from '@mui/icons-material/Flag';
import axios from 'axios';

function Settings() {
  // Bildirim ayarları
  const [notificationSettings, setNotificationSettings] = useState({
    pushNotifications: false,
    pullNotifications: false,
    promotionNotifications: false
  });
  const [notifLoading, setNotifLoading] = useState(true);
  const [notifError, setNotifError] = useState('');
  const [notifSaving, setNotifSaving] = useState(false);

  // Diğer ayarlar
  const [language, setLanguage] = useState('tr');
  const [theme, setTheme] = useState('original');
  const [useDeviceTheme, setUseDeviceTheme] = useState(false);

  // Bildirim ayarlarını backend'den çek
  useEffect(() => {
    const fetchNotifSettings = async () => {
      setNotifLoading(true);
      setNotifError('');
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get('/api/auth/notifications', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setNotificationSettings({
          pushNotifications: res.data.settings.allowPushNotifications,
          pullNotifications: res.data.settings.allowPullNotifications,
          promotionNotifications: res.data.settings.allowPromotionNotifications
        });
      } catch (err) {
        setNotifError('Bildirim ayarları alınamadı.');
      } finally {
        setNotifLoading(false);
      }
    };
    fetchNotifSettings();
  }, []);

  // Switch değişiminde backend'e güncelle
  const handleNotificationChange = (name) => async (event) => {
    const newValue = event.target.checked;
    setNotificationSettings((prev) => ({ ...prev, [name]: newValue }));
    setNotifSaving(true);
    setNotifError('');
    try {
      const token = localStorage.getItem('token');
      await axios.put('/api/auth/notifications', {
        allowPushNotifications: name === 'pushNotifications' ? newValue : notificationSettings.pushNotifications,
        allowPullNotifications: name === 'pullNotifications' ? newValue : notificationSettings.pullNotifications,
        allowPromotionNotifications: name === 'promotionNotifications' ? newValue : notificationSettings.promotionNotifications
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
    } catch (err) {
      setNotifError('Bildirim ayarları güncellenemedi.');
    } finally {
      setNotifSaving(false);
    }
  };

  const handleLanguageChange = (event) => {
    setLanguage(event.target.value);
  };

  const handleThemeChange = (event) => {
    setTheme(event.target.value);
  };

  const handleDeviceThemeChange = (event) => {
    setUseDeviceTheme(event.target.checked);
  };

  return (
    <Box sx={{ width: '100%', minHeight: 'calc(100vh - 100px)', bgcolor: '#fef3e2', display: 'flex', flexDirection: 'column', alignItems: 'center', py: 6 }}>
      <Typography variant="h2" sx={{ fontFamily: 'Alata, sans-serif', fontWeight: 700, fontSize: '2.5rem', color: '#222', mb: 6, textAlign: 'center' }}>
        Settings
      </Typography>

      {/* Notifications Section */}
      <Box sx={{ width: '100%', maxWidth: 420, mb: 6 }}>
        <Typography variant="h5" sx={{ fontWeight: 700, mb: 2, color: '#222', fontFamily: 'Alata, sans-serif' }}>
          Notifications
        </Typography>
        {notifLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}><CircularProgress /></Box>
        ) : (
          <Stack spacing={1.5}>
            <FormControlLabel
              control={
                <Switch
                  checked={notificationSettings.pushNotifications}
                  onChange={handleNotificationChange('pushNotifications')}
                  sx={{
                    '& .MuiSwitch-switchBase.Mui-checked': {
                      color: '#ff8800',
                    },
                    '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                      backgroundColor: '#ff8800',
                    },
                  }}
                  disabled={notifSaving}
                />
              }
              label={<Typography sx={{ fontWeight: 400, fontSize: '1.1rem', color: '#222' }}>Allow push notifications</Typography>}
              sx={{ justifyContent: 'space-between', m: 0 }}
            />
            <FormControlLabel
              control={
                <Switch
                  checked={notificationSettings.pullNotifications}
                  onChange={handleNotificationChange('pullNotifications')}
                  sx={{
                    '& .MuiSwitch-switchBase.Mui-checked': {
                      color: '#ff8800',
                    },
                    '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                      backgroundColor: '#ff8800',
                    },
                  }}
                  disabled={notifSaving}
                />
              }
              label={<Typography sx={{ fontWeight: 400, fontSize: '1.1rem', color: '#222' }}>Allow pull notifications</Typography>}
              sx={{ justifyContent: 'space-between', m: 0 }}
            />
            <FormControlLabel
              control={
                <Switch
                  checked={notificationSettings.promotionNotifications}
                  onChange={handleNotificationChange('promotionNotifications')}
                  sx={{
                    '& .MuiSwitch-switchBase.Mui-checked': {
                      color: '#ff8800',
                    },
                    '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                      backgroundColor: '#ff8800',
                    },
                  }}
                  disabled={notifSaving}
                />
              }
              label={<Typography sx={{ fontWeight: 400, fontSize: '1.1rem', color: '#222' }}>Allow promotion notifications</Typography>}
              sx={{ justifyContent: 'space-between', m: 0 }}
            />
          </Stack>
        )}
        {notifError && <Alert severity="error" sx={{ mt: 2 }}>{notifError}</Alert>}
      </Box>

      {/* Language Section */}
      <Box sx={{ width: '100%', maxWidth: 420, mb: 6 }}>
        <Typography variant="h5" sx={{ fontWeight: 700, mb: 2, color: '#222', fontFamily: 'Alata, sans-serif' }}>
          Language
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', pl: 1 }}>
            <LanguageIcon sx={{ color: '#888', fontSize: 28, mr: 1 }} />
            {language === 'tr' && (
              <img src="https://flagcdn.com/w20/tr.png" alt="TR" style={{ width: 24, height: 16, borderRadius: 2, marginRight: 6 }} />
            )}
          </Box>
          <FormControl sx={{ minWidth: 180 }}>
            <Select
              value={language}
              onChange={handleLanguageChange}
              displayEmpty
              sx={{
                height: 44,
                bgcolor: '#fff',
                borderRadius: 2,
                fontWeight: 500,
                fontSize: '1.1rem',
                pl: 2,
                '& .MuiSelect-select': { display: 'flex', alignItems: 'center' },
                '& fieldset': { borderColor: '#eee' },
                '&:hover fieldset': { borderColor: '#ff8800' },
                '&.Mui-focused fieldset': { borderColor: '#ff8800' }
              }}
              IconComponent={(props) => (
                <Box
                  component="div"
                  sx={{ ml: '0 !important', mr: 1, fontSize: '1.2rem', color: '#666', transform: 'none !important', transition: 'none !important' }}
                  {...props}
                >
                  ▼
                </Box>
              )}
            >
              <MenuItem value="tr">
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <img src="https://flagcdn.com/w20/tr.png" alt="TR" style={{ width: 24, height: 16, borderRadius: 2, marginRight: 8 }} />
                  Türkçe
                </Box>
              </MenuItem>
              <MenuItem value="en">
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <FlagIcon sx={{ color: '#888', fontSize: 20, mr: 1 }} />
                  English
                </Box>
              </MenuItem>
            </Select>
          </FormControl>
        </Box>
      </Box>

      {/* Theme Section */}
      <Box sx={{ width: '100%', maxWidth: 420, mb: 2 }}>
        <Typography variant="h5" sx={{ fontWeight: 700, mb: 2, color: '#222', fontFamily: 'Alata, sans-serif' }}>
          Theme
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
          <Box 
            sx={{ 
              width: 40, 
              height: 40, 
              borderRadius: '50%', 
              background: 'linear-gradient(135deg, #ff8800 0%, #ff6611 100%)',
              mr: 1 
            }} 
          />
          <FormControl sx={{ minWidth: 180 }}>
            <Select
              value={theme}
              onChange={handleThemeChange}
              displayEmpty
              sx={{
                height: 44,
                bgcolor: '#fff',
                borderRadius: 2,
                fontWeight: 500,
                fontSize: '1.1rem',
                pl: 2,
                '& fieldset': { borderColor: '#eee' },
                '&:hover fieldset': { borderColor: '#ff8800' },
                '&.Mui-focused fieldset': { borderColor: '#ff8800' }
              }}
              IconComponent={(props) => (
                <Box
                  component="div"
                  sx={{ ml: '0 !important', mr: 1, fontSize: '1.2rem', color: '#666', transform: 'none !important', transition: 'none !important' }}
                  {...props}
                >
                  ▼
                </Box>
              )}
            >
              <MenuItem value="original">
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Box sx={{ width: 18, height: 12, borderRadius: 1, bgcolor: '#ff8800', mr: 1, border: '1px solid #eee' }} />
                  Original
                </Box>
              </MenuItem>
              <MenuItem value="dark">
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Box sx={{ width: 18, height: 12, borderRadius: 1, bgcolor: '#333', mr: 1, border: '1px solid #eee' }} />
                  Dark
                </Box>
              </MenuItem>
            </Select>
          </FormControl>
        </Box>
        <FormControlLabel
          control={
            <Checkbox
              checked={useDeviceTheme}
              onChange={handleDeviceThemeChange}
              sx={{
                color: '#ccc',
                '&.Mui-checked': {
                  color: '#ff8800',
                },
              }}
            />
          }
          label={<Typography sx={{ fontWeight: 400, fontSize: '1rem', color: '#222' }}>Use Device Theme</Typography>}
          sx={{ ml: 1 }}
        />
      </Box>
    </Box>
  );
}

export default Settings; 