import React, { CSSProperties } from 'react';

interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'ghost' | 'floating' | 'toggle' | 'pill';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  className?: string;
  icon?: string | React.ReactNode;
}

const Button: React.FC<ButtonProps> = ({
  children,
  onClick,
  variant = 'primary',
  size = 'md',
  disabled = false,
  className,
  icon
}) => {
  const getButtonStyles = (): CSSProperties => {
    const baseStyles: CSSProperties = {
      border: 'none',
      borderRadius: '12px',
      cursor: disabled ? 'not-allowed' : 'pointer',
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '8px',
      fontWeight: '600',
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      position: 'relative',
      overflow: 'hidden',
      opacity: disabled ? 0.6 : 1,
    };

    const sizeStyles = {
      sm: { padding: '8px 16px', fontSize: '14px' },
      md: { padding: '12px 24px', fontSize: '16px' },
      lg: { padding: '16px 32px', fontSize: '18px' }
    };

    const variantStyles = {
      primary: {
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: '#ffffff',
        boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3), 0 2px 4px rgba(0,0,0,0.1)',
        border: '1px solid rgba(255,255,255,0.2)'
      },
      secondary: {
        background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
        color: '#334155',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        border: '1px solid #e2e8f0'
      },
      ghost: {
        background: 'transparent',
        color: '#667eea',
        border: '2px solid #667eea',
        boxShadow: 'none'
      },
      floating: {
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: '#ffffff',
        borderRadius: '50%',
        width: '56px',
        height: '56px',
        boxShadow: '0 8px 24px rgba(102, 126, 234, 0.4)',
        position: 'fixed' as const,
        bottom: '24px',
        right: '24px',
        zIndex: 1000
      },
      pill: {
        background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
        color: '#ffffff',
        borderRadius: '30px',
        boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)'
      },
      toggle: {
        background: '#f1f5f9',
        color: '#64748b',
        borderRadius: '8px',
        boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.1)'
      }
    };

    return {
      ...baseStyles,
      ...sizeStyles[size],
      ...variantStyles[variant]
    };
  };

  const handleMouseEnter = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (disabled) return;

    const button = e.currentTarget;
    if (variant === 'primary') {
      button.style.transform = 'translateY(-2px)';
      button.style.boxShadow = '0 8px 20px rgba(102, 126, 234, 0.4), 0 4px 8px rgba(0,0,0,0.1)';
    } else if (variant === 'ghost') {
      button.style.backgroundColor = 'rgba(102, 126, 234, 0.1)';
    } else if (variant === 'floating') {
      button.style.transform = 'scale(1.1)';
    }
  };

  const handleMouseLeave = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (disabled) return;

    const button = e.currentTarget;
    if (variant === 'primary') {
      button.style.transform = 'translateY(0)';
      button.style.boxShadow = '0 4px 12px rgba(102, 126, 234, 0.3), 0 2px 4px rgba(0,0,0,0.1)';
    } else if (variant === 'ghost') {
      button.style.backgroundColor = 'transparent';
    } else if (variant === 'floating') {
      button.style.transform = 'scale(1)';
    }
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={getButtonStyles()}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={className}
    >
      {icon && (
        typeof icon === 'string'
          ? <img src={icon} alt="" style={{width: '20px', height: '20px'}} />
          : <span style={{display: 'flex', alignItems: 'center'}}>{icon}</span>
      )}
      {children}
    </button>
  );
};

export default Button;
