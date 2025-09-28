import React, { useState } from 'react';

interface UserProfile {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  company: string;
  role: string;
  avatar: string;
  timezone: string;
  language: string;
}

interface PlatformConnection {
  id: string;
  name: string;
  icon: string;
  color: string;
  status: 'connected' | 'disconnected' | 'error';
  lastSync: string;
  syncStatus: 'success' | 'pending' | 'failed';
}

interface NotificationSetting {
  id: string;
  type: string;
  label: string;
  description: string;
  email: boolean;
  push: boolean;
  sms: boolean;
}

const SettingsPageNew: React.FC = () => {
  const [selectedTab, setSelectedTab] = useState<'profile' | 'integrations' | 'notifications' | 'billing' | 'security' | 'preferences'>('profile');
  const [showApiModal, setShowApiModal] = useState(false);
  const [showBillingModal, setShowBillingModal] = useState(false);

  const userProfile: UserProfile = {
    firstName: 'Alex',
    lastName: 'Chen',
    email: 'alex.chen@hardbanrecords.com',
    phone: '+1 (555) 123-4567',
    company: 'Hardban Records',
    role: 'Label Manager',
    avatar: '👤',
    timezone: 'UTC-8 (Pacific Time)',
    language: 'English'
  };

  const platformConnections: PlatformConnection[] = [
    {
      id: 'spotify',
      name: 'Spotify for Artists',
      icon: '🎵',
      color: 'bg-green-500',
      status: 'connected',
      lastSync: '2024-03-20T10:30:00Z',
      syncStatus: 'success'
    },
    {
      id: 'apple-music',
      name: 'Apple Music for Artists',
      icon: '🍎',
      color: 'bg-gray-800',
      status: 'connected',
      lastSync: '2024-03-20T10:25:00Z',
      syncStatus: 'success'
    },
    {
      id: 'youtube-music',
      name: 'YouTube Music',
      icon: '📺',
      color: 'bg-red-500',
      status: 'connected',
      lastSync: '2024-03-20T10:20:00Z',
      syncStatus: 'pending'
    },
    {
      id: 'soundcloud',
      name: 'SoundCloud',
      icon: '☁️',
      color: 'bg-orange-500',
      status: 'error',
      lastSync: '2024-03-19T15:45:00Z',
      syncStatus: 'failed'
    },
    {
      id: 'amazon-music',
      name: 'Amazon Music',
      icon: '📦',
      color: 'bg-blue-600',
      status: 'disconnected',
      lastSync: '',
      syncStatus: 'pending'
    },
    {
      id: 'tidal',
      name: 'Tidal',
      icon: '🌊',
      color: 'bg-indigo-600',
      status: 'disconnected',
      lastSync: '',
      syncStatus: 'pending'
    },
    {
      id: 'amazon-kdp',
      name: 'Amazon KDP',
      icon: '📚',
      color: 'bg-orange-500',
      status: 'connected',
      lastSync: '2024-03-20T09:15:00Z',
      syncStatus: 'success'
    },
    {
      id: 'apple-books',
      name: 'Apple Books',
      icon: '📖',
      color: 'bg-gray-700',
      status: 'connected',
      lastSync: '2024-03-20T09:10:00Z',
      syncStatus: 'success'
    },
    {
      id: 'google-play-books',
      name: 'Google Play Books',
      icon: '📱',
      color: 'bg-blue-500',
      status: 'disconnected',
      lastSync: '',
      syncStatus: 'pending'
    }
  ];

  const notificationSettings: NotificationSetting[] = [
    {
      id: 'new-release',
      type: 'releases',
      label: 'New Release Notifications',
      description: 'Get notified when new music or books are released',
      email: true,
      push: true,
      sms: false
    },
    {
      id: 'contract-expiry',
      type: 'contracts',
      label: 'Contract Expiry Warnings',
      description: 'Alerts when contracts are approaching expiration',
      email: true,
      push: true,
      sms: true
    },
    {
      id: 'payment-received',
      type: 'payments',
      label: 'Payment Notifications',
      description: 'Notifications for received payments and royalties',
      email: true,
      push: false,
      sms: false
    },
    {
      id: 'analytics-report',
      type: 'analytics',
      label: 'Weekly Analytics Reports',
      description: 'Automated weekly performance summaries',
      email: true,
      push: false,
      sms: false
    },
    {
      id: 'platform-issues',
      type: 'technical',
      label: 'Platform Integration Issues',
      description: 'Alerts for sync failures or API errors',
      email: true,
      push: true,
      sms: false
    },
    {
      id: 'team-updates',
      type: 'team',
      label: 'Team Collaboration',
      description: 'Updates from team members and collaborators',
      email: false,
      push: true,
      sms: false
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'connected': return 'bg-green-100 text-green-800';
      case 'disconnected': return 'bg-gray-100 text-gray-800';
      case 'error': return 'bg-red-100 text-red-800';
      case 'success': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'failed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'connected': return '✅';
      case 'disconnected': return '⚪';
      case 'error': return '❌';
      case 'success': return '✅';
      case 'pending': return '⏳';
      case 'failed': return '❌';
      default: return '⚪';
    }
  };

  const formatLastSync = (dateString: string) => {
    if (!dateString) return 'Never';
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">⚙️ Settings</h1>
            <p className="text-gray-600 mt-2">Manage your account, integrations, and platform preferences</p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex flex-wrap gap-2 bg-gray-200 rounded-lg p-1">
          {(['profile', 'integrations', 'notifications', 'billing', 'security', 'preferences'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setSelectedTab(tab)}
              className={`px-4 py-2 rounded-md font-medium text-sm transition-colors ${
                selectedTab === tab
                  ? 'bg-white text-indigo-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {tab === 'profile' ? '👤 Profile' :
               tab === 'integrations' ? '🔗 Integrations' :
               tab === 'notifications' ? '🔔 Notifications' :
               tab === 'billing' ? '💳 Billing' :
               tab === 'security' ? '🔒 Security' : '🎛️ Preferences'}
            </button>
          ))}
        </div>
      </div>

      {/* Profile Tab */}
      {selectedTab === 'profile' && (
        <div className="max-w-4xl">
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">Profile Information</h2>
              <p className="text-gray-600 mt-1">Update your personal information and preferences</p>
            </div>

            <div className="p-6 space-y-6">
              {/* Avatar Section */}
              <div className="flex items-center space-x-6">
                <div className="w-24 h-24 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-3xl">
                  {userProfile.avatar}
                </div>
                <div>
                  <h3 className="text-lg font-medium text-gray-900">{userProfile.firstName} {userProfile.lastName}</h3>
                  <p className="text-gray-600">{userProfile.role} at {userProfile.company}</p>
                  <div className="flex space-x-3 mt-3">
                    <button className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium py-2 px-4 rounded-md transition-colors">
                      Change Avatar
                    </button>
                    <button className="bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium py-2 px-4 rounded-md transition-colors">
                      Remove
                    </button>
                  </div>
                </div>
              </div>

              {/* Personal Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">First Name</label>
                  <input
                    type="text"
                    value={userProfile.firstName}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Last Name</label>
                  <input
                    type="text"
                    value={userProfile.lastName}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                  <input
                    type="email"
                    value={userProfile.email}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                  <input
                    type="tel"
                    value={userProfile.phone}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Company</label>
                  <input
                    type="text"
                    value={userProfile.company}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
                  <select className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500">
                    <option value="Label Manager">Label Manager</option>
                    <option value="A&R">A&R</option>
                    <option value="Artist">Artist</option>
                    <option value="Producer">Producer</option>
                    <option value="Administrator">Administrator</option>
                  </select>
                </div>
              </div>

              {/* Localization */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Timezone</label>
                  <select className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500">
                    <option value="UTC-8">UTC-8 (Pacific Time)</option>
                    <option value="UTC-5">UTC-5 (Eastern Time)</option>
                    <option value="UTC+0">UTC+0 (GMT)</option>
                    <option value="UTC+1">UTC+1 (Central Europe)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Language</label>
                  <select className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500">
                    <option value="English">English</option>
                    <option value="Polish">Polish</option>
                    <option value="Spanish">Spanish</option>
                    <option value="French">French</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                <button className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-2 px-4 rounded-lg transition-colors">
                  Cancel
                </button>
                <button className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors">
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Integrations Tab */}
      {selectedTab === 'integrations' && (
        <div className="space-y-8">
          {/* Integration Status Overview */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-xl shadow-lg p-6 text-white">
              <div className="flex items-center justify-between mb-2">
                <div className="text-2xl">✅</div>
                <div className="text-right">
                  <p className="text-2xl font-bold">{platformConnections.filter(p => p.status === 'connected').length}</p>
                  <p className="text-sm opacity-90">Connected</p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-gray-500 to-gray-600 rounded-xl shadow-lg p-6 text-white">
              <div className="flex items-center justify-between mb-2">
                <div className="text-2xl">⚪</div>
                <div className="text-right">
                  <p className="text-2xl font-bold">{platformConnections.filter(p => p.status === 'disconnected').length}</p>
                  <p className="text-sm opacity-90">Available</p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-red-500 to-red-600 rounded-xl shadow-lg p-6 text-white">
              <div className="flex items-center justify-between mb-2">
                <div className="text-2xl">❌</div>
                <div className="text-right">
                  <p className="text-2xl font-bold">{platformConnections.filter(p => p.status === 'error').length}</p>
                  <p className="text-sm opacity-90">Issues</p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl shadow-lg p-6 text-white">
              <div className="flex items-center justify-between mb-2">
                <div className="text-2xl">🔄</div>
                <div className="text-right">
                  <p className="text-2xl font-bold">{platformConnections.filter(p => p.syncStatus === 'success').length}</p>
                  <p className="text-sm opacity-90">Synced</p>
                </div>
              </div>
            </div>
          </div>

          {/* Platform Connections */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Platform Integrations</h2>
                <p className="text-gray-600 mt-1">Connect and manage your platform integrations</p>
              </div>
              <button
                onClick={() => setShowApiModal(true)}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors flex items-center space-x-2"
              >
                <span>🔑</span>
                <span>API Keys</span>
              </button>
            </div>

            <div className="divide-y divide-gray-200">
              {platformConnections.map((platform) => (
                <div key={platform.id} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className={`w-12 h-12 ${platform.color} rounded-lg flex items-center justify-center text-2xl`}>
                        {platform.icon}
                      </div>

                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">{platform.name}</h3>
                        <div className="flex items-center space-x-4 mt-1">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(platform.status)}`}>
                            {getStatusIcon(platform.status)} {platform.status.toUpperCase()}
                          </span>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(platform.syncStatus)}`}>
                            Sync: {platform.syncStatus.toUpperCase()}
                          </span>
                        </div>
                        {platform.lastSync && (
                          <p className="text-sm text-gray-600 mt-1">
                            Last sync: {formatLastSync(platform.lastSync)}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center space-x-3">
                      {platform.status === 'connected' && (
                        <button className="bg-blue-100 hover:bg-blue-200 text-blue-700 text-sm font-medium py-2 px-3 rounded-md transition-colors">
                          Sync Now
                        </button>
                      )}

                      {platform.status === 'connected' ? (
                        <button className="bg-red-100 hover:bg-red-200 text-red-700 text-sm font-medium py-2 px-3 rounded-md transition-colors">
                          Disconnect
                        </button>
                      ) : (
                        <button className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium py-2 px-3 rounded-md transition-colors">
                          Connect
                        </button>
                      )}

                      <button className="bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium py-2 px-3 rounded-md transition-colors">
                        Settings
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Notifications Tab */}
      {selectedTab === 'notifications' && (
        <div className="max-w-4xl">
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">Notification Preferences</h2>
              <p className="text-gray-600 mt-1">Choose how you want to be notified about important events</p>
            </div>

            <div className="p-6">
              <div className="space-y-6">
                {notificationSettings.map((setting) => (
                  <div key={setting.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="text-lg font-medium text-gray-900">{setting.label}</h3>
                        <p className="text-sm text-gray-600 mt-1">{setting.description}</p>
                      </div>

                      <div className="flex items-center space-x-6 ml-6">
                        <label className="flex items-center">
                          <input
                            type="checkbox"
                            checked={setting.email}
                            className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                          />
                          <span className="ml-2 text-sm text-gray-700">📧 Email</span>
                        </label>

                        <label className="flex items-center">
                          <input
                            type="checkbox"
                            checked={setting.push}
                            className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                          />
                          <span className="ml-2 text-sm text-gray-700">📱 Push</span>
                        </label>

                        <label className="flex items-center">
                          <input
                            type="checkbox"
                            checked={setting.sms}
                            className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                          />
                          <span className="ml-2 text-sm text-gray-700">📱 SMS</span>
                        </label>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200 mt-6">
                <button className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-2 px-4 rounded-lg transition-colors">
                  Reset to Defaults
                </button>
                <button className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors">
                  Save Preferences
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Billing Tab */}
      {selectedTab === 'billing' && (
        <div className="max-w-4xl space-y-8">
          {/* Current Plan */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">Current Plan</h2>
              <p className="text-gray-600 mt-1">Manage your subscription and billing information</p>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div>
                  <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg p-6 text-white mb-6">
                    <h3 className="text-2xl font-bold mb-2">Professional Plan</h3>
                    <p className="text-3xl font-bold mb-1">$99<span className="text-lg opacity-90">/month</span></p>
                    <p className="opacity-90">Unlimited releases • Advanced analytics • Priority support</p>
                  </div>

                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Next billing date:</span>
                      <span className="font-medium">April 15, 2024</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Payment method:</span>
                      <span className="font-medium">•••• •••• •••• 4242</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Billing email:</span>
                      <span className="font-medium">billing@hardbanrecords.com</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-lg font-medium text-gray-900 mb-4">Plan Features</h4>
                  <div className="space-y-3">
                    {[
                      'Unlimited music releases',
                      'Unlimited book publishing',
                      'Advanced analytics dashboard',
                      'Multiple platform distributions',
                      'Contract management system',
                      'Priority customer support',
                      'API access',
                      'Team collaboration tools'
                    ].map((feature, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <span className="text-green-500">✅</span>
                        <span className="text-gray-700">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex space-x-3 pt-6 border-t border-gray-200 mt-6">
                <button
                  onClick={() => setShowBillingModal(true)}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
                >
                  Change Plan
                </button>
                <button className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-2 px-4 rounded-lg transition-colors">
                  Update Payment Method
                </button>
                <button className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-2 px-4 rounded-lg transition-colors">
                  Download Invoice
                </button>
              </div>
            </div>
          </div>

          {/* Usage Statistics */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">Usage This Month</h2>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-indigo-600 mb-2">24</div>
                  <p className="text-sm text-gray-600">Music Releases</p>
                  <p className="text-xs text-gray-500 mt-1">Unlimited plan</p>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-purple-600 mb-2">8</div>
                  <p className="text-sm text-gray-600">Book Publications</p>
                  <p className="text-xs text-gray-500 mt-1">Unlimited plan</p>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600 mb-2">156</div>
                  <p className="text-sm text-gray-600">API Calls (thousands)</p>
                  <p className="text-xs text-gray-500 mt-1">500K limit</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Security Tab */}
      {selectedTab === 'security' && (
        <div className="max-w-4xl space-y-8">
          {/* Password & Authentication */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">Password & Authentication</h2>
              <p className="text-gray-600 mt-1">Manage your account security settings</p>
            </div>

            <div className="p-6 space-y-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Change Password</h3>
                <div className="grid grid-cols-1 gap-4 max-w-md">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Current Password</label>
                    <input
                      type="password"
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                    <input
                      type="password"
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
                    <input
                      type="password"
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                  <button className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors">
                    Update Password
                  </button>
                </div>
              </div>

              <div className="border-t border-gray-200 pt-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Two-Factor Authentication</h3>
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                  <div className="flex items-center space-x-2">
                    <span className="text-green-600">✅</span>
                    <span className="font-medium text-green-800">Two-factor authentication is enabled</span>
                  </div>
                  <p className="text-sm text-green-700 mt-1">Your account is protected with SMS verification</p>
                </div>
                <div className="flex space-x-3">
                  <button className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-2 px-4 rounded-lg transition-colors">
                    Change Phone Number
                  </button>
                  <button className="bg-red-100 hover:bg-red-200 text-red-700 font-semibold py-2 px-4 rounded-lg transition-colors">
                    Disable 2FA
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Active Sessions */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">Active Sessions</h2>
              <p className="text-gray-600 mt-1">Monitor and manage your active login sessions</p>
            </div>

            <div className="divide-y divide-gray-200">
              {[
                { device: 'MacBook Pro - Chrome', location: 'San Francisco, CA', current: true, lastActive: '2024-03-20T10:30:00Z' },
                { device: 'iPhone 15 - Safari', location: 'San Francisco, CA', current: false, lastActive: '2024-03-20T08:15:00Z' },
                { device: 'iPad Pro - Safari', location: 'Los Angeles, CA', current: false, lastActive: '2024-03-19T14:20:00Z' }
              ].map((session, index) => (
                <div key={index} className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                        {session.device.includes('MacBook') ? '💻' : session.device.includes('iPhone') ? '📱' : '📱'}
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900">
                          {session.device}
                          {session.current && <span className="text-green-600 text-sm ml-2">(Current session)</span>}
                        </h3>
                        <p className="text-sm text-gray-600">{session.location} • {formatLastSync(session.lastActive)}</p>
                      </div>
                    </div>
                    {!session.current && (
                      <button className="bg-red-100 hover:bg-red-200 text-red-700 text-sm font-medium py-2 px-3 rounded-md transition-colors">
                        Revoke
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Preferences Tab */}
      {selectedTab === 'preferences' && (
        <div className="max-w-4xl space-y-8">
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">Application Preferences</h2>
              <p className="text-gray-600 mt-1">Customize your application experience</p>
            </div>

            <div className="p-6 space-y-8">
              {/* Theme Settings */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Appearance</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Theme</label>
                    <div className="flex space-x-3">
                      {['Light', 'Dark', 'Auto'].map((theme) => (
                        <label key={theme} className="flex items-center">
                          <input
                            type="radio"
                            name="theme"
                            value={theme.toLowerCase()}
                            defaultChecked={theme === 'Light'}
                            className="border-gray-300 text-indigo-600 focus:ring-indigo-500"
                          />
                          <span className="ml-2 text-sm text-gray-700">{theme}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Dashboard Layout</label>
                    <select className="max-w-xs border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500">
                      <option value="default">Default Layout</option>
                      <option value="compact">Compact Layout</option>
                      <option value="expanded">Expanded Layout</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Data & Privacy */}
              <div className="border-t border-gray-200 pt-8">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Data & Privacy</h3>
                <div className="space-y-4">
                  <label className="flex items-center justify-between">
                    <div>
                      <span className="text-sm font-medium text-gray-700">Analytics Data Collection</span>
                      <p className="text-sm text-gray-600">Help improve our service by sharing anonymous usage data</p>
                    </div>
                    <input
                      type="checkbox"
                      defaultChecked
                      className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                    />
                  </label>

                  <label className="flex items-center justify-between">
                    <div>
                      <span className="text-sm font-medium text-gray-700">Marketing Communications</span>
                      <p className="text-sm text-gray-600">Receive updates about new features and services</p>
                    </div>
                    <input
                      type="checkbox"
                      className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                    />
                  </label>
                </div>
              </div>

              {/* Advanced Settings */}
              <div className="border-t border-gray-200 pt-8">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Advanced</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Auto-save Interval</label>
                    <select className="max-w-xs border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500">
                      <option value="30">30 seconds</option>
                      <option value="60">1 minute</option>
                      <option value="300">5 minutes</option>
                      <option value="0">Disabled</option>
                    </select>
                  </div>

                  <label className="flex items-center justify-between">
                    <div>
                      <span className="text-sm font-medium text-gray-700">Developer Mode</span>
                      <p className="text-sm text-gray-600">Enable advanced debugging and API tools</p>
                    </div>
                    <input
                      type="checkbox"
                      className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                    />
                  </label>
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
                <button className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-2 px-4 rounded-lg transition-colors">
                  Reset to Defaults
                </button>
                <button className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors">
                  Save Preferences
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* API Keys Modal */}
      {showApiModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-screen overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900">API Keys & Credentials</h2>
                <button
                  onClick={() => setShowApiModal(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  ✕
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-center space-x-2">
                  <span className="text-yellow-600">⚠️</span>
                  <span className="font-medium text-yellow-800">Keep your API keys secure</span>
                </div>
                <p className="text-sm text-yellow-700 mt-1">Never share your API keys publicly or store them in client-side code</p>
              </div>

              <div className="space-y-4">
                {['Hardban Records API', 'Spotify Web API', 'Apple Music API', 'YouTube Data API'].map((api, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-medium text-gray-900">{api}</h3>
                      <button className="text-indigo-600 hover:text-indigo-700 text-sm font-medium">
                        Regenerate
                      </button>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input
                        type="password"
                        value="hbr_live_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                        readOnly
                        className="flex-1 border border-gray-300 rounded-md px-3 py-2 bg-gray-50 text-sm font-mono"
                      />
                      <button className="bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium py-2 px-3 rounded-md transition-colors">
                        Copy
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex space-x-3 pt-4 border-t border-gray-200">
                <button
                  onClick={() => setShowApiModal(false)}
                  className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-2 px-4 rounded-lg transition-colors"
                >
                  Close
                </button>
                <button className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors">
                  Generate New Key
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SettingsPageNew;
