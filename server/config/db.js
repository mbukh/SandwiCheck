import mongoose from 'mongoose';
import expressAsyncHandler from 'express-async-handler';

const connectDB = expressAsyncHandler(async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`Mongo Connected: ${conn.connection.host}`.cyan.underline);
  } catch (error) {
    console.log(`${error}`.red.bold);
  }
});

export default connectDB;
