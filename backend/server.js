console.log('🚀 Content Factory Server Starting...');
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const cron = require('node-cron');
require('dotenv').config();

const { runAnalyticsJob } = require('./jobs/analyticsJob');

const app = express();

// ─── Middleware ─────────────────────────────────────────────────────────────
app.use(helmet());
app.use(cors({
  origin: true, // Allow all origins
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
}));
app.use(express.json({ limit: '5mb' }));

// ─── Port Binding (prioritize for Render) ──────────────────────────────────
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`\n🌐 Server running on http://localhost:${PORT}`);
  console.log(`🛠️  Environment: ${process.env.NODE_ENV || 'development'}`);
});

// ─── MongoDB Connection ────────────────────────────────────────────────────
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/content-factory';
mongoose.connect(MONGO_URI)
  .then(() => console.log('🚀 MongoDB connected successfully'))
  .catch(err => {
    console.error('❌ MongoDB connection error:', err.message);
  });

// ─── Health Check ──────────────────────────────────────────────────────────
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', timestamp: new Date().toISOString() });
});

app.get('/', (req, res) => {
  res.send('Content Factory API is running. Use /health for status.');
});

// ─── API Routes ────────────────────────────────────────────────────────────
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/posts', require('./routes/postRoutes'));

// ─── Background Jobs ──────────────────────────────────────────────────────
// Run analytics refresh every 30 minutes
cron.schedule('*/30 * * * *', () => {
  console.log('[Cron] Triggering analytics job...');
  runAnalyticsJob();
});

// ─── Global Error Handler ──────────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong on the server' });
});
