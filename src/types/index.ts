// Core User and Authentication Types
export interface User {
  id: string;
  email: string;
  username: string;
  first_name?: string;
  last_name?: string;
  role: 'user' | 'artist' | 'label' | 'admin';
  module_access: 'music' | 'publishing' | 'both';
  is_verified: boolean;
  profile_id?: string;
  created_at: string;
  updated_at: string;
}

export interface UserProfile {
  id: string;
  user_id: string;
  display_name: string;
  bio?: string;
  profile_picture_url?: string;
  banner_image_url?: string;
  social_links?: Record<string, string>;
  location?: string;
  website?: string;
  genre_preferences?: string[];
  is_public: boolean;
  metadata?: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface AuthCredentials {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: User;
  token: string;
  profile?: UserProfile;
}

// Music Release and Track Types
export interface Release {
  id: string;
  user_id: string;
  title: string;
  artist_name: string;
  release_type: 'single' | 'ep' | 'album' | 'compilation';
  release_date?: string;
  label?: string;
  genre?: string;
  description?: string;
  artwork_url?: string;
  upc?: string;
  isrc_prefix?: string;
  status: 'draft' | 'pending' | 'approved' | 'released' | 'rejected';
  metadata?: Record<string, any>;
  created_at: string;
  updated_at: string;
  tracks?: Track[];
}

export interface Track {
  id: string;
  release_id: string;
  title: string;
  duration?: number;
  track_number: number;
  isrc?: string;
  file_url?: string;
  preview_url?: string;
  lyrics?: string;
  explicit: boolean;
  metadata?: Record<string, any>;
  created_at: string;
  updated_at: string;
}

// Distribution Types
export interface DistributionPlatform {
  id: string;
  name: string;
  display_name: string;
  api_endpoint?: string;
  supported_formats: string[];
  metadata_requirements: Record<string, any>;
  is_active: boolean;
  integration_config?: Record<string, any>;
}

export interface UserDistributionConnection {
  id: string;
  user_id: string;
  platform_id: string;
  platform_user_id: string;
  access_token?: string;
  refresh_token?: string;
  connection_status: 'connected' | 'disconnected' | 'error' | 'pending';
  last_sync_at?: string;
  metadata?: Record<string, any>;
  created_at: string;
  updated_at: string;
  platform?: DistributionPlatform;
}

export interface ReleaseDistribution {
  id: string;
  release_id: string;
  platform_id: string;
  platform_release_id?: string;
  distribution_status: 'pending' | 'processing' | 'live' | 'failed' | 'removed';
  submitted_at: string;
  live_date?: string;
  platform_url?: string;
  error_message?: string;
  metadata?: Record<string, any>;
  platform?: DistributionPlatform;
}

// Financial Types
export interface RevenueStream {
  id: string;
  release_id?: string;
  track_id?: string;
  platform_id: string;
  stream_type: 'streaming' | 'download' | 'sync' | 'performance' | 'mechanical';
  amount: number;
  currency: string;
  reporting_period_start: string;
  reporting_period_end: string;
  quantity?: number;
  country?: string;
  metadata?: Record<string, any>;
  created_at: string;
}

export interface RoyaltySplit {
  id: string;
  release_id?: string;
  track_id?: string;
  recipient_user_id: string;
  split_type: 'master' | 'publishing' | 'performance' | 'sync';
  percentage: number;
  is_active: boolean;
  effective_date: string;
  end_date?: string;
  metadata?: Record<string, any>;
}

export interface Payout {
  id: string;
  user_id: string;
  amount: number;
  currency: string;
  payout_method: 'bank_transfer' | 'paypal' | 'crypto' | 'check';
  payout_status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';
  scheduled_date: string;
  completed_date?: string;
  reference_number?: string;
  fee_amount?: number;
  metadata?: Record<string, any>;
  created_at: string;
}

// Analytics Types
export interface AnalyticsData {
  id: string;
  entity_type: 'release' | 'track' | 'user';
  entity_id: string;
  metric_type: string;
  metric_value: number;
  dimensions?: Record<string, any>;
  timestamp: string;
  created_at: string;
}

// Publishing Types (for Publishing Module)
export interface Publication {
  id: string;
  user_id: string;
  title: string;
  publication_type: 'book' | 'magazine' | 'article' | 'blog' | 'newsletter';
  status: 'draft' | 'review' | 'published' | 'archived';
  description?: string;
  cover_image_url?: string;
  isbn?: string;
  language: string;
  category?: string;
  tags?: string[];
  price?: number;
  currency?: string;
  publication_date?: string;
  metadata?: Record<string, any>;
  created_at: string;
  updated_at: string;
  chapters?: Chapter[];
}

export interface Chapter {
  id: string;
  publication_id: string;
  title: string;
  content: string;
  chapter_number: number;
  word_count?: number;
  is_published: boolean;
  preview_enabled: boolean;
  metadata?: Record<string, any>;
  created_at: string;
  updated_at: string;
}

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: Record<string, string[]>;
}

export interface PaginatedResponse<T = any> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

// Form Types
export interface CreateReleaseFormData {
  title: string;
  artist_name: string;
  release_type: 'single' | 'ep' | 'album' | 'compilation';
  release_date?: string;
  label?: string;
  genre?: string;
  description?: string;
  artwork_file?: globalThis.File;
}

export interface CreateTrackFormData {
  title: string;
  duration?: number;
  track_number: number;
  explicit: boolean;
  lyrics?: string;
  audio_file?: globalThis.File;
}

export interface CreatePublicationFormData {
  title: string;
  publication_type: 'book' | 'magazine' | 'article' | 'blog' | 'newsletter';
  description?: string;
  language: string;
  category?: string;
  tags?: string[];
  price?: number;
  currency?: string;
  cover_image_file?: globalThis.File;
}

// Error Types
export interface ApiError {
  message: string;
  code?: string;
  details?: Record<string, any>;
}

// Notification Types
export interface Notification {
  id: string;
  user_id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  is_read: boolean;
  action_url?: string;
  metadata?: Record<string, any>;
  created_at: string;
}

// Search and Filter Types
export interface SearchFilters {
  query?: string;
  genre?: string;
  release_type?: string;
  status?: string;
  date_from?: string;
  date_to?: string;
  page?: number;
  limit?: number;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
}

// File Upload Types
export interface FileUploadResponse {
  file_url: string;
  file_size: number;
  file_type: string;
  metadata?: Record<string, any>;
}

export interface S3PresignedUrlResponse {
  presigned_url: string;
  file_url: string;
  upload_fields?: Record<string, string>;
}

// Collaboration Types
export interface CollaborationRequest {
  id: string;
  release_id: string;
  requester_user_id: string;
  target_user_id: string;
  collaboration_type: 'feature' | 'remix' | 'co_write' | 'production';
  status: 'pending' | 'accepted' | 'declined' | 'cancelled';
  message?: string;
  proposed_split?: number;
  metadata?: Record<string, any>;
  created_at: string;
  updated_at: string;
}

// Playlist Types
export interface Playlist {
  id: string;
  user_id: string;
  name: string;
  description?: string;
  is_public: boolean;
  cover_image_url?: string;
  track_count: number;
  total_duration?: number;
  metadata?: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface PlaylistTrack {
  id: string;
  playlist_id: string;
  track_id: string;
  position: number;
  added_at: string;
  track?: Track;
}
