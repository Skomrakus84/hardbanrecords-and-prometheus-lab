import React, { useState } from 'react';
import { useAuthStore } from '../../store/appStore';

interface AddReleaseFormProps {
  onClose: () => void;
  onSubmit: (releaseData: ReleaseFormData) => void;
}

interface ReleaseFormData {
  title: string;
  artist: string;
  genre: string;
  releaseDate: string;
  platforms: string[];
  coverArt?: File;
  tracks: TrackData[];
  metadata: {
    description: string;
    tags: string[];
    language: string;
    explicitContent: boolean;
  };
}

interface TrackData {
  title: string;
  duration: string;
  audioFile?: File;
  isrc?: string;
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

export const AddReleaseForm: React.FC<AddReleaseFormProps> = ({ onClose, onSubmit }) => {
  const { user } = useAuthStore();
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

  const handleInputChange = (field: keyof ReleaseFormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleMetadataChange = (field: string, value: any) => {
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

  const handleTrackChange = (index: number, field: keyof TrackData, value: any) => {
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
    if (files.length > 0) {
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateStep(4)) {
      onSubmit(formData);
    }
  };

  const addSplit = () => {
    setFormData(prev => ({
      ...prev,
      splits: [...prev.splits, { name: '', share: '' }]
    }));
  };

  return (
    <div style={{
      position: 'fixed',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      backgroundColor: '#1E1E1E',
      padding: '20px',
      borderRadius: '8px',
      width: '90%',
      maxWidth: '500px'
    }}>
      <h2 style={{ marginBottom: '20px' }}>Add New Release</h2>
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '15px' }}>
          <label>
            Title:
            <input
              type="text"
              value={formData.title}
              onChange={e => setFormData(prev => ({ ...prev, title: e.target.value }))}
              style={{
                width: '100%',
                padding: '8px',
                backgroundColor: '#333',
                border: 'none',
                borderRadius: '4px',
                color: 'white'
              }}
            />
          </label>
        </div>
        <div style={{ marginBottom: '15px' }}>
          <label>
            Artist:
            <input
              type="text"
              value={formData.artist}
              onChange={e => setFormData(prev => ({ ...prev, artist: e.target.value }))}
              style={{
                width: '100%',
                padding: '8px',
                backgroundColor: '#333',
                border: 'none',
                borderRadius: '4px',
                color: 'white'
              }}
            />
          </label>
        </div>
        <div style={{ marginBottom: '15px' }}>
          <label>
            Genre:
            <input
              type="text"
              value={formData.genre}
              onChange={e => setFormData(prev => ({ ...prev, genre: e.target.value }))}
              style={{
                width: '100%',
                padding: '8px',
                backgroundColor: '#333',
                border: 'none',
                borderRadius: '4px',
                color: 'white'
              }}
            />
          </label>
        </div>
        <div style={{ marginBottom: '15px' }}>
          <label>
            Release Date:
            <input
              type="date"
              value={formData.releaseDate}
              onChange={e => setFormData(prev => ({ ...prev, releaseDate: e.target.value }))}
              style={{
                width: '100%',
                padding: '8px',
                backgroundColor: '#333',
                border: 'none',
                borderRadius: '4px',
                color: 'white'
              }}
            />
          </label>
        </div>
        <div style={{ marginBottom: '15px' }}>
          <label>
            Plik muzyczny:
            <input
              type="file"
              accept="audio/*"
              onChange={e => {
                if (e.target.files && e.target.files[0]) setAudioFile(e.target.files[0]);
              }}
              style={{ display: 'block', marginTop: '8px', color: 'white' }}
            />
          </label>
          {audioFile && <span style={{ color: 'white' }}>Wybrano: {audioFile.name}</span>}
        </div>
        <div style={{ marginBottom: '15px' }}>
          <label>
            Cover Art:
            <input
              type="file"
              accept="image/*"
              onChange={e => {
                if (e.target.files && e.target.files[0]) setCoverFile(e.target.files[0]);
              }}
              style={{ display: 'block', marginTop: '8px', color: 'white' }}
            />
          </label>
          {coverFile && <span style={{ color: 'white' }}>Wybrano: {coverFile.name}</span>}
        </div>
        <div style={{ marginBottom: '15px' }}>
          <h3>Splits</h3>
          {formData.splits.map((split, index) => (
            <div key={index} style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
              <input
                placeholder="Name"
                value={split.name}
                onChange={e => {
                  const newSplits = [...formData.splits];
                  newSplits[index].name = e.target.value;
                  setFormData(prev => ({ ...prev, splits: newSplits }));
                }}
                style={{
                  flex: 2,
                  padding: '8px',
                  backgroundColor: '#333',
                  border: 'none',
                  borderRadius: '4px',
                  color: 'white'
                }}
              />
              <input
                placeholder="Share %"
                value={split.share}
                onChange={e => {
                  const newSplits = [...formData.splits];
                  newSplits[index].share = e.target.value;
                  setFormData(prev => ({ ...prev, splits: newSplits }));
                }}
                style={{
                  flex: 1,
                  padding: '8px',
                  backgroundColor: '#333',
                  border: 'none',
                  borderRadius: '4px',
                  color: 'white'
                }}
              />
            </div>
          ))}
          <button
            type="button"
            onClick={addSplit}
            style={{
              backgroundColor: '#2196F3',
              color: 'white',
              padding: '5px 10px',
              border: 'none',
              borderRadius: '4px',
              marginTop: '10px'
            }}
          >
            Add Split
          </button>
        </div>
        <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
          <button
            type="button"
            onClick={onClose}
            style={{
              backgroundColor: '#666',
              color: 'white',
              padding: '10px 20px',
              border: 'none',
              borderRadius: '4px'
            }}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={uploading}
            style={{
              backgroundColor: uploading ? '#888' : '#4CAF50',
              color: 'white',
              padding: '10px 20px',
              border: 'none',
              borderRadius: '4px'
            }}
          >
            {uploading ? 'Uploading...' : 'Create Release'}
          </button>
        </div>
      </form>
    </div>
  );
};
