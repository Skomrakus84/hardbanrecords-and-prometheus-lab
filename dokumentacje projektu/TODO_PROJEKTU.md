# Zadania projektu HardbanRecords-Lab

## Ukończone

- Przeniesienie pełnej logiki Zustand store do `src/store/appStore.ts` (typy, akcje, mock dane, onboarding, taski, splits, chapters, toasts)
- Utworzenie i implementacja wszystkich wymaganych komponentów w `src/components/` (AIToolCard, TaskManager, Modal, ConfirmationModal, Tooltip, HelpView, constants.ts, DashboardCard, Header, ToastContainer, FullScreenLoader, OnboardingTour)
- Podział widoków na pliki w `src/pages/music`, `src/pages/publishing`
- Naprawa importów i typów, dopuszczenie `undefined` w typach, poprawa Task i AppState
- Analiza i uporządkowanie katalogów: główny, src, src/components, src/pages, backend, cypress, scripts, layouts, utils
- Identyfikacja i przygotowanie do usunięcia zbędnych plików .md
- Wdrożenie uploadu plików okładki i pliku muzycznego w module muzycznym (AddReleaseForm, integracja z Supabase Storage, backend, client)
- Naprawa struktury JSX i typów w AddReleaseForm, przekazywanie tylko właściwych pól do backendu
- Wdrożenie obsługi dodawania i usuwania rozdziałów w `ChaptersPage` (frontend, Zustand, UX)
- Wdrożenie podglądu plików audio i PDF w `ChapterEditForm` (audio player, iframe/pdf, link do pobrania)

### Widoki i komponenty frontend

#### Niezbędne widoki (pages):
- [x] Dashboard (strona główna z podsumowaniem)
- [x] MusicPage (zarządzanie wydaniami muzycznymi)
- [x] PublishingPage (zarządzanie książkami)
- [x] TasksPage (zadania globalne lub per moduł)
- [x] ChaptersPage (edycja rozdziałów książki)
- [x] SplitsView (edycja podziałów tantiem)
- [x] ReleasesView (lista wydań muzycznych)
- [x] HomePage (landing, onboarding)

#### Niezbędne komponenty formularzy:
- [x] AddReleaseForm (dodawanie wydania muzycznego)
- [x] BookForm (dodawanie/edycja książki)
- [x] ChapterEditForm (edycja rozdziału)
- [x] SplitsForm (edycja podziałów tantiem)
- [x] TaskForm (dodawanie/edycja zadania)

#### Niezbędne komponenty list i kart:
- [x] ReleaseCard (pojedyncze wydanie muzyczne)
- [x] BookCard (pojedyncza książka)
- [x] ChapterCard (pojedynczy rozdział)
- [x] TaskCard (pojedyncze zadanie)
- [x] DashboardCard (kafelek na dashboardzie)

#### Komponenty wspólne/utility:
- [x] Modal (modalne okno)
- [x] ConfirmationModal (potwierdzenie akcji)
- [x] ToastContainer (powiadomienia)
- [x] FullScreenLoader (ładowanie globalne)
- [x] Tooltip (podpowiedzi)
- [x] HelpView (pomoc)
- [x] Header (nagłówek)
- [x] MainLayout (layout aplikacji)
- [x] FileUpload (komponent uploadu plików)
- [x] OnboardingTour (przewodnik po aplikacji)

#### Dodatkowe/rozszerzające funkcje (nice-to-have):
- [x] SearchBar (wyszukiwarka wydania/książki/rozdziału)
- [x] FilterBar (filtrowanie list)
- [x] UserProfile (profil użytkownika)
- [x] SettingsPage (ustawienia aplikacji)
- [x] AnalyticsView (statystyki, wykresy)
- [x] AI/AssistantPanel (integracja AI, podpowiedzi)
- [x] NotificationBell (ikona powiadomień)
- [x] ActivityLog (log aktywności)
- [x] ErrorBoundary (obsługa błędów)
- [x] ThemeSwitcher (zmiana motywu)
- [x] LanguageSwitcher (zmiana języka)
- [x] Pagination (paginacja list)
- [x] EmptyState (widok pustej listy)
- [x] FilePreview (zaawansowany podgląd plików)
- [x] ImageGallery (galeria ilustracji książki)
- [x] CollaboratorsList (lista współtwórców)
- [x] TagInput (dodawanie tagów/keywordów)

### Backend

- Zainicjowanie projektu Node.js w folderze `backend`
- Instalacja frameworka Express.js
- Stworzenie podstawowego pliku `server.js`
- Uruchomienie serwera i stworzenie testowego endpointu `GET /api`
- Instalacja biblioteki `pg` do obsługi PostgreSQL
- Stworzenie modułu konfiguracji połączenia z bazą danych
- Implementacja bezpiecznego zarządzania danymi dostępowymi (DATABASE_URL) przy użyciu zmiennych środowiskowych (`.env`)
- Stworzenie endpointu testującego połączenie z bazą danych
- Stworzenie endpointu `GET /api/data` do pobierania całego stanu aplikacji (książki, wydania, zadania)
- Implementacja mechanizmu CORS, aby umożliwić komunikację między frontendem a backendem

## Ostatnie postępy (wrzesień 2025)

- [x] Globalna integracja Zustand store z backendem (fetch/add/update/delete przez API, usunięcie mocków, refaktoryzacja mutacji, pełna synchronizacja danych)
- [x] Refaktoryzacja wszystkich operacji mutujących (add/update/toggle) – po każdej mutacji automatyczne odświeżenie danych przez fetch
- [x] Store jako jedyne źródło prawdy, UI zawsze pokazuje aktualny stan z backendu
- [x] Walidacja danych wejściowych (express-validator) dla releases, books, tasks
- [x] Middleware JWT – ochrona endpointów, generowanie i odświeżanie tokenów
- [x] Obsługa ról użytkowników (admin, user) i ograniczenia dostępu
- [x] Globalny handler błędów i czytelne logowanie (morgan)
- [x] Endpointy rejestracji, logowania, odświeżania tokenów
- [x] Integracja z bazą danych (tabela users, migracja SQL)
- [x] Rate limiting i brute-force protection na logowanie/rejestrację
- [x] Testy i walidacja całego flow użytkownika (rejestracja, logowanie, uprawnienia)
- [x] Refaktoryzacja kodu backendu, usunięcie błędów składniowych w trasach music.cjs i publishing.cjs

## Do zrobienia

- Finalizacja porządkowania katalogu projektu
- Dalsze uzupełnianie i aktualizacja zadań w tym pliku
- Rozbudowa widoków i komponentów zgodnie z wymaganiami projektu
- Utrzymanie spójności i kompletności projektu


### Zadania backendowe

- Moduł Muzyczny:
    - [x] `POST /api/music/releases` - do dodawania nowego wydania (z uploadem okładki i pliku muzycznego)
    - [x] `PATCH /api/music/releases/:id/splits` - do aktualizacji podziałów tantiem
    - [x] `POST /api/music/tasks` - do dodawania nowego zadania
    - [x] `PATCH /api/music/tasks/:id` - do zmiany statusu zadania
- Moduł Wydawniczy:
    - [x] `POST /api/publishing/books` - do dodawania nowej książki
    - [x] `PATCH /api/publishing/books/:id` - do aktualizacji danych książki (w tym rozdziałów)
    - [x] `PATCH /api/publishing/books/:id/chapters/:chapterIndex` - do aktualizacji treści rozdziału (obsługiwane przez PATCH /books/:id z chapters)
    - [x] `POST /api/publishing/tasks` - do dodawania nowego zadania
    - [x] `PATCH /api/publishing/tasks/:id` - do zmiany statusu zadania
- Integracja z Supabase Storage (Przesyłanie Plików):
    - [x] Migracja z AWS S3 na Supabase Storage
    - [x] Instalacja `@supabase/supabase-js`
    - [x] Stworzenie endpointu `GET /api/s3-presigned-url`, który generuje bezpieczny, tymczasowy link do przesyłania plików (kompatybilny z Supabase)
    - [x] Implementacja logiki po stronie frontendu do przesyłania plików bezpośrednio do Supabase Storage przy użyciu wygenerowanego linku
    - [x] Wdrożenie uploadu ilustracji do książek oraz plików do rozdziałów (frontend, Supabase Storage, ChaptersPage, ChapterEditForm)
- Dodanie podstawowej walidacji przychodzących danych
- Zorganizowanie kodu w moduły (np. osobne pliki dla `routes`, `controllers`)
- Przygotowanie aplikacji do wdrożenia na darmowej platformie (np. Vercel, Render)
- Konfiguracja zmiennych środowiskowych na platformie docelowej
- Wdrożenie aplikacji i przeprowadzenie testów na środowisku produkcyjnym

---
Ten plik jest jedynym źródłem prawdy dla postępu i zadań w projekcie. Aktualizuj go na bieżąco.
