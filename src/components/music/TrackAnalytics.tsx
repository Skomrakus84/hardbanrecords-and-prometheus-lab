import React, { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell, AreaChart, Area } from 'recharts';

interface TrackData {
  date: string;
  streams: number;
  revenue: number;
  saves: number;
  shares: number;
  skips: number;
  completionRate: number;
}

interface PlatformStats {
  platform: string;
  streams: number;
  revenue: number;
  percentage: number;
  avgRevenuePer1000: number;
  color: string;
}

interface GeographicData {
  country: string;
  streams: number;
  percentage: number;
  revenue: number;
}

interface DemographicData {
  ageGroup: string;
  streams: number;
  percentage: number;
  malePercentage: number;
  femalePercentage: number;
}

interface TrackAnalyticsProps {
  trackId: string;
  trackTitle: string;
  artistName: string;
  releaseDate: string;
  duration: string;
  data: TrackData[];
  platformStats: PlatformStats[];
  geographicData: GeographicData[];
  demographicData: DemographicData[];
  timeRange: '7d' | '30d' | '90d' | '1y' | 'all';
  onTimeRangeChange: (range: '7d' | '30d' | '90d' | '1y' | 'all') => void;
}

const TrackAnalytics: React.FC<TrackAnalyticsProps> = ({
  trackId,
  trackTitle,
  artistName,
  releaseDate,
  duration,
  data,
  platformStats,
  geographicData,
  demographicData,
  timeRange,
  onTimeRangeChange
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'platforms' | 'geography' | 'demographics'>('overview');

  const timeRangeOptions = [
    { value: '7d', label: '7 Days' },
    { value: '30d', label: '30 Days' },
    { value: '90d', label: '90 Days' },
    { value: '1y', label: '1 Year' },
    { value: 'all', label: 'All Time' }
  ];

  const formatNumber = (value: number) => {
    if (value >= 1000000) {
      return `${(value / 1000000).toFixed(1)}M`;
    } else if (value >= 1000) {
      return `${(value / 1000).toFixed(1)}K`;
    }
    return value.toString();
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  };

  // Calculate metrics
  const totalStreams = data.reduce((sum, item) => sum + item.streams, 0);
  const totalRevenue = data.reduce((sum, item) => sum + item.revenue, 0);
  const totalSaves = data.reduce((sum, item) => sum + item.saves, 0);
  const totalShares = data.reduce((sum, item) => sum + item.shares, 0);
  const avgCompletionRate = data.length > 0 ? data.reduce((sum, item) => sum + item.completionRate, 0) / data.length : 0;

  // Calculate growth rates
  const calculateGrowth = (current: number, previous: number) => {
    if (previous === 0) return 0;
    return ((current - previous) / previous) * 100;
  };

  const latestData = data[data.length - 1];
  const previousData = data[data.length - 2];
  const streamGrowth = latestData && previousData ? calculateGrowth(latestData.streams, previousData.streams) : 0;
  const revenueGrowth = latestData && previousData ? calculateGrowth(latestData.revenue, previousData.revenue) : 0;

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-4 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-medium text-gray-900 mb-2">{formatDate(label)}</p>
          {payload.map((entry: any, index: number) => (
            <div key={index} className="flex items-center space-x-2 text-sm">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: entry.color }}
              />
              <span className="text-gray-600">{entry.name}:</span>
              <span className="font-medium">
                {entry.name.includes('Revenue') ? formatCurrency(entry.value) :
                 entry.name.includes('Rate') ? `${entry.value.toFixed(1)}%` :
                 formatNumber(entry.value)}
              </span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  const renderOverviewTab = () => (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-blue-700">Total Streams</h3>
            <span className="text-blue-600">🎵</span>
          </div>
          <div className="text-2xl font-bold text-blue-900">{formatNumber(totalStreams)}</div>
          <div className={`text-sm ${streamGrowth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {streamGrowth >= 0 ? '↗' : '↘'} {Math.abs(streamGrowth).toFixed(1)}%
          </div>
        </div>

        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-green-700">Total Revenue</h3>
            <span className="text-green-600">💰</span>
          </div>
          <div className="text-2xl font-bold text-green-900">{formatCurrency(totalRevenue)}</div>
          <div className={`text-sm ${revenueGrowth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {revenueGrowth >= 0 ? '↗' : '↘'} {Math.abs(revenueGrowth).toFixed(1)}%
          </div>
        </div>

        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-purple-700">Saves</h3>
            <span className="text-purple-600">💾</span>
          </div>
          <div className="text-2xl font-bold text-purple-900">{formatNumber(totalSaves)}</div>
          <div className="text-sm text-purple-600">
            {totalStreams > 0 ? ((totalSaves / totalStreams) * 100).toFixed(1) : 0}% save rate
          </div>
        </div>

        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-orange-700">Completion Rate</h3>
            <span className="text-orange-600">📊</span>
          </div>
          <div className="text-2xl font-bold text-orange-900">{avgCompletionRate.toFixed(1)}%</div>
          <div className="text-sm text-orange-600">
            Avg. listening completion
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Streams Over Time */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Streams Over Time</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data}>
                <defs>
                  <linearGradient id="streamsGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 12, fill: '#6b7280' }}
                  tickFormatter={formatDate}
                />
                <YAxis
                  tick={{ fontSize: 12, fill: '#6b7280' }}
                  tickFormatter={formatNumber}
                />
                <Tooltip content={<CustomTooltip />} />
                <Area
                  type="monotone"
                  dataKey="streams"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  fill="url(#streamsGradient)"
                  name="Streams"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Revenue Over Time */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Revenue Over Time</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 12, fill: '#6b7280' }}
                  tickFormatter={formatDate}
                />
                <YAxis
                  tick={{ fontSize: 12, fill: '#6b7280' }}
                  tickFormatter={formatCurrency}
                />
                <Tooltip content={<CustomTooltip />} />
                <Line
                  type="monotone"
                  dataKey="revenue"
                  stroke="#10b981"
                  strokeWidth={3}
                  dot={{ r: 4 }}
                  name="Revenue"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Engagement Metrics */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Engagement Metrics</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 12, fill: '#6b7280' }}
                tickFormatter={formatDate}
              />
              <YAxis
                tick={{ fontSize: 12, fill: '#6b7280' }}
                tickFormatter={formatNumber}
              />
              <Tooltip content={<CustomTooltip />} />
              <Line
                type="monotone"
                dataKey="saves"
                stroke="#8b5cf6"
                strokeWidth={2}
                dot={{ r: 3 }}
                name="Saves"
              />
              <Line
                type="monotone"
                dataKey="shares"
                stroke="#f59e0b"
                strokeWidth={2}
                dot={{ r: 3 }}
                name="Shares"
              />
              <Line
                type="monotone"
                dataKey="completionRate"
                stroke="#ef4444"
                strokeWidth={2}
                dot={{ r: 3 }}
                name="Completion Rate"
                yAxisId="right"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );

  const renderPlatformsTab = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Platform Distribution Chart */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Streams by Platform</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={platformStats}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  dataKey="streams"
                  label={({ percentage }) => `${percentage.toFixed(1)}%`}
                  labelLine={false}
                >
                  {platformStats.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: any, name: any, props: any) => [
                    formatNumber(value),
                    'Streams'
                  ]}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Revenue by Platform */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Revenue by Platform</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={platformStats}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                <XAxis
                  dataKey="platform"
                  tick={{ fontSize: 12, fill: '#6b7280' }}
                />
                <YAxis
                  tick={{ fontSize: 12, fill: '#6b7280' }}
                  tickFormatter={formatCurrency}
                />
                <Tooltip
                  formatter={(value: any) => [formatCurrency(value), 'Revenue']}
                />
                <Bar dataKey="revenue" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Platform Performance Table */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <div className="p-6 pb-0">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Platform Performance</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Platform
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Streams
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Revenue
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Share
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Revenue per 1K Streams
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {platformStats.map((platform, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div
                        className="w-4 h-4 rounded-full mr-3"
                        style={{ backgroundColor: platform.color }}
                      />
                      <span className="text-sm font-medium text-gray-900">{platform.platform}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatNumber(platform.streams)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatCurrency(platform.revenue)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-full bg-gray-200 rounded-full h-2 mr-3">
                        <div
                          className="h-2 rounded-full"
                          style={{
                            width: `${platform.percentage}%`,
                            backgroundColor: platform.color
                          }}
                        />
                      </div>
                      <span className="text-sm text-gray-600">{platform.percentage.toFixed(1)}%</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatCurrency(platform.avgRevenuePer1000)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderGeographyTab = () => (
    <div className="space-y-6">
      {/* Top Countries */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Countries by Streams</h3>
        <div className="space-y-3">
          {geographicData.slice(0, 10).map((country, index) => (
            <div key={index} className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <span className="text-lg">🌍</span>
                <span className="font-medium text-gray-900">{country.country}</span>
              </div>
              <div className="flex items-center space-x-4">
                <div className="w-32 bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-500 h-2 rounded-full"
                    style={{ width: `${country.percentage}%` }}
                  />
                </div>
                <div className="text-right min-w-0">
                  <div className="text-sm font-medium text-gray-900">
                    {formatNumber(country.streams)}
                  </div>
                  <div className="text-xs text-gray-500">
                    {country.percentage.toFixed(1)}%
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Geographic Chart */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Geographic Distribution</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={geographicData.slice(0, 8)} layout="horizontal">
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
              <XAxis type="number" tick={{ fontSize: 12, fill: '#6b7280' }} />
              <YAxis
                type="category"
                dataKey="country"
                tick={{ fontSize: 12, fill: '#6b7280' }}
                width={80}
              />
              <Tooltip
                formatter={(value: any) => [formatNumber(value), 'Streams']}
              />
              <Bar dataKey="streams" fill="#3b82f6" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );

  const renderDemographicsTab = () => (
    <div className="space-y-6">
      {/* Age Demographics */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Age Demographics</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={demographicData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
              <XAxis
                dataKey="ageGroup"
                tick={{ fontSize: 12, fill: '#6b7280' }}
              />
              <YAxis
                tick={{ fontSize: 12, fill: '#6b7280' }}
                tickFormatter={formatNumber}
              />
              <Tooltip
                formatter={(value: any) => [formatNumber(value), 'Streams']}
              />
              <Bar dataKey="streams" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Gender Split */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Gender Split by Age Group</h3>
          <div className="space-y-4">
            {demographicData.map((demo, index) => (
              <div key={index}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">{demo.ageGroup}</span>
                  <span className="text-sm text-gray-500">{formatNumber(demo.streams)} streams</span>
                </div>
                <div className="flex h-4 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="bg-blue-500"
                    style={{ width: `${demo.malePercentage}%` }}
                  />
                  <div
                    className="bg-pink-500"
                    style={{ width: `${demo.femalePercentage}%` }}
                  />
                </div>
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>Male {demo.malePercentage.toFixed(1)}%</span>
                  <span>Female {demo.femalePercentage.toFixed(1)}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Overall Demographics</h3>
          <div className="space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-900">
                  {demographicData.reduce((sum, demo) => sum + demo.malePercentage * demo.percentage / 100, 0).toFixed(1)}%
                </div>
                <div className="text-sm text-blue-700">Male Listeners</div>
              </div>
            </div>
            <div className="bg-pink-50 border border-pink-200 rounded-lg p-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-pink-900">
                  {demographicData.reduce((sum, demo) => sum + demo.femalePercentage * demo.percentage / 100, 0).toFixed(1)}%
                </div>
                <div className="text-sm text-pink-700">Female Listeners</div>
              </div>
            </div>
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-900">
                  {demographicData.reduce((total, demo, index) => {
                    const ageNum = parseInt(demo.ageGroup.split('-')[0]);
                    return total + (ageNum * demo.percentage);
                  }, 0) / demographicData.reduce((sum, demo) => sum + demo.percentage, 0) || 0}
                </div>
                <div className="text-sm text-purple-700">Average Age</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-500 to-purple-600 p-6 text-white">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-bold">{trackTitle}</h2>
            <p className="text-indigo-100">by {artistName}</p>
            <div className="flex items-center space-x-4 text-sm text-indigo-200 mt-2">
              <span>📅 Released: {new Date(releaseDate).toLocaleDateString()}</span>
              <span>⏱️ Duration: {duration}</span>
              <span>🆔 ID: {trackId}</span>
            </div>
          </div>

          {/* Time Range Selector */}
          <div className="flex space-x-1 bg-white bg-opacity-20 rounded-lg p-1">
            {timeRangeOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => onTimeRangeChange(option.value as any)}
                className={`px-3 py-1 rounded-md text-sm font-medium transition-all ${
                  timeRange === option.value
                    ? 'bg-white text-indigo-600'
                    : 'text-white hover:bg-white hover:bg-opacity-10'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex space-x-1 bg-white bg-opacity-20 rounded-lg p-1">
          {[
            { id: 'overview', label: '📊 Overview' },
            { id: 'platforms', label: '🎵 Platforms' },
            { id: 'geography', label: '🌍 Geography' },
            { id: 'demographics', label: '👥 Demographics' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                activeTab === tab.id
                  ? 'bg-white text-indigo-600'
                  : 'text-white hover:bg-white hover:bg-opacity-10'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {activeTab === 'overview' && renderOverviewTab()}
        {activeTab === 'platforms' && renderPlatformsTab()}
        {activeTab === 'geography' && renderGeographyTab()}
        {activeTab === 'demographics' && renderDemographicsTab()}
      </div>
    </div>
  );
};

export default TrackAnalytics;
