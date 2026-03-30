import mongoose from "mongoose";
import logger from "../utils/logger";

const connectDB = async (): Promise<void> => {
  const uri = process.env.DATABASE_MDB;
  if (!uri) {
    throw new Error("DATABASE_MDB is not defined in environment variables");
  }

  try {
    await mongoose.connect(uri);
    logger.info("MongoDB connected");
  } catch (error) {
    logger.error("MongoDB connection error", { error });
    throw error;
  }
};

export default connectDB;
