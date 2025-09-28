import { useState, useEffect, useCallback } from 'react';
import { musicApi } from '../api/client';
import { Release, Track, SearchFilters } from '../types';

// Hook for managing releases
export const useReleases = (initialFilters?: SearchFilters) => {
  const [releases, setReleases] = useState<Release[]>([]);
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

  const fetchReleases = useCallback(async (newFilters?: SearchFilters) => {
    try {
      setLoading(true);
      setError(null);
      
      const filtersToUse = newFilters || filters;
      const response = await musicApi.releases.getAll(filtersToUse);
      const data = response.data as any;
      
      if (data.success) {
        setReleases(data.data || []);
        if (data.pagination) {
          setPagination(data.pagination);
        }
      } else {
        setError(data.message || 'Failed to fetch releases');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch releases');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  const createRelease = useCallback(async (data: any) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await musicApi.releases.create(data);
      const responseData = response.data as any;
      
      if (responseData.success) {
        await fetchReleases(); // Refresh the list
        return responseData.data;
      } else {
        setError(responseData.message || 'Failed to create release');
        return null;
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create release');
      return null;
    } finally {
      setLoading(false);
    }
  }, [fetchReleases]);

  const updateRelease = useCallback(async (id: string, data: any) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await musicApi.releases.update(id, data);
      const responseData = response.data as any;
      
      if (responseData.success) {
        await fetchReleases(); // Refresh the list
        return responseData.data;
      } else {
        setError(responseData.message || 'Failed to update release');
        return null;
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update release');
      return null;
    } finally {
      setLoading(false);
    }
  }, [fetchReleases]);

  const deleteRelease = useCallback(async (id: string) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await musicApi.releases.delete(id);
      const responseData = response.data as any;
      
      if (responseData.success) {
        await fetchReleases(); // Refresh the list
        return true;
      } else {
        setError(responseData.message || 'Failed to delete release');
        return false;
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to delete release');
      return false;
    } finally {
      setLoading(false);
    }
  }, [fetchReleases]);

  const updateFilters = useCallback((newFilters: Partial<SearchFilters>) => {
    const updatedFilters = { ...filters, ...newFilters };
    setFilters(updatedFilters);
    fetchReleases(updatedFilters);
  }, [filters, fetchReleases]);

  useEffect(() => {
    fetchReleases();
  }, []);

  return {
    releases,
    loading,
    error,
    pagination,
    filters,
    fetchReleases,
    createRelease,
    updateRelease,
    deleteRelease,
    updateFilters,
    clearError: () => setError(null),
  };
};

// Hook for managing individual release
export const useRelease = (id?: string) => {
  const [release, setRelease] = useState<Release | null>(null);
  const [tracks, setTracks] = useState<Track[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchRelease = useCallback(async (releaseId: string) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await musicApi.releases.get(releaseId);
      const data = response.data as any;
      
      if (data.success) {
        setRelease(data.data);
        
        // Also fetch tracks for this release
        const tracksResponse = await musicApi.tracks.getByRelease(releaseId);
        const tracksData = tracksResponse.data as any;
        
        if (tracksData.success) {
          setTracks(tracksData.data || []);
        }
      } else {
        setError(data.message || 'Failed to fetch release');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch release');
    } finally {
      setLoading(false);
    }
  }, []);

  const updateRelease = useCallback(async (data: any) => {
    if (!id) return null;
    
    try {
      setLoading(true);
      setError(null);
      
      const response = await musicApi.releases.update(id, data);
      const responseData = response.data as any;
      
      if (responseData.success) {
        setRelease(responseData.data);
        return responseData.data;
      } else {
        setError(responseData.message || 'Failed to update release');
        return null;
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update release');
      return null;
    } finally {
      setLoading(false);
    }
  }, [id]);

  const addTrack = useCallback(async (trackData: any) => {
    if (!id) return null;
    
    try {
      setLoading(true);
      setError(null);
      
      const response = await musicApi.tracks.create(id, trackData);
      const responseData = response.data as any;
      
      if (responseData.success) {
        setTracks(prev => [...prev, responseData.data]);
        return responseData.data;
      } else {
        setError(responseData.message || 'Failed to add track');
        return null;
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to add track');
      return null;
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (id) {
      fetchRelease(id);
    }
  }, [id, fetchRelease]);

  return {
    release,
    tracks,
    loading,
    error,
    fetchRelease,
    updateRelease,
    addTrack,
    clearError: () => setError(null),
  };
};

// Hook for managing analytics
export const useAnalytics = () => {
  const [overview, setOverview] = useState<Record<string, any>>({});
  const [streams, setStreams] = useState([]);
  const [geographic, setGeographic] = useState<Record<string, number>>({});
  const [topTracks, setTopTracks] = useState<Track[]>([]);
  const [topReleases, setTopReleases] = useState<Release[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchOverview = useCallback(async (period?: string) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await musicApi.analytics.getOverview(period);
      const data = response.data as any;
      
      if (data.success) {
        setOverview(data.data || {});
      } else {
        setError(data.message || 'Failed to fetch analytics overview');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch analytics overview');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchStreams = useCallback(async (filters?: SearchFilters) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await musicApi.analytics.getStreams(filters);
      const data = response.data as any;
      
      if (data.success) {
        setStreams(data.data || []);
      } else {
        setError(data.message || 'Failed to fetch streams analytics');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch streams analytics');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchGeographic = useCallback(async (filters?: SearchFilters) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await musicApi.analytics.getGeographic(filters);
      const data = response.data as any;
      
      if (data.success) {
        setGeographic(data.data || {});
      } else {
        setError(data.message || 'Failed to fetch geographic analytics');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch geographic analytics');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchTopContent = useCallback(async (limit = 10) => {
    try {
      setLoading(true);
      setError(null);
      
      const [tracksResponse, releasesResponse] = await Promise.all([
        musicApi.analytics.getTopTracks(limit),
        musicApi.analytics.getTopReleases(limit),
      ]);
      
      const tracksData = tracksResponse.data as any;
      const releasesData = releasesResponse.data as any;
      
      if (tracksData.success) {
        setTopTracks(tracksData.data || []);
      }
      
      if (releasesData.success) {
        setTopReleases(releasesData.data || []);
      }
      
      if (!tracksData.success || !releasesData.success) {
        setError('Failed to fetch top content');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch top content');
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    overview,
    streams,
    geographic,
    topTracks,
    topReleases,
    loading,
    error,
    fetchOverview,
    fetchStreams,
    fetchGeographic,
    fetchTopContent,
    clearError: () => setError(null),
  };
};

// Hook for managing financial data
export const useFinancials = () => {
  const [revenue, setRevenue] = useState([]);
  const [splits, setSplits] = useState([]);
  const [payouts, setPayouts] = useState([]);
  const [summary, setSummary] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchRevenue = useCallback(async (filters?: SearchFilters) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await musicApi.financials.revenue.getAll(filters);
      const data = response.data as any;
      
      if (data.success) {
        setRevenue(data.data || []);
      } else {
        setError(data.message || 'Failed to fetch revenue data');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch revenue data');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchSummary = useCallback(async (period?: string) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await musicApi.financials.revenue.getSummary(period);
      const data = response.data as any;
      
      if (data.success) {
        setSummary(data.data || {});
      } else {
        setError(data.message || 'Failed to fetch revenue summary');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch revenue summary');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchPayouts = useCallback(async (filters?: SearchFilters) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await musicApi.financials.payouts.getAll(filters);
      const data = response.data as any;
      
      if (data.success) {
        setPayouts(data.data || []);
      } else {
        setError(data.message || 'Failed to fetch payouts');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch payouts');
    } finally {
      setLoading(false);
    }
  }, []);

  const createPayout = useCallback(async (payoutData: any) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await musicApi.financials.payouts.create(payoutData);
      const responseData = response.data as any;
      
      if (responseData.success) {
        await fetchPayouts(); // Refresh the list
        return responseData.data;
      } else {
        setError(responseData.message || 'Failed to create payout');
        return null;
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create payout');
      return null;
    } finally {
      setLoading(false);
    }
  }, [fetchPayouts]);

  return {
    revenue,
    splits,
    payouts,
    summary,
    loading,
    error,
    fetchRevenue,
    fetchSummary,
    fetchPayouts,
    createPayout,
    clearError: () => setError(null),
  };
};

// Hook for managing distribution
export const useDistribution = () => {
  const [platforms, setPlatforms] = useState([]);
  const [connections, setConnections] = useState([]);
  const [distributions, setDistributions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPlatforms = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await musicApi.distribution.platforms.getAll();
      const data = response.data as any;
      
      if (data.success) {
        setPlatforms(data.data || []);
      } else {
        setError(data.message || 'Failed to fetch platforms');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch platforms');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchConnections = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await musicApi.distribution.connections.getAll();
      const data = response.data as any;
      
      if (data.success) {
        setConnections(data.data || []);
      } else {
        setError(data.message || 'Failed to fetch connections');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch connections');
    } finally {
      setLoading(false);
    }
  }, []);

  const createConnection = useCallback(async (platformId: string, credentials: any) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await musicApi.distribution.connections.create(platformId, credentials);
      const responseData = response.data as any;
      
      if (responseData.success) {
        await fetchConnections(); // Refresh the list
        return responseData.data;
      } else {
        setError(responseData.message || 'Failed to create connection');
        return null;
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create connection');
      return null;
    } finally {
      setLoading(false);
    }
  }, [fetchConnections]);

  const distributeRelease = useCallback(async (releaseId: string, platformIds: string[]) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await musicApi.distribution.releases.create(releaseId, platformIds);
      const responseData = response.data as any;
      
      if (responseData.success) {
        return responseData.data;
      } else {
        setError(responseData.message || 'Failed to distribute release');
        return null;
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to distribute release');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPlatforms();
    fetchConnections();
  }, [fetchPlatforms, fetchConnections]);

  return {
    platforms,
    connections,
    distributions,
    loading,
    error,
    fetchPlatforms,
    fetchConnections,
    createConnection,
    distributeRelease,
    clearError: () => setError(null),
  };
};
