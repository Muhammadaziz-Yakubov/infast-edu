import mongoose from "mongoose";
import { config } from "../config";
import { logger } from "../utils/logger";

export const connectDatabase = async (): Promise<void> => {
  try {
    const options = {
      autoIndex: true, // Build indexes in production
    };

    mongoose.connection.on("connected", () => {
      logger.info("MongoDB successfully connected to: " + config.MONGO_URI);
    });

    mongoose.connection.on("error", (err) => {
      logger.error("MongoDB connection error: " + err);
    });

    mongoose.connection.on("disconnected", () => {
      logger.warn("MongoDB disconnected");
    });

    await mongoose.connect(config.MONGO_URI, options);
  } catch (error) {
    logger.error("Error connecting to MongoDB: " + error);
    process.exit(1);
  }
};

export const disconnectDatabase = async (): Promise<void> => {
  try {
    await mongoose.disconnect();
    logger.info("MongoDB disconnected successfully");
  } catch (error) {
    logger.error("Error disconnecting from MongoDB: " + error);
  }
};
