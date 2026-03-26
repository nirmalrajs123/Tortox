const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const { initializeDatabase } = require('./config/db');
const productRoutes = require('./routes/productRoutes');
const authRoutes = require('./routes/authRoutes');
const categoryRoutes = require('./routes/categoryRoutes');

process.on('uncaughtException', (err) => {
  console.error('FATAL UNCAUGHT EXCEPTION:', err);
  process.exit(1);
});
process.on('unhandledRejection', (reason, promise) => {
  console.error('FATAL UNHANDLED REJECTION AT:', promise, 'REASON:', reason);
});
dotenv.config();
console.log("DOTENV LOADED");

const app = express();
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// 🧪 EMERGENCY LOGGING
app.use((req, res, next) => {
  console.log(`[DEBUG] ${req.method} ${req.url}`);
  next();
});

// 🚀 TEST ROUTE (Move to very top)
app.get('/api/test', (req, res) => res.json({ status: "API IS ALIVE" }));

app.use('/api', productRoutes);
app.use('/api', authRoutes);
app.use('/api', categoryRoutes);

app.get('/', (req, res) => res.send('Backend Home'));

const PORT = 5000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`SERVER RUNNING ON PORT ${PORT}`);
  initializeDatabase().catch(err => console.error("DB INIT ERROR:", err));
});
