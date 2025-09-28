import React, { useState, useEffect } from 'react';
import PayoutManager from '../../components/music/PayoutManager';
import PayoutHistory from '../../components/music/PayoutHistory';
import RoyaltyCalculator from '../../components/music/RoyaltyCalculator';
import { useNavigate } from 'react-router-dom';

interface PayoutPageData {
  currentBalance: number;
  minimumPayout: number;
  nextPayoutDate: string;
  pendingPayouts: Array<{
    id: string;
    amount: number;
    currency: string;
    status: 'pending' | 'processing' | 'completed' | 'failed';
    requestDate: string;
    estimatedDelivery: string;
    method: 'bank_transfer' | 'paypal' | 'check' | 'cryptocurrency';
    releases: Array<{
      releaseId: string;
      title: string;
      artistName: string;
      amount: number;
      royaltyPeriod: string;
    }>;
  }>;
  payoutHistory: Array<{
    id: string;
    amount: number;
    currency: string;
    status: 'completed' | 'failed' | 'cancelled';
    requestDate: string;
    processedDate: string;
    method: 'bank_transfer' | 'paypal' | 'check' | 'cryptocurrency';
    transactionId?: string;
    releases: Array<{
      releaseId: string;
      title: string;
      artistName: string;
      amount: number;
      royaltyPeriod: string;
    }>;
  }>;
  paymentMethods: Array<{
    id: string;
    type: 'bank_transfer' | 'paypal' | 'check' | 'cryptocurrency';
    label: string;
    details: string;
    isDefault: boolean;
    isActive: boolean;
    minimumAmount?: number;
    processingTime: string;
    fees: {
      fixed: number;
      percentage: number;
    };
  }>;
}

const PayoutsPage: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [payoutData, setPayoutData] = useState<PayoutPageData | null>(null);
  const [activeTab, setActiveTab] = useState<'manager' | 'history' | 'calculator'>('manager');

  // Sample payout data
  const samplePayoutData: PayoutPageData = {
    currentBalance: 2847.83,
    minimumPayout: 100,
    nextPayoutDate: '2024-04-15',
    pendingPayouts: [
      {
        id: 'payout-001',
        amount: 1250.00,
        currency: 'USD',
        status: 'processing',
        requestDate: '2024-03-28',
        estimatedDelivery: '2024-04-03',
        method: 'bank_transfer',
        releases: [
          { releaseId: 'rel-001', title: 'Midnight Dreams', artistName: 'Luna Rose', amount: 520.00, royaltyPeriod: 'February 2024' },
          { releaseId: 'rel-002', title: 'Electric Pulse', artistName: 'Neon Beats', amount: 730.00, royaltyPeriod: 'February 2024' }
        ]
      },
      {
        id: 'payout-002',
        amount: 850.00,
        currency: 'USD',
        status: 'pending',
        requestDate: '2024-03-30',
        estimatedDelivery: '2024-04-05',
        method: 'paypal',
        releases: [
          { releaseId: 'rel-003', title: 'Cosmic Journey', artistName: 'Space Harmonics', amount: 400.00, royaltyPeriod: 'March 2024' },
          { releaseId: 'rel-004', title: 'Urban Flow', artistName: 'City Vibes', amount: 450.00, royaltyPeriod: 'March 2024' }
        ]
      }
    ],
    payoutHistory: [
      {
        id: 'payout-hist-001',
        amount: 1850.50,
        currency: 'USD',
        status: 'completed',
        requestDate: '2024-02-28',
        processedDate: '2024-03-05',
        method: 'bank_transfer',
        transactionId: 'TXN-BT-78945612',
        releases: [
          { releaseId: 'rel-005', title: 'Sunset Boulevard', artistName: 'Golden Hour', amount: 950.50, royaltyPeriod: 'January 2024' },
          { releaseId: 'rel-006', title: 'Digital Dreams', artistName: 'Cyber Symphony', amount: 900.00, royaltyPeriod: 'January 2024' }
        ]
      },
      {
        id: 'payout-hist-002',
        amount: 1200.00,
        currency: 'USD',
        status: 'completed',
        requestDate: '2024-01-31',
        processedDate: '2024-02-06',
        method: 'paypal',
        transactionId: 'PP-98765432101',
        releases: [
          { releaseId: 'rel-007', title: 'Acoustic Soul', artistName: 'River Stone', amount: 650.00, royaltyPeriod: 'December 2023' },
          { releaseId: 'rel-008', title: 'Bass Drop', artistName: 'Thunder Beats', amount: 550.00, royaltyPeriod: 'December 2023' }
        ]
      },
      {
        id: 'payout-hist-003',
        amount: 750.00,
        currency: 'USD',
        status: 'failed',
        requestDate: '2024-01-15',
        processedDate: '2024-01-18',
        method: 'bank_transfer',
        releases: [
          { releaseId: 'rel-009', title: 'Melody Lane', artistName: 'Harmony Collective', amount: 750.00, royaltyPeriod: 'November 2023' }
        ]
      }
    ],
    paymentMethods: [
      {
        id: 'method-001',
        type: 'bank_transfer',
        label: 'Bank Transfer',
        details: 'Wells Fargo ***4567',
        isDefault: true,
        isActive: true,
        minimumAmount: 100,
        processingTime: '3-5 business days',
        fees: { fixed: 5.00, percentage: 0 }
      },
      {
        id: 'method-002',
        type: 'paypal',
        label: 'PayPal',
        details: 'artist@email.com',
        isDefault: false,
        isActive: true,
        minimumAmount: 25,
        processingTime: '1-2 business days',
        fees: { fixed: 0, percentage: 2.9 }
      },
      {
        id: 'method-003',
        type: 'check',
        label: 'Physical Check',
        details: '123 Artist Street, Music City, TN',
        isDefault: false,
        isActive: true,
        minimumAmount: 200,
        processingTime: '7-10 business days',
        fees: { fixed: 15.00, percentage: 0 }
      },
      {
        id: 'method-004',
        type: 'cryptocurrency',
        label: 'Bitcoin Wallet',
        details: 'bc1q...xyz789',
        isDefault: false,
        isActive: false,
        minimumAmount: 50,
        processingTime: '24-48 hours',
        fees: { fixed: 10.00, percentage: 1.0 }
      }
    ]
  };

  useEffect(() => {
    const loadPayoutData = async () => {
      setLoading(true);
      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        setPayoutData(samplePayoutData);
      } catch (error) {
        console.error('Failed to load payout data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadPayoutData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">💰</div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Loading Payouts...</h2>
          <p className="text-gray-600">Please wait while we load your payout information.</p>
        </div>
      </div>
    );
  }

  if (!payoutData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">❌</div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Failed to Load Payouts</h2>
          <p className="text-gray-600 mb-4">There was an error loading your payout data.</p>
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
            <h1 className="text-3xl font-bold text-gray-900">Payouts & Royalties</h1>
            <p className="text-gray-600 mt-1">Manage your earnings and payment methods</p>
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
              onClick={() => navigate('/music/notifications')}
              className="bg-purple-100 hover:bg-purple-200 text-purple-700 font-medium py-2 px-4 rounded-lg transition-colors"
            >
              🔔 Notifications
            </button>
          </div>
        </div>

        {/* Balance Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-lg text-white p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium opacity-90">Available Balance</h3>
              <span className="text-2xl">💰</span>
            </div>
            <div className="text-3xl font-bold mb-2">
              ${payoutData.currentBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </div>
            <div className="text-sm opacity-90">
              Ready for withdrawal
            </div>
          </div>

          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg text-white p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium opacity-90">Pending Payouts</h3>
              <span className="text-2xl">⏳</span>
            </div>
            <div className="text-3xl font-bold mb-2">
              {payoutData.pendingPayouts.length}
            </div>
            <div className="text-sm opacity-90">
              ${payoutData.pendingPayouts.reduce((sum, p) => sum + p.amount, 0).toLocaleString('en-US', { minimumFractionDigits: 2 })} total
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg text-white p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium opacity-90">Next Payout</h3>
              <span className="text-2xl">📅</span>
            </div>
            <div className="text-3xl font-bold mb-2">
              {new Date(payoutData.nextPayoutDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            </div>
            <div className="text-sm opacity-90">
              Automatic payout date
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              <button
                onClick={() => setActiveTab('manager')}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'manager'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                💰 Payout Manager
              </button>
              <button
                onClick={() => setActiveTab('history')}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'history'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                📋 Payment History
              </button>
              <button
                onClick={() => setActiveTab('calculator')}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'calculator'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                🧮 Royalty Calculator
              </button>
            </nav>
          </div>

          <div className="p-6">
            {activeTab === 'manager' && (
              <PayoutManager
                currentBalance={payoutData.currentBalance}
                minimumPayout={payoutData.minimumPayout}
                pendingPayouts={payoutData.pendingPayouts}
                paymentMethods={payoutData.paymentMethods}
                onRequestPayout={(amount, methodId) => {
                  console.log(`Requesting payout of $${amount} via method ${methodId}`);
                  // Handle payout request
                }}
                onCancelPayout={(payoutId) => {
                  console.log(`Cancelling payout ${payoutId}`);
                  // Handle payout cancellation
                }}
                onAddPaymentMethod={(method) => {
                  console.log('Adding payment method:', method);
                  // Handle adding payment method
                }}
                onEditPaymentMethod={(methodId, updates) => {
                  console.log(`Editing payment method ${methodId}:`, updates);
                  // Handle editing payment method
                }}
                onDeletePaymentMethod={(methodId) => {
                  console.log(`Deleting payment method ${methodId}`);
                  // Handle deleting payment method
                }}
                currency="USD"
              />
            )}

            {activeTab === 'history' && (
              <PayoutHistory
                payouts={payoutData.payoutHistory}
                currency="USD"
                onViewDetails={(payoutId) => {
                  console.log(`Viewing details for payout ${payoutId}`);
                  // Handle viewing payout details
                }}
                onDownloadReceipt={(payoutId) => {
                  console.log(`Downloading receipt for payout ${payoutId}`);
                  // Handle downloading receipt
                }}
                onExportData={(format, dateRange) => {
                  console.log(`Exporting data in ${format} format for ${dateRange.startDate} to ${dateRange.endDate}`);
                  // Handle exporting data
                }}
              />
            )}

            {activeTab === 'calculator' && (
              <RoyaltyCalculator
                onCalculate={(calculation) => {
                  console.log('Royalty calculation:', calculation);
                  // Handle royalty calculation
                }}
                currency="USD"
              />
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Quick Actions</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <button className="bg-green-50 hover:bg-green-100 border border-green-200 text-green-700 font-medium py-3 px-4 rounded-lg transition-colors">
              💸 Request Instant Payout
            </button>
            <button className="bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-700 font-medium py-3 px-4 rounded-lg transition-colors">
              💳 Add Payment Method
            </button>
            <button className="bg-purple-50 hover:bg-purple-100 border border-purple-200 text-purple-700 font-medium py-3 px-4 rounded-lg transition-colors">
              📊 View Earnings Report
            </button>
            <button className="bg-orange-50 hover:bg-orange-100 border border-orange-200 text-orange-700 font-medium py-3 px-4 rounded-lg transition-colors">
              ⚙️ Payout Settings
            </button>
          </div>
        </div>

        {/* Tax Information */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Tax Information</h3>
            <span className="text-2xl">📄</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Tax Documents</h4>
              <p className="text-sm text-gray-600 mb-4">
                Access your yearly tax documents for reporting purposes.
              </p>
              <div className="space-y-2">
                <button className="block w-full text-left bg-gray-50 hover:bg-gray-100 p-3 rounded-lg transition-colors">
                  📋 2024 1099-MISC (Available January 31, 2025)
                </button>
                <button className="block w-full text-left bg-gray-50 hover:bg-gray-100 p-3 rounded-lg transition-colors">
                  📋 2023 1099-MISC (Download)
                </button>
                <button className="block w-full text-left bg-gray-50 hover:bg-gray-100 p-3 rounded-lg transition-colors">
                  📋 2022 1099-MISC (Download)
                </button>
              </div>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Tax Settings</h4>
              <p className="text-sm text-gray-600 mb-4">
                Manage your tax information and withholding preferences.
              </p>
              <div className="space-y-2">
                <button className="block w-full text-left bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-700 p-3 rounded-lg transition-colors">
                  📝 Update Tax Information
                </button>
                <button className="block w-full text-left bg-purple-50 hover:bg-purple-100 border border-purple-200 text-purple-700 p-3 rounded-lg transition-colors">
                  🌍 International Tax Forms
                </button>
                <button className="block w-full text-left bg-green-50 hover:bg-green-100 border border-green-200 text-green-700 p-3 rounded-lg transition-colors">
                  💡 Tax Resources & Help
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PayoutsPage;
