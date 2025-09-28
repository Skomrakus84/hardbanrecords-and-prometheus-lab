import React from 'react';
import { AnalyticsOverview } from '../../types/analytics';

interface OverviewCardsProps {
  overview: AnalyticsOverview;
}

export const OverviewCards: React.FC<OverviewCardsProps> = ({ overview }) => {
  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M`;
    }
    if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}K`;
    }
    return num.toLocaleString();
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const cards = [
    {
      title: 'Total Streams',
      value: formatNumber(overview.totalStreams),
      change: '+12.5%',
      changeType: 'positive' as const,
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l6 6-6 6z" />
        </svg>
      ),
      color: 'blue'
    },
    {
      title: 'Total Revenue',
      value: formatCurrency(overview.totalRevenue),
      change: '+8.2%',
      changeType: 'positive' as const,
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
        </svg>
      ),
      color: 'green'
    },
    {
      title: 'Monthly Growth',
      value: `${overview.monthlyGrowth}%`,
      change: '+2.1%',
      changeType: 'positive' as const,
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
        </svg>
      ),
      color: 'purple'
    },
    {
      title: 'Active Releases',
      value: overview.activeReleases.toString(),
      change: '+2',
      changeType: 'positive' as const,
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
      ),
      color: 'orange'
    }
  ];

  const getColorClasses = (color: string) => {
    const colorMap = {
      blue: {
        bg: 'bg-blue-50',
        icon: 'text-blue-600',
        iconBg: 'bg-blue-100'
      },
      green: {
        bg: 'bg-green-50',
        icon: 'text-green-600',
        iconBg: 'bg-green-100'
      },
      purple: {
        bg: 'bg-purple-50',
        icon: 'text-purple-600',
        iconBg: 'bg-purple-100'
      },
      orange: {
        bg: 'bg-orange-50',
        icon: 'text-orange-600',
        iconBg: 'bg-orange-100'
      }
    };
    return colorMap[color as keyof typeof colorMap] || colorMap.blue;
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {cards.map((card, index) => {
        const colors = getColorClasses(card.color);

        return (
          <div
            key={index}
            className={`${colors.bg} rounded-xl p-6 border border-gray-200 hover:shadow-lg transition-shadow`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">{card.title}</p>
                <p className="text-2xl font-bold text-gray-900 mb-2">{card.value}</p>
                <div className="flex items-center">
                  <span className={`text-xs font-medium ${
                    card.changeType === 'positive' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {card.change}
                  </span>
                  <span className="text-xs text-gray-500 ml-1">vs last period</span>
                </div>
              </div>
              <div className={`${colors.iconBg} p-3 rounded-lg`}>
                <div className={colors.icon}>
                  {card.icon}
                </div>
              </div>
            </div>
          </div>
        );
      })}

      {/* Top Track Card */}
      <div className="sm:col-span-2 lg:col-span-4 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold mb-2">🏆 Top Performing Track</h3>
            <p className="text-2xl font-bold">{overview.topTrack.title}</p>
            <p className="text-purple-100">by {overview.topTrack.artist}</p>
            <p className="text-sm text-purple-100 mt-2">
              {formatNumber(overview.topTrack.streams)} streams this month
            </p>
          </div>
          <div className="text-right">
            <div className="bg-white bg-opacity-20 rounded-lg p-4">
              <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l6 6-6 6z" />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
