import { useEffect, useState } from 'react';
import { useAppStore } from '../../store/appStore';
import { ReleasesView } from '../../components/music/ReleasesView';
import { SplitsView } from '../../components/music/SplitsView';
import { TasksView } from '../../components/music/TasksView';

const MusicPage = () => {
  const [selectedView, setSelectedView] = useState('releases');
  const [selectedRelease, setSelectedRelease] = useState(null);
  const { releases } = useAppStore(state => state.music);

  const renderView = () => {
    switch(selectedView) {
      case 'releases':
        return <ReleasesView onSelectRelease={setSelectedRelease} />;
      case 'splits':
        return selectedRelease ? 
          <SplitsView release={selectedRelease} /> : 
          <div>Please select a release first</div>;
      case 'tasks':
        return <TasksView />;
      default:
        return <ReleasesView onSelectRelease={setSelectedRelease} />;
    }
  };

  return (
    <div>
      <h1 style={{ fontSize: '2rem', marginBottom: '20px', color: '#E0E0E0' }}>
        Music Publishing
      </h1>
      
      <div style={{ marginBottom: '20px' }}>
        <button 
          onClick={() => setSelectedView('releases')}
          style={{
            ...buttonStyle,
            backgroundColor: selectedView === 'releases' ? '#333' : '#1E1E1E'
          }}
        >
          Releases
        </button>
        <button 
          onClick={() => setSelectedView('splits')}
          style={{
            ...buttonStyle,
            backgroundColor: selectedView === 'splits' ? '#333' : '#1E1E1E'
          }}
        >
          Splits
        </button>
        <button 
          onClick={() => setSelectedView('tasks')}
          style={{
            ...buttonStyle,
            backgroundColor: selectedView === 'tasks' ? '#333' : '#1E1E1E'
          }}
        >
          Tasks
        </button>
      </div>

      {renderView()}
    </div>
  );
};

const buttonStyle = {
  padding: '10px 20px',
  marginRight: '10px',
  border: 'none',
  borderRadius: '4px',
  color: '#E0E0E0',
  cursor: 'pointer',
  transition: 'background-color 0.2s ease'
};

export default MusicPage;