import winston from "winston";
import path from "path";

const logDir = path.join(process.cwd(), "logs");

export const logger = winston.createLogger({
  level: process.env.NODE_ENV === "production" ? "info" : "debug",
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(winston.format.colorize(), winston.format.simple()),
    }),
    new winston.transports.File({ filename: path.join(logDir, "combined.log") }),
    new winston.transports.File({ filename: path.join(logDir, "error.log"), level: "error" }),
  ],
});
