import pino from "pino";

/**
 * سیستەمی تۆمارکردنی هەڵە و چاودێری (Logging System)
 * ئەم بەشە بەرپرسە لە پاشەکەوتکردنی زانیاری دەربارەی کارکردنی سێرڤەر
 */
const isProduction = process.env.NODE_ENV === "production";

export const logger = pino({
  level: process.env.LOG_LEVEL ?? "info",
  // شاردنەوەی زانیاری هەستیار لە لۆگەکاندا بۆ پاراستنی نهێنی بەکارهێنەر
  redact: [
    "req.headers.authorization",
    "req.headers.cookie",
    "res.headers['set-cookie']",
  ],
  // ڕێکخستنی شێوازی نیشاندانی لۆگەکان (بە ڕەنگاوڕەنگی لە کاتی گەشەپێدان)
  ...(isProduction
    ? {}
    : {
        transport: {
          target: "pino-pretty",
          options: { colorize: true },
        },
      }),
});
