// Mappery dla modułu publikowania
// Plik: publishing.mappers.cjs

// Mapper dla autora
const mapAuthor = (dbData) => {
    if (!dbData) return null;
    
    return {
        id: dbData.id,
        userId: dbData.user_id,
        penName: dbData.pen_name,
        realName: dbData.real_name,
        bio: dbData.bio,
        website: dbData.website,
        email: dbData.email,
        phone: dbData.phone,
        address: dbData.address,
        taxId: dbData.tax_id,
        bankAccount: dbData.bank_account,
        dateOfBirth: dbData.date_of_birth,
        nationality: dbData.nationality,
        preferredLanguage: dbData.preferred_language,
        marketingConsent: dbData.marketing_consent,
        profileImageUrl: dbData.profile_image_url,
        socialMedia: dbData.social_media || {},
        preferredGenres: dbData.preferred_genres || [],
        writingStyle: dbData.writing_style,
        awards: dbData.awards || [],
        education: dbData.education,
        status: dbData.status,
        totalBooks: dbData.total_books || 0,
        totalSales: dbData.total_sales || 0,
        totalRevenue: dbData.total_revenue || 0,
        averageRating: dbData.average_rating || 0,
        createdAt: dbData.created_at,
        updatedAt: dbData.updated_at
    };
};

// Mapper dla książki
const mapBook = (dbData) => {
    if (!dbData) return null;
    
    return {
        id: dbData.id,
        authorId: dbData.author_id,
        title: dbData.title,
        subtitle: dbData.subtitle,
        seriesName: dbData.series_name,
        seriesNumber: dbData.series_number,
        description: dbData.description,
        isbn13: dbData.isbn_13,
        isbn10: dbData.isbn_10,
        asin: dbData.asin,
        language: dbData.language,
        pageCount: dbData.page_count,
        wordCount: dbData.word_count,
        format: dbData.format,
        genre: dbData.genre,
        subgenres: dbData.subgenres || [],
        keywords: dbData.keywords || [],
        targetAudience: dbData.target_audience,
        contentRating: dbData.content_rating,
        coverImageUrl: dbData.cover_image_url,
        previewUrl: dbData.preview_url,
        fileUrl: dbData.file_url,
        fileSizeMb: dbData.file_size_mb,
        priceUsd: dbData.price_usd,
        listPriceUsd: dbData.list_price_usd,
        currency: dbData.currency,
        copyrightYear: dbData.copyright_year,
        licenseType: dbData.license_type,
        drmProtected: dbData.drm_protected,
        availability: dbData.availability,
        publicationDate: dbData.publication_date,
        preOrderDate: dbData.pre_order_date,
        status: dbData.status,
        qualityScore: dbData.quality_score,
        editorialNotes: dbData.editorial_notes,
        marketingDescription: dbData.marketing_description,
        backCoverText: dbData.back_cover_text,
        authorBioForBook: dbData.author_bio_for_book,
        dedication: dbData.dedication,
        acknowledgments: dbData.acknowledgments,
        totalSales: dbData.total_sales || 0,
        totalRevenue: dbData.total_revenue || 0,
        averageRating: dbData.average_rating || 0,
        reviewCount: dbData.review_count || 0,
        createdAt: dbData.created_at,
        updatedAt: dbData.updated_at,
        publishedAt: dbData.published_at,
        // Relacje
        author: dbData.author ? mapAuthor(dbData.author) : null,
        categories: dbData.categories ? dbData.categories.map(mapBookCategory) : [],
        publications: dbData.publications ? dbData.publications.map(mapBookPublication) : [],
        sales: dbData.sales ? dbData.sales.map(mapBookSale) : [],
        reviews: dbData.reviews ? dbData.reviews.map(mapBookReview) : []
    };
};

// Mapper dla kategorii książki
const mapBookCategory = (dbData) => {
    if (!dbData) return null;
    
    return {
        id: dbData.id,
        name: dbData.name,
        parentId: dbData.parent_id,
        description: dbData.description,
        amazonCategoryId: dbData.amazon_category_id,
        appleCategoryId: dbData.apple_category_id,
        googleCategoryId: dbData.google_category_id,
        koboCategoryId: dbData.kobo_category_id,
        isActive: dbData.is_active,
        createdAt: dbData.created_at,
        // Relacje
        parent: dbData.parent ? mapBookCategory(dbData.parent) : null,
        children: dbData.children ? dbData.children.map(mapBookCategory) : []
    };
};

// Mapper dla przypisania kategorii
const mapBookCategoryAssignment = (dbData) => {
    if (!dbData) return null;
    
    return {
        id: dbData.id,
        bookId: dbData.book_id,
        categoryId: dbData.category_id,
        isPrimary: dbData.is_primary,
        createdAt: dbData.created_at,
        // Relacje
        book: dbData.book ? mapBook(dbData.book) : null,
        category: dbData.category ? mapBookCategory(dbData.category) : null
    };
};

// Mapper dla platformy publikowania
const mapPublishingPlatform = (dbData) => {
    if (!dbData) return null;
    
    return {
        id: dbData.id,
        name: dbData.name,
        code: dbData.code,
        description: dbData.description,
        website: dbData.website,
        apiEndpoint: dbData.api_endpoint,
        supportedFormats: dbData.supported_formats || [],
        commissionRate: dbData.commission_rate,
        paymentThreshold: dbData.payment_threshold,
        paymentFrequency: dbData.payment_frequency,
        geographicAvailability: dbData.geographic_availability || [],
        contentGuidelines: dbData.content_guidelines,
        technicalRequirements: dbData.technical_requirements || {},
        metadataRequirements: dbData.metadata_requirements || {},
        isActive: dbData.is_active,
        setupInstructions: dbData.setup_instructions,
        supportContact: dbData.support_contact,
        totalBooks: dbData.total_books || 0,
        totalSales: dbData.total_sales || 0,
        totalRevenue: dbData.total_revenue || 0,
        createdAt: dbData.created_at,
        updatedAt: dbData.updated_at
    };
};

// Mapper dla publikacji książki
const mapBookPublication = (dbData) => {
    if (!dbData) return null;
    
    return {
        id: dbData.id,
        bookId: dbData.book_id,
        platformId: dbData.platform_id,
        platformBookId: dbData.platform_book_id,
        publicationStatus: dbData.publication_status,
        submissionDate: dbData.submission_date,
        liveDate: dbData.live_date,
        lastSyncDate: dbData.last_sync_date,
        platformUrl: dbData.platform_url,
        platformSpecificMetadata: dbData.platform_specific_metadata || {},
        reviewNotes: dbData.review_notes,
        errorMessages: dbData.error_messages,
        syncStatus: dbData.sync_status,
        createdAt: dbData.created_at,
        updatedAt: dbData.updated_at,
        // Relacje
        book: dbData.book ? mapBook(dbData.book) : null,
        platform: dbData.platform ? mapPublishingPlatform(dbData.platform) : null
    };
};

// Mapper dla sprzedaży książki
const mapBookSale = (dbData) => {
    if (!dbData) return null;
    
    return {
        id: dbData.id,
        bookId: dbData.book_id,
        platformId: dbData.platform_id,
        authorId: dbData.author_id,
        saleDate: dbData.sale_date,
        quantity: dbData.quantity,
        unitPrice: dbData.unit_price,
        currency: dbData.currency,
        grossRevenue: dbData.gross_revenue,
        platformCommission: dbData.platform_commission,
        netRevenue: dbData.net_revenue,
        authorRoyalty: dbData.author_royalty,
        royaltyRate: dbData.royalty_rate,
        countryCode: dbData.country_code,
        region: dbData.region,
        saleType: dbData.sale_type,
        promotionCode: dbData.promotion_code,
        customerType: dbData.customer_type,
        refunded: dbData.refunded,
        refundDate: dbData.refund_date,
        refundReason: dbData.refund_reason,
        transactionId: dbData.transaction_id,
        platformFeeDetails: dbData.platform_fee_details || {},
        createdAt: dbData.created_at,
        updatedAt: dbData.updated_at,
        // Relacje
        book: dbData.book ? mapBook(dbData.book) : null,
        platform: dbData.platform ? mapPublishingPlatform(dbData.platform) : null,
        author: dbData.author ? mapAuthor(dbData.author) : null
    };
};

// Mapper dla zestawienia tantiem autora
const mapAuthorRoyaltyStatement = (dbData) => {
    if (!dbData) return null;
    
    return {
        id: dbData.id,
        authorId: dbData.author_id,
        periodStart: dbData.period_start,
        periodEnd: dbData.period_end,
        totalSalesCount: dbData.total_sales_count,
        grossRevenue: dbData.gross_revenue,
        totalCommissions: dbData.total_commissions,
        netRevenue: dbData.net_revenue,
        authorRoyalties: dbData.author_royalties,
        previousBalance: dbData.previous_balance,
        currentBalance: dbData.current_balance,
        withholdingTax: dbData.withholding_tax,
        paymentAmount: dbData.payment_amount,
        currency: dbData.currency,
        status: dbData.status,
        statementDate: dbData.statement_date,
        paymentDate: dbData.payment_date,
        paymentMethod: dbData.payment_method,
        paymentReference: dbData.payment_reference,
        notes: dbData.notes,
        fileUrl: dbData.file_url,
        createdAt: dbData.created_at,
        updatedAt: dbData.updated_at,
        // Relacje
        author: dbData.author ? mapAuthor(dbData.author) : null
    };
};

// Mapper dla recenzji książki
const mapBookReview = (dbData) => {
    if (!dbData) return null;
    
    return {
        id: dbData.id,
        bookId: dbData.book_id,
        platformId: dbData.platform_id,
        reviewerName: dbData.reviewer_name,
        reviewerId: dbData.reviewer_id,
        rating: dbData.rating,
        title: dbData.title,
        content: dbData.content,
        reviewDate: dbData.review_date,
        helpfulVotes: dbData.helpful_votes,
        totalVotes: dbData.total_votes,
        verifiedPurchase: dbData.verified_purchase,
        reviewUrl: dbData.review_url,
        sentiment: dbData.sentiment,
        language: dbData.language,
        isFeatured: dbData.is_featured,
        moderationStatus: dbData.moderation_status,
        createdAt: dbData.created_at,
        // Relacje
        book: dbData.book ? mapBook(dbData.book) : null,
        platform: dbData.platform ? mapPublishingPlatform(dbData.platform) : null
    };
};

// Mapper dla kampanii marketingowej
const mapBookMarketingCampaign = (dbData) => {
    if (!dbData) return null;
    
    return {
        id: dbData.id,
        bookId: dbData.book_id,
        authorId: dbData.author_id,
        campaignName: dbData.campaign_name,
        campaignType: dbData.campaign_type,
        description: dbData.description,
        startDate: dbData.start_date,
        endDate: dbData.end_date,
        budget: dbData.budget,
        currency: dbData.currency,
        targetAudience: dbData.target_audience,
        platforms: dbData.platforms || [],
        metrics: dbData.metrics || {},
        results: dbData.results || {},
        status: dbData.status,
        createdBy: dbData.created_by,
        notes: dbData.notes,
        createdAt: dbData.created_at,
        updatedAt: dbData.updated_at,
        // Relacje
        book: dbData.book ? mapBook(dbData.book) : null,
        author: dbData.author ? mapAuthor(dbData.author) : null
    };
};

// Mappery dla dashboardu
const mapPublishingDashboardStats = (dbData) => {
    if (!dbData) return null;
    
    return {
        totalAuthors: dbData.total_authors || 0,
        totalBooks: dbData.total_books || 0,
        totalSales: dbData.total_sales || 0,
        totalRevenue: dbData.total_revenue || 0,
        monthlyGrowth: dbData.monthly_growth || 0,
        topGenres: dbData.top_genres || [],
        topPlatforms: dbData.top_platforms || [],
        recentActivity: dbData.recent_activity || []
    };
};

// Mapper dla analityki publikowania
const mapPublishingAnalytics = (dbData) => {
    if (!dbData) return null;
    
    return {
        period: dbData.period,
        sales: dbData.sales || 0,
        revenue: dbData.revenue || 0,
        platformBreakdown: dbData.platform_breakdown || {},
        genreBreakdown: dbData.genre_breakdown || {},
        geoBreakdown: dbData.geo_breakdown || {},
        trends: dbData.trends || []
    };
};

// Funkcje transformacji z frontend do backend
const transformAuthorToDb = (frontendData) => {
    return {
        user_id: frontendData.userId,
        pen_name: frontendData.penName,
        real_name: frontendData.realName,
        bio: frontendData.bio,
        website: frontendData.website,
        email: frontendData.email,
        phone: frontendData.phone,
        address: frontendData.address,
        tax_id: frontendData.taxId,
        bank_account: frontendData.bankAccount,
        date_of_birth: frontendData.dateOfBirth,
        nationality: frontendData.nationality,
        preferred_language: frontendData.preferredLanguage,
        marketing_consent: frontendData.marketingConsent,
        profile_image_url: frontendData.profileImageUrl,
        social_media: frontendData.socialMedia,
        preferred_genres: frontendData.preferredGenres,
        writing_style: frontendData.writingStyle,
        awards: frontendData.awards,
        education: frontendData.education,
        status: frontendData.status
    };
};

const transformBookToDb = (frontendData) => {
    return {
        author_id: frontendData.authorId,
        title: frontendData.title,
        subtitle: frontendData.subtitle,
        series_name: frontendData.seriesName,
        series_number: frontendData.seriesNumber,
        description: frontendData.description,
        isbn_13: frontendData.isbn13,
        isbn_10: frontendData.isbn10,
        asin: frontendData.asin,
        language: frontendData.language,
        page_count: frontendData.pageCount,
        word_count: frontendData.wordCount,
        format: frontendData.format,
        genre: frontendData.genre,
        subgenres: frontendData.subgenres,
        keywords: frontendData.keywords,
        target_audience: frontendData.targetAudience,
        content_rating: frontendData.contentRating,
        cover_image_url: frontendData.coverImageUrl,
        preview_url: frontendData.previewUrl,
        file_url: frontendData.fileUrl,
        file_size_mb: frontendData.fileSizeMb,
        price_usd: frontendData.priceUsd,
        list_price_usd: frontendData.listPriceUsd,
        currency: frontendData.currency,
        copyright_year: frontendData.copyrightYear,
        license_type: frontendData.licenseType,
        drm_protected: frontendData.drmProtected,
        availability: frontendData.availability,
        publication_date: frontendData.publicationDate,
        pre_order_date: frontendData.preOrderDate,
        status: frontendData.status,
        quality_score: frontendData.qualityScore,
        editorial_notes: frontendData.editorialNotes,
        marketing_description: frontendData.marketingDescription,
        back_cover_text: frontendData.backCoverText,
        author_bio_for_book: frontendData.authorBioForBook,
        dedication: frontendData.dedication,
        acknowledgments: frontendData.acknowledgments
    };
};

module.exports = {
    // Mappery z DB do frontend
    mapAuthor,
    mapBook,
    mapBookCategory,
    mapBookCategoryAssignment,
    mapPublishingPlatform,
    mapBookPublication,
    mapBookSale,
    mapAuthorRoyaltyStatement,
    mapBookReview,
    mapBookMarketingCampaign,
    mapPublishingDashboardStats,
    mapPublishingAnalytics,
    
    // Transformacje z frontend do DB
    transformAuthorToDb,
    transformBookToDb
};
