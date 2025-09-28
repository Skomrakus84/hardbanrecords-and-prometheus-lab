# 🖥️ ETAP 2: RENDER BACKEND DEPLOYMENT

## Przygotowanie przed deployment

### ✅ Wymagania spełnione:
- [x] Kod w GitHub repository
- [x] `render.yaml` skonfigurowany
- [x] Health check endpoints gotowe
- [x] Security middleware włączony
- [x] Environment variables template ready

## Krok 1: Utwórz Web Service na Render

1. **Przejdź do**: https://render.com
2. **Zaloguj się** GitHub account
3. **New** → **Web Service**
4. **Connect Repository**: `Skomrakus84/HardbanRecords-`
5. **Konfiguracja**:
   ```
   Name: hardbanrecords-api
   Runtime: Node
   Build Command: cd backend && npm install
   Start Command: cd backend && npm start
   Instance Type: Free
   ```

## Krok 2: Environment Variables (KLUCZOWE!)

W Render Dashboard → Environment Variables, dodaj:

```env
# Database (z Etapu 1 - Supabase)
DATABASE_URL=postgresql://postgres:[PASSWORD]@db.[PROJECT-ID].supabase.co:5432/postgres

# Supabase Configuration
SUPABASE_URL=https://[PROJECT-ID].supabase.co
SUPABASE_SERVICE_ROLE_KEY=[SERVICE-ROLE-KEY-Z-SUPABASE]
SUPABASE_ANON_KEY=[ANON-KEY-Z-SUPABASE]
SUPABASE_BUCKET_NAME=hardbanrecords-files

# JWT Security (GENERATE STRONG SECRETS!)
JWT_SECRET=[RANDOM-32-CHAR-STRING]
REFRESH_TOKEN_SECRET=[DIFFERENT-32-CHAR-STRING]
JWT_EXPIRES_IN=15m
REFRESH_TOKEN_EXPIRES_IN=7d

# Server Configuration
NODE_ENV=production
PORT=10000
CORS_ORIGIN=https://[TWOJA-DOMENA].vercel.app

# Optional AI Services
GOOGLE_API_KEY=[OPTIONAL]
GROQ_API_KEY=[OPTIONAL]

# Security
LOG_LEVEL=info
RATE_LIMIT_WINDOW=900000
RATE_LIMIT_MAX_REQUESTS=100
SESSION_SECRET=[RANDOM-STRING]
MAX_FILE_SIZE=52428800
```

## Krok 3: Deploy & Verify

1. **Deploy** - Render automatically builds
2. **Monitor Logs** - sprawdź czy deployment się powiódł
3. **Test Health Check**:
   ```bash
   curl https://hardbanrecords-api.onrender.com/api/health
   ```

Expected response:
```json
{
  "status": "healthy",
  "timestamp": "2025-09-12T...",
  "environment": "production",
  "checks": {
    "database": {"status": "healthy"},
    "memory": {"status": "healthy"},
    "environment": {"status": "healthy"}
  }
}
```

## Krok 4: Zapisz Backend URL

📋 **ZAPISZ URL BACKENDU**:
```
Backend API URL: https://hardbanrecords-api.onrender.com
```

**Status**: ⏳ Czekam na ukończenie Etapu 2

---

## 🔧 Troubleshooting

**Jeśli deployment fails**:
1. Sprawdź Render logs
2. Verify environment variables
3. Test database connection
4. Check `package.json` scripts
