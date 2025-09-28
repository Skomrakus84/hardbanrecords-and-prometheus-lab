import React, { useState, useCallback, useMemo } from 'react';
import { useAppStore } from '../../store/appStore';
import { AddReleaseForm } from './AddReleaseFormNew';

interface ReleaseFormData {
  title: string;
  artist: string;
  genre: string;
  releaseDate: string;
  platforms: string[];
  coverArt?: File;
  tracks: TrackData[];
  metadata: {
    description: string;
    tags: string[];
    language: string;
    explicitContent: boolean;
  };
}

interface TrackData {
  title: string;
  duration: string;
  audioFile?: File;
  isrc?: string;
}

interface MusicRelease {
  id: number;
  title: string;
  artist: string;
  genre?: string;
  status: string;
  releaseDate?: string;
  splits: { name: string; share: string }[];
  coverImageUrl?: string;
  audioUrl?: string;
}

interface ReleasesViewProps {
  onSelectRelease?: (release: MusicRelease) => void;
}

// Komponent dla pojedynczego release card
const ReleaseCard = ({ 
  release, 
  onSelect, 
  onDelete, 
  isDeleting 
}: {
  release: MusicRelease;
  onSelect: () => void;
  onDelete: () => void;
  isDeleting: boolean;
}) => {
  const statusConfig = useMemo(() => {
    const configs = {
      published: { bg: '#4CAF50', text: 'Published' },
      draft: { bg: '#FFA000', text: 'Draft' },
      archived: { bg: '#757575', text: 'Archived' },
      pending: { bg: '#2196F3', text: 'Pending' }
    };
    return configs[release.status as keyof typeof configs] || configs.draft;
  }, [release.status]);

  return (
    <div className="bg-gray-800 border border-gray-600 rounded-lg p-6 hover:bg-gray-700 transition-all duration-300 flex flex-col h-full">
      <div className="flex-1">
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-xl font-semibold text-gray-100 leading-tight">{release.title}</h3>
          <span 
            className="px-2 py-1 rounded-full text-xs font-medium uppercase tracking-wide text-white"
            style={{ backgroundColor: statusConfig.bg }}
          >
            {statusConfig.text}
          </span>
        </div>
        
        <div className="space-y-2 mb-6">
          <p className="text-gray-300 font-medium">{release.artist}</p>
          <p className="text-gray-400 text-sm">Genre: {release.genre}</p>
          {release.releaseDate && (
            <p className="text-gray-400 text-sm">
              Release: {new Date(release.releaseDate).toLocaleDateString()}
            </p>
          )}
          {release.splits.length > 0 && (
            <p className="text-gray-400 text-sm">
              {release.splits.length} split{release.splits.length > 1 ? 's' : ''}
            </p>
          )}
        </div>
      </div>

      <div className="flex gap-2 mt-auto">
        <button
          onClick={onSelect}
          className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-60"
          disabled={isDeleting}
        >
          View Details
        </button>
        <button
          onClick={onDelete}
          className="flex-1 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-60"
          disabled={isDeleting}
        >
          {isDeleting ? 'Deleting...' : 'Delete'}
        </button>
      </div>
    </div>
  );
};

export const ReleasesView = ({ onSelectRelease }: ReleasesViewProps) => {
  const { releases } = useAppStore(state => state.music);
  const { deleteRelease, isLoading, error, clearError } = useAppStore();
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [deletingIds, setDeletingIds] = useState<Set<number>>(new Set());

  const handleDelete = useCallback(async (release: MusicRelease) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${release.title}" by ${release.artist}?\n\nThis action cannot be undone.`
    );

    if (!confirmed) return;

    setDeletingIds(prev => new Set(prev).add(release.id));
    try {
      await deleteRelease(release.id);
    } catch (error) {
      console.error('Failed to delete release:', error);
    } finally {
      setDeletingIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(release.id);
        return newSet;
      });
    }
  }, [deleteRelease]);

  const handleSelect = useCallback((release: MusicRelease) => {
    onSelectRelease?.(release);
  }, [onSelectRelease]);

  const handleAddNew = useCallback(() => {
    setIsAddingNew(true);
  }, []);

  const handleCloseForm = useCallback(() => {
    setIsAddingNew(false);
  }, []);

  const handleAddRelease = useCallback(async (releaseData: ReleaseFormData) => {
    try {
      // Transform new form data to old format for compatibility
      const transformedData = {
        title: releaseData.title,
        artist: releaseData.artist,
        genre: releaseData.genre,
        releaseDate: releaseData.releaseDate,
        splits: [],
        coverImageUrl: '',
        audioUrl: ''
      };
      
      // Use store function to add release
      const store = useAppStore.getState();
      await store.addRelease(transformedData);
      setIsAddingNew(false);
      store.addToast?.('Release created successfully!', 'success');
    } catch (error) {
      console.error('Error creating release:', error);
      const store = useAppStore.getState();
      store.addToast?.('Failed to create release', 'error');
    }
  }, []);

  return (
    <div className="releases-view">
      {/* Header */}
      <div className="mb-8">
        <div className="flex justify-between items-center gap-5">
          <div>
            <h1 className="text-2xl font-semibold text-gray-100 m-0 flex items-center gap-3">
              🎵 Music Releases
              <span className="text-sm text-gray-400 font-normal">
                ({releases.length})
              </span>
            </h1>
          </div>
          <button
            onClick={handleAddNew}
            disabled={isLoading}
            className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white px-5 py-2.5 rounded-lg font-medium transition-all duration-200 flex items-center gap-2 disabled:opacity-60"
          >
            <span className="text-lg">+</span>
            Add New Release
          </button>
        </div>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="bg-red-900 border border-red-600 rounded-lg p-3 mb-5 flex justify-between items-center text-red-200">
          <span>{error}</span>
          <button
            onClick={clearError}
            className="bg-transparent border-none text-red-200 text-xl cursor-pointer p-0 ml-2"
          >
            ×
          </button>
        </div>
      )}

      {/* Content */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-15 px-5 text-center text-gray-400">
          <div className="w-10 h-10 border-3 border-gray-600 border-t-blue-500 rounded-full animate-spin mb-5"></div>
          <p>Loading releases...</p>
        </div>
      ) : releases.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-15 px-5 text-center text-gray-400">
          <div className="text-6xl mb-5 opacity-50">🎵</div>
          <h3 className="m-0 text-gray-100 text-xl mb-2">No releases yet</h3>
          <p className="m-0 mb-8 text-gray-500">
            Create your first music release to get started with distribution.
          </p>
          <button
            onClick={handleAddNew}
            className="bg-green-600 hover:bg-green-700 text-white px-6 py-2.5 rounded-lg font-medium transition-colors"
          >
            Create Your First Release
          </button>
        </div>
      ) : (
        <div className="grid gap-5 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {releases.map((release) => (
            <ReleaseCard
              key={release.id}
              release={release}
              onSelect={() => handleSelect(release)}
              onDelete={() => handleDelete(release)}
              isDeleting={deletingIds.has(release.id)}
            />
          ))}
        </div>
      )}

      {/* New Release Form Modal */}
      {isAddingNew && (
        <AddReleaseForm
          onClose={handleCloseForm}
          onSubmit={handleAddRelease}
        />
      )}
    </div>
  );
};
