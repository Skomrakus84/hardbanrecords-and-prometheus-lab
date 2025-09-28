import React, { useState, useMemo } from 'react';
import { Artist } from '../../types/artist';
import { ArtistCard } from './ArtistCard';

interface ArtistsListProps {
  artists: Artist[];
  isLoading: boolean;
  onView: (artist: Artist) => void;
  onEdit: (artist: Artist) => void;
  onDelete: (artistId: string) => void;
}

export const ArtistsList: React.FC<ArtistsListProps> = ({
  artists,
  isLoading,
  onView,
  onEdit,
  onDelete
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<Artist['status'] | 'all'>('all');
  const [genreFilter, setGenreFilter] = useState('all');
  const [sortBy, setSortBy] = useState<'name' | 'streams' | 'revenue' | 'joined'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  // Get unique genres for filter
  const uniqueGenres = useMemo(() => {
    const genres = artists
      .map(artist => artist.genre)
      .filter(Boolean)
      .filter((genre, index, arr) => arr.indexOf(genre) === index);
    return genres.sort();
  }, [artists]);

  // Filter and sort artists
  const filteredAndSortedArtists = useMemo(() => {
    const filtered = artists.filter(artist => {
      const matchesSearch = artist.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           artist.email.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'all' || artist.status === statusFilter;
      const matchesGenre = genreFilter === 'all' || artist.genre === genreFilter;

      return matchesSearch && matchesStatus && matchesGenre;
    });

    // Sort
    filtered.sort((a, b) => {
      let aValue, bValue;

      switch (sortBy) {
        case 'name':
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
          break;
        case 'streams':
          aValue = a.totalStreams;
          bValue = b.totalStreams;
          break;
        case 'revenue':
          aValue = a.totalRevenue;
          bValue = b.totalRevenue;
          break;
        case 'joined':
          aValue = new Date(a.joinedAt).getTime();
          bValue = new Date(b.joinedAt).getTime();
          break;
        default:
          return 0;
      }

      if (typeof aValue === 'string') {
        return sortOrder === 'asc'
          ? aValue.localeCompare(bValue as string)
          : (bValue as string).localeCompare(aValue);
      } else {
        return sortOrder === 'asc'
          ? (aValue as number) - (bValue as number)
          : (bValue as number) - (aValue as number);
      }
    });

    return filtered;
  }, [artists, searchTerm, statusFilter, genreFilter, sortBy, sortOrder]);

  const handleSortChange = (newSortBy: typeof sortBy) => {
    if (sortBy === newSortBy) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(newSortBy);
      setSortOrder('asc');
    }
  };

  const getSortIcon = (field: typeof sortBy) => {
    if (sortBy !== field) return '↕️';
    return sortOrder === 'asc' ? '⬆️' : '⬇️';
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        {/* Loading skeleton */}
        {[...Array(6)].map((_, index) => (
          <div key={index} className="bg-white shadow rounded-lg p-6 animate-pulse">
            <div className="flex items-center space-x-4">
              <div className="h-16 w-16 bg-gray-200 rounded-full"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/3"></div>
                <div className="h-3 bg-gray-200 rounded w-1/5"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filters and Search */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {/* Search */}
          <div className="lg:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Search Artists
            </label>
            <div className="relative">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="Search by name or email..."
              />
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span className="text-gray-400">🔍</span>
              </div>
            </div>
          </div>

          {/* Status Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as Artist['status'] | 'all')}
              className="block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="pending">Pending</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>

          {/* Genre Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Genre
            </label>
            <select
              value={genreFilter}
              onChange={(e) => setGenreFilter(e.target.value)}
              className="block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            >
              <option value="all">All Genres</option>
              {uniqueGenres.map(genre => (
                <option key={genre} value={genre}>{genre}</option>
              ))}
            </select>
          </div>

          {/* Sort */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Sort By
            </label>
            <select
              value={`${sortBy}-${sortOrder}`}
              onChange={(e) => {
                const [field, order] = e.target.value.split('-');
                setSortBy(field as typeof sortBy);
                setSortOrder(order as 'asc' | 'desc');
              }}
              className="block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            >
              <option value="name-asc">Name A-Z</option>
              <option value="name-desc">Name Z-A</option>
              <option value="streams-desc">Most Streams</option>
              <option value="streams-asc">Least Streams</option>
              <option value="revenue-desc">Highest Revenue</option>
              <option value="revenue-asc">Lowest Revenue</option>
              <option value="joined-desc">Newest</option>
              <option value="joined-asc">Oldest</option>
            </select>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="flex flex-wrap gap-4 text-sm text-gray-600">
            <span>
              <strong>{filteredAndSortedArtists.length}</strong> of <strong>{artists.length}</strong> artists
            </span>
            <span>
              <strong>{artists.filter(a => a.status === 'active').length}</strong> active
            </span>
            <span>
              <strong>{artists.filter(a => a.status === 'pending').length}</strong> pending
            </span>
          </div>
        </div>
      </div>

      {/* Sort Header */}
      <div className="bg-white shadow rounded-lg p-4">
        <div className="flex flex-wrap gap-2">
          <span className="text-sm text-gray-500">Sort by:</span>
          {(['name', 'streams', 'revenue', 'joined'] as const).map(field => (
            <button
              key={field}
              onClick={() => handleSortChange(field)}
              className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                sortBy === field
                  ? 'bg-blue-100 text-blue-800'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {field.charAt(0).toUpperCase() + field.slice(1)} {getSortIcon(field)}
            </button>
          ))}
        </div>
      </div>

      {/* Artists Grid */}
      {filteredAndSortedArtists.length === 0 ? (
        <div className="bg-white shadow rounded-lg p-12 text-center">
          <div className="text-gray-400 text-6xl mb-4">🎵</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {searchTerm || statusFilter !== 'all' || genreFilter !== 'all'
              ? 'No artists match your filters'
              : 'No artists yet'
            }
          </h3>
          <p className="text-gray-500 mb-4">
            {searchTerm || statusFilter !== 'all' || genreFilter !== 'all'
              ? 'Try adjusting your search criteria or filters.'
              : 'Get started by adding your first artist.'
            }
          </p>
          {(!searchTerm && statusFilter === 'all' && genreFilter === 'all') && (
            <button className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors">
              Add Artist
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredAndSortedArtists.map(artist => (
            <ArtistCard
              key={artist.id}
              artist={artist}
              onView={onView}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
};
