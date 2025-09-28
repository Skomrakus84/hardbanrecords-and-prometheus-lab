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
  Building2
} from 'lucide-react';

interface StatCard {
  icon: React.ComponentType<{ size?: number; className?: string }>;
  title: string;
  subtitle: string;
  desc: string;
  growth: string;
  bgColor: string;
}



interface Activity {
  icon: React.ComponentType<{ size?: number; className?: string }>;
  title: string;
  details: string;
  status: string;
}

const HomePageNew: React.FC = () => {
  const navigate = useNavigate();
  const stats: StatCard[] = [
    {
      icon: Users,
      title: '25',
      subtitle: 'Active Artists',
      desc: 'New signings this month',
      growth: '+12%',
      bgColor: 'from-blue-500 to-blue-600'
    },
    {
      icon: Disc3,
      title: '45',
      subtitle: 'Total Releases',
      desc: 'Albums & Singles released',
      growth: '+8%',
      bgColor: 'from-purple-500 to-purple-600'
    },
    {
      icon: BookOpen,
      title: '12',
      subtitle: 'Published Books',
      desc: 'Books in our catalog',
      growth: '+15%',
      bgColor: 'from-green-500 to-green-600'
    },
    {
      icon: DollarSign,
      title: '$125,000',
      subtitle: 'Revenue',
      desc: 'Monthly revenue',
      growth: '+23%',
      bgColor: 'from-yellow-500 to-orange-500'
    }
  ];





  const recentActivities: Activity[] = [
    {
      icon: Disc3,
      title: "New album 'Midnight Dreams' released",
      details: 'by The Synthwave • 2 hours ago',
      status: '✅'
    },
    {
      icon: BookOpen,
      title: "Book 'Digital Future' published",
      details: 'by Alex Chen • 5 hours ago',
      status: '✅'
    },
    {
      icon: BarChart3,
      title: 'Monthly analytics report generated',
      details: '1M+ streams • 1 day ago',
      status: '✅'
    },
    {
      icon: Users,
      title: "New artist 'Neon Beats' signed",
      details: 'Electronic • 2 days ago',
      status: '✅'
    }
  ];

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: '32px',
      padding: '24px',
      backgroundColor: '#f8fafc',
      minHeight: '100vh'
    }}>
      {/* HERO SECTION with new graphics */}
      <div style={{
        background: 'linear-gradient(135deg, #9333ea 0%, #2563eb 50%, #4338ca 100%)',
        borderRadius: '16px',
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
        padding: '32px',
        color: 'white',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Background decoration */}
        <div style={{
          position: 'absolute',
          top: '0',
          right: '0',
          width: '256px',
          height: '256px',
          opacity: 0.1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <BarChart3 size={128} className="text-white" />
        </div>

        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          position: 'relative',
          zIndex: 10
        }}>
          <div style={{display: 'flex', alignItems: 'center', gap: '24px'}}>
            <div style={{
              width: '64px',
              height: '64px',
              borderRadius: '12px',
              boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
              background: 'rgba(255, 255, 255, 0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Building2 size={32} className="text-white" />
            </div>
            <div>
              <h1 style={{
                fontSize: '36px',
                fontWeight: 'bold',
                marginBottom: '8px',
                color: 'white'
              }}>Welcome to HardbanRecords Lab</h1>
              <p style={{
                fontSize: '20px',
                color: '#c7d2fe',
                marginBottom: '24px'
              }}>Your complete music distribution and digital publishing platform</p>

              <div style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: '16px'
              }}>
                <div style={{
                  background: 'rgba(34, 197, 94, 0.2)',
                  color: '#dcfce7',
                  padding: '8px 16px',
                  borderRadius: '20px',
                  fontSize: '14px',
                  fontWeight: '600',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <div style={{
                    width: '8px',
                    height: '8px',
                    background: '#22c55e',
                    borderRadius: '50%'
                  }}></div>
                  All systems operational
                </div>
                <div style={{
                  background: 'rgba(59, 130, 246, 0.2)',
                  color: '#dbeafe',
                  padding: '8px 16px',
                  borderRadius: '20px',
                  fontSize: '14px',
                  fontWeight: '600',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <TrendingUp size={16} color="#dbeafe" />
                  Revenue up 23% this month
                </div>
                <div style={{
                  background: 'rgba(245, 158, 11, 0.2)',
                  color: '#fef3c7',
                  padding: '8px 16px',
                  borderRadius: '20px',
                  fontSize: '14px',
                  fontWeight: '600'
                }}>
                  28 active projects
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ENHANCED STATISTICS GRID */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: '24px'
      }}>
        {stats.map((stat, index) => {
          const gradients = [
            'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
            'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
            'linear-gradient(135deg, #10b981 0%, #059669 100%)',
            'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)'
          ];

          return (
            <div
              key={index}
              style={{
                background: gradients[index % 4],
                borderRadius: '20px',
                boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
                padding: '32px',
                color: 'white',
                position: 'relative',
                overflow: 'hidden',
                cursor: 'pointer',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-8px) scale(1.02)';
                e.currentTarget.style.boxShadow = '0 25px 50px -12px rgba(0, 0, 0, 0.25)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0) scale(1)';
                e.currentTarget.style.boxShadow = '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)';
              }}
            >
              {/* Background decoration */}
              <div style={{
                position: 'absolute',
                top: '-16px',
                right: '-16px',
                width: '80px',
                height: '80px',
                borderRadius: '50%',
                background: 'rgba(255, 255, 255, 0.1)'
              }}></div>
              <div style={{
                position: 'absolute',
                bottom: '-24px',
                left: '-24px',
                width: '96px',
                height: '96px',
                borderRadius: '50%',
                background: 'rgba(255, 255, 255, 0.05)'
              }}></div>

              <div style={{position: 'relative', zIndex: 10}}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: '24px'
                }}>
                  <div style={{
                    width: '56px',
                    height: '56px',
                    background: 'rgba(255, 255, 255, 0.2)',
                    borderRadius: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <stat.icon size={28} className="text-white" />
                  </div>
                  <div style={{
                    background: 'rgba(255, 255, 255, 0.2)',
                    borderRadius: '20px',
                    padding: '4px 12px',
                    fontSize: '14px',
                    fontWeight: '600'
                  }}>
                    {stat.growth}
                  </div>
                </div>
                <h3 style={{
                  fontSize: '36px',
                  fontWeight: 'bold',
                  marginBottom: '8px',
                  color: 'white'
                }}>{stat.title}</h3>
                <p style={{
                  fontSize: '18px',
                  fontWeight: '600',
                  marginBottom: '4px',
                  color: 'rgba(255, 255, 255, 0.9)'
                }}>{stat.subtitle}</p>
                <p style={{
                  fontSize: '14px',
                  color: 'rgba(255, 255, 255, 0.7)'
                }}>{stat.desc}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* ENHANCED QUICK ACTIONS */}
      <div style={{
        background: 'rgba(255, 255, 255, 0.25)',
        borderRadius: '20px',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        padding: '32px',
        border: '1px solid rgba(255, 255, 255, 0.2)',
        backdropFilter: 'blur(16px)'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          marginBottom: '32px'
        }}>
          <div style={{
            width: '48px',
            height: '48px',
            background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Upload size={24} className="text-white" />
          </div>
          <div>
            <h2 style={{
              fontSize: '24px',
              fontWeight: 'bold',
              color: 'white',
              margin: '0'
            }}>Quick Actions</h2>
            <p style={{
              color: 'rgba(255, 255, 255, 0.8)',
              margin: '0'
            }}>Start your next project in seconds</p>
          </div>
        </div>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '16px'
        }}>
          <button
          onClick={() => navigate('/music/releases/new')}
          style={{
            background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
            color: 'white',
            padding: '16px',
            borderRadius: '12px',
            border: 'none',
            cursor: 'pointer',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '12px'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-4px)';
            e.currentTarget.style.boxShadow = '0 20px 25px -5px rgba(59, 130, 246, 0.4)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = 'none';
          }}>
            <Disc3 size={24} />
            <span style={{fontWeight: '600'}}>Add New Release</span>
          </button>
          <button
          onClick={() => navigate('/books/new')}
          style={{
            background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
            color: 'white',
            padding: '16px',
            borderRadius: '12px',
            border: 'none',
            cursor: 'pointer',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '12px'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-4px)';
            e.currentTarget.style.boxShadow = '0 20px 25px -5px rgba(16, 185, 129, 0.4)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = 'none';
          }}>
            <BookOpen size={24} />
            <span style={{fontWeight: '600'}}>Publish Book</span>
          </button>
          <button style={{
            background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
            color: 'white',
            padding: '16px',
            borderRadius: '12px',
            border: 'none',
            cursor: 'pointer',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '12px'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-4px)';
            e.currentTarget.style.boxShadow = '0 20px 25px -5px rgba(139, 92, 246, 0.4)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = 'none';
          }}>
            <BarChart3 size={24} />
            <span style={{fontWeight: '600'}}>View Analytics</span>
          </button>
          <button style={{
            background: 'linear-gradient(135deg, #f97316 0%, #ef4444 100%)',
            color: 'white',
            padding: '16px',
            borderRadius: '12px',
            border: 'none',
            cursor: 'pointer',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '12px'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-4px)';
            e.currentTarget.style.boxShadow = '0 20px 25px -5px rgba(249, 115, 22, 0.4)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = 'none';
          }}>
            <Users size={24} />
            <span style={{fontWeight: '600'}}>Manage Artists</span>
          </button>
        </div>
      </div>

      {/* ENHANCED PERFORMANCE METRICS */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
        gap: '24px'
      }}>
        <div style={{
          background: 'linear-gradient(135deg, #3b82f6 20%, #2563eb 50%, #6366f1 100%)',
          borderRadius: '20px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          padding: '32px',
          color: 'white',
          position: 'relative',
          overflow: 'hidden',
          cursor: 'pointer',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'translateY(-4px)';
          e.currentTarget.style.boxShadow = '0 32px 64px -12px rgba(59, 130, 246, 0.4)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = '0 25px 50px -12px rgba(0, 0, 0, 0.25)';
        }}>
          {/* Background decoration */}
          <div style={{
            position: 'absolute',
            top: '-32px',
            right: '-32px',
            width: '128px',
            height: '128px',
            borderRadius: '50%',
            background: 'rgba(255, 255, 255, 0.1)'
          }}></div>
          <div style={{
            position: 'absolute',
            bottom: '-16px',
            left: '-16px',
            width: '96px',
            height: '96px',
            borderRadius: '50%',
            background: 'rgba(255, 255, 255, 0.05)'
          }}></div>

          <div style={{position: 'relative', zIndex: 10}}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '24px'
            }}>
              <div style={{
                width: '56px',
                height: '56px',
                background: 'rgba(255, 255, 255, 0.2)',
                borderRadius: '16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backdropFilter: 'blur(8px)'
              }}>
                <Headphones size={28} className="text-white" />
              </div>
              <div style={{
                background: 'rgba(34, 197, 94, 0.9)',
                borderRadius: '20px',
                padding: '4px 12px',
                fontSize: '14px',
                fontWeight: 'bold',
                color: '#065f46'
              }}>
                +18%
              </div>
            </div>
            <h3 style={{
              fontSize: '36px',
              fontWeight: 'bold',
              marginBottom: '8px',
              color: 'white'
            }}>2.4M</h3>
            <p style={{
              fontSize: '18px',
              fontWeight: '600',
              marginBottom: '16px',
              color: 'rgba(255, 255, 255, 0.9)'
            }}>Total Streams</p>
            <div style={{
              width: '100%',
              background: 'rgba(255, 255, 255, 0.2)',
              borderRadius: '8px',
              height: '8px'
            }}>
              <div style={{
                background: 'white',
                height: '8px',
                borderRadius: '8px',
                width: '85%',
                animation: 'pulse 2s infinite'
              }}></div>
            </div>
          </div>
        </div>

        <div style={{
          background: 'linear-gradient(135deg, #10b981 20%, #059669 50%, #047857 100%)',
          borderRadius: '20px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          padding: '32px',
          color: 'white',
          position: 'relative',
          overflow: 'hidden',
          cursor: 'pointer',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'translateY(-4px)';
          e.currentTarget.style.boxShadow = '0 32px 64px -12px rgba(16, 185, 129, 0.4)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = '0 25px 50px -12px rgba(0, 0, 0, 0.25)';
        }}>
          <div style={{
            position: 'absolute',
            top: '-32px',
            right: '-32px',
            width: '128px',
            height: '128px',
            borderRadius: '50%',
            background: 'rgba(255, 255, 255, 0.1)'
          }}></div>
          <div style={{
            position: 'absolute',
            bottom: '-16px',
            left: '-16px',
            width: '96px',
            height: '96px',
            borderRadius: '50%',
            background: 'rgba(255, 255, 255, 0.05)'
          }}></div>

          <div style={{position: 'relative', zIndex: 10}}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '24px'
            }}>
              <div style={{
                width: '56px',
                height: '56px',
                background: 'rgba(255, 255, 255, 0.2)',
                borderRadius: '16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backdropFilter: 'blur(8px)'
              }}>
                <BookOpen size={28} className="text-white" />
              </div>
              <div style={{
                background: 'rgba(251, 191, 36, 0.9)',
                borderRadius: '20px',
                padding: '4px 12px',
                fontSize: '14px',
                fontWeight: 'bold',
                color: '#78350f'
              }}>
                +31%
              </div>
            </div>
            <h3 style={{
              fontSize: '36px',
              fontWeight: 'bold',
              marginBottom: '8px',
              color: 'white'
            }}>1,247</h3>
            <p style={{
              fontSize: '18px',
              fontWeight: '600',
              marginBottom: '16px',
              color: 'rgba(255, 255, 255, 0.9)'
            }}>Book Sales</p>
            <div style={{
              width: '100%',
              background: 'rgba(255, 255, 255, 0.2)',
              borderRadius: '8px',
              height: '8px'
            }}>
              <div style={{
                background: 'white',
                height: '8px',
                borderRadius: '8px',
                width: '92%',
                animation: 'pulse 2s infinite'
              }}></div>
            </div>
          </div>
        </div>

        <div style={{
          background: 'linear-gradient(135deg, #8b5cf6 20%, #7c3aed 50%, #ec4899 100%)',
          borderRadius: '20px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          padding: '32px',
          color: 'white',
          position: 'relative',
          overflow: 'hidden',
          cursor: 'pointer',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'translateY(-4px)';
          e.currentTarget.style.boxShadow = '0 32px 64px -12px rgba(139, 92, 246, 0.4)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = '0 25px 50px -12px rgba(0, 0, 0, 0.25)';
        }}>
          <div style={{
            position: 'absolute',
            top: '-32px',
            right: '-32px',
            width: '128px',
            height: '128px',
            borderRadius: '50%',
            background: 'rgba(255, 255, 255, 0.1)'
          }}></div>
          <div style={{
            position: 'absolute',
            bottom: '-16px',
            left: '-16px',
            width: '96px',
            height: '96px',
            borderRadius: '50%',
            background: 'rgba(255, 255, 255, 0.05)'
          }}></div>

          <div style={{position: 'relative', zIndex: 10}}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '24px'
            }}>
              <div style={{
                width: '56px',
                height: '56px',
                background: 'rgba(255, 255, 255, 0.2)',
                borderRadius: '16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backdropFilter: 'blur(8px)'
              }}>
                <Rocket size={28} className="text-white" />
              </div>
              <div style={{
                background: 'rgba(96, 165, 250, 0.9)',
                borderRadius: '20px',
                padding: '4px 12px',
                fontSize: '14px',
                fontWeight: 'bold',
                color: '#1e3a8a'
              }}>
                +7 new
              </div>
            </div>
            <h3 style={{
              fontSize: '36px',
              fontWeight: 'bold',
              marginBottom: '8px',
              color: 'white'
            }}>28</h3>
            <p style={{
              fontSize: '18px',
              fontWeight: '600',
              marginBottom: '16px',
              color: 'rgba(255, 255, 255, 0.9)'
            }}>Active Projects</p>
            <div style={{
              width: '100%',
              background: 'rgba(255, 255, 255, 0.2)',
              borderRadius: '8px',
              height: '8px'
            }}>
              <div style={{
                background: 'white',
                height: '8px',
                borderRadius: '8px',
                width: '67%',
                animation: 'pulse 2s infinite'
              }}></div>
            </div>
          </div>
        </div>
      </div>

      {/* ENHANCED RECENT ACTIVITY & CTA */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '32px'
      }}>
        {/* Recent Activity */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.25)',
          borderRadius: '20px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          padding: '32px',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          backdropFilter: 'blur(16px)'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            marginBottom: '32px'
          }}>
            <div style={{
              width: '48px',
              height: '48px',
              background: 'linear-gradient(135deg, #f97316 0%, #ef4444 100%)',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Bell size={24} className="text-white" />
            </div>
            <div>
              <h2 style={{
                fontSize: '24px',
                fontWeight: 'bold',
                color: 'white',
                margin: '0'
              }}>Recent Activity</h2>
              <p style={{
                color: 'rgba(255, 255, 255, 0.8)',
                margin: '0'
              }}>Latest updates from your projects</p>
            </div>
          </div>
          <div style={{display: 'flex', flexDirection: 'column', gap: '16px'}}>
            {recentActivities.map((activity, index) => (
              <div
                key={index}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '16px',
                  padding: '16px',
                  borderRadius: '12px',
                  border: '1px solid transparent',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  cursor: 'pointer'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'linear-gradient(135deg, rgba(249, 250, 251, 0.1) 0%, rgba(219, 234, 254, 0.1) 100%)';
                  e.currentTarget.style.border = '1px solid rgba(59, 130, 246, 0.2)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.border = '1px solid transparent';
                }}
              >
                <div style={{
                  width: '48px',
                  height: '48px',
                  background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.2) 0%, rgba(139, 92, 246, 0.2) 100%)',
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.3s'
                }}>
                  <activity.icon size={22} className="text-blue-600" />
                </div>
                <div style={{flex: 1}}>
                  <p style={{
                    fontWeight: '600',
                    color: 'white',
                    margin: '0 0 4px 0',
                    transition: 'color 0.3s'
                  }}>{activity.title}</p>
                  <p style={{
                    fontSize: '14px',
                    color: 'rgba(255, 255, 255, 0.7)',
                    margin: '0',
                    transition: 'color 0.3s'
                  }}>{activity.details}</p>
                </div>
                <div style={{
                  fontSize: '24px',
                  transition: 'transform 0.3s'
                }}>{activity.status}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Enhanced Call to Action */}
        <div style={{
          background: 'linear-gradient(135deg, #6366f1 20%, #8b5cf6 50%, #ec4899 100%)',
          borderRadius: '20px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          padding: '32px',
          color: 'white',
          position: 'relative',
          overflow: 'hidden'
        }}>
          {/* Background decoration */}
          <div style={{
            position: 'absolute',
            top: '-40px',
            right: '-40px',
            width: '160px',
            height: '160px',
            borderRadius: '50%',
            background: 'rgba(255, 255, 255, 0.1)'
          }}></div>
          <div style={{
            position: 'absolute',
            bottom: '-32px',
            left: '-32px',
            width: '128px',
            height: '128px',
            borderRadius: '50%',
            background: 'rgba(255, 255, 255, 0.05)'
          }}></div>

          <div style={{position: 'relative', zIndex: 10}}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              marginBottom: '16px'
            }}>
              <div style={{
                width: '56px',
                height: '56px',
                background: 'rgba(255, 255, 255, 0.2)',
                borderRadius: '16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backdropFilter: 'blur(8px)'
              }}>
                <Target size={28} className="text-white" />
              </div>
            </div>
            <h2 style={{
              fontSize: '30px',
              fontWeight: 'bold',
              marginBottom: '12px',
              color: 'white'
            }}>Ready to create something amazing?</h2>
            <p style={{
              fontSize: '18px',
              color: 'rgba(255, 255, 255, 0.9)',
              marginBottom: '32px',
              lineHeight: '1.6'
            }}>
              Start your next music release or book publishing project today with our powerful tools
            </p>
            <div style={{display: 'flex', flexDirection: 'column', gap: '16px'}}>
              <button style={{
                width: '100%',
                background: 'white',
                color: '#6366f1',
                fontWeight: 'bold',
                padding: '16px 24px',
                borderRadius: '12px',
                border: 'none',
                cursor: 'pointer',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '12px',
                boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#f9fafb';
                e.currentTarget.style.transform = 'scale(1.02)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'white';
                e.currentTarget.style.transform = 'scale(1)';
              }}>
                <Disc3 size={22} />
                Create Music Release
              </button>
              <button style={{
                width: '100%',
                background: 'rgba(99, 102, 241, 0.5)',
                color: 'white',
                fontWeight: 'bold',
                padding: '16px 24px',
                borderRadius: '12px',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                cursor: 'pointer',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '12px',
                backdropFilter: 'blur(8px)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(99, 102, 241, 0.7)';
                e.currentTarget.style.transform = 'scale(1.02)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(99, 102, 241, 0.5)';
                e.currentTarget.style.transform = 'scale(1)';
              }}>
                <BookOpen size={22} />
                Publish New Book
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePageNew;
