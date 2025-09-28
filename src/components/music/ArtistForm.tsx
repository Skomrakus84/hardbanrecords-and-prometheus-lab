import React, { useState, useEffect } from 'react';
import { Artist, CreateArtistDto, UpdateArtistDto } from '../../types/artist';

interface ArtistFormProps {
  artist?: Artist | null;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateArtistDto | UpdateArtistDto) => Promise<void>;
  isLoading?: boolean;
}

export const ArtistForm: React.FC<ArtistFormProps> = ({
  artist,
  isOpen,
  onClose,
  onSubmit,
  isLoading = false
}) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    bio: '',
    genre: '',
    location: '',
    socialMedia: {
      spotify: '',
      instagram: '',
      youtube: '',
      twitter: '',
      facebook: '',
      tiktok: ''
    }
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Populate form with artist data when editing
  useEffect(() => {
    if (artist) {
      setFormData({
        name: artist.name || '',
        email: artist.email || '',
        phone: artist.phone || '',
        bio: artist.bio || '',
        genre: artist.genre || '',
        location: artist.location || '',
        socialMedia: {
          spotify: artist.socialMedia.spotify || '',
          instagram: artist.socialMedia.instagram || '',
          youtube: artist.socialMedia.youtube || '',
          twitter: artist.socialMedia.twitter || '',
          facebook: artist.socialMedia.facebook || '',
          tiktok: artist.socialMedia.tiktok || ''
        }
      });
    } else {
      // Reset form for new artist
      setFormData({
        name: '',
        email: '',
        phone: '',
        bio: '',
        genre: '',
        location: '',
        socialMedia: {
          spotify: '',
          instagram: '',
          youtube: '',
          twitter: '',
          facebook: '',
          tiktok: ''
        }
      });
    }
    setErrors({});
  }, [artist, isOpen]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;

    if (name.startsWith('socialMedia.')) {
      const platform = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        socialMedia: {
          ...prev.socialMedia,
          [platform as string]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Artist name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (formData.phone && !/^[+]?[1-9][\d]{0,15}$/.test(formData.phone.replace(/\s/g, ''))) {
      newErrors.phone = 'Please enter a valid phone number';
    }

    // Validate social media URLs
    const urlPattern = /^https?:\/\/.+/;
    Object.entries(formData.socialMedia).forEach(([platform, url]) => {
      if (url && !urlPattern.test(url)) {
        newErrors[`socialMedia.${platform}`] = 'Please enter a valid URL';
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    // Filter out empty social media fields
    const filteredSocialMedia = Object.fromEntries(
      Object.entries(formData.socialMedia).filter(([, value]) => value.trim() !== '')
    );

    const submitData = {
      name: formData.name,
      email: formData.email,
      socialMedia: filteredSocialMedia,
      ...(formData.phone?.trim() && { phone: formData.phone }),
      ...(formData.bio?.trim() && { bio: formData.bio }),
      ...(formData.genre?.trim() && { genre: formData.genre }),
      ...(formData.location?.trim() && { location: formData.location })
    };

    try {
      await onSubmit(submitData);
      onClose();
    } catch (error) {
      console.error('Error submitting form:', error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        {/* Backdrop */}
        <div
          className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
          onClick={onClose}
        ></div>

        {/* Modal */}
        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full">
          <form onSubmit={handleSubmit}>
            {/* Header */}
            <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                  {artist ? 'Edit Artist' : 'Add New Artist'}
                </h3>
                <button
                  type="button"
                  onClick={onClose}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>

              {/* Form Fields */}
              <div className="space-y-6">
                {/* Basic Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Artist Name *
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className={`mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
                        errors.name ? 'border-red-300' : ''
                      }`}
                      placeholder="Enter artist name"
                    />
                    {errors.name && (
                      <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Email *
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className={`mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
                        errors.email ? 'border-red-300' : ''
                      }`}
                      placeholder="artist@example.com"
                    />
                    {errors.email && (
                      <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Phone
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className={`mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
                        errors.phone ? 'border-red-300' : ''
                      }`}
                      placeholder="+1 234 567 8900"
                    />
                    {errors.phone && (
                      <p className="mt-1 text-sm text-red-600">{errors.phone}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Genre
                    </label>
                    <input
                      type="text"
                      name="genre"
                      value={formData.genre}
                      onChange={handleInputChange}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      placeholder="e.g., Pop, Rock, Electronic"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Location
                  </label>
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleInputChange}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="e.g., Los Angeles, CA"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Bio
                  </label>
                  <textarea
                    name="bio"
                    rows={3}
                    value={formData.bio}
                    onChange={handleInputChange}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="Tell us about the artist..."
                  />
                </div>

                {/* Social Media */}
                <div>
                  <h4 className="text-md font-medium text-gray-900 mb-3">Social Media</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {Object.entries(formData.socialMedia).map(([platform, value]) => (
                      <div key={platform}>
                        <label className="block text-sm font-medium text-gray-700 capitalize">
                          {platform}
                        </label>
                        <input
                          type="url"
                          name={`socialMedia.${platform}`}
                          value={value}
                          onChange={handleInputChange}
                          className={`mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
                            errors[`socialMedia.${platform}`] ? 'border-red-300' : ''
                          }`}
                          placeholder={`https://${platform}.com/username`}
                        />
                        {errors[`socialMedia.${platform}`] && (
                          <p className="mt-1 text-sm text-red-600">
                            {errors[`socialMedia.${platform}`]}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Saving...
                  </>
                ) : (
                  artist ? 'Update Artist' : 'Add Artist'
                )}
              </button>
              <button
                type="button"
                onClick={onClose}
                className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
