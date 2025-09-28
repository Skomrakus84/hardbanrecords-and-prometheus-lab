import React, { useState, useEffect } from 'react';
import CatalogBrowser from '../../components/music/CatalogBrowser';
import ReleaseEditorForm from '../../components/music/ReleaseEditorForm';
import DistributionStatusTracker from '../../components/music/DistributionStatusTracker';
import { useNavigate } from 'react-router-dom';

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

const CatalogPage: React.FC = () => {
  const navigate = useNavigate();
  const [releases, setReleases] = useState<Release[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingRelease, setEditingRelease] = useState<Release | null>(null);
  const [selectedRelease, setSelectedRelease] = useState<Release | null>(null);
  const [activeView, setActiveView] = useState<'catalog' | 'create' | 'edit' | 'details'>('catalog');

  // Sample data - replace with actual API calls
  const sampleReleases: Release[] = [
    {
      id: '1',
      title: 'Midnight Dreams',
      artist: 'Luna Rose',
      releaseType: 'single',
      releaseDate: '2024-03-15',
      artwork: 'https://via.placeholder.com/300x300/667eea/ffffff?text=MD',
      status: 'published',
      tracks: 1,
      streams: 15420,
      revenue: 234.50,
      platforms: ['Spotify', 'Apple Music', 'YouTube Music', 'Amazon Music'],
      genre: 'Pop',
      label: 'HardbanRecords',
      lastUpdated: '2024-03-20'
    },
    {
      id: '2',
      title: 'Electric Nights EP',
      artist: 'Neon Pulse',
      releaseType: 'ep',
      releaseDate: '2024-02-28',
      artwork: 'https://via.placeholder.com/300x300/764ba2/ffffff?text=EN',
      status: 'published',
      tracks: 5,
      streams: 45230,
      revenue: 687.40,
      platforms: ['Spotify', 'Apple Music', 'Deezer', 'Tidal'],
      genre: 'Electronic',
      label: 'HardbanRecords',
      lastUpdated: '2024-03-18'
    },
    {
      id: '3',
      title: 'Urban Chronicles',
      artist: 'Metro Beats',
      releaseType: 'album',
      releaseDate: '2024-01-20',
      artwork: 'https://via.placeholder.com/300x300/f093fb/ffffff?text=UC',
      status: 'published',
      tracks: 12,
      streams: 128750,
      revenue: 1920.30,
      platforms: ['Spotify', 'Apple Music', 'YouTube Music', 'Amazon Music', 'Bandcamp'],
      genre: 'Hip-Hop',
      label: 'HardbanRecords',
      lastUpdated: '2024-03-22'
    },
    {
      id: '4',
      title: 'Acoustic Sessions',
      artist: 'Sarah Chen',
      releaseType: 'ep',
      releaseDate: '2024-04-01',
      artwork: 'https://via.placeholder.com/300x300/4facfe/ffffff?text=AS',
      status: 'pending',
      tracks: 4,
      streams: 0,
      revenue: 0,
      platforms: [],
      genre: 'Folk',
      label: 'HardbanRecords',
      lastUpdated: '2024-03-25'
    },
    {
      id: '5',
      title: 'Summer Vibes',
      artist: 'Tropical Storm',
      releaseType: 'single',
      releaseDate: '2024-05-15',
      artwork: 'https://via.placeholder.com/300x300/43e97b/ffffff?text=SV',
      status: 'draft',
      tracks: 1,
      streams: 0,
      revenue: 0,
      platforms: [],
      genre: 'Reggae',
      label: 'HardbanRecords',
      lastUpdated: '2024-03-23'
    }
  ];

  useEffect(() => {
    // Simulate API call
    const loadReleases = async () => {
      setLoading(true);
      try {
        // Replace with actual API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        setReleases(sampleReleases);
      } catch (error) {
        console.error('Failed to load releases:', error);
      } finally {
        setLoading(false);
      }
    };

    loadReleases();
  }, []);

  const handleSelectRelease = (releaseId: string) => {
    const release = releases.find(r => r.id === releaseId);
    if (release) {
      setSelectedRelease(release);
      setActiveView('details');
    }
  };

  const handleEditRelease = (releaseId: string) => {
    const release = releases.find(r => r.id === releaseId);
    if (release) {
      setEditingRelease(release);
      setActiveView('edit');
    }
  };

  const handleDeleteRelease = (releaseId: string) => {
    if (window.confirm('Are you sure you want to delete this release?')) {
      setReleases(prev => prev.filter(r => r.id !== releaseId));
    }
  };

  const handleCreateRelease = () => {
    setActiveView('create');
    setShowCreateForm(true);
  };

  const handleSaveRelease = (releaseData: any) => {
    if (editingRelease) {
      // Update existing release
      setReleases(prev => prev.map(r =>
        r.id === editingRelease.id
          ? { ...r, ...releaseData, lastUpdated: new Date().toISOString() }
          : r
      ));
      setEditingRelease(null);
    } else {
      // Create new release
      const newRelease: Release = {
        id: Date.now().toString(),
        ...releaseData,
        status: 'draft' as const,
        streams: 0,
        revenue: 0,
        platforms: [],
        lastUpdated: new Date().toISOString()
      };
      setReleases(prev => [newRelease, ...prev]);
    }
    setActiveView('catalog');
    setShowCreateForm(false);
  };

  const handleCancelEdit = () => {
    setEditingRelease(null);
    setActiveView('catalog');
    setShowCreateForm(false);
  };

  const renderView = () => {
    switch (activeView) {
      case 'create':
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold text-gray-900">Create New Release</h1>
              <button
                onClick={() => setActiveView('catalog')}
                className="bg-gray-500 hover:bg-gray-600 text-white font-medium py-2 px-4 rounded-lg transition-colors"
              >
                ← Back to Catalog
              </button>
            </div>
            <ReleaseEditorForm
              onSave={handleSaveRelease}
              onCancel={handleCancelEdit}
            />
          </div>
        );

      case 'edit':
        return editingRelease ? (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold text-gray-900">Edit Release: {editingRelease.title}</h1>
              <button
                onClick={() => setActiveView('catalog')}
                className="bg-gray-500 hover:bg-gray-600 text-white font-medium py-2 px-4 rounded-lg transition-colors"
              >
                ← Back to Catalog
              </button>
            </div>
            <ReleaseEditorForm
              release={editingRelease}
              onSave={handleSaveRelease}
              onCancel={handleCancelEdit}
            />
          </div>
        ) : null;

      case 'details':
        return selectedRelease ? (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold text-gray-900">{selectedRelease.title}</h1>
              <div className="flex space-x-3">
                <button
                  onClick={() => handleEditRelease(selectedRelease.id)}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                >
                  Edit Release
                </button>
                <button
                  onClick={() => setActiveView('catalog')}
                  className="bg-gray-500 hover:bg-gray-600 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                >
                  ← Back to Catalog
                </button>
              </div>
            </div>

            {/* Release Details */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Release Info */}
              <div className="lg:col-span-1">
                <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
                  <div className="aspect-square bg-gray-200 rounded-lg mb-4 overflow-hidden">
                    {selectedRelease.artwork ? (
                      <img
                        src={selectedRelease.artwork}
                        alt={selectedRelease.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-6xl text-gray-400">
                        🎵
                      </div>
                    )}
                  </div>

                  <h2 className="text-xl font-bold text-gray-900 mb-2">{selectedRelease.title}</h2>
                  <p className="text-lg text-gray-700 mb-4">{selectedRelease.artist}</p>

                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Type:</span>
                      <span className="font-medium capitalize">{selectedRelease.releaseType}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Genre:</span>
                      <span className="font-medium">{selectedRelease.genre}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Release Date:</span>
                      <span className="font-medium">
                        {new Date(selectedRelease.releaseDate).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Tracks:</span>
                      <span className="font-medium">{selectedRelease.tracks}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Label:</span>
                      <span className="font-medium">{selectedRelease.label}</span>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-2 gap-4 mt-6">
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-center">
                      <div className="text-lg font-bold text-blue-900">
                        {selectedRelease.streams.toLocaleString()}
                      </div>
                      <div className="text-sm text-blue-600">Streams</div>
                    </div>
                    <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-center">
                      <div className="text-lg font-bold text-green-900">
                        ${selectedRelease.revenue.toFixed(2)}
                      </div>
                      <div className="text-sm text-green-600">Revenue</div>
                    </div>
                  </div>

                  {/* Platforms */}
                  <div className="mt-6">
                    <h3 className="font-medium text-gray-900 mb-2">Available On:</h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedRelease.platforms.map((platform, index) => (
                        <span
                          key={index}
                          className="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded"
                        >
                          {platform}
                        </span>
                      ))}
                      {selectedRelease.platforms.length === 0 && (
                        <span className="text-gray-500 text-sm">Not distributed yet</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Distribution Status */}
              <div className="lg:col-span-2">
                <DistributionStatusTracker
                  releaseTitle={selectedRelease.title}
                  platforms={[
                    {
                      id: 'spotify',
                      name: 'Spotify',
                      icon: '🎵',
                      status: selectedRelease.status === 'published' ? 'live' : selectedRelease.status === 'pending' ? 'processing' : 'pending',
                      submittedAt: selectedRelease.status !== 'draft' ? selectedRelease.lastUpdated : undefined,
                      liveAt: selectedRelease.status === 'published' ? selectedRelease.releaseDate : undefined,
                      stores: ['Spotify', 'Spotify for Artists'],
                      message: selectedRelease.status === 'published' ? 'Successfully distributed' : 'Awaiting approval'
                    },
                    {
                      id: 'apple',
                      name: 'Apple Music',
                      icon: '🍎',
                      status: selectedRelease.status === 'published' ? 'live' : selectedRelease.status === 'pending' ? 'processing' : 'pending',
                      submittedAt: selectedRelease.status !== 'draft' ? selectedRelease.lastUpdated : undefined,
                      liveAt: selectedRelease.status === 'published' ? selectedRelease.releaseDate : undefined,
                      stores: ['Apple Music', 'iTunes Store'],
                      message: selectedRelease.status === 'published' ? 'Successfully distributed' : 'Processing submission'
                    },
                    {
                      id: 'youtube',
                      name: 'YouTube Music',
                      icon: '📺',
                      status: selectedRelease.status === 'published' ? 'live' : 'pending',
                      submittedAt: selectedRelease.status !== 'draft' ? selectedRelease.lastUpdated : undefined,
                      liveAt: selectedRelease.status === 'published' ? selectedRelease.releaseDate : undefined,
                      stores: ['YouTube Music', 'YouTube'],
                      message: selectedRelease.status === 'published' ? 'Live on platform' : 'Pending submission'
                    }
                  ]}
                  onRetry={(platformId) => console.log('Retry:', platformId)}
                  onViewDetails={(platformId) => console.log('View details:', platformId)}
                />
              </div>
            </div>
          </div>
        ) : null;

      default:
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold text-gray-900">Music Catalog</h1>
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => navigate('/music/analytics')}
                  className="bg-blue-100 hover:bg-blue-200 text-blue-700 font-medium py-2 px-4 rounded-lg transition-colors"
                >
                  📊 Analytics
                </button>
                <button
                  onClick={() => navigate('/music/payouts')}
                  className="bg-green-100 hover:bg-green-200 text-green-700 font-medium py-2 px-4 rounded-lg transition-colors"
                >
                  💰 Payouts
                </button>
              </div>
            </div>

            <CatalogBrowser
              releases={releases}
              onSelectRelease={handleSelectRelease}
              onEditRelease={handleEditRelease}
              onDeleteRelease={handleDeleteRelease}
              onCreateRelease={handleCreateRelease}
              loading={loading}
            />
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {renderView()}
      </div>
    </div>
  );
};

export default CatalogPage;
