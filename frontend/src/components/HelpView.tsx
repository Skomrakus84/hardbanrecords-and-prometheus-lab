import React from 'react';
interface HelpTopic {
  title: string;
  description: string;
}
const HelpCard: React.FC<{ topic: HelpTopic }> = ({ topic }) => (
  <div className="help-card">
    <h4>{topic.title}</h4>
    <p>{topic.description}</p>
  </div>
);
const HelpView: React.FC<{ title: string; topics: HelpTopic[] }> = ({ title, topics }) => (
  <div className="module-tool-card large-span">
    <h3>{title}</h3>
    <div className="help-grid">
      {topics.map(topic => <HelpCard key={topic.title} topic={topic} />)}
    </div>
  </div>
);
export default HelpView;
