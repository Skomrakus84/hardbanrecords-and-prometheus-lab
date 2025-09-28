import React, { useState, useEffect } from 'react';
import NotificationCenter from '../../components/music/NotificationCenter';
import { useNavigate } from 'react-router-dom';

interface Notification {
  id: string;
  type: 'release_approved' | 'payout_processed' | 'analytics_update' | 'platform_issue' | 'contract_update' | 'promotion_opportunity' | 'system_maintenance' | 'collaboration_request';
  title: string;
  message: string;
  timestamp: string;
  isRead: boolean;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  category: 'releases' | 'payouts' | 'analytics' | 'platforms' | 'contracts' | 'promotions' | 'system' | 'collaborations';
  actionUrl?: string;
  actionLabel?: string;
  metadata?: {
    releaseId?: string;
    payoutId?: string;
    platformId?: string;
    amount?: number;
    currency?: string;
    collaboratorName?: string;
  };
}

interface NotificationSettings {
  emailNotifications: {
    releases: boolean;
    payouts: boolean;
    analytics: boolean;
    platforms: boolean;
    promotions: boolean;
    system: boolean;
  };
  pushNotifications: {
    releases: boolean;
    payouts: boolean;
    analytics: boolean;
    platforms: boolean;
    promotions: boolean;
    system: boolean;
  };
  notificationFrequency: 'realtime' | 'hourly' | 'daily' | 'weekly';
  quietHours: {
    enabled: boolean;
    start: string;
    end: string;
  };
}

interface NotificationsPageData {
  notifications: Notification[];
  unreadCount: number;
  settings: NotificationSettings;
}

const NotificationsPage: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [notificationsData, setNotificationsData] = useState<NotificationsPageData | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showSettings, setShowSettings] = useState(false);

  // Sample notifications data
  const sampleNotificationsData: NotificationsPageData = {
    notifications: [
      {
        id: 'notif-001',
        type: 'release_approved',
        title: 'Release Approved: "Midnight Dreams"',
        message: 'Your release "Midnight Dreams" has been approved and is now live on all platforms.',
        timestamp: '2024-03-30T14:30:00Z',
        isRead: false,
        priority: 'high',
        category: 'releases',
        actionUrl: '/music/catalog/midnight-dreams',
        actionLabel: 'View Release',
        metadata: {
          releaseId: 'rel-001'
        }
      },
      {
        id: 'notif-002',
        type: 'payout_processed',
        title: 'Payout Processed: $1,250.00',
        message: 'Your payout request of $1,250.00 has been processed and will arrive in 3-5 business days.',
        timestamp: '2024-03-30T12:15:00Z',
        isRead: false,
        priority: 'medium',
        category: 'payouts',
        actionUrl: '/music/payouts',
        actionLabel: 'View Payouts',
        metadata: {
          payoutId: 'payout-001',
          amount: 1250.00,
          currency: 'USD'
        }
      },
      {
        id: 'notif-003',
        type: 'analytics_update',
        title: 'Weekly Analytics Report Available',
        message: 'Your weekly analytics report for March 24-30 is now available. You gained 2,500 new streams this week!',
        timestamp: '2024-03-30T09:00:00Z',
        isRead: true,
        priority: 'low',
        category: 'analytics',
        actionUrl: '/music/analytics',
        actionLabel: 'View Analytics'
      },
      {
        id: 'notif-004',
        type: 'platform_issue',
        title: 'Spotify Sync Issue Resolved',
        message: 'The synchronization issue with Spotify has been resolved. Your profile data is now up to date.',
        timestamp: '2024-03-29T16:45:00Z',
        isRead: true,
        priority: 'medium',
        category: 'platforms',
        actionUrl: '/music/profiles',
        actionLabel: 'View Profiles',
        metadata: {
          platformId: 'spotify'
        }
      },
      {
        id: 'notif-005',
        type: 'promotion_opportunity',
        title: 'Playlist Placement Opportunity',
        message: 'Your track "Electric Pulse" has been selected for consideration in the "New Electronic" editorial playlist.',
        timestamp: '2024-03-29T11:20:00Z',
        isRead: false,
        priority: 'high',
        category: 'promotions',
        actionUrl: '/music/promotions',
        actionLabel: 'View Details'
      },
      {
        id: 'notif-006',
        type: 'collaboration_request',
        title: 'Collaboration Request from Alex Producer',
        message: 'Alex Producer has sent you a collaboration request for the track "Urban Flow". Review and respond.',
        timestamp: '2024-03-28T14:30:00Z',
        isRead: false,
        priority: 'medium',
        category: 'collaborations',
        actionUrl: '/music/collaborations',
        actionLabel: 'View Request',
        metadata: {
          collaboratorName: 'Alex Producer'
        }
      },
      {
        id: 'notif-007',
        type: 'contract_update',
        title: 'Distribution Agreement Updated',
        message: 'Your distribution agreement has been updated with new terms. Please review the changes.',
        timestamp: '2024-03-28T10:15:00Z',
        isRead: true,
        priority: 'high',
        category: 'contracts',
        actionUrl: '/music/contracts',
        actionLabel: 'Review Contract'
      },
      {
        id: 'notif-008',
        type: 'system_maintenance',
        title: 'Scheduled Maintenance: April 1st',
        message: 'System maintenance is scheduled for April 1st from 2:00 AM to 4:00 AM UTC. Some features may be unavailable.',
        timestamp: '2024-03-27T15:00:00Z',
        isRead: true,
        priority: 'low',
        category: 'system',
        actionUrl: '/support/maintenance',
        actionLabel: 'Learn More'
      },
      {
        id: 'notif-009',
        type: 'analytics_update',
        title: 'Milestone Reached: 100K Streams!',
        message: 'Congratulations! Your track "Cosmic Journey" has reached 100,000 streams across all platforms.',
        timestamp: '2024-03-26T18:45:00Z',
        isRead: true,
        priority: 'medium',
        category: 'analytics',
        actionUrl: '/music/analytics',
        actionLabel: 'View Stats'
      },
      {
        id: 'notif-010',
        type: 'release_approved',
        title: 'Release Scheduled: "Digital Dreams EP"',
        message: 'Your EP "Digital Dreams" has been scheduled for release on April 5th, 2024.',
        timestamp: '2024-03-25T13:20:00Z',
        isRead: true,
        priority: 'medium',
        category: 'releases',
        actionUrl: '/music/catalog/digital-dreams-ep',
        actionLabel: 'View Release'
      }
    ],
    unreadCount: 4,
    settings: {
      emailNotifications: {
        releases: true,
        payouts: true,
        analytics: false,
        platforms: true,
        promotions: true,
        system: false
      },
      pushNotifications: {
        releases: true,
        payouts: true,
        analytics: true,
        platforms: false,
        promotions: true,
        system: true
      },
      notificationFrequency: 'realtime',
      quietHours: {
        enabled: true,
        start: '22:00',
        end: '08:00'
      }
    }
  };

  useEffect(() => {
    const loadNotificationsData = async () => {
      setLoading(true);
      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        setNotificationsData(sampleNotificationsData);
      } catch (error) {
        console.error('Failed to load notifications:', error);
      } finally {
        setLoading(false);
      }
    };

    loadNotificationsData();
  }, []);

  const handleMarkAsRead = (notificationId: string) => {
    if (!notificationsData) return;

    setNotificationsData(prev => {
      if (!prev) return prev;

      return {
        ...prev,
        notifications: prev.notifications.map(notif =>
          notif.id === notificationId ? { ...notif, isRead: true } : notif
        ),
        unreadCount: Math.max(0, prev.unreadCount - 1)
      };
    });
  };

  const handleMarkAllAsRead = () => {
    if (!notificationsData) return;

    setNotificationsData(prev => {
      if (!prev) return prev;

      return {
        ...prev,
        notifications: prev.notifications.map(notif => ({ ...notif, isRead: true })),
        unreadCount: 0
      };
    });
  };

  const handleDeleteNotification = (notificationId: string) => {
    if (!notificationsData) return;

    setNotificationsData(prev => {
      if (!prev) return prev;

      const notification = prev.notifications.find(n => n.id === notificationId);
      const wasUnread = notification && !notification.isRead;

      return {
        ...prev,
        notifications: prev.notifications.filter(notif => notif.id !== notificationId),
        unreadCount: wasUnread ? Math.max(0, prev.unreadCount - 1) : prev.unreadCount
      };
    });
  };

  const handleUpdateSettings = (newSettings: NotificationSettings) => {
    if (!notificationsData) return;

    setNotificationsData(prev => {
      if (!prev) return prev;

      return {
        ...prev,
        settings: newSettings
      };
    });

    console.log('Updated notification settings:', newSettings);
    // Handle settings update API call
  };

  const filteredNotifications = notificationsData?.notifications.filter(notification => {
    if (selectedCategory === 'all') return true;
    if (selectedCategory === 'unread') return !notification.isRead;
    return notification.category === selectedCategory;
  }) || [];

  const categories = [
    { id: 'all', label: 'All Notifications', icon: '📬' },
    { id: 'unread', label: 'Unread', icon: '🔴' },
    { id: 'releases', label: 'Releases', icon: '🎵' },
    { id: 'payouts', label: 'Payouts', icon: '💰' },
    { id: 'analytics', label: 'Analytics', icon: '📊' },
    { id: 'platforms', label: 'Platforms', icon: '🔗' },
    { id: 'promotions', label: 'Promotions', icon: '📈' },
    { id: 'collaborations', label: 'Collaborations', icon: '🤝' },
    { id: 'contracts', label: 'Contracts', icon: '📄' },
    { id: 'system', label: 'System', icon: '⚙️' }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🔔</div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Loading Notifications...</h2>
          <p className="text-gray-600">Please wait while we load your notifications.</p>
        </div>
      </div>
    );
  }

  if (!notificationsData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">❌</div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Failed to Load Notifications</h2>
          <p className="text-gray-600 mb-4">There was an error loading your notifications.</p>
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
            <h1 className="text-3xl font-bold text-gray-900">Notifications</h1>
            <p className="text-gray-600 mt-1">
              Stay updated with your music career progress
              {notificationsData.unreadCount > 0 && (
                <span className="ml-2 bg-red-100 text-red-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                  {notificationsData.unreadCount} unread
                </span>
              )}
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={() => navigate('/music/catalog')}
              className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-2 px-4 rounded-lg transition-colors"
            >
              📚 Catalog
            </button>
            <button
              onClick={() => navigate('/music/analytics')}
              className="bg-blue-100 hover:bg-blue-200 text-blue-700 font-medium py-2 px-4 rounded-lg transition-colors"
            >
              📊 Analytics
            </button>
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="bg-purple-100 hover:bg-purple-200 text-purple-700 font-medium py-2 px-4 rounded-lg transition-colors"
            >
              ⚙️ Settings
            </button>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Quick Actions</h3>
          </div>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={handleMarkAllAsRead}
              disabled={notificationsData.unreadCount === 0}
              className="bg-blue-50 hover:bg-blue-100 disabled:bg-gray-50 disabled:text-gray-400 border border-blue-200 disabled:border-gray-200 text-blue-700 font-medium py-2 px-4 rounded-lg transition-colors"
            >
              ✅ Mark All as Read
            </button>
            <button className="bg-green-50 hover:bg-green-100 border border-green-200 text-green-700 font-medium py-2 px-4 rounded-lg transition-colors">
              📧 Export Email Report
            </button>
            <button className="bg-purple-50 hover:bg-purple-100 border border-purple-200 text-purple-700 font-medium py-2 px-4 rounded-lg transition-colors">
              🔔 Test Notifications
            </button>
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="bg-orange-50 hover:bg-orange-100 border border-orange-200 text-orange-700 font-medium py-2 px-4 rounded-lg transition-colors"
            >
              ⚙️ Notification Settings
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Category Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Categories</h3>
              <div className="space-y-2">
                {categories.map(category => {
                  const count = category.id === 'all'
                    ? notificationsData.notifications.length
                    : category.id === 'unread'
                    ? notificationsData.unreadCount
                    : notificationsData.notifications.filter(n => n.category === category.id).length;

                  return (
                    <button
                      key={category.id}
                      onClick={() => setSelectedCategory(category.id)}
                      className={`w-full flex items-center justify-between p-3 rounded-lg transition-colors ${
                        selectedCategory === category.id
                          ? 'bg-blue-50 text-blue-700 border border-blue-200'
                          : 'hover:bg-gray-50 text-gray-700'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <span className="text-lg">{category.icon}</span>
                        <span className="font-medium">{category.label}</span>
                      </div>
                      {count > 0 && (
                        <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                          selectedCategory === category.id
                            ? 'bg-blue-100 text-blue-700'
                            : 'bg-gray-100 text-gray-600'
                        }`}>
                          {count}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Notifications List */}
          <div className="lg:col-span-3">
            {showSettings ? (
              <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-gray-900">Notification Settings</h3>
                  <button
                    onClick={() => setShowSettings(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    ✕
                  </button>
                </div>

                <div className="space-y-8">
                  {/* Email Notifications */}
                  <div>
                    <h4 className="text-md font-medium text-gray-900 mb-4">Email Notifications</h4>
                    <div className="space-y-3">
                      {Object.entries(notificationsData.settings.emailNotifications).map(([key, enabled]) => (
                        <div key={key} className="flex items-center justify-between">
                          <span className="text-sm text-gray-700 capitalize">{key.replace(/([A-Z])/g, ' $1')}</span>
                          <button
                            onClick={() => {
                              const newSettings = {
                                ...notificationsData.settings,
                                emailNotifications: {
                                  ...notificationsData.settings.emailNotifications,
                                  [key]: !enabled
                                }
                              };
                              handleUpdateSettings(newSettings);
                            }}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                              enabled ? 'bg-blue-600' : 'bg-gray-200'
                            }`}
                          >
                            <span
                              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                enabled ? 'translate-x-6' : 'translate-x-1'
                              }`}
                            />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Push Notifications */}
                  <div>
                    <h4 className="text-md font-medium text-gray-900 mb-4">Push Notifications</h4>
                    <div className="space-y-3">
                      {Object.entries(notificationsData.settings.pushNotifications).map(([key, enabled]) => (
                        <div key={key} className="flex items-center justify-between">
                          <span className="text-sm text-gray-700 capitalize">{key.replace(/([A-Z])/g, ' $1')}</span>
                          <button
                            onClick={() => {
                              const newSettings = {
                                ...notificationsData.settings,
                                pushNotifications: {
                                  ...notificationsData.settings.pushNotifications,
                                  [key]: !enabled
                                }
                              };
                              handleUpdateSettings(newSettings);
                            }}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                              enabled ? 'bg-blue-600' : 'bg-gray-200'
                            }`}
                          >
                            <span
                              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                enabled ? 'translate-x-6' : 'translate-x-1'
                              }`}
                            />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Frequency and Quiet Hours */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="text-md font-medium text-gray-900 mb-4">Notification Frequency</h4>
                      <select
                        value={notificationsData.settings.notificationFrequency}
                        onChange={(e) => {
                          const newSettings = {
                            ...notificationsData.settings,
                            notificationFrequency: e.target.value as any
                          };
                          handleUpdateSettings(newSettings);
                        }}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="realtime">Real-time</option>
                        <option value="hourly">Hourly</option>
                        <option value="daily">Daily</option>
                        <option value="weekly">Weekly</option>
                      </select>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="text-md font-medium text-gray-900">Quiet Hours</h4>
                        <button
                          onClick={() => {
                            const newSettings = {
                              ...notificationsData.settings,
                              quietHours: {
                                ...notificationsData.settings.quietHours,
                                enabled: !notificationsData.settings.quietHours.enabled
                              }
                            };
                            handleUpdateSettings(newSettings);
                          }}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                            notificationsData.settings.quietHours.enabled ? 'bg-blue-600' : 'bg-gray-200'
                          }`}
                        >
                          <span
                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                              notificationsData.settings.quietHours.enabled ? 'translate-x-6' : 'translate-x-1'
                            }`}
                          />
                        </button>
                      </div>
                      {notificationsData.settings.quietHours.enabled && (
                        <div className="space-y-2">
                          <div>
                            <label className="block text-sm text-gray-600 mb-1">Start Time</label>
                            <input
                              type="time"
                              value={notificationsData.settings.quietHours.start}
                              onChange={(e) => {
                                const newSettings = {
                                  ...notificationsData.settings,
                                  quietHours: {
                                    ...notificationsData.settings.quietHours,
                                    start: e.target.value
                                  }
                                };
                                handleUpdateSettings(newSettings);
                              }}
                              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          </div>
                          <div>
                            <label className="block text-sm text-gray-600 mb-1">End Time</label>
                            <input
                              type="time"
                              value={notificationsData.settings.quietHours.end}
                              onChange={(e) => {
                                const newSettings = {
                                  ...notificationsData.settings,
                                  quietHours: {
                                    ...notificationsData.settings.quietHours,
                                    end: e.target.value
                                  }
                                };
                                handleUpdateSettings(newSettings);
                              }}
                              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <NotificationCenter
                notifications={filteredNotifications}
                onMarkAsRead={handleMarkAsRead}
                onMarkAllAsRead={handleMarkAllAsRead}
                onDeleteNotification={handleDeleteNotification}
                onNotificationClick={(notification) => {
                  if (!notification.isRead) {
                    handleMarkAsRead(notification.id);
                  }
                  if (notification.actionUrl) {
                    navigate(notification.actionUrl);
                  }
                }}
                showActions={true}
                maxHeight="800px"
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationsPage;
