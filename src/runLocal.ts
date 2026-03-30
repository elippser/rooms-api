import dotenv from "dotenv";
dotenv.config();

import app from "./server";
import connectDB from "./config/dbCon";
import logger from "./utils/logger";

const PORT = process.env.PORT || 4000;

const start = async (): Promise<void> => {
  await connectDB();
  app.listen(PORT, () => {
    logger.info(`pms-rooms API running on port ${PORT}`);
  });
};

start().catch((err) => {
  logger.error("Failed to start server", { error: err });
  process.exit(1);
});
