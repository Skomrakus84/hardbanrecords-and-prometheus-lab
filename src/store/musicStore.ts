import { create } from 'zustand';
import { Release } from '../types/music';

interface MusicStore {
  releases: Release[];
  loading: boolean;
  error: string | null;

  fetchReleases: () => Promise<void>;
  createRelease: (releaseData: Partial<Release>) => Promise<Release>;
  updateRelease: (id: string, releaseData: Partial<Release>) => Promise<Release>;
  deleteRelease: (id: string) => Promise<void>;
  clearError: () => void;
}

export const useMusicStore = create<MusicStore>((set, get) => ({
  releases: [],
  loading: false,
  error: null,

  fetchReleases: async () => {
    set({ loading: true, error: null });
    try {
      // For now, use mock data - later connect to backend API
      const mockReleases: Release[] = [
        {
          id: '1',
          title: 'Summer Vibes EP',
          artist: 'The Wave Riders',
          releaseDate: '2024-06-15',
          status: 'published',
          tracks: [
            { id: '1', title: 'Ocean Dreams', duration: '3:45' },
            { id: '2', title: 'Sunset Boulevard', duration: '4:12' },
            { id: '3', title: 'Beach Party', duration: '3:58' }
          ],
          artwork: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400',
          genre: 'Electronic',
          platforms: ['Spotify', 'Apple Music', 'YouTube Music']
        },
        {
          id: '2',
          title: 'Midnight Dreams',
          artist: 'Luna Echo',
          releaseDate: '2024-05-20',
          status: 'published',
          tracks: [
            { id: '4', title: 'Moonlight Serenade', duration: '4:30' },
            { id: '5', title: 'Stars Above', duration: '3:22' }
          ],
          artwork: 'https://images.unsplash.com/photo-1501594907352-04cda38ebc29?w=400',
          genre: 'Ambient',
          platforms: ['Spotify', 'Apple Music']
        },
        {
          id: '3',
          title: 'Urban Flow',
          artist: 'Street Beats',
          releaseDate: '2024-07-01',
          status: 'scheduled',
          tracks: [
            { id: '6', title: 'City Lights', duration: '3:15' },
            { id: '7', title: 'Rush Hour', duration: '4:05' },
            { id: '8', title: 'Underground', duration: '3:50' }
          ],
          genre: 'Hip Hop',
          platforms: ['Spotify', 'Apple Music', 'YouTube Music', 'SoundCloud']
        },
        {
          id: '4',
          title: 'Acoustic Sessions',
          artist: 'Coffee Shop Tales',
          releaseDate: '2024-04-10',
          status: 'draft',
          tracks: [
            { id: '9', title: 'Morning Coffee', duration: '2:45' },
            { id: '10', title: 'Rainy Day', duration: '3:30' }
          ],
          genre: 'Folk',
          platforms: ['Bandcamp']
        }
      ];

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));

      set({ releases: mockReleases, loading: false });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to fetch releases',
        loading: false
      });
    }
  },

  createRelease: async (releaseData) => {
    set({ loading: true, error: null });
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      const newRelease: Release = {
        id: Date.now().toString(),
        title: releaseData.title || 'Untitled Release',
        artist: releaseData.artist || 'Unknown Artist',
        releaseDate: releaseData.releaseDate || new Date().toISOString().split('T')[0],
        status: 'draft',
        tracks: releaseData.tracks || [],
        artwork: releaseData.artwork,
        genre: releaseData.genre,
        platforms: releaseData.platforms || [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        ...releaseData
      };

      set(state => ({
        releases: [...state.releases, newRelease],
        loading: false
      }));

      return newRelease;
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to create release',
        loading: false
      });
      throw error;
    }
  },

  updateRelease: async (id, releaseData) => {
    set({ loading: true, error: null });
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 800));

      set(state => ({
        releases: state.releases.map(release =>
          release.id === id
            ? { ...release, ...releaseData, updatedAt: new Date().toISOString() }
            : release
        ),
        loading: false
      }));

      const updatedRelease = get().releases.find(r => r.id === id);
      if (!updatedRelease) {
        throw new Error('Release not found');
      }

      return updatedRelease;
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to update release',
        loading: false
      });
      throw error;
    }
  },

  deleteRelease: async (id) => {
    set({ loading: true, error: null });
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));

      set(state => ({
        releases: state.releases.filter(release => release.id !== id),
        loading: false
      }));
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to delete release',
        loading: false
      });
      throw error;
    }
  },

  clearError: () => set({ error: null })
}));
