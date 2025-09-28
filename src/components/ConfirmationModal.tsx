import React from 'react';
interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  onSave: () => void;
  onDiscard: () => void;
  children: React.ReactNode;
}
const ConfirmationModal: React.FC<ConfirmationModalProps> = ({ isOpen, onClose, title, children, onSave, onDiscard }) => {
  if (!isOpen) return null;
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <h2>{title}</h2>
        <div className="modal-body" style={{backgroundColor: 'transparent', border: 'none', padding: 0}}>
          {children}
        </div>
        <div className="modal-actions">
          <button type="button" className="button-secondary" onClick={onClose}>Cancel</button>
          <button type="button" className="button-secondary" style={{ background: 'none', border: '1px solid var(--electric-coral)', color: 'var(--electric-coral)' }} onClick={onDiscard}>Discard Changes</button>
          <button type="button" className="card-button" onClick={onSave}>Save & Continue</button>
        </div>
      </div>
    </div>
  );
};
export default ConfirmationModal;
