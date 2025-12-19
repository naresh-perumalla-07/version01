const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const dbURI = process.env.MONGO_URI || process.env.MONGODB_URI || 'mongodb://localhost:27017/blood-bridge';
    console.log(`🔌 Attempting to connect to: ${dbURI.split('@')[1] || 'Localhost'}`); // Mask creds
    
    const conn = await mongoose.connect(dbURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000 // Timeout after 5s instead of 30s
    });

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error(`❌ MongoDB Error: ${error.message}`);
    console.warn('⚠️  RUNNING WITHOUT DATABASE CONNECTION - SOME FEATURES WILL FAIL');
    // process.exit(1); // Removed to allow server start
  }
};

module.exports = connectDB;
