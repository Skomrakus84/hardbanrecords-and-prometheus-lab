import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useMusicStore } from '../../store/musicStore';
import { useArtistStore } from '../../store/artistStore';

export const MusicDashboard: React.FC = () => {
  const {
    releases,
    loading: musicLoading,
    fetchReleases
  } = useMusicStore();

  const {
    artists,
    isLoading: artistsLoading,
    fetchArtists
  } = useArtistStore();

  const isLoading = musicLoading || artistsLoading;

  // Calculate stats from available data
  const musicStats = {
    totalStreams: artists.reduce((sum, artist) => sum + (artist.totalStreams || 0), 0),
    totalRevenue: artists.reduce((sum, artist) => sum + (artist.totalRevenue || 0), 0)
  };

  useEffect(() => {
    fetchReleases();
    fetchArtists();
  }, [fetchReleases, fetchArtists]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-white"></div>
      </div>
    );
  }

  return (
    <div 
      style={{
        minHeight: '100vh',
        padding: '24px',
        background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.97) 0%, rgba(15, 23, 42, 0.95) 100%), url("/images/modern-studio.jpg")',
        backgroundSize: 'cover',
        backgroundAttachment: 'fixed'
      }}
    >
      {/* Header */}
      <div style={{ marginBottom: '32px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h1 style={{ 
              fontSize: '48px', 
              fontWeight: '700', 
              color: '#f8fafc',
              display: 'flex',
              alignItems: 'center',
              gap: '16px',
              margin: '0 0 8px 0'
            }}>
              🎵 Music Dashboard
            </h1>
            <p style={{ color: '#94a3b8', fontSize: '18px', margin: 0 }}>Manage your music catalog and artists</p>
          </div>
          <Link
            to="/music/releases/new"
            style={{
              background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
              color: 'white',
              padding: '12px 24px',
              borderRadius: '16px',
              fontWeight: '600',
              textDecoration: 'none',
              transition: 'all 0.3s ease',
              boxShadow: '0 10px 30px rgba(59, 130, 246, 0.3)',
              border: '1px solid rgba(255, 255, 255, 0.1)'
            }}
          >
            ➕ New Release
          </Link>
        </div>
      </div>

      {/* Stats Overview */}
      <div style={{ marginBottom: '32px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' }}>
          <div style={{
            background: 'rgba(255, 255, 255, 0.05)',
            backdropFilter: 'blur(20px)',
            borderRadius: '20px',
            padding: '24px',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <p style={{ color: '#94a3b8', fontSize: '14px', fontWeight: '500', margin: '0 0 8px 0' }}>Total Releases</p>
                <p style={{ fontSize: '32px', fontWeight: '700', color: '#f8fafc', margin: 0 }}>{releases.length}</p>
              </div>
              <div style={{ fontSize: '32px' }}>🎼</div>
            </div>
            <div style={{ marginTop: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ color: '#22c55e', fontSize: '14px' }}>📈 +12%</span>
              <span style={{ color: '#94a3b8', fontSize: '14px' }}>this month</span>
            </div>
          </div>

          <div style={{
            background: 'rgba(255, 255, 255, 0.05)',
            backdropFilter: 'blur(20px)',
            borderRadius: '20px',
            padding: '24px',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <p style={{ color: '#94a3b8', fontSize: '14px', fontWeight: '500', margin: '0 0 8px 0' }}>Active Artists</p>
                <p style={{ fontSize: '32px', fontWeight: '700', color: '#f8fafc', margin: 0 }}>{artists.length}</p>
              </div>
              <div style={{ fontSize: '32px' }}>🎤</div>
            </div>
            <div style={{ marginTop: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ color: '#22c55e', fontSize: '14px' }}>🆕 +3</span>
              <span style={{ color: '#94a3b8', fontSize: '14px' }}>new this week</span>
            </div>
          </div>

          <div style={{
            background: 'rgba(255, 255, 255, 0.05)',
            backdropFilter: 'blur(20px)',
            borderRadius: '20px',
            padding: '24px',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <p style={{ color: '#94a3b8', fontSize: '14px', fontWeight: '500', margin: '0 0 8px 0' }}>Monthly Streams</p>
                <p style={{ fontSize: '32px', fontWeight: '700', color: '#f8fafc', margin: 0 }}>{musicStats.totalStreams.toLocaleString()}</p>
              </div>
              <div style={{ fontSize: '32px' }}>📊</div>
            </div>
            <div style={{ marginTop: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ color: '#22c55e', fontSize: '14px' }}>🔥 +28%</span>
              <span style={{ color: '#94a3b8', fontSize: '14px' }}>vs last month</span>
            </div>
          </div>

          <div style={{
            background: 'rgba(255, 255, 255, 0.05)',
            backdropFilter: 'blur(20px)',
            borderRadius: '20px',
            padding: '24px',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <p style={{ color: '#94a3b8', fontSize: '14px', fontWeight: '500', margin: '0 0 8px 0' }}>Monthly Revenue</p>
                <p style={{ fontSize: '32px', fontWeight: '700', color: '#f8fafc', margin: 0 }}>${musicStats.totalRevenue.toLocaleString()}</p>
              </div>
              <div style={{ fontSize: '32px' }}>💰</div>
            </div>
            <div style={{ marginTop: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ color: '#22c55e', fontSize: '14px' }}>💸 +15%</span>
              <span style={{ color: '#94a3b8', fontSize: '14px' }}>vs last month</span>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div style={{ marginBottom: '32px' }}>
        <h2 style={{ 
          fontSize: '28px', 
          fontWeight: '700', 
          color: '#f8fafc',
          marginBottom: '24px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          ⚡ Quick Actions
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
          <Link
            to="/music/releases"
            style={{
              background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
              color: 'white',
              padding: '24px',
              borderRadius: '16px',
              textDecoration: 'none',
              transition: 'all 0.3s ease',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              display: 'block'
            }}
          >
            <div style={{ fontSize: '32px', marginBottom: '12px' }}>🎵</div>
            <h3 style={{ fontWeight: '600', fontSize: '18px', margin: '0 0 4px 0' }}>View Releases</h3>
            <p style={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: '14px', margin: 0 }}>Manage all music releases</p>
          </Link>

          <Link
            to="/music/artists"
            style={{
              background: 'linear-gradient(135deg, #8b5cf6, #ec4899)',
              color: 'white',
              padding: '24px',
              borderRadius: '16px',
              textDecoration: 'none',
              transition: 'all 0.3s ease',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              display: 'block'
            }}
          >
            <div style={{ fontSize: '32px', marginBottom: '12px' }}>🎤</div>
            <h3 style={{ fontWeight: '600', fontSize: '18px', margin: '0 0 4px 0' }}>Artists</h3>
            <p style={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: '14px', margin: 0 }}>Manage artist profiles</p>
          </Link>

          <Link
            to="/music/analytics"
            style={{
              background: 'linear-gradient(135deg, #10b981, #3b82f6)',
              color: 'white',
              padding: '24px',
              borderRadius: '16px',
              textDecoration: 'none',
              transition: 'all 0.3s ease',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              display: 'block'
            }}
          >
            <div style={{ fontSize: '32px', marginBottom: '12px' }}>📊</div>
            <h3 style={{ fontWeight: '600', fontSize: '18px', margin: '0 0 4px 0' }}>Analytics</h3>
            <p style={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: '14px', margin: 0 }}>Track performance</p>
          </Link>

          <Link
            to="/music/royalties"
            style={{
              background: 'linear-gradient(135deg, #f59e0b, #ef4444)',
              color: 'white',
              padding: '24px',
              borderRadius: '16px',
              textDecoration: 'none',
              transition: 'all 0.3s ease',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              display: 'block'
            }}
          >
            <div style={{ fontSize: '32px', marginBottom: '12px' }}>💰</div>
            <h3 style={{ fontWeight: '600', fontSize: '18px', margin: '0 0 4px 0' }}>Royalties</h3>
            <p style={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: '14px', margin: 0 }}>Revenue & payments</p>
          </Link>
        </div>
      </div>

      {/* Recent Releases */}
      <div style={{ marginBottom: '32px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
          <h2 style={{ 
            fontSize: '28px', 
            fontWeight: '700', 
            color: '#f8fafc',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            margin: 0
          }}>
            🆕 Recent Releases
          </h2>
          <Link
            to="/music/releases"
            style={{
              color: '#60a5fa',
              textDecoration: 'none',
              fontWeight: '500'
            }}
          >
            View all →
          </Link>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
          {releases.slice(0, 6).map((release) => (
            <div
              key={release.id}
              style={{
                background: 'rgba(255, 255, 255, 0.05)',
                backdropFilter: 'blur(20px)',
                borderRadius: '20px',
                padding: '24px',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
                transition: 'all 0.3s ease'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'start', gap: '16px' }}>
                <div style={{
                  width: '64px',
                  height: '64px',
                  background: 'linear-gradient(135deg, #ec4899, #8b5cf6)',
                  borderRadius: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '24px',
                  flexShrink: 0
                }}>
                  🎵
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <h3 style={{
                    fontWeight: '600',
                    color: '#f8fafc',
                    fontSize: '16px',
                    margin: '0 0 4px 0',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis'
                  }}>
                    {release.title}
                  </h3>
                  <p style={{
                    color: '#94a3b8',
                    fontSize: '14px',
                    margin: '0 0 8px 0',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis'
                  }}>
                    {release.artist}
                  </p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span style={{
                      fontSize: '12px',
                      background: 'rgba(59, 130, 246, 0.2)',
                      color: '#60a5fa',
                      padding: '4px 8px',
                      borderRadius: '12px'
                    }}>
                      {release.status}
                    </span>
                    <span style={{
                      fontSize: '12px',
                      color: '#94a3b8'
                    }}>
                      {new Date(release.releaseDate).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>

              <div style={{
                marginTop: '16px',
                paddingTop: '16px',
                borderTop: '1px solid rgba(255, 255, 255, 0.1)'
              }}>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  fontSize: '14px'
                }}>
                  <span style={{ color: '#94a3b8' }}>Status: {release.status}</span>
                  <span style={{ color: '#22c55e' }}>{release.genre || 'Various'}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {releases.length === 0 && (
          <div style={{
            background: 'rgba(255, 255, 255, 0.05)',
            backdropFilter: 'blur(20px)',
            borderRadius: '20px',
            padding: '48px',
            textAlign: 'center',
            border: '1px solid rgba(255, 255, 255, 0.1)'
          }}>
            <div style={{ fontSize: '64px', marginBottom: '16px' }}>🎵</div>
            <h3 style={{ fontSize: '20px', fontWeight: '600', color: '#f8fafc', marginBottom: '8px' }}>No releases yet</h3>
            <p style={{ color: '#94a3b8', marginBottom: '24px', fontSize: '16px' }}>Start by adding your first music release</p>
            <Link
              to="/music/releases/new"
              style={{
                background: 'linear-gradient(135deg, #ec4899, #8b5cf6)',
                color: 'white',
                padding: '12px 24px',
                borderRadius: '16px',
                fontWeight: '600',
                textDecoration: 'none',
                transition: 'all 0.3s ease'
              }}
            >
              ➕ Add First Release
            </Link>
          </div>
        )}
      </div>

      {/* Platform Distribution */}
      <div style={{ marginBottom: '32px' }}>
        <h2 style={{ 
          fontSize: '28px', 
          fontWeight: '700', 
          color: '#f8fafc',
          marginBottom: '24px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          🌍 Platform Distribution
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '16px' }}>
          {[
            { name: 'Spotify', emoji: '🟢', color: 'linear-gradient(135deg, #10b981, #059669)' },
            { name: 'Apple Music', emoji: '🍎', color: 'linear-gradient(135deg, #374151, #1f2937)' },
            { name: 'YouTube Music', emoji: '📺', color: 'linear-gradient(135deg, #ef4444, #dc2626)' },
            { name: 'Amazon Music', emoji: '📦', color: 'linear-gradient(135deg, #f59e0b, #d97706)' },
            { name: 'Deezer', emoji: '🎯', color: 'linear-gradient(135deg, #8b5cf6, #7c3aed)' },
            { name: 'Tidal', emoji: '🌊', color: 'linear-gradient(135deg, #3b82f6, #2563eb)' }
          ].map((platform) => (
            <div
              key={platform.name}
              style={{
                background: platform.color,
                padding: '16px',
                borderRadius: '16px',
                color: 'white',
                textAlign: 'center',
                transition: 'transform 0.3s ease',
                cursor: 'pointer',
                border: '1px solid rgba(255, 255, 255, 0.1)'
              }}
            >
              <div style={{ fontSize: '32px', marginBottom: '8px' }}>{platform.emoji}</div>
              <div style={{ fontWeight: '600', fontSize: '14px' }}>{platform.name}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MusicDashboard;
