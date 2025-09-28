/**
 * Analytics TypeScript definitions for Music Distribution Module
 * Comprehensive type definitions for analytics, metrics, and data visualization
 */

declare global {
  namespace Music.Analytics {
    // ========== Core Analytics Types ==========

    interface AnalyticsRequest {
      time_range: TimeRange;
      group_by: GroupByPeriod;
      filters: AnalyticsFilters;
      metrics: MetricType[];
      comparison_period?: TimeRange;
      include_predictions?: boolean;
      include_benchmarks?: boolean;
      format?: 'json' | 'csv' | 'xlsx';
    }

    interface AnalyticsResponse {
      metadata: AnalyticsMetadata;
      summary: AnalyticsSummary;
      series: TimeSeriesData[];
      breakdowns: AnalyticsBreakdowns;
      insights: AnalyticsInsight[];
      benchmarks?: BenchmarkData;
      predictions?: PredictionData;
      generated_at: Date;
      cache_expires_at?: Date;
    }

    interface AnalyticsMetadata {
      request_id: string;
      time_range: TimeRange;
      filters_applied: AnalyticsFilters;
      metrics_included: MetricType[];
      data_freshness: Date;
      processing_time_ms: number;
      sample_size: number;
      confidence_level: number;
    }

    interface AnalyticsSummary {
      total_streams: number;
      total_revenue: number;
      total_listeners: number;
      average_completion_rate: number;
      growth_metrics: GrowthMetrics;
      top_performers: TopPerformers;
      key_insights: string[];
    }

    // ========== Time and Filtering ==========

    interface TimeRange {
      start: Date;
      end: Date;
      timezone?: string;
      preset?: TimeRangePreset;
    }

    type TimeRangePreset = 
      | 'today' 
      | 'yesterday' 
      | 'last_7_days' 
      | 'last_30_days' 
      | 'last_90_days' 
      | 'last_12_months' 
      | 'this_month' 
      | 'last_month' 
      | 'this_year' 
      | 'last_year' 
      | 'all_time';

    type GroupByPeriod = 'hour' | 'day' | 'week' | 'month' | 'quarter' | 'year';

    interface AnalyticsFilters {
      platforms?: string[];
      territories?: string[];
      releases?: string[];
      tracks?: string[];
      artists?: string[];
      genres?: string[];
      age_groups?: string[];
      device_types?: string[];
      subscription_types?: string[];
      user_segments?: string[];
    }

    // ========== Metrics and KPIs ==========

    type MetricType = 
      | 'streams' 
      | 'unique_listeners' 
      | 'revenue' 
      | 'completion_rate' 
      | 'skip_rate' 
      | 'repeat_rate' 
      | 'playlist_additions' 
      | 'downloads' 
      | 'shares' 
      | 'saves' 
      | 'discovery_rate'
      | 'engagement_score'
      | 'viral_coefficient'
      | 'retention_rate';

    interface MetricValue {
      metric: MetricType;
      value: number;
      formatted_value: string;
      change_from_previous: number;
      change_percentage: number;
      trend: 'up' | 'down' | 'stable';
      confidence: number;
    }

    interface GrowthMetrics {
      streams_growth: GrowthRate;
      revenue_growth: GrowthRate;
      listener_growth: GrowthRate;
      engagement_growth: GrowthRate;
      overall_momentum: MomentumScore;
    }

    interface GrowthRate {
      absolute_change: number;
      percentage_change: number;
      period_over_period: number;
      compound_annual_growth_rate: number;
      trend_direction: 'accelerating' | 'steady' | 'decelerating';
    }

    interface MomentumScore {
      score: number; // 0-100
      factors: MomentumFactor[];
      forecast: 'increasing' | 'stable' | 'decreasing';
      confidence: number;
    }

    interface MomentumFactor {
      factor: string;
      impact: number;
      description: string;
    }

    // ========== Time Series Data ==========

    interface TimeSeriesData {
      timestamp: Date;
      metrics: Record<MetricType, number>;
      metadata?: TimeSeriesMetadata;
    }

    interface TimeSeriesMetadata {
      data_quality: number;
      sample_size: number;
      interpolated: boolean;
      confidence_interval?: ConfidenceInterval;
    }

    interface ConfidenceInterval {
      lower_bound: number;
      upper_bound: number;
      confidence_level: number;
    }

    // ========== Breakdowns and Segments ==========

    interface AnalyticsBreakdowns {
      by_platform: PlatformBreakdown[];
      by_territory: TerritoryBreakdown[];
      by_track: TrackBreakdown[];
      by_release: ReleaseBreakdown[];
      by_demographic: DemographicBreakdown[];
      by_device: DeviceBreakdown[];
      by_discovery_source: DiscoveryBreakdown[];
    }

    interface PlatformBreakdown {
      platform: string;
      platform_display_name: string;
      metrics: Record<MetricType, number>;
      market_share: number;
      growth_rate: number;
      performance_tier: 'top' | 'mid' | 'low';
      revenue_per_stream: number;
    }

    interface TerritoryBreakdown {
      territory_code: string;
      territory_name: string;
      metrics: Record<MetricType, number>;
      market_size: number;
      penetration_rate: number;
      local_chart_position?: number;
      cultural_relevance_score: number;
    }

    interface TrackBreakdown {
      track_id: string;
      track_title: string;
      isrc?: string;
      metrics: Record<MetricType, number>;
      performance_score: number;
      lifecycle_stage: TrackLifecycleStage;
      optimization_suggestions: string[];
    }

    interface ReleaseBreakdown {
      release_id: string;
      release_title: string;
      release_type: string;
      upc?: string;
      metrics: Record<MetricType, number>;
      cross_track_performance: CrossTrackMetrics;
      release_momentum: ReleaseMomentum;
    }

    interface DemographicBreakdown {
      segment: string;
      age_range?: string;
      gender?: string;
      location?: string;
      metrics: Record<MetricType, number>;
      engagement_profile: EngagementProfile;
      listening_patterns: ListeningPattern[];
    }

    interface DeviceBreakdown {
      device_type: string;
      metrics: Record<MetricType, number>;
      usage_context: UsageContext;
      quality_preferences: QualityPreferences;
    }

    interface DiscoveryBreakdown {
      source: string;
      source_type: 'organic' | 'algorithmic' | 'social' | 'playlist' | 'direct';
      metrics: Record<MetricType, number>;
      conversion_rate: number;
      retention_rate: number;
      acquisition_cost?: number;
    }

    // ========== Advanced Analytics ==========

    type TrackLifecycleStage = 'launch' | 'growth' | 'peak' | 'decline' | 'revival' | 'archived';

    interface CrossTrackMetrics {
      track_correlation: TrackCorrelation[];
      listening_flow: ListeningFlow[];
      discovery_patterns: DiscoveryPattern[];
    }

    interface TrackCorrelation {
      track_a_id: string;
      track_b_id: string;
      correlation_coefficient: number;
      common_listeners_percentage: number;
      playlist_co_occurrence: number;
    }

    interface ListeningFlow {
      from_track_id: string;
      to_track_id: string;
      transition_probability: number;
      session_continuation_rate: number;
    }

    interface DiscoveryPattern {
      entry_track_id: string;
      discovery_sequence: string[];
      conversion_rate: number;
      average_session_length: number;
    }

    interface ReleaseMomentum {
      velocity: number;
      acceleration: number;
      peak_prediction: Date;
      sustainability_score: number;
      factors: ReleaseMomentumFactor[];
    }

    interface ReleaseMomentumFactor {
      factor: string;
      contribution: number;
      trend: 'positive' | 'negative' | 'neutral';
    }

    interface EngagementProfile {
      engagement_score: number;
      listening_intensity: ListeningIntensity;
      interaction_types: InteractionType[];
      loyalty_indicators: LoyaltyIndicator[];
    }

    interface ListeningIntensity {
      sessions_per_week: number;
      tracks_per_session: number;
      completion_rate: number;
      repeat_listening_rate: number;
    }

    interface InteractionType {
      type: 'like' | 'share' | 'playlist_add' | 'follow' | 'comment';
      frequency: number;
      engagement_weight: number;
    }

    interface LoyaltyIndicator {
      indicator: string;
      value: number;
      interpretation: string;
    }

    interface ListeningPattern {
      pattern_type: 'temporal' | 'sequential' | 'contextual';
      description: string;
      frequency: number;
      predictive_value: number;
    }

    interface UsageContext {
      primary_contexts: string[];
      session_characteristics: SessionCharacteristics;
      behavioral_patterns: BehavioralPattern[];
    }

    interface SessionCharacteristics {
      average_duration: number;
      skip_behavior: SkipBehavior;
      volume_patterns: VolumePattern[];
      interaction_frequency: number;
    }

    interface SkipBehavior {
      skip_rate: number;
      average_listen_duration: number;
      skip_reasons: SkipReason[];
    }

    interface SkipReason {
      reason: string;
      frequency: number;
      predictability: number;
    }

    interface VolumePattern {
      time_of_day: string;
      average_volume: number;
      usage_intensity: number;
    }

    interface BehavioralPattern {
      pattern: string;
      occurrence_rate: number;
      correlation_with_engagement: number;
    }

    interface QualityPreferences {
      preferred_bitrate: number;
      quality_sensitivity: number;
      format_preferences: string[];
    }

    // ========== Insights and Recommendations ==========

    interface AnalyticsInsight {
      id: string;
      type: InsightType;
      category: InsightCategory;
      title: string;
      description: string;
      confidence: number;
      impact_score: number;
      supporting_data: SupportingData;
      recommendations: Recommendation[];
      created_at: Date;
      expires_at?: Date;
    }

    type InsightType = 
      | 'trend_detection' 
      | 'anomaly_detection' 
      | 'opportunity_identification' 
      | 'performance_optimization' 
      | 'audience_behavior' 
      | 'market_analysis' 
      | 'competitive_intelligence'
      | 'revenue_optimization';

    type InsightCategory = 
      | 'performance' 
      | 'audience' 
      | 'content' 
      | 'marketing' 
      | 'monetization' 
      | 'distribution' 
      | 'engagement';

    interface SupportingData {
      metrics: MetricEvidence[];
      correlations: CorrelationEvidence[];
      comparisons: ComparisonEvidence[];
      statistical_significance: number;
    }

    interface MetricEvidence {
      metric: MetricType;
      value: number;
      change: number;
      context: string;
    }

    interface CorrelationEvidence {
      variable_a: string;
      variable_b: string;
      correlation: number;
      causality_probability: number;
    }

    interface ComparisonEvidence {
      comparison_type: 'peer' | 'historical' | 'market';
      baseline: number;
      current: number;
      percentile_rank: number;
    }

    interface Recommendation {
      id: string;
      title: string;
      description: string;
      action_type: ActionType;
      priority: 'low' | 'medium' | 'high' | 'critical';
      estimated_impact: EstimatedImpact;
      implementation_effort: 'low' | 'medium' | 'high';
      timeline: string;
      success_metrics: string[];
      related_insights: string[];
    }

    type ActionType = 
      | 'content_optimization' 
      | 'audience_targeting' 
      | 'platform_strategy' 
      | 'pricing_adjustment' 
      | 'release_timing' 
      | 'marketing_campaign' 
      | 'playlist_strategy'
      | 'collaboration_opportunity';

    interface EstimatedImpact {
      metric: MetricType;
      estimated_improvement: number;
      confidence_range: [number, number];
      timeframe: string;
    }

    // ========== Predictive Analytics ==========

    interface PredictionData {
      predictions: Prediction[];
      model_info: ModelInfo;
      accuracy_metrics: AccuracyMetrics;
      scenario_analysis: ScenarioAnalysis[];
    }

    interface Prediction {
      metric: MetricType;
      forecast_horizon: string;
      predicted_values: PredictedValue[];
      trend_components: TrendComponent[];
      confidence_intervals: ConfidenceInterval[];
    }

    interface PredictedValue {
      date: Date;
      value: number;
      confidence: number;
      factors: PredictionFactor[];
    }

    interface PredictionFactor {
      factor: string;
      contribution: number;
      confidence: number;
    }

    interface TrendComponent {
      component: 'trend' | 'seasonal' | 'cyclical' | 'irregular';
      strength: number;
      direction: 'increasing' | 'decreasing' | 'stable';
    }

    interface ModelInfo {
      model_type: string;
      version: string;
      training_data_period: TimeRange;
      last_updated: Date;
      features_used: string[];
      model_performance: ModelPerformance;
    }

    interface ModelPerformance {
      accuracy: number;
      precision: number;
      recall: number;
      f1_score: number;
      mean_absolute_error: number;
      root_mean_square_error: number;
    }

    interface AccuracyMetrics {
      historical_accuracy: number;
      recent_performance: number;
      by_horizon: HorizonAccuracy[];
      by_metric: MetricAccuracy[];
    }

    interface HorizonAccuracy {
      horizon: string;
      accuracy: number;
      sample_size: number;
    }

    interface MetricAccuracy {
      metric: MetricType;
      accuracy: number;
      bias: number;
    }

    interface ScenarioAnalysis {
      scenario_name: string;
      description: string;
      assumptions: ScenarioAssumption[];
      predicted_outcomes: Record<MetricType, number>;
      probability: number;
      risk_factors: RiskFactor[];
    }

    interface ScenarioAssumption {
      parameter: string;
      base_value: number;
      scenario_value: number;
      justification: string;
    }

    interface RiskFactor {
      factor: string;
      impact: 'positive' | 'negative';
      magnitude: number;
      probability: number;
    }

    // ========== Benchmarking ==========

    interface BenchmarkData {
      peer_comparison: PeerComparison;
      industry_standards: IndustryStandard[];
      percentile_rankings: PercentileRanking[];
      competitive_position: CompetitivePosition;
    }

    interface PeerComparison {
      peer_group: string;
      metrics_comparison: MetricComparison[];
      relative_performance: RelativePerformance;
      gaps_and_opportunities: GapAnalysis[];
    }

    interface MetricComparison {
      metric: MetricType;
      your_value: number;
      peer_average: number;
      peer_median: number;
      top_quartile: number;
      percentile_rank: number;
    }

    interface RelativePerformance {
      overall_score: number;
      strengths: string[];
      weaknesses: string[];
      improvement_potential: number;
    }

    interface GapAnalysis {
      area: string;
      current_performance: number;
      benchmark_performance: number;
      gap_size: number;
      improvement_opportunity: string;
    }

    interface IndustryStandard {
      metric: MetricType;
      industry_average: number;
      standard_deviation: number;
      percentile_breakdowns: number[];
      data_source: string;
      last_updated: Date;
    }

    interface PercentileRanking {
      metric: MetricType;
      percentile: number;
      interpretation: string;
      improvement_needed: boolean;
    }

    interface CompetitivePosition {
      market_position: 'leader' | 'challenger' | 'follower' | 'niche';
      competitive_advantages: string[];
      competitive_threats: string[];
      market_opportunities: string[];
      strategic_recommendations: string[];
    }

    // ========== Reporting and Visualization ==========

    interface ReportConfiguration {
      report_type: ReportType;
      template: string;
      sections: ReportSection[];
      formatting: ReportFormatting;
      distribution: ReportDistribution;
      schedule?: ReportSchedule;
    }

    type ReportType = 'dashboard' | 'summary' | 'detailed' | 'executive' | 'custom';

    interface ReportSection {
      section_id: string;
      title: string;
      content_type: 'chart' | 'table' | 'metric' | 'text' | 'insight';
      configuration: SectionConfiguration;
    }

    interface SectionConfiguration {
      metrics: MetricType[];
      chart_type?: ChartType;
      time_range?: TimeRange;
      filters?: AnalyticsFilters;
      styling?: StylingOptions;
    }

    type ChartType = 
      | 'line' 
      | 'bar' 
      | 'pie' 
      | 'area' 
      | 'scatter' 
      | 'heatmap' 
      | 'funnel' 
      | 'gauge' 
      | 'treemap';

    interface StylingOptions {
      color_scheme: string;
      show_legend: boolean;
      show_grid: boolean;
      annotations: Annotation[];
    }

    interface Annotation {
      type: 'line' | 'point' | 'region' | 'text';
      value: any;
      label: string;
      style: Record<string, any>;
    }

    interface ReportFormatting {
      format: 'pdf' | 'html' | 'xlsx' | 'pptx' | 'json';
      page_size?: string;
      orientation?: 'portrait' | 'landscape';
      branding?: BrandingOptions;
    }

    interface BrandingOptions {
      logo_url?: string;
      color_scheme?: string;
      font_family?: string;
      header_text?: string;
      footer_text?: string;
    }

    interface ReportDistribution {
      recipients: ReportRecipient[];
      delivery_method: 'email' | 'api' | 'download' | 'dashboard';
      security: ReportSecurity;
    }

    interface ReportRecipient {
      email: string;
      name: string;
      access_level: 'view' | 'download' | 'share';
    }

    interface ReportSecurity {
      password_protected: boolean;
      expiration_date?: Date;
      watermark: boolean;
      download_restrictions: boolean;
    }

    interface ReportSchedule {
      frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly';
      day_of_week?: number;
      day_of_month?: number;
      time_of_day: string;
      timezone: string;
      active: boolean;
    }

    // ========== Real-time Analytics ==========

    interface RealTimeMetrics {
      timestamp: Date;
      live_listeners: number;
      current_streams_per_minute: number;
      trending_tracks: TrendingTrack[];
      geographic_activity: GeographicActivity[];
      platform_activity: PlatformActivity[];
      alert_conditions: AlertCondition[];
    }

    interface TrendingTrack {
      track_id: string;
      track_title: string;
      velocity: number;
      current_position?: number;
      previous_position?: number;
      trend_direction: 'rising' | 'falling' | 'stable';
    }

    interface GeographicActivity {
      territory: string;
      active_listeners: number;
      streams_per_minute: number;
      growth_rate: number;
    }

    interface PlatformActivity {
      platform: string;
      active_streams: number;
      completion_rate: number;
      average_session_length: number;
    }

    interface AlertCondition {
      condition_id: string;
      type: 'threshold' | 'anomaly' | 'trend';
      severity: 'info' | 'warning' | 'critical';
      message: string;
      triggered_at: Date;
      resolved: boolean;
    }

    // ========== Export and Integration ==========

    interface ExportConfiguration {
      format: 'csv' | 'xlsx' | 'json' | 'xml' | 'parquet';
      compression?: 'gzip' | 'zip';
      fields: ExportField[];
      filters: AnalyticsFilters;
      time_range: TimeRange;
      grouping: GroupByPeriod;
      include_metadata: boolean;
    }

    interface ExportField {
      field_name: string;
      display_name: string;
      data_type: 'number' | 'string' | 'date' | 'boolean';
      format?: string;
      include: boolean;
    }

    interface IntegrationEndpoint {
      name: string;
      type: 'webhook' | 'api' | 'database' | 'file_transfer';
      configuration: IntegrationConfiguration;
      authentication: IntegrationAuth;
      data_mapping: DataMapping[];
      schedule?: IntegrationSchedule;
    }

    interface IntegrationConfiguration {
      endpoint_url?: string;
      method?: 'GET' | 'POST' | 'PUT';
      headers?: Record<string, string>;
      batch_size?: number;
      retry_policy?: RetryPolicy;
    }

    interface IntegrationAuth {
      type: 'none' | 'basic' | 'bearer' | 'oauth2' | 'api_key';
      credentials: Record<string, string>;
    }

    interface DataMapping {
      source_field: string;
      target_field: string;
      transformation?: DataTransformation;
    }

    interface DataTransformation {
      type: 'format' | 'calculate' | 'aggregate' | 'filter';
      configuration: Record<string, any>;
    }

    interface IntegrationSchedule {
      frequency: 'real_time' | 'hourly' | 'daily' | 'weekly';
      time_of_day?: string;
      timezone?: string;
    }

    interface RetryPolicy {
      max_retries: number;
      backoff_strategy: 'linear' | 'exponential';
      initial_delay_ms: number;
      max_delay_ms: number;
    }

    // ========== Top Performers ==========

    interface TopPerformers {
      tracks: TopTrack[];
      releases: TopRelease[];
      territories: TopTerritory[];
      platforms: TopPlatform[];
      time_periods: TopTimePeriod[];
    }

    interface TopTrack {
      track_id: string;
      track_title: string;
      rank: number;
      metric_value: number;
      metric_type: MetricType;
      growth_rate: number;
    }

    interface TopRelease {
      release_id: string;
      release_title: string;
      rank: number;
      metric_value: number;
      metric_type: MetricType;
      track_count: number;
    }

    interface TopTerritory {
      territory_code: string;
      territory_name: string;
      rank: number;
      metric_value: number;
      metric_type: MetricType;
      market_penetration: number;
    }

    interface TopPlatform {
      platform: string;
      rank: number;
      metric_value: number;
      metric_type: MetricType;
      efficiency_score: number;
    }

    interface TopTimePeriod {
      period: string;
      start_date: Date;
      end_date: Date;
      metric_value: number;
      metric_type: MetricType;
      events: string[];
    }
  }
}

export {};
