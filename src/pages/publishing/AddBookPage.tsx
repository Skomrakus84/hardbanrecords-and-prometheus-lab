import React, { useState } from 'react';
import {
  ArrowLeft,
  Upload,
  BookOpen,
  Calendar,
  Globe,
  Tag,
  Users,
  FileText,
  Image,
  Save,
  Send,
  AlertCircle,
  CheckCircle,
  Plus,
  Trash2,
  Eye
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface ChapterData {
  id: string;
  title: string;
  wordCount: number;
  content: string;
  chapterNumber: number;
  status: 'draft' | 'review' | 'complete';
}

interface BookFormData {
  // Basic Info
  title: string;
  author: string;
  coAuthors: string[];
  publisher: string;
  genre: string;
  subgenres: string[];
  bookType: 'fiction' | 'non-fiction' | 'poetry' | 'biography' | 'technical';

  // Book Details
  publishDate: string;
  isbn: string;
  isbn13: string;
  edition: string;

  // Content
  description: string;
  synopsis: string;
  tableOfContents: string;
  dedication?: string;
  acknowledgments?: string;
  coverImage?: File;
  chapters: ChapterData[];

  // Publishing
  stores: string[];
  territories: string[];
  distributionStartDate: string;
  distributionEndDate?: string;

  // Metadata
  language: string;
  ageRating: string;
  tags: string[];
  keywords: string[];
  categories: string[];

  // Rights & Pricing
  copyrightOwner: string;
  publishingRights: string;
  priceUSD: number;
  priceEUR: number;
  priceGBP: number;
  royaltySplits: { author: string; percentage: number }[];

  // Marketing
  marketingDescription: string;
  targetAudience: string;
  competitorBooks: string[];
  socialMedia: {
    website?: string;
    twitter?: string;
    facebook?: string;
    instagram?: string;
  };

  // Technical
  pageCount: number;
  wordCount: number;
  format: string[];
  drm: boolean;
}

const AddBookPage: React.FC = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState<BookFormData>({
    title: '',
    author: '',
    coAuthors: [],
    publisher: 'HardbanRecords Publishing',
    genre: '',
    subgenres: [],
    bookType: 'fiction',
    publishDate: '',
    isbn: '',
    isbn13: '',
    edition: '1',
    description: '',
    synopsis: '',
    tableOfContents: '',
    chapters: [{
      id: '1',
      title: 'Chapter 1',
      wordCount: 0,
      content: '',
      chapterNumber: 1,
      status: 'draft'
    }],
    stores: [],
    territories: ['Global'],
    distributionStartDate: '',
    language: 'en',
    ageRating: 'All Ages',
    tags: [],
    keywords: [],
    categories: [],
    copyrightOwner: '',
    publishingRights: '',
    priceUSD: 9.99,
    priceEUR: 8.99,
    priceGBP: 7.99,
    royaltySplits: [],
    marketingDescription: '',
    targetAudience: '',
    competitorBooks: [],
    socialMedia: {},
    pageCount: 0,
    wordCount: 0,
    format: ['EPUB', 'PDF'],
    drm: false
  });

  const STORES = [
    { id: 'amazon-kdp', name: 'Amazon KDP', color: '#FF9900' },
    { id: 'apple-books', name: 'Apple Books', color: '#007AFF' },
    { id: 'google-play', name: 'Google Play Books', color: '#4285F4' },
    { id: 'barnes-noble', name: 'Barnes & Noble', color: '#00704A' },
    { id: 'kobo', name: 'Kobo', color: '#68BCE5' },
    { id: 'smashwords', name: 'Smashwords', color: '#1BA1E2' },
    { id: 'draft2digital', name: 'Draft2Digital', color: '#E74C3C' },
    { id: 'ingram-spark', name: 'IngramSpark', color: '#2C3E50' }
  ];

  const GENRES = [
    'Fiction', 'Non-Fiction', 'Mystery', 'Romance', 'Science Fiction', 'Fantasy',
    'Thriller', 'Biography', 'Self-Help', 'Business', 'Health', 'Travel',
    'History', 'Poetry', 'Drama', 'Children\'s', 'Young Adult', 'Technical'
  ];

  const CATEGORIES = [
    'Literature & Fiction', 'Business & Money', 'Health & Fitness', 'Self-Help',
    'Science & Math', 'History', 'Biography & Memoir', 'Travel', 'Romance',
    'Mystery & Suspense', 'Science Fiction & Fantasy', 'Children\'s Books'
  ];

  const TERRITORIES = [
    'Global', 'North America', 'Europe', 'Asia', 'South America',
    'Africa', 'Oceania', 'United States', 'Canada', 'United Kingdom',
    'Germany', 'France', 'Japan', 'Australia'
  ];

  const steps = [
    { number: 1, title: 'Basic Info', icon: BookOpen },
    { number: 2, title: 'Content & Chapters', icon: FileText },
    { number: 3, title: 'Publishing Stores', icon: Globe },
    { number: 4, title: 'Metadata & Categories', icon: Tag },
    { number: 5, title: 'Rights & Pricing', icon: Users },
    { number: 6, title: 'Review & Submit', icon: Send }
  ];

  const handleInputChange = (field: keyof BookFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const addChapter = () => {
    setFormData(prev => ({
      ...prev,
      chapters: [...prev.chapters, {
        id: Date.now().toString(),
        title: `Chapter ${prev.chapters.length + 1}`,
        wordCount: 0,
        content: '',
        chapterNumber: prev.chapters.length + 1,
        status: 'draft'
      }]
    }));
  };

  const removeChapter = (id: string) => {
    setFormData(prev => ({
      ...prev,
      chapters: prev.chapters.filter(chapter => chapter.id !== id)
    }));
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsSubmitting(false);
    // Navigate back or show success
    navigate('/books');
  };

  const containerStyle = {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #FF9900 0%, #FF7700 100%)',
    backgroundImage: 'url("https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=1600&h=900&fit=crop")',
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundAttachment: 'fixed',
    padding: '20px',
    position: 'relative' as const
  };

  const overlayStyle = {
    position: 'absolute' as const,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'linear-gradient(135deg, rgba(255, 153, 0, 0.9) 0%, rgba(255, 119, 0, 0.9) 100%)',
    zIndex: 1
  };

  const contentStyle = {
    position: 'relative' as const,
    zIndex: 2,
    maxWidth: '1200px',
    margin: '0 auto'
  };

  const cardStyle = {
    background: 'rgba(255, 255, 255, 0.1)',
    backdropFilter: 'blur(20px)',
    borderRadius: '24px',
    padding: '40px',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    boxShadow: '0 25px 50px rgba(0, 0, 0, 0.1)',
    color: '#ffffff',
    marginBottom: '24px'
  };

  const inputStyle = {
    width: '100%',
    background: 'rgba(255, 255, 255, 0.1)',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    borderRadius: '12px',
    padding: '12px 16px',
    color: '#ffffff',
    fontSize: '1rem',
    outline: 'none'
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div>
            <h2 style={{ fontSize: '2rem', fontWeight: '700', marginBottom: '32px', color: '#ffffff' }}>
              Basic Book Information
            </h2>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '24px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', color: '#ffffff', fontWeight: '500' }}>
                  Book Title *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  style={inputStyle}
                  placeholder="Enter book title"
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', color: '#ffffff', fontWeight: '500' }}>
                  Author *
                </label>
                <input
                  type="text"
                  value={formData.author}
                  onChange={(e) => handleInputChange('author', e.target.value)}
                  style={inputStyle}
                  placeholder="Author name"
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '24px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', color: '#ffffff', fontWeight: '500' }}>
                  Genre *
                </label>
                <select
                  value={formData.genre}
                  onChange={(e) => handleInputChange('genre', e.target.value)}
                  style={inputStyle}
                >
                  <option value="">Select Genre</option>
                  {GENRES.map(genre => (
                    <option key={genre} value={genre}>{genre}</option>
                  ))}
                </select>
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', color: '#ffffff', fontWeight: '500' }}>
                  Book Type *
                </label>
                <select
                  value={formData.bookType}
                  onChange={(e) => handleInputChange('bookType', e.target.value)}
                  style={inputStyle}
                >
                  <option value="fiction">Fiction</option>
                  <option value="non-fiction">Non-Fiction</option>
                  <option value="poetry">Poetry</option>
                  <option value="biography">Biography</option>
                  <option value="technical">Technical</option>
                </select>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '24px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', color: '#ffffff', fontWeight: '500' }}>
                  Publish Date *
                </label>
                <input
                  type="date"
                  value={formData.publishDate}
                  onChange={(e) => handleInputChange('publishDate', e.target.value)}
                  style={inputStyle}
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', color: '#ffffff', fontWeight: '500' }}>
                  Publisher
                </label>
                <input
                  type="text"
                  value={formData.publisher}
                  onChange={(e) => handleInputChange('publisher', e.target.value)}
                  style={inputStyle}
                  placeholder="Publisher name"
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '24px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', color: '#ffffff', fontWeight: '500' }}>
                  ISBN-10
                </label>
                <input
                  type="text"
                  value={formData.isbn}
                  onChange={(e) => handleInputChange('isbn', e.target.value)}
                  style={inputStyle}
                  placeholder="ISBN-10"
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', color: '#ffffff', fontWeight: '500' }}>
                  ISBN-13
                </label>
                <input
                  type="text"
                  value={formData.isbn13}
                  onChange={(e) => handleInputChange('isbn13', e.target.value)}
                  style={inputStyle}
                  placeholder="ISBN-13"
                />
              </div>
            </div>

            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', marginBottom: '8px', color: '#ffffff', fontWeight: '500' }}>
                Book Description *
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                style={{ ...inputStyle, minHeight: '120px', resize: 'vertical' }}
                placeholder="Describe your book..."
              />
            </div>

            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', marginBottom: '8px', color: '#ffffff', fontWeight: '500' }}>
                Book Synopsis
              </label>
              <textarea
                value={formData.synopsis}
                onChange={(e) => handleInputChange('synopsis', e.target.value)}
                style={{ ...inputStyle, minHeight: '100px', resize: 'vertical' }}
                placeholder="Brief synopsis for marketing..."
              />
            </div>

            {/* Cover Image Upload */}
            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', marginBottom: '8px', color: '#ffffff', fontWeight: '500' }}>
                Cover Image (1600x2560px recommended) *
              </label>
              <div style={{
                border: '2px dashed rgba(255, 255, 255, 0.3)',
                borderRadius: '12px',
                padding: '32px',
                textAlign: 'center',
                cursor: 'pointer',
                transition: 'all 0.3s ease'
              }}>
                <Upload size={32} style={{ margin: '0 auto 16px', color: '#FF9900' }} />
                <p style={{ color: '#ffffff', fontSize: '1.1rem', marginBottom: '8px' }}>
                  Click to upload book cover
                </p>
                <p style={{ color: '#ffffff', opacity: 0.7, fontSize: '0.9rem' }}>
                  JPG, PNG - 1600x2560px recommended
                </p>
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div>
            <h2 style={{ fontSize: '2rem', fontWeight: '700', marginBottom: '32px', color: '#ffffff' }}>
              Content & Chapters
            </h2>

            {formData.chapters.map((chapter, index) => (
              <div key={chapter.id} style={{
                background: 'rgba(255, 255, 255, 0.05)',
                borderRadius: '16px',
                padding: '24px',
                marginBottom: '20px',
                border: '1px solid rgba(255, 255, 255, 0.1)'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                  <h3 style={{ fontSize: '1.3rem', fontWeight: '600', color: '#ffffff' }}>
                    Chapter {index + 1}
                  </h3>
                  {formData.chapters.length > 1 && (
                    <button
                      onClick={() => removeChapter(chapter.id)}
                      style={{
                        background: 'rgba(239, 68, 68, 0.2)',
                        border: '1px solid rgba(239, 68, 68, 0.3)',
                        borderRadius: '8px',
                        padding: '8px',
                        color: '#EF4444',
                        cursor: 'pointer'
                      }}
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '20px', marginBottom: '20px' }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: '8px', color: '#ffffff', fontWeight: '500' }}>
                      Chapter Title *
                    </label>
                    <input
                      type="text"
                      value={chapter.title}
                      onChange={(e) => {
                        const updatedChapters = formData.chapters.map(c =>
                          c.id === chapter.id ? { ...c, title: e.target.value } : c
                        );
                        handleInputChange('chapters', updatedChapters);
                      }}
                      style={inputStyle}
                      placeholder="Chapter title"
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '8px', color: '#ffffff', fontWeight: '500' }}>
                      Word Count
                    </label>
                    <input
                      type="number"
                      value={chapter.wordCount}
                      onChange={(e) => {
                        const updatedChapters = formData.chapters.map(c =>
                          c.id === chapter.id ? { ...c, wordCount: parseInt(e.target.value) || 0 } : c
                        );
                        handleInputChange('chapters', updatedChapters);
                      }}
                      style={inputStyle}
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '8px', color: '#ffffff', fontWeight: '500' }}>
                      Status
                    </label>
                    <select
                      value={chapter.status}
                      onChange={(e) => {
                        const updatedChapters = formData.chapters.map(c =>
                          c.id === chapter.id ? { ...c, status: e.target.value as 'draft' | 'review' | 'complete' } : c
                        );
                        handleInputChange('chapters', updatedChapters);
                      }}
                      style={inputStyle}
                    >
                      <option value="draft">Draft</option>
                      <option value="review">Review</option>
                      <option value="complete">Complete</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '8px', color: '#ffffff', fontWeight: '500' }}>
                    Chapter Content
                  </label>
                  <textarea
                    value={chapter.content}
                    onChange={(e) => {
                      const updatedChapters = formData.chapters.map(c =>
                        c.id === chapter.id ? { ...c, content: e.target.value } : c
                      );
                      handleInputChange('chapters', updatedChapters);
                    }}
                    style={{ ...inputStyle, minHeight: '150px', resize: 'vertical' }}
                    placeholder="Chapter content or outline..."
                  />
                </div>
              </div>
            ))}

            <button
              onClick={addChapter}
              style={{
                background: 'linear-gradient(135deg, #FF9900 0%, #FF7700 100%)',
                border: 'none',
                borderRadius: '12px',
                padding: '12px 24px',
                color: '#ffffff',
                fontSize: '1rem',
                fontWeight: '600',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                margin: '0 auto'
              }}
            >
              <Plus size={20} />
              Add Another Chapter
            </button>

            <div style={{ marginTop: '32px', padding: '24px', background: 'rgba(255, 255, 255, 0.05)', borderRadius: '12px' }}>
              <h4 style={{ fontSize: '1.2rem', fontWeight: '600', marginBottom: '16px', color: '#ffffff' }}>
                Table of Contents
              </h4>
              <textarea
                value={formData.tableOfContents}
                onChange={(e) => handleInputChange('tableOfContents', e.target.value)}
                style={{ ...inputStyle, minHeight: '120px', resize: 'vertical' }}
                placeholder="Optional: Detailed table of contents..."
              />
            </div>
          </div>
        );

      case 3:
        return (
          <div>
            <h2 style={{ fontSize: '2rem', fontWeight: '700', marginBottom: '32px', color: '#ffffff' }}>
              Publishing Stores & Distribution
            </h2>

            <div style={{ marginBottom: '32px' }}>
              <h3 style={{ fontSize: '1.3rem', fontWeight: '600', marginBottom: '16px', color: '#ffffff' }}>
                Publishing Stores
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px' }}>
                {STORES.map(store => (
                  <label key={store.id} style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '16px',
                    background: formData.stores.includes(store.id)
                      ? `${store.color}20`
                      : 'rgba(255, 255, 255, 0.05)',
                    borderRadius: '12px',
                    cursor: 'pointer',
                    border: formData.stores.includes(store.id)
                      ? `2px solid ${store.color}`
                      : '2px solid rgba(255, 255, 255, 0.1)',
                    transition: 'all 0.3s ease'
                  }}>
                    <input
                      type="checkbox"
                      checked={formData.stores.includes(store.id)}
                      onChange={(e) => {
                        const stores = e.target.checked
                          ? [...formData.stores, store.id]
                          : formData.stores.filter(s => s !== store.id);
                        handleInputChange('stores', stores);
                      }}
                      style={{ display: 'none' }}
                    />
                    <div style={{
                      width: '12px',
                      height: '12px',
                      borderRadius: '3px',
                      background: formData.stores.includes(store.id) ? store.color : 'rgba(255, 255, 255, 0.3)',
                      border: `2px solid ${formData.stores.includes(store.id) ? store.color : 'rgba(255, 255, 255, 0.3)'}`
                    }}></div>
                    <span style={{ color: '#ffffff', fontWeight: '500' }}>
                      {store.name}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '24px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', color: '#ffffff', fontWeight: '500' }}>
                  Distribution Start Date *
                </label>
                <input
                  type="date"
                  value={formData.distributionStartDate}
                  onChange={(e) => handleInputChange('distributionStartDate', e.target.value)}
                  style={inputStyle}
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', color: '#ffffff', fontWeight: '500' }}>
                  Distribution End Date (Optional)
                </label>
                <input
                  type="date"
                  value={formData.distributionEndDate || ''}
                  onChange={(e) => handleInputChange('distributionEndDate', e.target.value)}
                  style={inputStyle}
                />
              </div>
            </div>

            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', marginBottom: '8px', color: '#ffffff', fontWeight: '500' }}>
                Territories
              </label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {TERRITORIES.map(territory => (
                  <label key={territory} style={{
                    padding: '8px 16px',
                    background: formData.territories.includes(territory)
                      ? '#FF9900'
                      : 'rgba(255, 255, 255, 0.1)',
                    borderRadius: '20px',
                    cursor: 'pointer',
                    fontSize: '0.9rem',
                    color: '#ffffff',
                    transition: 'all 0.3s ease'
                  }}>
                    <input
                      type="checkbox"
                      checked={formData.territories.includes(territory)}
                      onChange={(e) => {
                        const territories = e.target.checked
                          ? [...formData.territories, territory]
                          : formData.territories.filter(t => t !== territory);
                        handleInputChange('territories', territories);
                      }}
                      style={{ display: 'none' }}
                    />
                    {territory}
                  </label>
                ))}
              </div>
            </div>

            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', marginBottom: '8px', color: '#ffffff', fontWeight: '500' }}>
                Formats
              </label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
                {['EPUB', 'PDF', 'MOBI', 'AZW3', 'Paperback', 'Hardcover'].map(format => (
                  <label key={format} style={{
                    padding: '8px 16px',
                    background: formData.format.includes(format)
                      ? '#FF9900'
                      : 'rgba(255, 255, 255, 0.1)',
                    borderRadius: '20px',
                    cursor: 'pointer',
                    fontSize: '0.9rem',
                    color: '#ffffff',
                    transition: 'all 0.3s ease'
                  }}>
                    <input
                      type="checkbox"
                      checked={formData.format.includes(format)}
                      onChange={(e) => {
                        const formats = e.target.checked
                          ? [...formData.format, format]
                          : formData.format.filter(f => f !== format);
                        handleInputChange('format', formats);
                      }}
                      style={{ display: 'none' }}
                    />
                    {format}
                  </label>
                ))}
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div>
            <h2 style={{ fontSize: '2rem', fontWeight: '700', marginBottom: '32px', color: '#ffffff' }}>
              Metadata & Categories
            </h2>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '24px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', color: '#ffffff', fontWeight: '500' }}>
                  Language
                </label>
                <select
                  value={formData.language}
                  onChange={(e) => handleInputChange('language', e.target.value)}
                  style={inputStyle}
                >
                  <option value="en">English</option>
                  <option value="es">Spanish</option>
                  <option value="fr">French</option>
                  <option value="de">German</option>
                  <option value="it">Italian</option>
                  <option value="pt">Portuguese</option>
                  <option value="pl">Polish</option>
                </select>
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', color: '#ffffff', fontWeight: '500' }}>
                  Age Rating
                </label>
                <select
                  value={formData.ageRating}
                  onChange={(e) => handleInputChange('ageRating', e.target.value)}
                  style={inputStyle}
                >
                  <option value="All Ages">All Ages</option>
                  <option value="Young Adult">Young Adult (13+)</option>
                  <option value="Adult">Adult (18+)</option>
                  <option value="Mature">Mature Content</option>
                </select>
              </div>
            </div>

            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', marginBottom: '8px', color: '#ffffff', fontWeight: '500' }}>
                Categories
              </label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {CATEGORIES.map(category => (
                  <label key={category} style={{
                    padding: '8px 16px',
                    background: formData.categories.includes(category)
                      ? '#FF9900'
                      : 'rgba(255, 255, 255, 0.1)',
                    borderRadius: '20px',
                    cursor: 'pointer',
                    fontSize: '0.9rem',
                    color: '#ffffff',
                    transition: 'all 0.3s ease'
                  }}>
                    <input
                      type="checkbox"
                      checked={formData.categories.includes(category)}
                      onChange={(e) => {
                        const categories = e.target.checked
                          ? [...formData.categories, category]
                          : formData.categories.filter(c => c !== category);
                        handleInputChange('categories', categories);
                      }}
                      style={{ display: 'none' }}
                    />
                    {category}
                  </label>
                ))}
              </div>
            </div>

            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', marginBottom: '8px', color: '#ffffff', fontWeight: '500' }}>
                Keywords (for discoverability)
              </label>
              <input
                type="text"
                placeholder="Add keywords separated by commas"
                style={inputStyle}
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && e.currentTarget.value) {
                    const newKeywords = e.currentTarget.value.split(',').map(keyword => keyword.trim());
                    handleInputChange('keywords', [...formData.keywords, ...newKeywords]);
                    e.currentTarget.value = '';
                  }
                }}
              />
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '12px' }}>
                {formData.keywords.map((keyword, index) => (
                  <span key={index} style={{
                    padding: '4px 12px',
                    background: '#FF9900',
                    borderRadius: '16px',
                    fontSize: '0.8rem',
                    color: '#ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}>
                    {keyword}
                    <button
                      onClick={() => {
                        const updatedKeywords = formData.keywords.filter((_, i) => i !== index);
                        handleInputChange('keywords', updatedKeywords);
                      }}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: '#ffffff',
                        cursor: 'pointer',
                        padding: '0',
                        fontSize: '12px'
                      }}
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', color: '#ffffff', fontWeight: '500' }}>
                  Target Audience
                </label>
                <textarea
                  value={formData.targetAudience}
                  onChange={(e) => handleInputChange('targetAudience', e.target.value)}
                  style={{ ...inputStyle, minHeight: '100px', resize: 'vertical' }}
                  placeholder="Describe your target readers..."
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', color: '#ffffff', fontWeight: '500' }}>
                  Marketing Description
                </label>
                <textarea
                  value={formData.marketingDescription}
                  onChange={(e) => handleInputChange('marketingDescription', e.target.value)}
                  style={{ ...inputStyle, minHeight: '100px', resize: 'vertical' }}
                  placeholder="Marketing-focused description..."
                />
              </div>
            </div>
          </div>
        );

      case 5:
        return (
          <div>
            <h2 style={{ fontSize: '2rem', fontWeight: '700', marginBottom: '32px', color: '#ffffff' }}>
              Rights, Pricing & Legal
            </h2>

            <div style={{ marginBottom: '32px' }}>
              <h3 style={{ fontSize: '1.3rem', fontWeight: '600', marginBottom: '16px', color: '#ffffff' }}>
                Pricing
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', color: '#ffffff', fontWeight: '500' }}>
                    Price USD ($)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.priceUSD}
                    onChange={(e) => handleInputChange('priceUSD', parseFloat(e.target.value))}
                    style={inputStyle}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', color: '#ffffff', fontWeight: '500' }}>
                    Price EUR (€)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.priceEUR}
                    onChange={(e) => handleInputChange('priceEUR', parseFloat(e.target.value))}
                    style={inputStyle}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', color: '#ffffff', fontWeight: '500' }}>
                    Price GBP (£)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.priceGBP}
                    onChange={(e) => handleInputChange('priceGBP', parseFloat(e.target.value))}
                    style={inputStyle}
                  />
                </div>
              </div>
            </div>

            <div style={{ marginBottom: '32px' }}>
              <h3 style={{ fontSize: '1.3rem', fontWeight: '600', marginBottom: '16px', color: '#ffffff' }}>
                Rights & Ownership
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', color: '#ffffff', fontWeight: '500' }}>
                    Copyright Owner *
                  </label>
                  <input
                    type="text"
                    value={formData.copyrightOwner}
                    onChange={(e) => handleInputChange('copyrightOwner', e.target.value)}
                    style={inputStyle}
                    placeholder="Copyright owner"
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', color: '#ffffff', fontWeight: '500' }}>
                    Publishing Rights
                  </label>
                  <input
                    type="text"
                    value={formData.publishingRights}
                    onChange={(e) => handleInputChange('publishingRights', e.target.value)}
                    style={inputStyle}
                    placeholder="Publishing rights holder"
                  />
                </div>
              </div>
            </div>

            <div style={{ marginBottom: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                <input
                  type="checkbox"
                  checked={formData.drm}
                  onChange={(e) => handleInputChange('drm', e.target.checked)}
                  style={{ width: '20px', height: '20px' }}
                />
                <label style={{ color: '#ffffff', fontWeight: '500' }}>
                  Enable DRM Protection
                </label>
              </div>
            </div>

            <div style={{ marginBottom: '24px' }}>
              <h4 style={{ fontSize: '1.1rem', fontWeight: '600', marginBottom: '16px', color: '#ffffff' }}>
                Royalty Splits
              </h4>
              {formData.royaltySplits.map((split, index) => (
                <div key={index} style={{
                  display: 'grid',
                  gridTemplateColumns: '2fr 1fr auto',
                  gap: '16px',
                  alignItems: 'center',
                  marginBottom: '12px'
                }}>
                  <input
                    type="text"
                    value={split.author}
                    onChange={(e) => {
                      const updatedSplits = formData.royaltySplits.map((s, i) =>
                        i === index ? { ...s, author: e.target.value } : s
                      );
                      handleInputChange('royaltySplits', updatedSplits);
                    }}
                    style={inputStyle}
                    placeholder="Author/Contributor name"
                  />
                  <input
                    type="number"
                    value={split.percentage}
                    onChange={(e) => {
                      const updatedSplits = formData.royaltySplits.map((s, i) =>
                        i === index ? { ...s, percentage: parseInt(e.target.value) } : s
                      );
                      handleInputChange('royaltySplits', updatedSplits);
                    }}
                    style={inputStyle}
                    placeholder="Percentage"
                    min="0"
                    max="100"
                  />
                  <button
                    onClick={() => {
                      const updatedSplits = formData.royaltySplits.filter((_, i) => i !== index);
                      handleInputChange('royaltySplits', updatedSplits);
                    }}
                    style={{
                      background: 'rgba(239, 68, 68, 0.2)',
                      border: '1px solid rgba(239, 68, 68, 0.3)',
                      borderRadius: '8px',
                      padding: '8px',
                      color: '#EF4444',
                      cursor: 'pointer'
                    }}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
              <button
                onClick={() => {
                  const newSplit = { author: '', percentage: 0 };
                  handleInputChange('royaltySplits', [...formData.royaltySplits, newSplit]);
                }}
                style={{
                  background: 'rgba(255, 153, 0, 0.2)',
                  border: '1px solid rgba(255, 153, 0, 0.3)',
                  borderRadius: '12px',
                  padding: '12px 24px',
                  color: '#FF9900',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                <Plus size={16} />
                Add Split
              </button>
            </div>
          </div>
        );

      case 6:
        return (
          <div>
            <h2 style={{ fontSize: '2rem', fontWeight: '700', marginBottom: '32px', color: '#ffffff' }}>
              Review & Submit
            </h2>

            <div style={{
              background: 'rgba(255, 255, 255, 0.05)',
              borderRadius: '16px',
              padding: '32px',
              marginBottom: '32px'
            }}>
              <h3 style={{ fontSize: '1.5rem', fontWeight: '600', marginBottom: '24px', color: '#ffffff' }}>
                Book Summary
              </h3>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                <div>
                  <p><strong>Title:</strong> {formData.title || 'Not specified'}</p>
                  <p><strong>Author:</strong> {formData.author || 'Not specified'}</p>
                  <p><strong>Genre:</strong> {formData.genre || 'Not specified'}</p>
                  <p><strong>Type:</strong> {formData.bookType}</p>
                  <p><strong>Publish Date:</strong> {formData.publishDate || 'Not specified'}</p>
                  <p><strong>Publisher:</strong> {formData.publisher}</p>
                </div>
                <div>
                  <p><strong>Chapters:</strong> {formData.chapters.length}</p>
                  <p><strong>Stores:</strong> {formData.stores.length}</p>
                  <p><strong>Territories:</strong> {formData.territories.join(', ')}</p>
                  <p><strong>Language:</strong> {formData.language}</p>
                  <p><strong>Age Rating:</strong> {formData.ageRating}</p>
                  <p><strong>Formats:</strong> {formData.format.join(', ')}</p>
                </div>
              </div>

              <div style={{ marginTop: '20px' }}>
                <p><strong>Total Word Count:</strong> {formData.chapters.reduce((total, chapter) => total + chapter.wordCount, 0).toLocaleString()} words</p>
                <p><strong>Price Range:</strong> ${formData.priceUSD} / €{formData.priceEUR} / £{formData.priceGBP}</p>
              </div>
            </div>

            <div style={{
              background: 'rgba(245, 158, 11, 0.1)',
              border: '1px solid rgba(245, 158, 11, 0.3)',
              borderRadius: '12px',
              padding: '20px',
              marginBottom: '32px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                <AlertCircle size={20} style={{ color: '#F59E0B' }} />
                <h4 style={{ fontSize: '1.1rem', fontWeight: '600', color: '#F59E0B', margin: 0 }}>
                  Important Notes
                </h4>
              </div>
              <ul style={{ color: '#ffffff', opacity: 0.9, paddingLeft: '20px' }}>
                <li>Review all information carefully before submitting</li>
                <li>Publishing typically takes 3-7 days depending on stores</li>
                <li>You'll receive email updates on publishing status</li>
                <li>Changes after submission may require re-approval</li>
                <li>Make sure all content complies with store guidelines</li>
              </ul>
            </div>

            <div style={{ textAlign: 'center' }}>
              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                style={{
                  background: isSubmitting
                    ? 'rgba(107, 114, 128, 0.5)'
                    : 'linear-gradient(135deg, #FF9900 0%, #FF7700 100%)',
                  border: 'none',
                  borderRadius: '12px',
                  padding: '16px 48px',
                  color: '#ffffff',
                  fontSize: '1.1rem',
                  fontWeight: '600',
                  cursor: isSubmitting ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  margin: '0 auto',
                  transition: 'all 0.3s ease'
                }}
              >
                {isSubmitting ? (
                  <>
                    <div style={{
                      width: '20px',
                      height: '20px',
                      border: '2px solid rgba(255, 255, 255, 0.3)',
                      borderTop: '2px solid #ffffff',
                      borderRadius: '50%',
                      animation: 'spin 1s linear infinite'
                    }}></div>
                    Publishing...
                  </>
                ) : (
                  <>
                    <Send size={20} />
                    Publish Book
                  </>
                )}
              </button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div style={containerStyle}>
      <div style={overlayStyle}></div>

      <div style={contentStyle}>
        {/* Header */}
        <div style={cardStyle}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <button
                onClick={() => navigate('/books')}
                style={{
                  background: 'rgba(255, 255, 255, 0.1)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  borderRadius: '12px',
                  padding: '12px',
                  color: '#ffffff',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center'
                }}
              >
                <ArrowLeft size={20} />
              </button>
              <div>
                <h1 style={{ fontSize: '2.5rem', fontWeight: '800', margin: '0', color: '#ffffff' }}>
                  Add New Book
                </h1>
                <p style={{ fontSize: '1.1rem', margin: '4px 0 0 0', opacity: 0.8, color: '#ffffff' }}>
                  Step {currentStep} of {steps.length}: {steps[currentStep - 1].title}
                </p>
              </div>
            </div>
          </div>

          {/* Progress Indicator */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '32px' }}>
            {steps.map((step) => {
              const Icon = step.icon;
              return (
                <div key={step.number} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    background: step.number <= currentStep
                      ? '#FF9900'
                      : 'rgba(255, 255, 255, 0.2)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'all 0.3s ease'
                  }}>
                    <Icon size={16} style={{
                      color: step.number <= currentStep ? '#ffffff' : 'rgba(255, 255, 255, 0.5)'
                    }} />
                  </div>
                  {step.number < steps.length && (
                    <div style={{
                      width: '40px',
                      height: '2px',
                      background: step.number < currentStep
                        ? '#FF9900'
                        : 'rgba(255, 255, 255, 0.2)',
                      transition: 'all 0.3s ease'
                    }}></div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Content */}
        <div style={cardStyle}>
          {renderStepContent()}

          {/* Navigation */}
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '40px' }}>
            <button
              onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
              disabled={currentStep === 1}
              style={{
                background: currentStep === 1
                  ? 'rgba(107, 114, 128, 0.5)'
                  : 'rgba(255, 255, 255, 0.1)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                borderRadius: '12px',
                padding: '12px 24px',
                color: '#ffffff',
                fontSize: '1rem',
                fontWeight: '500',
                cursor: currentStep === 1 ? 'not-allowed' : 'pointer',
                opacity: currentStep === 1 ? 0.5 : 1
              }}
            >
              Previous
            </button>

            {currentStep < steps.length ? (
              <button
                onClick={() => setCurrentStep(currentStep + 1)}
                style={{
                  background: 'linear-gradient(135deg, #FF9900 0%, #FF7700 100%)',
                  border: 'none',
                  borderRadius: '12px',
                  padding: '12px 24px',
                  color: '#ffffff',
                  fontSize: '1rem',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
              >
                Next
              </button>
            ) : null}
          </div>
        </div>
      </div>

      {/* Add keyframes for loading spinner */}
      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}
      </style>
    </div>
  );
};

export default AddBookPage;
