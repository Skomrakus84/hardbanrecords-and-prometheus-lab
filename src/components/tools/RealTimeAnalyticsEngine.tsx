// Real-time Analytics Engine - Cross-platform analytics aggregator
import React, { useState, useEffect } from 'react';
import {
  BarChart3, TrendingUp, Users, DollarSign, Play, Download, 
  Heart, Share2, Globe, Clock, Eye, Headphones, BookOpen,
  Zap, RefreshCw, Filter, Calendar, ArrowUp, ArrowDown,
  Target, Activity, Layers, Database, Settings, Bell
} from 'lucide-react';

interface PlatformMetrics {
  platform: string;
  type: 'music' | 'publishing';
  metrics: {
    streams?: number;
    sales?: number;
    revenue: number;
    listeners?: number;
    readers?: number;
    engagement: number;
    growth: number;
    countries: number;
    avgSessionTime?: number;
    completionRate?: number;
  };
  trends: {
    daily: number[];
    weekly: number[];
    monthly: number[];
  };
  demographics: {
    ageGroups: Record<string, number>;
    countries: Record<string, number>;
    devices: Record<string, number>;
  };
  lastUpdate: string;
  status: 'online' | 'offline' | 'syncing';
}

interface AlertRule {
  id: string;
  name: string;
  platform: string;
  metric: string;
  condition: 'above' | 'below' | 'change';
  threshold: number;
  enabled: boolean;
  notifications: ('email' | 'push' | 'dashboard')[];
}

interface AnalyticsAlert {
  id: string;
  rule: AlertRule;
  currentValue: number;
  message: string;
  severity: 'low' | 'medium' | 'high';
  timestamp: string;
  acknowledged: boolean;
}

const RealTimeAnalyticsEngine: React.FC = () => {
  const [platformMetrics, setPlatformMetrics] = useState<PlatformMetrics[]>([]);
  const [selectedTimeRange, setSelectedTimeRange] = useState<'1h' | '24h' | '7d' | '30d'>('24h');
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([]);
  const [alerts, setAlerts] = useState<AnalyticsAlert[]>([]);
  const [alertRules, setAlertRules] = useState<AlertRule[]>([]);
  const [isRealTimeMode, setIsRealTimeMode] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'platforms' | 'demographics' | 'alerts'>('overview');
  const [syncStatus, setSyncStatus] = useState<'syncing' | 'synced' | 'error'>('synced');

  // Mock data for all platforms
  const allPlatforms = [
    'spotify', 'apple-music', 'amazon-music', 'youtube-music', 'deezer', 'tidal',
    'soundcloud', 'bandcamp', 'reverbnation', 'audiomack', 'jamendo',
    'amazon-kdp', 'apple-books', 'google-play-books', 'kobo', 'barnes-noble',
    'smashwords', 'draft2digital', 'scribd', 'lulu', 'ingramspark'
  ];

  useEffect(() => {
    initializeAnalytics();
    setupAlertRules();
    
    if (isRealTimeMode) {
      const interval = setInterval(() => {
        updateRealTimeData();
      }, 5000); // Update every 5 seconds
      
      return () => clearInterval(interval);
    }
  }, [isRealTimeMode]);

  const initializeAnalytics = () => {
    const mockMetrics: PlatformMetrics[] = allPlatforms.map(platform => {
      const isMusic = ['spotify', 'apple-music', 'amazon-music', 'youtube-music', 'deezer', 'tidal', 'soundcloud', 'bandcamp', 'reverbnation', 'audiomack', 'jamendo'].includes(platform);
      
      return {
        platform,
        type: isMusic ? 'music' : 'publishing',
        metrics: {
          ...(isMusic && {
            streams: Math.floor(Math.random() * 50000) + 1000,
            listeners: Math.floor(Math.random() * 5000) + 100,
            avgSessionTime: Math.floor(Math.random() * 180) + 30
          }),
          ...(!isMusic && {
            sales: Math.floor(Math.random() * 500) + 10,
            readers: Math.floor(Math.random() * 1000) + 50,
            completionRate: Math.floor(Math.random() * 40) + 60
          }),
          revenue: Math.floor(Math.random() * 1000) + 50,
          engagement: Math.floor(Math.random() * 40) + 60,
          growth: (Math.random() - 0.5) * 20, // -10% to +10%
          countries: Math.floor(Math.random() * 50) + 10
        },
        trends: {
          daily: Array.from({ length: 24 }, () => Math.floor(Math.random() * 100)),
          weekly: Array.from({ length: 7 }, () => Math.floor(Math.random() * 1000)),
          monthly: Array.from({ length: 30 }, () => Math.floor(Math.random() * 500))
        },
        demographics: {
          ageGroups: {
            '13-17': Math.floor(Math.random() * 15) + 5,
            '18-24': Math.floor(Math.random() * 25) + 15,
            '25-34': Math.floor(Math.random() * 30) + 20,
            '35-44': Math.floor(Math.random() * 20) + 10,
            '45-54': Math.floor(Math.random() * 15) + 5,
            '55+': Math.floor(Math.random() * 10) + 2
          },
          countries: {
            'United States': Math.floor(Math.random() * 30) + 20,
            'United Kingdom': Math.floor(Math.random() * 15) + 10,
            'Germany': Math.floor(Math.random() * 12) + 8,
            'France': Math.floor(Math.random() * 10) + 6,
            'Canada': Math.floor(Math.random() * 8) + 4,
            'Australia': Math.floor(Math.random() * 6) + 3,
            'Other': Math.floor(Math.random() * 20) + 10
          },
          devices: {
            'Mobile': Math.floor(Math.random() * 30) + 50,
            'Desktop': Math.floor(Math.random() * 25) + 20,
            'Tablet': Math.floor(Math.random() * 15) + 10,
            'Smart Speaker': Math.floor(Math.random() * 10) + 5,
            'Other': Math.floor(Math.random() * 5) + 2
          }
        },
        lastUpdate: new Date().toISOString(),
        status: Math.random() > 0.1 ? 'online' : 'offline'
      };
    });

    setPlatformMetrics(mockMetrics);
    setSelectedPlatforms(mockMetrics.slice(0, 6).map(m => m.platform));
  };

  const setupAlertRules = () => {
    const rules: AlertRule[] = [
      {
        id: 'rule_001',
        name: 'High Engagement Alert',
        platform: 'spotify',
        metric: 'engagement',
        condition: 'above',
        threshold: 85,
        enabled: true,
        notifications: ['dashboard', 'email']
      },
      {
        id: 'rule_002',
        name: 'Revenue Drop Warning',
        platform: 'all',
        metric: 'revenue',
        condition: 'below',
        threshold: 50,
        enabled: true,
        notifications: ['dashboard', 'push', 'email']
      },
      {
        id: 'rule_003',
        name: 'Viral Content Detection',
        platform: 'youtube-music',
        metric: 'streams',
        condition: 'change',
        threshold: 500, // 500% increase
        enabled: true,
        notifications: ['dashboard', 'push']
      }
    ];

    setAlertRules(rules);
    
    // Generate some mock alerts
    const mockAlerts: AnalyticsAlert[] = [
      {
        id: 'alert_001',
        rule: rules[0],
        currentValue: 92,
        message: 'Spotify engagement reached 92% (threshold: 85%)',
        severity: 'medium',
        timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
        acknowledged: false
      },
      {
        id: 'alert_002',
        rule: rules[2],
        currentValue: 15420,
        message: 'YouTube Music streams increased 650% in last hour',
        severity: 'high',
        timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
        acknowledged: false
      }
    ];

    setAlerts(mockAlerts);
  };

  const updateRealTimeData = () => {
    setSyncStatus('syncing');
    
    setTimeout(() => {
      setPlatformMetrics(prev => prev.map(metric => ({
        ...metric,
        metrics: {
          ...metric.metrics,
          // Simulate small real-time changes
          streams: metric.metrics.streams ? Math.max(0, metric.metrics.streams + Math.floor(Math.random() * 20) - 10) : undefined,
          revenue: Math.max(0, metric.metrics.revenue + (Math.random() - 0.5) * 10),
          engagement: Math.max(0, Math.min(100, metric.metrics.engagement + (Math.random() - 0.5) * 2)),
          listeners: metric.metrics.listeners ? Math.max(0, metric.metrics.listeners + Math.floor(Math.random() * 10) - 5) : undefined,
          readers: metric.metrics.readers ? Math.max(0, metric.metrics.readers + Math.floor(Math.random() * 5) - 2) : undefined
        },
        lastUpdate: new Date().toISOString()
      })));
      
      setSyncStatus('synced');
    }, 1000);
  };

  const calculateTotalMetrics = () => {
    const selectedMetrics = platformMetrics.filter(m => selectedPlatforms.includes(m.platform));
    
    return {
      totalRevenue: selectedMetrics.reduce((sum, m) => sum + m.metrics.revenue, 0),
      totalStreams: selectedMetrics.reduce((sum, m) => sum + (m.metrics.streams || 0), 0),
      totalSales: selectedMetrics.reduce((sum, m) => sum + (m.metrics.sales || 0), 0),
      totalListeners: selectedMetrics.reduce((sum, m) => sum + (m.metrics.listeners || 0), 0),
      totalReaders: selectedMetrics.reduce((sum, m) => sum + (m.metrics.readers || 0), 0),
      avgEngagement: selectedMetrics.reduce((sum, m) => sum + m.metrics.engagement, 0) / selectedMetrics.length,
      avgGrowth: selectedMetrics.reduce((sum, m) => sum + m.metrics.growth, 0) / selectedMetrics.length,
      activePlatforms: selectedMetrics.filter(m => m.status === 'online').length
    };
  };

  const renderOverviewTab = () => {
    const totals = calculateTotalMetrics();
    
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        {/* Key Metrics Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
          <div style={{
            background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
            borderRadius: '16px',
            padding: '24px',
            color: 'white'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <DollarSign className="w-8 h-8" />
              <span style={{ fontSize: '12px', opacity: 0.8 }}>Total Revenue</span>
            </div>
            <div style={{ fontSize: '28px', fontWeight: '700' }}>
              ${totals.totalRevenue.toFixed(2)}
            </div>
            <div style={{ fontSize: '12px', opacity: 0.8, display: 'flex', alignItems: 'center', gap: '4px' }}>
              {totals.avgGrowth >= 0 ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />}
              {Math.abs(totals.avgGrowth).toFixed(1)}% vs last period
            </div>
          </div>

          <div style={{
            background: 'linear-gradient(135deg, #10b981, #059669)',
            borderRadius: '16px',
            padding: '24px',
            color: 'white'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <Play className="w-8 h-8" />
              <span style={{ fontSize: '12px', opacity: 0.8 }}>Total Streams</span>
            </div>
            <div style={{ fontSize: '28px', fontWeight: '700' }}>
              {(totals.totalStreams / 1000).toFixed(1)}K
            </div>
            <div style={{ fontSize: '12px', opacity: 0.8' }}>
              Across {platformMetrics.filter(m => m.type === 'music').length} music platforms
            </div>
          </div>

          <div style={{
            background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
            borderRadius: '16px',
            padding: '24px',
            color: 'white'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <Users className="w-8 h-8" />
              <span style={{ fontSize: '12px', opacity: 0.8 }}>Total Audience</span>
            </div>
            <div style={{ fontSize: '28px', fontWeight: '700' }}>
              {((totals.totalListeners + totals.totalReaders) / 1000).toFixed(1)}K
            </div>
            <div style={{ fontSize: '12px', opacity: 0.8' }}>
              {totals.totalListeners} listeners • {totals.totalReaders} readers
            </div>
          </div>

          <div style={{
            background: 'linear-gradient(135deg, #f59e0b, #d97706)',
            borderRadius: '16px',
            padding: '24px',
            color: 'white'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <Target className="w-8 h-8" />
              <span style={{ fontSize: '12px', opacity: 0.8 }}>Avg Engagement</span>
            </div>
            <div style={{ fontSize: '28px', fontWeight: '700' }}>
              {totals.avgEngagement.toFixed(1)}%
            </div>
            <div style={{ fontSize: '12px', opacity: 0.8' }}>
              {totals.activePlatforms}/{selectedPlatforms.length} platforms active
            </div>
          </div>
        </div>

        {/* Real-time Activity Feed */}
        <div style={{
          background: 'white',
          borderRadius: '16px',
          padding: '24px',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h3 style={{ fontSize: '20px', fontWeight: '600' }}>Real-time Activity</h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                background: isRealTimeMode ? '#10b981' : '#6b7280'
              }} />
              <span style={{ fontSize: '14px', color: '#64748b' }}>
                {syncStatus === 'syncing' ? 'Syncing...' : 'Live'}
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '300px', overflowY: 'auto' }}>
            {platformMetrics
              .filter(m => selectedPlatforms.includes(m.platform))
              .sort((a, b) => new Date(b.lastUpdate).getTime() - new Date(a.lastUpdate).getTime())
              .slice(0, 10)
              .map(metric => (
                <div
                  key={metric.platform}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '12px',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    background: '#fafafa'
                  }}
                >
                  <div style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    background: metric.status === 'online' ? '#10b981' : '#ef4444'
                  }} />
                  
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '14px', fontWeight: '600', textTransform: 'capitalize' }}>
                      {metric.platform.replace('-', ' ')}
                    </div>
                    <div style={{ fontSize: '12px', color: '#64748b' }}>
                      {metric.type === 'music' 
                        ? `${metric.metrics.streams} streams • ${metric.metrics.listeners} listeners`
                        : `${metric.metrics.sales} sales • ${metric.metrics.readers} readers`
                      }
                    </div>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '14px', fontWeight: '600' }}>
                      ${metric.metrics.revenue.toFixed(2)}
                    </div>
                    <div style={{
                      fontSize: '12px',
                      color: metric.metrics.growth >= 0 ? '#10b981' : '#ef4444',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '2px'
                    }}>
                      {metric.metrics.growth >= 0 ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />}
                      {Math.abs(metric.metrics.growth).toFixed(1)}%
                    </div>
                  </div>

                  <div style={{ fontSize: '10px', color: '#9ca3af' }}>
                    {new Date(metric.lastUpdate).toLocaleTimeString()}
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>
    );
  };

  const renderPlatformsTab = () => (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '20px' }}>
      {platformMetrics
        .filter(m => selectedPlatforms.includes(m.platform))
        .map(metric => (
          <div
            key={metric.platform}
            style={{
              background: 'white',
              borderRadius: '16px',
              padding: '20px',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
              border: '1px solid #e5e7eb'
            }}
          >
            {/* Platform Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div>
                <h3 style={{ fontSize: '16px', fontWeight: '600', textTransform: 'capitalize' }}>
                  {metric.platform.replace('-', ' ')}
                </h3>
                <p style={{ fontSize: '12px', color: '#64748b' }}>
                  {metric.type === 'music' ? 'Music Platform' : 'Publishing Platform'}
                </p>
              </div>
              <div style={{
                padding: '4px 8px',
                borderRadius: '6px',
                fontSize: '10px',
                fontWeight: '600',
                background: metric.status === 'online' ? '#dcfce7' : '#fee2e2',
                color: metric.status === 'online' ? '#166534' : '#991b1b'
              }}>
                {metric.status.toUpperCase()}
              </div>
            </div>

            {/* Key Metrics */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
              <div style={{ textAlign: 'center', padding: '12px', background: '#f8fafc', borderRadius: '8px' }}>
                <div style={{ fontSize: '20px', fontWeight: '700', color: '#3b82f6' }}>
                  {metric.type === 'music' ? (metric.metrics.streams || 0).toLocaleString() : (metric.metrics.sales || 0).toLocaleString()}
                </div>
                <div style={{ fontSize: '10px', color: '#64748b' }}>
                  {metric.type === 'music' ? 'Streams' : 'Sales'}
                </div>
              </div>
              
              <div style={{ textAlign: 'center', padding: '12px', background: '#f8fafc', borderRadius: '8px' }}>
                <div style={{ fontSize: '20px', fontWeight: '700', color: '#10b981' }}>
                  ${metric.metrics.revenue.toFixed(0)}
                </div>
                <div style={{ fontSize: '10px', color: '#64748b' }}>Revenue</div>
              </div>
              
              <div style={{ textAlign: 'center', padding: '12px', background: '#f8fafc', borderRadius: '8px' }}>
                <div style={{ fontSize: '20px', fontWeight: '700', color: '#8b5cf6' }}>
                  {metric.type === 'music' ? (metric.metrics.listeners || 0).toLocaleString() : (metric.metrics.readers || 0).toLocaleString()}
                </div>
                <div style={{ fontSize: '10px', color: '#64748b' }}>
                  {metric.type === 'music' ? 'Listeners' : 'Readers'}
                </div>
              </div>
              
              <div style={{ textAlign: 'center', padding: '12px', background: '#f8fafc', borderRadius: '8px' }}>
                <div style={{ fontSize: '20px', fontWeight: '700', color: '#f59e0b' }}>
                  {metric.metrics.engagement.toFixed(0)}%
                </div>
                <div style={{ fontSize: '10px', color: '#64748b' }}>Engagement</div>
              </div>
            </div>

            {/* Mini Trend Chart */}
            <div style={{ marginBottom: '16px' }}>
              <div style={{ fontSize: '12px', fontWeight: '600', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <TrendingUp className="w-3 h-3" />
                24h Trend
              </div>
              <div style={{
                height: '40px',
                background: '#f8fafc',
                borderRadius: '6px',
                padding: '4px',
                display: 'flex',
                alignItems: 'end',
                gap: '1px'
              }}>
                {metric.trends.daily.slice(-12).map((value, index) => (
                  <div
                    key={index}
                    style={{
                      flex: 1,
                      height: `${(value / Math.max(...metric.trends.daily)) * 100}%`,
                      background: 'linear-gradient(to top, #3b82f6, #60a5fa)',
                      borderRadius: '1px',
                      minHeight: '2px'
                    }}
                  />
                ))}
              </div>
            </div>

            {/* Growth Indicator */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '8px 12px',
              borderRadius: '6px',
              background: metric.metrics.growth >= 0 ? '#f0fdf4' : '#fef2f2'
            }}>
              <span style={{ fontSize: '12px', fontWeight: '500' }}>Growth Rate</span>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                fontSize: '12px',
                fontWeight: '600',
                color: metric.metrics.growth >= 0 ? '#166534' : '#991b1b'
              }}>
                {metric.metrics.growth >= 0 ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />}
                {Math.abs(metric.metrics.growth).toFixed(1)}%
              </div>
            </div>
          </div>
        ))}
    </div>
  );

  const renderAlertsTab = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Active Alerts */}
      <div style={{
        background: 'white',
        borderRadius: '16px',
        padding: '24px',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h3 style={{ fontSize: '20px', fontWeight: '600' }}>Active Alerts</h3>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              style={{
                padding: '8px 16px',
                borderRadius: '8px',
                border: 'none',
                background: '#3b82f6',
                color: 'white',
                fontSize: '14px',
                cursor: 'pointer'
              }}
            >
              Add Rule
            </button>
          </div>
        </div>

        {alerts.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
            No active alerts
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {alerts.map(alert => (
              <div
                key={alert.id}
                style={{
                  padding: '16px',
                  border: `2px solid ${alert.severity === 'high' ? '#ef4444' : alert.severity === 'medium' ? '#f59e0b' : '#10b981'}`,
                  borderRadius: '12px',
                  background: alert.acknowledged ? '#f9fafb' : 'white'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Bell className={`w-5 h-5 ${alert.severity === 'high' ? 'text-red-500' : alert.severity === 'medium' ? 'text-yellow-500' : 'text-green-500'}`} />
                    <span style={{ fontSize: '16px', fontWeight: '600' }}>{alert.rule.name}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '12px', color: '#64748b' }}>
                      {new Date(alert.timestamp).toLocaleTimeString()}
                    </span>
                    {!alert.acknowledged && (
                      <button
                        onClick={() => setAlerts(prev => prev.map(a => a.id === alert.id ? { ...a, acknowledged: true } : a))}
                        style={{
                          padding: '4px 8px',
                          borderRadius: '4px',
                          border: 'none',
                          background: '#e5e7eb',
                          fontSize: '12px',
                          cursor: 'pointer'
                        }}
                      >
                        Acknowledge
                      </button>
                    )}
                  </div>
                </div>
                
                <p style={{ fontSize: '14px', color: '#374151', marginBottom: '8px' }}>
                  {alert.message}
                </p>
                
                <div style={{ fontSize: '12px', color: '#64748b' }}>
                  Platform: {alert.rule.platform} • Current Value: {alert.currentValue}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Alert Rules */}
      <div style={{
        background: 'white',
        borderRadius: '16px',
        padding: '24px',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)'
      }}>
        <h3 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '20px' }}>Alert Rules</h3>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {alertRules.map(rule => (
            <div
              key={rule.id}
              style={{
                padding: '16px',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                background: rule.enabled ? 'white' : '#f9fafb'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <h4 style={{ fontSize: '16px', fontWeight: '600' }}>{rule.name}</h4>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={rule.enabled}
                    onChange={(e) => setAlertRules(prev => prev.map(r => r.id === rule.id ? { ...r, enabled: e.target.checked } : r))}
                  />
                  <span style={{ fontSize: '14px' }}>Enabled</span>
                </label>
              </div>
              
              <p style={{ fontSize: '14px', color: '#64748b', marginBottom: '8px' }}>
                Alert when {rule.metric} on {rule.platform} is {rule.condition} {rule.threshold}
              </p>
              
              <div style={{ display: 'flex', gap: '8px' }}>
                {rule.notifications.map(type => (
                  <span
                    key={type}
                    style={{
                      fontSize: '10px',
                      padding: '2px 6px',
                      borderRadius: '4px',
                      background: '#f0f9ff',
                      color: '#0369a1'
                    }}
                  >
                    {type}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '20px'
    }}>
      <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(20px)',
          borderRadius: '24px',
          padding: '32px',
          marginBottom: '24px',
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <div>
              <h1 style={{
                fontSize: '36px',
                fontWeight: '700',
                color: '#1a202c',
                marginBottom: '8px',
                display: 'flex',
                alignItems: 'center',
                gap: '16px'
              }}>
                <Activity className="w-10 h-10 text-blue-600" />
                Real-time Analytics Engine
              </h1>
              <p style={{ color: '#64748b', fontSize: '18px' }}>
                Cross-platform analytics aggregator with real-time data sync
              </p>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{
                  width: '12px',
                  height: '12px',
                  borderRadius: '50%',
                  background: syncStatus === 'syncing' ? '#f59e0b' : syncStatus === 'synced' ? '#10b981' : '#ef4444'
                }} />
                <span style={{ fontSize: '14px', fontWeight: '500' }}>
                  {syncStatus === 'syncing' ? 'Syncing...' : syncStatus === 'synced' ? 'Live' : 'Error'}
                </span>
              </div>

              <button
                onClick={() => setIsRealTimeMode(!isRealTimeMode)}
                style={{
                  padding: '8px 16px',
                  borderRadius: '8px',
                  border: 'none',
                  background: isRealTimeMode ? '#10b981' : '#6b7280',
                  color: 'white',
                  fontSize: '14px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                {isRealTimeMode ? <Zap className="w-4 h-4" /> : <RefreshCw className="w-4 h-4" />}
                {isRealTimeMode ? 'Real-time ON' : 'Real-time OFF'}
              </button>
            </div>
          </div>

          {/* Controls */}
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '16px', alignItems: 'end' }}>
            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '8px' }}>
                Platform Selection ({selectedPlatforms.length} selected)
              </label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', maxHeight: '80px', overflowY: 'auto' }}>
                {allPlatforms.map(platform => (
                  <button
                    key={platform}
                    onClick={() => {
                      setSelectedPlatforms(prev => 
                        prev.includes(platform) 
                          ? prev.filter(p => p !== platform)
                          : [...prev, platform]
                      );
                    }}
                    style={{
                      padding: '4px 8px',
                      borderRadius: '6px',
                      border: 'none',
                      background: selectedPlatforms.includes(platform) ? '#3b82f6' : '#e5e7eb',
                      color: selectedPlatforms.includes(platform) ? 'white' : '#64748b',
                      fontSize: '12px',
                      cursor: 'pointer',
                      textTransform: 'capitalize'
                    }}
                  >
                    {platform.replace('-', ' ')}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '8px' }}>
                Time Range
              </label>
              <select
                value={selectedTimeRange}
                onChange={(e) => setSelectedTimeRange(e.target.value as any)}
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '2px solid #e5e7eb',
                  borderRadius: '8px',
                  fontSize: '14px'
                }}
              >
                <option value="1h">Last Hour</option>
                <option value="24h">Last 24 Hours</option>
                <option value="7d">Last 7 Days</option>
                <option value="30d">Last 30 Days</option>
              </select>
            </div>

            <button
              onClick={() => updateRealTimeData()}
              disabled={syncStatus === 'syncing'}
              style={{
                padding: '12px 24px',
                borderRadius: '12px',
                border: 'none',
                background: syncStatus === 'syncing' ? '#9ca3af' : '#10b981',
                color: 'white',
                fontSize: '14px',
                fontWeight: '600',
                cursor: syncStatus === 'syncing' ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px'
              }}
            >
              {syncStatus === 'syncing' ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Syncing...
                </>
              ) : (
                <>
                  <Database className="w-4 h-4" />
                  Sync Now
                </>
              )}
            </button>
          </div>

          {/* Navigation Tabs */}
          <div style={{
            display: 'flex',
            gap: '8px',
            marginTop: '24px',
            padding: '4px',
            background: 'rgba(0, 0, 0, 0.05)',
            borderRadius: '12px',
            width: 'fit-content'
          }}>
            {[
              { key: 'overview', label: 'Overview', icon: BarChart3 },
              { key: 'platforms', label: 'Platforms', icon: Layers },
              { key: 'demographics', label: 'Demographics', icon: Globe },
              { key: 'alerts', label: `Alerts (${alerts.filter(a => !a.acknowledged).length})`, icon: Bell }
            ].map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as any)}
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

        {/* Tab Content */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(20px)',
          borderRadius: '24px',
          padding: '32px',
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)'
        }}>
          {activeTab === 'overview' && renderOverviewTab()}
          {activeTab === 'platforms' && renderPlatformsTab()}
          {activeTab === 'alerts' && renderAlertsTab()}
          {activeTab === 'demographics' && (
            <div style={{ textAlign: 'center', padding: '60px', color: '#64748b' }}>
              <Globe className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '8px' }}>Demographics Analytics</h3>
              <p>Detailed demographic breakdown coming soon...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RealTimeAnalyticsEngine;