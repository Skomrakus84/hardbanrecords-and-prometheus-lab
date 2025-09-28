import React from 'react';
import { RevenueData } from '../../types/analytics';

interface RevenueChartProps {
  data: RevenueData[];
  loading: boolean;
  period: string;
}

export const RevenueChart: React.FC<RevenueChartProps> = ({ data, loading, period }) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const maxValue = Math.max(...data.map(d => d.total));
  const minValue = Math.min(...data.map(d => d.total));
  const range = maxValue - minValue;

  const getBarHeight = (value: number) => {
    if (range === 0) return 50;
    return Math.max(((value - minValue) / range) * 100, 5);
  };

  const getChangePercent = () => {
    if (data.length < 2) return 0;
    const latest = data[data.length - 1].total;
    const previous = data[data.length - 2].total;
    return ((latest - previous) / previous) * 100;
  };

  const getTotalRevenue = () => {
    return data.reduce((sum, day) => sum + day.total, 0);
  };

  const getAverageDaily = () => {
    return data.length > 0 ? getTotalRevenue() / data.length : 0;
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Revenue Trend</h3>
        <div className="animate-pulse">
          <div className="h-64 bg-gray-200 rounded-lg mb-4"></div>
          <div className="flex justify-between">
            <div className="h-4 bg-gray-200 rounded w-24"></div>
            <div className="h-4 bg-gray-200 rounded w-16"></div>
          </div>
        </div>
      </div>
    );
  }

  const changePercent = getChangePercent();
  const isPositive = changePercent >= 0;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Revenue Trend</h3>
          <p className="text-sm text-gray-500">Last {period}</p>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold text-gray-900">
            {formatCurrency(getTotalRevenue())}
          </p>
          <div className="flex items-center justify-end space-x-1">
            <span className={`text-sm font-medium ${
              isPositive ? 'text-green-600' : 'text-red-600'
            }`}>
              {isPositive ? '+' : ''}{changePercent.toFixed(1)}%
            </span>
            <div className={`w-4 h-4 ${
              isPositive ? 'text-green-500' : 'text-red-500'
            }`}>
              {isPositive ? (
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                </svg>
              ) : (
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                </svg>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="relative h-64 mb-6">
        <div className="absolute inset-0 flex items-end justify-between space-x-1">
          {data.map((day, index) => (
            <div key={day.date} className="flex-1 flex flex-col items-center group">
              {/* Tooltip */}
              <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 absolute -top-16 bg-gray-900 text-white text-xs rounded py-1 px-2 pointer-events-none z-10">
                <div className="text-center">
                  <div className="font-medium">{formatCurrency(day.total)}</div>
                  <div className="text-gray-300">{formatDate(day.date)}</div>
                </div>
                <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
              </div>

              {/* Bar */}
              <div className="w-full flex flex-col items-end space-y-1 mb-2">
                {/* Stacked bar segments */}
                <div
                  className="w-full bg-gradient-to-t from-green-400 to-green-500 rounded-t transition-all duration-300 hover:from-green-500 hover:to-green-600"
                  style={{ height: `${(day.spotify / day.total) * getBarHeight(day.total)}%` }}
                  title={`Spotify: ${formatCurrency(day.spotify)}`}
                />
                <div
                  className="w-full bg-gradient-to-t from-red-400 to-red-500 transition-all duration-300 hover:from-red-500 hover:to-red-600"
                  style={{ height: `${(day.appleMusic / day.total) * getBarHeight(day.total)}%` }}
                  title={`Apple Music: ${formatCurrency(day.appleMusic)}`}
                />
                <div
                  className="w-full bg-gradient-to-t from-red-500 to-red-600 transition-all duration-300 hover:from-red-600 hover:to-red-700"
                  style={{ height: `${(day.youtube / day.total) * getBarHeight(day.total)}%` }}
                  title={`YouTube: ${formatCurrency(day.youtube)}`}
                />
                <div
                  className="w-full bg-gradient-to-t from-gray-400 to-gray-500 rounded-b transition-all duration-300 hover:from-gray-500 hover:to-gray-600"
                  style={{ height: `${(day.other / day.total) * getBarHeight(day.total)}%` }}
                  title={`Others: ${formatCurrency(day.other)}`}
                />
              </div>

              {/* Date label */}
              <span className="text-xs text-gray-500 transform -rotate-45 origin-center whitespace-nowrap">
                {formatDate(day.date)}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center space-x-6 text-sm">
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-gradient-to-r from-green-400 to-green-500 rounded"></div>
          <span className="text-gray-600">Spotify</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-gradient-to-r from-red-400 to-red-500 rounded"></div>
          <span className="text-gray-600">Apple Music</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-gradient-to-r from-red-500 to-red-600 rounded"></div>
          <span className="text-gray-600">YouTube</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-gradient-to-r from-gray-400 to-gray-500 rounded"></div>
          <span className="text-gray-600">Others</span>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="mt-6 pt-4 border-t border-gray-200 grid grid-cols-2 gap-4">
        <div className="text-center">
          <p className="text-sm text-gray-500">Average Daily</p>
          <p className="text-lg font-semibold text-gray-900">
            {formatCurrency(getAverageDaily())}
          </p>
        </div>
        <div className="text-center">
          <p className="text-sm text-gray-500">Peak Day</p>
          <p className="text-lg font-semibold text-gray-900">
            {formatCurrency(maxValue)}
          </p>
        </div>
      </div>
    </div>
  );
};
