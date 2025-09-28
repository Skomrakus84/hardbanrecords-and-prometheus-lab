import React, { useState } from 'react';
import {
  Settings,
  User,
  Lock,
  Bell,
  Palette,
  Globe,
  Database,
  CreditCard,
  Shield,
  Mail,
  Phone,
  Camera,
  Save,
  Trash2,
  Eye,
  EyeOff,
  Upload,
  Download,
  RefreshCw,
  AlertTriangle,
  CheckCircle2,
  Music,
  BookOpen,
  Users,
  BarChart3
} from 'lucide-react';

interface SettingSection {
  id: string;
  title: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  color: string;
  description: string;
}

interface NotificationSetting {
  id: string;
  title: string;
  description: string;
  enabled: boolean;
  type: 'email' | 'push' | 'sms';
}

const SettingsPageNewModern: React.FC = () => {
  const [activeSection, setActiveSection] = useState('profile');
  const [showPassword, setShowPassword] = useState(false);
  const [notifications, setNotifications] = useState<NotificationSetting[]>([
    {
      id: 'releases',
      title: 'New Releases',
      description: 'Get notified when new music or books are released',
      enabled: true,
      type: 'email'
    },
    {
      id: 'royalties',
      title: 'Royalty Payments',
      description: 'Notifications about payment processing',
      enabled: true,
      type: 'email'
    },
    {
      id: 'analytics',
      title: 'Weekly Analytics',
      description: 'Weekly performance reports',
      enabled: false,
      type: 'email'
    },
    {
      id: 'contracts',
      title: 'Contract Updates',
      description: 'Contract renewals and updates',
      enabled: true,
      type: 'push'
    }
  ]);

  const settingSections: SettingSection[] = [
    {
      id: 'profile',
      title: 'Profile Settings',
      icon: User,
      color: '#1DB954',
      description: 'Manage your personal information and avatar'
    },
    {
      id: 'security',
      title: 'Security & Privacy',
      icon: Shield,
      color: '#FA243C',
      description: 'Password, two-factor authentication, and privacy'
    },
    {
      id: 'notifications',
      title: 'Notifications',
      icon: Bell,
      color: '#FF9900',
      description: 'Email, push, and SMS notification preferences'
    },
    {
      id: 'billing',
      title: 'Billing & Payments',
      icon: CreditCard,
      color: '#10B981',
      description: 'Payment methods and billing information'
    },
    {
      id: 'api',
      title: 'API & Integrations',
      icon: Database,
      color: '#764BA2',
      description: 'API keys and third-party integrations'
    },
    {
      id: 'appearance',
      title: 'Appearance',
      icon: Palette,
      color: '#00D4FF',
      description: 'Theme, language, and display preferences'
    }
  ];

  const toggleNotification = (id: string) => {
    setNotifications(prev => prev.map(notif =>
      notif.id === id ? { ...notif, enabled: !notif.enabled } : notif
    ));
  };

  const containerStyle = {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    backgroundImage: 'url("https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1600&h=900&fit=crop")',
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundAttachment: 'fixed',
    padding: '40px',
    position: 'relative' as const
  };

  const overlayStyle = {
    position: 'absolute' as const,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.9) 0%, rgba(118, 75, 162, 0.9) 100%)',
    zIndex: 1
  };

  const contentStyle = {
    position: 'relative' as const,
    zIndex: 2,
    maxWidth: '1400px',
    margin: '0 auto'
  };

  const headerStyle = {
    textAlign: 'center' as const,
    marginBottom: '40px',
    color: '#ffffff'
  };

  const mainGridStyle = {
    display: 'grid',
    gridTemplateColumns: '350px 1fr',
    gap: '40px',
    alignItems: 'flex-start'
  };

  const sidebarStyle = {
    background: 'rgba(255, 255, 255, 0.1)',
    backdropFilter: 'blur(20px)',
    borderRadius: '24px',
    padding: '32px',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    boxShadow: '0 25px 50px rgba(0, 0, 0, 0.1)',
    position: 'sticky' as const,
    top: '40px'
  };

  const contentPanelStyle = {
    background: 'rgba(255, 255, 255, 0.1)',
    backdropFilter: 'blur(20px)',
    borderRadius: '24px',
    padding: '40px',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    boxShadow: '0 25px 50px rgba(0, 0, 0, 0.1)',
    color: '#ffffff'
  };

  const renderProfileSettings = () => (
    <div>
      <h2 style={{fontSize: '2rem', fontWeight: '700', marginBottom: '32px', color: '#ffffff'}}>
        Profile Settings
      </h2>

      {/* Profile Photo */}
      <div style={{
        background: 'rgba(255, 255, 255, 0.05)',
        borderRadius: '16px',
        padding: '32px',
        marginBottom: '32px',
        border: '1px solid rgba(255, 255, 255, 0.1)'
      }}>
        <h3 style={{fontSize: '1.3rem', fontWeight: '600', marginBottom: '20px', color: '#ffffff'}}>
          Profile Photo
        </h3>
        <div style={{display: 'flex', alignItems: 'center', gap: '24px'}}>
          <div style={{
            width: '100px',
            height: '100px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #1DB954 0%, #1ed760 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '2rem',
            fontWeight: '700',
            color: '#ffffff'
          }}>
            HR
          </div>
          <div>
            <button style={{
              background: 'linear-gradient(135deg, #1DB954 0%, #1ed760 100%)',
              border: 'none',
              borderRadius: '12px',
              padding: '12px 24px',
              color: '#ffffff',
              fontSize: '1rem',
              fontWeight: '600',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              marginBottom: '8px',
              transition: 'all 0.3s ease'
            }}>
              <Upload size={16} />
              Upload New Photo
            </button>
            <p style={{fontSize: '0.9rem', color: '#ffffff', opacity: 0.7, margin: 0}}>
              JPG, PNG or GIF. Max size 5MB.
            </p>
          </div>
        </div>
      </div>

      {/* Personal Information */}
      <div style={{
        background: 'rgba(255, 255, 255, 0.05)',
        borderRadius: '16px',
        padding: '32px',
        marginBottom: '32px',
        border: '1px solid rgba(255, 255, 255, 0.1)'
      }}>
        <h3 style={{fontSize: '1.3rem', fontWeight: '600', marginBottom: '24px', color: '#ffffff'}}>
          Personal Information
        </h3>
        <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px'}}>
          <div>
            <label style={{display: 'block', marginBottom: '8px', color: '#ffffff', fontWeight: '500'}}>
              First Name
            </label>
            <input
              type="text"
              defaultValue="John"
              style={{
                width: '100%',
                background: 'rgba(255, 255, 255, 0.1)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                borderRadius: '12px',
                padding: '12px 16px',
                color: '#ffffff',
                fontSize: '1rem',
                outline: 'none'
              }}
            />
          </div>
          <div>
            <label style={{display: 'block', marginBottom: '8px', color: '#ffffff', fontWeight: '500'}}>
              Last Name
            </label>
            <input
              type="text"
              defaultValue="Hardban"
              style={{
                width: '100%',
                background: 'rgba(255, 255, 255, 0.1)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                borderRadius: '12px',
                padding: '12px 16px',
                color: '#ffffff',
                fontSize: '1rem',
                outline: 'none'
              }}
            />
          </div>
        </div>
        <div style={{marginBottom: '20px'}}>
          <label style={{display: 'block', marginBottom: '8px', color: '#ffffff', fontWeight: '500'}}>
            Email Address
          </label>
          <input
            type="email"
            defaultValue="john@hardbanrecords.com"
            style={{
              width: '100%',
              background: 'rgba(255, 255, 255, 0.1)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              borderRadius: '12px',
              padding: '12px 16px',
              color: '#ffffff',
              fontSize: '1rem',
              outline: 'none'
            }}
          />
        </div>
        <div style={{marginBottom: '32px'}}>
          <label style={{display: 'block', marginBottom: '8px', color: '#ffffff', fontWeight: '500'}}>
            Phone Number
          </label>
          <input
            type="tel"
            defaultValue="+1 (555) 123-4567"
            style={{
              width: '100%',
              background: 'rgba(255, 255, 255, 0.1)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              borderRadius: '12px',
              padding: '12px 16px',
              color: '#ffffff',
              fontSize: '1rem',
              outline: 'none'
            }}
          />
        </div>
        <button style={{
          background: 'linear-gradient(135deg, #1DB954 0%, #1ed760 100%)',
          border: 'none',
          borderRadius: '12px',
          padding: '12px 24px',
          color: '#ffffff',
          fontSize: '1rem',
          fontWeight: '600',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          transition: 'all 0.3s ease'
        }}>
          <Save size={16} />
          Save Changes
        </button>
      </div>
    </div>
  );

  const renderSecuritySettings = () => (
    <div>
      <h2 style={{fontSize: '2rem', fontWeight: '700', marginBottom: '32px', color: '#ffffff'}}>
        Security & Privacy
      </h2>

      {/* Change Password */}
      <div style={{
        background: 'rgba(255, 255, 255, 0.05)',
        borderRadius: '16px',
        padding: '32px',
        marginBottom: '32px',
        border: '1px solid rgba(255, 255, 255, 0.1)'
      }}>
        <h3 style={{fontSize: '1.3rem', fontWeight: '600', marginBottom: '24px', color: '#ffffff'}}>
          Change Password
        </h3>
        <div style={{marginBottom: '20px'}}>
          <label style={{display: 'block', marginBottom: '8px', color: '#ffffff', fontWeight: '500'}}>
            Current Password
          </label>
          <div style={{position: 'relative'}}>
            <input
              type={showPassword ? 'text' : 'password'}
              style={{
                width: '100%',
                background: 'rgba(255, 255, 255, 0.1)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                borderRadius: '12px',
                padding: '12px 50px 12px 16px',
                color: '#ffffff',
                fontSize: '1rem',
                outline: 'none'
              }}
            />
            <button
              onClick={() => setShowPassword(!showPassword)}
              style={{
                position: 'absolute',
                right: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'none',
                border: 'none',
                color: '#ffffff',
                opacity: 0.7,
                cursor: 'pointer'
              }}
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
        </div>
        <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '24px'}}>
          <div>
            <label style={{display: 'block', marginBottom: '8px', color: '#ffffff', fontWeight: '500'}}>
              New Password
            </label>
            <input
              type="password"
              style={{
                width: '100%',
                background: 'rgba(255, 255, 255, 0.1)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                borderRadius: '12px',
                padding: '12px 16px',
                color: '#ffffff',
                fontSize: '1rem',
                outline: 'none'
              }}
            />
          </div>
          <div>
            <label style={{display: 'block', marginBottom: '8px', color: '#ffffff', fontWeight: '500'}}>
              Confirm Password
            </label>
            <input
              type="password"
              style={{
                width: '100%',
                background: 'rgba(255, 255, 255, 0.1)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                borderRadius: '12px',
                padding: '12px 16px',
                color: '#ffffff',
                fontSize: '1rem',
                outline: 'none'
              }}
            />
          </div>
        </div>
        <button style={{
          background: 'linear-gradient(135deg, #FA243C 0%, #ff4757 100%)',
          border: 'none',
          borderRadius: '12px',
          padding: '12px 24px',
          color: '#ffffff',
          fontSize: '1rem',
          fontWeight: '600',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          transition: 'all 0.3s ease'
        }}>
          <Lock size={16} />
          Update Password
        </button>
      </div>

      {/* Two-Factor Authentication */}
      <div style={{
        background: 'rgba(255, 255, 255, 0.05)',
        borderRadius: '16px',
        padding: '32px',
        border: '1px solid rgba(255, 255, 255, 0.1)'
      }}>
        <h3 style={{fontSize: '1.3rem', fontWeight: '600', marginBottom: '16px', color: '#ffffff'}}>
          Two-Factor Authentication
        </h3>
        <p style={{fontSize: '1rem', color: '#ffffff', opacity: 0.8, marginBottom: '24px'}}>
          Add an extra layer of security to your account with two-factor authentication.
        </p>
        <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px', background: 'rgba(16, 185, 129, 0.1)', borderRadius: '12px', marginBottom: '20px'}}>
          <div style={{display: 'flex', alignItems: 'center', gap: '12px'}}>
            <CheckCircle2 size={20} style={{color: '#10B981'}} />
            <span style={{color: '#ffffff', fontWeight: '500'}}>
              Two-Factor Authentication is enabled
            </span>
          </div>
          <button style={{
            background: 'linear-gradient(135deg, #EF4444 0%, #f87171 100%)',
            border: 'none',
            borderRadius: '8px',
            padding: '8px 16px',
            color: '#ffffff',
            fontSize: '0.9rem',
            fontWeight: '500',
            cursor: 'pointer'
          }}>
            Disable
          </button>
        </div>
      </div>
    </div>
  );

  const renderNotificationSettings = () => (
    <div>
      <h2 style={{fontSize: '2rem', fontWeight: '700', marginBottom: '32px', color: '#ffffff'}}>
        Notification Settings
      </h2>

      <div style={{
        background: 'rgba(255, 255, 255, 0.05)',
        borderRadius: '16px',
        padding: '32px',
        border: '1px solid rgba(255, 255, 255, 0.1)'
      }}>
        <h3 style={{fontSize: '1.3rem', fontWeight: '600', marginBottom: '24px', color: '#ffffff'}}>
          Notification Preferences
        </h3>
        {notifications.map((notification) => (
          <div
            key={notification.id}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '20px',
              background: 'rgba(255, 255, 255, 0.05)',
              borderRadius: '12px',
              marginBottom: '16px',
              border: '1px solid rgba(255, 255, 255, 0.1)'
            }}
          >
            <div>
              <h4 style={{fontSize: '1.1rem', fontWeight: '600', margin: '0 0 4px 0', color: '#ffffff'}}>
                {notification.title}
              </h4>
              <p style={{fontSize: '0.9rem', margin: 0, color: '#ffffff', opacity: 0.7}}>
                {notification.description}
              </p>
            </div>
            <div style={{display: 'flex', alignItems: 'center', gap: '12px'}}>
              <span style={{
                fontSize: '0.8rem',
                color: '#ffffff',
                opacity: 0.7,
                textTransform: 'uppercase',
                fontWeight: '500'
              }}>
                {notification.type}
              </span>
              <button
                onClick={() => toggleNotification(notification.id)}
                style={{
                  width: '50px',
                  height: '28px',
                  borderRadius: '14px',
                  border: 'none',
                  background: notification.enabled ? '#10B981' : 'rgba(255, 255, 255, 0.2)',
                  position: 'relative',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease'
                }}
              >
                <div style={{
                  width: '20px',
                  height: '20px',
                  borderRadius: '50%',
                  background: '#ffffff',
                  position: 'absolute',
                  top: '4px',
                  left: notification.enabled ? '26px' : '4px',
                  transition: 'all 0.3s ease'
                }}></div>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderContent = () => {
    switch (activeSection) {
      case 'profile':
        return renderProfileSettings();
      case 'security':
        return renderSecuritySettings();
      case 'notifications':
        return renderNotificationSettings();
      case 'billing':
        return (
          <div>
            <h2 style={{fontSize: '2rem', fontWeight: '700', marginBottom: '32px', color: '#ffffff'}}>
              Billing & Payments
            </h2>
            <div style={{
              background: 'rgba(255, 255, 255, 0.05)',
              borderRadius: '16px',
              padding: '32px',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              textAlign: 'center'
            }}>
              <CreditCard size={48} style={{color: '#10B981', marginBottom: '16px'}} />
              <p style={{fontSize: '1.1rem', color: '#ffffff', opacity: 0.8}}>
                Billing settings coming soon...
              </p>
            </div>
          </div>
        );
      case 'api':
        return (
          <div>
            <h2 style={{fontSize: '2rem', fontWeight: '700', marginBottom: '32px', color: '#ffffff'}}>
              API & Integrations
            </h2>
            <div style={{
              background: 'rgba(255, 255, 255, 0.05)',
              borderRadius: '16px',
              padding: '32px',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              textAlign: 'center'
            }}>
              <Database size={48} style={{color: '#764BA2', marginBottom: '16px'}} />
              <p style={{fontSize: '1.1rem', color: '#ffffff', opacity: 0.8}}>
                API settings coming soon...
              </p>
            </div>
          </div>
        );
      case 'appearance':
        return (
          <div>
            <h2 style={{fontSize: '2rem', fontWeight: '700', marginBottom: '32px', color: '#ffffff'}}>
              Appearance
            </h2>
            <div style={{
              background: 'rgba(255, 255, 255, 0.05)',
              borderRadius: '16px',
              padding: '32px',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              textAlign: 'center'
            }}>
              <Palette size={48} style={{color: '#00D4FF', marginBottom: '16px'}} />
              <p style={{fontSize: '1.1rem', color: '#ffffff', opacity: 0.8}}>
                Theme settings coming soon...
              </p>
            </div>
          </div>
        );
      default:
        return renderProfileSettings();
    }
  };

  return (
    <div style={containerStyle}>
      <div style={overlayStyle}></div>

      <div style={contentStyle}>
        {/* Header */}
        <div style={headerStyle}>
          <h1 style={{
            fontSize: '3rem',
            fontWeight: '800',
            margin: '0 0 16px 0',
            background: 'linear-gradient(135deg, #ffffff 0%, #f0f9ff 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            textShadow: '0 4px 20px rgba(255, 255, 255, 0.3)'
          }}>
            Settings
          </h1>
          <p style={{
            fontSize: '1.2rem',
            margin: 0,
            opacity: 0.9,
            fontWeight: '300'
          }}>
            Manage your account preferences and security settings
          </p>
        </div>

        {/* Main Grid */}
        <div style={mainGridStyle}>
          {/* Sidebar */}
          <div style={sidebarStyle}>
            <h3 style={{fontSize: '1.3rem', fontWeight: '700', marginBottom: '24px', color: '#ffffff'}}>
              Settings
            </h3>
            <div>
              {settingSections.map((section) => (
                <div
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '16px',
                    borderRadius: '12px',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    marginBottom: '8px',
                    background: activeSection === section.id
                      ? `${section.color}20`
                      : 'transparent',
                    border: activeSection === section.id
                      ? `1px solid ${section.color}40`
                      : '1px solid transparent'
                  }}
                  onMouseEnter={(e) => {
                    if (activeSection !== section.id) {
                      e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (activeSection !== section.id) {
                      e.currentTarget.style.background = 'transparent';
                    }
                  }}
                >
                  <div style={{
                    background: activeSection === section.id
                      ? section.color
                      : 'rgba(255, 255, 255, 0.1)',
                    borderRadius: '8px',
                    padding: '8px'
                  }}>
                    <section.icon size={20} style={{
                      color: activeSection === section.id ? '#ffffff' : section.color
                    }} />
                  </div>
                  <div>
                    <h4 style={{
                      fontSize: '1rem',
                      fontWeight: '600',
                      margin: '0 0 2px 0',
                      color: '#ffffff'
                    }}>
                      {section.title}
                    </h4>
                    <p style={{
                      fontSize: '0.8rem',
                      margin: 0,
                      color: '#ffffff',
                      opacity: 0.7,
                      lineHeight: '1.3'
                    }}>
                      {section.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Content Panel */}
          <div style={contentPanelStyle}>
            {renderContent()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPageNewModern;
