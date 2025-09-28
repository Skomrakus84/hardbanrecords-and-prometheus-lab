import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import FullScreenLoader from './components/ui/FullScreenLoader';
import ErrorBoundary from './components/ui/ErrorBoundary';

// Lazy load pages for better performance
const HomePageNew = lazy(() => import('./pages/HomePageNew'));
const ReleasesPageNew = lazy(() => import('./pages/music/ReleasesPageNew'));
const ArtistsPageNew = lazy(() => import('./pages/music/ArtistsPageNew'));
const DistributionPageNew = lazy(() => import('./pages/music/DistributionPageNew'));
const AnalyticsPageNew = lazy(() => import('./pages/music/AnalyticsPageNew'));
const PublishingDashboard = lazy(() => import('./pages/publishing/PublishingDashboard'));
const BooksPageNew = lazy(() => import('./pages/publishing/BooksPageNew'));
const ContractsPageNew = lazy(() => import('./pages/ContractsPageNew'));
const SettingsPageNew = lazy(() => import('./pages/SettingsPageNew'));

// Keep critical components loaded immediately
import MainLayout from './layouts/MainLayout';

// Loading fallback component
const LoadingFallback: React.FC = () => (
  <div className="flex items-center justify-center min-h-screen">
    <FullScreenLoader />
  </div>
);

const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <MainLayout>
          <Suspense fallback={<LoadingFallback />}>
            <Routes>
              {/* Home Route */}
              <Route path="/" element={<HomePageNew />} />

              {/* Music Module Routes */}
              <Route path="/music/releases" element={<ReleasesPageNew />} />
              <Route path="/music/artists" element={<ArtistsPageNew />} />
              <Route path="/music/distribution" element={<DistributionPageNew />} />
              <Route path="/music/analytics" element={<AnalyticsPageNew />} />

              {/* Publishing Module Routes */}
              <Route path="/publishing" element={<PublishingDashboard />} />
              <Route path="/publishing/books" element={<BooksPageNew />} />

              {/* Global Routes */}
              <Route path="/contracts" element={<ContractsPageNew />} />
              <Route path="/settings" element={<SettingsPageNew />} />

              {/* Fallback for 404 */}
              <Route path="*" element={
                <div className="flex items-center justify-center min-h-screen">
                  <div className="text-center">
                    <h1 className="text-4xl font-bold text-gray-800 mb-4">404</h1>
                    <p className="text-gray-600 mb-8">Strona nie została znaleziona</p>
                    <a href="/" className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                      Powrót do strony głównej
                    </a>
                  </div>
                </div>
              } />
            </Routes>
          </Suspense>
        </MainLayout>

        {/* Global Toast Notifications */}
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#363636',
              color: '#fff',
            },
            success: {
              style: {
                background: '#10B981',
              },
            },
            error: {
              style: {
                background: '#EF4444',
              },
            },
          }}
        />
      </BrowserRouter>
    </ErrorBoundary>
  );
};

export default App;
