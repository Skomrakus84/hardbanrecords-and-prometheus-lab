# HardbanRecords Lab - Development Guide

## Quick Start

1. **Install Dependencies**
```bash
npm install
```

2. **Set up Environment Variables**
Copy `.env.example` files and fill in your values:
```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
```

3. **Start Development Server**
```bash
npm run dev
```

## Available Scripts

- `npm run dev` - Start all services in development mode
- `npm run build` - Build the application for production
- `npm run start` - Start all services in production mode
- `npm test` - Run all tests

## Development Workflow

1. **Frontend Development** (http://localhost:5173)
   - React + Vite application
   - Real-time HMR updates
   - Component development

2. **Backend Development** (http://localhost:3001)
   - Express.js API Gateway
   - Music service (port 3002)
   - Publishing service (port 3003)
   - Prometheus AI (port 3004)

3. **Testing**
   - Unit tests: `npm test`
   - E2E tests: `npm run test:e2e`

## Deployment

The application is deployed on Vercel:

1. **Automatic Deployments**
   - Push to `main` branch triggers production deployment
   - Push to other branches creates preview deployments

2. **Manual Deployment**
```bash
vercel --prod
```

3. **Environment Variables**
   - Set up environment variables in Vercel dashboard
   - Use different values for production/preview

## Project Structure

```
HardbanRecords-Lab/
├── frontend/           # React + Vite frontend
├── backend/           # Main backend services
│   ├── music/        # Music publishing service
│   ├── publishing/   # Digital publishing service
│   └── prometheus/   # AI marketing suite
└── shared/          # Shared utilities and types
```

## Adding New Features

1. Create feature branch:
```bash
git checkout -b feature/your-feature-name
```

2. Develop and test locally

3. Create pull request to `main`

## Troubleshooting

1. **Port Conflicts**
```bash
lsof -i :[port]
kill -9 [PID]
```

2. **Environment Issues**
```bash
npm run check:env  # Verify environment variables
```

3. **Clean Install**
```bash
npm run clean:install  # Remove node_modules and reinstall
```

## Getting Help

- Check documentation in `/docs`
- Open issue on GitHub
- Contact development team