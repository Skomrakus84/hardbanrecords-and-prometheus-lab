import React, { useState } from 'react';
import { useReleases } from '../../hooks/useMusic';
import { useAuthStore } from '../../store/authStore';
import { Release } from '../../types';

interface EnhancedReleasesViewProps {
  showCreateForm?: boolean;
  onReleaseSelect?: (release: Release) => void;
}

export const EnhancedReleasesView: React.FC<EnhancedReleasesViewProps> = ({
  showCreateForm = true,
  onReleaseSelect
}) => {
  const { user } = useAuthStore();
  const {
    releases,
    loading,
    error,
    pagination,
    filters,
    createRelease,
    updateRelease,
    deleteRelease,
    updateFilters,
    clearError
  } = useReleases();

  const [showForm, setShowForm] = useState(false);
  const [editingRelease, setEditingRelease] = useState<Release | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    artist_name: '',
    release_type: 'single' as 'single' | 'ep' | 'album' | 'compilation',
    release_date: '',
    label: '',
    genre: '',
    description: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingRelease) {
        await updateRelease(editingRelease.id, formData);
      } else {
        await createRelease(formData);
      }
      
      // Reset form
      setFormData({
        title: '',
        artist_name: '',
        release_type: 'single',
        release_date: '',
        label: '',
        genre: '',
        description: '',
      });
      setShowForm(false);
      setEditingRelease(null);
    } catch (err) {
      console.error('Failed to save release:', err);
    }
  };

  const handleEdit = (release: Release) => {
    setEditingRelease(release);
    setFormData({
      title: release.title,
      artist_name: release.artist_name,
      release_type: release.release_type,
      release_date: release.release_date || '',
      label: release.label || '',
      genre: release.genre || '',
      description: release.description || '',
    });
    setShowForm(true);
  };

  const handleDelete = async (release: Release) => {
    if (window.confirm(`Are you sure you want to delete "${release.title}"?`)) {
      await deleteRelease(release.id);
    }
  };

  const handleFilterChange = (key: string, value: string) => {
    updateFilters({ [key]: value });
  };

  if (!user) {
    return <div>Please log in to view releases.</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Releases</h2>
        {showCreateForm && (
          <button
            onClick={() => setShowForm(true)}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Create Release
          </button>
        )}
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
          <button onClick={clearError} className="ml-2 text-red-900">×</button>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white p-4 rounded shadow space-y-4">
        <h3 className="font-semibold">Filters</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <input
            type="text"
            placeholder="Search releases..."
            value={filters.query || ''}
            onChange={(e) => handleFilterChange('query', e.target.value)}
            className="border rounded px-3 py-2"
          />
          <select
            value={filters.release_type || ''}
            onChange={(e) => handleFilterChange('release_type', e.target.value)}
            className="border rounded px-3 py-2"
          >
            <option value="">All Types</option>
            <option value="single">Single</option>
            <option value="ep">EP</option>
            <option value="album">Album</option>
            <option value="compilation">Compilation</option>
          </select>
          <select
            value={filters.status || ''}
            onChange={(e) => handleFilterChange('status', e.target.value)}
            className="border rounded px-3 py-2"
          >
            <option value="">All Status</option>
            <option value="draft">Draft</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="released">Released</option>
            <option value="rejected">Rejected</option>
          </select>
          <input
            type="text"
            placeholder="Genre"
            value={filters.genre || ''}
            onChange={(e) => handleFilterChange('genre', e.target.value)}
            className="border rounded px-3 py-2"
          />
        </div>
      </div>

      {/* Create/Edit Form */}
      {showForm && (
        <div className="bg-white p-6 rounded shadow">
          <h3 className="text-lg font-semibold mb-4">
            {editingRelease ? 'Edit Release' : 'Create New Release'}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="Title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="border rounded px-3 py-2"
                required
              />
              <input
                type="text"
                placeholder="Artist Name"
                value={formData.artist_name}
                onChange={(e) => setFormData({ ...formData, artist_name: e.target.value })}
                className="border rounded px-3 py-2"
                required
              />
              <select
                value={formData.release_type}
                onChange={(e) => setFormData({ ...formData, release_type: e.target.value as any })}
                className="border rounded px-3 py-2"
                required
              >
                <option value="single">Single</option>
                <option value="ep">EP</option>
                <option value="album">Album</option>
                <option value="compilation">Compilation</option>
              </select>
              <input
                type="date"
                placeholder="Release Date"
                value={formData.release_date}
                onChange={(e) => setFormData({ ...formData, release_date: e.target.value })}
                className="border rounded px-3 py-2"
              />
              <input
                type="text"
                placeholder="Label"
                value={formData.label}
                onChange={(e) => setFormData({ ...formData, label: e.target.value })}
                className="border rounded px-3 py-2"
              />
              <input
                type="text"
                placeholder="Genre"
                value={formData.genre}
                onChange={(e) => setFormData({ ...formData, genre: e.target.value })}
                className="border rounded px-3 py-2"
              />
            </div>
            <textarea
              placeholder="Description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="border rounded px-3 py-2 w-full h-24"
            />
            <div className="flex space-x-2">
              <button
                type="submit"
                disabled={loading}
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50"
              >
                {loading ? 'Saving...' : (editingRelease ? 'Update' : 'Create')}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  setEditingRelease(null);
                  setFormData({
                    title: '',
                    artist_name: '',
                    release_type: 'single',
                    release_date: '',
                    label: '',
                    genre: '',
                    description: '',
                  });
                }}
                className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Releases List */}
      {loading ? (
        <div className="text-center py-8">Loading releases...</div>
      ) : (
        <div className="space-y-4">
          {releases.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No releases found. {showCreateForm && 'Create your first release!'}
            </div>
          ) : (
            releases.map((release) => (
              <div
                key={release.id}
                className="bg-white p-4 rounded shadow border hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => onReleaseSelect?.(release)}
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold">{release.title}</h3>
                    <p className="text-gray-600">by {release.artist_name}</p>
                    <div className="flex space-x-4 text-sm text-gray-500 mt-2">
                      <span className="capitalize">{release.release_type}</span>
                      <span className="capitalize">{release.status}</span>
                      {release.genre && <span>{release.genre}</span>}
                      {release.release_date && (
                        <span>{new Date(release.release_date).toLocaleDateString()}</span>
                      )}
                    </div>
                    {release.description && (
                      <p className="text-gray-700 mt-2 line-clamp-2">{release.description}</p>
                    )}
                  </div>
                  <div className="flex space-x-2 ml-4">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEdit(release);
                      }}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      Edit
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(release);
                      }}
                      className="text-red-600 hover:text-red-800"
                    >
                      Delete
                    </button>
                  </div>
                </div>
                {release.artwork_url && (
                  <img
                    src={release.artwork_url}
                    alt={release.title}
                    className="w-16 h-16 object-cover rounded mt-2"
                  />
                )}
              </div>
            ))
          )}

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="flex justify-center space-x-2">
              <button
                onClick={() => updateFilters({ page: pagination.page - 1 })}
                disabled={!pagination.hasPrev}
                className="px-3 py-1 border rounded disabled:opacity-50"
              >
                Previous
              </button>
              <span className="px-3 py-1">
                Page {pagination.page} of {pagination.totalPages}
              </span>
              <button
                onClick={() => updateFilters({ page: pagination.page + 1 })}
                disabled={!pagination.hasNext}
                className="px-3 py-1 border rounded disabled:opacity-50"
              >
                Next
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
