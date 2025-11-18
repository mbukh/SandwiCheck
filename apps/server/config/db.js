import mongoose from 'mongoose';
import expressAsyncHandler from 'express-async-handler';
import logger from '../utils/logger.js';

const connectDB = expressAsyncHandler(async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    // SECURITY: Only log host and database name, never the connection string
    logger.info('MongoDB connected', {
      host: conn.connection.host,
      database: conn.connection.name,
      // Explicitly do NOT log: conn.connection.uri or MONGO_URI
    });
  } catch (error) {
    // SECURITY: Error may contain connection string - sanitize it
    logger.error('MongoDB connection error', {
      error: {
        name: error.name,
        message: error.message?.replace(/mongodb[+srv]*:\/\/[^@]+@/gi, 'mongodb://***:***@'), // Mask credentials in connection string
      },
    });
  }
});

export default connectDB;
