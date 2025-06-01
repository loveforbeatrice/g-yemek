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
  Grid
} from '@mui/material';
import LanguageIcon from '@mui/icons-material/Language';
import FlagIcon from '@mui/icons-material/Flag';

function Profile() {
  const [activeTab, setActiveTab] = useState('account');
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
      </Tabs>
                }}
              >
                {profile.name.charAt(0)}
              </Avatar>

              <Typography variant="h6" gutterBottom>
                {profile.name}
              </Typography>

              <List>
                <ListItem>
                  <ListItemIcon>
                    <EmailIcon />
                  </ListItemIcon>
                  <ListItemText primary={profile.email} />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <LocalPhoneIcon />
                  </ListItemIcon>
                  <ListItemText primary={profile.phone} />
                </ListItem>
              </List>

              <Button
                variant="contained"
                fullWidth
                sx={{ mt: 2, bgcolor: '#FFA500', '&:hover': { bgcolor: '#FF8C00' } }}
                onClick={handleLogout}
                startIcon={<LogoutIcon />}
              >
                Çıkış Yap
              </Button>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={8}>
          <Card sx={{ mb: 3, borderRadius: 2, border: '1px solid #FFA500', boxShadow: 'none' }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" component="h2">
                  Kişisel Bilgiler
                </Typography>
                {!editing && (
                  <Button 
                    variant="outlined" 
                    onClick={handleEdit}
                    sx={{ 
                      color: '#FFA500', 
                      borderColor: '#FFA500',
                      '&:hover': { borderColor: '#FF8C00', color: '#FF8C00' } 
                    }}
                  >
                    Düzenle
                  </Button>
                )}
              </Box>

              {editing ? (
                <Box component="form" noValidate autoComplete="off">
                  <TextField
                    fullWidth
                    margin="normal"
                    label="Ad Soyad"
                    name="name"
                    value={editedProfile.name}
                    onChange={handleChange}
                  />
                  <TextField
                    fullWidth
                    margin="normal"
                    label="E-posta"
                    name="email"
                    value={editedProfile.email}
                    onChange={handleChange}
                  />
                  <TextField
                    fullWidth
                    margin="normal"
                    label="Telefon"
                    name="phone"
                    value={editedProfile.phone}
                    onChange={handleChange}
                  />
                  <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
                    <Button 
                      sx={{ mr: 1, color: 'gray' }} 
                      onClick={handleCancel}
                    >
                      İptal
                    </Button>
                    <Button 
                      variant="contained" 
                      onClick={handleSave}
                      sx={{ bgcolor: '#FFA500', '&:hover': { bgcolor: '#FF8C00' } }}
                    >
                      Kaydet
                    </Button>
                  </Box>
                </Box>
              ) : (
                <List>
                  <ListItem>
                    <ListItemIcon>
                      <PersonIcon />
                    </ListItemIcon>
                    <ListItemText primary="Ad Soyad" secondary={profile.name} />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <EmailIcon />
                    </ListItemIcon>
                    <ListItemText primary="E-posta" secondary={profile.email} />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <LocalPhoneIcon />
                    </ListItemIcon>
                    <ListItemText primary="Telefon" secondary={profile.phone} />
                  </ListItem>
                </List>
              )}
            </CardContent>
          </Card>

          <Card sx={{ borderRadius: 2, border: '1px solid #FFA500', boxShadow: 'none' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <HistoryIcon sx={{ mr: 1, color: '#FFA500' }} />
                <Typography variant="h6" component="h2">
                  Geçmiş Siparişlerim
                </Typography>
              </Box>

              {pastOrders.length === 0 ? (
                <Typography variant="body2" color="text.secondary">
                  Henüz sipariş geçmişiniz bulunmamaktadır.
                </Typography>
              ) : (
                pastOrders.map((order, index) => (
                  <React.Fragment key={order.id}>
                    <Box sx={{ my: 2 }}>
                      <Typography variant="subtitle1" fontWeight="bold">
                        Sipariş #{order.id}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {order.date} • {order.status}
                      </Typography>
                      <Box sx={{ mt: 1 }}>
                        {order.items.map((item, i) => (
                          <Typography key={i} variant="body2">
                            • {item}
                          </Typography>
                        ))}
                      </Box>
                      <Typography variant="body1" sx={{ mt: 1, color: '#FFA500', fontWeight: 'bold' }}>
                        Toplam: {order.totalAmount.toFixed(2)} TL
                      </Typography>
                    </Box>
                    {index < pastOrders.length - 1 && <Divider />}
                  </React.Fragment>
                ))
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
}

export default Profile;
