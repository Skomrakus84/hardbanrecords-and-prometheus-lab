import React, { useState } from 'react';
import { Plus, MoreHorizontal, Edit } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

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

const ReleasesPageNewTest: React.FC = () => {
  const navigate = useNavigate();
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
    }
  ];

  const filteredReleases = releases.filter(release => {
    if (selectedTab === 'all') return true;
    return release.status === selectedTab;
  });

  return (
    <div style={{
      minHeight: '100vh',
      backgroundImage: 'linear-gradient(rgba(0,0,0,0.3), rgba(0,0,0,0.5)), url(https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?q=80&w=2070)',
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
              background: 'linear-gradient(135deg, #1DB954, #1ed760)',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 8px 25px -8px rgba(29, 185, 84, 0.4)'
            }}>
              🎵
            </div>
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
            onClick={() => navigate('/music/releases/new')}
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
              boxShadow: '0 8px 25px -8px rgba(102, 126, 234, 0.4)'
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
            </button>
          ))}
        </div>
      </div>

      {/* Releases Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
        gap: '24px'
      }}>
        {filteredReleases.map((release) => (
          <div
            key={release.id}
            style={{
              background: 'rgba(255, 255, 255, 0.25)',
              borderRadius: '20px',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              backdropFilter: 'blur(16px)',
              padding: '24px',
              cursor: 'pointer',
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
              <div style={{ flex: 1 }}>
                <h3 style={{
                  fontSize: '18px',
                  fontWeight: '600',
                  color: 'white',
                  margin: '0 0 4px 0'
                }}>{release.title}</h3>
                <p style={{
                  fontSize: '14px',
                  color: 'rgba(255, 255, 255, 0.8)',
                  margin: '0 0 8px 0'
                }}>{release.artist}</p>
                <div style={{
                  display: 'flex',
                  gap: '8px'
                }}>
                  <span style={{
                    background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
                    padding: '2px 8px',
                    borderRadius: '12px',
                    fontSize: '12px',
                    fontWeight: '600',
                    color: 'white'
                  }}>
                    {release.type.toUpperCase()}
                  </span>
                  <span style={{
                    background: 'linear-gradient(135deg, #10b981, #059669)',
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
                  margin: '0 0 4px 0'
                }}>Streams</p>
                <p style={{
                  fontSize: '18px',
                  fontWeight: '600',
                  color: 'white',
                  margin: '0'
                }}>
                  {(release.streams / 1000).toFixed(0)}K
                </p>
              </div>
              <div>
                <p style={{
                  fontSize: '12px',
                  color: 'rgba(255, 255, 255, 0.6)',
                  textTransform: 'uppercase',
                  margin: '0 0 4px 0'
                }}>Revenue</p>
                <p style={{
                  fontSize: '18px',
                  fontWeight: '600',
                  color: 'white',
                  margin: '0'
                }}>
                  ${release.revenue.toLocaleString()}
                </p>
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
                cursor: 'pointer'
              }}>
                <MoreHorizontal size={16} style={{ marginRight: '4px', display: 'inline' }} />
                More
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ReleasesPageNewTest;
