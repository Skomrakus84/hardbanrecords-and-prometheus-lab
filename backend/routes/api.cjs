// Plik: backend/routes/api.cjs
const express = require('express');
const router = express.Router();
const db = require('../db.cjs');
const { createClient } = require('@supabase/supabase-js');
const authorizeRoles = require('../middleware/authRole.cjs');

// --- Konfiguracja Klienta Supabase ---
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

let supabase;
if (supabaseUrl && supabaseKey) {
    supabase = createClient(supabaseUrl, supabaseKey);
} else {
    console.warn("Supabase credentials not found, some features may not work properly");
    // Dummy client for local development without Supabase
    supabase = {
        from: () => ({
            select: () => ({ data: [], error: null }),
            insert: () => ({ data: [], error: null }),
            update: () => ({ data: [], error: null }),
            delete: () => ({ data: [], error: null })
        }),
        storage: {
            from: () => ({
                upload: () => ({ data: { path: "test/path" }, error: null }),
                getPublicUrl: () => ({ data: { publicUrl: "http://localhost:3001/test.jpg" } })
            })
        }
    };
}

// Helpery
const formatDate = (date) => {
    if (!date) return undefined;
    const d = new Date(date);
    return isNaN(d.getTime()) ? undefined : d.toISOString().split('T')[0];
};
const transformTask = (task) => ({
    id: task.id,
    text: task.text,
    completed: task.completed,
    dueDate: task.due_date ? new Date(task.due_date).toISOString().split('T')[0] : '',
});

// --- Główne Endpointy ---

// GET /api - Status API
router.get('/', (req, res) => {
    res.json({
        success: true,
        message: 'HardbanRecords API v1.0',
        status: 'online',
        timestamp: new Date().toISOString(),
        endpoints: {
            health: '/api/health',
            data: '/api/data',
            music: '/api/music',
            publishing: '/api/publishing',
            auth: '/api/auth',
            admin: '/api/admin'
        }
    });
});

// GET /api/health - Health check
router.get('/health', (req, res) => {
    res.json({
        success: true,
        status: 'healthy',
        timestamp: new Date().toISOString(),
        version: '1.0.0',
        environment: process.env.NODE_ENV || 'development',
        uptime: process.uptime()
    });
});

// GET /api/supabase-test - Test Supabase connection
router.get('/supabase-test', async (req, res) => {
    try {
        // Test basic Supabase connection
        const { data, error } = await supabase
            .from('artists')
            .select('id, name')
            .limit(1);

        if (error) {
            return res.json({
                success: false,
                message: 'Supabase connection failed',
                error: error.message,
                configured: !!process.env.SUPABASE_URL && !!process.env.SUPABASE_SERVICE_ROLE_KEY
            });
        }

        res.json({
            success: true,
            message: 'Supabase connection working',
            configured: true,
            hasData: data && data.length > 0,
            timestamp: new Date().toISOString()
        });
    } catch (err) {
        res.json({
            success: false,
            message: 'Supabase test failed',
            error: err.message,
            configured: !!process.env.SUPABASE_URL && !!process.env.SUPABASE_SERVICE_ROLE_KEY
        });
    }
});

// POST /api/test-data - Add test data to database
router.post('/test-data', async (req, res) => {
    try {
        // Insert test artist
        const { data: artistData, error: artistError } = await supabase
            .from('artists')
            .insert([
                {
                    name: 'Test Artist',
                    real_name: 'John Doe',
                    biography: 'Test artist for application testing',
                    website: 'https://testartist.com',
                    instagram: '@testartist',
                    spotify: 'spotify:artist:test123'
                }
            ])
            .select();

        if (artistError) {
            return res.json({
                success: false,
                message: 'Failed to insert test artist',
                error: artistError.message
            });
        }

        const artistId = artistData[0].id;

        // Insert test music release
        const { data: releaseData, error: releaseError } = await supabase
            .from('music_releases')
            .insert([
                {
                    title: 'Test Album',
                    artist_id: artistId,
                    genre: 'Electronic',
                    release_date: '2025-09-07',
                    status: 'published'
                }
            ])
            .select();

        if (releaseError) {
            return res.json({
                success: false,
                message: 'Failed to insert test release',
                error: releaseError.message
            });
        }

        // Insert test book
        const { data: bookData, error: bookError } = await supabase
            .from('books')
            .insert([
                {
                    title: 'Test Book',
                    author_id: artistId,
                    genre: 'Fiction',
                    isbn: '978-3-16-148410-0',
                    description: 'A test book for application testing',
                    status: 'published'
                }
            ])
            .select();

        res.json({
            success: true,
            message: 'Test data inserted successfully',
            data: {
                artist: artistData[0],
                release: releaseData[0],
                book: bookData ? bookData[0] : null
            },
            timestamp: new Date().toISOString()
        });

    } catch (err) {
        res.json({
            success: false,
            message: 'Test data insertion failed',
            error: err.message
        });
    }
});

// GET /api/data - Pobieranie wszystkich danych aplikacji
router.get('/data', async (req, res) => {
    try {
        // Pobierz dane przez Supabase client
        const [
            musicReleasesRes,
            musicSplitsRes,
            musicTasksRes,
            booksRes,
            bookSplitsRes,
            bookChaptersRes,
            bookIllustrationsRes,
            publishingTasksRes,
            appConfigRes
        ] = await Promise.all([
            supabase.from('music_releases').select('*').order('id'),
            supabase.from('music_release_splits').select('*'),
            supabase.from('music_tasks').select('*').order('id'),
            supabase.from('books').select('*').order('id'),
            supabase.from('book_splits').select('*'),
            supabase.from('book_chapters').select('*').order('book_id, chapter_number'),
            supabase.from('book_illustrations').select('*'),
            supabase.from('publishing_tasks').select('*').order('id'),
            supabase.from('app_config').select('config_value').eq('config_key', 'onboarding_complete').single()
        ]);

        // Sprawdź błędy
        const errors = [musicReleasesRes, musicSplitsRes, musicTasksRes, booksRes, bookSplitsRes, bookChaptersRes, bookIllustrationsRes, publishingTasksRes]
            .filter(res => res.error).map(res => res.error.message);

        if (errors.length > 0) {
            return res.json({
                success: false,
                message: 'Błędy przy pobieraniu danych',
                errors: errors
            });
        }

        // Mapuj splits
        const musicSplitsMap = (musicSplitsRes.data || []).reduce((acc, split) => {
            (acc[split.release_id] = acc[split.release_id] || []).push({
                name: split.artist_id,
                share: String(split.percentage)
            });
            return acc;
        }, {});

        const bookSplitsMap = (bookSplitsRes.data || []).reduce((acc, split) => {
            (acc[split.book_id] = acc[split.book_id] || []).push({
                name: split.author_id,
                share: String(split.percentage)
            });
            return acc;
        }, {});

        // Mapuj chapters
        const bookChaptersMap = (bookChaptersRes.data || []).reduce((acc, chapter) => {
            (acc[chapter.book_id] = acc[chapter.book_id] || []).push({
                title: chapter.title,
                content: chapter.content
            });
            return acc;
        }, {});

        // Mapuj illustrations
        const bookIllustrationsMap = (bookIllustrationsRes.data || []).reduce((acc, illustration) => {
            (acc[illustration.book_id] = acc[illustration.book_id] || []).push({
                url: illustration.image_url,
                prompt: illustration.description
            });
            return acc;
        }, {});

        // Przygotuj dane wyjściowe
        const releasesWithSplits = (musicReleasesRes.data || []).map(r => ({
            ...r,
            releaseDate: formatDate(r.release_date),
            splits: musicSplitsMap[r.id] || []
        }));

        const booksWithDetails = (booksRes.data || []).map(b => ({
            ...b,
            rights: {
                territorial: false,
                translation: false,
                adaptation: false,
                audio: false,
                drm: false
            },
            splits: bookSplitsMap[b.id] || [],
            chapters: bookChaptersMap[b.id] || [],
            illustrations: bookIllustrationsMap[b.id] || []
        }));

        res.json({
            music: {
                releases: releasesWithSplits,
                tasks: (musicTasksRes.data || []).map(transformTask)
            },
            publishing: {
                books: booksWithDetails,
                tasks: (publishingTasksRes.data || []).map(transformTask)
            },
            onboardingComplete: appConfigRes.data ? appConfigRes.data.config_value === 'true' : false,
        });

    } catch (error) {
        console.error("Błąd podczas pobierania danych aplikacji:", error);
        res.status(500).json({ success: false, message: "Nie udało się pobrać danych aplikacji.", error: error.message });
    }
});

// GET /api/s3-presigned-url - Generowanie linku do uploadu do Supabase Storage
router.get('/s3-presigned-url', async (req, res) => {
    const { fileName, fileType } = req.query;
    if (!fileName || !fileType) {
        return res.status(400).json({ message: "Parametry 'fileName' i 'fileType' są wymagane." });
    }

    const uniqueFileName = `${Date.now()}_${fileName}`;

    try {
        // Generowanie presigned URL dla Supabase Storage
        const { data, error } = await supabase.storage
            .from(process.env.SUPABASE_BUCKET_NAME)
            .createSignedUploadUrl(uniqueFileName, {
                expiresIn: 60
            });

        if (error) {
            console.error("Błąd podczas generowania presigned URL:", error);
            return res.status(500).json({ message: 'Nie udało się wygenerować adresu URL.' });
        }

        const fileUrl = `https://fannbqzvjwyazeosectm.supabase.co/storage/v1/object/public/${process.env.SUPABASE_BUCKET_NAME}/${uniqueFileName}`;

        res.json({
            presignedUrl: data.signedUrl,
            fileUrl: fileUrl
        });
    } catch (error) {
        console.error("Błąd podczas generowania presigned URL:", error);
        res.status(500).json({ message: 'Nie udało się wygenerować adresu URL.' });
    }
});

// --- Endpointy Admina ---

router.get('/admin-only', authorizeRoles('admin'), (req, res) => {
    res.json({ success: true, message: 'Tylko admin widzi tę trasę.' });
});

router.get('/editor-or-admin', authorizeRoles('admin', 'editor'), (req, res) => {
    res.json({ success: true, message: 'Admin lub edytor widzi tę trasę.' });
});

router.get('/user', authorizeRoles('user', 'editor', 'admin'), (req, res) => {
    res.json({ success: true, message: 'Każdy zalogowany użytkownik widzi tę trasę.' });
});

router.get('/guest', (req, res) => {
    res.json({ success: true, message: 'Trasa publiczna.' });
});

module.exports = router;
