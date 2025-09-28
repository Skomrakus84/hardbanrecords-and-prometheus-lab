import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, Library, TrendingUp, Upload, DollarSign, BarChart3 } from 'lucide-react';
import Button from '../../components/ui/Button';
import { ProgressBar, Badge } from '../../components/ui/UIElements';

interface DashboardStats {
  totalBooks: number;
  publishedBooks: number;
  draftBooks: number;
  totalRevenue: number;
  monthlyRevenue: number;
  totalSales: number;
  monthlySales: number;
  averageRating: number;
  activeStores: number;
  totalStores: number;
  recentGrowth: number;
  topPerformingBook: {
    id: string;
    title: string;
    author: string;
    revenue: number;
    sales: number;
  };
}

interface RecentActivity {
  id: string;
  type: 'sale' | 'review' | 'publish' | 'store_update' | 'payout';
  title: string;
  description: string;
  timestamp: string;
  amount?: number;
  rating?: number;
  platform?: string;
}

interface QuickAction {
  id: string;
  title: string;
  description: string;
  icon: string;
  color: string;
  action: () => void;
}

const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [quickActions, setQuickActions] = useState<QuickAction[]>([]);

  // Sample dashboard data
  const sampleStats: DashboardStats = {
    totalBooks: 15,
    publishedBooks: 12,
    draftBooks: 3,
    totalRevenue: 34590.00,
    monthlyRevenue: 8750.00,
    totalSales: 5680,
    monthlySales: 1420,
    averageRating: 4.6,
    activeStores: 6,
    totalStores: 8,
    recentGrowth: 23.5,
    topPerformingBook: {
      id: '1',
      title: 'The Digital Nomad\'s Guide',
      author: 'Sarah Johnson',
      revenue: 16450.00,
      sales: 1250
    }
  };

  const sampleActivity: RecentActivity[] = [
    {
      id: '1',
      type: 'sale',
      title: 'New Sale',
      description: '"The Digital Nomad\'s Guide" sold on Amazon KDP',
      timestamp: '2024-03-20T14:30:00Z',
      amount: 9.99,
      platform: 'Amazon KDP'
    },
    {
      id: '2',
      type: 'review',
      title: 'New Review',
      description: '"Urban Gardening Secrets" received a 5-star review',
      timestamp: '2024-03-20T12:15:00Z',
      rating: 5,
      platform: 'Apple Books'
    },
    {
      id: '3',
      type: 'payout',
      title: 'Payout Received',
      description: 'Monthly payout from Kobo processed',
      timestamp: '2024-03-20T09:00:00Z',
      amount: 890.00,
      platform: 'Kobo'
    },
    {
      id: '4',
      type: 'publish',
      title: 'Book Published',
      description: '"Mindful Meditation Practices" went live on Google Books',
      timestamp: '2024-03-19T16:45:00Z',
      platform: 'Google Books'
    },
    {
      id: '5',
      type: 'store_update',
      title: 'Store Update',
      description: 'Barnes & Noble connection reestablished',
      timestamp: '2024-03-19T10:20:00Z',
      platform: 'Barnes & Noble'
    },
    {
      id: '6',
      type: 'sale',
      title: 'Bulk Sales',
      description: '15 copies of "Financial Freedom Blueprint" sold',
      timestamp: '2024-03-19T08:30:00Z',
      amount: 149.85,
      platform: 'Amazon KDP'
    }
  ];

  const sampleQuickActions: QuickAction[] = [
    {
      id: 'new-book',
      title: 'Publish New Book',
      description: 'Start the publishing process for a new book',
      icon: '📝',
      color: 'from-blue-500 to-blue-600',
      action: () => navigate('/publishing/books/new')
    },
    {
      id: 'library',
      title: 'Browse Library',
      description: 'View and manage your book collection',
      icon: '📚',
      color: 'from-green-500 to-green-600',
      action: () => navigate('/publishing/library')
    },
    {
      id: 'sales',
      title: 'View Sales Report',
      description: 'Check your latest sales and revenue data',
      icon: '💰',
      color: 'from-purple-500 to-purple-600',
      action: () => navigate('/publishing/sales')
    },
    {
      id: 'stores',
      title: 'Manage Stores',
      description: 'Configure distribution channels and stores',
      icon: '🏪',
      color: 'from-orange-500 to-orange-600',
      action: () => navigate('/publishing/stores')
    },
    {
      id: 'analytics',
      title: 'Analytics Dashboard',
      description: 'Deep dive into performance metrics',
      icon: '📊',
      color: 'from-indigo-500 to-indigo-600',
      action: () => navigate('/publishing/analytics')
    },
    {
      id: 'profile',
      title: 'Publisher Profile',
      description: 'Update your author and publisher information',
      icon: '👤',
      color: 'from-pink-500 to-pink-600',
      action: () => navigate('/publishing/profile')
    }
  ];

  useEffect(() => {
    const loadDashboardData = async () => {
      setLoading(true);
      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        setStats(sampleStats);
        setRecentActivity(sampleActivity);
        setQuickActions(sampleQuickActions);
      } catch (error) {
        console.error('Failed to load dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'sale': return '💰';
      case 'review': return '⭐';
      case 'publish': return '📚';
      case 'store_update': return '🏪';
      case 'payout': return '💳';
      default: return '📄';
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'sale': return 'text-green-600';
      case 'review': return 'text-yellow-600';
      case 'publish': return 'text-blue-600';
      case 'store_update': return 'text-purple-600';
      case 'payout': return 'text-indigo-600';
      default: return 'text-gray-600';
    }
  };

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffInMinutes = Math.floor((now.getTime() - time.getTime()) / (1000 * 60));

    if (diffInMinutes < 60) {
      return `${diffInMinutes}m ago`;
    } else if (diffInMinutes < 1440) {
      return `${Math.floor(diffInMinutes / 60)}h ago`;
    } else {
      return `${Math.floor(diffInMinutes / 1440)}d ago`;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">📊</div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Loading Dashboard...</h2>
          <p className="text-gray-600">Please wait while we load your publishing analytics.</p>
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">❌</div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Failed to Load Dashboard</h2>
          <p className="text-gray-600 mb-4">There was an error loading your dashboard data.</p>
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
            <h1 className="text-3xl font-bold text-gray-900">Publishing Dashboard</h1>
            <p className="text-gray-600 mt-1">
              Welcome back! Here&apos;s an overview of your publishing business.
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <button className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-2 px-4 rounded-lg transition-colors">
              📥 Sync All Stores
            </button>
            <button
              onClick={() => navigate('/publishing/books/new')}
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
            >
              📝 New Book
            </button>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg text-white p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium opacity-90">Total Books</h3>
              <BookOpen size={24} className="opacity-90" />
            </div>
            <div className="text-3xl font-bold mb-2">{stats.totalBooks}</div>
            <div className="text-sm opacity-90 mb-2">
              {stats.publishedBooks} published • {stats.draftBooks} drafts
            </div>
            <ProgressBar progress={(stats.publishedBooks / stats.totalBooks) * 100} color="#ffffff" height={4} />
          </div>

          <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-lg text-white p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium opacity-90">Total Revenue</h3>
              <DollarSign size={24} className="opacity-90" />
            </div>
            <div className="text-3xl font-bold mb-2">
              ${stats.totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </div>
            <div className="text-sm opacity-90 mb-2">
              ${stats.monthlyRevenue.toLocaleString()} this month
            </div>
            <ProgressBar progress={75} color="#ffffff" height={4} />
          </div>

          <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg text-white p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium opacity-90">Total Sales</h3>
              <BarChart3 size={24} className="opacity-90" />
            </div>
            <div className="text-3xl font-bold mb-2">
              {stats.totalSales.toLocaleString()}
            </div>
            <div className="text-sm opacity-90 mb-2">
              {stats.monthlySales.toLocaleString()} this month
            </div>
            <ProgressBar progress={85} color="#ffffff" height={4} />
          </div>

          <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl shadow-lg text-white p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium opacity-90">Growth Rate</h3>
              <TrendingUp size={24} className="opacity-90" />
            </div>
            <div className="text-3xl font-bold mb-2">+{stats.recentGrowth}%</div>
            <div className="text-sm opacity-90 mb-2">
              ⭐ {stats.averageRating} avg rating
            </div>
            <ProgressBar progress={stats.recentGrowth} color="#ffffff" height={4} />
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-6">
            <Upload size={20} />
            <h3 className="text-lg font-semibold text-gray-900">Quick Actions</h3>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <Button variant="primary" onClick={() => navigate('/publishing/books/new')}>
              <BookOpen size={16} />
              New Book
            </Button>
            <Button variant="secondary" onClick={() => navigate('/publishing/library')}>
              <Library size={16} />
              Library
            </Button>
            <Button variant="pill" onClick={() => navigate('/publishing/sales')}>
              <TrendingUp size={16} />
              Sales
            </Button>
            <Button variant="ghost" onClick={() => navigate('/publishing/stores')}>
              <Upload size={16} />
              Stores
            </Button>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Activity */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
                <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                  View All
                </button>
              </div>
              <div className="space-y-4">
                {recentActivity.slice(0, 6).map(activity => (
                  <div key={activity.id} className="flex items-start space-x-3">
                    <div className={`text-lg ${getActivityColor(activity.type)}`}>
                      {getActivityIcon(activity.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {activity.title}
                        </p>
                        <p className="text-xs text-gray-500 ml-2">
                          {formatTimeAgo(activity.timestamp)}
                        </p>
                      </div>
                      <p className="text-sm text-gray-600 truncate">
                        {activity.description}
                      </p>
                      {activity.amount && (
                        <p className="text-sm font-medium text-green-600">
                          +${activity.amount.toFixed(2)}
                        </p>
                      )}
                      {activity.rating && (
                        <p className="text-sm text-yellow-600">
                          {'⭐'.repeat(activity.rating)}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Top Performing Book */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 mt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">🏆 Top Performing Book</h3>
              <div className="text-center">
                <h4 className="font-semibold text-gray-900">{stats.topPerformingBook.title}</h4>
                <p className="text-gray-600 text-sm mb-4">{stats.topPerformingBook.author}</p>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">
                      ${stats.topPerformingBook.revenue.toLocaleString()}
                    </div>
                    <div className="text-xs text-gray-500">Revenue</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">
                      {stats.topPerformingBook.sales}
                    </div>
                    <div className="text-xs text-gray-500">Sales</div>
                  </div>
                </div>
                <button
                  onClick={() => navigate(`/publishing/books/${stats.topPerformingBook.id}`)}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors mt-4"
                >
                  View Details
                </button>
              </div>
            </div>
          </div>

          {/* Sales Analytics */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Sales Overview</h3>
                <button
                  onClick={() => navigate('/publishing/sales')}
                  className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                >
                  View Full Report →
                </button>
              </div>
              {/* This would be the SalesAnalytics component with sample data */}
              <div className="h-64 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-3xl mb-2">📊</div>
                  <p className="text-gray-600">Sales chart will be displayed here</p>
                  <button
                    onClick={() => navigate('/publishing/sales')}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors mt-4"
                  >
                    View Detailed Analytics
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Store Status */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Distribution Status</h3>
            <button
              onClick={() => navigate('/publishing/stores')}
              className="text-blue-600 hover:text-blue-800 text-sm font-medium"
            >
              Manage Stores →
            </button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
              <div className="text-2xl mb-2">📚</div>
              <div className="text-sm font-medium text-green-800">Amazon KDP</div>
              <div className="text-xs text-green-600">✅ Active</div>
            </div>
            <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="text-2xl mb-2">🍎</div>
              <div className="text-sm font-medium text-blue-800">Apple Books</div>
              <div className="text-xs text-blue-600">✅ Active</div>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg border border-purple-200">
              <div className="text-2xl mb-2">🔍</div>
              <div className="text-sm font-medium text-purple-800">Google Books</div>
              <div className="text-xs text-purple-600">✅ Active</div>
            </div>
            <div className="text-center p-4 bg-yellow-50 rounded-lg border border-yellow-200">
              <div className="text-2xl mb-2">📖</div>
              <div className="text-sm font-medium text-yellow-800">Kobo</div>
              <div className="text-xs text-yellow-600">⏳ Pending</div>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg border border-gray-200">
              <div className="text-2xl mb-2">🏪</div>
              <div className="text-sm font-medium text-gray-800">B&N Press</div>
              <div className="text-xs text-gray-600">⏸️ Inactive</div>
            </div>
            <div className="text-center p-4 bg-indigo-50 rounded-lg border border-indigo-200">
              <div className="text-2xl mb-2">📚</div>
              <div className="text-sm font-medium text-indigo-800">Smashwords</div>
              <div className="text-xs text-indigo-600">➕ Available</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
