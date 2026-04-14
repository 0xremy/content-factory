require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const postRoutes = require('./routes/postRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.get('/debug', (req, res) => {
  res.json({ 
    status: 'Connectivity-Fixed Version Active', 
    time: new Date(),
    mongo_status: mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected'
  });
});

app.use('/api/posts', postRoutes);

const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/content-factory';
const maskedUri = mongoUri.replace(/\/\/.*@/, '//***:***@');
console.log(`Attempting to connect to MongoDB at: ${maskedUri}`);

const mongoOptions = {
  serverSelectionTimeoutMS: 30000, // 30s timeout for server selection
  connectTimeoutMS: 30000,        // 30s timeout for initial connection
  socketTimeoutMS: 30000,         // 30s timeout for sockets
};

async function startServer() {
  try {
    // Wait for the connection to be established before starting the app
    await mongoose.connect(mongoUri, mongoOptions);
    console.log('✅ MongoDB connected successfully');
    
    app.listen(PORT, () => {
      console.log(`🚀 Server is running on port ${PORT}`);
    });
  } catch (err) {
    console.error('❌ MongoDB connection failure:');
    console.error(err);
    // In a production environment on Render, we want the process to exit with an error
    // so the platform knows the deployment failed or the instance needs a restart.
    process.exit(1);
  }
}

// Handle connection errors after initial connection
mongoose.connection.on('error', err => {
  console.error(' MongoDB runtime error:', err);
});

mongoose.connection.on('disconnected', () => {
  console.warn(' MongoDB disconnected. Attempting to reconnect...');
});

startServer();
