import React, { useState } from 'react';

interface Split {
  id: string;
  collaborator: string;
  email: string;
  role: 'artist' | 'producer' | 'songwriter' | 'featured' | 'mixer' | 'other';
  percentage: number;
  payoutMethod: 'paypal' | 'bank' | 'crypto' | 'check';
  payoutDetails?: string;
}

interface SplitsEditorProps {
  trackTitle: string;
  initialSplits?: Split[];
  onSplitsChange: (splits: Split[]) => void;
  onSave: () => void;
  onCancel: () => void;
}

const SplitsEditor: React.FC<SplitsEditorProps> = ({
  trackTitle,
  initialSplits = [],
  onSplitsChange,
  onSave,
  onCancel
}) => {
  const [splits, setSplits] = useState<Split[]>(
    initialSplits.length > 0 ? initialSplits : [
      {
        id: '1',
        collaborator: '',
        email: '',
        role: 'artist',
        percentage: 100,
        payoutMethod: 'paypal',
        payoutDetails: ''
      }
    ]
  );

  const [searchTerm, setSearchTerm] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);

  // Mock collaborator suggestions
  const collaboratorSuggestions = [
    { name: 'Sarah Johnson', email: 'sarah@email.com', role: 'artist' },
    { name: 'Mike Producer', email: 'mike@email.com', role: 'producer' },
    { name: 'Alex Writer', email: 'alex@email.com', role: 'songwriter' },
    { name: 'Emma Mixer', email: 'emma@email.com', role: 'mixer' }
  ];

  const addSplit = () => {
    const newSplit: Split = {
      id: Date.now().toString(),
      collaborator: '',
      email: '',
      role: 'artist',
      percentage: 0,
      payoutMethod: 'paypal',
      payoutDetails: ''
    };

    const updatedSplits = [...splits, newSplit];
    setSplits(updatedSplits);
    onSplitsChange(updatedSplits);
    setShowAddForm(true);
  };

  const removeSplit = (id: string) => {
    const updatedSplits = splits.filter(split => split.id !== id);
    setSplits(updatedSplits);
    onSplitsChange(updatedSplits);
  };

  const updateSplit = (id: string, field: keyof Split, value: any) => {
    const updatedSplits = splits.map(split =>
      split.id === id ? { ...split, [field]: value } : split
    );
    setSplits(updatedSplits);
    onSplitsChange(updatedSplits);
  };

  const totalPercentage = splits.reduce((sum, split) => sum + split.percentage, 0);
  const isValidTotal = totalPercentage === 100;

  const autoDistribute = () => {
    const evenSplit = Math.floor(100 / splits.length);
    const remainder = 100 - (evenSplit * splits.length);

    const updatedSplits = splits.map((split, index) => ({
      ...split,
      percentage: index === 0 ? evenSplit + remainder : evenSplit
    }));

    setSplits(updatedSplits);
    onSplitsChange(updatedSplits);
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'artist': return '🎤';
      case 'producer': return '🎛️';
      case 'songwriter': return '✍️';
      case 'featured': return '🌟';
      case 'mixer': return '🎚️';
      default: return '👤';
    }
  };

  const getPayoutIcon = (method: string) => {
    switch (method) {
      case 'paypal': return '💳';
      case 'bank': return '🏦';
      case 'crypto': return '₿';
      case 'check': return '📄';
      default: return '💰';
    }
  };

  const filteredSuggestions = collaboratorSuggestions.filter(collab =>
    collab.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    collab.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden max-w-6xl mx-auto">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-500 to-teal-600 p-6 text-white">
        <h2 className="text-2xl font-bold mb-2">Revenue Splits</h2>
        <p className="text-green-100">Track: {trackTitle}</p>

        {/* Total Percentage Indicator */}
        <div className="mt-4 flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <span className="text-sm">Total:</span>
            <span className={`text-xl font-bold ${isValidTotal ? 'text-white' : 'text-red-200'}`}>
              {totalPercentage}%
            </span>
            {isValidTotal ? (
              <span className="text-green-200">✅</span>
            ) : (
              <span className="text-red-200">⚠️</span>
            )}
          </div>

          <button
            onClick={autoDistribute}
            className="bg-white bg-opacity-20 hover:bg-opacity-30 text-white text-sm font-medium py-1 px-3 rounded-md transition-colors"
          >
            Auto Distribute
          </button>
        </div>
      </div>

      <div className="p-6">
        {/* Splits List */}
        <div className="space-y-4 mb-6">
          {splits.map((split, index) => (
            <div key={split.id} className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <div className="grid grid-cols-1 lg:grid-cols-6 gap-4 items-start">
                {/* Collaborator Info */}
                <div className="lg:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Collaborator
                  </label>
                  <div className="space-y-2">
                    <input
                      type="text"
                      placeholder="Name"
                      value={split.collaborator}
                      onChange={(e) => updateSplit(split.id, 'collaborator', e.target.value)}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    />
                    <input
                      type="email"
                      placeholder="Email"
                      value={split.email}
                      onChange={(e) => updateSplit(split.id, 'email', e.target.value)}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    />
                  </div>
                </div>

                {/* Role */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Role
                  </label>
                  <select
                    value={split.role}
                    onChange={(e) => updateSplit(split.id, 'role', e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  >
                    <option value="artist">🎤 Artist</option>
                    <option value="producer">🎛️ Producer</option>
                    <option value="songwriter">✍️ Songwriter</option>
                    <option value="featured">🌟 Featured</option>
                    <option value="mixer">🎚️ Mixer</option>
                    <option value="other">👤 Other</option>
                  </select>
                </div>

                {/* Percentage */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Split %
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      min="0"
                      max="100"
                      step="0.1"
                      value={split.percentage}
                      onChange={(e) => updateSplit(split.id, 'percentage', parseFloat(e.target.value) || 0)}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    />
                    <span className="absolute right-3 top-2 text-gray-500">%</span>
                  </div>
                </div>

                {/* Payout Method */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Payout
                  </label>
                  <select
                    value={split.payoutMethod}
                    onChange={(e) => updateSplit(split.id, 'payoutMethod', e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  >
                    <option value="paypal">💳 PayPal</option>
                    <option value="bank">🏦 Bank Transfer</option>
                    <option value="crypto">₿ Crypto</option>
                    <option value="check">📄 Check</option>
                  </select>
                </div>

                {/* Actions */}
                <div className="flex items-end justify-center space-x-2">
                  <div className="text-center">
                    <div className="text-2xl mb-1">{getRoleIcon(split.role)}</div>
                    {splits.length > 1 && (
                      <button
                        onClick={() => removeSplit(split.id)}
                        className="text-red-600 hover:text-red-700 transition-colors p-1"
                      >
                        🗑️
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Payout Details */}
              {split.payoutMethod !== 'check' && (
                <div className="mt-3">
                  <input
                    type="text"
                    placeholder={`${split.payoutMethod === 'paypal' ? 'PayPal email' :
                                split.payoutMethod === 'bank' ? 'Bank account details' :
                                'Crypto wallet address'}`}
                    value={split.payoutDetails || ''}
                    onChange={(e) => updateSplit(split.id, 'payoutDetails', e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  />
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Add Collaborator */}
        <div className="border-t border-gray-200 pt-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Add Collaborator</h3>
            <button
              onClick={addSplit}
              className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center space-x-2"
            >
              <span>➕</span>
              <span>Add Split</span>
            </button>
          </div>

          {/* Quick Add from Suggestions */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Quick Add from Your Collaborators
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
              {collaboratorSuggestions.map((collab, index) => (
                <button
                  key={index}
                  onClick={() => {
                    const newSplit: Split = {
                      id: Date.now().toString(),
                      collaborator: collab.name,
                      email: collab.email,
                      role: collab.role as any,
                      percentage: 0,
                      payoutMethod: 'paypal',
                      payoutDetails: collab.email
                    };
                    const updatedSplits = [...splits, newSplit];
                    setSplits(updatedSplits);
                    onSplitsChange(updatedSplits);
                  }}
                  className="bg-white border border-gray-200 rounded-lg p-3 hover:border-green-300 hover:shadow-md transition-all text-left"
                >
                  <div className="flex items-center space-x-2 mb-1">
                    <span className="text-lg">{getRoleIcon(collab.role)}</span>
                    <span className="font-medium text-gray-900">{collab.name}</span>
                  </div>
                  <p className="text-sm text-gray-600">{collab.email}</p>
                  <p className="text-xs text-gray-500 capitalize">{collab.role}</p>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Summary */}
        <div className="border-t border-gray-200 pt-6 mt-6">
          <div className="bg-gradient-to-r from-green-50 to-teal-50 border border-green-200 rounded-lg p-4">
            <h4 className="font-semibold text-green-900 mb-3">Split Summary</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-green-700">Total Collaborators</p>
                <p className="text-xl font-bold text-green-900">{splits.length}</p>
              </div>
              <div>
                <p className="text-sm text-green-700">Total Percentage</p>
                <p className={`text-xl font-bold ${isValidTotal ? 'text-green-900' : 'text-red-600'}`}>
                  {totalPercentage}%
                </p>
              </div>
              <div>
                <p className="text-sm text-green-700">Status</p>
                <p className={`text-sm font-medium ${isValidTotal ? 'text-green-700' : 'text-red-600'}`}>
                  {isValidTotal ? '✅ Ready to save' : '⚠️ Percentages must total 100%'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end space-x-4 pt-6 border-t border-gray-200 mt-6">
          <button
            onClick={onCancel}
            className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-2 px-4 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onSave}
            disabled={!isValidTotal}
            className="bg-green-600 hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center space-x-2"
          >
            <span>💾</span>
            <span>Save Splits</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default SplitsEditor;
