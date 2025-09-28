import React, { useState } from 'react';

interface Platform {
  id: string;
  name: string;
  icon: string;
  color: string;
  status: 'connected' | 'disconnected' | 'pending' | 'error';
  lastSync: string;
  releases: number;
  revenue: number;
  royaltyRate: number;
  features: string[];
}

interface Release {
  id: string;
  title: string;
  artist: string;
  status: 'scheduled' | 'processing' | 'live' | 'failed';
  platforms: string[];
  releaseDate: string;
  goLiveDate?: string;
}

const DistributionPageNew: React.FC = () => {
  const [selectedTab, setSelectedTab] = useState<'platforms' | 'releases' | 'analytics'>('platforms');
  const [showConnectModal, setShowConnectModal] = useState(false);

  const platforms: Platform[] = [
    {
      id: 'spotify',
      name: 'Spotify',
      icon: '🎵',
      color: 'bg-green-500',
      status: 'connected',
      lastSync: '2024-09-10T10:30:00Z',
      releases: 45,
      revenue: 8950,
      royaltyRate: 0.004,
      features: ['Playlist Pitching', 'Canvas Videos', 'Artist Profile']
    },
    {
      id: 'apple-music',
      name: 'Apple Music',
      icon: '🍎',
      color: 'bg-gray-800',
      status: 'connected',
      lastSync: '2024-09-10T10:25:00Z',
      releases: 45,
      revenue: 7240,
      royaltyRate: 0.007,
      features: ['Apple Music for Artists', 'Spatial Audio', 'Music Videos']
    },
    {
      id: 'youtube-music',
      name: 'YouTube Music',
      icon: '📺',
      color: 'bg-red-500',
      status: 'connected',
      lastSync: '2024-09-10T09:45:00Z',
      releases: 42,
      revenue: 2180,
      royaltyRate: 0.002,
      features: ['YouTube Content ID', 'Music Videos', 'Shorts Integration']
    },
    {
      id: 'amazon-music',
      name: 'Amazon Music',
      icon: '📦',
      color: 'bg-orange-500',
      status: 'connected',
      lastSync: '2024-09-10T08:20:00Z',
      releases: 38,
      revenue: 3420,
      royaltyRate: 0.005,
      features: ['Alexa Integration', 'HD Audio', 'Prime Music']
    },
    {
      id: 'deezer',
      name: 'Deezer',
      icon: '🎶',
      color: 'bg-purple-500',
      status: 'pending',
      lastSync: '2024-09-09T15:30:00Z',
      releases: 25,
      revenue: 890,
      royaltyRate: 0.006,
      features: ['Flow Playlists', 'HiFi Audio', 'Artist Dashboard']
    },
    {
      id: 'tidal',
      name: 'Tidal',
      icon: '🌊',
      color: 'bg-blue-500',
      status: 'error',
      lastSync: '2024-09-08T12:00:00Z',
      releases: 20,
      revenue: 650,
      royaltyRate: 0.012,
      features: ['Master Quality Audio', 'Music Videos', 'Artist Payouts']
    },
    {
      id: 'bandcamp',
      name: 'Bandcamp',
      icon: '🎸',
      color: 'bg-indigo-500',
      status: 'disconnected',
      lastSync: '',
      releases: 0,
      revenue: 0,
      royaltyRate: 0.10,
      features: ['Direct Fan Support', 'Physical Sales', 'Fan Messaging']
    },
    {
      id: 'soundcloud',
      name: 'SoundCloud',
      icon: '☁️',
      color: 'bg-orange-400',
      status: 'disconnected',
      lastSync: '',
      releases: 0,
      revenue: 0,
      royaltyRate: 0.005,
      features: ['Pro Features', 'Repost Network', 'Fan Engagement']
    }
  ];

  const releases: Release[] = [
    {
      id: '1',
      title: 'Midnight Dreams',
      artist: 'The Synthwave',
      status: 'live',
      platforms: ['Spotify', 'Apple Music', 'YouTube Music', 'Amazon Music'],
      releaseDate: '2024-01-15',
      goLiveDate: '2024-01-15T00:00:00Z'
    },
    {
      id: '2',
      title: 'Electric Pulse',
      artist: 'Neon Beats',
      status: 'live',
      platforms: ['All Platforms'],
      releaseDate: '2024-02-10',
      goLiveDate: '2024-02-10T00:00:00Z'
    },
    {
      id: '3',
      title: 'Urban Vibes',
      artist: 'City Sound',
      status: 'processing',
      platforms: ['Spotify', 'Apple Music'],
      releaseDate: '2024-03-01'
    },
    {
      id: '4',
      title: 'Deep House Session',
      artist: 'DJ Pulse',
      status: 'scheduled',
      platforms: ['All Platforms'],
      releaseDate: '2024-03-15'
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'connected': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'error': return 'bg-red-100 text-red-800';
      case 'disconnected': return 'bg-gray-100 text-gray-800';
      case 'live': return 'bg-green-100 text-green-800';
      case 'processing': return 'bg-yellow-100 text-yellow-800';
      case 'scheduled': return 'bg-blue-100 text-blue-800';
      case 'failed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'connected': return '✅';
      case 'pending': return '⏳';
      case 'error': return '❌';
      case 'disconnected': return '⚫';
      default: return '⚫';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">🌍 Distribution Center</h1>
            <p className="text-gray-600 mt-2">Manage multi-platform distribution and release scheduling</p>
          </div>
          <button
            onClick={() => setShowConnectModal(true)}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors flex items-center space-x-2"
          >
            <span>🔗</span>
            <span>Connect Platform</span>
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex space-x-1 bg-gray-200 rounded-lg p-1">
          {(['platforms', 'releases', 'analytics'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setSelectedTab(tab)}
              className={`px-4 py-2 rounded-md font-medium text-sm transition-colors ${
                selectedTab === tab
                  ? 'bg-white text-indigo-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {tab === 'platforms' ? '🔗 Platforms' :
               tab === 'releases' ? '🚀 Releases' : '📊 Analytics'}
            </button>
          ))}
        </div>
      </div>

      {/* Platform Management */}
      {selectedTab === 'platforms' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {platforms.map((platform) => (
            <div
              key={platform.id}
              className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden hover:shadow-xl transition-all"
            >
              {/* Platform Header */}
              <div className="p-6 border-b border-gray-100">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className={`w-12 h-12 ${platform.color} rounded-lg flex items-center justify-center text-2xl`}>
                      {platform.icon}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{platform.name}</h3>
                      <p className="text-sm text-gray-600">{platform.releases} releases</p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(platform.status)}`}>
                      {getStatusIcon(platform.status)} {platform.status.toUpperCase()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Platform Stats */}
              <div className="p-6 border-b border-gray-100">
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wider">Revenue</p>
                    <p className="text-lg font-semibold text-gray-900">
                      ${platform.revenue.toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wider">Rate</p>
                    <p className="text-lg font-semibold text-gray-900">
                      ${platform.royaltyRate.toFixed(3)}
                    </p>
                  </div>
                </div>
                {platform.lastSync && (
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wider">Last Sync</p>
                    <p className="text-sm text-gray-900">{formatTime(platform.lastSync)}</p>
                  </div>
                )}
              </div>

              {/* Platform Features */}
              <div className="p-6">
                <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">Features</p>
                <div className="space-y-1">
                  {platform.features.slice(0, 3).map((feature, index) => (
                    <p key={index} className="text-sm text-gray-600">• {feature}</p>
                  ))}
                </div>
                
                {/* Action Buttons */}
                <div className="mt-4 flex space-x-2">
                  {platform.status === 'connected' ? (
                    <>
                      <button className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium py-2 px-3 rounded-md transition-colors">
                        Settings
                      </button>
                      <button className="flex-1 bg-red-100 hover:bg-red-200 text-red-700 text-sm font-medium py-2 px-3 rounded-md transition-colors">
                        Disconnect
                      </button>
                    </>
                  ) : (
                    <button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium py-2 px-3 rounded-md transition-colors">
                      Connect
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Release Scheduling */}
      {selectedTab === 'releases' && (
        <div className="space-y-6">
          {/* Release Schedule Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {releases.map((release) => (
              <div
                key={release.id}
                className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 hover:shadow-xl transition-all"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{release.title}</h3>
                    <p className="text-gray-600">{release.artist}</p>
                  </div>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(release.status)}`}>
                    {release.status.toUpperCase()}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wider">Release Date</p>
                    <p className="text-sm font-medium text-gray-900">{formatDate(release.releaseDate)}</p>
                  </div>
                  {release.goLiveDate && (
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wider">Go Live</p>
                      <p className="text-sm font-medium text-gray-900">{formatTime(release.goLiveDate)}</p>
                    </div>
                  )}
                </div>

                <div className="mb-4">
                  <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">Platforms</p>
                  <div className="flex flex-wrap gap-2">
                    {release.platforms.map((platform, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-700"
                      >
                        {platform}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex space-x-2">
                  <button className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium py-2 px-3 rounded-md transition-colors">
                    Edit Schedule
                  </button>
                  <button className="flex-1 bg-indigo-100 hover:bg-indigo-200 text-indigo-700 text-sm font-medium py-2 px-3 rounded-md transition-colors">
                    View Status
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button className="flex items-center space-x-3 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200 hover:from-blue-100 hover:to-indigo-100 transition-colors">
                <div className="text-2xl">🚀</div>
                <div>
                  <p className="font-medium text-gray-900">Schedule Release</p>
                  <p className="text-sm text-gray-600">Plan your next drop</p>
                </div>
              </button>
              <button className="flex items-center space-x-3 p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200 hover:from-green-100 hover:to-emerald-100 transition-colors">
                <div className="text-2xl">🔄</div>
                <div>
                  <p className="font-medium text-gray-900">Sync Platforms</p>
                  <p className="text-sm text-gray-600">Update all connections</p>
                </div>
              </button>
              <button className="flex items-center space-x-3 p-4 bg-gradient-to-r from-purple-50 to-violet-50 rounded-lg border border-purple-200 hover:from-purple-100 hover:to-violet-100 transition-colors">
                <div className="text-2xl">📊</div>
                <div>
                  <p className="font-medium text-gray-900">Generate Report</p>
                  <p className="text-sm text-gray-600">Distribution analytics</p>
                </div>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Distribution Analytics */}
      {selectedTab === 'analytics' && (
        <div className="space-y-6">
          {/* Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl shadow-lg p-6 text-white">
              <div className="flex items-center justify-between mb-2">
                <div className="text-2xl">🌍</div>
                <div className="text-xl">📈</div>
              </div>
              <h3 className="text-2xl font-bold">8</h3>
              <p className="text-sm opacity-90">Connected Platforms</p>
            </div>
            <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-xl shadow-lg p-6 text-white">
              <div className="flex items-center justify-between mb-2">
                <div className="text-2xl">🚀</div>
                <div className="text-xl">📈</div>
              </div>
              <h3 className="text-2xl font-bold">45</h3>
              <p className="text-sm opacity-90">Total Releases</p>
            </div>
            <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl shadow-lg p-6 text-white">
              <div className="flex items-center justify-between mb-2">
                <div className="text-2xl">💰</div>
                <div className="text-xl">📈</div>
              </div>
              <h3 className="text-2xl font-bold">$23K</h3>
              <p className="text-sm opacity-90">Total Revenue</p>
            </div>
            <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl shadow-lg p-6 text-white">
              <div className="flex items-center justify-between mb-2">
                <div className="text-2xl">⚡</div>
                <div className="text-xl">📈</div>
              </div>
              <h3 className="text-2xl font-bold">98%</h3>
              <p className="text-sm opacity-90">Success Rate</p>
            </div>
          </div>

          {/* Platform Performance Chart */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Platform Performance</h3>
            <div className="h-64 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg flex items-center justify-center">
              <div className="text-center">
                <div className="text-4xl mb-2">📊</div>
                <p className="text-gray-600 font-medium">Distribution Analytics Chart</p>
                <p className="text-sm text-gray-500 mt-1">Revenue and performance metrics by platform</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Connect Platform Modal */}
      {showConnectModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-screen overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900">Connect New Platform</h2>
                <button
                  onClick={() => setShowConnectModal(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  ✕
                </button>
              </div>
            </div>
            
            <div className="p-6">
              <p className="text-gray-600 mb-6">Choose a platform to connect and start distributing your music</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {platforms.filter(p => p.status === 'disconnected').map((platform) => (
                  <button
                    key={platform.id}
                    className="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg hover:border-indigo-300 hover:bg-indigo-50 transition-colors"
                  >
                    <div className={`w-12 h-12 ${platform.color} rounded-lg flex items-center justify-center text-2xl`}>
                      {platform.icon}
                    </div>
                    <div className="flex-1 text-left">
                      <h3 className="font-semibold text-gray-900">{platform.name}</h3>
                      <p className="text-sm text-gray-600">${platform.royaltyRate.toFixed(3)} per stream</p>
                    </div>
                    <div className="text-indigo-600">→</div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DistributionPageNew;
