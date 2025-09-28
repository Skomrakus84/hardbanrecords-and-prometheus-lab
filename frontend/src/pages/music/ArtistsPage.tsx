import React, { useState, useEffect } from 'react';

interface Artist {
  id: string;
  name: string;
  genre: string;
  joinDate: string;
  totalReleases: number;
  totalStreams: number;
  totalRevenue: number;
  status: 'active' | 'inactive' | 'pending';
  profileImage?: string;
}

const ArtistsPage: React.FC = () => {
  const [artists, setArtists] = useState<Artist[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);

  useEffect(() => {
    // Mock data - replace with actual API call
    Promise.resolve().then(() => {
      setArtists([
        {
          id: '1',
          name: 'The Wave Riders',
          genre: 'Electronic',
          joinDate: '2024-01-15',
          totalReleases: 3,
          totalStreams: 45200,
          totalRevenue: 1250.75,
          status: 'active'
        },
        {
          id: '2',
          name: 'Luna Echo',
          genre: 'Ambient',
          joinDate: '2024-02-20',
          totalReleases: 2,
          totalStreams: 28900,
          totalRevenue: 890.25,
          status: 'active'
        },
        {
          id: '3',
          name: 'Street Beats',
          genre: 'Hip Hop',
          joinDate: '2024-03-10',
          totalReleases: 1,
          totalStreams: 12100,
          totalRevenue: 320.50,
          status: 'pending'
        },
        {
          id: '4',
          name: 'Mystic Waves',
          genre: 'Chillout',
          joinDate: '2023-12-05',
          totalReleases: 5,
          totalStreams: 67800,
          totalRevenue: 2100.30,
          status: 'active'
        }
      ]);
      setIsLoading(false);
    });
  }, []);

  const getStatusBadge = (status: Artist['status']) => {
    const statusConfig = {
      active: { color: 'bg-green-100 text-green-800', label: 'Active' },
      inactive: { color: 'bg-gray-100 text-gray-800', label: 'Inactive' },
      pending: { color: 'bg-yellow-100 text-yellow-800', label: 'Pending' }
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
    <div className="artists-page">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Artists</h2>
          <p className="text-gray-600">Manage your artists and track their performance</p>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md text-sm font-medium"
        >
          Add New Artist
        </button>
      </div>

      {/* Artists Table */}
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <ul className="divide-y divide-gray-200">
          {artists.map((artist) => (
            <li key={artist.id}>
              <div className="px-4 py-4 sm:px-6 hover:bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-12 w-12">
                      <div className="h-12 w-12 rounded-full bg-indigo-100 flex items-center justify-center">
                        <span className="text-indigo-600 font-medium text-lg">
                          {artist.name.charAt(0)}
                        </span>
                      </div>
                    </div>
                    <div className="ml-4">
                      <div className="flex items-center">
                        <div className="text-lg font-medium text-gray-900">{artist.name}</div>
                        <div className="ml-2">{getStatusBadge(artist.status)}</div>
                      </div>
                      <div className="text-sm text-gray-500">
                        {artist.genre} • Joined {new Date(artist.joinDate).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                  <div className="hidden sm:flex sm:items-center sm:space-x-6 text-sm text-gray-500">
                    <div className="text-center">
                      <div className="text-lg font-medium text-gray-900">{artist.totalReleases}</div>
                      <div>Releases</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-medium text-gray-900">{artist.totalStreams.toLocaleString()}</div>
                      <div>Streams</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-medium text-gray-900">${artist.totalRevenue.toFixed(2)}</div>
                      <div>Revenue</div>
                    </div>
                  </div>
                </div>
                
                {/* Mobile Stats */}
                <div className="mt-4 sm:hidden">
                  <div className="flex justify-between text-sm text-gray-500">
                    <div>
                      <span className="font-medium text-gray-900">{artist.totalReleases}</span> Releases
                    </div>
                    <div>
                      <span className="font-medium text-gray-900">{artist.totalStreams.toLocaleString()}</span> Streams
                    </div>
                    <div>
                      <span className="font-medium text-gray-900">${artist.totalRevenue.toFixed(2)}</span> Revenue
                    </div>
                  </div>
                </div>

                <div className="mt-2 flex justify-end space-x-2">
                  <button className="bg-indigo-50 text-indigo-700 hover:bg-indigo-100 px-3 py-1 rounded text-sm font-medium">
                    View Profile
                  </button>
                  <button className="bg-gray-50 text-gray-700 hover:bg-gray-100 px-3 py-1 rounded text-sm font-medium">
                    Edit
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>

      {/* Add Artist Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-1/2 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Add New Artist</h3>
              <form className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Artist Name</label>
                  <input type="text" className="mt-1 block w-full border-gray-300 rounded-md shadow-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Genre</label>
                  <select className="mt-1 block w-full border-gray-300 rounded-md shadow-sm">
                    <option>Select Genre</option>
                    <option>Electronic</option>
                    <option>Hip Hop</option>
                    <option>Rock</option>
                    <option>Pop</option>
                    <option>Ambient</option>
                    <option>Chillout</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Contact Email</label>
                  <input type="email" className="mt-1 block w-full border-gray-300 rounded-md shadow-sm" />
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
                    Add Artist
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

export default ArtistsPage;
