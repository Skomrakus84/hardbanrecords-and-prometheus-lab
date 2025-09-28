// backend/routes/auth.cjs
const express = require('express');
const { body } = require('express-validator');
const { findUserByUsername, createUser, validatePassword } = require('../db/users.cjs');
const jwt = require('jsonwebtoken');
const validate = require('../middleware/validate.cjs');
const router = express.Router();

// Rejestracja użytkownika z walidacją
router.post(
  '/register',
  [
    body('username')
      .isLength({ min: 3, max: 32 })
      .withMessage('Nazwa użytkownika musi mieć od 3 do 32 znaków.')
      .matches(/^[a-zA-Z0-9_]+$/)
      .withMessage('Nazwa użytkownika może zawierać tylko litery, cyfry i podkreślenia.'),
    body('password')
      .isLength({ min: 8 })
      .withMessage('Hasło musi mieć co najmniej 8 znaków.')
  ],
  validate,
  async (req, res, next) => {
    const { username, password } = req.body;
    try {
      const existing = await findUserByUsername(username);
      if (existing) {
        return res.status(409).json({ success: false, message: 'Użytkownik już istnieje.' });
      }
      const user = await createUser({ username, password });
      res.status(201).json({ success: true, user });
    } catch (err) {
      next(err);
    }
  }
);

// Logowanie użytkownika z walidacją
router.post(
  '/login',
  [
    body('username').isLength({ min: 3 }).withMessage('Podaj nazwę użytkownika.'),
    body('password').isLength({ min: 1 }).withMessage('Podaj hasło.')
  ],
  validate,
  async (req, res, next) => {
    const { username, password } = req.body;
    try {
      const user = await findUserByUsername(username);
      if (!user) {
        return res.status(401).json({ success: false, message: 'Nieprawidłowe dane logowania.' });
      }
      const valid = await validatePassword(user, password);
      if (!valid) {
        return res.status(401).json({ success: false, message: 'Nieprawidłowe dane logowania.' });
      }
      const token = jwt.sign({ id: user.id, username: user.username, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1h' });
      const refreshToken = jwt.sign({ id: user.id }, process.env.REFRESH_TOKEN_SECRET, { expiresIn: '7d' });
      res.json({ success: true, token, refreshToken });
    } catch (err) {
      next(err);
    }
  }
);

module.exports = router;