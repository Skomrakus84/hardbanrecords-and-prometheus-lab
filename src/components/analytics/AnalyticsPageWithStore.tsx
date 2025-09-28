import React, { useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { useAnalyticsStore } from '../../store/analyticsStore';

export const AnalyticsPageWithStore: React.FC = () => {
  const {
    overview,
    streamingData,
    revenueData,
    geographicData,
    isLoading,
    error,
    fetchOverview,
    fetchStreamingData,
    fetchRevenueData,
    fetchGeographicData
  } = useAnalyticsStore();

  useEffect(() => {
    // Fetch all analytics data on component mount
    fetchOverview();
    fetchStreamingData();
    fetchRevenueData();
    fetchGeographicData();
  }, [fetchOverview, fetchStreamingData, fetchRevenueData, fetchGeographicData]);

  const platformColors = {
    'Spotify': '#1DB954',
    'Apple Music': '#FA243C',
    'YouTube Music': '#FF0000',
    'Amazon Music': '#FF9900',
    'Deezer': '#FEAA2D',
    'Others': '#8B5CF6'
  };

  if (isLoading) {
    return (
      <div className="space-y-8">
        <div className="bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-2xl p-6">
          <h2 className="text-3xl font-bold mb-2">📊 Unified Analytics Dashboard</h2>
          <p className="text-blue-100">Real-time insights from 400+ music platforms and 21 publishing stores</p>
        </div>

        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading analytics data...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-8">
        <div className="bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-2xl p-6">
          <h2 className="text-3xl font-bold mb-2">📊 Unified Analytics Dashboard</h2>
          <p className="text-blue-100">Real-time insights from 400+ music platforms and 21 publishing stores</p>
        </div>

        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <div className="flex items-center">
            <div className="text-red-400 text-xl mr-3">⚠️</div>
            <div>
              <h3 className="text-lg font-medium text-red-800">Error Loading Analytics</h3>
              <p className="text-red-600">{error}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-2xl p-6">
        <h2 className="text-3xl font-bold mb-2">📊 Unified Analytics Dashboard</h2>
        <p className="text-blue-100">Real-time insights from 400+ music platforms and 21 publishing stores</p>
      </div>

      {/* Overview Stats */}
      {overview && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">📻</div>
              <span className="text-green-600 text-sm font-medium">+{overview.totalStreamsGrowth}%</span>
            </div>
            <div className="text-2xl font-bold text-gray-900">{(overview.totalStreams / 1000000).toFixed(1)}M</div>
            <div className="text-gray-600">Total Streams</div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">💰</div>
              <span className="text-green-600 text-sm font-medium">+{overview.totalRevenueGrowth}%</span>
            </div>
            <div className="text-2xl font-bold text-gray-900">${overview.totalRevenue.toLocaleString()}</div>
            <div className="text-gray-600">Total Revenue</div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">👥</div>
              <span className="text-green-600 text-sm font-medium">+{overview.newListenersGrowth}%</span>
            </div>
            <div className="text-2xl font-bold text-gray-900">{overview.newListeners.toLocaleString()}</div>
            <div className="text-gray-600">New Listeners</div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">⭐</div>
              <span className="text-green-600 text-sm font-medium">Live</span>
            </div>
            <div className="text-2xl font-bold text-gray-900">{overview.averageRating.toFixed(1)}</div>
            <div className="text-gray-600">Average Rating</div>
          </div>
        </div>
      )}

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Streaming Trends */}
        {streamingData.length > 0 && (
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">📈 Streaming Trends</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={streamingData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Line
                    type="monotone"
                    dataKey="streams"
                    stroke="#8B5CF6"
                    strokeWidth={3}
                    name="Streams"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Revenue Chart */}
        {revenueData.length > 0 && (
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">💰 Revenue Trends</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={revenueData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Bar dataKey="revenue" fill="#10B981" name="Revenue ($)" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </div>

      {/* Platform Distribution & Geographic Data */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Platform Breakdown */}
        {streamingData.some(item => item.platforms) && (
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">🏆 Platform Distribution</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={[
                      { name: 'Spotify', value: 35, color: platformColors['Spotify'] },
                      { name: 'Apple Music', value: 25, color: platformColors['Apple Music'] },
                      { name: 'YouTube Music', value: 20, color: platformColors['YouTube Music'] },
                      { name: 'Amazon Music', value: 12, color: platformColors['Amazon Music'] },
                      { name: 'Others', value: 8, color: platformColors['Others'] }
                    ]}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    dataKey="value"
                    label={({name, value}) => `${name}: ${value}%`}
                  >
                    {[
                      { name: 'Spotify', value: 35, color: platformColors['Spotify'] },
                      { name: 'Apple Music', value: 25, color: platformColors['Apple Music'] },
                      { name: 'YouTube Music', value: 20, color: platformColors['YouTube Music'] },
                      { name: 'Amazon Music', value: 12, color: platformColors['Amazon Music'] },
                      { name: 'Others', value: 8, color: platformColors['Others'] }
                    ].map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Geographic Breakdown */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">🌍 Geographic Performance</h3>
          {geographicData.length > 0 ? (
            <div className="space-y-4">
              {geographicData.slice(0, 5).map((country, index) => (
                <div key={country.country} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-sm font-medium">
                      {index + 1}
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">{country.country}</div>
                      <div className="text-sm text-gray-500">{country.streams.toLocaleString()} streams</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium text-gray-900">${country.revenue.toFixed(0)}</div>
                    <div className="text-sm text-gray-500">{country.percentage.toFixed(1)}%</div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="h-64 bg-gray-100 rounded-lg flex items-center justify-center">
              <div className="text-center">
                <div className="text-4xl mb-2">🗺️</div>
                <p className="text-gray-600">Geographic data loading...</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-semibold text-gray-900">🏆 Top Performing Track</h4>
          </div>
          <div className="space-y-2">
            <div className="text-lg font-bold">Urban Nights</div>
            <div className="text-gray-600">by City Lights</div>
            <div className="text-2xl font-bold text-purple-600">2.1M streams</div>
            <div className="text-sm text-green-600">+45% this week</div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-semibold text-gray-900">🎯 Engagement Rate</h4>
          </div>
          <div className="space-y-2">
            <div className="text-2xl font-bold text-blue-600">87.3%</div>
            <div className="text-gray-600">Average completion rate</div>
            <div className="text-sm text-green-600">+12% vs last month</div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-semibold text-gray-900">💰 Revenue Per Stream</h4>
          </div>
          <div className="space-y-2">
            <div className="text-2xl font-bold text-green-600">$0.0047</div>
            <div className="text-gray-600">Average across platforms</div>
            <div className="text-sm text-green-600">+8% improvement</div>
          </div>
        </div>
      </div>
    </div>
  );
};
