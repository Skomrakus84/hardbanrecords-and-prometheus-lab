import React, { useState } from 'react';
import { useAppStore, BookChapter, AppState } from '../../store/appStore';
import ChapterEditForm from '../../components/publishing/ChapterEditForm';

interface ChaptersPageProps {
  bookId: number;
  onBack: () => void;
}

const ChaptersPage: React.FC<ChaptersPageProps> = ({ bookId, onBack }: ChaptersPageProps) => {
  const book = useAppStore((state: AppState) => state.publishing.books.find((b: { id: number }) => b.id === bookId));
  const updateChapterContent = useAppStore((state: any) => state.updateChapterContent);
  const addChapter = useAppStore((state: any) => state.addChapter);
  const replaceBookChapters = useAppStore((state: any) => state.replaceBookChapters);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  if (!book) return <div style={{ color: 'white' }}>Nie znaleziono książki.</div>;

  return (
    <div style={{ padding: 32 }}>
      <h2 style={{ color: 'white' }}>Rozdziały książki: {book.title}</h2>
      <button onClick={onBack} style={{ marginBottom: 24, background: '#666', color: 'white', padding: '10px 20px', border: 'none', borderRadius: 4 }}>Powrót</button>
      <ul style={{ color: 'white', marginBottom: 24 }}>
        {book.chapters.map((chapter: BookChapter, idx: number) => (
          <li key={idx} style={{ marginBottom: 16 }}>
            <strong>{chapter.title || `Rozdział ${idx + 1}`}</strong>
            <button style={{ marginLeft: 16 }} onClick={() => setEditingIndex(idx)}>Edytuj</button>
            <button style={{ marginLeft: 8, color: 'red' }} onClick={() => {
              const updatedChapters = book.chapters.filter((_: BookChapter, i: number) => i !== idx);
              replaceBookChapters(bookId, updatedChapters);
            }}>Usuń</button>
            {chapter.imageUrl && <img src={chapter.imageUrl} alt="obraz" style={{ height: 32, marginLeft: 8, verticalAlign: 'middle' }} />}
            {chapter.audioUrl && <span style={{ marginLeft: 8 }}>[audio]</span>}
            {chapter.fileUrl && <span style={{ marginLeft: 8 }}>[plik]</span>}
          </li>
        ))}
      </ul>
      <button onClick={() => addChapter(bookId)} style={{ background: '#2196F3', color: 'white', padding: '8px 16px', border: 'none', borderRadius: 4, marginBottom: 24 }}>Dodaj rozdział</button>
      {editingIndex !== null && (
        <ChapterEditForm
          chapter={book.chapters[editingIndex]!}
          onSave={async (updated: BookChapter) => {
            await updateChapterContent(bookId, editingIndex, updated.content);
            // Dodatkowo zaktualizuj pliki (imageUrl, audioUrl, fileUrl)
            const updatedChapters = book.chapters.map((ch: BookChapter, i: number) => i === editingIndex ? { ...updated } : ch);
            useAppStore.getState().replaceBookChapters(bookId, updatedChapters);
            setEditingIndex(null);
          }}
          onCancel={() => setEditingIndex(null)}
        />
      )}
    </div>
  );
};

export default ChaptersPage;
