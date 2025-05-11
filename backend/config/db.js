// backend/config/db.js
const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error('MONGO_URI is not defined in environment variables');
    }

    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB connected: ${conn.connection.host}`);
  } catch (error) {
    console.error('MongoDB connection failed:', error.message);
    if (error.message.includes('bad auth')) {
      console.error('Authentication failed. Please check your MongoDB username and password.');
    } else if (error.message.includes('ENOTFOUND')) {
      console.error('Could not connect to MongoDB. Please check your connection string and network.');
    }
    throw error;
  }
};

module.exports = connectDB;
