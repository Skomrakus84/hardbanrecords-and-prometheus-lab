import React from 'react';
interface DashboardCardProps {
  icon: string;
  title: string;
  description: string;
  onClick?: () => void;
}
const DashboardCard: React.FC<DashboardCardProps> = ({ icon, title, description, onClick }) => (
  <button className="card" onClick={onClick} aria-label={title}>
    <div className="card-icon">{icon}</div>
    <h3>{title}</h3>
    <p>{description}</p>
  </button>
);
export default DashboardCard;
