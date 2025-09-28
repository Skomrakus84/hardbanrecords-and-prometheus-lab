import React, { useState, useEffect } from 'react';

interface Store {
  id: string;
  name: string;
  status: 'active' | 'inactive' | 'pending';
  totalBooks: number;
  totalSales: number;
  revenue: number;
  lastSync: string;
  commission: number;
  apiStatus: 'connected' | 'error' | 'pending';
  description: string;
}

interface BookDistribution {
  bookId: string;
  bookTitle: string;
  author: string;
  stores: Array<{
    storeName: string;
    status: 'live' | 'pending' | 'rejected' | 'processing';
    liveDate?: string;
    sales?: number;
    revenue?: number;
    lastUpdate: string;
  }>;
}

const StoresPage: React.FC = () => {
  const [stores, setStores] = useState<Store[]>([]);
  const [distributions, setDistributions] = useState<BookDistribution[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'stores' | 'distribution'>('stores');

  useEffect(() => {
    // Mock data - replace with actual API call
    Promise.resolve().then(() => {
      setStores([
        {
          id: '1',
          name: 'Amazon KDP',
          status: 'active',
          totalBooks: 18,
          totalSales: 789,
          revenue: 2367.45,
          lastSync: '2024-07-01T10:30:00Z',
          commission: 30,
          apiStatus: 'connected',
          description: 'Amazon Kindle Direct Publishing - Global ebook and print-on-demand distribution'
        },
        {
          id: '2',
          name: 'Apple Books',
          status: 'active',
          totalBooks: 15,
          totalSales: 456,
          revenue: 1368.75,
          lastSync: '2024-07-01T09:15:00Z',
          commission: 30,
          apiStatus: 'connected',
          description: 'Apple Books Store - iOS and macOS ebook distribution'
        },
        {
          id: '3',
          name: 'Google Play Books',
          status: 'active',
          totalBooks: 12,
          totalSales: 324,
          revenue: 972.15,
          lastSync: '2024-07-01T08:45:00Z',
          commission: 30,
          apiStatus: 'connected',
          description: 'Google Play Books - Android and web ebook distribution'
        },
        {
          id: '4',
          name: 'Barnes & Noble',
          status: 'pending',
          totalBooks: 8,
          totalSales: 278,
          revenue: 834.25,
          lastSync: '2024-06-30T14:20:00Z',
          commission: 35,
          apiStatus: 'pending',
          description: 'Barnes & Noble Nook - US ebook and print distribution'
        },
        {
          id: '5',
          name: 'Kobo',
          status: 'inactive',
          totalBooks: 0,
          totalSales: 0,
          revenue: 0,
          lastSync: '2024-06-25T16:00:00Z',
          commission: 30,
          apiStatus: 'error',
          description: 'Kobo eBookstore - International ebook distribution'
        },
        {
          id: '6',
          name: 'Draft2Digital',
          status: 'active',
          totalBooks: 10,
          totalSales: 156,
          revenue: 468.45,
          lastSync: '2024-07-01T07:30:00Z',
          commission: 10,
          apiStatus: 'connected',
          description: 'Draft2Digital - Multi-platform distribution aggregator'
        }
      ]);

      setDistributions([
        {
          bookId: '1',
          bookTitle: 'The Complete JavaScript Guide',
          author: 'Michael Chen',
          stores: [
            { storeName: 'Amazon KDP', status: 'live', liveDate: '2024-05-15', sales: 342, revenue: 1025.58, lastUpdate: '2024-07-01T10:30:00Z' },
            { storeName: 'Apple Books', status: 'live', liveDate: '2024-05-16', sales: 156, revenue: 468.25, lastUpdate: '2024-07-01T09:15:00Z' },
            { storeName: 'Google Play Books', status: 'live', liveDate: '2024-05-17', sales: 89, revenue: 267.15, lastUpdate: '2024-07-01T08:45:00Z' },
            { storeName: 'Barnes & Noble', status: 'pending', lastUpdate: '2024-06-30T14:20:00Z' },
            { storeName: 'Kobo', status: 'rejected', lastUpdate: '2024-06-25T16:00:00Z' }
          ]
        },
        {
          bookId: '2',
          bookTitle: 'Python for Beginners',
          author: 'Lisa Williams',
          stores: [
            { storeName: 'Amazon KDP', status: 'live', liveDate: '2024-04-20', sales: 298, revenue: 894.02, lastUpdate: '2024-07-01T10:30:00Z' },
            { storeName: 'Apple Books', status: 'live', liveDate: '2024-04-21', sales: 134, revenue: 402.15, lastUpdate: '2024-07-01T09:15:00Z' },
            { storeName: 'Google Play Books', status: 'processing', lastUpdate: '2024-07-01T08:45:00Z' },
            { storeName: 'Draft2Digital', status: 'live', liveDate: '2024-04-22', sales: 67, revenue: 201.33, lastUpdate: '2024-07-01T07:30:00Z' }
          ]
        },
        {
          bookId: '3',
          bookTitle: 'Digital Marketing Mastery',
          author: 'David Brown',
          stores: [
            { storeName: 'Amazon KDP', status: 'live', liveDate: '2024-06-01', sales: 276, revenue: 827.24, lastUpdate: '2024-07-01T10:30:00Z' },
            { storeName: 'Apple Books', status: 'live', liveDate: '2024-06-02', sales: 123, revenue: 369.77, lastUpdate: '2024-07-01T09:15:00Z' },
            { storeName: 'Google Play Books', status: 'live', liveDate: '2024-06-03', sales: 89, revenue: 267.11, lastUpdate: '2024-07-01T08:45:00Z' },
            { storeName: 'Barnes & Noble', status: 'live', liveDate: '2024-06-05', sales: 45, revenue: 135.55, lastUpdate: '2024-06-30T14:20:00Z' }
          ]
        }
      ]);

      setIsLoading(false);
    });
  }, []);

  const getStoreStatusBadge = (status: Store['status']) => {
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

  const getApiStatusBadge = (status: Store['apiStatus']) => {
    const statusConfig = {
      connected: { color: 'bg-green-100 text-green-800', label: 'Connected' },
      error: { color: 'bg-red-100 text-red-800', label: 'Error' },
      pending: { color: 'bg-yellow-100 text-yellow-800', label: 'Pending' }
    };

    const config = statusConfig[status];
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
        {config.label}
      </span>
    );
  };

  const getDistributionStatusBadge = (status: string) => {
    const statusConfig = {
      live: { color: 'bg-green-100 text-green-800', label: 'Live' },
      pending: { color: 'bg-yellow-100 text-yellow-800', label: 'Pending' },
      rejected: { color: 'bg-red-100 text-red-800', label: 'Rejected' },
      processing: { color: 'bg-blue-100 text-blue-800', label: 'Processing' }
    };

    const config = statusConfig[status as keyof typeof statusConfig];
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
    <div className="stores-page">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Online Stores</h2>
        <p className="text-gray-600">Manage your book distribution across online marketplaces</p>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('stores')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'stores'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Store Management
          </button>
          <button
            onClick={() => setActiveTab('distribution')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'distribution'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Book Distribution
          </button>
        </nav>
      </div>

      {activeTab === 'stores' && (
        <div>
          {/* Stores Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {stores.map((store) => (
              <div key={store.id} className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-lg font-medium text-gray-900">{store.name}</h3>
                    <div className="flex space-x-1">
                      {getStoreStatusBadge(store.status)}
                    </div>
                  </div>
                  
                  <div className="mb-3">
                    {getApiStatusBadge(store.apiStatus)}
                  </div>

                  <p className="text-sm text-gray-600 mb-4">{store.description}</p>
                  
                  <div className="space-y-2 text-sm text-gray-600">
                    <div className="flex justify-between">
                      <span>Books Listed:</span>
                      <span className="font-medium">{store.totalBooks}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Total Sales:</span>
                      <span className="font-medium">{store.totalSales.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Revenue:</span>
                      <span className="font-medium">${store.revenue.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Commission:</span>
                      <span className="font-medium">{store.commission}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Last Sync:</span>
                      <span className="font-medium">
                        {new Date(store.lastSync).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  <div className="mt-4 flex space-x-2">
                    <button className="flex-1 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 px-3 py-2 rounded text-sm font-medium">
                      Configure
                    </button>
                    <button className="flex-1 bg-gray-50 text-gray-700 hover:bg-gray-100 px-3 py-2 rounded text-sm font-medium">
                      Sync Now
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'distribution' && (
        <div>
          {/* Book Distribution Status */}
          <div className="space-y-6">
            {distributions.map((distribution) => (
              <div key={distribution.bookId} className="bg-white shadow rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                  <div className="mb-4">
                    <h3 className="text-lg font-medium text-gray-900">{distribution.bookTitle}</h3>
                    <p className="text-sm text-gray-500">by {distribution.author}</p>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Store
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Status
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Live Date
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Sales
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Revenue
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Last Update
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {distribution.stores.map((store, index) => (
                          <tr key={index}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              {store.storeName}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              {getDistributionStatusBadge(store.status)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {store.liveDate ? new Date(store.liveDate).toLocaleDateString() : '-'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {store.sales ? store.sales.toLocaleString() : '-'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {store.revenue ? `$${store.revenue.toFixed(2)}` : '-'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {new Date(store.lastUpdate).toLocaleDateString()}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {store.status === 'rejected' ? (
                                <button className="text-red-600 hover:text-red-900">Retry</button>
                              ) : store.status === 'pending' ? (
                                <button className="text-blue-600 hover:text-blue-900">Check Status</button>
                              ) : store.status === 'processing' ? (
                                <button className="text-yellow-600 hover:text-yellow-900">Monitor</button>
                              ) : (
                                <button className="text-indigo-600 hover:text-indigo-900">View</button>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default StoresPage;
