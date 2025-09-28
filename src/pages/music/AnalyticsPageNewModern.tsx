import React, { useState } from 'react';
import { BarChart3, TrendingUp, Headphones, Users, DollarSign, Globe, Play, Eye, Activity } from 'lucide-react';

interface StreamingData {
  platform: string;
  streams: number;
  revenue: number;
  growth: number;
  color: string;
}

interface GeographicData {
  country: string;
  streams: number;
  percentage: number;
  flag: string;
}

interface DemographicData {
  ageGroup: string;
  percentage: number;
  color: string;
}

interface TopTrack {
  id: string;
  title: string;
  artist: string;
  streams: number;
  revenue: number;
  growth: number;
}

const AnalyticsPageNewModern: React.FC = () => {
  const [selectedPeriod, setSelectedPeriod] = useState<'24h' | '7d' | '30d' | '90d'>('30d');
  const [selectedMetric, setSelectedMetric] = useState<'streams' | 'revenue' | 'listeners'>('streams');

  const streamingPlatforms: StreamingData[] = [
    {
      platform: 'Spotify',
      streams: 1245000,
      revenue: 4980,
      growth: 12.5,
      color: '#1DB954'
    },
    {
      platform: 'Apple Music',
      streams: 785000,
      revenue: 4710,
      growth: 8.3,
      color: '#FA243C'
    },
    {
      platform: 'YouTube Music',
      streams: 650000,
      revenue: 1950,
      growth: 15.7,
      color: '#FF0000'
    },
    {
      platform: 'Amazon Music',
      streams: 420000,
      revenue: 2520,
      growth: 6.2,
      color: '#FF9900'
    },
    {
      platform: 'Deezer',
      streams: 180000,
      revenue: 810,
      growth: 4.1,
      color: '#8B5CF6'
    },
    {
      platform: 'Tidal',
      streams: 95000,
      revenue: 570,
      growth: 2.8,
      color: '#3B82F6'
    }
  ];

  const geographicData: GeographicData[] = [
    { country: 'United States', streams: 1450000, percentage: 35.2, flag: '🇺🇸' },
    { country: 'United Kingdom', streams: 620000, percentage: 15.1, flag: '🇬🇧' },
    { country: 'Germany', streams: 485000, percentage: 11.8, flag: '🇩🇪' },
    { country: 'Canada', streams: 390000, percentage: 9.5, flag: '🇨🇦' },
    { country: 'France', streams: 285000, percentage: 6.9, flag: '🇫🇷' },
    { country: 'Australia', streams: 220000, percentage: 5.4, flag: '🇦🇺' },
    { country: 'Netherlands', streams: 185000, percentage: 4.5, flag: '🇳🇱' },
    { country: 'Sweden', streams: 140000, percentage: 3.4, flag: '🇸🇪' },
    { country: 'Others', streams: 340000, percentage: 8.2, flag: 'globe' }
  ];

  const demographicData: DemographicData[] = [
    { ageGroup: '18-24', percentage: 28.5, color: '#FF0000' },
    { ageGroup: '25-34', percentage: 34.2, color: '#FF4444' },
    { ageGroup: '35-44', percentage: 22.1, color: '#FF6666' },
    { ageGroup: '45-54', percentage: 10.8, color: '#FF8888' },
    { ageGroup: '55+', percentage: 4.4, color: '#FFAAAA' }
  ];

  const topTracks: TopTrack[] = [
    {
      id: '1',
      title: 'Midnight Dreams',
      artist: 'The Synthwave',
      streams: 892000,
      revenue: 3568,
      growth: 18.5
    },
    {
      id: '2',
      title: 'Electric Pulse',
      artist: 'Neon Beats',
      streams: 645000,
      revenue: 2580,
      growth: 12.3
    },
    {
      id: '3',
      title: 'Neon Nights',
      artist: 'The Synthwave',
      streams: 520000,
      revenue: 2080,
      growth: 8.7
    },
    {
      id: '4',
      title: 'Digital Dreams',
      artist: 'City Sound',
      streams: 485000,
      revenue: 1940,
      growth: 15.2
    },
    {
      id: '5',
      title: 'Bass Drop',
      artist: 'DJ Pulse',
      streams: 380000,
      revenue: 1520,
      growth: 6.9
    }
  ];

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(0)}K`;
    return num.toString();
  };

  const totalStreams = streamingPlatforms.reduce((sum, platform) => sum + platform.streams, 0);
  const totalRevenue = streamingPlatforms.reduce((sum, platform) => sum + platform.revenue, 0);
  const avgGrowth = streamingPlatforms.reduce((sum, platform) => sum + platform.growth, 0) / streamingPlatforms.length;

  return (
    <div style={{
      minHeight: '100vh',
      backgroundImage: 'linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.6)), url(https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=2070)',
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
              background: 'linear-gradient(135deg, #FF0000, #ff4444)',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 8px 25px -8px rgba(255, 0, 0, 0.4)'
            }}>
              <BarChart3 size={24} className="text-white" />
            </div>
            <div>
              <h1 style={{
                fontSize: '32px',
                fontWeight: 'bold',
                color: 'white',
                margin: '0'
              }}>Analytics Dashboard</h1>
              <p style={{
                color: 'rgba(255, 255, 255, 0.8)',
                margin: '8px 0 0 0'
              }}>Real-time streaming data and performance metrics</p>
            </div>
          </div>

          {/* Time Period Selector */}
          <div style={{
            display: 'flex',
            gap: '8px',
            background: 'rgba(255, 255, 255, 0.2)',
            borderRadius: '12px',
            padding: '8px',
            backdropFilter: 'blur(8px)'
          }}>
            {(['24h', '7d', '30d', '90d'] as const).map((period) => (
              <button
                key={period}
                onClick={() => setSelectedPeriod(period)}
                style={{
                  padding: '8px 16px',
                  fontSize: '14px',
                  fontWeight: '600',
                  borderRadius: '8px',
                  border: 'none',
                  cursor: 'pointer',
                  background: selectedPeriod === period
                    ? 'rgba(255, 255, 255, 0.9)'
                    : 'transparent',
                  color: selectedPeriod === period
                    ? '#FF0000'
                    : 'rgba(255, 255, 255, 0.8)',
                  boxShadow: selectedPeriod === period
                    ? '0 4px 12px rgba(0, 0, 0, 0.1)'
                    : 'none',
                  transition: 'all 0.3s'
                }}
              >
                {period === '24h' ? '24 Hours' :
                 period === '7d' ? '7 Days' :
                 period === '30d' ? '30 Days' : '90 Days'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Overview Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: '24px',
        marginBottom: '32px'
      }}>
        <div style={{
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
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '16px'
          }}>
            <div style={{
              width: '48px',
              height: '48px',
              background: 'linear-gradient(135deg, #FF0000, #ff6b6b)',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Headphones size={24} className="text-white" />
            </div>
            <TrendingUp size={20} style={{color: '#10b981'}} />
          </div>
          <h3 style={{
            fontSize: '28px',
            fontWeight: '700',
            color: 'white',
            margin: '0 0 4px 0'
          }}>{formatNumber(totalStreams)}</h3>
          <p style={{
            fontSize: '16px',
            color: 'rgba(255, 255, 255, 0.8)',
            margin: '0 0 8px 0'
          }}>Total Streams</p>
          <p style={{
            fontSize: '14px',
            color: '#10b981',
            fontWeight: '600',
            margin: '0'
          }}>+{avgGrowth.toFixed(1)}% vs last period</p>
        </div>

        <div style={{
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
              <DollarSign size={24} className="text-white" />
            </div>
            <TrendingUp size={20} style={{color: '#10b981'}} />
          </div>
          <h3 style={{
            fontSize: '28px',
            fontWeight: '700',
            color: 'white',
            margin: '0 0 4px 0'
          }}>${totalRevenue.toLocaleString()}</h3>
          <p style={{
            fontSize: '16px',
            color: 'rgba(255, 255, 255, 0.8)',
            margin: '0 0 8px 0'
          }}>Total Revenue</p>
          <p style={{
            fontSize: '14px',
            color: '#10b981',
            fontWeight: '600',
            margin: '0'
          }}>+12.3% vs last period</p>
        </div>

        <div style={{
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
              <Users size={24} className="text-white" />
            </div>
            <TrendingUp size={20} style={{color: '#10b981'}} />
          </div>
          <h3 style={{
            fontSize: '28px',
            fontWeight: '700',
            color: 'white',
            margin: '0 0 4px 0'
          }}>248K</h3>
          <p style={{
            fontSize: '16px',
            color: 'rgba(255, 255, 255, 0.8)',
            margin: '0 0 8px 0'
          }}>Monthly Listeners</p>
          <p style={{
            fontSize: '14px',
            color: '#10b981',
            fontWeight: '600',
            margin: '0'
          }}>+8.7% vs last period</p>
        </div>
      </div>

      {/* Platform Breakdown & Geographic */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(500px, 1fr))',
        gap: '32px',
        marginBottom: '32px'
      }}>
        {/* Platform Breakdown */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.25)',
          borderRadius: '20px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          backdropFilter: 'blur(16px)',
          padding: '24px'
        }}>
          <h2 style={{
            fontSize: '24px',
            fontWeight: '700',
            color: 'white',
            marginBottom: '24px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }}>
            <Play size={24} style={{color: '#FF0000'}} />
            Platform Breakdown
          </h2>
          <div style={{display: 'flex', flexDirection: 'column', gap: '16px'}}>
            {streamingPlatforms.map((platform, index) => (
              <div
                key={index}
                style={{
                  background: 'rgba(255, 255, 255, 0.2)',
                  borderRadius: '16px',
                  padding: '20px',
                  backdropFilter: 'blur(8px)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  transition: 'all 0.3s'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.3)';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}>
                  <div style={{display: 'flex', alignItems: 'center', gap: '16px'}}>
                    <div style={{
                      width: '48px',
                      height: '48px',
                      background: platform.color,
                      borderRadius: '12px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'white',
                      fontWeight: 'bold',
                      fontSize: '18px'
                    }}>
                      {platform.platform[0]}
                    </div>
                    <div>
                      <h3 style={{
                        fontSize: '18px',
                        fontWeight: '600',
                        color: 'white',
                        margin: '0 0 4px 0'
                      }}>{platform.platform}</h3>
                      <p style={{
                        fontSize: '14px',
                        color: 'rgba(255, 255, 255, 0.7)',
                        margin: '0'
                      }}>{formatNumber(platform.streams)} streams</p>
                    </div>
                  </div>
                  <div style={{textAlign: 'right'}}>
                    <p style={{
                      fontSize: '18px',
                      fontWeight: '600',
                      color: 'white',
                      margin: '0 0 4px 0'
                    }}>${platform.revenue.toLocaleString()}</p>
                    <p style={{
                      fontSize: '14px',
                      color: '#10b981',
                      fontWeight: '600',
                      margin: '0'
                    }}>+{platform.growth}%</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Geographic Breakdown */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.25)',
          borderRadius: '20px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          backdropFilter: 'blur(16px)',
          padding: '24px'
        }}>
          <h2 style={{
            fontSize: '24px',
            fontWeight: '700',
            color: 'white',
            marginBottom: '24px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }}>
            <Globe size={24} style={{color: '#FF0000'}} />
            Geographic Breakdown
          </h2>
          <div style={{display: 'flex', flexDirection: 'column', gap: '12px'}}>
            {geographicData.map((country, index) => (
              <div
                key={index}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '12px 16px',
                  background: 'rgba(255, 255, 255, 0.1)',
                  borderRadius: '12px',
                  backdropFilter: 'blur(4px)',
                  transition: 'all 0.3s'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
                }}
              >
                <div style={{display: 'flex', alignItems: 'center', gap: '12px'}}>
                  {country.flag === 'globe' ? (
                    <Globe size={20} style={{color: 'rgba(255, 255, 255, 0.7)'}} />
                  ) : (
                    <span style={{fontSize: '20px'}}>{country.flag}</span>
                  )}
                  <div>
                    <p style={{
                      fontSize: '16px',
                      fontWeight: '500',
                      color: 'white',
                      margin: '0 0 2px 0'
                    }}>{country.country}</p>
                    <p style={{
                      fontSize: '13px',
                      color: 'rgba(255, 255, 255, 0.7)',
                      margin: '0'
                    }}>{formatNumber(country.streams)} streams</p>
                  </div>
                </div>
                <div style={{textAlign: 'right'}}>
                  <p style={{
                    fontSize: '16px',
                    fontWeight: '600',
                    color: 'white',
                    margin: '0 0 4px 0'
                  }}>{country.percentage}%</p>
                  <div style={{
                    width: '80px',
                    height: '6px',
                    background: 'rgba(255, 255, 255, 0.2)',
                    borderRadius: '3px',
                    overflow: 'hidden'
                  }}>
                    <div
                      style={{
                        width: `${country.percentage}%`,
                        height: '100%',
                        background: 'linear-gradient(135deg, #FF0000, #ff4444)',
                        borderRadius: '3px',
                        transition: 'width 0.5s ease'
                      }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Demographics & Top Tracks */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(500px, 1fr))',
        gap: '32px',
        marginBottom: '32px'
      }}>
        {/* Demographics */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.25)',
          borderRadius: '20px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          backdropFilter: 'blur(16px)',
          padding: '24px'
        }}>
          <h2 style={{
            fontSize: '24px',
            fontWeight: '700',
            color: 'white',
            marginBottom: '24px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }}>
            <Eye size={24} style={{color: '#FF0000'}} />
            Demographic Insights
          </h2>
          <div style={{display: 'flex', flexDirection: 'column', gap: '16px'}}>
            {demographicData.map((demo, index) => (
              <div
                key={index}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '16px',
                  background: 'rgba(255, 255, 255, 0.1)',
                  borderRadius: '12px',
                  backdropFilter: 'blur(4px)'
                }}
              >
                <div style={{display: 'flex', alignItems: 'center', gap: '12px'}}>
                  <div style={{
                    width: '32px',
                    height: '32px',
                    background: demo.color,
                    borderRadius: '8px'
                  }} />
                  <span style={{
                    fontSize: '16px',
                    fontWeight: '500',
                    color: 'white'
                  }}>{demo.ageGroup} years</span>
                </div>
                <div style={{display: 'flex', alignItems: 'center', gap: '12px'}}>
                  <div style={{
                    width: '120px',
                    height: '8px',
                    background: 'rgba(255, 255, 255, 0.2)',
                    borderRadius: '4px',
                    overflow: 'hidden'
                  }}>
                    <div
                      style={{
                        width: `${demo.percentage}%`,
                        height: '100%',
                        background: demo.color,
                        borderRadius: '4px',
                        transition: 'width 0.5s ease'
                      }}
                    />
                  </div>
                  <span style={{
                    fontSize: '16px',
                    fontWeight: '600',
                    color: 'white',
                    minWidth: '48px',
                    textAlign: 'right'
                  }}>{demo.percentage}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Tracks */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.25)',
          borderRadius: '20px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          backdropFilter: 'blur(16px)',
          padding: '24px'
        }}>
          <h2 style={{
            fontSize: '24px',
            fontWeight: '700',
            color: 'white',
            marginBottom: '24px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }}>
            <Activity size={24} style={{color: '#FF0000'}} />
            Top Tracks
          </h2>
          <div style={{display: 'flex', flexDirection: 'column', gap: '12px'}}>
            {topTracks.map((track, index) => (
              <div
                key={track.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '16px',
                  background: 'rgba(255, 255, 255, 0.1)',
                  borderRadius: '12px',
                  backdropFilter: 'blur(4px)',
                  transition: 'all 0.3s',
                  cursor: 'pointer'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)';
                  e.currentTarget.style.transform = 'translateY(-1px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                <div style={{display: 'flex', alignItems: 'center', gap: '16px'}}>
                  <div style={{
                    width: '40px',
                    height: '40px',
                    background: `linear-gradient(135deg, #FF0000, #ff${(6 + index).toString()}${(6 + index).toString()}${(6 + index).toString()})`,
                    borderRadius: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontWeight: 'bold',
                    fontSize: '16px'
                  }}>
                    {index + 1}
                  </div>
                  <div>
                    <p style={{
                      fontSize: '16px',
                      fontWeight: '600',
                      color: 'white',
                      margin: '0 0 2px 0'
                    }}>{track.title}</p>
                    <p style={{
                      fontSize: '14px',
                      color: 'rgba(255, 255, 255, 0.7)',
                      margin: '0'
                    }}>{track.artist}</p>
                  </div>
                </div>
                <div style={{textAlign: 'right'}}>
                  <p style={{
                    fontSize: '16px',
                    fontWeight: '600',
                    color: 'white',
                    margin: '0 0 2px 0'
                  }}>{formatNumber(track.streams)}</p>
                  <p style={{
                    fontSize: '14px',
                    color: '#10b981',
                    fontWeight: '600',
                    margin: '0'
                  }}>+{track.growth}%</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Revenue Chart */}
      <div style={{
        background: 'rgba(255, 255, 255, 0.25)',
        borderRadius: '20px',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        border: '1px solid rgba(255, 255, 255, 0.2)',
        backdropFilter: 'blur(16px)',
        padding: '24px'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '24px'
        }}>
          <h2 style={{
            fontSize: '24px',
            fontWeight: '700',
            color: 'white',
            margin: '0',
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }}>
            <TrendingUp size={24} style={{color: '#FF0000'}} />
            Revenue Trend
          </h2>
          <div style={{
            display: 'flex',
            gap: '8px',
            background: 'rgba(255, 255, 255, 0.2)',
            borderRadius: '12px',
            padding: '8px',
            backdropFilter: 'blur(8px)'
          }}>
            {(['streams', 'revenue', 'listeners'] as const).map((metric) => (
              <button
                key={metric}
                onClick={() => setSelectedMetric(metric)}
                style={{
                  padding: '8px 16px',
                  fontSize: '14px',
                  fontWeight: '600',
                  borderRadius: '8px',
                  border: 'none',
                  cursor: 'pointer',
                  background: selectedMetric === metric
                    ? 'rgba(255, 255, 255, 0.9)'
                    : 'transparent',
                  color: selectedMetric === metric
                    ? '#FF0000'
                    : 'rgba(255, 255, 255, 0.8)',
                  boxShadow: selectedMetric === metric
                    ? '0 4px 12px rgba(0, 0, 0, 0.1)'
                    : 'none',
                  transition: 'all 0.3s'
                }}
              >
                {metric.charAt(0).toUpperCase() + metric.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Chart Placeholder */}
        <div style={{
          height: '320px',
          background: 'linear-gradient(135deg, rgba(255, 0, 0, 0.1), rgba(255, 68, 68, 0.1))',
          borderRadius: '16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          border: '1px solid rgba(255, 0, 0, 0.2)',
          backdropFilter: 'blur(8px)'
        }}>
          <div style={{textAlign: 'center'}}>
            <BarChart3 size={64} style={{color: 'rgba(255, 255, 255, 0.6)', margin: '0 auto 16px auto'}} />
            <p style={{
              fontSize: '20px',
              fontWeight: '600',
              color: 'white',
              margin: '0 0 8px 0'
            }}>Interactive Chart</p>
            <p style={{
              fontSize: '16px',
              color: 'rgba(255, 255, 255, 0.7)',
              margin: '0'
            }}>
              Showing {selectedMetric} for the last {selectedPeriod}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsPageNewModern;
