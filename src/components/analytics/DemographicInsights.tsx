import React from 'react';
import { DemographicData } from '../../types/analytics';

interface DemographicInsightsProps {
  data: DemographicData[];
  loading: boolean;
}

export const DemographicInsights: React.FC<DemographicInsightsProps> = ({ data, loading }) => {
  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M`;
    }
    if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}K`;
    }
    return num.toLocaleString();
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Demographic Insights</h3>
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="flex items-center justify-between mb-2">
                <div className="h-4 bg-gray-200 rounded w-16"></div>
                <div className="h-4 bg-gray-200 rounded w-12"></div>
              </div>
              <div className="h-2 bg-gray-200 rounded-full mb-4"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  const getAgeGroupColor = (index: number) => {
    const colors = [
      'from-purple-500 to-purple-600',
      'from-blue-500 to-blue-600',
      'from-green-500 to-green-600',
      'from-orange-500 to-orange-600',
      'from-red-500 to-red-600'
    ];
    return colors[index] || 'from-gray-500 to-gray-600';
  };

  const getAgeGroupIcon = (ageGroup: string) => {
    const icons: Record<string, string> = {
      '18-24': '🎓',
      '25-34': '💼',
      '35-44': '🏠',
      '45-54': '📚',
      '55+': '🍷'
    };
    return icons[ageGroup] || '👤';
  };

  const totalStreams = data.reduce((sum, group) => sum + group.streams, 0);
  const dominantGender = data.reduce((prev, current) => {
    const prevTotal = prev.gender.male + prev.gender.female + prev.gender.other;
    const currentTotal = current.gender.male + current.gender.female + current.gender.other;
    return currentTotal > prevTotal ? current : prev;
  });

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Demographic Insights</h3>
        <span className="text-sm text-gray-500">Listener breakdown</span>
      </div>

      {/* Age Groups */}
      <div className="space-y-4 mb-6">
        <h4 className="font-medium text-gray-900 text-sm">Age Distribution</h4>
        {data.map((group, index) => (
          <div key={group.ageGroup} className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="text-lg">{getAgeGroupIcon(group.ageGroup)}</span>
                <span className="font-medium text-gray-900">{group.ageGroup}</span>
              </div>
              <span className="text-sm text-gray-500">
                {group.percentage}% • {formatNumber(group.streams)}
              </span>
            </div>

            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className={`h-3 rounded-full bg-gradient-to-r ${getAgeGroupColor(index)} transition-all duration-500`}
                style={{ width: `${group.percentage}%` }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Gender Breakdown */}
      <div className="pt-6 border-t border-gray-200">
        <h4 className="font-medium text-gray-900 text-sm mb-4">Gender Distribution</h4>

        {data.map((group, index) => (
          <div key={`gender-${group.ageGroup}`} className="mb-4 last:mb-0">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">{group.ageGroup} years</span>
              <span className="text-sm text-gray-500">{formatNumber(group.streams)}</span>
            </div>

            <div className="flex h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="bg-blue-500 transition-all duration-500"
                style={{ width: `${group.gender.male}%` }}
                title={`Male: ${group.gender.male}%`}
              />
              <div
                className="bg-pink-500 transition-all duration-500"
                style={{ width: `${group.gender.female}%` }}
                title={`Female: ${group.gender.female}%`}
              />
              <div
                className="bg-purple-500 transition-all duration-500"
                style={{ width: `${group.gender.other}%` }}
                title={`Other: ${group.gender.other}%`}
              />
            </div>
          </div>
        ))}

        {/* Gender Legend */}
        <div className="flex items-center justify-center space-x-6 mt-4 text-sm">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
            <span className="text-gray-600">Male</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-pink-500 rounded-full"></div>
            <span className="text-gray-600">Female</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
            <span className="text-gray-600">Other</span>
          </div>
        </div>
      </div>

      {/* Key Insights */}
      <div className="mt-6 pt-6 border-t border-gray-200">
        <h4 className="font-medium text-gray-900 text-sm mb-4">Key Insights</h4>

        <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-4">
          <div className="grid grid-cols-1 gap-3 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Primary Age Group:</span>
              <span className="font-medium text-gray-900">
                {data[0]?.ageGroup} ({data[0]?.percentage}%)
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Total Listeners:</span>
              <span className="font-medium text-gray-900">
                {formatNumber(totalStreams)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Gender Split:</span>
              <span className="font-medium text-gray-900">
                {dominantGender.gender.female > dominantGender.gender.male ? 'Female' : 'Male'} dominant
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
