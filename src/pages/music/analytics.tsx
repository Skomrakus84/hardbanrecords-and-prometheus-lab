import React, { useState, useEffect } from 'react';
import RoyaltyChart from '../../components/music/RoyaltyChart';
import RevenueByChannelChart from '../../components/music/RevenueByChannelChart';
import TrackAnalytics from '../../components/music/TrackAnalytics';
import { useNavigate } from 'react-router-dom';

interface AnalyticsData {
  royaltyData: Array<{
    date: string;
    totalRevenue: number;
    netRevenue: number;
    streams: number;
    downloads: number;
    physicalSales: number;
    synchronization: number;
    performance: number;
  }>;
  channelData: Array<{
    channel: string;
    revenue: number;
    streams: number;
    percentage: number;
    growth: number;
    color: string;
  }>;
  trackAnalytics: Array<{
    trackId: string;
    trackTitle: string;
    artistName: string;
    releaseDate: string;
    duration: string;
    data: Array<{
      date: string;
      streams: number;
      revenue: number;
      saves: number;
      shares: number;
      skips: number;
      completionRate: number;
    }>;
    platformStats: Array<{
      platform: string;
      streams: number;
      revenue: number;
      percentage: number;
      avgRevenuePer1000: number;
      color: string;
    }>;
    geographicData: Array<{
      country: string;
      streams: number;
      percentage: number;
      revenue: number;
    }>;
    demographicData: Array<{
      ageGroup: string;
      streams: number;
      percentage: number;
      malePercentage: number;
      femalePercentage: number;
    }>;
  }>;
}

const AnalyticsPage: React.FC = () => {
  const navigate = useNavigate();
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | '1y' | 'all'>('30d');
  const [selectedTrack, setSelectedTrack] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);

  // Sample analytics data
  const sampleAnalyticsData: AnalyticsData = {
    royaltyData: [
      { date: '2024-01-01', totalRevenue: 1250, netRevenue: 1000, streams: 25000, downloads: 150, physicalSales: 50, synchronization: 200, performance: 100 },
      { date: '2024-01-15', totalRevenue: 1380, netRevenue: 1104, streams: 28000, downloads: 180, physicalSales: 60, synchronization: 220, performance: 120 },
      { date: '2024-02-01', totalRevenue: 1520, netRevenue: 1216, streams: 31000, downloads: 200, physicalSales: 70, synchronization: 250, performance: 140 },
      { date: '2024-02-15', totalRevenue: 1680, netRevenue: 1344, streams: 34000, downloads: 220, physicalSales: 80, synchronization: 280, performance: 160 },
      { date: '2024-03-01', totalRevenue: 1850, netRevenue: 1480, streams: 37000, downloads: 250, physicalSales: 90, synchronization: 300, performance: 180 },
      { date: '2024-03-15', totalRevenue: 2020, netRevenue: 1616, streams: 40000, downloads: 280, physicalSales: 100, synchronization: 320, performance: 200 }
    ],
    channelData: [
      { channel: 'Spotify', revenue: 8500, streams: 425000, percentage: 42.5, growth: 15.2, color: '#1db954' },
      { channel: 'Apple Music', revenue: 4200, streams: 210000, percentage: 21.0, growth: 8.7, color: '#fa243c' },
      { channel: 'YouTube Music', revenue: 3100, streams: 155000, percentage: 15.5, growth: 12.3, color: '#ff0000' },
      { channel: 'Amazon Music', revenue: 2200, streams: 110000, percentage: 11.0, growth: 6.8, color: '#ff9900' },
      { channel: 'Deezer', revenue: 1500, streams: 75000, percentage: 7.5, growth: 4.2, color: '#feaa2d' },
      { channel: 'Tidal', revenue: 500, streams: 25000, percentage: 2.5, growth: -2.1, color: '#000000' }
    ],
    trackAnalytics: [
      {
        trackId: '1',
        trackTitle: 'Midnight Dreams',
        artistName: 'Luna Rose',
        releaseDate: '2024-03-15',
        duration: '3:42',
        data: [
          { date: '2024-03-15', streams: 1200, revenue: 4.8, saves: 85, shares: 23, skips: 240, completionRate: 78.5 },
          { date: '2024-03-16', streams: 1850, revenue: 7.4, saves: 142, shares: 38, skips: 370, completionRate: 82.1 },
          { date: '2024-03-17', streams: 2100, revenue: 8.4, saves: 168, shares: 45, skips: 420, completionRate: 79.8 },
          { date: '2024-03-18', streams: 2400, revenue: 9.6, saves: 195, shares: 52, skips: 480, completionRate: 81.2 },
          { date: '2024-03-19', streams: 2850, revenue: 11.4, saves: 231, shares: 62, skips: 570, completionRate: 83.4 },
          { date: '2024-03-20', streams: 3200, revenue: 12.8, saves: 268, shares: 71, skips: 640, completionRate: 84.7 }
        ],
        platformStats: [
          { platform: 'Spotify', streams: 8500, revenue: 34.0, percentage: 52.3, avgRevenuePer1000: 4.0, color: '#1db954' },
          { platform: 'Apple Music', streams: 4200, revenue: 18.9, percentage: 25.8, avgRevenuePer1000: 4.5, color: '#fa243c' },
          { platform: 'YouTube Music', streams: 2800, revenue: 8.4, percentage: 17.2, avgRevenuePer1000: 3.0, color: '#ff0000' },
          { platform: 'Amazon Music', streams: 750, revenue: 3.0, percentage: 4.6, avgRevenuePer1000: 4.0, color: '#ff9900' }
        ],
        geographicData: [
          { country: 'United States', streams: 6500, percentage: 40.0, revenue: 26.0 },
          { country: 'United Kingdom', streams: 2400, percentage: 14.8, revenue: 9.6 },
          { country: 'Germany', streams: 1800, percentage: 11.1, revenue: 7.2 },
          { country: 'Canada', streams: 1200, percentage: 7.4, revenue: 4.8 },
          { country: 'Australia', streams: 950, percentage: 5.8, revenue: 3.8 },
          { country: 'France', streams: 850, percentage: 5.2, revenue: 3.4 },
          { country: 'Netherlands', streams: 650, percentage: 4.0, revenue: 2.6 },
          { country: 'Sweden', streams: 550, percentage: 3.4, revenue: 2.2 },
          { country: 'Norway', streams: 450, percentage: 2.8, revenue: 1.8 },
          { country: 'Other', streams: 900, percentage: 5.5, revenue: 3.6 }
        ],
        demographicData: [
          { ageGroup: '18-24', streams: 4200, percentage: 25.8, malePercentage: 45, femalePercentage: 55 },
          { ageGroup: '25-34', streams: 5800, percentage: 35.7, malePercentage: 48, femalePercentage: 52 },
          { ageGroup: '35-44', streams: 3500, percentage: 21.5, malePercentage: 52, femalePercentage: 48 },
          { ageGroup: '45-54', streams: 1900, percentage: 11.7, malePercentage: 55, femalePercentage: 45 },
          { ageGroup: '55+', streams: 850, percentage: 5.2, malePercentage: 58, femalePercentage: 42 }
        ]
      }
    ]
  };

  useEffect(() => {
    const loadAnalytics = async () => {
      setLoading(true);
      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        setAnalyticsData(sampleAnalyticsData);
        if (sampleAnalyticsData.trackAnalytics.length > 0) {
          setSelectedTrack(sampleAnalyticsData.trackAnalytics[0].trackId);
        }
      } catch (error) {
        console.error('Failed to load analytics:', error);
      } finally {
        setLoading(false);
      }
    };

    loadAnalytics();
  }, []);

  const selectedTrackData = analyticsData?.trackAnalytics.find(track => track.trackId === selectedTrack);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">📊</div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Loading Analytics...</h2>
          <p className="text-gray-600">Please wait while we gather your data.</p>
        </div>
      </div>
    );
  }

  if (!analyticsData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">❌</div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Failed to Load Analytics</h2>
          <p className="text-gray-600 mb-4">There was an error loading your analytics data.</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Music Analytics</h1>
            <p className="text-gray-600 mt-1">Track your performance across all platforms</p>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={() => navigate('/music/catalog')}
              className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-2 px-4 rounded-lg transition-colors"
            >
              📚 Catalog
            </button>
            <button
              onClick={() => navigate('/music/payouts')}
              className="bg-green-100 hover:bg-green-200 text-green-700 font-medium py-2 px-4 rounded-lg transition-colors"
            >
              💰 Payouts
            </button>
            <button
              onClick={() => navigate('/music/notifications')}
              className="bg-blue-100 hover:bg-blue-200 text-blue-700 font-medium py-2 px-4 rounded-lg transition-colors"
            >
              🔔 Notifications
            </button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-gray-600">Total Revenue</h3>
              <span className="text-green-600 text-2xl">💰</span>
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-2">
              ${analyticsData.royaltyData.reduce((sum, item) => sum + item.totalRevenue, 0).toLocaleString()}
            </div>
            <div className="text-sm text-green-600">+12.5% from last period</div>
          </div>

          <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-gray-600">Total Streams</h3>
              <span className="text-blue-600 text-2xl">🎵</span>
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-2">
              {analyticsData.channelData.reduce((sum, item) => sum + item.streams, 0).toLocaleString()}
            </div>
            <div className="text-sm text-blue-600">+8.7% from last period</div>
          </div>

          <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-gray-600">Active Releases</h3>
              <span className="text-purple-600 text-2xl">📀</span>
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-2">
              {analyticsData.trackAnalytics.length}
            </div>
            <div className="text-sm text-purple-600">2 new this month</div>
          </div>

          <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-gray-600">Avg. Revenue/Stream</h3>
              <span className="text-orange-600 text-2xl">📊</span>
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-2">
              $0.0038
            </div>
            <div className="text-sm text-orange-600">Industry standard</div>
          </div>
        </div>

        {/* Main Charts */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          {/* Royalty Chart */}
          <RoyaltyChart
            data={analyticsData.royaltyData}
            timeRange={timeRange}
            onTimeRangeChange={setTimeRange}
            currency="USD"
            showBreakdown={true}
          />

          {/* Revenue by Channel */}
          <RevenueByChannelChart
            data={analyticsData.channelData}
            timeRange={timeRange}
            onTimeRangeChange={setTimeRange}
            currency="USD"
            viewMode="chart"
            onViewModeChange={() => {}}
          />
        </div>

        {/* Track Analytics */}
        {selectedTrackData && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">Track Performance</h2>
              <select
                value={selectedTrack}
                onChange={(e) => setSelectedTrack(e.target.value)}
                className="bg-white border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {analyticsData.trackAnalytics.map(track => (
                  <option key={track.trackId} value={track.trackId}>
                    {track.trackTitle} - {track.artistName}
                  </option>
                ))}
              </select>
            </div>

            <TrackAnalytics
              trackId={selectedTrackData.trackId}
              trackTitle={selectedTrackData.trackTitle}
              artistName={selectedTrackData.artistName}
              releaseDate={selectedTrackData.releaseDate}
              duration={selectedTrackData.duration}
              data={selectedTrackData.data}
              platformStats={selectedTrackData.platformStats}
              geographicData={selectedTrackData.geographicData}
              demographicData={selectedTrackData.demographicData}
              timeRange={timeRange}
              onTimeRangeChange={setTimeRange}
            />
          </div>
        )}

        {/* Export & Reports */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Export & Reports</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button className="bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-700 font-medium py-3 px-4 rounded-lg transition-colors">
              📊 Download Full Report (PDF)
            </button>
            <button className="bg-green-50 hover:bg-green-100 border border-green-200 text-green-700 font-medium py-3 px-4 rounded-lg transition-colors">
              📈 Export Analytics Data (CSV)
            </button>
            <button className="bg-purple-50 hover:bg-purple-100 border border-purple-200 text-purple-700 font-medium py-3 px-4 rounded-lg transition-colors">
              📧 Schedule Weekly Reports
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsPage;
