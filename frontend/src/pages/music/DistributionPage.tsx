import React, { useState, useEffect } from 'react';

interface DistributionChannel {
  id: string;
  name: string;
  status: 'active' | 'inactive' | 'pending';
  totalReleases: number;
  totalStreams: number;
  revenue: number;
  lastSync: string;
  logo?: string;
}

interface ReleaseDistribution {
  releaseId: string;
  releaseTitle: string;
  artist: string;
  channels: Array<{
    channelName: string;
    status: 'live' | 'pending' | 'rejected' | 'processing';
    liveDate?: string;
    streams?: number;
    revenue?: number;
  }>;
}

const DistributionPage: React.FC = () => {
  const [channels, setChannels] = useState<DistributionChannel[]>([]);
  const [distributions, setDistributions] = useState<ReleaseDistribution[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'channels' | 'releases'>('channels');

  useEffect(() => {
    // Mock data - replace with actual API call
    Promise.resolve().then(() => {
      setChannels([
        {
          id: '1',
          name: 'Spotify',
          status: 'active',
          totalReleases: 15,
          totalStreams: 68500,
          revenue: 274.25,
          lastSync: '2024-07-01T10:30:00Z'
        },
        {
          id: '2',
          name: 'Apple Music',
          status: 'active',
          totalReleases: 12,
          totalStreams: 45200,
          revenue: 226.15,
          lastSync: '2024-07-01T09:15:00Z'
        },
        {
          id: '3',
          name: 'YouTube Music',
          status: 'active',
          totalReleases: 10,
          totalStreams: 25300,
          revenue: 89.75,
          lastSync: '2024-07-01T08:45:00Z'
        },
        {
          id: '4',
          name: 'Amazon Music',
          status: 'pending',
          totalReleases: 8,
          totalStreams: 12400,
          revenue: 55.20,
          lastSync: '2024-06-30T14:20:00Z'
        },
        {
          id: '5',
          name: 'Tidal',
          status: 'inactive',
          totalReleases: 0,
          totalStreams: 0,
          revenue: 0,
          lastSync: '2024-06-25T16:00:00Z'
        }
      ]);

      setDistributions([
        {
          releaseId: '1',
          releaseTitle: 'Summer Vibes',
          artist: 'The Wave Riders',
          channels: [
            { channelName: 'Spotify', status: 'live', liveDate: '2024-06-15', streams: 25400, revenue: 71.20 },
            { channelName: 'Apple Music', status: 'live', liveDate: '2024-06-15', streams: 18900, revenue: 94.25 },
            { channelName: 'YouTube Music', status: 'live', liveDate: '2024-06-16', streams: 12100, revenue: 42.35 },
            { channelName: 'Amazon Music', status: 'pending' },
            { channelName: 'Tidal', status: 'rejected' }
          ]
        },
        {
          releaseId: '2',
          releaseTitle: 'Midnight Dreams',
          artist: 'Luna Echo',
          channels: [
            { channelName: 'Spotify', status: 'live', liveDate: '2024-05-20', streams: 19800, revenue: 55.36 },
            { channelName: 'Apple Music', status: 'live', liveDate: '2024-05-20', streams: 15200, revenue: 76.00 },
            { channelName: 'YouTube Music', status: 'processing' },
            { channelName: 'Amazon Music', status: 'live', liveDate: '2024-05-22', streams: 8900, revenue: 39.15 }
          ]
        },
        {
          releaseId: '3',
          releaseTitle: 'Urban Flow',
          artist: 'Street Beats',
          channels: [
            { channelName: 'Spotify', status: 'processing' },
            { channelName: 'Apple Music', status: 'pending' },
            { channelName: 'YouTube Music', status: 'pending' },
            { channelName: 'Amazon Music', status: 'pending' }
          ]
        }
      ]);

      setIsLoading(false);
    });
  }, []);

  const getChannelStatusBadge = (status: DistributionChannel['status']) => {
    const statusConfig = {
      active: { color: 'bg-green-100 text-green-800', label: 'Active' },
      inactive: { color: 'bg-gray-100 text-gray-800', label: 'Inactive' },
      pending: { color: 'bg-yellow-100 text-yellow-800', label: 'Pending' }
    };

    const config = statusConfig[status];
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
        {config.label}
      </span>
    );
  };

  const getReleaseStatusBadge = (status: string) => {
    const statusConfig = {
      live: { color: 'bg-green-100 text-green-800', label: 'Live' },
      pending: { color: 'bg-yellow-100 text-yellow-800', label: 'Pending' },
      rejected: { color: 'bg-red-100 text-red-800', label: 'Rejected' },
      processing: { color: 'bg-blue-100 text-blue-800', label: 'Processing' }
    };

    const config = statusConfig[status as keyof typeof statusConfig];
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
        {config.label}
      </span>
    );
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="distribution-page">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Distribution</h2>
        <p className="text-gray-600">Manage your distribution channels and track release status</p>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('channels')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'channels'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Distribution Channels
          </button>
          <button
            onClick={() => setActiveTab('releases')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'releases'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Release Distribution
          </button>
        </nav>
      </div>

      {activeTab === 'channels' && (
        <div>
          {/* Channels Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {channels.map((channel) => (
              <div key={channel.id} className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-lg font-medium text-gray-900">{channel.name}</h3>
                    {getChannelStatusBadge(channel.status)}
                  </div>
                  
                  <div className="space-y-2 text-sm text-gray-600">
                    <div className="flex justify-between">
                      <span>Total Releases:</span>
                      <span className="font-medium">{channel.totalReleases}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Total Streams:</span>
                      <span className="font-medium">{channel.totalStreams.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Revenue:</span>
                      <span className="font-medium">${channel.revenue.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Last Sync:</span>
                      <span className="font-medium">
                        {new Date(channel.lastSync).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  <div className="mt-4 flex space-x-2">
                    <button className="flex-1 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 px-3 py-2 rounded text-sm font-medium">
                      Configure
                    </button>
                    <button className="flex-1 bg-gray-50 text-gray-700 hover:bg-gray-100 px-3 py-2 rounded text-sm font-medium">
                      Sync Now
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'releases' && (
        <div>
          {/* Releases Distribution */}
          <div className="space-y-6">
            {distributions.map((distribution) => (
              <div key={distribution.releaseId} className="bg-white shadow rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                  <div className="mb-4">
                    <h3 className="text-lg font-medium text-gray-900">{distribution.releaseTitle}</h3>
                    <p className="text-sm text-gray-500">by {distribution.artist}</p>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Platform
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Status
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Live Date
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Streams
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Revenue
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {distribution.channels.map((channel, index) => (
                          <tr key={index}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              {channel.channelName}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              {getReleaseStatusBadge(channel.status)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {channel.liveDate ? new Date(channel.liveDate).toLocaleDateString() : '-'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {channel.streams ? channel.streams.toLocaleString() : '-'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {channel.revenue ? `$${channel.revenue.toFixed(2)}` : '-'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {channel.status === 'rejected' ? (
                                <button className="text-red-600 hover:text-red-900">Retry</button>
                              ) : channel.status === 'pending' ? (
                                <button className="text-blue-600 hover:text-blue-900">Check Status</button>
                              ) : (
                                <button className="text-indigo-600 hover:text-indigo-900">View</button>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default DistributionPage;
