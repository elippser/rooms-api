/** Consola únicamente: en Vercel el FS es de solo lectura (Winston a archivo fallaba). */

function logLine(level: "log" | "warn" | "error", msg: string, meta?: Record<string, unknown>): void {
  if (meta && Object.keys(meta).length > 0) {
    const err = meta.error;
    if (err instanceof Error) {
      console[level](msg, err.message, err.stack);
      return;
    }
    console[level](msg, meta);
    return;
  }
  console[level](msg);
}

const logger = {
  info: (msg: string, meta?: Record<string, unknown>) => logLine("log", msg, meta),
  warn: (msg: string, meta?: Record<string, unknown>) => logLine("warn", msg, meta),
  error: (msg: string, meta?: Record<string, unknown>) => logLine("error", msg, meta),
};

export default logger;
