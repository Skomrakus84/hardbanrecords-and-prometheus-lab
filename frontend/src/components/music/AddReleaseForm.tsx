import React, { useState } from 'react';
import { useAppStore } from '../../store/appStore';
import { uploadFileToS3 } from '../../api/client';

interface AddReleaseFormProps {
  onClose: () => void;
}

export const AddReleaseForm = ({ onClose }: AddReleaseFormProps) => {
  const addRelease = useAppStore(state => state.addRelease);
  const [formData, setFormData] = useState({
    title: '',
    artist: '',
    genre: '',
    releaseDate: '',
    splits: [{ name: '', share: '' }],
    coverImageUrl: '',
    audioUrl: ''
  });
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUploading(true);
    try {
      let coverImageUrl = formData.coverImageUrl;
      let audioUrl = formData.audioUrl;
      if (coverFile) {
        const { fileUrl } = await uploadFileToS3(coverFile);
        coverImageUrl = fileUrl;
      }
      if (audioFile) {
        const { fileUrl } = await uploadFileToS3(audioFile);
        audioUrl = fileUrl;
      }
      // Only send the correct fields to backend
      await addRelease({
        title: formData.title,
        artist: formData.artist,
        genre: formData.genre,
        releaseDate: formData.releaseDate,
        splits: formData.splits,
        coverImageUrl,
        audioUrl
      });
      setUploading(false);
      onClose();
    } catch (err) {
      alert('Błąd uploadu pliku.');
      setUploading(false);
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