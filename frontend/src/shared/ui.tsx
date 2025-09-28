import React from 'react';

// Card component
interface CardProps {
  title?: string;
  children: React.ReactNode;
  style?: React.CSSProperties;
}

export const Card: React.FC<CardProps> = ({ title, children, style }) => (
  <div style={{
    background: '#1E1E1E',
    borderRadius: '8px',
    padding: '20px',
    border: '1px solid #333',
    color: 'white',
    ...style
  }}>
    {title && <h3 style={{ margin: '0 0 16px 0', color: '#E0E0E0' }}>{title}</h3>}
    {children}
  </div>
);

// Button component
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger';
  children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({ 
  variant = 'primary', 
  children, 
  style,
  ...props 
}) => {
  const getVariantStyle = () => {
    switch (variant) {
      case 'secondary':
        return { background: '#333', color: '#E0E0E0' };
      case 'danger':
        return { background: '#f44336', color: 'white' };
      default:
        return { background: '#2196F3', color: 'white' };
    }
  };

  return (
    <button
      style={{
        padding: '10px 20px',
        border: 'none',
        borderRadius: '6px',
        cursor: 'pointer',
        fontWeight: '500',
        transition: 'all 0.2s ease',
        ...getVariantStyle(),
        ...style
      }}
      {...props}
    >
      {children}
    </button>
  );
};

// Textarea component
interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  minRows?: number;
  maxRows?: number;
}

export const Textarea: React.FC<TextareaProps> = ({ 
  style, 
  minRows = 3, 
  maxRows = 10,
  ...props 
}) => (
  <textarea
    style={{
      width: '100%',
      minHeight: `${minRows * 24}px`,
      maxHeight: `${maxRows * 24}px`,
      padding: '8px 12px',
      background: '#333',
      border: '1px solid #555',
      borderRadius: '4px',
      color: 'white',
      resize: 'vertical',
      fontFamily: 'inherit',
      fontSize: '14px',
      ...style
    }}
    {...props}
  />
);

// Spinner component
interface SpinnerProps {
  size?: number;
  color?: string;
}

export const Spinner: React.FC<SpinnerProps> = ({ 
  size = 24, 
  color = '#2196F3' 
}) => (
  <div
    style={{
      width: size,
      height: size,
      border: `2px solid #333`,
      borderTop: `2px solid ${color}`,
      borderRadius: '50%',
      animation: 'spin 1s linear infinite',
      display: 'inline-block'
    }}
  >
    <style jsx>{`
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
    `}</style>
  </div>
);