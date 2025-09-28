import React, { useState } from 'react';

interface Chapter {
  id: string;
  title: string;
  wordCount: number;
  status: 'draft' | 'complete' | 'review';
  lastEdited: string;
  content?: string;
}

interface Book {
  id: string;
  title: string;
  author: string;
  genre: string;
  status: 'draft' | 'writing' | 'editing' | 'published';
  progress: number;
  wordCount: number;
  targetWordCount: number;
  chapters: Chapter[];
  publishedAt?: string;
  description: string;
  cover: string;
  tags: string[];
  language: string;
  publishingPlatforms: string[];
}

const BooksPageNew: React.FC = () => {
  const [selectedTab, setSelectedTab] = useState<'all' | 'draft' | 'writing' | 'editing' | 'published'>('all');
  const [showBookModal, setShowBookModal] = useState(false);
  const [showChapterModal, setShowChapterModal] = useState(false);
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const books: Book[] = [
    {
      id: '1',
      title: 'Digital Music Production Mastery',
      author: 'Alex Chen',
      genre: 'Technology',
      status: 'published',
      progress: 100,
      wordCount: 85420,
      targetWordCount: 85000,
      publishedAt: '2024-01-15',
      description: 'A comprehensive guide to modern digital audio workstations and production techniques.',
      cover: '🎵',
      tags: ['Music', 'Technology', 'Production', 'DAW'],
      language: 'English',
      publishingPlatforms: ['Amazon KDP', 'Apple Books', 'Google Play Books'],
      chapters: [
        { id: '1-1', title: 'Introduction to Digital Audio', wordCount: 3250, status: 'complete', lastEdited: '2024-01-10' },
        { id: '1-2', title: 'Setting Up Your Studio', wordCount: 4120, status: 'complete', lastEdited: '2024-01-10' },
        { id: '1-3', title: 'DAW Fundamentals', wordCount: 5680, status: 'complete', lastEdited: '2024-01-12' },
        { id: '1-4', title: 'Recording Techniques', wordCount: 6420, status: 'complete', lastEdited: '2024-01-13' },
        { id: '1-5', title: 'Mixing and Mastering', wordCount: 7850, status: 'complete', lastEdited: '2024-01-14' }
      ]
    },
    {
      id: '2',
      title: 'The Business of Electronic Music',
      author: 'Sarah Johnson',
      genre: 'Business',
      status: 'editing',
      progress: 85,
      wordCount: 68000,
      targetWordCount: 80000,
      description: 'Navigate the complex world of electronic music business, from artist contracts to digital distribution.',
      cover: '💼',
      tags: ['Business', 'Music Industry', 'Contracts', 'Marketing'],
      language: 'English',
      publishingPlatforms: ['Amazon KDP', 'Apple Books'],
      chapters: [
        { id: '2-1', title: 'Music Industry Overview', wordCount: 4500, status: 'complete', lastEdited: '2024-02-15' },
        { id: '2-2', title: 'Artist Development', wordCount: 5200, status: 'complete', lastEdited: '2024-02-18' },
        { id: '2-3', title: 'Contract Negotiations', wordCount: 6800, status: 'review', lastEdited: '2024-02-20' },
        { id: '2-4', title: 'Digital Distribution', wordCount: 5900, status: 'review', lastEdited: '2024-02-22' },
        { id: '2-5', title: 'Marketing Strategies', wordCount: 3200, status: 'draft', lastEdited: '2024-02-25' }
      ]
    },
    {
      id: '3',
      title: 'Songwriting for the Digital Age',
      author: 'Mike Rodriguez',
      genre: 'Music Education',
      status: 'writing',
      progress: 45,
      wordCount: 36000,
      targetWordCount: 80000,
      description: 'Modern songwriting techniques incorporating digital tools and AI assistance.',
      cover: '✍️',
      tags: ['Songwriting', 'Creativity', 'Digital Tools', 'AI'],
      language: 'English',
      publishingPlatforms: [],
      chapters: [
        { id: '3-1', title: 'Fundamentals of Songwriting', wordCount: 4200, status: 'complete', lastEdited: '2024-03-01' },
        { id: '3-2', title: 'Melody and Harmony', wordCount: 3800, status: 'complete', lastEdited: '2024-03-05' },
        { id: '3-3', title: 'Lyric Writing Techniques', wordCount: 4500, status: 'review', lastEdited: '2024-03-08' },
        { id: '3-4', title: 'Digital Collaboration Tools', wordCount: 2100, status: 'draft', lastEdited: '2024-03-10' },
        { id: '3-5', title: 'AI-Assisted Songwriting', wordCount: 1800, status: 'draft', lastEdited: '2024-03-12' }
      ]
    },
    {
      id: '4',
      title: 'Audio Engineering Fundamentals',
      author: 'Emma Wilson',
      genre: 'Technology',
      status: 'draft',
      progress: 15,
      wordCount: 12000,
      targetWordCount: 75000,
      description: 'Essential principles of audio engineering for beginners and intermediate practitioners.',
      cover: '🔧',
      tags: ['Audio Engineering', 'Technology', 'Sound Design', 'Recording'],
      language: 'English',
      publishingPlatforms: [],
      chapters: [
        { id: '4-1', title: 'Sound Theory Basics', wordCount: 3200, status: 'complete', lastEdited: '2024-03-15' },
        { id: '4-2', title: 'Microphone Techniques', wordCount: 2800, status: 'draft', lastEdited: '2024-03-18' },
        { id: '4-3', title: 'Signal Processing', wordCount: 1500, status: 'draft', lastEdited: '2024-03-20' }
      ]
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published': return 'bg-green-100 text-green-800';
      case 'editing': return 'bg-blue-100 text-blue-800';
      case 'writing': return 'bg-yellow-100 text-yellow-800';
      case 'draft': return 'bg-gray-100 text-gray-800';
      case 'complete': return 'bg-green-100 text-green-800';
      case 'review': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'published': return '✅';
      case 'editing': return '✏️';
      case 'writing': return '📝';
      case 'draft': return '📄';
      case 'complete': return '✅';
      case 'review': return '👀';
      default: return '📄';
    }
  };

  const filteredBooks = selectedTab === 'all' ? books : books.filter(book => book.status === selectedTab);

  const formatNumber = (num: number) => {
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const calculateReadingTime = (wordCount: number) => {
    const avgWordsPerMinute = 250;
    const minutes = Math.ceil(wordCount / avgWordsPerMinute);
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return `${hours}h ${remainingMinutes}m`;
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">📚 Books Management</h1>
            <p className="text-gray-600 mt-2">Manage your book manuscripts and publishing pipeline</p>
          </div>
          <div className="flex items-center space-x-3">
            <div className="flex bg-gray-200 rounded-lg p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                  viewMode === 'grid' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600'
                }`}
              >
                📊 Grid
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                  viewMode === 'list' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600'
                }`}
              >
                📋 List
              </button>
            </div>
            <button
              onClick={() => setShowBookModal(true)}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors flex items-center space-x-2"
            >
              <span>➕</span>
              <span>New Book</span>
            </button>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl shadow-lg p-6 text-white">
            <div className="flex items-center justify-between mb-2">
              <div className="text-2xl">📚</div>
              <div className="text-right">
                <p className="text-2xl font-bold">{books.length}</p>
                <p className="text-sm opacity-90">Total Books</p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-xl shadow-lg p-6 text-white">
            <div className="flex items-center justify-between mb-2">
              <div className="text-2xl">✅</div>
              <div className="text-right">
                <p className="text-2xl font-bold">{books.filter(b => b.status === 'published').length}</p>
                <p className="text-sm opacity-90">Published</p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-xl shadow-lg p-6 text-white">
            <div className="flex items-center justify-between mb-2">
              <div className="text-2xl">📝</div>
              <div className="text-right">
                <p className="text-2xl font-bold">{books.filter(b => b.status === 'writing').length}</p>
                <p className="text-sm opacity-90">In Progress</p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl shadow-lg p-6 text-white">
            <div className="flex items-center justify-between mb-2">
              <div className="text-2xl">📊</div>
              <div className="text-right">
                <p className="text-2xl font-bold">{formatNumber(books.reduce((sum, book) => sum + book.wordCount, 0))}</p>
                <p className="text-sm opacity-90">Total Words</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex space-x-1 bg-gray-200 rounded-lg p-1">
          {(['all', 'draft', 'writing', 'editing', 'published'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setSelectedTab(tab)}
              className={`px-4 py-2 rounded-md font-medium text-sm transition-colors ${
                selectedTab === tab
                  ? 'bg-white text-indigo-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {tab === 'all' ? '📁 All Books' :
               `${getStatusIcon(tab)} ${tab.charAt(0).toUpperCase() + tab.slice(1)}`}
            </button>
          ))}
        </div>
      </div>

      {/* Books Grid/List */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredBooks.map((book) => (
            <div
              key={book.id}
              className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden hover:shadow-xl transition-all hover:-translate-y-1 cursor-pointer"
              onClick={() => setSelectedBook(book)}
            >
              {/* Book Header */}
              <div className="p-6 border-b border-gray-100">
                <div className="flex items-start space-x-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-blue-500 rounded-lg flex items-center justify-center text-2xl">
                    {book.cover}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-semibold text-gray-900 truncate">{book.title}</h3>
                    <p className="text-sm text-gray-600">{book.author}</p>
                    <div className="flex items-center space-x-2 mt-2">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(book.status)}`}>
                        {getStatusIcon(book.status)} {book.status.toUpperCase()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="p-6 border-b border-gray-100">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">Progress</span>
                  <span className="text-sm text-gray-600">{book.progress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-indigo-500 to-purple-600 h-2 rounded-full transition-all"
                    style={{ width: `${book.progress}%` }}
                  />
                </div>
                <div className="flex items-center justify-between mt-2 text-sm text-gray-600">
                  <span>{formatNumber(book.wordCount)} words</span>
                  <span>Target: {formatNumber(book.targetWordCount)}</span>
                </div>
              </div>

              {/* Chapter Count & Reading Time */}
              <div className="p-6 border-b border-gray-100">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wider">Chapters</p>
                    <p className="text-lg font-semibold text-gray-900">{book.chapters.length}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wider">Read Time</p>
                    <p className="text-lg font-semibold text-gray-900">{calculateReadingTime(book.wordCount)}</p>
                  </div>
                </div>
              </div>

              {/* Tags & Actions */}
              <div className="p-6">
                <div className="flex flex-wrap gap-1 mb-4">
                  {book.tags.slice(0, 3).map((tag, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-700"
                    >
                      {tag}
                    </span>
                  ))}
                  {book.tags.length > 3 && (
                    <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-700">
                      +{book.tags.length - 3}
                    </span>
                  )}
                </div>

                <div className="flex space-x-2">
                  <button className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium py-2 px-3 rounded-md transition-colors">
                    Edit
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowChapterModal(true);
                    }}
                    className="flex-1 bg-indigo-100 hover:bg-indigo-200 text-indigo-700 text-sm font-medium py-2 px-3 rounded-md transition-colors"
                  >
                    Chapters
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* List View */
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
          <div className="divide-y divide-gray-200">
            {filteredBooks.map((book) => (
              <div
                key={book.id}
                className="p-6 hover:bg-gray-50 transition-colors cursor-pointer"
                onClick={() => setSelectedBook(book)}
              >
                <div className="flex items-center space-x-6">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-blue-500 rounded-lg flex items-center justify-center text-xl">
                    {book.cover}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-3 mb-1">
                      <h3 className="text-lg font-semibold text-gray-900 truncate">{book.title}</h3>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(book.status)}`}>
                        {getStatusIcon(book.status)} {book.status.toUpperCase()}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{book.author} • {book.genre}</p>
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <span>{formatNumber(book.wordCount)} / {formatNumber(book.targetWordCount)} words</span>
                      <span>{book.chapters.length} chapters</span>
                      <span>{calculateReadingTime(book.wordCount)} read</span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <p className="text-lg font-semibold text-gray-900">{book.progress}%</p>
                      <div className="w-20 bg-gray-200 rounded-full h-1.5 mt-1">
                        <div
                          className="bg-gradient-to-r from-indigo-500 to-purple-600 h-1.5 rounded-full"
                          style={{ width: `${book.progress}%` }}
                        />
                      </div>
                    </div>

                    <div className="flex space-x-2">
                      <button className="bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium py-1 px-3 rounded-md transition-colors">
                        Edit
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setShowChapterModal(true);
                        }}
                        className="bg-indigo-100 hover:bg-indigo-200 text-indigo-700 text-sm font-medium py-1 px-3 rounded-md transition-colors"
                      >
                        Chapters
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Book Detail Modal */}
      {selectedBook && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-screen overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900">{selectedBook.title}</h2>
                <button
                  onClick={() => setSelectedBook(null)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  ✕
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Book Overview */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                  <h3 className="text-lg font-medium text-gray-900 mb-3">Description</h3>
                  <p className="text-gray-700 leading-relaxed">{selectedBook.description}</p>

                  <div className="mt-6">
                    <h4 className="text-md font-medium text-gray-900 mb-2">Tags</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedBook.tags.map((tag, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-indigo-100 text-indigo-800"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Author</p>
                    <p className="text-lg text-gray-900">{selectedBook.author}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Genre</p>
                    <p className="text-lg text-gray-900">{selectedBook.genre}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Language</p>
                    <p className="text-lg text-gray-900">{selectedBook.language}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Progress</p>
                    <div className="flex items-center space-x-2">
                      <div className="flex-1 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-gradient-to-r from-indigo-500 to-purple-600 h-2 rounded-full"
                          style={{ width: `${selectedBook.progress}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium text-gray-900">{selectedBook.progress}%</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Chapters List */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Chapters ({selectedBook.chapters.length})</h3>
                <div className="space-y-3">
                  {selectedBook.chapters.map((chapter, index) => (
                    <div
                      key={chapter.id}
                      className="bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="w-8 h-8 bg-indigo-100 text-indigo-700 rounded-full flex items-center justify-center text-sm font-semibold">
                            {index + 1}
                          </div>
                          <div>
                            <h4 className="font-medium text-gray-900">{chapter.title}</h4>
                            <p className="text-sm text-gray-600">
                              {formatNumber(chapter.wordCount)} words • Last edited {new Date(chapter.lastEdited).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(chapter.status)}`}>
                            {getStatusIcon(chapter.status)} {chapter.status}
                          </span>
                          <button className="text-indigo-600 hover:text-indigo-700 text-sm font-medium">
                            Edit
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Publishing Platforms */}
              {selectedBook.publishingPlatforms.length > 0 && (
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Publishing Platforms</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {selectedBook.publishingPlatforms.map((platform, index) => (
                      <div
                        key={index}
                        className="bg-green-50 border border-green-200 rounded-lg p-3 flex items-center space-x-3"
                      >
                        <div className="w-8 h-8 bg-green-100 text-green-700 rounded-full flex items-center justify-center text-sm">
                          ✅
                        </div>
                        <span className="font-medium text-green-800">{platform}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Add Book Modal */}
      {showBookModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-screen overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900">Create New Book</h2>
                <button
                  onClick={() => setShowBookModal(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  ✕
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Book Title</label>
                  <input
                    type="text"
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="Enter book title"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Author Name</label>
                  <input
                    type="text"
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="Author name"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Genre</label>
                  <select className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500">
                    <option value="">Select genre</option>
                    <option value="fiction">Fiction</option>
                    <option value="technology">Technology</option>
                    <option value="business">Business</option>
                    <option value="music">Music</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Language</label>
                  <select className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500">
                    <option value="English">English</option>
                    <option value="Polish">Polish</option>
                    <option value="Spanish">Spanish</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Target Words</label>
                  <input
                    type="number"
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="80000"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  rows={4}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Book description and overview..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tags</label>
                <input
                  type="text"
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="technology, music, business (comma separated)"
                />
              </div>

              <div className="flex space-x-3 pt-4 border-t border-gray-200">
                <button
                  onClick={() => setShowBookModal(false)}
                  className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-2 px-4 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors">
                  Create Book
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Chapter Management Modal */}
      {showChapterModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-3xl w-full max-h-screen overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900">Chapter Management</h2>
                <button
                  onClick={() => setShowChapterModal(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  ✕
                </button>
              </div>
            </div>

            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-medium text-gray-900">Manage Chapters</h3>
                <button className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors flex items-center space-x-2">
                  <span>➕</span>
                  <span>Add Chapter</span>
                </button>
              </div>

              <div className="space-y-3">
                {books[0].chapters.map((chapter, index) => (
                  <div
                    key={chapter.id}
                    className="bg-gray-50 rounded-lg p-4 border border-gray-200 hover:border-gray-300 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="w-8 h-8 bg-indigo-100 text-indigo-700 rounded-full flex items-center justify-center text-sm font-semibold">
                          {index + 1}
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900">{chapter.title}</h4>
                          <p className="text-sm text-gray-600">
                            {formatNumber(chapter.wordCount)} words • {calculateReadingTime(chapter.wordCount)} read
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(chapter.status)}`}>
                          {getStatusIcon(chapter.status)} {chapter.status}
                        </span>
                        <div className="flex space-x-2">
                          <button className="text-indigo-600 hover:text-indigo-700 text-sm font-medium">
                            Edit
                          </button>
                          <button className="text-red-600 hover:text-red-700 text-sm font-medium">
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BooksPageNew;
