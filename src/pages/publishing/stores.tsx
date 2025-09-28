import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

interface Store {
  id: string;
  name: string;
  platform: string;
  status: 'active' | 'pending' | 'inactive' | 'suspended';
  logo: string;
  description: string;
  commission: number;
  features: string[];
  stats: {
    totalBooks: number;
    totalSales: number;
    totalRevenue: number;
    averageRating: number;
  };
  lastSync: string;
  accountInfo: {
    accountId: string;
    email: string;
    region: string;
    currency: string;
  };
}

interface Book {
  id: string;
  title: string;
  author: string;
  cover: string;
  status: 'published' | 'pending' | 'draft' | 'rejected';
  stores: string[];
  publishedDate: string;
  salesData: {
    [storeId: string]: {
      units: number;
      revenue: number;
    };
  };
}

const StoresPage: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stores, setStores] = useState<Store[]>([]);
  const [books, setBooks] = useState<Book[]>([]);
  const [activeTab, setActiveTab] = useState<'stores' | 'distribution' | 'analytics'>('stores');
  const [selectedStore, setSelectedStore] = useState<string | null>(null);
  const [showAddStore, setShowAddStore] = useState(false);

  // Sample stores data
  const sampleStores: Store[] = [
    {
      id: 'amazon-kdp',
      name: 'Amazon Kindle Direct Publishing',
      platform: 'Amazon KDP',
      status: 'active',
      logo: 'https://via.placeholder.com/80x80/ff9900/ffffff?text=A',
      description: 'The world\'s largest ebook marketplace with global reach and excellent royalty rates.',
      commission: 30,
      features: ['Global Distribution', 'Print on Demand', 'Kindle Unlimited', 'Pre-orders', 'Marketing Tools'],
      stats: {
        totalBooks: 12,
        totalSales: 2850,
        totalRevenue: 18750.00,
        averageRating: 4.6
      },
      lastSync: '2024-03-20T10:30:00Z',
      accountInfo: {
        accountId: 'KDP-123456789',
        email: 'publisher@hardbanrecords.com',
        region: 'US',
        currency: 'USD'
      }
    },
    {
      id: 'apple-books',
      name: 'Apple Books',
      platform: 'Apple Books',
      status: 'active',
      logo: 'https://via.placeholder.com/80x80/007aff/ffffff?text=🍎',
      description: 'Premium platform with beautiful reading experience and strong presence in iOS ecosystem.',
      commission: 30,
      features: ['iOS Integration', 'Enhanced Books', 'Series Support', 'Pre-orders', 'Editorial Features'],
      stats: {
        totalBooks: 8,
        totalSales: 1250,
        totalRevenue: 8900.00,
        averageRating: 4.8
      },
      lastSync: '2024-03-20T09:15:00Z',
      accountInfo: {
        accountId: 'AB-987654321',
        email: 'publisher@hardbanrecords.com',
        region: 'US',
        currency: 'USD'
      }
    },
    {
      id: 'google-books',
      name: 'Google Play Books',
      platform: 'Google Books',
      status: 'active',
      logo: 'https://via.placeholder.com/80x80/4285f4/ffffff?text=G',
      description: 'Reach Android users worldwide with Google\'s powerful search and discovery features.',
      commission: 30,
      features: ['Android Integration', 'Search Discovery', 'Global Reach', 'Family Sharing', 'Samples'],
      stats: {
        totalBooks: 6,
        totalSales: 890,
        totalRevenue: 5340.00,
        averageRating: 4.4
      },
      lastSync: '2024-03-20T08:45:00Z',
      accountInfo: {
        accountId: 'GPB-456789123',
        email: 'publisher@hardbanrecords.com',
        region: 'US',
        currency: 'USD'
      }
    },
    {
      id: 'kobo',
      name: 'Kobo',
      platform: 'Kobo',
      status: 'pending',
      logo: 'https://via.placeholder.com/80x80/00b8d4/ffffff?text=K',
      description: 'Independent platform with strong international presence and author-friendly policies.',
      commission: 45,
      features: ['International Markets', 'DRM-Free Options', 'Author Tools', 'Reading Analytics', 'Subscription'],
      stats: {
        totalBooks: 0,
        totalSales: 0,
        totalRevenue: 0,
        averageRating: 0
      },
      lastSync: '2024-03-19T16:20:00Z',
      accountInfo: {
        accountId: 'KOBO-789123456',
        email: 'publisher@hardbanrecords.com',
        region: 'CA',
        currency: 'USD'
      }
    },
    {
      id: 'barnes-noble',
      name: 'Barnes & Noble Press',
      platform: 'Barnes & Noble',
      status: 'inactive',
      logo: 'https://via.placeholder.com/80x80/2e7d32/ffffff?text=B&N',
      description: 'Leading US bookstore chain with both digital and print distribution options.',
      commission: 65,
      features: ['Print Distribution', 'Bookstore Placement', 'NOOK Platform', 'Author Events', 'Editorial Review'],
      stats: {
        totalBooks: 3,
        totalSales: 150,
        totalRevenue: 1200.00,
        averageRating: 4.2
      },
      lastSync: '2024-03-15T14:10:00Z',
      accountInfo: {
        accountId: 'BN-321654987',
        email: 'publisher@hardbanrecords.com',
        region: 'US',
        currency: 'USD'
      }
    }
  ];

  // Sample books data
  const sampleBooks: Book[] = [
    {
      id: '1',
      title: 'The Digital Nomad\'s Guide',
      author: 'Sarah Johnson',
      cover: 'https://via.placeholder.com/300x400/3b82f6/ffffff?text=DN',
      status: 'published',
      stores: ['amazon-kdp', 'apple-books', 'google-books'],
      publishedDate: '2024-02-15',
      salesData: {
        'amazon-kdp': { units: 1250, revenue: 8750.00 },
        'apple-books': { units: 680, revenue: 4760.00 },
        'google-books': { units: 420, revenue: 2940.00 }
      }
    },
    {
      id: '4',
      title: 'Urban Gardening Secrets',
      author: 'Emma Thompson',
      cover: 'https://via.placeholder.com/300x400/059669/ffffff?text=UG',
      status: 'published',
      stores: ['amazon-kdp', 'kobo', 'barnes-noble'],
      publishedDate: '2024-01-20',
      salesData: {
        'amazon-kdp': { units: 850, revenue: 5950.00 },
        'kobo': { units: 0, revenue: 0 },
        'barnes-noble': { units: 150, revenue: 1200.00 }
      }
    },
    {
      id: '5',
      title: 'Mindful Meditation Practices',
      author: 'Dr. Michael Lee',
      cover: 'https://via.placeholder.com/300x400/8b5cf6/ffffff?text=MM',
      status: 'published',
      stores: ['amazon-kdp', 'apple-books'],
      publishedDate: '2024-03-01',
      salesData: {
        'amazon-kdp': { units: 620, revenue: 4340.00 },
        'apple-books': { units: 380, revenue: 2660.00 }
      }
    }
  ];

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        setStores(sampleStores);
        setBooks(sampleBooks);
      } catch (error) {
        console.error('Failed to load data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'inactive': return 'bg-gray-100 text-gray-800';
      case 'suspended': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return '✅';
      case 'pending': return '⏳';
      case 'inactive': return '⏸️';
      case 'suspended': return '🚫';
      default: return '📄';
    }
  };

  const handleStoreAction = (storeId: string, action: 'sync' | 'configure' | 'activate' | 'deactivate') => {
    console.log(`${action} store:`, storeId);
    // Handle store actions
  };

  const handleBookDistribution = (bookId: string, storeIds: string[]) => {
    console.log(`Distributing book ${bookId} to stores:`, storeIds);
    // Handle book distribution
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🏪</div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Loading Stores...</h2>
          <p className="text-gray-600">Please wait while we load your distribution channels.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Distribution Stores</h1>
            <p className="text-gray-600 mt-1">Manage your book distribution across multiple platforms</p>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={() => navigate('/publishing/dashboard')}
              className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-2 px-4 rounded-lg transition-colors"
            >
              📊 Dashboard
            </button>
            <button
              onClick={() => navigate('/publishing/sales')}
              className="bg-blue-100 hover:bg-blue-200 text-blue-700 font-medium py-2 px-4 rounded-lg transition-colors"
            >
              💰 Sales
            </button>
            <button
              onClick={() => setShowAddStore(true)}
              className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
            >
              ➕ Add Store
            </button>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg text-white p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium opacity-90">Active Stores</h3>
              <span className="text-2xl">🏪</span>
            </div>
            <div className="text-3xl font-bold mb-2">
              {stores.filter(s => s.status === 'active').length}
            </div>
            <div className="text-sm opacity-90">
              {stores.filter(s => s.status === 'pending').length} pending approval
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-lg text-white p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium opacity-90">Total Revenue</h3>
              <span className="text-2xl">💰</span>
            </div>
            <div className="text-3xl font-bold mb-2">
              ${stores.reduce((sum, s) => sum + s.stats.totalRevenue, 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </div>
            <div className="text-sm opacity-90">
              Across all platforms
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg text-white p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium opacity-90">Books Distributed</h3>
              <span className="text-2xl">📚</span>
            </div>
            <div className="text-3xl font-bold mb-2">
              {stores.reduce((sum, s) => sum + s.stats.totalBooks, 0)}
            </div>
            <div className="text-sm opacity-90">
              Across {stores.filter(s => s.status === 'active').length} active stores
            </div>
          </div>

          <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl shadow-lg text-white p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium opacity-90">Total Sales</h3>
              <span className="text-2xl">📈</span>
            </div>
            <div className="text-3xl font-bold mb-2">
              {stores.reduce((sum, s) => sum + s.stats.totalSales, 0).toLocaleString()}
            </div>
            <div className="text-sm opacity-90">
              Units sold
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              <button
                onClick={() => setActiveTab('stores')}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'stores'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                🏪 Store Management
              </button>
              <button
                onClick={() => setActiveTab('distribution')}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'distribution'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                📦 Book Distribution
              </button>
              <button
                onClick={() => setActiveTab('analytics')}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'analytics'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                📊 Performance Analytics
              </button>
            </nav>
          </div>

          <div className="p-6">
            {activeTab === 'stores' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {stores.map(store => (
                    <div key={store.id} className="bg-gray-50 rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center space-x-4">
                          <img src={store.logo} alt={store.name} className="w-16 h-16 rounded-lg" />
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900">{store.name}</h3>
                            <div className="flex items-center space-x-2 mt-1">
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(store.status)}`}>
                                {getStatusIcon(store.status)} {store.status}
                              </span>
                              <span className="text-sm text-gray-500">
                                {store.commission}% commission
                              </span>
                            </div>
                          </div>
                        </div>
                        <button
                          onClick={() => setSelectedStore(selectedStore === store.id ? null : store.id)}
                          className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                        >
                          {selectedStore === store.id ? '▲ Less' : '▼ More'}
                        </button>
                      </div>

                      <p className="text-gray-600 text-sm mb-4">{store.description}</p>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                        <div className="text-center">
                          <div className="text-xl font-bold text-gray-900">{store.stats.totalBooks}</div>
                          <div className="text-xs text-gray-500">Books</div>
                        </div>
                        <div className="text-center">
                          <div className="text-xl font-bold text-gray-900">{store.stats.totalSales.toLocaleString()}</div>
                          <div className="text-xs text-gray-500">Sales</div>
                        </div>
                        <div className="text-center">
                          <div className="text-xl font-bold text-gray-900">${store.stats.totalRevenue.toLocaleString()}</div>
                          <div className="text-xs text-gray-500">Revenue</div>
                        </div>
                        <div className="text-center">
                          <div className="text-xl font-bold text-gray-900">{store.stats.averageRating.toFixed(1)}</div>
                          <div className="text-xs text-gray-500">Rating</div>
                        </div>
                      </div>

                      {selectedStore === store.id && (
                        <div className="border-t border-gray-200 pt-4 space-y-4">
                          <div>
                            <h4 className="text-sm font-medium text-gray-900 mb-2">Features</h4>
                            <div className="flex flex-wrap gap-2">
                              {store.features.map(feature => (
                                <span key={feature} className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                                  {feature}
                                </span>
                              ))}
                            </div>
                          </div>

                          <div>
                            <h4 className="text-sm font-medium text-gray-900 mb-2">Account Information</h4>
                            <div className="grid grid-cols-2 gap-4 text-sm">
                              <div>
                                <span className="text-gray-500">Account ID:</span>
                                <div className="font-mono text-xs">{store.accountInfo.accountId}</div>
                              </div>
                              <div>
                                <span className="text-gray-500">Email:</span>
                                <div className="text-xs">{store.accountInfo.email}</div>
                              </div>
                              <div>
                                <span className="text-gray-500">Region:</span>
                                <div className="text-xs">{store.accountInfo.region}</div>
                              </div>
                              <div>
                                <span className="text-gray-500">Last Sync:</span>
                                <div className="text-xs">{new Date(store.lastSync).toLocaleString()}</div>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center space-x-3 pt-2">
                            {store.status === 'active' && (
                              <>
                                <button
                                  onClick={() => handleStoreAction(store.id, 'sync')}
                                  className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium py-1 px-3 rounded transition-colors"
                                >
                                  🔄 Sync Now
                                </button>
                                <button
                                  onClick={() => handleStoreAction(store.id, 'configure')}
                                  className="bg-gray-600 hover:bg-gray-700 text-white text-sm font-medium py-1 px-3 rounded transition-colors"
                                >
                                  ⚙️ Configure
                                </button>
                              </>
                            )}
                            {store.status === 'pending' && (
                              <button
                                onClick={() => handleStoreAction(store.id, 'activate')}
                                className="bg-green-600 hover:bg-green-700 text-white text-sm font-medium py-1 px-3 rounded transition-colors"
                              >
                                ✅ Activate
                              </button>
                            )}
                            {store.status === 'inactive' && (
                              <button
                                onClick={() => handleStoreAction(store.id, 'activate')}
                                className="bg-green-600 hover:bg-green-700 text-white text-sm font-medium py-1 px-3 rounded transition-colors"
                              >
                                ▶️ Reactivate
                              </button>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'distribution' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">Book Distribution Status</h3>
                  <button className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors">
                    📦 Bulk Distribute
                  </button>
                </div>

                <div className="grid grid-cols-1 gap-4">
                  {books.map(book => (
                    <div key={book.id} className="bg-gray-50 rounded-lg border border-gray-200 p-6">
                      <div className="flex items-start space-x-4">
                        <img src={book.cover} alt={book.title} className="w-16 h-24 rounded object-cover" />
                        <div className="flex-1">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <h4 className="text-lg font-semibold text-gray-900">{book.title}</h4>
                              <p className="text-gray-600">{book.author}</p>
                              <p className="text-sm text-gray-500">Published: {new Date(book.publishedDate).toLocaleDateString()}</p>
                            </div>
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(book.status)}`}>
                              {getStatusIcon(book.status)} {book.status}
                            </span>
                          </div>

                          <div className="mb-4">
                            <h5 className="text-sm font-medium text-gray-700 mb-2">Distribution Status:</h5>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                              {stores.map(store => {
                                const isDistributed = book.stores.includes(store.id);
                                const salesData = book.salesData[store.id];
                                return (
                                  <div key={store.id} className={`border rounded-lg p-3 ${isDistributed ? 'border-green-200 bg-green-50' : 'border-gray-200 bg-gray-50'}`}>
                                    <div className="flex items-center justify-between mb-2">
                                      <div className="flex items-center space-x-2">
                                        <img src={store.logo} alt={store.name} className="w-6 h-6 rounded" />
                                        <span className="text-sm font-medium text-gray-900">{store.platform}</span>
                                      </div>
                                      {isDistributed ? (
                                        <span className="text-green-600 text-xs">✅ Active</span>
                                      ) : (
                                        <span className="text-gray-400 text-xs">➕ Available</span>
                                      )}
                                    </div>
                                    {isDistributed && salesData && (
                                      <div className="text-xs text-gray-600">
                                        <div>{salesData.units} units • ${salesData.revenue.toLocaleString()}</div>
                                      </div>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          </div>

                          <div className="flex items-center space-x-3">
                            <button
                              onClick={() => handleBookDistribution(book.id, stores.map(s => s.id))}
                              className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium py-1 px-3 rounded transition-colors"
                            >
                              📦 Manage Distribution
                            </button>
                            <button
                              onClick={() => navigate(`/publishing/books/${book.id}`)}
                              className="bg-gray-600 hover:bg-gray-700 text-white text-sm font-medium py-1 px-3 rounded transition-colors"
                            >
                              📝 Edit Book
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'analytics' && (
              <div className="space-y-6">
                <div className="text-center py-12">
                  <div className="text-4xl mb-4">📊</div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Store Performance Analytics</h3>
                  <p className="text-gray-600 mb-6">
                    Detailed store performance metrics and comparative analysis will be available here.
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-2xl mx-auto">
                    <button className="bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-700 font-medium py-3 px-4 rounded-lg transition-colors">
                      📈 Revenue Comparison
                    </button>
                    <button className="bg-green-50 hover:bg-green-100 border border-green-200 text-green-700 font-medium py-3 px-4 rounded-lg transition-colors">
                      🎯 Conversion Rates
                    </button>
                    <button className="bg-purple-50 hover:bg-purple-100 border border-purple-200 text-purple-700 font-medium py-3 px-4 rounded-lg transition-colors">
                      🌍 Geographic Analysis
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Add Store Modal */}
        {showAddStore && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-6 z-50">
            <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">Add New Store</h3>
                  <button
                    onClick={() => setShowAddStore(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    ✕
                  </button>
                </div>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 cursor-pointer">
                    <h4 className="font-medium text-gray-900">Smashwords</h4>
                    <p className="text-sm text-gray-600">Global ebook distribution platform</p>
                  </div>
                  <div className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 cursor-pointer">
                    <h4 className="font-medium text-gray-900">Draft2Digital</h4>
                    <p className="text-sm text-gray-600">Multi-platform publishing service</p>
                  </div>
                  <div className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 cursor-pointer">
                    <h4 className="font-medium text-gray-900">IngramSpark</h4>
                    <p className="text-sm text-gray-600">Print and digital distribution</p>
                  </div>
                  <div className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 cursor-pointer">
                    <h4 className="font-medium text-gray-900">Lulu</h4>
                    <p className="text-sm text-gray-600">Print-on-demand and distribution</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StoresPage;
