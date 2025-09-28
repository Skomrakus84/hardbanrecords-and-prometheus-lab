export interface Artist {
  id: string;
  name: string;
  email: string;
  phone?: string;
  bio?: string;
  avatar?: string;
  socialMedia: {
    spotify?: string;
    instagram?: string;
    twitter?: string;
    youtube?: string;
    facebook?: string;
    tiktok?: string;
  };
  contracts: Contract[];
  releases: Release[];
  totalStreams: number;
  totalRevenue: number;
  joinedAt: string;
  status: 'active' | 'inactive' | 'pending';
  genre?: string;
  location?: string;
}

export interface Contract {
  id: string;
  artistId: string;
  title: string;
  type: 'recording' | 'publishing' | 'management' | 'distribution' | 'licensing';
  startDate: string;
  endDate: string;
  revenueShare: number; // Percentage (0-100)
  totalRevenue: number;
  status: 'active' | 'expired' | 'pending' | 'terminated';
  terms?: string;
  signedAt?: string;
  documentUrl?: string;
}

export interface ArtistStore {
  // Data
  artists: Artist[];
  currentArtist: Artist | null;
  contracts: Contract[];

  // Loading states
  isLoading: boolean;
  error: string | null;

  // Actions
  fetchArtists: () => Promise<void>;
  fetchArtistById: (id: string) => Promise<void>;
  addArtist: (artist: Partial<Artist>) => Promise<void>;
  updateArtist: (id: string, updates: Partial<Artist>) => Promise<Artist>;
  deleteArtist: (id: string) => Promise<void>;

  // Contract actions
  fetchContracts: (artistId: string) => Promise<void>;
  addContract: (artistId: string, contractData: Omit<Contract, 'id'>) => Promise<void>;
  updateContract: (artistId: string, contractId: string, contractData: Omit<Contract, 'id'>) => Promise<void>;
  deleteContract: (id: string) => Promise<void>;

  // Utility actions
  setCurrentArtist: (artist: Artist | null) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
  addToast: (message: string, type?: 'success' | 'error') => Promise<void>;
}

export interface CreateArtistDto {
  name: string;
  email: string;
  phone?: string;
  bio?: string;
  avatar?: string;
  socialMedia?: Partial<Artist['socialMedia']>;
  genre?: string;
  location?: string;
}

export interface UpdateArtistDto {
  name?: string;
  email?: string;
  phone?: string;
  bio?: string;
  avatar?: string;
  socialMedia?: Partial<Artist['socialMedia']>;
  genre?: string;
  location?: string;
  status?: Artist['status'];
}

// Re-export from music types
export interface Release {
  id: string;
  title: string;
  artist: string;
  // Add other release fields as needed
}
