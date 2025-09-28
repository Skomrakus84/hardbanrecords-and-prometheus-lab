/**
 * Release Data Transfer Object
 * DTO dla wydań muzycznych
 */

const Joi = require('joi');

// Release DTO Schema
const releaseSchema = Joi.object({
  id: Joi.string().uuid().optional(),
  
  // Basic information
  title: Joi.string().min(1).max(200).required()
    .messages({
      'string.empty': 'Release title is required',
      'string.min': 'Release title must be at least 1 character',
      'string.max': 'Release title cannot exceed 200 characters'
    }),
  
  type: Joi.string().valid('single', 'ep', 'album', 'compilation', 'remix', 'live').required()
    .messages({
      'any.only': 'Release type must be one of: single, ep, album, compilation, remix, live'
    }),
  
  artistId: Joi.string().uuid().required()
    .messages({
      'string.guid': 'Artist ID must be a valid UUID'
    }),
  
  labelId: Joi.string().uuid().optional(),
  
  // Release dates
  releaseDate: Joi.date().iso().required()
    .messages({
      'date.base': 'Release date must be a valid date'
    }),
  
  originalReleaseDate: Joi.date().iso().optional(),
  
  // Identifiers
  upc: Joi.string().pattern(/^\d{12}$/).optional()
    .messages({
      'string.pattern.base': 'UPC must be 12 digits'
    }),
  
  catalogNumber: Joi.string().max(50).optional(),
  
  // Metadata
  description: Joi.string().max(2000).optional(),
  
  genres: Joi.array().items(Joi.string().max(50)).min(1).max(3).required()
    .messages({
      'array.min': 'At least one genre is required',
      'array.max': 'Maximum 3 genres allowed'
    }),
  
  subgenres: Joi.array().items(Joi.string().max(50)).max(5).optional(),
  
  moods: Joi.array().items(Joi.string().max(30)).max(5).optional(),
  
  language: Joi.string().length(2).lowercase().optional()
    .messages({
      'string.length': 'Language must be a 2-letter ISO code'
    }),
  
  explicitContent: Joi.boolean().default(false),
  
  // Artwork
  artwork: Joi.object({
    coverImage: Joi.string().uri().required()
      .messages({
        'string.uri': 'Cover image must be a valid URL'
      }),
    backCover: Joi.string().uri().optional(),
    bookletImages: Joi.array().items(Joi.string().uri()).max(10).optional()
  }).required(),
  
  // Distribution settings
  distributionSettings: Joi.object({
    channels: Joi.array().items(
      Joi.string().valid(
        'spotify', 'apple-music', 'youtube-music', 'amazon-music',
        'deezer', 'tidal', 'pandora', 'soundcloud', 'bandcamp'
      )
    ).min(1).required(),
    
    territories: Joi.array().items(
      Joi.string().length(2).uppercase()
    ).min(1).required(),
    
    releaseStrategy: Joi.string().valid('immediate', 'scheduled', 'phased').default('immediate'),
    
    phasedReleaseSchedule: Joi.when('releaseStrategy', {
      is: 'phased',
      then: Joi.array().items(
        Joi.object({
          territories: Joi.array().items(Joi.string().length(2).uppercase()).required(),
          releaseDate: Joi.date().iso().required()
        })
      ).min(1).required(),
      otherwise: Joi.forbidden()
    }),
    
    takedownDate: Joi.date().iso().min(Joi.ref('releaseDate')).optional()
  }).required(),
  
  // UGC and Content ID settings
  ugcPolicy: Joi.object({
    youtubeContentId: Joi.object({
      enabled: Joi.boolean().default(true),
      policy: Joi.string().valid('monetize', 'track', 'block').default('monetize'),
      allowClaims: Joi.boolean().default(true)
    }).optional(),
    
    facebookRightsManager: Joi.object({
      enabled: Joi.boolean().default(true),
      policy: Joi.string().valid('monetize', 'track', 'block').default('monetize')
    }).optional(),
    
    tiktokSoundLibrary: Joi.object({
      enabled: Joi.boolean().default(true),
      allowCommercialUse: Joi.boolean().default(false)
    }).optional()
  }).optional(),
  
  // Rights and licensing
  rightsInfo: Joi.object({
    pLine: Joi.string().max(200).optional(),
    cLine: Joi.string().max(200).optional(),
    masterOwner: Joi.string().max(100).optional(),
    publishingOwner: Joi.string().max(100).optional(),
    
    isrc: Joi.object({
      country: Joi.string().length(2).uppercase().optional(),
      registrant: Joi.string().length(3).uppercase().optional(),
      year: Joi.number().integer().min(1900).max(new Date().getFullYear()).optional(),
      designation: Joi.string().length(5).pattern(/^\d{5}$/).optional()
    }).optional()
  }).optional(),
  
  // Tracks (for albums/EPs)
  tracks: Joi.array().items(
    Joi.object({
      id: Joi.string().uuid().optional(),
      title: Joi.string().min(1).max(200).required(),
      duration: Joi.number().integer().min(1).required(), // in seconds
      trackNumber: Joi.number().integer().min(1).required(),
      discNumber: Joi.number().integer().min(1).default(1),
      audioFile: Joi.string().uri().required(),
      isrc: Joi.string().pattern(/^[A-Z]{2}[A-Z0-9]{3}\d{7}$/).optional(),
      explicitContent: Joi.boolean().default(false)
    })
  ).when('type', {
    is: 'single',
    then: Joi.array().length(1).required(),
    otherwise: Joi.array().min(1).max(100).required()
  }),
  
  // Collaborators and splits
  collaborators: Joi.array().items(
    Joi.object({
      artistId: Joi.string().uuid().required(),
      role: Joi.string().valid('featured', 'producer', 'songwriter', 'performer', 'remixer').required(),
      splits: Joi.object({
        master: Joi.number().min(0).max(100).default(0),
        publishing: Joi.number().min(0).max(100).default(0),
        performance: Joi.number().min(0).max(100).default(0)
      }).required()
    })
  ).optional(),
  
  // Status and workflow
  status: Joi.string().valid('draft', 'pending', 'approved', 'distributed', 'live', 'taken-down', 'rejected').default('draft'),
  
  submissionNotes: Joi.string().max(1000).optional(),
  
  rejectionReason: Joi.when('status', {
    is: 'rejected',
    then: Joi.string().max(500).required(),
    otherwise: Joi.forbidden()
  }),
  
  metadata: Joi.object({
    createdAt: Joi.date().iso().optional(),
    updatedAt: Joi.date().iso().optional(),
    createdBy: Joi.string().uuid().optional(),
    updatedBy: Joi.string().uuid().optional(),
    version: Joi.number().integer().min(1).default(1)
  }).optional()
});

// Create Release DTO
const createReleaseSchema = releaseSchema.fork(['id', 'metadata'], (schema) => schema.forbidden());

// Update Release DTO  
const updateReleaseSchema = releaseSchema.fork(['id'], (schema) => schema.forbidden())
  .fork(['title', 'type', 'artistId', 'releaseDate', 'genres', 'artwork', 'distributionSettings'], (schema) => schema.optional());

// Release Response DTO
const releaseResponseSchema = releaseSchema.concat(
  Joi.object({
    artist: Joi.object({
      id: Joi.string().uuid(),
      name: Joi.string(),
      stageName: Joi.string().optional()
    }).optional(),
    
    analytics: Joi.object({
      totalStreams: Joi.number().integer().min(0).optional(),
      totalRevenue: Joi.number().min(0).optional(),
      streamsByPlatform: Joi.object().pattern(/.*/, Joi.number().integer().min(0)).optional(),
      topTerritories: Joi.array().items(
        Joi.object({
          territory: Joi.string().length(2),
          streams: Joi.number().integer().min(0),
          percentage: Joi.number().min(0).max(100)
        })
      ).optional()
    }).optional(),
    
    distributionStatus: Joi.object({
      spotify: Joi.string().valid('pending', 'live', 'rejected', 'taken-down').optional(),
      appleMusic: Joi.string().valid('pending', 'live', 'rejected', 'taken-down').optional(),
      youtubeMusic: Joi.string().valid('pending', 'live', 'rejected', 'taken-down').optional(),
      amazonMusic: Joi.string().valid('pending', 'live', 'rejected', 'taken-down').optional(),
      lastUpdated: Joi.date().iso().optional()
    }).optional()
  })
);

// Validation functions
const validateCreateRelease = (data) => {
  return createReleaseSchema.validate(data, { abortEarly: false });
};

const validateUpdateRelease = (data) => {
  return updateReleaseSchema.validate(data, { abortEarly: false });
};

const validateReleaseResponse = (data) => {
  return releaseResponseSchema.validate(data, { abortEarly: false });
};

// Transform functions
const transformReleaseForResponse = (release) => {
  return {
    id: release.id,
    title: release.title,
    type: release.type,
    artistId: release.artist_id,
    labelId: release.label_id,
    releaseDate: release.release_date,
    originalReleaseDate: release.original_release_date,
    upc: release.upc,
    catalogNumber: release.catalog_number,
    description: release.description,
    genres: release.genres ? JSON.parse(release.genres) : [],
    subgenres: release.subgenres ? JSON.parse(release.subgenres) : [],
    moods: release.moods ? JSON.parse(release.moods) : [],
    language: release.language,
    explicitContent: release.explicit_content,
    artwork: release.artwork ? JSON.parse(release.artwork) : {},
    distributionSettings: release.distribution_settings ? JSON.parse(release.distribution_settings) : {},
    ugcPolicy: release.ugc_policy ? JSON.parse(release.ugc_policy) : {},
    rightsInfo: release.rights_info ? JSON.parse(release.rights_info) : {},
    tracks: release.tracks ? JSON.parse(release.tracks) : [],
    collaborators: release.collaborators ? JSON.parse(release.collaborators) : [],
    status: release.status,
    submissionNotes: release.submission_notes,
    rejectionReason: release.rejection_reason,
    metadata: {
      createdAt: release.created_at,
      updatedAt: release.updated_at,
      createdBy: release.created_by,
      updatedBy: release.updated_by,
      version: release.version
    }
  };
};

const transformReleaseForDatabase = (releaseData) => {
  return {
    title: releaseData.title,
    type: releaseData.type,
    artist_id: releaseData.artistId,
    label_id: releaseData.labelId,
    release_date: releaseData.releaseDate,
    original_release_date: releaseData.originalReleaseDate,
    upc: releaseData.upc,
    catalog_number: releaseData.catalogNumber,
    description: releaseData.description,
    genres: releaseData.genres ? JSON.stringify(releaseData.genres) : null,
    subgenres: releaseData.subgenres ? JSON.stringify(releaseData.subgenres) : null,
    moods: releaseData.moods ? JSON.stringify(releaseData.moods) : null,
    language: releaseData.language,
    explicit_content: releaseData.explicitContent || false,
    artwork: releaseData.artwork ? JSON.stringify(releaseData.artwork) : null,
    distribution_settings: releaseData.distributionSettings ? JSON.stringify(releaseData.distributionSettings) : null,
    ugc_policy: releaseData.ugcPolicy ? JSON.stringify(releaseData.ugcPolicy) : null,
    rights_info: releaseData.rightsInfo ? JSON.stringify(releaseData.rightsInfo) : null,
    tracks: releaseData.tracks ? JSON.stringify(releaseData.tracks) : null,
    collaborators: releaseData.collaborators ? JSON.stringify(releaseData.collaborators) : null,
    status: releaseData.status || 'draft',
    submission_notes: releaseData.submissionNotes,
    rejection_reason: releaseData.rejectionReason
  };
};

module.exports = {
  releaseSchema,
  createReleaseSchema,
  updateReleaseSchema,
  releaseResponseSchema,
  validateCreateRelease,
  validateUpdateRelease,
  validateReleaseResponse,
  transformReleaseForResponse,
  transformReleaseForDatabase
};
