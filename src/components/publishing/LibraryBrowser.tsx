import React, { useState } from 'react';

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

interface LibraryBrowserProps {
  books: Book[];
  viewMode: 'grid' | 'list';
  onViewModeChange: (mode: 'grid' | 'list') => void;
  onBookSelect: (book: Book) => void;
  onBookEdit: (bookId: string) => void;
  onBookDelete: (bookId: string) => void;
  onBookPublish: (bookId: string) => void;
  selectedBooks: string[];
  onBooksSelect: (bookIds: string[]) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  filters: {
    status?: string;
    genre?: string;
    store?: string;
  };
  onFiltersChange: (filters: any) => void;
  sortBy: 'title' | 'author' | 'publishDate' | 'sales' | 'revenue' | 'lastEdited';
  sortOrder: 'asc' | 'desc';
  onSortChange: (sortBy: string, sortOrder: 'asc' | 'desc') => void;
}

const LibraryBrowser: React.FC<LibraryBrowserProps> = ({
  books,
  viewMode,
  onViewModeChange,
  onBookSelect,
  onBookEdit,
  onBookDelete,
  onBookPublish,
  selectedBooks,
  onBooksSelect,
  searchQuery,
  onSearchChange,
  filters,
  onFiltersChange,
  sortBy,
  sortOrder,
  onSortChange
}) => {
  const [showFilters, setShowFilters] = useState(false);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published': return 'bg-green-100 text-green-800';
      case 'review': return 'bg-yellow-100 text-yellow-800';
      case 'draft': return 'bg-gray-100 text-gray-800';
      case 'archived': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'published': return '✅';
      case 'review': return '⏳';
      case 'draft': return '📝';
      case 'archived': return '📦';
      default: return '📄';
    }
  };

  const filteredAndSortedBooks = books
    .filter(book => {
      const matchesSearch = searchQuery === '' ||
        book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        book.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
        book.genre.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus = !filters.status || book.status === filters.status;
      const matchesGenre = !filters.genre || book.genre === filters.genre;
      const matchesStore = !filters.store || book.stores.includes(filters.store);

      return matchesSearch && matchesStatus && matchesGenre && matchesStore;
    })
    .sort((a, b) => {
      let aValue, bValue;

      switch (sortBy) {
        case 'title':
          aValue = a.title.toLowerCase();
          bValue = b.title.toLowerCase();
          break;
        case 'author':
          aValue = a.author.toLowerCase();
          bValue = b.author.toLowerCase();
          break;
        case 'publishDate':
          aValue = new Date(a.publishDate).getTime();
          bValue = new Date(b.publishDate).getTime();
          break;
        case 'sales':
          aValue = a.sales;
          bValue = b.sales;
          break;
        case 'revenue':
          aValue = a.revenue;
          bValue = b.revenue;
          break;
        case 'lastEdited':
          aValue = new Date(a.lastEdited).getTime();
          bValue = new Date(b.lastEdited).getTime();
          break;
        default:
          aValue = a.title.toLowerCase();
          bValue = b.title.toLowerCase();
      }

      if (sortOrder === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });

  const handleSelectAll = () => {
    if (selectedBooks.length === filteredAndSortedBooks.length) {
      onBooksSelect([]);
    } else {
      onBooksSelect(filteredAndSortedBooks.map(book => book.id));
    }
  };

  const handleBookSelect = (bookId: string) => {
    if (selectedBooks.includes(bookId)) {
      onBooksSelect(selectedBooks.filter(id => id !== bookId));
    } else {
      onBooksSelect([...selectedBooks, bookId]);
    }
  };

  const uniqueGenres = [...new Set(books.map(book => book.genre))];
  const uniqueStores = [...new Set(books.flatMap(book => book.stores))];

  return (
    <div className="space-y-6">
      {/* Header Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        {/* Search Bar */}
        <div className="relative flex-1 max-w-md">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <span className="text-gray-400 text-lg">🔍</span>
          </div>
          <input
            type="text"
            placeholder="Search books, authors, or genres..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="block w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        {/* View and Filter Controls */}
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              showFilters
                ? 'bg-blue-100 text-blue-700'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            🎛️ Filters
          </button>

          <div className="flex bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => onViewModeChange('grid')}
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                viewMode === 'grid'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              📊 Grid
            </button>
            <button
              onClick={() => onViewModeChange('list')}
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                viewMode === 'list'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              📋 List
            </button>
          </div>
        </div>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
              <select
                value={filters.status || ''}
                onChange={(e) => onFiltersChange({ ...filters, status: e.target.value || undefined })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Statuses</option>
                <option value="published">Published</option>
                <option value="review">In Review</option>
                <option value="draft">Draft</option>
                <option value="archived">Archived</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Genre</label>
              <select
                value={filters.genre || ''}
                onChange={(e) => onFiltersChange({ ...filters, genre: e.target.value || undefined })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Genres</option>
                {uniqueGenres.map(genre => (
                  <option key={genre} value={genre}>{genre}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Store</label>
              <select
                value={filters.store || ''}
                onChange={(e) => onFiltersChange({ ...filters, store: e.target.value || undefined })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Stores</option>
                {uniqueStores.map(store => (
                  <option key={store} value={store}>{store}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Sort By</label>
              <div className="flex space-x-2">
                <select
                  value={sortBy}
                  onChange={(e) => onSortChange(e.target.value, sortOrder)}
                  className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="title">Title</option>
                  <option value="author">Author</option>
                  <option value="publishDate">Publish Date</option>
                  <option value="sales">Sales</option>
                  <option value="revenue">Revenue</option>
                  <option value="lastEdited">Last Edited</option>
                </select>
                <button
                  onClick={() => onSortChange(sortBy, sortOrder === 'asc' ? 'desc' : 'asc')}
                  className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  {sortOrder === 'asc' ? '⬆️' : '⬇️'}
                </button>
              </div>
            </div>
          </div>

          <div className="mt-4 flex justify-end">
            <button
              onClick={() => onFiltersChange({})}
              className="text-sm text-gray-600 hover:text-gray-900"
            >
              Clear all filters
            </button>
          </div>
        </div>
      )}

      {/* Bulk Actions */}
      {selectedBooks.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-blue-700">
              {selectedBooks.length} book{selectedBooks.length !== 1 ? 's' : ''} selected
            </span>
            <div className="flex items-center space-x-3">
              <button className="text-sm text-blue-700 hover:text-blue-900 font-medium">
                📤 Bulk Publish
              </button>
              <button className="text-sm text-blue-700 hover:text-blue-900 font-medium">
                📂 Export
              </button>
              <button className="text-sm text-red-600 hover:text-red-800 font-medium">
                🗑️ Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Results Count */}
      <div className="flex items-center justify-between">
        <span className="text-sm text-gray-600">
          Showing {filteredAndSortedBooks.length} of {books.length} books
        </span>
        {filteredAndSortedBooks.length > 0 && (
          <button
            onClick={handleSelectAll}
            className="text-sm text-blue-600 hover:text-blue-800 font-medium"
          >
            {selectedBooks.length === filteredAndSortedBooks.length ? 'Deselect All' : 'Select All'}
          </button>
        )}
      </div>

      {/* Books Display */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredAndSortedBooks.map(book => (
            <div
              key={book.id}
              className={`bg-white rounded-xl border-2 transition-all cursor-pointer hover:shadow-lg ${
                selectedBooks.includes(book.id)
                  ? 'border-blue-500 shadow-lg'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
              onClick={() => onBookSelect(book)}
            >
              {/* Book Cover */}
              <div className="relative">
                <div className="aspect-[3/4] bg-gradient-to-br from-blue-500 to-purple-600 rounded-t-xl flex items-center justify-center">
                  <span className="text-6xl text-white">📚</span>
                </div>

                {/* Selection Checkbox */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleBookSelect(book.id);
                  }}
                  className={`absolute top-3 left-3 w-6 h-6 rounded border-2 flex items-center justify-center ${
                    selectedBooks.includes(book.id)
                      ? 'bg-blue-500 border-blue-500 text-white'
                      : 'bg-white border-gray-300 hover:border-gray-400'
                  }`}
                >
                  {selectedBooks.includes(book.id) && '✓'}
                </button>

                {/* Status Badge */}
                <div className={`absolute top-3 right-3 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(book.status)}`}>
                  {getStatusIcon(book.status)} {book.status}
                </div>
              </div>

              {/* Book Info */}
              <div className="p-4">
                <h3 className="font-semibold text-gray-900 mb-1 line-clamp-2">{book.title}</h3>
                <p className="text-sm text-gray-600 mb-2">by {book.author}</p>
                <p className="text-xs text-gray-500 mb-3">{book.genre}</p>

                <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-xs text-gray-600">
                    <span>📄 {book.chapters} chapters</span>
                    <span>📝 {book.wordCount.toLocaleString()} words</span>
                  </div>
                  <div className="flex justify-between text-xs text-gray-600">
                    <span>💰 ${book.revenue.toLocaleString()}</span>
                    <span>📊 {book.sales} sales</span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex space-x-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onBookEdit(book.id);
                    }}
                    className="flex-1 bg-blue-100 hover:bg-blue-200 text-blue-700 text-xs font-medium py-2 px-3 rounded-lg transition-colors"
                  >
                    ✏️ Edit
                  </button>
                  {book.status === 'draft' && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onBookPublish(book.id);
                      }}
                      className="flex-1 bg-green-100 hover:bg-green-200 text-green-700 text-xs font-medium py-2 px-3 rounded-lg transition-colors"
                    >
                      📤 Publish
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left">
                    <input
                      type="checkbox"
                      checked={selectedBooks.length === filteredAndSortedBooks.length && filteredAndSortedBooks.length > 0}
                      onChange={handleSelectAll}
                      className="h-4 w-4 text-blue-600 rounded border-gray-300"
                    />
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Book</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Author</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Genre</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sales</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Revenue</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Edited</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredAndSortedBooks.map(book => (
                  <tr
                    key={book.id}
                    className={`hover:bg-gray-50 cursor-pointer ${
                      selectedBooks.includes(book.id) ? 'bg-blue-50' : ''
                    }`}
                    onClick={() => onBookSelect(book)}
                  >
                    <td className="px-6 py-4">
                      <input
                        type="checkbox"
                        checked={selectedBooks.includes(book.id)}
                        onChange={() => handleBookSelect(book.id)}
                        onClick={(e) => e.stopPropagation()}
                        className="h-4 w-4 text-blue-600 rounded border-gray-300"
                      />
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="w-10 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded flex items-center justify-center mr-3">
                          <span className="text-white text-lg">📚</span>
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900">{book.title}</div>
                          <div className="text-sm text-gray-500">{book.chapters} chapters • {book.wordCount.toLocaleString()} words</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">{book.author}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(book.status)}`}>
                        {getStatusIcon(book.status)} {book.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">{book.genre}</td>
                    <td className="px-6 py-4 text-sm text-gray-900">{book.sales.toLocaleString()}</td>
                    <td className="px-6 py-4 text-sm text-gray-900">${book.revenue.toLocaleString()}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {new Date(book.lastEdited).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onBookEdit(book.id);
                          }}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          ✏️ Edit
                        </button>
                        {book.status === 'draft' && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onBookPublish(book.id);
                            }}
                            className="text-green-600 hover:text-green-900"
                          >
                            📤 Publish
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Empty State */}
      {filteredAndSortedBooks.length === 0 && (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">📚</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No books found</h3>
          <p className="text-gray-600 mb-6">
            {searchQuery || Object.values(filters).some(f => f)
              ? 'Try adjusting your search or filters'
              : 'Start by creating your first book'
            }
          </p>
          {!searchQuery && !Object.values(filters).some(f => f) && (
            <button className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors">
              📝 Create Your First Book
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default LibraryBrowser;
