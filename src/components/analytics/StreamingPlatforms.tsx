import React from 'react';
import { StreamingData } from '../../types/analytics';

interface StreamingPlatformsProps {
  data: StreamingData[];
  loading: boolean;
}

export const StreamingPlatforms: React.FC<StreamingPlatformsProps> = ({ data, loading }) => {
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

  const getPlatformIcon = (platform: string) => {
    const icons: Record<string, string> = {
      'Spotify': '🎵',
      'Apple Music': '🍎',
      'YouTube Music': '📺',
      'Amazon Music': '🛒',
      'Deezer': '🎶',
      'Tidal': '🌊'
    };
    return icons[platform] || '🎵';
  };

  const getPlatformColor = (platform: string) => {
    const colors: Record<string, string> = {
      'Spotify': 'from-green-400 to-green-600',
      'Apple Music': 'from-red-400 to-red-600',
      'YouTube Music': 'from-red-500 to-red-700',
      'Amazon Music': 'from-orange-400 to-orange-600',
      'Deezer': 'from-yellow-400 to-yellow-600',
      'Tidal': 'from-gray-700 to-gray-900'
    };
    return colors[platform] || 'from-blue-400 to-blue-600';
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Streaming Platforms</h3>
        <div className="space-y-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gray-200 rounded-lg"></div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 rounded w-24 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-16"></div>
                </div>
                <div className="text-right">
                  <div className="h-4 bg-gray-200 rounded w-16 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-12"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Streaming Platforms</h3>
        <div className="text-sm text-gray-500">Last 7 days</div>
      </div>

      <div className="space-y-4">
        {data.map((platform, index) => (
          <div
            key={platform.platform}
            className="flex items-center justify-between p-4 rounded-lg border border-gray-100 hover:border-gray-200 transition-colors"
          >
            <div className="flex items-center space-x-4">
              {/* Platform Icon */}
              <div className={`w-12 h-12 rounded-lg bg-gradient-to-r ${getPlatformColor(platform.platform)} flex items-center justify-center text-white text-xl`}>
                {getPlatformIcon(platform.platform)}
              </div>

              {/* Platform Info */}
              <div>
                <h4 className="font-medium text-gray-900">{platform.platform}</h4>
                <p className="text-sm text-gray-500">
                  {formatNumber(platform.streams)} streams
                </p>
              </div>
            </div>

            {/* Revenue & Change */}
            <div className="text-right">
              <p className="font-semibold text-gray-900">
                {formatCurrency(platform.revenue)}
              </p>
              <div className="flex items-center justify-end space-x-1">
                <span className={`text-xs font-medium ${
                  platform.changePercent >= 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {platform.changePercent >= 0 ? '+' : ''}{platform.changePercent}%
                </span>
                <div className={`w-3 h-3 ${
                  platform.changePercent >= 0 ? 'text-green-500' : 'text-red-500'
                }`}>
                  {platform.changePercent >= 0 ? (
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
        ))}
      </div>

      {/* Total Summary */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <div className="flex justify-between items-center">
          <span className="font-medium text-gray-900">Total</span>
          <div className="text-right">
            <p className="font-bold text-lg text-gray-900">
              {formatCurrency(data.reduce((sum, platform) => sum + platform.revenue, 0))}
            </p>
            <p className="text-sm text-gray-500">
              {formatNumber(data.reduce((sum, platform) => sum + platform.streams, 0))} streams
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
