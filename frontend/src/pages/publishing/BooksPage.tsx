import React, { useState, useEffect } from 'react';

interface Book {
  id: string;
  title: string;
  author: string;
  genre: string;
  publishDate: string;
  status: 'draft' | 'published' | 'pending_review';
  pages: number;
  price: number;
  salesCount: number;
  revenue: number;
  isbn?: string;
  coverUrl?: string;
}

const BooksPage: React.FC = () => {
  const [books, setBooks] = useState<Book[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);

  useEffect(() => {
    // Mock data - replace with actual API call
    Promise.resolve().then(() => {
      setBooks([
        {
          id: '1',
          title: 'The Complete JavaScript Guide',
          author: 'Michael Chen',
          genre: 'Programming',
          publishDate: '2024-05-15',
          status: 'published',
          pages: 487,
          price: 29.99,
          salesCount: 342,
          revenue: 1025.58,
          isbn: '978-0-123456-78-9'
        },
        {
          id: '2',
          title: 'Python for Beginners',
          author: 'Lisa Williams',
          genre: 'Programming',
          publishDate: '2024-04-20',
          status: 'published',
          pages: 324,
          price: 24.99,
          salesCount: 298,
          revenue: 894.02,
          isbn: '978-0-123456-79-6'
        },
        {
          id: '3',
          title: 'Digital Marketing Mastery',
          author: 'David Brown',
          genre: 'Business',
          publishDate: '2024-06-01',
          status: 'published',
          pages: 256,
          price: 19.99,
          salesCount: 276,
          revenue: 827.24,
          isbn: '978-0-123456-80-2'
        },
        {
          id: '4',
          title: 'Advanced React Patterns',
          author: 'Sarah Kim',
          genre: 'Programming',
          publishDate: '2024-07-10',
          status: 'pending_review',
          pages: 398,
          price: 34.99,
          salesCount: 0,
          revenue: 0,
          isbn: '978-0-123456-81-9'
        }
      ]);
      setIsLoading(false);
    });
  }, []);

  const getStatusBadge = (status: Book['status']) => {
    const statusConfig = {
      draft: { color: 'bg-gray-100 text-gray-800', label: 'Draft' },
      pending_review: { color: 'bg-yellow-100 text-yellow-800', label: 'Pending Review' },
      published: { color: 'bg-green-100 text-green-800', label: 'Published' }
    };

    const config = statusConfig[status];
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
        {config.label}
      </span>
    );
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="books-page">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Books</h2>
          <p className="text-gray-600">Manage your book catalog and track performance</p>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md text-sm font-medium"
        >
          Add New Book
        </button>
      </div>

      {/* Books Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {books.map((book) => (
          <div key={book.id} className="bg-white overflow-hidden shadow rounded-lg hover:shadow-md transition-shadow">
            <div className="p-5">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-medium text-gray-900 truncate">{book.title}</h3>
                {getStatusBadge(book.status)}
              </div>
              
              <p className="text-sm text-gray-500 mb-2">by {book.author}</p>
              <p className="text-sm text-gray-500 mb-3">{book.genre} • {book.pages} pages</p>
              
              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex justify-between">
                  <span>Publish Date:</span>
                  <span>{new Date(book.publishDate).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Price:</span>
                  <span>${book.price.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Sales:</span>
                  <span>{book.salesCount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Revenue:</span>
                  <span>${book.revenue.toFixed(2)}</span>
                </div>
                {book.isbn && (
                  <div className="flex justify-between">
                    <span>ISBN:</span>
                    <span className="text-xs">{book.isbn}</span>
                  </div>
                )}
              </div>

              <div className="mt-4 flex space-x-2">
                <button className="flex-1 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 px-3 py-2 rounded text-sm font-medium">
                  Edit
                </button>
                <button className="flex-1 bg-gray-50 text-gray-700 hover:bg-gray-100 px-3 py-2 rounded text-sm font-medium">
                  View
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add Book Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-2/3 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Add New Book</h3>
              <form className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Title</label>
                    <input type="text" className="mt-1 block w-full border-gray-300 rounded-md shadow-sm" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Author</label>
                    <select className="mt-1 block w-full border-gray-300 rounded-md shadow-sm">
                      <option>Select Author</option>
                      <option>Michael Chen</option>
                      <option>Lisa Williams</option>
                      <option>David Brown</option>
                      <option>Sarah Kim</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Genre</label>
                    <select className="mt-1 block w-full border-gray-300 rounded-md shadow-sm">
                      <option>Select Genre</option>
                      <option>Programming</option>
                      <option>Business</option>
                      <option>Fiction</option>
                      <option>Non-Fiction</option>
                      <option>Science</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Price</label>
                    <input type="number" step="0.01" className="mt-1 block w-full border-gray-300 rounded-md shadow-sm" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Pages</label>
                    <input type="number" className="mt-1 block w-full border-gray-300 rounded-md shadow-sm" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Publish Date</label>
                    <input type="date" className="mt-1 block w-full border-gray-300 rounded-md shadow-sm" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Description</label>
                  <textarea rows={3} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"></textarea>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Cover Image</label>
                  <input type="file" accept="image/*" className="mt-1 block w-full" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Manuscript File</label>
                  <input type="file" accept=".pdf,.doc,.docx" className="mt-1 block w-full" />
                </div>
                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowAddForm(false)}
                    className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded text-sm"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded text-sm"
                  >
                    Create Book
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BooksPage;
