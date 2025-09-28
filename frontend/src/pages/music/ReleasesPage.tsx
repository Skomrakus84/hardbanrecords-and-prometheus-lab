import React, { useState, useEffect } from 'react';

interface Release {
  id: string;
  title: string;
  artist: string;
  releaseDate: string;
  status: 'draft' | 'pending' | 'live' | 'taken_down';
  tracks: number;
  coverUrl?: string;
  streamCount: number;
  revenue: number;
}

const ReleasesPage: React.FC = () => {
  const [releases, setReleases] = useState<Release[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);

  useEffect(() => {
    // Mock data - replace with actual API call
    Promise.resolve().then(() => {
      setReleases([
        {
          id: '1',
          title: 'Summer Vibes',
          artist: 'The Wave Riders',
          releaseDate: '2024-06-15',
          status: 'live',
          tracks: 12,
          streamCount: 15420,
          revenue: 450.25
        },
        {
          id: '2',
          title: 'Midnight Dreams',
          artist: 'Luna Echo',
          releaseDate: '2024-05-20',
          status: 'live',
          tracks: 8,
          streamCount: 8930,
          revenue: 320.15
        },
        {
          id: '3',
          title: 'Urban Flow',
          artist: 'Street Beats',
          releaseDate: '2024-07-01',
          status: 'pending',
          tracks: 10,
          streamCount: 0,
          revenue: 0
        }
      ]);
      setIsLoading(false);
    });
  }, []);

  const getStatusBadge = (status: Release['status']) => {
    const statusConfig = {
      draft: { color: 'bg-gray-100 text-gray-800', label: 'Draft' },
      pending: { color: 'bg-yellow-100 text-yellow-800', label: 'Pending' },
      live: { color: 'bg-green-100 text-green-800', label: 'Live' },
      taken_down: { color: 'bg-red-100 text-red-800', label: 'Taken Down' }
    };

    const config = statusConfig[status];
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
        {config.label}
      </span>
    );
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="releases-page">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Releases</h2>
          <p className="text-gray-600">Manage your music releases and track performance</p>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md text-sm font-medium"
        >
          Add New Release
        </button>
      </div>

      {/* Releases Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {releases.map((release) => (
          <div key={release.id} className="bg-white overflow-hidden shadow rounded-lg hover:shadow-md transition-shadow">
            <div className="p-5">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-medium text-gray-900 truncate">{release.title}</h3>
                {getStatusBadge(release.status)}
              </div>
              
              <p className="text-sm text-gray-500 mb-2">by {release.artist}</p>
              
              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex justify-between">
                  <span>Release Date:</span>
                  <span>{new Date(release.releaseDate).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Tracks:</span>
                  <span>{release.tracks}</span>
                </div>
                <div className="flex justify-between">
                  <span>Streams:</span>
                  <span>{release.streamCount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Revenue:</span>
                  <span>${release.revenue.toFixed(2)}</span>
                </div>
              </div>

              <div className="mt-4 flex space-x-2">
                <button className="flex-1 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 px-3 py-2 rounded text-sm font-medium">
                  Edit
                </button>
                <button className="flex-1 bg-gray-50 text-gray-700 hover:bg-gray-100 px-3 py-2 rounded text-sm font-medium">
                  View
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add Release Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-1/2 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Add New Release</h3>
              <form className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Title</label>
                  <input type="text" className="mt-1 block w-full border-gray-300 rounded-md shadow-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Artist</label>
                  <select className="mt-1 block w-full border-gray-300 rounded-md shadow-sm">
                    <option>Select Artist</option>
                    <option>The Wave Riders</option>
                    <option>Luna Echo</option>
                    <option>Street Beats</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Release Date</label>
                  <input type="date" className="mt-1 block w-full border-gray-300 rounded-md shadow-sm" />
                </div>
                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowAddForm(false)}
                    className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded text-sm"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded text-sm"
                  >
                    Create Release
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReleasesPage;
