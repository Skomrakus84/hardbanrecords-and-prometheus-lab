import React, { useState, useCallback, useMemo } from 'react';
import { AddReleaseFormNew } from './AddReleaseFormNew';
import { useMusicStore } from '../../store/musicStore';
import { useAuthStore } from '../../store/authStore';
import { Release } from '../../types/music';

interface ReleaseCardProps {
  release: Release;
  onEdit: (release: Release) => void;
  onDelete: (id: string) => void;
}

const ReleaseCard: React.FC<ReleaseCardProps> = ({ release, onEdit, onDelete }) => {
  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('pl-PL', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published': return 'bg-green-100 text-green-800';
      case 'scheduled': return 'bg-blue-100 text-blue-800';
      case 'draft': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'published': return 'Opublikowany';
      case 'scheduled': return 'Zaplanowany';
      case 'draft': return 'Szkic';
      default: return 'Nieznany';
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-300 hover:scale-105">
      <div className="aspect-square bg-gradient-to-br from-purple-400 to-pink-400 relative overflow-hidden">
        {release.artwork ? (
          <img 
            src={release.artwork} 
            alt={release.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="text-white text-6xl font-bold opacity-50">
              {release.title.charAt(0).toUpperCase()}
            </div>
          </div>
        )}
        <div className="absolute top-4 right-4">
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(release.status)}`}>
            {getStatusText(release.status)}
          </span>
        </div>
      </div>
      
      <div className="p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2">
          {release.title}
        </h3>
        <p className="text-gray-600 mb-3 line-clamp-1">
          {release.artist}
        </p>
        <div className="space-y-2 mb-4">
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Data wydania:</span>
            <span className="font-medium">{formatDate(release.releaseDate)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Utwory:</span>
            <span className="font-medium">{release.tracks?.length || 0}</span>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => onEdit(release)}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            Edytuj
          </button>
          <button
            onClick={() => onDelete(release.id)}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
          >
            Usuń
          </button>
        </div>
      </div>
    </div>
  );
};

export const ReleasesView: React.FC = () => {
  const { releases, loading, error, fetchReleases, deleteRelease } = useMusicStore();
  const { user } = useAuthStore();
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingRelease, setEditingRelease] = useState<Release | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  React.useEffect(() => {
    if (user) {
      fetchReleases();
    }
  }, [user, fetchReleases]);

  const handleAddRelease = useCallback(() => {
    setEditingRelease(null);
    setShowAddForm(true);
  }, []);

  const handleEditRelease = useCallback((release: Release) => {
    setEditingRelease(release);
    setShowAddForm(true);
  }, []);

  const handleDeleteRelease = useCallback(async (id: string) => {
    if (window.confirm('Czy na pewno chcesz usunąć ten release?')) {
      await deleteRelease(id);
    }
  }, [deleteRelease]);

  const handleFormClose = useCallback(() => {
    setShowAddForm(false);
    setEditingRelease(null);
  }, []);

  const filteredReleases = useMemo(() => {
    return releases.filter(release => {
      const matchesSearch = release.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           release.artist.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'all' || release.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [releases, searchTerm, statusFilter]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <h3 className="text-red-800 font-medium mb-2">Błąd</h3>
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {showAddForm ? (
        <AddReleaseFormNew
          release={editingRelease}
          onClose={handleFormClose}
        />
      ) : (
        <>
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold text-gray-900">Twoje Release'y</h1>
            <button
              onClick={handleAddRelease}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Dodaj Release
            </button>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <div className="flex-1">
                <input
                  type="text"
                  placeholder="Szukaj po tytule lub artyście..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">Wszystkie statusy</option>
                  <option value="draft">Szkice</option>
                  <option value="scheduled">Zaplanowane</option>
                  <option value="published">Opublikowane</option>
                </select>
              </div>
            </div>

            {filteredReleases.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-24 h-24 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                  <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l6 6-6 6z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {releases.length === 0 ? 'Brak release\u0027ów' : 'Brak wyników'}
                </h3>
                <p className="text-gray-500 mb-6">
                  {releases.length === 0 
                    ? 'Dodaj swój pierwszy release aby rozpocząć.' 
                    : 'Spróbuj zmienić kryteria wyszukiwania.'
                  }
                </p>
                {releases.length === 0 && (
                  <button
                    onClick={handleAddRelease}
                    className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                  >
                    Dodaj pierwszy release
                  </button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredReleases.map((release) => (
                  <ReleaseCard
                    key={release.id}
                    release={release}
                    onEdit={handleEditRelease}
                    onDelete={handleDeleteRelease}
                  />
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};
