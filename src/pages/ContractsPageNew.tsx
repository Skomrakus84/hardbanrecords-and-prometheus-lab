import React, { useState } from 'react';

interface Contract {
  id: string;
  title: string;
  type: 'artist' | 'distribution' | 'publishing' | 'licensing' | 'collaboration';
  party: string;
  status: 'active' | 'expired' | 'pending' | 'terminated' | 'draft';
  startDate: string;
  endDate: string;
  value: number;
  currency: string;
  royaltyRate?: number;
  paymentTerms: string;
  autoRenewal: boolean;
  notificationDays: number;
  documents: string[];
  description: string;
  keyTerms: string[];
  priority: 'high' | 'medium' | 'low';
}

interface Payment {
  id: string;
  contractId: string;
  amount: number;
  currency: string;
  dueDate: string;
  status: 'paid' | 'pending' | 'overdue';
  description: string;
}

const ContractsPageNew: React.FC = () => {
  const [selectedTab, setSelectedTab] = useState<'all' | 'active' | 'pending' | 'expired' | 'draft'>('all');
  const [showContractModal, setShowContractModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedContract, setSelectedContract] = useState<Contract | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const contracts: Contract[] = [
    {
      id: '1',
      title: 'Artist Recording Agreement - Sarah Johnson',
      type: 'artist',
      party: 'Sarah Johnson',
      status: 'active',
      startDate: '2024-01-01',
      endDate: '2026-12-31',
      value: 250000,
      currency: 'USD',
      royaltyRate: 15,
      paymentTerms: 'Quarterly',
      autoRenewal: true,
      notificationDays: 90,
      documents: ['contract.pdf', 'addendum_01.pdf', 'royalty_schedule.pdf'],
      description: 'Exclusive recording agreement for 3 albums with 15% royalty rate and marketing support.',
      keyTerms: ['3 Album Deal', '15% Royalty', 'Marketing Support', 'Exclusive Rights'],
      priority: 'high'
    },
    {
      id: '2',
      title: 'Digital Distribution - Spotify Premium',
      type: 'distribution',
      party: 'Spotify Technologies S.A.',
      status: 'active',
      startDate: '2023-06-15',
      endDate: '2025-06-14',
      value: 50000,
      currency: 'USD',
      royaltyRate: 70,
      paymentTerms: 'Monthly',
      autoRenewal: true,
      notificationDays: 60,
      documents: ['spotify_agreement.pdf', 'terms_conditions.pdf'],
      description: 'Premium distribution agreement with enhanced playlist placement and analytics.',
      keyTerms: ['70% Revenue Share', 'Playlist Placement', 'Advanced Analytics', 'Priority Support'],
      priority: 'high'
    },
    {
      id: '3',
      title: 'Music Publishing Deal - Universal Music',
      type: 'publishing',
      party: 'Universal Music Publishing Group',
      status: 'active',
      startDate: '2024-03-01',
      endDate: '2027-02-28',
      value: 500000,
      currency: 'USD',
      royaltyRate: 25,
      paymentTerms: 'Bi-annual',
      autoRenewal: false,
      notificationDays: 180,
      documents: ['publishing_agreement.pdf', 'catalog_schedule.pdf', 'advance_terms.pdf'],
      description: 'Global publishing deal covering sync rights, mechanical royalties, and performance rights.',
      keyTerms: ['Global Rights', '25% Royalty', 'Sync Licensing', '$500K Advance'],
      priority: 'high'
    },
    {
      id: '4',
      title: 'Studio Rental Agreement - Abbey Road',
      type: 'collaboration',
      party: 'Abbey Road Studios Ltd',
      status: 'pending',
      startDate: '2024-04-01',
      endDate: '2024-04-30',
      value: 25000,
      currency: 'GBP',
      paymentTerms: 'Upfront',
      autoRenewal: false,
      notificationDays: 30,
      documents: ['studio_agreement_draft.pdf'],
      description: 'Monthly studio rental for album recording sessions with included engineer support.',
      keyTerms: ['Studio 2 Access', 'Engineer Included', 'Equipment Package', 'Mixing Suite'],
      priority: 'medium'
    },
    {
      id: '5',
      title: 'Sync Licensing - Netflix Original',
      type: 'licensing',
      party: 'Netflix Entertainment Services',
      status: 'expired',
      startDate: '2023-01-15',
      endDate: '2024-01-14',
      value: 75000,
      currency: 'USD',
      paymentTerms: 'One-time',
      autoRenewal: false,
      notificationDays: 30,
      documents: ['netflix_sync_license.pdf', 'usage_report.pdf'],
      description: 'Synchronization license for original series soundtrack placement.',
      keyTerms: ['Global Rights', 'Streaming Only', 'Exclusive Usage', 'Credit Required'],
      priority: 'low'
    },
    {
      id: '6',
      title: 'Producer Agreement - Mike Chen',
      type: 'collaboration',
      party: 'Mike Chen Productions',
      status: 'draft',
      startDate: '2024-05-01',
      endDate: '2024-08-31',
      value: 40000,
      currency: 'USD',
      royaltyRate: 5,
      paymentTerms: 'Project completion',
      autoRenewal: false,
      notificationDays: 14,
      documents: ['producer_agreement_draft.pdf'],
      description: 'Producer services for upcoming album with 5% backend royalty participation.',
      keyTerms: ['Producer Credits', '5% Backend', 'Creative Control', 'Mixing Rights'],
      priority: 'medium'
    }
  ];

  const payments: Payment[] = [
    {
      id: '1',
      contractId: '1',
      amount: 12500,
      currency: 'USD',
      dueDate: '2024-04-01',
      status: 'pending',
      description: 'Q1 2024 Royalty Payment'
    },
    {
      id: '2',
      contractId: '2',
      amount: 8750,
      currency: 'USD',
      dueDate: '2024-04-15',
      status: 'paid',
      description: 'March 2024 Distribution Revenue'
    },
    {
      id: '3',
      contractId: '3',
      amount: 125000,
      currency: 'USD',
      dueDate: '2024-03-01',
      status: 'paid',
      description: 'Publishing Advance - First Half'
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'expired': return 'bg-red-100 text-red-800';
      case 'terminated': return 'bg-gray-100 text-gray-800';
      case 'draft': return 'bg-blue-100 text-blue-800';
      case 'paid': return 'bg-green-100 text-green-800';
      case 'overdue': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return '✅';
      case 'pending': return '⏳';
      case 'expired': return '⚠️';
      case 'terminated': return '❌';
      case 'draft': return '📝';
      case 'paid': return '💰';
      case 'overdue': return '🚨';
      default: return '📄';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'artist': return '🎤';
      case 'distribution': return '📱';
      case 'publishing': return '📚';
      case 'licensing': return '🎬';
      case 'collaboration': return '🤝';
      default: return '📄';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredContracts = selectedTab === 'all' ? contracts : contracts.filter(contract => contract.status === selectedTab);

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency
    }).format(amount);
  };

  const getDaysUntilExpiry = (endDate: string) => {
    const today = new Date();
    const expiry = new Date(endDate);
    const diffTime = expiry.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getExpiryWarning = (endDate: string, notificationDays: number) => {
    const daysUntil = getDaysUntilExpiry(endDate);
    if (daysUntil <= 0) return 'expired';
    if (daysUntil <= notificationDays) return 'warning';
    return 'normal';
  };

  const activeContracts = contracts.filter(c => c.status === 'active').length;
  const pendingContracts = contracts.filter(c => c.status === 'pending').length;
  const expiringContracts = contracts.filter(c =>
    c.status === 'active' && getDaysUntilExpiry(c.endDate) <= c.notificationDays
  ).length;
  const totalValue = contracts.filter(c => c.status === 'active').reduce((sum, c) => sum + c.value, 0);

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">📋 Contracts Management</h1>
            <p className="text-gray-600 mt-2">Track agreements, renewals, and payment obligations</p>
          </div>
          <div className="flex items-center space-x-3">
            <div className="flex bg-gray-200 rounded-lg p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                  viewMode === 'grid' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600'
                }`}
              >
                📊 Grid
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                  viewMode === 'list' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600'
                }`}
              >
                📋 List
              </button>
            </div>
            <button
              onClick={() => setShowContractModal(true)}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors flex items-center space-x-2"
            >
              <span>➕</span>
              <span>New Contract</span>
            </button>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl shadow-lg p-6 text-white">
            <div className="flex items-center justify-between mb-2">
              <div className="text-2xl">📋</div>
              <div className="text-right">
                <p className="text-2xl font-bold">{activeContracts}</p>
                <p className="text-sm opacity-90">Active Contracts</p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-xl shadow-lg p-6 text-white">
            <div className="flex items-center justify-between mb-2">
              <div className="text-2xl">⏳</div>
              <div className="text-right">
                <p className="text-2xl font-bold">{pendingContracts}</p>
                <p className="text-sm opacity-90">Pending Review</p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-red-500 to-red-600 rounded-xl shadow-lg p-6 text-white">
            <div className="flex items-center justify-between mb-2">
              <div className="text-2xl">⚠️</div>
              <div className="text-right">
                <p className="text-2xl font-bold">{expiringContracts}</p>
                <p className="text-sm opacity-90">Expiring Soon</p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-xl shadow-lg p-6 text-white">
            <div className="flex items-center justify-between mb-2">
              <div className="text-2xl">💰</div>
              <div className="text-right">
                <p className="text-2xl font-bold">${(totalValue / 1000000).toFixed(1)}M</p>
                <p className="text-sm opacity-90">Total Value</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex space-x-1 bg-gray-200 rounded-lg p-1">
          {(['all', 'active', 'pending', 'expired', 'draft'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setSelectedTab(tab)}
              className={`px-4 py-2 rounded-md font-medium text-sm transition-colors ${
                selectedTab === tab
                  ? 'bg-white text-indigo-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {tab === 'all' ? '📁 All Contracts' :
               `${getStatusIcon(tab)} ${tab.charAt(0).toUpperCase() + tab.slice(1)}`}
            </button>
          ))}
        </div>
      </div>

      {/* Contracts Grid/List */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredContracts.map((contract) => {
            const expiryWarning = getExpiryWarning(contract.endDate, contract.notificationDays);
            const daysUntilExpiry = getDaysUntilExpiry(contract.endDate);

            return (
              <div
                key={contract.id}
                className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden hover:shadow-xl transition-all hover:-translate-y-1 cursor-pointer"
                onClick={() => setSelectedContract(contract)}
              >
                {/* Contract Header */}
                <div className="p-6 border-b border-gray-100">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center text-2xl">
                        {getTypeIcon(contract.type)}
                      </div>
                      <div>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(contract.status)}`}>
                          {getStatusIcon(contract.status)} {contract.status.toUpperCase()}
                        </span>
                      </div>
                    </div>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(contract.priority)}`}>
                      {contract.priority.toUpperCase()}
                    </span>
                  </div>

                  <h3 className="text-lg font-semibold text-gray-900 mb-1">{contract.title}</h3>
                  <p className="text-sm text-gray-600">{contract.party}</p>
                </div>

                {/* Contract Details */}
                <div className="p-6 border-b border-gray-100">
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wider">Value</p>
                      <p className="text-lg font-semibold text-gray-900">
                        {formatCurrency(contract.value, contract.currency)}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wider">Royalty</p>
                      <p className="text-lg font-semibold text-gray-900">
                        {contract.royaltyRate ? `${contract.royaltyRate}%` : 'N/A'}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Start Date:</span>
                      <span className="font-medium">{new Date(contract.startDate).toLocaleDateString()}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">End Date:</span>
                      <span className={`font-medium ${expiryWarning === 'warning' ? 'text-red-600' : expiryWarning === 'expired' ? 'text-red-800' : ''}`}>
                        {new Date(contract.endDate).toLocaleDateString()}
                      </span>
                    </div>
                    {contract.status === 'active' && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Days Until Expiry:</span>
                        <span className={`font-medium ${daysUntilExpiry <= contract.notificationDays ? 'text-red-600' : ''}`}>
                          {daysUntilExpiry > 0 ? daysUntilExpiry : 'Expired'}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Key Terms */}
                <div className="p-6 border-b border-gray-100">
                  <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">Key Terms</p>
                  <div className="flex flex-wrap gap-1">
                    {contract.keyTerms.slice(0, 3).map((term, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-700"
                      >
                        {term}
                      </span>
                    ))}
                    {contract.keyTerms.length > 3 && (
                      <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-700">
                        +{contract.keyTerms.length - 3}
                      </span>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="p-6">
                  <div className="flex space-x-2">
                    <button className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium py-2 px-3 rounded-md transition-colors">
                      View Details
                    </button>
                    <button className="flex-1 bg-indigo-100 hover:bg-indigo-200 text-indigo-700 text-sm font-medium py-2 px-3 rounded-md transition-colors">
                      Edit
                    </button>
                  </div>
                  {contract.autoRenewal && (
                    <p className="text-xs text-green-600 text-center mt-2">🔄 Auto-renewal enabled</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* List View */
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
          <div className="divide-y divide-gray-200">
            {filteredContracts.map((contract) => {
              const expiryWarning = getExpiryWarning(contract.endDate, contract.notificationDays);
              const daysUntilExpiry = getDaysUntilExpiry(contract.endDate);

              return (
                <div
                  key={contract.id}
                  className="p-6 hover:bg-gray-50 transition-colors cursor-pointer"
                  onClick={() => setSelectedContract(contract)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center text-xl">
                        {getTypeIcon(contract.type)}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-3 mb-1">
                          <h3 className="text-lg font-semibold text-gray-900 truncate">{contract.title}</h3>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(contract.status)}`}>
                            {getStatusIcon(contract.status)} {contract.status.toUpperCase()}
                          </span>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(contract.priority)}`}>
                            {contract.priority.toUpperCase()}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">{contract.party} • {contract.type}</p>
                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                          <span>{formatCurrency(contract.value, contract.currency)}</span>
                          <span>{contract.royaltyRate ? `${contract.royaltyRate}% royalty` : 'Fixed fee'}</span>
                          <span>{contract.paymentTerms}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-6">
                      <div className="text-right">
                        <p className="text-sm font-medium text-gray-900">
                          {new Date(contract.endDate).toLocaleDateString()}
                        </p>
                        {contract.status === 'active' && (
                          <p className={`text-xs ${daysUntilExpiry <= contract.notificationDays ? 'text-red-600' : 'text-gray-500'}`}>
                            {daysUntilExpiry > 0 ? `${daysUntilExpiry} days left` : 'Expired'}
                          </p>
                        )}
                        {contract.autoRenewal && (
                          <p className="text-xs text-green-600">🔄 Auto-renewal</p>
                        )}
                      </div>

                      <div className="flex space-x-2">
                        <button className="bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium py-1 px-3 rounded-md transition-colors">
                          View
                        </button>
                        <button className="bg-indigo-100 hover:bg-indigo-200 text-indigo-700 text-sm font-medium py-1 px-3 rounded-md transition-colors">
                          Edit
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Contract Detail Modal */}
      {selectedContract && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-screen overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center text-xl">
                    {getTypeIcon(selectedContract.type)}
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">{selectedContract.title}</h2>
                    <p className="text-sm text-gray-600">{selectedContract.party}</p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedContract(null)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  ✕
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Status & Priority */}
              <div className="flex items-center space-x-4">
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(selectedContract.status)}`}>
                  {getStatusIcon(selectedContract.status)} {selectedContract.status.toUpperCase()}
                </span>
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getPriorityColor(selectedContract.priority)}`}>
                  {selectedContract.priority.toUpperCase()} PRIORITY
                </span>
                {selectedContract.autoRenewal && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                    🔄 AUTO-RENEWAL
                  </span>
                )}
              </div>

              {/* Contract Overview */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                  <h3 className="text-lg font-medium text-gray-900 mb-3">Description</h3>
                  <p className="text-gray-700 leading-relaxed mb-6">{selectedContract.description}</p>

                  <h4 className="text-md font-medium text-gray-900 mb-3">Key Terms</h4>
                  <div className="grid grid-cols-2 gap-2">
                    {selectedContract.keyTerms.map((term, index) => (
                      <div
                        key={index}
                        className="flex items-center space-x-2 p-2 bg-gray-50 rounded-lg"
                      >
                        <span className="w-2 h-2 bg-indigo-500 rounded-full"></span>
                        <span className="text-sm text-gray-700">{term}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-6">
                  <div>
                    <h4 className="text-md font-medium text-gray-900 mb-3">Financial Details</h4>
                    <div className="space-y-3">
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <p className="text-sm font-medium text-gray-500">Total Value</p>
                        <p className="text-xl font-bold text-gray-900">
                          {formatCurrency(selectedContract.value, selectedContract.currency)}
                        </p>
                      </div>
                      {selectedContract.royaltyRate && (
                        <div className="bg-gray-50 p-3 rounded-lg">
                          <p className="text-sm font-medium text-gray-500">Royalty Rate</p>
                          <p className="text-xl font-bold text-gray-900">{selectedContract.royaltyRate}%</p>
                        </div>
                      )}
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <p className="text-sm font-medium text-gray-500">Payment Terms</p>
                        <p className="text-lg font-semibold text-gray-900">{selectedContract.paymentTerms}</p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-md font-medium text-gray-900 mb-3">Timeline</h4>
                    <div className="space-y-3">
                      <div>
                        <p className="text-sm font-medium text-gray-500">Start Date</p>
                        <p className="text-lg text-gray-900">{new Date(selectedContract.startDate).toLocaleDateString()}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500">End Date</p>
                        <p className="text-lg text-gray-900">{new Date(selectedContract.endDate).toLocaleDateString()}</p>
                      </div>
                      {selectedContract.status === 'active' && (
                        <div>
                          <p className="text-sm font-medium text-gray-500">Days Remaining</p>
                          <p className={`text-lg font-semibold ${getDaysUntilExpiry(selectedContract.endDate) <= selectedContract.notificationDays ? 'text-red-600' : 'text-gray-900'}`}>
                            {getDaysUntilExpiry(selectedContract.endDate) > 0 ? getDaysUntilExpiry(selectedContract.endDate) : 'Expired'}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Documents */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Documents ({selectedContract.documents.length})</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {selectedContract.documents.map((doc, index) => (
                    <div
                      key={index}
                      className="bg-gray-50 border border-gray-200 rounded-lg p-3 hover:bg-gray-100 transition-colors cursor-pointer"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-red-100 text-red-600 rounded-lg flex items-center justify-center text-sm">
                          📄
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">{doc}</p>
                          <p className="text-xs text-gray-500">PDF Document</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Related Payments */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Related Payments</h3>
                <div className="space-y-3">
                  {payments.filter(p => p.contractId === selectedContract.id).map((payment) => (
                    <div
                      key={payment.id}
                      className="bg-gray-50 border border-gray-200 rounded-lg p-4"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-gray-900">{payment.description}</p>
                          <p className="text-sm text-gray-600">Due: {new Date(payment.dueDate).toLocaleDateString()}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-semibold text-gray-900">
                            {formatCurrency(payment.amount, payment.currency)}
                          </p>
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(payment.status)}`}>
                            {getStatusIcon(payment.status)} {payment.status.toUpperCase()}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-3 pt-4 border-t border-gray-200">
                <button className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-2 px-4 rounded-lg transition-colors">
                  Download Contract
                </button>
                <button className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors">
                  Edit Contract
                </button>
                <button
                  onClick={() => setShowPaymentModal(true)}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
                >
                  Add Payment
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Contract Modal */}
      {showContractModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-3xl w-full max-h-screen overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900">Create New Contract</h2>
                <button
                  onClick={() => setShowContractModal(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  ✕
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Contract Title</label>
                  <input
                    type="text"
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="Enter contract title"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Contract Type</label>
                  <select className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500">
                    <option value="">Select type</option>
                    <option value="artist">Artist Agreement</option>
                    <option value="distribution">Distribution Deal</option>
                    <option value="publishing">Publishing Agreement</option>
                    <option value="licensing">Licensing Deal</option>
                    <option value="collaboration">Collaboration</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Party Name</label>
                  <input
                    type="text"
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="Company or individual name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                  <select className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500">
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="low">Low</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Contract Value</label>
                  <input
                    type="number"
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="100000"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Currency</label>
                  <select className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500">
                    <option value="USD">USD</option>
                    <option value="EUR">EUR</option>
                    <option value="GBP">GBP</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Royalty Rate (%)</label>
                  <input
                    type="number"
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="15"
                    min="0"
                    max="100"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                  <input
                    type="date"
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                  <input
                    type="date"
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Payment Terms</label>
                <select className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500">
                  <option value="Monthly">Monthly</option>
                  <option value="Quarterly">Quarterly</option>
                  <option value="Bi-annual">Bi-annual</option>
                  <option value="Annual">Annual</option>
                  <option value="One-time">One-time</option>
                  <option value="Project completion">Project completion</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  rows={4}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Contract description and key details..."
                />
              </div>

              <div className="flex items-center space-x-4">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">Enable auto-renewal</span>
                </label>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Notification Days</label>
                  <input
                    type="number"
                    className="w-20 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="90"
                  />
                </div>
              </div>

              <div className="flex space-x-3 pt-4 border-t border-gray-200">
                <button
                  onClick={() => setShowContractModal(false)}
                  className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-2 px-4 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors">
                  Create Contract
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ContractsPageNew;
