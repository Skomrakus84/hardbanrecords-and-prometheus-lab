import React, { useState } from 'react';

interface TaskFormProps {
  onAdd: (text: string, dueDate: string) => void;
}

const TaskForm: React.FC<TaskFormProps> = ({ onAdd }) => {
  const [text, setText] = useState('');
  const [dueDate, setDueDate] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;
    onAdd(text, dueDate);
    setText('');
    setDueDate('');
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
      <input
        type="text"
        value={text}
        onChange={e => setText(e.target.value)}
        placeholder="Treść zadania"
        style={{ flex: 2 }}
      />
      <input
        type="date"
        value={dueDate}
        onChange={e => setDueDate(e.target.value)}
        style={{ flex: 1 }}
      />
      <button type="submit" style={{ flex: 0 }}>Dodaj</button>
    </form>
  );
};

export default TaskForm;
