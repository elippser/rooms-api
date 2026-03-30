import mongoose from "mongoose";
import logger from "../utils/logger";

let connectPromise: Promise<void> | null = null;

const connectDB = async (): Promise<void> => {
  const uri = process.env.DATABASE_MDB;
  if (!uri) {
    throw new Error("DATABASE_MDB is not defined in environment variables");
  }

  if (mongoose.connection.readyState === 1) {
    return;
  }

  if (!connectPromise) {
    connectPromise = (async () => {
      try {
        await mongoose.connect(uri);
        logger.info("MongoDB connected");
      } catch (error) {
        connectPromise = null;
        logger.error("MongoDB connection error", { error });
        throw error;
      }
    })();
  }

  await connectPromise;
};

export default connectDB;
