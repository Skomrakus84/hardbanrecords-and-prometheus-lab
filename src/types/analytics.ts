// Analytics types for real-time music platform insights
export interface StreamingData {
  platform: string;
  streams: number;
  revenue: number;
  change24h: number;
  changePercent: number;
}

export interface RevenueData {
  date: string;
  spotify: number;
  appleMusic: number;
  youtube: number;
  other: number;
  total: number;
}

export interface GeographicData {
  country: string;
  countryCode: string;
  streams: number;
  revenue: number;
  percentage: number;
}

export interface DemographicData {
  ageGroup: string;
  percentage: number;
  streams: number;
  gender: {
    male: number;
    female: number;
    other: number;
  };
}

export interface AnalyticsOverview {
  totalStreams: number;
  totalRevenue: number;
  monthlyGrowth: number;
  activeReleases: number;
  topTrack: {
    title: string;
    artist: string;
    streams: number;
  };
}

export interface AnalyticsStore {
  // Data
  overview: AnalyticsOverview | null;
  streamingData: StreamingData[];
  revenueData: RevenueData[];
  geographicData: GeographicData[];
  demographicData: DemographicData[] | null;

  // Loading states
  isLoading: boolean;
  error: string | null;

  // Actions
  fetchAnalyticsOverview: (period?: TimePeriod) => Promise<void>;
  fetchStreamingData: (period?: TimePeriod) => Promise<void>;
  fetchRevenueData: (period?: TimePeriod) => Promise<void>;
  fetchGeographicData: (period?: TimePeriod) => Promise<void>;
  fetchDemographicData: (period?: TimePeriod) => Promise<void>;
  setError: (error: string | null) => void;
  clearError: () => void;
}

export const platforms = [
  { id: 'spotify', name: 'Spotify', color: '#1DB954', icon: '🎵' },
  { id: 'apple-music', name: 'Apple Music', color: '#FC3C44', icon: '🍎' },
  { id: 'youtube-music', name: 'YouTube Music', color: '#FF0000', icon: '📺' },
  { id: 'amazon-music', name: 'Amazon Music', color: '#FF9900', icon: '🛒' },
  { id: 'deezer', name: 'Deezer', color: '#FEAA2D', icon: '🎶' },
  { id: 'tidal', name: 'Tidal', color: '#000000', icon: '🌊' },
] as const;
