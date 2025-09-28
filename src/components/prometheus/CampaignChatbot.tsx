import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, Send, Bot, User } from 'lucide-react';

interface ChatMessage {
  id: string;
  sender: 'user' | 'bot';
  message: string;
  timestamp: Date;
}

const CampaignChatbot: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      sender: 'bot',
      message: 'Hello! I\'m your AI Marketing Assistant. I can help you with campaign strategies, content ideas, audience insights, and marketing optimization. What would you like to know?',
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const generateBotResponse = (userMessage: string): string => {
    const message = userMessage.toLowerCase();

    if (message.includes('campaign') || message.includes('marketing')) {
      return 'For effective music marketing campaigns, I recommend focusing on cross-platform promotion. Start with teaser content on Instagram and TikTok, then release the full track on Spotify with coordinated social media posts. Would you like me to create a detailed campaign timeline?';
    }

    if (message.includes('audience') || message.includes('fans')) {
      return 'Based on current analytics, your primary audience consists of electronic music enthusiasts aged 18-34. They engage most with visual content and respond well to behind-the-scenes material. I can provide detailed demographic breakdowns and engagement patterns.';
    }

    if (message.includes('content') || message.includes('post')) {
      return 'Great content ideas for your next release: 1) Behind-the-scenes production video, 2) Lyric snippets with custom artwork, 3) Fan interaction Q&A, 4) Remix teaser series. Which format interests you most?';
    }

    if (message.includes('analytics') || message.includes('performance')) {
      return 'Your latest campaign shows 23% engagement growth. Top-performing content: short-form videos (45% engagement), followed by album artwork posts (32%). I recommend increasing video content by 30% for better results.';
    }

    return 'I understand you\'re asking about marketing strategies. Could you provide more details about what specific aspect you\'d like help with? I can assist with campaign planning, content creation, audience analysis, or performance optimization.';
  };

  const sendMessage = () => {
    if (!inputMessage.trim()) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      sender: 'user',
      message: inputMessage,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsTyping(true);

    // Simulate bot response delay
    setTimeout(() => {
      const botResponse: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'bot',
        message: generateBotResponse(inputMessage),
        timestamp: new Date()
      };

      setMessages(prev => [...prev, botResponse]);
      setIsTyping(false);
    }, 1500);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-2 flex items-center">
          <MessageSquare className="w-6 h-6 mr-2 text-blue-500" />
          Campaign Chatbot
        </h2>
        <p className="text-gray-600">
          Get instant AI-powered assistance with your marketing campaigns, content strategies, and audience insights.
        </p>
      </div>

      {/* Chat Container */}
      <div className="bg-white rounded-lg shadow-lg h-[600px] flex flex-col">
        {/* Chat Header */}
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-4 rounded-t-lg">
          <div className="flex items-center">
            <Bot className="w-6 h-6 mr-3" />
            <div>
              <h3 className="font-semibold">Prometheus AI Assistant</h3>
              <p className="text-sm opacity-90">Marketing Campaign Expert</p>
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[70%] p-3 rounded-lg ${
                  msg.sender === 'user'
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 text-gray-800'
                }`}
              >
                <div className="flex items-center mb-1">
                  {msg.sender === 'bot' ? (
                    <Bot className="w-4 h-4 mr-2" />
                  ) : (
                    <User className="w-4 h-4 mr-2" />
                  )}
                  <span className="text-xs opacity-70">
                    {msg.timestamp.toLocaleTimeString()}
                  </span>
                </div>
                <p className="text-sm">{msg.message}</p>
              </div>
            </div>
          ))}

          {isTyping && (
            <div className="flex justify-start">
              <div className="bg-gray-100 text-gray-800 p-3 rounded-lg max-w-[70%]">
                <div className="flex items-center">
                  <Bot className="w-4 h-4 mr-2" />
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="border-t p-4">
          <div className="flex space-x-3">
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask me about marketing strategies, content ideas, or campaign optimization..."
              className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={isTyping}
            />
            <button
              onClick={sendMessage}
              disabled={!inputMessage.trim() || isTyping}
              className="bg-blue-500 text-white p-3 rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Quick Suggestions */}
      <div className="mt-6">
        <h3 className="text-lg font-semibold mb-3">Quick Questions</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {[
            'How to improve campaign engagement?',
            'Best times to post music content',
            'Content ideas for new release',
            'Audience analysis insights'
          ].map((suggestion, index) => (
            <button
              key={index}
              onClick={() => setInputMessage(suggestion)}
              className="text-left p-3 bg-gray-50 hover:bg-gray-100 rounded-lg border transition-colors"
            >
              {suggestion}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CampaignChatbot;
