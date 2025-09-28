// Plik: backend/routes/ai.cjs
const express = require('express');
const { GoogleGenAI } = require("@google/genai");
const authorizeRoles = require('../middleware/authRole.cjs');
const router = express.Router();

// Inicjalizujemy AI tutaj, na backendzie, używając klucza ze zmiennych środowiskowych
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// Zabezpieczenie wszystkich tras w tym pliku dla ról user, editor, admin
router.use(authorizeRoles('user', 'editor', 'admin'));

// Endpoint do generowania treści (tekstu, JSON, itp.)
router.post('/generate-content', async (req, res) => {
    // Pobieramy parametry, które frontend nam prześle
    const { model, contents, config } = req.body;

    if (!model || !contents) {
        return res.status(400).json({ success: false, message: 'Parametry "model" i "contents" są wymagane.' });
    }

    try {
        // Przekazujemy żądanie bezpośrednio do Gemini AI
        const response = await ai.models.generateContent({ model, contents, config });
        // Odsyłamy odpowiedź z powrotem do frontendu
        res.json(response);
    } catch (error) {
        console.error("Błąd podczas komunikacji z Gemini API (generate-content):", error);
        res.status(500).json({ success: false, message: 'Błąd serwera podczas generowania treści.', error: error.message });
    }
});

// Endpoint do generowania obrazów
router.post('/generate-images', async (req, res) => {
    // Pobieramy parametry z frontendu
    const { model, prompt, config } = req.body;

    if (!model || !prompt) {
        return res.status(400).json({ success: false, message: 'Parametry "model" i "prompt" są wymagane.' });
    }
    
    try {
        // Przekazujemy żądanie do modelu generującego obrazy
        const response = await ai.models.generateImages({ model, prompt, config });
        // Odsyłamy odpowiedź do frontendu
        res.json(response);
    } catch (error) {
        console.error("Błąd podczas komunikacji z Gemini API (generate-images):", error);
        res.status(500).json({ success: false, message: 'Błąd serwera podczas generowania obrazu.', error: error.message });
    }
});

// Dostęp do AI - tylko editor i admin
router.post('/generate', authorizeRoles('editor', 'admin'), (req, res) => {
  // ...kod...
});

// Historia AI - tylko admin
router.get('/history', authorizeRoles('admin'), (req, res) => {
  // ...kod...
});

module.exports = router;
