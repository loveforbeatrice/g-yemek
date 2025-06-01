import React, { useState } from 'react';
import {
  Typography,
  Box,
  Tab,
  Tabs,
  Switch,
  FormControl,
  FormControlLabel,
  Select,
  MenuItem,
  Checkbox,
  Button
} from '@mui/material';
import LanguageIcon from '@mui/icons-material/Language';

function Profile() {
  const [activeTab, setActiveTab] = useState('notifications');
  const [notificationSettings, setNotificationSettings] = useState({
    pushNotifications: false,
    pullNotifications: true,
    promotionNotifications: false
  });
  const [language, setLanguage] = useState('tr');
  const [theme, setTheme] = useState('original');
  const [useDeviceTheme, setUseDeviceTheme] = useState(false);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleNotificationChange = (name) => (event) => {
    setNotificationSettings({
      ...notificationSettings,
      [name]: event.target.checked
    });
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
    <Box sx={{ width: '100%', maxWidth: 1200, mx: 'auto', px: 2, pt: 4, pb: 6 }}>
      <Tabs
        value={activeTab}
        onChange={handleTabChange}
        variant="fullWidth"
        aria-label="Settings tabs"
        sx={{
          '& .MuiTab-root': { 
            color: '#666',
            fontFamily: '"Alata", sans-serif',
            fontSize: '1.1rem'
          },
          '& .Mui-selected': { 
            color: '#222', 
            fontWeight: 'bold' 
          },
          '& .MuiTabs-indicator': { 
            backgroundColor: '#ff8800'
          },
          mb: 5
        }}
      >
        <Tab value="account" label="Account" />
        <Tab value="notifications" label="Notifications" />
        <Tab value="language" label="Language" />
        <Tab value="theme" label="Theme" />
      </Tabs>      {/* Account Tab */}
      {activeTab === 'account' && (
        <Box sx={{ py: 2 }}>
          <Typography variant="h2" fontWeight="bold" sx={{ mb: 5, fontFamily: 'Alata, sans-serif', textAlign: 'center' }}>
            Account
          </Typography>

          <Box sx={{ maxWidth: 600, mx: 'auto', mt: 3 }}>
            {/* Personal Information Section */}
            <Box sx={{ mb: 5 }}>
              <Typography variant="h5" fontWeight="bold" sx={{ mb: 3, fontFamily: 'Alata, sans-serif' }}>
                Personal Information
              </Typography>
              
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="body1" sx={{ fontSize: '1.1rem', fontWeight: 500 }}>
                  Full Name:
                </Typography>
                <Typography variant="body1" sx={{ fontSize: '1.1rem' }}>
                  Alp Yılmaz
                </Typography>
              </Box>
              
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="body1" sx={{ fontSize: '1.1rem', fontWeight: 500 }}>
                  Email:
                </Typography>
                <Typography variant="body1" sx={{ fontSize: '1.1rem' }}>
                  alp.yilmaz@example.com
                </Typography>
              </Box>
              
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="body1" sx={{ fontSize: '1.1rem', fontWeight: 500 }}>
                  Phone:
                </Typography>
                <Typography variant="body1" sx={{ fontSize: '1.1rem' }}>
                  +90 555 123 4567
                </Typography>
              </Box>
            </Box>
            
            {/* Security Section */}
            <Box sx={{ mb: 5 }}>
              <Typography variant="h5" fontWeight="bold" sx={{ mb: 3, fontFamily: 'Alata, sans-serif' }}>
                Security
              </Typography>
              
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="body1" sx={{ fontSize: '1.1rem', fontWeight: 500 }}>
                  Password:
                </Typography>
                <Typography variant="body1" sx={{ fontSize: '1.1rem' }}>
                  ••••••••
                </Typography>
              </Box>
              
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="body1" sx={{ fontSize: '1.1rem', fontWeight: 500 }}>
                  Two-factor Authentication:
                </Typography>
                <Typography variant="body1" sx={{ fontSize: '1.1rem', color: '#ff8800', fontWeight: 'bold' }}>
                  Disabled
                </Typography>
              </Box>
            </Box>
            
            {/* Account Settings */}
            <Box sx={{ mb: 3 }}>
              <Typography variant="h5" fontWeight="bold" sx={{ mb: 3, fontFamily: 'Alata, sans-serif' }}>
                Account Settings
              </Typography>
              
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="body1" sx={{ fontSize: '1.1rem', fontWeight: 500 }}>
                  Account Type:
                </Typography>
                <Typography variant="body1" sx={{ fontSize: '1.1rem' }}>
                  Standard User
                </Typography>
              </Box>
              
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="body1" sx={{ fontSize: '1.1rem', fontWeight: 500 }}>
                  Membership Since:
                </Typography>
                <Typography variant="body1" sx={{ fontSize: '1.1rem' }}>
                  January 15, 2024
                </Typography>
              </Box>
              
              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 5 }}>
                <Button 
                  variant="contained" 
                  sx={{ 
                    bgcolor: '#ff8800', 
                    '&:hover': { bgcolor: '#ff6600' },
                    px: 4,
                    py: 1,
                    fontSize: '1.1rem',
                    fontWeight: 'bold',
                    borderRadius: 2
                  }}
                >
                  Sign Out
                </Button>
              </Box>
            </Box>
          </Box>
        </Box>
      )}

      {/* Notifications Tab */}
      {activeTab === 'notifications' && (
        <Box sx={{ py: 2 }}>
          <Typography variant="h2" fontWeight="bold" sx={{ mb: 5, fontFamily: 'Alata, sans-serif', textAlign: 'center' }}>
            Notifications
          </Typography>
          
          <Box sx={{ maxWidth: 600, mx: 'auto' }}>
            <Box sx={{ my: 2 }}>
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
                  />
                }
                label={
                  <Typography sx={{ fontWeight: 500, fontSize: '1.1rem' }}>
                    Allow push notifications
                  </Typography>
                }
              />
            </Box>
            
            <Box sx={{ my: 2 }}>
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
                  />
                }
                label={
                  <Typography sx={{ fontWeight: 500, fontSize: '1.1rem' }}>
                    Allow pull notifications
                  </Typography>
                }
              />
            </Box>
            
            <Box sx={{ my: 2 }}>
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
                  />
                }
                label={
                  <Typography sx={{ fontWeight: 500, fontSize: '1.1rem' }}>
                    Allow promotion notifications
                  </Typography>
                }
              />
            </Box>
          </Box>
        </Box>
      )}

      {/* Language Tab */}
      {activeTab === 'language' && (
        <Box sx={{ py: 2 }}>
          <Typography variant="h2" fontWeight="bold" sx={{ mb: 5, fontFamily: 'Alata, sans-serif', textAlign: 'center' }}>
            Language
          </Typography>
          
          <Box sx={{ maxWidth: 600, mx: 'auto', mt: 4, display: 'flex', alignItems: 'center' }}>
            <LanguageIcon sx={{ mr: 2, fontSize: 28 }} />
            
            <FormControl sx={{ minWidth: 200 }}>
              <Select
                value={language}
                onChange={handleLanguageChange}
                displayEmpty
                sx={{ 
                  height: 48,
                  '&.MuiOutlinedInput-root': {
                    '& fieldset': { borderColor: '#ccc' },
                    '&:hover fieldset': { borderColor: '#ff8800' },
                    '&.Mui-focused fieldset': { borderColor: '#ff8800' }
                  }
                }}
                IconComponent={(props) => (
                  <Box
                    component="div"
                    sx={{
                      ml: '0 !important',
                      mr: 1,
                      fontSize: '1.2rem',
                      color: '#666',
                      transform: 'none !important',
                      transition: 'none !important'
                    }}
                    {...props}
                  >
                    ▼
                  </Box>
                )}
              >
                <MenuItem value="en">English</MenuItem>
                <MenuItem value="tr">Türkçe</MenuItem>
                <MenuItem value="de">Deutsch</MenuItem>
                <MenuItem value="fr">Français</MenuItem>
                <MenuItem value="es">Español</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </Box>
      )}

      {/* Theme Tab */}
      {activeTab === 'theme' && (
        <Box sx={{ py: 2 }}>
          <Typography variant="h2" fontWeight="bold" sx={{ mb: 5, fontFamily: 'Alata, sans-serif', textAlign: 'center' }}>
            Theme
          </Typography>
          
          <Box sx={{ maxWidth: 600, mx: 'auto', mt: 4 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
              <Box 
                sx={{ 
                  width: 40, 
                  height: 40, 
                  borderRadius: '50%', 
                  background: 'linear-gradient(135deg, #ff8800 0%, #ff6611 100%)',
                  mr: 2 
                }} 
              />
              
              <FormControl sx={{ minWidth: 200 }}>
                <Select
                  value={theme}
                  onChange={handleThemeChange}
                  displayEmpty
                  sx={{ 
                    height: 48,
                    '&.MuiOutlinedInput-root': {
                      '& fieldset': { borderColor: '#ccc' },
                      '&:hover fieldset': { borderColor: '#ff8800' },
                      '&.Mui-focused fieldset': { borderColor: '#ff8800' }
                    }
                  }}
                  IconComponent={(props) => (
                    <Box
                      component="div"
                      sx={{
                        ml: '0 !important',
                        mr: 1,
                        fontSize: '1.2rem',
                        color: '#666',
                        transform: 'none !important',
                        transition: 'none !important'
                      }}
                      {...props}
                    >
                      ▼
                    </Box>
                  )}
                >
                  <MenuItem value="original">Original</MenuItem>
                  <MenuItem value="dark">Dark</MenuItem>
                  <MenuItem value="light">Light</MenuItem>
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
              label="Use Device Theme"
            />
          </Box>
        </Box>
      )}
    </Box>
  );
}

export default Profile;
