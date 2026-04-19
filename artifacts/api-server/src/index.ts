import app from "./app";
import { logger } from "./lib/logger";

/**
 * خاڵی دەستپێکردنی ڕاستەقینەی سێرڤەر
 * لێرەدا ژمارەی پۆرت (Port) دیاری دەکرێت و سێرڤەرەکە دەخرێتە گەڕ
 */
const rawPort = process.env["PORT"];

// دڵنیابوونەوە لەوەی کە پۆرت دیاریکراوە لە نێوان گۆڕاوەکانی ژینگەدا
if (!rawPort) {
  throw new Error(
    "PORT environment variable is required but was not provided.",
  );
}

const port = Number(rawPort);

// پشکنین بۆ دروستی ژمارەی پۆرتەکە
if (Number.isNaN(port) || port <= 0) {
  throw new Error(`Invalid PORT value: "${rawPort}"`);
}

/**
 * دەستپێکردنی گوێگرتنی سێرڤەر لەسەر پۆرتی دیاریکراو
 */
app.listen(port, (err) => {
  if (err) {
    logger.error({ err }, "Error listening on port");
    process.exit(1);
  }

  logger.info({ port }, "Server listening");
});
