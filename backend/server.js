const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const { initializeDatabase } = require('./config/db');
const productRoutes = require('./routes/productRoutes');
const authRoutes = require('./routes/authRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const bannerRoutes = require('./routes/bannerRoutes');
const aplusRoutes = require('./routes/aplusRoutes');

console.log("[BOOT] STAGE 1: IMPORTS_OK");

dotenv.config();
console.log("[BOOT] STAGE 2: DOTENV_LOADED");

// 🛠️ INITIALIZE MANIFEST (FORCE-SYNC DATABASE BEFORE LISTENING)
initializeDatabase().then(() => {
  console.log("[STITCH_HUB] DATABASE_LINK_ESTABLISHED");
}).catch(err => {
  console.error("[STITCH_HUB] CRITICAL_DB_FAILURE:", err);
  process.exit(1);
});

const app = express();
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
console.log("[BOOT] STAGE 3: MIDDLEWARE_OK");

// 🕵️ GLOBAL SIGNAL INTERCEPTOR
app.use((req, res, next) => {
  console.log(`[STITCH_SIGNAL] ${req.method} ${req.url}`);
  next();
});

// 🛣️ Register ALL API channels
// (Priority toggles and hardware manifestations are handled internally by regional routers)
app.use('/api', productRoutes);
app.use('/api', authRoutes);
app.use('/api', categoryRoutes);
app.use('/api', bannerRoutes);
app.use('/api', aplusRoutes);
console.log("[BOOT] STAGE 5: REGIONAL_ROUTES_MOUNTED");

app.get('/api/test', (req, res) => res.json({ status: "API IS ALIVE" }));

app.get('/', (req, res) => res.send('Backend Home'));

const PORT = 5000;
console.log("[BOOT] STAGE 6: READY_TO_LISTEN");

app.listen(PORT, '0.0.0.0', () => {
  console.log(`[STITCH_HUB] SERVER_ONLINE_ON_PORT_${PORT}`);
});
