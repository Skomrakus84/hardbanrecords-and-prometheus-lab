import React from 'react';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import ReleasesPage from './ReleasesPage';
import ArtistsPage from './ArtistsPage';
import AnalyticsPage from './AnalyticsPage';
import RoyaltiesPage from './RoyaltiesPage';
import DistributionPage from './DistributionPage';

const MusicDashboard: React.FC = () => {
  const location = useLocation();

  const navItems = [
    { path: '/music', label: 'Overview', exact: true },
    { path: '/music/releases', label: 'Releases' },
    { path: '/music/artists', label: 'Artists' },
    { path: '/music/analytics', label: 'Analytics' },
    { path: '/music/royalties', label: 'Royalties' },
    { path: '/music/distribution', label: 'Distribution' },
  ];

  return (
    <div className="music-dashboard">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Music Distribution</h1>
        <p className="text-gray-600">Manage your music releases, artists, and distribution channels</p>
      </div>

      {/* Sub Navigation */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          {navItems.map((item) => {
            const isActive = item.exact 
              ? location.pathname === item.path
              : location.pathname.startsWith(item.path);
            
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  isActive
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Routes */}
      <Routes>
        <Route path="/" element={<MusicOverview />} />
        <Route path="/releases/*" element={<ReleasesPage />} />
        <Route path="/artists/*" element={<ArtistsPage />} />
        <Route path="/analytics/*" element={<AnalyticsPage />} />
        <Route path="/royalties/*" element={<RoyaltiesPage />} />
        <Route path="/distribution/*" element={<DistributionPage />} />
      </Routes>
    </div>
  );
};

// Overview component
const MusicOverview: React.FC = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {/* Stats Cards */}
      <div className="bg-white overflow-hidden shadow rounded-lg">
        <div className="p-5">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-indigo-500 rounded-md flex items-center justify-center">
                <span className="text-white font-bold">♪</span>
              </div>
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">Total Releases</dt>
                <dd className="text-lg font-medium text-gray-900">12</dd>
              </dl>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white overflow-hidden shadow rounded-lg">
        <div className="p-5">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-green-500 rounded-md flex items-center justify-center">
                <span className="text-white font-bold">♬</span>
              </div>
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">Active Artists</dt>
                <dd className="text-lg font-medium text-gray-900">8</dd>
              </dl>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white overflow-hidden shadow rounded-lg">
        <div className="p-5">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-yellow-500 rounded-md flex items-center justify-center">
                <span className="text-white font-bold">$</span>
              </div>
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">Monthly Revenue</dt>
                <dd className="text-lg font-medium text-gray-900">$2,847</dd>
              </dl>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white overflow-hidden shadow rounded-lg">
        <div className="p-5">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-red-500 rounded-md flex items-center justify-center">
                <span className="text-white font-bold">⚡</span>
              </div>
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">Stream Count</dt>
                <dd className="text-lg font-medium text-gray-900">45.2K</dd>
              </dl>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="col-span-full bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Recent Activity</h3>
          <div className="space-y-3">
            <div className="flex items-center">
              <div className="flex-shrink-0 h-10 w-10 bg-indigo-100 rounded-full flex items-center justify-center">
                <span className="text-indigo-600 font-medium">♪</span>
              </div>
              <div className="ml-4">
                <div className="text-sm font-medium text-gray-900">New release "Summer Vibes" published</div>
                <div className="text-sm text-gray-500">2 hours ago</div>
              </div>
            </div>
            <div className="flex items-center">
              <div className="flex-shrink-0 h-10 w-10 bg-green-100 rounded-full flex items-center justify-center">
                <span className="text-green-600 font-medium">$</span>
              </div>
              <div className="ml-4">
                <div className="text-sm font-medium text-gray-900">Royalty payment of $450 received</div>
                <div className="text-sm text-gray-500">1 day ago</div>
              </div>
            </div>
            <div className="flex items-center">
              <div className="flex-shrink-0 h-10 w-10 bg-yellow-100 rounded-full flex items-center justify-center">
                <span className="text-yellow-600 font-medium">👤</span>
              </div>
              <div className="ml-4">
                <div className="text-sm font-medium text-gray-900">New artist "The Wave Riders" onboarded</div>
                <div className="text-sm text-gray-500">3 days ago</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MusicDashboard;
