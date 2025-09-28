import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAppStore } from '../store/appStore';

const HomePage: React.FC = () => {
  const { music, publishing, isLoading, fetchAllData } = useAppStore();

  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  // Stats zgodnie z UI.txt specyfikacją
  const stats = [
    {
      name: 'Active Artists',
      value: '25',
      icon: '👥',
      color: 'bg-blue-500',
      status: 'Active',
      description: 'Signed to HardbanRecords',
      href: '/music/artists'
    },
    {
      name: 'Music Releases',
      value: music.releases?.length || '45',
      icon: '🎵',
      color: 'bg-purple-500',
      status: 'Live',
      description: 'Albums & Singles live',
      href: '/music/releases'
    },
    {
      name: 'Published Books',
      value: publishing.books?.length || '12',
      icon: '📚',
      color: 'bg-green-500',
      status: 'Published',
      description: 'Available in stores',
      href: '/publishing/books'
    },
    {
      name: 'Revenue',
      value: '$125,000',
      icon: '💰',
      color: 'bg-yellow-500',
      trend: '+23%',
      description: 'Combined income streams',
      href: '/music/analytics'
    }
  ];

  // Quick Actions zgodnie z UI.txt
  const quickActions = [
    { name: '🎵 Create Music Release', href: '/music/releases/new', color: 'bg-purple-500' },
    { name: '📚 Publish New Book', href: '/publishing/books/new', color: 'bg-green-500' },
    { name: '👥 Add New Artist', href: '/music/artists/new', color: 'bg-blue-500' },
    { name: '📊 View Analytics', href: '/music/analytics', color: 'bg-indigo-500' }
  ];

  // Recent Activities zgodnie z UI.txt
  const recentActivities = [
    {
      emoji: '🎵',
      title: 'New album \'Midnight Dreams\' released',
      details: 'by The Synthwave • 2 hours ago',
      status: '✅ Success'
    },
    {
      emoji: '📚',
      title: 'Book \'Digital Future\' published',
      details: 'by Alex Chen • 5 hours ago',
      status: '✅ Success'
    },
    {
      emoji: '📊',
      title: 'Monthly analytics report generated',
      details: '1M+ streams • 1 day ago',
      status: '✅ Success'
    },
    {
      emoji: '✨',
      title: 'New artist \'Neon Beats\' signed',
      details: 'Electronic • 2 days ago',
      status: '✅ Success'
    }
  ];

  // Performance Metrics zgodnie z UI.txt
  const performanceMetrics = [
    {
      title: 'Music Streams',
      value: '854K',
      trend: 'Total streams across platforms',
      info: '4 releases live',
      gradient: 'bg-gradient-to-r from-blue-500 to-blue-600',
      icon: '🎧'
    },
    {
      title: 'Book Sales',
      value: '1,247',
      trend: 'Books sold this month',
      info: '3 books published',
      gradient: 'bg-gradient-to-r from-green-500 to-green-600',
      icon: '📚'
    },
    {
      title: 'Platform Coverage',
      value: '20',
      trend: 'Active distribution channels',
      info: '10 music + 10 publishing',
      gradient: 'bg-gradient-to-r from-purple-500 to-purple-600',
      icon: '🌐'
    }
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 p-6">
      {/* 1. HERO SECTION - Gradient Background zgodnie z UI.txt */}
      <div className="bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 rounded-xl shadow-lg p-8 text-white">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">🎵 Welcome to HardbanRecords Lab</h1>
          <p className="text-xl text-purple-100 mb-6">
            Your complete music distribution and digital publishing platform
          </p>

          {/* Status indicators */}
          <div className="flex flex-wrap justify-center gap-4 text-sm">
            <div className="flex items-center">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse mr-2"></div>
              <span>🟢 All systems operational</span>
            </div>
            <div className="flex items-center">
              <span>📈 Revenue up 23% this month</span>
            </div>
            <div className="flex items-center">
              <span>🔥 28 active projects</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. STATISTICS GRID - 4 karty zgodnie z UI.txt */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <Link
            key={stat.name}
            to={stat.href}
            className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-all hover:-translate-y-1 group"
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`w-12 h-12 ${stat.color} rounded-lg flex items-center justify-center text-2xl`}>
                {stat.icon}
              </div>
              <span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm font-medium rounded-full">
                {stat.status}
              </span>
            </div>
            <div>
              <p className="text-3xl font-bold text-gray-900 mb-1">{stat.value}</p>
              <p className="text-sm text-gray-600 mb-2">{stat.name}</p>
              <p className="text-xs text-gray-400">{stat.description}</p>
              {stat.trend && (
                <p className="text-sm font-medium text-green-600 mt-2">{stat.trend}</p>
              )}
            </div>
          </Link>
        ))}
      </div>

      {/* 3. QUICK ACTIONS SECTION */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">🚀 Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickActions.map((action) => (
            <Link
              key={action.name}
              to={action.href}
              className={`${action.color} text-white p-4 rounded-lg text-center hover:opacity-90 transition-opacity group`}
            >
              <span className="block font-medium group-hover:scale-105 transition-transform">
                {action.name}
              </span>
            </Link>
          ))}
        </div>
      </div>

      {/* 4. PERFORMANCE METRICS - 3 karty gradient zgodnie z UI.txt */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {performanceMetrics.map((metric) => (
          <div key={metric.title} className={`${metric.gradient} rounded-xl shadow-lg p-6 text-white`}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">{metric.title}</h3>
              <span className="text-2xl">{metric.icon}</span>
            </div>
            <div>
              <p className="text-3xl font-bold mb-2">{metric.value}</p>
              <p className="text-sm opacity-90 mb-1">{metric.trend}</p>
              <p className="text-xs opacity-75">{metric.info}</p>
            </div>
          </div>
        ))}
      </div>

      {/* 5. RECENT ACTIVITY FEED zgodnie z UI.txt */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">🕒 Recent Activity</h2>
        <div className="space-y-4">
          {recentActivities.map((activity, index) => (
            <div key={index} className="flex items-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
              <span className="text-2xl mr-4">{activity.emoji}</span>
              <div className="flex-1">
                <p className="font-medium text-gray-900">{activity.title}</p>
                <p className="text-sm text-gray-600">{activity.details}</p>
              </div>
              <span className="text-sm text-green-600 font-medium">{activity.status}</span>
            </div>
          ))}
        </div>
      </div>

      {/* 6. CALL-TO-ACTION SECTION zgodnie z UI.txt */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl shadow-lg p-8 text-white text-center">
        <h2 className="text-3xl font-bold mb-4">🎯 Ready to create something amazing?</h2>
        <p className="text-xl text-indigo-100 mb-8">
          Start your next music release or book publishing project today
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            to="/music/releases/new"
            className="px-8 py-3 bg-white text-indigo-600 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
          >
            🎵 Create Music Release
          </Link>
          <Link
            to="/publishing/books/new"
            className="px-8 py-3 bg-indigo-700 text-white rounded-lg font-semibold hover:bg-indigo-800 transition-colors"
          >
            📚 Publish New Book
          </Link>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
