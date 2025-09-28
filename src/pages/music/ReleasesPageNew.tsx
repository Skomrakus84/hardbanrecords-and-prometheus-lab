import React, { useState } from 'react';
import { GradientCard, GlassmorphismContainer, BrandIcon, PageBackground } from '../../components/ui/ModernComponents';
import { getPageConfig } from '../../components/ui/BrandConfig';
import { Plus, MoreHorizontal, Edit } from 'lucide-react';

interface Release {
  id: string;
  title: string;
  artist: string;
  type: 'album' | 'single' | 'ep';
  status: 'draft' | 'processing' | 'live' | 'rejected';
  platforms: string[];
  releaseDate: string;
  streams: number;
  revenue: number;
  cover: string;
}

const ReleasesPageNew: React.FC = () => {
  const [selectedTab, setSelectedTab] = useState<'all' | 'draft' | 'live' | 'processing'>('all');
  const [showAddForm, setShowAddForm] = useState(false);

  const releases: Release[] = [
    {
      id: '1',
      title: 'Midnight Dreams',
      artist: 'The Synthwave',
      type: 'album',
      status: 'live',
      platforms: ['Spotify', 'Apple Music', 'YouTube Music'],
      releaseDate: '2024-01-15',
      streams: 892000,
      revenue: 4200,
      cover: '🎵'
    },
    {
      id: '2',
      title: 'Electric Pulse',
      artist: 'Neon Beats',
      type: 'single',
      status: 'live',
      platforms: ['All Platforms'],
      releaseDate: '2024-02-10',
      streams: 645000,
      revenue: 3100,
      cover: '🎶'
    },
    {
      id: '3',
      title: 'Urban Vibes',
      artist: 'City Sound',
      type: 'ep',
      status: 'processing',
      platforms: ['Pending'],
      releaseDate: '2024-03-01',
      streams: 0,
      revenue: 0,
      cover: '🎸'
    },
    {
      id: '4',
      title: 'Deep House Session',
      artist: 'DJ Pulse',
      type: 'single',
      status: 'draft',
      platforms: ['None'],
      releaseDate: '2024-03-15',
      streams: 0,
      revenue: 0,
      cover: '🎧'
    }
  ];

  const filteredReleases = releases.filter(release => {
    if (selectedTab === 'all') return true;
    return release.status === selectedTab;
  });

  const getStatusGradient = (status: string) => {
    switch (status) {
      case 'live': return 'linear-gradient(135deg, #10b981, #059669)';
      case 'processing': return 'linear-gradient(135deg, #f59e0b, #d97706)';
      case 'draft': return 'linear-gradient(135deg, #6b7280, #4b5563)';
      case 'rejected': return 'linear-gradient(135deg, #ef4444, #dc2626)';
      default: return 'linear-gradient(135deg, #6b7280, #4b5563)';
    }
  };

  const getTypeGradient = (type: string) => {
    switch (type) {
      case 'album': return 'linear-gradient(135deg, #8b5cf6, #7c3aed)';
      case 'single': return 'linear-gradient(135deg, #3b82f6, #2563eb)';
      case 'ep': return 'linear-gradient(135deg, #6366f1, #4f46e5)';
      default: return 'linear-gradient(135deg, #6b7280, #4b5563)';
    }
  };

  const pageConfig = getPageConfig('music', 'releases');

  return (
    <PageBackground imageUrl={pageConfig.background!}>
      <div style={{ padding: '24px', minHeight: '100vh' }}>
        {/* Header */}
        <GlassmorphismContainer className="mb-8 p-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              <BrandIcon
                icon={pageConfig.icon}
                brand={pageConfig.brand}
                size={32}
              />
              <div>
                <h1 style={{
                  fontSize: '32px',
                  fontWeight: 'bold',
                  color: 'white',
                  margin: '0'
                }}>Music Releases</h1>
                <p style={{
                  color: 'rgba(255, 255, 255, 0.8)',
                  margin: '8px 0 0 0'
                }}>Manage all your music releases and distribution</p>
              </div>
            </div>
            <button
              onClick={() => setShowAddForm(true)}
              style={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
                fontWeight: '600',
                padding: '12px 24px',
                borderRadius: '12px',
                border: 'none',
                cursor: 'pointer',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                boxShadow: '0 8px 25px -8px rgba(102, 126, 234, 0.4)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 12px 35px -8px rgba(102, 126, 234, 0.6)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 8px 25px -8px rgba(102, 126, 234, 0.4)';
              }}
            >
              <Plus size={20} />
              <span>Add New Release</span>
            </button>
          </div>

          {/* Filter Tabs */}
          <div style={{
            display: 'flex',
            gap: '8px',
            background: 'rgba(255, 255, 255, 0.2)',
            borderRadius: '12px',
            padding: '8px',
            backdropFilter: 'blur(8px)'
          }}>
            {(['all', 'live', 'processing', 'draft'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setSelectedTab(tab)}
                style={{
                  padding: '8px 16px',
                  fontSize: '14px',
                  fontWeight: '600',
                  borderRadius: '8px',
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  background: selectedTab === tab
                    ? 'rgba(255, 255, 255, 0.9)'
                    : 'transparent',
                  color: selectedTab === tab
                    ? '#667eea'
                    : 'rgba(255, 255, 255, 0.8)',
                  boxShadow: selectedTab === tab
                    ? '0 4px 12px rgba(0, 0, 0, 0.1)'
                    : 'none'
                }}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
                <span style={{
                  marginLeft: '8px',
                  fontSize: '12px',
                  opacity: 0.8
                }}>
                  ({tab === 'all' ? releases.length : releases.filter(r => r.status === tab).length})
                </span>
              </button>
            ))}
          </div>
        </GlassmorphismContainer>

        {/* Releases Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
          gap: '24px'
        }}>
          {filteredReleases.map((release) => (
            <GradientCard
              key={release.id}
              gradient="linear-gradient(135deg, rgba(255,255,255,0.25), rgba(255,255,255,0.1))"
              onClick={() => {/* Handle click */}}
            >
              <div style={{ padding: '24px' }}>
                {/* Cover & Basic Info */}
                <div style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '16px',
                  marginBottom: '20px'
                }}>
                  <div style={{
                    width: '64px',
                    height: '64px',
                    background: 'linear-gradient(135deg, #8b5cf6 0%, #3b82f6 100%)',
                    borderRadius: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '28px',
                    boxShadow: '0 8px 25px -8px rgba(139, 92, 246, 0.4)'
                  }}>
                    {release.cover}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <h3 style={{
                      fontSize: '18px',
                      fontWeight: '600',
                      color: 'white',
                      margin: '0 0 4px 0',
                      textOverflow: 'ellipsis',
                      overflow: 'hidden',
                      whiteSpace: 'nowrap'
                    }}>{release.title}</h3>
                    <p style={{
                      fontSize: '14px',
                      color: 'rgba(255, 255, 255, 0.8)',
                      margin: '0 0 8px 0'
                    }}>{release.artist}</p>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}>
                      <span style={{
                        background: getTypeGradient(release.type),
                        padding: '2px 8px',
                        borderRadius: '12px',
                        fontSize: '12px',
                        fontWeight: '600',
                        color: 'white'
                      }}>
                        {release.type.toUpperCase()}
                      </span>
                      <span style={{
                        background: getStatusGradient(release.status),
                        padding: '2px 8px',
                        borderRadius: '12px',
                        fontSize: '12px',
                        fontWeight: '600',
                        color: 'white'
                      }}>
                        {release.status.toUpperCase()}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Stats */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '16px',
                  marginBottom: '20px'
                }}>
                  <div>
                    <p style={{
                      fontSize: '12px',
                      color: 'rgba(255, 255, 255, 0.6)',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                      margin: '0 0 4px 0'
                    }}>Streams</p>
                    <p style={{
                      fontSize: '18px',
                      fontWeight: '600',
                      color: 'white',
                      margin: '0'
                    }}>
                      {release.streams > 0 ? `${(release.streams / 1000).toFixed(0)}K` : '—'}
                    </p>
                  </div>
                  <div>
                    <p style={{
                      fontSize: '12px',
                      color: 'rgba(255, 255, 255, 0.6)',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                      margin: '0 0 4px 0'
                    }}>Revenue</p>
                    <p style={{
                      fontSize: '18px',
                      fontWeight: '600',
                      color: 'white',
                      margin: '0'
                    }}>
                      {release.revenue > 0 ? `$${release.revenue.toLocaleString()}` : '—'}
                    </p>
                  </div>
                </div>

                <div style={{ marginBottom: '20px' }}>
                  <p style={{
                    fontSize: '12px',
                    color: 'rgba(255, 255, 255, 0.6)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    margin: '0 0 4px 0'
                  }}>Release Date</p>
                  <p style={{
                    fontSize: '14px',
                    fontWeight: '500',
                    color: 'white',
                    margin: '0'
                  }}>{new Date(release.releaseDate).toLocaleDateString()}</p>
                </div>

                {/* Platforms */}
                <div style={{ marginBottom: '20px' }}>
                  <p style={{
                    fontSize: '12px',
                    color: 'rgba(255, 255, 255, 0.6)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    margin: '0 0 8px 0'
                  }}>Platforms</p>
                  <div style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: '8px'
                  }}>
                    {release.platforms.map((platform, index) => (
                      <span
                        key={index}
                        style={{
                          background: 'rgba(255, 255, 255, 0.2)',
                          padding: '4px 8px',
                          borderRadius: '8px',
                          fontSize: '12px',
                          fontWeight: '500',
                          color: 'white',
                          backdropFilter: 'blur(4px)'
                        }}
                      >
                        {platform}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Action Buttons */}
                <div style={{
                  display: 'flex',
                  gap: '8px'
                }}>
                  <button style={{
                    flex: 1,
                    background: 'rgba(255, 255, 255, 0.2)',
                    color: 'white',
                    fontSize: '14px',
                    fontWeight: '500',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    border: 'none',
                    cursor: 'pointer',
                    transition: 'all 0.3s',
                    backdropFilter: 'blur(4px)'
                  }}>
                    <Edit size={16} style={{ marginRight: '4px', display: 'inline' }} />
                    Edit
                  </button>
                  <button style={{
                    flex: 1,
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    color: 'white',
                    fontSize: '14px',
                    fontWeight: '500',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    border: 'none',
                    cursor: 'pointer',
                    transition: 'all 0.3s',
                    boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)'
                  }}>
                    <MoreHorizontal size={16} style={{ marginRight: '4px', display: 'inline' }} />
                    Analytics
                  </button>
                </div>
              </div>
            </GradientCard>
          ))}
        </div>

      {/* Add Release Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-screen overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900">Add New Release</h2>
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
                    <label className="block text-sm font-medium text-gray-700 mb-1">Release Title</label>
                    <input
                      type="text"
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      placeholder="Enter release title"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Artist Name</label>
                    <input
                      type="text"
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      placeholder="Enter artist name"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Release Type</label>
                    <select className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500">
                      <option value="">Select type</option>
                      <option value="single">Single</option>
                      <option value="ep">EP</option>
                      <option value="album">Album</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Release Date</label>
                    <input
                      type="date"
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Genre</label>
                  <input
                    type="text"
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="Electronic, Pop, Rock, etc."
                  />
                </div>
              </div>

              {/* File Upload */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900">Media Files</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Audio File</label>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-indigo-400 transition-colors">
                      <p className="text-gray-600">Drag & drop audio file or click to browse</p>
                      <p className="text-xs text-gray-500 mt-1">MP3, WAV, FLAC (max 100MB)</p>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Cover Art</label>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-indigo-400 transition-colors">
                      <p className="text-gray-600">Drag & drop cover image</p>
                      <p className="text-xs text-gray-500 mt-1">JPG, PNG (min 3000x3000px)</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Distribution Platforms */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900">Distribution Platforms</h3>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {['Spotify', 'Apple Music', 'YouTube Music', 'Amazon Music', 'Deezer', 'Tidal'].map((platform) => (
                    <label key={platform} className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                        defaultChecked
                      />
                      <span className="text-sm text-gray-700">{platform}</span>
                    </label>
                  ))}
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
                  Create Release
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Empty State */}
      {filteredReleases.length === 0 && (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🎵</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No releases found</h3>
          <p className="text-gray-600 mb-4">
            {selectedTab === 'all'
              ? "You haven't created any releases yet."
              : `No releases with status "${selectedTab}".`}
          </p>
          <button
            onClick={() => setShowAddForm(true)}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
          >
            Create Your First Release
          </button>
        </div>
      )}
      </div>
    </PageBackground>
  );
};

export default ReleasesPageNew;
