import React, { useState } from 'react';
import { useAuthStore } from '../../store/authStore';
import { EnhancedReleasesView } from '../music/EnhancedReleasesView';
import { AnalyticsDashboard } from '../music/AnalyticsDashboard';
import { PublishingDashboard } from '../publishing/PublishingDashboard';
import { AdminDashboard } from '../admin/AdminDashboard';
import FileUpload from '../shared/FileUpload';

type MainView = 'dashboard' | 'music' | 'analytics' | 'publishing' | 'files' | 'admin' | 'profile';

export const MainNavigation: React.FC = () => {
  const { user, logout } = useAuthStore();
  const [activeView, setActiveView] = useState<MainView>('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [uploadMessage, setUploadMessage] = useState<string | null>(null);

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Please log in to continue</h1>
          <p className="text-gray-600">You need to be authenticated to access this application.</p>
        </div>
      </div>
    );
  }

  const navigationItems = [
    { id: 'dashboard', name: 'Dashboard', icon: '📊' },
    { id: 'music', name: 'Music', icon: '🎵' },
    { id: 'analytics', name: 'Analytics', icon: '📈' },
    { id: 'publishing', name: 'Publishing', icon: '📚' },
    { id: 'files', name: 'Files', icon: '📁' },
    ...(user.role === 'admin' ? [{ id: 'admin', name: 'Admin', icon: '⚙️' }] : []),
    { id: 'profile', name: 'Profile', icon: '👤' }
  ] as const;

  const handleLogout = () => {
    logout();
    setActiveView('dashboard');
  };

  const renderActiveView = () => {
    switch (activeView) {
      case 'dashboard':
        return (
          <div className="space-y-8">
            <div className="bg-white rounded-lg shadow p-6">
              <h1 className="text-3xl font-bold text-gray-900 mb-4">
                Welcome back, {user.username}!
              </h1>
              <p className="text-gray-600 mb-6">
                Here's your overview of the HardbanRecords platform.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div 
                  className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-6 text-white cursor-pointer hover:from-blue-600 hover:to-blue-700 transition-all"
                  onClick={() => setActiveView('music')}
                >
                  <div className="text-2xl mb-2">🎵</div>
                  <h3 className="text-lg font-semibold mb-2">Music Releases</h3>
                  <p className="text-blue-100">Manage your music releases and tracks</p>
                </div>
                
                <div 
                  className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg p-6 text-white cursor-pointer hover:from-green-600 hover:to-green-700 transition-all"
                  onClick={() => setActiveView('analytics')}
                >
                  <div className="text-2xl mb-2">📈</div>
                  <h3 className="text-lg font-semibold mb-2">Analytics</h3>
                  <p className="text-green-100">View detailed performance metrics</p>
                </div>
                
                <div 
                  className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg p-6 text-white cursor-pointer hover:from-purple-600 hover:to-purple-700 transition-all"
                  onClick={() => setActiveView('publishing')}
                >
                  <div className="text-2xl mb-2">📚</div>
                  <h3 className="text-lg font-semibold mb-2">Publishing</h3>
                  <p className="text-purple-100">Manage publications and chapters</p>
                </div>
                
                <div 
                  className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg p-6 text-white cursor-pointer hover:from-orange-600 hover:to-orange-700 transition-all"
                  onClick={() => setActiveView('files')}
                >
                  <div className="text-2xl mb-2">📁</div>
                  <h3 className="text-lg font-semibold mb-2">File Management</h3>
                  <p className="text-orange-100">Upload and manage your files</p>
                </div>
                
                {user.role === 'admin' && (
                  <div 
                    className="bg-gradient-to-r from-red-500 to-red-600 rounded-lg p-6 text-white cursor-pointer hover:from-red-600 hover:to-red-700 transition-all"
                    onClick={() => setActiveView('admin')}
                  >
                    <div className="text-2xl mb-2">⚙️</div>
                    <h3 className="text-lg font-semibold mb-2">Administration</h3>
                    <p className="text-red-100">System administration and user management</p>
                  </div>
                )}
                
                <div 
                  className="bg-gradient-to-r from-gray-500 to-gray-600 rounded-lg p-6 text-white cursor-pointer hover:from-gray-600 hover:to-gray-700 transition-all"
                  onClick={() => setActiveView('profile')}
                >
                  <div className="text-2xl mb-2">👤</div>
                  <h3 className="text-lg font-semibold mb-2">Profile</h3>
                  <p className="text-gray-100">Manage your account settings</p>
                </div>
              </div>
            </div>
          </div>
        );
      case 'music':
        return <EnhancedReleasesView />;
      case 'analytics':
        return <AnalyticsDashboard />;
      case 'publishing':
        return <PublishingDashboard />;
      case 'files':
        return (
          <div className="bg-white rounded-lg shadow p-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-6">File Management</h1>
            {uploadMessage && (
              <div className={`p-4 rounded-lg mb-6 ${
                uploadMessage.includes('Success') ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
              }`}>
                {uploadMessage}
                <button
                  onClick={() => setUploadMessage(null)}
                  className="ml-2 underline hover:no-underline"
                >
                  Dismiss
                </button>
              </div>
            )}
            <FileUpload
              acceptedTypes={['audio/*', 'image/*', 'application/pdf', '.txt', '.doc', '.docx']}
              maxSize={100}
              multiple={true}
              uploadType="general"
              onUploadSuccess={(files) => {
                setUploadMessage(`Successfully uploaded ${files.length} file(s)`);
              }}
              onUploadError={(error) => {
                setUploadMessage(`Upload failed: ${error}`);
              }}
            />
          </div>
        );
      case 'admin':
        return user.role === 'admin' ? <AdminDashboard /> : null;
      case 'profile':
        return (
          <div className="bg-white rounded-lg shadow p-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-6">Profile Settings</h1>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Username</label>
                <input
                  type="text"
                  value={user.username}
                  disabled
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                <input
                  type="email"
                  value={user.email}
                  disabled
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
                <input
                  type="text"
                  value={user.role}
                  disabled
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Account Status</label>
                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                  user.is_verified ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {user.is_verified ? 'Verified' : 'Unverified'}
                </span>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Member Since</label>
                <p className="text-gray-600">{new Date(user.created_at).toLocaleDateString()}</p>
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navigation */}
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <h1 className="text-xl font-bold text-gray-900">HardbanRecords</h1>
              </div>
              
              {/* Desktop Navigation */}
              <div className="hidden md:ml-8 md:flex md:space-x-1">
                {navigationItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setActiveView(item.id as MainView)}
                    className={`px-3 py-2 rounded-md text-sm font-medium flex items-center space-x-2 transition-colors ${
                      activeView === item.id
                        ? 'bg-indigo-100 text-indigo-700'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                    }`}
                  >
                    <span>{item.icon}</span>
                    <span>{item.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* User Menu */}
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-600">
                Welcome, {user.username}
              </div>
              <button
                onClick={handleLogout}
                className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors text-sm"
              >
                Logout
              </button>
              
              {/* Mobile menu button */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="md:hidden p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-50"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-gray-50 border-t border-gray-200">
              {navigationItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveView(item.id as MainView);
                    setIsMobileMenuOpen(false);
                  }}
                  className={`block w-full text-left px-3 py-2 rounded-md text-base font-medium flex items-center space-x-2 transition-colors ${
                    activeView === item.id
                      ? 'bg-indigo-100 text-indigo-700'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  <span>{item.icon}</span>
                  <span>{item.name}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {renderActiveView()}
      </main>
    </div>
  );
};

export default MainNavigation;
