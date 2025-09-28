import React, { useState } from 'react';

interface Platform {
  id: string;
  name: string;
  icon: string;
  connected: boolean;
  syncStatus: 'idle' | 'syncing' | 'success' | 'error';
  lastSync?: string;
  profileUrl?: string;
  followerCount?: number;
  verificationStatus: 'none' | 'pending' | 'verified';
}

interface ArtistProfile {
  name: string;
  bio: string;
  avatar?: File | string;
  coverImage?: File | string;
  genres: string[];
  socialLinks: {
    website?: string;
    instagram?: string;
    twitter?: string;
    facebook?: string;
    youtube?: string;
    tiktok?: string;
  };
  location?: string;
  labels: string[];
}

interface ProfileSyncWizardProps {
  platforms: Platform[];
  profile: ArtistProfile;
  onUpdateProfile: (profile: ArtistProfile) => void;
  onConnectPlatform: (platformId: string) => void;
  onDisconnectPlatform: (platformId: string) => void;
  onSyncProfile: (platformIds: string[]) => void;
  onClose: () => void;
}

const ProfileSyncWizard: React.FC<ProfileSyncWizardProps> = ({
  platforms,
  profile,
  onUpdateProfile,
  onConnectPlatform,
  onDisconnectPlatform,
  onSyncProfile,
  onClose
}) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([]);
  const [profileData, setProfileData] = useState<ArtistProfile>(profile);
  const [isProcessing, setIsProcessing] = useState(false);

  const steps = [
    { id: 1, title: 'Connect Platforms', description: 'Link your streaming service accounts' },
    { id: 2, title: 'Profile Information', description: 'Set up your artist profile' },
    { id: 3, title: 'Sync Settings', description: 'Choose what to synchronize' },
    { id: 4, title: 'Review & Sync', description: 'Review and start synchronization' }
  ];

  const getSyncStatusIcon = (status: string) => {
    switch (status) {
      case 'syncing': return '🔄';
      case 'success': return '✅';
      case 'error': return '❌';
      default: return '⏸️';
    }
  };

  const getVerificationIcon = (status: string) => {
    switch (status) {
      case 'verified': return '✅';
      case 'pending': return '⏳';
      default: return '❓';
    }
  };

  const formatFollowerCount = (count?: number) => {
    if (!count) return 'N/A';
    if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
    if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
    return count.toString();
  };

  const handleProfileUpdate = (field: keyof ArtistProfile, value: any) => {
    setProfileData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSocialLinkUpdate = (platform: string, value: string) => {
    setProfileData(prev => ({
      ...prev,
      socialLinks: {
        ...prev.socialLinks,
        [platform]: value
      }
    }));
  };

  const handleSync = async () => {
    setIsProcessing(true);
    try {
      await onSyncProfile(selectedPlatforms);
      await onUpdateProfile(profileData);
      // Success handling would go here
    } catch (error) {
      console.error('Sync failed:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Connect Your Platforms</h3>
              <p className="text-gray-600">
                Connect your streaming service accounts to sync your artist profile across all platforms.
              </p>
            </div>

            <div className="grid gap-4">
              {platforms.map((platform) => (
                <div
                  key={platform.id}
                  className={`p-4 border-2 rounded-lg transition-all ${
                    platform.connected
                      ? 'border-green-200 bg-green-50'
                      : 'border-gray-200 bg-white hover:border-blue-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="text-3xl">{platform.icon}</div>
                      <div>
                        <h4 className="font-medium text-gray-900">{platform.name}</h4>
                        {platform.connected && (
                          <div className="flex items-center space-x-2 text-sm text-gray-600">
                            <span>{getSyncStatusIcon(platform.syncStatus)}</span>
                            <span>
                              {platform.followerCount && `${formatFollowerCount(platform.followerCount)} followers`}
                            </span>
                            <span>{getVerificationIcon(platform.verificationStatus)}</span>
                          </div>
                        )}
                        {platform.lastSync && (
                          <div className="text-xs text-gray-500">
                            Last sync: {new Date(platform.lastSync).toLocaleDateString()}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      {platform.connected ? (
                        <>
                          <button
                            onClick={() => onDisconnectPlatform(platform.id)}
                            className="bg-red-100 hover:bg-red-200 text-red-700 text-sm font-medium py-2 px-3 rounded-md transition-colors"
                          >
                            Disconnect
                          </button>
                          {platform.profileUrl && (
                            <a
                              href={platform.profileUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="bg-blue-100 hover:bg-blue-200 text-blue-700 text-sm font-medium py-2 px-3 rounded-md transition-colors"
                            >
                              View Profile
                            </a>
                          )}
                        </>
                      ) : (
                        <button
                          onClick={() => onConnectPlatform(platform.id)}
                          className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition-colors"
                        >
                          Connect
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Artist Profile Information</h3>
              <p className="text-gray-600">
                This information will be synchronized across all connected platforms.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Basic Info */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Artist Name
                  </label>
                  <input
                    type="text"
                    value={profileData.name}
                    onChange={(e) => handleProfileUpdate('name', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter artist name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Location
                  </label>
                  <input
                    type="text"
                    value={profileData.location || ''}
                    onChange={(e) => handleProfileUpdate('location', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="City, Country"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Genres
                  </label>
                  <input
                    type="text"
                    value={profileData.genres.join(', ')}
                    onChange={(e) => handleProfileUpdate('genres', e.target.value.split(', ').filter(g => g.trim()))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Pop, Rock, Electronic"
                  />
                  <p className="text-xs text-gray-500 mt-1">Separate genres with commas</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Record Labels
                  </label>
                  <input
                    type="text"
                    value={profileData.labels.join(', ')}
                    onChange={(e) => handleProfileUpdate('labels', e.target.value.split(', ').filter(l => l.trim()))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Independent, Sony Music"
                  />
                </div>
              </div>

              {/* Bio & Images */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Artist Bio
                  </label>
                  <textarea
                    value={profileData.bio}
                    onChange={(e) => handleProfileUpdate('bio', e.target.value)}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Tell your story..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Profile Picture
                  </label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-blue-400 transition-colors">
                    <div className="text-gray-500">
                      <div className="text-2xl mb-2">📷</div>
                      <p>Click to upload or drag and drop</p>
                      <p className="text-xs">PNG, JPG up to 2MB</p>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Cover Image
                  </label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-blue-400 transition-colors">
                    <div className="text-gray-500">
                      <div className="text-2xl mb-2">🖼️</div>
                      <p>Click to upload or drag and drop</p>
                      <p className="text-xs">PNG, JPG up to 5MB</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Social Links */}
            <div>
              <h4 className="text-md font-medium text-gray-900 mb-4">Social Media Links</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { key: 'website', label: 'Website', icon: '🌐' },
                  { key: 'instagram', label: 'Instagram', icon: '📷' },
                  { key: 'twitter', label: 'Twitter', icon: '🐦' },
                  { key: 'facebook', label: 'Facebook', icon: '📘' },
                  { key: 'youtube', label: 'YouTube', icon: '📺' },
                  { key: 'tiktok', label: 'TikTok', icon: '🎵' }
                ].map((social) => (
                  <div key={social.key}>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {social.icon} {social.label}
                    </label>
                    <input
                      type="url"
                      value={profileData.socialLinks[social.key as keyof typeof profileData.socialLinks] || ''}
                      onChange={(e) => handleSocialLinkUpdate(social.key, e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder={`https://${social.key === 'website' ? 'yourwebsite.com' : `${social.key}.com/username`}`}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Synchronization Settings</h3>
              <p className="text-gray-600">
                Choose which platforms to sync and what information to update.
              </p>
            </div>

            <div className="space-y-4">
              <h4 className="font-medium text-gray-900">Select Platforms to Sync</h4>
              {platforms.filter(p => p.connected).map((platform) => (
                <div key={platform.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={selectedPlatforms.includes(platform.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedPlatforms(prev => [...prev, platform.id]);
                        } else {
                          setSelectedPlatforms(prev => prev.filter(id => id !== platform.id));
                        }
                      }}
                      className="h-4 w-4 text-blue-600 rounded focus:ring-blue-500"
                    />
                    <span className="text-2xl">{platform.icon}</span>
                    <span className="font-medium">{platform.name}</span>
                  </div>
                  <div className="text-sm text-gray-600">
                    {platform.followerCount && `${formatFollowerCount(platform.followerCount)} followers`}
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-medium text-blue-900 mb-2">What will be synchronized:</h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>✓ Artist name and bio</li>
                <li>✓ Profile and cover images</li>
                <li>✓ Genre information</li>
                <li>✓ Social media links</li>
                <li>✓ Location and label information</li>
              </ul>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Review & Start Sync</h3>
              <p className="text-gray-600">
                Review your profile information and start synchronization.
              </p>
            </div>

            {/* Profile Preview */}
            <div className="bg-gray-50 rounded-lg p-6">
              <h4 className="font-medium text-gray-900 mb-4">Profile Preview</h4>
              <div className="flex items-start space-x-4">
                <div className="w-16 h-16 bg-gray-300 rounded-full flex items-center justify-center text-2xl">
                  👤
                </div>
                <div className="flex-1">
                  <h5 className="font-semibold text-gray-900">{profileData.name}</h5>
                  <p className="text-sm text-gray-600 mb-2">{profileData.location}</p>
                  <p className="text-sm text-gray-700">{profileData.bio}</p>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {profileData.genres.map((genre, index) => (
                      <span key={index} className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                        {genre}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Selected Platforms */}
            <div>
              <h4 className="font-medium text-gray-900 mb-3">
                Syncing to {selectedPlatforms.length} platform(s):
              </h4>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {platforms
                  .filter(p => selectedPlatforms.includes(p.id))
                  .map((platform) => (
                    <div key={platform.id} className="flex items-center space-x-2 p-2 bg-green-50 border border-green-200 rounded-lg">
                      <span className="text-lg">{platform.icon}</span>
                      <span className="text-sm font-medium">{platform.name}</span>
                    </div>
                  ))}
              </div>
            </div>

            {isProcessing && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center space-x-3">
                  <div className="animate-spin text-blue-600">🔄</div>
                  <div>
                    <h5 className="font-medium text-blue-900">Synchronizing...</h5>
                    <p className="text-sm text-blue-700">This may take a few minutes.</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold">Profile Sync Wizard</h2>
            <button
              onClick={onClose}
              className="text-white hover:bg-white hover:bg-opacity-20 p-2 rounded-lg transition-colors"
            >
              ✕
            </button>
          </div>

          {/* Step Indicator */}
          <div className="flex items-center space-x-4">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                  currentStep >= step.id
                    ? 'bg-white text-blue-600'
                    : 'bg-blue-400 text-white'
                }`}>
                  {step.id}
                </div>
                <div className="ml-2 hidden md:block">
                  <div className="text-sm font-medium">{step.title}</div>
                  <div className="text-xs text-blue-200">{step.description}</div>
                </div>
                {index < steps.length - 1 && (
                  <div className="w-8 h-0.5 bg-blue-400 mx-4" />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="p-6 max-h-[60vh] overflow-y-auto">
          {renderStepContent()}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 p-6 flex items-center justify-between bg-gray-50">
          <button
            onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
            disabled={currentStep === 1}
            className="bg-gray-300 hover:bg-gray-400 disabled:bg-gray-200 disabled:text-gray-500 text-gray-700 font-medium py-2 px-4 rounded-lg transition-colors"
          >
            Previous
          </button>

          <div className="text-sm text-gray-600">
            Step {currentStep} of {steps.length}
          </div>

          <div className="space-x-3">
            {currentStep < steps.length ? (
              <button
                onClick={() => setCurrentStep(Math.min(steps.length, currentStep + 1))}
                disabled={currentStep === 3 && selectedPlatforms.length === 0}
                className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-medium py-2 px-4 rounded-lg transition-colors"
              >
                Next
              </button>
            ) : (
              <button
                onClick={handleSync}
                disabled={isProcessing || selectedPlatforms.length === 0}
                className="bg-green-600 hover:bg-green-700 disabled:bg-green-300 text-white font-medium py-2 px-4 rounded-lg transition-colors"
              >
                {isProcessing ? 'Syncing...' : 'Start Sync'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileSyncWizard;
