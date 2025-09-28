// Smart Content Optimization - AI-powered content optimization for each platform
import React, { useState, useEffect } from 'react';
import {
  Brain, Zap, Target, TrendingUp, Eye, Mic, FileText, Image,
  Settings, CheckCircle, AlertCircle, RefreshCw, BarChart3,
  Layers, Sparkles, Volume2, BookOpen, Monitor, Smartphone
} from 'lucide-react';

interface ContentAnalysis {
  score: number;
  issues: string[];
  suggestions: string[];
  strengths: string[];
}

interface PlatformOptimization {
  platform: string;
  contentType: 'music' | 'book';
  analysis: ContentAnalysis;
  optimizations: {
    title?: string;
    description?: string;
    tags?: string[];
    pricing?: number;
    metadata?: Record<string, any>;
    artwork?: {
      format: string;
      dimensions: string;
      suggestions: string[];
    };
  };
  audienceMatch: number;
  revenueProjection: number;
  competitionLevel: 'low' | 'medium' | 'high';
}

interface OptimizationSession {
  id: string;
  contentId: string;
  contentType: 'music' | 'book';
  originalContent: {
    title: string;
    description: string;
    tags: string[];
    files: Record<string, File>;
  };
  platformOptimizations: Record<string, PlatformOptimization>;
  status: 'analyzing' | 'optimizing' | 'completed';
  progress: number;
  startTime: string;
}

const SmartContentOptimization: React.FC = () => {
  const [sessions, setSessions] = useState<OptimizationSession[]>([]);
  const [activeSession, setActiveSession] = useState<OptimizationSession | null>(null);
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([]);
  const [analysisMode, setAnalysisMode] = useState<'quick' | 'deep' | 'competitive'>('deep');
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Platform-specific optimization rules
  const platformRules = {
    music: {
      'spotify': {
        titleMaxLength: 100,
        descriptionMaxLength: 1000,
        preferredGenres: ['Pop', 'Hip-Hop', 'Electronic', 'Indie', 'Rock'],
        tagLimit: 10,
        artworkSize: '640x640',
        audienceAge: '16-35',
        keyFactors: ['Playlist potential', 'Discovery algorithm', 'Social sharing']
      },
      'apple-music': {
        titleMaxLength: 255,
        descriptionMaxLength: 4000,
        preferredGenres: ['Alternative', 'Classical', 'Jazz', 'World Music'],
        tagLimit: 15,
        artworkSize: '1400x1400',
        audienceAge: '25-45',
        keyFactors: ['Editorial curation', 'Audio quality', 'Album coherence']
      },
      'soundcloud': {
        titleMaxLength: 500,
        descriptionMaxLength: 50000,
        preferredGenres: ['Electronic', 'Hip-Hop', 'Experimental', 'Remix'],
        tagLimit: 20,
        artworkSize: '800x800',
        audienceAge: '16-30',
        keyFactors: ['Community engagement', 'Reposts', 'Comments']
      },
      'bandcamp': {
        titleMaxLength: 200,
        descriptionMaxLength: 10000,
        preferredGenres: ['Indie', 'Metal', 'Punk', 'Experimental', 'Folk'],
        tagLimit: 50,
        artworkSize: '1400x1400',
        audienceAge: '20-40',
        keyFactors: ['Fan funding', 'Limited releases', 'Artist story']
      },
      'youtube-music': {
        titleMaxLength: 100,
        descriptionMaxLength: 5000,
        preferredGenres: ['Pop', 'Hip-Hop', 'Gaming Music', 'Covers'],
        tagLimit: 12,
        artworkSize: '1280x720',
        audienceAge: '13-35',
        keyFactors: ['Video content', 'Trending potential', 'Searchability']
      }
    },
    publishing: {
      'amazon-kdp': {
        titleMaxLength: 200,
        descriptionMaxLength: 4000,
        preferredGenres: ['Fiction', 'Self-Help', 'Business', 'Romance', 'Thriller'],
        tagLimit: 7,
        coverSize: '1600x2560',
        audienceAge: '25-55',
        keyFactors: ['Keyword optimization', 'Series potential', 'Review strategy']
      },
      'apple-books': {
        titleMaxLength: 255,
        descriptionMaxLength: 4000,
        preferredGenres: ['Literary Fiction', 'Biography', 'Art Books', 'Children'],
        tagLimit: 10,
        coverSize: '1400x1400',
        audienceAge: '30-50',
        keyFactors: ['Editorial selection', 'Premium presentation', 'Series coherence']
      },
      'kobo': {
        titleMaxLength: 250,
        descriptionMaxLength: 3000,
        preferredGenres: ['International Fiction', 'Romance', 'Sci-Fi', 'Fantasy'],
        tagLimit: 15,
        coverSize: '1600x2400',
        audienceAge: '25-45',
        keyFactors: ['International reach', 'Reading rewards', 'Discovery']
      },
      'draft2digital': {
        titleMaxLength: 300,
        descriptionMaxLength: 5000,
        preferredGenres: ['Indie Fiction', 'Non-fiction', 'Poetry', 'Short Stories'],
        tagLimit: 20,
        coverSize: '1600x2560',
        audienceAge: '20-50',
        keyFactors: ['Multi-platform reach', 'Metadata optimization', 'Pricing flexibility']
      }
    }
  };

  const startOptimization = async (content: any) => {
    const newSession: OptimizationSession = {
      id: `opt_${Date.now()}`,
      contentId: content.id,
      contentType: content.type,
      originalContent: {
        title: content.title,
        description: content.description,
        tags: content.tags || [],
        files: content.files || {}
      },
      platformOptimizations: {},
      status: 'analyzing',
      progress: 0,
      startTime: new Date().toISOString()
    };

    setSessions(prev => [newSession, ...prev]);
    setActiveSession(newSession);
    setIsAnalyzing(true);

    // Analyze content for each selected platform
    const platforms = selectedPlatforms.length > 0 ? selectedPlatforms : 
      Object.keys(platformRules[content.type]);

    for (let i = 0; i < platforms.length; i++) {
      const platform = platforms[i];
      const rules = platformRules[content.type][platform];
      
      if (!rules) continue;

      // Simulate AI analysis
      await new Promise(resolve => setTimeout(resolve, 1500));

      const optimization = await analyzeContentForPlatform(content, platform, rules);
      
      setSessions(prev => prev.map(session => 
        session.id === newSession.id ? {
          ...session,
          progress: Math.round(((i + 1) / platforms.length) * 100),
          platformOptimizations: {
            ...session.platformOptimizations,
            [platform]: optimization
          }
        } : session
      ));
    }

    // Mark as completed
    setSessions(prev => prev.map(session => 
      session.id === newSession.id ? {
        ...session,
        status: 'completed',
        progress: 100
      } : session
    ));

    setIsAnalyzing(false);
  };

  const analyzeContentForPlatform = async (content: any, platform: string, rules: any): Promise<PlatformOptimization> => {
    // Simulate comprehensive AI analysis
    const titleIssues: string[] = [];
    const titleSuggestions: string[] = [];
    const descriptionIssues: string[] = [];
    const descriptionSuggestions: string[] = [];
    const strengths: string[] = [];

    // Title Analysis
    if (content.title.length > rules.titleMaxLength) {
      titleIssues.push(`Title too long (${content.title.length}/${rules.titleMaxLength} chars)`);
      titleSuggestions.push(`Shorten title to under ${rules.titleMaxLength} characters`);
    }
    
    if (content.title.length < 10) {
      titleIssues.push('Title too short, may hurt discoverability');
      titleSuggestions.push('Add descriptive keywords to title');
    }

    // Description Analysis
    if (content.description.length > rules.descriptionMaxLength) {
      descriptionIssues.push(`Description too long (${content.description.length}/${rules.descriptionMaxLength} chars)`);
      descriptionSuggestions.push(`Trim description to ${rules.descriptionMaxLength} characters`);
    }

    if (content.description.length < 100) {
      descriptionIssues.push('Description too short for optimal engagement');
      descriptionSuggestions.push('Expand description with engaging details');
    }

    // Genre Matching
    if (rules.preferredGenres.includes(content.genre)) {
      strengths.push(`Genre "${content.genre}" performs well on ${platform}`);
    } else {
      titleSuggestions.push(`Consider genres: ${rules.preferredGenres.slice(0, 3).join(', ')}`);
    }

    // Calculate scores
    const titleScore = Math.max(0, 100 - titleIssues.length * 20);
    const descriptionScore = Math.max(0, 100 - descriptionIssues.length * 15);
    const genreScore = rules.preferredGenres.includes(content.genre) ? 100 : 60;
    
    const overallScore = Math.round((titleScore + descriptionScore + genreScore) / 3);

    // Generate optimizations
    const optimizedTitle = generateOptimizedTitle(content.title, platform, rules);
    const optimizedDescription = generateOptimizedDescription(content.description, platform, rules);
    const optimizedTags = generateOptimizedTags(content.tags, platform, rules);
    const optimizedPricing = calculateOptimalPricing(content.pricing?.basePrice || 0, platform);

    return {
      platform,
      contentType: content.type,
      analysis: {
        score: overallScore,
        issues: [...titleIssues, ...descriptionIssues],
        suggestions: [...titleSuggestions, ...descriptionSuggestions],
        strengths
      },
      optimizations: {
        title: optimizedTitle,
        description: optimizedDescription,
        tags: optimizedTags,
        pricing: optimizedPricing,
        artwork: {
          format: 'JPG',
          dimensions: rules.artworkSize || rules.coverSize,
          suggestions: generateArtworkSuggestions(platform, rules)
        }
      },
      audienceMatch: calculateAudienceMatch(content, rules),
      revenueProjection: calculateRevenueProjection(content, platform, rules),
      competitionLevel: calculateCompetitionLevel(content.genre, platform)
    };
  };

  const generateOptimizedTitle = (originalTitle: string, platform: string, rules: any): string => {
    let optimized = originalTitle;
    
    // Platform-specific optimizations
    switch (platform) {
      case 'spotify':
        // Clean, simple titles work best
        optimized = originalTitle.replace(/[^\w\s-]/g, '').trim();
        break;
      case 'youtube-music':
        // Add descriptive elements
        if (!optimized.includes('Official') && !optimized.includes('Audio')) {
          optimized += ' (Official Audio)';
        }
        break;
      case 'amazon-kdp':
        // Add subtitle for books
        if (!optimized.includes(':') && rules.preferredGenres.includes('Self-Help')) {
          optimized += ': A Complete Guide';
        }
        break;
      case 'apple-books':
        // Keep clean and professional
        optimized = originalTitle.replace(/[!@#$%^&*]/g, '').trim();
        break;
    }
    
    // Truncate if too long
    if (optimized.length > rules.titleMaxLength) {
      optimized = optimized.substring(0, rules.titleMaxLength - 3) + '...';
    }
    
    return optimized;
  };

  const generateOptimizedDescription = (originalDesc: string, platform: string, rules: any): string => {
    let optimized = originalDesc;
    
    // Platform-specific description optimization
    switch (platform) {
      case 'soundcloud':
        // Add social elements
        optimized += '\n\n🎵 Follow for more music!\n💬 Let me know what you think!';
        break;
      case 'bandcamp':
        // Add story elements
        optimized = `Artist Statement:\n${optimized}\n\nSupport independent music by purchasing this release.`;
        break;
      case 'amazon-kdp':
        // Add structured book description
        optimized = `What readers are saying: "Engaging and insightful!"\n\n${optimized}\n\nPerfect for fans of ${rules.preferredGenres[0]} literature.`;
        break;
      case 'apple-books':
        // Keep professional and clean
        optimized = optimized.replace(/[!]{2,}/g, '!').replace(/[?]{2,}/g, '?');
        break;
    }
    
    // Truncate if too long
    if (optimized.length > rules.descriptionMaxLength) {
      optimized = optimized.substring(0, rules.descriptionMaxLength - 3) + '...';
    }
    
    return optimized;
  };

  const generateOptimizedTags = (originalTags: string[], platform: string, rules: any): string[] => {
    let optimized = [...originalTags];
    
    // Add platform-specific tags
    const platformTags: Record<string, string[]> = {
      'spotify': ['playlist-ready', 'streaming-optimized'],
      'soundcloud': ['electronic', 'beats', 'remix-friendly'],
      'bandcamp': ['independent', 'direct-support', 'high-quality'],
      'youtube-music': ['official', 'music-video', 'trending'],
      'amazon-kdp': ['bestseller-potential', 'page-turner', 'must-read'],
      'apple-books': ['premium-quality', 'editorial-selection'],
      'kobo': ['international', 'global-appeal']
    };
    
    if (platformTags[platform]) {
      optimized = [...optimized, ...platformTags[platform]];
    }
    
    // Remove duplicates and limit
    optimized = [...new Set(optimized)].slice(0, rules.tagLimit);
    
    return optimized;
  };

  const calculateOptimalPricing = (basePrice: number, platform: string): number => {
    const platformMultipliers: Record<string, number> = {
      'bandcamp': 1.2, // Premium pricing for direct sales
      'apple-music': 1.1, // Slight premium for quality audience
      'spotify': 1.0, // Standard pricing
      'soundcloud': 0.0, // Often free
      'amazon-kdp': 1.15, // Good margin on books
      'apple-books': 1.2, // Premium book pricing
      'kobo': 1.0 // Standard pricing
    };
    
    return Math.round((basePrice * (platformMultipliers[platform] || 1.0)) * 100) / 100;
  };

  const calculateAudienceMatch = (content: any, rules: any): number => {
    let score = 70; // Base score
    
    // Genre match
    if (rules.preferredGenres.includes(content.genre)) {
      score += 20;
    }
    
    // Title optimization
    if (content.title.length >= 10 && content.title.length <= rules.titleMaxLength) {
      score += 10;
    }
    
    return Math.min(100, score);
  };

  const calculateRevenueProjection = (content: any, platform: string, rules: any): number => {
    const basePotential = 1000; // Base revenue potential
    
    const platformMultipliers: Record<string, number> = {
      'spotify': 0.8,
      'apple-music': 1.2,
      'bandcamp': 2.0,
      'amazon-kdp': 1.5,
      'apple-books': 1.3,
      'soundcloud': 0.3
    };
    
    return Math.round(basePotential * (platformMultipliers[platform] || 1.0));
  };

  const calculateCompetitionLevel = (genre: string, platform: string): 'low' | 'medium' | 'high' => {
    const competitionMatrix: Record<string, Record<string, 'low' | 'medium' | 'high'>> = {
      'Pop': { 'spotify': 'high', 'apple-music': 'high', 'soundcloud': 'medium' },
      'Hip-Hop': { 'spotify': 'high', 'soundcloud': 'high', 'bandcamp': 'low' },
      'Electronic': { 'soundcloud': 'high', 'bandcamp': 'medium', 'spotify': 'medium' },
      'Indie': { 'bandcamp': 'medium', 'spotify': 'medium', 'apple-music': 'low' },
      'Fiction': { 'amazon-kdp': 'high', 'apple-books': 'medium', 'kobo': 'medium' },
      'Non-fiction': { 'amazon-kdp': 'medium', 'apple-books': 'low', 'kobo': 'low' }
    };
    
    return competitionMatrix[genre]?.[platform] || 'medium';
  };

  const generateArtworkSuggestions = (platform: string, rules: any): string[] => {
    const suggestions = [
      `Optimal size: ${rules.artworkSize || rules.coverSize}`,
      'High contrast for thumbnail visibility',
      'Clear, readable text if included'
    ];
    
    switch (platform) {
      case 'spotify':
        suggestions.push('Focus on visual impact at small sizes');
        suggestions.push('Avoid excessive text');
        break;
      case 'youtube-music':
        suggestions.push('Consider video thumbnail style');
        suggestions.push('Bold, eye-catching design');
        break;
      case 'amazon-kdp':
        suggestions.push('Professional book cover design');
        suggestions.push('Genre-appropriate imagery');
        break;
      case 'apple-books':
        suggestions.push('Premium, artistic design');
        suggestions.push('High-quality photography or illustration');
        break;
    }
    
    return suggestions;
  };

  const renderAnalysisCard = (platform: string, optimization: PlatformOptimization) => (
    <div
      key={platform}
      style={{
        background: 'white',
        borderRadius: '16px',
        padding: '24px',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
        border: '1px solid #e5e7eb'
      }}
    >
      {/* Platform Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h3 style={{ fontSize: '18px', fontWeight: '600', textTransform: 'capitalize' }}>
          {platform.replace('-', ' ')}
        </h3>
        <div style={{
          padding: '6px 12px',
          borderRadius: '20px',
          fontSize: '14px',
          fontWeight: '600',
          background: optimization.analysis.score >= 80 ? '#dcfce7' : 
                     optimization.analysis.score >= 60 ? '#fef3c7' : '#fee2e2',
          color: optimization.analysis.score >= 80 ? '#166534' : 
                 optimization.analysis.score >= 60 ? '#92400e' : '#991b1b'
        }}>
          {optimization.analysis.score}% Optimized
        </div>
      </div>

      {/* Key Metrics */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px', marginBottom: '20px' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '20px', fontWeight: '700', color: '#3b82f6' }}>
            {optimization.audienceMatch}%
          </div>
          <div style={{ fontSize: '12px', color: '#64748b' }}>Audience Match</div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '20px', fontWeight: '700', color: '#10b981' }}>
            ${optimization.revenueProjection}
          </div>
          <div style={{ fontSize: '12px', color: '#64748b' }}>Revenue Potential</div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            fontSize: '14px',
            fontWeight: '600',
            padding: '4px 8px',
            borderRadius: '6px',
            background: optimization.competitionLevel === 'low' ? '#dcfce7' : 
                       optimization.competitionLevel === 'medium' ? '#fef3c7' : '#fee2e2',
            color: optimization.competitionLevel === 'low' ? '#166534' : 
                   optimization.competitionLevel === 'medium' ? '#92400e' : '#991b1b'
          }}>
            {optimization.competitionLevel.toUpperCase()}
          </div>
          <div style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>Competition</div>
        </div>
      </div>

      {/* Issues and Suggestions */}
      {optimization.analysis.issues.length > 0 && (
        <div style={{ marginBottom: '16px' }}>
          <h4 style={{ fontSize: '14px', fontWeight: '600', color: '#dc2626', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <AlertCircle className="w-4 h-4" />
            Issues ({optimization.analysis.issues.length})
          </h4>
          <div style={{ fontSize: '12px', color: '#7f1d1d', background: '#fee2e2', padding: '8px 12px', borderRadius: '6px' }}>
            {optimization.analysis.issues.join(' • ')}
          </div>
        </div>
      )}

      {optimization.analysis.suggestions.length > 0 && (
        <div style={{ marginBottom: '16px' }}>
          <h4 style={{ fontSize: '14px', fontWeight: '600', color: '#3b82f6', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Zap className="w-4 h-4" />
            AI Suggestions ({optimization.analysis.suggestions.length})
          </h4>
          <div style={{ fontSize: '12px', color: '#1e40af', background: '#dbeafe', padding: '8px 12px', borderRadius: '6px' }}>
            {optimization.analysis.suggestions.join(' • ')}
          </div>
        </div>
      )}

      {/* Optimizations Preview */}
      <div style={{ marginBottom: '16px' }}>
        <h4 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '8px' }}>Optimized Content</h4>
        
        {optimization.optimizations.title && (
          <div style={{ marginBottom: '8px' }}>
            <span style={{ fontSize: '12px', color: '#64748b' }}>Title: </span>
            <span style={{ fontSize: '12px', fontWeight: '500' }}>{optimization.optimizations.title}</span>
          </div>
        )}
        
        {optimization.optimizations.pricing && (
          <div style={{ marginBottom: '8px' }}>
            <span style={{ fontSize: '12px', color: '#64748b' }}>Price: </span>
            <span style={{ fontSize: '12px', fontWeight: '500' }}>${optimization.optimizations.pricing}</span>
          </div>
        )}
        
        {optimization.optimizations.tags && (
          <div>
            <span style={{ fontSize: '12px', color: '#64748b' }}>Tags: </span>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginTop: '4px' }}>
              {optimization.optimizations.tags.slice(0, 5).map(tag => (
                <span
                  key={tag}
                  style={{
                    fontSize: '10px',
                    padding: '2px 6px',
                    borderRadius: '4px',
                    background: '#f0f9ff',
                    color: '#0369a1'
                  }}
                >
                  {tag}
                </span>
              ))}
              {optimization.optimizations.tags.length > 5 && (
                <span style={{ fontSize: '10px', color: '#64748b' }}>
                  +{optimization.optimizations.tags.length - 5} more
                </span>
              )}
            </div>
          </div>
        )}
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
            <Brain className="w-10 h-10 text-purple-600" />
            Smart Content Optimization
          </h1>
          <p style={{ color: '#64748b', fontSize: '18px' }}>
            AI-powered content optimization tailored to each platform's specific requirements
          </p>

          {/* Control Panel */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '2fr 1fr 1fr',
            gap: '20px',
            marginTop: '32px',
            alignItems: 'end'
          }}>
            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '8px' }}>
                Analysis Mode
              </label>
              <select
                value={analysisMode}
                onChange={(e) => setAnalysisMode(e.target.value as any)}
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '2px solid #e5e7eb',
                  borderRadius: '8px',
                  fontSize: '14px'
                }}
              >
                <option value="quick">Quick Analysis (5 min)</option>
                <option value="deep">Deep Analysis (15 min)</option>
                <option value="competitive">Competitive Analysis (30 min)</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '8px' }}>
                Platform Focus
              </label>
              <select
                onChange={(e) => {
                  const value = e.target.value;
                  if (value === 'all-music') {
                    setSelectedPlatforms(['spotify', 'apple-music', 'soundcloud', 'bandcamp', 'youtube-music']);
                  } else if (value === 'all-books') {
                    setSelectedPlatforms(['amazon-kdp', 'apple-books', 'kobo', 'draft2digital']);
                  } else {
                    setSelectedPlatforms([]);
                  }
                }}
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '2px solid #e5e7eb',
                  borderRadius: '8px',
                  fontSize: '14px'
                }}
              >
                <option value="">Custom Selection</option>
                <option value="all-music">All Music Platforms</option>
                <option value="all-books">All Publishing Platforms</option>
              </select>
            </div>

            <button
              onClick={() => startOptimization({
                id: 'demo_content',
                type: 'music',
                title: 'Summer Vibes',
                description: 'Chill electronic track perfect for summer playlists',
                genre: 'Electronic',
                tags: ['electronic', 'chill', 'summer'],
                pricing: { basePrice: 1.29 }
              })}
              disabled={isAnalyzing}
              style={{
                padding: '12px 24px',
                borderRadius: '12px',
                border: 'none',
                background: isAnalyzing ? '#9ca3af' : 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
                color: 'white',
                fontSize: '14px',
                fontWeight: '600',
                cursor: isAnalyzing ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px'
              }}
            >
              {isAnalyzing ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  Start Analysis
                </>
              )}
            </button>
          </div>
        </div>

        {/* Active Session */}
        {activeSession && (
          <div style={{
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(20px)',
            borderRadius: '24px',
            padding: '32px',
            marginBottom: '24px',
            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h2 style={{ fontSize: '24px', fontWeight: '600' }}>
                Analysis Results
              </h2>
              <div style={{
                padding: '8px 16px',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: '600',
                background: activeSession.status === 'completed' ? '#dcfce7' : '#fef3c7',
                color: activeSession.status === 'completed' ? '#166534' : '#92400e'
              }}>
                {activeSession.status === 'completed' ? 'Analysis Complete' : `${activeSession.progress}% Complete`}
              </div>
            </div>

            {/* Progress Bar */}
            {activeSession.status !== 'completed' && (
              <div style={{ marginBottom: '24px' }}>
                <div style={{
                  width: '100%',
                  height: '8px',
                  background: '#e5e7eb',
                  borderRadius: '4px',
                  overflow: 'hidden'
                }}>
                  <div style={{
                    width: `${activeSession.progress}%`,
                    height: '100%',
                    background: 'linear-gradient(90deg, #3b82f6, #8b5cf6)',
                    transition: 'width 0.5s ease'
                  }} />
                </div>
                <p style={{ fontSize: '14px', color: '#64748b', marginTop: '8px', textAlign: 'center' }}>
                  Analyzing content across {Object.keys(platformRules[activeSession.contentType]).length} platforms...
                </p>
              </div>
            )}

            {/* Platform Analysis Results */}
            {Object.keys(activeSession.platformOptimizations).length > 0 && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '20px' }}>
                {Object.entries(activeSession.platformOptimizations).map(([platform, optimization]) =>
                  renderAnalysisCard(platform, optimization)
                )}
              </div>
            )}
          </div>
        )}

        {/* Previous Sessions */}
        {sessions.length > 1 && (
          <div style={{
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(20px)',
            borderRadius: '24px',
            padding: '32px',
            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)'
          }}>
            <h2 style={{ fontSize: '24px', fontWeight: '600', marginBottom: '24px' }}>
              Previous Analysis Sessions
            </h2>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {sessions.slice(1).map(session => (
                <div
                  key={session.id}
                  style={{
                    padding: '20px',
                    border: '1px solid #e5e7eb',
                    borderRadius: '12px',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease'
                  }}
                  onClick={() => setActiveSession(session)}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <h3 style={{ fontSize: '16px', fontWeight: '600' }}>
                        {session.originalContent.title}
                      </h3>
                      <p style={{ fontSize: '14px', color: '#64748b' }}>
                        {Object.keys(session.platformOptimizations).length} platforms analyzed • {new Date(session.startTime).toLocaleString()}
                      </p>
                    </div>
                    <div style={{
                      padding: '6px 12px',
                      borderRadius: '6px',
                      fontSize: '12px',
                      fontWeight: '600',
                      background: session.status === 'completed' ? '#dcfce7' : '#fee2e2',
                      color: session.status === 'completed' ? '#166534' : '#991b1b'
                    }}>
                      {session.status.toUpperCase()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SmartContentOptimization;