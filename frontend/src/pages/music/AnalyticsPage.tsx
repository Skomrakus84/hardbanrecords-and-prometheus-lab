import React, { useState, useEffect } from 'react';

interface AnalyticsData {
  totalStreams: number;
  totalRevenue: number;
  totalReleases: number;
  activeArtists: number;
  monthlyGrowth: number;
  topPlatforms: Array<{ name: string; streams: number; percentage: number }>;
  recentActivity: Array<{ date: string; streams: number; revenue: number }>;
}

const AnalyticsPage: React.FC = () => {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState('7d');

  useEffect(() => {
    // Mock data - replace with actual API call
    Promise.resolve().then(() => {
      setAnalytics({
        totalStreams: 156420,
        totalRevenue: 4560.75,
        totalReleases: 28,
        activeArtists: 12,
        monthlyGrowth: 15.3,
        topPlatforms: [
          { name: 'Spotify', streams: 68500, percentage: 43.8 },
          { name: 'Apple Music', streams: 45200, percentage: 28.9 },
          { name: 'YouTube Music', streams: 25300, percentage: 16.2 },
          { name: 'Amazon Music', streams: 12400, percentage: 7.9 },
          { name: 'Other', streams: 5020, percentage: 3.2 }
        ],
        recentActivity: [
          { date: '2024-07-01', streams: 12500, revenue: 375.50 },
          { date: '2024-06-30', streams: 11800, revenue: 354.20 },
          { date: '2024-06-29', streams: 13200, revenue: 396.10 },
          { date: '2024-06-28', streams: 10900, revenue: 327.15 },
          { date: '2024-06-27', streams: 14500, revenue: 435.30 },
          { date: '2024-06-26', streams: 13800, revenue: 414.25 },
          { date: '2024-06-25', streams: 12100, revenue: 363.45 }
        ]
      });
      setIsLoading(false);
    });
  }, [selectedPeriod]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!analytics) return null;

  return (
    <div className="analytics-page">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Analytics</h2>
          <p className="text-gray-600">Track your music performance and revenue</p>
        </div>
        <select 
          value={selectedPeriod}
          onChange={(e) => setSelectedPeriod(e.target.value)}
          className="border-gray-300 rounded-md shadow-sm"
        >
          <option value="7d">Last 7 days</option>
          <option value="30d">Last 30 days</option>
          <option value="90d">Last 90 days</option>
          <option value="1y">Last year</option>
        </select>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-blue-500 rounded-md flex items-center justify-center">
                  <span className="text-white font-bold">♪</span>
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Total Streams</dt>
                  <dd className="text-lg font-medium text-gray-900">{analytics.totalStreams.toLocaleString()}</dd>
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
                  <span className="text-white font-bold">$</span>
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Total Revenue</dt>
                  <dd className="text-lg font-medium text-gray-900">${analytics.totalRevenue.toFixed(2)}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-purple-500 rounded-md flex items-center justify-center">
                  <span className="text-white font-bold">📀</span>
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Total Releases</dt>
                  <dd className="text-lg font-medium text-gray-900">{analytics.totalReleases}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-orange-500 rounded-md flex items-center justify-center">
                  <span className="text-white font-bold">📈</span>
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Monthly Growth</dt>
                  <dd className="text-lg font-medium text-gray-900">+{analytics.monthlyGrowth}%</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Platforms */}
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Top Platforms</h3>
          <div className="space-y-4">
            {analytics.topPlatforms.map((platform, index) => (
              <div key={platform.name} className="flex items-center">
                <div className="flex-1">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm font-medium text-gray-900">{platform.name}</span>
                    <span className="text-sm text-gray-500">{platform.streams.toLocaleString()} streams</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${
                        index === 0 ? 'bg-green-500' : 
                        index === 1 ? 'bg-blue-500' : 
                        index === 2 ? 'bg-yellow-500' : 
                        index === 3 ? 'bg-purple-500' : 'bg-gray-500'
                      }`}
                      style={{ width: `${platform.percentage}%` }}
                    ></div>
                  </div>
                </div>
                <div className="ml-4 text-sm text-gray-500">
                  {platform.percentage}%
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activity Chart */}
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Activity</h3>
          <div className="space-y-2">
            {analytics.recentActivity.map((day) => (
              <div key={day.date} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-b-0">
                <div className="text-sm text-gray-600">
                  {new Date(day.date).toLocaleDateString()}
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium text-gray-900">
                    {day.streams.toLocaleString()} streams
                  </div>
                  <div className="text-xs text-gray-500">
                    ${day.revenue.toFixed(2)} revenue
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Performance Insights */}
      <div className="mt-8 bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Performance Insights</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">+{analytics.monthlyGrowth}%</div>
            <div className="text-sm text-green-700">Stream Growth</div>
            <div className="text-xs text-gray-500 mt-1">vs last period</div>
          </div>
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">${(analytics.totalRevenue / analytics.totalStreams * 1000).toFixed(2)}</div>
            <div className="text-sm text-blue-700">RPM (Revenue per 1k streams)</div>
            <div className="text-xs text-gray-500 mt-1">Average rate</div>
          </div>
          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <div className="text-2xl font-bold text-purple-600">{(analytics.totalStreams / analytics.totalReleases).toFixed(0)}</div>
            <div className="text-sm text-purple-700">Avg Streams per Release</div>
            <div className="text-xs text-gray-500 mt-1">Performance metric</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsPage;
