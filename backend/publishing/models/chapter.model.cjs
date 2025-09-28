const { createClient } = require('@supabase/supabase-js');
const config = require('../config/env.cjs');
const logger = require('../config/logger.cjs');

/**
 * Chapter Model
 * Manages book chapters and sections for digital publishing
 */
class ChapterModel {
    constructor() {
        this.supabase = createClient(config.SUPABASE_URL, config.SUPABASE_ANON_KEY);
        this.tableName = 'chapters';
    }

    /**
     * Create a new chapter
     * @param {Object} chapterData - Chapter data
     * @returns {Promise<Object>} Created chapter
     */
    async create(chapterData) {
        try {
            const {
                publication_id,
                title,
                chapter_number,
                content,
                word_count,
                reading_time_minutes,
                is_published = true,
                sort_order
            } = chapterData;

            // Calculate reading time if not provided
            const calculatedReadingTime = reading_time_minutes || 
                Math.ceil((word_count || this.countWords(content)) / 200); // 200 words per minute average

            const { data, error } = await this.supabase
                .from(this.tableName)
                .insert({
                    publication_id,
                    title,
                    chapter_number,
                    content,
                    word_count: word_count || this.countWords(content),
                    reading_time_minutes: calculatedReadingTime,
                    is_published,
                    sort_order: sort_order || chapter_number
                })
                .select()
                .single();

            if (error) {
                logger.error('Failed to create chapter', {
                    error: error.message,
                    chapterData: { publication_id, title, chapter_number }
                });
                throw error;
            }

            logger.info('Chapter created', {
                chapterId: data.id,
                publicationId: data.publication_id,
                title: data.title,
                chapterNumber: data.chapter_number,
                wordCount: data.word_count
            });

            return data;
        } catch (error) {
            logger.error('Chapter creation error', {
                error: error.message,
                stack: error.stack,
                chapterData
            });
            throw error;
        }
    }

    /**
     * Get chapter by ID
     * @param {string} id - Chapter ID
     * @returns {Promise<Object|null>} Chapter data
     */
    async findById(id) {
        try {
            const { data, error } = await this.supabase
                .from(this.tableName)
                .select(`
                    *,
                    publications(title, author_id)
                `)
                .eq('id', id)
                .single();

            if (error && error.code !== 'PGRST116') {
                logger.error('Failed to fetch chapter by ID', {
                    error: error.message,
                    chapterId: id
                });
                throw error;
            }

            return data;
        } catch (error) {
            logger.error('Chapter fetch error', {
                error: error.message,
                chapterId: id
            });
            throw error;
        }
    }

    /**
     * Get chapters by publication ID
     * @param {string} publicationId - Publication ID
     * @param {Object} options - Query options
     * @returns {Promise<Array>} Chapters list
     */
    async findByPublicationId(publicationId, options = {}) {
        try {
            const { includeUnpublished = false, includeContent = true } = options;

            let selectFields = includeContent ? '*' : 'id, title, chapter_number, word_count, reading_time_minutes, is_published, sort_order, created_at, updated_at';

            let query = this.supabase
                .from(this.tableName)
                .select(selectFields)
                .eq('publication_id', publicationId);

            if (!includeUnpublished) {
                query = query.eq('is_published', true);
            }

            query = query.order('sort_order');

            const { data, error } = await query;

            if (error) {
                logger.error('Failed to fetch chapters by publication ID', {
                    error: error.message,
                    publicationId,
                    options
                });
                throw error;
            }

            return data;
        } catch (error) {
            logger.error('Chapters fetch by publication error', {
                error: error.message,
                publicationId,
                options
            });
            throw error;
        }
    }

    /**
     * Update chapter
     * @param {string} id - Chapter ID
     * @param {Object} updateData - Data to update
     * @returns {Promise<Object>} Updated chapter
     */
    async update(id, updateData) {
        try {
            const oldChapter = await this.findById(id);
            if (!oldChapter) {
                throw new Error('Chapter not found');
            }

            // Update word count and reading time if content is updated
            if (updateData.content) {
                updateData.word_count = this.countWords(updateData.content);
                updateData.reading_time_minutes = Math.ceil(updateData.word_count / 200);
            }

            const { data, error } = await this.supabase
                .from(this.tableName)
                .update(updateData)
                .eq('id', id)
                .select()
                .single();

            if (error) {
                logger.error('Failed to update chapter', {
                    error: error.message,
                    chapterId: id,
                    updateData: { ...updateData, content: updateData.content ? '[CONTENT_UPDATED]' : undefined }
                });
                throw error;
            }

            logger.info('Chapter updated', {
                chapterId: data.id,
                publicationId: data.publication_id,
                title: data.title,
                changes: Object.keys(updateData)
            });

            return data;
        } catch (error) {
            logger.error('Chapter update error', {
                error: error.message,
                chapterId: id,
                updateData: { ...updateData, content: updateData.content ? '[CONTENT_HIDDEN]' : undefined }
            });
            throw error;
        }
    }

    /**
     * Delete chapter
     * @param {string} id - Chapter ID
     * @returns {Promise<boolean>} Success status
     */
    async delete(id) {
        try {
            const chapter = await this.findById(id);
            if (!chapter) {
                throw new Error('Chapter not found');
            }

            const { error } = await this.supabase
                .from(this.tableName)
                .delete()
                .eq('id', id);

            if (error) {
                logger.error('Failed to delete chapter', {
                    error: error.message,
                    chapterId: id
                });
                throw error;
            }

            logger.info('Chapter deleted', {
                chapterId: id,
                publicationId: chapter.publication_id,
                title: chapter.title,
                chapterNumber: chapter.chapter_number
            });

            return true;
        } catch (error) {
            logger.error('Chapter deletion error', {
                error: error.message,
                chapterId: id
            });
            throw error;
        }
    }

    /**
     * Reorder chapters
     * @param {string} publicationId - Publication ID
     * @param {Array} chapterOrders - Array of {id, sort_order} objects
     * @returns {Promise<boolean>} Success status
     */
    async reorder(publicationId, chapterOrders) {
        try {
            // Update each chapter's sort order
            const updates = chapterOrders.map(({ id, sort_order }) => 
                this.supabase
                    .from(this.tableName)
                    .update({ sort_order })
                    .eq('id', id)
                    .eq('publication_id', publicationId)
            );

            const results = await Promise.all(updates);
            
            // Check for any errors
            const hasErrors = results.some(result => result.error);
            if (hasErrors) {
                const errors = results.filter(result => result.error).map(result => result.error);
                logger.error('Failed to reorder chapters', {
                    errors,
                    publicationId,
                    chapterOrders
                });
                throw new Error('Failed to reorder some chapters');
            }

            logger.info('Chapters reordered', {
                publicationId,
                chapterCount: chapterOrders.length
            });

            return true;
        } catch (error) {
            logger.error('Chapter reordering error', {
                error: error.message,
                publicationId,
                chapterOrders
            });
            throw error;
        }
    }

    /**
     * Bulk update chapters
     * @param {string} publicationId - Publication ID
     * @param {Array} updates - Array of chapter updates
     * @returns {Promise<Array>} Updated chapters
     */
    async bulkUpdate(publicationId, updates) {
        try {
            const updatePromises = updates.map(({ id, ...updateData }) => {
                // Update word count and reading time if content is updated
                if (updateData.content) {
                    updateData.word_count = this.countWords(updateData.content);
                    updateData.reading_time_minutes = Math.ceil(updateData.word_count / 200);
                }

                return this.supabase
                    .from(this.tableName)
                    .update(updateData)
                    .eq('id', id)
                    .eq('publication_id', publicationId)
                    .select()
                    .single();
            });

            const results = await Promise.all(updatePromises);
            
            // Check for errors and collect successful updates
            const successfulUpdates = [];
            const errors = [];

            results.forEach((result, index) => {
                if (result.error) {
                    errors.push({
                        chapterId: updates[index].id,
                        error: result.error.message
                    });
                } else {
                    successfulUpdates.push(result.data);
                }
            });

            if (errors.length > 0) {
                logger.error('Some chapter updates failed', {
                    publicationId,
                    errors,
                    successfulCount: successfulUpdates.length,
                    failedCount: errors.length
                });
            }

            logger.info('Bulk chapter update completed', {
                publicationId,
                updatedCount: successfulUpdates.length,
                totalCount: updates.length
            });

            return {
                updated: successfulUpdates,
                errors: errors
            };
        } catch (error) {
            logger.error('Bulk chapter update error', {
                error: error.message,
                publicationId,
                updateCount: updates.length
            });
            throw error;
        }
    }

    /**
     * Get chapter content for preview
     * @param {string} id - Chapter ID
     * @param {number} previewLength - Number of characters for preview
     * @returns {Promise<Object>} Chapter preview
     */
    async getPreview(id, previewLength = 500) {
        try {
            const chapter = await this.findById(id);
            if (!chapter) {
                throw new Error('Chapter not found');
            }

            // Create preview from content
            let preview = chapter.content;
            if (preview && preview.length > previewLength) {
                preview = preview.substring(0, previewLength) + '...';
            }

            return {
                id: chapter.id,
                title: chapter.title,
                chapter_number: chapter.chapter_number,
                preview,
                word_count: chapter.word_count,
                reading_time_minutes: chapter.reading_time_minutes
            };
        } catch (error) {
            logger.error('Chapter preview error', {
                error: error.message,
                chapterId: id,
                previewLength
            });
            throw error;
        }
    }

    /**
     * Search chapters within a publication
     * @param {string} publicationId - Publication ID
     * @param {string} searchTerm - Search term
     * @returns {Promise<Array>} Search results
     */
    async search(publicationId, searchTerm) {
        try {
            const { data, error } = await this.supabase
                .from(this.tableName)
                .select('id, title, chapter_number, sort_order')
                .eq('publication_id', publicationId)
                .eq('is_published', true)
                .or(`title.ilike.%${searchTerm}%,content.ilike.%${searchTerm}%`)
                .order('sort_order');

            if (error) {
                logger.error('Failed to search chapters', {
                    error: error.message,
                    publicationId,
                    searchTerm
                });
                throw error;
            }

            return data;
        } catch (error) {
            logger.error('Chapter search error', {
                error: error.message,
                publicationId,
                searchTerm
            });
            throw error;
        }
    }

    /**
     * Get publication statistics from chapters
     * @param {string} publicationId - Publication ID
     * @returns {Promise<Object>} Publication statistics
     */
    async getPublicationStats(publicationId) {
        try {
            const chapters = await this.findByPublicationId(publicationId, { 
                includeUnpublished: true,
                includeContent: false 
            });

            const stats = {
                totalChapters: chapters.length,
                publishedChapters: chapters.filter(ch => ch.is_published).length,
                unpublishedChapters: chapters.filter(ch => !ch.is_published).length,
                totalWordCount: chapters.reduce((sum, ch) => sum + (ch.word_count || 0), 0),
                totalReadingTime: chapters.reduce((sum, ch) => sum + (ch.reading_time_minutes || 0), 0),
                averageChapterLength: 0,
                longestChapter: null,
                shortestChapter: null
            };

            if (chapters.length > 0) {
                stats.averageChapterLength = Math.round(stats.totalWordCount / chapters.length);
                
                const publishedChapters = chapters.filter(ch => ch.is_published && ch.word_count);
                if (publishedChapters.length > 0) {
                    stats.longestChapter = publishedChapters.reduce((max, ch) => 
                        (ch.word_count > (max?.word_count || 0)) ? ch : max
                    );
                    
                    stats.shortestChapter = publishedChapters.reduce((min, ch) => 
                        (ch.word_count < (min?.word_count || Infinity)) ? ch : min
                    );
                }
            }

            return stats;
        } catch (error) {
            logger.error('Publication stats from chapters error', {
                error: error.message,
                publicationId
            });
            throw error;
        }
    }

    /**
     * Count words in text content
     * @param {string} content - Text content
     * @returns {number} Word count
     * @private
     */
    countWords(content) {
        if (!content || typeof content !== 'string') {
            return 0;
        }

        // Remove HTML tags and extra whitespace, then count words
        return content
            .replace(/<[^>]*>/g, '') // Remove HTML tags
            .replace(/\s+/g, ' ')    // Replace multiple spaces with single space
            .trim()
            .split(' ')
            .filter(word => word.length > 0)
            .length;
    }

    /**
     * Duplicate chapter
     * @param {string} id - Chapter ID to duplicate
     * @param {Object} overrides - Fields to override in the duplicate
     * @returns {Promise<Object>} Duplicated chapter
     */
    async duplicate(id, overrides = {}) {
        try {
            const originalChapter = await this.findById(id);
            if (!originalChapter) {
                throw new Error('Chapter not found');
            }

            // Get the next chapter number
            const existingChapters = await this.findByPublicationId(
                originalChapter.publication_id, 
                { includeUnpublished: true, includeContent: false }
            );
            const maxChapterNumber = Math.max(...existingChapters.map(ch => ch.chapter_number), 0);

            const duplicateData = {
                publication_id: originalChapter.publication_id,
                title: overrides.title || `${originalChapter.title} (Copy)`,
                chapter_number: overrides.chapter_number || (maxChapterNumber + 1),
                content: overrides.content || originalChapter.content,
                is_published: overrides.is_published !== undefined ? overrides.is_published : false,
                sort_order: overrides.sort_order || (maxChapterNumber + 1)
            };

            const duplicatedChapter = await this.create(duplicateData);

            logger.info('Chapter duplicated', {
                originalId: id,
                duplicatedId: duplicatedChapter.id,
                publicationId: duplicatedChapter.publication_id
            });

            return duplicatedChapter;
        } catch (error) {
            logger.error('Chapter duplication error', {
                error: error.message,
                chapterId: id,
                overrides
            });
            throw error;
        }
    }
}

module.exports = ChapterModel;
