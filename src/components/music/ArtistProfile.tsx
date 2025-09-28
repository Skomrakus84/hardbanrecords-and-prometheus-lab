import React, { useState } from 'react';
import { Artist, Contract } from '../../types/artist';

interface ArtistProfileProps {
  artist: Artist;
  onEdit: (artist: Artist) => void;
  onEditContract: (contract: Contract) => void;
  onAddContract: () => void;
  onBack: () => void;
  onClose?: () => void;
}

export const ArtistProfile: React.FC<ArtistProfileProps> = ({
  artist,
  onEdit,
  onEditContract,
  onAddContract,
  onBack,
  onClose
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'contracts' | 'releases' | 'analytics'>('overview');

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('pl-PL', {
      style: 'currency',
      currency: 'PLN',
      minimumFractionDigits: 2
    }).format(amount);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('pl-PL').format(num);
  };

  const getStatusColor = (status: Artist['status']) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'inactive': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getContractStatusColor = (status: Contract['status']) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'expired': return 'bg-red-100 text-red-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'terminated': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: '📊' },
    { id: 'contracts', label: 'Contracts', icon: '📄' },
    { id: 'releases', label: 'Releases', icon: '🎵' },
    { id: 'analytics', label: 'Analytics', icon: '📈' }
  ] as const;

  return (
    <div className="bg-white shadow-xl rounded-lg overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6">
        <div className="flex items-center justify-between">
          <button
            onClick={onBack}
            className="text-white/80 hover:text-white transition-colors"
          >
            ← Back
          </button>
          {onClose && (
            <button
              onClick={onClose}
              className="text-white/80 hover:text-white transition-colors"
            >
              ✕
            </button>
          )}
        </div>

        <div className="flex items-center mt-4">
          <div className="h-20 w-20 rounded-full bg-white/20 flex items-center justify-center text-2xl">
            {artist.avatar ? (
              <img
                src={artist.avatar}
                alt={artist.name}
                className="h-full w-full rounded-full object-cover"
              />
            ) : (
              '🎤'
            )}
          </div>
          <div className="ml-6">
            <h1 className="text-3xl font-bold">{artist.name}</h1>
            <p className="text-white/80 text-lg">{artist.genre || 'Music Artist'}</p>
            <div className="flex items-center mt-2">
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(artist.status)}`}>
                {artist.status.charAt(0).toUpperCase() + artist.status.slice(1)}
              </span>
              <span className="text-white/60 ml-4 text-sm">
                Joined {new Date(artist.joinedAt).toLocaleDateString('pl-PL')}
              </span>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-6 mt-6">
          <div className="bg-white/10 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold">{formatNumber(artist.totalStreams)}</div>
            <div className="text-white/80 text-sm">Total Streams</div>
          </div>
          <div className="bg-white/10 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold">{formatCurrency(artist.totalRevenue)}</div>
            <div className="text-white/80 text-sm">Total Revenue</div>
          </div>
          <div className="bg-white/10 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold">{artist.contracts.length}</div>
            <div className="text-white/80 text-sm">Active Contracts</div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8 px-6">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <span className="mr-2">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="p-6">
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* Contact Information */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Contact Information</h3>
                <div className="space-y-3">
                  <div className="flex items-center">
                    <span className="text-gray-500 w-20">📧 Email:</span>
                    <a href={`mailto:${artist.email}`} className="text-blue-600 hover:underline">
                      {artist.email}
                    </a>
                  </div>
                  {artist.phone && (
                    <div className="flex items-center">
                      <span className="text-gray-500 w-20">📞 Phone:</span>
                      <a href={`tel:${artist.phone}`} className="text-blue-600 hover:underline">
                        {artist.phone}
                      </a>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Social Media</h3>
                <div className="space-y-3">
                  {artist.socialMedia.spotify && (
                    <div className="flex items-center">
                      <span className="text-gray-500 w-20">🎵 Spotify:</span>
                      <a
                        href={artist.socialMedia.spotify}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-green-600 hover:underline"
                      >
                        View Profile
                      </a>
                    </div>
                  )}
                  {artist.socialMedia.instagram && (
                    <div className="flex items-center">
                      <span className="text-gray-500 w-20">📷 Instagram:</span>
                      <a
                        href={artist.socialMedia.instagram}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-pink-600 hover:underline"
                      >
                        @{artist.socialMedia.instagram.split('/').pop()}
                      </a>
                    </div>
                  )}
                  {artist.socialMedia.youtube && (
                    <div className="flex items-center">
                      <span className="text-gray-500 w-20">📺 YouTube:</span>
                      <a
                        href={artist.socialMedia.youtube}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-red-600 hover:underline"
                      >
                        View Channel
                      </a>
                    </div>
                  )}
                  {artist.socialMedia.tiktok && (
                    <div className="flex items-center">
                      <span className="text-gray-500 w-20">🎬 TikTok:</span>
                      <a
                        href={artist.socialMedia.tiktok}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-black hover:underline"
                      >
                        @{artist.socialMedia.tiktok.split('/').pop()}
                      </a>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Bio */}
            {artist.bio && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Biography</h3>
                <p className="text-gray-700 leading-relaxed">{artist.bio}</p>
              </div>
            )}

            {/* Quick Actions */}
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => onEdit(artist)}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
              >
                Edit Artist
              </button>
              <button
                onClick={onAddContract}
                className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors"
              >
                Add Contract
              </button>
              <button className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 transition-colors">
                Send Message
              </button>
            </div>
          </div>
        )}

        {activeTab === 'contracts' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-900">Contracts</h3>
              <button
                onClick={onAddContract}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
              >
                Add New Contract
              </button>
            </div>

            {artist.contracts.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-gray-400 text-6xl mb-4">📄</div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No contracts yet</h3>
                <p className="text-gray-500 mb-4">Get started by creating the first contract.</p>
                <button
                  onClick={onAddContract}
                  className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
                >
                  Create Contract
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {artist.contracts.map(contract => (
                  <div key={contract.id} className="border border-gray-200 rounded-lg p-6">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h4 className="text-lg font-medium text-gray-900">{contract.title}</h4>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getContractStatusColor(contract.status)}`}>
                            {contract.status}
                          </span>
                        </div>
                        <p className="text-gray-600 mb-3">{contract.type}</p>
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                          <div>
                            <span className="text-gray-500">Start Date:</span>
                            <div className="font-medium">{new Date(contract.startDate).toLocaleDateString('pl-PL')}</div>
                          </div>
                          <div>
                            <span className="text-gray-500">End Date:</span>
                            <div className="font-medium">{new Date(contract.endDate).toLocaleDateString('pl-PL')}</div>
                          </div>
                          <div>
                            <span className="text-gray-500">Revenue Split:</span>
                            <div className="font-medium">{contract.revenueShare}%</div>
                          </div>
                          <div>
                            <span className="text-gray-500">Total Revenue:</span>
                            <div className="font-medium">{formatCurrency(contract.totalRevenue)}</div>
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => onEditContract(contract)}
                        className="ml-4 text-blue-600 hover:text-blue-800 transition-colors"
                      >
                        Edit
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'releases' && (
          <div className="text-center py-12">
            <div className="text-gray-400 text-6xl mb-4">🎵</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Releases Coming Soon</h3>
            <p className="text-gray-500">This section will show all releases by this artist.</p>
          </div>
        )}

        {activeTab === 'analytics' && (
          <div className="text-center py-12">
            <div className="text-gray-400 text-6xl mb-4">📈</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Analytics Coming Soon</h3>
            <p className="text-gray-500">This section will show detailed analytics for this artist.</p>
          </div>
        )}
      </div>
    </div>
  );
};
