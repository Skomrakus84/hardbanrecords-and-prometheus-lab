import React, { useState } from 'react';

interface SocialMedia {
  spotify?: string;
  instagram?: string;
  twitter?: string;
  youtube?: string;
}

interface Contract {
  id: string;
  type: 'recording' | 'publishing' | 'management' | 'distribution';
  startDate: string;
  endDate: string;
  royaltyRate: number;
  status: 'active' | 'expired' | 'pending';
}

interface Artist {
  id: string;
  name: string;
  email: string;
  phone?: string;
  bio?: string;
  avatar: string;
  socialMedia: SocialMedia;
  contracts: Contract[];
  totalStreams: number;
  totalRevenue: number;
  genres: string[];
  joinDate: string;
  status: 'active' | 'inactive' | 'pending';
}

const ArtistsPageNew: React.FC = () => {
  const [selectedTab, setSelectedTab] = useState<'all' | 'active' | 'inactive' | 'pending'>('all');
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedArtist, setSelectedArtist] = useState<Artist | null>(null);

  const artists: Artist[] = [
    {
      id: '1',
      name: 'The Synthwave',
      email: 'contact@thesynthwave.com',
      phone: '+1 (555) 123-4567',
      bio: 'Electronic music duo creating atmospheric synthwave and retrowave tracks. Known for their cinematic soundscapes and nostalgic vibes.',
      avatar: '🎵',
      socialMedia: {
        spotify: 'thesynthwave',
        instagram: '@thesynthwave',
        twitter: '@synthwave_duo',
        youtube: 'TheSynthwaveOfficial'
      },
      contracts: [
        {
          id: '1',
          type: 'recording',
          startDate: '2023-01-15',
          endDate: '2025-01-15',
          royaltyRate: 75,
          status: 'active'
        }
      ],
      totalStreams: 2450000,
      totalRevenue: 12500,
      genres: ['Synthwave', 'Electronic', 'Ambient'],
      joinDate: '2023-01-15',
      status: 'active'
    },
    {
      id: '2',
      name: 'Neon Beats',
      email: 'hello@neonbeats.music',
      phone: '+1 (555) 987-6543',
      bio: 'Solo artist specializing in electronic dance music with neon-inspired visuals and high-energy performances.',
      avatar: '🎶',
      socialMedia: {
        spotify: 'neonbeats',
        instagram: '@neonbeats_official',
        youtube: 'NeonBeatsMusic'
      },
      contracts: [
        {
          id: '2',
          type: 'recording',
          startDate: '2023-06-01',
          endDate: '2026-06-01',
          royaltyRate: 80,
          status: 'active'
        },
        {
          id: '3',
          type: 'publishing',
          startDate: '2023-06-01',
          endDate: '2025-06-01',
          royaltyRate: 70,
          status: 'active'
        }
      ],
      totalStreams: 1850000,
      totalRevenue: 9200,
      genres: ['EDM', 'House', 'Techno'],
      joinDate: '2023-06-01',
      status: 'active'
    },
    {
      id: '3',
      name: 'City Sound',
      email: 'info@citysound.com',
      phone: '+1 (555) 456-7890',
      bio: 'Urban music collective blending hip-hop, R&B, and electronic elements to create the sound of modern city life.',
      avatar: '🎸',
      socialMedia: {
        instagram: '@citysound_collective',
        twitter: '@citysound',
        youtube: 'CitySoundCollective'
      },
      contracts: [
        {
          id: '4',
          type: 'distribution',
          startDate: '2024-01-01',
          endDate: '2025-01-01',
          royaltyRate: 85,
          status: 'pending'
        }
      ],
      totalStreams: 650000,
      totalRevenue: 3200,
      genres: ['Hip-Hop', 'R&B', 'Urban'],
      joinDate: '2024-01-01',
      status: 'pending'
    },
    {
      id: '4',
      name: 'DJ Pulse',
      email: 'booking@djpulse.pro',
      bio: 'Veteran DJ and producer with 15 years of experience in club and festival scenes worldwide.',
      avatar: '🎧',
      socialMedia: {
        spotify: 'djpulse',
        instagram: '@djpulse_official',
        twitter: '@djpulse'
      },
      contracts: [],
      totalStreams: 890000,
      totalRevenue: 4500,
      genres: ['Deep House', 'Progressive', 'Techno'],
      joinDate: '2023-11-15',
      status: 'inactive'
    }
  ];

  const filteredArtists = artists.filter(artist => {
    if (selectedTab === 'all') return true;
    return artist.status === selectedTab;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'inactive': return 'bg-gray-100 text-gray-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getContractTypeColor = (type: string) => {
    switch (type) {
      case 'recording': return 'bg-purple-100 text-purple-800';
      case 'publishing': return 'bg-blue-100 text-blue-800';
      case 'management': return 'bg-green-100 text-green-800';
      case 'distribution': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(0)}K`;
    return num.toString();
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">👨‍🎤 Artist Roster</h1>
            <p className="text-gray-600 mt-2">Manage artist profiles, contracts, and performance metrics</p>
          </div>
          <button
            onClick={() => setShowAddForm(true)}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors flex items-center space-x-2"
          >
            <span>➕</span>
            <span>Add New Artist</span>
          </button>
        </div>

        {/* Filter Tabs */}
        <div className="flex space-x-1 bg-gray-200 rounded-lg p-1">
          {(['all', 'active', 'pending', 'inactive'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setSelectedTab(tab)}
              className={`px-4 py-2 rounded-md font-medium text-sm transition-colors ${
                selectedTab === tab
                  ? 'bg-white text-indigo-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
              <span className="ml-2 text-xs">
                ({tab === 'all' ? artists.length : artists.filter(a => a.status === tab).length})
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Artists Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredArtists.map((artist) => (
          <div
            key={artist.id}
            className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden hover:shadow-xl transition-all hover:-translate-y-1 cursor-pointer"
            onClick={() => setSelectedArtist(artist)}
          >
            {/* Artist Header */}
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-start space-x-4">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center text-2xl">
                  {artist.avatar}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-semibold text-gray-900 truncate">{artist.name}</h3>
                  <p className="text-sm text-gray-600 truncate">{artist.email}</p>
                  <div className="flex items-center space-x-2 mt-2">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(artist.status)}`}>
                      {artist.status.toUpperCase()}
                    </span>
                    <span className="text-xs text-gray-500">
                      {artist.contracts.length} contract{artist.contracts.length !== 1 ? 's' : ''}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Performance Metrics */}
            <div className="p-6 border-b border-gray-100">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wider">Total Streams</p>
                  <p className="text-lg font-semibold text-gray-900">{formatNumber(artist.totalStreams)}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wider">Total Revenue</p>
                  <p className="text-lg font-semibold text-gray-900">${artist.totalRevenue.toLocaleString()}</p>
                </div>
              </div>
              <div className="mt-4">
                <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">Genres</p>
                <div className="flex flex-wrap gap-1">
                  {artist.genres.map((genre, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-700"
                    >
                      {genre}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Social Media & Actions */}
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex space-x-2">
                  {artist.socialMedia.spotify && (
                    <div className="w-6 h-6 bg-green-500 rounded text-white text-xs flex items-center justify-center">S</div>
                  )}
                  {artist.socialMedia.instagram && (
                    <div className="w-6 h-6 bg-pink-500 rounded text-white text-xs flex items-center justify-center">I</div>
                  )}
                  {artist.socialMedia.twitter && (
                    <div className="w-6 h-6 bg-blue-500 rounded text-white text-xs flex items-center justify-center">T</div>
                  )}
                  {artist.socialMedia.youtube && (
                    <div className="w-6 h-6 bg-red-500 rounded text-white text-xs flex items-center justify-center">Y</div>
                  )}
                </div>
                <span className="text-xs text-gray-500">
                  Joined {new Date(artist.joinDate).toLocaleDateString()}
                </span>
              </div>
              
              <div className="flex space-x-2">
                <button className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium py-2 px-3 rounded-md transition-colors">
                  Edit Profile
                </button>
                <button className="flex-1 bg-indigo-100 hover:bg-indigo-200 text-indigo-700 text-sm font-medium py-2 px-3 rounded-md transition-colors">
                  View Analytics
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Artist Profile Modal */}
      {selectedArtist && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-screen overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900">Artist Profile</h2>
                <button
                  onClick={() => setSelectedArtist(null)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  ✕
                </button>
              </div>
            </div>
            
            <div className="p-6">
              {/* Artist Info */}
              <div className="flex items-start space-x-6 mb-8">
                <div className="w-24 h-24 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center text-4xl">
                  {selectedArtist.avatar}
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">{selectedArtist.name}</h3>
                  <p className="text-gray-600 mb-4">{selectedArtist.bio}</p>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium text-gray-700">Email</p>
                      <p className="text-sm text-gray-600">{selectedArtist.email}</p>
                    </div>
                    {selectedArtist.phone && (
                      <div>
                        <p className="text-sm font-medium text-gray-700">Phone</p>
                        <p className="text-sm text-gray-600">{selectedArtist.phone}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Performance Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-4 text-white">
                  <h4 className="text-sm font-medium opacity-90">Total Streams</h4>
                  <p className="text-2xl font-bold">{formatNumber(selectedArtist.totalStreams)}</p>
                </div>
                <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg p-4 text-white">
                  <h4 className="text-sm font-medium opacity-90">Total Revenue</h4>
                  <p className="text-2xl font-bold">${selectedArtist.totalRevenue.toLocaleString()}</p>
                </div>
                <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg p-4 text-white">
                  <h4 className="text-sm font-medium opacity-90">Active Contracts</h4>
                  <p className="text-2xl font-bold">{selectedArtist.contracts.filter(c => c.status === 'active').length}</p>
                </div>
              </div>

              {/* Contracts */}
              <div className="mb-8">
                <h4 className="text-lg font-semibold text-gray-900 mb-4">Contracts</h4>
                <div className="space-y-3">
                  {selectedArtist.contracts.map((contract) => (
                    <div key={contract.id} className="bg-gray-50 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getContractTypeColor(contract.type)}`}>
                            {contract.type.toUpperCase()}
                          </span>
                          <span className="text-sm font-medium text-gray-900">
                            {contract.royaltyRate}% Royalty Rate
                          </span>
                        </div>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(contract.status)}`}>
                          {contract.status.toUpperCase()}
                        </span>
                      </div>
                      <div className="mt-2 text-sm text-gray-600">
                        {new Date(contract.startDate).toLocaleDateString()} - {new Date(contract.endDate).toLocaleDateString()}
                      </div>
                    </div>
                  ))}
                  {selectedArtist.contracts.length === 0 && (
                    <p className="text-gray-500 text-center py-4">No contracts found</p>
                  )}
                </div>
              </div>

              {/* Social Media */}
              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-4">Social Media</h4>
                <div className="grid grid-cols-2 gap-4">
                  {Object.entries(selectedArtist.socialMedia).map(([platform, handle]) => (
                    handle && (
                      <div key={platform} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                        <div className={`w-8 h-8 rounded flex items-center justify-center text-white text-sm font-medium ${
                          platform === 'spotify' ? 'bg-green-500' :
                          platform === 'instagram' ? 'bg-pink-500' :
                          platform === 'twitter' ? 'bg-blue-500' :
                          platform === 'youtube' ? 'bg-red-500' : 'bg-gray-500'
                        }`}>
                          {platform[0].toUpperCase()}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900 capitalize">{platform}</p>
                          <p className="text-sm text-gray-600">{handle}</p>
                        </div>
                      </div>
                    )
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Artist Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-screen overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900">Add New Artist</h2>
                <button
                  onClick={() => setShowAddForm(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  ✕
                </button>
              </div>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Basic Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900">Basic Information</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Artist Name</label>
                    <input
                      type="text"
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      placeholder="Enter artist name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <input
                      type="email"
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      placeholder="artist@example.com"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone (Optional)</label>
                    <input
                      type="tel"
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      placeholder="+1 (555) 123-4567"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Genres</label>
                    <input
                      type="text"
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      placeholder="Electronic, Pop, etc."
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
                  <textarea
                    rows={3}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="Artist biography and description..."
                  />
                </div>
              </div>

              {/* Social Media */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900">Social Media</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Spotify</label>
                    <input
                      type="text"
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      placeholder="spotify-artist-id"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Instagram</label>
                    <input
                      type="text"
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      placeholder="@instagram_handle"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Twitter</label>
                    <input
                      type="text"
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      placeholder="@twitter_handle"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">YouTube</label>
                    <input
                      type="text"
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      placeholder="youtube-channel-id"
                    />
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-3 pt-4 border-t border-gray-200">
                <button
                  onClick={() => setShowAddForm(false)}
                  className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-2 px-4 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors">
                  Add Artist
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Empty State */}
      {filteredArtists.length === 0 && (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">👨‍🎤</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No artists found</h3>
          <p className="text-gray-600 mb-4">
            {selectedTab === 'all' 
              ? "You haven't added any artists yet." 
              : `No artists with status "${selectedTab}".`}
          </p>
          <button
            onClick={() => setShowAddForm(true)}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
          >
            Add Your First Artist
          </button>
        </div>
      )}
    </div>
  );
};

export default ArtistsPageNew;
