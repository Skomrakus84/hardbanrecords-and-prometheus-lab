import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useAuthStore } from './store/authStore';
import AuthForm from './components/auth/AuthForm';
import MainLayout from './layouts/MainLayout';
import HomePage from './pages/HomePage';
import MusicDashboard from './pages/music/MusicDashboard';
import PublishingDashboard from './pages/publishing/PublishingDashboard';
import Settings from './pages/settings';

export const App: React.FC = () => {
  const { user, isLoading, getCurrentUser } = useAuthStore();

  useEffect(() => {
    // Try to get current user on app load
    getCurrentUser();
  }, [getCurrentUser]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Loading...</h2>
          <p className="text-gray-600">Please wait while we set up your workspace</p>
        </div>
      </div>
    );
  }

  // For development, always show main app
  // if (!user) {
  //   return <AuthForm />;
  // }

  return (
    <Router>
      <MainLayout>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/music/*" element={<MusicDashboard />} />
          <Route path="/publishing/*" element={<PublishingDashboard />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>
      </MainLayout>
    </Router>
  );
};

export default App;
