# 🚀 HARDBANRECORDS LAB - DEPLOYMENT TODO LIST

## 1️⃣ PRZYGOTOWANIE ŚRODOWISKA (Pre-deployment)

### 0. Weryfikacja projektu i zależności

- [ ] 1. Sprawdzenie aktualnych wersji zależności
```bash
# W głównym katalogu projektu
npm outdated
cd backend && npm outdated
```

- [ ] 2. Aktualizacja krytycznych zależności
```bash
npm update react react-dom @types/react @types/react-dom
npm update vite @vitejs/plugin-react typescript
```

- [ ] 3. Weryfikacja TypeScript
```bash
# Sprawdzenie typów w całym projekcie
npm run type-check

# Jeśli występują błędy, zapisz je do pliku
npm run type-check > typescript-errors.log
```

- [ ] 4. Cleanup projektu
```bash
# Usunięcie zbędnych plików
find . -name "*.log" -type f -delete
find . -name "*.map" -type f -delete
find . -name ".DS_Store" -type f -delete
```

### Frontend Configuration
- [ ] 1. Szczegółowa konfiguracja Vite
  ```typescript
  // vite.config.ts
  import { defineConfig } from 'vite'
  import react from '@vitejs/plugin-react'
  import { resolve } from 'path'

  export default defineConfig({
    plugins: [react()],
    build: {
      outDir: 'dist',
      sourcemap: false,
      minify: 'terser',
      terserOptions: {
        compress: {
          drop_console: true,
          drop_debugger: true
        }
      },
      rollupOptions: {
        output: {
          manualChunks: {
            'react-vendor': ['react', 'react-dom'],
            'routing': ['react-router-dom'],
            'state': ['zustand'],
            'ui': ['tailwindcss']
          }
        }
      }
    },
    resolve: {
      alias: {
        '@': resolve(__dirname, './src'),
        '@components': resolve(__dirname, './src/components'),
        '@pages': resolve(__dirname, './src/pages')
      }
    },
    server: {
      port: 5173,
      strictPort: true,
      proxy: {
        '/api': {
          target: 'http://localhost:3001',
          changeOrigin: true,
          secure: false
        }
      }
    }
  })
  ```

  - [ ] 1.1. Weryfikacja buildu i optymalizacji:
  ```bash
  # Sprawdzenie rozmiaru buildu
  npm run build
  du -sh dist/
  
  # Analiza bundle size
  npm install -D rollup-plugin-visualizer
  # Dodaj plugin do vite.config.ts i wygeneruj raport
  ```

  - [ ] 1.2. Optymalizacja obrazów i assetów:
  ```bash
  # Instalacja narzędzi do optymalizacji
  npm install -D vite-plugin-imagemin
  
  # Konfiguracja w vite.config.ts
  # Dodaj regułę dla obrazów
  ```

- [ ] 2. Kompleksowa konfiguracja środowiska

  - [ ] 2.1. Development (.env.development)
  ```env
  # .env.development
  VITE_API_URL=http://localhost:3001
  VITE_SUPABASE_URL=your-dev-supabase-url
  VITE_SUPABASE_ANON_KEY=your-dev-supabase-key
  VITE_ENVIRONMENT=development
  VITE_ENABLE_ANALYTICS=false
  VITE_ENABLE_LOGGING=true
  VITE_SENTRY_DSN=your-sentry-dsn
  VITE_ENABLE_MOCK_DATA=true
  ```

  - [ ] 2.2. Staging (.env.staging)
  ```env
  # .env.staging
  VITE_API_URL=https://staging-api.hardbanrecords.com
  VITE_SUPABASE_URL=your-staging-supabase-url
  VITE_SUPABASE_ANON_KEY=your-staging-supabase-key
  VITE_ENVIRONMENT=staging
  VITE_ENABLE_ANALYTICS=true
  VITE_ENABLE_LOGGING=true
  VITE_SENTRY_DSN=your-staging-sentry-dsn
  VITE_ENABLE_MOCK_DATA=false
  ```

  - [ ] 2.3. Production (.env.production)
  ```env
  # .env.production
  VITE_API_URL=https://api.hardbanrecords.com
  VITE_SUPABASE_URL=your-prod-supabase-url
  VITE_SUPABASE_ANON_KEY=your-prod-supabase-key
  VITE_ENVIRONMENT=production
  VITE_ENABLE_ANALYTICS=true
  VITE_ENABLE_LOGGING=false
  VITE_SENTRY_DSN=your-prod-sentry-dsn
  VITE_ENABLE_MOCK_DATA=false
  VITE_CDN_URL=https://cdn.hardbanrecords.com
  ```

  - [ ] 2.4. Weryfikacja zmiennych środowiskowych
  ```bash
  # Stwórz skrypt weryfikacyjny
  touch scripts/verify-env.js

  # Zawartość scripts/verify-env.js
  const requiredEnvVars = [
    'VITE_API_URL',
    'VITE_SUPABASE_URL',
    'VITE_SUPABASE_ANON_KEY',
    'VITE_ENVIRONMENT',
    'VITE_SENTRY_DSN'
  ]

  const checkEnvVars = () => {
    const missing = requiredEnvVars.filter(v => !process.env[v])
    if (missing.length) {
      console.error('Missing required env vars:', missing)
      process.exit(1)
    }
  }

  checkEnvVars()
  ```

- [ ] 3. Optymalizacja buildu
  ```bash
  # Verify package.json scripts
  "build": "tsc && vite build",
  "preview": "vite preview"
  ```

### Backend Configuration

- [ ] 1. Konfiguracja Express.js dla produkcji

  - [ ] 1.1. Podstawowa konfiguracja serwera (server.cjs)
  ```javascript
  // server.cjs
  const express = require('express');
  const compression = require('compression');
  const helmet = require('helmet');
  const rateLimit = require('express-rate-limit');
  const morgan = require('morgan');
  const cors = require('cors');

  const app = express();

  // Security middleware
  app.set('trust proxy', 1);
  app.use(helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'", "*.hardbanrecords.com"],
        styleSrc: ["'self'", "'unsafe-inline'", "*.hardbanrecords.com"],
        imgSrc: ["'self'", "data:", "*.hardbanrecords.com", "*.supabase.co"],
        connectSrc: ["'self'", "*.hardbanrecords.com", "*.supabase.co"],
        fontSrc: ["'self'", "data:", "*.hardbanrecords.com"],
        objectSrc: ["'none'"],
        mediaSrc: ["'self'", "*.hardbanrecords.com", "*.supabase.co"],
        frameSrc: ["'none'"]
      }
    },
    crossOriginEmbedderPolicy: true,
    crossOriginOpenerPolicy: true,
    crossOriginResourcePolicy: { policy: "same-site" }
  }));

  // Performance middleware
  app.use(compression());
  
  // Rate limiting
  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP, please try again later.'
  });
  app.use('/api/', limiter);

  // Logging
  const logFormat = ':remote-addr - :remote-user [:date[clf]] ":method :url HTTP/:http-version" :status :res[content-length] ":referrer" ":user-agent" - :response-time ms';
  app.use(morgan(logFormat, {
    stream: require('fs').createWriteStream('./logs/access.log', { flags: 'a' })
  }));
  ```

  - [ ] 1.2. Konfiguracja CORS (cors.config.cjs)
  ```javascript
  // config/cors.config.cjs
  const whitelist = [
    'https://hardbanrecords.com',
    'https://www.hardbanrecords.com',
    'https://staging.hardbanrecords.com'
  ];

  module.exports = {
    origin: function (origin, callback) {
      if (!origin || whitelist.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    credentials: true,
    maxAge: 86400 // 24 hours
  };
  ```

  - [ ] 1.3. Error Handling (errorHandler.cjs)
  ```javascript
  // middleware/errorHandler.cjs
  const Sentry = require('@sentry/node');

  module.exports = (err, req, res, next) => {
    // Log error to Sentry
    Sentry.captureException(err);

    // Log to file system
    require('fs').appendFileSync(
      './logs/errors.log',
      `${new Date().toISOString()} - ${err.stack}\n`
    );

    // Send error response
    res.status(err.status || 500).json({
      error: {
        message: err.message,
        code: err.code || 'INTERNAL_SERVER_ERROR',
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
      }
    });
  };
  ```

  - [ ] 1.4. Authentication Middleware (auth.cjs)
  ```javascript
  // middleware/auth.cjs
  const jwt = require('jsonwebtoken');
  const { createClient } = require('@supabase/supabase-js');

  const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_KEY
  );

  module.exports = async (req, res, next) => {
    try {
      const token = req.headers.authorization?.split(' ')[1];
      if (!token) throw new Error('No token provided');

      // Verify JWT
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Verify user in Supabase
      const { data: user, error } = await supabase
        .from('users')
        .select('id, role, status')
        .eq('id', decoded.sub)
        .single();

      if (error || !user) throw new Error('User not found');
      if (user.status !== 'active') throw new Error('User not active');

      req.user = user;
      next();
    } catch (err) {
      res.status(401).json({ error: 'Unauthorized' });
    }
  };
  ```

- [ ] 2. Szczegółowa konfiguracja środowiskowa backendu

  - [ ] 2.1. Development (.env.development)
  ```env
  # backend/.env.development
  NODE_ENV=development
  PORT=3001
  DATABASE_URL=your-dev-supabase-url
  JWT_SECRET=your-dev-secret
  SUPABASE_URL=your-dev-supabase-url
  SUPABASE_ANON_KEY=your-dev-anon-key
  SUPABASE_SERVICE_KEY=your-dev-service-key
  
  # Storage
  SUPABASE_STORAGE_BUCKET=dev-hardban-assets
  
  # Redis Cache
  REDIS_URL=redis://localhost:6379
  
  # Services Integration
  SPOTIFY_CLIENT_ID=your-spotify-client-id
  SPOTIFY_CLIENT_SECRET=your-spotify-secret
  APPLE_MUSIC_KEY=your-apple-key
  AMAZON_MUSIC_KEY=your-amazon-key
  
  # Monitoring
  SENTRY_DSN=your-sentry-dsn
  ENABLE_DEBUG_LOGGING=true
  LOG_LEVEL=debug
  ```

  - [ ] 2.2. Staging (.env.staging)
  ```env
  # backend/.env.staging
  NODE_ENV=staging
  PORT=3001
  DATABASE_URL=your-staging-supabase-url
  JWT_SECRET=your-staging-secret
  SUPABASE_URL=your-staging-supabase-url
  SUPABASE_ANON_KEY=your-staging-anon-key
  SUPABASE_SERVICE_KEY=your-staging-service-key
  
  # Storage
  SUPABASE_STORAGE_BUCKET=staging-hardban-assets
  
  # Redis Cache
  REDIS_URL=your-staging-redis-url
  
  # Services Integration
  SPOTIFY_CLIENT_ID=your-staging-spotify-client-id
  SPOTIFY_CLIENT_SECRET=your-staging-spotify-secret
  APPLE_MUSIC_KEY=your-staging-apple-key
  AMAZON_MUSIC_KEY=your-staging-amazon-key
  
  # Monitoring
  SENTRY_DSN=your-staging-sentry-dsn
  ENABLE_DEBUG_LOGGING=true
  LOG_LEVEL=info
  ```

  - [ ] 2.3. Production (.env.production)
  ```env
  # backend/.env.production
  NODE_ENV=production
  PORT=3001
  DATABASE_URL=your-prod-supabase-url
  JWT_SECRET=your-prod-secret
  SUPABASE_URL=your-prod-supabase-url
  SUPABASE_ANON_KEY=your-prod-anon-key
  SUPABASE_SERVICE_KEY=your-prod-service-key
  
  # Storage
  SUPABASE_STORAGE_BUCKET=prod-hardban-assets
  
  # Redis Cache
  REDIS_URL=your-prod-redis-url
  REDIS_TLS=true
  
  # Services Integration
  SPOTIFY_CLIENT_ID=your-prod-spotify-client-id
  SPOTIFY_CLIENT_SECRET=your-prod-spotify-secret
  APPLE_MUSIC_KEY=your-prod-apple-key
  AMAZON_MUSIC_KEY=your-prod-amazon-key
  
  # Monitoring
  SENTRY_DSN=your-prod-sentry-dsn
  ENABLE_DEBUG_LOGGING=false
  LOG_LEVEL=error
  
  # Performance
  CACHE_TTL=3600
  RATE_LIMIT_WINDOW=900000
  RATE_LIMIT_MAX=100
  ```

  - [ ] 2.4. Skrypt weryfikacji zmiennych środowiskowych
  ```javascript
  // scripts/verify-backend-env.js
  const requiredEnvVars = {
    all: [
      'NODE_ENV',
      'PORT',
      'DATABASE_URL',
      'JWT_SECRET',
      'SUPABASE_URL',
      'SUPABASE_ANON_KEY',
      'SUPABASE_SERVICE_KEY',
      'SUPABASE_STORAGE_BUCKET',
      'REDIS_URL',
      'SENTRY_DSN'
    ],
    production: [
      'SPOTIFY_CLIENT_ID',
      'SPOTIFY_CLIENT_SECRET',
      'APPLE_MUSIC_KEY',
      'AMAZON_MUSIC_KEY',
      'REDIS_TLS',
      'CACHE_TTL',
      'RATE_LIMIT_WINDOW',
      'RATE_LIMIT_MAX'
    ]
  };

  const checkEnvVars = () => {
    const missing = [];
    
    // Check common vars
    missing.push(...requiredEnvVars.all.filter(v => !process.env[v]));
    
    // Check production-specific vars
    if (process.env.NODE_ENV === 'production') {
      missing.push(...requiredEnvVars.production.filter(v => !process.env[v]));
    }
    
    if (missing.length) {
      console.error('Missing required env vars:', missing);
      process.exit(1);
    }
    
    // Validate values
    if (process.env.NODE_ENV === 'production') {
      if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
        console.error('JWT_SECRET must be at least 32 characters in production');
        process.exit(1);
      }
    }
  };

  checkEnvVars();
  ```

### Database Setup

- [ ] 1. Przygotowanie Supabase

  - [ ] 1.1. Utworzenie projektów w Supabase
  ```bash
  # Dla każdego środowiska (dev/staging/prod)
  # Przez Supabase Dashboard:
  # 1. Create Project
  # 2. Choose region (eu-central-1 for EU)
  # 3. Setup database password
  # 4. Note down connection strings and keys
  ```

  - [ ] 1.2. Konfiguracja polityk bezpieczeństwa
  ```sql
  -- Podstawowe polityki dla tabeli users
  CREATE POLICY "Users can read own data"
    ON public.users
    FOR SELECT
    USING (auth.uid() = id);

  CREATE POLICY "Users can update own data"
    ON public.users
    FOR UPDATE
    USING (auth.uid() = id);

  -- Polityki dla modułu muzycznego
  CREATE POLICY "Users can read own releases"
    ON public.releases
    FOR SELECT
    USING (user_id = auth.uid());

  CREATE POLICY "Users can manage own releases"
    ON public.releases
    FOR ALL
    USING (user_id = auth.uid());

  -- Polityki dla modułu wydawniczego
  CREATE POLICY "Users can read own books"
    ON public.books
    FOR SELECT
    USING (user_id = auth.uid());

  CREATE POLICY "Users can manage own books"
    ON public.books
    FOR ALL
    USING (user_id = auth.uid());
  ```

  - [ ] 1.3. Przygotowanie migracji
  ```sql
  -- /backend/db/migrations/000001_initial_schema.sql
  -- Users table
  CREATE TABLE users (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT,
    avatar_url TEXT,
    role TEXT DEFAULT 'user',
    status TEXT DEFAULT 'active',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
  );

  -- Music module tables
  CREATE TABLE releases (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES users(id),
    title TEXT NOT NULL,
    artist TEXT NOT NULL,
    cover_url TEXT,
    audio_url TEXT,
    status TEXT DEFAULT 'draft',
    release_date TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
  );

  CREATE TABLE royalties (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    release_id UUID REFERENCES releases(id),
    platform TEXT NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    period_start DATE NOT NULL,
    period_end DATE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
  );

  -- Publishing module tables
  CREATE TABLE books (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES users(id),
    title TEXT NOT NULL,
    author TEXT NOT NULL,
    cover_url TEXT,
    status TEXT DEFAULT 'draft',
    publish_date TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
  );

  CREATE TABLE chapters (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    book_id UUID REFERENCES books(id),
    title TEXT NOT NULL,
    content TEXT,
    order_num INTEGER NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
  );
  ```

  - [ ] 1.4. Skrypt do weryfikacji migracji
  ```javascript
  // scripts/verify-migrations.js
  const { Client } = require('pg');
  const fs = require('fs');
  const path = require('path');

  async function verifyMigrations() {
    const client = new Client(process.env.DATABASE_URL);
    await client.connect();

    try {
      // Check if all tables exist
      const tables = ['users', 'releases', 'royalties', 'books', 'chapters'];
      for (const table of tables) {
        const res = await client.query(`
          SELECT EXISTS (
            SELECT FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name = $1
          );
        `, [table]);

        if (!res.rows[0].exists) {
          throw new Error(`Table ${table} does not exist!`);
        }
      }

      // Verify columns and constraints
      // ... (dodatkowe sprawdzenia)

      console.log('All migrations verified successfully!');
    } catch (err) {
      console.error('Migration verification failed:', err);
      process.exit(1);
    } finally {
      await client.end();
    }
  }

  verifyMigrations();
  ```

  - [ ] 1.5. Backup danych developerskich
  ```bash
  # Eksport danych z dev
  pg_dump -h dev-db-url -U postgres -d postgres -f dev_backup.sql

  # Utworzenie skryptu do czyszczenia danych wrażliwych
  cat > clean_backup.sh << 'EOF'
  #!/bin/bash
  sed -i 's/email@real\.com/example@test.com/g' dev_backup.sql
  sed -i 's/real_password/test_password/g' dev_backup.sql
  EOF

  chmod +x clean_backup.sh
  ./clean_backup.sh
  ```

## 2️⃣ DEPLOYMENT PREPARATION

### Frontend (Vercel)
- [ ] 1. Konfiguracja projektu w Vercel
  ```bash
  # Instalacja Vercel CLI
  npm i -g vercel
  ```

- [ ] 2. Utworzenie vercel.json
  ```json
  {
    "buildCommand": "npm run build",
    "outputDirectory": "dist",
    "framework": "vite",
    "rewrites": [
      { "source": "/(.*)", "destination": "/index.html" }
    ]
  }
  ```

- [ ] 3. Konfiguracja domen
  - [ ] Ustawienie głównej domeny
  - [ ] Konfiguracja SSL
  - [ ] Ustawienie przekierowań

### Backend (Render.com)
- [ ] 1. Przygotowanie render.yaml
  ```yaml
  services:
    - type: web
      name: hardbanrecords-api
      env: node
      buildCommand: cd backend && npm install
      startCommand: cd backend && node server.cjs
      envVars:
        - key: NODE_ENV
          value: production
  ```

- [ ] 2. Konfiguracja CORS
  ```javascript
  // backend/config/cors.cjs
  const whitelist = [
    'https://hardbanrecords.com',
    'https://www.hardbanrecords.com'
  ];
  ```

## 3️⃣ DEPLOYMENT EXECUTION

### Frontend Deployment
- [ ] 1. Build i test lokalny
  ```bash
  npm run build
  npm run preview # Verify locally
  ```

- [ ] 2. Deployment na Vercel
  ```bash
  vercel --prod
  ```

- [ ] 3. Weryfikacja deploymentu
  - [ ] Sprawdzenie routing
  - [ ] Weryfikacja assets
  - [ ] Test responsywności

### Backend Deployment
- [ ] 1. Deployment na Render
  ```bash
  # Verify git integration
  git push origin master
  ```

- [ ] 2. Weryfikacja API
  - [ ] Healthcheck endpoint
  - [ ] Authentication flows
  - [ ] CORS configuration

## 4️⃣ POST-DEPLOYMENT VERIFICATION

### Testy Systemowe

- [ ] 1. End-to-end testing

  - [ ] 1.1. Przygotowanie środowiska testowego
  ```bash
  # Instalacja zależności testowych
  npm install -D cypress @testing-library/cypress @cypress/code-coverage

  # Konfiguracja testów produkcyjnych
  cat > cypress.config.prod.ts << 'EOF'
  import { defineConfig } from 'cypress'

  export default defineConfig({
    e2e: {
      baseUrl: 'https://hardbanrecords.com',
      env: {
        apiUrl: 'https://api.hardbanrecords.com',
      },
      setupNodeEvents(on, config) {
        require('@cypress/code-coverage/task')(on, config)
        return config
      },
    },
  })
  EOF
  ```

  - [ ] 1.2. Testy krytycznych ścieżek (Critical Path Testing)
  ```typescript
  // cypress/e2e/critical-paths.cy.ts
  describe('Critical User Paths', () => {
    before(() => {
      cy.clearCookies()
      cy.clearLocalStorage()
    })

    it('Complete user journey - Music Module', () => {
      // Login
      cy.login(Cypress.env('TEST_USER'), Cypress.env('TEST_PASS'))

      // Create new release
      cy.visit('/music/new-release')
      cy.fillReleaseForm({
        title: 'Test Release',
        artist: 'Test Artist',
        // ... more fields
      })
      cy.get('[data-cy=submit-release]').click()
      
      // Verify release created
      cy.url().should('include', '/music/releases')
      cy.contains('Test Release').should('be.visible')
      
      // Verify analytics
      cy.visit('/music/analytics')
      cy.get('[data-cy=release-stats]').should('exist')
    })

    it('Complete user journey - Publishing Module', () => {
      // Create new book
      cy.visit('/publishing/new-book')
      cy.fillBookForm({
        title: 'Test Book',
        author: 'Test Author',
        // ... more fields
      })
      cy.get('[data-cy=submit-book]').click()
      
      // Verify book created
      cy.url().should('include', '/publishing/books')
      cy.contains('Test Book').should('be.visible')
      
      // Test chapter management
      cy.get('[data-cy=add-chapter]').click()
      cy.fillChapterForm({
        title: 'Chapter 1',
        content: 'Test content'
      })
      cy.get('[data-cy=save-chapter]').click()
    })
  })
  ```

  - [ ] 1.3. Testy wydajnościowe (Performance Testing)
  ```typescript
  // cypress/e2e/performance.cy.ts
  describe('Performance Tests', () => {
    it('Page load times', () => {
      const pages = [
        '/',
        '/music/releases',
        '/publishing/books',
        '/analytics'
      ]

      pages.forEach(page => {
        cy.visit(page)
        cy.window().its('performance').then((p) => {
          const perfEntries = p.getEntriesByType('navigation')
          const pageLoad = perfEntries[0]
          expect(pageLoad.loadEventEnd).to.be.lessThan(2000) // 2s max
        })
      })
    })

    it('API response times', () => {
      cy.login(Cypress.env('TEST_USER'), Cypress.env('TEST_PASS'))
      
      cy.intercept('/api/**').as('apiCall')
      cy.visit('/music/releases')
      cy.wait('@apiCall').its('response.headers.x-response-time')
        .then(parseFloat)
        .should('be.lessThan', 200) // 200ms max
    })
  })
  ```

  - [ ] 1.4. Skrypt do weryfikacji testów
  ```bash
  #!/bin/bash
  # verify-e2e.sh

  # Run tests
  echo "Running E2E tests..."
  npm run test:e2e:prod > test_results.log

  # Check for failures
  if grep -q "FAILED" test_results.log; then
    echo "E2E tests failed! Check test_results.log for details"
    exit 1
  fi

  # Check performance thresholds
  if grep -q "Performance test failed" test_results.log; then
    echo "Performance tests failed! Check test_results.log for details"
    exit 1
  fi

  echo "All tests passed successfully!"
  ```

- [ ] 2. API Testing
  ```bash
  # Run API tests against production
  npm run test:api:prod
  ```

### Monitoring Setup
- [ ] 1. Konfiguracja monitoringu
  - [ ] Setup Sentry.io
  - [ ] Configure error tracking
  - [ ] Setup performance monitoring

- [ ] 2. Alerting
  - [ ] Configure error alerts
  - [ ] Setup uptime monitoring
  - [ ] Configure performance alerts

## 5️⃣ CONTINUOUS INTEGRATION/DEPLOYMENT

### CI/CD Setup
- [ ] 1. GitHub Actions workflow
  ```yaml
  # .github/workflows/deploy.yml
  name: Deploy
  on:
    push:
      branches: [master]
  jobs:
    deploy:
      runs-on: ubuntu-latest
      steps:
        - uses: actions/checkout@v2
        - name: Deploy to Vercel
          uses: vercel/actions/cli@v2
          with:
            vercel-token: ${{ secrets.VERCEL_TOKEN }}
  ```

- [ ] 2. Automatyzacja deploymentu
  - [ ] Configure auto-deployment
  - [ ] Setup rollback procedures
  - [ ] Configure deployment notifications

## 6️⃣ DOKUMENTACJA I INSTRUKCJE

### Documentation
- [ ] 1. System Architecture Document
  - [ ] Infrastructure diagram
  - [ ] Deployment flow
  - [ ] Security measures

- [ ] 2. Maintenance Guide
  - [ ] Backup procedures
  - [ ] Monitoring guidelines
  - [ ] Incident response

### Recovery Procedures
- [ ] 1. Disaster Recovery Plan
  - [ ] Backup restoration
  - [ ] Service recovery
  - [ ] Data integrity checks

## 📝 CHECKLIST PRZED URUCHOMIENIEM

### Security
- [ ] SSL certificates configured
- [ ] Environment variables secured
- [ ] API keys rotated
- [ ] Security headers configured

### Performance
- [ ] CDN configured
- [ ] Asset optimization verified
- [ ] Database indexes optimized
- [ ] Caching implemented

### Monitoring
- [ ] Error tracking active
- [ ] Performance monitoring setup
- [ ] Uptime monitoring configured
- [ ] Log aggregation working

### Backup
- [ ] Database backup configured
- [ ] Asset backup verified
- [ ] Configuration backup secured
- [ ] Recovery procedures tested

## 🔄 PROCEDURA URUCHOMIENIA

1. **Przygotowanie (T-7 dni)**
   - Finalizacja konfiguracji
   - Ostatnie testy
   - Przygotowanie backup systems

2. **Deployment Day (T-Day)**
   - Database migration
   - Backend deployment
   - Frontend deployment
   - DNS propagation

3. **Post-Launch (T+1 dzień)**
   - Monitoring verification
   - Performance testing
   - User acceptance testing
   - Security scanning

4. **Stabilizacja (T+7 dni)**
   - Performance optimization
   - Error resolution
   - User feedback collection
   - System fine-tuning

## 🆘 PROCEDURY AWARYJNE

### Quick Recovery
```bash
# Rollback Frontend
vercel rollback

# Rollback Backend
render rollback

# Database Restore
supabase db restore
```

### Emergency Contacts
- DevOps Team: devops@hardbanrecords.com
- Backend Team: backend@hardbanrecords.com
- Frontend Team: frontend@hardbanrecords.com
- Security Team: security@hardbanrecords.com