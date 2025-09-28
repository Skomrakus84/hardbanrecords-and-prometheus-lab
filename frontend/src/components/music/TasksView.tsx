import React from 'react';
import { useAppStore } from '../../store/appStore';

export const TasksView: React.FC = () => {
  const musicTasks = useAppStore(state => state.music.tasks);
  const addMusicTask = useAppStore(state => state.addMusicTask);
  const toggleMusicTask = useAppStore(state => state.toggleMusicTask);

  const handleAddTask = async (text: string, dueDate: string) => {
    await addMusicTask(text, dueDate);
  };

  const handleToggleTask = async (id: number) => {
    await toggleMusicTask(id);
  };

  return (
    <div>
      <h2>Music Tasks</h2>
      <div style={{ marginBottom: '20px' }}>
        <p>Task management for music projects will be implemented here.</p>
      </div>
      
      {musicTasks.length > 0 ? (
        <ul>
          {musicTasks.map(task => (
            <li key={task.id} style={{ marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <input 
                type="checkbox" 
                checked={task.completed} 
                onChange={() => handleToggleTask(task.id)}
              />
              <span style={{ textDecoration: task.completed ? 'line-through' : 'none' }}>
                {task.text}
              </span>
              {task.dueDate && (
                <span style={{ color: '#888', fontSize: '0.9em' }}>
                  Due: {task.dueDate}
                </span>
              )}
            </li>
          ))}
        </ul>
      ) : (
        <p>No tasks yet.</p>
      )}
    </div>
  );
};