import React from 'react';
interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}
const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <h2>{title}</h2>
        <div className="modal-body">{children}</div>
        <div className="modal-actions" style={{ justifyContent: 'center' }}>
          <button type="button" className="card-button" onClick={onClose} style={{ minWidth: '120px' }}>Close</button>
        </div>
      </div>
    </div>
  );
};
export default Modal;
