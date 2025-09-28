// Plik: backend/routes/publishing.cjs

const express = require('express');
const { body, param, validationResult } = require('express-validator');
const auth = require('../middleware/auth.cjs');
const authorizeRoles = require('../middleware/authRole.cjs');
const router = express.Router();
const db = require('../db.cjs');

// Zabezpieczenie wszystkich tras w tym pliku dla ról user, editor, admin
router.use(authorizeRoles('user', 'editor', 'admin'));

// Helper do transformacji snake_case na camelCase dla zadań
const transformTask = (task) => ({
    id: task.id,
    text: task.text,
    completed: task.completed,
    dueDate: task.due_date ? new Date(task.due_date).toISOString().split('T')[0] : '',
});

// GET /api/publishing/books - Przeglądanie publikacji - wszyscy zalogowani
router.get('/books', (req, res) => {
    // ...kod przeglądania publikacji...
});

// POST /api/publishing/books - Dodawanie nowej książki - tylko editor i admin
router.post(
    '/books',
    auth,
    [
        body('title').notEmpty().withMessage('Tytuł jest wymagany.'),
        body('author').notEmpty().withMessage('Autor jest wymagany.'),
        body('genre').optional().isString(),
        body('splits').optional().isArray().withMessage('Splits musi być tablicą.'),
        body('splits.*.name').optional().notEmpty().withMessage('Nazwa splitu jest wymagana.'),
        body('splits.*.share').optional().isNumeric().withMessage('Udział splitu musi być liczbą.'),
        body('chapters').optional().isArray().withMessage('Chapters musi być tablicą.'),
        body('chapters.*.title').optional().notEmpty().withMessage('Tytuł rozdziału jest wymagany.'),
        body('chapters.*.content').optional().isString(),
        body('rights').optional().isObject(),
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ success: false, errors: errors.array() });
        }
        const { title, author, genre, splits, chapters, rights } = req.body;
        try {
            await db.query('BEGIN');
            const newBookRes = await db.query(
                'INSERT INTO books (title, author, genre, status, rights_territorial, rights_translation, rights_adaptation, rights_audio, rights_drm) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *',
                [title, author, genre, 'Draft', !!rights?.territorial, !!rights?.translation, !!rights?.adaptation, !!rights?.audio, !!rights?.drm]
            );
            const newBook = newBookRes.rows[0];

            if (chapters && chapters.length > 0) {
                for (const [index, chapter] of chapters.entries()) {
                    await db.query('INSERT INTO book_chapters (book_id, title, content, chapter_order) VALUES ($1, $2, $3, $4)', [newBook.id, chapter.title, chapter.content, index]);
                }
            }
            if (splits && splits.length > 0) {
                for (const split of splits) {
                    await db.query('INSERT INTO book_splits (book_id, name, share) VALUES ($1, $2, $3)', [newBook.id, split.name, parseFloat(split.share)]);
                }
            }
            await db.query('COMMIT');
            res.status(201).json({ success: true, book: { ...newBook, splits, chapters, rights } });
        } catch (error) {
            await db.query('ROLLBACK');
            console.error("Błąd podczas dodawania książki:", error);
            res.status(500).json({ success: false, message: "Wystąpił błąd serwera.", error: error.message });
        }
    }
);

// PATCH /api/publishing/books/:id - Aktualizacja danych książki
router.patch(
    '/books/:id',
    auth,
    [
        param('id').isInt().withMessage('ID musi być liczbą.'),
        body('title').optional().isString(),
        body('author').optional().isString(),
        body('genre').optional().isString(),
        body('status').optional().isString(),
        body('blurb').optional().isString(),
        body('keywords').optional().isString(),
        body('rights').optional().isObject(),
        body('splits').optional().isArray(),
        body('splits.*.name').optional().notEmpty(),
        body('splits.*.share').optional().isNumeric(),
        body('chapters').optional().isArray(),
        body('chapters.*.title').optional().notEmpty(),
        body('chapters.*.content').optional().isString(),
        body('coverImageUrl').optional().isString(),
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ success: false, errors: errors.array() });
        }
        const { id } = req.params;
        const { title, blurb, keywords, rights, splits, chapters, coverImageUrl } = req.body;
        try {
            await db.query('BEGIN');
            if (title) await db.query('UPDATE books SET title = $1 WHERE id = $2', [title, id]);
            if (blurb) await db.query('UPDATE books SET blurb = $1 WHERE id = $2', [blurb, id]);
            if (keywords) await db.query('UPDATE books SET keywords = $1 WHERE id = $2', [keywords, id]);
            if (coverImageUrl) await db.query('UPDATE books SET cover_image_url = $1 WHERE id = $2', [coverImageUrl, id]);
            if (rights) {
                await db.query(
                    'UPDATE books SET rights_territorial = $1, rights_translation = $2, rights_adaptation = $3, rights_audio = $4, rights_drm = $5 WHERE id = $6',
                    [!!rights.territorial, !!rights.translation, !!rights.adaptation, !!rights.audio, !!rights.drm, id]
                );
            }
            if (splits) {
                await db.query('DELETE FROM book_splits WHERE book_id = $1', [id]);
                for (const split of splits) {
                    await db.query('INSERT INTO book_splits (book_id, name, share) VALUES ($1, $2, $3)', [id, split.name, parseFloat(split.share)]);
                }
            }
            if (chapters) {
                await db.query('DELETE FROM book_chapters WHERE book_id = $1', [id]);
                for (const [index, chapter] of chapters.entries()) {
                    await db.query('INSERT INTO book_chapters (book_id, title, content, chapter_order) VALUES ($1, $2, $3, $4)', [id, chapter.title, chapter.content, index]);
                }
            }
            await db.query('COMMIT');
            res.json({ success: true, message: 'Książka została pomyślnie zaktualizowana.' });
        } catch (error) {
            await db.query('ROLLBACK');
            console.error("Błąd podczas aktualizacji książki:", error);
            res.status(500).json({ success: false, message: "Wystąpił błąd serwera.", error: error.message });
        }
    }
);

// POST /api/publishing/tasks - Dodawanie nowego zadania wydawniczego
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
                'INSERT INTO publishing_tasks (text, due_date, completed) VALUES ($1, $2, false) RETURNING *',
                [text, dueDate || null]
            );
            res.status(201).json({ success: true, task: transformTask(newTaskRes.rows[0]) });
        } catch (error) {
            console.error("Błąd podczas dodawania zadania wydawniczego:", error);
            res.status(500).json({ success: false, message: "Wystąpił błąd serwera." });
        }
    }
);

// PATCH /api/publishing/tasks/:id - Zmiana statusu zadania wydawniczego
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
            await db.query('UPDATE publishing_tasks SET completed = $1 WHERE id = $2', [completed, id]);
            res.json({ success: true, message: 'Status zadania został zaktualizowany.' });
        } catch (error) {
            console.error("Błąd podczas aktualizacji zadania wydawniczego:", error);
            res.status(500).json({ success: false, message: "Wystąpił błąd serwera." });
        }
    }
);

// DELETE /api/publishing/books/:id - Usuwanie publikacji - tylko admin
router.delete('/books/:id', authorizeRoles('admin'), async (req, res) => {
    const { id } = req.params;
    try {
        await db.query('BEGIN');
        await db.query('DELETE FROM book_chapters WHERE book_id = $1', [id]);
        await db.query('DELETE FROM book_splits WHERE book_id = $1', [id]);
        await db.query('DELETE FROM books WHERE id = $1', [id]);
        await db.query('COMMIT');
        res.json({ success: true, message: 'Publikacja została pomyślnie usunięta.' });
    } catch (error) {
        await db.query('ROLLBACK');
        console.error("Błąd podczas usuwania publikacji:", error);
        res.status(500).json({ success: false, message: "Wystąpił błąd serwera." });
    }
});

module.exports = router;