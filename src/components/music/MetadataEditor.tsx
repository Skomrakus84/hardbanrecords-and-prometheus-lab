import React, { useState, useRef } from 'react';

interface MetadataField {
  id: string;
  label: string;
  value: string;
  type: 'text' | 'textarea' | 'select' | 'date' | 'number' | 'url' | 'tags';
  required: boolean;
  options?: string[];
  validation?: {
    pattern?: string;
    minLength?: number;
    maxLength?: number;
    min?: number;
    max?: number;
  };
}

interface TrackMetadata {
  id: string;
  title: string;
  artist: string;
  album: string;
  duration: string;
  isrc?: string;
  fields: MetadataField[];
  artwork?: File | string;
  audioFile?: File | string;
}

interface MetadataEditorProps {
  tracks: TrackMetadata[];
  onUpdateTrack: (trackId: string, updates: Partial<TrackMetadata>) => void;
  onSaveAll: () => void;
  onCancel: () => void;
  presetTemplates?: { [key: string]: Partial<MetadataField>[] };
}

const MetadataEditor: React.FC<MetadataEditorProps> = ({
  tracks,
  onUpdateTrack,
  onSaveAll,
  onCancel,
  presetTemplates = {}
}) => {
  const [selectedTrack, setSelectedTrack] = useState<string>(tracks[0]?.id || '');
  const [activeTemplate, setActiveTemplate] = useState<string>('');
  const [bulkEditMode, setBulkEditMode] = useState(false);
  const [selectedTracks, setSelectedTracks] = useState<string[]>([]);
  const [validationErrors, setValidationErrors] = useState<{ [key: string]: string }>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

  const currentTrack = tracks.find(t => t.id === selectedTrack);

  const defaultMetadataFields: MetadataField[] = [
    { id: 'title', label: 'Track Title', value: '', type: 'text', required: true, validation: { minLength: 1, maxLength: 100 } },
    { id: 'artist', label: 'Artist Name', value: '', type: 'text', required: true, validation: { minLength: 1, maxLength: 100 } },
    { id: 'album', label: 'Album/Release Title', value: '', type: 'text', required: true, validation: { minLength: 1, maxLength: 100 } },
    { id: 'genre', label: 'Primary Genre', value: '', type: 'select', required: true, options: ['Pop', 'Rock', 'Hip-Hop', 'Electronic', 'R&B', 'Country', 'Jazz', 'Classical', 'Alternative', 'Indie'] },
    { id: 'subgenre', label: 'Sub-genre', value: '', type: 'text', required: false },
    { id: 'language', label: 'Language', value: 'English', type: 'select', required: true, options: ['English', 'Spanish', 'French', 'German', 'Italian', 'Portuguese', 'Japanese', 'Korean', 'Mandarin', 'Other'] },
    { id: 'explicit', label: 'Explicit Content', value: 'No', type: 'select', required: true, options: ['Yes', 'No'] },
    { id: 'isrc', label: 'ISRC Code', value: '', type: 'text', required: false, validation: { pattern: '^[A-Z]{2}[A-Z0-9]{3}[0-9]{7}$' } },
    { id: 'composer', label: 'Composer(s)', value: '', type: 'text', required: false },
    { id: 'lyricist', label: 'Lyricist(s)', value: '', type: 'text', required: false },
    { id: 'producer', label: 'Producer(s)', value: '', type: 'text', required: false },
    { id: 'recordLabel', label: 'Record Label', value: '', type: 'text', required: false },
    { id: 'publishingRights', label: 'Publishing Rights', value: '', type: 'text', required: false },
    { id: 'copyrightYear', label: 'Copyright Year', value: new Date().getFullYear().toString(), type: 'number', required: true, validation: { min: 1900, max: new Date().getFullYear() + 1 } },
    { id: 'releaseDate', label: 'Original Release Date', value: '', type: 'date', required: false },
    { id: 'lyrics', label: 'Lyrics', value: '', type: 'textarea', required: false, validation: { maxLength: 5000 } },
    { id: 'description', label: 'Track Description', value: '', type: 'textarea', required: false, validation: { maxLength: 1000 } },
    { id: 'tags', label: 'Tags', value: '', type: 'tags', required: false },
    { id: 'spotifyUrl', label: 'Spotify URL', value: '', type: 'url', required: false },
    { id: 'appleMusicUrl', label: 'Apple Music URL', value: '', type: 'url', required: false },
    { id: 'youtubeMusicUrl', label: 'YouTube Music URL', value: '', type: 'url', required: false }
  ];

  const validateField = (field: MetadataField): string | null => {
    if (field.required && !field.value.trim()) {
      return `${field.label} is required`;
    }

    if (field.validation) {
      const { pattern, minLength, maxLength, min, max } = field.validation;

      if (pattern && field.value && !new RegExp(pattern).test(field.value)) {
        return `${field.label} format is invalid`;
      }

      if (minLength && field.value.length < minLength) {
        return `${field.label} must be at least ${minLength} characters`;
      }

      if (maxLength && field.value.length > maxLength) {
        return `${field.label} must be no more than ${maxLength} characters`;
      }

      if (field.type === 'number') {
        const numValue = parseInt(field.value);
        if (min && numValue < min) {
          return `${field.label} must be at least ${min}`;
        }
        if (max && numValue > max) {
          return `${field.label} must be no more than ${max}`;
        }
      }
    }

    return null;
  };

  const validateAllFields = (): boolean => {
    const errors: { [key: string]: string } = {};
    let hasErrors = false;

    if (currentTrack) {
      currentTrack.fields.forEach(field => {
        const error = validateField(field);
        if (error) {
          errors[`${currentTrack.id}_${field.id}`] = error;
          hasErrors = true;
        }
      });
    }

    setValidationErrors(errors);
    return !hasErrors;
  };

  const updateFieldValue = (fieldId: string, value: string) => {
    if (!currentTrack) return;

    const updatedFields = currentTrack.fields.map(field =>
      field.id === fieldId ? { ...field, value } : field
    );

    onUpdateTrack(currentTrack.id, { fields: updatedFields });

    // Clear validation error for this field
    const errorKey = `${currentTrack.id}_${fieldId}`;
    if (validationErrors[errorKey]) {
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[errorKey];
        return newErrors;
      });
    }
  };

  const applyTemplate = (templateName: string) => {
    if (!currentTrack || !presetTemplates[templateName]) return;

    const templateFields = presetTemplates[templateName];
    const updatedFields = currentTrack.fields.map(field => {
      const templateField = templateFields.find(tf => tf.id === field.id);
      return templateField ? { ...field, ...templateField } : field;
    });

    onUpdateTrack(currentTrack.id, { fields: updatedFields });
  };

  const bulkUpdateFields = (fieldId: string, value: string) => {
    selectedTracks.forEach(trackId => {
      const track = tracks.find(t => t.id === trackId);
      if (track) {
        const updatedFields = track.fields.map(field =>
          field.id === fieldId ? { ...field, value } : field
        );
        onUpdateTrack(trackId, { fields: updatedFields });
      }
    });
  };

  const renderField = (field: MetadataField) => {
    const errorKey = `${currentTrack?.id}_${field.id}`;
    const hasError = validationErrors[errorKey];

    const baseClasses = `w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
      hasError ? 'border-red-300 bg-red-50' : 'border-gray-300'
    }`;

    switch (field.type) {
      case 'textarea':
        return (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            <textarea
              value={field.value}
              onChange={(e) => updateFieldValue(field.id, e.target.value)}
              className={baseClasses}
              rows={field.id === 'lyrics' ? 6 : 3}
              placeholder={`Enter ${field.label.toLowerCase()}`}
            />
            {hasError && (
              <p className="text-red-500 text-xs mt-1">{validationErrors[errorKey]}</p>
            )}
          </div>
        );

      case 'select':
        return (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            <select
              value={field.value}
              onChange={(e) => updateFieldValue(field.id, e.target.value)}
              className={baseClasses}
            >
              <option value="">Select {field.label}</option>
              {field.options?.map(option => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
            {hasError && (
              <p className="text-red-500 text-xs mt-1">{validationErrors[errorKey]}</p>
            )}
          </div>
        );

      case 'tags':
        return (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            <input
              type="text"
              value={field.value}
              onChange={(e) => updateFieldValue(field.id, e.target.value)}
              className={baseClasses}
              placeholder="Separate tags with commas"
            />
            <p className="text-xs text-gray-500 mt-1">Separate multiple tags with commas</p>
            {hasError && (
              <p className="text-red-500 text-xs mt-1">{validationErrors[errorKey]}</p>
            )}
          </div>
        );

      default:
        return (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            <input
              type={field.type}
              value={field.value}
              onChange={(e) => updateFieldValue(field.id, e.target.value)}
              className={baseClasses}
              placeholder={`Enter ${field.label.toLowerCase()}`}
              min={field.validation?.min}
              max={field.validation?.max}
              minLength={field.validation?.minLength}
              maxLength={field.validation?.maxLength}
            />
            {hasError && (
              <p className="text-red-500 text-xs mt-1">{validationErrors[errorKey]}</p>
            )}
          </div>
        );
    }
  };

  const getCompletionPercentage = (track: TrackMetadata): number => {
    const requiredFields = track.fields.filter(f => f.required);
    const completedFields = requiredFields.filter(f => f.value.trim() !== '');
    return requiredFields.length > 0 ? (completedFields.length / requiredFields.length) * 100 : 100;
  };

  const handleSave = () => {
    if (validateAllFields()) {
      onSaveAll();
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-500 to-indigo-600 p-6 text-white">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">Metadata Editor</h2>

          <div className="flex items-center space-x-3">
            <button
              onClick={() => setBulkEditMode(!bulkEditMode)}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                bulkEditMode
                  ? 'bg-white text-purple-600'
                  : 'bg-white bg-opacity-20 text-white hover:bg-opacity-30'
              }`}
            >
              {bulkEditMode ? '👁️ Individual' : '📝 Bulk Edit'}
            </button>

            {Object.keys(presetTemplates).length > 0 && (
              <select
                value={activeTemplate}
                onChange={(e) => {
                  setActiveTemplate(e.target.value);
                  if (e.target.value) applyTemplate(e.target.value);
                }}
                className="bg-white bg-opacity-20 text-white rounded-lg px-3 py-2 text-sm"
              >
                <option value="">Apply Template</option>
                {Object.keys(presetTemplates).map(template => (
                  <option key={template} value={template}>{template}</option>
                ))}
              </select>
            )}
          </div>
        </div>

        {/* Track Selector */}
        {!bulkEditMode && (
          <div className="flex flex-wrap gap-2">
            {tracks.map((track) => {
              const completion = getCompletionPercentage(track);
              return (
                <button
                  key={track.id}
                  onClick={() => setSelectedTrack(track.id)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    selectedTrack === track.id
                      ? 'bg-white text-purple-600'
                      : 'bg-white bg-opacity-20 text-white hover:bg-opacity-30'
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <span>{track.title || `Track ${track.id}`}</span>
                    <div className={`w-2 h-2 rounded-full ${
                      completion === 100 ? 'bg-green-400' :
                      completion >= 50 ? 'bg-yellow-400' : 'bg-red-400'
                    }`} />
                  </div>
                </button>
              );
            })}
          </div>
        )}

        {/* Bulk Edit Mode */}
        {bulkEditMode && (
          <div>
            <div className="flex flex-wrap gap-2 mb-3">
              {tracks.map((track) => (
                <label
                  key={track.id}
                  className={`px-3 py-2 rounded-lg text-sm font-medium cursor-pointer transition-all ${
                    selectedTracks.includes(track.id)
                      ? 'bg-white text-purple-600'
                      : 'bg-white bg-opacity-20 text-white hover:bg-opacity-30'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={selectedTracks.includes(track.id)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedTracks(prev => [...prev, track.id]);
                      } else {
                        setSelectedTracks(prev => prev.filter(id => id !== track.id));
                      }
                    }}
                    className="sr-only"
                  />
                  {track.title || `Track ${track.id}`}
                </label>
              ))}
            </div>
            <div className="text-sm text-purple-200">
              {selectedTracks.length} tracks selected for bulk editing
            </div>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-6">
        {currentTrack && !bulkEditMode && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Track Info */}
            <div className="space-y-4">
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-3">Track Information</h3>
                <div className="space-y-2 text-sm">
                  <div><strong>Title:</strong> {currentTrack.title}</div>
                  <div><strong>Artist:</strong> {currentTrack.artist}</div>
                  <div><strong>Duration:</strong> {currentTrack.duration}</div>
                  <div><strong>Completion:</strong>
                    <span className={`ml-2 font-medium ${
                      getCompletionPercentage(currentTrack) === 100 ? 'text-green-600' :
                      getCompletionPercentage(currentTrack) >= 50 ? 'text-yellow-600' : 'text-red-600'
                    }`}>
                      {getCompletionPercentage(currentTrack).toFixed(0)}%
                    </span>
                  </div>
                </div>
              </div>

              {/* Basic Fields */}
              <div className="space-y-4">
                <h4 className="font-medium text-gray-900">Basic Information</h4>
                {currentTrack.fields.slice(0, 8).map(field => (
                  <div key={field.id}>
                    {renderField(field)}
                  </div>
                ))}
              </div>
            </div>

            {/* Advanced Fields */}
            <div className="space-y-4">
              <h4 className="font-medium text-gray-900">Advanced Metadata</h4>
              {currentTrack.fields.slice(8).map(field => (
                <div key={field.id}>
                  {renderField(field)}
                </div>
              ))}
            </div>
          </div>
        )}

        {bulkEditMode && selectedTracks.length > 0 && (
          <div className="space-y-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-medium text-blue-900 mb-2">Bulk Edit Mode</h3>
              <p className="text-sm text-blue-700">
                Changes will be applied to {selectedTracks.length} selected track(s).
                Only modify fields that should be the same across all selected tracks.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {defaultMetadataFields.filter(field =>
                ['genre', 'language', 'explicit', 'recordLabel', 'publishingRights', 'copyrightYear'].includes(field.id)
              ).map(field => (
                <div key={field.id}>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {field.label} (Bulk Update)
                  </label>
                  {field.type === 'select' ? (
                    <select
                      onChange={(e) => bulkUpdateFields(field.id, e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select {field.label}</option>
                      {field.options?.map(option => (
                        <option key={option} value={option}>{option}</option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type={field.type}
                      onChange={(e) => bulkUpdateFields(field.id, e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder={`Update ${field.label.toLowerCase()} for selected tracks`}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {(!currentTrack && !bulkEditMode) && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📝</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Track Selected</h3>
            <p className="text-gray-600">Select a track to edit its metadata.</p>
          </div>
        )}

        {(bulkEditMode && selectedTracks.length === 0) && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📝</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Tracks Selected</h3>
            <p className="text-gray-600">Select tracks to edit their metadata in bulk.</p>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="border-t border-gray-200 p-6 bg-gray-50 flex items-center justify-between">
        <div className="text-sm text-gray-600">
          {Object.keys(validationErrors).length > 0 && (
            <span className="text-red-600">
              ⚠️ {Object.keys(validationErrors).length} validation error(s) found
            </span>
          )}
        </div>

        <div className="flex space-x-3">
          <button
            onClick={onCancel}
            className="bg-gray-300 hover:bg-gray-400 text-gray-700 font-medium py-2 px-4 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={Object.keys(validationErrors).length > 0}
            className="bg-purple-600 hover:bg-purple-700 disabled:bg-purple-300 text-white font-medium py-2 px-4 rounded-lg transition-colors"
          >
            Save All Changes
          </button>
        </div>
      </div>
    </div>
  );
};

export default MetadataEditor;
