import React, { useState } from 'react';
import ChaptersPage from './ChaptersPage';
import { useAppStore } from '../../store/appStore';
import BookForm from '../../components/publishing/BookForm';


const PublishingPage: React.FC = () => {
  const [showBookForm, setShowBookForm] = useState(false);
  const [editingBookId, setEditingBookId] = useState<number | null>(null);
  const books = useAppStore(state => state.publishing.books);

  if (editingBookId !== null) {
    return <ChaptersPage bookId={editingBookId} onBack={() => setEditingBookId(null)} />;
  }
  return (
    <div style={{ padding: 32 }}>
      <h1 style={{ color: 'white' }}>Publikacje</h1>
      <button
        style={{ marginBottom: 24, background: '#4CAF50', color: 'white', padding: '10px 20px', border: 'none', borderRadius: 4 }}
        onClick={() => setShowBookForm(true)}
      >
        Dodaj książkę
      </button>
      {showBookForm && (
        <BookForm onClose={() => setShowBookForm(false)} />
      )}
      <div style={{ marginTop: 32 }}>
        <h2 style={{ color: 'white' }}>Lista książek</h2>
        <ul>
          {books.map(book => (
            <li key={book.id} style={{ color: 'white', marginBottom: 12 }}>
              <strong>{book.title}</strong> — {book.author} ({book.genre})
              {book.coverImageUrl && (
                <img src={book.coverImageUrl} alt="okładka" style={{ height: 60, marginLeft: 16, verticalAlign: 'middle', borderRadius: 4 }} />
              )}
              <button style={{ marginLeft: 16 }} onClick={() => setEditingBookId(book.id)}>Edytuj rozdziały</button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default PublishingPage;
