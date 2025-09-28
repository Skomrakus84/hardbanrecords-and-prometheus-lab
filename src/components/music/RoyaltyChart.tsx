import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';

interface RoyaltyDataPoint {
  date: string;
  totalRevenue: number;
  netRevenue: number;
  streams: number;
  downloads: number;
  physicalSales: number;
  synchronization: number;
  performance: number;
}

interface RoyaltyChartProps {
  data: RoyaltyDataPoint[];
  timeRange: '7d' | '30d' | '90d' | '1y' | 'all';
  onTimeRangeChange: (range: '7d' | '30d' | '90d' | '1y' | 'all') => void;
  currency?: string;
  showBreakdown?: boolean;
}

const RoyaltyChart: React.FC<RoyaltyChartProps> = ({
  data,
  timeRange,
  onTimeRangeChange,
  currency = 'USD',
  showBreakdown = true
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

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  };

  // Calculate totals
  const totalRevenue = data.reduce((sum, item) => sum + item.totalRevenue, 0);
  const totalStreams = data.reduce((sum, item) => sum + item.streams, 0);
  const totalDownloads = data.reduce((sum, item) => sum + item.downloads, 0);

  // Calculate growth
  const calculateGrowth = (current: number, previous: number) => {
    if (previous === 0) return 0;
    return ((current - previous) / previous) * 100;
  };

  const latestRevenue = data[data.length - 1]?.totalRevenue || 0;
  const previousRevenue = data[data.length - 2]?.totalRevenue || 0;
  const revenueGrowth = calculateGrowth(latestRevenue, previousRevenue);

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
                {entry.name.includes('Revenue') ? formatCurrency(entry.value) : formatNumber(entry.value)}
              </span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-500 to-emerald-600 p-6 text-white">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">Royalty Analytics</h2>

          {/* Time Range Selector */}
          <div className="flex space-x-1 bg-white bg-opacity-20 rounded-lg p-1">
            {timeRangeOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => onTimeRangeChange(option.value as any)}
                className={`px-3 py-1 rounded-md text-sm font-medium transition-all ${
                  timeRange === option.value
                    ? 'bg-white text-green-600'
                    : 'text-white hover:bg-white hover:bg-opacity-10'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold">{formatCurrency(totalRevenue)}</div>
            <div className="text-sm text-green-100">Total Revenue</div>
            <div className={`text-xs mt-1 ${revenueGrowth >= 0 ? 'text-green-200' : 'text-red-200'}`}>
              {revenueGrowth >= 0 ? '↗' : '↘'} {Math.abs(revenueGrowth).toFixed(1)}%
            </div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold">{formatNumber(totalStreams)}</div>
            <div className="text-sm text-green-100">Total Streams</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold">{formatNumber(totalDownloads)}</div>
            <div className="text-sm text-green-100">Downloads</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold">{data.length}</div>
            <div className="text-sm text-green-100">Data Points</div>
          </div>
        </div>
      </div>

      {/* Main Chart */}
      <div className="p-6">
        {data.length > 0 ? (
          <>
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Revenue Trend</h3>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={data}>
                    <defs>
                      <linearGradient id="totalRevenueGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="netRevenueGradient" x1="0" y1="0" x2="0" y2="1">
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
                      tickFormatter={formatCurrency}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Area
                      type="monotone"
                      dataKey="totalRevenue"
                      stroke="#10b981"
                      strokeWidth={2}
                      fill="url(#totalRevenueGradient)"
                      name="Total Revenue"
                    />
                    <Area
                      type="monotone"
                      dataKey="netRevenue"
                      stroke="#3b82f6"
                      strokeWidth={2}
                      fill="url(#netRevenueGradient)"
                      name="Net Revenue"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Revenue Breakdown */}
            {showBreakdown && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Revenue Sources Chart */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Revenue Sources</h3>
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
                          dataKey="streams"
                          stroke="#8b5cf6"
                          strokeWidth={2}
                          dot={{ r: 3 }}
                          name="Streaming Revenue"
                        />
                        <Line
                          type="monotone"
                          dataKey="downloads"
                          stroke="#f59e0b"
                          strokeWidth={2}
                          dot={{ r: 3 }}
                          name="Download Revenue"
                        />
                        <Line
                          type="monotone"
                          dataKey="physicalSales"
                          stroke="#ef4444"
                          strokeWidth={2}
                          dot={{ r: 3 }}
                          name="Physical Sales"
                        />
                        <Line
                          type="monotone"
                          dataKey="synchronization"
                          stroke="#06b6d4"
                          strokeWidth={2}
                          dot={{ r: 3 }}
                          name="Sync Licensing"
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Revenue Breakdown Table */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Revenue Breakdown</h3>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="space-y-3">
                      {[
                        { name: 'Streaming', value: data.reduce((sum, item) => sum + item.streams, 0), color: 'bg-purple-500' },
                        { name: 'Downloads', value: data.reduce((sum, item) => sum + item.downloads, 0), color: 'bg-yellow-500' },
                        { name: 'Physical Sales', value: data.reduce((sum, item) => sum + item.physicalSales, 0), color: 'bg-red-500' },
                        { name: 'Sync Licensing', value: data.reduce((sum, item) => sum + item.synchronization, 0), color: 'bg-cyan-500' },
                        { name: 'Performance', value: data.reduce((sum, item) => sum + item.performance, 0), color: 'bg-indigo-500' }
                      ].map((source, index) => {
                        const percentage = totalRevenue > 0 ? (source.value / totalRevenue) * 100 : 0;
                        return (
                          <div key={index} className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <div className={`w-3 h-3 rounded-full ${source.color}`} />
                              <span className="text-sm font-medium text-gray-700">{source.name}</span>
                            </div>
                            <div className="text-right">
                              <div className="text-sm font-semibold text-gray-900">
                                {formatCurrency(source.value)}
                              </div>
                              <div className="text-xs text-gray-500">
                                {percentage.toFixed(1)}%
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </>
        ) : (
          // Empty State
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📊</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Royalty Data</h3>
            <p className="text-gray-600 mb-4">
              Royalty data will appear here once your releases start generating revenue.
            </p>
            <button className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg transition-colors">
              View Sample Data
            </button>
          </div>
        )}
      </div>

      {/* Legend */}
      <div className="border-t border-gray-200 p-4 bg-gray-50">
        <h4 className="text-sm font-medium text-gray-900 mb-3">Chart Legend</h4>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-green-500" />
            <span className="text-gray-600">Total Revenue</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-blue-500" />
            <span className="text-gray-600">Net Revenue</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-purple-500" />
            <span className="text-gray-600">Streaming</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-yellow-500" />
            <span className="text-gray-600">Downloads</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-red-500" />
            <span className="text-gray-600">Physical Sales</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-cyan-500" />
            <span className="text-gray-600">Sync Licensing</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoyaltyChart;
