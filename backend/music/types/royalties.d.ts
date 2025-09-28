/**
 * Royalties TypeScript definitions for Music Distribution Module
 * Comprehensive type definitions for financial operations, royalty calculations, and payout management
 */

declare global {
  namespace Music.Royalties {
    // ========== Core Financial Types ==========

    interface RoyaltyStatement {
      id: string;
      platform: string;
      platform_display_name: string;
      report_period: ReportPeriod;
      currency: Currency;
      totals: StatementTotals;
      exchange_rate: number;
      processing_details: ProcessingDetails;
      validation: ValidationInfo;
      source_info: SourceInfo;
      metadata: StatementMetadata;
      created_at: Date;
      updated_at: Date;
    }

    interface ReportPeriod {
      start: Date;
      end: Date;
      type: PeriodType;
      formatted: string;
      days_count: number;
      is_complete: boolean;
    }

    type PeriodType = 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly' | 'custom';

    interface StatementTotals {
      streams: number;
      downloads: number;
      total_usage: number;
      revenue_gross: number;
      revenue_net: number;
      processing_fee: number;
      platform_fee: number;
      taxes_withheld: number;
      chargebacks: number;
      adjustments: number;
      final_amount: number;
      // Formatted versions
      revenue_gross_formatted: string;
      revenue_net_formatted: string;
      final_amount_formatted: string;
    }

    interface ProcessingDetails {
      status: ProcessingStatus;
      imported_at: Date;
      imported_by: string;
      processed_at?: Date;
      processed_by?: string;
      processing_duration?: number;
      records_processed: number;
      errors_count: number;
      warnings_count: number;
    }

    type ProcessingStatus = 
      | 'pending' 
      | 'processing' 
      | 'validation_pending' 
      | 'validation_failed' 
      | 'approved' 
      | 'processed' 
      | 'disputed' 
      | 'archived';

    interface ValidationInfo {
      status: ValidationStatus;
      rules_applied: ValidationRule[];
      errors: ValidationError[];
      warnings: ValidationWarning[];
      auto_corrections: AutoCorrection[];
      manual_review_required: boolean;
      validated_by?: string;
      validated_at?: Date;
    }

    type ValidationStatus = 'pending' | 'passed' | 'failed' | 'manual_review' | 'skipped';

    interface ValidationRule {
      rule_id: string;
      name: string;
      description: string;
      severity: 'error' | 'warning' | 'info';
      applied: boolean;
      result: 'passed' | 'failed' | 'skipped';
    }

    interface ValidationError {
      error_id: string;
      field: string;
      value: any;
      message: string;
      rule_violated: string;
      suggested_fix?: string;
      auto_correctable: boolean;
    }

    interface ValidationWarning {
      warning_id: string;
      field: string;
      message: string;
      impact: 'low' | 'medium' | 'high';
      recommendation?: string;
    }

    interface AutoCorrection {
      field: string;
      original_value: any;
      corrected_value: any;
      correction_type: string;
      confidence: number;
      applied: boolean;
    }

    interface SourceInfo {
      filename?: string;
      file_size?: number;
      file_hash?: string;
      import_method: ImportMethod;
      source_format: SourceFormat;
      encoding?: string;
      delimiter?: string;
      headers_included: boolean;
      total_records: number;
    }

    type ImportMethod = 'manual_upload' | 'api_integration' | 'ftp_sync' | 'email_import' | 'automated_fetch';
    type SourceFormat = 'csv' | 'xlsx' | 'xml' | 'json' | 'tsv' | 'fixed_width' | 'proprietary';

    interface StatementMetadata {
      report_type: ReportType;
      geography_scope: string[];
      content_types: ContentType[];
      usage_types: UsageType[];
      subscriber_types: SubscriberType[];
      quality_metrics: QualityMetrics;
      reconciliation_info: ReconciliationInfo;
    }

    type ReportType = 'sales' | 'usage' | 'revenue' | 'subscription' | 'advertising' | 'synchronization';
    type ContentType = 'track' | 'album' | 'compilation' | 'podcast' | 'audiobook' | 'ringtone';
    type UsageType = 'stream' | 'download' | 'radio_play' | 'sync' | 'performance' | 'mechanical';
    type SubscriberType = 'premium' | 'free' | 'family' | 'student' | 'trial' | 'ad_supported';

    interface QualityMetrics {
      completeness_score: number;
      accuracy_score: number;
      consistency_score: number;
      timeliness_score: number;
      overall_quality_score: number;
      quality_issues: QualityIssue[];
    }

    interface QualityIssue {
      issue_type: string;
      severity: 'low' | 'medium' | 'high' | 'critical';
      affected_records: number;
      description: string;
      impact_on_revenue: number;
    }

    interface ReconciliationInfo {
      previous_statement_id?: string;
      reconciled: boolean;
      discrepancies: Discrepancy[];
      adjustments_applied: Adjustment[];
      total_variance: number;
      variance_percentage: number;
    }

    interface Discrepancy {
      type: string;
      description: string;
      amount: number;
      affected_tracks: string[];
      resolution_status: 'pending' | 'resolved' | 'disputed';
      resolution_notes?: string;
    }

    interface Adjustment {
      type: string;
      reason: string;
      amount: number;
      applied_by: string;
      applied_at: Date;
      reference_document?: string;
    }

    // ========== Royalty Calculations ==========

    interface RoyaltyCalculation {
      id: string;
      statement_id: string;
      track_info: TrackInfo;
      release_info: ReleaseInfo;
      territory: TerritoryInfo;
      usage_data: UsageData;
      revenue_data: RevenueData;
      rate_info: RateInfo;
      splits: RoyaltySplit[];
      calculations: CalculationBreakdown;
      metadata: CalculationMetadata;
      created_at: Date;
      updated_at: Date;
    }

    interface TrackInfo {
      track_id: string;
      title: string;
      isrc?: string;
      duration?: number;
      contributors: ContributorInfo[];
      genre: string;
      language: string;
      explicit: boolean;
    }

    interface ReleaseInfo {
      release_id: string;
      title: string;
      upc?: string;
      release_type: string;
      release_date: Date;
      label?: string;
    }

    interface TerritoryInfo {
      territory_code: string;
      territory_name: string;
      region: string;
      currency: Currency;
      tax_rate?: number;
      withholding_rate?: number;
    }

    interface UsageData {
      streams: number;
      downloads: number;
      radio_plays?: number;
      other_usage?: Record<string, number>;
      unique_listeners?: number;
      total_listening_time?: number;
      completion_rate?: number;
    }

    interface RevenueData {
      gross_revenue: number;
      net_revenue: number;
      platform_fee: number;
      processing_fee: number;
      taxes: number;
      other_deductions: Record<string, number>;
      currency: Currency;
    }

    interface RateInfo {
      rate_per_stream: number;
      rate_per_download: number;
      rate_currency: Currency;
      rate_effective_date: Date;
      rate_source: string;
      rate_tier?: string;
      minimum_payout?: number;
    }

    interface RoyaltySplit {
      id: string;
      calculation_id: string;
      contributor: ContributorInfo;
      split_type: SplitType;
      percentage: number;
      amount: number;
      currency: Currency;
      payout_info: PayoutInfo;
      recoupment_info?: RecoupmentInfo;
      created_at: Date;
      updated_at: Date;
    }

    type SplitType = 
      | 'master_recording' 
      | 'publishing' 
      | 'performance' 
      | 'mechanical' 
      | 'synchronization' 
      | 'neighboring_rights'
      | 'producer_points'
      | 'artist_royalty';

    interface ContributorInfo {
      contributor_id: string;
      name: string;
      role: ContributorRole;
      primary: boolean;
      pro_affiliation?: string;
      ipi_number?: string;
      isni?: string;
      contact_info?: ContactInfo;
      tax_info?: TaxInfo;
    }

    type ContributorRole = 
      | 'artist' 
      | 'featured_artist' 
      | 'songwriter' 
      | 'composer' 
      | 'lyricist' 
      | 'producer' 
      | 'co_producer' 
      | 'executive_producer'
      | 'mixer' 
      | 'engineer' 
      | 'remixer' 
      | 'arranger' 
      | 'performer' 
      | 'session_musician'
      | 'vocalist' 
      | 'backing_vocalist' 
      | 'label' 
      | 'publisher' 
      | 'administrator';

    interface ContactInfo {
      email?: string;
      phone?: string;
      address?: Address;
      preferred_contact_method: 'email' | 'phone' | 'mail';
      language_preference: string;
    }

    interface Address {
      street: string;
      street2?: string;
      city: string;
      state?: string;
      postal_code: string;
      country: string;
    }

    interface TaxInfo {
      tax_id?: string;
      tax_country: string;
      tax_rate: number;
      withholding_exempt: boolean;
      w9_on_file: boolean;
      w8_on_file: boolean;
      treaty_benefits: boolean;
    }

    interface PayoutInfo {
      status: PayoutStatus;
      payout_id?: string;
      payment_method_id?: string;
      scheduled_date?: Date;
      processed_date?: Date;
      minimum_threshold: number;
      hold_until?: Date;
      hold_reason?: string;
      fees: PayoutFees;
    }

    type PayoutStatus = 
      | 'pending' 
      | 'scheduled' 
      | 'processing' 
      | 'completed' 
      | 'failed' 
      | 'cancelled' 
      | 'on_hold' 
      | 'disputed'
      | 'refunded';

    interface PayoutFees {
      processing_fee: number;
      currency_conversion_fee: number;
      wire_fee: number;
      other_fees: Record<string, number>;
      total_fees: number;
    }

    interface RecoupmentInfo {
      recoupable_expenses: number;
      recouped_to_date: number;
      remaining_balance: number;
      recoupment_rate: number;
      recoupment_priority: number;
      recoupment_status: RecoupmentStatus;
    }

    type RecoupmentStatus = 'not_applicable' | 'in_progress' | 'completed' | 'suspended' | 'disputed';

    interface CalculationBreakdown {
      gross_calculation: CalculationStep[];
      deductions: DeductionStep[];
      splits_calculation: SplitCalculationStep[];
      final_amounts: FinalAmountStep[];
      verification: VerificationStep[];
    }

    interface CalculationStep {
      step_name: string;
      formula: string;
      inputs: Record<string, number>;
      result: number;
      notes?: string;
    }

    interface DeductionStep {
      deduction_type: string;
      description: string;
      amount: number;
      percentage?: number;
      mandatory: boolean;
      legal_basis?: string;
    }

    interface SplitCalculationStep {
      contributor_id: string;
      split_type: SplitType;
      gross_amount: number;
      split_percentage: number;
      split_amount: number;
      deductions: number;
      net_amount: number;
    }

    interface FinalAmountStep {
      contributor_id: string;
      gross_amount: number;
      total_deductions: number;
      net_amount: number;
      currency: Currency;
      conversion_rate?: number;
      converted_amount?: number;
    }

    interface VerificationStep {
      check_name: string;
      status: 'passed' | 'failed' | 'warning';
      details: string;
      impact?: string;
    }

    interface CalculationMetadata {
      calculation_method: string;
      calculation_version: string;
      calculated_by: string;
      calculation_date: Date;
      source_data_version: string;
      assumptions: Assumption[];
      exchange_rates: ExchangeRateInfo[];
    }

    interface Assumption {
      parameter: string;
      value: any;
      source: string;
      confidence: number;
      impact_if_wrong: string;
    }

    interface ExchangeRateInfo {
      from_currency: Currency;
      to_currency: Currency;
      rate: number;
      rate_date: Date;
      source: string;
    }

    // ========== Financial Analytics ==========

    interface RoyaltyAnalytics {
      summary: AnalyticsSummary;
      time_series: TimeSeriesData[];
      breakdowns: AnalyticsBreakdowns;
      projections: RoyaltyProjections;
      benchmarks: RoyaltyBenchmarks;
      insights: RoyaltyInsight[];
      generated_at: Date;
    }

    interface AnalyticsSummary {
      period: ReportPeriod;
      totals: AnalyticsTotals;
      growth_metrics: GrowthMetrics;
      efficiency_metrics: EfficiencyMetrics;
      distribution_metrics: DistributionMetrics;
    }

    interface AnalyticsTotals {
      total_revenue: number;
      total_streams: number;
      total_tracks: number;
      total_territories: number;
      total_platforms: number;
      average_revenue_per_stream: number;
      average_revenue_per_track: number;
      // Formatted versions
      total_revenue_formatted: string;
      average_revenue_per_stream_formatted: string;
    }

    interface GrowthMetrics {
      revenue_growth: GrowthRate;
      streams_growth: GrowthRate;
      territory_expansion: ExpansionRate;
      platform_growth: GrowthRate;
      efficiency_improvement: EfficiencyRate;
    }

    interface GrowthRate {
      absolute_change: number;
      percentage_change: number;
      period_over_period: number;
      compound_growth_rate: number;
      trend: 'accelerating' | 'steady' | 'decelerating' | 'declining';
      seasonality_adjusted: number;
    }

    interface ExpansionRate {
      new_territories: number;
      territory_growth_rate: number;
      market_penetration: number;
      geographic_concentration: number;
    }

    interface EfficiencyRate {
      revenue_per_stream_change: number;
      cost_efficiency_change: number;
      processing_time_change: number;
      error_rate_change: number;
    }

    interface EfficiencyMetrics {
      revenue_per_stream: number;
      revenue_per_listener: number;
      cost_per_calculation: number;
      processing_accuracy: number;
      settlement_speed: number;
      dispute_rate: number;
    }

    interface DistributionMetrics {
      platform_concentration: ConcentrationMetric;
      geographic_concentration: ConcentrationMetric;
      temporal_concentration: ConcentrationMetric;
      revenue_concentration: ConcentrationMetric;
    }

    interface ConcentrationMetric {
      herfindahl_index: number;
      top_3_share: number;
      top_5_share: number;
      gini_coefficient: number;
      interpretation: string;
    }

    interface TimeSeriesData {
      date: Date;
      revenue: number;
      streams: number;
      territories: number;
      platforms: number;
      efficiency_metrics: Record<string, number>;
      metadata?: TimeSeriesMetadata;
    }

    interface TimeSeriesMetadata {
      data_completeness: number;
      estimated_values: string[];
      adjustments_made: string[];
      confidence_level: number;
    }

    interface AnalyticsBreakdowns {
      by_platform: PlatformBreakdown[];
      by_territory: TerritoryBreakdown[];
      by_track: TrackBreakdown[];
      by_contributor: ContributorBreakdown[];
      by_split_type: SplitTypeBreakdown[];
      by_time_period: TimeBreakdown[];
    }

    interface PlatformBreakdown {
      platform: string;
      revenue: number;
      streams: number;
      market_share: number;
      growth_rate: number;
      efficiency_score: number;
      settlement_terms: SettlementTerms;
      performance_tier: 'excellent' | 'good' | 'average' | 'poor';
    }

    interface SettlementTerms {
      payment_frequency: string;
      payment_delay_days: number;
      minimum_threshold: number;
      currency: Currency;
      fee_structure: FeeStructure;
    }

    interface FeeStructure {
      platform_percentage: number;
      processing_fee: number;
      additional_fees: Record<string, number>;
      total_fee_percentage: number;
    }

    interface TerritoryBreakdown {
      territory: string;
      revenue: number;
      streams: number;
      platforms_count: number;
      growth_rate: number;
      market_maturity: MarketMaturity;
      regulatory_environment: RegulatoryEnvironment;
    }

    interface MarketMaturity {
      maturity_level: 'emerging' | 'developing' | 'mature' | 'saturated';
      growth_potential: number;
      competition_intensity: number;
      market_size_usd: number;
    }

    interface RegulatoryEnvironment {
      copyright_protection: 'strong' | 'moderate' | 'weak';
      tax_environment: 'favorable' | 'neutral' | 'unfavorable';
      withholding_rates: number;
      reporting_requirements: 'simple' | 'moderate' | 'complex';
    }

    interface TrackBreakdown {
      track_id: string;
      track_title: string;
      revenue: number;
      streams: number;
      territories_count: number;
      platforms_count: number;
      revenue_per_stream: number;
      performance_score: number;
      lifecycle_stage: TrackLifecycleStage;
    }

    type TrackLifecycleStage = 'new' | 'growing' | 'peak' | 'mature' | 'declining' | 'catalog';

    interface ContributorBreakdown {
      contributor_id: string;
      contributor_name: string;
      role: ContributorRole;
      total_earnings: number;
      tracks_count: number;
      average_earnings_per_track: number;
      payout_frequency: number;
      payout_efficiency: number;
    }

    interface SplitTypeBreakdown {
      split_type: SplitType;
      total_amount: number;
      percentage_of_total: number;
      contributors_count: number;
      average_split_percentage: number;
      complexity_score: number;
    }

    interface TimeBreakdown {
      period: string;
      start_date: Date;
      end_date: Date;
      revenue: number;
      streams: number;
      seasonal_factor: number;
      events: string[];
      anomalies: Anomaly[];
    }

    interface Anomaly {
      type: 'spike' | 'drop' | 'trend_break' | 'outlier';
      magnitude: number;
      confidence: number;
      possible_causes: string[];
      impact: string;
    }

    // ========== Projections and Forecasting ==========

    interface RoyaltyProjections {
      revenue_forecast: ForecastData;
      streams_forecast: ForecastData;
      payout_forecast: PayoutForecast;
      scenario_analysis: ScenarioAnalysis[];
      sensitivity_analysis: SensitivityAnalysis;
      model_info: ForecastModelInfo;
    }

    interface ForecastData {
      forecasts: ForecastPoint[];
      confidence_intervals: ConfidenceInterval[];
      trend_components: TrendComponent[];
      assumptions: ForecastAssumption[];
    }

    interface ForecastPoint {
      date: Date;
      predicted_value: number;
      lower_bound: number;
      upper_bound: number;
      confidence: number;
      contributing_factors: ContributingFactor[];
    }

    interface ContributingFactor {
      factor: string;
      contribution: number;
      confidence: number;
      trend: 'positive' | 'negative' | 'neutral';
    }

    interface ConfidenceInterval {
      date: Date;
      confidence_level: number;
      lower_bound: number;
      upper_bound: number;
      interval_width: number;
    }

    interface TrendComponent {
      component_type: 'trend' | 'seasonal' | 'cyclical' | 'irregular';
      strength: number;
      period?: number;
      phase?: number;
      description: string;
    }

    interface ForecastAssumption {
      assumption: string;
      value: any;
      confidence: number;
      impact_if_wrong: ImpactAnalysis;
      source: string;
    }

    interface ImpactAnalysis {
      potential_variance: number;
      worst_case_scenario: number;
      best_case_scenario: number;
      mitigation_strategies: string[];
    }

    interface PayoutForecast {
      scheduled_payouts: ScheduledPayout[];
      projected_cash_flow: CashFlowProjection[];
      liquidity_requirements: LiquidityRequirement[];
      optimization_opportunities: OptimizationOpportunity[];
    }

    interface ScheduledPayout {
      payout_date: Date;
      estimated_amount: number;
      contributor_count: number;
      currency_breakdown: Record<Currency, number>;
      confidence: number;
      risk_factors: string[];
    }

    interface CashFlowProjection {
      date: Date;
      incoming_revenue: number;
      outgoing_payouts: number;
      net_cash_flow: number;
      cumulative_balance: number;
      working_capital_requirement: number;
    }

    interface LiquidityRequirement {
      date: Date;
      minimum_balance_required: number;
      actual_projected_balance: number;
      surplus_deficit: number;
      risk_level: 'low' | 'medium' | 'high' | 'critical';
      recommended_actions: string[];
    }

    interface OptimizationOpportunity {
      opportunity_type: string;
      description: string;
      estimated_savings: number;
      implementation_effort: 'low' | 'medium' | 'high';
      timeline: string;
      success_probability: number;
    }

    interface ScenarioAnalysis {
      scenario_name: string;
      description: string;
      probability: number;
      assumptions: ScenarioAssumption[];
      outcomes: ScenarioOutcome[];
      risk_mitigation: RiskMitigation[];
    }

    interface ScenarioAssumption {
      parameter: string;
      base_case_value: any;
      scenario_value: any;
      variance_percentage: number;
      justification: string;
    }

    interface ScenarioOutcome {
      metric: string;
      base_case_value: number;
      scenario_value: number;
      impact_percentage: number;
      impact_description: string;
    }

    interface RiskMitigation {
      risk: string;
      mitigation_strategy: string;
      effectiveness: number;
      cost: number;
      timeline: string;
    }

    interface SensitivityAnalysis {
      sensitive_parameters: SensitiveParameter[];
      tornado_chart_data: TornadoChartData[];
      parameter_interactions: ParameterInteraction[];
      optimization_insights: OptimizationInsight[];
    }

    interface SensitiveParameter {
      parameter: string;
      base_value: number;
      sensitivity_coefficient: number;
      impact_range: [number, number];
      controllability: 'high' | 'medium' | 'low' | 'none';
    }

    interface TornadoChartData {
      parameter: string;
      low_impact: number;
      high_impact: number;
      impact_range: number;
      rank: number;
    }

    interface ParameterInteraction {
      parameter_a: string;
      parameter_b: string;
      interaction_coefficient: number;
      interaction_type: 'synergistic' | 'antagonistic' | 'independent';
      combined_impact: number;
    }

    interface OptimizationInsight {
      insight: string;
      potential_improvement: number;
      required_changes: RequiredChange[];
      feasibility: number;
      priority: 'low' | 'medium' | 'high' | 'critical';
    }

    interface RequiredChange {
      parameter: string;
      current_value: any;
      target_value: any;
      change_difficulty: 'easy' | 'medium' | 'hard' | 'very_hard';
      expected_impact: number;
    }

    interface ForecastModelInfo {
      model_type: string;
      model_version: string;
      training_period: ReportPeriod;
      accuracy_metrics: ForecastAccuracy;
      last_updated: Date;
      next_update_scheduled: Date;
      features_used: string[];
      data_sources: string[];
    }

    interface ForecastAccuracy {
      mean_absolute_error: number;
      mean_squared_error: number;
      mean_absolute_percentage_error: number;
      r_squared: number;
      directional_accuracy: number;
      hit_rate: number;
    }

    // ========== Benchmarking ==========

    interface RoyaltyBenchmarks {
      industry_benchmarks: IndustryBenchmark[];
      peer_comparisons: PeerComparison[];
      historical_performance: HistoricalBenchmark[];
      best_practices: BestPractice[];
      improvement_opportunities: ImprovementOpportunity[];
    }

    interface IndustryBenchmark {
      metric: string;
      industry_average: number;
      industry_median: number;
      top_quartile: number;
      bottom_quartile: number;
      your_value: number;
      percentile_rank: number;
      interpretation: string;
      data_source: string;
      last_updated: Date;
    }

    interface PeerComparison {
      peer_group: string;
      peer_group_size: number;
      metrics_comparison: MetricComparison[];
      relative_position: RelativePosition;
      competitive_advantages: string[];
      areas_for_improvement: string[];
    }

    interface MetricComparison {
      metric: string;
      your_value: number;
      peer_average: number;
      peer_median: number;
      best_in_group: number;
      worst_in_group: number;
      standard_deviation: number;
      z_score: number;
    }

    interface RelativePosition {
      overall_rank: number;
      overall_percentile: number;
      strengths: string[];
      weaknesses: string[];
      opportunities: string[];
      threats: string[];
    }

    interface HistoricalBenchmark {
      metric: string;
      time_periods: HistoricalPeriod[];
      trend_analysis: TrendAnalysis;
      performance_consistency: PerformanceConsistency;
      milestone_achievements: Milestone[];
    }

    interface HistoricalPeriod {
      period: string;
      start_date: Date;
      end_date: Date;
      value: number;
      context: string[];
      notable_events: string[];
    }

    interface TrendAnalysis {
      overall_trend: 'improving' | 'stable' | 'declining';
      trend_strength: number;
      trend_consistency: number;
      inflection_points: InflectionPoint[];
      cyclical_patterns: CyclicalPattern[];
    }

    interface InflectionPoint {
      date: Date;
      description: string;
      impact_magnitude: number;
      duration: number;
      recovery_time?: number;
    }

    interface CyclicalPattern {
      pattern_name: string;
      period_length: number;
      amplitude: number;
      phase_offset: number;
      confidence: number;
    }

    interface PerformanceConsistency {
      consistency_score: number;
      volatility: number;
      predictability: number;
      reliability_rating: 'very_high' | 'high' | 'medium' | 'low' | 'very_low';
    }

    interface Milestone {
      milestone_name: string;
      achievement_date: Date;
      milestone_value: number;
      significance: string;
      contributing_factors: string[];
    }

    interface BestPractice {
      practice_area: string;
      practice_description: string;
      implementation_difficulty: 'easy' | 'medium' | 'hard';
      estimated_impact: number;
      success_rate: number;
      case_studies: CaseStudy[];
      implementation_guide: ImplementationStep[];
    }

    interface CaseStudy {
      organization: string;
      situation: string;
      implementation: string;
      results: string;
      lessons_learned: string[];
      applicability_score: number;
    }

    interface ImplementationStep {
      step_number: number;
      description: string;
      estimated_duration: string;
      required_resources: string[];
      success_criteria: string[];
      common_pitfalls: string[];
    }

    interface ImprovementOpportunity {
      opportunity_area: string;
      current_performance: number;
      target_performance: number;
      improvement_potential: number;
      priority_score: number;
      implementation_plan: ImplementationPlan;
      risk_assessment: RiskAssessment;
    }

    interface ImplementationPlan {
      phases: ImplementationPhase[];
      total_duration: string;
      total_cost_estimate: number;
      resource_requirements: ResourceRequirement[];
      success_metrics: string[];
    }

    interface ImplementationPhase {
      phase_name: string;
      duration: string;
      deliverables: string[];
      dependencies: string[];
      risks: string[];
      success_criteria: string[];
    }

    interface ResourceRequirement {
      resource_type: string;
      quantity: number;
      duration: string;
      cost_estimate: number;
      criticality: 'essential' | 'important' | 'nice_to_have';
    }

    interface RiskAssessment {
      risks: IdentifiedRisk[];
      overall_risk_level: 'low' | 'medium' | 'high' | 'very_high';
      risk_mitigation_cost: number;
      probability_of_success: number;
      contingency_plans: ContingencyPlan[];
    }

    interface IdentifiedRisk {
      risk_description: string;
      probability: number;
      impact: number;
      risk_score: number;
      mitigation_strategies: string[];
      contingency_actions: string[];
    }

    interface ContingencyPlan {
      trigger_conditions: string[];
      response_actions: string[];
      responsible_parties: string[];
      activation_timeline: string;
    }

    // ========== Insights and Intelligence ==========

    interface RoyaltyInsight {
      insight_id: string;
      insight_type: InsightType;
      category: InsightCategory;
      priority: InsightPriority;
      title: string;
      description: string;
      supporting_evidence: Evidence[];
      financial_impact: FinancialImpact;
      recommendations: Recommendation[];
      confidence_level: number;
      expiration_date?: Date;
      created_at: Date;
    }

    type InsightType = 
      | 'revenue_optimization' 
      | 'cost_reduction' 
      | 'risk_mitigation' 
      | 'market_opportunity' 
      | 'operational_efficiency'
      | 'compliance_issue' 
      | 'forecasting_update' 
      | 'anomaly_detection' 
      | 'trend_identification';

    type InsightCategory = 
      | 'financial' 
      | 'operational' 
      | 'strategic' 
      | 'compliance' 
      | 'market' 
      | 'technology' 
      | 'risk_management';

    type InsightPriority = 'low' | 'medium' | 'high' | 'critical' | 'urgent';

    interface Evidence {
      evidence_type: 'metric' | 'trend' | 'comparison' | 'correlation' | 'external_data';
      description: string;
      data_points: DataPoint[];
      strength: number;
      reliability: number;
    }

    interface DataPoint {
      metric: string;
      value: number;
      context: string;
      timestamp: Date;
      source: string;
    }

    interface FinancialImpact {
      impact_type: 'revenue_increase' | 'cost_reduction' | 'risk_mitigation' | 'efficiency_gain';
      estimated_impact: number;
      impact_timeframe: string;
      confidence_interval: [number, number];
      assumptions: string[];
      sensitivity_factors: string[];
    }

    interface Recommendation {
      recommendation_id: string;
      title: string;
      description: string;
      action_items: ActionItem[];
      priority: 'low' | 'medium' | 'high' | 'urgent';
      estimated_effort: EffortEstimate;
      expected_outcomes: ExpectedOutcome[];
      success_metrics: SuccessMetric[];
      risks_and_mitigations: RiskMitigation[];
    }

    interface ActionItem {
      action: string;
      responsible_party: string;
      due_date?: Date;
      estimated_hours: number;
      dependencies: string[];
      deliverables: string[];
    }

    interface EffortEstimate {
      time_investment: string;
      resource_requirements: string[];
      complexity_level: 'low' | 'medium' | 'high' | 'very_high';
      skill_requirements: string[];
    }

    interface ExpectedOutcome {
      outcome_description: string;
      quantified_benefit: number;
      benefit_type: string;
      realization_timeframe: string;
      certainty_level: number;
    }

    interface SuccessMetric {
      metric_name: string;
      current_baseline: number;
      target_value: number;
      measurement_frequency: string;
      tracking_method: string;
    }

    // ========== Utility Types ==========

    type Currency = 'USD' | 'EUR' | 'GBP' | 'JPY' | 'CAD' | 'AUD' | 'CHF' | 'CNY' | 'INR' | 'BRL' | 'MXN' | 'KRW' | 'SEK' | 'NOK' | 'DKK' | 'PLN' | 'CZK' | 'HUF' | 'RON' | 'BGN' | 'HRK' | 'RUB' | 'TRY' | 'ZAR' | 'SGD' | 'HKD' | 'THB' | 'MYR' | 'IDR' | 'PHP' | 'VND' | 'NZD';

    interface CurrencyInfo {
      code: Currency;
      name: string;
      symbol: string;
      decimal_places: number;
      is_crypto: boolean;
      exchange_rate_to_usd?: number;
      last_updated?: Date;
    }

    interface DateRange {
      start: Date;
      end: Date;
      timezone?: string;
      include_partial_periods?: boolean;
    }

    interface FilterOptions {
      platforms?: string[];
      territories?: string[];
      currencies?: Currency[];
      contributors?: string[];
      tracks?: string[];
      releases?: string[];
      date_range?: DateRange;
      amount_range?: AmountRange;
      status_filter?: string[];
    }

    interface AmountRange {
      min_amount?: number;
      max_amount?: number;
      currency?: Currency;
    }

    interface SortOptions {
      field: string;
      direction: 'asc' | 'desc';
      secondary_sort?: {
        field: string;
        direction: 'asc' | 'desc';
      };
    }

    interface PaginationOptions {
      page: number;
      per_page: number;
      total?: number;
      max_per_page?: number;
    }

    interface ExportOptions {
      format: 'csv' | 'xlsx' | 'json' | 'xml' | 'pdf';
      include_raw_data: boolean;
      include_calculations: boolean;
      include_metadata: boolean;
      currency_conversion?: Currency;
      date_format?: string;
      number_format?: string;
    }

    interface AuditTrail {
      action: string;
      performed_by: string;
      performed_at: Date;
      changes: ChangeRecord[];
      ip_address?: string;
      user_agent?: string;
      session_id?: string;
    }

    interface ChangeRecord {
      field: string;
      old_value: any;
      new_value: any;
      change_type: 'create' | 'update' | 'delete';
      reason?: string;
    }
  }
}

export {};
