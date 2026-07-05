import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import mongoose from 'mongoose';
import { errorHandler } from './middleware/errorHandler.js';
import analyzeRoutes from './routes/analyze.js';
import historyRoutes from './routes/history.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/resumematcher';

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'Express Backend Service',
    mongoConnected: mongoose.connection.readyState === 1,
  });
});

// Routes
app.use('/api/analyze', analyzeRoutes);
app.use('/api/history', historyRoutes);

// Error Handling Middleware
app.use(errorHandler);

// Connect to MongoDB & Start Server
const startServer = async () => {
  try {
    await mongoose.connect(MONGO_URI, {
      serverSelectionTimeoutMS: 4000,
    });
    console.log('✅ Successfully connected to MongoDB:', MONGO_URI);
  } catch (err) {
    console.warn('⚠️ MongoDB Connection Notice: Running in memory mode (no DB persistence):', err.message);
  }

  app.listen(PORT, () => {
    console.log(`🚀 Express Backend Server listening on http://localhost:${PORT}`);
  });
};

startServer();
