import React, { useState, useCallback, useMemo } from 'react';
import { useAppStore } from '../../store/appStore';

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
    <div className="release-card">
      <div className="card-content">
        <div className="card-header">
          <h3 className="release-title">{release.title}</h3>
          <span 
            className="status-badge"
            style={{ backgroundColor: statusConfig.bg }}
          >
            {statusConfig.text}
          </span>
        </div>
        
        <div className="release-info">
          <p className="artist-name">{release.artist}</p>
          <p className="genre">Genre: {release.genre}</p>
          {release.releaseDate && (
            <p className="release-date">
              Release: {new Date(release.releaseDate).toLocaleDateString()}
            </p>
          )}
          {release.splits.length > 0 && (
            <p className="splits-count">
              {release.splits.length} split{release.splits.length > 1 ? 's' : ''}
            </p>
          )}
        </div>
      </div>

      <div className="card-actions">
        <button
          onClick={onSelect}
          className="btn btn-primary"
          disabled={isDeleting}
        >
          View Details
        </button>
        <button
          onClick={onDelete}
          className="btn btn-danger"
          disabled={isDeleting}
        >
          {isDeleting ? 'Deleting...' : 'Delete'}
        </button>
      </div>

      <style jsx>{`
        .release-card {
          background: #1E1E1E;
          border-radius: 12px;
          padding: 20px;
          transition: all 0.3s ease;
          border: 1px solid #333;
          display: flex;
          flex-direction: column;
          height: 100%;
        }

        .release-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 8px 25px rgba(0, 0, 0, 0.3);
          border-color: #555;
        }

        .card-content {
          flex: 1;
        }

        .card-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 15px;
          gap: 10px;
        }

        .release-title {
          font-size: 1.25rem;
          font-weight: 600;
          color: #E0E0E0;
          margin: 0;
          line-height: 1.3;
          flex: 1;
        }

        .status-badge {
          padding: 4px 8px;
          border-radius: 12px;
          font-size: 0.75rem;
          font-weight: 500;
          color: white;
          white-space: nowrap;
          flex-shrink: 0;
        }

        .release-info {
          margin-bottom: 20px;
        }

        .release-info p {
          margin: 6px 0;
          color: #A0A0A0;
          font-size: 0.9rem;
        }

        .artist-name {
          font-weight: 500;
          color: #B0B0B0 !important;
          font-size: 1rem !important;
        }

        .card-actions {
          display: flex;
          gap: 10px;
          margin-top: auto;
        }

        .btn {
          padding: 8px 16px;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          font-size: 0.9rem;
          font-weight: 500;
          transition: all 0.2s ease;
          flex: 1;
        }

        .btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .btn-primary {
          background: #2196F3;
          color: white;
        }

        .btn-primary:hover:not(:disabled) {
          background: #1976D2;
        }

        .btn-danger {
          background: #f44336;
          color: white;
        }

        .btn-danger:hover:not(:disabled) {
          background: #d32f2f;
        }
      `}</style>
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
    } catch (err) {
      // Error jest już obsłużony w store
      console.error('Delete failed:', err);
    } finally {
      setDeletingIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(release.id);
        return newSet;
      });
    }
  }, [deleteRelease]);

  const handleSelectRelease = useCallback((release: MusicRelease) => {
    onSelectRelease?.(release);
  }, [onSelectRelease]);

  // Sortowanie i filtrowanie releases
  const sortedReleases = useMemo(() => {
    return [...releases].sort((a, b) => {
      // Najpierw po statusie (published na końcu)
      const statusOrder = { draft: 0, pending: 1, published: 2, archived: 3 };
      const statusDiff = (statusOrder[a.status as keyof typeof statusOrder] || 0) - 
                        (statusOrder[b.status as keyof typeof statusOrder] || 0);
      
      if (statusDiff !== 0) return statusDiff;
      
      // Potem po dacie release (najnowsze pierwsze)
      if (a.releaseDate && b.releaseDate) {
        return new Date(b.releaseDate).getTime() - new Date(a.releaseDate).getTime();
      }
      
      // Na końcu alfabetycznie po tytule
      return a.title.localeCompare(b.title);
    });
  }, [releases]);

  const handleAddNew = useCallback(() => {
    setIsAddingNew(true);
  }, []);

  const handleCloseForm = useCallback(() => {
    setIsAddingNew(false);
  }, []);

  return (
    <div className="releases-view">
      {/* Header */}
      <div className="view-header">
        <div className="header-content">
          <h2 className="view-title">
            Releases
            <span className="releases-count">({releases.length})</span>
          </h2>
          <button
            onClick={handleAddNew}
            className="btn btn-add"
            disabled={isLoading}
          >
            <span className="btn-icon">+</span>
            Add New Release
          </button>
        </div>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="error-banner">
          <span>{error}</span>
          <button onClick={clearError} className="error-close">×</button>
        </div>
      )}

      {/* Loading State */}
      {isLoading && releases.length === 0 && (
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Loading releases...</p>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && releases.length === 0 && !error && (
        <div className="empty-state">
          <div className="empty-icon">🎵</div>
          <h3>No releases yet</h3>
          <p>Create your first music release to get started</p>
          <button onClick={handleAddNew} className="btn btn-add">
            Create First Release
          </button>
        </div>
      )}

      {/* Releases Grid */}
      {releases.length > 0 && (
        <div className="releases-grid">
          {sortedReleases.map((release) => (
            <ReleaseCard
              key={release.id}
              release={release}
              onSelect={() => handleSelectRelease(release)}
              onDelete={() => handleDelete(release)}
              isDeleting={deletingIds.has(release.id)}
            />
          ))}
        </div>
      )}

      {/* TODO: Add New Release Form Modal */}
      {isAddingNew && (
        <div className="modal-overlay" onClick={handleCloseForm}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h3>Add New Release</h3>
            <p>Form będzie tutaj...</p>
            <button onClick={handleCloseForm} className="btn btn-secondary">
              Close
            </button>
          </div>
        </div>
      )}

      <style jsx>{`
        .releases-view {
          padding: 0;
        }

        .view-header {
          margin-bottom: 30px;
        }

        .header-content {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 20px;
        }

        .view-title {
          font-size: 1.5rem;
          font-weight: 600;
          color: #E0E0E0;
          margin: 0;
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .releases-count {
          font-size: 0.9rem;
          color: #888;
          font-weight: 400;
        }

        .btn {
          padding: 10px 20px;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          font-weight: 500;
          transition: all 0.2s ease;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .btn-add {
          background: linear-gradient(135deg, #4CAF50, #45a049);
          color: white;
        }

        .btn-add:hover:not(:disabled) {
          background: linear-gradient(135deg, #45a049, #3d8b40);
          transform: translateY(-1px);
        }

        .btn-secondary {
          background: #333;
          color: #E0E0E0;
        }

        .btn-secondary:hover:not(:disabled) {
          background: #444;
        }

        .btn-icon {
          font-size: 1.2rem;
          line-height: 1;
        }

        .error-banner {
          background: #2D1B1B;
          border: 1px solid #f44336;
          border-radius: 8px;
          padding: 12px 16px;
          margin-bottom: 20px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          color: #FFB3B3;
        }

        .error-close {
          background: none;
          border: none;
          color: #FFB3B3;
          font-size: 1.5rem;
          cursor: pointer;
          padding: 0;
          margin-left: 10px;
        }

        .loading-state, .empty-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 60px 20px;
          text-align: center;
          color: #A0A0A0;
        }

        .spinner {
          width: 40px;
          height: 40px;
          border: 3px solid #333;
          border-top: 3px solid #2196F3;
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin-bottom: 20px;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        .empty-icon {
          font-size: 4rem;
          margin-bottom: 20px;
          opacity: 0.5;
        }

        .empty-state h3 {
          margin: 0 0 10px 0;
          color: #E0E0E0;
          font-size: 1.3rem;
        }

        .empty-state p {
          margin: 0 0 30px 0;
          color: #888;
        }

        .releases-grid {
          display: grid;
          gap: 20px;
          grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
        }

        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.7);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
        }

        .modal-content {
          background: #2A2A2A;
          border-radius: 12px;
          padding: 30px;
          max-width: 500px;
          width: 90%;
          max-height: 80vh;
          overflow-y: auto;
        }

        .modal-content h3 {
          margin: 0 0 20px 0;
          color: #E0E0E0;
        }

        @media (max-width: 768px) {
          .header-content {
            flex-direction: column;
            align-items: stretch;
          }
          
          .releases-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
};