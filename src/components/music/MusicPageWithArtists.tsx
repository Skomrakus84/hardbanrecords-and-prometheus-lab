import React, { useEffect } from 'react';
import { XAxis, YAxis, CartesianGrid, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, Area, AreaChart } from 'recharts';
import { ArtistManagement } from './ArtistManagement';
import { useArtistStore } from '../../store/artistStore';

// Mock data
const streamingData = [
  { name: 'Jan', streams: 400000, books: 120 },
  { name: 'Feb', streams: 300000, books: 150 },
  { name: 'Mar', streams: 500000, books: 180 },
  { name: 'Apr', streams: 450000, books: 200 },
  { name: 'May', streams: 600000, books: 220 },
  { name: 'Jun', streams: 750000, books: 280 }
];

const platformData = [
  { name: 'Spotify', value: 35, color: '#1DB954' },
  { name: 'Apple Music', value: 25, color: '#FA243C' },
  { name: 'YouTube', value: 20, color: '#FF0000' },
  { name: 'Amazon', value: 12, color: '#FF9900' },
  { name: 'Others', value: 8, color: '#8B5CF6' }
];

const mockReleases = [
  {
    id: 1,
    title: "Midnight Dreams",
    artist: "The Synthwave",
    cover: "/api/placeholder/200/200",
    status: "Live",
    platforms: 350,
    streams: "1.2M",
    revenue: "$4,200"
  },
  {
    id: 2,
    title: "Summer Vibes EP",
    artist: "Beach House",
    cover: "/api/placeholder/200/200",
    status: "Processing",
    platforms: 380,
    streams: "850K",
    revenue: "$2,800"
  },
  {
    id: 3,
    title: "Urban Nights",
    artist: "City Lights",
    cover: "/api/placeholder/200/200",
    status: "Live",
    platforms: 400,
    streams: "2.1M",
    revenue: "$7,500"
  }
];

interface MusicPageWithArtistsProps {
  activeTab?: string;
  setActiveTab?: (tab: string) => void;
}

export const MusicPageWithArtists: React.FC<MusicPageWithArtistsProps> = ({
  activeTab = 'overview',
  setActiveTab = () => {}
}) => {
  const { artists, fetchArtists } = useArtistStore();

  useEffect(() => {
    fetchArtists();
  }, [fetchArtists]);

  // Tab Navigation
  const tabs = [
    { id: 'overview', label: '📊 Overview', icon: '📊' },
    { id: 'releases', label: '🎵 Releases', icon: '🎵' },
    { id: 'artists', label: '👥 Artists', icon: '👥' },
    { id: 'analytics', label: '📈 Analytics', icon: '📈' }
  ];

  if (activeTab === 'artists') {
    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-2xl p-6">
          <h2 className="text-3xl font-bold mb-2">👥 Artist Management Hub</h2>
          <p className="text-purple-100">Manage your artists, contracts, and collaborations</p>
          <div className="mt-4 text-sm">
            <span className="bg-white/20 px-3 py-1 rounded-full">
              {artists.length} Active Artists
            </span>
          </div>
        </div>

        {/* Artist Management Component */}
        <ArtistManagement />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Music Dashboard Header */}
      <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-2xl p-6">
        <h2 className="text-3xl font-bold mb-2">🎵 Music Distribution Hub</h2>
        <p className="text-purple-100">Manage your music catalog and reach 400+ global platforms</p>
      </div>

      {/* Tab Navigation */}
      <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 flex items-center justify-center space-x-2 py-2 px-4 rounded-md transition-all ${
              activeTab === tab.id
                ? 'bg-white text-purple-600 shadow-sm font-medium'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <span>{tab.icon}</span>
            <span className="hidden sm:inline">{tab.label.split(' ')[1]}</span>
          </button>
        ))}
      </div>

      {/* Content based on active tab */}
      {activeTab === 'overview' && (
        <>
          {/* Music Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">🎤</div>
                <span className="text-green-600 text-sm font-medium">+8%</span>
              </div>
              <div className="text-2xl font-bold text-gray-900">45</div>
              <div className="text-gray-600">Total Releases</div>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">💿</div>
                <span className="text-green-600 text-sm font-medium">Live</span>
              </div>
              <div className="text-2xl font-bold text-gray-900">38</div>
              <div className="text-gray-600">Active Releases</div>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">🎧</div>
                <span className="text-green-600 text-sm font-medium">+18%</span>
              </div>
              <div className="text-2xl font-bold text-gray-900">2.4M</div>
              <div className="text-gray-600">Monthly Streams</div>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">💰</div>
                <span className="text-green-600 text-sm font-medium">+23%</span>
              </div>
              <div className="text-2xl font-bold text-gray-900">$85K</div>
              <div className="text-gray-600">Music Revenue</div>
            </div>
          </div>

          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">📈 Streaming Trends</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={streamingData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Area type="monotone" dataKey="streams" stroke="#8B5CF6" fill="#8B5CF6" fillOpacity={0.3} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">🏆 Platform Breakdown</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={platformData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      dataKey="value"
                      label={({name, value}) => `${name}: ${value}%`}
                    >
                      {platformData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </>
      )}

      {activeTab === 'releases' && (
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-gray-900">🎵 Recent Releases</h3>
            <button className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700">
              + Add New Release
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {mockReleases.map((release) => (
              <div key={release.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-lg transition-all">
                <div className="w-full h-32 bg-gradient-to-br from-purple-400 to-pink-400 rounded-lg mb-4 flex items-center justify-center">
                  <span className="text-4xl text-white">🎵</span>
                </div>
                <h4 className="font-semibold text-gray-900">{release.title}</h4>
                <p className="text-gray-600 text-sm">{release.artist}</p>
                <div className="mt-3 space-y-1">
                  <div className="flex justify-between text-sm">
                    <span>Status:</span>
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      release.status === 'Live' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {release.status}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Platforms:</span>
                    <span className="font-medium">{release.platforms}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Streams:</span>
                    <span className="font-medium">{release.streams}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'analytics' && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">📊 Detailed Analytics</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={streamingData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Line type="monotone" dataKey="streams" stroke="#8B5CF6" strokeWidth={3} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h4 className="font-semibold text-gray-900 mb-4">🏆 Top Performing Release</h4>
              <div className="space-y-2">
                <div className="text-lg font-bold">Urban Nights</div>
                <div className="text-gray-600">by City Lights</div>
                <div className="text-2xl font-bold text-purple-600">2.1M streams</div>
                <div className="text-sm text-green-600">+45% this week</div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6">
              <h4 className="font-semibold text-gray-900 mb-4">🎯 Engagement Rate</h4>
              <div className="space-y-2">
                <div className="text-2xl font-bold text-blue-600">87.3%</div>
                <div className="text-gray-600">Average completion rate</div>
                <div className="text-sm text-green-600">+12% vs last month</div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6">
              <h4 className="font-semibold text-gray-900 mb-4">💰 Revenue Per Stream</h4>
              <div className="space-y-2">
                <div className="text-2xl font-bold text-green-600">$0.0047</div>
                <div className="text-gray-600">Average across platforms</div>
                <div className="text-sm text-green-600">+8% improvement</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
