import React from 'react';
import { Target, TrendingUp, TrendingDown, AlertTriangle, Users, Eye } from 'lucide-react';

interface Competitor {
  id: string;
  name: string;
  platform: string;
  followers: number;
  engagement: number;
  threatLevel: 'low' | 'medium' | 'high';
  growth: number;
  topContent: string[];
}

const CompetitorAnalysis: React.FC = () => {
  const competitors: Competitor[] = [
    {
      id: '1',
      name: 'ElectronicBeats',
      platform: 'Instagram',
      followers: 125000,
      engagement: 8.2,
      threatLevel: 'high',
      growth: 12.5,
      topContent: ['Live session videos', 'Artist collaborations', 'Behind-the-scenes content']
    },
    {
      id: '2',
      name: 'Synthwave Records',
      platform: 'Instagram',
      followers: 89000,
      engagement: 6.8,
      threatLevel: 'medium',
      growth: 8.3,
      topContent: ['Remix releases', 'Tutorial content', 'Community spotlights']
    },
    {
      id: '3',
      name: 'Ambient Sounds Co',
      platform: 'Instagram',
      followers: 67000,
      engagement: 9.1,
      threatLevel: 'high',
      growth: -2.1,
      topContent: ['Ambient mixes', 'Nature soundscapes', 'Meditation content']
    },
    {
      id: '4',
      name: 'Future Bass Lab',
      platform: 'Instagram',
      followers: 45000,
      engagement: 7.5,
      threatLevel: 'medium',
      growth: 15.7,
      topContent: ['Bass music tutorials', 'Production tips', 'New artist features']
    }
  ];

  const getThreatColor = (level: string) => {
    switch (level) {
      case 'high': return 'text-red-600 bg-red-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'low': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getGrowthIcon = (growth: number) => {
    return growth > 0 ? 
      <TrendingUp className="w-4 h-4 text-green-500" /> : 
      <TrendingDown className="w-4 h-4 text-red-500" />;
  };

  const totalCompetitors = competitors.length;
  const highThreatCompetitors = competitors.filter(c => c.threatLevel === 'high').length;
  const avgEngagement = competitors.reduce((sum, c) => sum + c.engagement, 0) / competitors.length;

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-2 flex items-center">
          <Target className="w-6 h-6 mr-2 text-orange-500" />
          Competitor Analysis
        </h2>
        <p className="text-gray-600">
          Real-time monitoring and analysis of competitors in the electronic music space.
        </p>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center">
            <Target className="w-8 h-8 text-orange-500 mr-3" />
            <div>
              <p className="text-sm text-gray-600">Monitored Competitors</p>
              <p className="text-2xl font-bold">{totalCompetitors}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center">
            <AlertTriangle className="w-8 h-8 text-red-500 mr-3" />
            <div>
              <p className="text-sm text-gray-600">High Threat</p>
              <p className="text-2xl font-bold">{highThreatCompetitors}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center">
            <TrendingUp className="w-8 h-8 text-blue-500 mr-3" />
            <div>
              <p className="text-sm text-gray-600">Avg. Engagement</p>
              <p className="text-2xl font-bold">{avgEngagement.toFixed(1)}%</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center">
            <Eye className="w-8 h-8 text-purple-500 mr-3" />
            <div>
              <p className="text-sm text-gray-600">Market Share</p>
              <p className="text-2xl font-bold">23.4%</p>
            </div>
          </div>
        </div>
      </div>

      {/* Competitor Cards */}
      <div className="space-y-6">
        <h3 className="text-xl font-semibold">Competitor Profiles</h3>
        {competitors.map((competitor) => (
          <div key={competitor.id} className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-lg mr-4">
                  {competitor.name.charAt(0)}
                </div>
                <div>
                  <h4 className="text-lg font-medium">{competitor.name}</h4>
                  <p className="text-sm text-gray-600">{competitor.platform}</p>
                </div>
              </div>
              <div className={`px-3 py-1 rounded-full text-sm font-medium ${getThreatColor(competitor.threatLevel)}`}>
                {competitor.threatLevel.toUpperCase()} THREAT
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
              <div className="text-center">
                <div className="flex items-center justify-center mb-2">
                  <Users className="w-5 h-5 text-blue-500 mr-2" />
                  <span className="text-sm text-gray-600">Followers</span>
                </div>
                <p className="text-xl font-bold">{competitor.followers.toLocaleString()}</p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center mb-2">
                  <TrendingUp className="w-5 h-5 text-green-500 mr-2" />
                  <span className="text-sm text-gray-600">Engagement</span>
                </div>
                <p className="text-xl font-bold">{competitor.engagement}%</p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center mb-2">
                  {getGrowthIcon(competitor.growth)}
                  <span className="text-sm text-gray-600 ml-2">Growth</span>
                </div>
                <p className={`text-xl font-bold ${competitor.growth > 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {competitor.growth > 0 ? '+' : ''}{competitor.growth}%
                </p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center mb-2">
                  <Target className="w-5 h-5 text-orange-500 mr-2" />
                  <span className="text-sm text-gray-600">Market Position</span>
                </div>
                <p className="text-xl font-bold">#{(competitors.indexOf(competitor) + 1)}</p>
              </div>
            </div>

            <div>
              <h5 className="font-medium mb-3 text-gray-700">Top Performing Content</h5>
              <div className="flex flex-wrap gap-2">
                {competitor.topContent.map((content, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                  >
                    {content}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Strategic Insights */}
      <div className="mt-8 bg-gradient-to-r from-orange-50 to-red-50 rounded-lg p-6">
        <h3 className="text-xl font-semibold mb-4 flex items-center">
          <AlertTriangle className="w-6 h-6 mr-2 text-orange-500" />
          Strategic Insights & Recommendations
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-4 rounded-lg">
            <h4 className="font-medium mb-2 text-red-600">Immediate Actions</h4>
            <ul className="space-y-2 text-sm">
              <li>• Focus on live session content (high engagement)</li>
              <li>• Increase tutorial/remix content frequency</li>
              <li>• Target micro-influencer collaborations</li>
            </ul>
          </div>
          <div className="bg-white p-4 rounded-lg">
            <h4 className="font-medium mb-2 text-blue-600">Long-term Strategy</h4>
            <ul className="space-y-2 text-sm">
              <li>• Differentiate with unique Hardban sound</li>
              <li>• Build community around production techniques</li>
              <li>• Expand to emerging platforms (TikTok, Discord)</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompetitorAnalysis;
