import React from 'react';
import { GeographicData } from '../../types/analytics';

interface GeographicBreakdownProps {
  data: GeographicData[];
  loading: boolean;
}

export const GeographicBreakdown: React.FC<GeographicBreakdownProps> = ({ data, loading }) => {
  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M`;
    }
    if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}K`;
    }
    return num.toLocaleString();
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const getFlag = (countryCode: string) => {
    const flags: Record<string, string> = {
      'US': '🇺🇸',
      'GB': '🇬🇧',
      'DE': '🇩🇪',
      'CA': '🇨🇦',
      'AU': '🇦🇺',
      'FR': '🇫🇷',
      'NL': '🇳🇱',
      'SE': '🇸🇪',
      'NO': '🇳🇴'
    };
    return flags[countryCode] || '🌍';
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Geographic Breakdown</h3>
        <div className="space-y-3">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-5 bg-gray-200 rounded"></div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 rounded w-20 mb-1"></div>
                  <div className="h-2 bg-gray-200 rounded-full"></div>
                </div>
                <div className="text-right">
                  <div className="h-3 bg-gray-200 rounded w-12 mb-1"></div>
                  <div className="h-3 bg-gray-200 rounded w-16"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  const maxStreams = Math.max(...data.map(d => d.streams));

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Geographic Breakdown</h3>
        <span className="text-sm text-gray-500">Top listening countries</span>
      </div>

      <div className="space-y-4">
        {data.map((country, index) => (
          <div key={country.country} className="flex items-center space-x-4">
            {/* Rank */}
            <div className="w-6 text-center">
              <span className={`text-sm font-medium ${
                index < 3 ? 'text-orange-500' : 'text-gray-500'
              }`}>
                {index + 1}
              </span>
            </div>

            {/* Flag */}
            <div className="text-2xl">
              {getFlag(country.countryCode)}
            </div>

            {/* Country Info */}
            <div className="flex-1">
              <div className="flex items-center justify-between mb-1">
                <span className="font-medium text-gray-900">{country.country}</span>
                <span className="text-sm text-gray-500">{country.percentage}%</span>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all duration-500 ${
                    index === 0 ? 'bg-gradient-to-r from-blue-500 to-blue-600' :
                    index === 1 ? 'bg-gradient-to-r from-green-500 to-green-600' :
                    index === 2 ? 'bg-gradient-to-r from-purple-500 to-purple-600' :
                    'bg-gradient-to-r from-gray-400 to-gray-500'
                  }`}
                  style={{ width: `${(country.streams / maxStreams) * 100}%` }}
                />
              </div>
            </div>

            {/* Stats */}
            <div className="text-right min-w-[80px]">
              <p className="text-sm font-medium text-gray-900">
                {formatCurrency(country.revenue)}
              </p>
              <p className="text-xs text-gray-500">
                {formatNumber(country.streams)} streams
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* World Map Placeholder */}
      <div className="mt-6 pt-6 border-t border-gray-200">
        <div className="bg-gradient-to-b from-blue-50 to-blue-100 rounded-lg p-8 text-center">
          <div className="text-6xl mb-4">🗺️</div>
          <h4 className="text-lg font-medium text-gray-900 mb-2">Global Reach</h4>
          <p className="text-sm text-gray-600">
            Your music is being enjoyed in {data.length} countries worldwide
          </p>
        </div>
      </div>

      {/* Summary */}
      <div className="mt-4 pt-4 border-t border-gray-200">
        <div className="grid grid-cols-2 gap-4 text-center">
          <div>
            <p className="text-sm text-gray-500">Top Country</p>
            <p className="font-semibold text-gray-900">{data[0]?.country}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Total Countries</p>
            <p className="font-semibold text-gray-900">{data.length}</p>
          </div>
        </div>
      </div>
    </div>
  );
};
