import React, { useState, useEffect } from 'react';
import SalesAnalytics from '../../components/publishing/SalesAnalytics';
import { useNavigate } from 'react-router-dom';

interface SalesData {
  date: string;
  units: number;
  revenue: number;
  platform: string;
}

interface Book {
  id: string;
  title: string;
  author: string;
  cover: string;
  totalSales: number;
  totalRevenue: number;
  averageRating: number;
  platforms: string[];
}

interface PayoutData {
  id: string;
  amount: number;
  date: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  platform: string;
  books: Array<{
    bookId: string;
    title: string;
    amount: number;
  }>;
}

interface SalesPageData {
  books: Book[];
  salesData: SalesData[];
  payouts: PayoutData[];
  salesSummary: {
    totalRevenue: number;
    totalUnits: number;
    totalBooks: number;
    averageRating: number;
    monthlyGrowth: number;
    topPlatform: string;
  };
}

const SalesPage: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [salesData, setSalesData] = useState<SalesPageData | null>(null);
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | '1y' | 'all'>('30d');
  const [activeTab, setActiveTab] = useState<'analytics' | 'payouts' | 'reports'>('analytics');

  // Sample sales data
  const sampleSalesData: SalesPageData = {
    books: [
      {
        id: '1',
        title: 'The Digital Nomad\'s Guide',
        author: 'Sarah Johnson',
        cover: 'https://via.placeholder.com/300x400/3b82f6/ffffff?text=DN',
        totalSales: 1250,
        totalRevenue: 12500.00,
        averageRating: 4.8,
        platforms: ['Amazon KDP', 'Apple Books', 'Google Books']
      },
      {
        id: '4',
        title: 'Urban Gardening Secrets',
        author: 'Emma Thompson',
        cover: 'https://via.placeholder.com/300x400/059669/ffffff?text=UG',
        totalSales: 850,
        totalRevenue: 6800.00,
        averageRating: 4.6,
        platforms: ['Amazon KDP', 'Kobo', 'Barnes & Noble']
      },
      {
        id: '5',
        title: 'Mindful Meditation Practices',
        author: 'Dr. Michael Lee',
        cover: 'https://via.placeholder.com/300x400/8b5cf6/ffffff?text=MM',
        totalSales: 620,
        totalRevenue: 4960.00,
        averageRating: 4.9,
        platforms: ['Amazon KDP', 'Apple Books', 'Smashwords']
      },
      {
        id: '6',
        title: 'Home Chef Mastery',
        author: 'Isabella Garcia',
        cover: 'https://via.placeholder.com/300x400/f59e0b/ffffff?text=HC',
        totalSales: 450,
        totalRevenue: 3600.00,
        averageRating: 4.4,
        platforms: ['Amazon KDP', 'Draft2Digital', 'Kobo']
      },
      {
        id: '7',
        title: 'Financial Freedom Blueprint',
        author: 'Robert Kim',
        cover: 'https://via.placeholder.com/300x400/10b981/ffffff?text=FF',
        totalSales: 380,
        totalRevenue: 3040.00,
        averageRating: 4.7,
        platforms: ['Amazon KDP', 'Apple Books', 'Barnes & Noble']
      }
    ],
    salesData: [
      { date: '2024-03-01', units: 45, revenue: 450.00, platform: 'Amazon KDP' },
      { date: '2024-03-01', units: 32, revenue: 320.00, platform: 'Apple Books' },
      { date: '2024-03-01', units: 18, revenue: 180.00, platform: 'Google Books' },
      { date: '2024-03-02', units: 52, revenue: 520.00, platform: 'Amazon KDP' },
      { date: '2024-03-02', units: 28, revenue: 280.00, platform: 'Apple Books' },
      { date: '2024-03-02', units: 22, revenue: 220.00, platform: 'Kobo' },
      { date: '2024-03-03', units: 38, revenue: 380.00, platform: 'Amazon KDP' },
      { date: '2024-03-03', units: 35, revenue: 350.00, platform: 'Apple Books' },
      { date: '2024-03-03', units: 15, revenue: 150.00, platform: 'Barnes & Noble' },
      { date: '2024-03-04', units: 60, revenue: 600.00, platform: 'Amazon KDP' },
      { date: '2024-03-04', units: 40, revenue: 400.00, platform: 'Apple Books' },
      { date: '2024-03-04', units: 25, revenue: 250.00, platform: 'Google Books' },
      { date: '2024-03-05', units: 48, revenue: 480.00, platform: 'Amazon KDP' },
      { date: '2024-03-05', units: 33, revenue: 330.00, platform: 'Kobo' },
      { date: '2024-03-05', units: 20, revenue: 200.00, platform: 'Smashwords' },
      { date: '2024-03-06', units: 55, revenue: 550.00, platform: 'Amazon KDP' },
      { date: '2024-03-06', units: 42, revenue: 420.00, platform: 'Apple Books' },
      { date: '2024-03-06', units: 30, revenue: 300.00, platform: 'Draft2Digital' },
      { date: '2024-03-07', units: 43, revenue: 430.00, platform: 'Amazon KDP' },
      { date: '2024-03-07', units: 37, revenue: 370.00, platform: 'Apple Books' },
      { date: '2024-03-07', units: 28, revenue: 280.00, platform: 'Google Books' }
    ],
    payouts: [
      {
        id: 'payout-001',
        amount: 2850.00,
        date: '2024-03-15',
        status: 'completed',
        platform: 'Amazon KDP',
        books: [
          { bookId: '1', title: 'The Digital Nomad\'s Guide', amount: 1250.00 },
          { bookId: '4', title: 'Urban Gardening Secrets', amount: 950.00 },
          { bookId: '5', title: 'Mindful Meditation Practices', amount: 650.00 }
        ]
      },
      {
        id: 'payout-002',
        amount: 1420.00,
        date: '2024-03-10',
        status: 'completed',
        platform: 'Apple Books',
        books: [
          { bookId: '1', title: 'The Digital Nomad\'s Guide', amount: 680.00 },
          { bookId: '5', title: 'Mindful Meditation Practices', amount: 450.00 },
          { bookId: '6', title: 'Home Chef Mastery', amount: 290.00 }
        ]
      },
      {
        id: 'payout-003',
        amount: 890.00,
        date: '2024-03-28',
        status: 'processing',
        platform: 'Kobo',
        books: [
          { bookId: '4', title: 'Urban Gardening Secrets', amount: 380.00 },
          { bookId: '6', title: 'Home Chef Mastery', amount: 310.00 },
          { bookId: '7', title: 'Financial Freedom Blueprint', amount: 200.00 }
        ]
      },
      {
        id: 'payout-004',
        amount: 650.00,
        date: '2024-04-01',
        status: 'pending',
        platform: 'Google Books',
        books: [
          { bookId: '1', title: 'The Digital Nomad\'s Guide', amount: 350.00 },
          { bookId: '5', title: 'Mindful Meditation Practices', amount: 300.00 }
        ]
      }
    ],
    salesSummary: {
      totalRevenue: 30900.00,
      totalUnits: 3550,
      totalBooks: 5,
      averageRating: 4.68,
      monthlyGrowth: 15.2,
      topPlatform: 'Amazon KDP'
    }
  };

  useEffect(() => {
    const loadSalesData = async () => {
      setLoading(true);
      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        setSalesData(sampleSalesData);
      } catch (error) {
        console.error('Failed to load sales data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadSalesData();
  }, []);

  const handleExportData = (format: 'csv' | 'pdf' | 'xlsx') => {
    console.log(`Exporting sales data in ${format} format`);
    // Handle data export
  };

  const handleBookSelect = (bookId: string) => {
    navigate(`/publishing/books/${bookId}`);
  };

  const getPayoutStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'processing': return 'bg-yellow-100 text-yellow-800';
      case 'pending': return 'bg-blue-100 text-blue-800';
      case 'failed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPayoutStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return '✅';
      case 'processing': return '⏳';
      case 'pending': return '⏰';
      case 'failed': return '❌';
      default: return '📄';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">💰</div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Loading Sales Data...</h2>
          <p className="text-gray-600">Please wait while we load your sales analytics.</p>
        </div>
      </div>
    );
  }

  if (!salesData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">❌</div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Failed to Load Sales Data</h2>
          <p className="text-gray-600 mb-4">There was an error loading your sales analytics.</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
          >
            Try Again
          </button>
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
            <h1 className="text-3xl font-bold text-gray-900">Sales & Revenue</h1>
            <p className="text-gray-600 mt-1">Track your book sales and earnings across all platforms</p>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={() => navigate('/publishing/library')}
              className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-2 px-4 rounded-lg transition-colors"
            >
              📚 Library
            </button>
            <button
              onClick={() => navigate('/publishing/dashboard')}
              className="bg-blue-100 hover:bg-blue-200 text-blue-700 font-medium py-2 px-4 rounded-lg transition-colors"
            >
              📊 Dashboard
            </button>
            <button
              onClick={() => handleExportData('pdf')}
              className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
            >
              📄 Export Report
            </button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-lg text-white p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium opacity-90">Total Revenue</h3>
              <span className="text-2xl">💰</span>
            </div>
            <div className="text-3xl font-bold mb-2">
              ${salesData.salesSummary.totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </div>
            <div className="text-sm opacity-90">
              +{salesData.salesSummary.monthlyGrowth}% this month
            </div>
          </div>

          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg text-white p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium opacity-90">Units Sold</h3>
              <span className="text-2xl">📚</span>
            </div>
            <div className="text-3xl font-bold mb-2">
              {salesData.salesSummary.totalUnits.toLocaleString()}
            </div>
            <div className="text-sm opacity-90">
              Across {salesData.salesSummary.totalBooks} books
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg text-white p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium opacity-90">Average Rating</h3>
              <span className="text-2xl">⭐</span>
            </div>
            <div className="text-3xl font-bold mb-2">
              {salesData.salesSummary.averageRating.toFixed(1)}
            </div>
            <div className="text-sm opacity-90">
              Excellent customer satisfaction
            </div>
          </div>

          <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl shadow-lg text-white p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium opacity-90">Top Platform</h3>
              <span className="text-2xl">🏆</span>
            </div>
            <div className="text-3xl font-bold mb-2">
              {salesData.salesSummary.topPlatform}
            </div>
            <div className="text-sm opacity-90">
              Leading in sales volume
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              <button
                onClick={() => setActiveTab('analytics')}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'analytics'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                📊 Sales Analytics
              </button>
              <button
                onClick={() => setActiveTab('payouts')}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'payouts'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                💳 Payouts & Earnings
              </button>
              <button
                onClick={() => setActiveTab('reports')}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'reports'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                📈 Reports & Insights
              </button>
            </nav>
          </div>

          <div className="p-6">
            {activeTab === 'analytics' && (
              <SalesAnalytics
                books={salesData.books}
                salesData={salesData.salesData}
                timeRange={timeRange}
                onTimeRangeChange={setTimeRange}
                currency="$"
                onBookSelect={handleBookSelect}
                onExportData={handleExportData}
              />
            )}

            {activeTab === 'payouts' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">Payout History</h3>
                  <div className="text-sm text-gray-600">
                    Total payouts: ${salesData.payouts.reduce((sum, p) => sum + p.amount, 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4">
                  {salesData.payouts.map(payout => (
                    <div key={payout.id} className="bg-gray-50 rounded-lg border border-gray-200 p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <div className="flex items-center space-x-3 mb-2">
                            <h4 className="text-lg font-semibold text-gray-900">
                              ${payout.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                            </h4>
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPayoutStatusColor(payout.status)}`}>
                              {getPayoutStatusIcon(payout.status)} {payout.status}
                            </span>
                          </div>
                          <div className="text-sm text-gray-600">
                            {payout.platform} • {new Date(payout.date).toLocaleDateString()}
                          </div>
                        </div>
                        <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                          View Details
                        </button>
                      </div>

                      <div className="space-y-2">
                        <h5 className="text-sm font-medium text-gray-700">Books included:</h5>
                        {payout.books.map(book => (
                          <div key={book.bookId} className="flex items-center justify-between text-sm">
                            <span className="text-gray-600">{book.title}</span>
                            <span className="font-medium text-gray-900">
                              ${book.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'reports' && (
              <div className="space-y-6">
                <div className="text-center py-12">
                  <div className="text-4xl mb-4">📈</div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Advanced Reports</h3>
                  <p className="text-gray-600 mb-6">
                    Detailed insights and custom reports will be available here.
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-2xl mx-auto">
                    <button className="bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-700 font-medium py-3 px-4 rounded-lg transition-colors">
                      📊 Monthly Report
                    </button>
                    <button className="bg-green-50 hover:bg-green-100 border border-green-200 text-green-700 font-medium py-3 px-4 rounded-lg transition-colors">
                      💰 Tax Summary
                    </button>
                    <button className="bg-purple-50 hover:bg-purple-100 border border-purple-200 text-purple-700 font-medium py-3 px-4 rounded-lg transition-colors">
                      📈 Trend Analysis
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Quick Actions</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <button
              onClick={() => handleExportData('csv')}
              className="bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-700 font-medium py-3 px-4 rounded-lg transition-colors"
            >
              📊 Export Sales Data (CSV)
            </button>
            <button
              onClick={() => handleExportData('pdf')}
              className="bg-green-50 hover:bg-green-100 border border-green-200 text-green-700 font-medium py-3 px-4 rounded-lg transition-colors"
            >
              📄 Generate Report (PDF)
            </button>
            <button className="bg-purple-50 hover:bg-purple-100 border border-purple-200 text-purple-700 font-medium py-3 px-4 rounded-lg transition-colors">
              📧 Schedule Email Reports
            </button>
            <button
              onClick={() => navigate('/publishing/books/new')}
              className="bg-orange-50 hover:bg-orange-100 border border-orange-200 text-orange-700 font-medium py-3 px-4 rounded-lg transition-colors"
            >
              📝 Publish New Book
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SalesPage;
