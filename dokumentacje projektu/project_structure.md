# 🏗️ HardbanRecords Lab - Struktura Projektu

## Struktura katalogów

```
hardbanrecords-lab/
├── frontend/                     # Frontend aplikacji (React + Vite + TypeScript)
│   ├── src/
│   │   ├── modules/
│   │   │   ├── music/          # Moduł Music Publishing AI
│   │   │   ├── publishing/     # Moduł Digital Publishing AI
│   │   │   └── prometheus/     # Moduł Prometheus AI
│   │   ├── shared/             # Komponenty współdzielone
│   │   └── store/              # Zarządzanie stanem (Zustand)
│   └── public/
│
├── backend/                      # Backend - API Gateway i mikrousługi
│   ├── gateway/                 # API Gateway (Express.js)
│   │   ├── routes/
│   │   └── middleware/
│   │
│   ├── music/                   # Music Publishing AI Service
│   │   ├── mastering/          # Serwis masteringu AI
│   │   ├── distribution/       # Serwis dystrybucji
│   │   ├── rights/            # Zarządzanie prawami
│   │   └── analytics/         # Analityka muzyczna
│   │
│   ├── publishing/             # Digital Publishing AI Service
│   │   ├── writing/           # Narzędzia pisarskie
│   │   ├── conversion/        # Konwersja formatów
│   │   ├── distribution/      # Dystrybucja e-booków
│   │   └── rights/           # Zarządzanie prawami
│   │
│   ├── prometheus/            # Prometheus AI Service
│   │   ├── factory/          # AI Factory - generowanie treści
│   │   ├── distribution/     # Distribution Hub
│   │   ├── social/          # Social Media Management
│   │   └── analytics/       # Analytics & Optimization
│   │
│   └── shared/               # Współdzielone komponenty
│       ├── models/
│       ├── utils/
│       └── types/
│
├── services/                 # Dodatkowe usługi
│   ├── mastering-ai/        # Serwis AI do masteringu
│   ├── ai-factory/          # Serwis generowania treści
│   └── analytics/           # Serwis analityczny
│
├── infrastructure/          # Konfiguracja infrastruktury
│   ├── docker/
│   │   ├── development/
│   │   └── production/
│   ├── kubernetes/
│   └── terraform/
│
├── scripts/                # Skrypty pomocnicze
│   ├── setup/
│   ├── deployment/
│   └── maintenance/
│
└── docs/                   # Dokumentacja
    ├── api/
    ├── architecture/
    └── guides/
```

## Mikrousługi i ich odpowiedzialności

### 1. Gateway Service (Port 3001)
- Routing żądań do odpowiednich mikrousług
- Autentykacja i autoryzacja
- Rate limiting
- Caching
- Logging

### 2. Music Publishing AI Service (Port 3002)
- Mastering AI
- Globalna dystrybucja muzyki
- Zarządzanie metadanymi
- Analityka muzyczna
- Zarządzanie prawami

### 3. Digital Publishing AI Service (Port 3003)
- Narzędzia do pisania
- Konwersja formatów
- Dystrybucja e-booków
- Generowanie audiobooków
- Zarządzanie prawami cyfrowymi

### 4. Prometheus AI Service (Port 3004)
- Generowanie treści (AI Factory)
- Dystrybucja i PR
- Zarządzanie social media
- Analityka i optymalizacja
- AR/VR/MR

### 5. Mastering AI Service (Port 3005)
- Przetwarzanie audio
- Mastering AI
- Analiza audio
- Generowanie raportów jakości

### 6. AI Factory Service (Port 3006)
- Generowanie tekstu
- Generowanie obrazów
- Generowanie audio
- Przetwarzanie wideo

### 7. Analytics Service (Port 3007)
- Agregacja danych
- Analiza w czasie rzeczywistym
- Generowanie raportów
- Predykcje AI

## Współdzielone Komponenty

### 1. Models
- Definicje typów
- Schematy baz danych
- DTO (Data Transfer Objects)

### 2. Utils
- Pomocnicze funkcje
- Integracje API
- Obsługa błędów

### 3. Types
- TypeScript types/interfaces
- Enums
- Constants

## Bazy Danych i Storage

### 1. Supabase
- Główna baza danych (PostgreSQL)
- Storage dla plików
- Autentykacja

### 2. MongoDB
- Dane czasu rzeczywistego
- Cache
- Logi

### 3. Redis
- Cache
- Kolejki zadań
- Rate limiting

## Monitoring i Logging

### 1. Elasticsearch + Kibana
- Logi aplikacji
- Monitoring błędów
- Alerty

### 2. Prometheus + Grafana
- Metryki
- Dashboardy
- Health checks

## CI/CD

### 1. GitHub Actions
- Testy
- Build
- Deployment

### 2. Docker
- Kontenery rozwojowe
- Kontenery produkcyjne

### 3. Kubernetes
- Orkiestracja
- Skalowanie
- Load balancing