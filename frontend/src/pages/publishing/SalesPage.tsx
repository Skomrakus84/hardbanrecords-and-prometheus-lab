import React, { useState, useEffect } from 'react';

interface SaleRecord {
  id: string;
  bookTitle: string;
  author: string;
  store: string;
  date: string;
  quantity: number;
  unitPrice: number;
  totalAmount: number;
  royaltyRate: number;
  authorRoyalty: number;
  publisherShare: number;
}

interface SalesAnalytics {
  totalSales: number;
  totalRevenue: number;
  totalRoyalties: number;
  totalUnits: number;
  averagePrice: number;
  topBooks: Array<{ title: string; author: string; sales: number; revenue: number }>;
  salesByStore: Array<{ store: string; sales: number; percentage: number }>;
  monthlySales: Array<{ month: string; sales: number; revenue: number }>;
}

const SalesPage: React.FC = () => {
  const [salesRecords, setSalesRecords] = useState<SaleRecord[]>([]);
  const [analytics, setAnalytics] = useState<SalesAnalytics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState('30d');

  useEffect(() => {
    // Mock data - replace with actual API call
    Promise.resolve().then(() => {
      setSalesRecords([
        {
          id: '1',
          bookTitle: 'The Complete JavaScript Guide',
          author: 'Michael Chen',
          store: 'Amazon KDP',
          date: '2024-07-01',
          quantity: 15,
          unitPrice: 29.99,
          totalAmount: 449.85,
          royaltyRate: 0.70,
          authorRoyalty: 314.90,
          publisherShare: 134.95
        },
        {
          id: '2',
          bookTitle: 'Python for Beginners',
          author: 'Lisa Williams',
          store: 'Apple Books',
          date: '2024-07-01',
          quantity: 8,
          unitPrice: 24.99,
          totalAmount: 199.92,
          royaltyRate: 0.70,
          authorRoyalty: 139.94,
          publisherShare: 59.98
        },
        {
          id: '3',
          bookTitle: 'Digital Marketing Mastery',
          author: 'David Brown',
          store: 'Google Play Books',
          date: '2024-06-30',
          quantity: 12,
          unitPrice: 19.99,
          totalAmount: 239.88,
          royaltyRate: 0.70,
          authorRoyalty: 167.92,
          publisherShare: 71.96
        },
        {
          id: '4',
          bookTitle: 'The Complete JavaScript Guide',
          author: 'Michael Chen',
          store: 'Barnes & Noble',
          date: '2024-06-29',
          quantity: 6,
          unitPrice: 29.99,
          totalAmount: 179.94,
          royaltyRate: 0.70,
          authorRoyalty: 125.96,
          publisherShare: 53.98
        },
        {
          id: '5',
          bookTitle: 'Python for Beginners',
          author: 'Lisa Williams',
          store: 'Amazon KDP',
          date: '2024-06-28',
          quantity: 22,
          unitPrice: 24.99,
          totalAmount: 549.78,
          royaltyRate: 0.70,
          authorRoyalty: 384.85,
          publisherShare: 164.93
        }
      ]);

      setAnalytics({
        totalSales: 1847,
        totalRevenue: 5543.21,
        totalRoyalties: 3880.25,
        totalUnits: 1847,
        averagePrice: 27.45,
        topBooks: [
          { title: 'The Complete JavaScript Guide', author: 'Michael Chen', sales: 342, revenue: 1025.58 },
          { title: 'Python for Beginners', author: 'Lisa Williams', sales: 298, revenue: 894.02 },
          { title: 'Digital Marketing Mastery', author: 'David Brown', sales: 276, revenue: 827.24 }
        ],
        salesByStore: [
          { store: 'Amazon KDP', sales: 789, percentage: 42.7 },
          { store: 'Apple Books', sales: 456, percentage: 24.7 },
          { store: 'Google Play Books', sales: 324, percentage: 17.5 },
          { store: 'Barnes & Noble', sales: 278, percentage: 15.1 }
        ],
        monthlySales: [
          { month: 'June 2024', sales: 1245, revenue: 3742.15 },
          { month: 'May 2024', sales: 1098, revenue: 3294.42 },
          { month: 'April 2024', sales: 956, revenue: 2868.44 },
          { month: 'March 2024', sales: 834, revenue: 2502.66 }
        ]
      });

      setIsLoading(false);
    });
  }, [selectedPeriod]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!analytics) return null;

  return (
    <div className="sales-page">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Sales Analytics</h2>
          <p className="text-gray-600">Track book sales performance and revenue analytics</p>
        </div>
        <select 
          value={selectedPeriod}
          onChange={(e) => setSelectedPeriod(e.target.value)}
          className="border-gray-300 rounded-md shadow-sm"
        >
          <option value="7d">Last 7 days</option>
          <option value="30d">Last 30 days</option>
          <option value="90d">Last 90 days</option>
          <option value="1y">Last year</option>
        </select>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-green-500 rounded-md flex items-center justify-center">
                  <span className="text-white font-bold">💰</span>
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Total Revenue</dt>
                  <dd className="text-lg font-medium text-gray-900">${analytics.totalRevenue.toFixed(2)}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-blue-500 rounded-md flex items-center justify-center">
                  <span className="text-white font-bold">📖</span>
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Units Sold</dt>
                  <dd className="text-lg font-medium text-gray-900">{analytics.totalUnits.toLocaleString()}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-purple-500 rounded-md flex items-center justify-center">
                  <span className="text-white font-bold">👥</span>
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Author Royalties</dt>
                  <dd className="text-lg font-medium text-gray-900">${analytics.totalRoyalties.toFixed(2)}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-yellow-500 rounded-md flex items-center justify-center">
                  <span className="text-white font-bold">💵</span>
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Avg Price</dt>
                  <dd className="text-lg font-medium text-gray-900">${analytics.averagePrice.toFixed(2)}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-red-500 rounded-md flex items-center justify-center">
                  <span className="text-white font-bold">🏪</span>
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Active Stores</dt>
                  <dd className="text-lg font-medium text-gray-900">{analytics.salesByStore.length}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Top Performing Books */}
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Top Performing Books</h3>
          <div className="space-y-4">
            {analytics.topBooks.map((book, index) => (
              <div key={index} className="flex justify-between items-center">
                <div>
                  <div className="text-sm font-medium text-gray-900">{book.title}</div>
                  <div className="text-sm text-gray-500">by {book.author}</div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium text-gray-900">{book.sales} sales</div>
                  <div className="text-sm text-gray-500">${book.revenue.toFixed(2)}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Sales by Store */}
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Sales by Store</h3>
          <div className="space-y-4">
            {analytics.salesByStore.map((store, index) => (
              <div key={store.store} className="flex items-center">
                <div className="flex-1">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm font-medium text-gray-900">{store.store}</span>
                    <span className="text-sm text-gray-500">{store.sales} sales</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${
                        index === 0 ? 'bg-green-500' : 
                        index === 1 ? 'bg-blue-500' : 
                        index === 2 ? 'bg-yellow-500' : 'bg-purple-500'
                      }`}
                      style={{ width: `${store.percentage}%` }}
                    ></div>
                  </div>
                </div>
                <div className="ml-4 text-sm text-gray-500">
                  {store.percentage}%
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Sales */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Recent Sales</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Book / Author
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Store
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Quantity
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Unit Price
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Author Royalty
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {salesRecords.map((record) => (
                  <tr key={record.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{record.bookTitle}</div>
                        <div className="text-sm text-gray-500">by {record.author}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {record.store}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(record.date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {record.quantity}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      ${record.unitPrice.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      ${record.totalAmount.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600 font-medium">
                      ${record.authorRoyalty.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SalesPage;
