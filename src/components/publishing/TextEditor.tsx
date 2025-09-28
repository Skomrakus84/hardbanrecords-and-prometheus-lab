import React, { useState, useRef, useEffect } from 'react';

interface TextEditorProps {
  content: string;
  onChange: (content: string) => void;
  placeholder?: string;
  readOnly?: boolean;
  showFormatting?: boolean;
  autoSave?: boolean;
  onSave?: (content: string) => void;
  className?: string;
}

interface FormatButton {
  id: string;
  label: string;
  icon: string;
  action: string;
  shortcut?: string;
}

const TextEditor: React.FC<TextEditorProps> = ({
  content,
  onChange,
  placeholder = 'Start writing your chapter...',
  readOnly = false,
  showFormatting = true,
  autoSave = false,
  onSave,
  className = ''
}) => {
  const [editorContent, setEditorContent] = useState(content);
  const [selectedText, setSelectedText] = useState('');
  const [showWordCount, setShowWordCount] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const editorRef = useRef<HTMLDivElement>(null);
  const lastSavedRef = useRef(content);

  const formatButtons: FormatButton[] = [
    { id: 'bold', label: 'Bold', icon: '𝐁', action: 'bold', shortcut: 'Ctrl+B' },
    { id: 'italic', label: 'Italic', icon: '𝐼', action: 'italic', shortcut: 'Ctrl+I' },
    { id: 'underline', label: 'Underline', icon: '𝐔', action: 'underline', shortcut: 'Ctrl+U' },
    { id: 'strikethrough', label: 'Strikethrough', icon: '𝐒', action: 'strikethrough' },
    { id: 'heading1', label: 'Heading 1', icon: 'H1', action: 'formatBlock', shortcut: 'Ctrl+1' },
    { id: 'heading2', label: 'Heading 2', icon: 'H2', action: 'formatBlock', shortcut: 'Ctrl+2' },
    { id: 'heading3', label: 'Heading 3', icon: 'H3', action: 'formatBlock', shortcut: 'Ctrl+3' },
    { id: 'paragraph', label: 'Paragraph', icon: '¶', action: 'formatBlock' },
    { id: 'quote', label: 'Quote', icon: '"', action: 'formatBlock' },
    { id: 'bulletList', label: 'Bullet List', icon: '•', action: 'insertUnorderedList' },
    { id: 'numberList', label: 'Number List', icon: '1.', action: 'insertOrderedList' },
    { id: 'link', label: 'Link', icon: '🔗', action: 'createLink' },
    { id: 'image', label: 'Image', icon: '🖼️', action: 'insertImage' },
    { id: 'divider', label: 'Divider', icon: '—', action: 'insertHorizontalRule' }
  ];

  useEffect(() => {
    setEditorContent(content);
  }, [content]);

  useEffect(() => {
    if (autoSave && isDirty && onSave && editorContent !== lastSavedRef.current) {
      const timeoutId = setTimeout(() => {
        onSave(editorContent);
        lastSavedRef.current = editorContent;
        setIsDirty(false);
      }, 2000); // Auto-save after 2 seconds of inactivity

      return () => clearTimeout(timeoutId);
    }
    return undefined;
  }, [editorContent, isDirty, autoSave, onSave]);

  const handleContentChange = () => {
    if (editorRef.current) {
      const newContent = editorRef.current.innerHTML;
      setEditorContent(newContent);
      onChange(newContent);
      setIsDirty(true);
    }
  };

  const executeCommand = (command: string, value?: string) => {
    if (readOnly) return;

    document.execCommand(command, false, value);
    editorRef.current?.focus();
    handleContentChange();
  };

  const handleFormatButton = (button: FormatButton) => {
    switch (button.action) {
      case 'formatBlock':
        if (button.id === 'heading1') executeCommand('formatBlock', '<h1>');
        else if (button.id === 'heading2') executeCommand('formatBlock', '<h2>');
        else if (button.id === 'heading3') executeCommand('formatBlock', '<h3>');
        else if (button.id === 'paragraph') executeCommand('formatBlock', '<p>');
        else if (button.id === 'quote') executeCommand('formatBlock', '<blockquote>');
        break;
      case 'createLink': {
        const url = prompt('Enter URL:');
        if (url) executeCommand('createLink', url);
        break;
      }
      case 'insertImage': {
        const imageUrl = prompt('Enter image URL:');
        if (imageUrl) executeCommand('insertImage', imageUrl);
        break;
      }
      default:
        executeCommand(button.action);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (readOnly) return;

    // Handle keyboard shortcuts
    if (e.ctrlKey || e.metaKey) {
      switch (e.key) {
        case 'b':
          e.preventDefault();
          executeCommand('bold');
          break;
        case 'i':
          e.preventDefault();
          executeCommand('italic');
          break;
        case 'u':
          e.preventDefault();
          executeCommand('underline');
          break;
        case '1':
          e.preventDefault();
          executeCommand('formatBlock', '<h1>');
          break;
        case '2':
          e.preventDefault();
          executeCommand('formatBlock', '<h2>');
          break;
        case '3':
          e.preventDefault();
          executeCommand('formatBlock', '<h3>');
          break;
        case 's':
          if (onSave) {
            e.preventDefault();
            onSave(editorContent);
            setIsDirty(false);
          }
          break;
      }
    }
  };

  const handleSelection = () => {
    const selection = window.getSelection();
    if (selection) {
      setSelectedText(selection.toString());
    }
  };

  const getWordCount = (html: string) => {
    const text = html.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
    return text.length === 0 ? 0 : text.split(' ').length;
  };

  const getCharacterCount = (html: string) => {
    return html.replace(/<[^>]*>/g, '').length;
  };

  const handleManualSave = () => {
    if (onSave) {
      onSave(editorContent);
      lastSavedRef.current = editorContent;
      setIsDirty(false);
    }
  };

  const handleClearFormatting = () => {
    if (readOnly) return;
    executeCommand('removeFormat');
  };

  const handleUndo = () => {
    if (readOnly) return;
    executeCommand('undo');
  };

  const handleRedo = () => {
    if (readOnly) return;
    executeCommand('redo');
  };

  return (
    <div className={`bg-white rounded-xl border border-gray-200 shadow-sm ${className}`}>
      {/* Toolbar */}
      {showFormatting && !readOnly && (
        <div className="border-b border-gray-200 p-4">
          <div className="flex flex-wrap items-center gap-2">
            {/* Undo/Redo */}
            <div className="flex items-center space-x-1 mr-3">
              <button
                onClick={handleUndo}
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded transition-colors"
                title="Undo (Ctrl+Z)"
              >
                ↶
              </button>
              <button
                onClick={handleRedo}
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded transition-colors"
                title="Redo (Ctrl+Y)"
              >
                ↷
              </button>
            </div>

            {/* Formatting Buttons */}
            <div className="flex flex-wrap items-center gap-1">
              {formatButtons.map((button, index) => (
                <React.Fragment key={button.id}>
                  {(index === 4 || index === 8 || index === 11) && (
                    <div className="w-px h-6 bg-gray-300 mx-2"></div>
                  )}
                  <button
                    onClick={() => handleFormatButton(button)}
                    className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded transition-colors text-sm font-medium"
                    title={`${button.label}${button.shortcut ? ` (${button.shortcut})` : ''}`}
                  >
                    {button.icon}
                  </button>
                </React.Fragment>
              ))}
            </div>

            {/* Additional Actions */}
            <div className="flex items-center space-x-1 ml-auto">
              <button
                onClick={handleClearFormatting}
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded transition-colors text-sm"
                title="Clear Formatting"
              >
                🧹
              </button>

              <button
                onClick={() => setShowWordCount(!showWordCount)}
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded transition-colors text-sm"
                title="Toggle Word Count"
              >
                📊
              </button>

              {onSave && (
                <button
                  onClick={handleManualSave}
                  disabled={!isDirty}
                  className={`px-3 py-2 rounded text-sm font-medium transition-colors ${
                    isDirty
                      ? 'bg-blue-600 hover:bg-blue-700 text-white'
                      : 'bg-gray-100 text-gray-500 cursor-not-allowed'
                  }`}
                  title="Save (Ctrl+S)"
                >
                  💾 Save
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Editor Content */}
      <div className="relative">
        <div
          ref={editorRef}
          contentEditable={!readOnly}
          onInput={handleContentChange}
          onKeyDown={handleKeyDown}
          onMouseUp={handleSelection}
          onKeyUp={handleSelection}
          dangerouslySetInnerHTML={{ __html: editorContent }}
          className={`min-h-[400px] p-6 focus:outline-none ${
            readOnly ? 'cursor-default' : 'cursor-text'
          }`}
          style={{
            lineHeight: '1.6',
            fontSize: '16px',
            fontFamily: '"Inter", "Segoe UI", "Roboto", sans-serif'
          }}
          data-placeholder={placeholder}
        />

        {/* Placeholder */}
        {!editorContent && (
          <div className="absolute top-6 left-6 text-gray-400 pointer-events-none">
            {placeholder}
          </div>
        )}
      </div>

      {/* Footer with word count and auto-save status */}
      <div className="border-t border-gray-200 px-6 py-3 bg-gray-50 rounded-b-xl">
        <div className="flex items-center justify-between text-sm text-gray-600">
          <div className="flex items-center space-x-4">
            {showWordCount && (
              <>
                <span>📝 {getWordCount(editorContent)} words</span>
                <span>🔤 {getCharacterCount(editorContent)} characters</span>
              </>
            )}
            {selectedText && (
              <span>✂️ {selectedText.length} characters selected</span>
            )}
          </div>

          <div className="flex items-center space-x-4">
            {autoSave && isDirty && (
              <span className="text-orange-600">💾 Auto-saving...</span>
            )}
            {autoSave && !isDirty && lastSavedRef.current !== '' && (
              <span className="text-green-600">✅ Saved</span>
            )}
            {readOnly && (
              <span className="text-blue-600">👁️ Read-only mode</span>
            )}
          </div>
        </div>
      </div>

      {/* Custom Styles for Editor Content */}
      <style>{`
        [contenteditable] h1 {
          font-size: 2rem;
          font-weight: bold;
          margin: 1rem 0;
          color: #1f2937;
        }
        [contenteditable] h2 {
          font-size: 1.5rem;
          font-weight: bold;
          margin: 0.875rem 0;
          color: #374151;
        }
        [contenteditable] h3 {
          font-size: 1.25rem;
          font-weight: bold;
          margin: 0.75rem 0;
          color: #4b5563;
        }
        [contenteditable] p {
          margin: 0.75rem 0;
          color: #1f2937;
        }
        [contenteditable] blockquote {
          border-left: 4px solid #e5e7eb;
          padding-left: 1rem;
          margin: 1rem 0;
          font-style: italic;
          color: #6b7280;
        }
        [contenteditable] ul, [contenteditable] ol {
          margin: 0.75rem 0;
          padding-left: 1.5rem;
        }
        [contenteditable] li {
          margin: 0.25rem 0;
        }
        [contenteditable] a {
          color: #3b82f6;
          text-decoration: underline;
        }
        [contenteditable] img {
          max-width: 100%;
          height: auto;
          margin: 1rem 0;
          border-radius: 8px;
        }
        [contenteditable] hr {
          border: none;
          border-top: 2px solid #e5e7eb;
          margin: 2rem 0;
        }
        [contenteditable]:empty:before {
          content: attr(data-placeholder);
          color: #9ca3af;
          pointer-events: none;
        }
      `}</style>
    </div>
  );
};

export default TextEditor;
