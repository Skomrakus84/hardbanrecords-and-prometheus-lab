import React from 'react';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import BooksPage from './BooksPage';
import AuthorsPage from './AuthorsPage';
import SalesPage from './SalesPage';
import StoresPage from './StoresPage';

const PublishingDashboard: React.FC = () => {
  const location = useLocation();

  const navItems = [
    { path: '/publishing', label: 'Overview', exact: true },
    { path: '/publishing/books', label: 'Books' },
    { path: '/publishing/authors', label: 'Authors' },
    { path: '/publishing/sales', label: 'Sales' },
    { path: '/publishing/stores', label: 'Stores' },
  ];

  return (
    <div className="publishing-dashboard">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Digital Publishing</h1>
        <p className="text-gray-600">Manage your book publishing, authors, and distribution to online stores</p>
      </div>

      {/* Sub Navigation */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          {navItems.map((item) => {
            const isActive = item.exact 
              ? location.pathname === item.path
              : location.pathname.startsWith(item.path);
            
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  isActive
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Routes */}
      <Routes>
        <Route path="/" element={<PublishingOverview />} />
        <Route path="/books/*" element={<BooksPage />} />
        <Route path="/authors/*" element={<AuthorsPage />} />
        <Route path="/sales/*" element={<SalesPage />} />
        <Route path="/stores/*" element={<StoresPage />} />
      </Routes>
    </div>
  );
};

// Overview component
const PublishingOverview: React.FC = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {/* Stats Cards */}
      <div className="bg-white overflow-hidden shadow rounded-lg">
        <div className="p-5">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-purple-500 rounded-md flex items-center justify-center">
                <span className="text-white font-bold">📚</span>
              </div>
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">Total Books</dt>
                <dd className="text-lg font-medium text-gray-900">24</dd>
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
                <span className="text-white font-bold">👥</span>
              </div>
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">Active Authors</dt>
                <dd className="text-lg font-medium text-gray-900">15</dd>
              </dl>
            </div>
          </div>
        </div>
      </div>

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
                <dt className="text-sm font-medium text-gray-500 truncate">Monthly Sales</dt>
                <dd className="text-lg font-medium text-gray-900">$3,245</dd>
              </dl>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white overflow-hidden shadow rounded-lg">
        <div className="p-5">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-orange-500 rounded-md flex items-center justify-center">
                <span className="text-white font-bold">📖</span>
              </div>
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">Units Sold</dt>
                <dd className="text-lg font-medium text-gray-900">1,247</dd>
              </dl>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="col-span-full bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Recent Publishing Activity</h3>
          <div className="space-y-3">
            <div className="flex items-center">
              <div className="flex-shrink-0 h-10 w-10 bg-purple-100 rounded-full flex items-center justify-center">
                <span className="text-purple-600 font-medium">📚</span>
              </div>
              <div className="ml-4">
                <div className="text-sm font-medium text-gray-900">New book "Digital Marketing Guide" published</div>
                <div className="text-sm text-gray-500">3 hours ago</div>
              </div>
            </div>
            <div className="flex items-center">
              <div className="flex-shrink-0 h-10 w-10 bg-green-100 rounded-full flex items-center justify-center">
                <span className="text-green-600 font-medium">💰</span>
              </div>
              <div className="ml-4">
                <div className="text-sm font-medium text-gray-900">Royalty payment of $680 processed</div>
                <div className="text-sm text-gray-500">1 day ago</div>
              </div>
            </div>
            <div className="flex items-center">
              <div className="flex-shrink-0 h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-blue-600 font-medium">👤</span>
              </div>
              <div className="ml-4">
                <div className="text-sm font-medium text-gray-900">New author "Sarah Johnson" onboarded</div>
                <div className="text-sm text-gray-500">2 days ago</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Top Performing Books */}
      <div className="col-span-full md:col-span-1 lg:col-span-2 bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Top Performing Books</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <div>
                <div className="text-sm font-medium text-gray-900">The Complete JavaScript Guide</div>
                <div className="text-sm text-gray-500">by Michael Chen</div>
              </div>
              <div className="text-right">
                <div className="text-sm font-medium text-gray-900">342 sales</div>
                <div className="text-sm text-gray-500">$1,025</div>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <div>
                <div className="text-sm font-medium text-gray-900">Python for Beginners</div>
                <div className="text-sm text-gray-500">by Lisa Williams</div>
              </div>
              <div className="text-right">
                <div className="text-sm font-medium text-gray-900">298 sales</div>
                <div className="text-sm text-gray-500">$895</div>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <div>
                <div className="text-sm font-medium text-gray-900">Digital Marketing Mastery</div>
                <div className="text-sm text-gray-500">by David Brown</div>
              </div>
              <div className="text-right">
                <div className="text-sm font-medium text-gray-900">276 sales</div>
                <div className="text-sm text-gray-500">$828</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Sales Chart */}
      <div className="col-span-full md:col-span-1 lg:col-span-2 bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Monthly Sales Trend</h3>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">June 2024</span>
              <div className="flex items-center">
                <div className="w-32 bg-gray-200 rounded-full h-2 mr-2">
                  <div className="bg-green-600 h-2 rounded-full" style={{ width: '85%' }}></div>
                </div>
                <span className="text-sm font-medium">$3,245</span>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">May 2024</span>
              <div className="flex items-center">
                <div className="w-32 bg-gray-200 rounded-full h-2 mr-2">
                  <div className="bg-green-600 h-2 rounded-full" style={{ width: '72%' }}></div>
                </div>
                <span className="text-sm font-medium">$2,890</span>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">April 2024</span>
              <div className="flex items-center">
                <div className="w-32 bg-gray-200 rounded-full h-2 mr-2">
                  <div className="bg-green-600 h-2 rounded-full" style={{ width: '68%' }}></div>
                </div>
                <span className="text-sm font-medium">$2,650</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PublishingDashboard;
