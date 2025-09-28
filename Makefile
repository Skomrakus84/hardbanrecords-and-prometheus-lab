# HardbanRecords Lab - Makefile dla typowych zadań

.PHONY: install start dev build test deploy-backend deploy-frontend check-deploy

# Instalacja zależności
install:
	npm install
	cd backend && npm install

# Uruchomienie produkcyjne
start:
	cd backend && npm start

# Uruchomienie developerskie
dev:
	npm run dev & cd backend && npm run dev

# Build
build:
	npm run build
	cd backend && npm run build

# Testy
test:
	npm test

# Wdrożenie backendu na Render.com
deploy-backend:
	@echo "Deploying backend to Render.com..."
	@echo "Visit: https://dashboard.render.com/web/srv-XXXXX to monitor deployment"

# Wdrożenie frontendu na Vercel
deploy-frontend:
	@echo "Deploying frontend to Vercel..."
	npx vercel --prod

# Sprawdzenie statusu wdrożenia
check-deploy:
	@echo "Checking deployment status..."
	@echo "Backend: curl https://hardbanrecords-backend.onrender.com/health"
	@echo "Frontend: https://hardbanrecords-lab.vercel.app"
