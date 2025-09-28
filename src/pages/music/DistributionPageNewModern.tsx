import React, { useState } from 'react';
import { Globe, Wifi, WifiOff, Clock, CheckCircle, AlertCircle, XCircle, Settings, Link, Zap, TrendingUp, Play } from 'lucide-react';

interface Platform {
  id: string;
  name: string;
  icon: string;
  color: string;
  status: 'connected' | 'disconnected' | 'pending' | 'error';
  lastSync: string;
  releases: number;
  revenue: number;
  royaltyRate: number;
  features: string[];
}

interface Release {
  id: string;
  title: string;
  artist: string;
  status: 'scheduled' | 'processing' | 'live' | 'failed';
  platforms: string[];
  releaseDate: string;
  goLiveDate?: string;
}

const DistributionPageNewModern: React.FC = () => {
  const [selectedTab, setSelectedTab] = useState<'platforms' | 'releases' | 'analytics'>('platforms');
  const [showConnectModal, setShowConnectModal] = useState(false);

  const platforms: Platform[] = [
    {
      id: 'spotify',
      name: 'Spotify',
      icon: '🎵',
      color: '#1DB954',
      status: 'connected',
      lastSync: '2024-09-10T10:30:00Z',
      releases: 45,
      revenue: 8950,
      royaltyRate: 0.004,
      features: ['Playlist Pitching', 'Canvas Videos', 'Artist Profile']
    },
    {
      id: 'apple-music',
      name: 'Apple Music',
      icon: '🍎',
      color: '#FA243C',
      status: 'connected',
      lastSync: '2024-09-10T10:25:00Z',
      releases: 45,
      revenue: 7240,
      royaltyRate: 0.007,
      features: ['Apple Music for Artists', 'Spatial Audio', 'Music Videos']
    },
    {
      id: 'youtube-music',
      name: 'YouTube Music',
      icon: '📺',
      color: '#FF0000',
      status: 'connected',
      lastSync: '2024-09-10T09:45:00Z',
      releases: 42,
      revenue: 2180,
      royaltyRate: 0.002,
      features: ['YouTube Content ID', 'Music Videos', 'Shorts Integration']
    },
    {
      id: 'amazon-music',
      name: 'Amazon Music',
      icon: '📦',
      color: '#FF9900',
      status: 'connected',
      lastSync: '2024-09-10T08:20:00Z',
      releases: 38,
      revenue: 3420,
      royaltyRate: 0.005,
      features: ['Alexa Integration', 'HD Audio', 'Prime Music']
    },
    {
      id: 'deezer',
      name: 'Deezer',
      icon: '🎶',
      color: '#8B5CF6',
      status: 'pending',
      lastSync: '2024-09-09T15:30:00Z',
      releases: 25,
      revenue: 890,
      royaltyRate: 0.006,
      features: ['Flow Playlists', 'HiFi Audio', 'Artist Dashboard']
    },
    {
      id: 'tidal',
      name: 'Tidal',
      icon: '🌊',
      color: '#3B82F6',
      status: 'error',
      lastSync: '2024-09-08T12:00:00Z',
      releases: 20,
      revenue: 650,
      royaltyRate: 0.012,
      features: ['Master Quality Audio', 'Music Videos', 'Artist Payouts']
    },
    {
      id: 'bandcamp',
      name: 'Bandcamp',
      icon: '🎸',
      color: '#629AA0',
      status: 'disconnected',
      lastSync: '',
      releases: 0,
      revenue: 0,
      royaltyRate: 0.10,
      features: ['Direct Fan Support', 'Physical Sales', 'Fan Messaging']
    },
    {
      id: 'soundcloud',
      name: 'SoundCloud',
      icon: '☁️',
      color: '#FF7700',
      status: 'disconnected',
      lastSync: '',
      releases: 0,
      revenue: 0,
      royaltyRate: 0.005,
      features: ['Pro Features', 'Repost Network', 'Fan Engagement']
    }
  ];

  const releases: Release[] = [
    {
      id: '1',
      title: 'Midnight Dreams',
      artist: 'The Synthwave',
      status: 'live',
      platforms: ['Spotify', 'Apple Music', 'YouTube Music', 'Amazon Music'],
      releaseDate: '2024-01-15',
      goLiveDate: '2024-01-15T00:00:00Z'
    },
    {
      id: '2',
      title: 'Electric Pulse',
      artist: 'Neon Beats',
      status: 'live',
      platforms: ['All Platforms'],
      releaseDate: '2024-02-10',
      goLiveDate: '2024-02-10T00:00:00Z'
    },
    {
      id: '3',
      title: 'Urban Vibes',
      artist: 'City Sound',
      status: 'processing',
      platforms: ['Spotify', 'Apple Music'],
      releaseDate: '2024-03-01'
    },
    {
      id: '4',
      title: 'Deep House Session',
      artist: 'DJ Pulse',
      status: 'scheduled',
      platforms: ['All Platforms'],
      releaseDate: '2024-03-15'
    }
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'connected': return <CheckCircle size={20} className="text-green-500" />;
      case 'pending': return <Clock size={20} className="text-yellow-500" />;
      case 'error': return <XCircle size={20} className="text-red-500" />;
      case 'disconnected': return <WifiOff size={20} className="text-gray-400" />;
      case 'live': return <CheckCircle size={20} className="text-green-500" />;
      case 'processing': return <Clock size={20} className="text-yellow-500" />;
      case 'scheduled': return <Clock size={20} className="text-blue-500" />;
      case 'failed': return <XCircle size={20} className="text-red-500" />;
      default: return <WifiOff size={20} className="text-gray-400" />;
    }
  };

  const getStatusGradient = (status: string) => {
    switch (status) {
      case 'connected': return 'linear-gradient(135deg, #10b981, #059669)';
      case 'pending': return 'linear-gradient(135deg, #f59e0b, #d97706)';
      case 'error': return 'linear-gradient(135deg, #ef4444, #dc2626)';
      case 'disconnected': return 'linear-gradient(135deg, #6b7280, #4b5563)';
      case 'live': return 'linear-gradient(135deg, #10b981, #059669)';
      case 'processing': return 'linear-gradient(135deg, #f59e0b, #d97706)';
      case 'scheduled': return 'linear-gradient(135deg, #3b82f6, #2563eb)';
      case 'failed': return 'linear-gradient(135deg, #ef4444, #dc2626)';
      default: return 'linear-gradient(135deg, #6b7280, #4b5563)';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  return (
    <div style={{
      minHeight: '100vh',
      backgroundImage: 'linear-gradient(rgba(0,0,0,0.3), rgba(0,0,0,0.5)), url(https://images.unsplash.com/photo-1519389950473-47ba0277781c?q=80&w=2070)',
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundAttachment: 'fixed',
      padding: '24px'
    }}>
      {/* Header */}
      <div style={{
        background: 'rgba(255, 255, 255, 0.25)',
        borderRadius: '20px',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        padding: '32px',
        border: '1px solid rgba(255, 255, 255, 0.2)',
        backdropFilter: 'blur(16px)',
        marginBottom: '32px'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '24px'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '16px'
          }}>
            <div style={{
              width: '48px',
              height: '48px',
              background: 'linear-gradient(135deg, #667eea, #764ba2)',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 8px 25px -8px rgba(102, 126, 234, 0.4)'
            }}>
              <Globe size={24} className="text-white" />
            </div>
            <div>
              <h1 style={{
                fontSize: '32px',
                fontWeight: 'bold',
                color: 'white',
                margin: '0'
              }}>Distribution Center</h1>
              <p style={{
                color: 'rgba(255, 255, 255, 0.8)',
                margin: '8px 0 0 0'
              }}>Manage multi-platform distribution and release scheduling</p>
            </div>
          </div>
          <button
            onClick={() => setShowConnectModal(true)}
            style={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              fontWeight: '600',
              padding: '12px 24px',
              borderRadius: '12px',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              boxShadow: '0 8px 25px -8px rgba(102, 126, 234, 0.4)',
              transition: 'all 0.3s'
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
            <Link size={20} />
            <span>Connect Platform</span>
          </button>
        </div>

        {/* Navigation Tabs */}
        <div style={{
          display: 'flex',
          gap: '8px',
          background: 'rgba(255, 255, 255, 0.2)',
          borderRadius: '12px',
          padding: '8px',
          backdropFilter: 'blur(8px)'
        }}>
          {(['platforms', 'releases', 'analytics'] as const).map((tab) => (
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
                background: selectedTab === tab
                  ? 'rgba(255, 255, 255, 0.9)'
                  : 'transparent',
                color: selectedTab === tab
                  ? '#667eea'
                  : 'rgba(255, 255, 255, 0.8)',
                boxShadow: selectedTab === tab
                  ? '0 4px 12px rgba(0, 0, 0, 0.1)'
                  : 'none',
                transition: 'all 0.3s'
              }}
            >
              {tab === 'platforms' ? '🔗 Platforms' :
               tab === 'releases' ? '🚀 Releases' : '📊 Analytics'}
            </button>
          ))}
        </div>
      </div>

      {/* Platform Management */}
      {selectedTab === 'platforms' && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
          gap: '24px'
        }}>
          {platforms.map((platform) => (
            <div
              key={platform.id}
              style={{
                background: 'rgba(255, 255, 255, 0.25)',
                borderRadius: '20px',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                backdropFilter: 'blur(16px)',
                overflow: 'hidden',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px) scale(1.02)';
                e.currentTarget.style.boxShadow = '0 32px 64px -12px rgba(0, 0, 0, 0.4)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0) scale(1)';
                e.currentTarget.style.boxShadow = '0 25px 50px -12px rgba(0, 0, 0, 0.25)';
              }}
            >
              {/* Platform Header */}
              <div style={{
                padding: '24px 24px 20px 24px',
                borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: '16px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{
                      width: '48px',
                      height: '48px',
                      background: platform.color,
                      borderRadius: '12px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '20px',
                      boxShadow: `0 8px 25px -8px ${platform.color}40`
                    }}>
                      {platform.icon}
                    </div>
                    <div>
                      <h3 style={{
                        fontSize: '18px',
                        fontWeight: '700',
                        color: 'white',
                        margin: '0 0 4px 0'
                      }}>{platform.name}</h3>
                      <p style={{
                        fontSize: '14px',
                        color: 'rgba(255, 255, 255, 0.7)',
                        margin: '0'
                      }}>{platform.releases} releases</p>
                    </div>
                  </div>
                  <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'flex-end'
                  }}>
                    <div style={{
                      background: getStatusGradient(platform.status),
                      padding: '4px 12px',
                      borderRadius: '12px',
                      fontSize: '12px',
                      fontWeight: '600',
                      color: 'white',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}>
                      {getStatusIcon(platform.status)}
                      {platform.status.toUpperCase()}
                    </div>
                  </div>
                </div>
              </div>

              {/* Platform Stats */}
              <div style={{
                padding: '20px 24px',
                borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
              }}>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '16px',
                  marginBottom: '16px'
                }}>
                  <div>
                    <p style={{
                      fontSize: '12px',
                      color: 'rgba(255, 255, 255, 0.6)',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px',
                      margin: '0 0 4px 0'
                    }}>Revenue</p>
                    <p style={{
                      fontSize: '18px',
                      fontWeight: '700',
                      color: 'white',
                      margin: '0'
                    }}>
                      ${platform.revenue.toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p style={{
                      fontSize: '12px',
                      color: 'rgba(255, 255, 255, 0.6)',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px',
                      margin: '0 0 4px 0'
                    }}>Rate</p>
                    <p style={{
                      fontSize: '18px',
                      fontWeight: '700',
                      color: 'white',
                      margin: '0'
                    }}>
                      ${platform.royaltyRate.toFixed(3)}
                    </p>
                  </div>
                </div>
                {platform.lastSync && (
                  <div>
                    <p style={{
                      fontSize: '12px',
                      color: 'rgba(255, 255, 255, 0.6)',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px',
                      margin: '0 0 4px 0'
                    }}>Last Sync</p>
                    <p style={{
                      fontSize: '14px',
                      color: 'rgba(255, 255, 255, 0.8)',
                      margin: '0'
                    }}>{formatTime(platform.lastSync)}</p>
                  </div>
                )}
              </div>

              {/* Platform Features */}
              <div style={{ padding: '20px 24px' }}>
                <p style={{
                  fontSize: '12px',
                  color: 'rgba(255, 255, 255, 0.6)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                  margin: '0 0 12px 0'
                }}>Features</p>
                <div style={{ marginBottom: '20px' }}>
                  {platform.features.slice(0, 3).map((feature, index) => (
                    <p
                      key={index}
                      style={{
                        fontSize: '14px',
                        color: 'rgba(255, 255, 255, 0.8)',
                        margin: '0 0 4px 0',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                      }}
                    >
                      <span style={{ color: platform.color }}>•</span>
                      {feature}
                    </p>
                  ))}
                </div>

                {/* Action Buttons */}
                <div style={{ display: 'flex', gap: '8px' }}>
                  {platform.status === 'connected' ? (
                    <>
                      <button style={{
                        flex: 1,
                        background: 'rgba(255, 255, 255, 0.2)',
                        color: 'white',
                        fontSize: '14px',
                        fontWeight: '500',
                        padding: '10px 16px',
                        borderRadius: '8px',
                        border: 'none',
                        cursor: 'pointer',
                        backdropFilter: 'blur(4px)',
                        transition: 'all 0.3s',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.3)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)';
                      }}
                      >
                        <Settings size={16} />
                        Settings
                      </button>
                      <button style={{
                        flex: 1,
                        background: 'linear-gradient(135deg, #ef4444, #dc2626)',
                        color: 'white',
                        fontSize: '14px',
                        fontWeight: '500',
                        padding: '10px 16px',
                        borderRadius: '8px',
                        border: 'none',
                        cursor: 'pointer',
                        transition: 'all 0.3s',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'translateY(-1px)';
                        e.currentTarget.style.boxShadow = '0 8px 20px rgba(239, 68, 68, 0.4)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = 'none';
                      }}
                      >
                        <WifiOff size={16} />
                        Disconnect
                      </button>
                    </>
                  ) : (
                    <button style={{
                      width: '100%',
                      background: `linear-gradient(135deg, ${platform.color}, ${platform.color}dd)`,
                      color: 'white',
                      fontSize: '14px',
                      fontWeight: '600',
                      padding: '12px 16px',
                      borderRadius: '8px',
                      border: 'none',
                      cursor: 'pointer',
                      transition: 'all 0.3s',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-1px)';
                      e.currentTarget.style.boxShadow = `0 8px 20px ${platform.color}40`;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                    >
                      <Wifi size={16} />
                      Connect
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Release Scheduling */}
      {selectedTab === 'releases' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
          {/* Release Schedule Cards */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(500px, 1fr))',
            gap: '24px'
          }}>
            {releases.map((release) => (
              <div
                key={release.id}
                style={{
                  background: 'rgba(255, 255, 255, 0.25)',
                  borderRadius: '20px',
                  boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  backdropFilter: 'blur(16px)',
                  padding: '24px',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-4px)';
                  e.currentTarget.style.boxShadow = '0 32px 64px -12px rgba(0, 0, 0, 0.4)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 25px 50px -12px rgba(0, 0, 0, 0.25)';
                }}
              >
                <div style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  justifyContent: 'space-between',
                  marginBottom: '16px'
                }}>
                  <div>
                    <h3 style={{
                      fontSize: '20px',
                      fontWeight: '700',
                      color: 'white',
                      margin: '0 0 4px 0'
                    }}>{release.title}</h3>
                    <p style={{
                      fontSize: '16px',
                      color: 'rgba(255, 255, 255, 0.7)',
                      margin: '0'
                    }}>{release.artist}</p>
                  </div>
                  <span style={{
                    background: getStatusGradient(release.status),
                    padding: '6px 12px',
                    borderRadius: '12px',
                    fontSize: '12px',
                    fontWeight: '600',
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}>
                    {getStatusIcon(release.status)}
                    {release.status.toUpperCase()}
                  </span>
                </div>

                <div style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '16px',
                  marginBottom: '16px'
                }}>
                  <div>
                    <p style={{
                      fontSize: '12px',
                      color: 'rgba(255, 255, 255, 0.6)',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px',
                      margin: '0 0 4px 0'
                    }}>Release Date</p>
                    <p style={{
                      fontSize: '16px',
                      fontWeight: '600',
                      color: 'white',
                      margin: '0'
                    }}>{formatDate(release.releaseDate)}</p>
                  </div>
                  {release.goLiveDate && (
                    <div>
                      <p style={{
                        fontSize: '12px',
                        color: 'rgba(255, 255, 255, 0.6)',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px',
                        margin: '0 0 4px 0'
                      }}>Go Live</p>
                      <p style={{
                        fontSize: '16px',
                        fontWeight: '600',
                        color: 'white',
                        margin: '0'
                      }}>{formatTime(release.goLiveDate)}</p>
                    </div>
                  )}
                </div>

                <div style={{ marginBottom: '20px' }}>
                  <p style={{
                    fontSize: '12px',
                    color: 'rgba(255, 255, 255, 0.6)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
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
                          border: '1px solid rgba(255, 255, 255, 0.3)',
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

                <div style={{ display: 'flex', gap: '8px' }}>
                  <button style={{
                    flex: 1,
                    background: 'rgba(255, 255, 255, 0.2)',
                    color: 'white',
                    fontSize: '14px',
                    fontWeight: '500',
                    padding: '10px 16px',
                    borderRadius: '8px',
                    border: 'none',
                    cursor: 'pointer',
                    backdropFilter: 'blur(4px)',
                    transition: 'all 0.3s'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.3)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)';
                  }}
                  >
                    Edit Schedule
                  </button>
                  <button style={{
                    flex: 1,
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    color: 'white',
                    fontSize: '14px',
                    fontWeight: '500',
                    padding: '10px 16px',
                    borderRadius: '8px',
                    border: 'none',
                    cursor: 'pointer',
                    transition: 'all 0.3s'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-1px)';
                    e.currentTarget.style.boxShadow = '0 8px 20px rgba(102, 126, 234, 0.4)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                  >
                    View Status
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Quick Actions */}
          <div style={{
            background: 'rgba(255, 255, 255, 0.25)',
            borderRadius: '20px',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            backdropFilter: 'blur(16px)',
            padding: '24px'
          }}>
            <h3 style={{
              fontSize: '24px',
              fontWeight: '700',
              color: 'white',
              marginBottom: '20px'
            }}>Quick Actions</h3>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
              gap: '16px'
            }}>
              <button style={{
                display: 'flex',
                alignItems: 'center',
                gap: '16px',
                padding: '20px',
                background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.2), rgba(37, 99, 235, 0.2))',
                borderRadius: '16px',
                border: '1px solid rgba(59, 130, 246, 0.3)',
                cursor: 'pointer',
                transition: 'all 0.3s',
                backdropFilter: 'blur(8px)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'linear-gradient(135deg, rgba(59, 130, 246, 0.3), rgba(37, 99, 235, 0.3))';
                e.currentTarget.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'linear-gradient(135deg, rgba(59, 130, 246, 0.2), rgba(37, 99, 235, 0.2))';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
              >
                <div style={{ fontSize: '32px' }}>🚀</div>
                <div style={{ textAlign: 'left' }}>
                  <p style={{
                    fontSize: '16px',
                    fontWeight: '600',
                    color: 'white',
                    margin: '0 0 4px 0'
                  }}>Schedule Release</p>
                  <p style={{
                    fontSize: '14px',
                    color: 'rgba(255, 255, 255, 0.7)',
                    margin: '0'
                  }}>Plan your next drop</p>
                </div>
              </button>

              <button style={{
                display: 'flex',
                alignItems: 'center',
                gap: '16px',
                padding: '20px',
                background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.2), rgba(5, 150, 105, 0.2))',
                borderRadius: '16px',
                border: '1px solid rgba(16, 185, 129, 0.3)',
                cursor: 'pointer',
                transition: 'all 0.3s',
                backdropFilter: 'blur(8px)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'linear-gradient(135deg, rgba(16, 185, 129, 0.3), rgba(5, 150, 105, 0.3))';
                e.currentTarget.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'linear-gradient(135deg, rgba(16, 185, 129, 0.2), rgba(5, 150, 105, 0.2))';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
              >
                <div style={{ fontSize: '32px' }}>🔄</div>
                <div style={{ textAlign: 'left' }}>
                  <p style={{
                    fontSize: '16px',
                    fontWeight: '600',
                    color: 'white',
                    margin: '0 0 4px 0'
                  }}>Sync Platforms</p>
                  <p style={{
                    fontSize: '14px',
                    color: 'rgba(255, 255, 255, 0.7)',
                    margin: '0'
                  }}>Update all connections</p>
                </div>
              </button>

              <button style={{
                display: 'flex',
                alignItems: 'center',
                gap: '16px',
                padding: '20px',
                background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.2), rgba(124, 58, 237, 0.2))',
                borderRadius: '16px',
                border: '1px solid rgba(139, 92, 246, 0.3)',
                cursor: 'pointer',
                transition: 'all 0.3s',
                backdropFilter: 'blur(8px)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'linear-gradient(135deg, rgba(139, 92, 246, 0.3), rgba(124, 58, 237, 0.3))';
                e.currentTarget.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'linear-gradient(135deg, rgba(139, 92, 246, 0.2), rgba(124, 58, 237, 0.2))';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
              >
                <div style={{ fontSize: '32px' }}>📊</div>
                <div style={{ textAlign: 'left' }}>
                  <p style={{
                    fontSize: '16px',
                    fontWeight: '600',
                    color: 'white',
                    margin: '0 0 4px 0'
                  }}>Generate Report</p>
                  <p style={{
                    fontSize: '14px',
                    color: 'rgba(255, 255, 255, 0.7)',
                    margin: '0'
                  }}>Distribution analytics</p>
                </div>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Distribution Analytics */}
      {selectedTab === 'analytics' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
          {/* Overview Cards */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '24px'
          }}>
            <div style={{
              background: 'rgba(255, 255, 255, 0.25)',
              borderRadius: '20px',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              backdropFilter: 'blur(16px)',
              padding: '24px',
              transition: 'all 0.3s'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-4px)';
              e.currentTarget.style.boxShadow = '0 32px 64px -12px rgba(0, 0, 0, 0.4)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 25px 50px -12px rgba(0, 0, 0, 0.25)';
            }}
            >
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '16px'
              }}>
                <div style={{
                  width: '48px',
                  height: '48px',
                  background: 'linear-gradient(135deg, #667eea, #764ba2)',
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <Globe size={24} className="text-white" />
                </div>
                <TrendingUp size={20} style={{color: '#10b981'}} />
              </div>
              <h3 style={{
                fontSize: '28px',
                fontWeight: '700',
                color: 'white',
                margin: '0 0 4px 0'
              }}>8</h3>
              <p style={{
                fontSize: '16px',
                color: 'rgba(255, 255, 255, 0.8)',
                margin: '0'
              }}>Connected Platforms</p>
            </div>

            <div style={{
              background: 'rgba(255, 255, 255, 0.25)',
              borderRadius: '20px',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              backdropFilter: 'blur(16px)',
              padding: '24px',
              transition: 'all 0.3s'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-4px)';
              e.currentTarget.style.boxShadow = '0 32px 64px -12px rgba(0, 0, 0, 0.4)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 25px 50px -12px rgba(0, 0, 0, 0.25)';
            }}
            >
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '16px'
              }}>
                <div style={{
                  width: '48px',
                  height: '48px',
                  background: 'linear-gradient(135deg, #10b981, #059669)',
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <Play size={24} className="text-white" />
                </div>
                <TrendingUp size={20} style={{color: '#10b981'}} />
              </div>
              <h3 style={{
                fontSize: '28px',
                fontWeight: '700',
                color: 'white',
                margin: '0 0 4px 0'
              }}>45</h3>
              <p style={{
                fontSize: '16px',
                color: 'rgba(255, 255, 255, 0.8)',
                margin: '0'
              }}>Total Releases</p>
            </div>

            <div style={{
              background: 'rgba(255, 255, 255, 0.25)',
              borderRadius: '20px',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              backdropFilter: 'blur(16px)',
              padding: '24px',
              transition: 'all 0.3s'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-4px)';
              e.currentTarget.style.boxShadow = '0 32px 64px -12px rgba(0, 0, 0, 0.4)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 25px 50px -12px rgba(0, 0, 0, 0.25)';
            }}
            >
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '16px'
              }}>
                <div style={{
                  width: '48px',
                  height: '48px',
                  background: 'linear-gradient(135deg, #8B5CF6, #7C3AED)',
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <span style={{color: 'white', fontSize: '24px'}}>💰</span>
                </div>
                <TrendingUp size={20} style={{color: '#10b981'}} />
              </div>
              <h3 style={{
                fontSize: '28px',
                fontWeight: '700',
                color: 'white',
                margin: '0 0 4px 0'
              }}>$23K</h3>
              <p style={{
                fontSize: '16px',
                color: 'rgba(255, 255, 255, 0.8)',
                margin: '0'
              }}>Total Revenue</p>
            </div>

            <div style={{
              background: 'rgba(255, 255, 255, 0.25)',
              borderRadius: '20px',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              backdropFilter: 'blur(16px)',
              padding: '24px',
              transition: 'all 0.3s'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-4px)';
              e.currentTarget.style.boxShadow = '0 32px 64px -12px rgba(0, 0, 0, 0.4)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 25px 50px -12px rgba(0, 0, 0, 0.25)';
            }}
            >
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '16px'
              }}>
                <div style={{
                  width: '48px',
                  height: '48px',
                  background: 'linear-gradient(135deg, #FF9900, #FF7700)',
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <Zap size={24} className="text-white" />
                </div>
                <TrendingUp size={20} style={{color: '#10b981'}} />
              </div>
              <h3 style={{
                fontSize: '28px',
                fontWeight: '700',
                color: 'white',
                margin: '0 0 4px 0'
              }}>98%</h3>
              <p style={{
                fontSize: '16px',
                color: 'rgba(255, 255, 255, 0.8)',
                margin: '0'
              }}>Success Rate</p>
            </div>
          </div>

          {/* Platform Performance Chart */}
          <div style={{
            background: 'rgba(255, 255, 255, 0.25)',
            borderRadius: '20px',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            backdropFilter: 'blur(16px)',
            padding: '24px'
          }}>
            <h3 style={{
              fontSize: '24px',
              fontWeight: '700',
              color: 'white',
              marginBottom: '24px',
              display: 'flex',
              alignItems: 'center',
              gap: '12px'
            }}>
              <TrendingUp size={24} style={{color: '#667eea'}} />
              Platform Performance
            </h3>
            <div style={{
              height: '320px',
              background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.1), rgba(118, 75, 162, 0.1))',
              borderRadius: '16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '1px solid rgba(102, 126, 234, 0.2)',
              backdropFilter: 'blur(8px)'
            }}>
              <div style={{textAlign: 'center'}}>
                <div style={{fontSize: '64px', marginBottom: '16px'}}>📊</div>
                <p style={{
                  fontSize: '20px',
                  fontWeight: '600',
                  color: 'white',
                  margin: '0 0 8px 0'
                }}>Distribution Analytics Chart</p>
                <p style={{
                  fontSize: '16px',
                  color: 'rgba(255, 255, 255, 0.7)',
                  margin: '0'
                }}>Revenue and performance metrics by platform</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Connect Platform Modal */}
      {showConnectModal && (
        <div style={{
          position: 'fixed',
          inset: '0',
          background: 'rgba(0, 0, 0, 0.6)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '16px',
          backdropFilter: 'blur(8px)'
        }}>
          <div style={{
            background: 'rgba(255, 255, 255, 0.95)',
            borderRadius: '20px',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
            maxWidth: '600px',
            width: '100%',
            maxHeight: '90vh',
            overflowY: 'auto',
            backdropFilter: 'blur(16px)',
            border: '1px solid rgba(255, 255, 255, 0.2)'
          }}>
            <div style={{
              position: 'sticky',
              top: '0',
              background: 'rgba(255, 255, 255, 0.95)',
              borderBottom: '1px solid rgba(0, 0, 0, 0.1)',
              padding: '24px 24px 16px 24px',
              backdropFilter: 'blur(16px)',
              borderTopLeftRadius: '20px',
              borderTopRightRadius: '20px'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}>
                <h2 style={{
                  fontSize: '24px',
                  fontWeight: '700',
                  color: '#1f2937',
                  margin: '0'
                }}>Connect New Platform</h2>
                <button
                  onClick={() => setShowConnectModal(false)}
                  style={{
                    background: 'none',
                    border: 'none',
                    fontSize: '24px',
                    color: '#6b7280',
                    cursor: 'pointer',
                    padding: '4px',
                    borderRadius: '8px',
                    transition: 'all 0.3s'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(0, 0, 0, 0.1)';
                    e.currentTarget.style.color = '#374151';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'none';
                    e.currentTarget.style.color = '#6b7280';
                  }}
                >
                  ✕
                </button>
              </div>
            </div>

            <div style={{ padding: '24px' }}>
              <p style={{
                color: '#6b7280',
                marginBottom: '24px',
                fontSize: '16px'
              }}>Choose a platform to connect and start distributing your music</p>

              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                gap: '16px'
              }}>
                {platforms.filter(p => p.status === 'disconnected').map((platform) => (
                  <button
                    key={platform.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '16px',
                      padding: '20px',
                      border: '2px solid rgba(0, 0, 0, 0.1)',
                      borderRadius: '16px',
                      background: 'rgba(255, 255, 255, 0.8)',
                      cursor: 'pointer',
                      transition: 'all 0.3s',
                      backdropFilter: 'blur(8px)'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = platform.color;
                      e.currentTarget.style.background = `${platform.color}20`;
                      e.currentTarget.style.transform = 'translateY(-2px)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = 'rgba(0, 0, 0, 0.1)';
                      e.currentTarget.style.background = 'rgba(255, 255, 255, 0.8)';
                      e.currentTarget.style.transform = 'translateY(0)';
                    }}
                  >
                    <div style={{
                      width: '48px',
                      height: '48px',
                      background: platform.color,
                      borderRadius: '12px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '20px'
                    }}>
                      {platform.icon}
                    </div>
                    <div style={{ flex: 1, textAlign: 'left' }}>
                      <h3 style={{
                        fontSize: '18px',
                        fontWeight: '600',
                        color: '#1f2937',
                        margin: '0 0 4px 0'
                      }}>{platform.name}</h3>
                      <p style={{
                        fontSize: '14px',
                        color: '#6b7280',
                        margin: '0'
                      }}>${platform.royaltyRate.toFixed(3)} per stream</p>
                    </div>
                    <div style={{
                      color: platform.color,
                      fontSize: '20px',
                      fontWeight: 'bold'
                    }}>→</div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DistributionPageNewModern;
