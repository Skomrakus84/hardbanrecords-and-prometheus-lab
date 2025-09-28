import React, { useState } from 'react';

interface Track {
  id: string;
  title: string;
  duration: string;
  isrc?: string;
  preview?: string;
}

interface Release {
  id?: string;
  title: string;
  artist: string;
  releaseType: 'single' | 'ep' | 'album' | 'compilation';
  genre: string;
  releaseDate: string;
  label: string;
  upc?: string;
  artwork?: File | string;
  tracks: Track[];
  description?: string;
  tags: string[];
}

interface ReleaseEditorFormProps {
  release?: Release;
  onSave: (release: Release) => void;
  onCancel: () => void;
}

const ReleaseEditorForm: React.FC<ReleaseEditorFormProps> = ({
  release,
  onSave,
  onCancel
}) => {
  const [formData, setFormData] = useState<Release>({
    title: release?.title || '',
    artist: release?.artist || '',
    releaseType: release?.releaseType || 'single',
    genre: release?.genre || '',
    releaseDate: release?.releaseDate || '',
    label: release?.label || '',
    upc: release?.upc || '',
    tracks: release?.tracks || [{ id: '1', title: '', duration: '' }],
    description: release?.description || '',
    tags: release?.tags || []
  });

  const [currentStep, setCurrentStep] = useState(1);
  const [draggedTrack, setDraggedTrack] = useState<number | null>(null);

  const addTrack = () => {
    setFormData(prev => ({
      ...prev,
      tracks: [...prev.tracks, {
        id: Date.now().toString(),
        title: '',
        duration: ''
      }]
    }));
  };

  const removeTrack = (index: number) => {
    setFormData(prev => ({
      ...prev,
      tracks: prev.tracks.filter((_, i) => i !== index)
    }));
  };

  const updateTrack = (index: number, field: keyof Track, value: string) => {
    setFormData(prev => ({
      ...prev,
      tracks: prev.tracks.map((track, i) =>
        i === index ? { ...track, [field]: value } : track
      )
    }));
  };

  const handleDragStart = (index: number) => {
    setDraggedTrack(index);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    if (draggedTrack === null) return;

    const newTracks = [...formData.tracks];
    const draggedItem = newTracks[draggedTrack];
    newTracks.splice(draggedTrack, 1);
    newTracks.splice(dropIndex, 0, draggedItem);

    setFormData(prev => ({ ...prev, tracks: newTracks }));
    setDraggedTrack(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  const steps = [
    { id: 1, title: 'Basic Info', icon: '📝' },
    { id: 2, title: 'Tracks', icon: '🎵' },
    { id: 3, title: 'Metadata', icon: '🏷️' },
    { id: 4, title: 'Artwork', icon: '🎨' }
  ];

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden max-w-6xl mx-auto">
      {/* Header with Steps */}
      <div className="bg-gradient-to-r from-indigo-500 to-purple-600 p-6 text-white">
        <h2 className="text-2xl font-bold mb-4">
          {release ? 'Edit Release' : 'Create New Release'}
        </h2>

        {/* Step Navigation */}
        <div className="flex space-x-4">
          {steps.map((step) => (
            <button
              key={step.id}
              onClick={() => setCurrentStep(step.id)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all ${
                currentStep === step.id
                  ? 'bg-white bg-opacity-20 shadow-md'
                  : 'bg-white bg-opacity-10 hover:bg-opacity-15'
              }`}
            >
              <span className="text-lg">{step.icon}</span>
              <span className="font-medium">{step.title}</span>
            </button>
          ))}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="p-6">
        {/* Step 1: Basic Info */}
        {currentStep === 1 && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Release Title *
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Enter release title"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Artist Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.artist}
                  onChange={(e) => setFormData(prev => ({ ...prev, artist: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Enter artist name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Release Type *
                </label>
                <select
                  required
                  value={formData.releaseType}
                  onChange={(e) => setFormData(prev => ({ ...prev, releaseType: e.target.value as any }))}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="single">Single</option>
                  <option value="ep">EP</option>
                  <option value="album">Album</option>
                  <option value="compilation">Compilation</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Genre *
                </label>
                <select
                  required
                  value={formData.genre}
                  onChange={(e) => setFormData(prev => ({ ...prev, genre: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="">Select genre</option>
                  <option value="Electronic">Electronic</option>
                  <option value="Hip Hop">Hip Hop</option>
                  <option value="Pop">Pop</option>
                  <option value="Rock">Rock</option>
                  <option value="Jazz">Jazz</option>
                  <option value="Classical">Classical</option>
                  <option value="Alternative">Alternative</option>
                  <option value="Indie">Indie</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Release Date *
                </label>
                <input
                  type="date"
                  required
                  value={formData.releaseDate}
                  onChange={(e) => setFormData(prev => ({ ...prev, releaseDate: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Record Label
                </label>
                <input
                  type="text"
                  value={formData.label}
                  onChange={(e) => setFormData(prev => ({ ...prev, label: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Enter label name"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                rows={4}
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Describe your release..."
              />
            </div>
          </div>
        )}

        {/* Step 2: Tracks */}
        {currentStep === 2 && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Track Listing</h3>
              <button
                type="button"
                onClick={addTrack}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center space-x-2"
              >
                <span>➕</span>
                <span>Add Track</span>
              </button>
            </div>

            <div className="space-y-3">
              {formData.tracks.map((track, index) => (
                <div
                  key={track.id}
                  draggable
                  onDragStart={() => handleDragStart(index)}
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, index)}
                  className="bg-gray-50 border border-gray-200 rounded-lg p-4 hover:shadow-md transition-all cursor-move"
                >
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center justify-center w-8 h-8 bg-indigo-100 text-indigo-700 rounded-full font-semibold text-sm">
                      {index + 1}
                    </div>

                    <div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div className="md:col-span-2">
                        <input
                          type="text"
                          placeholder="Track title"
                          value={track.title}
                          onChange={(e) => updateTrack(index, 'title', e.target.value)}
                          className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        />
                      </div>

                      <div>
                        <input
                          type="text"
                          placeholder="Duration (3:45)"
                          value={track.duration}
                          onChange={(e) => updateTrack(index, 'duration', e.target.value)}
                          className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        />
                      </div>

                      <div>
                        <input
                          type="text"
                          placeholder="ISRC Code"
                          value={track.isrc || ''}
                          onChange={(e) => updateTrack(index, 'isrc', e.target.value)}
                          className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        />
                      </div>
                    </div>

                    {formData.tracks.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeTrack(index)}
                        className="text-red-600 hover:text-red-700 transition-colors p-1"
                      >
                        🗑️
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Step 3: Metadata */}
        {currentStep === 3 && (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                UPC/Barcode
              </label>
              <input
                type="text"
                value={formData.upc}
                onChange={(e) => setFormData(prev => ({ ...prev, upc: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Enter UPC code"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tags (comma separated)
              </label>
              <input
                type="text"
                value={formData.tags.join(', ')}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  tags: e.target.value.split(',').map(tag => tag.trim()).filter(Boolean)
                }))}
                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="electronic, synthwave, ambient"
              />
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-medium text-blue-900 mb-2">💡 Metadata Tips</h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• UPC codes are used for digital distribution tracking</li>
                <li>• ISRC codes uniquely identify each track</li>
                <li>• Good tags improve discoverability on streaming platforms</li>
                <li>• Release date affects playlist consideration timing</li>
              </ul>
            </div>
          </div>
        )}

        {/* Step 4: Artwork */}
        {currentStep === 4 && (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Album Artwork
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-indigo-400 transition-colors">
                <div className="text-6xl mb-4">🎨</div>
                <p className="text-gray-600 mb-4">
                  Drop your artwork here or click to upload
                </p>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  id="artwork-upload"
                />
                <label
                  htmlFor="artwork-upload"
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded-lg cursor-pointer transition-colors"
                >
                  Choose File
                </label>
              </div>
              <p className="text-sm text-gray-500 mt-2">
                Minimum 3000x3000px, square format, JPG or PNG
              </p>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <h4 className="font-medium text-yellow-900 mb-2">⚠️ Artwork Requirements</h4>
              <ul className="text-sm text-yellow-800 space-y-1">
                <li>• Minimum resolution: 3000x3000 pixels</li>
                <li>• Perfect square aspect ratio (1:1)</li>
                <li>• No explicit content or copyrighted material</li>
                <li>• Text should be readable at small sizes</li>
                <li>• Avoid borders or white space around edges</li>
              </ul>
            </div>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex items-center justify-between pt-6 border-t border-gray-200 mt-8">
          <div className="flex space-x-3">
            {currentStep > 1 && (
              <button
                type="button"
                onClick={() => setCurrentStep(currentStep - 1)}
                className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-2 px-4 rounded-lg transition-colors"
              >
                ← Previous
              </button>
            )}
          </div>

          <div className="flex space-x-3">
            <button
              type="button"
              onClick={onCancel}
              className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-2 px-4 rounded-lg transition-colors"
            >
              Cancel
            </button>

            {currentStep < steps.length ? (
              <button
                type="button"
                onClick={() => setCurrentStep(currentStep + 1)}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
              >
                Next →
              </button>
            ) : (
              <button
                type="submit"
                className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center space-x-2"
              >
                <span>💾</span>
                <span>Save Release</span>
              </button>
            )}
          </div>
        </div>
      </form>
    </div>
  );
};

export default ReleaseEditorForm;
