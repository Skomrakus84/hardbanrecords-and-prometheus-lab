import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAppStore } from '../store/appStore';
import { 
  MusicalNoteIcon, 
  BookOpenIcon, 
  ChartBarIcon,
  UsersIcon,
  CurrencyDollarIcon,
  PlayIcon
} from '@heroicons/react/24/outline';

const HomePage: React.FC = () => {
  const { music, publishing, isLoading, fetchAllData } = useAppStore();

  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  const stats = [
    {
      name: 'Active Releases',
      value: music.releases?.length || 0,
      icon: MusicalNoteIcon,
      color: 'bg-blue-500',
      href: '/music/releases'
    },
    {
      name: 'Published Books',
      value: publishing.books?.length || 0,
      icon: BookOpenIcon,
      color: 'bg-green-500',
      href: '/publishing/books'
    },
    {
      name: 'Total Artists',
      value: '12', // Placeholder - dodamy później
      icon: UsersIcon,
      color: 'bg-purple-500',
      href: '/music/artists'
    },
    {
      name: 'Monthly Revenue',
      value: '$24.5K', // Placeholder
      icon: CurrencyDollarIcon,
      color: 'bg-yellow-500',
      href: '/music/analytics'
    }
  ];

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg shadow-lg p-8 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold mb-2">HardbanRecords-Lab</h1>
            <p className="text-lg opacity-90">
              Professional music distribution and digital publishing platform
            </p>
          </div>
          <div className="hidden md:block">
            <div className="w-24 h-24 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
              <PlayIcon className="w-12 h-12" />
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Link 
              key={stat.name}
              to={stat.href}
              className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow duration-200"
            >
              <div className="flex items-center">
                <div className={`${stat.color} rounded-lg p-3 mr-4`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.name}</p>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Music Section */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center mb-4">
            <MusicalNoteIcon className="w-8 h-8 text-blue-600 mr-3" />
            <h2 className="text-xl font-bold text-gray-900">Music Distribution</h2>
          </div>
          <p className="text-gray-600 mb-4">
            Manage your music releases, track analytics, and distribute to all major platforms.
          </p>
          <div className="space-y-2">
            <Link 
              to="/music/releases" 
              className="block p-3 rounded-md bg-blue-50 hover:bg-blue-100 transition-colors"
            >
              <span className="font-medium text-blue-900">Latest Releases</span>
              <span className="block text-sm text-blue-600">
                {music.releases?.length || 0} active releases
              </span>
            </Link>
            <Link 
              to="/music/analytics" 
              className="block p-3 rounded-md bg-blue-50 hover:bg-blue-100 transition-colors"
            >
              <span className="font-medium text-blue-900">Analytics Dashboard</span>
              <span className="block text-sm text-blue-600">Track performance across platforms</span>
            </Link>
          </div>
        </div>

        {/* Publishing Section */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center mb-4">
            <BookOpenIcon className="w-8 h-8 text-green-600 mr-3" />
            <h2 className="text-xl font-bold text-gray-900">Digital Publishing</h2>
          </div>
          <p className="text-gray-600 mb-4">
            Publish and distribute your books to global markets including Amazon KDP and Apple Books.
          </p>
          <div className="space-y-2">
            <Link 
              to="/publishing/books" 
              className="block p-3 rounded-md bg-green-50 hover:bg-green-100 transition-colors"
            >
              <span className="font-medium text-green-900">Book Catalog</span>
              <span className="block text-sm text-green-600">
                {publishing.books?.length || 0} published books
              </span>
            </Link>
            <Link 
              to="/publishing/sales" 
              className="block p-3 rounded-md bg-green-50 hover:bg-green-100 transition-colors"
            >
              <span className="font-medium text-green-900">Sales Analytics</span>
              <span className="block text-sm text-green-600">Monitor book sales and revenue</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
          <ChartBarIcon className="w-6 h-6 mr-2" />
          Recent Activity
        </h2>
        <div className="space-y-4">
          {music.releases && music.releases.length > 0 ? (
            music.releases.slice(0, 3).map((release, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mr-4">
                    <MusicalNoteIcon className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{release.title}</p>
                    <p className="text-sm text-gray-600">Released {release.releaseDate}</p>
                  </div>
                </div>
                <span className="px-3 py-1 bg-green-100 text-green-800 text-sm font-medium rounded-full">
                  {release.status}
                </span>
              </div>
            ))
          ) : (
            <p className="text-gray-500 text-center py-8">No recent activity</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default HomePage;