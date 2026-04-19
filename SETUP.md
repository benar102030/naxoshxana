# سیستەمی نەخۆشخانە — ڕێنمایی دامەزراندن

Hospital management system (Kurdish Sorani / RTL). Runs anywhere Node 20+ and PostgreSQL are available — including Antigravity, VS Code, or a plain Linux server.

---

## 1. پێداویستیەکان (Prerequisites)

- **Node.js** ≥ 20
- **pnpm** ≥ 9 (`npm install -g pnpm`)
- **PostgreSQL** ≥ 14 (local, or hosted: Neon / Supabase / Railway / RDS …)

---

## 2. وەرگرتنی کۆد (Get the code)

لە Replit، فایلی پڕۆژەکە دابەزێنە (Download as zip)، یان:

```bash
git clone <your-repo-url> hospital-system
cd hospital-system
```

---

## 3. ژینگە گۆڕاوەکان (Environment variables)

فایلی `.env.example` کۆپی بکە بۆ `.env` و بەهاکانی پڕ بکەرەوە:

```bash
cp .env.example .env
```

| گۆڕاو | شیکار |
|---|---|
| `DATABASE_URL` | URL-ی PostgreSQL ـی تۆ. نموونە: `postgres://user:pass@host:5432/hospital` |
| `JWT_SECRET` | نهێنیەکی دوورودرێژ. دروستی بکە بە: `openssl rand -hex 32` |
| `PORT` | پۆرتی API. بنەڕەتی `8080` (فرۆنتئێند چاوەڕێی ئەمە دەکات). |
| `NODE_ENV` | لە بەرهەمدا (production) دانەی `production`. |

> ⚠️ ئەگەر `JWT_SECRET` لە production دانەنرابێت، API server دەستبەجێ دەوەستێت.

---

## 4. دامەزراندن (Install)

```bash
pnpm install
```

---

## 5. ئامادەکردنی داتابەیس (Database setup)

تابلۆکان دروست بکە و داتای نموونە بنێرە:

```bash
pnpm --filter @workspace/db run db:push
pnpm --filter @workspace/api-server run seed
```

> ئەم دوو فەرمانە پێویستیان بە `DATABASE_URL` ـی ڕاست هەیە.

### بردنی داتاکانت لە Replit بۆ ژینگەی نوێ (ئاڵتەرناتیڤ)

ئەگەر دەتەوێت داتای ئێستای ناو Replit بهێنیتە سەر داتابەیسی نوێ:

```bash
# لە Replit
pg_dump "$DATABASE_URL" > backup.sql

# لە کۆمپیوتەری خۆت / سێرڤەری نوێ
psql "<NEW_DATABASE_URL>" < backup.sql
```

---

## 6. کارپێ‌کردن (Run)

دوو سێرڤەر هەیە — هەردووکیان لە دوو تێرمیناڵی جیادا کاری پێ بکە:

```bash
# Terminal 1 — API server (port 8080)
pnpm --filter @workspace/api-server run dev

# Terminal 2 — Frontend (Vite, default port 5173)
pnpm --filter @workspace/hospital-system run dev
```

پاشان لە وێبگەڕدا بڕۆ بۆ: `http://localhost:5173/`

---

## 7. چوونەژوورەوە (Login)

هەموو بەکارهێنەرە نموونەییەکان وشەی نهێنیان `demo` ـە. لێرەدا چەند نموونە:

| ناوی بەکارهێنەر | ڕۆڵ |
|---|---|
| `admin` | بەڕێوەبەری گشتی |
| `nurse2` | پەرستار |
| `cashier1` | قاسپەخانە (پسوولەکان) |
| `pharma1` | دەرمانخانە |

---

## 8. بنیادکردن بۆ بەرهەم (Production build)

```bash
pnpm --filter @workspace/api-server run build
pnpm --filter @workspace/hospital-system run build

# پاشان
NODE_ENV=production node artifacts/api-server/dist/server.js
# و فایلە static ـەکانی frontend (artifacts/hospital-system/dist) پێشکەش بکە
# بەهۆی هەر web server ـێکەوە (nginx, caddy, ...)
```

---

## پشتگیری (Troubleshooting)

- **API ناژیێ، یان `JWT_SECRET is required`** → `.env` بدۆزەرەوە و `JWT_SECRET` دابنێ.
- **`ECONNREFUSED` لە داتابەیسدا** → `DATABASE_URL` تاقی بکەرەوە بە: `psql "$DATABASE_URL" -c "select 1"`.
- **Frontend هەڵە 401 پیشان دەدات** → دڵنیابە API لەسەر پۆرتی `8080` کاردەکات (یان `vite.config.ts` ڕێکبخەرەوە).
