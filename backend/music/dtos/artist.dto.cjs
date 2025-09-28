/**
 * Artist Data Transfer Object
 * DTO dla operacji na artystach
 */

const Joi = require('joi');

// Artist DTO Schema
const artistSchema = Joi.object({
  id: Joi.string().uuid().optional(),
  name: Joi.string().min(1).max(100).required()
    .messages({
      'string.empty': 'Artist name is required',
      'string.min': 'Artist name must be at least 1 character',
      'string.max': 'Artist name cannot exceed 100 characters'
    }),
  
  stageName: Joi.string().min(1).max(100).optional()
    .messages({
      'string.min': 'Stage name must be at least 1 character',
      'string.max': 'Stage name cannot exceed 100 characters'
    }),
  
  biography: Joi.string().max(5000).optional()
    .messages({
      'string.max': 'Biography cannot exceed 5000 characters'
    }),
  
  genres: Joi.array().items(Joi.string().max(50)).max(10).optional()
    .messages({
      'array.max': 'Maximum 10 genres allowed'
    }),
  
  country: Joi.string().length(2).uppercase().optional()
    .messages({
      'string.length': 'Country must be a 2-letter ISO code'
    }),
  
  profileImage: Joi.string().uri().optional()
    .messages({
      'string.uri': 'Profile image must be a valid URL'
    }),
  
  socialLinks: Joi.object({
    website: Joi.string().uri().optional(),
    instagram: Joi.string().uri().optional(),
    twitter: Joi.string().uri().optional(),
    facebook: Joi.string().uri().optional(),
    youtube: Joi.string().uri().optional(),
    spotify: Joi.string().uri().optional(),
    appleMusic: Joi.string().uri().optional(),
    soundcloud: Joi.string().uri().optional(),
    bandcamp: Joi.string().uri().optional()
  }).optional(),
  
  contactInfo: Joi.object({
    email: Joi.string().email().optional(),
    phone: Joi.string().pattern(/^\+?[1-9]\d{1,14}$/).optional(),
    management: Joi.object({
      name: Joi.string().max(100).optional(),
      email: Joi.string().email().optional(),
      phone: Joi.string().pattern(/^\+?[1-9]\d{1,14}$/).optional()
    }).optional(),
    booking: Joi.object({
      name: Joi.string().max(100).optional(),
      email: Joi.string().email().optional(),
      phone: Joi.string().pattern(/^\+?[1-9]\d{1,14}$/).optional()
    }).optional()
  }).optional(),
  
  distributionSettings: Joi.object({
    defaultSplits: Joi.array().items(
      Joi.object({
        collaboratorId: Joi.string().uuid().required(),
        percentage: Joi.number().min(0).max(100).required(),
        role: Joi.string().valid('artist', 'producer', 'songwriter', 'performer', 'other').required()
      })
    ).optional(),
    
    defaultTerritories: Joi.array().items(
      Joi.string().length(2).uppercase()
    ).optional(),
    
    defaultChannels: Joi.array().items(
      Joi.string().valid(
        'spotify', 'apple-music', 'youtube-music', 'amazon-music',
        'deezer', 'tidal', 'pandora', 'soundcloud', 'bandcamp'
      )
    ).optional()
  }).optional(),
  
  payoutSettings: Joi.object({
    method: Joi.string().valid('stripe', 'paypal', 'wise', 'bank-transfer').optional(),
    currency: Joi.string().length(3).uppercase().optional(),
    minimumPayout: Joi.number().min(0).optional(),
    
    bankDetails: Joi.object({
      accountNumber: Joi.string().optional(),
      routingNumber: Joi.string().optional(),
      bankName: Joi.string().optional(),
      accountHolder: Joi.string().optional()
    }).optional(),
    
    paypalEmail: Joi.string().email().optional(),
    stripeAccountId: Joi.string().optional(),
    wiseRecipientId: Joi.string().optional()
  }).optional(),
  
  labels: Joi.array().items(
    Joi.object({
      labelId: Joi.string().uuid().required(),
      relationship: Joi.string().valid('signed', 'distribution', 'collaboration').required(),
      startDate: Joi.date().iso().optional(),
      endDate: Joi.date().iso().min(Joi.ref('startDate')).optional(),
      exclusive: Joi.boolean().default(false)
    })
  ).optional(),
  
  isActive: Joi.boolean().default(true),
  isVerified: Joi.boolean().default(false),
  
  metadata: Joi.object({
    createdAt: Joi.date().iso().optional(),
    updatedAt: Joi.date().iso().optional(),
    createdBy: Joi.string().uuid().optional(),
    updatedBy: Joi.string().uuid().optional(),
    version: Joi.number().integer().min(1).default(1)
  }).optional()
});

// Create Artist DTO
const createArtistSchema = artistSchema.fork(['id', 'metadata'], (schema) => schema.forbidden());

// Update Artist DTO
const updateArtistSchema = artistSchema.fork(['id'], (schema) => schema.forbidden())
  .fork(['name'], (schema) => schema.optional());

// Artist Response DTO
const artistResponseSchema = artistSchema.concat(
  Joi.object({
    stats: Joi.object({
      totalReleases: Joi.number().integer().min(0).optional(),
      totalTracks: Joi.number().integer().min(0).optional(),
      totalStreams: Joi.number().integer().min(0).optional(),
      totalRevenue: Joi.number().min(0).optional(),
      lastReleaseDate: Joi.date().iso().optional(),
      averageRating: Joi.number().min(0).max(5).optional()
    }).optional(),
    
    recentActivity: Joi.array().items(
      Joi.object({
        type: Joi.string().valid('release', 'track', 'payout', 'update').required(),
        description: Joi.string().required(),
        timestamp: Joi.date().iso().required(),
        metadata: Joi.object().unknown().optional()
      })
    ).optional()
  })
);

// Validation functions
const validateCreateArtist = (data) => {
  return createArtistSchema.validate(data, { abortEarly: false });
};

const validateUpdateArtist = (data) => {
  return updateArtistSchema.validate(data, { abortEarly: false });
};

const validateArtistResponse = (data) => {
  return artistResponseSchema.validate(data, { abortEarly: false });
};

// Transform functions
const transformArtistForResponse = (artist) => {
  const transformed = {
    id: artist.id,
    name: artist.name,
    stageName: artist.stage_name,
    biography: artist.biography,
    genres: artist.genres ? JSON.parse(artist.genres) : [],
    country: artist.country,
    profileImage: artist.profile_image,
    socialLinks: artist.social_links ? JSON.parse(artist.social_links) : {},
    contactInfo: artist.contact_info ? JSON.parse(artist.contact_info) : {},
    distributionSettings: artist.distribution_settings ? JSON.parse(artist.distribution_settings) : {},
    payoutSettings: artist.payout_settings ? JSON.parse(artist.payout_settings) : {},
    labels: artist.labels ? JSON.parse(artist.labels) : [],
    isActive: artist.is_active,
    isVerified: artist.is_verified,
    metadata: {
      createdAt: artist.created_at,
      updatedAt: artist.updated_at,
      createdBy: artist.created_by,
      updatedBy: artist.updated_by,
      version: artist.version
    }
  };
  
  return transformed;
};

const transformArtistForDatabase = (artistData) => {
  return {
    name: artistData.name,
    stage_name: artistData.stageName,
    biography: artistData.biography,
    genres: artistData.genres ? JSON.stringify(artistData.genres) : null,
    country: artistData.country,
    profile_image: artistData.profileImage,
    social_links: artistData.socialLinks ? JSON.stringify(artistData.socialLinks) : null,
    contact_info: artistData.contactInfo ? JSON.stringify(artistData.contactInfo) : null,
    distribution_settings: artistData.distributionSettings ? JSON.stringify(artistData.distributionSettings) : null,
    payout_settings: artistData.payoutSettings ? JSON.stringify(artistData.payoutSettings) : null,
    labels: artistData.labels ? JSON.stringify(artistData.labels) : null,
    is_active: artistData.isActive !== undefined ? artistData.isActive : true,
    is_verified: artistData.isVerified !== undefined ? artistData.isVerified : false
  };
};

module.exports = {
  artistSchema,
  createArtistSchema,
  updateArtistSchema,
  artistResponseSchema,
  validateCreateArtist,
  validateUpdateArtist,
  validateArtistResponse,
  transformArtistForResponse,
  transformArtistForDatabase
};
