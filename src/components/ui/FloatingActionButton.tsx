import React from 'react';
import { Plus } from 'lucide-react';

interface FloatingActionButtonProps {
  onClick?: () => void;
  tooltip?: string;
}

const FloatingActionButton: React.FC<FloatingActionButtonProps> = ({
  onClick,
  tooltip = "Quick Action"
}) => {
  return (
    <div
      className="fixed bottom-8 right-8 z-50 group"
      title={tooltip}
    >
      <button
        onClick={onClick}
        className="w-14 h-14 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center group-hover:scale-110"
      >
        <Plus size={24} />
      </button>
    </div>
  );
};

export default FloatingActionButton;
