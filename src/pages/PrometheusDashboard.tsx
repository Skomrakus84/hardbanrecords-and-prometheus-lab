import React, { useState } from 'react';
import { 
  BarChart3, 
  Users, 
  TrendingUp, 
  Mic, 
  MessageSquare, 
  Target,
  Home
} from 'lucide-react';
import AIContentGenerator from '../components/prometheus/AIContentGenerator';
import SmartAudienceAnalytics from '../components/prometheus/SmartAudienceAnalytics';
import PredictiveAnalytics from '../components/prometheus/PredictiveAnalytics';
import VoiceAIContentCreator from '../components/prometheus/VoiceAIContentCreator';
import CampaignChatbot from '../components/prometheus/CampaignChatbot';
import CompetitorAnalysis from '../components/prometheus/CompetitorAnalysis';

const PrometheusDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview');

  const tabs = [
    { id: 'overview', name: 'Overview', icon: Home },
    { id: 'content', name: 'Content Generator', icon: BarChart3 },
    { id: 'audience', name: 'Audience Analytics', icon: Users },
    { id: 'predictive', name: 'Predictive Analytics', icon: TrendingUp },
    { id: 'voice', name: 'Voice AI', icon: Mic },
    { id: 'chatbot', name: 'Campaign Chatbot', icon: MessageSquare },
    { id: 'competitor', name: 'Competitor Analysis', icon: Target },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <div className="p-6">
            <h1 className="text-3xl font-bold mb-6">Prometheus AI Marketing Dashboard</h1>
            <p className="text-lg text-gray-600 mb-8">
              Welcome to the future of music marketing. Our AI-powered platform helps you create, 
              analyze, and optimize your marketing campaigns with cutting-edge artificial intelligence.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-lg shadow-md">
                <BarChart3 className="w-8 h-8 text-blue-500 mb-4" />
                <h3 className="text-xl font-semibold mb-2">AI Content Generation</h3>
                <p>Create engaging marketing content automatically</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-md">
                <Users className="w-8 h-8 text-green-500 mb-4" />
                <h3 className="text-xl font-semibold mb-2">Smart Analytics</h3>
                <p>Deep audience insights and segmentation</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-md">
                <TrendingUp className="w-8 h-8 text-purple-500 mb-4" />
                <h3 className="text-xl font-semibold mb-2">Predictive Modeling</h3>
                <p>Forecast campaign performance and trends</p>
              </div>
            </div>
          </div>
        );
      case 'content':
        return <AIContentGenerator />;
      case 'audience':
        return <SmartAudienceAnalytics />;
      case 'predictive':
        return <PredictiveAnalytics />;
      case 'voice':
        return <VoiceAIContentCreator />;
      case 'chatbot':
        return <CampaignChatbot />;
      case 'competitor':
        return <CompetitorAnalysis />;
      default:
        return <div>Tab not found</div>;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <h1 className="text-2xl font-bold text-gray-900">Prometheus AI</h1>
            <div className="text-sm text-gray-500">Hardban Records Lab</div>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8 overflow-x-auto">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center px-1 py-4 border-b-2 font-medium text-sm whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="w-5 h-5 mr-2" />
                  {tab.name}
                </button>
              );
            })}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {renderContent()}
      </main>
    </div>
  );
};

export default PrometheusDashboard;
