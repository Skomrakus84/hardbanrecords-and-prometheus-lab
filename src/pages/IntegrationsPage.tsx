import React, { useState, useEffect } from 'react';
import { 
  Settings, Wifi, WifiOff, CheckCircle, AlertCircle, Plus, 
  Music, BookOpen, Eye, Trash2, RefreshCw,
  Zap, Star, DollarSign
} from 'lucide-react';

interface Platform {
  key: string;
  type: 'music' | 'publishing';
  tier: 'free' | 'freemium' | 'premium';
  category: string;
  connected: boolean;
  lastSync: string | null;
  name?: string;
  description?: string;
  features?: string[];
  benefits?: string[];
}

interface ConnectionStatus {
  platform: string;
  connected: boolean;
  lastActivity: string;
  errorCount?: number;
}

const IntegrationsPage: React.FC = () => {
  const [platforms, setPlatforms] = useState<Platform[]>([]);
  const [connectionStatuses, setConnectionStatuses] = useState<ConnectionStatus[]>([]);
  const [activeTab, setActiveTab] = useState<'music' | 'publishing'>('music');
  const [showConnectionModal, setShowConnectionModal] = useState(false);
  const [selectedPlatform, setSelectedPlatform] = useState<Platform | null>(null);
  const [credentials, setCredentials] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchPlatforms();
    fetchConnectionStatuses();
  }, []);

  const fetchPlatforms = async () => {
    try {
      // Mock data for now - replace with actual API call
      const mockPlatforms: Platform[] = [
        // Music Platforms
        {
          key: 'soundcloud',
          type: 'music',
          tier: 'free',
          category: 'community',
          connected: false,
          lastSync: null,
          name: 'SoundCloud',
          description: 'Community-focused music platform',
          features: ['Upload tracks', 'Social features', 'Analytics', 'Playlists'],
          benefits: ['Large community reach', 'Free hosting', 'Direct fan engagement']
        },
        {
          key: 'bandcamp',
          type: 'music',
          tier: 'free',
          category: 'direct-sales',
          connected: true,
          lastSync: '2024-01-15T10:30:00Z',
          name: 'Bandcamp',
          description: 'Artist-friendly platform with direct sales',
          features: ['Direct sales', 'Fan funding', 'Physical sales', 'High royalties'],
          benefits: ['85-90% artist share', 'Direct fan support', 'Merchandise integration']
        },
        {
          key: 'spotify',
          type: 'music',
          tier: 'premium',
          category: 'streaming',
          connected: true,
          lastSync: '2024-01-15T09:15:00Z',
          name: 'Spotify',
          description: 'Leading music streaming platform',
          features: ['Streaming', 'Playlists', 'Analytics', 'Podcast support'],
          benefits: ['Massive reach', 'Playlist opportunities', 'Detailed analytics']
        },
        
        // Publishing Platforms
        {
          key: 'amazon-kdp',
          type: 'publishing',
          tier: 'free',
          category: 'ebook',
          connected: true,
          lastSync: '2024-01-15T08:45:00Z',
          name: 'Amazon KDP',
          description: 'Primary eBook and print-on-demand platform',
          features: ['eBook publishing', 'Print-on-demand', 'Kindle Unlimited', 'Global distribution'],
          benefits: ['Largest marketplace', 'KU inclusion', 'Global reach', 'Marketing tools']
        },
        {
          key: 'apple-books',
          type: 'publishing',
          tier: 'premium',
          category: 'ebook',
          connected: false,
          lastSync: null,
          name: 'Apple Books',
          description: 'Premium eBook platform',
          features: ['Enhanced eBooks', 'Editorial features', 'Pre-orders', 'Global distribution'],
          benefits: ['Premium audience', 'Editorial opportunities', 'High-quality platform']
        },
        {
          key: 'draft2digital',
          type: 'publishing',
          tier: 'free',
          category: 'distribution',
          connected: false,
          lastSync: null,
          name: 'Draft2Digital',
          description: 'Multi-platform eBook distributor',
          features: ['Multi-platform distribution', 'Free ISBN', 'Cover creator', 'Universal links'],
          benefits: ['20+ retailers', 'No upfront costs', 'Consolidated payments']
        }
      ];
      
      setPlatforms(mockPlatforms);
    } catch (error) {
      console.error('Failed to fetch platforms:', error);
    }
  };

  const fetchConnectionStatuses = async () => {
    // Mock connection status data
    setConnectionStatuses([
      { platform: 'bandcamp', connected: true, lastActivity: '2024-01-15T10:30:00Z' },
      { platform: 'spotify', connected: true, lastActivity: '2024-01-15T09:15:00Z', errorCount: 1 },
      { platform: 'amazon-kdp', connected: true, lastActivity: '2024-01-15T08:45:00Z' }
    ]);
  };

  const handleConnect = (platform: Platform) => {
    setSelectedPlatform(platform);
    setCredentials({});
    setShowConnectionModal(true);
  };

  const handleConnectionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // Mock API call - replace with actual integration
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Update platform status
      setPlatforms(prev => prev.map(p => 
        p.key === selectedPlatform?.key 
          ? { ...p, connected: true, lastSync: new Date().toISOString() }
          : p
      ));
      
      setShowConnectionModal(false);
      setSelectedPlatform(null);
    } catch (error) {
      console.error('Connection failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDisconnect = async (platformKey: string) => {
    try {
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setPlatforms(prev => prev.map(p => 
        p.key === platformKey 
          ? { ...p, connected: false, lastSync: null }
          : p
      ));
    } catch (error) {
      console.error('Disconnect failed:', error);
    }
  };

  const filteredPlatforms = platforms.filter(p => p.type === activeTab);

  const getTierIcon = (tier: string) => {
    switch (tier) {
      case 'free': return <Zap className="w-4 h-4 text-green-500" />;
      case 'freemium': return <Star className="w-4 h-4 text-yellow-500" />;
      case 'premium': return <DollarSign className="w-4 h-4 text-purple-500" />;
      default: return null;
    }
  };

  const getStatusColor = (connected: boolean) => {
    return connected ? 'text-green-500' : 'text-gray-400';
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '20px'
    }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        background: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(20px)',
        borderRadius: '24px',
        padding: '32px',
        boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)'
      }}>
        {/* Header */}
        <div style={{ marginBottom: '32px' }}>
          <h1 style={{
            fontSize: '32px',
            fontWeight: '700',
            color: '#1a202c',
            marginBottom: '8px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }}>
            <Settings className="w-8 h-8" />
            Platform Integrations
          </h1>
          <p style={{ color: '#64748b', fontSize: '16px' }}>
            Connect and manage your music and publishing platform integrations
          </p>
        </div>

        {/* Tabs */}
        <div style={{
          display: 'flex',
          gap: '8px',
          marginBottom: '32px',
          padding: '4px',
          background: 'rgba(0, 0, 0, 0.05)',
          borderRadius: '12px',
          width: 'fit-content'
        }}>
          {[
            { key: 'music', label: 'Music Platforms', icon: Music },
            { key: 'publishing', label: 'Publishing Platforms', icon: BookOpen }
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as 'music' | 'publishing')}
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

        {/* Platform Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))',
          gap: '24px'
        }}>
          {filteredPlatforms.map(platform => (
            <div
              key={platform.key}
              style={{
                background: 'white',
                borderRadius: '16px',
                padding: '24px',
                border: `2px solid ${platform.connected ? '#10b981' : '#e5e7eb'}`,
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
                transition: 'all 0.3s ease'
              }}
            >
              {/* Platform Header */}
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
                    borderRadius: '12px',
                    background: platform.connected ? 
                      'linear-gradient(135deg, #10b981 0%, #059669 100%)' :
                      'linear-gradient(135deg, #6b7280 0%, #4b5563 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    {platform.connected ? 
                      <CheckCircle className="w-6 h-6 text-white" /> :
                      <AlertCircle className="w-6 h-6 text-white" />
                    }
                  </div>
                  <div>
                    <h3 style={{
                      fontSize: '18px',
                      fontWeight: '600',
                      color: '#1a202c',
                      marginBottom: '4px'
                    }}>
                      {platform.name}
                    </h3>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      {getTierIcon(platform.tier)}
                      <span style={{ 
                        fontSize: '14px', 
                        color: '#64748b',
                        textTransform: 'capitalize'
                      }}>
                        {platform.tier} • {platform.category}
                      </span>
                    </div>
                  </div>
                </div>
                
                {platform.connected ? (
                  <Wifi className={`w-5 h-5 ${getStatusColor(true)}`} />
                ) : (
                  <WifiOff className={`w-5 h-5 ${getStatusColor(false)}`} />
                )}
              </div>

              {/* Platform Description */}
              <p style={{
                fontSize: '14px',
                color: '#64748b',
                marginBottom: '16px',
                lineHeight: '1.5'
              }}>
                {platform.description}
              </p>

              {/* Features */}
              <div style={{ marginBottom: '16px' }}>
                <h4 style={{
                  fontSize: '14px',
                  fontWeight: '600',
                  color: '#374151',
                  marginBottom: '8px'
                }}>
                  Key Features
                </h4>
                <div style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: '6px'
                }}>
                  {platform.features?.slice(0, 3).map(feature => (
                    <span
                      key={feature}
                      style={{
                        fontSize: '12px',
                        padding: '4px 8px',
                        background: 'rgba(99, 102, 241, 0.1)',
                        color: '#6366f1',
                        borderRadius: '6px',
                        fontWeight: '500'
                      }}
                    >
                      {feature}
                    </span>
                  ))}
                  {platform.features && platform.features.length > 3 && (
                    <span style={{
                      fontSize: '12px',
                      color: '#64748b',
                      fontWeight: '500'
                    }}>
                      +{platform.features.length - 3} more
                    </span>
                  )}
                </div>
              </div>

              {/* Connection Status */}
              {platform.connected && platform.lastSync && (
                <div style={{
                  fontSize: '12px',
                  color: '#64748b',
                  marginBottom: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}>
                  <RefreshCw className="w-3 h-3" />
                  Last sync: {new Date(platform.lastSync).toLocaleString()}
                </div>
              )}

              {/* Action Buttons */}
              <div style={{
                display: 'flex',
                gap: '12px',
                marginTop: 'auto'
              }}>
                {platform.connected ? (
                  <>
                    <button
                      onClick={() => handleDisconnect(platform.key)}
                      style={{
                        flex: 1,
                        padding: '10px 16px',
                        borderRadius: '8px',
                        border: '2px solid #ef4444',
                        background: 'white',
                        color: '#ef4444',
                        fontSize: '14px',
                        fontWeight: '600',
                        cursor: 'pointer',
                        transition: 'all 0.3s ease',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px'
                      }}
                    >
                      <Trash2 className="w-4 h-4" />
                      Disconnect
                    </button>
                    <button
                      style={{
                        padding: '10px 16px',
                        borderRadius: '8px',
                        border: '2px solid #6366f1',
                        background: 'white',
                        color: '#6366f1',
                        fontSize: '14px',
                        fontWeight: '600',
                        cursor: 'pointer',
                        transition: 'all 0.3s ease',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px'
                      }}
                    >
                      <Eye className="w-4 h-4" />
                      View
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => handleConnect(platform)}
                    style={{
                      flex: 1,
                      padding: '12px 16px',
                      borderRadius: '8px',
                      border: 'none',
                      background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                      color: 'white',
                      fontSize: '14px',
                      fontWeight: '600',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px'
                    }}
                  >
                    <Plus className="w-4 h-4" />
                    Connect Platform
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Connection Modal */}
        {showConnectionModal && selectedPlatform && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.5)',
            backdropFilter: 'blur(8px)',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px'
          }}>
            <div style={{
              background: 'white',
              borderRadius: '16px',
              padding: '32px',
              maxWidth: '500px',
              width: '100%',
              boxShadow: '0 20px 40px rgba(0, 0, 0, 0.2)'
            }}>
              <h2 style={{
                fontSize: '24px',
                fontWeight: '700',
                color: '#1a202c',
                marginBottom: '8px'
              }}>
                Connect to {selectedPlatform.name}
              </h2>
              <p style={{
                color: '#64748b',
                marginBottom: '24px'
              }}>
                Enter your API credentials to connect your {selectedPlatform.name} account
              </p>

              <form onSubmit={handleConnectionSubmit}>
                <div style={{ marginBottom: '20px' }}>
                  <label style={{
                    display: 'block',
                    fontSize: '14px',
                    fontWeight: '600',
                    color: '#374151',
                    marginBottom: '8px'
                  }}>
                    API Key
                  </label>
                  <input
                    type="password"
                    value={credentials.apiKey || ''}
                    onChange={(e) => setCredentials(prev => ({ ...prev, apiKey: e.target.value }))}
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: '2px solid #e5e7eb',
                      borderRadius: '8px',
                      fontSize: '14px',
                      outline: 'none',
                      transition: 'border-color 0.3s ease'
                    }}
                    placeholder="Enter your API key"
                    required
                  />
                </div>

                <div style={{
                  display: 'flex',
                  gap: '12px',
                  marginTop: '32px'
                }}>
                  <button
                    type="button"
                    onClick={() => setShowConnectionModal(false)}
                    style={{
                      flex: 1,
                      padding: '12px 24px',
                      borderRadius: '8px',
                      border: '2px solid #d1d5db',
                      background: 'white',
                      color: '#6b7280',
                      fontSize: '14px',
                      fontWeight: '600',
                      cursor: 'pointer'
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    style={{
                      flex: 1,
                      padding: '12px 24px',
                      borderRadius: '8px',
                      border: 'none',
                      background: loading ? '#9ca3af' : 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                      color: 'white',
                      fontSize: '14px',
                      fontWeight: '600',
                      cursor: loading ? 'not-allowed' : 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px'
                    }}
                  >
                    {loading && <RefreshCw className="w-4 h-4 animate-spin" />}
                    {loading ? 'Connecting...' : 'Connect'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default IntegrationsPage;