import { useState } from 'react';
import BookForm from '../../../components/publishing/BookForm';
import { useAppStore } from '../../../store/appStore';

export default function PublishingDashboard() {
  const [showBookForm, setShowBookForm] = useState(false);
  const books = useAppStore(state => state.publishing.books);
  const tasks = useAppStore(state => state.publishing.tasks);

  return (
    <div className="p-6 min-h-screen bg-gray-100">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Publishing Dashboard</h1>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-medium text-gray-900">Total Books</h3>
          <p className="text-3xl font-bold text-blue-600">{books.length}</p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-medium text-gray-900">Active Tasks</h3>
          <p className="text-3xl font-bold text-yellow-600">{tasks.filter(t => !t.completed).length}</p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-medium text-gray-900">Completed Tasks</h3>
          <p className="text-3xl font-bold text-green-600">{tasks.filter(t => t.completed).length}</p>
        </div>
      </div>

      {/* Add Book Button */}
      <div className="mb-6">
        <button 
          onClick={() => setShowBookForm(true)}
          className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
        >
          Add New Book
        </button>
      </div>

      {/* Book Form Modal */}
      {showBookForm && (
        <BookForm onClose={() => setShowBookForm(false)} />
      )}

      {/* Recent Books */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Recent Books</h2>
        {books.length === 0 ? (
          <p className="text-gray-500">No books yet. Create your first book!</p>
        ) : (
          <div className="space-y-4">
            {books.slice(0, 5).map(book => (
              <div key={book.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
                <h3 className="font-medium text-gray-900">{book.title}</h3>
                <p className="text-gray-600">by {book.author}</p>
                <p className="text-sm text-gray-500 mt-2">Status: <span className="capitalize">{book.status}</span></p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
