// Music-specific types for UI components
export interface Release {
  id: string;
  title: string;
  artist: string;
  releaseDate: string;
  status: 'draft' | 'scheduled' | 'published' | 'rejected';
  tracks?: Track[];
  artwork?: string;
  genre?: string;
  description?: string;
  platforms?: string[];
  metadata?: ReleaseMetadata;
  createdAt?: string;
  updatedAt?: string;
}

export interface Track {
  id: string;
  title: string;
  duration: string;
  audioFile?: File;
  isrc?: string;
  trackNumber?: number;
}

export interface ReleaseMetadata {
  description: string;
  tags: string[];
  language: string;
  explicitContent: boolean;
}

export interface ReleaseFormData {
  title: string;
  artist: string;
  genre: string;
  releaseDate: string;
  platforms: string[];
  coverArt?: File;
  tracks: TrackData[];
  metadata: ReleaseMetadata;
}

export interface TrackData {
  title: string;
  duration: string;
  audioFile?: File;
  isrc?: string;
}

export interface MusicStore {
  releases: Release[];
  loading: boolean;
  error: string | null;
  fetchReleases: () => Promise<void>;
  createRelease: (release: Partial<Release>) => Promise<Release>;
  updateRelease: (id: string, release: Partial<Release>) => Promise<Release>;
  deleteRelease: (id: string) => Promise<void>;
}

export const platforms = [
  'Spotify',
  'Apple Music',
  'YouTube Music',
  'Amazon Music',
  'Deezer',
  'Tidal',
  'SoundCloud',
  'Bandcamp'
] as const;

export type Platform = typeof platforms[number];
