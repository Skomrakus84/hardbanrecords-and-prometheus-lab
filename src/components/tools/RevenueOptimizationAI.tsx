// Revenue Optimization AI - Unified revenue optimization with dynamic pricing
import React, { useState, useEffect } from 'react';
import {
  DollarSign, TrendingUp, Target, Brain, Zap, Settings,
  BarChart3, PieChart, LineChart, Users, Globe, Clock,
  ArrowUp, ArrowDown, RefreshCw, AlertTriangle, CheckCircle,
  Layers, Filter, Calendar, Eye, Lightbulb, Cpu, Database
} from 'lucide-react';

interface PlatformRevenue {
  platform: string;
  type: 'music' | 'publishing';
  revenue: {
    current: number;
    projected: number;
    potential: number;
    currency: string;
  };
  metrics: {
    sales: number;
    streams?: number;
    avgPrice: number;
    conversion: number;
    retention: number;
  };
  optimization: {
    currentPrice: number;
    suggestedPrice: number;
    priceChange: number;
    confidence: number;
    reason: string;
    impact: 'high' | 'medium' | 'low';
  };
  trends: {
    daily: number[];
    weekly: number[];
    seasonal: Record<string, number>;
  };
  competitors: {
    avgPrice: number;
    marketPosition: 'above' | 'below' | 'competitive';
    priceGap: number;
  };
  aiInsights: {
    opportunities: string[];
    risks: string[];
    recommendations: string[];
  };
}

interface OptimizationRule {
  id: string;
  name: string;
  platform?: string;
  type: 'dynamic' | 'scheduled' | 'threshold' | 'seasonal';
  enabled: boolean;
  conditions: {
    metric: string;
    operator: 'gt' | 'lt' | 'eq' | 'change';
    value: number;
    timeframe?: string;
  }[];
  actions: {
    type: 'price_increase' | 'price_decrease' | 'promotion' | 'bundle';
    value: number;
    duration?: string;
    maxAdjustment?: number;
  }[];
  priority: number;
  lastTriggered?: string;
}

interface RevenueProjection {
  period: 'week' | 'month' | 'quarter' | 'year';
  baseline: number;
  optimized: number;
  improvement: number;
  confidence: number;
  breakdown: {
    platform: string;
    baseline: number;
    optimized: number;
  }[];
}

const RevenueOptimizationAI: React.FC = () => {
  const [platformRevenues, setPlatformRevenues] = useState<PlatformRevenue[]>([]);
  const [optimizationRules, setOptimizationRules] = useState<OptimizationRule[]>([]);
  const [projections, setProjections] = useState<RevenueProjection[]>([]);
  const [selectedTimeframe, setSelectedTimeframe] = useState<'day' | 'week' | 'month' | 'quarter'>('month');
  const [activeTab, setActiveTab] = useState<'dashboard' | 'optimization' | 'projections' | 'rules'>('dashboard');
  const [aiMode, setAiMode] = useState<'conservative' | 'balanced' | 'aggressive'>('balanced');
  const [isOptimizing, setIsOptimizing] = useState(false);

  useEffect(() => {
    initializeRevenueData();
    initializeOptimizationRules();
    generateProjections();
  }, []);

  const initializeRevenueData = () => {
    const platforms = [
      // Music Platforms
      { key: 'spotify', name: 'Spotify', type: 'music', baseRevenue: 1250 },
      { key: 'apple-music', name: 'Apple Music', type: 'music', baseRevenue: 980 },
      { key: 'amazon-music', name: 'Amazon Music', type: 'music', baseRevenue: 850 },
      { key: 'bandcamp', name: 'Bandcamp', type: 'music', baseRevenue: 720 },
      { key: 'soundcloud', name: 'SoundCloud', type: 'music', baseRevenue: 450 },
      { key: 'tidal', name: 'Tidal', type: 'music', baseRevenue: 380 },
      
      // Publishing Platforms
      { key: 'amazon-kdp', name: 'Amazon KDP', type: 'publishing', baseRevenue: 2100 },
      { key: 'apple-books', name: 'Apple Books', type: 'publishing', baseRevenue: 890 },
      { key: 'kobo', name: 'Kobo', type: 'publishing', baseRevenue: 650 },
      { key: 'draft2digital', name: 'Draft2Digital', type: 'publishing', baseRevenue: 420 }
    ];

    const mockRevenues: PlatformRevenue[] = platforms.map(platform => {
      const currentRevenue = platform.baseRevenue * (0.8 + Math.random() * 0.4);
      const projectedRevenue = currentRevenue * (1.1 + Math.random() * 0.3);
      const potentialRevenue = currentRevenue * (1.3 + Math.random() * 0.5);
      
      const currentPrice = platform.type === 'music' ? 
        Math.round((0.99 + Math.random() * 2) * 100) / 100 : 
        Math.round((7.99 + Math.random() * 15) * 100) / 100;
        
      const suggestedPrice = currentPrice * (0.9 + Math.random() * 0.3);
      
      return {
        platform: platform.key,
        type: platform.type as 'music' | 'publishing',
        revenue: {
          current: Math.round(currentRevenue * 100) / 100,
          projected: Math.round(projectedRevenue * 100) / 100,
          potential: Math.round(potentialRevenue * 100) / 100,
          currency: 'USD'
        },
        metrics: {
          sales: Math.floor(currentRevenue / currentPrice) + Math.floor(Math.random() * 100),
          streams: platform.type === 'music' ? Math.floor(Math.random() * 50000) + 5000 : undefined,
          avgPrice: currentPrice,
          conversion: Math.round((2 + Math.random() * 8) * 100) / 100,
          retention: Math.round((60 + Math.random() * 35) * 100) / 100
        },
        optimization: {
          currentPrice,
          suggestedPrice: Math.round(suggestedPrice * 100) / 100,
          priceChange: Math.round(((suggestedPrice - currentPrice) / currentPrice * 100) * 100) / 100,
          confidence: Math.round((70 + Math.random() * 25) * 100) / 100,
          reason: generateOptimizationReason(currentPrice, suggestedPrice, platform.type),
          impact: Math.abs(suggestedPrice - currentPrice) / currentPrice > 0.15 ? 'high' : 
                  Math.abs(suggestedPrice - currentPrice) / currentPrice > 0.05 ? 'medium' : 'low'
        },
        trends: {
          daily: Array.from({ length: 30 }, () => Math.round((currentRevenue * 0.8 + Math.random() * currentRevenue * 0.4) * 100) / 100),
          weekly: Array.from({ length: 12 }, () => Math.round((currentRevenue * 6.5 + Math.random() * currentRevenue * 2) * 100) / 100),
          seasonal: {
            'Q1': currentRevenue * 0.9,
            'Q2': currentRevenue * 1.1,
            'Q3': currentRevenue * 0.8,
            'Q4': currentRevenue * 1.3
          }
        },
        competitors: {
          avgPrice: currentPrice * (0.85 + Math.random() * 0.3),
          marketPosition: currentPrice > (currentPrice * 1.1) ? 'above' : 
                         currentPrice < (currentPrice * 0.9) ? 'below' : 'competitive',
          priceGap: Math.round(((currentPrice - (currentPrice * 0.95)) / (currentPrice * 0.95) * 100) * 100) / 100
        },
        aiInsights: {
          opportunities: generateOpportunities(platform.key, platform.type as 'music' | 'publishing'),
          risks: generateRisks(platform.key, platform.type as 'music' | 'publishing'),
          recommendations: generateRecommendations(platform.key, platform.type as 'music' | 'publishing')
        }
      };
    });

    setPlatformRevenues(mockRevenues);
  };

  const initializeOptimizationRules = () => {
    const rules: OptimizationRule[] = [
      {
        id: 'rule_001',
        name: 'Dynamic Pricing Based on Demand',
        type: 'dynamic',
        enabled: true,
        conditions: [
          { metric: 'conversion', operator: 'gt', value: 5, timeframe: '7d' },
          { metric: 'sales', operator: 'change', value: 20, timeframe: '24h' }
        ],
        actions: [
          { type: 'price_increase', value: 5, maxAdjustment: 15 }
        ],
        priority: 1
      },
      {
        id: 'rule_002',
        name: 'Seasonal Holiday Pricing',
        type: 'seasonal',
        enabled: true,
        conditions: [
          { metric: 'date', operator: 'eq', value: 12 } // December
        ],
        actions: [
          { type: 'promotion', value: 10, duration: '30d' }
        ],
        priority: 2
      },
      {
        id: 'rule_003',
        name: 'Low Performance Recovery',
        type: 'threshold',
        enabled: true,
        conditions: [
          { metric: 'revenue', operator: 'lt', value: 500, timeframe: '30d' }
        ],
        actions: [
          { type: 'price_decrease', value: 10, maxAdjustment: 20 }
        ],
        priority: 3
      },
      {
        id: 'rule_004',
        name: 'Competitor Price Matching',
        type: 'dynamic',
        enabled: false,
        conditions: [
          { metric: 'competitor_price', operator: 'lt', value: 95 } // 95% of our price
        ],
        actions: [
          { type: 'price_decrease', value: 5, maxAdjustment: 10 }
        ],
        priority: 4
      }
    ];

    setOptimizationRules(rules);
  };

  const generateProjections = () => {
    const totalCurrent = platformRevenues.reduce((sum, p) => sum + p.revenue.current, 0);
    const totalOptimized = platformRevenues.reduce((sum, p) => sum + p.revenue.potential, 0);
    
    const projections: RevenueProjection[] = [
      {
        period: 'week',
        baseline: totalCurrent * 0.25,
        optimized: totalOptimized * 0.25,
        improvement: ((totalOptimized * 0.25) - (totalCurrent * 0.25)) / (totalCurrent * 0.25) * 100,
        confidence: 85,
        breakdown: platformRevenues.map(p => ({
          platform: p.platform,
          baseline: p.revenue.current * 0.25,
          optimized: p.revenue.potential * 0.25
        }))
      },
      {
        period: 'month',
        baseline: totalCurrent,
        optimized: totalOptimized,
        improvement: (totalOptimized - totalCurrent) / totalCurrent * 100,
        confidence: 78,
        breakdown: platformRevenues.map(p => ({
          platform: p.platform,
          baseline: p.revenue.current,
          optimized: p.revenue.potential
        }))
      },
      {
        period: 'quarter',
        baseline: totalCurrent * 3.2,
        optimized: totalOptimized * 3.5,
        improvement: ((totalOptimized * 3.5) - (totalCurrent * 3.2)) / (totalCurrent * 3.2) * 100,
        confidence: 65,
        breakdown: platformRevenues.map(p => ({
          platform: p.platform,
          baseline: p.revenue.current * 3.2,
          optimized: p.revenue.potential * 3.5
        }))
      },
      {
        period: 'year',
        baseline: totalCurrent * 12.8,
        optimized: totalOptimized * 14.2,
        improvement: ((totalOptimized * 14.2) - (totalCurrent * 12.8)) / (totalCurrent * 12.8) * 100,
        confidence: 45,
        breakdown: platformRevenues.map(p => ({
          platform: p.platform,
          baseline: p.revenue.current * 12.8,
          optimized: p.revenue.potential * 14.2
        }))
      }
    ];

    setProjections(projections);
  };

  const generateOptimizationReason = (current: number, suggested: number, type: 'music' | 'publishing'): string => {
    const change = (suggested - current) / current;
    
    if (change > 0.1) {
      return type === 'music' ? 
        'High demand and low competition suggest price increase opportunity' :
        'Strong sales performance indicates market will accept premium pricing';
    } else if (change < -0.1) {
      return type === 'music' ? 
        'Market saturation suggests competitive pricing needed' :
        'Competitor analysis shows price reduction could increase market share';
    } else {
      return 'Current pricing appears optimal based on market conditions';
    }
  };

  const generateOpportunities = (platform: string, type: 'music' | 'publishing'): string[] => {
    const opportunities = [
      'Bundle pricing strategy could increase average order value',
      'Peak hours pricing optimization available',
      'Cross-platform promotional pricing opportunities',
      'Seasonal demand patterns suggest pricing adjustments'
    ];
    
    if (type === 'music') {
      opportunities.push('Playlist placement could justify premium pricing');
      opportunities.push('Limited edition releases command higher prices');
    } else {
      opportunities.push('Series pricing strategy could boost overall revenue');
      opportunities.push('Pre-order campaigns with early bird pricing');
    }
    
    return opportunities.slice(0, 3);
  };

  const generateRisks = (platform: string, type: 'music' | 'publishing'): string[] => {
    const risks = [
      'Price sensitivity in current market segment',
      'Competitor price wars could affect margins',
      'Economic conditions may impact consumer spending',
      'Platform algorithm changes affecting visibility'
    ];
    
    if (type === 'music') {
      risks.push('Streaming market saturation');
      risks.push('Artist exclusivity deals affecting pricing');
    } else {
      risks.push('Digital piracy impact on sales');
      risks.push('Market oversaturation in genre');
    }
    
    return risks.slice(0, 2);
  };

  const generateRecommendations = (platform: string, type: 'music' | 'publishing'): string[] => {
    const recommendations = [
      'Implement A/B testing for price points',
      'Monitor competitor pricing weekly',
      'Consider tiered pricing strategy',
      'Optimize pricing based on geographic regions'
    ];
    
    if (type === 'music') {
      recommendations.push('Leverage streaming analytics for pricing');
      recommendations.push('Consider fan-funded pricing models');
    } else {
      recommendations.push('Implement chapter-based pricing');
      recommendations.push('Consider subscription model integration');
    }
    
    return recommendations.slice(0, 3);
  };

  const runAIOptimization = async () => {
    setIsOptimizing(true);
    
    // Simulate AI optimization process
    for (let i = 0; i <= 100; i += 10) {
      await new Promise(resolve => setTimeout(resolve, 200));
      // Update progress here if needed
    }
    
    // Apply optimizations
    setPlatformRevenues(prev => prev.map(platform => ({
      ...platform,
      optimization: {
        ...platform.optimization,
        confidence: Math.min(100, platform.optimization.confidence + Math.random() * 10)
      }
    })));
    
    setIsOptimizing(false);
  };

  const calculateTotalRevenue = () => {
    return platformRevenues.reduce((sum, platform) => sum + platform.revenue.current, 0);
  };

  const calculatePotentialRevenue = () => {
    return platformRevenues.reduce((sum, platform) => sum + platform.revenue.potential, 0);
  };

  const calculateTotalImprovement = () => {
    const current = calculateTotalRevenue();
    const potential = calculatePotentialRevenue();
    return ((potential - current) / current * 100);
  };

  const renderDashboardTab = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Revenue Overview */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
        <div style={{
          background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
          borderRadius: '16px',
          padding: '24px',
          color: 'white'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <DollarSign className="w-8 h-8" />
            <span style={{ fontSize: '12px', opacity: 0.8 }}>Current Revenue</span>
          </div>
          <div style={{ fontSize: '28px', fontWeight: '700' }}>
            ${calculateTotalRevenue().toFixed(2)}
          </div>
          <div style={{ fontSize: '12px', opacity: 0.8 }}>
            Monthly Total
          </div>
        </div>

        <div style={{
          background: 'linear-gradient(135deg, #10b981, #059669)',
          borderRadius: '16px',
          padding: '24px',
          color: 'white'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <Target className="w-8 h-8" />
            <span style={{ fontSize: '12px', opacity: 0.8 }}>Optimized Potential</span>
          </div>
          <div style={{ fontSize: '28px', fontWeight: '700' }}>
            ${calculatePotentialRevenue().toFixed(2)}
          </div>
          <div style={{ fontSize: '12px', opacity: 0.8, display: 'flex', alignItems: 'center', gap: '4px' }}>
            <ArrowUp className="w-3 h-3" />
            +{calculateTotalImprovement().toFixed(1)}% improvement
          </div>
        </div>

        <div style={{
          background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
          borderRadius: '16px',
          padding: '24px',
          color: 'white'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <Brain className="w-8 h-8" />
            <span style={{ fontSize: '12px', opacity: 0.8 }}>AI Confidence</span>
          </div>
          <div style={{ fontSize: '28px', fontWeight: '700' }}>
            {Math.round(platformRevenues.reduce((sum, p) => sum + p.optimization.confidence, 0) / platformRevenues.length)}%
          </div>
          <div style={{ fontSize: '12px', opacity: 0.8 }}>
            Avg Across Platforms
          </div>
        </div>

        <div style={{
          background: 'linear-gradient(135deg, #f59e0b, #d97706)',
          borderRadius: '16px',
          padding: '24px',
          color: 'white'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <Zap className="w-8 h-8" />
            <span style={{ fontSize: '12px', opacity: 0.8 }}>Active Rules</span>
          </div>
          <div style={{ fontSize: '28px', fontWeight: '700' }}>
            {optimizationRules.filter(r => r.enabled).length}
          </div>
          <div style={{ fontSize: '12px', opacity: 0.8 }}>
            Auto-optimization enabled
          </div>
        </div>
      </div>

      {/* AI Optimization Panel */}
      <div style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        borderRadius: '16px',
        padding: '32px',
        color: 'white'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <div>
            <h3 style={{ fontSize: '24px', fontWeight: '700', marginBottom: '8px' }}>
              AI Revenue Optimization
            </h3>
            <p style={{ fontSize: '16px', opacity: 0.9 }}>
              Intelligent pricing strategies across all platforms
            </p>
          </div>
          
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <select
              value={aiMode}
              onChange={(e) => setAiMode(e.target.value as any)}
              style={{
                padding: '8px 12px',
                borderRadius: '8px',
                border: 'none',
                background: 'rgba(255, 255, 255, 0.2)',
                color: 'white',
                fontSize: '14px'
              }}
            >
              <option value="conservative">Conservative</option>
              <option value="balanced">Balanced</option>
              <option value="aggressive">Aggressive</option>
            </select>
            
            <button
              onClick={runAIOptimization}
              disabled={isOptimizing}
              style={{
                padding: '12px 24px',
                borderRadius: '12px',
                border: 'none',
                background: 'rgba(255, 255, 255, 0.2)',
                backdropFilter: 'blur(10px)',
                color: 'white',
                fontSize: '14px',
                fontWeight: '600',
                cursor: isOptimizing ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                opacity: isOptimizing ? 0.6 : 1
              }}
            >
              {isOptimizing ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Optimizing...
                </>
              ) : (
                <>
                  <Cpu className="w-4 h-4" />
                  Run AI Optimization
                </>
              )}
            </button>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '20px', fontWeight: '700' }}>
              ${(calculatePotentialRevenue() - calculateTotalRevenue()).toFixed(0)}
            </div>
            <div style={{ fontSize: '12px', opacity: 0.8 }}>Monthly Revenue Increase</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '20px', fontWeight: '700' }}>
              {platformRevenues.filter(p => p.optimization.impact === 'high').length}
            </div>
            <div style={{ fontSize: '12px', opacity: 0.8 }}>High-Impact Optimizations</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '20px', fontWeight: '700' }}>
              {platformRevenues.length}
            </div>
            <div style={{ fontSize: '12px', opacity: 0.8 }}>Platforms Monitored</div>
          </div>
        </div>
      </div>

      {/* Platform Revenue Breakdown */}
      <div style={{
        background: 'white',
        borderRadius: '16px',
        padding: '24px',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)'
      }}>
        <h3 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '20px' }}>
          Platform Revenue Optimization
        </h3>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '16px' }}>
          {platformRevenues.slice(0, 6).map(platform => (
            <div
              key={platform.platform}
              style={{
                padding: '16px',
                border: '1px solid #e5e7eb',
                borderRadius: '12px',
                background: '#fafafa'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <h4 style={{ fontSize: '16px', fontWeight: '600', textTransform: 'capitalize' }}>
                  {platform.platform.replace('-', ' ')}
                </h4>
                <div style={{
                  padding: '4px 8px',
                  borderRadius: '6px',
                  fontSize: '10px',
                  fontWeight: '600',
                  background: platform.optimization.impact === 'high' ? '#fee2e2' : 
                             platform.optimization.impact === 'medium' ? '#fef3c7' : '#f0fdf4',
                  color: platform.optimization.impact === 'high' ? '#991b1b' : 
                         platform.optimization.impact === 'medium' ? '#92400e' : '#166534'
                }}>
                  {platform.optimization.impact.toUpperCase()} IMPACT
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                <div>
                  <div style={{ fontSize: '12px', color: '#64748b' }}>Current Revenue</div>
                  <div style={{ fontSize: '16px', fontWeight: '700', color: '#3b82f6' }}>
                    ${platform.revenue.current.toFixed(2)}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '12px', color: '#64748b' }}>Potential</div>
                  <div style={{ fontSize: '16px', fontWeight: '700', color: '#10b981' }}>
                    ${platform.revenue.potential.toFixed(2)}
                  </div>
                </div>
                
                <div>
                  <div style={{ fontSize: '12px', color: '#64748b' }}>Current Price</div>
                  <div style={{ fontSize: '14px', fontWeight: '600' }}>
                    ${platform.optimization.currentPrice}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '12px', color: '#64748b' }}>Suggested Price</div>
                  <div style={{ fontSize: '14px', fontWeight: '600', color: platform.optimization.priceChange > 0 ? '#10b981' : '#ef4444' }}>
                    ${platform.optimization.suggestedPrice}
                    <span style={{ fontSize: '10px', marginLeft: '4px' }}>
                      ({platform.optimization.priceChange > 0 ? '+' : ''}{platform.optimization.priceChange}%)
                    </span>
                  </div>
                </div>
              </div>

              <div style={{ marginBottom: '12px' }}>
                <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '4px' }}>
                  AI Confidence: {platform.optimization.confidence}%
                </div>
                <div style={{
                  width: '100%',
                  height: '4px',
                  background: '#e5e7eb',
                  borderRadius: '2px',
                  overflow: 'hidden'
                }}>
                  <div style={{
                    width: `${platform.optimization.confidence}%`,
                    height: '100%',
                    background: platform.optimization.confidence > 80 ? '#10b981' : 
                               platform.optimization.confidence > 60 ? '#f59e0b' : '#ef4444'
                  }} />
                </div>
              </div>

              <p style={{ fontSize: '11px', color: '#6b7280', lineHeight: '1.4' }}>
                {platform.optimization.reason}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderOptimizationTab = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <h2 style={{ fontSize: '24px', fontWeight: '600' }}>Optimization Opportunities</h2>
      
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
        {platformRevenues.map(platform => (
          <div
            key={platform.platform}
            style={{
              background: 'white',
              borderRadius: '16px',
              padding: '24px',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
              border: '1px solid #e5e7eb'
            }}
          >
            <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px', textTransform: 'capitalize' }}>
              {platform.platform.replace('-', ' ')}
            </h3>

            {/* AI Insights */}
            <div style={{ marginBottom: '20px' }}>
              <h4 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Lightbulb className="w-4 h-4 text-yellow-500" />
                Opportunities
              </h4>
              <ul style={{ fontSize: '12px', color: '#64748b', paddingLeft: '16px' }}>
                {platform.aiInsights.opportunities.map((opportunity, index) => (
                  <li key={index} style={{ marginBottom: '4px' }}>{opportunity}</li>
                ))}
              </ul>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <h4 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <AlertTriangle className="w-4 h-4 text-red-500" />
                Risks
              </h4>
              <ul style={{ fontSize: '12px', color: '#64748b', paddingLeft: '16px' }}>
                {platform.aiInsights.risks.map((risk, index) => (
                  <li key={index} style={{ marginBottom: '4px' }}>{risk}</li>
                ))}
              </ul>
            </div>

            <div>
              <h4 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <CheckCircle className="w-4 h-4 text-green-500" />
                Recommendations
              </h4>
              <ul style={{ fontSize: '12px', color: '#64748b', paddingLeft: '16px' }}>
                {platform.aiInsights.recommendations.map((recommendation, index) => (
                  <li key={index} style={{ marginBottom: '4px' }}>{recommendation}</li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderProjectionsTab = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <h2 style={{ fontSize: '24px', fontWeight: '600' }}>Revenue Projections</h2>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>
        {projections.map(projection => (
          <div
            key={projection.period}
            style={{
              background: 'white',
              borderRadius: '16px',
              padding: '24px',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
              border: '1px solid #e5e7eb'
            }}
          >
            <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px', textTransform: 'capitalize' }}>
              {projection.period}ly Projection
            </h3>
            
            <div style={{ marginBottom: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ fontSize: '14px', color: '#64748b' }}>Baseline</span>
                <span style={{ fontSize: '14px', fontWeight: '600' }}>
                  ${projection.baseline.toFixed(2)}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ fontSize: '14px', color: '#64748b' }}>Optimized</span>
                <span style={{ fontSize: '14px', fontWeight: '600', color: '#10b981' }}>
                  ${projection.optimized.toFixed(2)}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '14px', color: '#64748b' }}>Improvement</span>
                <span style={{ fontSize: '14px', fontWeight: '600', color: projection.improvement > 0 ? '#10b981' : '#ef4444' }}>
                  {projection.improvement > 0 ? '+' : ''}{projection.improvement.toFixed(1)}%
                </span>
              </div>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '4px' }}>
                Confidence: {projection.confidence}%
              </div>
              <div style={{
                width: '100%',
                height: '6px',
                background: '#e5e7eb',
                borderRadius: '3px',
                overflow: 'hidden'
              }}>
                <div style={{
                  width: `${projection.confidence}%`,
                  height: '100%',
                  background: 'linear-gradient(90deg, #3b82f6, #10b981)'
                }} />
              </div>
            </div>

            <div style={{
              padding: '12px',
              background: '#f8fafc',
              borderRadius: '8px',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '20px', fontWeight: '700', color: '#10b981' }}>
                +${(projection.optimized - projection.baseline).toFixed(0)}
              </div>
              <div style={{ fontSize: '12px', color: '#64748b' }}>
                Additional Revenue
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderRulesTab = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ fontSize: '24px', fontWeight: '600' }}>Optimization Rules</h2>
        <button
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
          <Settings className="w-4 h-4" />
          Add Rule
        </button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {optimizationRules.map(rule => (
          <div
            key={rule.id}
            style={{
              background: 'white',
              borderRadius: '12px',
              padding: '20px',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
              border: '1px solid #e5e7eb',
              opacity: rule.enabled ? 1 : 0.6
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: '600' }}>{rule.name}</h3>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{
                  padding: '4px 8px',
                  borderRadius: '6px',
                  fontSize: '10px',
                  fontWeight: '600',
                  background: rule.type === 'dynamic' ? '#dbeafe' : 
                             rule.type === 'scheduled' ? '#fef3c7' : 
                             rule.type === 'threshold' ? '#fee2e2' : '#f0fdf4',
                  color: rule.type === 'dynamic' ? '#1e40af' : 
                         rule.type === 'scheduled' ? '#92400e' : 
                         rule.type === 'threshold' ? '#991b1b' : '#166534'
                }}>
                  {rule.type.toUpperCase()}
                </div>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={rule.enabled}
                    onChange={(e) => setOptimizationRules(prev => 
                      prev.map(r => r.id === rule.id ? { ...r, enabled: e.target.checked } : r)
                    )}
                  />
                  <span style={{ fontSize: '14px' }}>Enabled</span>
                </label>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <h4 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '8px' }}>Conditions</h4>
                {rule.conditions.map((condition, index) => (
                  <div key={index} style={{ fontSize: '12px', color: '#64748b', marginBottom: '4px' }}>
                    {condition.metric} {condition.operator} {condition.value}
                    {condition.timeframe && ` (${condition.timeframe})`}
                  </div>
                ))}
              </div>
              
              <div>
                <h4 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '8px' }}>Actions</h4>
                {rule.actions.map((action, index) => (
                  <div key={index} style={{ fontSize: '12px', color: '#64748b', marginBottom: '4px' }}>
                    {action.type.replace('_', ' ')}: {action.value}%
                    {action.duration && ` for ${action.duration}`}
                  </div>
                ))}
              </div>
            </div>

            {rule.lastTriggered && (
              <div style={{ marginTop: '12px', fontSize: '12px', color: '#9ca3af' }}>
                Last triggered: {new Date(rule.lastTriggered).toLocaleString()}
              </div>
            )}
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
            <Brain className="w-10 h-10 text-purple-600" />
            Revenue Optimization AI
          </h1>
          <p style={{ color: '#64748b', fontSize: '18px', marginBottom: '24px' }}>
            Unified revenue optimization with dynamic pricing across all platforms
          </p>

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
              { key: 'dashboard', label: 'Dashboard', icon: BarChart3 },
              { key: 'optimization', label: 'Optimization', icon: Target },
              { key: 'projections', label: 'Projections', icon: TrendingUp },
              { key: 'rules', label: 'Rules', icon: Settings }
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
          {activeTab === 'dashboard' && renderDashboardTab()}
          {activeTab === 'optimization' && renderOptimizationTab()}
          {activeTab === 'projections' && renderProjectionsTab()}
          {activeTab === 'rules' && renderRulesTab()}
        </div>
      </div>
    </div>
  );
};

export default RevenueOptimizationAI;