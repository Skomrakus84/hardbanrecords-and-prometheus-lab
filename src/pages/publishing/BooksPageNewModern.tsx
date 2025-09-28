import React, { useState } from 'react';
import { Book, BookOpen, Edit, Eye, Plus, Grid3X3, List, Clock, CheckCircle, AlertCircle, Users, TrendingUp, FileText } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface Chapter {
  id: string;
  title: string;
  wordCount: number;
  status: 'draft' | 'complete' | 'review';
  lastEdited: string;
  content?: string;
}

interface BookItem {
  id: string;
  title: string;
  author: string;
  genre: string;
  status: 'draft' | 'writing' | 'editing' | 'published';
  progress: number;
  wordCount: number;
  targetWordCount: number;
  chapters: Chapter[];
  publishedAt?: string;
  description: string;
  cover: string;
  tags: string[];
  language: string;
  publishingPlatforms: string[];
}

const BooksPageNewModern: React.FC = () => {
  const navigate = useNavigate();
  const [selectedTab, setSelectedTab] = useState<'all' | 'draft' | 'writing' | 'editing' | 'published'>('all');
  const [showBookModal, setShowBookModal] = useState(false);
  const [selectedBook, setSelectedBook] = useState<BookItem | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const books: BookItem[] = [
    {
      id: '1',
      title: 'Digital Music Production Mastery',
      author: 'Alex Chen',
      genre: 'Technology',
      status: 'published',
      progress: 100,
      wordCount: 85420,
      targetWordCount: 85000,
      publishedAt: '2024-01-15',
      description: 'A comprehensive guide to modern digital audio workstations and production techniques.',
      cover: '🎵',
      tags: ['Music', 'Technology', 'Production', 'DAW'],
      language: 'English',
      publishingPlatforms: ['Amazon KDP', 'Apple Books', 'Google Play Books'],
      chapters: [
        { id: '1-1', title: 'Introduction to Digital Audio', wordCount: 3250, status: 'complete', lastEdited: '2024-01-10' },
        { id: '1-2', title: 'Setting Up Your Studio', wordCount: 4120, status: 'complete', lastEdited: '2024-01-10' },
        { id: '1-3', title: 'DAW Fundamentals', wordCount: 5680, status: 'complete', lastEdited: '2024-01-12' },
        { id: '1-4', title: 'Recording Techniques', wordCount: 6420, status: 'complete', lastEdited: '2024-01-13' },
        { id: '1-5', title: 'Mixing and Mastering', wordCount: 7850, status: 'complete', lastEdited: '2024-01-14' }
      ]
    },
    {
      id: '2',
      title: 'The Business of Electronic Music',
      author: 'Sarah Johnson',
      genre: 'Business',
      status: 'editing',
      progress: 85,
      wordCount: 68000,
      targetWordCount: 80000,
      description: 'Navigate the complex world of electronic music business, from artist contracts to digital distribution.',
      cover: '💼',
      tags: ['Business', 'Music Industry', 'Contracts', 'Marketing'],
      language: 'English',
      publishingPlatforms: ['Amazon KDP', 'Apple Books'],
      chapters: [
        { id: '2-1', title: 'Music Industry Overview', wordCount: 4500, status: 'complete', lastEdited: '2024-02-15' },
        { id: '2-2', title: 'Artist Development', wordCount: 5200, status: 'complete', lastEdited: '2024-02-18' },
        { id: '2-3', title: 'Contract Negotiations', wordCount: 6800, status: 'review', lastEdited: '2024-02-20' },
        { id: '2-4', title: 'Digital Distribution', wordCount: 5900, status: 'review', lastEdited: '2024-02-22' },
        { id: '2-5', title: 'Marketing Strategies', wordCount: 3200, status: 'draft', lastEdited: '2024-02-25' }
      ]
    },
    {
      id: '3',
      title: 'Songwriting for the Digital Age',
      author: 'Mike Rodriguez',
      genre: 'Music Education',
      status: 'writing',
      progress: 45,
      wordCount: 36000,
      targetWordCount: 80000,
      description: 'Modern songwriting techniques incorporating digital tools and AI assistance.',
      cover: '✍️',
      tags: ['Songwriting', 'Creativity', 'Digital Tools', 'AI'],
      language: 'English',
      publishingPlatforms: [],
      chapters: [
        { id: '3-1', title: 'Fundamentals of Songwriting', wordCount: 4200, status: 'complete', lastEdited: '2024-03-01' },
        { id: '3-2', title: 'Melody and Harmony', wordCount: 3800, status: 'complete', lastEdited: '2024-03-05' },
        { id: '3-3', title: 'Lyric Writing Techniques', wordCount: 4500, status: 'review', lastEdited: '2024-03-08' },
        { id: '3-4', title: 'Digital Collaboration Tools', wordCount: 2100, status: 'draft', lastEdited: '2024-03-10' },
        { id: '3-5', title: 'AI-Assisted Songwriting', wordCount: 1800, status: 'draft', lastEdited: '2024-03-12' }
      ]
    },
    {
      id: '4',
      title: 'Audio Engineering Fundamentals',
      author: 'Emma Wilson',
      genre: 'Technology',
      status: 'draft',
      progress: 15,
      wordCount: 12000,
      targetWordCount: 75000,
      description: 'Essential principles of audio engineering for beginners and intermediate practitioners.',
      cover: '🔧',
      tags: ['Audio Engineering', 'Technology', 'Sound Design', 'Recording'],
      language: 'English',
      publishingPlatforms: [],
      chapters: [
        { id: '4-1', title: 'Sound Theory Basics', wordCount: 3200, status: 'complete', lastEdited: '2024-03-15' },
        { id: '4-2', title: 'Microphone Techniques', wordCount: 2800, status: 'draft', lastEdited: '2024-03-18' },
        { id: '4-3', title: 'Signal Processing', wordCount: 1500, status: 'draft', lastEdited: '2024-03-20' }
      ]
    }
  ];

  const getStatusGradient = (status: string) => {
    switch (status) {
      case 'published': return 'linear-gradient(135deg, #10b981, #059669)';
      case 'editing': return 'linear-gradient(135deg, #3b82f6, #2563eb)';
      case 'writing': return 'linear-gradient(135deg, #f59e0b, #d97706)';
      case 'draft': return 'linear-gradient(135deg, #6b7280, #4b5563)';
      case 'complete': return 'linear-gradient(135deg, #10b981, #059669)';
      case 'review': return 'linear-gradient(135deg, #FF9900, #FF7700)';
      default: return 'linear-gradient(135deg, #6b7280, #4b5563)';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'published': return <CheckCircle size={16} className="text-green-500" />;
      case 'editing': return <Edit size={16} className="text-blue-500" />;
      case 'writing': return <FileText size={16} className="text-yellow-500" />;
      case 'draft': return <Book size={16} className="text-gray-500" />;
      case 'complete': return <CheckCircle size={16} className="text-green-500" />;
      case 'review': return <Eye size={16} className="text-orange-500" />;
      default: return <Book size={16} className="text-gray-500" />;
    }
  };

  const filteredBooks = selectedTab === 'all' ? books : books.filter(book => book.status === selectedTab);

  const formatNumber = (num: number) => {
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const calculateReadingTime = (wordCount: number) => {
    const avgWordsPerMinute = 250;
    const minutes = Math.ceil(wordCount / avgWordsPerMinute);
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return `${hours}h ${remainingMinutes}m`;
  };

  return (
    <div style={{
      minHeight: '100vh',
      backgroundImage: 'linear-gradient(rgba(0,0,0,0.3), rgba(0,0,0,0.5)), url(https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=2070)',
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundAttachment: 'fixed',
      padding: '24px'
    }}>
      {/* Header */}
      <div style={{
        background: 'rgba(255, 255, 255, 0.25)',
        borderRadius: '20px',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        padding: '32px',
        border: '1px solid rgba(255, 255, 255, 0.2)',
        backdropFilter: 'blur(16px)',
        marginBottom: '32px'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '24px'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '16px'
          }}>
            <div style={{
              width: '48px',
              height: '48px',
              background: 'linear-gradient(135deg, #FF9900, #FF7700)',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 8px 25px -8px rgba(255, 153, 0, 0.4)'
            }}>
              <BookOpen size={24} className="text-white" />
            </div>
            <div>
              <h1 style={{
                fontSize: '32px',
                fontWeight: 'bold',
                color: 'white',
                margin: '0'
              }}>Books Management</h1>
              <p style={{
                color: 'rgba(255, 255, 255, 0.8)',
                margin: '8px 0 0 0'
              }}>Manage your book manuscripts and publishing pipeline</p>
            </div>
          </div>

          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }}>
            <div style={{
              display: 'flex',
              background: 'rgba(255, 255, 255, 0.2)',
              borderRadius: '12px',
              padding: '4px',
              backdropFilter: 'blur(8px)'
            }}>
              <button
                onClick={() => setViewMode('grid')}
                style={{
                  padding: '8px 12px',
                  fontSize: '14px',
                  fontWeight: '600',
                  borderRadius: '8px',
                  border: 'none',
                  cursor: 'pointer',
                  background: viewMode === 'grid'
                    ? 'rgba(255, 255, 255, 0.9)'
                    : 'transparent',
                  color: viewMode === 'grid'
                    ? '#FF9900'
                    : 'rgba(255, 255, 255, 0.8)',
                  transition: 'all 0.3s',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <Grid3X3 size={16} />
                Grid
              </button>
              <button
                onClick={() => setViewMode('list')}
                style={{
                  padding: '8px 12px',
                  fontSize: '14px',
                  fontWeight: '600',
                  borderRadius: '8px',
                  border: 'none',
                  cursor: 'pointer',
                  background: viewMode === 'list'
                    ? 'rgba(255, 255, 255, 0.9)'
                    : 'transparent',
                  color: viewMode === 'list'
                    ? '#FF9900'
                    : 'rgba(255, 255, 255, 0.8)',
                  transition: 'all 0.3s',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <List size={16} />
                List
              </button>
            </div>
            <button
              onClick={() => navigate('/books/new')}
              style={{
                background: 'linear-gradient(135deg, #FF9900 0%, #FF7700 100%)',
                color: 'white',
                fontWeight: '600',
                padding: '12px 24px',
                borderRadius: '12px',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                boxShadow: '0 8px 25px -8px rgba(255, 153, 0, 0.4)',
                transition: 'all 0.3s'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 12px 35px -8px rgba(255, 153, 0, 0.6)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 8px 25px -8px rgba(255, 153, 0, 0.4)';
              }}
            >
              <Plus size={20} />
              <span>New Book</span>
            </button>
          </div>
        </div>

        {/* Stats Overview */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '20px',
          marginBottom: '24px'
        }}>
          <div style={{
            background: 'rgba(255, 255, 255, 0.2)',
            borderRadius: '16px',
            padding: '20px',
            backdropFilter: 'blur(8px)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            transition: 'all 0.3s'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.3)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)';
          }}
          >
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '8px'
            }}>
              <div style={{
                width: '40px',
                height: '40px',
                background: 'linear-gradient(135deg, #FF9900, #FF7700)',
                borderRadius: '10px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <BookOpen size={20} className="text-white" />
              </div>
              <div style={{ textAlign: 'right' }}>
                <p style={{
                  fontSize: '24px',
                  fontWeight: '700',
                  color: 'white',
                  margin: '0'
                }}>{books.length}</p>
                <p style={{
                  fontSize: '14px',
                  color: 'rgba(255, 255, 255, 0.8)',
                  margin: '0'
                }}>Total Books</p>
              </div>
            </div>
          </div>

          <div style={{
            background: 'rgba(255, 255, 255, 0.2)',
            borderRadius: '16px',
            padding: '20px',
            backdropFilter: 'blur(8px)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            transition: 'all 0.3s'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.3)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)';
          }}
          >
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '8px'
            }}>
              <div style={{
                width: '40px',
                height: '40px',
                background: 'linear-gradient(135deg, #10b981, #059669)',
                borderRadius: '10px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <CheckCircle size={20} className="text-white" />
              </div>
              <div style={{ textAlign: 'right' }}>
                <p style={{
                  fontSize: '24px',
                  fontWeight: '700',
                  color: 'white',
                  margin: '0'
                }}>{books.filter(b => b.status === 'published').length}</p>
                <p style={{
                  fontSize: '14px',
                  color: 'rgba(255, 255, 255, 0.8)',
                  margin: '0'
                }}>Published</p>
              </div>
            </div>
          </div>

          <div style={{
            background: 'rgba(255, 255, 255, 0.2)',
            borderRadius: '16px',
            padding: '20px',
            backdropFilter: 'blur(8px)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            transition: 'all 0.3s'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.3)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)';
          }}
          >
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '8px'
            }}>
              <div style={{
                width: '40px',
                height: '40px',
                background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                borderRadius: '10px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <FileText size={20} className="text-white" />
              </div>
              <div style={{ textAlign: 'right' }}>
                <p style={{
                  fontSize: '24px',
                  fontWeight: '700',
                  color: 'white',
                  margin: '0'
                }}>{books.filter(b => b.status === 'writing').length}</p>
                <p style={{
                  fontSize: '14px',
                  color: 'rgba(255, 255, 255, 0.8)',
                  margin: '0'
                }}>In Progress</p>
              </div>
            </div>
          </div>

          <div style={{
            background: 'rgba(255, 255, 255, 0.2)',
            borderRadius: '16px',
            padding: '20px',
            backdropFilter: 'blur(8px)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            transition: 'all 0.3s'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.3)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)';
          }}
          >
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '8px'
            }}>
              <div style={{
                width: '40px',
                height: '40px',
                background: 'linear-gradient(135deg, #8B5CF6, #7C3AED)',
                borderRadius: '10px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <TrendingUp size={20} className="text-white" />
              </div>
              <div style={{ textAlign: 'right' }}>
                <p style={{
                  fontSize: '24px',
                  fontWeight: '700',
                  color: 'white',
                  margin: '0'
                }}>{formatNumber(books.reduce((sum, book) => sum + book.wordCount, 0))}</p>
                <p style={{
                  fontSize: '14px',
                  color: 'rgba(255, 255, 255, 0.8)',
                  margin: '0'
                }}>Total Words</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filter Tabs */}
        <div style={{
          display: 'flex',
          gap: '8px',
          background: 'rgba(255, 255, 255, 0.2)',
          borderRadius: '12px',
          padding: '8px',
          backdropFilter: 'blur(8px)'
        }}>
          {(['all', 'draft', 'writing', 'editing', 'published'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setSelectedTab(tab)}
              style={{
                padding: '8px 16px',
                fontSize: '14px',
                fontWeight: '600',
                borderRadius: '8px',
                border: 'none',
                cursor: 'pointer',
                background: selectedTab === tab
                  ? 'rgba(255, 255, 255, 0.9)'
                  : 'transparent',
                color: selectedTab === tab
                  ? '#FF9900'
                  : 'rgba(255, 255, 255, 0.8)',
                boxShadow: selectedTab === tab
                  ? '0 4px 12px rgba(0, 0, 0, 0.1)'
                  : 'none',
                transition: 'all 0.3s',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              {tab === 'all' ? <BookOpen size={16} /> : getStatusIcon(tab)}
              {tab === 'all' ? 'All Books' : tab.charAt(0).toUpperCase() + tab.slice(1)}
              <span style={{
                marginLeft: '4px',
                fontSize: '12px',
                opacity: 0.8
              }}>
                ({tab === 'all' ? books.length : books.filter(b => b.status === tab).length})
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Books Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: viewMode === 'grid'
          ? 'repeat(auto-fit, minmax(400px, 1fr))'
          : '1fr',
        gap: '24px'
      }}>
        {filteredBooks.map((book) => (
          <div
            key={book.id}
            style={{
              background: 'rgba(255, 255, 255, 0.25)',
              borderRadius: '20px',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              backdropFilter: 'blur(16px)',
              overflow: 'hidden',
              cursor: 'pointer',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
            }}
            onClick={() => setSelectedBook(book)}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-4px) scale(1.02)';
              e.currentTarget.style.boxShadow = '0 32px 64px -12px rgba(0, 0, 0, 0.4)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0) scale(1)';
              e.currentTarget.style.boxShadow = '0 25px 50px -12px rgba(0, 0, 0, 0.25)';
            }}
          >
            {/* Book Header */}
            <div style={{
              padding: '24px 24px 20px 24px',
              borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '16px',
                marginBottom: '16px'
              }}>
                <div style={{
                  width: '64px',
                  height: '64px',
                  background: 'linear-gradient(135deg, #FF9900 0%, #FF6600 100%)',
                  borderRadius: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '24px',
                  boxShadow: '0 12px 30px -8px rgba(255, 153, 0, 0.4)'
                }}>
                  {book.cover}
                </div>
                <div style={{ flex: 1, minWidth: '0' }}>
                  <h3 style={{
                    fontSize: '20px',
                    fontWeight: '700',
                    color: 'white',
                    margin: '0 0 4px 0',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap'
                  }}>{book.title}</h3>
                  <p style={{
                    fontSize: '14px',
                    color: 'rgba(255, 255, 255, 0.7)',
                    margin: '0 0 8px 0'
                  }}>{book.author}</p>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}>
                    <span style={{
                      background: getStatusGradient(book.status),
                      padding: '4px 12px',
                      borderRadius: '12px',
                      fontSize: '12px',
                      fontWeight: '600',
                      color: 'white',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}>
                      {getStatusIcon(book.status)}
                      {book.status.toUpperCase()}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Progress Section */}
            <div style={{
              padding: '20px 24px',
              borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '8px'
              }}>
                <span style={{
                  fontSize: '14px',
                  fontWeight: '600',
                  color: 'rgba(255, 255, 255, 0.8)'
                }}>Progress</span>
                <span style={{
                  fontSize: '14px',
                  fontWeight: '600',
                  color: 'white'
                }}>{book.progress}%</span>
              </div>
              <div style={{
                width: '100%',
                height: '8px',
                background: 'rgba(255, 255, 255, 0.2)',
                borderRadius: '4px',
                overflow: 'hidden'
              }}>
                <div
                  style={{
                    width: `${book.progress}%`,
                    height: '100%',
                    background: 'linear-gradient(135deg, #FF9900, #FF6600)',
                    borderRadius: '4px',
                    transition: 'width 0.5s ease'
                  }}
                />
              </div>
            </div>

            {/* Book Stats */}
            <div style={{
              padding: '20px 24px',
              borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
            }}>
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr 1fr',
                gap: '16px'
              }}>
                <div>
                  <p style={{
                    fontSize: '12px',
                    color: 'rgba(255, 255, 255, 0.6)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                    margin: '0 0 4px 0'
                  }}>Words</p>
                  <p style={{
                    fontSize: '16px',
                    fontWeight: '600',
                    color: 'white',
                    margin: '0'
                  }}>{formatNumber(book.wordCount)}</p>
                </div>
                <div>
                  <p style={{
                    fontSize: '12px',
                    color: 'rgba(255, 255, 255, 0.6)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                    margin: '0 0 4px 0'
                  }}>Chapters</p>
                  <p style={{
                    fontSize: '16px',
                    fontWeight: '600',
                    color: 'white',
                    margin: '0'
                  }}>{book.chapters.length}</p>
                </div>
                <div>
                  <p style={{
                    fontSize: '12px',
                    color: 'rgba(255, 255, 255, 0.6)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                    margin: '0 0 4px 0'
                  }}>Read Time</p>
                  <p style={{
                    fontSize: '16px',
                    fontWeight: '600',
                    color: 'white',
                    margin: '0'
                  }}>{calculateReadingTime(book.wordCount)}</p>
                </div>
              </div>
            </div>

            {/* Tags */}
            <div style={{
              padding: '20px 24px',
              borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
            }}>
              <p style={{
                fontSize: '12px',
                color: 'rgba(255, 255, 255, 0.6)',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                margin: '0 0 8px 0'
              }}>Tags</p>
              <div style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: '8px'
              }}>
                {book.tags.slice(0, 3).map((tag, index) => (
                  <span
                    key={index}
                    style={{
                      background: 'rgba(255, 153, 0, 0.2)',
                      border: '1px solid rgba(255, 153, 0, 0.3)',
                      padding: '4px 8px',
                      borderRadius: '8px',
                      fontSize: '12px',
                      fontWeight: '500',
                      color: 'white',
                      backdropFilter: 'blur(4px)'
                    }}
                  >
                    {tag}
                  </span>
                ))}
                {book.tags.length > 3 && (
                  <span style={{
                    background: 'rgba(255, 255, 255, 0.1)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    padding: '4px 8px',
                    borderRadius: '8px',
                    fontSize: '12px',
                    fontWeight: '500',
                    color: 'rgba(255, 255, 255, 0.7)',
                    backdropFilter: 'blur(4px)'
                  }}>
                    +{book.tags.length - 3} more
                  </span>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div style={{ padding: '20px 24px' }}>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button style={{
                  flex: 1,
                  background: 'rgba(255, 255, 255, 0.2)',
                  color: 'white',
                  fontSize: '14px',
                  fontWeight: '500',
                  padding: '10px 16px',
                  borderRadius: '8px',
                  border: 'none',
                  cursor: 'pointer',
                  backdropFilter: 'blur(4px)',
                  transition: 'all 0.3s',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.3)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)';
                }}
                >
                  <Edit size={16} />
                  Edit
                </button>
                <button style={{
                  flex: 1,
                  background: 'linear-gradient(135deg, #FF9900 0%, #FF6600 100%)',
                  color: 'white',
                  fontSize: '14px',
                  fontWeight: '500',
                  padding: '10px 16px',
                  borderRadius: '8px',
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'all 0.3s',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-1px)';
                  e.currentTarget.style.boxShadow = '0 8px 20px rgba(255, 153, 0, 0.4)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
                >
                  <Eye size={16} />
                  View
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BooksPageNewModern;
