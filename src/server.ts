import express, { Application, Request, Response, NextFunction } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import logger from "./utils/logger";
import unitRouter from "./routes/unitRouter";
import categoryRouter from "./routes/categoryRouter";
import publicRouter from "./routes/publicRouter";

dotenv.config();

const app: Application = express();

app.use(cors());
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));

app.use((req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();
  res.on("finish", () => {
    logger.info(`${req.method} ${req.originalUrl} ${res.statusCode} ${Date.now() - start}ms`);
  });
  next();
});

app.use("/api/v1/public/properties", publicRouter);
app.use("/api/v1/properties", categoryRouter);
app.use("/api/v1/properties", unitRouter);

app.get("/health", (_req: Request, res: Response) => {
  res.status(200).json({ status: "ok" });
});

app.use((_req: Request, res: Response) => {
  logger.warn(`404 — ${_req.method} ${_req.originalUrl}`);
  res.status(404).json({ message: "Route not found" });
});

app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  logger.error(err.message, { stack: err.stack });
  res.status(500).json({ message: err.message || "Internal server error" });
});

export default app;
