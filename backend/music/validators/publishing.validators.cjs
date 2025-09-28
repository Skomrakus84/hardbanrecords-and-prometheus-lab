// Walidatory dla modułu publikowania
// Plik: publishing.validators.cjs

const Joi = require('joi');

// Walidator dla autora
const authorSchema = Joi.object({
    user_id: Joi.string().uuid().optional(),
    pen_name: Joi.string().min(1).max(255).required(),
    real_name: Joi.string().max(255).optional(),
    bio: Joi.string().optional(),
    website: Joi.string().uri().optional(),
    email: Joi.string().email().optional(),
    phone: Joi.string().max(50).optional(),
    address: Joi.string().optional(),
    tax_id: Joi.string().max(100).optional(),
    bank_account: Joi.string().max(100).optional(),
    date_of_birth: Joi.date().optional(),
    nationality: Joi.string().max(100).optional(),
    preferred_language: Joi.string().max(10).default('en'),
    marketing_consent: Joi.boolean().default(false),
    profile_image_url: Joi.string().uri().optional(),
    social_media: Joi.object().optional(),
    preferred_genres: Joi.array().items(Joi.string()).optional(),
    writing_style: Joi.string().optional(),
    awards: Joi.array().items(Joi.string()).optional(),
    education: Joi.string().optional(),
    status: Joi.string().valid('active', 'inactive', 'suspended').default('active')
});

// Walidator dla książki
const bookSchema = Joi.object({
    author_id: Joi.string().uuid().required(),
    title: Joi.string().min(1).max(500).required(),
    subtitle: Joi.string().max(500).optional(),
    series_name: Joi.string().max(255).optional(),
    series_number: Joi.number().integer().min(1).optional(),
    description: Joi.string().optional(),
    isbn_13: Joi.string().pattern(/^[0-9]{13}$/).optional(),
    isbn_10: Joi.string().pattern(/^[0-9X]{10}$/).optional(),
    asin: Joi.string().max(20).optional(),
    language: Joi.string().max(10).default('en'),
    page_count: Joi.number().integer().min(1).optional(),
    word_count: Joi.number().integer().min(1).optional(),
    format: Joi.string().valid('ebook', 'paperback', 'hardcover', 'audiobook').default('ebook'),
    genre: Joi.string().max(100).optional(),
    subgenres: Joi.array().items(Joi.string()).optional(),
    keywords: Joi.array().items(Joi.string()).optional(),
    target_audience: Joi.string().max(50).optional(),
    content_rating: Joi.string().max(20).default('general'),
    cover_image_url: Joi.string().uri().optional(),
    preview_url: Joi.string().uri().optional(),
    file_url: Joi.string().uri().optional(),
    file_size_mb: Joi.number().min(0).optional(),
    price_usd: Joi.number().min(0).optional(),
    list_price_usd: Joi.number().min(0).optional(),
    currency: Joi.string().length(3).default('USD'),
    copyright_year: Joi.number().integer().min(1900).max(new Date().getFullYear() + 1).optional(),
    license_type: Joi.string().max(50).default('all_rights_reserved'),
    drm_protected: Joi.boolean().default(true),
    availability: Joi.string().valid('available', 'pre_order', 'out_of_print', 'discontinued').default('available'),
    publication_date: Joi.date().optional(),
    pre_order_date: Joi.date().optional(),
    status: Joi.string().valid('draft', 'review', 'approved', 'published', 'unpublished', 'archived').default('draft'),
    quality_score: Joi.number().min(0).max(5).optional(),
    editorial_notes: Joi.string().optional(),
    marketing_description: Joi.string().optional(),
    back_cover_text: Joi.string().optional(),
    author_bio_for_book: Joi.string().optional(),
    dedication: Joi.string().optional(),
    acknowledgments: Joi.string().optional()
});

// Walidator dla kategorii książki
const bookCategorySchema = Joi.object({
    name: Joi.string().min(1).max(255).required(),
    parent_id: Joi.string().uuid().optional(),
    description: Joi.string().optional(),
    amazon_category_id: Joi.string().max(100).optional(),
    apple_category_id: Joi.string().max(100).optional(),
    google_category_id: Joi.string().max(100).optional(),
    kobo_category_id: Joi.string().max(100).optional(),
    is_active: Joi.boolean().default(true)
});

// Walidator dla przypisania kategorii
const bookCategoryAssignmentSchema = Joi.object({
    book_id: Joi.string().uuid().required(),
    category_id: Joi.string().uuid().required(),
    is_primary: Joi.boolean().default(false)
});

// Walidator dla platformy publikowania
const publishingPlatformSchema = Joi.object({
    name: Joi.string().min(1).max(255).required(),
    code: Joi.string().min(1).max(50).required(),
    description: Joi.string().optional(),
    website: Joi.string().uri().optional(),
    api_endpoint: Joi.string().uri().optional(),
    supported_formats: Joi.array().items(Joi.string()).optional(),
    commission_rate: Joi.number().min(0).max(1).optional(),
    payment_threshold: Joi.number().min(0).optional(),
    payment_frequency: Joi.string().max(50).optional(),
    geographic_availability: Joi.array().items(Joi.string()).optional(),
    content_guidelines: Joi.string().optional(),
    technical_requirements: Joi.object().optional(),
    metadata_requirements: Joi.object().optional(),
    is_active: Joi.boolean().default(true),
    setup_instructions: Joi.string().optional(),
    support_contact: Joi.string().max(255).optional()
});

// Walidator dla publikacji książki
const bookPublicationSchema = Joi.object({
    book_id: Joi.string().uuid().required(),
    platform_id: Joi.string().uuid().required(),
    platform_book_id: Joi.string().max(255).optional(),
    publication_status: Joi.string().valid('pending', 'submitted', 'processing', 'live', 'rejected', 'suspended', 'removed').default('pending'),
    submission_date: Joi.date().optional(),
    live_date: Joi.date().optional(),
    last_sync_date: Joi.date().optional(),
    platform_url: Joi.string().uri().optional(),
    platform_specific_metadata: Joi.object().optional(),
    review_notes: Joi.string().optional(),
    error_messages: Joi.string().optional(),
    sync_status: Joi.string().max(50).default('pending')
});

// Walidator dla sprzedaży książki
const bookSaleSchema = Joi.object({
    book_id: Joi.string().uuid().required(),
    platform_id: Joi.string().uuid().required(),
    author_id: Joi.string().uuid().required(),
    sale_date: Joi.date().required(),
    quantity: Joi.number().integer().min(1).default(1),
    unit_price: Joi.number().min(0).required(),
    currency: Joi.string().length(3).default('USD'),
    gross_revenue: Joi.number().min(0).required(),
    platform_commission: Joi.number().min(0).required(),
    net_revenue: Joi.number().min(0).required(),
    author_royalty: Joi.number().min(0).required(),
    royalty_rate: Joi.number().min(0).max(1).required(),
    country_code: Joi.string().length(2).optional(),
    region: Joi.string().max(100).optional(),
    sale_type: Joi.string().valid('purchase', 'borrow', 'subscription_read', 'free_download').default('purchase'),
    promotion_code: Joi.string().max(100).optional(),
    customer_type: Joi.string().max(50).optional(),
    refunded: Joi.boolean().default(false),
    refund_date: Joi.date().optional(),
    refund_reason: Joi.string().optional(),
    transaction_id: Joi.string().max(255).optional(),
    platform_fee_details: Joi.object().optional()
});

// Walidator dla zestawienia tantiem autora
const authorRoyaltyStatementSchema = Joi.object({
    author_id: Joi.string().uuid().required(),
    period_start: Joi.date().required(),
    period_end: Joi.date().min(Joi.ref('period_start')).required(),
    total_sales_count: Joi.number().integer().min(0).default(0),
    gross_revenue: Joi.number().min(0).default(0),
    total_commissions: Joi.number().min(0).default(0),
    net_revenue: Joi.number().min(0).default(0),
    author_royalties: Joi.number().min(0).default(0),
    previous_balance: Joi.number().default(0),
    current_balance: Joi.number().default(0),
    withholding_tax: Joi.number().min(0).default(0),
    payment_amount: Joi.number().min(0).default(0),
    currency: Joi.string().length(3).default('USD'),
    status: Joi.string().valid('draft', 'generated', 'sent', 'paid', 'disputed').default('draft'),
    statement_date: Joi.date().optional(),
    payment_date: Joi.date().optional(),
    payment_method: Joi.string().max(100).optional(),
    payment_reference: Joi.string().max(255).optional(),
    notes: Joi.string().optional(),
    file_url: Joi.string().uri().optional()
});

// Walidator dla recenzji książki
const bookReviewSchema = Joi.object({
    book_id: Joi.string().uuid().required(),
    platform_id: Joi.string().uuid().required(),
    reviewer_name: Joi.string().max(255).optional(),
    reviewer_id: Joi.string().max(255).optional(),
    rating: Joi.number().min(0).max(5).optional(),
    title: Joi.string().max(500).optional(),
    content: Joi.string().optional(),
    review_date: Joi.date().required(),
    helpful_votes: Joi.number().integer().min(0).default(0),
    total_votes: Joi.number().integer().min(0).default(0),
    verified_purchase: Joi.boolean().default(false),
    review_url: Joi.string().uri().optional(),
    sentiment: Joi.string().valid('positive', 'neutral', 'negative').optional(),
    language: Joi.string().max(10).optional(),
    is_featured: Joi.boolean().default(false),
    moderation_status: Joi.string().valid('pending', 'approved', 'rejected', 'flagged').default('pending')
});

// Walidator dla kampanii marketingowej
const bookMarketingCampaignSchema = Joi.object({
    book_id: Joi.string().uuid().required(),
    author_id: Joi.string().uuid().required(),
    campaign_name: Joi.string().min(1).max(255).required(),
    campaign_type: Joi.string().min(1).max(100).required(),
    description: Joi.string().optional(),
    start_date: Joi.date().optional(),
    end_date: Joi.date().min(Joi.ref('start_date')).optional(),
    budget: Joi.number().min(0).optional(),
    currency: Joi.string().length(3).default('USD'),
    target_audience: Joi.string().optional(),
    platforms: Joi.array().items(Joi.string()).optional(),
    metrics: Joi.object().optional(),
    results: Joi.object().optional(),
    status: Joi.string().valid('planned', 'active', 'paused', 'completed', 'cancelled').default('planned'),
    created_by: Joi.string().uuid().optional(),
    notes: Joi.string().optional()
});

// Funkcje walidacyjne
const validateAuthor = (data) => authorSchema.validate(data);
const validateBook = (data) => bookSchema.validate(data);
const validateBookCategory = (data) => bookCategorySchema.validate(data);
const validateBookCategoryAssignment = (data) => bookCategoryAssignmentSchema.validate(data);
const validatePublishingPlatform = (data) => publishingPlatformSchema.validate(data);
const validateBookPublication = (data) => bookPublicationSchema.validate(data);
const validateBookSale = (data) => bookSaleSchema.validate(data);
const validateAuthorRoyaltyStatement = (data) => authorRoyaltyStatementSchema.validate(data);
const validateBookReview = (data) => bookReviewSchema.validate(data);
const validateBookMarketingCampaign = (data) => bookMarketingCampaignSchema.validate(data);

// Walidatory aktualizacji
const createUpdateValidator = (schema) => {
    const updateSchema = {};
    Object.keys(schema.describe().keys).forEach(key => {
        if (key !== 'id' && key !== 'created_at' && key !== 'updated_at') {
            updateSchema[key] = schema.extract(key).optional();
        }
    });
    return Joi.object(updateSchema);
};

const validateAuthorUpdate = (data) => createUpdateValidator(authorSchema).validate(data);
const validateBookUpdate = (data) => createUpdateValidator(bookSchema).validate(data);
const validatePublishingPlatformUpdate = (data) => createUpdateValidator(publishingPlatformSchema).validate(data);

module.exports = {
    // Schematy
    authorSchema,
    bookSchema,
    bookCategorySchema,
    bookCategoryAssignmentSchema,
    publishingPlatformSchema,
    bookPublicationSchema,
    bookSaleSchema,
    authorRoyaltyStatementSchema,
    bookReviewSchema,
    bookMarketingCampaignSchema,
    
    // Funkcje walidacyjne
    validateAuthor,
    validateBook,
    validateBookCategory,
    validateBookCategoryAssignment,
    validatePublishingPlatform,
    validateBookPublication,
    validateBookSale,
    validateAuthorRoyaltyStatement,
    validateBookReview,
    validateBookMarketingCampaign,
    
    // Walidatory aktualizacji
    validateAuthorUpdate,
    validateBookUpdate,
    validatePublishingPlatformUpdate,
    
    // Pomocnicze
    createUpdateValidator
};
