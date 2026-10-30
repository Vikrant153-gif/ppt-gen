/**
 * PPT-GEN Server — Main Entry Point
 *
 * Express server that provides:
 *  - User authentication (JWT)
 *  - CRUD API for presentation projects (MongoDB)
 *  - AI-powered slide generation via Google Gemini
 */

require('dotenv').config();

const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

// Import routes
const authRoutes = require('./routes/auth');
const projectRoutes = require('./routes/projects');
const aiRoutes = require('./routes/ai');
const unsplashRoutes = require('./routes/unsplash');

// Import middleware
const errorHandler = require('./middleware/errorHandler');

// ─── App Setup ────────────────────────────────────────────────────────────────

const app = express();
const PORT = process.env.PORT || 5000;

// ─── Middleware ───────────────────────────────────────────────────────────────

// Enable CORS for frontend clients
app.use(cors());

// Parse JSON bodies (up to 10 MB for large slide payloads)
app.use(express.json({ limit: '10mb' }));

// ─── Database Connection ──────────────────────────────────────────────────────

let isConnected = false;

const connectWithRetry = async () => {
  console.log('  ⏳ Connecting to MongoDB...');
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,
    });
    isConnected = true;
    console.log('  ✓ MongoDB connected successfully');
  } catch (err) {
    isConnected = false;
    console.error('  ✗ MongoDB connection pending/failed:', err.message);
    console.log('  → Retrying connection in 5 seconds (check Atlas IP whitelist: 0.0.0.0/0)...');
    setTimeout(connectWithRetry, 5000);
  }
};

// ─── Routes ───────────────────────────────────────────────────────────────────

// Health check (before any auth middleware)
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'PPT-GEN server is running',
    database: isConnected ? 'connected' : 'connecting_or_blocked',
    gemini: process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'your_gemini_api_key_here'
      ? 'configured'
      : 'not_configured',
    timestamp: new Date().toISOString(),
  });
});

// Mount feature routes
app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/unsplash', unsplashRoutes);

// ─── Error Handling ───────────────────────────────────────────────────────────

// 404 handler for unmatched routes
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: `Route not found: ${req.method} ${req.originalUrl}`,
  });
});

// Global error handler (must be last)
app.use(errorHandler);

// ─── Start Server ─────────────────────────────────────────────────────────────

const startServer = () => {
  app.listen(PORT, () => {
    console.log('  ╔══════════════════════════════════════════╗');
    console.log('  ║        PPT-GEN Server is running         ║');
    console.log(`  ║        http://localhost:${PORT}             ║`);
    console.log('  ╚══════════════════════════════════════════╝');
    console.log('');
    console.log(`  → Auth:       http://localhost:${PORT}/api/auth`);
    console.log(`  → Projects:   http://localhost:${PORT}/api/projects`);
    console.log(`  → AI Gen:     http://localhost:${PORT}/api/ai/generate`);
    console.log(`  → AI Actions: http://localhost:${PORT}/api/ai/slide-action`);
    console.log(`  → AI Suggest: http://localhost:${PORT}/api/ai/suggest-slide`);
    console.log(`  → Unsplash:   http://localhost:${PORT}/api/unsplash/search`);
    console.log(`  → Health:     http://localhost:${PORT}/api/health`);
    console.log('');
    console.log(
      process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'your_gemini_api_key_here'
        ? '  ✓ Gemini API key detected'
        : '  ⚠ No GEMINI_API_KEY — AI will return mock data'
    );
    console.log('');

    // Kick off connection with auto-retry
    connectWithRetry();
  });
};

startServer();
