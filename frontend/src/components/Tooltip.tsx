import React from 'react';
interface TooltipProps {
  text: string;
  children: React.ReactNode;
  inline?: boolean;
}
const Tooltip: React.FC<TooltipProps> = ({ text, children, inline = false }) => (
  <div className={`tooltip-container ${inline ? 'tooltip-container--inline' : ''}`}>
    {children}
    <span className="tooltip-text" role="tooltip">{text}</span>
  </div>
);
export default Tooltip;
