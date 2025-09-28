import React, { useState } from 'react';
import { Plus, MoreHorizontal, Edit, Users, Mail, Phone, Instagram, Globe, Play, TrendingUp } from 'lucide-react';

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

const ArtistsPageNewModern: React.FC = () => {
  const [selectedTab, setSelectedTab] = useState<'all' | 'active' | 'inactive' | 'pending'>('all');
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedArtist, setSelectedArtist] = useState<Artist | null>(null);

  const artists: Artist[] = [
    {
      id: '1',
      name: 'The Synthwave',
      email: 'contact@thesynthwave.com',
      phone: '+1 (555) 123-4567',
      bio: 'Electronic music duo creating atmospheric synthwave and retrowave tracks.',
      avatar: '🎤',
      socialMedia: {
        spotify: 'thesynthwave',
        instagram: '@thesynthwave',
        twitter: '@synthwave_music',
        youtube: 'TheSynthwaveChannel'
      },
      contracts: [
        { id: '1', type: 'recording', startDate: '2023-01-15', endDate: '2025-01-15', royaltyRate: 70, status: 'active' }
      ],
      totalStreams: 2450000,
      totalRevenue: 18500,
      genres: ['Synthwave', 'Electronic', 'Retrowave'],
      joinDate: '2023-01-15',
      status: 'active'
    },
    {
      id: '2',
      name: 'Luna Martinez',
      email: 'luna@lunamartinez.com',
      phone: '+1 (555) 987-6543',
      bio: 'Singer-songwriter with a passion for indie folk and acoustic melodies.',
      avatar: '🎸',
      socialMedia: {
        spotify: 'lunamartinez',
        instagram: '@luna_martinez_music',
        youtube: 'LunaMartinezOfficial'
      },
      contracts: [
        { id: '2', type: 'publishing', startDate: '2023-03-10', endDate: '2026-03-10', royaltyRate: 65, status: 'active' }
      ],
      totalStreams: 1800000,
      totalRevenue: 12300,
      genres: ['Indie Folk', 'Acoustic', 'Singer-Songwriter'],
      joinDate: '2023-03-10',
      status: 'active'
    },
    {
      id: '3',
      name: 'Bass Collective',
      email: 'info@basscollective.net',
      bio: 'Underground bass music collective pushing boundaries in dubstep and trap.',
      avatar: '🔊',
      socialMedia: {
        spotify: 'basscollective',
        instagram: '@bass_collective'
      },
      contracts: [
        { id: '3', type: 'distribution', startDate: '2023-06-01', endDate: '2024-06-01', royaltyRate: 50, status: 'pending' }
      ],
      totalStreams: 890000,
      totalRevenue: 5600,
      genres: ['Dubstep', 'Trap', 'Bass Music'],
      joinDate: '2023-06-01',
      status: 'pending'
    }
  ];

  const filteredArtists = artists.filter(artist => {
    if (selectedTab === 'all') return true;
    return artist.status === selectedTab;
  });

  const getStatusGradient = (status: string) => {
    switch (status) {
      case 'active': return 'linear-gradient(135deg, #10b981, #059669)';
      case 'inactive': return 'linear-gradient(135deg, #6b7280, #4b5563)';
      case 'pending': return 'linear-gradient(135deg, #f59e0b, #d97706)';
      default: return 'linear-gradient(135deg, #6b7280, #4b5563)';
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      backgroundImage: 'linear-gradient(rgba(0,0,0,0.3), rgba(0,0,0,0.5)), url(https://images.unsplash.com/photo-1516280440614-37939bbacd81?q=80&w=2070)',
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
              background: 'linear-gradient(135deg, #FA243C, #ff4757)',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 8px 25px -8px rgba(250, 36, 60, 0.4)'
            }}>
              <Users size={24} className="text-white" />
            </div>
            <div>
              <h1 style={{
                fontSize: '32px',
                fontWeight: 'bold',
                color: 'white',
                margin: '0'
              }}>Artists Management</h1>
              <p style={{
                color: 'rgba(255, 255, 255, 0.8)',
                margin: '8px 0 0 0'
              }}>Manage your talented artists and their careers</p>
            </div>
          </div>
          <button
            onClick={() => setShowAddForm(true)}
            style={{
              background: 'linear-gradient(135deg, #FA243C 0%, #ff4757 100%)',
              color: 'white',
              fontWeight: '600',
              padding: '12px 24px',
              borderRadius: '12px',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              boxShadow: '0 8px 25px -8px rgba(250, 36, 60, 0.4)',
              transition: 'all 0.3s'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 12px 35px -8px rgba(250, 36, 60, 0.6)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 8px 25px -8px rgba(250, 36, 60, 0.4)';
            }}
          >
            <Plus size={20} />
            <span>Add New Artist</span>
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
          {(['all', 'active', 'pending', 'inactive'] as const).map((tab) => (
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
                  ? '#FA243C'
                  : 'rgba(255, 255, 255, 0.8)',
                boxShadow: selectedTab === tab
                  ? '0 4px 12px rgba(0, 0, 0, 0.1)'
                  : 'none',
                transition: 'all 0.3s'
              }}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
              <span style={{
                marginLeft: '8px',
                fontSize: '12px',
                opacity: 0.8
              }}>
                ({tab === 'all' ? artists.length : artists.filter(a => a.status === tab).length})
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Artists Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
        gap: '24px'
      }}>
        {filteredArtists.map((artist) => (
          <div
            key={artist.id}
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
            {/* Artist Header */}
            <div style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: '16px',
              marginBottom: '20px'
            }}>
              <div style={{
                width: '80px',
                height: '80px',
                background: 'linear-gradient(135deg, #FA243C 0%, #ff6b7a 100%)',
                borderRadius: '20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '32px',
                boxShadow: '0 12px 30px -8px rgba(250, 36, 60, 0.4)'
              }}>
                {artist.avatar}
              </div>
              <div style={{ flex: 1 }}>
                <h3 style={{
                  fontSize: '20px',
                  fontWeight: '700',
                  color: 'white',
                  margin: '0 0 4px 0'
                }}>{artist.name}</h3>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  marginBottom: '8px'
                }}>
                  <Mail size={14} style={{color: 'rgba(255, 255, 255, 0.7)'}} />
                  <p style={{
                    fontSize: '14px',
                    color: 'rgba(255, 255, 255, 0.7)',
                    margin: '0'
                  }}>{artist.email}</p>
                </div>
                <span style={{
                  background: getStatusGradient(artist.status),
                  padding: '4px 12px',
                  borderRadius: '12px',
                  fontSize: '12px',
                  fontWeight: '600',
                  color: 'white'
                }}>
                  {artist.status.toUpperCase()}
                </span>
              </div>
            </div>

            {/* Bio */}
            {artist.bio && (
              <div style={{ marginBottom: '20px' }}>
                <p style={{
                  fontSize: '14px',
                  color: 'rgba(255, 255, 255, 0.8)',
                  lineHeight: '1.5',
                  margin: '0'
                }}>{artist.bio}</p>
              </div>
            )}

            {/* Genres */}
            <div style={{ marginBottom: '20px' }}>
              <div style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: '8px'
              }}>
                {artist.genres.map((genre, index) => (
                  <span
                    key={index}
                    style={{
                      background: 'rgba(250, 36, 60, 0.2)',
                      border: '1px solid rgba(250, 36, 60, 0.3)',
                      padding: '4px 8px',
                      borderRadius: '8px',
                      fontSize: '12px',
                      fontWeight: '500',
                      color: 'white',
                      backdropFilter: 'blur(4px)'
                    }}
                  >
                    {genre}
                  </span>
                ))}
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
                }}>Total Streams</p>
                <p style={{
                  fontSize: '18px',
                  fontWeight: '600',
                  color: 'white',
                  margin: '0'
                }}>
                  {(artist.totalStreams / 1000000).toFixed(1)}M
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
                  ${artist.totalRevenue.toLocaleString()}
                </p>
              </div>
            </div>

            {/* Social Media */}
            <div style={{ marginBottom: '20px' }}>
              <div style={{
                display: 'flex',
                gap: '8px'
              }}>
                {artist.socialMedia.spotify && (
                  <div style={{
                    width: '32px',
                    height: '32px',
                    background: 'linear-gradient(135deg, #1DB954, #1ed760)',
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer'
                  }}>
                    <Play size={16} className="text-white" />
                  </div>
                )}
                {artist.socialMedia.instagram && (
                  <div style={{
                    width: '32px',
                    height: '32px',
                    background: 'linear-gradient(135deg, #E4405F, #fd1d1d)',
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer'
                  }}>
                    <Instagram size={16} className="text-white" />
                  </div>
                )}
                {artist.socialMedia.youtube && (
                  <div style={{
                    width: '32px',
                    height: '32px',
                    background: 'linear-gradient(135deg, #FF0000, #ff4444)',
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer'
                  }}>
                    <Globe size={16} className="text-white" />
                  </div>
                )}
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
                <Edit size={16} style={{ marginRight: '6px', display: 'inline' }} />
                Edit Profile
              </button>
              <button style={{
                flex: 1,
                background: 'linear-gradient(135deg, #FA243C 0%, #ff4757 100%)',
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
                e.currentTarget.style.boxShadow = '0 8px 20px rgba(250, 36, 60, 0.4)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
              }}
              >
                <TrendingUp size={16} style={{ marginRight: '6px', display: 'inline' }} />
                Analytics
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ArtistsPageNewModern;
