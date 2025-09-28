import React, { useState } from 'react';

interface Release {
  id: string;
  title: string;
  artist: string;
  releaseType: 'single' | 'ep' | 'album' | 'compilation';
  releaseDate: string;
  artwork: string;
  status: 'draft' | 'pending' | 'approved' | 'published' | 'rejected';
  tracks: number;
  streams: number;
  revenue: number;
  platforms: string[];
  genre: string;
  label: string;
  lastUpdated: string;
}

interface CatalogBrowserProps {
  releases: Release[];
  onSelectRelease: (releaseId: string) => void;
  onEditRelease: (releaseId: string) => void;
  onDeleteRelease: (releaseId: string) => void;
  onCreateRelease: () => void;
  loading?: boolean;
}

const CatalogBrowser: React.FC<CatalogBrowserProps> = ({
  releases,
  onSelectRelease,
  onEditRelease,
  onDeleteRelease,
  onCreateRelease,
  loading = false
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | Release['status']>('all');
  const [filterType, setFilterType] = useState<'all' | Release['releaseType']>('all');
  const [sortBy, setSortBy] = useState<'releaseDate' | 'title' | 'streams' | 'revenue' | 'lastUpdated'>('releaseDate');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const formatNumber = (value: number) => {
    if (value >= 1000000) {
      return `${(value / 1000000).toFixed(1)}M`;
    } else if (value >= 1000) {
      return `${(value / 1000).toFixed(1)}K`;
    }
    return value.toString();
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusColor = (status: Release['status']) => {
    switch (status) {
      case 'draft': return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'approved': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'published': return 'bg-green-100 text-green-800 border-green-200';
      case 'rejected': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: Release['status']) => {
    switch (status) {
      case 'draft': return '📝';
      case 'pending': return '⏳';
      case 'approved': return '✅';
      case 'published': return '🚀';
      case 'rejected': return '❌';
      default: return '❓';
    }
  };

  const getTypeIcon = (type: Release['releaseType']) => {
    switch (type) {
      case 'single': return '🎵';
      case 'ep': return '💿';
      case 'album': return '📀';
      case 'compilation': return '📚';
      default: return '🎶';
    }
  };

  const filteredAndSortedReleases = releases
    .filter(release => {
      const matchesSearch = release.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          release.artist.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          release.genre.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = filterStatus === 'all' || release.status === filterStatus;
      const matchesType = filterType === 'all' || release.releaseType === filterType;

      return matchesSearch && matchesStatus && matchesType;
    })
    .sort((a, b) => {
      let aValue: any = a[sortBy];
      let bValue: any = b[sortBy];

      if (sortBy === 'releaseDate' || sortBy === 'lastUpdated') {
        aValue = new Date(aValue);
        bValue = new Date(bValue);
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

  const renderGridView = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {filteredAndSortedReleases.map((release) => (
        <div
          key={release.id}
          className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-all cursor-pointer group"
          onClick={() => onSelectRelease(release.id)}
        >
          {/* Artwork */}
          <div className="aspect-square bg-gray-200 relative overflow-hidden">
            {release.artwork ? (
              <img
                src={release.artwork}
                alt={release.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-6xl text-gray-400">
                🎵
              </div>
            )}

            {/* Status Badge */}
            <div className="absolute top-3 left-3">
              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(release.status)}`}>
                {getStatusIcon(release.status)} {release.status}
              </span>
            </div>

            {/* Type Badge */}
            <div className="absolute top-3 right-3">
              <span className="bg-black bg-opacity-60 text-white text-xs font-medium px-2 py-1 rounded-full">
                {getTypeIcon(release.releaseType)} {release.releaseType.toUpperCase()}
              </span>
            </div>

            {/* Hover Actions */}
            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
              <div className="flex space-x-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onEditRelease(release.id);
                  }}
                  className="bg-white text-gray-800 p-2 rounded-full hover:bg-gray-100 transition-colors"
                >
                  ✏️
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteRelease(release.id);
                  }}
                  className="bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition-colors"
                >
                  🗑️
                </button>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-4">
            <h3 className="font-semibold text-gray-900 mb-1 truncate">{release.title}</h3>
            <p className="text-sm text-gray-600 mb-2 truncate">{release.artist}</p>

            <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
              <span>{release.tracks} track{release.tracks !== 1 ? 's' : ''}</span>
              <span>{formatDate(release.releaseDate)}</span>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="bg-blue-50 border border-blue-200 rounded p-2 text-center">
                <div className="font-medium text-blue-900">{formatNumber(release.streams)}</div>
                <div className="text-blue-600">Streams</div>
              </div>
              <div className="bg-green-50 border border-green-200 rounded p-2 text-center">
                <div className="font-medium text-green-900">{formatCurrency(release.revenue)}</div>
                <div className="text-green-600">Revenue</div>
              </div>
            </div>

            {/* Platforms */}
            <div className="mt-3 flex flex-wrap gap-1">
              {release.platforms.slice(0, 3).map((platform, index) => (
                <span
                  key={index}
                  className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded"
                >
                  {platform}
                </span>
              ))}
              {release.platforms.length > 3 && (
                <span className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded">
                  +{release.platforms.length - 3}
                </span>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  const renderListView = () => (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Release
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Type
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Release Date
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
            {filteredAndSortedReleases.map((release) => (
              <tr
                key={release.id}
                className="hover:bg-gray-50 cursor-pointer"
                onClick={() => onSelectRelease(release.id)}
              >
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="h-12 w-12 flex-shrink-0">
                      {release.artwork ? (
                        <img
                          className="h-12 w-12 rounded-lg object-cover"
                          src={release.artwork}
                          alt={release.title}
                        />
                      ) : (
                        <div className="h-12 w-12 rounded-lg bg-gray-200 flex items-center justify-center text-gray-400">
                          🎵
                        </div>
                      )}
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">{release.title}</div>
                      <div className="text-sm text-gray-500">{release.artist}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="inline-flex items-center text-sm text-gray-600">
                    {getTypeIcon(release.releaseType)} {release.releaseType}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(release.status)}`}>
                    {getStatusIcon(release.status)} {release.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {formatDate(release.releaseDate)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {formatNumber(release.streams)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {formatCurrency(release.revenue)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex space-x-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onEditRelease(release.id);
                      }}
                      className="text-indigo-600 hover:text-indigo-900"
                    >
                      Edit
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteRelease(release.id);
                      }}
                      className="text-red-600 hover:text-red-900"
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-6 text-white">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">Release Catalog</h2>
          <button
            onClick={onCreateRelease}
            className="bg-white text-blue-600 hover:bg-blue-50 font-medium py-2 px-4 rounded-lg transition-colors"
          >
            + New Release
          </button>
        </div>

        {/* Search and Filters */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="md:col-span-2">
            <input
              type="text"
              placeholder="Search releases, artists, genres..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-50"
            />
          </div>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as any)}
            className="px-3 py-2 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-50"
          >
            <option value="all">All Statuses</option>
            <option value="draft">Draft</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="published">Published</option>
            <option value="rejected">Rejected</option>
          </select>

          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value as any)}
            className="px-3 py-2 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-50"
          >
            <option value="all">All Types</option>
            <option value="single">Singles</option>
            <option value="ep">EPs</option>
            <option value="album">Albums</option>
            <option value="compilation">Compilations</option>
          </select>
        </div>
      </div>

      {/* Controls */}
      <div className="border-b border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600">Sort by:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="text-sm border border-gray-300 rounded px-2 py-1"
              >
                <option value="releaseDate">Release Date</option>
                <option value="title">Title</option>
                <option value="streams">Streams</option>
                <option value="revenue">Revenue</option>
                <option value="lastUpdated">Last Updated</option>
              </select>
              <button
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                className="text-gray-600 hover:text-gray-900"
              >
                {sortOrder === 'asc' ? '↑' : '↓'}
              </button>
            </div>

            <div className="text-sm text-gray-600">
              {filteredAndSortedReleases.length} of {releases.length} releases
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded ${viewMode === 'grid' ? 'bg-blue-100 text-blue-600' : 'text-gray-600 hover:text-gray-900'}`}
            >
              ⊞
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded ${viewMode === 'list' ? 'bg-blue-100 text-blue-600' : 'text-gray-600 hover:text-gray-900'}`}
            >
              ☰
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {loading ? (
          <div className="text-center py-12">
            <div className="text-4xl mb-4">🔄</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Loading Catalog...</h3>
            <p className="text-gray-600">Please wait while we fetch your releases.</p>
          </div>
        ) : filteredAndSortedReleases.length > 0 ? (
          viewMode === 'grid' ? renderGridView() : renderListView()
        ) : (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🎵</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {searchTerm || filterStatus !== 'all' || filterType !== 'all'
                ? 'No Matching Releases'
                : 'No Releases Yet'
              }
            </h3>
            <p className="text-gray-600 mb-4">
              {searchTerm || filterStatus !== 'all' || filterType !== 'all'
                ? 'Try adjusting your search or filters.'
                : 'Create your first release to get started.'
              }
            </p>
            {!searchTerm && filterStatus === 'all' && filterType === 'all' && (
              <button
                onClick={onCreateRelease}
                className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
              >
                Create First Release
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default CatalogBrowser;
