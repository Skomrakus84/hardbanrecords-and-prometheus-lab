import React from 'react';

interface DistributionPlatform {
  id: string;
  name: string;
  icon: string;
  status: 'pending' | 'processing' | 'live' | 'failed' | 'rejected';
  submittedAt?: string;
  liveAt?: string;
  stores: string[];
  message?: string;
}

interface DistributionStatusTrackerProps {
  releaseTitle: string;
  platforms: DistributionPlatform[];
  onRetry?: (platformId: string) => void;
  onViewDetails?: (platformId: string) => void;
}

const DistributionStatusTracker: React.FC<DistributionStatusTrackerProps> = ({
  releaseTitle,
  platforms,
  onRetry,
  onViewDetails
}) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'processing': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'live': return 'bg-green-100 text-green-800 border-green-200';
      case 'failed': return 'bg-red-100 text-red-800 border-red-200';
      case 'rejected': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return '⏳';
      case 'processing': return '🔄';
      case 'live': return '✅';
      case 'failed': return '❌';
      case 'rejected': return '🚫';
      default: return '❓';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'Pending Review';
      case 'processing': return 'Processing';
      case 'live': return 'Live';
      case 'failed': return 'Failed';
      case 'rejected': return 'Rejected';
      default: return 'Unknown';
    }
  };

  const getProgressWidth = (status: string) => {
    switch (status) {
      case 'pending': return '25%';
      case 'processing': return '75%';
      case 'live': return '100%';
      case 'failed': case 'rejected': return '0%';
      default: return '0%';
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const overallStats = {
    total: platforms.length,
    live: platforms.filter(p => p.status === 'live').length,
    processing: platforms.filter(p => p.status === 'processing').length,
    failed: platforms.filter(p => p.status === 'failed' || p.status === 'rejected').length
  };

  const overallProgress = platforms.length > 0 ? (overallStats.live / platforms.length) * 100 : 0;

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-6 text-white">
        <h2 className="text-xl font-bold mb-2">Distribution Status</h2>
        <p className="text-blue-100 mb-4">{releaseTitle}</p>

        {/* Overall Progress */}
        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span>Overall Progress</span>
            <span>{Math.round(overallProgress)}% Complete</span>
          </div>
          <div className="w-full bg-blue-400 bg-opacity-30 rounded-full h-2">
            <div
              className="bg-white h-2 rounded-full transition-all duration-500"
              style={{ width: `${overallProgress}%` }}
            />
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-4 gap-4 mt-4">
            <div className="text-center">
              <div className="text-lg font-bold">{overallStats.total}</div>
              <div className="text-xs text-blue-200">Total</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-green-300">{overallStats.live}</div>
              <div className="text-xs text-blue-200">Live</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-yellow-300">{overallStats.processing}</div>
              <div className="text-xs text-blue-200">Processing</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-red-300">{overallStats.failed}</div>
              <div className="text-xs text-blue-200">Failed</div>
            </div>
          </div>
        </div>
      </div>

      {/* Platform List */}
      <div className="p-6">
        <div className="space-y-4">
          {platforms.map((platform) => (
            <div
              key={platform.id}
              className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-all"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-4 flex-1">
                  {/* Platform Icon */}
                  <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center text-2xl">
                    {platform.icon}
                  </div>

                  <div className="flex-1 min-w-0">
                    {/* Platform Name & Status */}
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="font-semibold text-gray-900">{platform.name}</h3>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(platform.status)}`}>
                        <span className="mr-1">{getStatusIcon(platform.status)}</span>
                        {getStatusText(platform.status)}
                      </span>
                    </div>

                    {/* Progress Bar */}
                    <div className="mb-3">
                      <div className="w-full bg-gray-200 rounded-full h-1.5">
                        <div
                          className={`h-1.5 rounded-full transition-all duration-500 ${
                            platform.status === 'live' ? 'bg-green-500' :
                            platform.status === 'processing' ? 'bg-blue-500' :
                            platform.status === 'pending' ? 'bg-yellow-500' :
                            'bg-red-500'
                          }`}
                          style={{ width: getProgressWidth(platform.status) }}
                        />
                      </div>
                    </div>

                    {/* Dates */}
                    <div className="flex items-center space-x-6 text-sm text-gray-600 mb-2">
                      {platform.submittedAt && (
                        <div>
                          <span className="font-medium">Submitted:</span>
                          <span className="ml-1">{formatDate(platform.submittedAt)}</span>
                        </div>
                      )}
                      {platform.liveAt && (
                        <div>
                          <span className="font-medium">Live:</span>
                          <span className="ml-1">{formatDate(platform.liveAt)}</span>
                        </div>
                      )}
                    </div>

                    {/* Stores */}
                    <div className="flex flex-wrap gap-1 mb-2">
                      {platform.stores.map((store, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-700"
                        >
                          {store}
                        </span>
                      ))}
                    </div>

                    {/* Message */}
                    {platform.message && (
                      <div className={`text-sm p-2 rounded-md ${
                        platform.status === 'failed' || platform.status === 'rejected'
                          ? 'bg-red-50 text-red-700'
                          : 'bg-blue-50 text-blue-700'
                      }`}>
                        {platform.message}
                      </div>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col space-y-2 ml-4">
                  {(platform.status === 'failed' || platform.status === 'rejected') && onRetry && (
                    <button
                      onClick={() => onRetry(platform.id)}
                      className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium py-1 px-3 rounded-md transition-colors"
                    >
                      Retry
                    </button>
                  )}

                  {onViewDetails && (
                    <button
                      onClick={() => onViewDetails(platform.id)}
                      className="bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-medium py-1 px-3 rounded-md transition-colors"
                    >
                      Details
                    </button>
                  )}

                  {platform.status === 'live' && (
                    <a
                      href="#"
                      className="bg-green-100 hover:bg-green-200 text-green-700 text-xs font-medium py-1 px-3 rounded-md transition-colors text-center"
                    >
                      View Live
                    </a>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {platforms.length === 0 && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📡</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Distribution Platforms</h3>
            <p className="text-gray-600 mb-4">
              This release hasn't been distributed to any platforms yet.
            </p>
            <button className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors">
              Start Distribution
            </button>
          </div>
        )}
      </div>

      {/* Legend */}
      <div className="border-t border-gray-200 p-4 bg-gray-50">
        <h4 className="text-sm font-medium text-gray-900 mb-3">Status Legend</h4>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
          <div className="flex items-center space-x-2">
            <span>⏳</span>
            <span className="text-gray-600">Pending Review</span>
          </div>
          <div className="flex items-center space-x-2">
            <span>🔄</span>
            <span className="text-gray-600">Processing</span>
          </div>
          <div className="flex items-center space-x-2">
            <span>✅</span>
            <span className="text-gray-600">Live</span>
          </div>
          <div className="flex items-center space-x-2">
            <span>❌</span>
            <span className="text-gray-600">Failed</span>
          </div>
          <div className="flex items-center space-x-2">
            <span>🚫</span>
            <span className="text-gray-600">Rejected</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DistributionStatusTracker;
