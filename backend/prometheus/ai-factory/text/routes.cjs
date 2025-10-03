const express = require('express');
const router = express.Router();
const textService = require('./service.cjs');
const { validateRequest } = require('../../../middleware/validate.cjs');
const { authRole } = require('../../../middleware/authRole.cjs');

// Generate marketing content
router.post('/generate', authRole(['admin', 'marketing']), validateRequest, async (req, res) => {
    try {
        const { prompt, model, maxLength } = req.body;
        const text = await textService.generateText(prompt, model, maxLength);
        res.json({ success: true, data: text });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Analyze content sentiment and topics
router.post('/analyze', authRole(['admin', 'marketing', 'user']), validateRequest, async (req, res) => {
    try {
        const { text } = req.body;
        const analysis = await textService.analyzeContent(text);
        res.json({ success: true, data: analysis });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

module.exports = router;