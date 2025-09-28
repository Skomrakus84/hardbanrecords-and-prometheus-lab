import React, { useState, useEffect } from 'react';
import LibraryBrowser from '../../components/publishing/LibraryBrowser';
import TextEditor from '../../components/publishing/TextEditor';
import ChapterManager from '../../components/publishing/ChapterManager';
import { useNavigate } from 'react-router-dom';

interface Book {
  id: string;
  title: string;
  author: string;
  genre: string;
  status: 'draft' | 'review' | 'published' | 'archived';
  publishDate: string;
  lastEdited: string;
  cover: string;
  chapters: number;
  wordCount: number;
  sales: number;
  revenue: number;
  rating: number;
  stores: string[];
  isbn?: string;
  description: string;
  tags: string[];
}

interface Chapter {
  id: string;
  title: string;
  content: string;
  wordCount: number;
  order: number;
  status: 'draft' | 'review' | 'final';
  lastEdited: string;
  notes?: string;
}

interface LibraryPageData {
  books: Book[];
  chapters: { [bookId: string]: Chapter[] };
}

const LibraryPage: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [libraryData, setLibraryData] = useState<LibraryPageData | null>(null);
  const [activeView, setActiveView] = useState<'library' | 'editor' | 'chapters'>('library');
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [selectedChapter, setSelectedChapter] = useState<Chapter | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<{
    status?: string;
    genre?: string;
    store?: string;
  }>({});
  const [sortBy, setSortBy] = useState<'title' | 'author' | 'publishDate' | 'sales' | 'revenue' | 'lastEdited'>('lastEdited');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [selectedBooks, setSelectedBooks] = useState<string[]>([]);

  // Sample library data
  const sampleLibraryData: LibraryPageData = {
    books: [
      {
        id: '1',
        title: 'The Digital Nomad\'s Guide',
        author: 'Sarah Johnson',
        genre: 'Business & Entrepreneurship',
        status: 'published',
        publishDate: '2024-03-15',
        lastEdited: '2024-03-20',
        cover: 'https://via.placeholder.com/300x400/3b82f6/ffffff?text=DN',
        chapters: 12,
        wordCount: 45000,
        sales: 1250,
        revenue: 12500,
        rating: 4.8,
        stores: ['Amazon KDP', 'Apple Books', 'Google Books'],
        isbn: '978-1234567890',
        description: 'A comprehensive guide to remote work and digital nomadism in the modern age.',
        tags: ['remote work', 'travel', 'productivity', 'lifestyle']
      },
      {
        id: '2',
        title: 'Mindful Cooking',
        author: 'Chef Maria Rodriguez',
        genre: 'Health & Wellness',
        status: 'review',
        publishDate: '2024-04-10',
        lastEdited: '2024-03-29',
        cover: 'https://via.placeholder.com/300x400/10b981/ffffff?text=MC',
        chapters: 8,
        wordCount: 32000,
        sales: 0,
        revenue: 0,
        rating: 0,
        stores: [],
        description: 'Discover the art of mindful cooking and its impact on well-being.',
        tags: ['cooking', 'mindfulness', 'health', 'recipes']
      },
      {
        id: '3',
        title: 'The AI Revolution',
        author: 'Dr. James Chen',
        genre: 'Technology',
        status: 'draft',
        publishDate: '2024-05-01',
        lastEdited: '2024-03-28',
        cover: 'https://via.placeholder.com/300x400/8b5cf6/ffffff?text=AI',
        chapters: 15,
        wordCount: 67000,
        sales: 0,
        revenue: 0,
        rating: 0,
        stores: [],
        description: 'Exploring the future of artificial intelligence and its societal impact.',
        tags: ['AI', 'technology', 'future', 'automation']
      },
      {
        id: '4',
        title: 'Urban Gardening Secrets',
        author: 'Emma Thompson',
        genre: 'Home & Garden',
        status: 'published',
        publishDate: '2024-02-20',
        lastEdited: '2024-02-25',
        cover: 'https://via.placeholder.com/300x400/059669/ffffff?text=UG',
        chapters: 10,
        wordCount: 28000,
        sales: 850,
        revenue: 6800,
        rating: 4.6,
        stores: ['Amazon KDP', 'Kobo', 'Barnes & Noble'],
        isbn: '978-0987654321',
        description: 'Master the art of growing plants in small urban spaces.',
        tags: ['gardening', 'urban living', 'plants', 'sustainability']
      }
    ],
    chapters: {
      '1': [
        {
          id: 'ch-1-1',
          title: 'Introduction to Digital Nomadism',
          content: '<h1>Introduction to Digital Nomadism</h1><p>Welcome to the world of location independence...</p>',
          wordCount: 3500,
          order: 1,
          status: 'final',
          lastEdited: '2024-03-15',
          notes: 'Complete overview chapter'
        },
        {
          id: 'ch-1-2',
          title: 'Setting Up Your Remote Workspace',
          content: '<h1>Setting Up Your Remote Workspace</h1><p>Creating an effective workspace is crucial...</p>',
          wordCount: 4200,
          order: 2,
          status: 'final',
          lastEdited: '2024-03-16'
        },
        {
          id: 'ch-1-3',
          title: 'Managing Finances on the Road',
          content: '<h1>Managing Finances on the Road</h1><p>Financial planning for nomads requires...</p>',
          wordCount: 3800,
          order: 3,
          status: 'review',
          lastEdited: '2024-03-18'
        }
      ],
      '2': [
        {
          id: 'ch-2-1',
          title: 'The Philosophy of Mindful Cooking',
          content: '<h1>The Philosophy of Mindful Cooking</h1><p>Mindful cooking begins with intention...</p>',
          wordCount: 4000,
          order: 1,
          status: 'draft',
          lastEdited: '2024-03-25'
        },
        {
          id: 'ch-2-2',
          title: 'Selecting Quality Ingredients',
          content: '<h1>Selecting Quality Ingredients</h1><p>The foundation of any great dish...</p>',
          wordCount: 3500,
          order: 2,
          status: 'draft',
          lastEdited: '2024-03-26'
        }
      ]
    }
  };

  useEffect(() => {
    const loadLibraryData = async () => {
      setLoading(true);
      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        setLibraryData(sampleLibraryData);
      } catch (error) {
        console.error('Failed to load library data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadLibraryData();
  }, []);

  const handleBookSelect = (book: Book) => {
    setSelectedBook(book);
    setActiveView('chapters');
  };

  const handleBookEdit = (bookId: string) => {
    const book = libraryData?.books.find(b => b.id === bookId);
    if (book) {
      setSelectedBook(book);
      setActiveView('editor');
    }
  };

  const handleBookDelete = (bookId: string) => {
    if (!libraryData) return;

    if (window.confirm('Are you sure you want to delete this book? This action cannot be undone.')) {
      setLibraryData(prev => {
        if (!prev) return prev;

        return {
          ...prev,
          books: prev.books.filter(book => book.id !== bookId),
          chapters: Object.fromEntries(
            Object.entries(prev.chapters).filter(([id]) => id !== bookId)
          )
        };
      });
    }
  };

  const handleBookPublish = (bookId: string) => {
    console.log(`Publishing book: ${bookId}`);
    // Handle book publishing logic
  };

  const handleChapterCreate = (bookId: string, chapter: Omit<Chapter, 'id' | 'lastEdited'>) => {
    const newChapter: Chapter = {
      ...chapter,
      id: `ch-${bookId}-${Date.now()}`,
      lastEdited: new Date().toISOString()
    };

    setLibraryData(prev => {
      if (!prev) return prev;

      return {
        ...prev,
        chapters: {
          ...prev.chapters,
          [bookId]: [...(prev.chapters[bookId] || []), newChapter]
        },
        books: prev.books.map(book =>
          book.id === bookId
            ? { ...book, chapters: book.chapters + 1, lastEdited: new Date().toISOString() }
            : book
        )
      };
    });
  };

  const handleChapterUpdate = (bookId: string, chapterId: string, updates: Partial<Chapter>) => {
    setLibraryData(prev => {
      if (!prev) return prev;

      return {
        ...prev,
        chapters: {
          ...prev.chapters,
          [bookId]: prev.chapters[bookId]?.map(chapter =>
            chapter.id === chapterId
              ? { ...chapter, ...updates, lastEdited: new Date().toISOString() }
              : chapter
          ) || []
        },
        books: prev.books.map(book =>
          book.id === bookId
            ? { ...book, lastEdited: new Date().toISOString() }
            : book
        )
      };
    });
  };

  const handleChapterDelete = (bookId: string, chapterId: string) => {
    setLibraryData(prev => {
      if (!prev) return prev;

      return {
        ...prev,
        chapters: {
          ...prev.chapters,
          [bookId]: prev.chapters[bookId]?.filter(chapter => chapter.id !== chapterId) || []
        },
        books: prev.books.map(book =>
          book.id === bookId
            ? { ...book, chapters: Math.max(0, book.chapters - 1), lastEdited: new Date().toISOString() }
            : book
        )
      };
    });
  };

  const handleChapterReorder = (bookId: string, chapters: Chapter[]) => {
    setLibraryData(prev => {
      if (!prev) return prev;

      return {
        ...prev,
        chapters: {
          ...prev.chapters,
          [bookId]: chapters
        }
      };
    });
  };

  const handleChapterSelect = (chapter: Chapter) => {
    setSelectedChapter(chapter);
    setActiveView('editor');
  };

  const handleContentSave = (content: string) => {
    if (selectedChapter && selectedBook) {
      const wordCount = content.replace(/<[^>]*>/g, '').split(' ').filter(word => word.length > 0).length;

      handleChapterUpdate(selectedBook.id, selectedChapter.id, {
        content,
        wordCount
      });

      setSelectedChapter(prev => prev ? { ...prev, content, wordCount } : prev);
    }
  };

  const handleSortChange = (newSortBy: string, newSortOrder: 'asc' | 'desc') => {
    setSortBy(newSortBy as 'title' | 'author' | 'publishDate' | 'sales' | 'revenue' | 'lastEdited');
    setSortOrder(newSortOrder);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">📚</div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Loading Library...</h2>
          <p className="text-gray-600">Please wait while we load your digital library.</p>
        </div>
      </div>
    );
  }

  if (!libraryData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">❌</div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Failed to Load Library</h2>
          <p className="text-gray-600 mb-4">There was an error loading your library data.</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const renderContent = () => {
    switch (activeView) {
      case 'editor':
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => setActiveView(selectedBook ? 'chapters' : 'library')}
                  className="text-blue-600 hover:text-blue-800 font-medium"
                >
                  ← Back to {selectedBook ? 'Chapters' : 'Library'}
                </button>
                {selectedChapter && (
                  <div>
                    <h1 className="text-2xl font-bold text-gray-900">{selectedChapter.title}</h1>
                    <p className="text-gray-600">
                      {selectedBook?.title} • Chapter {selectedChapter.order}
                    </p>
                  </div>
                )}
              </div>
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => navigate('/publishing/dashboard')}
                  className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-2 px-4 rounded-lg transition-colors"
                >
                  📊 Dashboard
                </button>
                <button
                  onClick={() => navigate('/publishing/sales')}
                  className="bg-green-100 hover:bg-green-200 text-green-700 font-medium py-2 px-4 rounded-lg transition-colors"
                >
                  💰 Sales
                </button>
              </div>
            </div>

            {selectedChapter && (
              <TextEditor
                content={selectedChapter.content}
                onChange={(content) => setSelectedChapter(prev => prev ? { ...prev, content } : prev)}
                onSave={handleContentSave}
                autoSave={true}
                showFormatting={true}
                placeholder={`Start writing "${selectedChapter.title}"...`}
              />
            )}
          </div>
        );

      case 'chapters':
        return selectedBook ? (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => setActiveView('library')}
                  className="text-blue-600 hover:text-blue-800 font-medium"
                >
                  ← Back to Library
                </button>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">{selectedBook.title}</h1>
                  <p className="text-gray-600">by {selectedBook.author}</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => navigate('/publishing/dashboard')}
                  className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-2 px-4 rounded-lg transition-colors"
                >
                  📊 Dashboard
                </button>
                <button
                  onClick={() => navigate('/publishing/sales')}
                  className="bg-green-100 hover:bg-green-200 text-green-700 font-medium py-2 px-4 rounded-lg transition-colors"
                >
                  💰 Sales
                </button>
              </div>
            </div>

            <ChapterManager
              chapters={libraryData.chapters[selectedBook.id] || []}
              onChapterCreate={(chapter) => handleChapterCreate(selectedBook.id, chapter)}
              onChapterUpdate={(chapterId, updates) => handleChapterUpdate(selectedBook.id, chapterId, updates)}
              onChapterDelete={(chapterId) => handleChapterDelete(selectedBook.id, chapterId)}
              onChapterReorder={(chapters) => handleChapterReorder(selectedBook.id, chapters)}
              onChapterSelect={handleChapterSelect}
              selectedChapterId={selectedChapter?.id}
              bookTitle={selectedBook.title}
              totalWordCount={selectedBook.wordCount}
            />
          </div>
        ) : null;

      default:
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Digital Library</h1>
                <p className="text-gray-600 mt-1">Manage your books and publications</p>
              </div>
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => navigate('/publishing/dashboard')}
                  className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-2 px-4 rounded-lg transition-colors"
                >
                  📊 Dashboard
                </button>
                <button
                  onClick={() => navigate('/publishing/sales')}
                  className="bg-green-100 hover:bg-green-200 text-green-700 font-medium py-2 px-4 rounded-lg transition-colors"
                >
                  💰 Sales
                </button>
                <button
                  onClick={() => navigate('/publishing/books/new')}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                >
                  📝 New Book
                </button>
              </div>
            </div>

            <LibraryBrowser
              books={libraryData.books}
              viewMode={viewMode}
              onViewModeChange={setViewMode}
              onBookSelect={handleBookSelect}
              onBookEdit={handleBookEdit}
              onBookDelete={handleBookDelete}
              onBookPublish={handleBookPublish}
              selectedBooks={selectedBooks}
              onBooksSelect={setSelectedBooks}
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              filters={filters}
              onFiltersChange={setFilters}
              sortBy={sortBy}
              sortOrder={sortOrder}
              onSortChange={handleSortChange}
            />
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {renderContent()}
      </div>
    </div>
  );
};

export default LibraryPage;
