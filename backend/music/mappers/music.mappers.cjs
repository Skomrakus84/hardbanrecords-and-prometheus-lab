// Mappery dla modułu muzycznego
// Plik: music.mappers.cjs

// Mapper dla artysty
const mapArtist = (dbData) => {
    if (!dbData) return null;
    
    return {
        id: dbData.id,
        name: dbData.name,
        realName: dbData.real_name,
        bio: dbData.bio,
        genres: dbData.genres || [],
        website: dbData.website,
        email: dbData.email,
        phone: dbData.phone,
        socialMedia: dbData.social_media || {},
        imageUrl: dbData.image_url,
        status: dbData.status,
        totalReleases: dbData.total_releases || 0,
        totalTracks: dbData.total_tracks || 0,
        totalStreams: dbData.total_streams || 0,
        totalRevenue: dbData.total_revenue || 0,
        createdAt: dbData.created_at,
        updatedAt: dbData.updated_at
    };
};

// Mapper dla wydania
const mapRelease = (dbData) => {
    if (!dbData) return null;
    
    return {
        id: dbData.id,
        artistId: dbData.artist_id,
        title: dbData.title,
        type: dbData.type,
        description: dbData.description,
        releaseDate: dbData.release_date,
        label: dbData.label,
        catalogNumber: dbData.catalog_number,
        upc: dbData.upc,
        genre: dbData.genre,
        subgenres: dbData.subgenres || [],
        language: dbData.language,
        copyrightInfo: dbData.copyright_info,
        explicitContent: dbData.explicit_content,
        coverArtUrl: dbData.cover_art_url,
        priceUsd: dbData.price_usd,
        status: dbData.status,
        totalTracks: dbData.total_tracks || 0,
        totalDuration: dbData.total_duration || 0,
        totalStreams: dbData.total_streams || 0,
        totalRevenue: dbData.total_revenue || 0,
        createdAt: dbData.created_at,
        updatedAt: dbData.updated_at,
        publishedAt: dbData.published_at,
        // Relacje
        artist: dbData.artist ? mapArtist(dbData.artist) : null,
        tracks: dbData.tracks ? dbData.tracks.map(mapTrack) : []
    };
};

// Mapper dla utworu
const mapTrack = (dbData) => {
    if (!dbData) return null;
    
    return {
        id: dbData.id,
        releaseId: dbData.release_id,
        title: dbData.title,
        trackNumber: dbData.track_number,
        durationMs: dbData.duration_ms,
        isrc: dbData.isrc,
        explicitContent: dbData.explicit_content,
        previewStartTime: dbData.preview_start_time,
        lyrics: dbData.lyrics,
        fileUrl: dbData.file_url,
        fileFormat: dbData.file_format,
        fileSizeMb: dbData.file_size_mb,
        status: dbData.status,
        totalStreams: dbData.total_streams || 0,
        totalRevenue: dbData.total_revenue || 0,
        createdAt: dbData.created_at,
        updatedAt: dbData.updated_at,
        // Relacje
        release: dbData.release ? mapRelease(dbData.release) : null,
        contributors: dbData.contributors ? dbData.contributors.map(mapTrackContributor) : []
    };
};

// Mapper dla współtwórcy utworu
const mapTrackContributor = (dbData) => {
    if (!dbData) return null;
    
    return {
        id: dbData.id,
        trackId: dbData.track_id,
        artistId: dbData.artist_id,
        role: dbData.role,
        creditName: dbData.credit_name,
        percentage: dbData.percentage,
        createdAt: dbData.created_at,
        // Relacje
        artist: dbData.artist ? mapArtist(dbData.artist) : null,
        track: dbData.track ? mapTrack(dbData.track) : null
    };
};

// Mapper dla zestawienia tantiem
const mapRoyaltyStatement = (dbData) => {
    if (!dbData) return null;
    
    return {
        id: dbData.id,
        artistId: dbData.artist_id,
        periodStart: dbData.period_start,
        periodEnd: dbData.period_end,
        platform: dbData.platform,
        totalStreams: dbData.total_streams,
        totalSales: dbData.total_sales,
        grossRevenue: dbData.gross_revenue,
        platformCommission: dbData.platform_commission,
        netRevenue: dbData.net_revenue,
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
        artist: dbData.artist ? mapArtist(dbData.artist) : null
    };
};

// Mapper dla podziału tantiem
const mapRoyaltySplit = (dbData) => {
    if (!dbData) return null;
    
    return {
        id: dbData.id,
        releaseId: dbData.release_id,
        trackId: dbData.track_id,
        artistId: dbData.artist_id,
        splitType: dbData.split_type,
        percentage: dbData.percentage,
        role: dbData.role,
        createdAt: dbData.created_at,
        updatedAt: dbData.updated_at,
        // Relacje
        artist: dbData.artist ? mapArtist(dbData.artist) : null,
        release: dbData.release ? mapRelease(dbData.release) : null,
        track: dbData.track ? mapTrack(dbData.track) : null
    };
};

// Mapper dla wydatku
const mapExpense = (dbData) => {
    if (!dbData) return null;
    
    return {
        id: dbData.id,
        releaseId: dbData.release_id,
        category: dbData.category,
        description: dbData.description,
        amount: dbData.amount,
        currency: dbData.currency,
        expenseDate: dbData.expense_date,
        vendor: dbData.vendor,
        receiptUrl: dbData.receipt_url,
        recoupable: dbData.recoupable,
        recoupedAmount: dbData.recouped_amount || 0,
        createdAt: dbData.created_at,
        updatedAt: dbData.updated_at,
        // Relacje
        release: dbData.release ? mapRelease(dbData.release) : null
    };
};

// Mapper dla kanału dystrybucji
const mapDistributionChannel = (dbData) => {
    if (!dbData) return null;
    
    return {
        id: dbData.id,
        platform: dbData.platform,
        platformId: dbData.platform_id,
        revenueShare: dbData.revenue_share,
        minimumPayout: dbData.minimum_payout,
        paymentFrequency: dbData.payment_frequency,
        territories: dbData.territories || [],
        contentRequirements: dbData.content_requirements || {},
        status: dbData.status,
        createdAt: dbData.created_at,
        updatedAt: dbData.updated_at
    };
};

// Mapper dla metody wypłaty
const mapPayoutMethod = (dbData) => {
    if (!dbData) return null;
    
    return {
        id: dbData.id,
        artistId: dbData.artist_id,
        type: dbData.type,
        details: dbData.details,
        isDefault: dbData.is_default,
        minimumAmount: dbData.minimum_amount,
        currency: dbData.currency,
        createdAt: dbData.created_at,
        updatedAt: dbData.updated_at,
        // Relacje
        artist: dbData.artist ? mapArtist(dbData.artist) : null
    };
};

// Mapper dla powiadomienia
const mapNotification = (dbData) => {
    if (!dbData) return null;
    
    return {
        id: dbData.id,
        userId: dbData.user_id,
        type: dbData.type,
        title: dbData.title,
        message: dbData.message,
        actionUrl: dbData.action_url,
        isRead: dbData.is_read,
        metadata: dbData.metadata || {},
        createdAt: dbData.created_at
    };
};

// Mapper dla rekupy
const mapRecoupment = (dbData) => {
    if (!dbData) return null;
    
    return {
        id: dbData.id,
        artistId: dbData.artist_id,
        releaseId: dbData.release_id,
        totalExpenses: dbData.total_expenses,
        recoupedAmount: dbData.recouped_amount,
        remainingAmount: dbData.remaining_amount,
        recoupmentRate: dbData.recoupment_rate,
        status: dbData.status,
        startDate: dbData.start_date,
        completedDate: dbData.completed_date,
        notes: dbData.notes,
        createdAt: dbData.created_at,
        updatedAt: dbData.updated_at,
        // Relacje
        artist: dbData.artist ? mapArtist(dbData.artist) : null,
        release: dbData.release ? mapRelease(dbData.release) : null
    };
};

// Mappery dla dashboardu
const mapDashboardStats = (dbData) => {
    if (!dbData) return null;
    
    return {
        totalArtists: dbData.total_artists || 0,
        totalReleases: dbData.total_releases || 0,
        totalTracks: dbData.total_tracks || 0,
        totalStreams: dbData.total_streams || 0,
        totalRevenue: dbData.total_revenue || 0,
        monthlyGrowth: dbData.monthly_growth || 0,
        topPlatforms: dbData.top_platforms || [],
        recentActivity: dbData.recent_activity || []
    };
};

// Mapper dla analityki
const mapAnalytics = (dbData) => {
    if (!dbData) return null;
    
    return {
        period: dbData.period,
        streams: dbData.streams || 0,
        revenue: dbData.revenue || 0,
        platformBreakdown: dbData.platform_breakdown || {},
        genreBreakdown: dbData.genre_breakdown || {},
        geoBreakdown: dbData.geo_breakdown || {},
        trends: dbData.trends || []
    };
};

// Funkcje transformacji z frontend do backend
const transformArtistToDb = (frontendData) => {
    return {
        name: frontendData.name,
        real_name: frontendData.realName,
        bio: frontendData.bio,
        genres: frontendData.genres,
        website: frontendData.website,
        email: frontendData.email,
        phone: frontendData.phone,
        social_media: frontendData.socialMedia,
        image_url: frontendData.imageUrl,
        status: frontendData.status
    };
};

const transformReleaseToDb = (frontendData) => {
    return {
        artist_id: frontendData.artistId,
        title: frontendData.title,
        type: frontendData.type,
        description: frontendData.description,
        release_date: frontendData.releaseDate,
        label: frontendData.label,
        catalog_number: frontendData.catalogNumber,
        upc: frontendData.upc,
        genre: frontendData.genre,
        subgenres: frontendData.subgenres,
        language: frontendData.language,
        copyright_info: frontendData.copyrightInfo,
        explicit_content: frontendData.explicitContent,
        cover_art_url: frontendData.coverArtUrl,
        price_usd: frontendData.priceUsd,
        status: frontendData.status
    };
};

const transformTrackToDb = (frontendData) => {
    return {
        release_id: frontendData.releaseId,
        title: frontendData.title,
        track_number: frontendData.trackNumber,
        duration_ms: frontendData.durationMs,
        isrc: frontendData.isrc,
        explicit_content: frontendData.explicitContent,
        preview_start_time: frontendData.previewStartTime,
        lyrics: frontendData.lyrics,
        file_url: frontendData.fileUrl,
        file_format: frontendData.fileFormat,
        file_size_mb: frontendData.fileSizeMb,
        status: frontendData.status
    };
};

module.exports = {
    // Mappery z DB do frontend
    mapArtist,
    mapRelease,
    mapTrack,
    mapTrackContributor,
    mapRoyaltyStatement,
    mapRoyaltySplit,
    mapExpense,
    mapDistributionChannel,
    mapPayoutMethod,
    mapNotification,
    mapRecoupment,
    mapDashboardStats,
    mapAnalytics,
    
    // Transformacje z frontend do DB
    transformArtistToDb,
    transformReleaseToDb,
    transformTrackToDb
};
