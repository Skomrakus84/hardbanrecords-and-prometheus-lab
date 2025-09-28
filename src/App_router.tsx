import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import { Building2, Search, Bell, User } from 'lucide-react';
import HomePageNew from './pages/HomePageNew';
import ReleasesPageNew from './pages/music/ReleasesPageNew';
import ArtistsPageNew from './pages/music/ArtistsPageNew';
import DistributionPageNew from './pages/music/DistributionPageNew';
import AnalyticsPageNew from './pages/music/AnalyticsPageNew';
import PublishingDashboard from './pages/publishing/PublishingDashboard';
import BooksPageNew from './pages/publishing/BooksPageNew';
import ContractsPageNew from './pages/ContractsPageNew';
import SettingsPageNew from './pages/SettingsPageNew';

const Sidebar: React.FC = () => {
  const location = useLocation();
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const sidebarStyle = {
    width: isMobile ? '100%' : '280px',
    backgroundColor: '#0f172a',
    color: '#f8fafc',
    height: '100vh',
    padding: '32px 24px',
    position: 'fixed' as const,
    left: 0,
    top: 0,
    boxShadow: '4px 0 24px rgba(0,0,0,0.12)',
    borderRight: '1px solid #1e293b',
    zIndex: 1000,
    transition: 'left 0.3s ease'
  };

  const menuItems = [
    { id: 'dashboard', icon: '/images/search-magnifying.png', label: 'Dashboard', path: '/' },
    { id: 'music', icon: '/images/music-label-logo.png', label: 'Music', path: '/music' },
    { id: 'releases', icon: '/images/music-publishing.png', label: 'Releases', path: '/releases' },
    { id: 'artists', icon: '/images/hrl.svg', label: 'Artists', path: '/artists' },
    { id: 'contracts', icon: '/images/Przycisk „Strona główna”.jpg', label: 'Contracts', path: '/contracts' },
    { id: 'publishing', icon: '/images/digital-pubishimg.png', label: 'Publishing', path: '/publishing' },
    { id: 'books', icon: '/images/Data visualization.jpg', label: 'Books', path: '/books' },
    { id: 'analytics', icon: '/images/notification-bell-icon,.png', label: 'Analytics', path: '/analytics' },
    { id: 'distribution', icon: '/images/upload.png', label: 'Distribution', path: '/distribution' },
    { id: 'settings', icon: '/images/ustawieia.jpg', label: 'Settings', path: '/settings' }
  ];

  return (
    <div style={sidebarStyle}>
      <div style={{borderBottom: '1px solid #334155', paddingBottom: '24px', marginBottom: '32px', display: 'flex', alignItems: 'center', gap: '12px'}}>
        <div style={{width: '40px', height: '40px', borderRadius: '8px', background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
          <Building2 size={24} color="white" />
        </div>
        <div>
          <h1 style={{fontSize: '22px', fontWeight: '700', margin: '0 0 4px 0', color: '#f8fafc'}}>HardbanRecords</h1>
          <p style={{fontSize: '14px', color: '#94a3b8', margin: 0, fontWeight: '500'}}>Lab Platform</p>
        </div>
      </div>

      {menuItems.map((item) => {
        const isActive = location.pathname === item.path ||
                        (item.path === '/publishing' && location.pathname.startsWith('/publishing'));

        return (
          <Link
            key={item.id}
            to={item.path}
            style={{
              textDecoration: 'none',
              color: 'inherit'
            }}
          >
            <div
              onMouseEnter={(e) => {
                if (!isActive) {
                  e.currentTarget.style.backgroundColor = '#1e293b';
                  e.currentTarget.style.transform = 'translateX(4px)';
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  e.currentTarget.style.backgroundColor = 'transparent';
                  e.currentTarget.style.transform = 'translateX(0)';
                }
              }}
              style={{
                padding: '16px 20px',
                margin: '8px 0',
                borderRadius: '12px',
                cursor: 'pointer',
                backgroundColor: isActive ? '#334155' : 'transparent',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                display: 'flex',
                alignItems: 'center',
                gap: '16px',
                border: isActive ? '1px solid #475569' : '1px solid transparent',
                position: 'relative' as const,
                overflow: 'hidden'
              }}
            >
              <img src={item.icon} alt={item.label + ' icon'} style={{width: 28, height: 28, objectFit: 'contain', marginRight: 8, borderRadius: 6, boxShadow: isActive ? '0 2px 8px rgba(60,60,60,0.12)' : 'none'}} />
              <span style={{fontSize: '15px', fontWeight: '500'}}>{item.label}</span>
            </div>
          </Link>
        );
      })}
    </div>
  );
};

const Header: React.FC<{ title: string }> = ({ title }) => {
  const headerStyle = {
    backgroundColor: '#ffffff',
    padding: '24px 40px',
    borderBottom: '1px solid #e2e8f0',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
  };

  return (
    <div style={headerStyle}>
      {/* Left side - Title with search icon */}
      <div style={{display: 'flex', alignItems: 'center', gap: '16px'}}>
        <Search size={24} style={{opacity: 0.7}} />
        <h2 style={{fontSize: '32px', fontWeight: '700', margin: 0, textTransform: 'capitalize', color: '#0f172a', letterSpacing: '-0.025em'}}>
          {title}
        </h2>
      </div>

      {/* Right side - Status, notifications, profile */}
      <div style={{display: 'flex', alignItems: 'center', gap: '20px'}}>
        {/* System Status */}
        <div style={{
          backgroundColor: '#f0fdf4',
          color: '#166534',
          padding: '10px 18px',
          borderRadius: '30px',
          fontSize: '14px',
          fontWeight: '600',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          border: '1px solid #bbf7d0'
        }}>
          <span style={{width: '8px', height: '8px', backgroundColor: '#22c55e', borderRadius: '50%'}}></span>
          All Systems Operational
        </div>

        {/* Notifications */}
        <div style={{position: 'relative', cursor: 'pointer'}}>
          <Bell size={24} style={{opacity: 0.8}} />
          <div style={{
            position: 'absolute',
            top: '-4px',
            right: '-4px',
            width: '18px',
            height: '18px',
            backgroundColor: '#ef4444',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '10px',
            color: 'white',
            fontWeight: 'bold'
          }}>3</div>
        </div>

        {/* Profile Avatar */}
        <div style={{
          width: '44px',
          height: '44px',
          borderRadius: '50%',
          overflow: 'hidden',
          border: '2px solid #334155',
          cursor: 'pointer',
          transition: 'all 0.3s ease',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
        }}>
          <User size={24} style={{color: '#64748b'}} />
        </div>
      </div>
    </div>
  );
};

const MainContent: React.FC = () => {
  const location = useLocation();
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const mainStyle = {
    marginLeft: isMobile ? '0' : '280px',
    padding: '0',
    backgroundColor: '#f8fafc',
    minHeight: '100vh'
  };

  const contentStyle = {
    padding: '0'
  };

  const getPageTitle = () => {
    switch (location.pathname) {
      case '/':
        return 'Dashboard';
      case '/music':
        return 'Music';
      case '/releases':
        return 'Releases';
      case '/artists':
        return 'Artists';
      case '/contracts':
        return 'Contracts';
      case '/books':
        return 'Books';
      case '/analytics':
        return 'Analytics';
      case '/distribution':
        return 'Distribution';
      case '/settings':
        return 'Settings';
      default:
        if (location.pathname.startsWith('/publishing')) {
          return 'Publishing';
        }
        return 'Dashboard';
    }
  };

  return (
    <div style={mainStyle}>
      <Header title={getPageTitle()} />
      <div style={contentStyle}>
        <Routes>
          <Route path="/" element={<HomePageNew />} />
          <Route path="/music" element={<ReleasesPageNew />} />
          <Route path="/releases" element={<ReleasesPageNew />} />
          <Route path="/artists" element={<ArtistsPageNew />} />
          <Route path="/contracts" element={<ContractsPageNew />} />
          <Route path="/publishing/*" element={<PublishingDashboard />} />
          <Route path="/books" element={<BooksPageNew />} />
          <Route path="/analytics" element={<AnalyticsPageNew />} />
          <Route path="/distribution" element={<DistributionPageNew />} />
          <Route path="/settings" element={<SettingsPageNew />} />
        </Routes>
      </div>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <div style={{
      margin: 0,
      padding: 0,
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Inter", sans-serif',
      backgroundColor: '#f8fafc',
      minHeight: '100vh',
      width: '100%'
    }}>
      <BrowserRouter>
        <Sidebar />
        <MainContent />
      </BrowserRouter>
    </div>
  );
};

export default App;
