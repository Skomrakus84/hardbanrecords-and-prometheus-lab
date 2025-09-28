import React, { useState } from 'react';

interface Notification {
  id: string;
  type: 'success' | 'warning' | 'error' | 'info' | 'payment' | 'release' | 'royalty';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  actionLabel?: string;
  actionUrl?: string;
  data?: any;
}

interface NotificationCenterProps {
  notifications: Notification[];
  onMarkAsRead: (id: string) => void;
  onMarkAllAsRead: () => void;
  onDeleteNotification: (id: string) => void;
  onClearAll: () => void;
  onActionClick?: (notification: Notification) => void;
}

const NotificationCenter: React.FC<NotificationCenterProps> = ({
  notifications,
  onMarkAsRead,
  onMarkAllAsRead,
  onDeleteNotification,
  onClearAll,
  onActionClick
}) => {
  const [filter, setFilter] = useState<'all' | 'unread' | 'success' | 'warning' | 'error' | 'payment' | 'release' | 'royalty'>('all');
  const [isExpanded, setIsExpanded] = useState(false);

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'success': return '✅';
      case 'warning': return '⚠️';
      case 'error': return '❌';
      case 'info': return 'ℹ️';
      case 'payment': return '💰';
      case 'release': return '🎵';
      case 'royalty': return '📊';
      default: return '🔔';
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'success': return 'border-green-200 bg-green-50';
      case 'warning': return 'border-yellow-200 bg-yellow-50';
      case 'error': return 'border-red-200 bg-red-50';
      case 'info': return 'border-blue-200 bg-blue-50';
      case 'payment': return 'border-green-200 bg-green-50';
      case 'release': return 'border-purple-200 bg-purple-50';
      case 'royalty': return 'border-indigo-200 bg-indigo-50';
      default: return 'border-gray-200 bg-gray-50';
    }
  };

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date();
    const notificationTime = new Date(timestamp);
    const diffInMinutes = Math.floor((now.getTime() - notificationTime.getTime()) / (1000 * 60));

    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;

    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;

    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d ago`;

    return notificationTime.toLocaleDateString();
  };

  const filteredNotifications = notifications.filter(notification => {
    if (filter === 'all') return true;
    if (filter === 'unread') return !notification.read;
    return notification.type === filter;
  });

  const unreadCount = notifications.filter(n => !n.read).length;
  const filterOptions = [
    { value: 'all', label: 'All', count: notifications.length },
    { value: 'unread', label: 'Unread', count: unreadCount },
    { value: 'success', label: 'Success', count: notifications.filter(n => n.type === 'success').length },
    { value: 'warning', label: 'Warnings', count: notifications.filter(n => n.type === 'warning').length },
    { value: 'error', label: 'Errors', count: notifications.filter(n => n.type === 'error').length },
    { value: 'payment', label: 'Payments', count: notifications.filter(n => n.type === 'payment').length },
    { value: 'release', label: 'Releases', count: notifications.filter(n => n.type === 'release').length },
    { value: 'royalty', label: 'Royalties', count: notifications.filter(n => n.type === 'royalty').length }
  ];

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-6 text-white">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <h2 className="text-xl font-bold">Notification Center</h2>
            {unreadCount > 0 && (
              <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                {unreadCount}
              </span>
            )}
          </div>

          <div className="flex items-center space-x-2">
            {notifications.length > 0 && (
              <>
                <button
                  onClick={onMarkAllAsRead}
                  className="bg-white bg-opacity-20 hover:bg-opacity-30 text-white text-sm font-medium py-2 px-3 rounded-lg transition-all"
                >
                  Mark All Read
                </button>
                <button
                  onClick={onClearAll}
                  className="bg-white bg-opacity-20 hover:bg-opacity-30 text-white text-sm font-medium py-2 px-3 rounded-lg transition-all"
                >
                  Clear All
                </button>
              </>
            )}
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex flex-wrap gap-2">
          {filterOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => setFilter(option.value as any)}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                filter === option.value
                  ? 'bg-white text-blue-600'
                  : 'bg-white bg-opacity-20 text-white hover:bg-opacity-30'
              }`}
            >
              {option.label}
              {option.count > 0 && (
                <span className={`ml-2 px-1.5 py-0.5 rounded-full text-xs ${
                  filter === option.value
                    ? 'bg-blue-100 text-blue-600'
                    : 'bg-white bg-opacity-30'
                }`}>
                  {option.count}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Notifications List */}
      <div className="max-h-96 overflow-y-auto">
        {filteredNotifications.length > 0 ? (
          <div className="divide-y divide-gray-200">
            {filteredNotifications.map((notification) => (
              <div
                key={notification.id}
                className={`p-4 hover:bg-gray-50 transition-colors ${
                  !notification.read ? 'bg-blue-50 border-l-4 border-blue-500' : ''
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3 flex-1">
                    {/* Icon */}
                    <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-lg ${getNotificationColor(notification.type)}`}>
                      {getNotificationIcon(notification.type)}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className={`text-sm font-medium truncate ${
                          !notification.read ? 'text-gray-900' : 'text-gray-700'
                        }`}>
                          {notification.title}
                        </h3>
                        <span className="text-xs text-gray-500 ml-2">
                          {formatTimeAgo(notification.timestamp)}
                        </span>
                      </div>

                      <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                        {notification.message}
                      </p>

                      {/* Action Button */}
                      {notification.actionLabel && (
                        <button
                          onClick={() => onActionClick?.(notification)}
                          className="text-xs font-medium text-blue-600 hover:text-blue-800 transition-colors"
                        >
                          {notification.actionLabel} →
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center space-x-2 ml-4">
                    {!notification.read && (
                      <button
                        onClick={() => onMarkAsRead(notification.id)}
                        className="text-blue-600 hover:text-blue-800 text-xs font-medium"
                        title="Mark as read"
                      >
                        ✓
                      </button>
                    )}
                    <button
                      onClick={() => onDeleteNotification(notification.id)}
                      className="text-red-600 hover:text-red-800 text-xs"
                      title="Delete notification"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          // Empty State
          <div className="text-center py-12">
            <div className="text-6xl mb-4">
              {filter === 'unread' ? '✅' : '🔔'}
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {filter === 'unread' ? 'All caught up!' : 'No notifications'}
            </h3>
            <p className="text-gray-600">
              {filter === 'unread'
                ? 'You have no unread notifications.'
                : filter === 'all'
                ? 'Notifications will appear here when you have updates.'
                : `No ${filter} notifications found.`
              }
            </p>
          </div>
        )}
      </div>

      {/* Footer */}
      {filteredNotifications.length > 5 && (
        <div className="border-t border-gray-200 p-4 bg-gray-50">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="w-full text-sm text-blue-600 hover:text-blue-800 font-medium"
          >
            {isExpanded ? 'Show Less' : `Show All ${filteredNotifications.length} Notifications`}
          </button>
        </div>
      )}

      {/* Notification Settings */}
      <div className="border-t border-gray-200 p-4 bg-gray-50">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-700">Notification Settings</span>
          <button className="text-sm text-blue-600 hover:text-blue-800 font-medium">
            Configure →
          </button>
        </div>
        <div className="mt-2 text-xs text-gray-500">
          Manage email notifications, push notifications, and alert preferences.
        </div>
      </div>

      {/* Quick Actions */}
      <div className="border-t border-gray-200 p-4 bg-gray-50">
        <h4 className="text-sm font-medium text-gray-700 mb-3">Quick Actions</h4>
        <div className="grid grid-cols-2 gap-2">
          <button className="bg-blue-100 hover:bg-blue-200 text-blue-700 text-xs font-medium py-2 px-3 rounded-md transition-colors">
            📊 View Analytics
          </button>
          <button className="bg-green-100 hover:bg-green-200 text-green-700 text-xs font-medium py-2 px-3 rounded-md transition-colors">
            💰 Check Payouts
          </button>
          <button className="bg-purple-100 hover:bg-purple-200 text-purple-700 text-xs font-medium py-2 px-3 rounded-md transition-colors">
            🎵 View Releases
          </button>
          <button className="bg-yellow-100 hover:bg-yellow-200 text-yellow-700 text-xs font-medium py-2 px-3 rounded-md transition-colors">
            📈 Revenue Report
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotificationCenter;
