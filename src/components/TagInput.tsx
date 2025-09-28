import React, { useState } from 'react';

interface TagInputProps {
  tags: string[];
  onChange: (tags: string[]) => void;
  placeholder?: string;
}

const TagInput: React.FC<TagInputProps> = ({ tags, onChange, placeholder = 'Dodaj tag...' }) => {
  const [input, setInput] = useState('');

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if ((e.key === 'Enter' || e.key === ',') && input.trim()) {
      e.preventDefault();
      if (!tags.includes(input.trim())) {
        onChange([...tags, input.trim()]);
      }
      setInput('');
    } else if (e.key === 'Backspace' && !input && tags.length) {
      onChange(tags.slice(0, -1));
    }
  };

  const removeTag = (i: number) => {
    onChange(tags.filter((_, idx) => idx !== i));
  };

  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, background: '#222', borderRadius: 6, padding: 8 }}>
      {tags.map((tag, i) => (
        <span key={i} style={{ background: '#90caf9', color: '#222', borderRadius: 4, padding: '2px 8px', display: 'flex', alignItems: 'center', gap: 4 }}>
          {tag}
          <button onClick={() => removeTag(i)} style={{ background: 'none', border: 'none', color: '#222', cursor: 'pointer', fontWeight: 'bold' }}>×</button>
        </span>
      ))}
      <input
        type="text"
        value={input}
        onChange={e => setInput(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        style={{ background: 'none', border: 'none', color: 'white', outline: 'none', minWidth: 80 }}
      />
    </div>
  );
};

export default TagInput;
