const express = require('express');
const authorizeRoles = require('../middleware/authRole.cjs');
const db = require('../db.cjs');
const router = express.Router();

// Pobierz listę użytkowników (admin)
router.get('/users', authorizeRoles('admin'), async (req, res) => {
  try {
    const result = await db.query('SELECT id, username, role FROM users');
    res.json({ success: true, users: result.rows });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Błąd serwera', error: err.message });
  }
});

// Edytuj użytkownika (admin)
router.put('/users/:id', authorizeRoles('admin'), async (req, res) => {
  const { role } = req.body;
  const { id } = req.params;
  if (!role) return res.status(400).json({ success: false, message: 'Brak roli.' });
  try {
    await db.query('UPDATE users SET role = $1 WHERE id = $2', [role, id]);
    res.json({ success: true, message: 'Zaktualizowano użytkownika.' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Błąd serwera', error: err.message });
  }
});

// Usuń użytkownika (admin)
router.delete('/users/:id', authorizeRoles('admin'), async (req, res) => {
  const { id } = req.params;
  try {
    await db.query('DELETE FROM users WHERE id = $1', [id]);
    res.json({ success: true, message: 'Użytkownik usunięty.' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Błąd serwera', error: err.message });
  }
});

// Zarządzanie publikacjami (przykład: pobierz, dodaj, usuń)
router.get('/books', authorizeRoles('admin', 'editor'), async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM books');
    res.json({ success: true, books: result.rows });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Błąd serwera', error: err.message });
  }
});

router.post('/books', authorizeRoles('admin', 'editor'), async (req, res) => {
  const { title, author } = req.body;
  if (!title || !author) return res.status(400).json({ success: false, message: 'Brak danych.' });
  try {
    await db.query('INSERT INTO books (title, author) VALUES ($1, $2)', [title, author]);
    res.json({ success: true, message: 'Dodano publikację.' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Błąd serwera', error: err.message });
  }
});

router.delete('/books/:id', authorizeRoles('admin'), async (req, res) => {
  const { id } = req.params;
  try {
    await db.query('DELETE FROM books WHERE id = $1', [id]);
    res.json({ success: true, message: 'Publikacja usunięta.' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Błąd serwera', error: err.message });
  }
});

// Zarządzanie wydaniami (przykład: pobierz, dodaj, usuń)
router.get('/releases', authorizeRoles('admin', 'editor'), async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM releases');
    res.json({ success: true, releases: result.rows });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Błąd serwera', error: err.message });
  }
});

router.post('/releases', authorizeRoles('admin', 'editor'), async (req, res) => {
  const { title, date } = req.body;
  if (!title || !date) return res.status(400).json({ success: false, message: 'Brak danych.' });
  try {
    await db.query('INSERT INTO releases (title, date) VALUES ($1, $2)', [title, date]);
    res.json({ success: true, message: 'Dodano wydanie.' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Błąd serwera', error: err.message });
  }
});

router.delete('/releases/:id', authorizeRoles('admin'), async (req, res) => {
  const { id } = req.params;
  try {
    await db.query('DELETE FROM releases WHERE id = $1', [id]);
    res.json({ success: true, message: 'Wydanie usunięte.' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Błąd serwera', error: err.message });
  }
});

module.exports = router;