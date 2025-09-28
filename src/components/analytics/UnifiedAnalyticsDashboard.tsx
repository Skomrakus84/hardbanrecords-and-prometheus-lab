import React, { useState, useEffect } from 'react';
import {
  TrendingUp, BarChart3, DollarSign, Users, Eye, Music,
  BookOpen, ArrowUp, ArrowDown, RefreshCw,
  Share2, Globe, Star
} from 'lucide-react';

interface AnalyticsData {
  music: {
    totalPlays: number;
    totalLikes: number;
    totalShares: number;
    revenue: number;
    topPlatform: string;
    platformBreakdown: Record<string, {
      plays?: number;
      revenue?: number;
      likes?: number;
    }>;
    recentTrends: Array<{
      date: string;
      plays: number;
      revenue: number;
    }>;
  };
  publishing: {
    totalSales: number;
    totalRevenue: number;
    totalPagesRead: number;
    topPlatform: string;
    platformBreakdown: Record<string, {
      sales?: number;
      revenue?: number;
      pages_read?: number;
    }>;
    recentTrends: Array<{
      date: string;
      sales: number;
      revenue: number;
    }>;
  };
  combined: {
    totalRevenue: number;
    totalEngagement: number;
    growthRate: number;
    topPerformers: Array<{
      type: 'music' | 'book';
      title: string;
      performance: number;
    }>;
  };
}

interface StatCard {
  title: string;
  value: string;
  change: number;
  icon: React.ReactNode;
  color: string;
}

const UnifiedAnalyticsDashboard: React.FC = () => {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | '1y'>('30d');
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'music' | 'publishing'>('overview');

  useEffect(() => {
    fetchAnalytics();
  }, [timeRange]);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      // Mock API call - replace with actual integration manager call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const mockData: AnalyticsData = {
        music: {
          totalPlays: 124567,
          totalLikes: 8934,
          totalShares: 2145,
          revenue: 3247.89,
          topPlatform: 'Spotify',
          platformBreakdown: {
            spotify: { plays: 67890, revenue: 1823.45, likes: 4567 },
            soundcloud: { plays: 23456, revenue: 0, likes: 2134 },
            bandcamp: { plays: 12345, revenue: 987.23, likes: 1245 },
            apple_music: { plays: 20876, revenue: 436.21, likes: 988 }
          },
          recentTrends: Array.from({ length: 30 }, (_, i) => ({
            date: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString().split('T')[0]!,
            plays: Math.floor(Math.random() * 5000) + 2000,
            revenue: Math.floor(Math.random() * 200) + 50
          })).reverse()
        },
        publishing: {
          totalSales: 1823,
          totalRevenue: 12456.78,
          totalPagesRead: 234567,
          topPlatform: 'Amazon KDP',
          platformBreakdown: {
            amazon_kdp: { sales: 1245, revenue: 8934.56, pages_read: 156789 },
            apple_books: { sales: 345, revenue: 2456.78, pages_read: 45678 },
            kobo: { sales: 233, revenue: 1065.44, pages_read: 32100 }
          },
          recentTrends: Array.from({ length: 30 }, (_, i) => ({
            date: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString().split('T')[0]!,
            sales: Math.floor(Math.random() * 50) + 10,
            revenue: Math.floor(Math.random() * 500) + 100
          })).reverse()
        },
        combined: {
          totalRevenue: 15704.67,
          totalEngagement: 368123,
          growthRate: 23.5,
          topPerformers: [
            { type: 'music', title: 'Summer Vibes EP', performance: 45678 },
            { type: 'book', title: 'Digital Marketing Guide', performance: 1234 },
            { type: 'music', title: 'Midnight Sessions', performance: 34567 },
            { type: 'book', title: 'Creative Writing Handbook', performance: 987 }
          ]
        }
      };

      setAnalytics(mockData);
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatNumber = (num: number): string => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const getStatCards = (): StatCard[] => {
    if (!analytics) return [];

    switch (activeTab) {
      case 'music':
        return [
          {
            title: 'Total Plays',
            value: formatNumber(analytics.music.totalPlays),
            change: 15.3,
            icon: <Music className="w-6 h-6" />,
            color: '#3b82f6'
          },
          {
            title: 'Revenue',
            value: formatCurrency(analytics.music.revenue),
            change: 8.7,
            icon: <DollarSign className="w-6 h-6" />,
            color: '#10b981'
          },
          {
            title: 'Likes',
            value: formatNumber(analytics.music.totalLikes),
            change: 12.1,
            icon: <Star className="w-6 h-6" />,
            color: '#f59e0b'
          },
          {
            title: 'Shares',
            value: formatNumber(analytics.music.totalShares),
            change: 22.4,
            icon: <Share2 className="w-6 h-6" />,
            color: '#8b5cf6'
          }
        ];
      case 'publishing':
        return [
          {
            title: 'Books Sold',
            value: formatNumber(analytics.publishing.totalSales),
            change: 18.9,
            icon: <BookOpen className="w-6 h-6" />,
            color: '#3b82f6'
          },
          {
            title: 'Revenue',
            value: formatCurrency(analytics.publishing.totalRevenue),
            change: 25.3,
            icon: <DollarSign className="w-6 h-6" />,
            color: '#10b981'
          },
          {
            title: 'Pages Read',
            value: formatNumber(analytics.publishing.totalPagesRead),
            change: 31.7,
            icon: <Eye className="w-6 h-6" />,
            color: '#f59e0b'
          },
          {
            title: 'Platforms',
            value: Object.keys(analytics.publishing.platformBreakdown).length.toString(),
            change: 0,
            icon: <Globe className="w-6 h-6" />,
            color: '#8b5cf6'
          }
        ];
      default: // overview
        return [
          {
            title: 'Total Revenue',
            value: formatCurrency(analytics.combined.totalRevenue),
            change: 23.5,
            icon: <DollarSign className="w-6 h-6" />,
            color: '#10b981'
          },
          {
            title: 'Total Engagement',
            value: formatNumber(analytics.combined.totalEngagement),
            change: 18.2,
            icon: <Users className="w-6 h-6" />,
            color: '#3b82f6'
          },
          {
            title: 'Growth Rate',
            value: `${analytics.combined.growthRate}%`,
            change: analytics.combined.growthRate,
            icon: <TrendingUp className="w-6 h-6" />,
            color: '#f59e0b'
          },
          {
            title: 'Active Platforms',
            value: (Object.keys(analytics.music.platformBreakdown).length + Object.keys(analytics.publishing.platformBreakdown).length).toString(),
            change: 0,
            icon: <Globe className="w-6 h-6" />,
            color: '#8b5cf6'
          }
        ];
    }
  };

  const renderPlatformBreakdown = () => {
    if (!analytics) return null;

    const data = activeTab === 'music' ? analytics.music.platformBreakdown : 
                 activeTab === 'publishing' ? analytics.publishing.platformBreakdown :
                 { ...analytics.music.platformBreakdown, ...analytics.publishing.platformBreakdown };

    return (
      <div style={{
        background: 'white',
        borderRadius: '16px',
        padding: '24px',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
        border: '1px solid #e5e7eb'
      }}>
        <h3 style={{
          fontSize: '18px',
          fontWeight: '600',
          color: '#1f2937',
          marginBottom: '20px'
        }}>
          Platform Performance
        </h3>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {Object.entries(data).map(([platform, stats]) => (
            <div key={platform} style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '16px',
              background: '#f8fafc',
              borderRadius: '12px'
            }}>
              <div>
                <h4 style={{
                  fontSize: '14px',
                  fontWeight: '600',
                  color: '#374151',
                  textTransform: 'capitalize',
                  marginBottom: '4px'
                }}>
                  {platform.replace('_', ' ')}
                </h4>
                <div style={{
                  display: 'flex',
                  gap: '16px',
                  fontSize: '12px',
                  color: '#6b7280'
                }}>
                  {stats.plays && <span>Plays: {formatNumber(stats.plays)}</span>}
                  {stats.sales && <span>Sales: {formatNumber(stats.sales)}</span>}
                  {stats.revenue && <span>Revenue: {formatCurrency(stats.revenue)}</span>}
                </div>
              </div>
              
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <div style={{
                  width: '80px',
                  height: '6px',
                  background: '#e5e7eb',
                  borderRadius: '3px',
                  overflow: 'hidden'
                }}>
                  <div style={{
                    width: `${Math.min(100, ((stats.plays || stats.sales || 0) / Math.max(...Object.values(data).map(s => (s as any).plays || (s as any).sales || 0))) * 100)}%`,
                    height: '100%',
                    background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
                    borderRadius: '3px'
                  }} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        padding: '20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(20px)',
          borderRadius: '24px',
          padding: '48px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '20px'
        }}>
          <RefreshCw className="w-12 h-12 text-blue-500 animate-spin" />
          <p style={{ fontSize: '18px', color: '#374151' }}>
            Loading analytics from all platforms...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '20px'
    }}>
      <div style={{
        maxWidth: '1400px',
        margin: '0 auto'
      }}>
        {/* Header */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(20px)',
          borderRadius: '24px',
          padding: '32px',
          marginBottom: '24px',
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '24px'
          }}>
            <div>
              <h1 style={{
                fontSize: '32px',
                fontWeight: '700',
                color: '#1a202c',
                marginBottom: '8px',
                display: 'flex',
                alignItems: 'center',
                gap: '12px'
              }}>
                <BarChart3 className="w-8 h-8" />
                Unified Analytics
              </h1>
              <p style={{ color: '#64748b', fontSize: '16px' }}>
                Cross-platform performance insights for music and publishing
              </p>
            </div>
            
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value as '7d' | '30d' | '90d' | '1y')}
                style={{
                  padding: '10px 16px',
                  borderRadius: '8px',
                  border: '2px solid #e5e7eb',
                  background: 'white',
                  fontSize: '14px',
                  fontWeight: '500',
                  cursor: 'pointer'
                }}
              >
                <option value="7d">Last 7 days</option>
                <option value="30d">Last 30 days</option>
                <option value="90d">Last 90 days</option>
                <option value="1y">Last year</option>
              </select>
              
              <button
                onClick={fetchAnalytics}
                style={{
                  padding: '10px 16px',
                  borderRadius: '8px',
                  border: 'none',
                  background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                  color: 'white',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                <RefreshCw className="w-4 h-4" />
                Refresh
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div style={{
            display: 'flex',
            gap: '8px',
            padding: '4px',
            background: 'rgba(0, 0, 0, 0.05)',
            borderRadius: '12px',
            width: 'fit-content'
          }}>
            {[
              { key: 'overview', label: 'Overview', icon: BarChart3 },
              { key: 'music', label: 'Music', icon: Music },
              { key: 'publishing', label: 'Publishing', icon: BookOpen }
            ].map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as 'overview' | 'music' | 'publishing')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '12px 24px',
                  borderRadius: '8px',
                  border: 'none',
                  background: activeTab === tab.key ? 'white' : 'transparent',
                  color: activeTab === tab.key ? '#1a202c' : '#64748b',
                  fontWeight: activeTab === tab.key ? '600' : '500',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease'
                }}
              >
                <tab.icon className="w-5 h-5" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Stats Cards */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '20px',
          marginBottom: '24px'
        }}>
          {getStatCards().map((stat, index) => (
            <div
              key={index}
              style={{
                background: 'rgba(255, 255, 255, 0.95)',
                backdropFilter: 'blur(20px)',
                borderRadius: '16px',
                padding: '24px',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.2)'
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
                  borderRadius: '12px',
                  background: `${stat.color}20`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: stat.color
                }}>
                  {stat.icon}
                </div>
                
                {stat.change !== 0 && (
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    color: stat.change > 0 ? '#10b981' : '#ef4444',
                    fontSize: '14px',
                    fontWeight: '600'
                  }}>
                    {stat.change > 0 ? (
                      <ArrowUp className="w-4 h-4" />
                    ) : (
                      <ArrowDown className="w-4 h-4" />
                    )}
                    {Math.abs(stat.change)}%
                  </div>
                )}
              </div>
              
              <h3 style={{
                fontSize: '28px',
                fontWeight: '700',
                color: '#1f2937',
                marginBottom: '4px'
              }}>
                {stat.value}
              </h3>
              
              <p style={{
                color: '#6b7280',
                fontSize: '14px',
                fontWeight: '500'
              }}>
                {stat.title}
              </p>
            </div>
          ))}
        </div>

        {/* Platform Breakdown */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(20px)',
          borderRadius: '24px',
          padding: '32px',
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)'
        }}>
          {renderPlatformBreakdown()}
        </div>
      </div>
    </div>
  );
};

export default UnifiedAnalyticsDashboard;