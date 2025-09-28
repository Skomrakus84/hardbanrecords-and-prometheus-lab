import React, { useState } from 'react';

interface SalesData {
  date: string;
  units: number;
  revenue: number;
  platform: string;
}

interface Book {
  id: string;
  title: string;
  author: string;
  cover: string;
  totalSales: number;
  totalRevenue: number;
  averageRating: number;
  platforms: string[];
}

interface SalesAnalyticsProps {
  books: Book[];
  salesData: SalesData[];
  timeRange: '7d' | '30d' | '90d' | '1y' | 'all';
  onTimeRangeChange: (range: '7d' | '30d' | '90d' | '1y' | 'all') => void;
  currency: string;
  onBookSelect?: (bookId: string) => void;
  onExportData?: (format: 'csv' | 'pdf' | 'xlsx') => void;
}

const SalesAnalytics: React.FC<SalesAnalyticsProps> = ({
  books,
  salesData,
  timeRange,
  onTimeRangeChange,
  currency,
  onBookSelect,
  onExportData
}) => {
  const [selectedMetric, setSelectedMetric] = useState<'revenue' | 'units'>('revenue');
  const [selectedPlatform, setSelectedPlatform] = useState<string>('all');

  const timeRangeLabels = {
    '7d': 'Last 7 days',
    '30d': 'Last 30 days',
    '90d': 'Last 90 days',
    '1y': 'Last year',
    'all': 'All time'
  };

  const platforms = ['all', ...Array.from(new Set(salesData.map(s => s.platform)))];

  const filteredSalesData = salesData.filter(sale => {
    if (selectedPlatform === 'all') return true;
    return sale.platform === selectedPlatform;
  });

  const totalRevenue = filteredSalesData.reduce((sum, sale) => sum + sale.revenue, 0);
  const totalUnits = filteredSalesData.reduce((sum, sale) => sum + sale.units, 0);
  const averageRevenuePerUnit = totalUnits > 0 ? totalRevenue / totalUnits : 0;

  const topBooks = books
    .filter(book => selectedPlatform === 'all' || book.platforms.includes(selectedPlatform))
    .sort((a, b) => selectedMetric === 'revenue' ? b.totalRevenue - a.totalRevenue : b.totalSales - a.totalSales)
    .slice(0, 5);

  const platformData = platforms.slice(1).map(platform => {
    const platformSales = salesData.filter(s => s.platform === platform);
    return {
      platform,
      revenue: platformSales.reduce((sum, s) => sum + s.revenue, 0),
      units: platformSales.reduce((sum, s) => sum + s.units, 0),
      percentage: 0
    };
  });

  // Calculate percentages
  const totalPlatformRevenue = platformData.reduce((sum, p) => sum + p.revenue, 0);
  platformData.forEach(p => {
    p.percentage = totalPlatformRevenue > 0 ? (p.revenue / totalPlatformRevenue) * 100 : 0;
  });

  const getPlatformColor = (platform: string) => {
    const colors = {
      'Amazon KDP': '#ff9900',
      'Apple Books': '#007aff',
      'Google Books': '#4285f4',
      'Kobo': '#68217a',
      'Barnes & Noble': '#00704a',
      'Smashwords': '#1e90ff',
      'Draft2Digital': '#f39c12'
    };
    return colors[platform as keyof typeof colors] || '#6b7280';
  };

  return (
    <div className="space-y-6">
      {/* Header Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Sales Analytics</h3>
          <p className="text-sm text-gray-600">Track your book sales performance across platforms</p>
        </div>

        <div className="flex items-center space-x-3">
          {/* Time Range Selector */}
          <select
            value={timeRange}
            onChange={(e) => onTimeRangeChange(e.target.value as any)}
            className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {Object.entries(timeRangeLabels).map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>

          {/* Platform Filter */}
          <select
            value={selectedPlatform}
            onChange={(e) => setSelectedPlatform(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Platforms</option>
            {platforms.slice(1).map(platform => (
              <option key={platform} value={platform}>{platform}</option>
            ))}
          </select>

          {/* Export Options */}
          {onExportData && (
            <div className="relative">
              <button className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-2 px-4 rounded-lg transition-colors">
                📊 Export
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-sm font-medium text-gray-600">Total Revenue</h4>
            <span className="text-green-600 text-2xl">💰</span>
          </div>
          <div className="text-3xl font-bold text-gray-900 mb-2">
            {currency}{totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </div>
          <div className="text-sm text-green-600">+12.3% vs previous period</div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-sm font-medium text-gray-600">Units Sold</h4>
            <span className="text-blue-600 text-2xl">📚</span>
          </div>
          <div className="text-3xl font-bold text-gray-900 mb-2">
            {totalUnits.toLocaleString()}
          </div>
          <div className="text-sm text-blue-600">+8.7% vs previous period</div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-sm font-medium text-gray-600">Avg Revenue/Unit</h4>
            <span className="text-purple-600 text-2xl">📊</span>
          </div>
          <div className="text-3xl font-bold text-gray-900 mb-2">
            {currency}{averageRevenuePerUnit.toFixed(2)}
          </div>
          <div className="text-sm text-purple-600">+5.2% vs previous period</div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-sm font-medium text-gray-600">Active Books</h4>
            <span className="text-orange-600 text-2xl">📖</span>
          </div>
          <div className="text-3xl font-bold text-gray-900 mb-2">
            {books.length}
          </div>
          <div className="text-sm text-orange-600">2 new this month</div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sales Chart */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h4 className="text-lg font-semibold text-gray-900">Sales Over Time</h4>
            <div className="flex bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setSelectedMetric('revenue')}
                className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                  selectedMetric === 'revenue'
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600'
                }`}
              >
                Revenue
              </button>
              <button
                onClick={() => setSelectedMetric('units')}
                className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                  selectedMetric === 'units'
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600'
                }`}
              >
                Units
              </button>
            </div>
          </div>

          {/* Simple Chart Visualization */}
          <div className="space-y-3">
            {filteredSalesData.slice(0, 7).map((data, index) => {
              const maxValue = Math.max(...filteredSalesData.map(d => selectedMetric === 'revenue' ? d.revenue : d.units));
              const percentage = maxValue > 0 ? ((selectedMetric === 'revenue' ? data.revenue : data.units) / maxValue) * 100 : 0;

              return (
                <div key={index} className="flex items-center space-x-3">
                  <div className="w-16 text-xs text-gray-600">
                    {new Date(data.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </div>
                  <div className="flex-1 bg-gray-200 rounded-full h-3 relative">
                    <div
                      className="bg-blue-600 h-3 rounded-full transition-all duration-300"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <div className="w-20 text-xs text-gray-900 text-right">
                    {selectedMetric === 'revenue'
                      ? `${currency}${data.revenue.toFixed(2)}`
                      : `${data.units} units`
                    }
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Platform Distribution */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h4 className="text-lg font-semibold text-gray-900">Platform Distribution</h4>
          </div>

          <div className="space-y-4">
            {platformData.map(platform => (
              <div key={platform.platform} className="flex items-center space-x-3">
                <div
                  className="w-4 h-4 rounded-full"
                  style={{ backgroundColor: getPlatformColor(platform.platform) }}
                />
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-gray-900">{platform.platform}</span>
                    <span className="text-sm text-gray-600">{platform.percentage.toFixed(1)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="h-2 rounded-full transition-all duration-300"
                      style={{
                        width: `${platform.percentage}%`,
                        backgroundColor: getPlatformColor(platform.platform)
                      }}
                    />
                  </div>
                  <div className="flex items-center justify-between mt-1 text-xs text-gray-600">
                    <span>{currency}{platform.revenue.toFixed(2)}</span>
                    <span>{platform.units} units</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Top Performing Books */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h4 className="text-lg font-semibold text-gray-900">Top Performing Books</h4>
          <div className="text-sm text-gray-600">
            Sorted by {selectedMetric === 'revenue' ? 'revenue' : 'units sold'}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-medium text-gray-700">Book</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Author</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Revenue</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Units</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Rating</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Platforms</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {topBooks.map((book, index) => (
                <tr key={book.id} className="hover:bg-gray-50">
                  <td className="py-3 px-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded flex items-center justify-center">
                        <span className="text-white text-xs">📚</span>
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">{book.title}</div>
                        <div className="text-sm text-gray-500">Rank #{index + 1}</div>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-900">{book.author}</td>
                  <td className="py-3 px-4 text-sm text-gray-900 font-medium">
                    {currency}{book.totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-900">
                    {book.totalSales.toLocaleString()}
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-900">
                    <div className="flex items-center space-x-1">
                      <span className="text-yellow-500">⭐</span>
                      <span>{book.averageRating.toFixed(1)}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-900">
                    {book.platforms.length} platforms
                  </td>
                  <td className="py-3 px-4">
                    {onBookSelect && (
                      <button
                        onClick={() => onBookSelect(book.id)}
                        className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                      >
                        View Details
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default SalesAnalytics;
