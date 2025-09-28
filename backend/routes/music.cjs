// Plik: backend/routes/music.cjs

const express = require('express');
const { body, param, validationResult } = require('express-validator');
const auth = require('../middleware/auth.cjs');
const authorizeRoles = require('../middleware/authRole.cjs');
const router = express.Router();
const db = require('../db.cjs');

// Import Music Distribution controllers
const ReleaseController = require('../music/controllers/release.controller.cjs');

// Initialize controllers
const releaseController = new ReleaseController();

// Zabezpieczenie wszystkich tras w tym pliku dla ról user, editor, admin
router.use(authorizeRoles('user', 'editor', 'admin'));

// Helper do transformacji snake_case na camelCase dla zadań
const transformTask = (task) => ({
    id: task.id,
    text: task.text,
    completed: task.completed,
    dueDate: task.due_date ? new Date(task.due_date).toISOString().split('T')[0] : '',
});

// GET /api/music/releases - Przeglądanie wydań
router.get('/releases', auth, async (req, res) => {
    try {
        const releasesRes = await db.query('SELECT * FROM music_releases');
        const releases = releasesRes.rows;
        res.json({ success: true, releases });
    } catch (error) {
        console.error("Błąd podczas pobierania wydań muzycznych:", error);
        res.status(500).json({ success: false, message: "Wystąpił błąd serwera podczas pobierania wydań." });
    }
});

// POST /api/music/releases - Dodawanie nowego wydania
router.post(
    '/releases',
    auth,
    [
        body('title').notEmpty().withMessage('Tytuł jest wymagany.'),
        body('artist').notEmpty().withMessage('Artysta jest wymagany.'),
        body('genre').notEmpty().withMessage('Gatunek jest wymagany.'),
        body('splits').optional().isArray().withMessage('Splits musi być tablicą.'),
        body('splits.*.name').optional().notEmpty().withMessage('Nazwa splitu jest wymagana.'),
        body('splits.*.share').optional().isNumeric().withMessage('Udział splitu musi być liczbą.'),
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ success: false, errors: errors.array() });
        }
        const { title, artist, genre, splits } = req.body;
        try {
            const newReleaseRes = await db.query(
                'INSERT INTO music_releases (title, artist, genre, status) VALUES ($1, $2, $3, $4) RETURNING *',
                [title, artist, genre, 'Submitted']
            );
            const newRelease = newReleaseRes.rows[0];

            if (splits && splits.length > 0) {
                for (const split of splits) {
                    await db.query(
                        'INSERT INTO music_release_splits (release_id, name, share) VALUES ($1, $2, $3)',
                        [newRelease.id, split.name, parseFloat(split.share)]
                    );
                }
            }
            res.status(201).json({ success: true, release: { ...newRelease, splits: splits || [] } });
        } catch (error) {
            console.error("Błąd podczas dodawania wydania muzycznego:", error);
            res.status(500).json({ success: false, message: "Wystąpił błąd serwera podczas dodawania wydania.", error: error.message });
        }
    }
);

// DELETE /api/music/releases/:id - Usuwanie wydania
router.delete('/releases/:id', auth, authorizeRoles('admin'), async (req, res) => {
    const { id } = req.params;
    try {
        await db.query('DELETE FROM music_releases WHERE id = $1', [id]);
        res.json({ success: true, message: 'Wydanie zostało pomyślnie usunięte.' });
    } catch (error) {
        console.error("Błąd podczas usuwania wydania muzycznego:", error);
        res.status(500).json({ success: false, message: "Wystąpił błąd serwera podczas usuwania wydania.", error: error.message });
    }
});

// PATCH /api/music/releases/:id/splits - Aktualizacja podziałów tantiem
router.patch(
    '/releases/:id/splits',
    auth,
    [
        param('id').isInt().withMessage('ID musi być liczbą.'),
        body('splits').isArray({ min: 1 }).withMessage('Splits musi być tablicą z co najmniej jednym elementem.'),
        body('splits.*.name').notEmpty().withMessage('Nazwa splitu jest wymagana.'),
        body('splits.*.share').isNumeric().withMessage('Udział splitu musi być liczbą.'),
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ success: false, errors: errors.array() });
        }
        const { id } = req.params;
        const { splits } = req.body;
        try {
            await db.query('BEGIN');
            await db.query('DELETE FROM music_release_splits WHERE release_id = $1', [id]);
            for (const split of splits) {
                await db.query(
                    'INSERT INTO music_release_splits (release_id, name, share) VALUES ($1, $2, $3)',
                    [id, split.name, parseFloat(split.share)]
                );
            }
            await db.query('COMMIT');
            res.json({ success: true, message: 'Podziały zostały pomyślnie zaktualizowane.' });
        } catch (error) {
            await db.query('ROLLBACK');
            console.error("Błąd podczas aktualizacji podziałów:", error);
            res.status(500).json({ success: false, message: "Wystąpił błąd serwera.", error: error.message });
        }
    }
);

// POST /api/music/tasks - Dodawanie nowego zadania muzycznego
router.post(
    '/tasks',
    auth,
    [
        body('text').notEmpty().withMessage('Treść zadania jest wymagana.'),
        body('dueDate').optional().isISO8601().withMessage('Nieprawidłowy format daty.'),
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ success: false, errors: errors.array() });
        }
        const { text, dueDate } = req.body;
        try {
            const newTaskRes = await db.query(
                'INSERT INTO music_tasks (text, due_date, completed) VALUES ($1, $2, false) RETURNING *',
                [text, dueDate || null]
            );
            res.status(201).json({ success: true, task: transformTask(newTaskRes.rows[0]) });
        } catch (error) {
            console.error("Błąd podczas dodawania zadania muzycznego:", error);
            res.status(500).json({ success: false, message: "Wystąpił błąd serwera." });
        }
    }
);

// PATCH /api/music/tasks/:id - Zmiana statusu zadania muzycznego
router.patch(
    '/tasks/:id',
    auth,
    [
        param('id').isInt().withMessage('ID musi być liczbą.'),
        body('completed').isBoolean().withMessage('Pole completed musi być typu boolean.'),
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ success: false, errors: errors.array() });
        }
        const { id } = req.params;
        const { completed } = req.body;
        try {
            await db.query('UPDATE music_tasks SET completed = $1 WHERE id = $2', [completed, id]);
            res.json({ success: true, message: 'Status zadania został zaktualizowany.' });
        } catch (error) {
            console.error("Błąd podczas aktualizacji zadania muzycznego:", error);
            res.status(500).json({ success: false, message: "Wystąpił błąd serwera." });
        }
    }
);

// New Music Distribution API routes
// These routes use the new Music Distribution module

// Release management routes
router.post('/distribution/releases', releaseController.createRelease.bind(releaseController));
router.get('/distribution/releases', releaseController.getReleases.bind(releaseController));
router.get('/distribution/releases/recent', releaseController.getRecentReleases.bind(releaseController));
router.get('/distribution/releases/upcoming', releaseController.getUpcomingReleases.bind(releaseController));
router.get('/distribution/releases/search', releaseController.searchReleases.bind(releaseController));
router.get('/distribution/releases/:id', releaseController.getReleaseById.bind(releaseController));
router.put('/distribution/releases/:id', releaseController.updateRelease.bind(releaseController));
router.delete('/distribution/releases/:id', releaseController.deleteRelease.bind(releaseController));

// Release workflow routes
router.post('/distribution/releases/:id/submit', releaseController.submitForDistribution.bind(releaseController));
router.post('/distribution/releases/:id/approve', releaseController.approveRelease.bind(releaseController));
router.post('/distribution/releases/:id/reject', releaseController.rejectRelease.bind(releaseController));
router.post('/distribution/releases/:id/takedown', releaseController.takeDownRelease.bind(releaseController));
router.post('/distribution/releases/:id/clone', releaseController.cloneRelease.bind(releaseController));

// Release status and distribution
router.get('/distribution/releases/:id/distribution-status', releaseController.getDistributionStatus.bind(releaseController));

// Artist releases
router.get('/distribution/artists/:artistId/releases', releaseController.getReleasesByArtist.bind(releaseController));

module.exports = router;
