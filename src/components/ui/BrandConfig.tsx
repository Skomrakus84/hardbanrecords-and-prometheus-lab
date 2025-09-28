// Brand Icons and Background Images Configuration
import {
  BookOpen,
  Users,
  BarChart3,
  Settings,
  FileText,
  Headphones,
  Disc3,
  Library,
  PenTool,
  ShoppingCart,
  TrendingUp,
  Globe,
  Zap,
  Target,
  Crown,
  Sparkles
} from 'lucide-react';

// Elegant icon mappings for different page types
export const PageIcons = {
  // Music Module Icons
  music: {
    releases: { icon: Disc3, brand: 'spotify' as const },
    artists: { icon: Users, brand: 'apple' as const },
    analytics: { icon: BarChart3, brand: 'youtube' as const },
    distribution: { icon: Globe, brand: 'generic' as const },
    royalties: { icon: TrendingUp, brand: 'spotify' as const },
    dashboard: { icon: Headphones, brand: 'spotify' as const }
  },
  // Publishing Module Icons
  publishing: {
    books: { icon: BookOpen, brand: 'amazon' as const },
    authors: { icon: PenTool, brand: 'generic' as const },
    chapters: { icon: Library, brand: 'apple' as const },
    sales: { icon: ShoppingCart, brand: 'amazon' as const },
    stores: { icon: Globe, brand: 'generic' as const },
    dashboard: { icon: Crown, brand: 'amazon' as const }
  },
  // Core Pages Icons
  core: {
    home: { icon: Sparkles, brand: 'generic' as const },
    settings: { icon: Settings, brand: 'generic' as const },
    tasks: { icon: Target, brand: 'generic' as const },
    contracts: { icon: FileText, brand: 'generic' as const }
  }
};

// Background image URLs for different page types
export const PageBackgrounds = {
  // Music Module Backgrounds
  music: {
    releases: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?q=80&w=2070',
    artists: 'https://images.unsplash.com/photo-1516280440614-37939bbacd81?q=80&w=2070',
    analytics: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=2070',
    distribution: 'https://images.unsplash.com/photo-1516975080664-ed2fc6a32937?q=80&w=2070',
    royalties: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?q=80&w=2070',
    dashboard: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?q=80&w=2070'
  },
  // Publishing Module Backgrounds
  publishing: {
    books: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?q=80&w=2070',
    authors: 'https://images.unsplash.com/photo-1455390582262-044cdead277a?q=80&w=2070',
    chapters: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=2070',
    sales: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?q=80&w=2070',
    stores: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=2070',
    dashboard: 'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?q=80&w=2070'
  },
  // Core Pages Backgrounds
  core: {
    home: 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?q=80&w=2070',
    settings: 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?q=80&w=2070',
    tasks: 'https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?q=80&w=2070',
    contracts: 'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?q=80&w=2070'
  }
};

// Gradient themes for different modules
export const GradientThemes = {
  music: {
    primary: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    secondary: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    accent: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
    success: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
    warning: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)'
  },
  publishing: {
    primary: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
    secondary: 'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)',
    accent: 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)',
    success: 'linear-gradient(135deg, #d299c2 0%, #fef9d7 100%)',
    warning: 'linear-gradient(135deg, #89f7fe 0%, #66a6ff 100%)'
  },
  core: {
    primary: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    secondary: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    accent: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
    success: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
    warning: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)'
  }
};

// Helper function to get page configuration
export const getPageConfig = (module: keyof typeof PageIcons, page: string) => {
  const moduleConfig = PageIcons[module];
  const pageConfig = moduleConfig as Record<string, any>;
  const specificPageConfig = pageConfig?.[page];

  return {
    icon: specificPageConfig?.icon || Zap,
    brand: specificPageConfig?.brand || ('generic' as const),
    background: (PageBackgrounds[module] as Record<string, any>)?.[page],
    gradient: GradientThemes[module]?.primary
  };
};
