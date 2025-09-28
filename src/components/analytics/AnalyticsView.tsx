import React, { useEffect, useState } from 'react';
import { useAnalyticsStore } from '../../store/analyticsStore';
import { OverviewCards } from './OverviewCards';
import { StreamingPlatforms } from './StreamingPlatforms';
import { RevenueChart } from './RevenueChart';
import { GeographicBreakdown } from './GeographicBreakdown';
import { DemographicInsights } from './DemographicInsights';

type TimePeriod = '24h' | '7d' | '30d' | '90d';

export const AnalyticsView: React.FC = () => {
  const {
    overview,
    streamingData,
    revenueData,
    geographicData,
    demographicData,
    isLoading,
    error,
    fetchAnalyticsOverview,
    fetchStreamingData,
    fetchRevenueData,
    fetchGeographicData,
    fetchDemographicData,
    clearError
  } = useAnalyticsStore();

  const [selectedPeriod, setSelectedPeriod] = useState<TimePeriod>('7d');
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadAllData();
  }, []);

  useEffect(() => {
    // Refresh streaming and revenue data when period changes
    fetchStreamingData(selectedPeriod);
    fetchRevenueData(selectedPeriod);
  }, [selectedPeriod, fetchStreamingData, fetchRevenueData]);

  const loadAllData = async () => {
    setRefreshing(true);
    try {
      await Promise.all([
        fetchAnalyticsOverview(),
        fetchStreamingData(selectedPeriod),
        fetchRevenueData(selectedPeriod),
        fetchGeographicData(),
        fetchDemographicData()
      ]);
    } finally {
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    loadAllData();
  };

  const handlePeriodChange = (period: TimePeriod) => {
    setSelectedPeriod(period);
  };

  if (isLoading && !overview) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h3 className="text-lg font-medium text-gray-900">Loading Analytics...</h3>
          <p className="text-gray-500">Fetching your latest performance data</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800">Error Loading Analytics</h3>
            <p className="text-sm text-red-700 mt-1">{error}</p>
            <div className="mt-4">
              <button
                onClick={() => {
                  clearError();
                  loadAllData();
                }}
                className="bg-red-100 hover:bg-red-200 text-red-800 px-3 py-2 rounded text-sm font-medium"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
          <p className="text-gray-600 mt-1">Real-time insights into your music performance</p>
        </div>

        <div className="mt-4 sm:mt-0 flex items-center space-x-3">
          {/* Time Period Selector */}
          <div className="flex bg-gray-100 rounded-lg p-1">
            {(['24h', '7d', '30d', '90d'] as TimePeriod[]).map((period) => (
              <button
                key={period}
                onClick={() => handlePeriodChange(period)}
                className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${
                  selectedPeriod === period
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {period === '24h' ? '24H' : period === '7d' ? '7D' : period === '30d' ? '30D' : '90D'}
              </button>
            ))}
          </div>

          {/* Refresh Button */}
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
          >
            <svg
              className={`-ml-1 mr-2 h-4 w-4 ${refreshing ? 'animate-spin' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            {refreshing ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>
      </div>

      {/* Overview Cards */}
      {overview && <OverviewCards overview={overview} />}

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Streaming Platforms */}
        <div className="lg:col-span-1">
          <StreamingPlatforms data={streamingData} loading={isLoading} />
        </div>

        {/* Revenue Chart */}
        <div className="lg:col-span-1">
          <RevenueChart data={revenueData} loading={isLoading} period={selectedPeriod} />
        </div>
      </div>

      {/* Geographic and Demographic Data */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <GeographicBreakdown data={geographicData} loading={isLoading} />
        <DemographicInsights data={demographicData} loading={isLoading} />
      </div>
    </div>
  );
};
