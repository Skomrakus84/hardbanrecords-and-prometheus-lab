import React from 'react';
import { LucideIcon } from 'lucide-react';

interface GradientCardProps {
  children: React.ReactNode;
  gradient?: string;
  className?: string;
  backgroundImage?: string;
  blur?: boolean;
  onClick?: () => void;
}

export const GradientCard: React.FC<GradientCardProps> = ({
  children,
  gradient = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  className = '',
  backgroundImage,
  blur = true,
  onClick
}) => {
  const baseStyle: React.CSSProperties = {
    background: backgroundImage
      ? `linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.6)), url(${backgroundImage})`
      : gradient,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    borderRadius: '20px',
    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    backdropFilter: blur ? 'blur(16px)' : 'none',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    cursor: onClick ? 'pointer' : 'default',
    overflow: 'hidden',
    position: 'relative'
  };

  const handleMouseEnter = (e: React.MouseEvent<HTMLDivElement>) => {
    if (onClick) {
      e.currentTarget.style.transform = 'translateY(-4px) scale(1.02)';
      e.currentTarget.style.boxShadow = '0 32px 64px -12px rgba(0, 0, 0, 0.4)';
    }
  };

  const handleMouseLeave = (e: React.MouseEvent<HTMLDivElement>) => {
    if (onClick) {
      e.currentTarget.style.transform = 'translateY(0) scale(1)';
      e.currentTarget.style.boxShadow = '0 25px 50px -12px rgba(0, 0, 0, 0.25)';
    }
  };

  return (
    <div
      style={baseStyle}
      className={className}
      onClick={onClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {children}
    </div>
  );
};

interface GlassmorphismContainerProps {
  children: React.ReactNode;
  opacity?: number;
  blur?: number;
  className?: string;
}

export const GlassmorphismContainer: React.FC<GlassmorphismContainerProps> = ({
  children,
  opacity = 0.25,
  blur = 16,
  className = ''
}) => {
  const style: React.CSSProperties = {
    background: `rgba(255, 255, 255, ${opacity})`,
    borderRadius: '20px',
    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    backdropFilter: `blur(${blur}px)`,
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
  };

  return (
    <div style={style} className={className}>
      {children}
    </div>
  );
};

interface BrandIconProps {
  icon: LucideIcon;
  brand?: 'spotify' | 'apple' | 'youtube' | 'amazon' | 'generic';
  size?: number;
  className?: string;
}

export const BrandIcon: React.FC<BrandIconProps> = ({
  icon: Icon,
  brand = 'generic',
  size = 24,
  className = ''
}) => {
  const brandColors = {
    spotify: '#1DB954',
    apple: '#FA243C',
    youtube: '#FF0000',
    amazon: '#FF9900',
    generic: '#6366f1'
  };

  return (
    <div style={{
      width: `${size + 16}px`,
      height: `${size + 16}px`,
      borderRadius: '12px',
      background: `linear-gradient(135deg, ${brandColors[brand]}, ${brandColors[brand]}dd)`,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      boxShadow: `0 8px 25px -8px ${brandColors[brand]}40`
    }}>
      <Icon size={size} className={`text-white ${className}`} />
    </div>
  );
};

interface PageBackgroundProps {
  imageUrl: string;
  children: React.ReactNode;
  overlay?: boolean;
}

export const PageBackground: React.FC<PageBackgroundProps> = ({
  imageUrl,
  children,
  overlay = true
}) => {
  return (
    <div style={{
      minHeight: '100vh',
      backgroundImage: `${overlay ? 'linear-gradient(rgba(0,0,0,0.3), rgba(0,0,0,0.5)), ' : ''}url(${imageUrl})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundAttachment: 'fixed'
    }}>
      {children}
    </div>
  );
};
