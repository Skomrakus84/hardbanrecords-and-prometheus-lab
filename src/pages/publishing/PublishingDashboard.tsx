import React from 'react';
import { Routes, Route, Link, useLocation, Navigate } from 'react-router-dom';
import DashboardPage from './dashboard';
import LibraryPage from './library';
import SalesPage from './sales';
import StoresPage from './stores';
import NewBookPage from './new-book';

const PublishingDashboard: React.FC = () => {
  const location = useLocation();

  const navItems = [
    { path: '/publishing', label: 'Dashboard', exact: true },
    { path: '/publishing/library', label: 'Library' },
    { path: '/publishing/sales', label: 'Sales & Revenue' },
    { path: '/publishing/stores', label: 'Distribution' },
    { path: '/publishing/books/new', label: 'Publish New Book' },
  ];

  return (
    <div 
      style={{
        minHeight: '100vh',
        padding: '24px',
        background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.97) 0%, rgba(15, 23, 42, 0.95) 100%), url("/images/modern-library.jpg")',
        backgroundSize: 'cover',
        backgroundAttachment: 'fixed'
      }}
    >
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ 
          fontSize: '48px', 
          fontWeight: '700', 
          color: '#f8fafc',
          display: 'flex',
          alignItems: 'center',
          gap: '16px',
          margin: '0 0 8px 0'
        }}>
          📚 Digital Publishing
        </h1>
        <p style={{ color: '#94a3b8', fontSize: '18px', margin: 0 }}>Manage your book publishing and distribution across multiple platforms</p>
      </div>

      {/* Sub Navigation */}
      <div style={{ 
        borderBottom: '1px solid rgba(255, 255, 255, 0.1)', 
        marginBottom: '32px',
        paddingBottom: '16px'
      }}>
        <nav style={{ display: 'flex', gap: '32px' }}>
          {navItems.map((item) => {
            const isActive = item.exact
              ? location.pathname === item.path
              : location.pathname.startsWith(item.path);

            return (
              <Link
                key={item.path}
                to={item.path}
                style={{
                  padding: '8px 4px',
                  borderBottom: isActive ? '2px solid #3b82f6' : '2px solid transparent',
                  fontWeight: '500',
                  fontSize: '14px',
                  color: isActive ? '#60a5fa' : '#94a3b8',
                  textDecoration: 'none',
                  transition: 'all 0.3s ease'
                }}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Routes */}
      <Routes>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/library" element={<LibraryPage />} />
        <Route path="/sales" element={<SalesPage />} />
        <Route path="/stores" element={<StoresPage />} />
        <Route path="/books/new" element={<NewBookPage />} />
        <Route path="/books/:id" element={<Navigate to="/publishing/library" replace />} />
        <Route path="*" element={<Navigate to="/publishing" replace />} />
      </Routes>
    </div>
  );
};

// Overview component
const PublishingOverview: React.FC = () => {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px', marginBottom: '32px' }}>
      {/* Stats Cards */}
      <div style={{
        background: 'rgba(255, 255, 255, 0.05)',
        backdropFilter: 'blur(20px)',
        borderRadius: '20px',
        padding: '24px',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <p style={{ color: '#94a3b8', fontSize: '14px', fontWeight: '500', margin: '0 0 8px 0' }}>Total Books</p>
            <p style={{ fontSize: '32px', fontWeight: '700', color: '#f8fafc', margin: 0 }}>24</p>
          </div>
          <div style={{ fontSize: '32px' }}>📚</div>
        </div>
        <div style={{ marginTop: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ color: '#22c55e', fontSize: '14px' }}>📈 +8%</span>
          <span style={{ color: '#94a3b8', fontSize: '14px' }}>this month</span>
        </div>
      </div>

      <div style={{
        background: 'rgba(255, 255, 255, 0.05)',
        backdropFilter: 'blur(20px)',
        borderRadius: '20px',
        padding: '24px',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <p style={{ color: '#94a3b8', fontSize: '14px', fontWeight: '500', margin: '0 0 8px 0' }}>Active Authors</p>
            <p style={{ fontSize: '32px', fontWeight: '700', color: '#f8fafc', margin: 0 }}>15</p>
          </div>
          <div style={{ fontSize: '32px' }}>👥</div>
        </div>
        <div style={{ marginTop: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ color: '#22c55e', fontSize: '14px' }}>🆕 +2</span>
          <span style={{ color: '#94a3b8', fontSize: '14px' }}>new authors</span>
        </div>
      </div>

      <div style={{
        background: 'rgba(255, 255, 255, 0.05)',
        backdropFilter: 'blur(20px)',
        borderRadius: '20px',
        padding: '24px',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <p style={{ color: '#94a3b8', fontSize: '14px', fontWeight: '500', margin: '0 0 8px 0' }}>Monthly Sales</p>
            <p style={{ fontSize: '32px', fontWeight: '700', color: '#f8fafc', margin: 0 }}>$3,245</p>
          </div>
          <div style={{ fontSize: '32px' }}>💰</div>
        </div>
        <div style={{ marginTop: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ color: '#22c55e', fontSize: '14px' }}>💸 +15%</span>
          <span style={{ color: '#94a3b8', fontSize: '14px' }}>vs last month</span>
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
