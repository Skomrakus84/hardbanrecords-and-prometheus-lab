/**
 * Global TypeScript definitions for Music Distribution Module
 * Comprehensive type definitions for all music-related entities and operations
 */

declare global {
  namespace Music {
    // ========== Core Entity Types ==========
    
    interface Artist {
      id: string;
      name: string;
      slug: string;
      bio?: string;
      profile_image?: string;
      banner_image?: string;
      social_links?: SocialLinks;
      verification_status: VerificationStatus;
      verification_badges: VerificationBadge[];
      contact_info?: ContactInfo;
      legal_info?: LegalInfo;
      settings?: ArtistSettings;
      stats?: ArtistStats;
      created_at: Date;
      updated_at: Date;
      created_by: string;
    }

    interface Release {
      id: string;
      title: string;
      type: ReleaseType;
      status: ReleaseStatus;
      upc?: string;
      artwork_url?: string;
      release_date: Date;
      original_release_date?: Date;
      recording_year?: number;
      genre_primary: string;
      genre_secondary?: string;
      label?: string;
      copyright_notice?: string;
      phonographic_copyright?: string;
      description?: string;
      language: string;
      explicit: boolean;
      metadata?: ReleaseMetadata;
      distribution_settings?: DistributionSettings;
      tracks: Track[];
      contributors: ReleaseContributor[];
      created_at: Date;
      updated_at: Date;
      created_by: string;
    }

    interface Track {
      id: string;
      title: string;
      duration?: number;
      isrc?: string;
      explicit: boolean;
      genre_primary: string;
      genre_secondary?: string;
      mood?: string;
      language: string;
      tempo?: number;
      key_signature?: string;
      release_id: string;
      track_number?: number;
      disc_number: number;
      preview_start?: number;
      preview_length: number;
      lyrics?: string;
      instrumental: boolean;
      audio_quality?: AudioQuality;
      file_size?: number;
      file_format?: string;
      sample_rate?: number;
      bit_depth?: number;
      processing_status: ProcessingStatus;
      waveform_data?: WaveformData;
      analysis_data?: AudioAnalysis;
      contributors: TrackContributor[];
      files: TrackFile[];
      created_at: Date;
      updated_at: Date;
      created_by: string;
    }

    // ========== Enums and Status Types ==========
    
    type ReleaseType = 'single' | 'ep' | 'album' | 'compilation' | 'remix' | 'live' | 'soundtrack';
    type ReleaseStatus = 'draft' | 'pending_review' | 'approved' | 'distributed' | 'live' | 'rejected' | 'archived';
    type ProcessingStatus = 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';
    type VerificationStatus = 'unverified' | 'pending' | 'verified' | 'rejected';
    type AudioQuality = 'low' | 'medium' | 'high' | 'lossless';
    type ContributorRole = 'artist' | 'featured_artist' | 'composer' | 'lyricist' | 'producer' | 'mixer' | 'engineer' | 'remixer';
    type SplitType = 'publishing' | 'recording' | 'performance' | 'sync';
    type PaymentProvider = 'stripe' | 'paypal' | 'wise' | 'bank_transfer';
    type PaymentMethodType = 'bank_account' | 'paypal' | 'stripe' | 'wise' | 'crypto';
    type PayoutStatus = 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled' | 'refunded';
    type NotificationChannel = 'email' | 'push' | 'sms' | 'in_app';
    type NotificationPriority = 'low' | 'normal' | 'high' | 'urgent';

    // ========== Complex Data Types ==========

    interface SocialLinks {
      website?: string;
      facebook?: string;
      instagram?: string;
      twitter?: string;
      youtube?: string;
      spotify?: string;
      apple_music?: string;
      soundcloud?: string;
      bandcamp?: string;
      tiktok?: string;
    }

    interface ContactInfo {
      email?: string;
      phone?: string;
      address?: Address;
      booking_email?: string;
      management_email?: string;
      press_email?: string;
    }

    interface Address {
      street: string;
      city: string;
      state?: string;
      postal_code: string;
      country: string;
    }

    interface LegalInfo {
      legal_name?: string;
      tax_id?: string;
      business_type?: string;
      registration_country?: string;
      contracts?: ContractInfo[];
    }

    interface ContractInfo {
      type: string;
      start_date: Date;
      end_date?: Date;
      terms?: Record<string, any>;
    }

    interface ArtistSettings {
      public_profile: boolean;
      allow_collaborations: boolean;
      auto_approve_releases: boolean;
      notification_preferences: NotificationPreferences;
      privacy_settings: PrivacySettings;
    }

    interface ArtistStats {
      total_releases: number;
      total_tracks: number;
      total_streams: number;
      total_revenue: number;
      monthly_listeners: number;
      followers: number;
      last_release_date?: Date;
    }

    interface VerificationBadge {
      type: string;
      verified_at: Date;
      verified_by: string;
      expires_at?: Date;
    }

    interface ReleaseMetadata {
      recording_location?: string;
      mastering_engineer?: string;
      producer?: string;
      additional_credits?: AdditionalCredit[];
      notes?: string;
      tags?: string[];
    }

    interface AdditionalCredit {
      name: string;
      role: string;
      contribution?: string;
    }

    interface DistributionSettings {
      platforms: DistributionPlatform[];
      territories: string[];
      release_strategy: ReleaseStrategy;
      pricing: PricingSettings;
      ugc_policy: UGCPolicySettings;
    }

    interface DistributionPlatform {
      name: string;
      enabled: boolean;
      settings?: Record<string, any>;
      release_date?: Date;
      status?: string;
    }

    interface ReleaseStrategy {
      type: 'immediate' | 'scheduled' | 'tiered';
      schedule?: ReleaseSchedule[];
    }

    interface ReleaseSchedule {
      platforms: string[];
      territories: string[];
      release_date: Date;
    }

    interface PricingSettings {
      album_price?: number;
      track_price?: number;
      preview_allowed: boolean;
      free_download: boolean;
    }

    interface UGCPolicySettings {
      content_id_enabled: boolean;
      monetization_policy: 'block' | 'monetize' | 'track';
      whitelist_channels?: string[];
    }

    interface ReleaseContributor {
      id: string;
      name: string;
      role: ContributorRole;
      primary: boolean;
      split_percentage?: number;
      pro_affiliation?: string;
      ipi_number?: string;
    }

    interface TrackContributor {
      id: string;
      track_id: string;
      name: string;
      role: ContributorRole;
      split_percentage: number;
      split_type: SplitType;
      primary: boolean;
      pro_affiliation?: string;
      ipi_number?: string;
      contact_info?: ContactInfo;
    }

    interface TrackFile {
      id: string;
      track_id: string;
      filename: string;
      format: string;
      quality: AudioQuality;
      file_size: number;
      sample_rate: number;
      bit_depth: number;
      duration: number;
      checksum: string;
      storage_path: string;
      download_url: string;
      created_at: Date;
    }

    interface WaveformData {
      peaks: number[];
      length: number;
      sample_rate: number;
      samples_per_pixel: number;
    }

    interface AudioAnalysis {
      loudness: number;
      dynamic_range: number;
      tempo: number;
      key: string;
      energy: number;
      danceability: number;
      valence: number;
      acousticness: number;
      instrumentalness: number;
      spectral_features?: SpectralFeatures;
    }

    interface SpectralFeatures {
      mfcc: number[];
      spectral_centroid: number;
      spectral_rolloff: number;
      zero_crossing_rate: number;
    }

    // ========== Financial Types ==========

    interface RoyaltyStatement {
      id: string;
      platform: string;
      report_period_start: Date;
      report_period_end: Date;
      currency: string;
      total_streams: number;
      total_revenue: number;
      processing_fee: number;
      exchange_rate: number;
      status: 'pending' | 'validated' | 'processed' | 'disputed';
      validation_errors?: string[];
      raw_data: Record<string, any>;
      source_file?: string;
      imported_at: Date;
      imported_by: string;
      processed_at?: Date;
    }

    interface RoyaltyCalculation {
      id: string;
      statement_id: string;
      track_id: string;
      release_id: string;
      territory: string;
      streams: number;
      downloads: number;
      revenue_gross: number;
      revenue_net: number;
      rate_per_stream: number;
      rate_per_download: number;
      usage_type: string;
      splits: RoyaltySplit[];
      calculated_at: Date;
      calculated_by: string;
    }

    interface RoyaltySplit {
      id: string;
      calculation_id: string;
      contributor_id: string;
      percentage: number;
      amount: number;
      split_type: SplitType;
      payout_status: PayoutStatus;
      payout_id?: string;
    }

    interface PayoutRequest {
      id: string;
      recipient_id: string;
      amount: number;
      currency: string;
      payment_method_id: string;
      payout_type: 'manual' | 'automatic' | 'scheduled';
      description?: string;
      reference_id?: string;
      transaction_id?: string;
      status: PayoutStatus;
      scheduled_for?: Date;
      processed_at?: Date;
      priority: 'low' | 'normal' | 'high' | 'urgent';
      metadata: Record<string, any>;
      error_message?: string;
      retry_count: number;
      created_at: Date;
      updated_at: Date;
      requested_by: string;
      processed_by?: string;
    }

    interface PaymentMethod {
      id: string;
      user_id: string;
      type: PaymentMethodType;
      provider: PaymentProvider;
      details: Record<string, any>;
      masked_details: Record<string, any>;
      is_default: boolean;
      verified: boolean;
      verification_status: string;
      last_used_at?: Date;
      metadata: Record<string, any>;
      created_at: Date;
      updated_at: Date;
    }

    // ========== Analytics Types ==========

    interface AnalyticsData {
      streams: StreamingAnalytics;
      revenue: RevenueAnalytics;
      audience: AudienceAnalytics;
      performance: PerformanceAnalytics;
      trends: TrendAnalytics;
    }

    interface StreamingAnalytics {
      total_streams: number;
      unique_listeners: number;
      by_platform: PlatformStats[];
      by_territory: TerritoryStats[];
      by_track: TrackStats[];
      growth_rate: number;
      period_comparison: PeriodComparison;
    }

    interface RevenueAnalytics {
      total_revenue: number;
      streaming_revenue: number;
      download_revenue: number;
      sync_revenue: number;
      by_platform: PlatformRevenue[];
      by_territory: TerritoryRevenue[];
      projections: RevenueProjection[];
      growth_rate: number;
    }

    interface AudienceAnalytics {
      demographics: Demographics;
      listening_behavior: ListeningBehavior;
      top_cities: CityStats[];
      device_usage: DeviceStats[];
      discovery_sources: DiscoverySource[];
    }

    interface PerformanceAnalytics {
      completion_rate: number;
      skip_rate: number;
      repeat_rate: number;
      playlist_additions: number;
      social_shares: number;
      engagement_score: number;
    }

    interface TrendAnalytics {
      viral_coefficient: number;
      momentum_score: number;
      seasonal_patterns: SeasonalPattern[];
      predictive_insights: PredictiveInsight[];
    }

    interface PlatformStats {
      platform: string;
      streams: number;
      listeners: number;
      growth_rate: number;
    }

    interface TerritoryStats {
      territory: string;
      streams: number;
      listeners: number;
      market_share: number;
    }

    interface TrackStats {
      track_id: string;
      track_title: string;
      streams: number;
      completion_rate: number;
      skip_rate: number;
    }

    interface Demographics {
      age_groups: AgeGroupStats[];
      gender_distribution: GenderStats;
      location_distribution: LocationStats[];
    }

    interface AgeGroupStats {
      age_range: string;
      percentage: number;
      streams: number;
    }

    interface GenderStats {
      male: number;
      female: number;
      other: number;
      unknown: number;
    }

    interface LocationStats {
      country: string;
      streams: number;
      percentage: number;
    }

    // ========== Notification Types ==========

    interface NotificationPreferences {
      channels: NotificationChannelSettings;
      frequency: NotificationFrequency;
      categories: NotificationCategorySettings;
      quiet_hours: QuietHours;
      timezone: string;
    }

    interface NotificationChannelSettings {
      email: boolean;
      push: boolean;
      sms: boolean;
      in_app: boolean;
    }

    interface NotificationFrequency {
      digest: 'immediate' | 'hourly' | 'daily' | 'weekly';
      marketing: 'never' | 'weekly' | 'monthly';
      updates: 'immediate' | 'daily';
    }

    interface NotificationCategorySettings {
      releases: boolean;
      royalties: boolean;
      payouts: boolean;
      analytics: boolean;
      collaboration: boolean;
      marketing: boolean;
      system: boolean;
    }

    interface QuietHours {
      enabled: boolean;
      start_time: string;
      end_time: string;
    }

    interface Notification {
      id: string;
      recipient_id: string;
      type: string;
      channel: NotificationChannel;
      priority: NotificationPriority;
      title: string;
      message: string;
      data: Record<string, any>;
      action_buttons?: NotificationAction[];
      read: boolean;
      clicked: boolean;
      scheduled_for?: Date;
      sent_at?: Date;
      read_at?: Date;
      clicked_at?: Date;
      metadata: Record<string, any>;
      created_at: Date;
    }

    interface NotificationAction {
      label: string;
      action: string;
      url?: string;
      style: 'primary' | 'secondary' | 'danger';
    }

    // ========== API Response Types ==========

    interface APIResponse<T = any> {
      success: boolean;
      data?: T;
      message?: string;
      errors?: string[];
      pagination?: Pagination;
      meta?: Record<string, any>;
    }

    interface Pagination {
      current_page: number;
      per_page: number;
      total: number;
      total_pages: number;
      has_next: boolean;
      has_prev: boolean;
    }

    interface SearchFilters {
      query?: string;
      genres?: string[];
      release_types?: ReleaseType[];
      date_range?: DateRange;
      explicit?: boolean;
      verified_only?: boolean;
      platforms?: string[];
      territories?: string[];
    }

    interface DateRange {
      start: Date;
      end: Date;
    }

    interface SortOptions {
      field: string;
      direction: 'asc' | 'desc';
    }

    // ========== Integration Types ==========

    interface PlatformIntegration {
      platform: string;
      enabled: boolean;
      credentials: Record<string, any>;
      settings: Record<string, any>;
      last_sync: Date;
      sync_status: 'success' | 'error' | 'pending';
      error_message?: string;
    }

    interface WebhookPayload {
      event: string;
      data: Record<string, any>;
      timestamp: Date;
      signature: string;
      platform: string;
    }

    // ========== Utility Types ==========

    interface PrivacySettings {
      profile_visibility: 'public' | 'private' | 'limited';
      show_streaming_stats: boolean;
      show_revenue_stats: boolean;
      allow_collaboration_requests: boolean;
      data_sharing_consent: boolean;
    }

    interface PeriodComparison {
      current_period: number;
      previous_period: number;
      change_percentage: number;
      change_direction: 'up' | 'down' | 'stable';
    }

    interface PlatformRevenue {
      platform: string;
      revenue: number;
      streams: number;
      rate: number;
    }

    interface TerritoryRevenue {
      territory: string;
      revenue: number;
      streams: number;
      market_share: number;
    }

    interface RevenueProjection {
      date: Date;
      projected_revenue: number;
      confidence_level: number;
    }

    interface ListeningBehavior {
      average_session_duration: number;
      tracks_per_session: number;
      peak_listening_hours: number[];
      preferred_devices: string[];
    }

    interface CityStats {
      city: string;
      country: string;
      streams: number;
      percentage: number;
    }

    interface DeviceStats {
      device_type: string;
      usage_percentage: number;
      streams: number;
    }

    interface DiscoverySource {
      source: string;
      percentage: number;
      streams: number;
    }

    interface SeasonalPattern {
      period: string;
      multiplier: number;
      confidence: number;
    }

    interface PredictiveInsight {
      type: string;
      description: string;
      confidence: number;
      recommended_action?: string;
    }
  }
}

export {};
