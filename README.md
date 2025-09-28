# 🎵 HardbanRecords Lab - Production Ready

Kompleksowa platforma zarządzania wytwórnią muzyczną z dual-microservice architekturą obsługującą dystrybucję muzyki i wydawnictwo książek.

## 🚀 Architecture Overview

### Dual-Microservice Architecture
- **Music Distribution Module** (`backend/music/`) - Releases, royalties, analytics, multi-platform distribution (Spotify, Apple Music, YouTube, etc.)
- **Publishing Module** (`backend/publishing/`) - Book publishing, chapter management, store distribution (Amazon KDP, Apple Books, etc.)
- **Frontend** - Single-file React app with real-time API integration
- **Shared Backend** - Express.js API gateway in `backend/server.cjs` routing to microservices

## 📊 Current Production Stats (from Database)
- **Active Artists:** 5
- **Music Releases:** 4 (live on platforms)
- **Published Books:** 3 (available in stores)
- **Total Revenue:** $25,700
- **Distribution Platforms:** 20 (10 music + 10 publishing)

## 🛠️ Tech Stack

### Frontend
- **Single-file React app** (`hardban-records-lab.tsx`)
- **Real-time API integration** with fallback to mock data
- **Tailwind CSS** styling with emoji icons
- **Responsive design** (mobile-first)
- **Charts & Analytics** via Recharts

### Backend
- **Express.js API gateway** (`backend/server.cjs`)
- **Supabase PostgreSQL** database (eu-north-1)
- **RESTful endpoints** for dashboard stats
- **Supabase Storage** (nie AWS S3) dla file uploads

### Database
- **Complete schema** with test data (12 tables)
- **Dashboard stats view** for real-time metrics
- **Secure RLS policies** for data access
- **File storage:** hardbanrecords-files bucket

## 🔗 Production URLs

- **Frontend:** https://hardbanrecords-lab.vercel.app
- **Backend:** https://hardbanrecords-backend.onrender.com
- **Database:** https://lniyanikhipfmrdubqvm.supabase.co
- **Storage:** https://lniyanikhipfmrdubqvm.storage.supabase.co

## 📝 API Endpoints

```bash
GET /api/dashboard/stats      # Dashboard statistics (5/4/3 + $25.7K)
GET /api/activities/recent    # Recent activity feed
GET /api/music/releases       # Music releases
GET /api/publishing/books     # Published books
GET /health                   # Health check
GET /api/test-cors           # CORS verification
```

## 🗂️ File Storage (Supabase Storage)

- **Bucket:** hardbanrecords-files
- **Audio Files:** mp3, wav, flac, aac, m4a, ogg (max 100MB)
- **Images:** jpg, jpeg, png, webp, gif (max 50MB)
- **Documents:** pdf, doc, docx, txt, epub (max 50MB)
- **Public Access:** Configured via RLS policies
- **CORS:** Enabled dla cross-origin uploads

## 🎯 Key Features

### Music Module
- Artist management (5 active artists)
- Release tracking (4 live releases)
- Multi-platform distribution (400+ platforms)
- Streaming analytics & revenue tracking
- File upload (audio, covers) via Supabase Storage

### Publishing Module
- Book catalog (3 published books)
- Author profiles & contract management
- Store distribution (21 platforms)
- Sales tracking & analytics
- Document management via Supabase Storage

### Analytics Dashboard
- **Real-time statistics** from database
- Performance metrics & trend analysis
- Revenue tracking ($25.7K total)
- Activity feed & notifications

## 🚀 Quick Start

### Database Setup (Supabase)
```bash
# 1. Uruchom w Supabase SQL Editor:
backend/db/init_complete_database.sql

# 2. Skonfiguruj polityki RLS:
backend/db/supabase_policies.sql

# 3. Setup CORS dla Storage:
backend/db/setup_cors_storage.sql
```

### Environment Configuration

#### Backend (.env):
```bash
DATABASE_URL=postgresql://postgres.lniyanikhipfmrdubqvm:Kskomra1984*@aws-0-eu-north-1.pooler.supabase.com:6543/postgres
SUPABASE_URL=https://lniyanikhipfmrdubqvm.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxuaXlhbmlraGlwZm1yZHVicXZtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzY4MzAxOSwiZXhwIjoyMDczMjU5MDE5fQ.nDgrmvL8ywbOkk8MIcO19-CHBhsK1n3xDM7ViTr2sFw
SUPABASE_BUCKET_NAME=hardbanrecords-files
NODE_ENV=production
PORT=10000
```

#### Frontend (.env.local):
```bash
NEXT_PUBLIC_API_URL=https://hardbanrecords-backend.onrender.com
NEXT_PUBLIC_SUPABASE_URL=https://lniyanikhipfmrdubqvm.supabase.co
NEXT_PUBLIC_SUPABASE_STORAGE_URL=https://lniyanikhipfmrdubqvm.storage.supabase.co/storage/v1/object/public/hardbanrecords-files
```

## 🎯 Deployment Architecture

### Backend (Render.com)
- **Service Type:** Web Service
- **Region:** Frankfurt (EU)
- **Build:** `cd backend && npm install`
- **Start:** `cd backend && npm start`
- **Environment:** Node.js 18+

### Frontend (Vercel)
- **Deploy:** Single-file React app
- **Build:** Automatic via vercel CLI
- **CDN:** Global edge deployment

### Database (Supabase)
- **Region:** eu-north-1 (optimal dla Polski)
- **Connection:** PostgreSQL with connection pooling
- **Storage:** Integrated file storage with CORS

## 💾 Storage Architecture (IMPORTANT)

**🚨 UŻYWAMY TYLKO SUPABASE STORAGE - NIE AWS S3**

```bash
# ✅ CORRECT - Supabase Storage
SUPABASE_STORAGE_URL=https://lniyanikhipfmrdubqvm.storage.supabase.co/storage/v1/object/public/hardbanrecords-files
SUPABASE_BUCKET_NAME=hardbanrecords-files

# ❌ REMOVED - AWS S3 (nie używamy)
# AWS_ACCESS_KEY_ID=REMOVED
# AWS_SECRET_ACCESS_KEY=REMOVED
# AWS_REGION=REMOVED
# AWS_S3_BUCKET=REMOVED
```

## 📊 Production Metrics

### Dashboard shows real data from database:
- **Dashboard Stats:** Real-time z Supabase dashboard_stats view
- **Activity Feed:** Live z recent_activities table
- **Revenue Analytics:** Aggregated z multiple tables
- **Performance Metrics:** Calculated z releases + books data

### API Integration:
- **Primary:** Live data z Supabase API
- **Fallback:** Mock data gdy API nie działa
- **Loading States:** Graceful handling podczas ładowania
- **Error Handling:** Toast notifications dla błędów

## 🔐 Security & Performance

### RLS Policies:
- **Tables:** Secured via Row Level Security
- **Storage:** Public bucket z controlled access
- **API:** Service role authentication
- **CORS:** Configured dla cross-origin requests

### Performance:
- **Database:** Indexed queries z optymalizacją
- **Frontend:** Single-file app z lazy loading
- **Storage:** CDN delivery przez Supabase
- **Caching:** Intelligent cache policies

## 🎉 Production Ready Features

- ✅ **Real-time dashboard** z rzeczywistymi danymi z bazy
- ✅ **Multi-platform distribution** (400 music + 21 publishing)
- ✅ **File upload system** via Supabase Storage
- ✅ **Responsive design** na wszystkich urządzeniach
- ✅ **Charts & analytics** z interactive visualizations
- ✅ **Error handling** z graceful fallbacks
- ✅ **Security** via RLS policies i authentication
- ✅ **Performance** optimized dla production load

**🚀 Ready for production deployment on Render.com + Vercel!**

---

**Built with ❤️ by HardbanRecords IT Team**
*Powering independent artists and authors worldwide* 🌍
