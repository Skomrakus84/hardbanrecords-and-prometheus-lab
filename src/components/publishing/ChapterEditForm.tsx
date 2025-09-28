import React, { useState } from 'react';
import { uploadFileToS3 } from '../../api/client';
import { BookChapter } from '../../store/appStore';

interface ChapterEditFormProps {
  chapter: BookChapter;
  onSave: (chapter: BookChapter) => void;
  onCancel: () => void;
}

const ChapterEditForm: React.FC<ChapterEditFormProps> = ({ chapter, onSave, onCancel }) => {
  const [title, setTitle] = useState(chapter.title);
  const [content, setContent] = useState(chapter.content);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [fileFile, setFileFile] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState(chapter.imageUrl || '');
  const [audioUrl, setAudioUrl] = useState(chapter.audioUrl || '');
  const [fileUrl, setFileUrl] = useState(chapter.fileUrl || '');
  const [uploading, setUploading] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const handleUpload = async (file: File, setUrl: (url: string) => void) => {
    setUploading(true);
    try {
      const { fileUrl } = await uploadFileToS3(file);
      setUrl(fileUrl);
    } catch {
      alert('Błąd uploadu pliku.');
    }
    setUploading(false);
  };

  const handleSave = () => {
    const newErrors: { [key: string]: string } = {};
    if (!title.trim()) newErrors.title = 'Tytuł jest wymagany.';
    if (!content.trim()) newErrors.content = 'Treść jest wymagana.';
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    setErrors({});
    onSave({
      title,
      content,
      imageUrl,
      audioUrl,
      fileUrl
    });
  };

  return (
    <div style={{ background: '#222', padding: 24, borderRadius: 8, maxWidth: 600, margin: '0 auto' }}>
      <h3 style={{ color: 'white' }}>Edycja rozdziału</h3>
      <div style={{ marginBottom: 12 }}>
        <label style={{ color: 'white' }}>Tytuł:
          <input type="text" value={title} onChange={e => setTitle(e.target.value)} style={{ width: '100%' }} />
        </label>
        {errors.title && <div style={{ color: 'red', fontSize: 13 }}>{errors.title}</div>}
      </div>
      <div style={{ marginBottom: 12 }}>
        <label style={{ color: 'white' }}>Treść:
          <textarea value={content} onChange={e => setContent(e.target.value)} style={{ width: '100%' }} />
        </label>
        {errors.content && <div style={{ color: 'red', fontSize: 13 }}>{errors.content}</div>}
      </div>
      <div style={{ marginBottom: 12 }}>
        <label style={{ color: 'white' }}>Obraz:
          <input type="file" accept="image/*" onChange={e => setImageFile(e.target.files?.[0] || null)} />
        </label>
        {imageFile && <button type="button" onClick={() => handleUpload(imageFile, setImageUrl)} disabled={uploading}>Wyślij obraz</button>}
        {imageUrl && <img src={imageUrl} alt="obraz" style={{ height: 40, marginLeft: 8, verticalAlign: 'middle' }} />}
      </div>
      <div style={{ marginBottom: 12 }}>
        <label style={{ color: 'white' }}>Audio:
          <input type="file" accept="audio/*" onChange={e => setAudioFile(e.target.files?.[0] || null)} />
        </label>
        {audioFile && <button type="button" onClick={() => handleUpload(audioFile, setAudioUrl)} disabled={uploading}>Wyślij audio</button>}
        {audioUrl && (
          <span style={{ color: 'white', marginLeft: 8 }}>
            Plik audio załadowany
            <audio controls src={audioUrl} style={{ display: 'block', marginTop: 8, maxWidth: 300 }}>
              Twój przeglądarka nie obsługuje odtwarzacza audio.
            </audio>
          </span>
        )}
      </div>
      <div style={{ marginBottom: 12 }}>
        <label style={{ color: 'white' }}>Dowolny plik:
          <input type="file" onChange={e => setFileFile(e.target.files?.[0] || null)} />
        </label>
        {fileFile && <button type="button" onClick={() => handleUpload(fileFile, setFileUrl)} disabled={uploading}>Wyślij plik</button>}
        {fileUrl && (
          <span style={{ color: 'white', marginLeft: 8 }}>
            Plik załadowany
            <div style={{ marginTop: 8 }}>
              {fileUrl.endsWith('.pdf') ? (
                <iframe src={fileUrl} style={{ width: 300, height: 200, border: '1px solid #444', background: '#fff' }} title="Podgląd pliku PDF" />
              ) : (
                <a href={fileUrl} target="_blank" rel="noopener noreferrer" style={{ color: '#90caf9' }}>Pobierz / Otwórz plik</a>
              )}
            </div>
          </span>
        )}
      </div>
      <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
        <button type="button" onClick={onCancel} style={{ background: '#666', color: 'white', padding: '10px 20px', border: 'none', borderRadius: 4 }}>Anuluj</button>
        <button type="button" onClick={handleSave} disabled={uploading} style={{ background: uploading ? '#888' : '#4CAF50', color: 'white', padding: '10px 20px', border: 'none', borderRadius: 4 }}>Zapisz</button>
      </div>
    </div>
  );
};

export default ChapterEditForm;
