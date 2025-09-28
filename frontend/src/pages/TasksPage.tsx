import React, { useState } from 'react';
import { useAppStore } from '../store/appStore';
import TaskForm from '../components/TaskForm';
import SearchBar from '../components/SearchBar';
import FilterBar from '../components/FilterBar';

const TasksPage: React.FC = () => {
  const musicTasks = useAppStore(state => state.music.tasks);
  const publishingTasks = useAppStore(state => state.publishing.tasks);
  const addMusicTask = useAppStore(state => state.addMusicTask);
  const addPublishingTask = useAppStore(state => state.addPublishingTask);
  const toggleMusicTask = useAppStore(state => state.toggleMusicTask);
  const togglePublishingTask = useAppStore(state => state.togglePublishingTask);
  const [filter, setFilter] = useState<'all' | 'music' | 'publishing'>('all');
  const [status, setStatus] = useState<'all' | 'done' | 'todo'>('all');
  const [search, setSearch] = useState('');

  const allTasks = [
    ...musicTasks.map(t => ({ ...t, module: 'music' as const })),
    ...publishingTasks.map(t => ({ ...t, module: 'publishing' as const })),
  ];
  let filtered = allTasks;
  if (filter !== 'all') filtered = filtered.filter(t => t.module === filter);
  if (status === 'done') filtered = filtered.filter(t => t.completed);
  if (status === 'todo') filtered = filtered.filter(t => !t.completed);
  if (search.trim()) filtered = filtered.filter(t => t.text.toLowerCase().includes(search.trim().toLowerCase()));

  const handleAdd = (text: string, dueDate: string) => {
    if (filter === 'publishing') addPublishingTask(text, dueDate);        
    else addMusicTask(text, dueDate);
  };

  const handleToggle = (id: number, module: 'music' | 'publishing', completed: boolean) => {
    if (module === 'music') toggleMusicTask(id, completed);
    else togglePublishingTask(id, completed);
  };

  const handleFilterChange = (value: string) => {
    setFilter(value as 'all' | 'music' | 'publishing');
  };

  const handleStatusChange = (value: string) => {
    setStatus(value as 'all' | 'done' | 'todo');
  };  return (
    <div style={{ padding: 32 }}>
      <h2 style={{ color: 'white' }}>Zadania</h2>
      <div style={{ display: 'flex', gap: 16, marginBottom: 16 }}>
        <FilterBar
          label="Moduł:"
          filters={[
            { label: 'Wszystkie', value: 'all' },
            { label: 'Muzyczne', value: 'music' },
            { label: 'Wydawnicze', value: 'publishing' },
          ]}
          value={filter}
          onChange={handleFilterChange}
        />
        <FilterBar
          label="Status:"
          filters={[
            { label: 'Wszystkie', value: 'all' },
            { label: 'Do zrobienia', value: 'todo' },
            { label: 'Zrobione', value: 'done' },
          ]}
          value={status}
          onChange={handleStatusChange}
        />
      </div>
  <SearchBar placeholder="Szukaj zadania..." onSearch={setSearch} />
  <TaskForm onAdd={handleAdd} />
      <ul style={{ color: 'white', listStyle: 'none', padding: 0 }}>
        {filtered.map(task => (
          <li key={task.id} style={{ marginBottom: 12, background: '#222', borderRadius: 6, padding: 12, display: 'flex', alignItems: 'center', gap: 12 }}>
            <input type="checkbox" checked={task.completed} onChange={e => handleToggle(task.id, task.module, e.target.checked)} />
            <span style={{ textDecoration: task.completed ? 'line-through' : undefined }}>{task.text}</span>
            {task.dueDate && <span style={{ color: '#aaa', fontSize: 13 }}>({task.dueDate})</span>}
            <span style={{ fontSize: 12, color: '#90caf9', marginLeft: 'auto' }}>{task.module === 'music' ? 'Muzyczne' : 'Wydawnicze'}</span>
          </li>
        ))}
        {filtered.length === 0 && <li style={{ color: '#aaa' }}>Brak zadań do wyświetlenia.</li>}
      </ul>
    </div>
  );
};

export default TasksPage;
