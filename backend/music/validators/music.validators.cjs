// Walidatory dla modułu muzycznego
// Plik: music.validators.cjs

const Joi = require('joi');

// Walidator dla artysty
const artistSchema = Joi.object({
    name: Joi.string().min(1).max(255).required(),
    real_name: Joi.string().max(255).optional(),
    bio: Joi.string().optional(),
    genres: Joi.array().items(Joi.string()).optional(),
    website: Joi.string().uri().optional(),
    email: Joi.string().email().optional(),
    phone: Joi.string().max(50).optional(),
    social_media: Joi.object().optional(),
    image_url: Joi.string().uri().optional(),
    status: Joi.string().valid('active', 'inactive', 'suspended').default('active')
});

// Walidator dla wydania
const releaseSchema = Joi.object({
    artist_id: Joi.string().uuid().required(),
    title: Joi.string().min(1).max(500).required(),
    type: Joi.string().valid('single', 'ep', 'album', 'compilation').required(),
    description: Joi.string().optional(),
    release_date: Joi.date().optional(),
    label: Joi.string().max(255).optional(),
    catalog_number: Joi.string().max(100).optional(),
    upc: Joi.string().max(20).optional(),
    genre: Joi.string().max(100).optional(),
    subgenres: Joi.array().items(Joi.string()).optional(),
    language: Joi.string().max(10).default('en'),
    copyright_info: Joi.string().optional(),
    explicit_content: Joi.boolean().default(false),
    cover_art_url: Joi.string().uri().optional(),
    price_usd: Joi.number().min(0).optional(),
    status: Joi.string().valid('draft', 'review', 'approved', 'published', 'archived').default('draft')
});

// Walidator dla utworu
const trackSchema = Joi.object({
    release_id: Joi.string().uuid().required(),
    title: Joi.string().min(1).max(500).required(),
    track_number: Joi.number().integer().min(1).required(),
    duration_ms: Joi.number().integer().min(1).optional(),
    isrc: Joi.string().max(20).optional(),
    explicit_content: Joi.boolean().default(false),
    preview_start_time: Joi.number().integer().min(0).optional(),
    lyrics: Joi.string().optional(),
    file_url: Joi.string().uri().optional(),
    file_format: Joi.string().max(20).optional(),
    file_size_mb: Joi.number().min(0).optional(),
    status: Joi.string().valid('draft', 'review', 'approved', 'published', 'archived').default('draft')
});

// Walidator dla współtwórcy utworu
const trackContributorSchema = Joi.object({
    track_id: Joi.string().uuid().required(),
    artist_id: Joi.string().uuid().required(),
    role: Joi.string().valid('primary_artist', 'featured_artist', 'producer', 'composer', 'lyricist', 'performer').required(),
    credit_name: Joi.string().max(255).optional(),
    percentage: Joi.number().min(0).max(100).optional()
});

// Walidator dla zestawienia tantiem
const royaltyStatementSchema = Joi.object({
    artist_id: Joi.string().uuid().required(),
    period_start: Joi.date().required(),
    period_end: Joi.date().min(Joi.ref('period_start')).required(),
    platform: Joi.string().max(100).required(),
    total_streams: Joi.number().integer().min(0).default(0),
    total_sales: Joi.number().integer().min(0).default(0),
    gross_revenue: Joi.number().min(0).default(0),
    platform_commission: Joi.number().min(0).default(0),
    net_revenue: Joi.number().min(0).default(0),
    currency: Joi.string().length(3).default('USD'),
    status: Joi.string().valid('draft', 'generated', 'sent', 'paid', 'disputed').default('draft')
});

// Walidator dla podziału tantiem
const royaltySplitSchema = Joi.object({
    release_id: Joi.string().uuid().optional(),
    track_id: Joi.string().uuid().optional(),
    artist_id: Joi.string().uuid().required(),
    split_type: Joi.string().valid('composition', 'performance', 'master').required(),
    percentage: Joi.number().min(0).max(100).required(),
    role: Joi.string().max(100).optional()
}).or('release_id', 'track_id'); // przynajmniej jedno musi być podane

// Walidator dla wydatku
const expenseSchema = Joi.object({
    release_id: Joi.string().uuid().optional(),
    category: Joi.string().valid('recording', 'mixing', 'mastering', 'artwork', 'marketing', 'distribution', 'other').required(),
    description: Joi.string().min(1).max(500).required(),
    amount: Joi.number().min(0).required(),
    currency: Joi.string().length(3).default('USD'),
    expense_date: Joi.date().required(),
    vendor: Joi.string().max(255).optional(),
    receipt_url: Joi.string().uri().optional(),
    recoupable: Joi.boolean().default(true)
});

// Walidator dla kanału dystrybucji
const distributionChannelSchema = Joi.object({
    platform: Joi.string().max(100).required(),
    platform_id: Joi.string().max(255).optional(),
    revenue_share: Joi.number().min(0).max(100).default(70),
    minimum_payout: Joi.number().min(0).default(25),
    payment_frequency: Joi.string().valid('monthly', 'quarterly', 'annually').default('monthly'),
    territories: Joi.array().items(Joi.string()).optional(),
    content_requirements: Joi.object().optional(),
    status: Joi.string().valid('active', 'inactive', 'pending', 'suspended').default('active')
});

// Walidator dla powiadomienia
const notificationSchema = Joi.object({
    user_id: Joi.string().uuid().required(),
    type: Joi.string().valid('info', 'warning', 'error', 'success').required(),
    title: Joi.string().min(1).max(255).required(),
    message: Joi.string().min(1).max(1000).required(),
    action_url: Joi.string().uri().optional(),
    is_read: Joi.boolean().default(false),
    metadata: Joi.object().optional()
});

// Walidator dla metody wypłaty
const payoutMethodSchema = Joi.object({
    artist_id: Joi.string().uuid().required(),
    type: Joi.string().valid('bank_transfer', 'paypal', 'stripe', 'crypto').required(),
    details: Joi.object().required(),
    is_default: Joi.boolean().default(false),
    minimum_amount: Joi.number().min(0).default(25),
    currency: Joi.string().length(3).default('USD')
});

// Funkcje walidacyjne
const validateArtist = (data) => artistSchema.validate(data);
const validateRelease = (data) => releaseSchema.validate(data);
const validateTrack = (data) => trackSchema.validate(data);
const validateTrackContributor = (data) => trackContributorSchema.validate(data);
const validateRoyaltyStatement = (data) => royaltyStatementSchema.validate(data);
const validateRoyaltySplit = (data) => royaltySplitSchema.validate(data);
const validateExpense = (data) => expenseSchema.validate(data);
const validateDistributionChannel = (data) => distributionChannelSchema.validate(data);
const validateNotification = (data) => notificationSchema.validate(data);
const validatePayoutMethod = (data) => payoutMethodSchema.validate(data);

// Walidator dla aktualizacji (wszystkie pola opcjonalne)
const createUpdateValidator = (schema) => {
    const updateSchema = {};
    Object.keys(schema.describe().keys).forEach(key => {
        if (key !== 'id' && key !== 'created_at' && key !== 'updated_at') {
            updateSchema[key] = schema.extract(key).optional();
        }
    });
    return Joi.object(updateSchema);
};

const validateArtistUpdate = (data) => createUpdateValidator(artistSchema).validate(data);
const validateReleaseUpdate = (data) => createUpdateValidator(releaseSchema).validate(data);
const validateTrackUpdate = (data) => createUpdateValidator(trackSchema).validate(data);

module.exports = {
    // Schematy
    artistSchema,
    releaseSchema,
    trackSchema,
    trackContributorSchema,
    royaltyStatementSchema,
    royaltySplitSchema,
    expenseSchema,
    distributionChannelSchema,
    notificationSchema,
    payoutMethodSchema,
    
    // Funkcje walidacyjne
    validateArtist,
    validateRelease,
    validateTrack,
    validateTrackContributor,
    validateRoyaltyStatement,
    validateRoyaltySplit,
    validateExpense,
    validateDistributionChannel,
    validateNotification,
    validatePayoutMethod,
    
    // Walidatory aktualizacji
    validateArtistUpdate,
    validateReleaseUpdate,
    validateTrackUpdate,
    
    // Pomocnicze
    createUpdateValidator
};
