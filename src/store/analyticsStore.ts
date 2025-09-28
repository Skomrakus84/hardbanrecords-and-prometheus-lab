import { create } from 'zustand';
import { AnalyticsOverview, StreamingData, RevenueData, GeographicData, DemographicData, AnalyticsStore } from '../types/analytics';

export const useAnalyticsStore = create<AnalyticsStore>((set) => ({
  overview: null,
  streamingData: [],
  revenueData: [],
  geographicData: [],
  demographicData: null,
  isLoading: false,
  error: null,

  fetchAnalyticsOverview: async () => {
    set({ isLoading: true, error: null });
    try {
      // Mock data - replace with actual API calls
      await new Promise(resolve => setTimeout(resolve, 800));

      const mockOverview: AnalyticsOverview = {
        totalStreams: 1547829,
        totalRevenue: 8423.67,
        monthlyGrowth: 23.5,
        activeReleases: 12,
        topTrack: {
          title: 'Summer Vibes',
          artist: 'The Wave Riders',
          streams: 234567
        }
      };

      set({ overview: mockOverview, isLoading: false });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to fetch analytics overview',
        isLoading: false
      });
    }
  },

  fetchStreamingData: async (_period = '7d') => {
    set({ isLoading: true, error: null });
    try {
      await new Promise(resolve => setTimeout(resolve, 600));

      const mockStreamingData: StreamingData[] = [
        {
          platform: 'Spotify',
          streams: 892456,
          revenue: 4234.23,
          change24h: 1247,
          changePercent: 2.3
        },
        {
          platform: 'Apple Music',
          streams: 345678,
          revenue: 2145.89,
          change24h: 567,
          changePercent: 1.8
        },
        {
          platform: 'YouTube Music',
          streams: 234567,
          revenue: 1234.56,
          change24h: 234,
          changePercent: 1.2
        },
        {
          platform: 'Amazon Music',
          streams: 123456,
          revenue: 567.89,
          change24h: 123,
          changePercent: 0.9
        },
        {
          platform: 'Deezer',
          streams: 89012,
          revenue: 234.56,
          change24h: 89,
          changePercent: 0.6
        },
        {
          platform: 'Tidal',
          streams: 45678,
          revenue: 123.45,
          change24h: 45,
          changePercent: 0.4
        }
      ];

      set({ streamingData: mockStreamingData, isLoading: false });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to fetch streaming data',
        isLoading: false
      });
    }
  },

  fetchRevenueData: async (_period = '30d') => {
    set({ isLoading: true, error: null });
    try {
      await new Promise(resolve => setTimeout(resolve, 700));

      // Generate mock revenue data for the last 30 days
      const mockRevenueData: RevenueData[] = [];
      const today = new Date();

      for (let i = 29; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);

        const spotify = Math.floor(Math.random() * 200) + 100;
        const appleMusic = Math.floor(Math.random() * 150) + 75;
        const youtube = Math.floor(Math.random() * 100) + 50;
        const other = Math.floor(Math.random() * 75) + 25;

        mockRevenueData.push({
          date: date.toISOString().split('T')[0] || '',
          spotify,
          appleMusic,
          youtube,
          other,
          total: spotify + appleMusic + youtube + other
        });
      }

      set({ revenueData: mockRevenueData, isLoading: false });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to fetch revenue data',
        isLoading: false
      });
    }
  },

  fetchGeographicData: async () => {
    set({ isLoading: true, error: null });
    try {
      await new Promise(resolve => setTimeout(resolve, 500));

      const mockGeographicData: GeographicData[] = [
        { country: 'United States', countryCode: 'US', streams: 456789, revenue: 2345.67, percentage: 29.5 },
        { country: 'United Kingdom', countryCode: 'GB', streams: 234567, revenue: 1234.56, percentage: 15.2 },
        { country: 'Germany', countryCode: 'DE', streams: 198765, revenue: 987.65, percentage: 12.8 },
        { country: 'Canada', countryCode: 'CA', streams: 145678, revenue: 745.89, percentage: 9.4 },
        { country: 'Australia', countryCode: 'AU', streams: 123456, revenue: 567.89, percentage: 8.0 },
        { country: 'France', countryCode: 'FR', streams: 98765, revenue: 456.78, percentage: 6.4 },
        { country: 'Netherlands', countryCode: 'NL', streams: 87654, revenue: 345.67, percentage: 5.7 },
        { country: 'Sweden', countryCode: 'SE', streams: 76543, revenue: 234.56, percentage: 4.9 },
        { country: 'Norway', countryCode: 'NO', streams: 65432, revenue: 123.45, percentage: 4.2 },
        { country: 'Others', countryCode: '', streams: 65432, revenue: 323.45, percentage: 3.9 }
      ];

      set({ geographicData: mockGeographicData, isLoading: false });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to fetch geographic data',
        isLoading: false
      });
    }
  },

  fetchDemographicData: async () => {
    set({ isLoading: true, error: null });
    try {
      await new Promise(resolve => setTimeout(resolve, 400));

      const mockDemographicData: DemographicData[] = [
        {
          ageGroup: '18-24',
          percentage: 32.4,
          streams: 501234,
          gender: { male: 45, female: 52, other: 3 }
        },
        {
          ageGroup: '25-34',
          percentage: 28.7,
          streams: 444567,
          gender: { male: 48, female: 49, other: 3 }
        },
        {
          ageGroup: '35-44',
          percentage: 22.1,
          streams: 342123,
          gender: { male: 51, female: 46, other: 3 }
        },
        {
          ageGroup: '45-54',
          percentage: 12.3,
          streams: 190456,
          gender: { male: 53, female: 44, other: 3 }
        },
        {
          ageGroup: '55+',
          percentage: 4.5,
          streams: 69789,
          gender: { male: 55, female: 42, other: 3 }
        }
      ];

      set({ demographicData: mockDemographicData, isLoading: false });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to fetch demographic data',
        isLoading: false
      });
    }
  },

  setError: (error: string | null) => set({ error }),
  clearError: () => set({ error: null })
}));
