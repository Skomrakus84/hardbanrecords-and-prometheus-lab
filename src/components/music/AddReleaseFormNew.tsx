import React, { useState, useCallback } from 'react';
import { useAuthStore } from '../../store/authStore';
import { useMusicStore } from '../../store/musicStore';
import { ReleaseFormData, TrackData, ReleaseMetadata, Release } from '../../types/music';

interface AddReleaseFormProps {
  release?: Release; // Release to edit, if provided
  onClose: () => void;
}

const DISTRIBUTION_PLATFORMS = [
  { id: 'spotify', name: 'Spotify', icon: '🎵' },
  { id: 'apple-music', name: 'Apple Music', icon: '🍎' },
  { id: 'youtube-music', name: 'YouTube Music', icon: '📺' },
  { id: 'amazon-music', name: 'Amazon Music', icon: '🛒' },
  { id: 'deezer', name: 'Deezer', icon: '🎶' },
  { id: 'tidal', name: 'Tidal', icon: '🌊' },
  { id: 'soundcloud', name: 'SoundCloud', icon: '☁️' },
  { id: 'bandcamp', name: 'Bandcamp', icon: '🎪' }
];

const GENRES = [
  'Pop', 'Rock', 'Hip-Hop', 'Electronic', 'Jazz', 'Classical',
  'Country', 'R&B', 'Reggae', 'Folk', 'Blues', 'Metal', 'Punk', 'Alternative'
];

export const AddReleaseFormNew: React.FC<AddReleaseFormProps> = ({ onClose, release }) => {
  const { user } = useAuthStore();
  const { createRelease, updateRelease } = useMusicStore();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<ReleaseFormData>({
    title: '',
    artist: user?.display_name || '',
    genre: '',
    releaseDate: '',
    platforms: [],
    tracks: [{ title: '', duration: '' }],
    metadata: {
      description: '',
      tags: [],
      language: 'en',
      explicitContent: false
    }
  });

  const [dragActive, setDragActive] = useState(false);

  const handleInputChange = (field: keyof ReleaseFormData, value: string | string[] | File) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleMetadataChange = (field: string, value: string | string[] | boolean) => {
    setFormData(prev => ({
      ...prev,
      metadata: {
        ...prev.metadata,
        [field]: value
      }
    }));
  };

  const handlePlatformToggle = (platformId: string) => {
    setFormData(prev => ({
      ...prev,
      platforms: prev.platforms.includes(platformId)
        ? prev.platforms.filter(p => p !== platformId)
        : [...prev.platforms, platformId]
    }));
  };

  const handleTrackChange = (index: number, field: keyof TrackData, value: string | File) => {
    setFormData(prev => ({
      ...prev,
      tracks: prev.tracks.map((track, i) =>
        i === index ? { ...track, [field]: value } : track
      )
    }));
  };

  const addTrack = () => {
    setFormData(prev => ({
      ...prev,
      tracks: [...prev.tracks, { title: '', duration: '' }]
    }));
  };

  const removeTrack = (index: number) => {
    setFormData(prev => ({
      ...prev,
      tracks: prev.tracks.filter((_, i) => i !== index)
    }));
  };

  const handleFileUpload = (file: File, type: 'cover' | 'track', trackIndex?: number) => {
    if (type === 'cover') {
      setFormData(prev => ({ ...prev, coverArt: file }));
    } else if (type === 'track' && trackIndex !== undefined) {
      handleTrackChange(trackIndex, 'audioFile', file);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent, type: 'cover' | 'track', trackIndex?: number) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0 && files[0]) {
      handleFileUpload(files[0], type, trackIndex);
    }
  };

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1:
        return !!(formData.title && formData.artist && formData.genre);
      case 2:
        return formData.tracks.every(track => track.title && track.duration);
      case 3:
        return formData.platforms.length > 0;
      case 4:
        return true; // Optional metadata
      default:
        return false;
    }
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, 4));
    }
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (validateStep(4)) {
      try {
        if (release) {
          await updateRelease(release.id, {
            title: formData.title,
            artist: formData.artist,
            genre: formData.genre,
            releaseDate: formData.releaseDate,
            platforms: formData.platforms,
            tracks: formData.tracks,
            metadata: formData.metadata
          });
        } else {
          await createRelease({
            title: formData.title,
            artist: formData.artist,
            genre: formData.genre,
            releaseDate: formData.releaseDate,
            platforms: formData.platforms,
            tracks: formData.tracks,
            metadata: formData.metadata
          });
        }
        onClose();
      } catch (error) {
        console.error('Failed to save release:', error);
        // TODO: Show error toast/notification
      }
    }
  };

  const renderStepIndicator = () => (
    <div className="flex items-center justify-center mb-8">
      {[1, 2, 3, 4].map(step => (
        <React.Fragment key={step}>
          <div className={`
            w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium
            ${currentStep >= step
              ? 'bg-blue-600 text-white'
              : 'bg-gray-200 text-gray-600'
            }
          `}>
            {step}
          </div>
          {step < 4 && (
            <div className={`
              w-12 h-0.5 mx-2
              ${currentStep > step ? 'bg-blue-600' : 'bg-gray-200'}
            `} />
          )}
        </React.Fragment>
      ))}
    </div>
  );

  const renderStep1 = () => (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold text-gray-900 mb-4">Basic Release Information</h3>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Release Title *
        </label>
        <input
          type="text"
          value={formData.title}
          onChange={(e) => handleInputChange('title', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="Enter your release title"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Artist Name *
        </label>
        <input
          type="text"
          value={formData.artist}
          onChange={(e) => handleInputChange('artist', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="Artist or band name"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Genre *
        </label>
        <select
          value={formData.genre}
          onChange={(e) => handleInputChange('genre', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="">Select a genre</option>
          {GENRES.map(genre => (
            <option key={genre} value={genre}>{genre}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Release Date
        </label>
        <input
          type="date"
          value={formData.releaseDate}
          onChange={(e) => handleInputChange('releaseDate', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      {/* Cover Art Upload */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Cover Art
        </label>
        <div
          className={`
            border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors
            ${dragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300'}
            ${formData.coverArt ? 'bg-green-50 border-green-300' : ''}
          `}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={(e) => handleDrop(e, 'cover')}
          onClick={() => document.getElementById('cover-upload')?.click()}
        >
          {formData.coverArt ? (
            <div className="text-green-600">
              <p className="font-medium">✓ {formData.coverArt.name}</p>
              <p className="text-sm">Click to change</p>
            </div>
          ) : (
            <div className="text-gray-500">
              <p className="mb-2">📸 Drop your cover art here or click to browse</p>
              <p className="text-sm">PNG, JPG up to 10MB. Recommended: 3000x3000px</p>
            </div>
          )}
          <input
            id="cover-upload"
            type="file"
            accept="image/*"
            onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0], 'cover')}
            className="hidden"
          />
        </div>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold text-gray-900">Track Listing</h3>
        <button
          type="button"
          onClick={addTrack}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          + Add Track
        </button>
      </div>

      {formData.tracks.map((track, index) => (
        <div key={index} className="border rounded-lg p-4 bg-gray-50">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-medium text-gray-900">Track {index + 1}</h4>
            {formData.tracks.length > 1 && (
              <button
                type="button"
                onClick={() => removeTrack(index)}
                className="text-red-600 hover:text-red-800"
              >
                🗑️ Remove
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Track Title *
              </label>
              <input
                type="text"
                value={track.title}
                onChange={(e) => handleTrackChange(index, 'title', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Track title"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Duration *
              </label>
              <input
                type="text"
                value={track.duration}
                onChange={(e) => handleTrackChange(index, 'duration', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="3:45"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Audio File
            </label>
            <div
              className={`
                border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-colors
                ${track.audioFile ? 'bg-green-50 border-green-300' : 'border-gray-300'}
              `}
              onClick={() => document.getElementById(`audio-upload-${index}`)?.click()}
            >
              {track.audioFile ? (
                <div className="text-green-600">
                  <p className="font-medium">🎵 {track.audioFile.name}</p>
                  <p className="text-sm">Click to change</p>
                </div>
              ) : (
                <div className="text-gray-500">
                  <p>🎵 Upload audio file</p>
                  <p className="text-sm">WAV, MP3, FLAC up to 100MB</p>
                </div>
              )}
              <input
                id={`audio-upload-${index}`}
                type="file"
                accept="audio/*"
                onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0], 'track', index)}
                className="hidden"
              />
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold text-gray-900 mb-4">Distribution Platforms</h3>
      <p className="text-gray-600 mb-6">
        Select the platforms where you want to distribute your release. You can always add more platforms later.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {DISTRIBUTION_PLATFORMS.map(platform => (
          <div
            key={platform.id}
            className={`
              border-2 rounded-lg p-4 cursor-pointer transition-all
              ${formData.platforms.includes(platform.id)
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 hover:border-gray-300'
              }
            `}
            onClick={() => handlePlatformToggle(platform.id)}
          >
            <div className="flex items-center space-x-3">
              <span className="text-2xl">{platform.icon}</span>
              <div>
                <p className="font-medium text-gray-900">{platform.name}</p>
                <p className="text-sm text-gray-500">
                  {formData.platforms.includes(platform.id) ? 'Selected' : 'Click to select'}
                </p>
              </div>
              {formData.platforms.includes(platform.id) && (
                <div className="ml-auto text-blue-600">✓</div>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <p className="text-sm text-yellow-800">
          <strong>💡 Pro Tip:</strong> Starting with major platforms like Spotify, Apple Music, and YouTube Music
          ensures maximum reach. You can add more platforms anytime from your dashboard.
        </p>
      </div>
    </div>
  );

  const renderStep4 = () => (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold text-gray-900 mb-4">Metadata & Settings</h3>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Description
        </label>
        <textarea
          value={formData.metadata.description}
          onChange={(e) => handleMetadataChange('description', e.target.value)}
          rows={4}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="Tell people about your release..."
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Tags (comma separated)
        </label>
        <input
          type="text"
          value={formData.metadata.tags.join(', ')}
          onChange={(e) => handleMetadataChange('tags', e.target.value.split(',').map(tag => tag.trim()))}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="indie, pop, summer, upbeat"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Language
        </label>
        <select
          value={formData.metadata.language}
          onChange={(e) => handleMetadataChange('language', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="en">English</option>
          <option value="pl">Polish</option>
          <option value="es">Spanish</option>
          <option value="fr">French</option>
          <option value="de">German</option>
          <option value="it">Italian</option>
        </select>
      </div>

      <div className="flex items-center">
        <input
          type="checkbox"
          id="explicit"
          checked={formData.metadata.explicitContent}
          onChange={(e) => handleMetadataChange('explicitContent', e.target.checked)}
          className="mr-2"
        />
        <label htmlFor="explicit" className="text-sm text-gray-700">
          This release contains explicit content
        </label>
      </div>

      <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h4 className="font-medium text-blue-900 mb-2">📋 Release Summary</h4>
        <div className="text-sm text-blue-800 space-y-1">
          <p><strong>Title:</strong> {formData.title}</p>
          <p><strong>Artist:</strong> {formData.artist}</p>
          <p><strong>Genre:</strong> {formData.genre}</p>
          <p><strong>Tracks:</strong> {formData.tracks.length}</p>
          <p><strong>Platforms:</strong> {formData.platforms.length} selected</p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b px-6 py-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900">Add New Release</h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              ✕
            </button>
          </div>
          {renderStepIndicator()}
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          {currentStep === 1 && renderStep1()}
          {currentStep === 2 && renderStep2()}
          {currentStep === 3 && renderStep3()}
          {currentStep === 4 && renderStep4()}

          <div className="flex justify-between pt-6 mt-6 border-t">
            <button
              type="button"
              onClick={prevStep}
              disabled={currentStep === 1}
              className={`px-6 py-2 rounded-lg ${
                currentStep === 1
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Previous
            </button>

            <div className="flex space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>

              {currentStep === 4 ? (
                <button
                  type="submit"
                  disabled={!validateStep(4)}
                  className={`px-6 py-2 rounded-lg ${
                    validateStep(4)
                      ? 'bg-blue-600 text-white hover:bg-blue-700'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  🚀 Create Release
                </button>
              ) : (
                <button
                  type="button"
                  onClick={nextStep}
                  disabled={!validateStep(currentStep)}
                  className={`px-6 py-2 rounded-lg ${
                    validateStep(currentStep)
                      ? 'bg-blue-600 text-white hover:bg-blue-700'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  Next
                </button>
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
