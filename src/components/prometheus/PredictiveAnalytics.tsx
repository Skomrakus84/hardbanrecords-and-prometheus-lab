import React from 'react';
import { TrendingUp, Target, BarChart3, AlertTriangle } from 'lucide-react';

interface PredictionData {
  campaignId: string;
  predictedReach: number;
  predictedEngagement: number;
  confidence: number;
  trends: string[];
}

const PredictiveAnalytics: React.FC = () => {
  const predictions: PredictionData[] = [
    {
      campaignId: 'summer_release_2024',
      predictedReach: 125000,
      predictedEngagement: 15600,
      confidence: 87,
      trends: ['Growing electronic music interest', 'Social media algorithm favoring music content', 'Target demographic highly active']
    },
    {
      campaignId: 'remix_collaboration',
      predictedReach: 89000,
      predictedEngagement: 12400,
      confidence: 92,
      trends: ['Cross-promotion opportunities', 'Collaborative content performs 40% better', 'Target audience overlap detected']
    },
    {
      campaignId: 'festival_announcement',
      predictedReach: 156000,
      predictedEngagement: 18900,
      confidence: 78,
      trends: ['Seasonal event timing optimal', 'Live music content engagement high', 'Geographic targeting effective']
    }
  ];

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 85) return 'text-green-600 bg-green-100';
    if (confidence >= 70) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-2 flex items-center">
          <TrendingUp className="w-6 h-6 mr-2 text-green-500" />
          Predictive Analytics
        </h2>
        <p className="text-gray-600">
          AI-powered predictions for campaign performance and optimization recommendations.
        </p>
      </div>

      {/* Campaign Predictions */}
      <div className="space-y-6">
        <h3 className="text-xl font-semibold">Campaign Performance Predictions</h3>
        {predictions.map((prediction) => (
          <div key={prediction.campaignId} className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-6">
              <h4 className="text-lg font-medium capitalize">
                {prediction.campaignId.replace(/_/g, ' ')}
              </h4>
              <div className={`px-3 py-1 rounded-full text-sm font-medium ${getConfidenceColor(prediction.confidence)}`}>
                {prediction.confidence}% Confidence
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <div className="text-center">
                <div className="flex items-center justify-center mb-2">
                  <Target className="w-6 h-6 text-blue-500 mr-2" />
                  <span className="text-sm text-gray-600">Predicted Reach</span>
                </div>
                <p className="text-2xl font-bold text-blue-600">
                  {prediction.predictedReach.toLocaleString()}
                </p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center mb-2">
                  <BarChart3 className="w-6 h-6 text-green-500 mr-2" />
                  <span className="text-sm text-gray-600">Predicted Engagement</span>
                </div>
                <p className="text-2xl font-bold text-green-600">
                  {prediction.predictedEngagement.toLocaleString()}
                </p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center mb-2">
                  <TrendingUp className="w-6 h-6 text-purple-500 mr-2" />
                  <span className="text-sm text-gray-600">Engagement Rate</span>
                </div>
                <p className="text-2xl font-bold text-purple-600">
                  {((prediction.predictedEngagement / prediction.predictedReach) * 100).toFixed(1)}%
                </p>
              </div>
            </div>

            <div>
              <h5 className="font-medium mb-3 text-gray-700 flex items-center">
                <AlertTriangle className="w-4 h-4 mr-2 text-yellow-500" />
                Key Trends & Insights
              </h5>
              <ul className="space-y-2">
                {prediction.trends.map((trend, index) => (
                  <li key={index} className="flex items-start">
                    <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    <span className="text-sm text-gray-600">{trend}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </div>

      {/* Optimization Recommendations */}
      <div className="mt-8 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-6">
        <h3 className="text-xl font-semibold mb-4">AI Optimization Recommendations</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-4 rounded-lg">
            <h4 className="font-medium mb-2 text-green-600">High Impact Actions</h4>
            <ul className="space-y-2 text-sm">
              <li>• Schedule posts for peak audience activity (8-10 PM local time)</li>
              <li>• Use trending hashtags in first 3 posts</li>
              <li>• Collaborate with micro-influencers (5K-50K followers)</li>
            </ul>
          </div>
          <div className="bg-white p-4 rounded-lg">
            <h4 className="font-medium mb-2 text-yellow-600">Medium Priority</h4>
            <ul className="space-y-2 text-sm">
              <li>• A/B test different post formats (carousel vs single image)</li>
              <li>• Optimize video thumbnails for better click-through rates</li>
              <li>• Cross-promote on secondary platforms</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PredictiveAnalytics;
