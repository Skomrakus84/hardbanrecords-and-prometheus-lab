import React from 'react';
import { Artist } from '../../types/artist';

interface ArtistCardProps {
  artist: Artist;
  onView: (artist: Artist) => void;
  onEdit: (artist: Artist) => void;
  onDelete: (artistId: string) => void;
}

export const ArtistCard: React.FC<ArtistCardProps> = ({
  artist,
  onView,
  onEdit,
  onDelete
}) => {
  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const getStatusColor = (status: Artist['status']) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'inactive':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getSocialIcon = (platform: string) => {
    const icons: { [key: string]: string } = {
      spotify: '🎵',
      instagram: '📷',
      youtube: '📺',
      twitter: '🐦',
      facebook: '👥',
      tiktok: '🎬'
    };
    return icons[platform] || '🔗';
  };

  return (
    <div className="bg-white overflow-hidden shadow rounded-lg hover:shadow-lg transition-shadow duration-300">
      {/* Header */}
      <div className="p-6">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            {artist.avatar ? (
              <img
                className="h-16 w-16 rounded-full object-cover"
                src={artist.avatar}
                alt={artist.name}
              />
            ) : (
              <div className="h-16 w-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                <span className="text-white font-bold text-xl">
                  {artist.name.charAt(0).toUpperCase()}
                </span>
              </div>
            )}
          </div>
          <div className="ml-4 flex-1">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-900 truncate">
                {artist.name}
              </h3>
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(artist.status)}`}>
                {artist.status}
              </span>
            </div>
            <p className="text-sm text-gray-500 truncate">{artist.email}</p>
            {artist.genre && (
              <p className="text-sm text-gray-400">{artist.genre}</p>
            )}
            {artist.location && (
              <p className="text-xs text-gray-400 flex items-center mt-1">
                📍 {artist.location}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="px-6 py-4 bg-gray-50">
        <dl className="grid grid-cols-2 gap-4">
          <div>
            <dt className="text-sm font-medium text-gray-500">Total Streams</dt>
            <dd className="text-lg font-semibold text-gray-900">
              {formatNumber(artist.totalStreams)}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Revenue</dt>
            <dd className="text-lg font-semibold text-gray-900">
              {formatCurrency(artist.totalRevenue)}
            </dd>
          </div>
        </dl>
      </div>

      {/* Social Media Links */}
      {Object.keys(artist.socialMedia).length > 0 && (
        <div className="px-6 py-3 border-t border-gray-200">
          <div className="flex flex-wrap gap-2">
            {Object.entries(artist.socialMedia)
              .filter(([, url]) => url)
              .map(([platform, url]) => (
                <a
                  key={platform}
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center text-sm text-gray-600 hover:text-blue-600 transition-colors"
                  title={`${platform} profile`}
                >
                  <span className="mr-1">{getSocialIcon(platform)}</span>
                  {platform}
                </a>
              ))}
          </div>
        </div>
      )}

      {/* Bio Preview */}
      {artist.bio && (
        <div className="px-6 py-3 border-t border-gray-200">
          <p className="text-sm text-gray-600 line-clamp-2">
            {artist.bio}
          </p>
        </div>
      )}

      {/* Actions */}
      <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
        <div className="flex justify-between">
          <button
            onClick={() => onView(artist)}
            className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            👁️ View
          </button>

          <div className="flex space-x-2">
            <button
              onClick={() => onEdit(artist)}
              className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              ✏️ Edit
            </button>

            <button
              onClick={() => onDelete(artist.id)}
              className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            >
              🗑️ Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
