const express = require('express');
const router = express.Router();
const audioService = require('./service.cjs');
const { validateRequest } = require('../../../middleware/validate.cjs');
const { authRole } = require('../../../middleware/authRole.cjs');
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });

// Generate music from text prompt
router.post('/generate-music', authRole(['admin', 'marketing']), validateRequest, async (req, res) => {
    try {
        const { prompt, options } = req.body;
        const result = await audioService.generateMusic(prompt, options);
        res.json({ success: true, data: result });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Generate voice from text
router.post('/generate-voice', authRole(['admin', 'marketing']), validateRequest, async (req, res) => {
    try {
        const { text, voiceId, options } = req.body;
        const result = await audioService.generateVoice(text, voiceId, options);
        res.json({ success: true, data: result });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Enhance existing audio
router.post('/enhance', authRole(['admin', 'marketing']), upload.single('audio'), async (req, res) => {
    try {
        const { options } = req.body;
        const enhancedAudio = await audioService.enhanceAudio(req.file.buffer, options);
        res.json({ success: true, data: enhancedAudio });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Convert audio format
router.post('/convert', authRole(['admin', 'marketing']), upload.single('audio'), async (req, res) => {
    try {
        const { format } = req.body;
        const result = await audioService.convertFormat(req.file.path, format);
        res.json({ success: true, data: result });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

module.exports = router;