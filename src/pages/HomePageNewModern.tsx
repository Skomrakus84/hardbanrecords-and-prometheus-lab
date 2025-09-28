import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  Disc3,
  BookOpen,
  DollarSign,
  Headphones,
  TrendingUp,
  Rocket,
  Bell,
  Target,
  Upload,
  BarChart3,
  Building2,
  Play,
  Music,
  Calendar,
  Globe2,
  Star,
  Award,
  Zap,
  Heart,
  Eye,
  Download,
  Share2,
  PlusCircle
} from 'lucide-react';

interface StatCard {
  icon: React.ComponentType<{ size?: number; className?: string }>;
  title: string;
  subtitle: string;
  desc: string;
  growth: string;
  color: string;
  onClick: () => void;
}

interface Activity {
  icon: React.ComponentType<{ size?: number; className?: string }>;
  title: string;
  details: string;
  status: string;
  color: string;
}

interface RecentRelease {
  title: string;
  artist: string;
  cover: string;
  streams: string;
  revenue: string;
  platforms: string[];
}

interface QuickAction {
  icon: React.ComponentType<{ size?: number; className?: string }>;
  title: string;
  description: string;
  color: string;
  bgGradient: string;
  onClick: () => void;
}

const HomePageNewModern: React.FC = () => {
  const navigate = useNavigate();
  const stats: StatCard[] = [
    {
      icon: Users,
      title: '42',
      subtitle: 'Active Artists',
      desc: 'Signed & Active',
      growth: '+15%',
      color: '#1DB954', // Spotify Green
      onClick: () => navigate('/artists')
    },
    {
      icon: Disc3,
      title: '127',
      subtitle: 'Total Releases',
      desc: 'Albums & Singles',
      growth: '+23%',
      color: '#FA243C', // Apple Music Red
      onClick: () => navigate('/releases')
    },
    {
      icon: BookOpen,
      title: '89',
      subtitle: 'Published Books',
      desc: 'Digital & Print',
      growth: '+8%',
      color: '#FF9900', // Amazon Orange
      onClick: () => navigate('/books')
    },
    {
      icon: DollarSign,
      title: '$284K',
      subtitle: 'Monthly Revenue',
      desc: 'All Platforms',
      growth: '+31%',
      color: '#FF0000', // YouTube Red
      onClick: () => navigate('/music/royalties')
    },
    {
      icon: BarChart3,
      title: '2.4M',
      subtitle: 'Total Streams',
      desc: 'This Month',
      growth: '+18%',
      color: '#764BA2', // Purple
      onClick: () => navigate('/analytics')
    },
    {
      icon: Globe2,
      title: '67',
      subtitle: 'Global Markets',
      desc: 'Distribution Active',
      growth: '+5%',
      color: '#00D4FF', // Cyan
      onClick: () => navigate('/distribution')
    }
  ];

  const activities: Activity[] = [
    {
      icon: Upload,
      title: 'New Release: "Summer Vibes"',
      details: 'Artist: DJ Phoenix • Released 2 hours ago',
      status: 'Live',
      color: '#1DB954'
    },
    {
      icon: TrendingUp,
      title: '"Midnight Dreams" trending',
      details: 'Luna Rivers • #3 on Spotify Viral 50',
      status: 'Trending',
      color: '#FA243C'
    },
    {
      icon: BookOpen,
      title: 'Book: "Digital Marketing 101"',
      details: 'Sarah Connor • Published on Amazon KDP',
      status: 'Published',
      color: '#FF9900'
    },
    {
      icon: DollarSign,
      title: 'Royalty Payment Processed',
      details: '$12,450 • 15 artists • Q4 2024',
      status: 'Completed',
      color: '#10B981'
    },
    {
      icon: Star,
      title: 'Artist Milestone Reached',
      details: 'The Neon Collective • 1M streams',
      status: 'Achievement',
      color: '#F59E0B'
    }
  ];

  const recentReleases: RecentRelease[] = [
    {
      title: 'Summer Vibes',
      artist: 'DJ Phoenix',
      cover: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=100&h=100&fit=crop',
      streams: '45.2K',
      revenue: '$1,240',
      platforms: ['Spotify', 'Apple', 'YouTube']
    },
    {
      title: 'Midnight Dreams',
      artist: 'Luna Rivers',
      cover: 'https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=100&h=100&fit=crop',
      streams: '128.7K',
      revenue: '$3,520',
      platforms: ['Spotify', 'Apple', 'Deezer']
    },
    {
      title: 'Electric Soul',
      artist: 'The Neon Collective',
      cover: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=100&h=100&fit=crop',
      streams: '89.3K',
      revenue: '$2,180',
      platforms: ['YouTube', 'Spotify', 'SoundCloud']
    }
  ];

  const quickActions: QuickAction[] = [
    {
      icon: Upload,
      title: 'Upload Release',
      description: 'Add new music or book',
      color: '#1DB954',
      bgGradient: 'linear-gradient(135deg, #1DB954 0%, #1ed760 100%)',
      onClick: () => navigate('/music/releases/new')
    },
    {
      icon: Users,
      title: 'Manage Artists',
      description: 'View artist profiles',
      color: '#FA243C',
      bgGradient: 'linear-gradient(135deg, #FA243C 0%, #ff4757 100%)',
      onClick: () => navigate('/artists')
    },
    {
      icon: BarChart3,
      title: 'View Analytics',
      description: 'Performance insights',
      color: '#FF0000',
      bgGradient: 'linear-gradient(135deg, #FF0000 0%, #ff4757 100%)',
      onClick: () => navigate('/analytics')
    },
    {
      icon: DollarSign,
      title: 'Royalties',
      description: 'Payment management',
      color: '#10B981',
      bgGradient: 'linear-gradient(135deg, #10B981 0%, #34d399 100%)',
      onClick: () => navigate('/music/royalties')
    }
  ];

  const containerStyle = {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)',
    backgroundImage: 'url("https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=1600&h=900&fit=crop")',
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundAttachment: 'fixed',
    padding: '40px',
    position: 'relative' as const
  };

  const overlayStyle = {
    position: 'absolute' as const,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.9) 0%, rgba(118, 75, 162, 0.9) 100%)',
    zIndex: 1
  };

  const contentStyle = {
    position: 'relative' as const,
    zIndex: 2,
    maxWidth: '1400px',
    margin: '0 auto'
  };

  const headerStyle = {
    textAlign: 'center' as const,
    marginBottom: '50px',
    color: '#ffffff'
  };

  const statsGridStyle = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    gap: '30px',
    marginBottom: '50px'
  };

  const statCardStyle = {
    background: 'rgba(255, 255, 255, 0.1)',
    backdropFilter: 'blur(20px)',
    borderRadius: '24px',
    padding: '32px',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    boxShadow: '0 25px 50px rgba(0, 0, 0, 0.1)',
    transition: 'all 0.3s ease',
    cursor: 'pointer'
  };

  const mainGridStyle = {
    display: 'grid',
    gridTemplateColumns: '2fr 1fr',
    gap: '40px',
    marginBottom: '40px'
  };

  const cardStyle = {
    background: 'rgba(255, 255, 255, 0.1)',
    backdropFilter: 'blur(20px)',
    borderRadius: '24px',
    padding: '32px',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    boxShadow: '0 25px 50px rgba(0, 0, 0, 0.1)',
    color: '#ffffff'
  };

  const quickActionsGridStyle = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
    gap: '24px',
    marginTop: '40px'
  };

  return (
    <div style={containerStyle}>
      <div style={overlayStyle}></div>

      <div style={contentStyle}>
        {/* Header */}
        <div style={headerStyle}>
          <h1 style={{
            fontSize: '3.5rem',
            fontWeight: '800',
            margin: '0 0 16px 0',
            background: 'linear-gradient(135deg, #ffffff 0%, #f0f9ff 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            textShadow: '0 4px 20px rgba(255, 255, 255, 0.3)'
          }}>
            HardbanRecords Lab
          </h1>
          <p style={{
            fontSize: '1.5rem',
            margin: 0,
            opacity: 0.9,
            fontWeight: '300'
          }}>
            Your Music & Publishing Empire Dashboard
          </p>
        </div>

        {/* Stats Grid */}
        <div style={{
          ...statsGridStyle,
          background: 'linear-gradient(45deg, rgba(0,0,0,0.4) 0%, rgba(0,0,0,0.2) 100%)',
          borderRadius: '24px',
          padding: '32px',
          marginBottom: '40px',
          backgroundImage: 'url("https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=800&h=600&fit=crop")',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundBlendMode: 'overlay'
        }}>
          {stats.map((stat, index) => (
            <div
              key={index}
              onClick={stat.onClick}
              style={statCardStyle}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-8px) scale(1.02)';
                e.currentTarget.style.boxShadow = '0 35px 60px rgba(0, 0, 0, 0.2)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0) scale(1)';
                e.currentTarget.style.boxShadow = '0 25px 50px rgba(0, 0, 0, 0.1)';
              }}
            >
              <div style={{display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between'}}>
                <div>
                  <div style={{
                    background: `${stat.color}20`,
                    borderRadius: '16px',
                    padding: '16px',
                    marginBottom: '20px',
                    display: 'inline-block',
                    color: stat.color
                  }}>
                    <stat.icon size={32} />
                  </div>
                  <h3 style={{
                    fontSize: '2.5rem',
                    fontWeight: '800',
                    margin: '0 0 8px 0',
                    color: '#ffffff'
                  }}>
                    {stat.title}
                  </h3>
                  <p style={{
                    fontSize: '1.2rem',
                    fontWeight: '600',
                    margin: '0 0 4px 0',
                    color: '#ffffff',
                    opacity: 0.9
                  }}>
                    {stat.subtitle}
                  </p>
                  <p style={{
                    fontSize: '1rem',
                    margin: 0,
                    color: '#ffffff',
                    opacity: 0.7
                  }}>
                    {stat.desc}
                  </p>
                </div>
                <div style={{
                  background: 'rgba(16, 185, 129, 0.2)',
                  color: '#10b981',
                  padding: '8px 12px',
                  borderRadius: '12px',
                  fontSize: '0.9rem',
                  fontWeight: '600'
                }}>
                  {stat.growth}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Main Content Grid */}
        <div style={mainGridStyle}>
          {/* Recent Activity */}
          <div style={cardStyle}>
            <div style={{display: 'flex', alignItems: 'center', marginBottom: '24px'}}>
              <Bell size={24} style={{marginRight: '12px', color: '#F59E0B'}} />
              <h2 style={{fontSize: '1.5rem', fontWeight: '700', margin: 0}}>
                Recent Activity
              </h2>
            </div>
            <div style={{display: 'flex', flexDirection: 'column', gap: '16px'}}>
              {activities.map((activity, index) => (
                <div
                  key={index}
                  style={{
                    background: 'rgba(255, 255, 255, 0.05)',
                    borderRadius: '16px',
                    padding: '20px',
                    marginBottom: '16px',
                    display: 'flex',
                    alignItems: 'center',
                    transition: 'all 0.3s ease',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    cursor: 'pointer'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)';
                    e.currentTarget.style.transform = 'translateX(8px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                    e.currentTarget.style.transform = 'translateX(0)';
                  }}
                >
                  <div style={{
                    background: `${activity.color}20`,
                    borderRadius: '12px',
                    padding: '12px',
                    marginRight: '16px',
                    color: activity.color
                  }}>
                    <activity.icon size={20} />
                  </div>
                  <div style={{flex: 1}}>
                    <h4 style={{
                      fontSize: '1rem',
                      fontWeight: '600',
                      margin: '0 0 4px 0',
                      color: '#ffffff'
                    }}>
                      {activity.title}
                    </h4>
                    <p style={{
                      fontSize: '0.9rem',
                      margin: 0,
                      color: '#ffffff',
                      opacity: 0.7
                    }}>
                      {activity.details}
                    </p>
                  </div>
                  <div style={{
                    background: `${activity.color}20`,
                    color: activity.color,
                    padding: '6px 12px',
                    borderRadius: '8px',
                    fontSize: '0.8rem',
                    fontWeight: '500'
                  }}>
                    {activity.status}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Top Releases */}
          <div style={cardStyle}>
            <div style={{display: 'flex', alignItems: 'center', marginBottom: '24px'}}>
              <TrendingUp size={24} style={{marginRight: '12px', color: '#1DB954'}} />
              <h2 style={{fontSize: '1.5rem', fontWeight: '700', margin: 0}}>
                Top Releases
              </h2>
            </div>
            <div>
              {recentReleases.map((release, index) => (
                <div
                  key={index}
                  style={{
                    background: 'rgba(255, 255, 255, 0.05)',
                    borderRadius: '16px',
                    padding: '16px',
                    marginBottom: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    transition: 'all 0.3s ease',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    cursor: 'pointer'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)';
                    e.currentTarget.style.transform = 'scale(1.02)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                    e.currentTarget.style.transform = 'scale(1)';
                  }}
                >
                  <img
                    src={release.cover}
                    alt={release.title}
                    style={{
                      width: '50px',
                      height: '50px',
                      borderRadius: '12px',
                      marginRight: '12px',
                      objectFit: 'cover'
                    }}
                  />
                  <div style={{flex: 1}}>
                    <h4 style={{
                      fontSize: '1rem',
                      fontWeight: '600',
                      margin: '0 0 2px 0',
                      color: '#ffffff'
                    }}>
                      {release.title}
                    </h4>
                    <p style={{
                      fontSize: '0.8rem',
                      margin: '0 0 4px 0',
                      color: '#ffffff',
                      opacity: 0.7
                    }}>
                      {release.artist}
                    </p>
                    <div style={{display: 'flex', gap: '8px'}}>
                      {release.platforms.map((platform, i) => (
                        <span
                          key={i}
                          style={{
                            background: 'rgba(255, 255, 255, 0.1)',
                            padding: '2px 6px',
                            borderRadius: '4px',
                            fontSize: '0.7rem',
                            color: '#ffffff',
                            opacity: 0.8
                          }}
                        >
                          {platform}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div style={{textAlign: 'right'}}>
                    <div style={{
                      fontSize: '0.9rem',
                      fontWeight: '600',
                      color: '#10b981'
                    }}>
                      {release.streams}
                    </div>
                    <div style={{
                      fontSize: '0.8rem',
                      color: '#F59E0B'
                    }}>
                      {release.revenue}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div style={{
          background: 'linear-gradient(45deg, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0.1) 100%)',
          borderRadius: '24px',
          padding: '32px',
          backgroundImage: 'url("https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&h=600&fit=crop")',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundBlendMode: 'overlay'
        }}>
          <h2 style={{
            fontSize: '2.5rem',
            fontWeight: '800',
            margin: '0 0 32px 0',
            color: '#ffffff',
            textAlign: 'center'
          }}>
            Quick Actions
          </h2>
        <div style={quickActionsGridStyle}>
          {quickActions.map((action, index) => (
            <div
              key={index}
              onClick={action.onClick}
              style={{
                background: action.bgGradient,
                borderRadius: '20px',
                padding: '32px',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                position: 'relative',
                overflow: 'hidden'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-8px) scale(1.05)';
                e.currentTarget.style.boxShadow = '0 35px 60px rgba(0, 0, 0, 0.3)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0) scale(1)';
                e.currentTarget.style.boxShadow = '0 25px 50px rgba(0, 0, 0, 0.1)';
              }}
            >
              <div style={{
                position: 'absolute',
                top: '-20px',
                right: '-20px',
                width: '100px',
                height: '100px',
                background: 'rgba(255, 255, 255, 0.1)',
                borderRadius: '50%',
                backdropFilter: 'blur(10px)'
              }}></div>
              <div style={{position: 'relative', zIndex: 2}}>
                <div style={{color: '#ffffff', marginBottom: '16px'}}>
                  <action.icon size={32} />
                </div>
                <h3 style={{
                  fontSize: '1.3rem',
                  fontWeight: '700',
                  margin: '0 0 8px 0',
                  color: '#ffffff'
                }}>
                  {action.title}
                </h3>
                <p style={{
                  fontSize: '1rem',
                  margin: 0,
                  color: '#ffffff',
                  opacity: 0.9
                }}>
                  {action.description}
                </p>
              </div>
            </div>
          ))}
        </div>
        </div>
      </div>
    </div>
  );
};

export default HomePageNewModern;
