import React, { useState, useRef, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  Home, Music, Disc3, Users, FileText, BookOpen, Book, 
  BarChart3, Globe, Settings, Building2, User, ChevronDown,
  UserCircle, Shield, LogOut, Bell, Zap 
} from 'lucide-react';
import { useAuthStore } from './store/authStore';
import { LoginModal } from './components/auth/LoginModal';
import HomePageNew from './pages/HomePageNewModern';
import ReleasesPageNew from './pages/music/ReleasesPageNewTest';
import ArtistsPageNew from './pages/music/ArtistsPageNewModern';
import DistributionPageNew from './pages/music/DistributionPageNewModern';
import AnalyticsPageNew from './pages/music/AnalyticsPageNewModern';
import RoyaltiesPage from './pages/music/RoyaltiesPage';
import AddReleasePage from './pages/music/AddReleasePage';
import MusicDashboard from './modules/music/MusicDashboard';
import PublishingDashboard from './pages/publishing/PublishingDashboard';
import BooksPageNew from './pages/publishing/BooksPageNewModern';
import AddBookPage from './pages/publishing/AddBookPage';
import ContractsPageNew from './pages/ContractsPageNewModern';
import SettingsPageNew from './pages/SettingsPageNewModern';
import IntegrationsPage from './pages/IntegrationsPage';
import AnalyticsPageUnified from './pages/AnalyticsPageUnified';
import FloatingActionButton from './components/ui/FloatingActionButton';

const Sidebar: React.FC = () => {
  const location = useLocation();
  const [isHovered, setIsHovered] = React.useState(false);

  const sidebarStyle = {
    width: isHovered ? '280px' : '80px',
    minWidth: isHovered ? '280px' : '80px',
    maxWidth: isHovered ? '280px' : '80px',
    backgroundColor: '#0f172a',
    color: '#f8fafc',
    height: '100vh',
    padding: isHovered ? '32px 24px' : '32px 16px',
    position: 'fixed' as const,
    left: 0,
    top: 0,
    boxShadow: '4px 0 24px rgba(0,0,0,0.12)',
    borderRight: '1px solid #1e293b',
    zIndex: 1000,
    flexShrink: 0,
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    overflow: 'hidden'
  };

  const menuItems = [
    { id: 'dashboard', icon: Home, label: 'Dashboard', path: '/' },
    { id: 'music', icon: Music, label: 'Music', path: '/music' },
    { id: 'releases', icon: Disc3, label: 'Releases', path: '/releases' },
    { id: 'artists', icon: Users, label: 'Artists', path: '/artists' },
    { id: 'contracts', icon: FileText, label: 'Contracts', path: '/contracts' },
    { id: 'publishing', icon: BookOpen, label: 'Publishing', path: '/publishing' },
    { id: 'books', icon: Book, label: 'Books', path: '/books' },
    { id: 'analytics', icon: BarChart3, label: 'Analytics', path: '/analytics' },
    { id: 'distribution', icon: Globe, label: 'Distribution', path: '/distribution' },
    { id: 'integrations', icon: Zap, label: 'Integrations', path: '/integrations' },
    { id: 'settings', icon: Settings, label: 'Settings', path: '/settings' }
  ];

  return (
    <div
      style={sidebarStyle}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div style={{
        borderBottom: '1px solid #334155',
        paddingBottom: '24px',
        marginBottom: '32px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: isHovered ? 'flex-start' : 'center',
        gap: isHovered ? '8px' : '0',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
      }}>
        <Building2 size={24} style={{ flexShrink: 0 }} />
        {isHovered && (
          <div style={{
            opacity: isHovered ? 1 : 0,
            transition: 'opacity 0.3s ease 0.1s'
          }}>
            <h1 style={{fontSize: '22px', fontWeight: '700', margin: '0 0 8px 0', color: '#f8fafc'}}>
              HardbanRecords
            </h1>
            <p style={{fontSize: '14px', color: '#94a3b8', margin: 0, fontWeight: '500'}}>Lab Platform</p>
          </div>
        )}
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
              style={{
                padding: isHovered ? '16px 20px' : '16px',
                margin: '8px 0',
                borderRadius: '12px',
                cursor: 'pointer',
                backgroundColor: isActive ? '#334155' : 'transparent',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: isHovered ? 'flex-start' : 'center',
                gap: isHovered ? '16px' : '0',
                border: isActive ? '1px solid #475569' : '1px solid transparent',
                position: 'relative' as const,
                overflow: 'hidden',
                minHeight: '52px'
              }}
              onMouseEnter={(e) => {
                if (!isActive && isHovered) {
                  e.currentTarget.style.backgroundColor = '#1e293b';
                  e.currentTarget.style.transform = 'translateX(4px)';
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  e.currentTarget.style.backgroundColor = isActive ? '#334155' : 'transparent';
                  e.currentTarget.style.transform = 'translateX(0)';
                }
              }}
            >
              <item.icon size={20} style={{ flexShrink: 0 }} />
              {isHovered && (
                <span style={{
                  fontSize: '15px',
                  fontWeight: '500',
                  opacity: isHovered ? 1 : 0,
                  transition: 'opacity 0.3s ease 0.1s',
                  whiteSpace: 'nowrap'
                }}>
                  {item.label}
                </span>
              )}

              {/* Tooltip dla collapsed state */}
              {!isHovered && (
                <div style={{
                  position: 'absolute',
                  left: '70px',
                  backgroundColor: '#1e293b',
                  color: '#f8fafc',
                  padding: '8px 12px',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: '500',
                  whiteSpace: 'nowrap',
                  opacity: 0,
                  pointerEvents: 'none',
                  transition: 'all 0.3s ease',
                  zIndex: 1001,
                  boxShadow: '0 4px 12px rgba(0,0,0,0.3)'
                }}
                className="sidebar-tooltip"
                >
                  {item.label}
                </div>
              )}
            </div>
          </Link>
        );
      })}
    </div>
  );
};

const UserMenu: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  
  const { user, logout, isAuthenticated } = useAuthStore();

  const handleLogin = () => {
    setShowLoginModal(true);
    setIsOpen(false);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    setIsOpen(false);
    navigate('/');
  };

  const handleProfile = () => {
    navigate('/profile');
    setIsOpen(false);
  };

  const handleAdminPanel = () => {
    navigate('/admin');
    setIsOpen(false);
  };

  const menuItems = isAuthenticated && user ? [
    { icon: UserCircle, label: 'Profile', action: handleProfile },
    { icon: Settings, label: 'Settings', action: () => navigate('/settings') },
    { icon: Bell, label: 'Notifications', action: () => console.log('Notifications clicked') },
    ...(user?.role === 'admin' ? [{ icon: Shield, label: 'Admin Panel', action: handleAdminPanel }] : []),
    { divider: true },
    { icon: LogOut, label: 'Logout', action: handleLogout, danger: true }
  ] : [
    { icon: UserCircle, label: 'Login', action: handleLogin }
  ];

  return (
    <div ref={menuRef} style={{ position: 'relative' }}>
      <div 
        onClick={() => setIsOpen(!isOpen)}
        style={{
          width: '44px',
          height: '44px',
          borderRadius: '50%',
          backgroundColor: '#334155',
          border: '2px solid #475569',
          cursor: 'pointer',
          transition: 'all 0.3s ease',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative'
        }}
      >
        <User size={24} color="#f8fafc" />
        <ChevronDown 
          size={12} 
          color="#f8fafc" 
          style={{ 
            position: 'absolute', 
            bottom: '2px', 
            right: '2px',
            transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 0.3s ease'
          }} 
        />
      </div>

      {isOpen && (
        <div style={{
          position: 'absolute',
          top: '100%',
          right: '0',
          marginTop: '8px',
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(20px)',
          borderRadius: '16px',
          padding: '8px',
          minWidth: '200px',
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.15)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          zIndex: 1000
        }}>
          {menuItems.map((item, index) => (
            'divider' in item ? (
              <div key={index} style={{ 
                height: '1px', 
                background: 'rgba(0, 0, 0, 0.1)', 
                margin: '8px 0' 
              }} />
            ) : (
              <div
                key={index}
                onClick={item.action}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '12px 16px',
                  borderRadius: '12px',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  color: item.danger ? '#ef4444' : '#334155',
                  fontSize: '14px',
                  fontWeight: '500'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = item.danger ? 'rgba(239, 68, 68, 0.1)' : 'rgba(59, 130, 246, 0.1)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }}
              >
                {item.icon && <item.icon size={16} />}
                {item.label}
              </div>
            )
          ))}
        </div>
      )}
      {showLoginModal && (
        <LoginModal 
          isOpen={showLoginModal}
          onClose={() => setShowLoginModal(false)}
        />
      )}
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
      <h2 style={{fontSize: '32px', fontWeight: '700', margin: 0, textTransform: 'capitalize', color: '#0f172a', letterSpacing: '-0.025em'}}>
        {title}
      </h2>
      <div style={{display: 'flex', alignItems: 'center', gap: '20px'}}>
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
        <UserMenu />
      </div>
    </div>
  );
};

const MainContent: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const mainStyle = {
    marginLeft: '120px',
    padding: '0',
    backgroundColor: '#f8fafc',
    minHeight: '100vh',
    width: 'calc(100% - 120px)',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
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
      case '/integrations':
        return 'Integrations';
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
          <Route path="/music" element={<MusicDashboard />} />
          <Route path="/music/releases" element={<ReleasesPageNew />} />
          <Route path="/music/releases/new" element={<AddReleasePage />} />
          <Route path="/music/artists" element={<ArtistsPageNew />} />
          <Route path="/music/analytics" element={<AnalyticsPageNew />} />
          <Route path="/music/royalties" element={<RoyaltiesPage />} />
          <Route path="/music/distribution" element={<DistributionPageNew />} />
          <Route path="/releases" element={<ReleasesPageNew />} />
          <Route path="/artists" element={<ArtistsPageNew />} />
          <Route path="/contracts" element={<ContractsPageNew />} />
          <Route path="/publishing/*" element={<PublishingDashboard />} />
          <Route path="/books" element={<BooksPageNew />} />
          <Route path="/books/new" element={<AddBookPage />} />
          <Route path="/analytics" element={<AnalyticsPageUnified />} />
          <Route path="/distribution" element={<DistributionPageNew />} />
          <Route path="/integrations" element={<IntegrationsPage />} />
          <Route path="/settings" element={<SettingsPageNew />} />
        </Routes>
      </div>

      {/* Floating Action Button for quick actions */}
      <FloatingActionButton
        onClick={() => {
          if (location.pathname.startsWith('/publishing') || location.pathname.startsWith('/books')) {
            navigate('/books/new');
          } else if (location.pathname.startsWith('/music') || location.pathname.startsWith('/releases')) {
            navigate('/music/releases/new');
          } else {
            navigate('/books/new');
          }
        }}
        tooltip="Quick Upload"
      />
    </div>
  );
};

const App: React.FC = () => {
  // Add global styles for tooltips
  React.useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      .sidebar-tooltip {
        opacity: 0 !important;
        transform: translateX(-10px);
        pointer-events: none;
      }

      .sidebar-tooltip:hover,
      div:hover > .sidebar-tooltip {
        opacity: 1 !important;
        transform: translateX(0);
      }

      /* Show tooltip on parent hover */
      div:hover .sidebar-tooltip {
        opacity: 1 !important;
        transform: translateX(0);
      }
    `;
    document.head.appendChild(style);

    return () => {
      document.head.removeChild(style);
    };
  }, []);

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
