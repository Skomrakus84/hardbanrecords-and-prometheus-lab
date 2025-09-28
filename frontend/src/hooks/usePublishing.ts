import { useState, useEffect, useCallback } from 'react';
import { publishingApi } from '../api/client';
import { Publication, Chapter, SearchFilters } from '../types';

// Hook for managing publications
export const usePublications = (initialFilters?: SearchFilters) => {
  const [publications, setPublications] = useState<Publication[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
    hasNext: false,
    hasPrev: false,
  });
  const [filters, setFilters] = useState<SearchFilters>(initialFilters || {});

  const fetchPublications = useCallback(async (newFilters?: SearchFilters) => {
    try {
      setLoading(true);
      setError(null);
      
      const filtersToUse = newFilters || filters;
      const response = await publishingApi.publications.getAll(filtersToUse);
      const data = response.data as any;
      
      if (data.success) {
        setPublications(data.data || []);
        if (data.pagination) {
          setPagination(data.pagination);
        }
      } else {
        setError(data.message || 'Failed to fetch publications');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch publications');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  const createPublication = useCallback(async (data: any) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await publishingApi.publications.create(data);
      const responseData = response.data as any;
      
      if (responseData.success) {
        await fetchPublications(); // Refresh the list
        return responseData.data;
      } else {
        setError(responseData.message || 'Failed to create publication');
        return null;
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create publication');
      return null;
    } finally {
      setLoading(false);
    }
  }, [fetchPublications]);

  const updatePublication = useCallback(async (id: string, data: any) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await publishingApi.publications.update(id, data);
      const responseData = response.data as any;
      
      if (responseData.success) {
        await fetchPublications(); // Refresh the list
        return responseData.data;
      } else {
        setError(responseData.message || 'Failed to update publication');
        return null;
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update publication');
      return null;
    } finally {
      setLoading(false);
    }
  }, [fetchPublications]);

  const deletePublication = useCallback(async (id: string) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await publishingApi.publications.delete(id);
      const responseData = response.data as any;
      
      if (responseData.success) {
        await fetchPublications(); // Refresh the list
        return true;
      } else {
        setError(responseData.message || 'Failed to delete publication');
        return false;
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to delete publication');
      return false;
    } finally {
      setLoading(false);
    }
  }, [fetchPublications]);

  const publishPublication = useCallback(async (id: string) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await publishingApi.publications.publish(id);
      const responseData = response.data as any;
      
      if (responseData.success) {
        await fetchPublications(); // Refresh the list
        return responseData.data;
      } else {
        setError(responseData.message || 'Failed to publish publication');
        return null;
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to publish publication');
      return null;
    } finally {
      setLoading(false);
    }
  }, [fetchPublications]);

  const updateFilters = useCallback((newFilters: Partial<SearchFilters>) => {
    const updatedFilters = { ...filters, ...newFilters };
    setFilters(updatedFilters);
    fetchPublications(updatedFilters);
  }, [filters, fetchPublications]);

  useEffect(() => {
    fetchPublications();
  }, []);

  return {
    publications,
    loading,
    error,
    pagination,
    filters,
    fetchPublications,
    createPublication,
    updatePublication,
    deletePublication,
    publishPublication,
    updateFilters,
    clearError: () => setError(null),
  };
};

// Hook for managing individual publication
export const usePublication = (id?: string) => {
  const [publication, setPublication] = useState<Publication | null>(null);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPublication = useCallback(async (publicationId: string) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await publishingApi.publications.get(publicationId);
      const data = response.data as any;
      
      if (data.success) {
        setPublication(data.data);
        
        // Also fetch chapters for this publication
        const chaptersResponse = await publishingApi.chapters.getByPublication(publicationId);
        const chaptersData = chaptersResponse.data as any;
        
        if (chaptersData.success) {
          setChapters(chaptersData.data || []);
        }
      } else {
        setError(data.message || 'Failed to fetch publication');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch publication');
    } finally {
      setLoading(false);
    }
  }, []);

  const updatePublication = useCallback(async (data: any) => {
    if (!id) return null;
    
    try {
      setLoading(true);
      setError(null);
      
      const response = await publishingApi.publications.update(id, data);
      const responseData = response.data as any;
      
      if (responseData.success) {
        setPublication(responseData.data);
        return responseData.data;
      } else {
        setError(responseData.message || 'Failed to update publication');
        return null;
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update publication');
      return null;
    } finally {
      setLoading(false);
    }
  }, [id]);

  const publishPublication = useCallback(async () => {
    if (!id) return null;
    
    try {
      setLoading(true);
      setError(null);
      
      const response = await publishingApi.publications.publish(id);
      const responseData = response.data as any;
      
      if (responseData.success) {
        setPublication(responseData.data);
        return responseData.data;
      } else {
        setError(responseData.message || 'Failed to publish publication');
        return null;
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to publish publication');
      return null;
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (id) {
      fetchPublication(id);
    }
  }, [id, fetchPublication]);

  return {
    publication,
    chapters,
    loading,
    error,
    fetchPublication,
    updatePublication,
    publishPublication,
    clearError: () => setError(null),
  };
};

// Hook for managing chapters
export const useChapters = (publicationId?: string) => {
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchChapters = useCallback(async (pubId: string) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await publishingApi.chapters.getByPublication(pubId);
      const data = response.data as any;
      
      if (data.success) {
        setChapters(data.data || []);
      } else {
        setError(data.message || 'Failed to fetch chapters');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch chapters');
    } finally {
      setLoading(false);
    }
  }, []);

  const createChapter = useCallback(async (chapterData: any) => {
    if (!publicationId) return null;
    
    try {
      setLoading(true);
      setError(null);
      
      const response = await publishingApi.chapters.create(publicationId, chapterData);
      const responseData = response.data as any;
      
      if (responseData.success) {
        setChapters(prev => [...prev, responseData.data]);
        return responseData.data;
      } else {
        setError(responseData.message || 'Failed to create chapter');
        return null;
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create chapter');
      return null;
    } finally {
      setLoading(false);
    }
  }, [publicationId]);

  const updateChapter = useCallback(async (chapterId: string, data: any) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await publishingApi.chapters.update(chapterId, data);
      const responseData = response.data as any;
      
      if (responseData.success) {
        setChapters(prev => 
          prev.map(chapter => 
            chapter.id === chapterId ? responseData.data : chapter
          )
        );
        return responseData.data;
      } else {
        setError(responseData.message || 'Failed to update chapter');
        return null;
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update chapter');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteChapter = useCallback(async (chapterId: string) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await publishingApi.chapters.delete(chapterId);
      const responseData = response.data as any;
      
      if (responseData.success) {
        setChapters(prev => prev.filter(chapter => chapter.id !== chapterId));
        return true;
      } else {
        setError(responseData.message || 'Failed to delete chapter');
        return false;
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to delete chapter');
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const reorderChapters = useCallback(async (chapterIds: string[]) => {
    if (!publicationId) return false;
    
    try {
      setLoading(true);
      setError(null);
      
      const response = await publishingApi.chapters.reorder(publicationId, chapterIds);
      const responseData = response.data as any;
      
      if (responseData.success) {
        // Re-fetch chapters to get updated order
        await fetchChapters(publicationId);
        return true;
      } else {
        setError(responseData.message || 'Failed to reorder chapters');
        return false;
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to reorder chapters');
      return false;
    } finally {
      setLoading(false);
    }
  }, [publicationId, fetchChapters]);

  useEffect(() => {
    if (publicationId) {
      fetchChapters(publicationId);
    }
  }, [publicationId, fetchChapters]);

  return {
    chapters,
    loading,
    error,
    fetchChapters,
    createChapter,
    updateChapter,
    deleteChapter,
    reorderChapters,
    clearError: () => setError(null),
  };
};

// Hook for managing individual chapter
export const useChapter = (id?: string) => {
  const [chapter, setChapter] = useState<Chapter | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchChapter = useCallback(async (chapterId: string) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await publishingApi.chapters.get(chapterId);
      const data = response.data as any;
      
      if (data.success) {
        setChapter(data.data);
      } else {
        setError(data.message || 'Failed to fetch chapter');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch chapter');
    } finally {
      setLoading(false);
    }
  }, []);

  const updateChapter = useCallback(async (data: any) => {
    if (!id) return null;
    
    try {
      setLoading(true);
      setError(null);
      
      const response = await publishingApi.chapters.update(id, data);
      const responseData = response.data as any;
      
      if (responseData.success) {
        setChapter(responseData.data);
        return responseData.data;
      } else {
        setError(responseData.message || 'Failed to update chapter');
        return null;
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update chapter');
      return null;
    } finally {
      setLoading(false);
    }
  }, [id]);

  const saveContent = useCallback(async (content: string) => {
    if (!id) return false;
    
    try {
      setLoading(true);
      setError(null);
      
      const response = await publishingApi.chapters.update(id, { content });
      const responseData = response.data as any;
      
      if (responseData.success) {
        setChapter(responseData.data);
        return true;
      } else {
        setError(responseData.message || 'Failed to save content');
        return false;
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to save content');
      return false;
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (id) {
      fetchChapter(id);
    }
  }, [id, fetchChapter]);

  return {
    chapter,
    loading,
    error,
    fetchChapter,
    updateChapter,
    saveContent,
    clearError: () => setError(null),
  };
};
