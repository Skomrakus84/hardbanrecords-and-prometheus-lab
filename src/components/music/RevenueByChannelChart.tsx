import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

interface ChannelData {
  channel: string;
  revenue: number;
  streams: number;
  percentage: number;
  growth: number;
  color: string;
}

interface RevenueByChannelChartProps {
  data: ChannelData[];
  timeRange: '7d' | '30d' | '90d' | '1y' | 'all';
  onTimeRangeChange: (range: '7d' | '30d' | '90d' | '1y' | 'all') => void;
  currency?: string;
  viewMode: 'chart' | 'table';
  onViewModeChange: (mode: 'chart' | 'table') => void;
}

const RevenueByChannelChart: React.FC<RevenueByChannelChartProps> = ({
  data,
  timeRange,
  onTimeRangeChange,
  currency = 'USD',
  viewMode,
  onViewModeChange
}) => {
  const timeRangeOptions = [
    { value: '7d', label: '7 Days' },
    { value: '30d', label: '30 Days' },
    { value: '90d', label: '90 Days' },
    { value: '1y', label: '1 Year' },
    { value: 'all', label: 'All Time' }
  ];

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value);
  };

  const formatNumber = (value: number) => {
    if (value >= 1000000) {
      return `${(value / 1000000).toFixed(1)}M`;
    } else if (value >= 1000) {
      return `${(value / 1000).toFixed(1)}K`;
    }
    return value.toString();
  };

  const totalRevenue = data.reduce((sum, item) => sum + item.revenue, 0);
  const totalStreams = data.reduce((sum, item) => sum + item.streams, 0);

  // Sort data by revenue for better visualization
  const sortedData = [...data].sort((a, b) => b.revenue - a.revenue);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-4 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-medium text-gray-900 mb-2">{data.channel}</p>
          <div className="space-y-1 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Revenue:</span>
              <span className="font-medium">{formatCurrency(data.revenue)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Streams:</span>
              <span className="font-medium">{formatNumber(data.streams)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Share:</span>
              <span className="font-medium">{data.percentage.toFixed(1)}%</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Growth:</span>
              <span className={`font-medium ${data.growth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {data.growth >= 0 ? '+' : ''}{data.growth.toFixed(1)}%
              </span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  const PieTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-medium text-gray-900">{data.payload.channel}</p>
          <p className="text-sm text-gray-600">
            {formatCurrency(data.value)} ({data.payload.percentage.toFixed(1)}%)
          </p>
        </div>
      );
    }
    return null;
  };

  const getChannelIcon = (channel: string) => {
    const icons: { [key: string]: string } = {
      'Spotify': '🎵',
      'Apple Music': '🍎',
      'YouTube Music': '📺',
      'Amazon Music': '📦',
      'Deezer': '🎧',
      'Tidal': '🌊',
      'Pandora': '📻',
      'SoundCloud': '☁️',
      'Bandcamp': '🎪',
      'Physical Sales': '💿',
      'iTunes': '🎼',
      'Google Play': '🎮'
    };
    return icons[channel] || '🎶';
  };

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-500 to-pink-600 p-6 text-white">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">Revenue by Channel</h2>

          <div className="flex items-center space-x-3">
            {/* View Mode Toggle */}
            <div className="flex space-x-1 bg-white bg-opacity-20 rounded-lg p-1">
              <button
                onClick={() => onViewModeChange('chart')}
                className={`px-3 py-1 rounded-md text-sm font-medium transition-all ${
                  viewMode === 'chart'
                    ? 'bg-white text-purple-600'
                    : 'text-white hover:bg-white hover:bg-opacity-10'
                }`}
              >
                📊 Chart
              </button>
              <button
                onClick={() => onViewModeChange('table')}
                className={`px-3 py-1 rounded-md text-sm font-medium transition-all ${
                  viewMode === 'table'
                    ? 'bg-white text-purple-600'
                    : 'text-white hover:bg-white hover:bg-opacity-10'
                }`}
              >
                📋 Table
              </button>
            </div>

            {/* Time Range Selector */}
            <div className="flex space-x-1 bg-white bg-opacity-20 rounded-lg p-1">
              {timeRangeOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => onTimeRangeChange(option.value as any)}
                  className={`px-3 py-1 rounded-md text-sm font-medium transition-all ${
                    timeRange === option.value
                      ? 'bg-white text-purple-600'
                      : 'text-white hover:bg-white hover:bg-opacity-10'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold">{formatCurrency(totalRevenue)}</div>
            <div className="text-sm text-purple-100">Total Revenue</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold">{formatNumber(totalStreams)}</div>
            <div className="text-sm text-purple-100">Total Streams</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold">{data.length}</div>
            <div className="text-sm text-purple-100">Active Channels</div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {data.length > 0 ? (
          <>
            {viewMode === 'chart' ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Bar Chart */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Revenue Distribution</h3>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={sortedData} layout="horizontal">
                        <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                        <XAxis
                          type="number"
                          tick={{ fontSize: 12, fill: '#6b7280' }}
                          tickFormatter={formatCurrency}
                        />
                        <YAxis
                          type="category"
                          dataKey="channel"
                          tick={{ fontSize: 12, fill: '#6b7280' }}
                          width={100}
                        />
                        <Tooltip content={<CustomTooltip />} />
                        <Bar
                          dataKey="revenue"
                          fill="#8b5cf6"
                          radius={[0, 4, 4, 0]}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Pie Chart */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Market Share</h3>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={sortedData}
                          cx="50%"
                          cy="50%"
                          outerRadius={80}
                          dataKey="revenue"
                          label={({ percentage }) => `${percentage.toFixed(1)}%`}
                          labelLine={false}
                        >
                          {sortedData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip content={<PieTooltip />} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            ) : (
              /* Table View */
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Channel Performance</h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Channel
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Revenue
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Streams
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Share
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Growth
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Avg. Revenue per Stream
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {sortedData.map((channel, index) => (
                        <tr key={index} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <span className="text-2xl mr-3">{getChannelIcon(channel.channel)}</span>
                              <div>
                                <div className="text-sm font-medium text-gray-900">{channel.channel}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">
                              {formatCurrency(channel.revenue)}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{formatNumber(channel.streams)}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="w-full bg-gray-200 rounded-full h-2 mr-2">
                                <div
                                  className="h-2 rounded-full"
                                  style={{
                                    width: `${channel.percentage}%`,
                                    backgroundColor: channel.color
                                  }}
                                />
                              </div>
                              <span className="text-sm font-medium text-gray-900">
                                {channel.percentage.toFixed(1)}%
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              channel.growth >= 0
                                ? 'bg-green-100 text-green-800'
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {channel.growth >= 0 ? '↗' : '↘'} {Math.abs(channel.growth).toFixed(1)}%
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {channel.streams > 0 ? formatCurrency(channel.revenue / channel.streams) : '-'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Top Performers */}
            <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
              {sortedData.slice(0, 3).map((channel, index) => (
                <div
                  key={index}
                  className={`p-4 rounded-lg border-2 ${
                    index === 0 ? 'border-yellow-300 bg-yellow-50' :
                    index === 1 ? 'border-gray-300 bg-gray-50' :
                    'border-orange-300 bg-orange-50'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <span className="text-2xl">{getChannelIcon(channel.channel)}</span>
                      <span className="font-medium text-gray-900">{channel.channel}</span>
                    </div>
                    <div className="text-2xl">
                      {index === 0 ? '🥇' : index === 1 ? '🥈' : '🥉'}
                    </div>
                  </div>
                  <div className="text-lg font-bold text-gray-900 mb-1">
                    {formatCurrency(channel.revenue)}
                  </div>
                  <div className="text-sm text-gray-600">
                    {channel.percentage.toFixed(1)}% of total revenue
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : (
          // Empty State
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📊</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Channel Data</h3>
            <p className="text-gray-600 mb-4">
              Channel revenue data will appear here once your releases start generating revenue.
            </p>
            <button className="bg-purple-600 hover:bg-purple-700 text-white font-medium py-2 px-4 rounded-lg transition-colors">
              View Sample Data
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default RevenueByChannelChart;
