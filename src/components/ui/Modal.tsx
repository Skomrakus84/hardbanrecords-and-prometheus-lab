import React, { useEffect } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  size = 'md'
}) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl'
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={onClose}
      />
      <div className="flex min-h-full items-center justify-center p-4">
        <div
          className={`relative bg-white rounded-xl shadow-2xl ${sizeClasses[size]} w-full max-h-[90vh] overflow-y-auto`}
          style={{
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
            border: '1px solid rgba(255, 255, 255, 0.1)'
          }}
        >
          {title && (
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X size={20} className="opacity-60" />
              </button>
            </div>
          )}
          <div className="p-6">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

interface ToastProps {
  message: string;
  type?: 'success' | 'error' | 'warning' | 'info';
  isVisible: boolean;
  onClose: () => void;
  duration?: number;
}

export const Toast: React.FC<ToastProps> = ({
  message,
  type = 'info',
  isVisible,
  onClose,
  duration = 5000
}) => {
  useEffect(() => {
    if (isVisible && duration > 0) {
      const timer = setTimeout(onClose, duration);
      return () => clearTimeout(timer);
    }
  }, [isVisible, duration, onClose]);

  if (!isVisible) return null;

  const typeStyles = {
    success: {
      bg: 'bg-gradient-to-r from-green-500 to-green-600',
      icon: '/images/upload.png'
    },
    error: {
      bg: 'bg-gradient-to-r from-red-500 to-red-600',
      icon: '/images/notification-bell-icon,.png'
    },
    warning: {
      bg: 'bg-gradient-to-r from-yellow-500 to-yellow-600',
      icon: '/images/ana;itic.jpg'
    },
    info: {
      bg: 'bg-gradient-to-r from-blue-500 to-blue-600',
      icon: '/images/Data visualization.jpg'
    }
  };

  return (
    <div className="fixed top-4 right-4 z-50">
      <div
        className={`${typeStyles[type].bg} text-white px-6 py-4 rounded-xl shadow-lg max-w-sm`}
        style={{
          animation: isVisible ? 'slideInRight 0.3s ease-out' : 'slideOutRight 0.3s ease-in',
          boxShadow: '0 10px 25px rgba(0, 0, 0, 0.3)'
        }}
      >
        <div className="flex items-center gap-3">
          <img src={typeStyles[type].icon} alt={type} className="w-5 h-5 opacity-90" />
          <span className="font-medium">{message}</span>
          <button
            onClick={onClose}
            className="ml-auto text-white hover:text-gray-200 transition-colors"
          >
            ×
          </button>
        </div>
      </div>
    </div>
  );
};
