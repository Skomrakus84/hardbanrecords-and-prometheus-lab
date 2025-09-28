import React, { useState } from 'react';
import HomePageNew from './pages/HomePageNew';
import ReleasesPageNew from './pages/music/ReleasesPageNew';
import ArtistsPageNew from './pages/music/ArtistsPageNew';
import DistributionPageNew from './pages/music/DistributionPageNew';
import AnalyticsPageNew from './pages/music/AnalyticsPageNew';
import PublishingPageNew from './pages/publishing/PublishingPageNew';
import BooksPageNew from './pages/publishing/BooksPageNew';
import ContractsPageNew from './pages/ContractsPageNew';
import SettingsPageNew from './pages/SettingsPageNew';

const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  React.useEffect(() => {
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

  const headerStyle = {
    backgroundColor: '#ffffff',
    padding: '24px 40px',
    borderBottom: '1px solid #e2e8f0',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
  };

  const contentStyle = {
    padding: '0'
  };

  const menuItems = [
    { id: 'dashboard', icon: '🏠', label: 'Dashboard' },
    { id: 'music', icon: '🎵', label: 'Music' },
    { id: 'releases', icon: '💿', label: 'Releases' },
    { id: 'artists', icon: '👨‍🎤', label: 'Artists' },
    { id: 'contracts', icon: '📋', label: 'Contracts' },
    { id: 'publishing', icon: '📚', label: 'Publishing' },
    { id: 'books', icon: '📖', label: 'Books' },
    { id: 'analytics', icon: '📊', label: 'Analytics' },
    { id: 'distribution', icon: '🌍', label: 'Distribution' },
    { id: 'settings', icon: '⚙️', label: 'Settings' }
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
        return <ReleasesPageNew />;
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
      default:
        return <HomePageNew />;
    }
  };

  return (
    <div style={{
      margin: 0,
      padding: 0,
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Inter", sans-serif',
      backgroundColor: '#f8fafc',
      minHeight: '100vh',
      width: '100%'
    }}>
      {/* Sidebar */}
      <div style={sidebarStyle}>
        <div style={{borderBottom: '1px solid #334155', paddingBottom: '24px', marginBottom: '32px'}}>
          <h1 style={{fontSize: '22px', fontWeight: '700', margin: '0 0 8px 0', color: '#f8fafc'}}>🎵 HardbanRecords</h1>
          <p style={{fontSize: '14px', color: '#94a3b8', margin: 0, fontWeight: '500'}}>Lab Platform</p>
        </div>

        {menuItems.map((item) => (
          <div
            key={item.id}
            onClick={() => setCurrentPage(item.id)}
            onMouseEnter={(e) => {
              if (currentPage !== item.id) {
                e.currentTarget.style.backgroundColor = '#1e293b';
                e.currentTarget.style.transform = 'translateX(4px)';
              }
            }}
            onMouseLeave={(e) => {
              if (currentPage !== item.id) {
                e.currentTarget.style.backgroundColor = 'transparent';
                e.currentTarget.style.transform = 'translateX(0)';
              }
            }}
            style={{
              padding: '16px 20px',
              margin: '8px 0',
              borderRadius: '12px',
              cursor: 'pointer',
              backgroundColor: currentPage === item.id ? '#334155' : 'transparent',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              display: 'flex',
              alignItems: 'center',
              gap: '16px',
              border: currentPage === item.id ? '1px solid #475569' : '1px solid transparent',
              position: 'relative' as const,
              overflow: 'hidden'
            }}
          >
            <span style={{fontSize: '18px'}}>{item.icon}</span>
            <span style={{fontSize: '15px', fontWeight: '500'}}>{item.label}</span>
          </div>
        ))}
      </div>

      {/* Main Content */}
      <div style={mainStyle}>
        {/* Content */}
        <div style={contentStyle}>
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default App;

  return (
    <div style={{
      margin: 0,
      padding: 0,
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Inter", sans-serif',
      backgroundColor: '#f8fafc',
      minHeight: '100vh',
      width: '100%'
    }}>
      {/* Sidebar */}
      <div style={sidebarStyle}>
        <div style={{borderBottom: '1px solid #334155', paddingBottom: '24px', marginBottom: '32px'}}>
          <h1 style={{fontSize: '22px', fontWeight: '700', margin: '0 0 8px 0', color: '#f8fafc'}}>🎵 HardbanRecords</h1>
          <p style={{fontSize: '14px', color: '#94a3b8', margin: 0, fontWeight: '500'}}>Lab Platform</p>
        </div>

        {menuItems.map((item) => (
          <div
            key={item.id}
            onClick={() => setCurrentPage(item.id)}
            onMouseEnter={(e) => {
              if (currentPage !== item.id) {
                e.currentTarget.style.backgroundColor = '#1e293b';
                e.currentTarget.style.transform = 'translateX(4px)';
              }
            }}
            onMouseLeave={(e) => {
              if (currentPage !== item.id) {
                e.currentTarget.style.backgroundColor = 'transparent';
                e.currentTarget.style.transform = 'translateX(0)';
              }
            }}
            style={{
              padding: '16px 20px',
              margin: '8px 0',
              borderRadius: '12px',
              cursor: 'pointer',
              backgroundColor: currentPage === item.id ? '#334155' : 'transparent',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              display: 'flex',
              alignItems: 'center',
              gap: '16px',
              border: currentPage === item.id ? '1px solid #475569' : '1px solid transparent',
              position: 'relative' as const,
              overflow: 'hidden'
            }}
          >
            <span style={{fontSize: '18px'}}>{item.icon}</span>
            <span style={{fontSize: '15px', fontWeight: '500'}}>{item.label}</span>
          </div>
        ))}
      </div>

      {/* Main Content */}
      <div style={mainStyle}>
        {/* Header */}
        <div style={headerStyle}>
          <h2 style={{fontSize: '32px', fontWeight: '700', margin: 0, textTransform: 'capitalize', color: '#0f172a', letterSpacing: '-0.025em'}}>
            {currentPage === 'dashboard' ? 'Dashboard' : currentPage}
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
            <div style={{
              width: '44px',
              height: '44px',
              backgroundColor: '#0f172a',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#f8fafc',
              fontWeight: '700',
              fontSize: '16px',
              border: '2px solid #334155',
              cursor: 'pointer',
              transition: 'all 0.3s ease'
            }}>
              U
            </div>
          </div>
        </div>

        {/* Content */}
        <div style={contentStyle}>
          {/* Hero Section */}
          <div style={heroStyle}>
            <div style={{display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '20px'}}>
              <span style={{fontSize: '48px', filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))'}}>🎵</span>
              <h1 style={{fontSize: '40px', fontWeight: '800', margin: 0, letterSpacing: '-0.025em'}}>Welcome to HardbanRecords Lab</h1>
            </div>
            <p style={{fontSize: '20px', margin: '0 0 40px 0', opacity: 0.9, fontWeight: '400', lineHeight: '1.6'}}>
              Your complete music distribution and digital publishing platform
            </p>

            <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '32px', marginTop: '32px'}}>
              <div style={{textAlign: 'center'}}>
                <div style={{display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', marginBottom: '12px'}}>
                  <span style={{width: '10px', height: '10px', backgroundColor: '#10b981', borderRadius: '50%', animation: 'pulse 2s infinite'}}></span>
                  <span style={{fontSize: '15px', opacity: 0.9, fontWeight: '500'}}>All Systems Online</span>
                </div>
                <div style={{fontSize: '32px', fontWeight: '800', color: '#10b981'}}>+23%</div>
                <div style={{fontSize: '15px', opacity: 0.8, fontWeight: '500'}}>Revenue Growth</div>
              </div>
              <div style={{textAlign: 'center'}}>
                <div style={{fontSize: '32px', fontWeight: '800'}}>28</div>
                <div style={{fontSize: '15px', opacity: 0.8, fontWeight: '500'}}>Active Projects</div>
              </div>
              <div style={{textAlign: 'center'}}>
                <div style={{fontSize: '32px', fontWeight: '800'}}>421</div>
                <div style={{fontSize: '15px', opacity: 0.8, fontWeight: '500'}}>Total Platforms</div>
              </div>
            </div>
          </div>

          {/* Stats Cards */}
          <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '32px'}}>
            {[
              {icon: '👥', title: '25', subtitle: 'Active Artists', desc: 'New signings this month', growth: '+12%', color: '#0f172a'},
              {icon: '🎵', title: '45', subtitle: 'Total Releases', desc: 'Albums & Singles released', growth: '+8%', color: '#334155'},
              {icon: '📚', title: '12', subtitle: 'Published Books', desc: 'Digital publications', growth: '+15%', color: '#10b981'},
              {icon: '💰', title: '$125K', subtitle: 'Total Revenue', desc: 'This month', growth: '+23%', color: '#0ea5e9'}
            ].map((stat, index) => (
              <div 
                key={index} 
                style={{
                  ...cardStyle,
                  cursor: 'pointer',
                  transform: 'translateY(0)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-4px)';
                  e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.12), 0 4px 16px rgba(0,0,0,0.08)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.08), 0 4px 12px rgba(0,0,0,0.05)';
                }}
              >
                <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px'}}>
                  <div style={{
                    fontSize: '32px',
                    padding: '16px',
                    backgroundColor: `${stat.color}08`,
                    borderRadius: '16px',
                    color: stat.color,
                    border: `1px solid ${stat.color}20`
                  }}>
                    {stat.icon}
                  </div>
                  <div style={{
                    backgroundColor: '#f0fdf4',
                    color: '#166534',
                    padding: '6px 14px',
                    borderRadius: '24px',
                    fontSize: '13px',
                    fontWeight: '700',
                    border: '1px solid #bbf7d0'
                  }}>
                    {stat.growth}
                  </div>
                </div>
                <div style={{fontSize: '36px', fontWeight: '800', margin: '12px 0', color: '#0f172a', letterSpacing: '-0.025em'}}>{stat.title}</div>
                <div style={{color: '#475569', fontSize: '18px', fontWeight: '600', marginBottom: '8px'}}>{stat.subtitle}</div>
                <div style={{color: '#64748b', fontSize: '14px', fontWeight: '500'}}>{stat.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;
