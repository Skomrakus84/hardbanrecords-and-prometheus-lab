# 🗄️ ETAP 1: SUPABASE DATABASE SETUP

## ✅ Krok 1: Projekt Supabase już istnieje!

**Status**: ✅ **WYKORZYSTUJEMY ISTNIEJĄCY PROJEKT**

**Existing Project**:
- **URL**: `https://fannbqzvjwyazeosectm.supabase.co`
- **Region**: `eu-north-1`
- **Status**: ✅ Connected
- **Bucket**: `hardbanrecords-files` ✅ Already exists

## Krok 2: Aktualizacja bazy danych (dodaj brakujące tabele)

**Current Status**:
- ✅ `users` - exists
- ✅ `books` - exists
- ✅ `artists` - exists
- ❌ `releases` - **needs creation**
- ❌ `chapters` - **needs creation**
- ❌ `tasks` - **needs creation**
- ❌ `splits` - **needs creation**
- ❌ `music_analytics` - **needs creation**
- ❌ `publishing_analytics` - **needs creation**
- ❌ `royalty_statements` - **needs creation**
- ❌ `payouts` - **needs creation**

**Actions needed**:
1. **Otwórz SQL Editor** w Supabase Dashboard: https://supabase.com/dashboard/project/fannbqzvjwyazeosectm
2. **Skopiuj zawartość** z pliku: `backend/db/migrations/production_setup.sql`
3. **Wklej i wykonaj** - doda brakujące tabele (bezpieczne dla istniejących)
4. **Sprawdź tabele** - powinno być ~20 tabel

## Krok 3: Skonfiguruj Storage Bucket

1. **Storage** → **New Bucket**
2. **Name**: `hardbanrecords-files`
3. **Public bucket**: ✅ (dla dostępu do plików)
4. **File size limit**: 50MB
5. **Allowed MIME types**: `image/*, audio/*, application/pdf`

## ✅ Krok 4: Dane konfiguracyjne już gotowe

📋 **ISTNIEJĄCE DANE KONFIGURACYJNE**:

```env
SUPABASE_URL=https://fannbqzvjwyazeosectm.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZhbm5icXp2and5YXplb3NlY3RtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTcxNzMyOTksImV4cCI6MjA3Mjc0OTI5OX0.gCG68YkOWY2WjWV5jE4MqGcMV8dJb3z9QjPZJ8KUY_4
SUPABASE_SERVICE_ROLE_KEY=sb_secret_AN_svbwHOjXiQPGwZd2aMg_k6tfc3T6
SUPABASE_BUCKET_NAME=hardbanrecords-files
DATABASE_URL=postgresql://postgres.fannbqzvjwyazeosectm:Kskomra1984@aws-1-eu-north-1.pooler.supabase.com:5432/postgres
```

**Status**: ✅ **Wszystkie credentials już skonfigurowane**

---

## ✅ VERIFY DATABASE SETUP

Po wykonaniu migracji, sprawdź czy masz te tabele:
- users
- artists
- releases
- splits
- books
- chapters
- tasks
- music_analytics
- publishing_analytics
- royalty_statements
- payouts
- distribution_channels
- publishing_stores
- [i inne...]

**Status**: ⏳ Czekam na wykonanie Etapu 1
