import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 
  (import.meta.env.PROD 
    ? 'https://hardbanrecords-lab.vercel.app/api'
    : 'http://localhost:3001/api'
  );

// Mock data for development
const mockData = {
  '/data': {
    artists: [
      { id: 1, name: 'The Midnight', genre: 'Synthwave', albums: 3 },
      { id: 2, name: 'FM-84', genre: 'Synthwave', albums: 2 }
    ],
    releases: [
      { id: 1, title: 'Endless Summer', artist: 'The Midnight', status: 'Released' },
      { id: 2, title: 'Atlas', artist: 'FM-84', status: 'In Progress' }
    ],
    books: [
      { id: 1, title: 'Digital Dreams', author: 'Alex Chen', status: 'Published' },
      { id: 2, title: 'Neon Nights', author: 'Sarah Kim', status: 'In Review' }
    ],
    stats: {
      totalArtists: 25,
      totalReleases: 45,
      totalBooks: 12,
      totalRevenue: 125000
    }
  }
};

export const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Override axios calls to return mock data for development
const originalGet = apiClient.get;
apiClient.get = async (url: string, config?: any): Promise<any> => {
  console.log('🎭 Mock API call:', url);

  // Return mock data for /data endpoint
  if (url === '/data' || url.endsWith('/data')) {
    return Promise.resolve({
      data: mockData['/data'],
      status: 200,
      statusText: 'OK'
    });
  }

  // For other endpoints, try real API call
  try {
    return await originalGet.call(apiClient, url, config);
  } catch (error) {
    console.log('🔌 API offline, returning mock data for:', url);
    return Promise.resolve({
      data: { message: 'Mock response for ' + url },
      status: 200,
      statusText: 'OK'
    });
  }
};

// Add request interceptor to include auth token
apiClient.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = window.localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// Add response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && typeof window !== 'undefined') {
      window.localStorage.removeItem('auth_token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Type definitions for API responses
export interface S3PresignedUrlResponse {
  presigned_url: string;
  file_url: string;
}

// Upload file to S3 using presigned URL
export async function uploadFileToS3(file: globalThis.File): Promise<{ fileUrl: string }> {
  // 1. Get presigned URL from backend
  const { data } = await apiClient.get<S3PresignedUrlResponse>('/files/presigned-url', {
    params: { fileName: file.name, fileType: file.type }
  });

  // 2. Upload file directly to S3
  await fetch(data.presigned_url, {
    method: 'PUT',
    headers: { 'Content-Type': file.type },
    body: file
  });

  // 3. Return file URL
  return { fileUrl: data.file_url };
}

// Enhanced Music API endpoints
export const musicApi = {
  // Releases
  releases: {
    getAll: (filters?: any) => apiClient.get('/music/releases', { params: filters }),
    get: (id: string) => apiClient.get(`/music/releases/${id}`),
    create: (data: any) => apiClient.post('/music/releases', data),
    update: (id: string, data: any) => apiClient.patch(`/music/releases/${id}`, data),
    delete: (id: string) => apiClient.delete(`/music/releases/${id}`),
    submit: (id: string) => apiClient.post(`/music/releases/${id}/submit`),
    approve: (id: string) => apiClient.post(`/music/releases/${id}/approve`),
    reject: (id: string, reason: string) => apiClient.post(`/music/releases/${id}/reject`, { reason }),
  },

  // Tracks
  tracks: {
    getByRelease: (releaseId: string) => apiClient.get(`/music/releases/${releaseId}/tracks`),
    get: (id: string) => apiClient.get(`/music/tracks/${id}`),
    create: (releaseId: string, data: any) => apiClient.post(`/music/releases/${releaseId}/tracks`, data),
    update: (id: string, data: any) => apiClient.patch(`/music/tracks/${id}`, data),
    delete: (id: string) => apiClient.delete(`/music/tracks/${id}`),
    generatePreview: (id: string) => apiClient.post(`/music/tracks/${id}/preview`),
  },

  // Distribution
  distribution: {
    platforms: {
      getAll: () => apiClient.get('/music/distribution/platforms'),
      get: (id: string) => apiClient.get(`/music/distribution/platforms/${id}`),
    },
    connections: {
      getAll: () => apiClient.get('/music/distribution/connections'),
      create: (platformId: string, credentials: any) =>
        apiClient.post('/music/distribution/connections', { platform_id: platformId, ...credentials }),
      update: (id: string, data: any) => apiClient.patch(`/music/distribution/connections/${id}`, data),
      delete: (id: string) => apiClient.delete(`/music/distribution/connections/${id}`),
      sync: (id: string) => apiClient.post(`/music/distribution/connections/${id}/sync`),
    },
    releases: {
      getByRelease: (releaseId: string) => apiClient.get(`/music/releases/${releaseId}/distributions`),
      create: (releaseId: string, platformIds: string[]) =>
        apiClient.post(`/music/releases/${releaseId}/distributions`, { platform_ids: platformIds }),
      update: (id: string, data: any) => apiClient.patch(`/music/distribution/${id}`, data),
      delete: (id: string) => apiClient.delete(`/music/distribution/${id}`),
      retry: (id: string) => apiClient.post(`/music/distribution/${id}/retry`),
    },
  },

  // Financials
  financials: {
    revenue: {
      getAll: (filters?: any) => apiClient.get('/music/financials/revenue', { params: filters }),
      getByRelease: (releaseId: string) => apiClient.get(`/music/releases/${releaseId}/revenue`),
      getByTrack: (trackId: string) => apiClient.get(`/music/tracks/${trackId}/revenue`),
      getSummary: (period?: string) => apiClient.get('/music/financials/revenue/summary', { params: { period } }),
    },
    splits: {
      getByRelease: (releaseId: string) => apiClient.get(`/music/releases/${releaseId}/splits`),
      create: (data: any) => apiClient.post('/music/financials/splits', data),
      update: (id: string, data: any) => apiClient.patch(`/music/financials/splits/${id}`, data),
      delete: (id: string) => apiClient.delete(`/music/financials/splits/${id}`),
    },
    payouts: {
      getAll: (filters?: any) => apiClient.get('/music/financials/payouts', { params: filters }),
      get: (id: string) => apiClient.get(`/music/financials/payouts/${id}`),
      create: (data: any) => apiClient.post('/music/financials/payouts', data),
      cancel: (id: string) => apiClient.post(`/music/financials/payouts/${id}/cancel`),
    },
  },

  // Analytics
  analytics: {
    getOverview: (period?: string) => apiClient.get('/music/analytics/overview', { params: { period } }),
    getStreams: (filters?: any) => apiClient.get('/music/analytics/streams', { params: filters }),
    getGeographic: (filters?: any) => apiClient.get('/music/analytics/geographic', { params: filters }),
    getTopTracks: (limit?: number) => apiClient.get('/music/analytics/top-tracks', { params: { limit } }),
    getTopReleases: (limit?: number) => apiClient.get('/music/analytics/top-releases', { params: { limit } }),
  },

  // Collaborations
  collaborations: {
    getRequests: () => apiClient.get('/music/collaborations/requests'),
    sendRequest: (data: any) => apiClient.post('/music/collaborations/requests', data),
    respondToRequest: (id: string, response: 'accepted' | 'declined') =>
      apiClient.post(`/music/collaborations/requests/${id}/respond`, { response }),
    getByRelease: (releaseId: string) => apiClient.get(`/music/releases/${releaseId}/collaborations`),
  },

  // Playlists
  playlists: {
    getAll: () => apiClient.get('/music/playlists'),
    get: (id: string) => apiClient.get(`/music/playlists/${id}`),
    create: (data: any) => apiClient.post('/music/playlists', data),
    update: (id: string, data: any) => apiClient.patch(`/music/playlists/${id}`, data),
    delete: (id: string) => apiClient.delete(`/music/playlists/${id}`),
    getTracks: (id: string) => apiClient.get(`/music/playlists/${id}/tracks`),
    addTrack: (id: string, trackId: string, position?: number) =>
      apiClient.post(`/music/playlists/${id}/tracks`, { track_id: trackId, position }),
    removeTrack: (id: string, trackId: string) => apiClient.delete(`/music/playlists/${id}/tracks/${trackId}`),
  },

  // Legacy compatibility
  getAll: () => apiClient.get('/music/releases'),
  create: (data: any) => apiClient.post('/music/releases', data),
  update: (id: string, data: any) => apiClient.patch(`/music/releases/${id}`, data),
  delete: (id: string) => apiClient.delete(`/music/releases/${id}`),
  updateSplits: (releaseId: string, splits: any) => apiClient.post(`/music/releases/${releaseId}/splits`, splits),
};

// Publishing API endpoints
export const publishingApi = {
  publications: {
    getAll: (filters?: any) => apiClient.get('/publishing/publications', { params: filters }),
    get: (id: string) => apiClient.get(`/publishing/publications/${id}`),
    create: (data: any) => apiClient.post('/publishing/publications', data),
    update: (id: string, data: any) => apiClient.patch(`/publishing/publications/${id}`, data),
    delete: (id: string) => apiClient.delete(`/publishing/publications/${id}`),
    publish: (id: string) => apiClient.post(`/publishing/publications/${id}/publish`),
  },
  chapters: {
    getByPublication: (publicationId: string) => apiClient.get(`/publishing/publications/${publicationId}/chapters`),
    get: (id: string) => apiClient.get(`/publishing/chapters/${id}`),
    create: (publicationId: string, data: any) => apiClient.post(`/publishing/publications/${publicationId}/chapters`, data),
    update: (id: string, data: any) => apiClient.patch(`/publishing/chapters/${id}`, data),
    delete: (id: string) => apiClient.delete(`/publishing/chapters/${id}`),
    reorder: (publicationId: string, chapterIds: string[]) =>
      apiClient.post(`/publishing/publications/${publicationId}/chapters/reorder`, { chapter_ids: chapterIds }),
  },
};

// Auth API endpoints
export const authApi = {
  login: (credentials: any) => apiClient.post('/auth/login', credentials),
  register: (userData: any) => apiClient.post('/auth/register', userData),
  logout: () => apiClient.post('/auth/logout'),
  refreshToken: () => apiClient.post('/auth/refresh'),
  forgotPassword: (email: string) => apiClient.post('/auth/forgot-password', { email }),
  resetPassword: (token: string, password: string) => apiClient.post('/auth/reset-password', { token, password }),
  verifyEmail: (token: string) => apiClient.post('/auth/verify-email', { token }),
  getCurrentUser: () => apiClient.get('/auth/me'),
};

// Profile API endpoints
export const profileApi = {
  get: (id: string) => apiClient.get(`/profiles/${id}`),
  update: (id: string, data: any) => apiClient.patch(`/profiles/${id}`, data),
  search: (query: string) => apiClient.get('/profiles/search', { params: { query } }),
};

// Tasks API endpoints
export const tasksApi = {
  getAll: () => apiClient.get('/music/tasks'),
  create: (data: any) => apiClient.post('/music/tasks', data),
  update: (id: string, data: any) => apiClient.patch(`/music/tasks/${id}`, data),
  delete: (id: string) => apiClient.delete(`/music/tasks/${id}`),
};

// AI API endpoints
export const aiApi = {
  generateImage: (prompt: string) => apiClient.post('/ai/generate-image', { prompt }),
  generateContent: (prompt: string) => apiClient.post('/ai/generate-content', { prompt }),
  generateLyrics: (genre?: string, mood?: string, theme?: string) =>
    apiClient.post('/ai/generate-lyrics', { genre, mood, theme }),
  enhanceAudio: (trackId: string, enhancements: string[]) =>
    apiClient.post(`/ai/enhance-audio/${trackId}`, { enhancements }),
};

// Notification API endpoints
export const notificationApi = {
  getAll: () => apiClient.get('/notifications'),
  markAsRead: (id: string) => apiClient.patch(`/notifications/${id}`, { is_read: true }),
  markAllAsRead: () => apiClient.patch('/notifications/read-all'),
  delete: (id: string) => apiClient.delete(`/notifications/${id}`),
};

// Admin API endpoints
export const adminApi = {
  users: {
    getAll: (filters?: any) => apiClient.get('/admin/users', { params: filters }),
    get: (id: string) => apiClient.get(`/admin/users/${id}`),
    update: (id: string, data: any) => apiClient.patch(`/admin/users/${id}`, data),
    ban: (id: string, reason: string) => apiClient.post(`/admin/users/${id}/ban`, { reason }),
    unban: (id: string) => apiClient.post(`/admin/users/${id}/unban`),
  },
  releases: {
    getAll: (filters?: any) => apiClient.get('/admin/releases', { params: filters }),
    approve: (id: string) => apiClient.post(`/admin/releases/${id}/approve`),
    reject: (id: string, reason: string) => apiClient.post(`/admin/releases/${id}/reject`, { reason }),
  },
  analytics: {
    getSystemStats: () => apiClient.get('/admin/analytics/system'),
    getUserStats: () => apiClient.get('/admin/analytics/users'),
    getRevenueStats: () => apiClient.get('/admin/analytics/revenue'),
  },
};
