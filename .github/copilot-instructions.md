# HardbanRecords-Lab - AI Coding Agent Instructions

## Architecture Overview
This is a dual-microservice music & publishing label management platform:
- **Music Module** (`backend/music/`) - Releases, royalties, analytics, multi-platform distribution
- **Publishing Module** (`backend/publishing/`) - Books, chapters, distribution to stores
- **Frontend**: Vite + React (v19) + TypeScript with Zustand state management
- **API Gateway**: Express.js server (`backend/server.cjs`) routes to microservices

## Key Development Patterns

### Module System
- Backend uses **CommonJS** (`.cjs` files) for microservice imports
- Frontend uses **ES modules** (`.ts/.tsx` files)
- Entry points: `backend/server.cjs` → `backend/music/app.cjs` + `backend/publishing/app.cjs`

### State Management (Zustand)
- Centralized store: `frontend/src/store/appStore.ts`
- Async action pattern with dynamic imports and error handling:
  ```typescript
  fetchReleases: async () => {
    try {
      const response = await import('../api/client').then(m => m.musicApi.getAll());
      // State update + success toast
    } catch (error) {
      get().addToast('Error message', 'error');
    }
  }
  ```

### Database & File Storage
- **Supabase** PostgreSQL with migrations in `backend/db/migrations/`
- Supabase Storage for audio/images/PDFs via `SUPABASE_BUCKET_NAME` env var
- Upload endpoints: `/api/music/releases` (multipart), `/api/publishing/books`

## Development Workflow

### Stack Startup
```bash
# Frontend (port 5173)
npm run dev

# API Gateway (port 3001)
cd backend && npm run dev

# Individual microservices (development)
cd backend/music && node server.cjs     # port 3002
cd backend/publishing && node server.cjs # port 3003
```

### Testing
- Backend: Jest in `backend/tests/`
- Frontend: Vitest (`npm test`) + Cypress E2E (`npm run test:e2e`)

## Key Integration Points

### Music Distribution Flow
1. `AddReleaseForm` → `/api/music/releases` → `release.controller.cjs`
2. Distribution channels: `backend/music/integrations/channels/` (Spotify, Apple Music)
3. Analytics: `analytics.controller.cjs` aggregates platform data
4. Royalties: `royalty.repository.cjs` handles split calculations

### Publishing Flow
1. `BookForm` → `/api/publishing/books` → Publishing microservice
2. Chapter management: Direct content editing in `ChapterEditForm`
3. Store distribution: `backend/publishing/integrations/stores/` (Amazon KDP, Apple Books)

## Common Debug Areas
- **File Uploads**: Check Supabase bucket permissions and multipart handling
- **State Sync**: Verify Zustand actions call `fetch*()` after mutations
- **Microservice Communication**: Check gateway routing in `backend/server.cjs`
- **Environment Variables**: Multiple sources (`config/env.cjs` files)

## Authentication
- JWT-based auth with `middleware/auth.cjs`
- Service-to-service tokens for microservice communication
- Role-based permissions through `authRole.cjs`

## Deployment
- **Render.com** with monorepo config (`render.yaml`)
- Auto-migrations via `run_all_migrations.sql`
- Region: eu-north-1 (optimized for Poland)
