import React, { useState } from 'react';

interface PayoutRecipient {
  id: string;
  name: string;
  email: string;
  role: 'artist' | 'producer' | 'songwriter' | 'publisher' | 'label' | 'other';
  percentage: number;
  payoutMethod: 'paypal' | 'bank_transfer' | 'stripe' | 'crypto';
  payoutDetails: {
    paypal?: string;
    bankAccount?: {
      accountNumber: string;
      routingNumber: string;
      bankName: string;
    };
    stripe?: string;
    crypto?: {
      walletAddress: string;
      currency: string;
    };
  };
  minimumPayout: number;
  verified: boolean;
}

interface PayoutPeriod {
  id: string;
  startDate: string;
  endDate: string;
  totalRevenue: number;
  totalPaid: number;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  recipients: {
    recipientId: string;
    amount: number;
    status: 'pending' | 'sent' | 'completed' | 'failed';
    transactionId?: string;
    sentAt?: string;
    completedAt?: string;
    failureReason?: string;
  }[];
}

interface PayoutManagerProps {
  recipients: PayoutRecipient[];
  payoutPeriods: PayoutPeriod[];
  totalUnpaidRevenue: number;
  onAddRecipient: (recipient: Omit<PayoutRecipient, 'id'>) => void;
  onUpdateRecipient: (id: string, updates: Partial<PayoutRecipient>) => void;
  onRemoveRecipient: (id: string) => void;
  onProcessPayout: (periodId: string) => void;
  onRetryPayout: (periodId: string, recipientId: string) => void;
}

const PayoutManager: React.FC<PayoutManagerProps> = ({
  recipients,
  payoutPeriods,
  totalUnpaidRevenue,
  onAddRecipient,
  onUpdateRecipient,
  onRemoveRecipient,
  onProcessPayout,
  onRetryPayout
}) => {
  const [activeTab, setActiveTab] = useState<'recipients' | 'payouts' | 'settings'>('recipients');
  const [showAddRecipient, setShowAddRecipient] = useState(false);
  const [editingRecipient, setEditingRecipient] = useState<PayoutRecipient | null>(null);

  const [newRecipient, setNewRecipient] = useState({
    name: '',
    email: '',
    role: 'artist' as PayoutRecipient['role'],
    percentage: 0,
    payoutMethod: 'paypal' as PayoutRecipient['payoutMethod'],
    payoutDetails: {},
    minimumPayout: 25,
    verified: false
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getRoleIcon = (role: string) => {
    const icons = {
      artist: '🎤',
      producer: '🎛️',
      songwriter: '✍️',
      publisher: '📚',
      label: '🏢',
      other: '👤'
    };
    return icons[role as keyof typeof icons] || '👤';
  };

  const getPayoutMethodIcon = (method: string) => {
    const icons = {
      paypal: '💳',
      bank_transfer: '🏦',
      stripe: '💰',
      crypto: '₿'
    };
    return icons[method as keyof typeof icons] || '💳';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'processing': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'sent': return 'bg-indigo-100 text-indigo-800 border-indigo-200';
      case 'completed': return 'bg-green-100 text-green-800 border-green-200';
      case 'failed': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const calculateRecipientAmount = (recipient: PayoutRecipient) => {
    return (totalUnpaidRevenue * recipient.percentage) / 100;
  };

  const getTotalPercentage = () => {
    return recipients.reduce((sum, recipient) => sum + recipient.percentage, 0);
  };

  const handleAddRecipient = () => {
    if (newRecipient.name && newRecipient.email && newRecipient.percentage > 0) {
      onAddRecipient(newRecipient);
      setNewRecipient({
        name: '',
        email: '',
        role: 'artist',
        percentage: 0,
        payoutMethod: 'paypal',
        payoutDetails: {},
        minimumPayout: 25,
        verified: false
      });
      setShowAddRecipient(false);
    }
  };

  const renderRecipientsTab = () => (
    <div className="space-y-6">
      {/* Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-blue-700">Total Recipients</h3>
            <span className="text-blue-600">👥</span>
          </div>
          <div className="text-2xl font-bold text-blue-900">{recipients.length}</div>
        </div>

        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-green-700">Unpaid Revenue</h3>
            <span className="text-green-600">💰</span>
          </div>
          <div className="text-2xl font-bold text-green-900">{formatCurrency(totalUnpaidRevenue)}</div>
        </div>

        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-purple-700">Total Allocation</h3>
            <span className="text-purple-600">📊</span>
          </div>
          <div className={`text-2xl font-bold ${getTotalPercentage() === 100 ? 'text-purple-900' : 'text-red-600'}`}>
            {getTotalPercentage()}%
          </div>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-yellow-700">Verified Recipients</h3>
            <span className="text-yellow-600">✅</span>
          </div>
          <div className="text-2xl font-bold text-yellow-900">
            {recipients.filter(r => r.verified).length}/{recipients.length}
          </div>
        </div>
      </div>

      {/* Add Recipient Button */}
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-900">Payout Recipients</h3>
        <button
          onClick={() => setShowAddRecipient(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
        >
          + Add Recipient
        </button>
      </div>

      {/* Recipients List */}
      <div className="space-y-4">
        {recipients.map((recipient) => (
          <div
            key={recipient.id}
            className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-all"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-4 flex-1">
                <div className="text-3xl">{getRoleIcon(recipient.role)}</div>
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h4 className="font-semibold text-gray-900">{recipient.name}</h4>
                    {recipient.verified && (
                      <span className="bg-green-100 text-green-800 text-xs font-medium px-2 py-1 rounded-full">
                        ✓ Verified
                      </span>
                    )}
                  </div>
                  <div className="flex items-center space-x-6 text-sm text-gray-600 mb-3">
                    <div>
                      <span className="font-medium">Email:</span>
                      <span className="ml-1">{recipient.email}</span>
                    </div>
                    <div>
                      <span className="font-medium">Role:</span>
                      <span className="ml-1 capitalize">{recipient.role}</span>
                    </div>
                    <div>
                      <span className="font-medium">Payout Method:</span>
                      <span className="ml-1">{getPayoutMethodIcon(recipient.payoutMethod)} {recipient.payoutMethod}</span>
                    </div>
                  </div>

                  {/* Percentage & Amount */}
                  <div className="flex items-center space-x-4 mb-3">
                    <div className="flex items-center space-x-2">
                      <div className="w-32 bg-gray-200 rounded-full h-3">
                        <div
                          className="bg-blue-500 h-3 rounded-full"
                          style={{ width: `${recipient.percentage}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium text-gray-900">
                        {recipient.percentage}%
                      </span>
                    </div>
                    <div className="text-sm text-gray-600">
                      <span className="font-medium">Next payout:</span>
                      <span className="ml-1 text-green-600">
                        {formatCurrency(calculateRecipientAmount(recipient))}
                      </span>
                    </div>
                  </div>

                  {/* Minimum Payout */}
                  <div className="text-xs text-gray-500">
                    Minimum payout: {formatCurrency(recipient.minimumPayout)}
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex space-x-2">
                <button
                  onClick={() => setEditingRecipient(recipient)}
                  className="bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium py-1 px-3 rounded-md transition-colors"
                >
                  Edit
                </button>
                <button
                  onClick={() => onRemoveRecipient(recipient.id)}
                  className="bg-red-100 hover:bg-red-200 text-red-700 text-sm font-medium py-1 px-3 rounded-md transition-colors"
                >
                  Remove
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Allocation Warning */}
      {getTotalPercentage() !== 100 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <span className="text-yellow-600 text-xl">⚠️</span>
            <div>
              <h4 className="font-medium text-yellow-800">Allocation Warning</h4>
              <p className="text-sm text-yellow-700">
                Total allocation is {getTotalPercentage()}%.
                {getTotalPercentage() < 100
                  ? ` ${100 - getTotalPercentage()}% of revenue is unallocated.`
                  : ' This exceeds 100% and will cause payout errors.'
                }
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Add Recipient Modal */}
      {showAddRecipient && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Add New Recipient</h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                  <input
                    type="text"
                    value={newRecipient.name}
                    onChange={(e) => setNewRecipient(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    value={newRecipient.email}
                    onChange={(e) => setNewRecipient(prev => ({ ...prev, email: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                    <select
                      value={newRecipient.role}
                      onChange={(e) => setNewRecipient(prev => ({ ...prev, role: e.target.value as PayoutRecipient['role'] }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="artist">Artist</option>
                      <option value="producer">Producer</option>
                      <option value="songwriter">Songwriter</option>
                      <option value="publisher">Publisher</option>
                      <option value="label">Label</option>
                      <option value="other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Percentage</label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      step="0.1"
                      value={newRecipient.percentage}
                      onChange={(e) => setNewRecipient(prev => ({ ...prev, percentage: parseFloat(e.target.value) || 0 }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Payout Method</label>
                  <select
                    value={newRecipient.payoutMethod}
                    onChange={(e) => setNewRecipient(prev => ({ ...prev, payoutMethod: e.target.value as PayoutRecipient['payoutMethod'] }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="paypal">PayPal</option>
                    <option value="bank_transfer">Bank Transfer</option>
                    <option value="stripe">Stripe</option>
                    <option value="crypto">Cryptocurrency</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Minimum Payout ($)</label>
                  <input
                    type="number"
                    min="1"
                    value={newRecipient.minimumPayout}
                    onChange={(e) => setNewRecipient(prev => ({ ...prev, minimumPayout: parseFloat(e.target.value) || 25 }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => setShowAddRecipient(false)}
                  className="bg-gray-300 hover:bg-gray-400 text-gray-700 font-medium py-2 px-4 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddRecipient}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                >
                  Add Recipient
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const renderPayoutsTab = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-900">Payout History</h3>
        <button
          onClick={() => {/* Process new payout */}}
          disabled={getTotalPercentage() !== 100 || totalUnpaidRevenue < 25}
          className="bg-green-600 hover:bg-green-700 disabled:bg-green-300 text-white font-medium py-2 px-4 rounded-lg transition-colors"
        >
          Process New Payout
        </button>
      </div>

      <div className="space-y-4">
        {payoutPeriods.map((period) => (
          <div
            key={period.id}
            className="border border-gray-200 rounded-lg p-6"
          >
            <div className="flex items-start justify-between mb-4">
              <div>
                <h4 className="font-semibold text-gray-900">
                  {formatDate(period.startDate)} - {formatDate(period.endDate)}
                </h4>
                <div className="flex items-center space-x-4 text-sm text-gray-600 mt-1">
                  <span>Total Revenue: {formatCurrency(period.totalRevenue)}</span>
                  <span>Total Paid: {formatCurrency(period.totalPaid)}</span>
                </div>
              </div>
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(period.status)}`}>
                {period.status.charAt(0).toUpperCase() + period.status.slice(1)}
              </span>
            </div>

            {/* Recipients Breakdown */}
            <div className="space-y-2">
              <h5 className="font-medium text-gray-700">Recipients</h5>
              {period.recipients.map((recipient) => {
                const recipientData = recipients.find(r => r.id === recipient.recipientId);
                return (
                  <div
                    key={recipient.recipientId}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="flex items-center space-x-3">
                      <span className="text-lg">{recipientData ? getRoleIcon(recipientData.role) : '👤'}</span>
                      <div>
                        <div className="font-medium text-gray-900">
                          {recipientData?.name || 'Unknown Recipient'}
                        </div>
                        <div className="text-sm text-gray-600">
                          {formatCurrency(recipient.amount)}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(recipient.status)}`}>
                        {recipient.status.charAt(0).toUpperCase() + recipient.status.slice(1)}
                      </span>
                      {recipient.status === 'failed' && (
                        <button
                          onClick={() => onRetryPayout(period.id, recipient.recipientId)}
                          className="bg-blue-100 hover:bg-blue-200 text-blue-700 text-xs font-medium py-1 px-2 rounded transition-colors"
                        >
                          Retry
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {payoutPeriods.length === 0 && (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">💰</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Payouts Yet</h3>
          <p className="text-gray-600">
            Payout history will appear here once you process your first payout.
          </p>
        </div>
      )}
    </div>
  );

  const renderSettingsTab = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-900">Payout Settings</h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h4 className="font-medium text-gray-900 mb-4">Automatic Payouts</h4>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-700">Enable automatic payouts</span>
              <input type="checkbox" className="h-4 w-4 text-blue-600 rounded" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Payout frequency
              </label>
              <select className="w-full px-3 py-2 border border-gray-300 rounded-md">
                <option>Weekly</option>
                <option>Bi-weekly</option>
                <option>Monthly</option>
                <option>Quarterly</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Minimum total amount for automatic payout
              </label>
              <input
                type="number"
                placeholder="100"
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h4 className="font-medium text-gray-900 mb-4">Notification Settings</h4>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-700">Email notifications for payouts</span>
              <input type="checkbox" className="h-4 w-4 text-blue-600 rounded" defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-700">Notify recipients of payouts</span>
              <input type="checkbox" className="h-4 w-4 text-blue-600 rounded" defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-700">Weekly payout summaries</span>
              <input type="checkbox" className="h-4 w-4 text-blue-600 rounded" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-500 to-emerald-600 p-6 text-white">
        <h2 className="text-xl font-bold mb-4">Payout Manager</h2>

        {/* Tab Navigation */}
        <div className="flex space-x-1 bg-white bg-opacity-20 rounded-lg p-1">
          {[
            { id: 'recipients', label: '👥 Recipients' },
            { id: 'payouts', label: '💰 Payouts' },
            { id: 'settings', label: '⚙️ Settings' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                activeTab === tab.id
                  ? 'bg-white text-green-600'
                  : 'text-white hover:bg-white hover:bg-opacity-10'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {activeTab === 'recipients' && renderRecipientsTab()}
        {activeTab === 'payouts' && renderPayoutsTab()}
        {activeTab === 'settings' && renderSettingsTab()}
      </div>
    </div>
  );
};

export default PayoutManager;
