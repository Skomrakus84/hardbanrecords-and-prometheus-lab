// Kobo Writing Life Integration Adapter
// Global eBook platform with strong international presence

class KoboAdapter {
  constructor(partnerId = null, apiKey = null) {
    this.partnerId = partnerId;
    this.apiKey = apiKey;
    this.baseUrl = 'https://api.kobo.com/v1';
    this.platform = 'Kobo';
    this.tier = 'free';
    this.features = {
      ebook_publishing: true,
      audiobook_publishing: true,
      global_distribution: true,
      plus_program: true, // Kobo Plus subscription
      promotional_tools: true,
      pre_orders: true,
      series_management: true
    };
  }

  async publishBook(bookData, manuscript, coverImage) {
    try {
      const publicationData = {
        title: bookData.title,
        subtitle: bookData.subtitle || '',
        contributors: [
          {
            name: bookData.author,
            role: 'Author'
          }
        ],
        publisher: bookData.publisher || bookData.author,
        description: bookData.description,
        categories: this.mapCategories(bookData.categories || []),
        tags: bookData.keywords || [],
        language: bookData.language || 'en',
        publication_date: bookData.publicationDate || new Date().toISOString(),
        isbn: bookData.isbn || null,
        pricing: this.formatPricing(bookData.pricing || {}),
        distribution: {
          kobo_stores: bookData.koboStores || ['global'],
          kobo_plus: bookData.koboPlus !== false,
          pre_order: bookData.preOrder || false
        },
        files: {
          manuscript: manuscript, // EPUB format
          cover: coverImage
        },
        metadata: {
          drm_free: bookData.drmFree || false,
          adult_content: bookData.adultContent || false,
          series: bookData.series || null,
          series_number: bookData.seriesNumber || null
        }
      };

      const response = await this.makeRequest('POST', '/books', publicationData);
      
      return {
        success: true,
        platform: this.platform,
        book_id: response.kobo_id,
        kobo_url: response.store_url,
        status: response.publication_status,
        data: response
      };
    } catch (error) {
      return {
        success: false,
        platform: this.platform,
        error: error.message
      };
    }
  }

  async getSalesAnalytics(koboId, startDate, endDate) {
    try {
      const params = new URLSearchParams({
        book_id: koboId,
        start_date: startDate,
        end_date: endDate,
        breakdown: 'store,format'
      });

      const response = await this.makeRequest('GET', `/analytics?${params}`);
      
      return {
        success: true,
        platform: this.platform,
        analytics: {
          units_sold: response.units_sold || 0,
          revenue: response.net_revenue || 0,
          pages_read: response.kobo_plus_pages || 0,
          borrows: response.kobo_plus_borrows || 0,
          store_breakdown: response.store_sales || {},
          geographic_breakdown: response.geographic_sales || {},
          customer_ratings: {
            count: response.rating_count || 0,
            average: response.average_rating || 0
          }
        },
        data: response
      };
    } catch (error) {
      return {
        success: false,
        platform: this.platform,
        error: error.message
      };
    }
  }

  async makeRequest(method, endpoint, data = null) {
    const url = `${this.baseUrl}${endpoint}`;
    const options = {
      method,
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'X-Partner-ID': this.partnerId,
        'Content-Type': 'application/json'
      }
    };

    if (data && method !== 'GET') {
      options.body = JSON.stringify(data);
    }

    const response = await fetch(url, options);
    
    if (!response.ok) {
      throw new Error(`Kobo API Error: ${response.status} ${response.statusText}`);
    }

    return await response.json();
  }

  // Kobo specific features
  mapCategories(categories) {
    const koboCategories = {
      'fiction': 'FIC000000',
      'romance': 'FIC027000',
      'mystery': 'FIC022000',
      'fantasy': 'FIC009000',
      'science-fiction': 'FIC028000',
      'non-fiction': 'NON000000',
      'biography': 'BIO000000',
      'self-help': 'SEL000000'
    };
    
    return categories.map(cat => koboCategories[cat.toLowerCase()] || 'FIC000000');
  }

  formatPricing(pricing) {
    const defaultPricing = {
      'USD': 9.99,
      'CAD': 12.99,
      'GBP': 7.99,
      'EUR': 8.99,
      'AUD': 13.99
    };

    return {
      ...defaultPricing,
      ...pricing
    };
  }

  async createPromotionalCampaign(koboId, campaignData) {
    try {
      const campaign = {
        book_id: koboId,
        campaign_type: campaignData.type || 'discount',
        discount_percentage: campaignData.discount || 25,
        start_date: campaignData.startDate,
        end_date: campaignData.endDate,
        territories: campaignData.territories || ['global'],
        promotional_text: campaignData.promotionalText || ''
      };

      const response = await this.makeRequest('POST', '/promotions', campaign);

      return {
        success: true,
        platform: this.platform,
        campaign_id: response.campaign_id,
        status: response.status
      };
    } catch (error) {
      return {
        success: false,
        platform: this.platform,
        error: error.message
      };
    }
  }

  async manageSeriesBooks(seriesData) {
    try {
      const series = {
        series_name: seriesData.name,
        description: seriesData.description || '',
        books: seriesData.books.map(book => ({
          kobo_id: book.id,
          sequence_number: book.number,
          title: book.title
        }))
      };

      const response = await this.makeRequest('POST', '/series', series);

      return {
        success: true,
        platform: this.platform,
        series_id: response.series_id,
        series_url: response.series_url
      };
    } catch (error) {
      return {
        success: false,
        platform: this.platform,
        error: error.message
      };
    }
  }

  getIntegrationInfo() {
    return {
      platform: this.platform,
      tier: this.tier,
      features: this.features,
      requirements: {
        kobo_account: 'Kobo Writing Life account required',
        epub_format: 'EPUB format required',
        cover_specs: 'Minimum 1600x2400px cover image'
      },
      benefits: [
        'Global reach with strong international presence',
        'Kobo Plus subscription service inclusion',
        'DRM-free option available',
        'Competitive royalty rates',
        'Series management tools',
        'Pre-order capabilities'
      ],
      royalty_rates: {
        'under_2.99': '35% of list price',
        '2.99_to_12.99': '45% of list price',
        'over_12.99': '45% of list price'
      },
      global_stores: [
        'Kobo.com (Global)', 'Kobo Canada', 'Kobo UK', 'Kobo France',
        'Kobo Germany', 'Kobo Australia', 'Kobo Japan', 'Kobo Netherlands'
      ]
    };
  }
}

module.exports = KoboAdapter;