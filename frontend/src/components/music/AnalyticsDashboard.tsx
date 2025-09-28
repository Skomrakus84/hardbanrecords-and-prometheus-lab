import React, { useState, useEffect } from 'react';
import { useAnalytics } from '../../hooks/useMusic';
import { useAuthStore } from '../../store/authStore';

const getPeriodStartDate = (period: string): string => {
  const now = new Date();
  const startDate = new Date();
  
  switch (period) {
    case '7d':
      startDate.setDate(now.getDate() - 7);
      break;
    case '30d':
      startDate.setDate(now.getDate() - 30);
      break;
    case '90d':
      startDate.setDate(now.getDate() - 90);
      break;
    case '365d':
      startDate.setFullYear(now.getFullYear() - 1);
      break;
    default:
      startDate.setDate(now.getDate() - 30);
  }
  
  return startDate.toISOString().split('T')[0];
};

interface AnalyticsDashboardProps {
  period?: string;
}

export const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({
  period = '30d'
}) => {
  const { user } = useAuthStore();
  const {
    overview,
    streams,
    geographic,
    topTracks,
    topReleases,
    loading,
    error,
    fetchOverview,
    fetchStreams,
    fetchGeographic,
    fetchTopContent,
    clearError
  } = useAnalytics();

  const [selectedPeriod, setSelectedPeriod] = useState(period);

  useEffect(() => {
    if (user) {
      fetchOverview(selectedPeriod);
      fetchStreams({ date_from: getPeriodStartDate(selectedPeriod) });
      fetchGeographic({ date_from: getPeriodStartDate(selectedPeriod) });
      fetchTopContent(10);
    }
  }, [user, selectedPeriod, fetchOverview, fetchStreams, fetchGeographic, fetchTopContent]);

  if (!user) {
    return <div>Please log in to view analytics.</div>;
  }

  const handlePeriodChange = (newPeriod: string) => {
    setSelectedPeriod(newPeriod);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Analytics Dashboard</h2>
        <select
          value={selectedPeriod}
          onChange={(e) => handlePeriodChange(e.target.value)}
          className="border rounded px-3 py-2"
        >
          <option value="7d">Last 7 days</option>
          <option value="30d">Last 30 days</option>
          <option value="90d">Last 90 days</option>
          <option value="1y">Last year</option>
        </select>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
          <button onClick={clearError} className="ml-2 text-red-900">×</button>
        </div>
      )}

      {loading ? (
        <div className="text-center py-8">Loading analytics...</div>
      ) : (
        <div className="space-y-6">
          {/* Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-6 rounded shadow">
              <h3 className="text-sm font-medium text-gray-500">Total Streams</h3>
              <p className="text-2xl font-bold text-gray-900">
                {overview.total_streams?.toLocaleString() || '0'}
              </p>
              <p className="text-sm text-green-600">
                +{overview.streams_growth || '0'}% from last period
              </p>
            </div>
            
            <div className="bg-white p-6 rounded shadow">
              <h3 className="text-sm font-medium text-gray-500">Revenue</h3>
              <p className="text-2xl font-bold text-gray-900">
                ${overview.total_revenue?.toFixed(2) || '0.00'}
              </p>
              <p className="text-sm text-green-600">
                +{overview.revenue_growth || '0'}% from last period
              </p>
            </div>
            
            <div className="bg-white p-6 rounded shadow">
              <h3 className="text-sm font-medium text-gray-500">Listeners</h3>
              <p className="text-2xl font-bold text-gray-900">
                {overview.unique_listeners?.toLocaleString() || '0'}
              </p>
              <p className="text-sm text-green-600">
                +{overview.listeners_growth || '0'}% from last period
              </p>
            </div>
            
            <div className="bg-white p-6 rounded shadow">
              <h3 className="text-sm font-medium text-gray-500">Countries</h3>
              <p className="text-2xl font-bold text-gray-900">
                {Object.keys(geographic).length}
              </p>
              <p className="text-sm text-gray-600">
                Active markets
              </p>
            </div>
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Geographic Distribution */}
            <div className="bg-white p-6 rounded shadow">
              <h3 className="text-lg font-semibold mb-4">Top Countries</h3>
              <div className="space-y-3">
                {Object.entries(geographic)
                  .sort(([, a], [, b]) => (b as number) - (a as number))
                  .slice(0, 10)
                  .map(([country, streams]) => (
                    <div key={country} className="flex justify-between items-center">
                      <span className="text-sm font-medium">{country}</span>
                      <div className="flex items-center space-x-2">
                        <div 
                          className="bg-blue-200 h-2 rounded"
                          style={{ 
                            width: `${((streams as number) / Math.max(...Object.values(geographic) as number[])) * 100}px` 
                          }}
                        />
                        <span className="text-sm text-gray-600">
                          {(streams as number).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  ))}
              </div>
            </div>

            {/* Streams Timeline */}
            <div className="bg-white p-6 rounded shadow">
              <h3 className="text-lg font-semibold mb-4">Streams Over Time</h3>
              {streams.length > 0 ? (
                <div className="h-48 flex items-end space-x-1">
                  {streams.slice(-30).map((stream: any, index) => (
                    <div
                      key={index}
                      className="bg-blue-500 min-w-[8px] rounded-t"
                      style={{
                        height: `${(stream.metric_value / Math.max(...streams.map((s: any) => s.metric_value))) * 100}%`
                      }}
                      title={`${stream.metric_value} streams on ${new Date(stream.timestamp).toLocaleDateString()}`}
                    />
                  ))}
                </div>
              ) : (
                <div className="h-48 flex items-center justify-center text-gray-500">
                  No streaming data available
                </div>
              )}
            </div>
          </div>

          {/* Top Content */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Top Tracks */}
            <div className="bg-white p-6 rounded shadow">
              <h3 className="text-lg font-semibold mb-4">Top Tracks</h3>
              <div className="space-y-3">
                {topTracks.length > 0 ? (
                  topTracks.map((track, index) => (
                    <div key={track.id} className="flex items-center space-x-3">
                      <span className="text-lg font-bold text-gray-400 w-6">
                        {index + 1}
                      </span>
                      <div className="flex-1">
                        <p className="font-medium">{track.title}</p>
                        <p className="text-sm text-gray-600">
                          Duration: {Math.floor((track.duration || 0) / 60)}:
                          {String((track.duration || 0) % 60).padStart(2, '0')}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500">No track data available</p>
                )}
              </div>
            </div>

            {/* Top Releases */}
            <div className="bg-white p-6 rounded shadow">
              <h3 className="text-lg font-semibold mb-4">Top Releases</h3>
              <div className="space-y-3">
                {topReleases.length > 0 ? (
                  topReleases.map((release, index) => (
                    <div key={release.id} className="flex items-center space-x-3">
                      <span className="text-lg font-bold text-gray-400 w-6">
                        {index + 1}
                      </span>
                      <div className="flex-1">
                        <p className="font-medium">{release.title}</p>
                        <p className="text-sm text-gray-600">
                          by {release.artist_name} • {release.release_type}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500">No release data available</p>
                )}
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white p-6 rounded shadow">
            <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
            <div className="space-y-2">
              {streams.slice(-10).reverse().map((stream: any, index) => (
                <div key={index} className="flex justify-between items-center py-2 border-b last:border-b-0">
                  <div>
                    <p className="text-sm font-medium">
                      {stream.metric_value} {stream.metric_type}
                    </p>
                    <p className="text-xs text-gray-600">
                      {new Date(stream.timestamp).toLocaleString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-600">
                      {stream.dimensions?.country || 'Unknown'}
                    </p>
                  </div>
                </div>
              ))}
              {streams.length === 0 && (
                <p className="text-gray-500">No recent activity</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
