import React, { useState } from 'react';
import {
  BarChart3,
  Users,
  TrendingUp,
  Mic,
  MessageSquare,
  Target,
  Home,
  Sparkles,
  Brain,
  Zap,
  Rocket,
  Star
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
    { id: 'overview', name: 'AI Overview', icon: Home },
    { id: 'content', name: 'Content Generator', icon: BarChart3 },
    { id: 'audience', name: 'Smart Analytics', icon: Users },
    { id: 'predictive', name: 'Predictive AI', icon: TrendingUp },
    { id: 'voice', name: 'Voice AI', icon: Mic },
    { id: 'chatbot', name: 'AI Chatbot', icon: MessageSquare },
    { id: 'competitor', name: 'Competitor AI', icon: Target },
  ];

  const containerStyle = {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #0f0f23 0%, #1a1a2e 50%, #16213e 100%)',
    backgroundImage: 'url("https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1600&h=900&fit=crop")',
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundAttachment: 'fixed',
    padding: '40px',
    position: 'relative' as const
  };

  const overlayStyle = {
    position: 'absolute' as const,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'linear-gradient(135deg, rgba(138, 43, 226, 0.85) 0%, rgba(30, 144, 255, 0.85) 50%, rgba(0, 191, 255, 0.85) 100%)',
    zIndex: 1
  };

  const contentStyle = {
    position: 'relative' as const,
    zIndex: 2,
    maxWidth: '1400px',
    margin: '0 auto'
  };

  const headerStyle = {
    textAlign: 'center' as const,
    marginBottom: '50px'
  };

  const navStyle = {
    background: 'linear-gradient(45deg, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0.3) 100%)',
    backdropFilter: 'blur(20px)',
    borderRadius: '20px',
    padding: '20px',
    marginBottom: '40px',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    boxShadow: '0 20px 40px rgba(0, 0, 0, 0.3)'
  };

  const tabButtonStyle = (isActive: boolean) => ({
    display: 'flex',
    alignItems: 'center',
    padding: '16px 24px',
    borderRadius: '16px',
    fontSize: '16px',
    fontWeight: '600',
    transition: 'all 0.3s ease',
    border: 'none',
    cursor: 'pointer',
    background: isActive
      ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
      : 'rgba(255, 255, 255, 0.1)',
    color: isActive ? '#ffffff' : '#e0e7ff',
    boxShadow: isActive
      ? '0 10px 30px rgba(102, 126, 234, 0.4)'
      : '0 4px 15px rgba(0, 0, 0, 0.2)',
    transform: isActive ? 'translateY(-2px)' : 'translateY(0)'
  });

  const mainContentStyle = {
    background: 'linear-gradient(45deg, rgba(0,0,0,0.4) 0%, rgba(0,0,0,0.2) 100%)',
    backdropFilter: 'blur(20px)',
    borderRadius: '24px',
    padding: '40px',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    boxShadow: '0 25px 50px rgba(0, 0, 0, 0.3)',
    minHeight: '600px'
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <div style={{ padding: '20px' }}>
            <div style={{ textAlign: 'center', marginBottom: '50px' }}>
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '16px',
                background: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)',
                padding: '20px 40px',
                borderRadius: '20px',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                marginBottom: '30px'
              }}>
                <Brain size={48} color="#00ffff" />
                <div>
                  <h2 style={{
                    fontSize: '2.5rem',
                    fontWeight: '800',
                    margin: '0 0 8px 0',
                    background: 'linear-gradient(135deg, #ffffff 0%, #e0e7ff 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent'
                  }}>
                    Welcome to Prometheus AI
                  </h2>
                  <p style={{
                    fontSize: '1.2rem',
                    margin: 0,
                    color: '#b8c5ff',
                    fontWeight: '300'
                  }}>
                    Next-Generation Marketing Intelligence Platform
                  </p>
                </div>
              </div>
            </div>

            <p style={{
              fontSize: '1.3rem',
              color: '#e0e7ff',
              textAlign: 'center',
              marginBottom: '50px',
              lineHeight: '1.6',
              opacity: 0.9
            }}>
              Experience the future of music marketing with our cutting-edge AI-powered platform.
              Create, analyze, and optimize your campaigns with unprecedented intelligence and automation.
            </p>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
              gap: '30px',
              marginTop: '40px'
            }}>
              {[
                {
                  icon: Sparkles,
                  title: 'AI Content Generation',
                  desc: 'Create engaging marketing content automatically with advanced AI algorithms',
                  color: '#ff6b6b',
                  gradient: 'linear-gradient(135deg, #ff6b6b 0%, #ffa500 100%)'
                },
                {
                  icon: Users,
                  title: 'Smart Audience Analytics',
                  desc: 'Deep audience insights and segmentation powered by machine learning',
                  color: '#4ecdc4',
                  gradient: 'linear-gradient(135deg, #4ecdc4 0%, #44a08d 100%)'
                },
                {
                  icon: TrendingUp,
                  title: 'Predictive Modeling',
                  desc: 'Forecast campaign performance and trends with AI precision',
                  color: '#45b7d1',
                  gradient: 'linear-gradient(135deg, #45b7d1 0%, #96ceb4 100%)'
                },
                {
                  icon: Zap,
                  title: 'Voice AI Technology',
                  desc: 'Generate compelling voice content and audio marketing materials',
                  color: '#f7dc6f',
                  gradient: 'linear-gradient(135deg, #f7dc6f 0%, #f39c12 100%)'
                },
                {
                  icon: Rocket,
                  title: 'Automated Campaigns',
                  desc: 'AI-driven chatbot systems for interactive marketing campaigns',
                  color: '#bb8fce',
                  gradient: 'linear-gradient(135deg, #bb8fce 0%, #8e44ad 100%)'
                },
                {
                  icon: Target,
                  title: 'Competitor Intelligence',
                  desc: 'Advanced competitor analysis and strategic insights',
                  color: '#85c1e9',
                  gradient: 'linear-gradient(135deg, #85c1e9 0%, #3498db 100%)'
                }
              ].map((feature, index) => (
                <div
                  key={index}
                  style={{
                    background: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)',
                    borderRadius: '20px',
                    padding: '30px',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    transition: 'all 0.3s ease',
                    cursor: 'pointer',
                    backdropFilter: 'blur(10px)'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-10px) scale(1.02)';
                    e.currentTarget.style.boxShadow = '0 20px 40px rgba(0, 0, 0, 0.3)';
                    e.currentTarget.style.border = '1px solid rgba(255, 255, 255, 0.2)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0) scale(1)';
                    e.currentTarget.style.boxShadow = '0 10px 30px rgba(0, 0, 0, 0.2)';
                    e.currentTarget.style.border = '1px solid rgba(255, 255, 255, 0.1)';
                  }}
                >
                  <div style={{
                    background: feature.gradient,
                    borderRadius: '16px',
                    width: '60px',
                    height: '60px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '20px',
                    boxShadow: '0 8px 20px rgba(0, 0, 0, 0.2)'
                  }}>
                    <feature.icon size={28} color="#ffffff" />
                  </div>
                  <h3 style={{
                    fontSize: '1.4rem',
                    fontWeight: '700',
                    margin: '0 0 12px 0',
                    color: '#ffffff'
                  }}>
                    {feature.title}
                  </h3>
                  <p style={{
                    fontSize: '1rem',
                    margin: 0,
                    color: '#b8c5ff',
                    lineHeight: '1.5'
                  }}>
                    {feature.desc}
                  </p>
                </div>
              ))}
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
    <div style={containerStyle}>
      <div style={overlayStyle}></div>

      <div style={contentStyle}>
        {/* Header */}
        <div style={headerStyle}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '16px',
            background: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)',
            padding: '20px 40px',
            borderRadius: '20px',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            marginBottom: '20px'
          }}>
            <Star size={40} color="#ffd700" />
            <div>
              <h1 style={{
                fontSize: '3rem',
                fontWeight: '800',
                margin: '0 0 8px 0',
                background: 'linear-gradient(135deg, #ffffff 0%, #f0f9ff 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                textShadow: '0 4px 20px rgba(255, 255, 255, 0.3)'
              }}>
                Prometheus AI
              </h1>
              <p style={{
                fontSize: '1.2rem',
                margin: 0,
                color: '#b8c5ff',
                fontWeight: '300'
              }}>
                Hardban Records Lab • AI Marketing Intelligence
              </p>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div style={navStyle}>
          <div style={{
            display: 'flex',
            gap: '12px',
            flexWrap: 'wrap',
            justifyContent: 'center'
          }}>
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  style={tabButtonStyle(isActive)}
                  onMouseEnter={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)';
                      e.currentTarget.style.transform = 'translateY(-2px)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
                      e.currentTarget.style.transform = 'translateY(0)';
                    }
                  }}
                >
                  <Icon size={20} style={{ marginRight: '8px' }} />
                  {tab.name}
                </button>
              );
            })}
          </div>
        </div>

        {/* Main Content */}
        <div style={mainContentStyle}>
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default PrometheusDashboard;
