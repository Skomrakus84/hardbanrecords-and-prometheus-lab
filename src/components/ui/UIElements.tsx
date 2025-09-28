import React, { CSSProperties } from 'react';

interface ProgressBarProps {
  progress: number; // 0-100
  color?: string;
  height?: number;
  showLabel?: boolean;
  animated?: boolean;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  progress,
  color = '#667eea',
  height = 8,
  showLabel = false,
  animated = true
}) => {
  const containerStyle: CSSProperties = {
    width: '100%',
    height: `${height}px`,
    backgroundColor: '#f1f5f9',
    borderRadius: `${height / 2}px`,
    overflow: 'hidden',
    position: 'relative',
    boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.1)'
  };

  const progressStyle: CSSProperties = {
    height: '100%',
    width: `${Math.min(Math.max(progress, 0), 100)}%`,
    background: `linear-gradient(90deg, ${color}, ${color}dd)`,
    borderRadius: `${height / 2}px`,
    transition: animated ? 'width 0.6s cubic-bezier(0.4, 0, 0.2, 1)' : 'none',
    boxShadow: `0 0 ${height}px rgba(102, 126, 234, 0.3)`
  };

  return (
    <div style={{position: 'relative'}}>
      <div style={containerStyle}>
        <div style={progressStyle} />
      </div>
      {showLabel && (
        <span style={{
          position: 'absolute',
          right: 0,
          top: `${height + 4}px`,
          fontSize: '12px',
          color: '#64748b',
          fontWeight: '500'
        }}>
          {Math.round(progress)}%
        </span>
      )}
    </div>
  );
};

interface ToggleSwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  label?: string;
}

export const ToggleSwitch: React.FC<ToggleSwitchProps> = ({
  checked,
  onChange,
  disabled = false,
  label
}) => {
  const containerStyle: CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '12px',
    cursor: disabled ? 'not-allowed' : 'pointer',
    opacity: disabled ? 0.6 : 1
  };

  const switchStyle: CSSProperties = {
    width: '48px',
    height: '24px',
    backgroundColor: checked ? '#667eea' : '#cbd5e1',
    borderRadius: '12px',
    position: 'relative',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    boxShadow: checked
      ? '0 4px 12px rgba(102, 126, 234, 0.3)'
      : 'inset 0 2px 4px rgba(0,0,0,0.1)'
  };

  const knobStyle: CSSProperties = {
    width: '20px',
    height: '20px',
    backgroundColor: '#ffffff',
    borderRadius: '50%',
    position: 'absolute',
    top: '2px',
    left: checked ? '26px' : '2px',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
  };

  return (
    <div style={containerStyle} onClick={() => !disabled && onChange(!checked)}>
      <div style={switchStyle}>
        <div style={knobStyle} />
      </div>
      {label && <span style={{fontSize: '14px', color: '#374151', fontWeight: '500'}}>{label}</span>}
    </div>
  );
};

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'primary' | 'success' | 'warning' | 'error' | 'info';
  size?: 'sm' | 'md' | 'lg';
  dot?: boolean;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  dot = false
}) => {
  const variantStyles = {
    primary: { backgroundColor: '#667eea', color: '#ffffff' },
    success: { backgroundColor: '#10b981', color: '#ffffff' },
    warning: { backgroundColor: '#f59e0b', color: '#ffffff' },
    error: { backgroundColor: '#ef4444', color: '#ffffff' },
    info: { backgroundColor: '#06b6d4', color: '#ffffff' }
  };

  const sizeStyles = {
    sm: { padding: '2px 8px', fontSize: '11px' },
    md: { padding: '4px 12px', fontSize: '12px' },
    lg: { padding: '6px 16px', fontSize: '14px' }
  };

  const style: CSSProperties = {
    ...variantStyles[variant],
    ...sizeStyles[size],
    borderRadius: dot ? '50%' : '12px',
    fontWeight: '600',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: dot ? '20px' : 'auto',
    height: dot ? '20px' : 'auto',
    boxShadow: `0 2px 8px ${variantStyles[variant].backgroundColor}40`
  };

  return <span style={style}>{children}</span>;
};
