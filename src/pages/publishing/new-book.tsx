import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface FormData {
  title: string;
  author: string;
  description: string;
  genre: string;
  language: string;
  isbn: string;
  price: string;
  keywords: string;
  publishingRights: 'exclusive' | 'non-exclusive';
  territory: string[];
  ageRating: string;
  format: 'ebook' | 'print' | 'both';
  printOptions?: {
    paperType: 'cream' | 'white';
    size: 'pocket' | 'standard' | 'large';
    binding: 'paperback' | 'hardcover';
  };
  distributionChannels: string[];
  publishDate: string;
  preOrder: boolean;
  preOrderDate?: string;
}

const NewBookPage: React.FC = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<FormData>({
    title: '',
    author: '',
    description: '',
    genre: '',
    language: 'en',
    isbn: '',
    price: '',
    keywords: '',
    publishingRights: 'exclusive',
    territory: ['worldwide'],
    ageRating: 'general',
    format: 'ebook',
    distributionChannels: [],
    publishDate: '',
    preOrder: false
  });
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [manuscriptFile, setManuscriptFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  const totalSteps = 4;

  const genres = [
    'Fiction', 'Non-Fiction', 'Romance', 'Mystery', 'Thriller', 'Science Fiction',
    'Fantasy', 'Biography', 'Self-Help', 'Business', 'Health', 'History',
    'Travel', 'Cooking', 'Art', 'Technology', 'Education', 'Religion',
    'Politics', 'Sports', 'Young Adult', 'Children\'s Books'
  ];

  const distributionChannels = [
    { id: 'amazon-kdp', name: 'Amazon Kindle Direct Publishing', description: 'World\'s largest ebook marketplace' },
    { id: 'apple-books', name: 'Apple Books', description: 'Premium iOS reading experience' },
    { id: 'google-books', name: 'Google Play Books', description: 'Android integration and global reach' },
    { id: 'kobo', name: 'Kobo', description: 'International markets and DRM-free options' },
    { id: 'barnes-noble', name: 'Barnes & Noble Press', description: 'Leading US bookstore chain' },
    { id: 'smashwords', name: 'Smashwords', description: 'Multi-format distribution platform' },
    { id: 'draft2digital', name: 'Draft2Digital', description: 'Simplified multi-platform publishing' },
    { id: 'ingram-spark', name: 'IngramSpark', description: 'Print and global distribution' }
  ];

  const handleInputChange = (field: keyof FormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleFileChange = (type: 'cover' | 'manuscript', file: File | null) => {
    if (type === 'cover') {
      setCoverFile(file);
    } else {
      setManuscriptFile(file);
    }
  };

  const handleChannelToggle = (channelId: string) => {
    setFormData(prev => ({
      ...prev,
      distributionChannels: prev.distributionChannels.includes(channelId)
        ? prev.distributionChannels.filter(id => id !== channelId)
        : [...prev.distributionChannels, channelId]
    }));
  };

  const handleTerritoryToggle = (territory: string) => {
    setFormData(prev => ({
      ...prev,
      territory: prev.territory.includes(territory)
        ? prev.territory.filter(t => t !== territory)
        : [...prev.territory, territory]
    }));
  };

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      // Simulate book creation
      await new Promise(resolve => setTimeout(resolve, 2000));
      console.log('Creating book with data:', formData);
      console.log('Cover file:', coverFile);
      console.log('Manuscript file:', manuscriptFile);

      // Navigate to book edit page
      navigate('/publishing/library');
    } catch (error) {
      console.error('Failed to create book:', error);
    } finally {
      setLoading(false);
    }
  };

  const isStepValid = () => {
    switch (currentStep) {
      case 1:
        return formData.title && formData.author && formData.description && formData.genre;
      case 2:
        return coverFile && manuscriptFile;
      case 3:
        return formData.price && formData.distributionChannels.length > 0;
      case 4:
        return formData.publishDate;
      default:
        return false;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-3xl font-bold text-gray-900">Publish New Book</h1>
            <button
              onClick={() => navigate('/publishing/library')}
              className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-2 px-4 rounded-lg transition-colors"
            >
              ← Back to Library
            </button>
          </div>

          {/* Progress Bar */}
          <div className="flex items-center space-x-4">
            {[1, 2, 3, 4].map(step => (
              <div key={step} className="flex-1">
                <div className="flex items-center">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                      step <= currentStep
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-200 text-gray-500'
                    }`}
                  >
                    {step}
                  </div>
                  {step < 4 && (
                    <div
                      className={`flex-1 h-1 ml-4 ${
                        step < currentStep ? 'bg-blue-600' : 'bg-gray-200'
                      }`}
                    />
                  )}
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  {step === 1 && 'Book Details'}
                  {step === 2 && 'Files & Content'}
                  {step === 3 && 'Pricing & Distribution'}
                  {step === 4 && 'Publishing Options'}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Form Content */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-8">
          {currentStep === 1 && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">📚 Book Information</h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Book Title *
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter your book title"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Author Name *
                  </label>
                  <input
                    type="text"
                    value={formData.author}
                    onChange={(e) => handleInputChange('author', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Author or publisher name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Genre *
                  </label>
                  <select
                    value={formData.genre}
                    onChange={(e) => handleInputChange('genre', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Select a genre</option>
                    {genres.map(genre => (
                      <option key={genre} value={genre}>{genre}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Language
                  </label>
                  <select
                    value={formData.language}
                    onChange={(e) => handleInputChange('language', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    ISBN (Optional)
                  </label>
                  <input
                    type="text"
                    value={formData.isbn}
                    onChange={(e) => handleInputChange('isbn', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="978-0-123456-78-9"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Age Rating
                  </label>
                  <select
                    value={formData.ageRating}
                    onChange={(e) => handleInputChange('ageRating', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="general">General Audiences</option>
                    <option value="teen">Teen (13+)</option>
                    <option value="mature">Mature (18+)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Book Description *
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  rows={6}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Provide a compelling description of your book that will attract readers..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Keywords (comma-separated)
                </label>
                <input
                  type="text"
                  value={formData.keywords}
                  onChange={(e) => handleInputChange('keywords', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="fiction, romance, contemporary, love story, relationships"
                />
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">📁 Upload Files</h2>

              {/* Cover Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Book Cover *
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors">
                  {coverFile ? (
                    <div className="space-y-3">
                      <div className="text-green-600 text-4xl">✅</div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{coverFile.name}</p>
                        <p className="text-xs text-gray-500">{(coverFile.size / 1024 / 1024).toFixed(2)} MB</p>
                      </div>
                      <button
                        onClick={() => handleFileChange('cover', null)}
                        className="text-red-600 hover:text-red-800 text-sm font-medium"
                      >
                        Remove
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="text-gray-400 text-4xl">🖼️</div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">Upload book cover</p>
                        <p className="text-xs text-gray-500">JPEG or PNG, recommended 2560x1600px</p>
                      </div>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleFileChange('cover', e.target.files?.[0] || null)}
                        className="hidden"
                        id="cover-upload"
                      />
                      <label
                        htmlFor="cover-upload"
                        className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors cursor-pointer inline-block"
                      >
                        Choose File
                      </label>
                    </div>
                  )}
                </div>
              </div>

              {/* Manuscript Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Manuscript File *
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors">
                  {manuscriptFile ? (
                    <div className="space-y-3">
                      <div className="text-green-600 text-4xl">📄</div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{manuscriptFile.name}</p>
                        <p className="text-xs text-gray-500">{(manuscriptFile.size / 1024 / 1024).toFixed(2)} MB</p>
                      </div>
                      <button
                        onClick={() => handleFileChange('manuscript', null)}
                        className="text-red-600 hover:text-red-800 text-sm font-medium"
                      >
                        Remove
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="text-gray-400 text-4xl">📄</div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">Upload manuscript</p>
                        <p className="text-xs text-gray-500">PDF, DOCX, or EPUB format</p>
                      </div>
                      <input
                        type="file"
                        accept=".pdf,.docx,.epub"
                        onChange={(e) => handleFileChange('manuscript', e.target.files?.[0] || null)}
                        className="hidden"
                        id="manuscript-upload"
                      />
                      <label
                        htmlFor="manuscript-upload"
                        className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors cursor-pointer inline-block"
                      >
                        Choose File
                      </label>
                    </div>
                  )}
                </div>
              </div>

              {/* Format Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Publishing Format
                </label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <button
                    onClick={() => handleInputChange('format', 'ebook')}
                    className={`p-4 border-2 rounded-lg text-center transition-colors ${
                      formData.format === 'ebook'
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-gray-300 hover:border-blue-300'
                    }`}
                  >
                    <div className="text-2xl mb-2">📱</div>
                    <div className="font-medium">E-book Only</div>
                    <div className="text-xs text-gray-500">Digital distribution</div>
                  </button>

                  <button
                    onClick={() => handleInputChange('format', 'print')}
                    className={`p-4 border-2 rounded-lg text-center transition-colors ${
                      formData.format === 'print'
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-gray-300 hover:border-blue-300'
                    }`}
                  >
                    <div className="text-2xl mb-2">📖</div>
                    <div className="font-medium">Print Only</div>
                    <div className="text-xs text-gray-500">Physical books</div>
                  </button>

                  <button
                    onClick={() => handleInputChange('format', 'both')}
                    className={`p-4 border-2 rounded-lg text-center transition-colors ${
                      formData.format === 'both'
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-gray-300 hover:border-blue-300'
                    }`}
                  >
                    <div className="text-2xl mb-2">📚</div>
                    <div className="font-medium">Both Formats</div>
                    <div className="text-xs text-gray-500">Digital + Print</div>
                  </button>
                </div>
              </div>

              {/* Print Options */}
              {(formData.format === 'print' || formData.format === 'both') && (
                <div className="bg-blue-50 rounded-lg p-6 border border-blue-200">
                  <h3 className="text-lg font-medium text-blue-900 mb-4">Print Options</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-blue-800 mb-2">Paper Type</label>
                      <select
                        value={formData.printOptions?.paperType || 'cream'}
                        onChange={(e) => handleInputChange('printOptions', {
                          ...formData.printOptions,
                          paperType: e.target.value as 'cream' | 'white'
                        })}
                        className="w-full px-3 py-2 border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="cream">Cream</option>
                        <option value="white">White</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-blue-800 mb-2">Size</label>
                      <select
                        value={formData.printOptions?.size || 'standard'}
                        onChange={(e) => handleInputChange('printOptions', {
                          ...formData.printOptions,
                          size: e.target.value as 'pocket' | 'standard' | 'large'
                        })}
                        className="w-full px-3 py-2 border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="pocket">Pocket (4.25" x 6.87")</option>
                        <option value="standard">Standard (6" x 9")</option>
                        <option value="large">Large (8.5" x 11")</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-blue-800 mb-2">Binding</label>
                      <select
                        value={formData.printOptions?.binding || 'paperback'}
                        onChange={(e) => handleInputChange('printOptions', {
                          ...formData.printOptions,
                          binding: e.target.value as 'paperback' | 'hardcover'
                        })}
                        className="w-full px-3 py-2 border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="paperback">Paperback</option>
                        <option value="hardcover">Hardcover</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {currentStep === 3 && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">💰 Pricing & Distribution</h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Book Price (USD) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0.99"
                    value={formData.price}
                    onChange={(e) => handleInputChange('price', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="9.99"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Publishing Rights
                  </label>
                  <select
                    value={formData.publishingRights}
                    onChange={(e) => handleInputChange('publishingRights', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="exclusive">Exclusive Rights</option>
                    <option value="non-exclusive">Non-Exclusive Rights</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-4">
                  Distribution Channels *
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {distributionChannels.map(channel => (
                    <div
                      key={channel.id}
                      className={`border-2 rounded-lg p-4 cursor-pointer transition-colors ${
                        formData.distributionChannels.includes(channel.id)
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-300 hover:border-blue-300'
                      }`}
                      onClick={() => handleChannelToggle(channel.id)}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-medium text-gray-900">{channel.name}</h3>
                        <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                          formData.distributionChannels.includes(channel.id)
                            ? 'border-blue-500 bg-blue-500 text-white'
                            : 'border-gray-300'
                        }`}>
                          {formData.distributionChannels.includes(channel.id) && '✓'}
                        </div>
                      </div>
                      <p className="text-sm text-gray-600">{channel.description}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-4">
                  Distribution Territory
                </label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {['worldwide', 'us-canada', 'europe', 'asia-pacific', 'latin-america', 'africa', 'middle-east', 'oceania'].map(territory => (
                    <button
                      key={territory}
                      onClick={() => handleTerritoryToggle(territory)}
                      className={`p-3 border-2 rounded-lg text-center text-sm font-medium transition-colors ${
                        formData.territory.includes(territory)
                          ? 'border-blue-500 bg-blue-50 text-blue-700'
                          : 'border-gray-300 text-gray-700 hover:border-blue-300'
                      }`}
                    >
                      {territory.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {currentStep === 4 && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">🚀 Publishing Options</h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Publish Date *
                  </label>
                  <input
                    type="date"
                    value={formData.publishDate}
                    onChange={(e) => handleInputChange('publishDate', e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    id="pre-order"
                    checked={formData.preOrder}
                    onChange={(e) => handleInputChange('preOrder', e.target.checked)}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <label htmlFor="pre-order" className="text-sm font-medium text-gray-700">
                    Enable Pre-order
                  </label>
                </div>
              </div>

              {formData.preOrder && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Pre-order Start Date
                  </label>
                  <input
                    type="date"
                    value={formData.preOrderDate || ''}
                    onChange={(e) => handleInputChange('preOrderDate', e.target.value)}
                    max={formData.publishDate}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              )}

              {/* Summary */}
              <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                <h3 className="text-lg font-medium text-gray-900 mb-4">📋 Publishing Summary</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium text-gray-700">Title:</span>
                    <div className="text-gray-900">{formData.title || 'Not specified'}</div>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Author:</span>
                    <div className="text-gray-900">{formData.author || 'Not specified'}</div>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Genre:</span>
                    <div className="text-gray-900">{formData.genre || 'Not specified'}</div>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Price:</span>
                    <div className="text-gray-900">${formData.price || '0.00'}</div>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Format:</span>
                    <div className="text-gray-900">{formData.format || 'Not specified'}</div>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Publish Date:</span>
                    <div className="text-gray-900">{formData.publishDate || 'Not specified'}</div>
                  </div>
                  <div className="md:col-span-2">
                    <span className="font-medium text-gray-700">Distribution:</span>
                    <div className="text-gray-900">
                      {formData.distributionChannels.length > 0
                        ? `${formData.distributionChannels.length} platform(s) selected`
                        : 'No platforms selected'
                      }
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex items-center justify-between pt-6 border-t border-gray-200">
            <button
              onClick={handlePrevious}
              disabled={currentStep === 1}
              className={`font-medium py-2 px-4 rounded-lg transition-colors ${
                currentStep === 1
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
              }`}
            >
              ← Previous
            </button>

            <div className="text-sm text-gray-500">
              Step {currentStep} of {totalSteps}
            </div>

            {currentStep < totalSteps ? (
              <button
                onClick={handleNext}
                disabled={!isStepValid()}
                className={`font-medium py-2 px-4 rounded-lg transition-colors ${
                  isStepValid()
                    ? 'bg-blue-600 hover:bg-blue-700 text-white'
                    : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                }`}
              >
                Next →
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={!isStepValid() || loading}
                className={`font-medium py-2 px-4 rounded-lg transition-colors ${
                  isStepValid() && !loading
                    ? 'bg-green-600 hover:bg-green-700 text-white'
                    : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                }`}
              >
                {loading ? (
                  <span className="flex items-center space-x-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Publishing...</span>
                  </span>
                ) : (
                  '🚀 Publish Book'
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewBookPage;
