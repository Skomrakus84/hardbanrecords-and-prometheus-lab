import React, { useState, useEffect } from 'react';

interface RoyaltyStatement {
  id: string;
  period: string;
  platform: string;
  totalStreams: number;
  grossRevenue: number;
  platformFee: number;
  netRevenue: number;
  status: 'pending' | 'paid' | 'processing';
  paymentDate?: string;
  releaseBreakdown: Array<{
    releaseTitle: string;
    artist: string;
    streams: number;
    revenue: number;
  }>;
}

const RoyaltiesPage: React.FC = () => {
  const [statements, setStatements] = useState<RoyaltyStatement[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedStatement, setSelectedStatement] = useState<RoyaltyStatement | null>(null);

  useEffect(() => {
    // Mock data - replace with actual API call
    Promise.resolve().then(() => {
      setStatements([
        {
          id: '1',
          period: '2024-06',
          platform: 'Spotify',
          totalStreams: 45200,
          grossRevenue: 180.80,
          platformFee: 54.24,
          netRevenue: 126.56,
          status: 'paid',
          paymentDate: '2024-07-15',
          releaseBreakdown: [
            { releaseTitle: 'Summer Vibes', artist: 'The Wave Riders', streams: 25400, revenue: 71.20 },
            { releaseTitle: 'Midnight Dreams', artist: 'Luna Echo', streams: 19800, revenue: 55.36 }
          ]
        },
        {
          id: '2',
          period: '2024-06',
          platform: 'Apple Music',
          totalStreams: 32100,
          grossRevenue: 160.50,
          platformFee: 48.15,
          netRevenue: 112.35,
          status: 'processing',
          releaseBreakdown: [
            { releaseTitle: 'Summer Vibes', artist: 'The Wave Riders', streams: 18900, revenue: 94.25 },
            { releaseTitle: 'Urban Flow', artist: 'Street Beats', streams: 13200, revenue: 66.25 }
          ]
        },
        {
          id: '3',
          period: '2024-07',
          platform: 'Spotify',
          totalStreams: 52800,
          grossRevenue: 211.20,
          platformFee: 63.36,
          netRevenue: 147.84,
          status: 'pending',
          releaseBreakdown: [
            { releaseTitle: 'Summer Vibes', artist: 'The Wave Riders', streams: 28900, revenue: 81.15 },
            { releaseTitle: 'Midnight Dreams', artist: 'Luna Echo', streams: 23900, revenue: 67.09 }
          ]
        }
      ]);
      setIsLoading(false);
    });
  }, []);

  const getStatusBadge = (status: RoyaltyStatement['status']) => {
    const statusConfig = {
      pending: { color: 'bg-yellow-100 text-yellow-800', label: 'Pending' },
      processing: { color: 'bg-blue-100 text-blue-800', label: 'Processing' },
      paid: { color: 'bg-green-100 text-green-800', label: 'Paid' }
    };

    const config = statusConfig[status];
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
        {config.label}
      </span>
    );
  };

  const totalPendingRevenue = statements
    .filter(s => s.status === 'pending')
    .reduce((sum, s) => sum + s.netRevenue, 0);

  const totalPaidRevenue = statements
    .filter(s => s.status === 'paid')
    .reduce((sum, s) => sum + s.netRevenue, 0);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="royalties-page">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Royalties</h2>
        <p className="text-gray-600">Track and manage your royalty payments from streaming platforms</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-green-500 rounded-md flex items-center justify-center">
                  <span className="text-white font-bold">✓</span>
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Total Paid</dt>
                  <dd className="text-lg font-medium text-gray-900">${totalPaidRevenue.toFixed(2)}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-yellow-500 rounded-md flex items-center justify-center">
                  <span className="text-white font-bold">⏳</span>
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Pending Revenue</dt>
                  <dd className="text-lg font-medium text-gray-900">${totalPendingRevenue.toFixed(2)}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-blue-500 rounded-md flex items-center justify-center">
                  <span className="text-white font-bold">📊</span>
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Total Statements</dt>
                  <dd className="text-lg font-medium text-gray-900">{statements.length}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Royalty Statements Table */}
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Royalty Statements</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Period / Platform
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Streams
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Gross Revenue
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Net Revenue
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {statements.map((statement) => (
                  <tr key={statement.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{statement.period}</div>
                        <div className="text-sm text-gray-500">{statement.platform}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {statement.totalStreams.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      ${statement.grossRevenue.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      ${statement.netRevenue.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(statement.status)}
                      {statement.paymentDate && (
                        <div className="text-xs text-gray-500 mt-1">
                          Paid: {new Date(statement.paymentDate).toLocaleDateString()}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <button
                        onClick={() => setSelectedStatement(statement)}
                        className="text-indigo-600 hover:text-indigo-900"
                      >
                        View Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Statement Details Modal */}
      {selectedStatement && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-2/3 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">
                  Royalty Statement - {selectedStatement.period} ({selectedStatement.platform})
                </h3>
                <button
                  onClick={() => setSelectedStatement(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Total Streams</label>
                    <div className="text-lg font-semibold">{selectedStatement.totalStreams.toLocaleString()}</div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Gross Revenue</label>
                    <div className="text-lg font-semibold">${selectedStatement.grossRevenue.toFixed(2)}</div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Platform Fee</label>
                    <div className="text-lg">${selectedStatement.platformFee.toFixed(2)}</div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Net Revenue</label>
                    <div className="text-lg font-semibold text-green-600">${selectedStatement.netRevenue.toFixed(2)}</div>
                  </div>
                </div>

                <div>
                  <h4 className="text-md font-medium text-gray-900 mb-2">Release Breakdown</h4>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Release</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Artist</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Streams</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Revenue</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {selectedStatement.releaseBreakdown.map((release, index) => (
                          <tr key={index}>
                            <td className="px-4 py-2 text-sm text-gray-900">{release.releaseTitle}</td>
                            <td className="px-4 py-2 text-sm text-gray-500">{release.artist}</td>
                            <td className="px-4 py-2 text-sm text-gray-900">{release.streams.toLocaleString()}</td>
                            <td className="px-4 py-2 text-sm font-medium text-gray-900">${release.revenue.toFixed(2)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RoyaltiesPage;
