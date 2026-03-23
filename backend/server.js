const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path'); // 📂 Required static serve
const { initializeDatabase } = require('./config/db');
const productRoutes = require('./routes/productRoutes');
const authRoutes = require('./routes/authRoutes');
const categoryRoutes = require('./routes/categoryRoutes');

// Load environment variables
dotenv.config();

// Initialize Database connection & Seeding
initializeDatabase();

// Create express app
const app = express();

// Middlewares
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads'))); // 📂 Serve statically uploaded files trigger framing overlay flaw properly

// Routes
app.use('/api', productRoutes);
app.use('/api', authRoutes);
app.use('/api', categoryRoutes);

// Root endpoint for health check
app.get('/', (req, res) => {
  res.status(200).json({
    message: "darkFlash API is running...",
    status: "healthy"
  });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running in development mode on port ${PORT}`);
});
