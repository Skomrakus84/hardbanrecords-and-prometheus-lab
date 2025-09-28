import React from 'react';
import { Users, TrendingUp, Eye, Heart, MessageCircle, Share2 } from 'lucide-react';

interface AudienceSegment {
  id: string;
  name: string;
  size: number;
  demographics: {
    age: string;
    gender: string;
    location: string;
  };
  engagement: {
    likes: number;
    shares: number;
    comments: number;
  };
}

const SmartAudienceAnalytics: React.FC = () => {
  const audienceSegments: AudienceSegment[] = [
    {
      id: '1',
      name: 'Electronic Music Enthusiasts',
      size: 45230,
      demographics: {
        age: '18-34',
        gender: '65% Male, 35% Female',
        location: 'Europe & North America'
      },
      engagement: {
        likes: 8920,
        shares: 1240,
        comments: 567
      }
    },
    {
      id: '2',
      name: 'Indie Artists',
      size: 12890,
      demographics: {
        age: '25-45',
        gender: '45% Male, 55% Female',
        location: 'Global'
      },
      engagement: {
        likes: 3450,
        shares: 890,
        comments: 234
      }
    },
    {
      id: '3',
      name: 'Music Producers',
      size: 8940,
      demographics: {
        age: '22-40',
        gender: '78% Male, 22% Female',
        location: 'North America & Europe'
      },
      engagement: {
        likes: 5670,
        shares: 1230,
        comments: 456
      }
    }
  ];

  const totalAudience = audienceSegments.reduce((sum, segment) => sum + segment.size, 0);
  const totalEngagement = audienceSegments.reduce((sum, segment) => 
    sum + segment.engagement.likes + segment.engagement.shares + segment.engagement.comments, 0);

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-2 flex items-center">
          <Users className="w-6 h-6 mr-2 text-blue-500" />
          Smart Audience Analytics
        </h2>
        <p className="text-gray-600">
          Deep insights into your audience demographics, behavior, and engagement patterns.
        </p>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center">
            <Users className="w-8 h-8 text-blue-500 mr-3" />
            <div>
              <p className="text-sm text-gray-600">Total Audience</p>
              <p className="text-2xl font-bold">{totalAudience.toLocaleString()}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center">
            <TrendingUp className="w-8 h-8 text-green-500 mr-3" />
            <div>
              <p className="text-sm text-gray-600">Total Engagement</p>
              <p className="text-2xl font-bold">{totalEngagement.toLocaleString()}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center">
            <Eye className="w-8 h-8 text-purple-500 mr-3" />
            <div>
              <p className="text-sm text-gray-600">Avg. Engagement Rate</p>
              <p className="text-2xl font-bold">12.4%</p>
            </div>
          </div>
        </div>
      </div>

      {/* Audience Segments */}
      <div className="space-y-6">
        <h3 className="text-xl font-semibold">Audience Segments</h3>
        {audienceSegments.map((segment) => (
          <div key={segment.id} className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-lg font-medium">{segment.name}</h4>
              <span className="text-sm text-gray-500">{segment.size.toLocaleString()} followers</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Demographics */}
              <div>
                <h5 className="font-medium mb-3 text-gray-700">Demographics</h5>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Age:</span>
                    <span>{segment.demographics.age}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Gender:</span>
                    <span>{segment.demographics.gender}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Location:</span>
                    <span>{segment.demographics.location}</span>
                  </div>
                </div>
              </div>

              {/* Engagement */}
              <div>
                <h5 className="font-medium mb-3 text-gray-700">Engagement (Last 30 days)</h5>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Heart className="w-4 h-4 text-red-500 mr-2" />
                      <span className="text-sm text-gray-600">Likes</span>
                    </div>
                    <span className="font-medium">{segment.engagement.likes.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Share2 className="w-4 h-4 text-blue-500 mr-2" />
                      <span className="text-sm text-gray-600">Shares</span>
                    </div>
                    <span className="font-medium">{segment.engagement.shares.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <MessageCircle className="w-4 h-4 text-green-500 mr-2" />
                      <span className="text-sm text-gray-600">Comments</span>
                    </div>
                    <span className="font-medium">{segment.engagement.comments.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SmartAudienceAnalytics;
