require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const connectDB = require('./config/database');
const errorHandler = require('./middleware/errorHandler');

// Import routes
const authRoutes = require('./routes/auth');
const emergencyRoutes = require('./routes/emergency');
const donationRoutes = require('./routes/donation');
const inventoryRoutes = require('./routes/inventory');

const app = express();

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Disable caching for development
app.set('etag', false);
app.use((req, res, next) => {
  res.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');
  next();
});

// Serve static files from frontend public dir (html)
app.use(express.static(path.join(__dirname, '../frontend/public')));
// Serve CSS and JS specifically
app.use('/css', express.static(path.join(__dirname, '../frontend/css')));
app.use('/js', express.static(path.join(__dirname, '../frontend/js')));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/emergencies', emergencyRoutes);
app.use('/api/donations', donationRoutes);
app.use('/api/inventory', inventoryRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: '🩸 Blood Bridge Server is running!',
    timestamp: new Date(),
  });
});

// Serve frontend (SPA fallback)
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/public/index.html'));
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
  });
});

const http = require('http'); // [NEW]
const socketLib = require('./socket'); // [NEW]

// ... (middleware remains same until app.use(errorHandler))

// Global error handler
app.use(errorHandler);

// Create HTTP Server [NEW]
const server = http.createServer(app);

// Init Socket.io [NEW]
const io = socketLib.init(server);

// Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => { // Changed app.listen to server.listen
  console.log(`
    🩸 ============================================
    🩸 Blood Bridge Server Running!
    🩸 ============================================
    📍 Environment: ${process.env.NODE_ENV}
    🔌 Port: ${PORT}
    📊 Database: MongoDB Atlas
    ⚡ Socket.io: Active
    🌐 URL: http://localhost:${PORT}
    🩸 ============================================
  `);
});
