import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { setAuthTokenGetter } from "@workspace/api-client-react";
import { useAuthStore } from "./lib/auth";

/**
 * بەستنەوەی سیستەمی چوونەژوورەوە بە داواکارییەکانی API
 * ئەم فەنکشنە تۆکنی JWT دەدات بە هەموو ئەو بانگکردنانەی کە بۆ سێرڤەر دەچن
 */
setAuthTokenGetter(() => useAuthStore.getState().token);

/**
 * خاڵی دەستپێکردنی ڕێندەرکردنی ڕوکاری بەکارهێنەر (UI)
 * لێرەدا ئەپڵیکەیشنە سەرەکییەکە لەناو ئامرازی 'root' لە لاپەڕەی HTML دادەنرێت
 */
createRoot(document.getElementById("root")!).render(<App />);
