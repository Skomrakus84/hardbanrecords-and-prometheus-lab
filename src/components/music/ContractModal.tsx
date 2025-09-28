import React, { useState, useEffect } from 'react';
import { Contract } from '../../types/artist';

interface ContractModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (contract: Omit<Contract, 'id' | 'artistId'>) => void;
  contract?: Contract | null;
  artistName: string;
}

export const ContractModal: React.FC<ContractModalProps> = ({
  isOpen,
  onClose,
  onSave,
  contract,
  artistName
}) => {
  const [formData, setFormData] = useState({
    title: '',
    type: 'recording' as Contract['type'],
    startDate: '',
    endDate: '',
    revenueShare: 50,
    totalRevenue: 0,
    status: 'pending' as Contract['status'],
    terms: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (contract && contract.startDate && contract.endDate) {
      setFormData({
        title: contract.title,
        type: contract.type,
        startDate: contract.startDate?.split('T')[0] || '',
        endDate: contract.endDate?.split('T')[0] || '',
        revenueShare: contract.revenueShare,
        totalRevenue: contract.totalRevenue,
        status: contract.status,
        terms: contract.terms || ''
      });
    } else {
      setFormData({
        title: '',
        type: 'recording',
        startDate: '',
        endDate: '',
        revenueShare: 50,
        totalRevenue: 0,
        status: 'pending',
        terms: ''
      });
    }
    setErrors({});
  }, [contract, isOpen]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'revenueShare' || name === 'totalRevenue' ? Number(value) : value
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Contract title is required';
    }

    if (!formData.startDate) {
      newErrors.startDate = 'Start date is required';
    }

    if (!formData.endDate) {
      newErrors.endDate = 'End date is required';
    }

    if (formData.startDate && formData.endDate && new Date(formData.startDate) >= new Date(formData.endDate)) {
      newErrors.endDate = 'End date must be after start date';
    }

    if (formData.revenueShare < 0 || formData.revenueShare > 100) {
      newErrors.revenueShare = 'Revenue share must be between 0 and 100';
    }

    if (formData.totalRevenue < 0) {
      newErrors.totalRevenue = 'Total revenue cannot be negative';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      const contractData = {
        ...formData,
        startDate: new Date(formData.startDate).toISOString(),
        endDate: new Date(formData.endDate).toISOString()
      };

      await onSave(contractData);
      onClose();
    } catch (error) {
      console.error('Error saving contract:', error);
      setErrors({ submit: 'Failed to save contract. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const contractTypeOptions = [
    { value: 'recording', label: 'Recording Contract' },
    { value: 'publishing', label: 'Publishing Contract' },
    { value: 'distribution', label: 'Distribution Contract' },
    { value: 'management', label: 'Management Contract' },
    { value: 'licensing', label: 'Licensing Contract' }
  ];

  const statusOptions = [
    { value: 'pending', label: 'Pending' },
    { value: 'active', label: 'Active' },
    { value: 'expired', label: 'Expired' },
    { value: 'terminated', label: 'Terminated' }
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">
              {contract ? 'Edit Contract' : 'New Contract'} - {artistName}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
              disabled={isSubmitting}
            >
              ✕
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {errors.submit && (
            <div className="bg-red-50 border border-red-200 rounded-md p-4">
              <div className="text-red-700 text-sm">{errors.submit}</div>
            </div>
          )}

          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Contract Title *
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                className={`block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-1 ${
                  errors.title
                    ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                    : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
                }`}
                placeholder="e.g., Recording Contract 2024"
                disabled={isSubmitting}
              />
              {errors.title && (
                <p className="mt-1 text-sm text-red-600">{errors.title}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Contract Type *
              </label>
              <select
                name="type"
                value={formData.type}
                onChange={handleChange}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:border-blue-500 focus:ring-blue-500"
                disabled={isSubmitting}
              >
                {contractTypeOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status *
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:border-blue-500 focus:ring-blue-500"
                disabled={isSubmitting}
              >
                {statusOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Start Date *
              </label>
              <input
                type="date"
                name="startDate"
                value={formData.startDate}
                onChange={handleChange}
                className={`block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-1 ${
                  errors.startDate
                    ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                    : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
                }`}
                disabled={isSubmitting}
              />
              {errors.startDate && (
                <p className="mt-1 text-sm text-red-600">{errors.startDate}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                End Date *
              </label>
              <input
                type="date"
                name="endDate"
                value={formData.endDate}
                onChange={handleChange}
                className={`block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-1 ${
                  errors.endDate
                    ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                    : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
                }`}
                disabled={isSubmitting}
              />
              {errors.endDate && (
                <p className="mt-1 text-sm text-red-600">{errors.endDate}</p>
              )}
            </div>
          </div>

          {/* Financial Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Revenue Share (%) *
              </label>
              <div className="relative">
                <input
                  type="number"
                  name="revenueShare"
                  value={formData.revenueShare}
                  onChange={handleChange}
                  min="0"
                  max="100"
                  step="0.1"
                  className={`block w-full px-3 py-2 pr-8 border rounded-md shadow-sm focus:outline-none focus:ring-1 ${
                    errors.revenueShare
                      ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                      : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
                  }`}
                  disabled={isSubmitting}
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <span className="text-gray-500 text-sm">%</span>
                </div>
              </div>
              {errors.revenueShare && (
                <p className="mt-1 text-sm text-red-600">{errors.revenueShare}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Total Revenue (PLN)
              </label>
              <input
                type="number"
                name="totalRevenue"
                value={formData.totalRevenue}
                onChange={handleChange}
                min="0"
                step="0.01"
                className={`block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-1 ${
                  errors.totalRevenue
                    ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                    : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
                }`}
                disabled={isSubmitting}
                placeholder="0.00"
              />
              {errors.totalRevenue && (
                <p className="mt-1 text-sm text-red-600">{errors.totalRevenue}</p>
              )}
            </div>
          </div>

          {/* Terms */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Contract Terms & Notes
            </label>
            <textarea
              name="terms"
              value={formData.terms}
              onChange={handleChange}
              rows={4}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:border-blue-500 focus:ring-blue-500"
              placeholder="Enter contract terms, special conditions, or notes..."
              disabled={isSubmitting}
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Saving...' : contract ? 'Update Contract' : 'Create Contract'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
