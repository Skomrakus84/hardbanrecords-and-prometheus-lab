import React, { useState } from 'react';
import HomePageNew from './pages/HomePageNew';
import ReleasesPageNew from './pages/music/ReleasesPageNew';
import MusicOverviewNew from './pages/music/MusicOverviewNew';
import ArtistsPageNew from './pages/music/ArtistsPageNew';
import DistributionPageNew from './pages/music/DistributionPageNew';
import AnalyticsPageNew from './pages/music/AnalyticsPageNew';
import PublishingPageNew from './pages/publishing/PublishingPageNew';
import BooksPageNew from './pages/publishing/BooksPageNew';
import ContractsPageNew from './pages/ContractsPageNew';
import SettingsPageNew from './pages/SettingsPageNew';
import PrometheusDashboard from './pages/PrometheusDashboard';
import { Brand } from './components/ui/BrandConfig';
import { Home, Music2, Disc3, Users, FileText, BookOpen, BarChart3, Send, Settings, Rocket } from 'lucide-react';
import { BrandIcon } from './components/ui/ModernComponents';

const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<string>('dashboard');
  const [isMobile, setIsMobile] = useState<boolean>(typeof window !== 'undefined' ? window.innerWidth < 768 : false);

  React.useEffect(() => {
    if (typeof window === 'undefined') return;
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
    left: isMobile ? (currentPage === 'menu' ? 0 : '-100%') : 0,
    top: 0,
    boxShadow: '4px 0 24px rgba(0,0,0,0.12)',
    borderRight: '1px solid #1e293b',
    zIndex: 1000,
    transition: 'left 0.3s ease'
  };

  const mainStyle = {
    marginLeft: isMobile ? '0' : '280px',
    padding: '0',
    backgroundColor: '#f8fafc',
    minHeight: '100vh'
  };

  const menuItems = [
    { id: 'dashboard', icon: Home, label: 'Dashboard' },
    { id: 'music', icon: Music2, label: 'Music' },
    { id: 'releases', icon: Disc3, label: 'Releases' },
    { id: 'artists', icon: Users, label: 'Artists' },
    { id: 'contracts', icon: FileText, label: 'Contracts' },
    { id: 'publishing', icon: BookOpen, label: 'Publishing' },
    { id: 'books', icon: BookOpen, label: 'Books' },
    { id: 'analytics', icon: BarChart3, label: 'Analytics' },
    { id: 'distribution', icon: Send, label: 'Distribution' },
    { id: 'settings', icon: Settings, label: 'Settings' },
    { id: 'prometheus', icon: Rocket, label: 'Prometheus' }
  ];

  const renderContent = () => {
    switch (currentPage) {
      case 'dashboard':
        return <HomePageNew />;
      case 'releases':
        return <ReleasesPageNew />;
      case 'artists':
        return <ArtistsPageNew />;
      case 'contracts':
        return <ContractsPageNew />;
      case 'music':
        return <MusicOverviewNew />;
      case 'publishing':
        return <PublishingPageNew />;
      case 'books':
        return <BooksPageNew />;
      case 'analytics':
        return <AnalyticsPageNew />;
      case 'distribution':
        return <DistributionPageNew />;
      case 'settings':
        return <SettingsPageNew />;
      case 'prometheus':
        return <PrometheusDashboard />;
      default:
        return <HomePageNew />;
    }
  };

  return (
    <div style={{
      margin: 0,
      padding: 0,
      background: Brand.colors.bg,
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
    }}>
      {/* Sidebar */}
      <div style={sidebarStyle}>
        {/* Logo */}
        <div style={{
          marginBottom: '48px',
          textAlign: 'center',
          borderBottom: '1px solid #1e293b',
          paddingBottom: '24px'
        }}>
          <h1 style={{
            fontSize: '28px',
            fontWeight: '800',
            color: '#f8fafc',
            margin: '0 0 8px 0',
            background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text'
          }}>
            🎵 Hardban Records
          </h1>
          <p style={{
            fontSize: '14px',
            color: '#64748b',
            margin: '0',
            fontWeight: '500'
          }}>
            Music & Publishing Lab
          </p>
        </div>

        {/* Navigation Menu */}
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                setCurrentPage(item.id);
                if (isMobile) setCurrentPage(item.id);
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '16px',
                padding: '16px 20px',
                backgroundColor: currentPage === item.id ? '#1e293b' : 'transparent',
                color: currentPage === item.id ? '#f8fafc' : '#94a3b8',
                border: 'none',
                borderRadius: '12px',
                fontSize: '16px',
                fontWeight: '600',
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'all 0.2s ease',
                width: '100%'
              }}
              onMouseEnter={(e) => {
                if (currentPage !== item.id) {
                  e.currentTarget.style.backgroundColor = '#1e293b';
                  e.currentTarget.style.color = '#f8fafc';
                }
              }}
              onMouseLeave={(e) => {
                if (currentPage !== item.id) {
                  e.currentTarget.style.backgroundColor = 'transparent';
                  e.currentTarget.style.color = '#94a3b8';
                }
              }}
            >
              <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                <BrandIcon icon={item.icon} brand="generic" size={18} />
              </span>
              <span>{item.label}</span>
            </button>
          ))}
        </nav>

        {/* User Profile */}
        <div style={{
          marginTop: 'auto',
          paddingTop: '24px',
          borderTop: '1px solid #1e293b'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '16px',
            backgroundColor: '#1e293b',
            borderRadius: '12px'
          }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              backgroundColor: '#8b5cf6',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '20px'
            }}>
              👨‍💼
            </div>
            <div>
              <div style={{ fontSize: '14px', fontWeight: '600', color: '#f8fafc' }}>John Producer</div>
              <div style={{ fontSize: '12px', color: '#64748b' }}>Label Manager</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div style={mainStyle}>
        <div style={{ background: Brand.colors.bg, minHeight: '100vh' }}>
          {renderContent()}
        </div>
      </div>

      {/* Mobile Menu Button */}
      {isMobile && (
        <button
          onClick={() => setCurrentPage(currentPage === 'menu' ? 'dashboard' : 'menu')}
          style={{
            position: 'fixed',
            top: '20px',
            left: '20px',
            width: '48px',
            height: '48px',
            backgroundColor: '#8b5cf6',
            color: 'white',
            border: 'none',
            borderRadius: '12px',
            fontSize: '20px',
            cursor: 'pointer',
            zIndex: 1001,
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
          }}
        >
          {currentPage === 'menu' ? '✕' : '☰'}
        </button>
      )}
    </div>
  );
};

export default App;
