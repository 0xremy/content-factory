console.log('🚀 PROFESUI SERVER IS STARTING UP...');
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
require('dotenv').config();

const app = express();

// Middleware
app.use(helmet()); // Security headers
app.use(cors({
  origin: ['https://frontend-five-phi-wdifrhj1u3.vercel.app', 'http://localhost:3000'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));
app.use(express.json()); // Parse JSON bodies

// Prioritize Port Binding for Render Port Scan
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`\n🌐 Server running on http://localhost:${PORT}`);
  console.log(`🛠️  Environment: ${process.env.NODE_ENV || 'development'}`);
});

// MongoDB Connection (Now called AFTER app.listen to prevent blocking startup)
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/x-cms';
mongoose.connect(MONGO_URI)
  .then(() => console.log('🚀 MongoDB connected successfully'))
  .catch(err => {
    console.error('❌ MongoDB connection error: Server will start without DB connection. Some features may be unavailable.', err);
  });

// Health Check Route
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Basic API Route (Placeholder for future modular routes)
app.get('/', (req, res) => {
  res.send('X-CMS Backend is running. Use /health for status.');
});

// API Routes
app.use('/api/auth', require('./routes/authRoutes'));
// Protected routes
// const { authMiddleware } = require('./middleware/authMiddleware');
// app.use('/api/posts', authMiddleware);
app.use('/api/posts', require('./routes/postRoutes'));

// Global Error Handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong on the server' });
});
