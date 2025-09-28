import React, { useState } from 'react';
import { Headphones, Users, Globe, TrendingUp, BarChart3, Disc3, DollarSign } from 'lucide-react';
import Button from '../../components/ui/Button';
import { ProgressBar, Badge } from '../../components/ui/UIElements';

interface StreamingData {
  platform: string;
  streams: number;
  revenue: number;
  growth: number;
  color: string;
}

interface GeographicData {
  country: string;
  streams: number;
  percentage: number;
  flag: string;
}

interface DemographicData {
  ageGroup: string;
  percentage: number;
  color: string;
}

interface TopTrack {
  id: string;
  title: string;
  artist: string;
  streams: number;
  revenue: number;
  growth: number;
}

const AnalyticsPageNew: React.FC = () => {
  const [selectedPeriod, setSelectedPeriod] = useState<'24h' | '7d' | '30d' | '90d'>('30d');
  const [selectedMetric, setSelectedMetric] = useState<'streams' | 'revenue' | 'listeners'>('streams');

  const streamingPlatforms: StreamingData[] = [
    {
      platform: 'Spotify',
      streams: 1245000,
      revenue: 4980,
      growth: 12.5,
      color: 'bg-green-500'
    },
    {
      platform: 'Apple Music',
      streams: 785000,
      revenue: 4710,
      growth: 8.3,
      color: 'bg-gray-800'
    },
    {
      platform: 'YouTube Music',
      streams: 650000,
      revenue: 1950,
      growth: 15.7,
      color: 'bg-red-500'
    },
    {
      platform: 'Amazon Music',
      streams: 420000,
      revenue: 2520,
      growth: 6.2,
      color: 'bg-orange-500'
    },
    {
      platform: 'Deezer',
      streams: 180000,
      revenue: 810,
      growth: 4.1,
      color: 'bg-purple-500'
    },
    {
      platform: 'Tidal',
      streams: 95000,
      revenue: 570,
      growth: 2.8,
      color: 'bg-blue-500'
    }
  ];

  const geographicData: GeographicData[] = [
    { country: 'United States', streams: 1450000, percentage: 35.2, flag: '🇺🇸' },
    { country: 'United Kingdom', streams: 620000, percentage: 15.1, flag: '🇬🇧' },
    { country: 'Germany', streams: 485000, percentage: 11.8, flag: '🇩🇪' },
    { country: 'Canada', streams: 390000, percentage: 9.5, flag: '🇨🇦' },
    { country: 'France', streams: 285000, percentage: 6.9, flag: '🇫🇷' },
    { country: 'Australia', streams: 220000, percentage: 5.4, flag: '🇦🇺' },
    { country: 'Netherlands', streams: 185000, percentage: 4.5, flag: '🇳🇱' },
    { country: 'Sweden', streams: 140000, percentage: 3.4, flag: '🇸🇪' },
    { country: 'Others', streams: 340000, percentage: 8.2, flag: 'globe' }
  ];

  const demographicData: DemographicData[] = [
    { ageGroup: '18-24', percentage: 28.5, color: 'bg-purple-500' },
    { ageGroup: '25-34', percentage: 34.2, color: 'bg-blue-500' },
    { ageGroup: '35-44', percentage: 22.1, color: 'bg-green-500' },
    { ageGroup: '45-54', percentage: 10.8, color: 'bg-yellow-500' },
    { ageGroup: '55+', percentage: 4.4, color: 'bg-red-500' }
  ];

  const topTracks: TopTrack[] = [
    {
      id: '1',
      title: 'Midnight Dreams',
      artist: 'The Synthwave',
      streams: 892000,
      revenue: 3568,
      growth: 18.5
    },
    {
      id: '2',
      title: 'Electric Pulse',
      artist: 'Neon Beats',
      streams: 645000,
      revenue: 2580,
      growth: 12.3
    },
    {
      id: '3',
      title: 'Neon Nights',
      artist: 'The Synthwave',
      streams: 520000,
      revenue: 2080,
      growth: 8.7
    },
    {
      id: '4',
      title: 'Digital Dreams',
      artist: 'City Sound',
      streams: 485000,
      revenue: 1940,
      growth: 15.2
    },
    {
      id: '5',
      title: 'Bass Drop',
      artist: 'DJ Pulse',
      streams: 380000,
      revenue: 1520,
      growth: 6.9
    }
  ];

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(0)}K`;
    return num.toString();
  };

  const totalStreams = streamingPlatforms.reduce((sum, platform) => sum + platform.streams, 0);
  const totalRevenue = streamingPlatforms.reduce((sum, platform) => sum + platform.revenue, 0);
  const avgGrowth = streamingPlatforms.reduce((sum, platform) => sum + platform.growth, 0) / streamingPlatforms.length;

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl shadow-md bg-indigo-500 flex items-center justify-center">
              <BarChart3 size={24} className="text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
              <p className="text-gray-600 mt-2">Real-time streaming data and performance metrics</p>
            </div>
          </div>

          {/* Time Period Selector */}
          <div className="flex space-x-1 bg-gray-200 rounded-lg p-1">
            {(['24h', '7d', '30d', '90d'] as const).map((period) => (
              <button
                key={period}
                onClick={() => setSelectedPeriod(period)}
                className={`px-4 py-2 rounded-md font-medium text-sm transition-colors ${
                  selectedPeriod === period
                    ? 'bg-white text-indigo-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {period === '24h' ? '24 Hours' :
                 period === '7d' ? '7 Days' :
                 period === '30d' ? '30 Days' : '90 Days'}
              </button>
            ))}
          </div>
        </div>

        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl shadow-lg p-6 text-white">
            <div className="flex items-center justify-between mb-4">
              <Headphones size={32} />
              <TrendingUp size={24} />
            </div>
            <h3 className="text-2xl font-bold mb-1">{formatNumber(totalStreams)}</h3>
            <p className="text-lg font-medium opacity-90 mb-1">Total Streams</p>
            <p className="text-sm opacity-75">+{avgGrowth.toFixed(1)}% vs last period</p>
          </div>

                    <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl shadow-lg p-6 text-white">
            <div className="flex items-center justify-between mb-4">
              <Disc3 size={24} className="opacity-90" />
              <Badge variant="success" size="sm">+18.2%</Badge>
            </div>
            <h3 className="text-2xl font-bold mb-1">{formatNumber(totalStreams)}</h3>
            <p className="text-lg font-medium opacity-90 mb-3">Total Streams</p>
            <ProgressBar progress={82} color="#ffffff" height={4} />
          </div>

          <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-xl shadow-lg p-6 text-white">
            <div className="flex items-center justify-between mb-4">
              <DollarSign size={24} className="opacity-90" />
              <Badge variant="info" size="sm">+12.3%</Badge>
            </div>
            <h3 className="text-2xl font-bold mb-1">${totalRevenue.toLocaleString()}</h3>
            <p className="text-lg font-medium opacity-90 mb-3">Total Revenue</p>
            <ProgressBar progress={75} color="#ffffff" height={4} />
          </div>

          <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl shadow-lg p-6 text-white">
                        <div className="flex items-center justify-between mb-4">
              <Users size={24} className="opacity-90" />
              <Badge variant="info" size="sm">+12.3%</Badge>
            </div>
            <h3 className="text-2xl font-bold mb-1">248K</h3>
            <p className="text-lg font-medium opacity-90 mb-3">Monthly Listeners</p>
            <ProgressBar progress={67} color="#ffffff" height={4} />
          </div>

          <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl shadow-lg p-6 text-white">
            <div className="flex items-center justify-between mb-4">
              <Users size={32} />
              <TrendingUp size={24} />
            </div>
            <h3 className="text-2xl font-bold mb-1">248K</h3>
            <p className="text-lg font-medium opacity-90 mb-1">Monthly Listeners</p>
            <p className="text-sm opacity-75">+8.7% vs last period</p>
          </div>
        </div>
      </div>

      {/* Platform Breakdown */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 mb-8">
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Platform Breakdown</h2>
          <div className="space-y-4">
            {streamingPlatforms.map((platform, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className={`w-10 h-10 ${platform.color} rounded-lg flex items-center justify-center text-white font-semibold text-sm`}>
                    {platform.platform[0]}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{platform.platform}</h3>
                    <p className="text-sm text-gray-600">{formatNumber(platform.streams)} streams</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-gray-900">${platform.revenue.toLocaleString()}</p>
                  <p className="text-sm text-green-600">+{platform.growth}%</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Geographic Breakdown */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Geographic Breakdown</h2>
          <div className="space-y-3">
            {geographicData.map((country, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  {country.flag === 'globe' ? (
                    <Globe size={20} className="text-gray-600" />
                  ) : (
                    <span className="text-lg">{country.flag}</span>
                  )}
                  <div>
                    <p className="font-medium text-gray-900">{country.country}</p>
                    <p className="text-sm text-gray-600">{formatNumber(country.streams)} streams</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-gray-900">{country.percentage}%</p>
                  <div className="w-16 bg-gray-200 rounded-full h-2 mt-1">
                    <div
                      className="bg-indigo-600 h-2 rounded-full"
                      style={{ width: `${country.percentage}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Demographic Insights & Top Tracks */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 mb-8">
        {/* Demographic Insights */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Demographic Insights</h2>
          <div className="space-y-4">
            {demographicData.map((demo, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`w-8 h-8 ${demo.color} rounded-lg`}></div>
                  <span className="font-medium text-gray-900">{demo.ageGroup} years</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-24 bg-gray-200 rounded-full h-2">
                    <div
                      className={`${demo.color} h-2 rounded-full`}
                      style={{ width: `${demo.percentage}%` }}
                    ></div>
                  </div>
                  <span className="font-semibold text-gray-900 w-12 text-right">{demo.percentage}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Tracks */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Top Tracks</h2>
          <div className="space-y-3">
            {topTracks.map((track, index) => (
              <div key={track.id} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-blue-500 rounded-lg flex items-center justify-center text-white font-bold text-sm">
                    {index + 1}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{track.title}</p>
                    <p className="text-sm text-gray-600">{track.artist}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-gray-900">{formatNumber(track.streams)}</p>
                  <p className="text-sm text-green-600">+{track.growth}%</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Revenue Chart Placeholder */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Revenue Trend</h2>
          <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
            {(['streams', 'revenue', 'listeners'] as const).map((metric) => (
              <button
                key={metric}
                onClick={() => setSelectedMetric(metric)}
                className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                  selectedMetric === metric
                    ? 'bg-white text-indigo-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {metric.charAt(0).toUpperCase() + metric.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Chart Placeholder */}
        <div className="h-64 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg flex items-center justify-center">
          <div className="text-center">
            <BarChart3 size={48} className="text-gray-400 mx-auto mb-2" />
            <p className="text-gray-600 font-medium">Interactive Chart</p>
            <p className="text-sm text-gray-500 mt-1">
              Showing {selectedMetric} for the last {selectedPeriod}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsPageNew;
