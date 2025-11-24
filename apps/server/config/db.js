import mongoose from 'mongoose';
import logger from '../utils/logger.js';

const connectDB = async () => {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error('MONGO_URI environment variable is not set');
    }

    const conn = await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 5000, // 5 seconds - fail fast if MongoDB is not available
      connectTimeoutMS: 5000, // 5 seconds - timeout for initial connection
    });
    // SECURITY: Only log host and database name, never the connection string
    logger.info('MongoDB connected', {
      host: conn.connection.host,
      database: conn.connection.name,
      // Explicitly do NOT log: conn.connection.uri or MONGO_URI
    });
  } catch (error) {
    // SECURITY: Error may contain connection string - sanitize it
    const sanitizedMessage = error.message?.replaceAll(/mongodb[+srv]*:\/\/[^@]+@/gi, 'mongodb://***:***@');
    logger.error('MongoDB connection error', {
      error: {
        name: error.name,
        message: sanitizedMessage,
      },
    });
    // Re-throw to prevent server from starting without database
    throw error;
  }
};

export default connectDB;
