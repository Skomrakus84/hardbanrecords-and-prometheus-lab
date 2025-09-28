import React, { useState } from 'react';
import { useAppStore } from '../store/appStore';
interface TaskManagerProps {
  module: 'music' | 'publishing';
}
const TaskManager: React.FC<TaskManagerProps> = ({ module }) => {
  const { music, publishing, addMusicTask, toggleMusicTask, addPublishingTask, togglePublishingTask } = useAppStore(state => ({
    music: state.music,
    publishing: state.publishing,
    addMusicTask: state.addMusicTask,
    toggleMusicTask: state.toggleMusicTask,
    addPublishingTask: state.addPublishingTask,
    togglePublishingTask: state.togglePublishingTask,
  }));
  const [newTask, setNewTask] = useState('');
  const [newDueDate, setNewDueDate] = useState('');
  const tasks = module === 'music' ? music.tasks : publishing.tasks;
  const addTask = module === 'music' ? addMusicTask : addPublishingTask;
  const toggleTask = module === 'music' ? toggleMusicTask : togglePublishingTask;
  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTask.trim()) return;
    addTask(newTask.trim(), newDueDate);
    setNewTask('');
    setNewDueDate('');
  };
  return (
    <div className="module-tool-card large-span">
      <h3>Task Management</h3>
      <div className="task-manager">
        <form onSubmit={handleAddTask} className="add-task-form">
          <input type="text" value={newTask} onChange={(e) => setNewTask(e.target.value)} placeholder="Add a new task..." aria-label="New task" />
          <input type="date" value={newDueDate} onChange={(e) => setNewDueDate(e.target.value)} aria-label="Due date" />
          <button type="submit" aria-label="Add task">+</button>
        </form>
        <ul className="task-list">
          {[...tasks].sort((a, b) => a.completed === b.completed ? 0 : a.completed ? 1 : -1).map(task => (
            <li key={task.id} className={`task-item ${task.completed ? 'task-item--completed' : ''}`}>
              <div className="task-content">
                <input type="checkbox" checked={task.completed} onChange={() => toggleTask(task.id)} id={`task-${task.id}`} aria-labelledby={`task-label-${task.id}`} />
                <label htmlFor={`task-${task.id}`} className="task-checkbox-label" aria-hidden="true"></label>
                <span id={`task-label-${task.id}`}>{task.text}</span>
              </div>
              {task.dueDate && <span className="due-date">{new Date(task.dueDate + 'T00:00:00').toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};
export default TaskManager;
