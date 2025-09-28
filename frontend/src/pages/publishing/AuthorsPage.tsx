import React, { useState, useEffect } from 'react';

interface Author {
  id: string;
  name: string;
  email: string;
  genre: string;
  joinDate: string;
  totalBooks: number;
  publishedBooks: number;
  totalSales: number;
  totalRevenue: number;
  status: 'active' | 'inactive' | 'pending';
  bio?: string;
  website?: string;
}

const AuthorsPage: React.FC = () => {
  const [authors, setAuthors] = useState<Author[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);

  useEffect(() => {
    // Mock data - replace with actual API call
    Promise.resolve().then(() => {
      setAuthors([
        {
          id: '1',
          name: 'Michael Chen',
          email: 'michael@example.com',
          genre: 'Programming',
          joinDate: '2023-08-15',
          totalBooks: 3,
          publishedBooks: 2,
          totalSales: 567,
          totalRevenue: 1695.43,
          status: 'active',
          bio: 'Senior software engineer with 10+ years of experience in web development.',
          website: 'https://michaelchen.dev'
        },
        {
          id: '2',
          name: 'Lisa Williams',
          email: 'lisa@example.com',
          genre: 'Programming',
          joinDate: '2023-11-22',
          totalBooks: 2,
          publishedBooks: 2,
          totalSales: 432,
          totalRevenue: 1298.68,
          status: 'active',
          bio: 'Python expert and educator with a passion for making programming accessible.',
          website: 'https://lisawilliams.tech'
        },
        {
          id: '3',
          name: 'David Brown',
          email: 'david@example.com',
          genre: 'Business',
          joinDate: '2024-01-10',
          totalBooks: 4,
          publishedBooks: 3,
          totalSales: 389,
          totalRevenue: 1167.11,
          status: 'active',
          bio: 'Digital marketing consultant and author with 15 years of industry experience.',
          website: 'https://davidbrown.marketing'
        },
        {
          id: '4',
          name: 'Sarah Kim',
          email: 'sarah@example.com',
          genre: 'Programming',
          joinDate: '2024-02-28',
          totalBooks: 1,
          publishedBooks: 0,
          totalSales: 0,
          totalRevenue: 0,
          status: 'pending',
          bio: 'React specialist and open-source contributor.',
          website: 'https://sarahkim.dev'
        },
        {
          id: '5',
          name: 'Robert Johnson',
          email: 'robert@example.com',
          genre: 'Science',
          joinDate: '2023-06-05',
          totalBooks: 2,
          publishedBooks: 1,
          totalSales: 156,
          totalRevenue: 467.44,
          status: 'inactive',
          bio: 'Physics professor and science communicator.'
        }
      ]);
      setIsLoading(false);
    });
  }, []);

  const getStatusBadge = (status: Author['status']) => {
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
    <div className="authors-page">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Authors</h2>
          <p className="text-gray-600">Manage your authors and track their publishing performance</p>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md text-sm font-medium"
        >
          Add New Author
        </button>
      </div>

      {/* Authors Table */}
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <ul className="divide-y divide-gray-200">
          {authors.map((author) => (
            <li key={author.id}>
              <div className="px-4 py-4 sm:px-6 hover:bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-12 w-12">
                      <div className="h-12 w-12 rounded-full bg-purple-100 flex items-center justify-center">
                        <span className="text-purple-600 font-medium text-lg">
                          {author.name.split(' ').map(n => n.charAt(0)).join('')}
                        </span>
                      </div>
                    </div>
                    <div className="ml-4">
                      <div className="flex items-center">
                        <div className="text-lg font-medium text-gray-900">{author.name}</div>
                        <div className="ml-2">{getStatusBadge(author.status)}</div>
                      </div>
                      <div className="text-sm text-gray-500">
                        {author.genre} • {author.email}
                      </div>
                      <div className="text-sm text-gray-500">
                        Joined {new Date(author.joinDate).toLocaleDateString()}
                      </div>
                      {author.website && (
                        <div className="text-sm text-gray-500">
                          <a href={author.website} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:text-indigo-900">
                            {author.website}
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="hidden sm:flex sm:items-center sm:space-x-6 text-sm text-gray-500">
                    <div className="text-center">
                      <div className="text-lg font-medium text-gray-900">{author.totalBooks}</div>
                      <div>Total Books</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-medium text-gray-900">{author.publishedBooks}</div>
                      <div>Published</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-medium text-gray-900">{author.totalSales.toLocaleString()}</div>
                      <div>Sales</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-medium text-gray-900">${author.totalRevenue.toFixed(2)}</div>
                      <div>Revenue</div>
                    </div>
                  </div>
                </div>
                
                {/* Mobile Stats */}
                <div className="mt-4 sm:hidden">
                  <div className="grid grid-cols-2 gap-4 text-sm text-gray-500">
                    <div>
                      <span className="font-medium text-gray-900">{author.totalBooks}</span> Total Books
                    </div>
                    <div>
                      <span className="font-medium text-gray-900">{author.publishedBooks}</span> Published
                    </div>
                    <div>
                      <span className="font-medium text-gray-900">{author.totalSales.toLocaleString()}</span> Sales
                    </div>
                    <div>
                      <span className="font-medium text-gray-900">${author.totalRevenue.toFixed(2)}</span> Revenue
                    </div>
                  </div>
                </div>

                {author.bio && (
                  <div className="mt-3">
                    <p className="text-sm text-gray-600 italic">{author.bio}</p>
                  </div>
                )}

                <div className="mt-3 flex justify-end space-x-2">
                  <button className="bg-indigo-50 text-indigo-700 hover:bg-indigo-100 px-3 py-1 rounded text-sm font-medium">
                    View Profile
                  </button>
                  <button className="bg-gray-50 text-gray-700 hover:bg-gray-100 px-3 py-1 rounded text-sm font-medium">
                    Edit
                  </button>
                  <button className="bg-green-50 text-green-700 hover:bg-green-100 px-3 py-1 rounded text-sm font-medium">
                    View Books
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>

      {/* Add Author Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-2/3 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Add New Author</h3>
              <form className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Full Name</label>
                    <input type="text" className="mt-1 block w-full border-gray-300 rounded-md shadow-sm" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Email</label>
                    <input type="email" className="mt-1 block w-full border-gray-300 rounded-md shadow-sm" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Primary Genre</label>
                    <select className="mt-1 block w-full border-gray-300 rounded-md shadow-sm">
                      <option>Select Genre</option>
                      <option>Programming</option>
                      <option>Business</option>
                      <option>Science</option>
                      <option>Fiction</option>
                      <option>Non-Fiction</option>
                      <option>Self-Help</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Website (Optional)</label>
                    <input type="url" className="mt-1 block w-full border-gray-300 rounded-md shadow-sm" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Biography</label>
                  <textarea rows={3} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm" placeholder="Brief author biography..."></textarea>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Profile Photo (Optional)</label>
                  <input type="file" accept="image/*" className="mt-1 block w-full" />
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
                    Add Author
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

export default AuthorsPage;
