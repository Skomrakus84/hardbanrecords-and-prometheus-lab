import { create } from 'zustand';
import { Artist, Contract, ArtistStore } from '../types/artist';

// Helper function to get appStore actions
const getAppStoreActions = () => {
  // Dynamic import to avoid circular dependency
  return import('./appStore').then(m => m.useAppStore.getState());
};

export const useArtistStore = create<ArtistStore>((set, get) => ({
  // Data
  artists: [],
  currentArtist: null,
  contracts: [],

  // Loading states
  isLoading: false,
  error: null,

  // Actions
  fetchArtists: async () => {
    set({ isLoading: true, error: null });
    try {
      // Mock data - replace with actual API calls
      await new Promise(resolve => setTimeout(resolve, 800));

      const mockArtists: Artist[] = [
        {
          id: '1',
          name: 'The Wave Riders',
          email: 'contact@waveriders.com',
          phone: '+1 234 567 8900',
          bio: 'Indie rock band from California known for their energetic live performances and melodic soundscapes.',
          avatar: '/avatars/wave-riders.jpg',
          socialMedia: {
            spotify: 'https://open.spotify.com/artist/waveriders',
            instagram: 'https://instagram.com/waveriders',
            youtube: 'https://youtube.com/waveriders',
            twitter: 'https://twitter.com/waveriders'
          },
          contracts: [],
          releases: [],
          totalStreams: 1547829,
          totalRevenue: 8423.67,
          joinedAt: '2023-01-15T00:00:00Z',
          status: 'active',
          genre: 'Indie Rock',
          location: 'Los Angeles, CA'
        },
        {
          id: '2',
          name: 'Luna Martinez',
          email: 'luna@lunamartinez.com',
          phone: '+1 234 567 8901',
          bio: 'Singer-songwriter with a soulful voice and introspective lyrics that connect with audiences worldwide.',
          avatar: '/avatars/luna-martinez.jpg',
          socialMedia: {
            spotify: 'https://open.spotify.com/artist/lunamartinez',
            instagram: 'https://instagram.com/lunamartinez',
            tiktok: 'https://tiktok.com/@lunamartinez'
          },
          contracts: [],
          releases: [],
          totalStreams: 890234,
          totalRevenue: 4567.89,
          joinedAt: '2023-03-22T00:00:00Z',
          status: 'active',
          genre: 'Folk Pop',
          location: 'Nashville, TN'
        },
        {
          id: '3',
          name: 'Digital Pulse',
          email: 'info@digitalpulse.com',
          bio: 'Electronic music duo pushing the boundaries of sound with innovative production techniques.',
          avatar: '/avatars/digital-pulse.jpg',
          socialMedia: {
            spotify: 'https://open.spotify.com/artist/digitalpulse',
            youtube: 'https://youtube.com/digitalpulse',
            facebook: 'https://facebook.com/digitalpulse'
          },
          contracts: [],
          releases: [],
          totalStreams: 2341567,
          totalRevenue: 12890.34,
          joinedAt: '2022-11-08T00:00:00Z',
          status: 'active',
          genre: 'Electronic',
          location: 'Berlin, Germany'
        },
        {
          id: '4',
          name: 'Maya Chen',
          email: 'maya@mayachen.music',
          phone: '+1 234 567 8902',
          bio: 'Classical pianist transitioning to contemporary compositions with cinematic influences.',
          avatar: '/avatars/maya-chen.jpg',
          socialMedia: {
            spotify: 'https://open.spotify.com/artist/mayachen',
            instagram: 'https://instagram.com/mayachenmusic'
          },
          contracts: [],
          releases: [],
          totalStreams: 567890,
          totalRevenue: 3456.78,
          joinedAt: '2024-01-10T00:00:00Z',
          status: 'pending',
          genre: 'Neoclassical',
          location: 'New York, NY'
        }
      ];

      set({ artists: mockArtists, isLoading: false });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to fetch artists',
        isLoading: false
      });
    }
  },

  fetchArtistById: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      await new Promise(resolve => setTimeout(resolve, 500));

      const artists = get().artists;
      const artist = artists.find(a => a.id === id);

      if (artist) {
        set({ currentArtist: artist, isLoading: false });
      } else {
        set({
          error: 'Artist not found',
          isLoading: false
        });
      }
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to fetch artist',
        isLoading: false
      });
    }
  },

  addArtist: async (artistData: Partial<Artist>) => {
    set({ isLoading: true, error: null });
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));

      const newArtist: Artist = {
        id: Date.now().toString(),
        name: artistData.name || '',
        email: artistData.email || '',
        socialMedia: artistData.socialMedia || {},
        contracts: [],
        releases: [],
        totalStreams: 0,
        totalRevenue: 0,
        joinedAt: new Date().toISOString(),
        status: 'pending',
        ...(artistData.phone && { phone: artistData.phone }),
        ...(artistData.bio && { bio: artistData.bio }),
        ...(artistData.avatar && { avatar: artistData.avatar }),
        ...(artistData.genre && { genre: artistData.genre }),
        ...(artistData.location && { location: artistData.location })
      };

      const artists = get().artists;
      set({
        artists: [...artists, newArtist],
        isLoading: false
      });

      // Show success toast (if toast system exists)
      console.log('Artist added successfully:', newArtist.name);
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to add artist',
        isLoading: false
      });
    }
  },

  updateArtist: async (id: string, updates: Partial<Artist>): Promise<Artist> => {
    set({ isLoading: true, error: null });
    try {
      await new Promise(resolve => setTimeout(resolve, 800));

      const artists = get().artists;
      const updatedArtists = artists.map(artist =>
        artist.id === id
          ? { ...artist, ...updates }
          : artist
      );

      set({
        artists: updatedArtists,
        isLoading: false
      });

      // Update current artist if it's the one being updated
      const currentArtist = get().currentArtist;
      if (currentArtist && currentArtist.id === id) {
        set({ currentArtist: { ...currentArtist, ...updates } });
      }

      const updatedArtist = updatedArtists.find(artist => artist.id === id);
      if (!updatedArtist) {
        throw new Error('Artist not found after update');
      }

      console.log('Artist updated successfully');
      return updatedArtist;
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to update artist',
        isLoading: false
      });
      throw error;
    }
  },

  deleteArtist: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      await new Promise(resolve => setTimeout(resolve, 600));

      const artists = get().artists;
      const filteredArtists = artists.filter(artist => artist.id !== id);

      set({
        artists: filteredArtists,
        isLoading: false
      });

      // Clear current artist if it's the one being deleted
      const currentArtist = get().currentArtist;
      if (currentArtist && currentArtist.id === id) {
        set({ currentArtist: null });
      }

      console.log('Artist deleted successfully');
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to delete artist',
        isLoading: false
      });
    }
  },

  // Contract actions
  fetchContracts: async (artistId: string) => {
    set({ isLoading: true, error: null });
    try {
      await new Promise(resolve => setTimeout(resolve, 600));

      const mockContracts: Contract[] = [
        {
          id: '1',
          artistId,
          title: 'Recording Contract 2023',
          type: 'recording',
          startDate: '2023-01-01T00:00:00Z',
          endDate: '2025-12-31T23:59:59Z',
          revenueShare: 70,
          totalRevenue: 8450.25,
          status: 'active',
          terms: 'Standard recording contract with 70/30 revenue split.',
          signedAt: '2022-12-15T00:00:00Z',
          documentUrl: '/contracts/recording-2023.pdf'
        },
        {
          id: '2',
          artistId,
          title: 'Publishing Agreement',
          type: 'publishing',
          startDate: '2023-06-01T00:00:00Z',
          endDate: '2025-05-31T23:59:59Z',
          revenueShare: 60,
          totalRevenue: 2340.75,
          status: 'active',
          terms: 'Publishing rights management with 60/40 split.',
          signedAt: '2023-05-20T00:00:00Z'
        }
      ];

      set({ contracts: mockContracts, isLoading: false });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to fetch contracts',
        isLoading: false
      });
    }
  },

  addContract: async (artistId: string, contractData: Omit<Contract, 'id'>) => {
    set({ isLoading: true, error: null });
    try {
      await new Promise(resolve => setTimeout(resolve, 800));

      const newContract: Contract = {
        id: Date.now().toString(),
        artistId,
        title: contractData.title,
        type: contractData.type,
        startDate: contractData.startDate,
        endDate: contractData.endDate,
        revenueShare: contractData.revenueShare,
        totalRevenue: contractData.totalRevenue,
        status: contractData.status,
        ...(contractData.terms && { terms: contractData.terms }),
        ...(contractData.signedAt && { signedAt: contractData.signedAt }),
        ...(contractData.documentUrl && { documentUrl: contractData.documentUrl })
      };

      // Update artist's contracts
      const artists = get().artists;
      const updatedArtists = artists.map(artist =>
        artist.id === artistId
          ? { ...artist, contracts: [...artist.contracts, newContract] }
          : artist
      );

      set({
        artists: updatedArtists,
        isLoading: false
      });

      console.log('Contract added successfully:', newContract.title);
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to add contract',
        isLoading: false
      });
    }
  },

  updateContract: async (artistId: string, contractId: string, contractData: Omit<Contract, 'id'>) => {
    set({ isLoading: true, error: null });
    try {
      await new Promise(resolve => setTimeout(resolve, 600));

      const artists = get().artists;
      const updatedArtists = artists.map(artist =>
        artist.id === artistId
          ? {
              ...artist,
              contracts: artist.contracts.map(contract =>
                contract.id === contractId
                  ? { ...contract, ...contractData, id: contractId, artistId }
                  : contract
              )
            }
          : artist
      );

      set({
        artists: updatedArtists,
        isLoading: false
      });

      console.log('Contract updated successfully');
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to update contract',
        isLoading: false
      });
    }
  },

  deleteContract: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      await new Promise(resolve => setTimeout(resolve, 500));

      const contracts = get().contracts;
      const filteredContracts = contracts.filter(contract => contract.id !== id);

      set({
        contracts: filteredContracts,
        isLoading: false
      });

      console.log('Contract deleted successfully');
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to delete contract',
        isLoading: false
      });
    }
  },

  // Utility actions
  setCurrentArtist: (artist: Artist | null) => set({ currentArtist: artist }),
  setError: (error: string | null) => set({ error }),
  clearError: () => set({ error: null }),
  addToast: async (message: string, type: 'success' | 'error' = 'success') => {
    // Get toast from app store using dynamic import
    try {
      const appStoreActions = await getAppStoreActions();
      appStoreActions.addToast(message, type);
    } catch (error) {
      console.error('Failed to show toast:', error);
    }
  }
}));
