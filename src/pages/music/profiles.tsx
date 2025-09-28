import React, { useState, useEffect } from 'react';
import ProfileSyncWizard from '../../components/music/ProfileSyncWizard';
import SyncStatusDashboard from '../../components/music/SyncStatusDashboard';
import PlatformConnections from '../../components/music/PlatformConnections';
import { useNavigate } from 'react-router-dom';

interface Platform {
  id: string;
  name: string;
  icon: string;
  isConnected: boolean;
  lastSync: string | null;
  syncStatus: 'success' | 'error' | 'syncing' | 'pending';
  profileUrl?: string;
  followerCount?: number;
  totalPlays?: number;
  monthlyListeners?: number;
  connectionDate?: string;
  apiStatus: 'active' | 'rate_limited' | 'error' | 'maintenance';
  features: {
    profileSync: boolean;
    analyticsSync: boolean;
    contentDistribution: boolean;
    playlistPlacement: boolean;
  };
  syncSettings: {
    autoSync: boolean;
    syncFrequency: 'realtime' | 'hourly' | 'daily' | 'weekly';
    syncTypes: string[];
  };
}

interface SyncActivity {
  id: string;
  platformId: string;
  platformName: string;
  action: 'profile_update' | 'analytics_sync' | 'content_upload' | 'playlist_update' | 'connection_established' | 'error_resolved';
  status: 'success' | 'error' | 'pending';
  timestamp: string;
  details: string;
  errorMessage?: string;
  affectedItems?: string[];
}

interface ProfilesPageData {
  platforms: Platform[];
  recentActivity: SyncActivity[];
  syncStatistics: {
    totalPlatforms: number;
    connectedPlatforms: number;
    successfulSyncs: number;
    failedSyncs: number;
    lastSyncTime: string;
    nextScheduledSync: string;
  };
}

const ProfilesPage: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [profilesData, setProfilesData] = useState<ProfilesPageData | null>(null);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'platforms' | 'wizard'>('dashboard');
  const [showWizard, setShowWizard] = useState(false);

  // Sample profiles data
  const sampleProfilesData: ProfilesPageData = {
    platforms: [
      {
        id: 'spotify',
        name: 'Spotify',
        icon: '🎵',
        isConnected: true,
        lastSync: '2024-03-30T10:30:00Z',
        syncStatus: 'success',
        profileUrl: 'https://open.spotify.com/artist/xyz',
        followerCount: 12500,
        totalPlays: 1250000,
        monthlyListeners: 8500,
        connectionDate: '2024-01-15',
        apiStatus: 'active',
        features: {
          profileSync: true,
          analyticsSync: true,
          contentDistribution: true,
          playlistPlacement: true
        },
        syncSettings: {
          autoSync: true,
          syncFrequency: 'daily',
          syncTypes: ['profile', 'analytics', 'playlists']
        }
      },
      {
        id: 'apple_music',
        name: 'Apple Music',
        icon: '🍎',
        isConnected: true,
        lastSync: '2024-03-30T09:15:00Z',
        syncStatus: 'success',
        profileUrl: 'https://music.apple.com/artist/xyz',
        followerCount: 8200,
        totalPlays: 850000,
        connectionDate: '2024-01-20',
        apiStatus: 'active',
        features: {
          profileSync: true,
          analyticsSync: true,
          contentDistribution: true,
          playlistPlacement: false
        },
        syncSettings: {
          autoSync: true,
          syncFrequency: 'daily',
          syncTypes: ['profile', 'analytics']
        }
      },
      {
        id: 'youtube_music',
        name: 'YouTube Music',
        icon: '📺',
        isConnected: true,
        lastSync: '2024-03-30T08:45:00Z',
        syncStatus: 'error',
        profileUrl: 'https://music.youtube.com/channel/xyz',
        followerCount: 15600,
        totalPlays: 2100000,
        connectionDate: '2024-02-01',
        apiStatus: 'rate_limited',
        features: {
          profileSync: true,
          analyticsSync: true,
          contentDistribution: true,
          playlistPlacement: true
        },
        syncSettings: {
          autoSync: true,
          syncFrequency: 'hourly',
          syncTypes: ['profile', 'analytics', 'content']
        }
      },
      {
        id: 'soundcloud',
        name: 'SoundCloud',
        icon: '☁️',
        isConnected: true,
        lastSync: '2024-03-30T11:00:00Z',
        syncStatus: 'success',
        profileUrl: 'https://soundcloud.com/artist-name',
        followerCount: 6800,
        totalPlays: 520000,
        connectionDate: '2024-02-10',
        apiStatus: 'active',
        features: {
          profileSync: true,
          analyticsSync: true,
          contentDistribution: true,
          playlistPlacement: false
        },
        syncSettings: {
          autoSync: true,
          syncFrequency: 'daily',
          syncTypes: ['profile', 'analytics', 'content']
        }
      },
      {
        id: 'bandcamp',
        name: 'Bandcamp',
        icon: '🎪',
        isConnected: false,
        lastSync: null,
        syncStatus: 'pending',
        apiStatus: 'maintenance',
        features: {
          profileSync: true,
          analyticsSync: false,
          contentDistribution: true,
          playlistPlacement: false
        },
        syncSettings: {
          autoSync: false,
          syncFrequency: 'weekly',
          syncTypes: ['profile', 'content']
        }
      },
      {
        id: 'tidal',
        name: 'Tidal',
        icon: '🌊',
        isConnected: false,
        lastSync: null,
        syncStatus: 'pending',
        apiStatus: 'active',
        features: {
          profileSync: true,
          analyticsSync: true,
          contentDistribution: true,
          playlistPlacement: true
        },
        syncSettings: {
          autoSync: false,
          syncFrequency: 'daily',
          syncTypes: ['profile', 'analytics']
        }
      }
    ],
    recentActivity: [
      {
        id: 'act-001',
        platformId: 'spotify',
        platformName: 'Spotify',
        action: 'analytics_sync',
        status: 'success',
        timestamp: '2024-03-30T10:30:00Z',
        details: 'Successfully synced analytics data for March 2024',
        affectedItems: ['monthly_listeners', 'stream_counts', 'playlist_adds']
      },
      {
        id: 'act-002',
        platformId: 'apple_music',
        platformName: 'Apple Music',
        action: 'profile_update',
        status: 'success',
        timestamp: '2024-03-30T09:15:00Z',
        details: 'Updated artist bio and profile images',
        affectedItems: ['bio', 'profile_image', 'header_image']
      },
      {
        id: 'act-003',
        platformId: 'youtube_music',
        platformName: 'YouTube Music',
        action: 'analytics_sync',
        status: 'error',
        timestamp: '2024-03-30T08:45:00Z',
        details: 'Failed to sync analytics due to API rate limit',
        errorMessage: 'Rate limit exceeded. Retry after 15 minutes.',
        affectedItems: ['view_counts', 'subscriber_data']
      },
      {
        id: 'act-004',
        platformId: 'soundcloud',
        platformName: 'SoundCloud',
        action: 'content_upload',
        status: 'success',
        timestamp: '2024-03-30T07:20:00Z',
        details: 'Successfully uploaded "Midnight Dreams" track',
        affectedItems: ['midnight_dreams_track']
      },
      {
        id: 'act-005',
        platformId: 'spotify',
        platformName: 'Spotify',
        action: 'playlist_update',
        status: 'success',
        timestamp: '2024-03-29T16:45:00Z',
        details: 'Added to 3 editorial playlists',
        affectedItems: ['chill_vibes_playlist', 'new_music_friday', 'indie_discoveries']
      }
    ],
    syncStatistics: {
      totalPlatforms: 6,
      connectedPlatforms: 4,
      successfulSyncs: 127,
      failedSyncs: 8,
      lastSyncTime: '2024-03-30T11:00:00Z',
      nextScheduledSync: '2024-03-31T09:00:00Z'
    }
  };

  useEffect(() => {
    const loadProfilesData = async () => {
      setLoading(true);
      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        setProfilesData(sampleProfilesData);
      } catch (error) {
        console.error('Failed to load profiles data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadProfilesData();
  }, []);

  const handleConnectPlatform = (platformId: string) => {
    console.log(`Connecting to platform: ${platformId}`);
    // Handle platform connection
  };

  const handleDisconnectPlatform = (platformId: string) => {
    console.log(`Disconnecting from platform: ${platformId}`);
    // Handle platform disconnection
  };

  const handleSyncPlatform = (platformId: string) => {
    console.log(`Syncing platform: ${platformId}`);
    // Handle manual sync
  };

  const handleUpdateSyncSettings = (platformId: string, settings: any) => {
    console.log(`Updating sync settings for ${platformId}:`, settings);
    // Handle sync settings update
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🔗</div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Loading Profiles...</h2>
          <p className="text-gray-600">Please wait while we load your platform connections.</p>
        </div>
      </div>
    );
  }

  if (!profilesData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">❌</div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Failed to Load Profiles</h2>
          <p className="text-gray-600 mb-4">There was an error loading your profile data.</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Platform Profiles</h1>
            <p className="text-gray-600 mt-1">Manage your artist profiles across streaming platforms</p>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={() => navigate('/music/catalog')}
              className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-2 px-4 rounded-lg transition-colors"
            >
              📚 Catalog
            </button>
            <button
              onClick={() => navigate('/music/analytics')}
              className="bg-blue-100 hover:bg-blue-200 text-blue-700 font-medium py-2 px-4 rounded-lg transition-colors"
            >
              📊 Analytics
            </button>
            <button
              onClick={() => setShowWizard(true)}
              className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
            >
              ➕ Connect Platform
            </button>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-gray-600">Connected Platforms</h3>
              <span className="text-green-600 text-2xl">🔗</span>
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-2">
              {profilesData.syncStatistics.connectedPlatforms}/{profilesData.syncStatistics.totalPlatforms}
            </div>
            <div className="text-sm text-green-600">
              {Math.round((profilesData.syncStatistics.connectedPlatforms / profilesData.syncStatistics.totalPlatforms) * 100)}% connected
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-gray-600">Total Followers</h3>
              <span className="text-blue-600 text-2xl">👥</span>
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-2">
              {profilesData.platforms.filter(p => p.isConnected).reduce((sum, p) => sum + (p.followerCount || 0), 0).toLocaleString()}
            </div>
            <div className="text-sm text-blue-600">Across all platforms</div>
          </div>

          <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-gray-600">Successful Syncs</h3>
              <span className="text-purple-600 text-2xl">✅</span>
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-2">
              {profilesData.syncStatistics.successfulSyncs}
            </div>
            <div className="text-sm text-purple-600">
              {Math.round((profilesData.syncStatistics.successfulSyncs / (profilesData.syncStatistics.successfulSyncs + profilesData.syncStatistics.failedSyncs)) * 100)}% success rate
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-gray-600">Last Sync</h3>
              <span className="text-orange-600 text-2xl">🔄</span>
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-2">
              {new Date(profilesData.syncStatistics.lastSyncTime).toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit'
              })}
            </div>
            <div className="text-sm text-orange-600">
              {new Date(profilesData.syncStatistics.lastSyncTime).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric'
              })}
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              <button
                onClick={() => setActiveTab('dashboard')}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'dashboard'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                📊 Sync Dashboard
              </button>
              <button
                onClick={() => setActiveTab('platforms')}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'platforms'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                🔗 Platform Connections
              </button>
              <button
                onClick={() => setActiveTab('wizard')}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'wizard'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                🧙‍♂️ Setup Wizard
              </button>
            </nav>
          </div>

          <div className="p-6">
            {activeTab === 'dashboard' && (
              <SyncStatusDashboard
                platforms={profilesData.platforms}
                recentActivity={profilesData.recentActivity}
                onSyncPlatform={handleSyncPlatform}
                onViewPlatform={(platformId) => {
                  console.log(`Viewing platform: ${platformId}`);
                }}
                onRetrySync={(platformId) => {
                  console.log(`Retrying sync for platform: ${platformId}`);
                }}
              />
            )}

            {activeTab === 'platforms' && (
              <PlatformConnections
                platforms={profilesData.platforms}
                onConnect={handleConnectPlatform}
                onDisconnect={handleDisconnectPlatform}
                onSync={handleSyncPlatform}
                onUpdateSettings={handleUpdateSyncSettings}
                onViewProfile={(platformId) => {
                  const platform = profilesData.platforms.find(p => p.id === platformId);
                  if (platform?.profileUrl) {
                    window.open(platform.profileUrl, '_blank');
                  }
                }}
              />
            )}

            {activeTab === 'wizard' && (
              <ProfileSyncWizard
                onComplete={(selectedPlatforms, syncSettings) => {
                  console.log('Wizard completed:', { selectedPlatforms, syncSettings });
                  setActiveTab('dashboard');
                }}
                onCancel={() => setActiveTab('dashboard')}
                existingConnections={profilesData.platforms.filter(p => p.isConnected)}
              />
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Quick Actions</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <button
              onClick={() => setShowWizard(true)}
              className="bg-green-50 hover:bg-green-100 border border-green-200 text-green-700 font-medium py-3 px-4 rounded-lg transition-colors"
            >
              ➕ Connect New Platform
            </button>
            <button
              onClick={() => {
                profilesData.platforms.filter(p => p.isConnected).forEach(p => handleSyncPlatform(p.id));
              }}
              className="bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-700 font-medium py-3 px-4 rounded-lg transition-colors"
            >
              🔄 Sync All Platforms
            </button>
            <button className="bg-purple-50 hover:bg-purple-100 border border-purple-200 text-purple-700 font-medium py-3 px-4 rounded-lg transition-colors">
              📊 View Detailed Analytics
            </button>
            <button className="bg-orange-50 hover:bg-orange-100 border border-orange-200 text-orange-700 font-medium py-3 px-4 rounded-lg transition-colors">
              ⚙️ Sync Settings
            </button>
          </div>
        </div>
      </div>

      {/* Profile Sync Wizard Modal */}
      {showWizard && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900">Platform Connection Wizard</h2>
                <button
                  onClick={() => setShowWizard(false)}
                  className="text-gray-400 hover:text-gray-600 text-2xl"
                >
                  ×
                </button>
              </div>
            </div>
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
              <ProfileSyncWizard
                onComplete={(selectedPlatforms, syncSettings) => {
                  console.log('Wizard completed:', { selectedPlatforms, syncSettings });
                  setShowWizard(false);
                  setActiveTab('dashboard');
                }}
                onCancel={() => setShowWizard(false)}
                existingConnections={profilesData.platforms.filter(p => p.isConnected)}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfilesPage;
