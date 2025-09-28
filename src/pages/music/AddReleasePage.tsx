import React, { useState } from 'react';
import {
  ArrowLeft,
  Upload,
  Music,
  Calendar,
  Globe,
  Tag,
  Users,
  Clock,
  FileAudio,
  Image,
  Save,
  Send,
  AlertCircle,
  CheckCircle,
  Plus,
  Trash2,
  Play,
  Pause
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface TrackData {
  id: string;
  title: string;
  duration: string;
  audioFile?: File;
  isrc?: string;
  trackNumber: number;
  composer?: string;
  producer?: string;
  featuring?: string;
  explicit: boolean;
}

interface ReleaseFormData {
  // Basic Info
  title: string;
  artist: string;
  primaryArtist: string;
  featuring: string[];
  label: string;
  genre: string;
  subgenres: string[];
  releaseType: 'single' | 'ep' | 'album' | 'compilation';

  // Release Details
  releaseDate: string;
  originalReleaseDate?: string;
  catalogNumber: string;
  upc: string;
  isrc: string;

  // Content
  description: string;
  lyrics: string;
  credits: string;
  coverArt?: File;
  tracks: TrackData[];

  // Distribution
  platforms: string[];
  territories: string[];
  distributionStartDate: string;
  distributionEndDate?: string;

  // Metadata
  language: string;
  explicitContent: boolean;
  tags: string[];
  mood: string[];
  instruments: string[];

  // Rights & Royalties
  copyrightOwner: string;
  publishingRights: string;
  masterRights: string;
  splits: { artist: string; percentage: number }[];

  // Marketing
  presaveEnabled: boolean;
  socialMedia: {
    instagram?: string;
    twitter?: string;
    tiktok?: string;
    youtube?: string;
  };

  // Technical
  audioFormat: string;
  sampleRate: string;
  bitDepth: string;
  mastered: boolean;
  masteredBy?: string;
}

const AddReleasePage: React.FC = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState<ReleaseFormData>({
    title: '',
    artist: '',
    primaryArtist: '',
    featuring: [],
    label: 'HardbanRecords',
    genre: '',
    subgenres: [],
    releaseType: 'single',
    releaseDate: '',
    catalogNumber: '',
    upc: '',
    isrc: '',
    description: '',
    lyrics: '',
    credits: '',
    tracks: [{
      id: '1',
      title: '',
      duration: '',
      trackNumber: 1,
      explicit: false
    }],
    platforms: [],
    territories: ['Global'],
    distributionStartDate: '',
    language: 'en',
    explicitContent: false,
    tags: [],
    mood: [],
    instruments: [],
    copyrightOwner: '',
    publishingRights: '',
    masterRights: '',
    splits: [],
    presaveEnabled: true,
    socialMedia: {},
    audioFormat: 'WAV',
    sampleRate: '44.1 kHz',
    bitDepth: '16-bit',
    mastered: false
  });

  const PLATFORMS = [
    { id: 'spotify', name: 'Spotify', color: '#1DB954' },
    { id: 'apple', name: 'Apple Music', color: '#FA243C' },
    { id: 'youtube', name: 'YouTube Music', color: '#FF0000' },
    { id: 'amazon', name: 'Amazon Music', color: '#FF9900' },
    { id: 'deezer', name: 'Deezer', color: '#FEAA2D' },
    { id: 'tidal', name: 'Tidal', color: '#000000' },
    { id: 'soundcloud', name: 'SoundCloud', color: '#FF5500' },
    { id: 'bandcamp', name: 'Bandcamp', color: '#629AA0' }
  ];

  const GENRES = [
    'Pop', 'Rock', 'Hip-Hop', 'Electronic', 'Jazz', 'Classical',
    'Country', 'R&B', 'Reggae', 'Folk', 'Blues', 'Metal', 'Punk',
    'Alternative', 'House', 'Techno', 'Dubstep', 'Ambient', 'Indie'
  ];

  const MOODS = [
    'Energetic', 'Chill', 'Romantic', 'Melancholic', 'Uplifting',
    'Dark', 'Peaceful', 'Aggressive', 'Dreamy', 'Nostalgic'
  ];

  const TERRITORIES = [
    'Global', 'North America', 'Europe', 'Asia', 'South America',
    'Africa', 'Oceania', 'United States', 'Canada', 'United Kingdom',
    'Germany', 'France', 'Japan', 'Australia'
  ];

  const steps = [
    { number: 1, title: 'Basic Info', icon: Music },
    { number: 2, title: 'Tracks & Audio', icon: FileAudio },
    { number: 3, title: 'Distribution', icon: Globe },
    { number: 4, title: 'Metadata', icon: Tag },
    { number: 5, title: 'Rights & Legal', icon: Users },
    { number: 6, title: 'Review & Submit', icon: Send }
  ];

  const handleInputChange = (field: keyof ReleaseFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const addTrack = () => {
    setFormData(prev => ({
      ...prev,
      tracks: [...prev.tracks, {
        id: Date.now().toString(),
        title: '',
        duration: '',
        trackNumber: prev.tracks.length + 1,
        explicit: false
      }]
    }));
  };

  const removeTrack = (id: string) => {
    setFormData(prev => ({
      ...prev,
      tracks: prev.tracks.filter(track => track.id !== id)
    }));
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsSubmitting(false);
    // Navigate back or show success
    navigate('/music/releases');
  };

  const containerStyle = {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #1DB954 0%, #191414 100%)',
    backgroundImage: 'url("https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=1600&h=900&fit=crop")',
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundAttachment: 'fixed',
    padding: '20px',
    position: 'relative' as const
  };

  const overlayStyle = {
    position: 'absolute' as const,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'linear-gradient(135deg, rgba(29, 185, 84, 0.9) 0%, rgba(25, 20, 20, 0.9) 100%)',
    zIndex: 1
  };

  const contentStyle = {
    position: 'relative' as const,
    zIndex: 2,
    maxWidth: '1200px',
    margin: '0 auto'
  };

  const cardStyle = {
    background: 'rgba(255, 255, 255, 0.1)',
    backdropFilter: 'blur(20px)',
    borderRadius: '24px',
    padding: '40px',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    boxShadow: '0 25px 50px rgba(0, 0, 0, 0.1)',
    color: '#ffffff',
    marginBottom: '24px'
  };

  const inputStyle = {
    width: '100%',
    background: 'rgba(255, 255, 255, 0.1)',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    borderRadius: '12px',
    padding: '12px 16px',
    color: '#ffffff',
    fontSize: '1rem',
    outline: 'none'
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div>
            <h2 style={{ fontSize: '2rem', fontWeight: '700', marginBottom: '32px', color: '#ffffff' }}>
              Basic Information
            </h2>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '24px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', color: '#ffffff', fontWeight: '500' }}>
                  Release Title *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  style={inputStyle}
                  placeholder="Enter release title"
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', color: '#ffffff', fontWeight: '500' }}>
                  Primary Artist *
                </label>
                <input
                  type="text"
                  value={formData.primaryArtist}
                  onChange={(e) => handleInputChange('primaryArtist', e.target.value)}
                  style={inputStyle}
                  placeholder="Primary artist name"
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '24px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', color: '#ffffff', fontWeight: '500' }}>
                  Genre *
                </label>
                <select
                  value={formData.genre}
                  onChange={(e) => handleInputChange('genre', e.target.value)}
                  style={inputStyle}
                >
                  <option value="">Select Genre</option>
                  {GENRES.map(genre => (
                    <option key={genre} value={genre}>{genre}</option>
                  ))}
                </select>
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', color: '#ffffff', fontWeight: '500' }}>
                  Release Type *
                </label>
                <select
                  value={formData.releaseType}
                  onChange={(e) => handleInputChange('releaseType', e.target.value)}
                  style={inputStyle}
                >
                  <option value="single">Single</option>
                  <option value="ep">EP</option>
                  <option value="album">Album</option>
                  <option value="compilation">Compilation</option>
                </select>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '24px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', color: '#ffffff', fontWeight: '500' }}>
                  Release Date *
                </label>
                <input
                  type="date"
                  value={formData.releaseDate}
                  onChange={(e) => handleInputChange('releaseDate', e.target.value)}
                  style={inputStyle}
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', color: '#ffffff', fontWeight: '500' }}>
                  Label
                </label>
                <input
                  type="text"
                  value={formData.label}
                  onChange={(e) => handleInputChange('label', e.target.value)}
                  style={inputStyle}
                  placeholder="Record label"
                />
              </div>
            </div>

            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', marginBottom: '8px', color: '#ffffff', fontWeight: '500' }}>
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                style={{ ...inputStyle, minHeight: '100px', resize: 'vertical' }}
                placeholder="Describe your release..."
              />
            </div>

            {/* Cover Art Upload */}
            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', marginBottom: '8px', color: '#ffffff', fontWeight: '500' }}>
                Cover Art (3000x3000px minimum) *
              </label>
              <div style={{
                border: '2px dashed rgba(255, 255, 255, 0.3)',
                borderRadius: '12px',
                padding: '32px',
                textAlign: 'center',
                cursor: 'pointer',
                transition: 'all 0.3s ease'
              }}>
                <Upload size={32} style={{ margin: '0 auto 16px', color: '#1DB954' }} />
                <p style={{ color: '#ffffff', fontSize: '1.1rem', marginBottom: '8px' }}>
                  Click to upload cover art
                </p>
                <p style={{ color: '#ffffff', opacity: 0.7, fontSize: '0.9rem' }}>
                  JPG, PNG - Minimum 3000x3000px
                </p>
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div>
            <h2 style={{ fontSize: '2rem', fontWeight: '700', marginBottom: '32px', color: '#ffffff' }}>
              Tracks & Audio Files
            </h2>

            {formData.tracks.map((track, index) => (
              <div key={track.id} style={{
                background: 'rgba(255, 255, 255, 0.05)',
                borderRadius: '16px',
                padding: '24px',
                marginBottom: '20px',
                border: '1px solid rgba(255, 255, 255, 0.1)'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                  <h3 style={{ fontSize: '1.3rem', fontWeight: '600', color: '#ffffff' }}>
                    Track {index + 1}
                  </h3>
                  {formData.tracks.length > 1 && (
                    <button
                      onClick={() => removeTrack(track.id)}
                      style={{
                        background: 'rgba(239, 68, 68, 0.2)',
                        border: '1px solid rgba(239, 68, 68, 0.3)',
                        borderRadius: '8px',
                        padding: '8px',
                        color: '#EF4444',
                        cursor: 'pointer'
                      }}
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '20px', marginBottom: '20px' }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: '8px', color: '#ffffff', fontWeight: '500' }}>
                      Track Title *
                    </label>
                    <input
                      type="text"
                      value={track.title}
                      onChange={(e) => {
                        const updatedTracks = formData.tracks.map(t =>
                          t.id === track.id ? { ...t, title: e.target.value } : t
                        );
                        handleInputChange('tracks', updatedTracks);
                      }}
                      style={inputStyle}
                      placeholder="Track title"
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '8px', color: '#ffffff', fontWeight: '500' }}>
                      Duration *
                    </label>
                    <input
                      type="text"
                      value={track.duration}
                      onChange={(e) => {
                        const updatedTracks = formData.tracks.map(t =>
                          t.id === track.id ? { ...t, duration: e.target.value } : t
                        );
                        handleInputChange('tracks', updatedTracks);
                      }}
                      style={inputStyle}
                      placeholder="3:45"
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px', marginBottom: '20px' }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: '8px', color: '#ffffff', fontWeight: '500' }}>
                      Composer
                    </label>
                    <input
                      type="text"
                      value={track.composer || ''}
                      onChange={(e) => {
                        const updatedTracks = formData.tracks.map(t =>
                          t.id === track.id ? { ...t, composer: e.target.value } : t
                        );
                        handleInputChange('tracks', updatedTracks);
                      }}
                      style={inputStyle}
                      placeholder="Composer name"
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '8px', color: '#ffffff', fontWeight: '500' }}>
                      Producer
                    </label>
                    <input
                      type="text"
                      value={track.producer || ''}
                      onChange={(e) => {
                        const updatedTracks = formData.tracks.map(t =>
                          t.id === track.id ? { ...t, producer: e.target.value } : t
                        );
                        handleInputChange('tracks', updatedTracks);
                      }}
                      style={inputStyle}
                      placeholder="Producer name"
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '8px', color: '#ffffff', fontWeight: '500' }}>
                      ISRC Code
                    </label>
                    <input
                      type="text"
                      value={track.isrc || ''}
                      onChange={(e) => {
                        const updatedTracks = formData.tracks.map(t =>
                          t.id === track.id ? { ...t, isrc: e.target.value } : t
                        );
                        handleInputChange('tracks', updatedTracks);
                      }}
                      style={inputStyle}
                      placeholder="ISRC code"
                    />
                  </div>
                </div>

                {/* Audio File Upload */}
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', color: '#ffffff', fontWeight: '500' }}>
                    Audio File *
                  </label>
                  <div style={{
                    border: '2px dashed rgba(255, 255, 255, 0.3)',
                    borderRadius: '12px',
                    padding: '20px',
                    textAlign: 'center',
                    cursor: 'pointer'
                  }}>
                    <FileAudio size={24} style={{ margin: '0 auto 8px', color: '#1DB954' }} />
                    <p style={{ color: '#ffffff', fontSize: '0.9rem' }}>
                      Upload WAV, FLAC, or MP3 (320kbps minimum)
                    </p>
                  </div>
                </div>
              </div>
            ))}

            <button
              onClick={addTrack}
              style={{
                background: 'linear-gradient(135deg, #1DB954 0%, #1ed760 100%)',
                border: 'none',
                borderRadius: '12px',
                padding: '12px 24px',
                color: '#ffffff',
                fontSize: '1rem',
                fontWeight: '600',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                margin: '0 auto'
              }}
            >
              <Plus size={20} />
              Add Another Track
            </button>
          </div>
        );

      case 3:
        return (
          <div>
            <h2 style={{ fontSize: '2rem', fontWeight: '700', marginBottom: '32px', color: '#ffffff' }}>
              Distribution Settings
            </h2>

            <div style={{ marginBottom: '32px' }}>
              <h3 style={{ fontSize: '1.3rem', fontWeight: '600', marginBottom: '16px', color: '#ffffff' }}>
                Streaming Platforms
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
                {PLATFORMS.map(platform => (
                  <label key={platform.id} style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '16px',
                    background: formData.platforms.includes(platform.id)
                      ? `${platform.color}20`
                      : 'rgba(255, 255, 255, 0.05)',
                    borderRadius: '12px',
                    cursor: 'pointer',
                    border: formData.platforms.includes(platform.id)
                      ? `2px solid ${platform.color}`
                      : '2px solid rgba(255, 255, 255, 0.1)',
                    transition: 'all 0.3s ease'
                  }}>
                    <input
                      type="checkbox"
                      checked={formData.platforms.includes(platform.id)}
                      onChange={(e) => {
                        const platforms = e.target.checked
                          ? [...formData.platforms, platform.id]
                          : formData.platforms.filter(p => p !== platform.id);
                        handleInputChange('platforms', platforms);
                      }}
                      style={{ display: 'none' }}
                    />
                    <div style={{
                      width: '12px',
                      height: '12px',
                      borderRadius: '3px',
                      background: formData.platforms.includes(platform.id) ? platform.color : 'rgba(255, 255, 255, 0.3)',
                      border: `2px solid ${formData.platforms.includes(platform.id) ? platform.color : 'rgba(255, 255, 255, 0.3)'}`
                    }}></div>
                    <span style={{ color: '#ffffff', fontWeight: '500' }}>
                      {platform.name}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '24px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', color: '#ffffff', fontWeight: '500' }}>
                  Distribution Start Date *
                </label>
                <input
                  type="date"
                  value={formData.distributionStartDate}
                  onChange={(e) => handleInputChange('distributionStartDate', e.target.value)}
                  style={inputStyle}
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', color: '#ffffff', fontWeight: '500' }}>
                  Distribution End Date (Optional)
                </label>
                <input
                  type="date"
                  value={formData.distributionEndDate || ''}
                  onChange={(e) => handleInputChange('distributionEndDate', e.target.value)}
                  style={inputStyle}
                />
              </div>
            </div>

            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', marginBottom: '8px', color: '#ffffff', fontWeight: '500' }}>
                Territories
              </label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {TERRITORIES.map(territory => (
                  <label key={territory} style={{
                    padding: '8px 16px',
                    background: formData.territories.includes(territory)
                      ? '#1DB954'
                      : 'rgba(255, 255, 255, 0.1)',
                    borderRadius: '20px',
                    cursor: 'pointer',
                    fontSize: '0.9rem',
                    color: '#ffffff',
                    transition: 'all 0.3s ease'
                  }}>
                    <input
                      type="checkbox"
                      checked={formData.territories.includes(territory)}
                      onChange={(e) => {
                        const territories = e.target.checked
                          ? [...formData.territories, territory]
                          : formData.territories.filter(t => t !== territory);
                        handleInputChange('territories', territories);
                      }}
                      style={{ display: 'none' }}
                    />
                    {territory}
                  </label>
                ))}
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div>
            <h2 style={{ fontSize: '2rem', fontWeight: '700', marginBottom: '32px', color: '#ffffff' }}>
              Metadata & Tags
            </h2>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '24px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', color: '#ffffff', fontWeight: '500' }}>
                  Language
                </label>
                <select
                  value={formData.language}
                  onChange={(e) => handleInputChange('language', e.target.value)}
                  style={inputStyle}
                >
                  <option value="en">English</option>
                  <option value="es">Spanish</option>
                  <option value="fr">French</option>
                  <option value="de">German</option>
                  <option value="it">Italian</option>
                  <option value="pt">Portuguese</option>
                  <option value="pl">Polish</option>
                </select>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', paddingTop: '32px' }}>
                <input
                  type="checkbox"
                  checked={formData.explicitContent}
                  onChange={(e) => handleInputChange('explicitContent', e.target.checked)}
                  style={{ width: '20px', height: '20px' }}
                />
                <label style={{ color: '#ffffff', fontWeight: '500' }}>
                  Explicit Content
                </label>
              </div>
            </div>

            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', marginBottom: '8px', color: '#ffffff', fontWeight: '500' }}>
                Mood Tags
              </label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {MOODS.map(mood => (
                  <label key={mood} style={{
                    padding: '8px 16px',
                    background: formData.mood.includes(mood)
                      ? '#1DB954'
                      : 'rgba(255, 255, 255, 0.1)',
                    borderRadius: '20px',
                    cursor: 'pointer',
                    fontSize: '0.9rem',
                    color: '#ffffff',
                    transition: 'all 0.3s ease'
                  }}>
                    <input
                      type="checkbox"
                      checked={formData.mood.includes(mood)}
                      onChange={(e) => {
                        const moods = e.target.checked
                          ? [...formData.mood, mood]
                          : formData.mood.filter(m => m !== mood);
                        handleInputChange('mood', moods);
                      }}
                      style={{ display: 'none' }}
                    />
                    {mood}
                  </label>
                ))}
              </div>
            </div>

            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', marginBottom: '8px', color: '#ffffff', fontWeight: '500' }}>
                Custom Tags
              </label>
              <input
                type="text"
                placeholder="Add custom tags separated by commas"
                style={inputStyle}
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && e.currentTarget.value) {
                    const newTags = e.currentTarget.value.split(',').map(tag => tag.trim());
                    handleInputChange('tags', [...formData.tags, ...newTags]);
                    e.currentTarget.value = '';
                  }
                }}
              />
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '12px' }}>
                {formData.tags.map((tag, index) => (
                  <span key={index} style={{
                    padding: '4px 12px',
                    background: '#1DB954',
                    borderRadius: '16px',
                    fontSize: '0.8rem',
                    color: '#ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}>
                    {tag}
                    <button
                      onClick={() => {
                        const updatedTags = formData.tags.filter((_, i) => i !== index);
                        handleInputChange('tags', updatedTags);
                      }}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: '#ffffff',
                        cursor: 'pointer',
                        padding: '0',
                        fontSize: '12px'
                      }}
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>
          </div>
        );

      case 5:
        return (
          <div>
            <h2 style={{ fontSize: '2rem', fontWeight: '700', marginBottom: '32px', color: '#ffffff' }}>
              Rights & Legal Information
            </h2>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '24px', marginBottom: '24px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', color: '#ffffff', fontWeight: '500' }}>
                  Copyright Owner *
                </label>
                <input
                  type="text"
                  value={formData.copyrightOwner}
                  onChange={(e) => handleInputChange('copyrightOwner', e.target.value)}
                  style={inputStyle}
                  placeholder="Copyright owner name"
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '24px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', color: '#ffffff', fontWeight: '500' }}>
                  Publishing Rights
                </label>
                <input
                  type="text"
                  value={formData.publishingRights}
                  onChange={(e) => handleInputChange('publishingRights', e.target.value)}
                  style={inputStyle}
                  placeholder="Publishing rights holder"
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', color: '#ffffff', fontWeight: '500' }}>
                  Master Rights
                </label>
                <input
                  type="text"
                  value={formData.masterRights}
                  onChange={(e) => handleInputChange('masterRights', e.target.value)}
                  style={inputStyle}
                  placeholder="Master rights holder"
                />
              </div>
            </div>

            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', marginBottom: '16px', color: '#ffffff', fontWeight: '500' }}>
                Royalty Splits
              </label>
              {formData.splits.map((split, index) => (
                <div key={index} style={{
                  display: 'grid',
                  gridTemplateColumns: '2fr 1fr auto',
                  gap: '16px',
                  alignItems: 'center',
                  marginBottom: '12px'
                }}>
                  <input
                    type="text"
                    value={split.artist}
                    onChange={(e) => {
                      const updatedSplits = formData.splits.map((s, i) =>
                        i === index ? { ...s, artist: e.target.value } : s
                      );
                      handleInputChange('splits', updatedSplits);
                    }}
                    style={inputStyle}
                    placeholder="Artist/Contributor name"
                  />
                  <input
                    type="number"
                    value={split.percentage}
                    onChange={(e) => {
                      const updatedSplits = formData.splits.map((s, i) =>
                        i === index ? { ...s, percentage: parseInt(e.target.value) } : s
                      );
                      handleInputChange('splits', updatedSplits);
                    }}
                    style={inputStyle}
                    placeholder="Percentage"
                    min="0"
                    max="100"
                  />
                  <button
                    onClick={() => {
                      const updatedSplits = formData.splits.filter((_, i) => i !== index);
                      handleInputChange('splits', updatedSplits);
                    }}
                    style={{
                      background: 'rgba(239, 68, 68, 0.2)',
                      border: '1px solid rgba(239, 68, 68, 0.3)',
                      borderRadius: '8px',
                      padding: '8px',
                      color: '#EF4444',
                      cursor: 'pointer'
                    }}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
              <button
                onClick={() => {
                  const newSplit = { artist: '', percentage: 0 };
                  handleInputChange('splits', [...formData.splits, newSplit]);
                }}
                style={{
                  background: 'rgba(29, 185, 84, 0.2)',
                  border: '1px solid rgba(29, 185, 84, 0.3)',
                  borderRadius: '12px',
                  padding: '12px 24px',
                  color: '#1DB954',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                <Plus size={16} />
                Add Split
              </button>
            </div>
          </div>
        );

      case 6:
        return (
          <div>
            <h2 style={{ fontSize: '2rem', fontWeight: '700', marginBottom: '32px', color: '#ffffff' }}>
              Review & Submit
            </h2>

            <div style={{
              background: 'rgba(255, 255, 255, 0.05)',
              borderRadius: '16px',
              padding: '32px',
              marginBottom: '32px'
            }}>
              <h3 style={{ fontSize: '1.5rem', fontWeight: '600', marginBottom: '24px', color: '#ffffff' }}>
                Release Summary
              </h3>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                <div>
                  <p><strong>Title:</strong> {formData.title || 'Not specified'}</p>
                  <p><strong>Artist:</strong> {formData.primaryArtist || 'Not specified'}</p>
                  <p><strong>Genre:</strong> {formData.genre || 'Not specified'}</p>
                  <p><strong>Type:</strong> {formData.releaseType}</p>
                  <p><strong>Release Date:</strong> {formData.releaseDate || 'Not specified'}</p>
                </div>
                <div>
                  <p><strong>Tracks:</strong> {formData.tracks.length}</p>
                  <p><strong>Platforms:</strong> {formData.platforms.length}</p>
                  <p><strong>Territories:</strong> {formData.territories.join(', ')}</p>
                  <p><strong>Language:</strong> {formData.language}</p>
                  <p><strong>Explicit:</strong> {formData.explicitContent ? 'Yes' : 'No'}</p>
                </div>
              </div>
            </div>

            <div style={{
              background: 'rgba(245, 158, 11, 0.1)',
              border: '1px solid rgba(245, 158, 11, 0.3)',
              borderRadius: '12px',
              padding: '20px',
              marginBottom: '32px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                <AlertCircle size={20} style={{ color: '#F59E0B' }} />
                <h4 style={{ fontSize: '1.1rem', fontWeight: '600', color: '#F59E0B', margin: 0 }}>
                  Important Notes
                </h4>
              </div>
              <ul style={{ color: '#ffffff', opacity: 0.9, paddingLeft: '20px' }}>
                <li>Review all information carefully before submitting</li>
                <li>Distribution typically takes 24-48 hours to process</li>
                <li>You'll receive email updates on distribution status</li>
                <li>Changes after submission may delay the release</li>
              </ul>
            </div>

            <div style={{ textAlign: 'center' }}>
              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                style={{
                  background: isSubmitting
                    ? 'rgba(107, 114, 128, 0.5)'
                    : 'linear-gradient(135deg, #1DB954 0%, #1ed760 100%)',
                  border: 'none',
                  borderRadius: '12px',
                  padding: '16px 48px',
                  color: '#ffffff',
                  fontSize: '1.1rem',
                  fontWeight: '600',
                  cursor: isSubmitting ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  margin: '0 auto',
                  transition: 'all 0.3s ease'
                }}
              >
                {isSubmitting ? (
                  <>
                    <div style={{
                      width: '20px',
                      height: '20px',
                      border: '2px solid rgba(255, 255, 255, 0.3)',
                      borderTop: '2px solid #ffffff',
                      borderRadius: '50%',
                      animation: 'spin 1s linear infinite'
                    }}></div>
                    Submitting...
                  </>
                ) : (
                  <>
                    <Send size={20} />
                    Submit Release
                  </>
                )}
              </button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div style={containerStyle}>
      <div style={overlayStyle}></div>

      <div style={contentStyle}>
        {/* Header */}
        <div style={cardStyle}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <button
                onClick={() => navigate('/music/releases')}
                style={{
                  background: 'rgba(255, 255, 255, 0.1)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  borderRadius: '12px',
                  padding: '12px',
                  color: '#ffffff',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center'
                }}
              >
                <ArrowLeft size={20} />
              </button>
              <div>
                <h1 style={{ fontSize: '2.5rem', fontWeight: '800', margin: '0', color: '#ffffff' }}>
                  Add New Release
                </h1>
                <p style={{ fontSize: '1.1rem', margin: '4px 0 0 0', opacity: 0.8, color: '#ffffff' }}>
                  Step {currentStep} of {steps.length}: {steps[currentStep - 1].title}
                </p>
              </div>
            </div>
          </div>

          {/* Progress Indicator */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '32px' }}>
            {steps.map((step) => {
              const Icon = step.icon;
              return (
                <div key={step.number} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    background: step.number <= currentStep
                      ? '#1DB954'
                      : 'rgba(255, 255, 255, 0.2)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'all 0.3s ease'
                  }}>
                    <Icon size={16} style={{
                      color: step.number <= currentStep ? '#ffffff' : 'rgba(255, 255, 255, 0.5)'
                    }} />
                  </div>
                  {step.number < steps.length && (
                    <div style={{
                      width: '40px',
                      height: '2px',
                      background: step.number < currentStep
                        ? '#1DB954'
                        : 'rgba(255, 255, 255, 0.2)',
                      transition: 'all 0.3s ease'
                    }}></div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Content */}
        <div style={cardStyle}>
          {renderStepContent()}

          {/* Navigation */}
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '40px' }}>
            <button
              onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
              disabled={currentStep === 1}
              style={{
                background: currentStep === 1
                  ? 'rgba(107, 114, 128, 0.5)'
                  : 'rgba(255, 255, 255, 0.1)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                borderRadius: '12px',
                padding: '12px 24px',
                color: '#ffffff',
                fontSize: '1rem',
                fontWeight: '500',
                cursor: currentStep === 1 ? 'not-allowed' : 'pointer',
                opacity: currentStep === 1 ? 0.5 : 1
              }}
            >
              Previous
            </button>

            {currentStep < steps.length ? (
              <button
                onClick={() => setCurrentStep(currentStep + 1)}
                style={{
                  background: 'linear-gradient(135deg, #1DB954 0%, #1ed760 100%)',
                  border: 'none',
                  borderRadius: '12px',
                  padding: '12px 24px',
                  color: '#ffffff',
                  fontSize: '1rem',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
              >
                Next
              </button>
            ) : null}
          </div>
        </div>
      </div>

      {/* Add keyframes for loading spinner */}
      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}
      </style>
    </div>
  );
};

export default AddReleasePage;
