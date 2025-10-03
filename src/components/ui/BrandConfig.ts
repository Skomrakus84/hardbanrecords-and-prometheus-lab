import { LucideIcon, Disc3, Music2, BookOpen, Rocket } from 'lucide-react';

export const Brand = {
  colors: {
    bg: '#f8fafc',
    surface: '#ffffff',
    border: '#e5e7eb',
    text: '#0f172a',
    subtext: '#64748b',
    primary: '#6366f1',
    primaryDark: '#4f46e5',
    success: '#16a34a',
    warning: '#f59e0b',
    danger: '#ef4444'
  },
  radius: 16,
  shadow: '0 10px 30px rgba(2, 6, 23, 0.06)',
  card: {
    base(): React.CSSProperties {
      return {
        background: Brand.colors.surface,
        borderRadius: Brand.radius,
        padding: 20,
        boxShadow: Brand.shadow,
        border: `1px solid ${Brand.colors.border}`,
      };
    }
  },
  gradient(from = '#8b5cf6', to = '#7c3aed') {
    return `linear-gradient(135deg, ${from}, ${to})`;
  }
};

export type BrandConfig = typeof Brand;

export type BrandName = 'spotify' | 'apple' | 'youtube' | 'amazon' | 'generic';

export interface PageConfig {
  icon: LucideIcon;
  brand: BrandName;
  background?: string;
  title?: string;
  subtitle?: string;
}

export function getPageConfig(module: 'music' | 'publishing' | 'prometheus' | 'dashboard', page?: string): PageConfig {
  if (module === 'music') {
    switch (page) {
      case 'releases':
        return {
          icon: Disc3 as unknown as LucideIcon,
          brand: 'generic',
          background: '/images/music-publishing.png',
          title: 'Music Releases',
          subtitle: 'Manage all your music releases and distribution'
        };
      default:
        return {
          icon: Music2 as unknown as LucideIcon,
          brand: 'generic',
          background: '/images/music-label-logo.png',
          title: 'Music Overview',
          subtitle: 'Podsumowanie wydawnictw, artystów i dystrybucji'
        };
    }
  }

  if (module === 'publishing') {
    return {
      icon: BookOpen as unknown as LucideIcon,
      brand: 'generic',
      background: '/images/digital-pubishimg.png',
      title: 'Publishing',
      subtitle: 'Zarządzaj książkami i dystrybucją'
    };
  }

  if (module === 'prometheus') {
    return {
      icon: Rocket as unknown as LucideIcon,
      brand: 'generic',
      background: '/images/rocket.png',
      title: 'Prometheus AI',
      subtitle: 'AI do treści i kampanii'
    };
  }

  // dashboard / fallback
  return {
    icon: Music2 as unknown as LucideIcon,
    brand: 'generic',
    background: '/images/hrl.svg',
    title: 'Dashboard',
    subtitle: 'Podsumowanie platformy'
  };
}
