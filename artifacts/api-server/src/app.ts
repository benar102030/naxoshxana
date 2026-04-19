import express, { type Express } from "express";
import cors from "cors";
import pinoHttp from "pino-http";
import router from "./routes";
import { logger } from "./lib/logger";

/**
 * دروستکردنی ئەپلیکەیشنی سەرەکی ئێکسپرێس (Express App)
 * ئەمە خاڵی دەستپێکی سێرڤەرەکەیە و هەموو مێدڵوێرەکان لێرە ڕێکدەخرێن
 */
const app: Express = express();

// ڕێکخستنی سیستەمی لۆگەر (Logging) بۆ تۆمارکردنی هەموو داواکارییەکان
app.use(
  pinoHttp({
    logger,
    serializers: {
      req(req) {
        return {
          id: req.id,
          method: req.method,
          url: req.url?.split("?")[0],
        };
      },
      res(res) {
        return {
          statusCode: res.statusCode,
        };
      },
    },
  }),
);

// ڕێگەدان بە پەیوەندی نێوان فرۆنتێند و باکێند (CORS)
app.use(cors());

// ڕێگەدان بە وەرگرتنی داتا بە شێوازی JSON لە ناو فۆرمەکاندا
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// بەستنەوەی هەموو ڕێڕەوەکانی API کە لە فۆڵدەری routes دیاریکراون
app.use("/api", router);

export default app;
