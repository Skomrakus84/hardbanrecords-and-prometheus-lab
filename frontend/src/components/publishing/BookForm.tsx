import React, { useState } from 'react';
import { useAppStore } from '../../store/appStore';
import { uploadFileToS3 } from '../../api/client';

interface BookFormProps {
  onClose: () => void;
}

const BookForm: React.FC<BookFormProps> = ({ onClose }) => {
  const addBook = useAppStore(state => state.addBook);
  const [formData, setFormData] = useState({
    title: '',
    author: '',
    genre: '',
    blurb: '',
    keywords: '',
    coverImageUrl: '',
    splits: [{ name: '', share: '' }],
    chapters: [{ title: '', content: '' }],
    rights: { territorial: false, translation: false, adaptation: false, drm: false }
  });
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [illustrationFiles, setIllustrationFiles] = useState<File[]>([]);
  const [illustrations, setIllustrations] = useState<{ url: string; prompt: string }[]>([]);
  const [uploading, setUploading] = useState(false);
  const [currentPrompt, setCurrentPrompt] = useState('');
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Walidacja
    const newErrors: { [key: string]: string } = {};
    if (!formData.title.trim()) newErrors.title = 'Tytuł jest wymagany.';
    if (!formData.author.trim()) newErrors.author = 'Autor jest wymagany.';
    if (!formData.genre.trim()) newErrors.genre = 'Gatunek jest wymagany.';
    if (!coverFile && !formData.coverImageUrl) newErrors.cover = 'Okładka jest wymagana.';
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    setErrors({});
    setUploading(true);
    let coverImageUrl = formData.coverImageUrl;
    try {
      if (coverFile) {
        const { fileUrl } = await uploadFileToS3(coverFile);
        coverImageUrl = fileUrl;
      }
      // Upload all illustration files
      const uploadedIllustrations: { url: string; prompt: string }[] = [];
      for (let i = 0; i < illustrationFiles.length; i++) {
        const file = illustrationFiles[i];
        if (file) {
          const { fileUrl } = await uploadFileToS3(file);
          uploadedIllustrations.push({ url: fileUrl, prompt: currentPrompt || '' });
        }
      }
      await addBook({
        ...formData,
        coverImageUrl,
        status: 'Draft',
        illustrations: [...illustrations, ...uploadedIllustrations]
      });
      setUploading(false);
      onClose();
    } catch (err) {
      alert('Błąd uploadu pliku.');
      setUploading(false);
    }
  };

  return (
    <div style={{ background: '#222', padding: 24, borderRadius: 8, maxWidth: 600, margin: '0 auto' }}>
      <h2 style={{ color: 'white' }}>Dodaj książkę</h2>
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: 12 }}>
          <label style={{ color: 'white' }}>Tytuł:
            <input type="text" value={formData.title} onChange={e => setFormData(f => ({ ...f, title: e.target.value }))} style={{ width: '100%' }} />
          </label>
          {errors.title && <div style={{ color: 'red', fontSize: 13 }}>{errors.title}</div>}
        </div>
        <div style={{ marginBottom: 12 }}>
          <label style={{ color: 'white' }}>Autor:
            <input type="text" value={formData.author} onChange={e => setFormData(f => ({ ...f, author: e.target.value }))} style={{ width: '100%' }} />
          </label>
          {errors.author && <div style={{ color: 'red', fontSize: 13 }}>{errors.author}</div>}
        </div>
        <div style={{ marginBottom: 12 }}>
          <label style={{ color: 'white' }}>Gatunek:
            <input type="text" value={formData.genre} onChange={e => setFormData(f => ({ ...f, genre: e.target.value }))} style={{ width: '100%' }} />
          </label>
          {errors.genre && <div style={{ color: 'red', fontSize: 13 }}>{errors.genre}</div>}
        </div>
        <div style={{ marginBottom: 12 }}>
          <label style={{ color: 'white' }}>Blurb:
            <textarea value={formData.blurb} onChange={e => setFormData(f => ({ ...f, blurb: e.target.value }))} style={{ width: '100%' }} />
          </label>
        </div>
        <div style={{ marginBottom: 12 }}>
          <label style={{ color: 'white' }}>Słowa kluczowe:
            <input type="text" value={formData.keywords} onChange={e => setFormData(f => ({ ...f, keywords: e.target.value }))} style={{ width: '100%' }} />
          </label>
        </div>
        <div style={{ marginBottom: 12 }}>
          <label style={{ color: 'white' }}>Okładka:
            <input type="file" accept="image/*" onChange={e => { if (e.target.files && e.target.files[0]) setCoverFile(e.target.files[0]); }} />
          </label>
          {coverFile && <span style={{ color: 'white' }}>Wybrano: {coverFile.name}</span>}
          {errors.cover && <div style={{ color: 'red', fontSize: 13 }}>{errors.cover}</div>}
        </div>
        <div style={{ marginBottom: 12 }}>
          <label style={{ color: 'white' }}>Ilustracje:
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={e => {
                if (e.target.files) {
                  setIllustrationFiles(Array.from(e.target.files));
                }
              }}
            />
          </label>
          <input
            type="text"
            placeholder="Prompt (opis ilustracji) - opcjonalnie dla wszystkich"
            value={currentPrompt}
            onChange={e => setCurrentPrompt(e.target.value)}
            style={{ width: '100%', marginTop: 8 }}
          />
          {illustrationFiles.length > 0 && (
            <ul style={{ color: 'white', marginTop: 8 }}>
              {illustrationFiles.map((file, idx) => (
                <li key={idx} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  {file.name}
                  <button type="button" style={{ marginLeft: 8 }} onClick={() => setIllustrationFiles(files => files.filter((_, i) => i !== idx))}>Usuń</button>
                </li>
              ))}
            </ul>
          )}
          {illustrations.length > 0 && (
            <ul style={{ color: 'white', marginTop: 8 }}>
              {illustrations.map((ill, idx) => (
                <li key={idx} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <img src={ill.url} alt="ilustracja" style={{ height: 40, marginRight: 8, verticalAlign: 'middle' }} />
                  {ill.prompt && <span style={{ fontStyle: 'italic', marginLeft: 8 }}>{ill.prompt}</span>}
                  <button type="button" style={{ marginLeft: 8 }} onClick={() => setIllustrations(ills => ills.filter((_, i) => i !== idx))}>Usuń</button>
                </li>
              ))}
            </ul>
          )}
        </div>
        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
          <button type="button" onClick={onClose} style={{ background: '#666', color: 'white', padding: '10px 20px', border: 'none', borderRadius: 4 }}>Anuluj</button>
          <button type="submit" disabled={uploading} style={{ background: uploading ? '#888' : '#4CAF50', color: 'white', padding: '10px 20px', border: 'none', borderRadius: 4 }}>{uploading ? 'Wysyłanie...' : 'Dodaj książkę'}</button>
        </div>
      </form>
    </div>
  );
};

export default BookForm;
