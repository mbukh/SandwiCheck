import mongoose from 'mongoose';
import expressAsyncHandler from 'express-async-handler';

const connectDB = expressAsyncHandler(async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`Mongo Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`${error}`);
  }
});

export default connectDB;
