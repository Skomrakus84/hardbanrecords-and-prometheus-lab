import React from 'react';
interface AIToolCardProps {
  title: string;
  children: React.ReactNode;
  onGenerate?: () => void;
  isLoading?: boolean;
  buttonText?: string;
  tooltipText?: string;
}
const AIToolCard: React.FC<AIToolCardProps> = ({ title, children, onGenerate, isLoading, buttonText, tooltipText }) => {
  const button = (
    <button onClick={onGenerate} disabled={isLoading} className="card-button">
      {isLoading ? 'Generating...' : buttonText}
    </button>
  );
  return (
    <div className="ai-card">
      <h4>{title}</h4>
      {children}
      {onGenerate && buttonText && (
        tooltipText ? <span title={tooltipText}>{button}</span> : button
      )}
    </div>
  );
};
export default AIToolCard;
