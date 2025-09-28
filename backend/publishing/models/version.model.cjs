/**
 * Version Model - Advanced Publication Version Management
 * Manages version control, revision tracking, and change management for publications
 * Supports branching, merging, conflict resolution, and collaborative editing
 * Provides comprehensive version analytics, diff generation, and rollback capabilities
 */

const { supabase } = require('../../../db.cjs');
const { AppError } = require('../../../middleware/errorHandler.cjs');
const { v4: uuidv4 } = require('uuid');
const crypto = require('crypto');

class VersionModel {
    /**
     * Create new version
     * @param {Object} versionData - Version information
     * @returns {Promise<Object>} Created version
     */
    static async create(versionData) {
        try {
            const {
                publication_id,
                parent_version_id = null,
                author_id,
                version_number,
                title,
                description = '',
                content = {},
                content_diff = {},
                change_type = 'minor', // major, minor, patch, hotfix
                status = 'draft', // draft, review, approved, published, archived
                is_major_release = false,
                branch_name = 'main',
                tags = [],
                metadata = {},
                file_attachments = [],
                changelog = '',
                commit_message = ''
            } = versionData;

            // Validation
            if (!publication_id || !author_id) {
                throw new AppError('Publication ID and author ID are required', 400);
            }

            // Auto-generate version number if not provided
            let finalVersionNumber = version_number;
            if (!finalVersionNumber) {
                finalVersionNumber = await this.generateVersionNumber(publication_id, change_type, branch_name);
            }

            // Validate version number uniqueness
            const existingVersion = await this.findByPublicationAndVersion(publication_id, finalVersionNumber);
            if (existingVersion) {
                throw new AppError(`Version ${finalVersionNumber} already exists`, 409);
            }

            // Generate content hash for integrity
            const contentHash = this.generateContentHash(content);

            // Calculate content statistics
            const contentStats = this.calculateContentStats(content);

            const version = {
                id: uuidv4(),
                publication_id,
                parent_version_id,
                author_id,
                version_number: finalVersionNumber,
                title,
                description,
                content,
                content_diff,
                content_hash: contentHash,
                content_stats: contentStats,
                change_type,
                status,
                is_major_release,
                branch_name,
                tags,
                metadata: {
                    word_count: contentStats.word_count,
                    character_count: contentStats.character_count,
                    page_count: contentStats.estimated_pages,
                    reading_time: contentStats.estimated_reading_time,
                    ...metadata
                },
                file_attachments,
                changelog,
                commit_message,
                created_at: new Date(),
                updated_at: new Date(),
                published_at: status === 'published' ? new Date() : null
            };

            const { data, error } = await supabase
                .from('versions')
                .insert(version)
                .select()
                .single();

            if (error) throw new AppError(`Failed to create version: ${error.message}`, 500);

            // Log version creation
            await this.logVersionActivity(data.id, 'created', {
                author_id,
                version_number: finalVersionNumber,
                change_type,
                branch_name
            });

            // Update publication's current version if this is published
            if (status === 'published') {
                await this.updatePublicationCurrentVersion(publication_id, data.id);
            }

            return data;
        } catch (error) {
            console.error('Error creating version:', error);
            throw error instanceof AppError ? error : new AppError('Failed to create version', 500);
        }
    }

    /**
     * Find version by ID
     * @param {string} id - Version ID
     * @returns {Promise<Object|null>} Version data
     */
    static async findById(id) {
        try {
            const { data, error } = await supabase
                .from('versions')
                .select(`
                    *,
                    publications:publication_id (
                        title, author_id, status, publication_type
                    ),
                    authors:author_id (
                        id, email, full_name, profile
                    ),
                    parent_version:parent_version_id (
                        id, version_number, title, author_id
                    )
                `)
                .eq('id', id)
                .single();

            if (error && error.code !== 'PGRST116') {
                throw new AppError(`Failed to fetch version: ${error.message}`, 500);
            }

            return data;
        } catch (error) {
            console.error('Error finding version:', error);
            throw error instanceof AppError ? error : new AppError('Failed to find version', 500);
        }
    }

    /**
     * Find version by publication and version number
     * @param {string} publicationId - Publication ID
     * @param {string} versionNumber - Version number
     * @returns {Promise<Object|null>} Version data
     */
    static async findByPublicationAndVersion(publicationId, versionNumber) {
        try {
            const { data, error } = await supabase
                .from('versions')
                .select('*')
                .eq('publication_id', publicationId)
                .eq('version_number', versionNumber)
                .single();

            if (error && error.code !== 'PGRST116') {
                throw new AppError(`Failed to find version: ${error.message}`, 500);
            }

            return data;
        } catch (error) {
            console.error('Error finding version:', error);
            return null;
        }
    }

    /**
     * Get all versions for a publication
     * @param {string} publicationId - Publication ID
     * @param {Object} options - Query options
     * @returns {Promise<Array>} List of versions
     */
    static async getByPublication(publicationId, options = {}) {
        try {
            const {
                branch_name = null,
                status = null,
                change_type = null,
                author_id = null,
                include_content = false,
                limit = 50,
                offset = 0,
                sort_by = 'created_at',
                sort_order = 'desc'
            } = options;

            let selectFields = `
                id, version_number, title, description, change_type, status,
                is_major_release, branch_name, tags, metadata, changelog,
                commit_message, created_at, updated_at, published_at,
                authors:author_id (
                    id, email, full_name, profile
                ),
                parent_version:parent_version_id (
                    id, version_number, title
                )
            `;

            if (include_content) {
                selectFields += ', content, content_diff, content_stats';
            }

            let query = supabase
                .from('versions')
                .select(selectFields)
                .eq('publication_id', publicationId);

            if (branch_name) {
                query = query.eq('branch_name', branch_name);
            }

            if (status) {
                query = query.eq('status', status);
            }

            if (change_type) {
                query = query.eq('change_type', change_type);
            }

            if (author_id) {
                query = query.eq('author_id', author_id);
            }

            query = query
                .order(sort_by, { ascending: sort_order === 'asc' })
                .range(offset, offset + limit - 1);

            const { data, error } = await query;

            if (error) {
                throw new AppError(`Failed to fetch versions: ${error.message}`, 500);
            }

            return data || [];
        } catch (error) {
            console.error('Error getting versions by publication:', error);
            throw error instanceof AppError ? error : new AppError('Failed to get versions', 500);
        }
    }

    /**
     * Get version tree (branching structure)
     * @param {string} publicationId - Publication ID
     * @param {string} rootVersionId - Root version ID (optional)
     * @returns {Promise<Object>} Version tree structure
     */
    static async getVersionTree(publicationId, rootVersionId = null) {
        try {
            const { data: versions, error } = await supabase
                .from('versions')
                .select(`
                    id, version_number, title, parent_version_id, branch_name,
                    change_type, status, is_major_release, created_at,
                    authors:author_id (
                        id, full_name, profile
                    )
                `)
                .eq('publication_id', publicationId)
                .order('created_at', { ascending: true });

            if (error) {
                throw new AppError(`Failed to fetch version tree: ${error.message}`, 500);
            }

            // Build tree structure
            const tree = this.buildVersionTree(versions, rootVersionId);
            
            return {
                publication_id: publicationId,
                root_version_id: rootVersionId,
                tree,
                total_versions: versions.length,
                branches: this.extractBranches(versions),
                latest_versions: this.getLatestVersionsByBranch(versions)
            };
        } catch (error) {
            console.error('Error getting version tree:', error);
            throw error instanceof AppError ? error : new AppError('Failed to get version tree', 500);
        }
    }

    /**
     * Create branch from existing version
     * @param {string} sourceVersionId - Source version ID
     * @param {string} branchName - New branch name
     * @param {string} authorId - Author creating the branch
     * @param {string} description - Branch description
     * @returns {Promise<Object>} New version in the branch
     */
    static async createBranch(sourceVersionId, branchName, authorId, description = '') {
        try {
            const sourceVersion = await this.findById(sourceVersionId);
            if (!sourceVersion) {
                throw new AppError('Source version not found', 404);
            }

            // Check if branch name already exists
            const existingBranch = await this.findByBranch(sourceVersion.publication_id, branchName);
            if (existingBranch.length > 0) {
                throw new AppError(`Branch ${branchName} already exists`, 409);
            }

            // Create new version in the branch
            const branchVersion = await this.create({
                publication_id: sourceVersion.publication_id,
                parent_version_id: sourceVersionId,
                author_id: authorId,
                title: `${sourceVersion.title} (${branchName})`,
                description: description || `Branch created from version ${sourceVersion.version_number}`,
                content: sourceVersion.content,
                change_type: 'minor',
                status: 'draft',
                branch_name: branchName,
                commit_message: `Created branch ${branchName} from ${sourceVersion.version_number}`
            });

            // Log branch creation
            await this.logVersionActivity(branchVersion.id, 'branch_created', {
                source_version_id: sourceVersionId,
                branch_name: branchName,
                author_id: authorId
            });

            return branchVersion;
        } catch (error) {
            console.error('Error creating branch:', error);
            throw error instanceof AppError ? error : new AppError('Failed to create branch', 500);
        }
    }

    /**
     * Merge branch into target branch
     * @param {string} sourceBranchName - Source branch name
     * @param {string} targetBranchName - Target branch name
     * @param {string} publicationId - Publication ID
     * @param {string} authorId - Author performing merge
     * @param {Object} mergeOptions - Merge options
     * @returns {Promise<Object>} Merge result
     */
    static async mergeBranch(sourceBranchName, targetBranchName, publicationId, authorId, mergeOptions = {}) {
        try {
            const {
                resolve_conflicts = 'manual',
                merge_strategy = 'recursive',
                commit_message = '',
                auto_delete_source = false
            } = mergeOptions;

            // Get latest versions from both branches
            const sourceVersions = await this.findByBranch(publicationId, sourceBranchName);
            const targetVersions = await this.findByBranch(publicationId, targetBranchName);

            if (sourceVersions.length === 0) {
                throw new AppError(`Source branch ${sourceBranchName} not found`, 404);
            }

            if (targetVersions.length === 0) {
                throw new AppError(`Target branch ${targetBranchName} not found`, 404);
            }

            const latestSource = sourceVersions[0];
            const latestTarget = targetVersions[0];

            // Check for conflicts
            const conflicts = await this.detectMergeConflicts(latestSource, latestTarget);

            if (conflicts.length > 0 && resolve_conflicts === 'manual') {
                return {
                    status: 'conflicts',
                    conflicts,
                    merge_id: uuidv4(),
                    message: 'Merge conflicts detected. Manual resolution required.'
                };
            }

            // Perform merge
            const mergedContent = await this.performMerge(latestSource, latestTarget, merge_strategy, conflicts);

            // Create merge version
            const mergeVersion = await this.create({
                publication_id: publicationId,
                parent_version_id: latestTarget.id,
                author_id: authorId,
                title: latestTarget.title,
                description: `Merged ${sourceBranchName} into ${targetBranchName}`,
                content: mergedContent,
                change_type: 'minor',
                status: 'draft',
                branch_name: targetBranchName,
                commit_message: commit_message || `Merge ${sourceBranchName} into ${targetBranchName}`,
                metadata: {
                    merged_from: sourceBranchName,
                    merge_strategy,
                    conflicts_resolved: conflicts.length,
                    source_version_id: latestSource.id
                }
            });

            // Log merge
            await this.logVersionActivity(mergeVersion.id, 'branch_merged', {
                source_branch: sourceBranchName,
                target_branch: targetBranchName,
                author_id: authorId,
                conflicts_count: conflicts.length
            });

            // Optionally delete source branch
            if (auto_delete_source) {
                await this.deleteBranch(publicationId, sourceBranchName, authorId);
            }

            return {
                status: 'success',
                merge_version: mergeVersion,
                conflicts_resolved: conflicts.length,
                message: 'Merge completed successfully'
            };
        } catch (error) {
            console.error('Error merging branch:', error);
            throw error instanceof AppError ? error : new AppError('Failed to merge branch', 500);
        }
    }

    /**
     * Generate diff between two versions
     * @param {string} version1Id - First version ID
     * @param {string} version2Id - Second version ID
     * @param {Object} options - Diff options
     * @returns {Promise<Object>} Diff result
     */
    static async generateDiff(version1Id, version2Id, options = {}) {
        try {
            const {
                diff_type = 'unified', // unified, side_by_side, word, character
                context_lines = 3,
                ignore_whitespace = false,
                include_metadata = true
            } = options;

            const [version1, version2] = await Promise.all([
                this.findById(version1Id),
                this.findById(version2Id)
            ]);

            if (!version1 || !version2) {
                throw new AppError('One or both versions not found', 404);
            }

            const diff = {
                version1: {
                    id: version1.id,
                    version_number: version1.version_number,
                    title: version1.title,
                    created_at: version1.created_at
                },
                version2: {
                    id: version2.id,
                    version_number: version2.version_number,
                    title: version2.title,
                    created_at: version2.created_at
                },
                diff_type,
                content_diff: this.calculateContentDiff(version1.content, version2.content, {
                    diff_type,
                    context_lines,
                    ignore_whitespace
                }),
                statistics: this.calculateDiffStatistics(version1.content, version2.content),
                generated_at: new Date()
            };

            if (include_metadata) {
                diff.metadata_diff = this.calculateMetadataDiff(version1.metadata, version2.metadata);
            }

            return diff;
        } catch (error) {
            console.error('Error generating diff:', error);
            throw error instanceof AppError ? error : new AppError('Failed to generate diff', 500);
        }
    }

    /**
     * Rollback to specific version
     * @param {string} targetVersionId - Target version ID to rollback to
     * @param {string} authorId - Author performing rollback
     * @param {string} reason - Rollback reason
     * @returns {Promise<Object>} New version created from rollback
     */
    static async rollback(targetVersionId, authorId, reason = '') {
        try {
            const targetVersion = await this.findById(targetVersionId);
            if (!targetVersion) {
                throw new AppError('Target version not found', 404);
            }

            // Get current latest version
            const currentVersions = await this.getByPublication(targetVersion.publication_id, {
                branch_name: targetVersion.branch_name,
                status: 'published',
                limit: 1
            });

            const currentVersion = currentVersions[0];

            // Create rollback version
            const rollbackVersion = await this.create({
                publication_id: targetVersion.publication_id,
                parent_version_id: currentVersion ? currentVersion.id : null,
                author_id: authorId,
                title: targetVersion.title,
                description: `Rollback to version ${targetVersion.version_number}`,
                content: targetVersion.content,
                change_type: 'hotfix',
                status: 'draft',
                branch_name: targetVersion.branch_name,
                commit_message: `Rollback to ${targetVersion.version_number}: ${reason}`,
                metadata: {
                    ...targetVersion.metadata,
                    rollback_from: currentVersion ? currentVersion.id : null,
                    rollback_to: targetVersionId,
                    rollback_reason: reason
                }
            });

            // Log rollback
            await this.logVersionActivity(rollbackVersion.id, 'rollback', {
                target_version_id: targetVersionId,
                current_version_id: currentVersion ? currentVersion.id : null,
                author_id: authorId,
                reason
            });

            return rollbackVersion;
        } catch (error) {
            console.error('Error performing rollback:', error);
            throw error instanceof AppError ? error : new AppError('Failed to perform rollback', 500);
        }
    }

    /**
     * Update version
     * @param {string} id - Version ID
     * @param {Object} updates - Update data
     * @param {string} updatedBy - User making the update
     * @returns {Promise<Object>} Updated version
     */
    static async update(id, updates, updatedBy) {
        try {
            const version = await this.findById(id);
            if (!version) {
                throw new AppError('Version not found', 404);
            }

            // Check permission to update
            if (version.author_id !== updatedBy) {
                // Check if user has edit permissions for this publication
                const hasPermission = await this.checkEditPermission(version.publication_id, updatedBy);
                if (!hasPermission) {
                    throw new AppError('Unauthorized to update this version', 403);
                }
            }

            // Validate updates
            const allowedFields = [
                'title', 'description', 'content', 'content_diff', 'status',
                'tags', 'metadata', 'changelog', 'commit_message'
            ];

            const validUpdates = Object.keys(updates)
                .filter(key => allowedFields.includes(key))
                .reduce((obj, key) => {
                    obj[key] = updates[key];
                    return obj;
                }, {});

            // Recalculate content hash and stats if content updated
            if (validUpdates.content) {
                validUpdates.content_hash = this.generateContentHash(validUpdates.content);
                validUpdates.content_stats = this.calculateContentStats(validUpdates.content);
                
                if (validUpdates.content_stats) {
                    validUpdates.metadata = {
                        ...version.metadata,
                        ...validUpdates.metadata,
                        word_count: validUpdates.content_stats.word_count,
                        character_count: validUpdates.content_stats.character_count,
                        page_count: validUpdates.content_stats.estimated_pages,
                        reading_time: validUpdates.content_stats.estimated_reading_time
                    };
                }
            }

            validUpdates.updated_at = new Date();

            // Handle status changes
            if (validUpdates.status && validUpdates.status !== version.status) {
                if (validUpdates.status === 'published') {
                    validUpdates.published_at = new Date();
                    // Update publication's current version
                    await this.updatePublicationCurrentVersion(version.publication_id, id);
                }
            }

            const { data, error } = await supabase
                .from('versions')
                .update(validUpdates)
                .eq('id', id)
                .select()
                .single();

            if (error) {
                throw new AppError(`Failed to update version: ${error.message}`, 500);
            }

            // Log update
            await this.logVersionActivity(id, 'updated', {
                updated_by: updatedBy,
                fields_updated: Object.keys(validUpdates),
                status_change: validUpdates.status !== version.status ? {
                    from: version.status,
                    to: validUpdates.status
                } : null
            });

            return data;
        } catch (error) {
            console.error('Error updating version:', error);
            throw error instanceof AppError ? error : new AppError('Failed to update version', 500);
        }
    }

    /**
     * Delete version
     * @param {string} id - Version ID
     * @param {string} deletedBy - User deleting the version
     * @param {boolean} force - Force delete even if it has children
     * @returns {Promise<boolean>} Success status
     */
    static async delete(id, deletedBy, force = false) {
        try {
            const version = await this.findById(id);
            if (!version) {
                throw new AppError('Version not found', 404);
            }

            // Check permission
            if (version.author_id !== deletedBy) {
                const hasPermission = await this.checkDeletePermission(version.publication_id, deletedBy);
                if (!hasPermission) {
                    throw new AppError('Unauthorized to delete this version', 403);
                }
            }

            // Check if version has children
            if (!force) {
                const children = await this.getChildVersions(id);
                if (children.length > 0) {
                    throw new AppError('Cannot delete version with child versions. Use force=true to delete.', 400);
                }
            }

            // Check if this is the current published version
            if (version.status === 'published') {
                throw new AppError('Cannot delete published version. Change status first.', 400);
            }

            const { error } = await supabase
                .from('versions')
                .delete()
                .eq('id', id);

            if (error) {
                throw new AppError(`Failed to delete version: ${error.message}`, 500);
            }

            // Log deletion
            await this.logVersionActivity(id, 'deleted', {
                deleted_by: deletedBy,
                version_number: version.version_number,
                force_delete: force
            });

            return true;
        } catch (error) {
            console.error('Error deleting version:', error);
            throw error instanceof AppError ? error : new AppError('Failed to delete version', 500);
        }
    }

    // Helper Methods

    /**
     * Generate next version number
     */
    static async generateVersionNumber(publicationId, changeType, branchName) {
        try {
            const { data: versions, error } = await supabase
                .from('versions')
                .select('version_number')
                .eq('publication_id', publicationId)
                .eq('branch_name', branchName)
                .order('created_at', { ascending: false })
                .limit(1);

            if (error) {
                throw new AppError(`Failed to get latest version: ${error.message}`, 500);
            }

            let currentVersion = '0.0.0';
            if (versions && versions.length > 0) {
                currentVersion = versions[0].version_number;
            }

            return this.incrementVersion(currentVersion, changeType);
        } catch (error) {
            console.error('Error generating version number:', error);
            throw error;
        }
    }

    /**
     * Increment version number based on change type
     */
    static incrementVersion(currentVersion, changeType) {
        const parts = currentVersion.split('.').map(Number);
        let [major, minor, patch] = parts;

        switch (changeType) {
            case 'major': {
                major += 1;
                minor = 0;
                patch = 0;
                break;
            }
            case 'minor': {
                minor += 1;
                patch = 0;
                break;
            }
            case 'patch':
            case 'hotfix': {
                patch += 1;
                break;
            }
            default: {
                patch += 1;
            }
        }

        return `${major}.${minor}.${patch}`;
    }

    /**
     * Generate content hash for integrity checking
     */
    static generateContentHash(content) {
        const contentString = JSON.stringify(content);
        return crypto.createHash('sha256').update(contentString).digest('hex');
    }

    /**
     * Calculate content statistics
     */
    static calculateContentStats(content) {
        let text = '';
        
        // Extract text from content object
        if (typeof content === 'string') {
            text = content;
        } else if (content && typeof content === 'object') {
            text = this.extractTextFromContent(content);
        }

        const words = text.split(/\s+/).filter(word => word.length > 0);
        const characters = text.length;
        const charactersNoSpaces = text.replace(/\s/g, '').length;
        const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
        const paragraphs = text.split(/\n\s*\n/).filter(p => p.trim().length > 0);

        return {
            word_count: words.length,
            character_count: characters,
            character_count_no_spaces: charactersNoSpaces,
            sentence_count: sentences.length,
            paragraph_count: paragraphs.length,
            estimated_pages: Math.ceil(words.length / 250), // Assuming 250 words per page
            estimated_reading_time: Math.ceil(words.length / 200) // Assuming 200 words per minute
        };
    }

    /**
     * Extract text from structured content
     */
    static extractTextFromContent(content) {
        if (typeof content === 'string') {
            return content;
        }

        if (Array.isArray(content)) {
            return content.map(item => this.extractTextFromContent(item)).join(' ');
        }

        if (content && typeof content === 'object') {
            let text = '';
            
            // Handle common content structures
            if (content.text) {
                text += content.text + ' ';
            }
            
            if (content.title) {
                text += content.title + ' ';
            }
            
            if (content.content) {
                text += this.extractTextFromContent(content.content) + ' ';
            }
            
            if (content.chapters && Array.isArray(content.chapters)) {
                text += content.chapters.map(chapter => this.extractTextFromContent(chapter)).join(' ');
            }
            
            // Recursively extract from other properties
            Object.values(content).forEach(value => {
                if (typeof value === 'string') {
                    text += value + ' ';
                } else if (typeof value === 'object') {
                    text += this.extractTextFromContent(value) + ' ';
                }
            });
            
            return text;
        }

        return '';
    }

    /**
     * Build version tree structure
     */
    static buildVersionTree(versions, rootVersionId = null) {
        const versionMap = new Map();
        const children = new Map();

        // Create maps for quick lookup
        versions.forEach(version => {
            versionMap.set(version.id, {
                ...version,
                children: []
            });
            
            const parentId = version.parent_version_id;
            if (!children.has(parentId)) {
                children.set(parentId, []);
            }
            children.get(parentId).push(version.id);
        });

        // Build tree recursively
        const buildNode = (versionId) => {
            const version = versionMap.get(versionId);
            if (!version) return null;

            const childIds = children.get(versionId) || [];
            version.children = childIds.map(childId => buildNode(childId)).filter(Boolean);

            return version;
        };

        // Find root versions (no parent or specified root)
        const rootVersions = versions.filter(v => 
            !v.parent_version_id || v.id === rootVersionId
        );

        if (rootVersionId) {
            return buildNode(rootVersionId);
        }

        return rootVersions.map(root => buildNode(root.id));
    }

    /**
     * Additional helper methods for collaboration features
     */
    static async findByBranch(publicationId, branchName) {
        const { data, error } = await supabase
            .from('versions')
            .select('*')
            .eq('publication_id', publicationId)
            .eq('branch_name', branchName)
            .order('created_at', { ascending: false });

        if (error) {
            throw new AppError(`Failed to find branch versions: ${error.message}`, 500);
        }

        return data || [];
    }

    static extractBranches(versions) {
        const branches = [...new Set(versions.map(v => v.branch_name))];
        return branches;
    }

    static getLatestVersionsByBranch(versions) {
        const branchMap = new Map();
        
        versions.forEach(version => {
            const branch = version.branch_name;
            if (!branchMap.has(branch) || 
                new Date(version.created_at) > new Date(branchMap.get(branch).created_at)) {
                branchMap.set(branch, version);
            }
        });

        return Object.fromEntries(branchMap);
    }

    static async detectMergeConflicts(sourceVersion, targetVersion) {
        // Implementation for detecting merge conflicts
        // This would analyze content differences and identify conflicting changes
        console.log(`Detecting conflicts between ${sourceVersion.id} and ${targetVersion.id}`);
        return [];
    }

    static async performMerge(sourceVersion, targetVersion, strategy, conflicts) {
        // Implementation for performing the actual merge
        // This would merge content based on the specified strategy
        console.log(`Performing ${strategy} merge with ${conflicts.length} conflicts`);
        return targetVersion.content;
    }

    static calculateContentDiff(content1, content2, options) {
        // Implementation for calculating content differences
        console.log(`Calculating diff with ${options.diff_type} format`);
        const changes = {
            added: [],
            removed: [],
            modified: []
        };
        
        // Basic diff logic would go here
        if (JSON.stringify(content1) !== JSON.stringify(content2)) {
            changes.modified.push({
                type: 'content_change',
                old_content: content1,
                new_content: content2
            });
        }
        
        return changes;
    }

    static calculateDiffStatistics(content1, content2) {
        // Implementation for calculating diff statistics
        const text1 = typeof content1 === 'string' ? content1 : JSON.stringify(content1);
        const text2 = typeof content2 === 'string' ? content2 : JSON.stringify(content2);
        
        return {
            additions: text2.length > text1.length ? text2.length - text1.length : 0,
            deletions: text1.length > text2.length ? text1.length - text2.length : 0,
            modifications: text1 === text2 ? 0 : 1
        };
    }

    static calculateMetadataDiff(metadata1, metadata2) {
        // Implementation for calculating metadata differences
        const diff = {
            added: {},
            removed: {},
            modified: {}
        };
        
        const keys1 = Object.keys(metadata1 || {});
        const keys2 = Object.keys(metadata2 || {});
        
        // Find added keys
        keys2.forEach(key => {
            if (!keys1.includes(key)) {
                diff.added[key] = metadata2[key];
            }
        });
        
        // Find removed keys
        keys1.forEach(key => {
            if (!keys2.includes(key)) {
                diff.removed[key] = metadata1[key];
            }
        });
        
        // Find modified keys
        keys1.forEach(key => {
            if (keys2.includes(key) && metadata1[key] !== metadata2[key]) {
                diff.modified[key] = {
                    old: metadata1[key],
                    new: metadata2[key]
                };
            }
        });
        
        return diff;
    }

    static async getChildVersions(versionId) {
        const { data, error } = await supabase
            .from('versions')
            .select('id, version_number')
            .eq('parent_version_id', versionId);

        if (error) {
            throw new AppError(`Failed to get child versions: ${error.message}`, 500);
        }

        return data || [];
    }

    static async checkEditPermission(publicationId, userId) {
        // Implementation for checking edit permissions
        // This would check user roles, collaboration permissions, etc.
        console.log(`Checking edit permission for user ${userId} on publication ${publicationId}`);
        return true; // Placeholder - would implement actual permission logic
    }

    static async checkDeletePermission(publicationId, userId) {
        // Implementation for checking delete permissions  
        // This would check user roles, ownership, etc.
        console.log(`Checking delete permission for user ${userId} on publication ${publicationId}`);
        return true; // Placeholder - would implement actual permission logic
    }

    static async updatePublicationCurrentVersion(publicationId, versionId) {
        // Implementation for updating publication's current version
        await supabase
            .from('publications')
            .update({ current_version_id: versionId })
            .eq('id', publicationId);
    }

    static async deleteBranch(publicationId, branchName, deletedBy) {
        // Implementation for deleting entire branch
        const { error } = await supabase
            .from('versions')
            .delete()
            .eq('publication_id', publicationId)
            .eq('branch_name', branchName);

        if (error) {
            throw new AppError(`Failed to delete branch: ${error.message}`, 500);
        }

        await this.logVersionActivity(null, 'branch_deleted', {
            publication_id: publicationId,
            branch_name: branchName,
            deleted_by: deletedBy
        });
    }

    static async logVersionActivity(versionId, activityType, metadata = {}) {
        try {
            await supabase
                .from('version_activities')
                .insert({
                    id: uuidv4(),
                    version_id: versionId,
                    activity_type: activityType,
                    metadata,
                    created_at: new Date()
                });
        } catch (error) {
            console.error('Error logging version activity:', error);
        }
    }
}

module.exports = VersionModel;
