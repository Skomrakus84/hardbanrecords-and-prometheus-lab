// Campaign Automation System - Automated scheduling and campaign management
import React, { useState, useEffect } from 'react';
import {
  Calendar, Clock, Zap, Target, Send, Pause, Play, Settings,
  CheckCircle, AlertCircle, Users, TrendingUp, Globe, Mail,
  MessageSquare, Instagram, Twitter, Facebook, Youtube,
  Smartphone, Monitor, Headphones, BookOpen, Star, Filter,
  BarChart3, RefreshCw, Plus, Edit, Trash2, Copy
} from 'lucide-react';

interface Campaign {
  id: string;
  name: string;
  type: 'release' | 'promotion' | 'engagement' | 'cross-platform';
  status: 'draft' | 'scheduled' | 'active' | 'paused' | 'completed';
  startDate: string;
  endDate?: string;
  platforms: string[];
  content: {
    title: string;
    description: string;
    media: string[];
    hashtags: string[];
  };
  schedule: ScheduleRule[];
  targeting: {
    demographics: {
      ageRange: [number, number];
      countries: string[];
      interests: string[];
    };
    behavior: {
      engagement: 'high' | 'medium' | 'low';
      timeZones: string[];
      devices: string[];
    };
  };
  budget?: {
    total: number;
    daily: number;
    currency: string;
  };
  automation: {
    autoPost: boolean;
    autoOptimize: boolean;
    autoResponse: boolean;
    smartTiming: boolean;
  };
  metrics: {
    reach: number;
    engagement: number;
    clicks: number;
    conversions: number;
    cost: number;
  };
  created: string;
  updated: string;
}

interface ScheduleRule {
  id: string;
  platform: string;
  action: 'post' | 'story' | 'reel' | 'tweet' | 'email' | 'push';
  content: any;
  scheduledTime: string;
  recurring?: {
    frequency: 'daily' | 'weekly' | 'monthly';
    interval: number;
    endDate?: string;
  };
  status: 'pending' | 'sent' | 'failed';
  metrics?: {
    views?: number;
    likes?: number;
    shares?: number;
    clicks?: number;
  };
}

interface Template {
  id: string;
  name: string;
  type: 'release' | 'promotion' | 'engagement';
  description: string;
  platforms: string[];
  schedule: Omit<ScheduleRule, 'id' | 'status'>[];
  automation: Campaign['automation'];
  estimatedReach: number;
  tags: string[];
}

const CampaignAutomationSystem: React.FC = () => {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [activeTab, setActiveTab] = useState<'campaigns' | 'schedule' | 'templates' | 'analytics'>('campaigns');
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [filterStatus, setFilterStatus] = useState<Campaign['status'] | 'all'>('all');

  // Available platforms for campaigns
  const availablePlatforms = {
    social: [
      { key: 'instagram', name: 'Instagram', icon: Instagram, color: '#E4405F' },
      { key: 'twitter', name: 'Twitter/X', icon: Twitter, color: '#1DA1F2' },
      { key: 'facebook', name: 'Facebook', icon: Facebook, color: '#1877F2' },
      { key: 'youtube', name: 'YouTube', icon: Youtube, color: '#FF0000' },
      { key: 'tiktok', name: 'TikTok', icon: MessageSquare, color: '#000000' }
    ],
    music: [
      { key: 'spotify', name: 'Spotify', icon: Headphones, color: '#1DB954' },
      { key: 'apple-music', name: 'Apple Music', icon: Headphones, color: '#FA243C' },
      { key: 'soundcloud', name: 'SoundCloud', icon: Headphones, color: '#FF5500' },
      { key: 'bandcamp', name: 'Bandcamp', icon: Headphones, color: '#629AA0' }
    ],
    publishing: [
      { key: 'amazon-kdp', name: 'Amazon KDP', icon: BookOpen, color: '#FF9900' },
      { key: 'apple-books', name: 'Apple Books', icon: BookOpen, color: '#007AFF' },
      { key: 'goodreads', name: 'Goodreads', icon: BookOpen, color: '#663300' }
    ],
    communication: [
      { key: 'email', name: 'Email', icon: Mail, color: '#34D399' },
      { key: 'push', name: 'Push Notifications', icon: Smartphone, color: '#8B5CF6' },
      { key: 'sms', name: 'SMS', icon: MessageSquare, color: '#06B6D4' }
    ]
  };

  // Pre-built campaign templates
  const campaignTemplates: Template[] = [
    {
      id: 'template_001',
      name: 'Music Release Campaign',
      type: 'release',
      description: 'Complete campaign for new music releases across all platforms',
      platforms: ['spotify', 'apple-music', 'instagram', 'twitter', 'youtube'],
      schedule: [
        {
          platform: 'instagram',
          action: 'post',
          content: { type: 'teaser' },
          scheduledTime: '2024-01-15T09:00:00Z',
          recurring: { frequency: 'weekly', interval: 1 }
        },
        {
          platform: 'twitter',
          action: 'tweet',
          content: { type: 'announcement' },
          scheduledTime: '2024-01-15T12:00:00Z'
        },
        {
          platform: 'youtube',
          action: 'post',
          content: { type: 'music-video' },
          scheduledTime: '2024-01-15T15:00:00Z'
        }
      ],
      automation: {
        autoPost: true,
        autoOptimize: true,
        autoResponse: false,
        smartTiming: true
      },
      estimatedReach: 50000,
      tags: ['music', 'release', 'social-media', 'streaming']
    },
    {
      id: 'template_002',
      name: 'Book Launch Campaign',
      type: 'release',
      description: 'Comprehensive book launch strategy with cross-platform promotion',
      platforms: ['amazon-kdp', 'apple-books', 'goodreads', 'instagram', 'twitter', 'email'],
      schedule: [
        {
          platform: 'email',
          action: 'email',
          content: { type: 'pre-order-announcement' },
          scheduledTime: '2024-01-10T10:00:00Z'
        },
        {
          platform: 'goodreads',
          action: 'post',
          content: { type: 'book-preview' },
          scheduledTime: '2024-01-12T14:00:00Z'
        },
        {
          platform: 'instagram',
          action: 'story',
          content: { type: 'countdown' },
          scheduledTime: '2024-01-14T20:00:00Z',
          recurring: { frequency: 'daily', interval: 1, endDate: '2024-01-20T00:00:00Z' }
        }
      ],
      automation: {
        autoPost: true,
        autoOptimize: false,
        autoResponse: true,
        smartTiming: true
      },
      estimatedReach: 25000,
      tags: ['publishing', 'books', 'launch', 'email-marketing']
    },
    {
      id: 'template_003',
      name: 'Engagement Booster',
      type: 'engagement',
      description: 'Increase audience engagement across social platforms',
      platforms: ['instagram', 'twitter', 'facebook', 'tiktok'],
      schedule: [
        {
          platform: 'instagram',
          action: 'story',
          content: { type: 'poll' },
          scheduledTime: '2024-01-15T11:00:00Z',
          recurring: { frequency: 'daily', interval: 2 }
        },
        {
          platform: 'twitter',
          action: 'tweet',
          content: { type: 'question' },
          scheduledTime: '2024-01-15T16:00:00Z',
          recurring: { frequency: 'daily', interval: 3 }
        }
      ],
      automation: {
        autoPost: true,
        autoOptimize: true,
        autoResponse: true,
        smartTiming: true
      },
      estimatedReach: 15000,
      tags: ['engagement', 'social-media', 'community', 'interactive']
    }
  ];

  useEffect(() => {
    initializeCampaigns();
    setTemplates(campaignTemplates);
  }, []);

  const initializeCampaigns = () => {
    const mockCampaigns: Campaign[] = [
      {
        id: 'camp_001',
        name: 'Summer Hits 2024',
        type: 'release',
        status: 'active',
        startDate: '2024-01-15T00:00:00Z',
        endDate: '2024-02-15T00:00:00Z',
        platforms: ['spotify', 'instagram', 'twitter', 'youtube'],
        content: {
          title: 'Summer Hits Collection Release',
          description: 'Get ready for the hottest tracks of summer 2024! 🔥',
          media: ['cover-art.jpg', 'teaser-video.mp4'],
          hashtags: ['#SummerHits2024', '#NewMusic', '#Streaming', '#HotTracks']
        },
        schedule: [
          {
            id: 'sched_001',
            platform: 'instagram',
            action: 'post',
            content: { type: 'album-cover', caption: 'New album dropping soon! 🎵' },
            scheduledTime: '2024-01-15T09:00:00Z',
            status: 'sent',
            metrics: { views: 2500, likes: 180, shares: 45, clicks: 23 }
          },
          {
            id: 'sched_002',
            platform: 'spotify',
            action: 'post',
            content: { type: 'playlist-update' },
            scheduledTime: '2024-01-15T12:00:00Z',
            status: 'sent'
          }
        ],
        targeting: {
          demographics: {
            ageRange: [18, 35],
            countries: ['US', 'UK', 'CA', 'AU'],
            interests: ['music', 'electronic', 'dance', 'summer-vibes']
          },
          behavior: {
            engagement: 'high',
            timeZones: ['EST', 'PST', 'GMT'],
            devices: ['mobile', 'desktop']
          }
        },
        budget: {
          total: 1000,
          daily: 50,
          currency: 'USD'
        },
        automation: {
          autoPost: true,
          autoOptimize: true,
          autoResponse: false,
          smartTiming: true
        },
        metrics: {
          reach: 15420,
          engagement: 1240,
          clicks: 387,
          conversions: 45,
          cost: 234.50
        },
        created: '2024-01-10T10:00:00Z',
        updated: '2024-01-15T14:30:00Z'
      },
      {
        id: 'camp_002',
        name: 'Mystery Novel Launch',
        type: 'release',
        status: 'scheduled',
        startDate: '2024-01-20T00:00:00Z',
        endDate: '2024-02-20T00:00:00Z',
        platforms: ['amazon-kdp', 'goodreads', 'instagram', 'email'],
        content: {
          title: 'The Shadow Detective - New Mystery Novel',
          description: 'A gripping mystery that will keep you on the edge of your seat! 📚',
          media: ['book-cover.jpg', 'author-photo.jpg'],
          hashtags: ['#MysteryNovel', '#NewBook', '#Detective', '#Thriller']
        },
        schedule: [],
        targeting: {
          demographics: {
            ageRange: [25, 55],
            countries: ['US', 'UK', 'CA'],
            interests: ['mystery', 'thriller', 'detective-fiction', 'reading']
          },
          behavior: {
            engagement: 'medium',
            timeZones: ['EST', 'PST', 'GMT'],
            devices: ['mobile', 'tablet', 'desktop']
          }
        },
        automation: {
          autoPost: true,
          autoOptimize: false,
          autoResponse: true,
          smartTiming: true
        },
        metrics: {
          reach: 0,
          engagement: 0,
          clicks: 0,
          conversions: 0,
          cost: 0
        },
        created: '2024-01-12T15:00:00Z',
        updated: '2024-01-12T15:00:00Z'
      }
    ];

    setCampaigns(mockCampaigns);
  };

  const createCampaignFromTemplate = (template: Template) => {
    const newCampaign: Campaign = {
      id: `camp_${Date.now()}`,
      name: `${template.name} - ${new Date().toLocaleDateString()}`,
      type: template.type,
      status: 'draft',
      startDate: new Date().toISOString(),
      platforms: template.platforms,
      content: {
        title: `New ${template.type} campaign`,
        description: template.description,
        media: [],
        hashtags: template.tags.map(tag => `#${tag}`)
      },
      schedule: template.schedule.map((rule, index) => ({
        id: `sched_${Date.now()}_${index}`,
        ...rule,
        status: 'pending' as const
      })),
      targeting: {
        demographics: {
          ageRange: [18, 45],
          countries: ['US', 'UK'],
          interests: template.tags
        },
        behavior: {
          engagement: 'medium',
          timeZones: ['EST'],
          devices: ['mobile']
        }
      },
      automation: template.automation,
      metrics: {
        reach: 0,
        engagement: 0,
        clicks: 0,
        conversions: 0,
        cost: 0
      },
      created: new Date().toISOString(),
      updated: new Date().toISOString()
    };

    setCampaigns(prev => [newCampaign, ...prev]);
    setSelectedCampaign(newCampaign);
  };

  const updateCampaignStatus = (campaignId: string, status: Campaign['status']) => {
    setCampaigns(prev => prev.map(campaign => 
      campaign.id === campaignId ? { 
        ...campaign, 
        status,
        updated: new Date().toISOString()
      } : campaign
    ));
  };

  const getStatusColor = (status: Campaign['status']) => {
    switch (status) {
      case 'active': return '#10b981';
      case 'scheduled': return '#3b82f6';
      case 'paused': return '#f59e0b';
      case 'completed': return '#6b7280';
      case 'draft': return '#8b5cf6';
      default: return '#6b7280';
    }
  };

  const getStatusIcon = (status: Campaign['status']) => {
    switch (status) {
      case 'active': return Play;
      case 'scheduled': return Clock;
      case 'paused': return Pause;
      case 'completed': return CheckCircle;
      case 'draft': return Edit;
      default: return AlertCircle;
    }
  };

  const renderCampaignsTab = () => {
    const filteredCampaigns = campaigns.filter(campaign => 
      filterStatus === 'all' || campaign.status === filterStatus
    );

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        {/* Campaign Controls */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as any)}
              style={{
                padding: '8px 12px',
                border: '2px solid #e5e7eb',
                borderRadius: '8px',
                fontSize: '14px'
              }}
            >
              <option value="all">All Campaigns</option>
              <option value="draft">Draft</option>
              <option value="scheduled">Scheduled</option>
              <option value="active">Active</option>
              <option value="paused">Paused</option>
              <option value="completed">Completed</option>
            </select>
            <span style={{ fontSize: '14px', color: '#64748b' }}>
              {filteredCampaigns.length} campaigns
            </span>
          </div>

          <button
            onClick={() => setShowCreateModal(true)}
            style={{
              padding: '12px 24px',
              borderRadius: '12px',
              border: 'none',
              background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
              color: 'white',
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <Plus className="w-4 h-4" />
            New Campaign
          </button>
        </div>

        {/* Campaign Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))', gap: '20px' }}>
          {filteredCampaigns.map(campaign => {
            const StatusIcon = getStatusIcon(campaign.status);
            
            return (
              <div
                key={campaign.id}
                style={{
                  background: 'white',
                  borderRadius: '16px',
                  padding: '24px',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
                  border: '1px solid #e5e7eb',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease'
                }}
                onClick={() => setSelectedCampaign(campaign)}
              >
                {/* Campaign Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <h3 style={{ fontSize: '18px', fontWeight: '600' }}>{campaign.name}</h3>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    padding: '6px 12px',
                    borderRadius: '6px',
                    fontSize: '12px',
                    fontWeight: '600',
                    background: `${getStatusColor(campaign.status)}20`,
                    color: getStatusColor(campaign.status)
                  }}>
                    <StatusIcon className="w-3 h-3" />
                    {campaign.status.toUpperCase()}
                  </div>
                </div>

                {/* Campaign Info */}
                <div style={{ marginBottom: '16px' }}>
                  <p style={{ fontSize: '14px', color: '#64748b', marginBottom: '8px' }}>
                    {campaign.content.description}
                  </p>
                  <div style={{ fontSize: '12px', color: '#9ca3af' }}>
                    {campaign.type.toUpperCase()} • {campaign.platforms.length} platforms • 
                    {campaign.schedule.length} scheduled posts
                  </div>
                </div>

                {/* Metrics */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px', marginBottom: '16px' }}>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '16px', fontWeight: '700', color: '#3b82f6' }}>
                      {campaign.metrics.reach.toLocaleString()}
                    </div>
                    <div style={{ fontSize: '10px', color: '#64748b' }}>Reach</div>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '16px', fontWeight: '700', color: '#10b981' }}>
                      {campaign.metrics.engagement.toLocaleString()}
                    </div>
                    <div style={{ fontSize: '10px', color: '#64748b' }}>Engagement</div>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '16px', fontWeight: '700', color: '#f59e0b' }}>
                      ${campaign.metrics.cost.toFixed(0)}
                    </div>
                    <div style={{ fontSize: '10px', color: '#64748b' }}>Cost</div>
                  </div>
                </div>

                {/* Platform Icons */}
                <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
                  {campaign.platforms.slice(0, 5).map(platformKey => {
                    const platform = Object.values(availablePlatforms)
                      .flat()
                      .find(p => p.key === platformKey);
                    
                    if (!platform) return null;
                    
                    return (
                      <div
                        key={platformKey}
                        style={{
                          width: '24px',
                          height: '24px',
                          borderRadius: '50%',
                          background: platform.color,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                        title={platform.name}
                      >
                        <platform.icon className="w-3 h-3 text-white" />
                      </div>
                    );
                  })}
                  {campaign.platforms.length > 5 && (
                    <div style={{
                      width: '24px',
                      height: '24px',
                      borderRadius: '50%',
                      background: '#e5e7eb',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '10px',
                      fontWeight: '600',
                      color: '#64748b'
                    }}>
                      +{campaign.platforms.length - 5}
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div style={{ display: 'flex', gap: '8px' }}>
                  {campaign.status === 'draft' && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        updateCampaignStatus(campaign.id, 'scheduled');
                      }}
                      style={{
                        flex: 1,
                        padding: '8px 12px',
                        borderRadius: '6px',
                        border: 'none',
                        background: '#3b82f6',
                        color: 'white',
                        fontSize: '12px',
                        cursor: 'pointer'
                      }}
                    >
                      Schedule
                    </button>
                  )}
                  
                  {campaign.status === 'scheduled' && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        updateCampaignStatus(campaign.id, 'active');
                      }}
                      style={{
                        flex: 1,
                        padding: '8px 12px',
                        borderRadius: '6px',
                        border: 'none',
                        background: '#10b981',
                        color: 'white',
                        fontSize: '12px',
                        cursor: 'pointer'
                      }}
                    >
                      Start Now
                    </button>
                  )}
                  
                  {campaign.status === 'active' && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        updateCampaignStatus(campaign.id, 'paused');
                      }}
                      style={{
                        flex: 1,
                        padding: '8px 12px',
                        borderRadius: '6px',
                        border: 'none',
                        background: '#f59e0b',
                        color: 'white',
                        fontSize: '12px',
                        cursor: 'pointer'
                      }}
                    >
                      Pause
                    </button>
                  )}
                  
                  {campaign.status === 'paused' && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        updateCampaignStatus(campaign.id, 'active');
                      }}
                      style={{
                        flex: 1,
                        padding: '8px 12px',
                        borderRadius: '6px',
                        border: 'none',
                        background: '#10b981',
                        color: 'white',
                        fontSize: '12px',
                        cursor: 'pointer'
                      }}
                    >
                      Resume
                    </button>
                  )}

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      // Copy campaign functionality
                    }}
                    style={{
                      padding: '8px',
                      borderRadius: '6px',
                      border: '1px solid #e5e7eb',
                      background: 'white',
                      cursor: 'pointer'
                    }}
                  >
                    <Copy className="w-4 h-4 text-gray-500" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderTemplatesTab = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ fontSize: '24px', fontWeight: '600' }}>Campaign Templates</h2>
        <button
          style={{
            padding: '12px 24px',
            borderRadius: '12px',
            border: 'none',
            background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
            color: 'white',
            fontSize: '14px',
            fontWeight: '600',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <Plus className="w-4 h-4" />
          Create Template
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '20px' }}>
        {templates.map(template => (
          <div
            key={template.id}
            style={{
              background: 'white',
              borderRadius: '16px',
              padding: '24px',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
              border: '1px solid #e5e7eb'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: '600' }}>{template.name}</h3>
              <div style={{
                padding: '4px 8px',
                borderRadius: '6px',
                fontSize: '10px',
                fontWeight: '600',
                background: template.type === 'release' ? '#dbeafe' : 
                           template.type === 'promotion' ? '#fef3c7' : '#dcfce7',
                color: template.type === 'release' ? '#1e40af' : 
                       template.type === 'promotion' ? '#92400e' : '#166534'
              }}>
                {template.type.toUpperCase()}
              </div>
            </div>

            <p style={{ fontSize: '14px', color: '#64748b', marginBottom: '16px' }}>
              {template.description}
            </p>

            <div style={{ marginBottom: '16px' }}>
              <div style={{ fontSize: '12px', fontWeight: '600', marginBottom: '8px' }}>
                Platforms ({template.platforms.length})
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                {template.platforms.map(platformKey => {
                  const platform = Object.values(availablePlatforms)
                    .flat()
                    .find(p => p.key === platformKey);
                  
                  return (
                    <span
                      key={platformKey}
                      style={{
                        fontSize: '10px',
                        padding: '2px 6px',
                        borderRadius: '4px',
                        background: '#f0f9ff',
                        color: '#0369a1'
                      }}
                    >
                      {platform?.name || platformKey}
                    </span>
                  );
                })}
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '16px', fontWeight: '700', color: '#3b82f6' }}>
                  {template.schedule.length}
                </div>
                <div style={{ fontSize: '10px', color: '#64748b' }}>Scheduled Actions</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '16px', fontWeight: '700', color: '#10b981' }}>
                  {(template.estimatedReach / 1000).toFixed(0)}K
                </div>
                <div style={{ fontSize: '10px', color: '#64748b' }}>Est. Reach</div>
              </div>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <div style={{ fontSize: '12px', fontWeight: '600', marginBottom: '8px' }}>
                Automation Features
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                {template.automation.autoPost && (
                  <span style={{
                    fontSize: '10px',
                    padding: '2px 6px',
                    borderRadius: '4px',
                    background: '#f0fdf4',
                    color: '#166534'
                  }}>
                    Auto Post
                  </span>
                )}
                {template.automation.smartTiming && (
                  <span style={{
                    fontSize: '10px',
                    padding: '2px 6px',
                    borderRadius: '4px',
                    background: '#fef3c7',
                    color: '#92400e'
                  }}>
                    Smart Timing
                  </span>
                )}
                {template.automation.autoOptimize && (
                  <span style={{
                    fontSize: '10px',
                    padding: '2px 6px',
                    borderRadius: '4px',
                    background: '#ede9fe',
                    color: '#7c2d12'
                  }}>
                    Auto Optimize
                  </span>
                )}
              </div>
            </div>

            <button
              onClick={() => createCampaignFromTemplate(template)}
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: '8px',
                border: 'none',
                background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
                color: 'white',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px'
              }}
            >
              <Zap className="w-4 h-4" />
              Use Template
            </button>
          </div>
        ))}
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
          <h1 style={{
            fontSize: '36px',
            fontWeight: '700',
            color: '#1a202c',
            marginBottom: '8px',
            display: 'flex',
            alignItems: 'center',
            gap: '16px'
          }}>
            <Calendar className="w-10 h-10 text-blue-600" />
            Campaign Automation System
          </h1>
          <p style={{ color: '#64748b', fontSize: '18px', marginBottom: '24px' }}>
            Automated scheduling and campaign management across all platforms
          </p>

          {/* Quick Stats */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '16px', marginBottom: '24px' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '24px', fontWeight: '700', color: '#3b82f6' }}>
                {campaigns.filter(c => c.status === 'active').length}
              </div>
              <div style={{ fontSize: '12px', color: '#64748b' }}>Active Campaigns</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '24px', fontWeight: '700', color: '#10b981' }}>
                {campaigns.filter(c => c.status === 'scheduled').length}
              </div>
              <div style={{ fontSize: '12px', color: '#64748b' }}>Scheduled</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '24px', fontWeight: '700', color: '#f59e0b' }}>
                {campaigns.reduce((sum, c) => sum + c.schedule.length, 0)}
              </div>
              <div style={{ fontSize: '12px', color: '#64748b' }}>Total Posts</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '24px', fontWeight: '700', color: '#8b5cf6' }}>
                {Object.values(availablePlatforms).flat().length}
              </div>
              <div style={{ fontSize: '12px', color: '#64748b' }}>Platforms</div>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div style={{
            display: 'flex',
            gap: '8px',
            padding: '4px',
            background: 'rgba(0, 0, 0, 0.05)',
            borderRadius: '12px',
            width: 'fit-content'
          }}>
            {[
              { key: 'campaigns', label: 'Campaigns', icon: Target },
              { key: 'schedule', label: 'Schedule', icon: Calendar },
              { key: 'templates', label: 'Templates', icon: Star },
              { key: 'analytics', label: 'Analytics', icon: BarChart3 }
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
          {activeTab === 'campaigns' && renderCampaignsTab()}
          {activeTab === 'templates' && renderTemplatesTab()}
          {activeTab === 'schedule' && (
            <div style={{ textAlign: 'center', padding: '60px', color: '#64748b' }}>
              <Calendar className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '8px' }}>Schedule View</h3>
              <p>Calendar-based scheduling interface coming soon...</p>
            </div>
          )}
          {activeTab === 'analytics' && (
            <div style={{ textAlign: 'center', padding: '60px', color: '#64748b' }}>
              <BarChart3 className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '8px' }}>Campaign Analytics</h3>
              <p>Detailed campaign performance analytics coming soon...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CampaignAutomationSystem;