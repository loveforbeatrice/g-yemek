require('dotenv').config();
const express = require('express');
const cors = require('cors');
const sequelize = require('./config/database');

const app = express();
const PORT = process.env.PORT || 3001;
const path = require('path');

app.use(cors());
app.use(express.json());

// Statik dosyaları sunmak için middleware
const fs = require('fs');

// Uploads klasörü yolu - backend/uploads kullan
const uploadsPath = path.resolve(path.join(__dirname, '../uploads'));
console.log('Uploads path (absolute):', uploadsPath);

// Klasör yoksa oluştur
if (!fs.existsSync(uploadsPath)) {
  fs.mkdirSync(uploadsPath, { recursive: true });
  console.log('Created uploads directory');
}

// Statik dosya sunumu
app.use('/uploads', express.static(uploadsPath));
console.log('Serving static files from:', uploadsPath);

// Test için uploads klasörünü listele
fs.readdir(uploadsPath, (err, files) => {
  if (err) {
    console.error('Error reading uploads directory:', err);
  } else {
    console.log('Files in uploads directory:', files);
  }
});
console.log('Serving static files from:', uploadsPath);

// Routes
app.use('/api/menu', require('./routes/menu'));
app.use('/api/addresses', require('./routes/addresses'));
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/favorites', require('./routes/favorites'));
app.use('/api/orders', require('./routes/orders'));
app.use('/api/business', require('./routes/business'));
app.use('/api/categories', require('./routes/categories'));
app.use('/api/analytics', require('./routes/analytics'));

// Database connection and server start
async function startServer() {
  try {
    await sequelize.authenticate();
    console.log('Database connection has been established successfully.');
    
    // Sync database models
    await sequelize.sync({ alter: true });
    console.log('Database models synchronized.');
    
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Unable to connect to the database:', error);
  }
}

startServer(); 