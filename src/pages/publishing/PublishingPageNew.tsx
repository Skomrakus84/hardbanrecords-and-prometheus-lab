import React, { useState } from 'react';

interface Book {
  id: string;
  title: string;
  author: string;
  genre: string;
  status: 'draft' | 'published' | 'archived';
  publishedAt?: string;
  sales: number;
  revenue: number;
  rating: number;
  reviews: number;
  pages: number;
  cover: string;
  platforms: string[];
}

interface Store {
  id: string;
  name: string;
  icon: string;
  color: string;
  status: 'connected' | 'disconnected' | 'pending';
  sales: number;
  revenue: number;
  commission: number;
}

const PublishingPageNew: React.FC = () => {
  const [selectedTab, setSelectedTab] = useState<'overview' | 'books' | 'stores' | 'analytics'>('overview');
  const [showAddBookModal, setShowAddBookModal] = useState(false);

  const books: Book[] = [
    {
      id: '1',
      title: 'Digital Future: A Guide to Modern Technology',
      author: 'Alex Chen',
      genre: 'Technology',
      status: 'published',
      publishedAt: '2024-01-15',
      sales: 1247,
      revenue: 8729,
      rating: 4.6,
      reviews: 89,
      pages: 285,
      cover: '📚',
      platforms: ['Amazon KDP', 'Apple Books', 'Google Play Books']
    },
    {
      id: '2',
      title: 'Songwriting Mastery: From Melody to Hit',
      author: 'Sarah Johnson',
      genre: 'Music Education',
      status: 'published',
      publishedAt: '2024-02-20',
      sales: 892,
      revenue: 6244,
      rating: 4.8,
      reviews: 124,
      pages: 340,
      cover: '🎵',
      platforms: ['Amazon KDP', 'Apple Books']
    },
    {
      id: '3',
      title: 'The Art of Electronic Music Production',
      author: 'Mike Rodriguez',
      genre: 'Music Production',
      status: 'draft',
      sales: 0,
      revenue: 0,
      rating: 0,
      reviews: 0,
      pages: 420,
      cover: '🎧',
      platforms: []
    },
    {
      id: '4',
      title: 'Music Business in the Digital Age',
      author: 'Emma Wilson',
      genre: 'Business',
      status: 'published',
      publishedAt: '2024-03-10',
      sales: 567,
      revenue: 3969,
      rating: 4.4,
      reviews: 45,
      pages: 195,
      cover: '💼',
      platforms: ['Amazon KDP', 'Apple Books', 'Google Play Books', 'Kobo']
    }
  ];

  const stores: Store[] = [
    {
      id: 'amazon-kdp',
      name: 'Amazon KDP',
      icon: '📦',
      color: 'bg-orange-500',
      status: 'connected',
      sales: 1850,
      revenue: 12940,
      commission: 30
    },
    {
      id: 'apple-books',
      name: 'Apple Books',
      icon: '🍎',
      color: 'bg-gray-800',
      status: 'connected',
      sales: 645,
      revenue: 4515,
      commission: 30
    },
    {
      id: 'google-play',
      name: 'Google Play Books',
      icon: '📖',
      color: 'bg-blue-500',
      status: 'connected',
      sales: 420,
      revenue: 2940,
      commission: 30
    },
    {
      id: 'kobo',
      name: 'Kobo',
      icon: '📚',
      color: 'bg-indigo-500',
      status: 'pending',
      sales: 180,
      revenue: 1260,
      commission: 35
    },
    {
      id: 'barnes-noble',
      name: 'Barnes & Noble',
      icon: '🏪',
      color: 'bg-green-600',
      status: 'disconnected',
      sales: 0,
      revenue: 0,
      commission: 25
    },
    {
      id: 'smashwords',
      name: 'Smashwords',
      icon: '📑',
      color: 'bg-purple-500',
      status: 'disconnected',
      sales: 0,
      revenue: 0,
      commission: 15
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published': return 'bg-green-100 text-green-800';
      case 'draft': return 'bg-gray-100 text-gray-800';
      case 'archived': return 'bg-red-100 text-red-800';
      case 'connected': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'disconnected': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatNumber = (num: number) => {
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const totalSales = books.reduce((sum, book) => sum + book.sales, 0);
  const totalRevenue = books.reduce((sum, book) => sum + book.revenue, 0);
  const publishedBooks = books.filter(book => book.status === 'published').length;
  const avgRating = books.filter(book => book.rating > 0).reduce((sum, book) => sum + book.rating, 0) / books.filter(book => book.rating > 0).length;

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">📚 Publishing Dashboard</h1>
            <p className="text-gray-600 mt-2">Manage your book publishing and digital distribution</p>
          </div>
          <button
            onClick={() => setShowAddBookModal(true)}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors flex items-center space-x-2"
          >
            <span>➕</span>
            <span>Add New Book</span>
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex space-x-1 bg-gray-200 rounded-lg p-1">
          {(['overview', 'books', 'stores', 'analytics'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setSelectedTab(tab)}
              className={`px-4 py-2 rounded-md font-medium text-sm transition-colors ${
                selectedTab === tab
                  ? 'bg-white text-indigo-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {tab === 'overview' ? '📊 Overview' :
               tab === 'books' ? '📚 Books' :
               tab === 'stores' ? '🏪 Stores' : '📈 Analytics'}
            </button>
          ))}
        </div>
      </div>

      {/* Overview Tab */}
      {selectedTab === 'overview' && (
        <div className="space-y-8">
          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl shadow-lg p-6 text-white">
              <div className="flex items-center justify-between mb-4">
                <div className="text-3xl">📚</div>
                <div className="text-2xl">📈</div>
              </div>
              <h3 className="text-2xl font-bold mb-1">{publishedBooks}</h3>
              <p className="text-lg font-medium opacity-90 mb-1">Published Books</p>
              <p className="text-sm opacity-75">+2 this month</p>
            </div>

            <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-xl shadow-lg p-6 text-white">
              <div className="flex items-center justify-between mb-4">
                <div className="text-3xl">💰</div>
                <div className="text-2xl">📈</div>
              </div>
              <h3 className="text-2xl font-bold mb-1">${totalRevenue.toLocaleString()}</h3>
              <p className="text-lg font-medium opacity-90 mb-1">Total Revenue</p>
              <p className="text-sm opacity-75">+15% vs last month</p>
            </div>

            <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl shadow-lg p-6 text-white">
              <div className="flex items-center justify-between mb-4">
                <div className="text-3xl">📖</div>
                <div className="text-2xl">🚀</div>
              </div>
              <h3 className="text-2xl font-bold mb-1">{formatNumber(totalSales)}</h3>
              <p className="text-lg font-medium opacity-90 mb-1">Total Sales</p>
              <p className="text-sm opacity-75">+8% vs last month</p>
            </div>

            <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-xl shadow-lg p-6 text-white">
              <div className="flex items-center justify-between mb-4">
                <div className="text-3xl">⭐</div>
                <div className="text-2xl">📈</div>
              </div>
              <h3 className="text-2xl font-bold mb-1">{avgRating.toFixed(1)}</h3>
              <p className="text-lg font-medium opacity-90 mb-1">Average Rating</p>
              <p className="text-sm opacity-75">From {books.reduce((sum, book) => sum + book.reviews, 0)} reviews</p>
            </div>
          </div>

          {/* Recent Books & Top Performers */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
            {/* Recent Books */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Recent Publications</h2>
              <div className="space-y-4">
                {books.filter(book => book.status === 'published').slice(0, 3).map((book) => (
                  <div key={book.id} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                    <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-blue-500 rounded-lg flex items-center justify-center text-2xl">
                      {book.cover}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 truncate">{book.title}</h3>
                      <p className="text-sm text-gray-600">{book.author} • {book.genre}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">{formatNumber(book.sales)}</p>
                      <p className="text-sm text-gray-600">sales</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Store Performance */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Store Performance</h2>
              <div className="space-y-4">
                {stores.filter(store => store.status === 'connected').map((store) => (
                  <div key={store.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className={`w-10 h-10 ${store.color} rounded-lg flex items-center justify-center text-white font-semibold text-sm`}>
                        {store.icon}
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">{store.name}</h3>
                        <p className="text-sm text-gray-600">{formatNumber(store.sales)} sales</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">${store.revenue.toLocaleString()}</p>
                      <p className="text-sm text-gray-600">{store.commission}% fee</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Books Tab */}
      {selectedTab === 'books' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {books.map((book) => (
            <div
              key={book.id}
              className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden hover:shadow-xl transition-all hover:-translate-y-1"
            >
              {/* Book Header */}
              <div className="p-6 border-b border-gray-100">
                <div className="flex items-start space-x-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-blue-500 rounded-lg flex items-center justify-center text-2xl">
                    {book.cover}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-semibold text-gray-900 truncate">{book.title}</h3>
                    <p className="text-sm text-gray-600">{book.author}</p>
                    <div className="flex items-center space-x-2 mt-2">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(book.status)}`}>
                        {book.status.toUpperCase()}
                      </span>
                      <span className="text-xs text-gray-500">{book.pages} pages</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Book Stats */}
              <div className="p-6 border-b border-gray-100">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wider">Sales</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {book.sales > 0 ? formatNumber(book.sales) : '—'}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wider">Revenue</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {book.revenue > 0 ? `$${book.revenue.toLocaleString()}` : '—'}
                    </p>
                  </div>
                </div>
                {book.rating > 0 && (
                  <div className="mt-4">
                    <p className="text-xs text-gray-500 uppercase tracking-wider">Rating</p>
                    <div className="flex items-center space-x-2">
                      <span className="text-lg font-semibold text-gray-900">{book.rating.toFixed(1)}</span>
                      <div className="flex text-yellow-400">
                        {'★'.repeat(Math.floor(book.rating))}
                      </div>
                      <span className="text-sm text-gray-600">({book.reviews})</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Platforms & Actions */}
              <div className="p-6">
                <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">Available On</p>
                <div className="flex flex-wrap gap-2 mb-4">
                  {book.platforms.length > 0 ? book.platforms.map((platform, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-700"
                    >
                      {platform}
                    </span>
                  )) : (
                    <span className="text-sm text-gray-500">Not published yet</span>
                  )}
                </div>

                <div className="flex space-x-2">
                  <button className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium py-2 px-3 rounded-md transition-colors">
                    Edit
                  </button>
                  <button className="flex-1 bg-indigo-100 hover:bg-indigo-200 text-indigo-700 text-sm font-medium py-2 px-3 rounded-md transition-colors">
                    Analytics
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Stores Tab */}
      {selectedTab === 'stores' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {stores.map((store) => (
            <div
              key={store.id}
              className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden hover:shadow-xl transition-all"
            >
              <div className="p-6 border-b border-gray-100">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className={`w-12 h-12 ${store.color} rounded-lg flex items-center justify-center text-2xl`}>
                      {store.icon}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{store.name}</h3>
                      <p className="text-sm text-gray-600">{store.commission}% commission</p>
                    </div>
                  </div>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(store.status)}`}>
                    {store.status.toUpperCase()}
                  </span>
                </div>
              </div>

              <div className="p-6 border-b border-gray-100">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wider">Sales</p>
                    <p className="text-lg font-semibold text-gray-900">{formatNumber(store.sales)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wider">Revenue</p>
                    <p className="text-lg font-semibold text-gray-900">${store.revenue.toLocaleString()}</p>
                  </div>
                </div>
              </div>

              <div className="p-6">
                <div className="flex space-x-2">
                  {store.status === 'connected' ? (
                    <>
                      <button className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium py-2 px-3 rounded-md transition-colors">
                        Settings
                      </button>
                      <button className="flex-1 bg-red-100 hover:bg-red-200 text-red-700 text-sm font-medium py-2 px-3 rounded-md transition-colors">
                        Disconnect
                      </button>
                    </>
                  ) : (
                    <button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium py-2 px-3 rounded-md transition-colors">
                      Connect
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Analytics Tab */}
      {selectedTab === 'analytics' && (
        <div className="space-y-6">
          {/* Analytics Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl shadow-lg p-6 text-white">
              <h3 className="text-lg font-medium opacity-90 mb-2">Monthly Sales</h3>
              <p className="text-3xl font-bold mb-1">2,706</p>
              <p className="text-sm opacity-75">+12% from last month</p>
            </div>
            <div className="bg-gradient-to-r from-green-500 to-teal-600 rounded-xl shadow-lg p-6 text-white">
              <h3 className="text-lg font-medium opacity-90 mb-2">Conversion Rate</h3>
              <p className="text-3xl font-bold mb-1">3.2%</p>
              <p className="text-sm opacity-75">+0.5% from last month</p>
            </div>
            <div className="bg-gradient-to-r from-orange-500 to-red-600 rounded-xl shadow-lg p-6 text-white">
              <h3 className="text-lg font-medium opacity-90 mb-2">Avg. Rating</h3>
              <p className="text-3xl font-bold mb-1">{avgRating.toFixed(1)} ★</p>
              <p className="text-sm opacity-75">From 258 reviews</p>
            </div>
          </div>

          {/* Sales Chart Placeholder */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Sales Analytics</h3>
            <div className="h-64 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg flex items-center justify-center">
              <div className="text-center">
                <div className="text-4xl mb-2">📊</div>
                <p className="text-gray-600 font-medium">Publishing Analytics Chart</p>
                <p className="text-sm text-gray-500 mt-1">Sales trends and performance metrics</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Book Modal */}
      {showAddBookModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-screen overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900">Add New Book</h2>
                <button
                  onClick={() => setShowAddBookModal(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  ✕
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900">Book Information</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Book Title</label>
                    <input
                      type="text"
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      placeholder="Enter book title"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Author Name</label>
                    <input
                      type="text"
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      placeholder="Enter author name"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Genre</label>
                    <select className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500">
                      <option value="">Select genre</option>
                      <option value="fiction">Fiction</option>
                      <option value="non-fiction">Non-Fiction</option>
                      <option value="technology">Technology</option>
                      <option value="business">Business</option>
                      <option value="music">Music</option>
                      <option value="education">Education</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Page Count</label>
                    <input
                      type="number"
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      placeholder="Number of pages"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    rows={3}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="Book description and synopsis..."
                  />
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900">Publishing Options</h3>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Target Stores</label>
                  <div className="grid grid-cols-2 gap-3">
                    {stores.map((store) => (
                      <label key={store.id} className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="checkbox"
                          className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                        />
                        <span className="text-sm text-gray-700">{store.name}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex space-x-3 pt-4 border-t border-gray-200">
                <button
                  onClick={() => setShowAddBookModal(false)}
                  className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-2 px-4 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors">
                  Create Book
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PublishingPageNew;
