import React, { useState, useEffect } from 'react';
import { usePublications, useChapters } from '../../hooks/usePublishing';
import { useAuthStore } from '../../store/authStore';
import { Publication, Chapter } from '../../types';

interface PublishingStats {
  totalPublications: number;
  totalChapters: number;
  totalWords: number;
  totalRevenue: number;
}

export const PublishingDashboard: React.FC = () => {
  const { user } = useAuthStore();
  const {
    publications,
    loading: publicationsLoading,
    error: publicationsError,
    fetchPublications,
    createPublication,
    updatePublication,
    deletePublication
  } = usePublications();

  const {
    chapters,
    loading: chaptersLoading,
    error: chaptersError,
    fetchChapters,
    createChapter,
    updateChapter,
    deleteChapter
  } = useChapters();

  const [selectedPublication, setSelectedPublication] = useState<Publication | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showChapterForm, setShowChapterForm] = useState(false);
  const [stats, setStats] = useState<PublishingStats>({
    totalPublications: 0,
    totalChapters: 0,
    totalWords: 0,
    totalRevenue: 0
  });

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    genre: '',
    price: 0,
    cover_image_url: ''
  });

  const [chapterData, setChapterData] = useState({
    title: '',
    content: '',
    order: 1,
    is_free: false
  });

  useEffect(() => {
    if (user) {
      fetchPublications();
    }
  }, [user, fetchPublications]);

  useEffect(() => {
    if (selectedPublication) {
      fetchChapters(selectedPublication.id);
    }
  }, [selectedPublication, fetchChapters]);

  useEffect(() => {
    // Calculate stats
    const totalChapters = chapters.length;
    const totalWords = chapters.reduce((sum, chapter) => sum + (chapter.word_count || 0), 0);
    const totalRevenue = publications.reduce((sum, pub) => sum + (pub.total_revenue || 0), 0);

    setStats({
      totalPublications: publications.length,
      totalChapters,
      totalWords,
      totalRevenue
    });
  }, [publications, chapters]);

  const handleCreatePublication = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createPublication(formData);
      setFormData({ title: '', description: '', genre: '', price: 0, cover_image_url: '' });
      setShowCreateForm(false);
      fetchPublications();
    } catch (error) {
      console.error('Failed to create publication:', error);
    }
  };

  const handleCreateChapter = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPublication) return;

    try {
      await createChapter(selectedPublication.id, chapterData);
      setChapterData({ title: '', content: '', order: 1, is_free: false });
      setShowChapterForm(false);
      fetchChapters(selectedPublication.id);
    } catch (error) {
      console.error('Failed to create chapter:', error);
    }
  };

  const handleDeletePublication = async (id: string) => {
    if (globalThis.window?.confirm('Are you sure you want to delete this publication?')) {
      try {
        await deletePublication(id);
        fetchPublications();
        if (selectedPublication?.id === id) {
          setSelectedPublication(null);
        }
      } catch (error) {
        console.error('Failed to delete publication:', error);
      }
    }
  };

  const handleDeleteChapter = async (chapterId: string) => {
    if (globalThis.window?.confirm('Are you sure you want to delete this chapter?')) {
      try {
        await deleteChapter(chapterId);
        if (selectedPublication) {
          fetchChapters(selectedPublication.id);
        }
      } catch (error) {
        console.error('Failed to delete chapter:', error);
      }
    }
  };

  if (publicationsLoading || chaptersLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-300 rounded w-1/4 mb-8"></div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="bg-white p-6 rounded-lg shadow h-24"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Publishing Dashboard</h1>
          <button
            onClick={() => setShowCreateForm(true)}
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
          >
            New Publication
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Publications</h3>
            <p className="text-3xl font-bold text-indigo-600">{stats.totalPublications}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Chapters</h3>
            <p className="text-3xl font-bold text-green-600">{stats.totalChapters}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Total Words</h3>
            <p className="text-3xl font-bold text-purple-600">{stats.totalWords.toLocaleString()}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Revenue</h3>
            <p className="text-3xl font-bold text-orange-600">${stats.totalRevenue.toFixed(2)}</p>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Publications List */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Publications</h2>
              {publications.length === 0 ? (
                <p className="text-gray-500">No publications yet</p>
              ) : (
                <div className="space-y-3">
                  {publications.map((publication) => (
                    <div
                      key={publication.id}
                      className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                        selectedPublication?.id === publication.id
                          ? 'border-indigo-500 bg-indigo-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => setSelectedPublication(publication)}
                    >
                      <h3 className="font-medium text-gray-900">{publication.title}</h3>
                      <p className="text-sm text-gray-500">{publication.genre}</p>
                      <p className="text-sm font-medium text-green-600">${publication.price}</p>
                      <div className="mt-2 flex justify-end space-x-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeletePublication(publication.id);
                          }}
                          className="text-red-600 hover:text-red-800 text-sm"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Chapters View */}
          <div className="lg:col-span-2">
            {selectedPublication ? (
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold text-gray-900">
                    Chapters - {selectedPublication.title}
                  </h2>
                  <button
                    onClick={() => setShowChapterForm(true)}
                    className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                  >
                    Add Chapter
                  </button>
                </div>
                {chapters.length === 0 ? (
                  <p className="text-gray-500">No chapters yet</p>
                ) : (
                  <div className="space-y-4">
                    {chapters.map((chapter) => (
                      <div key={chapter.id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-medium text-gray-900">{chapter.title}</h3>
                            <p className="text-sm text-gray-500">Order: {chapter.order}</p>
                            <p className="text-sm text-gray-500">
                              Words: {chapter.word_count || 0}
                            </p>
                            {chapter.is_free && (
                              <span className="inline-block bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full mt-1">
                                Free
                              </span>
                            )}
                          </div>
                          <button
                            onClick={() => handleDeleteChapter(chapter.id)}
                            className="text-red-600 hover:text-red-800 text-sm"
                          >
                            Delete
                          </button>
                        </div>
                        <div className="mt-3">
                          <p className="text-sm text-gray-700 line-clamp-3">
                            {chapter.content?.substring(0, 200)}...
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow p-6">
                <div className="text-center py-12">
                  <h2 className="text-xl font-semibold text-gray-900 mb-2">
                    Select a Publication
                  </h2>
                  <p className="text-gray-500">
                    Choose a publication from the left to view and manage its chapters
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Create Publication Modal */}
        {showCreateForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Create New Publication</h2>
              <form onSubmit={handleCreatePublication}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Title
                    </label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Description
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      rows={3}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Genre
                    </label>
                    <input
                      type="text"
                      value={formData.genre}
                      onChange={(e) => setFormData({ ...formData, genre: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Price ($)
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Cover Image URL
                    </label>
                    <input
                      type="url"
                      value={formData.cover_image_url}
                      onChange={(e) => setFormData({ ...formData, cover_image_url: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                  </div>
                </div>
                <div className="mt-6 flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setShowCreateForm(false)}
                    className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                  >
                    Create
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Create Chapter Modal */}
        {showChapterForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-2xl">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Add New Chapter</h2>
              <form onSubmit={handleCreateChapter}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Chapter Title
                    </label>
                    <input
                      type="text"
                      value={chapterData.title}
                      onChange={(e) => setChapterData({ ...chapterData, title: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Content
                    </label>
                    <textarea
                      value={chapterData.content}
                      onChange={(e) => setChapterData({ ...chapterData, content: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      rows={10}
                      required
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Order
                      </label>
                      <input
                        type="number"
                        min="1"
                        value={chapterData.order}
                        onChange={(e) => setChapterData({ ...chapterData, order: parseInt(e.target.value) })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="flex items-center mt-7">
                        <input
                          type="checkbox"
                          checked={chapterData.is_free}
                          onChange={(e) => setChapterData({ ...chapterData, is_free: e.target.checked })}
                          className="mr-2"
                        />
                        <span className="text-sm font-medium text-gray-700">Free Chapter</span>
                      </label>
                    </div>
                  </div>
                </div>
                <div className="mt-6 flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setShowChapterForm(false)}
                    className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    Add Chapter
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PublishingDashboard;
