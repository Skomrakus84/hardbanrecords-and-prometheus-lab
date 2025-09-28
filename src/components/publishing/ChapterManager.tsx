import React, { useState } from 'react';

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

interface ChapterManagerProps {
  chapters: Chapter[];
  onChapterCreate: (chapter: Omit<Chapter, 'id' | 'lastEdited'>) => void;
  onChapterUpdate: (chapterId: string, updates: Partial<Chapter>) => void;
  onChapterDelete: (chapterId: string) => void;
  onChapterReorder: (chapters: Chapter[]) => void;
  onChapterSelect: (chapter: Chapter) => void;
  selectedChapterId?: string;
  bookTitle: string;
  totalWordCount: number;
}

const ChapterManager: React.FC<ChapterManagerProps> = ({
  chapters,
  onChapterCreate,
  onChapterUpdate,
  onChapterDelete,
  onChapterReorder,
  onChapterSelect,
  selectedChapterId,
  bookTitle,
  totalWordCount
}) => {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [draggedChapter, setDraggedChapter] = useState<Chapter | null>(null);
  const [newChapterTitle, setNewChapterTitle] = useState('');
  const [editingChapterId, setEditingChapterId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState('');

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'final': return 'bg-green-100 text-green-800';
      case 'review': return 'bg-yellow-100 text-yellow-800';
      case 'draft': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'final': return '✅';
      case 'review': return '👁️';
      case 'draft': return '✏️';
      default: return '📄';
    }
  };

  const handleCreateChapter = () => {
    if (newChapterTitle.trim()) {
      const newChapter: Omit<Chapter, 'id' | 'lastEdited'> = {
        title: newChapterTitle.trim(),
        content: '',
        wordCount: 0,
        order: chapters.length + 1,
        status: 'draft',
        notes: ''
      };

      onChapterCreate(newChapter);
      setNewChapterTitle('');
      setShowCreateForm(false);
    }
  };

  const handleTitleEdit = (chapterId: string, currentTitle: string) => {
    setEditingChapterId(chapterId);
    setEditingTitle(currentTitle);
  };

  const handleTitleSave = (chapterId: string) => {
    if (editingTitle.trim()) {
      onChapterUpdate(chapterId, { title: editingTitle.trim() });
    }
    setEditingChapterId(null);
    setEditingTitle('');
  };

  const handleTitleCancel = () => {
    setEditingChapterId(null);
    setEditingTitle('');
  };

  const handleDragStart = (chapter: Chapter) => {
    setDraggedChapter(chapter);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, targetChapter: Chapter) => {
    e.preventDefault();

    if (!draggedChapter || draggedChapter.id === targetChapter.id) {
      setDraggedChapter(null);
      return;
    }

    const reorderedChapters = [...chapters];
    const draggedIndex = reorderedChapters.findIndex(c => c.id === draggedChapter.id);
    const targetIndex = reorderedChapters.findIndex(c => c.id === targetChapter.id);

    // Remove dragged chapter
    reorderedChapters.splice(draggedIndex, 1);

    // Insert at new position
    reorderedChapters.splice(targetIndex, 0, draggedChapter);

    // Update order numbers
    const updatedChapters = reorderedChapters.map((chapter, index) => ({
      ...chapter,
      order: index + 1
    }));

    onChapterReorder(updatedChapters);
    setDraggedChapter(null);
  };

  const handleStatusChange = (chapterId: string, newStatus: Chapter['status']) => {
    onChapterUpdate(chapterId, { status: newStatus });
  };

  const handleDeleteChapter = (chapterId: string) => {
    if (window.confirm('Are you sure you want to delete this chapter? This action cannot be undone.')) {
      onChapterDelete(chapterId);
    }
  };

  const sortedChapters = [...chapters].sort((a, b) => a.order - b.order);

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
      {/* Header */}
      <div className="border-b border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Chapter Manager</h3>
            <p className="text-sm text-gray-600 mt-1">
              {bookTitle} • {chapters.length} chapters • {totalWordCount.toLocaleString()} total words
            </p>
          </div>
          <button
            onClick={() => setShowCreateForm(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
          >
            ➕ Add Chapter
          </button>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="text-sm text-gray-600">Total Chapters</div>
            <div className="text-xl font-semibold text-gray-900">{chapters.length}</div>
          </div>
          <div className="bg-green-50 rounded-lg p-3">
            <div className="text-sm text-green-600">Final</div>
            <div className="text-xl font-semibold text-green-900">
              {chapters.filter(c => c.status === 'final').length}
            </div>
          </div>
          <div className="bg-yellow-50 rounded-lg p-3">
            <div className="text-sm text-yellow-600">In Review</div>
            <div className="text-xl font-semibold text-yellow-900">
              {chapters.filter(c => c.status === 'review').length}
            </div>
          </div>
          <div className="bg-blue-50 rounded-lg p-3">
            <div className="text-sm text-blue-600">Draft</div>
            <div className="text-xl font-semibold text-blue-900">
              {chapters.filter(c => c.status === 'draft').length}
            </div>
          </div>
        </div>
      </div>

      {/* Create Chapter Form */}
      {showCreateForm && (
        <div className="border-b border-gray-200 p-6 bg-gray-50">
          <h4 className="text-md font-medium text-gray-900 mb-4">Create New Chapter</h4>
          <div className="flex items-center space-x-3">
            <input
              type="text"
              placeholder="Chapter title..."
              value={newChapterTitle}
              onChange={(e) => setNewChapterTitle(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleCreateChapter();
                if (e.key === 'Escape') {
                  setShowCreateForm(false);
                  setNewChapterTitle('');
                }
              }}
              className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              autoFocus
            />
            <button
              onClick={handleCreateChapter}
              disabled={!newChapterTitle.trim()}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white font-medium py-2 px-4 rounded-lg transition-colors"
            >
              Create
            </button>
            <button
              onClick={() => {
                setShowCreateForm(false);
                setNewChapterTitle('');
              }}
              className="bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium py-2 px-4 rounded-lg transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Chapters List */}
      <div className="divide-y divide-gray-200">
        {sortedChapters.length === 0 ? (
          <div className="p-12 text-center">
            <div className="text-4xl mb-4">📚</div>
            <h4 className="text-lg font-medium text-gray-900 mb-2">No chapters yet</h4>
            <p className="text-gray-600 mb-4">Start building your book by adding your first chapter.</p>
            <button
              onClick={() => setShowCreateForm(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
            >
              ➕ Add First Chapter
            </button>
          </div>
        ) : (
          sortedChapters.map((chapter, index) => (
            <div
              key={chapter.id}
              draggable
              onDragStart={() => handleDragStart(chapter)}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, chapter)}
              className={`p-4 hover:bg-gray-50 cursor-pointer transition-colors ${
                selectedChapterId === chapter.id ? 'bg-blue-50 border-l-4 border-blue-500' : ''
              } ${draggedChapter?.id === chapter.id ? 'opacity-50' : ''}`}
              onClick={() => onChapterSelect(chapter)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4 flex-1">
                  {/* Drag Handle */}
                  <div className="text-gray-400 cursor-move">
                    ⋮⋮
                  </div>

                  {/* Chapter Number */}
                  <div className="text-sm font-medium text-gray-500 w-8">
                    {index + 1}.
                  </div>

                  {/* Chapter Title */}
                  <div className="flex-1">
                    {editingChapterId === chapter.id ? (
                      <div className="flex items-center space-x-2">
                        <input
                          type="text"
                          value={editingTitle}
                          onChange={(e) => setEditingTitle(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleTitleSave(chapter.id);
                            if (e.key === 'Escape') handleTitleCancel();
                          }}
                          className="flex-1 border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                          autoFocus
                        />
                        <button
                          onClick={() => handleTitleSave(chapter.id)}
                          className="text-green-600 hover:text-green-800"
                        >
                          ✓
                        </button>
                        <button
                          onClick={handleTitleCancel}
                          className="text-red-600 hover:text-red-800"
                        >
                          ✕
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center space-x-2">
                        <h4 className="font-medium text-gray-900">{chapter.title}</h4>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleTitleEdit(chapter.id, chapter.title);
                          }}
                          className="text-gray-400 hover:text-gray-600 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          ✏️
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Word Count */}
                  <div className="text-sm text-gray-500">
                    {chapter.wordCount.toLocaleString()} words
                  </div>

                  {/* Status */}
                  <div className="relative">
                    <select
                      value={chapter.status}
                      onChange={(e) => {
                        e.stopPropagation();
                        handleStatusChange(chapter.id, e.target.value as Chapter['status']);
                      }}
                      className={`text-xs font-medium px-2 py-1 rounded-full border-0 focus:ring-2 focus:ring-blue-500 ${getStatusColor(chapter.status)}`}
                    >
                      <option value="draft">✏️ Draft</option>
                      <option value="review">👁️ Review</option>
                      <option value="final">✅ Final</option>
                    </select>
                  </div>

                  {/* Last Edited */}
                  <div className="text-xs text-gray-500">
                    {new Date(chapter.lastEdited).toLocaleDateString()}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center space-x-2 ml-4">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onChapterSelect(chapter);
                    }}
                    className="text-blue-600 hover:text-blue-800 text-sm"
                    title="Edit Chapter"
                  >
                    📝
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteChapter(chapter.id);
                    }}
                    className="text-red-600 hover:text-red-800 text-sm"
                    title="Delete Chapter"
                  >
                    🗑️
                  </button>
                </div>
              </div>

              {/* Chapter Notes */}
              {chapter.notes && (
                <div className="mt-2 ml-16 text-sm text-gray-600 italic">
                  💭 {chapter.notes}
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Footer */}
      {chapters.length > 0 && (
        <div className="border-t border-gray-200 p-4 bg-gray-50">
          <div className="flex items-center justify-between text-sm text-gray-600">
            <div>
              Total progress: {chapters.filter(c => c.status === 'final').length}/{chapters.length} chapters finalized
            </div>
            <div className="flex items-center space-x-4">
              <span>📊 Word count distribution:</span>
              <span>Avg: {Math.round(totalWordCount / chapters.length || 0)} words/chapter</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChapterManager;
