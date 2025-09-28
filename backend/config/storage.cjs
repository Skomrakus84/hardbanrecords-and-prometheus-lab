const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Supabase Storage Configuration (nie AWS S3)
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const bucketName = process.env.SUPABASE_BUCKET_NAME || 'hardbanrecords-files';

// Initialize Supabase client for file operations
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Storage helper functions
const storageHelpers = {
  // Upload file to Supabase Storage
  uploadFile: async (file, path, options = {}) => {
    try {
      const { data, error } = await supabase.storage
        .from(bucketName)
        .upload(path, file, {
          cacheControl: '3600',
          upsert: false,
          ...options
        });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Supabase Storage upload error:', error);
      throw error;
    }
  },

  // Get public URL for file
  getPublicUrl: (path) => {
    const { data } = supabase.storage
      .from(bucketName)
      .getPublicUrl(path);

    return data.publicUrl;
  },

  // Delete file from storage
  deleteFile: async (path) => {
    try {
      const { error } = await supabase.storage
        .from(bucketName)
        .remove([path]);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Supabase Storage delete error:', error);
      throw error;
    }
  },

  // List files in bucket
  listFiles: async (folder = '') => {
    try {
      const { data, error } = await supabase.storage
        .from(bucketName)
        .list(folder);

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Supabase Storage list error:', error);
      throw error;
    }
  },

  // Generate signed URL for private files
  getSignedUrl: async (path, expiresIn = 3600) => {
    try {
      const { data, error } = await supabase.storage
        .from(bucketName)
        .createSignedUrl(path, expiresIn);

      if (error) throw error;
      return data.signedUrl;
    } catch (error) {
      console.error('Supabase Storage signed URL error:', error);
      throw error;
    }
  }
};

// File validation helpers
const validateFile = {
  audio: (file) => {
    const allowedFormats = (process.env.ALLOWED_AUDIO_FORMATS || 'mp3,wav,flac,aac,m4a').split(',');
    const maxSize = parseInt(process.env.MAX_AUDIO_FILE_SIZE || '104857600'); // 100MB

    const extension = file.originalname.split('.').pop().toLowerCase();

    if (!allowedFormats.includes(extension)) {
      throw new Error(`Audio format ${extension} not allowed. Supported: ${allowedFormats.join(', ')}`);
    }

    if (file.size > maxSize) {
      throw new Error(`Audio file too large. Max size: ${maxSize / 1024 / 1024}MB`);
    }

    return true;
  },

  image: (file) => {
    const allowedFormats = (process.env.ALLOWED_IMAGE_FORMATS || 'jpg,jpeg,png,webp').split(',');
    const maxSize = parseInt(process.env.MAX_FILE_SIZE || '52428800'); // 50MB

    const extension = file.originalname.split('.').pop().toLowerCase();

    if (!allowedFormats.includes(extension)) {
      throw new Error(`Image format ${extension} not allowed. Supported: ${allowedFormats.join(', ')}`);
    }

    if (file.size > maxSize) {
      throw new Error(`Image file too large. Max size: ${maxSize / 1024 / 1024}MB`);
    }

    return true;
  },

  document: (file) => {
    const allowedFormats = (process.env.ALLOWED_DOCUMENT_FORMATS || 'pdf,doc,docx').split(',');
    const maxSize = parseInt(process.env.MAX_FILE_SIZE || '52428800'); // 50MB

    const extension = file.originalname.split('.').pop().toLowerCase();

    if (!allowedFormats.includes(extension)) {
      throw new Error(`Document format ${extension} not allowed. Supported: ${allowedFormats.join(', ')}`);
    }

    if (file.size > maxSize) {
      throw new Error(`Document too large. Max size: ${maxSize / 1024 / 1024}MB`);
    }

    return true;
  }
};

module.exports = {
  supabase,
  storageHelpers,
  validateFile,
  bucketName,
  config: {
    bucketName,
    publicUrl: process.env.SUPABASE_STORAGE_URL,
    maxFileSize: process.env.MAX_FILE_SIZE,
    maxAudioSize: process.env.MAX_AUDIO_FILE_SIZE
  }
};
