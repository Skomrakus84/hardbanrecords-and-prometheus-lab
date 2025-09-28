import { create } from 'zustand';

// --- Typy i interfejsy (przeniesione z głównego kodu) ---
type LoadingState = {
  metadata: boolean;
  releaseDate: boolean;
  forecast: boolean;
  syncMatch: boolean;
  coverArt: boolean;
  aandrScout: boolean;
  funding: boolean;
  collabFinder: boolean;
  listenerAnalytics: boolean;
  splitAgreement: boolean;
  proofread: boolean;
  plotAnalysis: boolean;
  enrichment: boolean;
  illustration: boolean;
  blurb: boolean;
  keywords: boolean;
  salesForecast: boolean;
  marketTrends: boolean;
  marketingAssets: boolean;
  worldConsistency: boolean;
  rightsMatch: boolean;
  bookCover: boolean;
};

type View = 'DASHBOARD' | 'MUSIC' | 'PUBLISHING';

interface Task {
  id: number;
  text: string;
  dueDate: string | undefined;
  completed: boolean;
}

interface ToastMessage {
  id: number;
  message: string;
  type: 'success' | 'error';
}

interface ReleaseCollaborator {
  name: string;
  share: string;
}

interface Release {
  id: number;
  title: string;
  artist: string;
  status: 'Live' | 'In Review' | 'Submitted' | 'Processing';
  genre?: string;
  releaseDate?: string;
  splits: ReleaseCollaborator[];
  coverImageUrl?: string;
  audioUrl?: string;
}

interface Collaborator {
  name: string;
  share: string;
}

interface BookRights {
  territorial: boolean;
  translation: boolean;
  adaptation: boolean;
  drm: boolean;
}

export interface BookChapter {
  title: string;
  content: string;
  imageUrl?: string;
  audioUrl?: string;
  fileUrl?: string;
}

interface BookIllustration {
  url: string;
  prompt: string;
}

interface Book {
  id: number;
  title: string;
  author: string;
  genre: string;
  status: 'Published' | 'Processing' | 'Draft';
  rights: BookRights;
  splits: Collaborator[];
  chapters: BookChapter[];
  blurb: string;
  keywords: string;
  illustrations: BookIllustration[];
  coverImageUrl: string;
}

export interface AppState {
  isInitialized: boolean;
  isLoading: boolean;
  error: string | null;
  view: View;
  loading: LoadingState;
  toasts: ToastMessage[];
  onboarding: {
    tourStepIndex: number;
    onboardingComplete: boolean;
    activeTabOverride?: string | undefined;
  };
  music: {
    releases: Release[];
    tasks: Task[];
  };
  publishing: {
    books: Book[];
    tasks: Task[];
  };
}

interface AppActions {
  fetchReleases: () => Promise<void>;
  fetchAllData: () => Promise<void>;
  initializeApp: () => void;
  setView: (view: View) => void;
  setLoading: (key: keyof LoadingState, value: boolean) => void;
  addToast: (message: string, type?: 'success' | 'error') => void;
  dismissToast: (id: number) => void;
  clearError: () => void;
  startTour: () => void;
  nextTourStep: () => void;
  skipTour: () => void;
  addRelease: (release: Omit<Release, 'id' | 'status'>) => Promise<void>;
  deleteRelease: (id: number) => Promise<void>;
  updateMusicSplits: (releaseId: number, splits: ReleaseCollaborator[]) => Promise<void>;
  fetchMusicTasks: () => Promise<void>;
  addMusicTask: (text: string, dueDate: string) => Promise<void>;
  toggleMusicTask: (id: number, completed?: boolean) => Promise<void>;
  fetchBooks: () => Promise<void>;
  addBook: (book: Omit<Book, 'id'>) => Promise<string | undefined>;
  updateBook: (bookId: number, data: Partial<Book>) => Promise<void>;
  updateBookSplits: (bookId: number, splits: Collaborator[]) => void;
  addChapter: (bookId: number) => void;
  updateChapterContent: (bookId: number, chapterIndex: number, newContent: string) => Promise<void>;
  replaceBookChapters: (bookId: number, chapters: BookChapter[]) => void;
  fetchPublishingTasks: () => Promise<void>;
  addPublishingTask: (text: string, dueDate: string) => Promise<void>;
  togglePublishingTask: (id: number, completed?: boolean) => Promise<void>;
}

type AppStore = AppState & AppActions;

export const useAppStore = create<AppStore>((set, get) => ({
  // State
  isInitialized: false,
  isLoading: false,
  error: null,
  view: 'DASHBOARD',
  loading: {
    metadata: false, releaseDate: false, forecast: false, syncMatch: false, coverArt: false,
    aandrScout: false, funding: false, collabFinder: false, listenerAnalytics: false,
    splitAgreement: false, proofread: false, plotAnalysis: false, enrichment: false,
    illustration: false, blurb: false, keywords: false, salesForecast: false,
    marketTrends: false, marketingAssets: false, worldConsistency: false,
    rightsMatch: false, bookCover: false
  },
  toasts: [],
  onboarding: {
    tourStepIndex: -1,
    onboardingComplete: false,
    activeTabOverride: undefined,
  },
  music: {
    releases: [],
    tasks: [],
  },
  publishing: {
    books: [],
    tasks: [],
  },

  // Actions
  clearError: () => set({ error: null }),

  fetchReleases: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await import('../api/client').then(m => m.apiClient.get('/data'));
      const releases = response.data.releases || [];
      set(state => ({
        music: {
          ...state.music,
          releases: Array.isArray(releases) ? releases : []
        },
        isLoading: false
      }));
    } catch (error: any) {
      const errorMessage = 'Błąd podczas pobierania wydań: ' + (error?.response?.data?.message || error.message);
      set({ error: errorMessage, isLoading: false });
      get().addToast(errorMessage, 'error');
    }
  },

  deleteRelease: async (id: number) => {
    set({ isLoading: true, error: null });
    try {
      await import('../api/client').then(m => m.musicApi.delete(String(id)));
      await get().fetchReleases();
      get().addToast('Wydanie zostało usunięte.', 'success');
    } catch (error: any) {
      const errorMessage = 'Błąd podczas usuwania wydania: ' + (error?.response?.data?.message || error.message);
      set({ error: errorMessage, isLoading: false });
      get().addToast(errorMessage, 'error');
      throw error; // Re-throw to let component handle it
    }
  },

  initializeApp: async () => {
    // Globalna inicjalizacja: pobierz releases, books, tasks z backendu
    await Promise.all([
      get().fetchReleases(),
      get().fetchMusicTasks(),
      get().fetchBooks(),
      get().fetchPublishingTasks(),
    ]);
    set({ isInitialized: true });
  },

  fetchAllData: async () => {
    // Alias dla initializeApp - pobiera wszystkie dane
    await get().initializeApp();
  },

  setView: (view) => set({ view }),

  setLoading: (key, value) => set(state => ({
    loading: { ...state.loading, [key]: value }
  })),

  addToast: (message, type = 'success') => set(state => ({
    toasts: [...state.toasts, { id: Date.now(), message, type }]
  })),

  dismissToast: (id) => set(state => ({
    toasts: state.toasts.filter(t => t.id !== id)
  })),

  startTour: () => {
    if (!get().onboarding.onboardingComplete) {
      set(state => ({
        onboarding: { ...state.onboarding, tourStepIndex: 0 }
      }));
    }
  },

  nextTourStep: () => {
    const currentStepIndex = get().onboarding.tourStepIndex;
    set(state => ({
      onboarding: { ...state.onboarding, tourStepIndex: currentStepIndex + 1 }
    }));
  },

  skipTour: () => {
    set({
      onboarding: {
        tourStepIndex: -1,
        onboardingComplete: true,
        activeTabOverride: undefined
      }
    });
    get().addToast("You're all set! Feel free to explore.", "success");
  },

  addRelease: async (releaseData) => {
    try {
      await import('../api/client').then(m => m.musicApi.create(releaseData));
      await get().fetchReleases();
      get().addToast('Wydanie zostało dodane!', 'success');
    } catch (error: any) {
      get().addToast('Błąd podczas dodawania wydania: ' + (error?.response?.data?.message || error.message), 'error');
    }
  },

  updateMusicSplits: async (releaseId, splits) => {
    try {
      await import('../api/client').then(m => m.musicApi.updateSplits(String(releaseId), splits));
      await get().fetchReleases();
      get().addToast('Podziały zostały zaktualizowane.', 'success');
    } catch (error: any) {
      get().addToast('Błąd podczas aktualizacji podziałów: ' + (error?.response?.data?.message || error.message), 'error');
    }
  },

  fetchMusicTasks: async () => {
    try {
      // Mock tasks for now - dodamy API później
      const mockTasks = [
        { id: 1, text: 'Mix and master new album', completed: false, dueDate: '2024-01-15' },
        { id: 2, text: 'Upload to streaming platforms', completed: true, dueDate: '2024-01-10' }
      ];
      set(state => ({
        music: {
          ...state.music,
          tasks: mockTasks
        }
      }));
    } catch (error: any) {
      get().addToast('Błąd podczas pobierania zadań: ' + (error?.response?.data?.message || error.message), 'error');
    }
  },

  addMusicTask: async (text, dueDate) => {
    try {
      await import('../api/client').then(m => m.tasksApi.create({ text, dueDate }));
      await get().fetchMusicTasks();
      get().addToast('Dodano zadanie muzyczne.', 'success');
    } catch (error: any) {
      get().addToast('Błąd podczas dodawania zadania: ' + (error?.response?.data?.message || error.message), 'error');
    }
  },

  toggleMusicTask: async (id, completed) => {
    try {
      // If completed is not provided, find the task and toggle its current state
      if (completed === undefined) {
        const task = get().music.tasks.find(t => t.id === id);
        completed = !task?.completed;
      }
      await import('../api/client').then(m => m.tasksApi.update(String(id), { completed }));
      await get().fetchMusicTasks();
      get().addToast('Status zadania zaktualizowany.', 'success');
    } catch (error: any) {
      get().addToast('Błąd podczas zmiany statusu zadania: ' + (error?.response?.data?.message || error.message), 'error');
    }
  },

  fetchBooks: async () => {
    try {
      const response = await import('../api/client').then(m => m.apiClient.get('/data'));
      const books = response.data.books || [];
      set(state => ({
        publishing: {
          ...state.publishing,
          books: Array.isArray(books) ? books : []
        }
      }));
    } catch (error: any) {
      get().addToast('Błąd podczas pobierania książek: ' + (error?.response?.data?.message || error.message), 'error');
    }
  },

  addBook: async (bookData) => {
    try {
      const response = await import('../api/client').then(m => m.apiClient.post('/publishing/books', bookData));
      await get().fetchBooks();
      get().addToast('Dodano książkę.', 'success');
      return response.data.book?.id?.toString();
    } catch (error: any) {
      get().addToast('Błąd podczas dodawania książki: ' + (error?.response?.data?.message || error.message), 'error');
      return undefined;
    }
  },

  updateBook: async (bookId, data) => {
    try {
      await import('../api/client').then(m => m.apiClient.patch(`/publishing/books/${bookId}`, data));
      await get().fetchBooks();
      get().addToast('Książka zaktualizowana.', 'success');
    } catch (error: any) {
      get().addToast('Błąd podczas aktualizacji książki: ' + (error?.response?.data?.message || error.message), 'error');
    }
  },

  updateBookSplits: async (bookId, splits) => {
    try {
      await import('../api/client').then(m => m.apiClient.patch(`/publishing/books/${bookId}/splits`, { splits }));
      await get().fetchBooks();
      get().addToast('Splits updated successfully.', 'success');
    } catch (error: any) {
      get().addToast('Błąd podczas aktualizacji splits: ' + (error?.response?.data?.message || error.message), 'error');
    }
  },

  addChapter: (bookId) => {
    const book = get().publishing.books.find(b => b.id === bookId);
    if (!book) return;
    const newChapter: BookChapter = {
      title: `Chapter ${book.chapters.length + 1}`,
      content: ""
    };
    const updatedChapters = [...book.chapters, newChapter];
    set(state => ({
      publishing: {
        ...state.publishing,
        books: state.publishing.books.map(b =>
          b.id === bookId ? { ...b, chapters: updatedChapters } : b
        )
      }
    }));
  },

  updateChapterContent: async (bookId, chapterIndex, newContent) => {
    try {
      await import('../api/client').then(m => m.apiClient.patch(`/publishing/books/${bookId}/chapters/${chapterIndex}`, { content: newContent }));
      await get().fetchBooks();
      get().addToast('Treść rozdziału zaktualizowana.', 'success');
    } catch (error: any) {
      get().addToast('Błąd podczas aktualizacji rozdziału: ' + (error?.response?.data?.message || error.message), 'error');
    }
  },

  replaceBookChapters: (bookId, chapters) => {
    set(state => ({
      publishing: {
        ...state.publishing,
        books: state.publishing.books.map(b =>
          b.id === bookId ? { ...b, chapters } : b
        )
      }
    }));
  },

  fetchPublishingTasks: async () => {
    try {
      // Mock tasks for now - dodamy API później
      const mockTasks = [
        { id: 1, text: 'Edit chapter 5', completed: false, dueDate: '2024-01-20' },
        { id: 2, text: 'Submit to Amazon KDP', completed: true, dueDate: '2024-01-12' }
      ];
      set(state => ({
        publishing: {
          ...state.publishing,
          tasks: mockTasks
        }
      }));
    } catch (error: any) {
      get().addToast('Błąd podczas pobierania zadań wydawniczych: ' + (error?.response?.data?.message || error.message), 'error');
    }
  },

  addPublishingTask: async (text, dueDate) => {
    try {
      await import('../api/client').then(m => m.apiClient.post('/publishing/tasks', { text, dueDate }));
      await get().fetchPublishingTasks();
      get().addToast('Dodano zadanie wydawnicze.', 'success');
    } catch (error: any) {
      get().addToast('Błąd podczas dodawania zadania wydawniczego: ' + (error?.response?.data?.message || error.message), 'error');
    }
  },

  togglePublishingTask: async (id, completed) => {
    try {
      // If completed is not provided, find the task and toggle its current state
      if (completed === undefined) {
        const task = get().publishing.tasks.find(t => t.id === id);
        completed = !task?.completed;
      }
      await import('../api/client').then(m => m.apiClient.patch(`/publishing/tasks/${id}`, { completed }));
      await get().fetchPublishingTasks();
      get().addToast('Status zadania wydawniczego zaktualizowany.', 'success');
    } catch (error: any) {
      get().addToast('Błąd podczas zmiany statusu zadania wydawniczego: ' + (error?.response?.data?.message || error.message), 'error');
    }
  },
}));
