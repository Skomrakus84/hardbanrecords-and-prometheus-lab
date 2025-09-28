// Universal Distribution Engine - Next Generation Platform Tool
// Uses ALL music and publishing platforms simultaneously

import React, { useState, useEffect } from 'react';
import {
  Upload, Zap, Target, Brain, Rocket, Globe, Music, BookOpen,
  Settings, Play, Pause, CheckCircle, AlertCircle, TrendingUp,
  DollarSign, Users, Calendar, Clock, Wand2, BarChart3
} from 'lucide-react';

interface ContentItem {
  id: string;
  type: 'music' | 'book';
  title: string;
  artist?: string;
  author?: string;
  description: string;
  genre: string;
  tags: string[];
  files: {
    primary: File | null; // Audio file or manuscript
    cover: File | null;
    assets?: File[];
  };
  metadata: {
    duration?: number; // for music
    pages?: number; // for books
    language: string;
    explicit: boolean;
    releaseDate: string;
  };
  pricing: {
    basePrice: number;
    currency: string;
    territories: Record<string, number>;
  };
  platformConfig: Record<string, PlatformConfig>;
}

interface PlatformConfig {
  enabled: boolean;
  customTitle?: string;
  customDescription?: string;
  customTags?: string[];
  customPricing?: number;
  optimized?: boolean;
  priority: 'high' | 'medium' | 'low';
}

interface DistributionJob {
  id: string;
  contentId: string;
  platforms: string[];
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress: number;
  results: Record<string, DistributionResult>;
  startTime: string;
  estimatedCompletion?: string;
}

interface DistributionResult {
  platform: string;
  status: 'success' | 'failed' | 'pending';
  url?: string;
  platformId?: string;
  error?: string;
  analytics?: {
    plays?: number;
    sales?: number;
    revenue?: number;
  };
}

const UniversalDistributionEngine: React.FC = () => {
  const [content, setContent] = useState<ContentItem | null>(null);
  const [distributionJobs, setDistributionJobs] = useState<DistributionJob[]>([]);
  const [activeTab, setActiveTab] = useState<'upload' | 'optimize' | 'distribute' | 'monitor'>('upload');
  const [platforms, setPlatforms] = useState<Record<string, any>>({});
  const [aiOptimization, setAiOptimization] = useState(false);
  const [smartScheduling, setSmartScheduling] = useState(false);

  // All available platforms
  const allPlatforms = {
    music: [
      { key: 'spotify', name: 'Spotify', tier: 'premium', audience: 'Global', revenue: 'Medium' },
      { key: 'apple-music', name: 'Apple Music', tier: 'premium', audience: 'Premium', revenue: 'High' },
      { key: 'amazon-music', name: 'Amazon Music', tier: 'premium', audience: 'Global', revenue: 'Medium' },
      { key: 'youtube-music', name: 'YouTube Music', tier: 'premium', audience: 'Young', revenue: 'Low' },
      { key: 'deezer', name: 'Deezer', tier: 'premium', audience: 'European', revenue: 'Medium' },
      { key: 'tidal', name: 'Tidal', tier: 'premium', audience: 'Audiophile', revenue: 'High' },
      { key: 'soundcloud', name: 'SoundCloud', tier: 'free', audience: 'Community', revenue: 'Low' },
      { key: 'bandcamp', name: 'Bandcamp', tier: 'free', audience: 'Indie', revenue: 'Very High' },
      { key: 'reverbnation', name: 'ReverbNation', tier: 'freemium', audience: 'Emerging', revenue: 'Low' },
      { key: 'audiomack', name: 'Audiomack', tier: 'free', audience: 'Hip-Hop', revenue: 'Low' },
      { key: 'jamendo', name: 'Jamendo', tier: 'free', audience: 'Licensing', revenue: 'Medium' },
      { key: 'pandora', name: 'Pandora', tier: 'premium', audience: 'US', revenue: 'Medium' }
    ],
    publishing: [
      { key: 'amazon-kdp', name: 'Amazon KDP', tier: 'free', audience: 'Global', revenue: 'High' },
      { key: 'apple-books', name: 'Apple Books', tier: 'premium', audience: 'Premium', revenue: 'High' },
      { key: 'google-play-books', name: 'Google Play Books', tier: 'free', audience: 'Android', revenue: 'Medium' },
      { key: 'kobo', name: 'Kobo', tier: 'free', audience: 'International', revenue: 'Medium' },
      { key: 'barnes-noble', name: 'Barnes & Noble', tier: 'free', audience: 'US', revenue: 'Medium' },
      { key: 'smashwords', name: 'Smashwords', tier: 'free', audience: 'Indie', revenue: 'Medium' },
      { key: 'draft2digital', name: 'Draft2Digital', tier: 'free', audience: 'Multi-platform', revenue: 'Medium' },
      { key: 'scribd', name: 'Scribd', tier: 'premium', audience: 'Subscription', revenue: 'Low' },
      { key: 'lulu', name: 'Lulu', tier: 'free', audience: 'Print', revenue: 'High' },
      { key: 'ingramspark', name: 'IngramSpark', tier: 'premium', audience: 'Professional', revenue: 'Very High' }
    ]
  };

  useEffect(() => {
    initializePlatforms();
    loadDistributionJobs();
  }, []);

  const initializePlatforms = () => {
    const platformConfig: Record<string, PlatformConfig> = {};
    
    // Initialize all platforms with default settings
    [...allPlatforms.music, ...allPlatforms.publishing].forEach(platform => {
      platformConfig[platform.key] = {
        enabled: true,
        priority: platform.tier === 'premium' ? 'high' : 'medium',
        optimized: false
      };
    });
    
    setPlatforms(platformConfig);
  };

  const loadDistributionJobs = () => {
    // Mock data for demonstration
    const mockJobs: DistributionJob[] = [
      {
        id: 'dist_001',
        contentId: 'content_001',
        platforms: ['spotify', 'apple-music', 'amazon-kdp'],
        status: 'completed',
        progress: 100,
        results: {
          'spotify': {
            platform: 'spotify',
            status: 'success',
            url: 'https://open.spotify.com/track/xyz',
            platformId: 'track_123',
            analytics: { plays: 15420, revenue: 87.32 }
          },
          'apple-music': {
            platform: 'apple-music',
            status: 'success',
            url: 'https://music.apple.com/track/xyz',
            platformId: 'song_456'
          },
          'amazon-kdp': {
            platform: 'amazon-kdp',
            status: 'failed',
            error: 'Cover image resolution too low'
          }
        },
        startTime: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
      }
    ];
    
    setDistributionJobs(mockJobs);
  };

  const handleFileUpload = (type: 'primary' | 'cover', file: File) => {
    if (!content) return;
    
    setContent(prev => ({
      ...prev!,
      files: {
        ...prev!.files,
        [type]: file
      }
    }));
  };

  const optimizeForAllPlatforms = async () => {
    if (!content) return;
    
    setAiOptimization(true);
    
    try {
      // AI-powered optimization for each platform
      const optimizedConfigs: Record<string, PlatformConfig> = {};
      
      for (const [platformKey, config] of Object.entries(platforms)) {
        if (!config.enabled) continue;
        
        const platform = [...allPlatforms.music, ...allPlatforms.publishing]
          .find(p => p.key === platformKey);
        
        if (!platform) continue;
        
        // Simulate AI optimization
        await new Promise(resolve => setTimeout(resolve, 200));
        
        optimizedConfigs[platformKey] = {
          ...config,
          optimized: true,
          customTitle: generateOptimizedTitle(content.title, platform),
          customDescription: generateOptimizedDescription(content.description, platform),
          customTags: generateOptimizedTags(content.tags, platform),
          customPricing: calculateOptimalPricing(content.pricing.basePrice, platform)
        };
      }
      
      setPlatforms(prev => ({ ...prev, ...optimizedConfigs }));
      
    } catch (error) {
      console.error('Optimization failed:', error);
    } finally {
      setAiOptimization(false);
    }
  };

  const generateOptimizedTitle = (originalTitle: string, platform: any): string => {
    // Platform-specific title optimization
    switch (platform.key) {
      case 'spotify':
        return originalTitle; // Spotify likes clean titles
      case 'youtube-music':
        return `${originalTitle} (Official Audio)`; // YouTube benefits from descriptive titles
      case 'amazon-kdp':
        return `${originalTitle}: A Complete Guide`; // Amazon KDP likes descriptive book titles
      case 'apple-books':
        return originalTitle; // Apple Books prefers clean titles
      default:
        return originalTitle;
    }
  };

  const generateOptimizedDescription = (originalDesc: string, platform: any): string => {
    // Platform-specific description optimization
    const baseDesc = originalDesc;
    
    switch (platform.audience) {
      case 'Young':
        return `🔥 ${baseDesc} #Trending #Viral`;
      case 'Audiophile':
        return `High-fidelity audio experience. ${baseDesc}`;
      case 'Professional':
        return `Professional quality content. ${baseDesc}`;
      default:
        return baseDesc;
    }
  };

  const generateOptimizedTags = (originalTags: string[], platform: any): string[] => {
    let optimizedTags = [...originalTags];
    
    // Add platform-specific tags
    switch (platform.audience) {
      case 'Hip-Hop':
        optimizedTags = [...optimizedTags, 'hiphop', 'rap', 'urban'];
        break;
      case 'Indie':
        optimizedTags = [...optimizedTags, 'independent', 'alternative', 'underground'];
        break;
      case 'Global':
        optimizedTags = [...optimizedTags, 'international', 'worldwide'];
        break;
    }
    
    return optimizedTags.slice(0, 10); // Limit to 10 tags
  };

  const calculateOptimalPricing = (basePrice: number, platform: any): number => {
    // Platform-specific pricing optimization
    switch (platform.revenue) {
      case 'Very High':
        return basePrice * 1.2; // 20% premium for high-revenue platforms
      case 'High':
        return basePrice * 1.1; // 10% premium
      case 'Low':
        return basePrice * 0.8; // 20% discount for exposure
      default:
        return basePrice;
    }
  };

  const distributeToAllPlatforms = async () => {
    if (!content) return;
    
    const enabledPlatforms = Object.entries(platforms)
      .filter(([, config]) => config.enabled)
      .map(([key]) => key);
    
    const newJob: DistributionJob = {
      id: `dist_${Date.now()}`,
      contentId: content.id,
      platforms: enabledPlatforms,
      status: 'processing',
      progress: 0,
      results: {},
      startTime: new Date().toISOString(),
      estimatedCompletion: new Date(Date.now() + 30 * 60 * 1000).toISOString()
    };
    
    setDistributionJobs(prev => [newJob, ...prev]);
    
    // Simulate distribution process
    for (let i = 0; i < enabledPlatforms.length; i++) {
      const platform = enabledPlatforms[i];
      
      // Simulate processing time
      await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));
      
      const success = Math.random() > 0.2; // 80% success rate
      
      const result: DistributionResult = {
        platform,
        status: success ? 'success' : 'failed',
        ...(success && {
          url: `https://${platform}.example.com/content/${content.id}`,
          platformId: `${platform}_${Math.random().toString(36).substr(2, 9)}`
        }),
        ...(!success && {
          error: 'Platform temporarily unavailable'
        })
      };
      
      setDistributionJobs(prev => prev.map(job => 
        job.id === newJob.id ? {
          ...job,
          progress: Math.round(((i + 1) / enabledPlatforms.length) * 100),
          results: { ...job.results, [platform]: result }
        } : job
      ));
    }
    
    // Mark as completed
    setDistributionJobs(prev => prev.map(job => 
      job.id === newJob.id ? { ...job, status: 'completed' } : job
    ));
  };

  const renderUploadTab = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Content Type Selection */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '16px'
      }}>
        {['music', 'book'].map(type => (
          <button
            key={type}
            onClick={() => setContent({
              id: `content_${Date.now()}`,
              type: type as 'music' | 'book',
              title: '',
              description: '',
              genre: '',
              tags: [],
              files: { primary: null, cover: null },
              metadata: {
                language: 'en',
                explicit: false,
                releaseDate: new Date().toISOString().split('T')[0]
              },
              pricing: {
                basePrice: type === 'music' ? 1.29 : 9.99,
                currency: 'USD',
                territories: {}
              },
              platformConfig: {}
            })}
            style={{
              padding: '32px',
              borderRadius: '16px',
              border: content?.type === type ? '3px solid #3b82f6' : '2px solid #e5e7eb',
              background: content?.type === type ? 'rgba(59, 130, 246, 0.05)' : 'white',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '12px'
            }}
          >
            {type === 'music' ? <Music className="w-12 h-12 text-blue-500" /> : <BookOpen className="w-12 h-12 text-green-500" />}
            <h3 style={{ fontSize: '18px', fontWeight: '600', textTransform: 'capitalize' }}>{type} Content</h3>
            <p style={{ fontSize: '14px', color: '#64748b', textAlign: 'center' }}>
              {type === 'music' ? 'Upload tracks, albums, or EPs to all music platforms' : 'Publish books, ebooks, or audiobooks to all publishing platforms'}
            </p>
          </button>
        ))}
      </div>

      {/* Content Form */}
      {content && (
        <div style={{
          background: 'white',
          borderRadius: '16px',
          padding: '24px',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
          border: '1px solid #e5e7eb'
        }}>
          <h3 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            {content.type === 'music' ? <Music className="w-6 h-6" /> : <BookOpen className="w-6 h-6" />}
            {content.type === 'music' ? 'Music' : 'Book'} Details
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '24px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '8px' }}>
                Title
              </label>
              <input
                type="text"
                value={content.title}
                onChange={(e) => setContent(prev => prev ? { ...prev, title: e.target.value } : null)}
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '2px solid #e5e7eb',
                  borderRadius: '8px',
                  fontSize: '14px'
                }}
                placeholder={content.type === 'music' ? 'Song or Album Title' : 'Book Title'}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '8px' }}>
                {content.type === 'music' ? 'Artist' : 'Author'}
              </label>
              <input
                type="text"
                value={content.type === 'music' ? content.artist || '' : content.author || ''}
                onChange={(e) => setContent(prev => prev ? {
                  ...prev,
                  [content.type === 'music' ? 'artist' : 'author']: e.target.value
                } : null)}
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '2px solid #e5e7eb',
                  borderRadius: '8px',
                  fontSize: '14px'
                }}
                placeholder={content.type === 'music' ? 'Artist Name' : 'Author Name'}
              />
            </div>
          </div>

          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '8px' }}>
              Description
            </label>
            <textarea
              value={content.description}
              onChange={(e) => setContent(prev => prev ? { ...prev, description: e.target.value } : null)}
              rows={4}
              style={{
                width: '100%',
                padding: '12px',
                border: '2px solid #e5e7eb',
                borderRadius: '8px',
                fontSize: '14px',
                resize: 'vertical'
              }}
              placeholder={content.type === 'music' ? 'Describe your music...' : 'Book description...'}
            />
          </div>

          {/* File Upload Areas */}
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '20px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '8px' }}>
                {content.type === 'music' ? 'Audio File' : 'Manuscript'}
              </label>
              <div
                style={{
                  border: '2px dashed #d1d5db',
                  borderRadius: '8px',
                  padding: '32px',
                  textAlign: 'center',
                  background: '#f9fafb',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease'
                }}
                onClick={() => document.getElementById('primary-file')?.click()}
              >
                <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p style={{ fontSize: '14px', color: '#6b7280' }}>
                  Drop your {content.type === 'music' ? 'audio' : 'manuscript'} file here or click to browse
                </p>
                <p style={{ fontSize: '12px', color: '#9ca3af', marginTop: '8px' }}>
                  {content.type === 'music' ? 'MP3, WAV, FLAC up to 100MB' : 'PDF, DOCX, EPUB up to 50MB'}
                </p>
              </div>
              <input
                id="primary-file"
                type="file"
                style={{ display: 'none' }}
                accept={content.type === 'music' ? 'audio/*' : '.pdf,.docx,.epub'}
                onChange={(e) => e.target.files?.[0] && handleFileUpload('primary', e.target.files[0])}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '8px' }}>
                Cover Art
              </label>
              <div
                style={{
                  border: '2px dashed #d1d5db',
                  borderRadius: '8px',
                  padding: '32px',
                  textAlign: 'center',
                  background: '#f9fafb',
                  cursor: 'pointer',
                  aspectRatio: '1',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  alignItems: 'center'
                }}
                onClick={() => document.getElementById('cover-file')?.click()}
              >
                <Upload className="w-8 h-8 text-gray-400 mb-2" />
                <p style={{ fontSize: '12px', color: '#6b7280', textAlign: 'center' }}>
                  Upload cover
                </p>
                <p style={{ fontSize: '10px', color: '#9ca3af', marginTop: '4px' }}>
                  JPG, PNG<br />Min 1400x1400
                </p>
              </div>
              <input
                id="cover-file"
                type="file"
                style={{ display: 'none' }}
                accept="image/*"
                onChange={(e) => e.target.files?.[0] && handleFileUpload('cover', e.target.files[0])}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const renderOptimizeTab = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* AI Optimization Panel */}
      <div style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        borderRadius: '16px',
        padding: '32px',
        color: 'white'
      }}>
        <h3 style={{ fontSize: '24px', fontWeight: '700', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Brain className="w-8 h-8" />
          AI-Powered Optimization
        </h3>
        <p style={{ fontSize: '16px', opacity: 0.9, marginBottom: '24px' }}>
          Our AI analyzes each platform's requirements and audience to optimize your content for maximum reach and revenue.
        </p>
        
        <button
          onClick={optimizeForAllPlatforms}
          disabled={aiOptimization || !content}
          style={{
            padding: '16px 32px',
            borderRadius: '12px',
            border: 'none',
            background: 'rgba(255, 255, 255, 0.2)',
            backdropFilter: 'blur(10px)',
            color: 'white',
            fontSize: '16px',
            fontWeight: '600',
            cursor: aiOptimization || !content ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            opacity: aiOptimization || !content ? 0.6 : 1
          }}
        >
          {aiOptimization ? (
            <>
              <Wand2 className="w-5 h-5 animate-spin" />
              Optimizing for {Object.keys(platforms).length} platforms...
            </>
          ) : (
            <>
              <Wand2 className="w-5 h-5" />
              Optimize for All Platforms
            </>
          )}
        </button>
      </div>

      {/* Platform Configuration */}
      {content && (
        <div style={{
          background: 'white',
          borderRadius: '16px',
          padding: '24px',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)'
        }}>
          <h3 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '24px' }}>
            Platform Configuration
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {content.type === 'music' && (
              <>
                <h4 style={{ fontSize: '16px', fontWeight: '600', color: '#3b82f6', marginBottom: '8px' }}>
                  Music Platforms ({allPlatforms.music.length})
                </h4>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '12px' }}>
                  {allPlatforms.music.map(platform => {
                    const config = platforms[platform.key];
                    return (
                      <div
                        key={platform.key}
                        style={{
                          padding: '16px',
                          border: config?.enabled ? '2px solid #10b981' : '2px solid #e5e7eb',
                          borderRadius: '12px',
                          background: config?.enabled ? 'rgba(16, 185, 129, 0.05)' : '#f9fafb',
                          cursor: 'pointer'
                        }}
                        onClick={() => setPlatforms(prev => ({
                          ...prev,
                          [platform.key]: { ...prev[platform.key], enabled: !prev[platform.key]?.enabled }
                        }))}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                          <h5 style={{ fontSize: '14px', fontWeight: '600' }}>{platform.name}</h5>
                          {config?.enabled ? <CheckCircle className="w-5 h-5 text-green-500" /> : <div className="w-5 h-5 border-2 border-gray-300 rounded-full" />}
                        </div>
                        <div style={{ display: 'flex', gap: '8px', fontSize: '12px' }}>
                          <span style={{ 
                            padding: '2px 8px', 
                            borderRadius: '6px', 
                            background: platform.tier === 'premium' ? '#3b82f620' : '#10b98120',
                            color: platform.tier === 'premium' ? '#3b82f6' : '#10b981'
                          }}>
                            {platform.tier}
                          </span>
                          <span style={{ color: '#64748b' }}>{platform.audience}</span>
                          <span style={{ color: '#64748b' }}>Revenue: {platform.revenue}</span>
                        </div>
                        {config?.optimized && (
                          <div style={{ marginTop: '8px', fontSize: '12px', color: '#059669', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <Zap className="w-3 h-3" />
                            AI Optimized
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </>
            )}

            {content.type === 'book' && (
              <>
                <h4 style={{ fontSize: '16px', fontWeight: '600', color: '#10b981', marginBottom: '8px' }}>
                  Publishing Platforms ({allPlatforms.publishing.length})
                </h4>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '12px' }}>
                  {allPlatforms.publishing.map(platform => {
                    const config = platforms[platform.key];
                    return (
                      <div
                        key={platform.key}
                        style={{
                          padding: '16px',
                          border: config?.enabled ? '2px solid #10b981' : '2px solid #e5e7eb',
                          borderRadius: '12px',
                          background: config?.enabled ? 'rgba(16, 185, 129, 0.05)' : '#f9fafb',
                          cursor: 'pointer'
                        }}
                        onClick={() => setPlatforms(prev => ({
                          ...prev,
                          [platform.key]: { ...prev[platform.key], enabled: !prev[platform.key]?.enabled }
                        }))}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                          <h5 style={{ fontSize: '14px', fontWeight: '600' }}>{platform.name}</h5>
                          {config?.enabled ? <CheckCircle className="w-5 h-5 text-green-500" /> : <div className="w-5 h-5 border-2 border-gray-300 rounded-full" />}
                        </div>
                        <div style={{ display: 'flex', gap: '8px', fontSize: '12px' }}>
                          <span style={{ 
                            padding: '2px 8px', 
                            borderRadius: '6px', 
                            background: platform.tier === 'premium' ? '#3b82f620' : '#10b98120',
                            color: platform.tier === 'premium' ? '#3b82f6' : '#10b981'
                          }}>
                            {platform.tier}
                          </span>
                          <span style={{ color: '#64748b' }}>{platform.audience}</span>
                          <span style={{ color: '#64748b' }}>Revenue: {platform.revenue}</span>
                        </div>
                        {config?.optimized && (
                          <div style={{ marginTop: '8px', fontSize: '12px', color: '#059669', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <Zap className="w-3 h-3" />
                            AI Optimized
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );

  const renderDistributeTab = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Distribution Launch Panel */}
      <div style={{
        background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
        borderRadius: '16px',
        padding: '32px',
        color: 'white'
      }}>
        <h3 style={{ fontSize: '24px', fontWeight: '700', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Rocket className="w-8 h-8" />
          Universal Distribution
        </h3>
        <p style={{ fontSize: '16px', opacity: 0.9, marginBottom: '24px' }}>
          Launch your content to all selected platforms simultaneously with smart scheduling and optimization.
        </p>

        <div style={{ display: 'flex', gap: '16px', alignItems: 'center', marginBottom: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <input
              type="checkbox"
              id="smart-scheduling"
              checked={smartScheduling}
              onChange={(e) => setSmartScheduling(e.target.checked)}
              style={{ transform: 'scale(1.2)' }}
            />
            <label htmlFor="smart-scheduling" style={{ fontSize: '14px' }}>
              Smart Scheduling (Release at optimal times per platform)
            </label>
          </div>
        </div>

        <button
          onClick={distributeToAllPlatforms}
          disabled={!content}
          style={{
            padding: '16px 32px',
            borderRadius: '12px',
            border: 'none',
            background: 'rgba(255, 255, 255, 0.2)',
            backdropFilter: 'blur(10px)',
            color: 'white',
            fontSize: '16px',
            fontWeight: '600',
            cursor: !content ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            opacity: !content ? 0.6 : 1
          }}
        >
          <Rocket className="w-5 h-5" />
          Launch to {Object.values(platforms).filter(p => p.enabled).length} Platforms
        </button>
      </div>

      {/* Distribution Summary */}
      {content && (
        <div style={{
          background: 'white',
          borderRadius: '16px',
          padding: '24px',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)'
        }}>
          <h3 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '16px' }}>
            Distribution Summary
          </h3>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px', marginBottom: '24px' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '32px', fontWeight: '700', color: '#3b82f6' }}>
                {Object.values(platforms).filter(p => p.enabled).length}
              </div>
              <div style={{ fontSize: '14px', color: '#64748b' }}>Selected Platforms</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '32px', fontWeight: '700', color: '#10b981' }}>
                {Object.values(platforms).filter(p => p.optimized).length}
              </div>
              <div style={{ fontSize: '14px', color: '#64748b' }}>AI Optimized</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '32px', fontWeight: '700', color: '#f59e0b' }}>
                ~30min
              </div>
              <div style={{ fontSize: '14px', color: '#64748b' }}>Est. Completion</div>
            </div>
          </div>

          {/* Platform Checklist */}
          <div>
            <h4 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '16px' }}>
              Ready for Distribution
            </h4>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
              {Object.entries(platforms)
                .filter(([, config]) => config.enabled)
                .map(([key, config]) => {
                  const platform = [...allPlatforms.music, ...allPlatforms.publishing]
                    .find(p => p.key === key);
                  
                  return (
                    <div
                      key={key}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        padding: '8px 12px',
                        background: '#f0fdf4',
                        borderRadius: '8px',
                        border: '1px solid #bbf7d0'
                      }}
                    >
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span style={{ fontSize: '14px', fontWeight: '500' }}>
                        {platform?.name}
                      </span>
                      {config.optimized && (
                        <Zap className="w-3 h-3 text-yellow-500" />
                      )}
                    </div>
                  );
                })}
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const renderMonitorTab = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <h3 style={{ fontSize: '20px', fontWeight: '600' }}>Distribution Jobs</h3>
      
      {distributionJobs.map(job => (
        <div
          key={job.id}
          style={{
            background: 'white',
            borderRadius: '16px',
            padding: '24px',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
            border: '1px solid #e5e7eb'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h4 style={{ fontSize: '16px', fontWeight: '600' }}>
              Job {job.id}
            </h4>
            <div style={{
              padding: '6px 12px',
              borderRadius: '6px',
              fontSize: '12px',
              fontWeight: '600',
              background: job.status === 'completed' ? '#dcfce7' : 
                          job.status === 'processing' ? '#fef3c7' : 
                          job.status === 'failed' ? '#fee2e2' : '#f3f4f6',
              color: job.status === 'completed' ? '#166534' : 
                     job.status === 'processing' ? '#92400e' : 
                     job.status === 'failed' ? '#991b1b' : '#374151'
            }}>
              {job.status.toUpperCase()}
            </div>
          </div>

          {/* Progress Bar */}
          <div style={{ marginBottom: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={{ fontSize: '14px', color: '#64748b' }}>Progress</span>
              <span style={{ fontSize: '14px', fontWeight: '600' }}>{job.progress}%</span>
            </div>
            <div style={{
              width: '100%',
              height: '8px',
              background: '#e5e7eb',
              borderRadius: '4px',
              overflow: 'hidden'
            }}>
              <div style={{
                width: `${job.progress}%`,
                height: '100%',
                background: 'linear-gradient(90deg, #3b82f6, #10b981)',
                transition: 'width 0.5s ease'
              }} />
            </div>
          </div>

          {/* Platform Results */}
          <div>
            <h5 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '12px' }}>
              Platform Results ({Object.keys(job.results).length}/{job.platforms.length})
            </h5>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '12px' }}>
              {job.platforms.map(platformKey => {
                const result = job.results[platformKey];
                const platform = [...allPlatforms.music, ...allPlatforms.publishing]
                  .find(p => p.key === platformKey);

                return (
                  <div
                    key={platformKey}
                    style={{
                      padding: '12px',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      background: result ? 
                        (result.status === 'success' ? '#f0fdf4' : '#fef2f2') : 
                        '#f9fafb'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <span style={{ fontSize: '14px', fontWeight: '600' }}>
                        {platform?.name}
                      </span>
                      {result ? (
                        result.status === 'success' ? (
                          <CheckCircle className="w-4 h-4 text-green-500" />
                        ) : (
                          <AlertCircle className="w-4 h-4 text-red-500" />
                        )
                      ) : (
                        <Clock className="w-4 h-4 text-gray-400" />
                      )}
                    </div>
                    
                    {result && result.status === 'success' && result.url && (
                      <a
                        href={result.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          fontSize: '12px',
                          color: '#3b82f6',
                          textDecoration: 'none'
                        }}
                      >
                        View on platform →
                      </a>
                    )}
                    
                    {result && result.status === 'failed' && (
                      <span style={{ fontSize: '12px', color: '#dc2626' }}>
                        {result.error}
                      </span>
                    )}
                    
                    {!result && (
                      <span style={{ fontSize: '12px', color: '#6b7280' }}>
                        Pending...
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      ))}
    </div>
  );

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
          <h1 style={{
            fontSize: '36px',
            fontWeight: '700',
            color: '#1a202c',
            marginBottom: '8px',
            display: 'flex',
            alignItems: 'center',
            gap: '16px'
          }}>
            <Zap className="w-10 h-10 text-purple-600" />
            Universal Distribution Engine
          </h1>
          <p style={{ color: '#64748b', fontSize: '18px' }}>
            Next-generation tool using ALL platforms simultaneously with AI optimization
          </p>

          {/* Stats */}
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
            gap: '20px',
            marginTop: '24px'
          }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '24px', fontWeight: '700', color: '#3b82f6' }}>
                {allPlatforms.music.length}
              </div>
              <div style={{ fontSize: '14px', color: '#64748b' }}>Music Platforms</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '24px', fontWeight: '700', color: '#10b981' }}>
                {allPlatforms.publishing.length}
              </div>
              <div style={{ fontSize: '14px', color: '#64748b' }}>Publishing Platforms</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '24px', fontWeight: '700', color: '#f59e0b' }}>
                {allPlatforms.music.length + allPlatforms.publishing.length}
              </div>
              <div style={{ fontSize: '14px', color: '#64748b' }}>Total Platforms</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '24px', fontWeight: '700', color: '#8b5cf6' }}>
                AI
              </div>
              <div style={{ fontSize: '14px', color: '#64748b' }}>Powered Optimization</div>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div style={{
            display: 'flex',
            gap: '8px',
            marginTop: '32px',
            padding: '4px',
            background: 'rgba(0, 0, 0, 0.05)',
            borderRadius: '12px',
            width: 'fit-content'
          }}>
            {[
              { key: 'upload', label: 'Upload Content', icon: Upload },
              { key: 'optimize', label: 'AI Optimize', icon: Brain },
              { key: 'distribute', label: 'Distribute', icon: Rocket },
              { key: 'monitor', label: 'Monitor', icon: BarChart3 }
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
          {activeTab === 'upload' && renderUploadTab()}
          {activeTab === 'optimize' && renderOptimizeTab()}
          {activeTab === 'distribute' && renderDistributeTab()}
          {activeTab === 'monitor' && renderMonitorTab()}
        </div>
      </div>
    </div>
  );
};

export default UniversalDistributionEngine;