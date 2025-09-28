// Draft2Digital Integration Adapter  
// Multi-platform eBook distributor

class Draft2DigitalAdapter {
  constructor(apiKey = null, userId = null) {
    this.apiKey = apiKey;
    this.userId = userId;
    this.baseUrl = 'https://api.draft2digital.com/v2';
    this.platform = 'Draft2Digital';
    this.tier = 'free';
    this.features = {
      multi_platform_distribution: true,
      epub_conversion: true,
      cover_design: true,
      isbn_assignment: true,
      universal_book_links: true,
      sales_analytics: true,
      promotional_tools: true,
      print_distribution: true
    };
  }

  async publishBook(bookData, manuscript, coverImage) {
    try {
      const publicationData = {
        title: bookData.title,
        subtitle: bookData.subtitle || '',
        authors: Array.isArray(bookData.author) ? bookData.author : [bookData.author],
        contributors: bookData.contributors || [],
        description: bookData.description,
        categories: bookData.categories || [],
        tags: bookData.keywords || [],
        language: bookData.language || 'en',
        publication_date: bookData.publicationDate || new Date().toISOString(),
        age_range: bookData.ageRange || null,
        isbn: {
          assign_new: bookData.assignISBN !== false,
          existing_isbn: bookData.isbn || null
        },
        pricing: {
          base_price: bookData.basePrice || 4.99,
          currency: bookData.currency || 'USD'
        },
        distribution: {
          retailers: bookData.retailers || [
            'amazon', 'apple', 'kobo', 'barnes-noble', 'google-play',
            'scribd', 'tolino', 'bibliotheca', 'hoopla', 'baker-taylor'
          ],
          exclude_retailers: bookData.excludeRetailers || [],
          territories: bookData.territories || 'worldwide'
        },
        files: {
          manuscript: manuscript, // Various formats accepted
          cover: coverImage,
          use_d2d_cover_creator: bookData.useD2DCover || false
        },
        metadata: {
          series: bookData.series || null,
          series_number: bookData.seriesNumber || null,
          adult_content: bookData.adultContent || false,
          public_domain: bookData.publicDomain || false
        }
      };

      const response = await this.makeRequest('POST', '/books', publicationData);
      
      return {
        success: true,
        platform: this.platform,
        book_id: response.book_id,
        isbn: response.assigned_isbn,
        universal_link: response.universal_book_link,
        distribution_status: response.distribution_status,
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

  async getSalesAnalytics(bookId, startDate, endDate) {
    try {
      const params = new URLSearchParams({
        book_id: bookId,
        start_date: startDate,
        end_date: endDate,
        group_by: 'retailer,month'
      });

      const response = await this.makeRequest('GET', `/analytics/sales?${params}`);
      
      return {
        success: true,
        platform: this.platform,
        analytics: {
          total_units_sold: response.total_units || 0,
          total_revenue: response.total_revenue || 0,
          total_royalties: response.total_royalties || 0,
          retailer_breakdown: response.retailer_sales || {},
          monthly_trends: response.monthly_data || [],
          top_territories: response.territory_sales || {},
          format_performance: response.format_breakdown || {}
        },
        retailers_performance: response.detailed_retailer_data || [],
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
        'User-ID': this.userId,
        'Content-Type': 'application/json'
      }
    };

    if (data && method !== 'GET') {
      options.body = JSON.stringify(data);
    }

    const response = await fetch(url, options);
    
    if (!response.ok) {
      throw new Error(`Draft2Digital API Error: ${response.status} ${response.statusText}`);
    }

    return await response.json();
  }

  // D2D specific features
  async generateUniversalBookLink(bookId) {
    try {
      const response = await this.makeRequest('POST', `/books/${bookId}/universal-link`);

      return {
        success: true,
        platform: this.platform,
        universal_link: response.link,
        retailer_links: response.retailer_specific_links || {}
      };
    } catch (error) {
      return {
        success: false,
        platform: this.platform,
        error: error.message
      };
    }
  }

  async createCoverWithD2D(coverData) {
    try {
      const coverRequest = {
        title: coverData.title,
        author: coverData.author,
        genre: coverData.genre || 'fiction',
        style_preferences: {
          color_scheme: coverData.colorScheme || 'professional',
          font_style: coverData.fontStyle || 'modern',
          image_style: coverData.imageStyle || 'photo'
        },
        custom_elements: coverData.customElements || {}
      };

      const response = await this.makeRequest('POST', '/cover-creator', coverRequest);

      return {
        success: true,
        platform: this.platform,
        cover_id: response.cover_id,
        preview_url: response.preview_url,
        download_url: response.download_url
      };
    } catch (error) {
      return {
        success: false,
        platform: this.platform,
        error: error.message
      };
    }
  }

  async manageRetailerDistribution(bookId, distributionSettings) {
    try {
      const settings = {
        book_id: bookId,
        add_retailers: distributionSettings.addRetailers || [],
        remove_retailers: distributionSettings.removeRetailers || [],
        retailer_specific_pricing: distributionSettings.pricing || {},
        territory_restrictions: distributionSettings.territories || {}
      };

      const response = await this.makeRequest('PUT', `/books/${bookId}/distribution`, settings);

      return {
        success: true,
        platform: this.platform,
        updated_retailers: response.active_retailers || [],
        pending_changes: response.pending_updates || []
      };
    } catch (error) {
      return {
        success: false,
        platform: this.platform,
        error: error.message
      };
    }
  }

  async getRetailerStatus(bookId) {
    try {
      const response = await this.makeRequest('GET', `/books/${bookId}/retailer-status`);

      return {
        success: true,
        platform: this.platform,
        retailer_status: response.retailers || {},
        live_stores: response.live_retailers || [],
        pending_stores: response.pending_retailers || [],
        issues: response.retailer_issues || []
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
        d2d_account: 'Draft2Digital account required',
        manuscript: 'Word doc, RTF, or EPUB accepted',
        cover: 'High-res cover image or use D2D cover creator'
      },
      benefits: [
        'Distribution to 20+ major retailers',
        'Free ISBN assignment',
        'Built-in cover creator tool',
        'Universal Book Links for marketing',
        'Consolidated royalty payments',
        'No upfront costs or fees'
      ],
      supported_retailers: [
        'Amazon Kindle', 'Apple Books', 'Kobo', 'Barnes & Noble Nook',
        'Google Play Books', 'Scribd', 'Tolino', 'Bibliotheca CloudLibrary',
        'hoopla', 'Baker & Taylor Blio', 'OverDrive', 'Gardners',
        'Smashwords', 'Ciando', 'eBooks.com', 'Mondadori', 'Casa del Libro'
      ],
      royalty_model: '60% of net receipts from retailers',
      payment_schedule: 'Monthly payments for earnings over $25',
      territories: 'Global distribution with localized pricing'
    };
  }
}

module.exports = Draft2DigitalAdapter;