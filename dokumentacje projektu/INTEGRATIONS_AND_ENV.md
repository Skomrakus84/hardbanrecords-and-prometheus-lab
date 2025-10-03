# 🔌 HardbanRecords Lab & Prometheus - Kompleksowa Dokumentacja Integracji

## Główne Komponenty Systemu

### 1. HardbanRecords Lab
#### Music Publishing AI
- Produkcja i mastering
- Dystrybucja globalna
- Zarządzanie prawami
- Analityka i monetyzacja

#### Digital Publishing AI
- Narzędzia pisarskie i produkcyjne
- Dystrybucja e-booków i audiobooków
- Zarządzanie prawami cyfrowymi
- Analityka sprzedaży

### 2. Prometheus AI
- AI Factory (generowanie treści)
- Distribution Hub (PR i dystrybucja)
- Social Media Management
- Analytics & Optimization
- AR/VR/MR Experience Creation

## Zmienne Środowiskowe i Konfiguracja

## 1. Baza danych i Storage
### Supabase
```env
# Core Database
DATABASE_URL=postgresql://postgres.[project-id]:[password]@aws-0-eu-north-1.pooler.supabase.co:6543/postgres
SUPABASE_URL=https://[project-id].supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
SUPABASE_ANON_KEY=your-anon-key

# Storage
SUPABASE_BUCKET_NAME=hardbanrecords-files
SUPABASE_STORAGE_URL=https://[project-id].storage.supabase.co/storage/v1/object/public/hardbanrecords-files
SUPABASE_REGION=eu-north-1
```

## 2. Moduł Muzyczny - Platformy Streamingowe
### Spotify
```env
SPOTIFY_CLIENT_ID=your-client-id
SPOTIFY_CLIENT_SECRET=your-client-secret
SPOTIFY_REDIRECT_URI=http://localhost:3001/callback/spotify
```

### Apple Music
```env
APPLE_MUSIC_KEY_ID=your-key-id
APPLE_MUSIC_PRIVATE_KEY=your-private-key
APPLE_MUSIC_TEAM_ID=your-team-id
```

### Deezer
```env
DEEZER_APP_ID=your-app-id
DEEZER_SECRET_KEY=your-secret-key
```

### Tidal
```env
TIDAL_CLIENT_ID=your-client-id
TIDAL_CLIENT_SECRET=your-client-secret
```

## 3. Moduł Wydawniczy - Platformy eBookowe
### Amazon KDP
```env
AMAZON_KDP_ACCESS_KEY=your-access-key
AMAZON_KDP_SECRET_KEY=your-secret-key
AMAZON_KDP_REGION=eu-west-1
```

### Google Play Books
```env
GOOGLE_BOOKS_API_KEY=your-api-key
GOOGLE_BOOKS_PROJECT_ID=your-project-id
```

### Apple Books
```env
APPLE_BOOKS_PRIVATE_KEY=your-private-key
APPLE_BOOKS_KEY_ID=your-key-id
```

## 4. Prometheus AI - Platformy AI
### HuggingFace
```env
HUGGINGFACE_API_KEY=your-api-key
HUGGINGFACE_MODEL_ENDPOINT=https://api-inference.huggingface.co/models/
HUGGINGFACE_MAX_REQUESTS=60
```

### Replicate
```env
REPLICATE_API_TOKEN=your-api-token
REPLICATE_MAX_REQUESTS=100
```

### OpenAI (Free Tier)
```env
OPENAI_API_KEY=your-api-key
OPENAI_ORG_ID=your-org-id
OPENAI_MAX_TOKENS=4000
```

### Claude (Anthropic)
```env
CLAUDE_API_KEY=your-api-key
CLAUDE_MAX_TOKENS=100000
```

## 5. Marketing i Analytics
### Google Analytics
```env
GOOGLE_ANALYTICS_ID=your-ga-id
GOOGLE_ANALYTICS_VIEW_ID=your-view-id
```

### Facebook Ads
```env
FACEBOOK_APP_ID=your-app-id
FACEBOOK_APP_SECRET=your-app-secret
FACEBOOK_ACCESS_TOKEN=your-access-token
```

### MailChimp
```env
MAILCHIMP_API_KEY=your-api-key
MAILCHIMP_LIST_ID=your-list-id
MAILCHIMP_SERVER_PREFIX=your-server-prefix
```

## 6. System i Bezpieczeństwo
### JWT i Auth
```env
JWT_SECRET=your-very-strong-jwt-secret-at-least-32-chars
REFRESH_TOKEN_SECRET=your-very-strong-refresh-token-secret
JWT_EXPIRES_IN=15m
REFRESH_TOKEN_EXPIRES_IN=7d
```

### Server Configuration
```env
# Main Backend
PORT=3001
NODE_ENV=development
CORS_ORIGIN=http://localhost:5173

# Microservices
MUSIC_SERVICE_PORT=3002
PUBLISHING_SERVICE_PORT=3003
PROMETHEUS_SERVICE_PORT=3004

# URLs
BACKEND_URL=http://localhost:3001
FRONTEND_URL=http://localhost:5173
MUSIC_SERVICE_URL=http://localhost:3002
PUBLISHING_SERVICE_URL=http://localhost:3003
PROMETHEUS_URL=http://localhost:3004
```

### Logging & Monitoring
```env
LOG_LEVEL=debug
LOGS_DIR=../logs
SENTRY_DSN=your-sentry-dsn
PROMETHEUS_METRICS_PORT=9090
```

## 7. Frontend Configuration
```env
# API Configuration
VITE_API_URL=http://localhost:3001/api
VITE_WS_URL=ws://localhost:3001

# App Configuration
VITE_APP_NAME=HardbanRecords Lab
VITE_APP_VERSION=1.0.0
VITE_APP_ENVIRONMENT=development

# Feature Flags
VITE_ENABLE_ANALYTICS=true
VITE_ENABLE_MUSIC_MODULE=true
VITE_ENABLE_PUBLISHING_MODULE=true
VITE_ENABLE_PROMETHEUS_AI=true

# Supabase Frontend
VITE_SUPABASE_URL=https://[project-id].supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key

# CDN & Assets
VITE_IMAGE_CDN_URL=https://[project-id].storage.supabase.co/storage/v1/object/public/hardbanrecords-files
```

## 8. File Upload Configuration
```env
# Size Limits
MAX_FILE_SIZE=52428800
MAX_AUDIO_FILE_SIZE=104857600
MAX_IMAGE_FILE_SIZE=10485760
MAX_DOCUMENT_FILE_SIZE=26214400

# Allowed Formats
ALLOWED_AUDIO_FORMATS=mp3,wav,flac,aac,m4a,ogg
ALLOWED_IMAGE_FORMATS=jpg,jpeg,png,webp,gif
ALLOWED_DOCUMENT_FORMATS=pdf,doc,docx,txt,epub
```

## 9. CI/CD & Deployment
```env
# Version Control
VERSION=1.0.0
BUILD_NUMBER=development
GIT_COMMIT_SHA=current-commit-sha

# Deployment
RENDER_API_KEY=your-render-key
VERCEL_TOKEN=your-vercel-token
DEPLOY_ENVIRONMENT=development
```

## Notatki dotyczące integracji:

1. **Kolejność uruchamiania usług**:
   - Supabase (baza danych i storage)
   - Backend services (main, music, publishing)
   - Prometheus AI service
   - Frontend application

2. **Rotacja kluczy**:
   - JWT co 30 dni
   - API keys co 90 dni
   - Refresh tokens przy każdym użyciu

3. **Monitorowanie limitów**:
   - Spotify: 1000 requests/day
   - OpenAI: zależnie od modelu
   - HuggingFace: 60 requests/minute
   - Storage: 50MB per file
   
4. **Fallback strategy**:
   - Dla każdej integracji AI
   - Dla platform streamingowych
   - Dla storage

5. **Health checks**:
   - Endpoint: /health
   - Interval: 60s
   - Timeout: 5s