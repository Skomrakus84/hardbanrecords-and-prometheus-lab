/**
 * Chapter Mapper - Data Transformation Layer for Chapters
 * Handles transformation between database models and API responses for chapters
 * Provides comprehensive mapping with content formatting and structure
 * Implements enterprise-grade data transformation patterns for chapter management
 */

const logger = require('../config/logger.cjs');

class ChapterMapper {
    
    // ========== Database to API Transformations ==========

    /**
     * Transform database chapter to API response
     */
    static toApiResponse(dbChapter, options = {}) {
        if (!dbChapter) return null;

        try {
            const mapped = {
                id: dbChapter.id,
                publication_id: dbChapter.publication_id,
                title: dbChapter.title,
                content: dbChapter.content,
                excerpt: dbChapter.excerpt,
                order_index: dbChapter.order_index,
                word_count: dbChapter.word_count,
                reading_time: dbChapter.reading_time,
                status: dbChapter.status,
                created_at: dbChapter.created_at,
                updated_at: dbChapter.updated_at
            };

            // Include optional fields based on options
            if (options.includeContent === false) {
                delete mapped.content; // Exclude full content for listings
            }

            if (options.includeContentAnalysis && dbChapter.content_analysis) {
                mapped.content_analysis = this.mapContentAnalysis(dbChapter.content_analysis);
            }

            if (options.includeKeywords && dbChapter.keywords) {
                mapped.keywords = Array.isArray(dbChapter.keywords) 
                    ? dbChapter.keywords 
                    : JSON.parse(dbChapter.keywords || '[]');
            }

            if (options.includeMetadata && dbChapter.metadata) {
                mapped.metadata = typeof dbChapter.metadata === 'object' 
                    ? dbChapter.metadata 
                    : JSON.parse(dbChapter.metadata || '{}');
            }

            if (options.includeCollaboration && dbChapter.collaboration_data) {
                mapped.collaboration_data = this.mapCollaborationData(dbChapter.collaboration_data);
            }

            if (options.includeVersioning && dbChapter.version_info) {
                mapped.version_info = this.mapVersionInfo(dbChapter.version_info);
            }

            // Include related data if present
            if (options.includePublication && dbChapter.publication) {
                mapped.publication = this.mapPublicationSummary(dbChapter.publication);
            }

            if (options.includeComments && dbChapter.comments) {
                mapped.comments = Array.isArray(dbChapter.comments) 
                    ? dbChapter.comments.map(comment => this.mapComment(comment))
                    : [];
            }

            if (options.includeRevisions && dbChapter.revisions) {
                mapped.revisions = Array.isArray(dbChapter.revisions) 
                    ? dbChapter.revisions.map(revision => this.mapRevision(revision))
                    : [];
            }

            return mapped;

        } catch (error) {
            logger.error('Error mapping chapter to API response', {
                error: error.message,
                chapterId: dbChapter.id
            });
            return null;
        }
    }

    /**
     * Transform multiple chapters to API response
     */
    static toApiResponseList(dbChapters, options = {}) {
        if (!Array.isArray(dbChapters)) return [];

        return dbChapters
            .map(chapter => this.toApiResponse(chapter, options))
            .filter(mapped => mapped !== null);
    }

    /**
     * Transform chapter to summary format
     */
    static toSummary(dbChapter) {
        if (!dbChapter) return null;

        return {
            id: dbChapter.id,
            publication_id: dbChapter.publication_id,
            title: dbChapter.title,
            excerpt: dbChapter.excerpt,
            order_index: dbChapter.order_index,
            word_count: dbChapter.word_count,
            reading_time: dbChapter.reading_time,
            status: dbChapter.status,
            created_at: dbChapter.created_at,
            updated_at: dbChapter.updated_at
        };
    }

    /**
     * Transform chapter for table of contents
     */
    static toTableOfContents(dbChapter) {
        if (!dbChapter) return null;

        return {
            id: dbChapter.id,
            title: dbChapter.title,
            order_index: dbChapter.order_index,
            word_count: dbChapter.word_count,
            reading_time: dbChapter.reading_time,
            status: dbChapter.status
        };
    }

    /**
     * Transform chapter for search results
     */
    static toSearchResult(dbChapter, relevanceScore = null, matchedContent = null) {
        if (!dbChapter) return null;

        const result = {
            id: dbChapter.id,
            publication_id: dbChapter.publication_id,
            title: dbChapter.title,
            excerpt: dbChapter.excerpt,
            order_index: dbChapter.order_index,
            word_count: dbChapter.word_count,
            status: dbChapter.status
        };

        if (relevanceScore !== null) {
            result.relevance_score = relevanceScore;
        }

        if (matchedContent) {
            result.matched_content = matchedContent;
        }

        return result;
    }

    // ========== API to Database Transformations ==========

    /**
     * Transform API create request to database format
     */
    static fromApiCreateRequest(apiData) {
        if (!apiData) return null;

        try {
            const mapped = {
                publication_id: apiData.publication_id,
                title: apiData.title,
                content: apiData.content || '',
                excerpt: apiData.excerpt || null,
                order_index: apiData.order_index || 0,
                word_count: apiData.word_count || null,
                reading_time: apiData.reading_time || null,
                status: apiData.status || 'draft'
            };

            // Handle JSON fields
            if (apiData.keywords) {
                mapped.keywords = Array.isArray(apiData.keywords) 
                    ? JSON.stringify(apiData.keywords) 
                    : apiData.keywords;
            }

            if (apiData.metadata) {
                mapped.metadata = typeof apiData.metadata === 'object' 
                    ? JSON.stringify(apiData.metadata) 
                    : apiData.metadata;
            }

            if (apiData.collaboration_data) {
                mapped.collaboration_data = typeof apiData.collaboration_data === 'object' 
                    ? JSON.stringify(apiData.collaboration_data) 
                    : apiData.collaboration_data;
            }

            if (apiData.content_analysis) {
                mapped.content_analysis = typeof apiData.content_analysis === 'object' 
                    ? JSON.stringify(apiData.content_analysis) 
                    : apiData.content_analysis;
            }

            // Calculate word count if not provided
            if (!mapped.word_count && mapped.content) {
                mapped.word_count = this.calculateWordCount(mapped.content);
            }

            // Calculate reading time if not provided
            if (!mapped.reading_time && mapped.word_count) {
                mapped.reading_time = this.calculateReadingTime(mapped.word_count);
            }

            return mapped;

        } catch (error) {
            logger.error('Error mapping API create request to database format', {
                error: error.message,
                apiData
            });
            return null;
        }
    }

    /**
     * Transform API update request to database format
     */
    static fromApiUpdateRequest(apiData) {
        if (!apiData) return null;

        try {
            const mapped = {};

            // Only include fields that are actually being updated
            const updatableFields = [
                'title', 'content', 'excerpt', 'order_index', 
                'word_count', 'reading_time', 'status'
            ];

            updatableFields.forEach(field => {
                if (apiData[field] !== undefined) {
                    mapped[field] = apiData[field];
                }
            });

            // Handle JSON fields for updates
            if (apiData.keywords !== undefined) {
                mapped.keywords = Array.isArray(apiData.keywords) 
                    ? JSON.stringify(apiData.keywords) 
                    : apiData.keywords;
            }

            if (apiData.metadata !== undefined) {
                mapped.metadata = typeof apiData.metadata === 'object' 
                    ? JSON.stringify(apiData.metadata) 
                    : apiData.metadata;
            }

            if (apiData.collaboration_data !== undefined) {
                mapped.collaboration_data = typeof apiData.collaboration_data === 'object' 
                    ? JSON.stringify(apiData.collaboration_data) 
                    : apiData.collaboration_data;
            }

            if (apiData.content_analysis !== undefined) {
                mapped.content_analysis = typeof apiData.content_analysis === 'object' 
                    ? JSON.stringify(apiData.content_analysis) 
                    : apiData.content_analysis;
            }

            // Recalculate word count if content changed
            if (mapped.content !== undefined) {
                mapped.word_count = this.calculateWordCount(mapped.content);
                mapped.reading_time = this.calculateReadingTime(mapped.word_count);
            }

            // Add updated timestamp
            mapped.updated_at = new Date().toISOString();

            return mapped;

        } catch (error) {
            logger.error('Error mapping API update request to database format', {
                error: error.message,
                apiData
            });
            return null;
        }
    }

    // ========== Specialized Mapping Methods ==========

    /**
     * Map content analysis data
     */
    static mapContentAnalysis(contentAnalysis) {
        if (!contentAnalysis) return null;

        try {
            const analysis = typeof contentAnalysis === 'string' ? JSON.parse(contentAnalysis) : contentAnalysis;
            
            return {
                quality_score: parseFloat(analysis.quality_score || 0),
                readability_score: parseFloat(analysis.readability_score || 0),
                sentiment_score: parseFloat(analysis.sentiment_score || 0),
                complexity_level: analysis.complexity_level || 'medium',
                language_quality: {
                    grammar_score: parseFloat(analysis.language_quality?.grammar_score || 0),
                    spelling_errors: parseInt(analysis.language_quality?.spelling_errors || 0),
                    style_suggestions: analysis.language_quality?.style_suggestions || []
                },
                structure_analysis: {
                    paragraph_count: parseInt(analysis.structure_analysis?.paragraph_count || 0),
                    sentence_count: parseInt(analysis.structure_analysis?.sentence_count || 0),
                    average_sentence_length: parseFloat(analysis.structure_analysis?.average_sentence_length || 0),
                    dialogue_percentage: parseFloat(analysis.structure_analysis?.dialogue_percentage || 0)
                },
                keywords_extracted: analysis.keywords_extracted || [],
                themes_identified: analysis.themes_identified || [],
                improvement_suggestions: analysis.improvement_suggestions || []
            };

        } catch (error) {
            logger.error('Error mapping content analysis', { error: error.message, contentAnalysis });
            return null;
        }
    }

    /**
     * Map collaboration data
     */
    static mapCollaborationData(collaborationData) {
        if (!collaborationData) return null;

        try {
            const data = typeof collaborationData === 'string' ? JSON.parse(collaborationData) : collaborationData;
            
            return {
                collaborators: data.collaborators || [],
                comments_count: parseInt(data.comments_count || 0),
                active_sessions: data.active_sessions || [],
                last_activity: data.last_activity,
                permissions: data.permissions || {},
                workflow_stage: data.workflow_stage || 'draft',
                approval_status: data.approval_status || 'pending'
            };

        } catch (error) {
            logger.error('Error mapping collaboration data', { error: error.message, collaborationData });
            return null;
        }
    }

    /**
     * Map version information
     */
    static mapVersionInfo(versionInfo) {
        if (!versionInfo) return null;

        try {
            const info = typeof versionInfo === 'string' ? JSON.parse(versionInfo) : versionInfo;
            
            return {
                current_version: info.current_version || '1.0',
                version_history: info.version_history || [],
                last_major_change: info.last_major_change,
                change_summary: info.change_summary || '',
                created_by: info.created_by,
                revision_count: parseInt(info.revision_count || 0)
            };

        } catch (error) {
            logger.error('Error mapping version info', { error: error.message, versionInfo });
            return null;
        }
    }

    /**
     * Map publication summary
     */
    static mapPublicationSummary(publication) {
        if (!publication) return null;

        return {
            id: publication.id,
            title: publication.title,
            publication_type: publication.publication_type,
            status: publication.status,
            language: publication.language
        };
    }

    /**
     * Map comment data
     */
    static mapComment(comment) {
        if (!comment) return null;

        return {
            id: comment.id,
            content: comment.content,
            position: comment.position || null,
            author: {
                id: comment.author_id,
                name: comment.author_name || 'Anonymous'
            },
            created_at: comment.created_at,
            resolved: comment.resolved || false
        };
    }

    /**
     * Map revision data
     */
    static mapRevision(revision) {
        if (!revision) return null;

        return {
            id: revision.id,
            version: revision.version,
            title: revision.title,
            change_summary: revision.change_summary,
            word_count: revision.word_count,
            created_by: revision.created_by,
            created_at: revision.created_at
        };
    }

    // ========== Content Processing Methods ==========

    /**
     * Transform chapter content for different formats
     */
    static transformContentForFormat(content, format = 'html') {
        if (!content) return '';

        try {
            switch (format.toLowerCase()) {
                case 'plain':
                    return this.toPlainText(content);
                case 'markdown':
                    return this.toMarkdown(content);
                case 'epub':
                    return this.toEpubFormat(content);
                case 'pdf':
                    return this.toPdfFormat(content);
                default:
                    return content; // Return as-is for HTML or unknown formats
            }
        } catch (error) {
            logger.error('Error transforming content format', { error: error.message, format });
            return content;
        }
    }

    /**
     * Convert content to plain text
     */
    static toPlainText(htmlContent) {
        if (!htmlContent) return '';
        
        // Basic HTML tag removal (would use proper HTML parser in production)
        return htmlContent
            .replace(/<[^>]*>/g, '')
            .replace(/&nbsp;/g, ' ')
            .replace(/&amp;/g, '&')
            .replace(/&lt;/g, '<')
            .replace(/&gt;/g, '>')
            .replace(/&quot;/g, '"')
            .trim();
    }

    /**
     * Convert content to Markdown
     */
    static toMarkdown(htmlContent) {
        if (!htmlContent) return '';
        
        // Basic HTML to Markdown conversion
        return htmlContent
            .replace(/<h1[^>]*>(.*?)<\/h1>/gi, '# $1\n\n')
            .replace(/<h2[^>]*>(.*?)<\/h2>/gi, '## $1\n\n')
            .replace(/<h3[^>]*>(.*?)<\/h3>/gi, '### $1\n\n')
            .replace(/<strong[^>]*>(.*?)<\/strong>/gi, '**$1**')
            .replace(/<em[^>]*>(.*?)<\/em>/gi, '*$1*')
            .replace(/<p[^>]*>(.*?)<\/p>/gi, '$1\n\n')
            .replace(/<br\s*\/?>/gi, '\n')
            .replace(/<[^>]*>/g, '')
            .replace(/\n{3,}/g, '\n\n')
            .trim();
    }

    /**
     * Format content for EPUB
     */
    static toEpubFormat(content) {
        if (!content) return '';
        
        // EPUB-specific formatting
        return content
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#x27;');
    }

    /**
     * Format content for PDF
     */
    static toPdfFormat(content) {
        if (!content) return '';
        
        // PDF-specific formatting (placeholder)
        return content;
    }

    // ========== Analytics and Utility Methods ==========

    /**
     * Calculate word count from content
     */
    static calculateWordCount(content) {
        if (!content || typeof content !== 'string') return 0;
        
        const plainText = this.toPlainText(content);
        const words = plainText.trim().split(/\s+/).filter(word => word.length > 0);
        return words.length;
    }

    /**
     * Calculate reading time (based on average 200 words per minute)
     */
    static calculateReadingTime(wordCount, wordsPerMinute = 200) {
        if (!wordCount || wordCount <= 0) return 0;
        return Math.ceil(wordCount / wordsPerMinute);
    }

    /**
     * Extract excerpt from content
     */
    static extractExcerpt(content, maxLength = 300) {
        if (!content) return '';
        
        const plainText = this.toPlainText(content);
        if (plainText.length <= maxLength) return plainText;
        
        // Find the last complete sentence within the limit
        const truncated = plainText.substring(0, maxLength);
        const lastSentenceEnd = Math.max(
            truncated.lastIndexOf('.'),
            truncated.lastIndexOf('!'),
            truncated.lastIndexOf('?')
        );
        
        if (lastSentenceEnd > maxLength * 0.7) {
            return truncated.substring(0, lastSentenceEnd + 1);
        }
        
        // If no sentence end found, truncate at word boundary
        const lastSpace = truncated.lastIndexOf(' ');
        return lastSpace > 0 ? truncated.substring(0, lastSpace) + '...' : truncated + '...';
    }

    /**
     * Transform for export
     */
    static toExportFormat(dbChapter, format = 'json') {
        if (!dbChapter) return null;

        const baseData = this.toApiResponse(dbChapter, {
            includeContentAnalysis: true,
            includeKeywords: true,
            includeMetadata: true
        });

        switch (format) {
            case 'markdown':
                return this.toMarkdownExport(baseData);
            case 'docx':
                return this.toDocxExport(baseData);
            case 'txt':
                return this.toTextExport(baseData);
            default:
                return baseData;
        }
    }

    /**
     * Export to Markdown format
     */
    static toMarkdownExport(chapterData) {
        if (!chapterData) return null;
        
        let markdown = `# ${chapterData.title}\n\n`;
        
        if (chapterData.excerpt) {
            markdown += `*${chapterData.excerpt}*\n\n`;
        }
        
        if (chapterData.content) {
            markdown += this.toMarkdown(chapterData.content);
        }
        
        return {
            filename: `chapter-${chapterData.order_index || 'untitled'}.md`,
            content: markdown,
            metadata: {
                title: chapterData.title,
                word_count: chapterData.word_count,
                reading_time: chapterData.reading_time
            }
        };
    }

    /**
     * Export to text format
     */
    static toTextExport(chapterData) {
        if (!chapterData) return null;
        
        let text = `${chapterData.title}\n`;
        text += '='.repeat(chapterData.title.length) + '\n\n';
        
        if (chapterData.content) {
            text += this.toPlainText(chapterData.content);
        }
        
        return {
            filename: `chapter-${chapterData.order_index || 'untitled'}.txt`,
            content: text,
            metadata: {
                title: chapterData.title,
                word_count: chapterData.word_count,
                reading_time: chapterData.reading_time
            }
        };
    }

    /**
     * Placeholder for DOCX export
     */
    static toDocxExport(chapterData) {
        if (!chapterData) return null;
        
        return {
            filename: `chapter-${chapterData.order_index || 'untitled'}.docx`,
            data: chapterData, // Would need proper DOCX library
            metadata: {
                title: chapterData.title,
                word_count: chapterData.word_count,
                reading_time: chapterData.reading_time
            }
        };
    }

    /**
     * Validate mapped data
     */
    static validateMappedData(mappedData, requiredFields = []) {
        if (!mappedData) return false;

        for (const field of requiredFields) {
            if (mappedData[field] === undefined || mappedData[field] === null) {
                logger.warn('Missing required field in mapped chapter data', { field, mappedData });
                return false;
            }
        }

        return true;
    }
}

module.exports = ChapterMapper;
