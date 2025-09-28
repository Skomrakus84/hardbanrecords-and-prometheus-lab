/**
 * Currency Utilities
 * Comprehensive currency handling for international music distribution
 * Handles multiple currencies, exchange rates, and platform-specific pricing
 */

const logger = require('../../config/logger.cjs');

class CurrencyUtil {
  constructor() {
    // Supported currencies in music industry
    this.supportedCurrencies = {
      // Major currencies
      USD: { name: 'US Dollar', symbol: '$', decimals: 2, code: 'USD' },
      EUR: { name: 'Euro', symbol: '€', decimals: 2, code: 'EUR' },
      GBP: { name: 'British Pound', symbol: '£', decimals: 2, code: 'GBP' },
      JPY: { name: 'Japanese Yen', symbol: '¥', decimals: 0, code: 'JPY' },
      
      // Streaming market currencies
      CAD: { name: 'Canadian Dollar', symbol: 'C$', decimals: 2, code: 'CAD' },
      AUD: { name: 'Australian Dollar', symbol: 'A$', decimals: 2, code: 'AUD' },
      SEK: { name: 'Swedish Krona', symbol: 'kr', decimals: 2, code: 'SEK' },
      NOK: { name: 'Norwegian Krone', symbol: 'kr', decimals: 2, code: 'NOK' },
      DKK: { name: 'Danish Krone', symbol: 'kr', decimals: 2, code: 'DKK' },
      CHF: { name: 'Swiss Franc', symbol: 'CHF', decimals: 2, code: 'CHF' },
      
      // Emerging markets
      BRL: { name: 'Brazilian Real', symbol: 'R$', decimals: 2, code: 'BRL' },
      MXN: { name: 'Mexican Peso', symbol: 'MX$', decimals: 2, code: 'MXN' },
      INR: { name: 'Indian Rupee', symbol: '₹', decimals: 2, code: 'INR' },
      KRW: { name: 'South Korean Won', symbol: '₩', decimals: 0, code: 'KRW' },
      CNY: { name: 'Chinese Yuan', symbol: '¥', decimals: 2, code: 'CNY' },
      
      // Other important markets
      PLN: { name: 'Polish Zloty', symbol: 'zł', decimals: 2, code: 'PLN' },
      RUB: { name: 'Russian Ruble', symbol: '₽', decimals: 2, code: 'RUB' },
      TRY: { name: 'Turkish Lira', symbol: '₺', decimals: 2, code: 'TRY' },
      ZAR: { name: 'South African Rand', symbol: 'R', decimals: 2, code: 'ZAR' },
      NZD: { name: 'New Zealand Dollar', symbol: 'NZ$', decimals: 2, code: 'NZD' }
    };

    // Platform-specific currency preferences
    this.platformCurrencies = {
      spotify: {
        primary: 'USD',
        reporting: ['USD', 'EUR', 'GBP', 'SEK'],
        payouts: ['USD', 'EUR', 'GBP', 'SEK', 'NOK', 'DKK']
      },
      apple_music: {
        primary: 'USD',
        reporting: ['USD', 'EUR', 'GBP', 'JPY', 'CAD', 'AUD'],
        payouts: ['USD', 'EUR', 'GBP', 'JPY', 'CAD', 'AUD']
      },
      youtube_music: {
        primary: 'USD',
        reporting: ['USD', 'EUR', 'GBP', 'JPY', 'CAD', 'AUD', 'BRL', 'INR'],
        payouts: ['USD', 'EUR', 'GBP', 'JPY']
      },
      tidal: {
        primary: 'USD',
        reporting: ['USD', 'EUR', 'GBP', 'NOK'],
        payouts: ['USD', 'EUR', 'NOK']
      },
      amazon_music: {
        primary: 'USD',
        reporting: ['USD', 'EUR', 'GBP', 'JPY', 'CAD', 'AUD', 'BRL'],
        payouts: ['USD', 'EUR', 'GBP', 'JPY']
      },
      deezer: {
        primary: 'EUR',
        reporting: ['EUR', 'USD', 'GBP', 'BRL'],
        payouts: ['EUR', 'USD', 'GBP']
      }
    };

    // Typical streaming payouts per play (in USD)
    this.streamingRates = {
      spotify: { min: 0.003, max: 0.005, avg: 0.004 },
      apple_music: { min: 0.007, max: 0.01, avg: 0.0078 },
      youtube_music: { min: 0.0008, max: 0.003, avg: 0.002 },
      tidal: { min: 0.01, max: 0.015, avg: 0.0125 },
      amazon_music: { min: 0.004, max: 0.007, avg: 0.0055 },
      deezer: { min: 0.005, max: 0.008, avg: 0.0064 }
    };

    // Exchange rate cache (in production, use real-time rates)
    this.exchangeRates = {
      // Base rates relative to USD (mock data - use live API in production)
      USD: 1.0,
      EUR: 0.85,
      GBP: 0.73,
      JPY: 110.0,
      CAD: 1.25,
      AUD: 1.35,
      SEK: 8.5,
      NOK: 8.8,
      DKK: 6.3,
      CHF: 0.92,
      BRL: 5.2,
      MXN: 20.0,
      INR: 74.0,
      KRW: 1180.0,
      CNY: 6.4,
      PLN: 3.8,
      RUB: 74.0,
      TRY: 8.5,
      ZAR: 14.5,
      NZD: 1.42
    };

    this.lastRateUpdate = new Date();
  }

  // ========== Currency Information ==========

  /**
   * Get currency information
   */
  getCurrencyInfo(currencyCode) {
    const code = currencyCode?.toUpperCase();
    return this.supportedCurrencies[code] || null;
  }

  /**
   * Check if currency is supported
   */
  isSupported(currencyCode) {
    const code = currencyCode?.toUpperCase();
    return Boolean(this.supportedCurrencies[code]);
  }

  /**
   * Get all supported currencies
   */
  getAllCurrencies() {
    return Object.keys(this.supportedCurrencies);
  }

  /**
   * Get major currencies for music industry
   */
  getMajorCurrencies() {
    return ['USD', 'EUR', 'GBP', 'JPY', 'CAD', 'AUD'];
  }

  /**
   * Get platform supported currencies
   */
  getPlatformCurrencies(platform, type = 'reporting') {
    const platformData = this.platformCurrencies[platform.toLowerCase().replace(/[^a-z_]/g, '_')];
    if (!platformData) return [];
    
    return platformData[type] || [];
  }

  // ========== Currency Conversion ==========

  /**
   * Convert amount between currencies
   */
  convert(amount, fromCurrency, toCurrency) {
    if (!amount || amount === 0) return 0;
    
    const from = fromCurrency?.toUpperCase();
    const to = toCurrency?.toUpperCase();

    if (from === to) return amount;

    if (!this.isSupported(from) || !this.isSupported(to)) {
      throw new Error(`Unsupported currency conversion: ${from} to ${to}`);
    }

    const fromRate = this.exchangeRates[from];
    const toRate = this.exchangeRates[to];

    if (!fromRate || !toRate) {
      throw new Error(`Missing exchange rate for ${from} or ${to}`);
    }

    // Convert to USD first, then to target currency
    const usdAmount = amount / fromRate;
    const convertedAmount = usdAmount * toRate;

    return this.roundToCurrencyPrecision(convertedAmount, to);
  }

  /**
   * Get exchange rate between currencies
   */
  getExchangeRate(fromCurrency, toCurrency) {
    const from = fromCurrency?.toUpperCase();
    const to = toCurrency?.toUpperCase();

    if (from === to) return 1;

    const fromRate = this.exchangeRates[from];
    const toRate = this.exchangeRates[to];

    if (!fromRate || !toRate) {
      return null;
    }

    return toRate / fromRate;
  }

  /**
   * Round amount to currency precision
   */
  roundToCurrencyPrecision(amount, currencyCode) {
    const currency = this.getCurrencyInfo(currencyCode);
    if (!currency) return amount;

    const factor = Math.pow(10, currency.decimals);
    return Math.round(amount * factor) / factor;
  }

  // ========== Currency Formatting ==========

  /**
   * Format amount for display
   */
  format(amount, currencyCode, options = {}) {
    const currency = this.getCurrencyInfo(currencyCode);
    if (!currency) {
      return `${amount} ${currencyCode}`;
    }

    const {
      showSymbol = true,
      showCode = false,
      locale = 'en-US'
    } = options;

    const roundedAmount = this.roundToCurrencyPrecision(amount, currencyCode);
    
    try {
      const formatter = new Intl.NumberFormat(locale, {
        style: 'currency',
        currency: currencyCode,
        minimumFractionDigits: currency.decimals,
        maximumFractionDigits: currency.decimals
      });
      
      let formatted = formatter.format(roundedAmount);
      
      if (!showSymbol) {
        // Remove currency symbol
        formatted = formatted.replace(/[^\d.,\s-]/g, '').trim();
      }
      
      if (showCode) {
        formatted += ` ${currencyCode}`;
      }
      
      return formatted;
    } catch (error) {
      // Fallback formatting
      const symbol = showSymbol ? currency.symbol : '';
      const code = showCode ? ` ${currencyCode}` : '';
      return `${symbol}${roundedAmount.toFixed(currency.decimals)}${code}`;
    }
  }

  /**
   * Format for API responses
   */
  formatForAPI(amount, currencyCode) {
    return {
      amount: this.roundToCurrencyPrecision(amount, currencyCode),
      currency: currencyCode?.toUpperCase(),
      formatted: this.format(amount, currencyCode)
    };
  }

  /**
   * Format compact (K, M, B notation)
   */
  formatCompact(amount, currencyCode) {
    const currency = this.getCurrencyInfo(currencyCode);
    if (!currency) return `${amount} ${currencyCode}`;

    let value = amount;
    let suffix = '';

    if (Math.abs(value) >= 1e9) {
      value = value / 1e9;
      suffix = 'B';
    } else if (Math.abs(value) >= 1e6) {
      value = value / 1e6;
      suffix = 'M';
    } else if (Math.abs(value) >= 1e3) {
      value = value / 1e3;
      suffix = 'K';
    }

    const rounded = Math.round(value * 10) / 10;
    return `${currency.symbol}${rounded}${suffix}`;
  }

  // ========== Revenue Calculations ==========

  /**
   * Calculate estimated revenue from streams
   */
  calculateStreamingRevenue(streams, platform, currency = 'USD') {
    const rates = this.streamingRates[platform.toLowerCase().replace(/[^a-z_]/g, '_')];
    if (!rates) {
      throw new Error(`Unknown platform: ${platform}`);
    }

    const revenueUSD = {
      min: streams * rates.min,
      max: streams * rates.max,
      avg: streams * rates.avg
    };

    if (currency.toUpperCase() === 'USD') {
      return revenueUSD;
    }

    // Convert to requested currency
    return {
      min: this.convert(revenueUSD.min, 'USD', currency),
      max: this.convert(revenueUSD.max, 'USD', currency),
      avg: this.convert(revenueUSD.avg, 'USD', currency)
    };
  }

  /**
   * Calculate total revenue across platforms
   */
  calculateTotalRevenue(streamingData, currency = 'USD') {
    let totalMin = 0;
    let totalMax = 0;
    let totalAvg = 0;

    for (const [platform, streams] of Object.entries(streamingData)) {
      try {
        const revenue = this.calculateStreamingRevenue(streams, platform, currency);
        totalMin += revenue.min;
        totalMax += revenue.max;
        totalAvg += revenue.avg;
      } catch (error) {
        logger.warn('Error calculating revenue for platform', { platform, error: error.message });
      }
    }

    return {
      min: this.roundToCurrencyPrecision(totalMin, currency),
      max: this.roundToCurrencyPrecision(totalMax, currency),
      avg: this.roundToCurrencyPrecision(totalAvg, currency),
      currency: currency.toUpperCase()
    };
  }

  /**
   * Calculate royalty splits
   */
  calculateRoyaltySplits(totalRevenue, splits, currency = 'USD') {
    const results = {};

    // Validate splits total to 100%
    const totalPercentage = Object.values(splits).reduce((sum, pct) => sum + pct, 0);
    if (Math.abs(totalPercentage - 100) > 0.01) {
      throw new Error(`Royalty splits must total 100%. Current total: ${totalPercentage}%`);
    }

    for (const [entity, percentage] of Object.entries(splits)) {
      const amount = (totalRevenue * percentage) / 100;
      results[entity] = {
        percentage,
        amount: this.roundToCurrencyPrecision(amount, currency),
        formatted: this.format(amount, currency)
      };
    }

    return {
      splits: results,
      total: {
        amount: this.roundToCurrencyPrecision(totalRevenue, currency),
        formatted: this.format(totalRevenue, currency),
        currency: currency.toUpperCase()
      }
    };
  }

  // ========== Currency Validation ==========

  /**
   * Validate currency amount
   */
  validateAmount(amount, currencyCode) {
    const errors = [];
    const warnings = [];

    // Basic validation
    if (typeof amount !== 'number' || isNaN(amount)) {
      errors.push('Amount must be a valid number');
      return { isValid: false, errors, warnings };
    }

    if (amount < 0) {
      errors.push('Amount cannot be negative');
    }

    // Currency validation
    if (!this.isSupported(currencyCode)) {
      errors.push(`Unsupported currency: ${currencyCode}`);
      return { isValid: false, errors, warnings };
    }

    const currency = this.getCurrencyInfo(currencyCode);
    
    // Check for excessive precision
    const factor = Math.pow(10, currency.decimals);
    const rounded = Math.round(amount * factor) / factor;
    if (Math.abs(amount - rounded) > 0.000001) {
      warnings.push(`Amount rounded to ${currency.decimals} decimal places`);
    }

    // Check for very small amounts
    const minAmount = 1 / factor;
    if (amount > 0 && amount < minAmount) {
      warnings.push(`Amount ${amount} is smaller than minimum unit ${minAmount} for ${currencyCode}`);
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      rounded
    };
  }

  /**
   * Validate platform currency support
   */
  validatePlatformCurrency(platform, currencyCode, type = 'reporting') {
    const supportedCurrencies = this.getPlatformCurrencies(platform, type);
    const currency = currencyCode?.toUpperCase();
    
    return {
      isSupported: supportedCurrencies.includes(currency),
      supportedCurrencies,
      type
    };
  }

  // ========== Exchange Rate Management ==========

  /**
   * Update exchange rates (mock implementation)
   */
  async updateExchangeRates() {
    // In production, fetch from a real API like:
    // - Exchange Rates API
    // - CurrencyLayer
    // - Fixer.io
    // - OpenExchangeRates
    
    try {
      // Mock update - in production, make API call
      this.lastRateUpdate = new Date();
      logger.info('Exchange rates updated', { timestamp: this.lastRateUpdate });
      
      return {
        success: true,
        lastUpdate: this.lastRateUpdate,
        ratesCount: Object.keys(this.exchangeRates).length
      };
    } catch (error) {
      logger.error('Failed to update exchange rates', { error: error.message });
      throw error;
    }
  }

  /**
   * Check if rates need updating
   */
  needsRateUpdate(maxAgeHours = 24) {
    const now = new Date();
    const ageHours = (now - this.lastRateUpdate) / (1000 * 60 * 60);
    return ageHours > maxAgeHours;
  }

  /**
   * Get last update time
   */
  getLastUpdateTime() {
    return {
      timestamp: this.lastRateUpdate,
      age: this.getUpdateAge()
    };
  }

  /**
   * Get age of last update in human readable format
   */
  getUpdateAge() {
    const now = new Date();
    const diffMs = now - this.lastRateUpdate;
    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours > 0) {
      return `${hours}h ${minutes}m ago`;
    }
    return `${minutes}m ago`;
  }

  // ========== Utility Methods ==========

  /**
   * Parse currency string
   */
  parseCurrencyString(currencyString) {
    // Extract amount and currency from strings like "$100 USD", "€50", "¥1000"
    const patterns = [
      /^([A-Z]{3})\s*([\d.,]+)$/i, // "USD 100"
      /^([\d.,]+)\s*([A-Z]{3})$/i, // "100 USD"
      /^[$€£¥₹₩₺₽]\s*([\d.,]+)\s*([A-Z]{3})?$/i, // "$100 USD" or "$100"
    ];

    for (const pattern of patterns) {
      const match = currencyString.match(pattern);
      if (match) {
        let amount, currency;
        
        if (pattern.source.includes('([A-Z]{3}).*([\\d.,]+)')) {
          currency = match[1];
          amount = parseFloat(match[2].replace(/,/g, ''));
        } else {
          amount = parseFloat(match[1].replace(/,/g, ''));
          currency = match[2] || this.detectCurrencyFromSymbol(currencyString);
        }
        
        return {
          amount,
          currency: currency?.toUpperCase(),
          isValid: !isNaN(amount) && this.isSupported(currency)
        };
      }
    }

    return {
      amount: null,
      currency: null,
      isValid: false
    };
  }

  /**
   * Detect currency from symbol
   */
  detectCurrencyFromSymbol(text) {
    const symbolMap = {
      '$': 'USD',
      '€': 'EUR',
      '£': 'GBP',
      '¥': 'JPY',
      '₹': 'INR',
      '₩': 'KRW',
      '₺': 'TRY',
      '₽': 'RUB'
    };

    for (const [symbol, currency] of Object.entries(symbolMap)) {
      if (text.includes(symbol)) {
        return currency;
      }
    }

    return null;
  }

  /**
   * Log currency operation
   */
  logCurrencyOperation(operation, details = {}) {
    logger.info('Currency operation', {
      operation,
      timestamp: new Date().toISOString(),
      ...details
    });
  }
}

module.exports = new CurrencyUtil();
